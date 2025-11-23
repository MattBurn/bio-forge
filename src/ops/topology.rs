use crate::db;
use crate::model::{
    structure::Structure,
    template::Template,
    topology::{Bond, Topology},
    types::{BondOrder, ResidueCategory, ResiduePosition},
};
use crate::ops::error::Error;
use std::collections::HashMap;

pub struct TopologyBuilder {
    user_templates: HashMap<String, Template>,
    disulfide_bond_cutoff: f64,
    peptide_bond_cutoff: f64,
    nucleic_bond_cutoff: f64,
}

impl Default for TopologyBuilder {
    fn default() -> Self {
        Self {
            user_templates: HashMap::new(),
            disulfide_bond_cutoff: 2.2,
            peptide_bond_cutoff: 1.5,
            nucleic_bond_cutoff: 1.8,
        }
    }
}

impl TopologyBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_template(mut self, template: Template) -> Self {
        self.user_templates.insert(template.name.clone(), template);
        self
    }

    pub fn disulfide_cutoff(mut self, cutoff: f64) -> Self {
        self.disulfide_bond_cutoff = cutoff;
        self
    }

    pub fn build(self, structure: Structure) -> Result<Topology, Error> {
        let mut bonds = Vec::new();

        self.build_intra_residue(&structure, &mut bonds)?;

        self.build_inter_residue(&structure, &mut bonds)?;

        Ok(Topology::new(structure, bonds))
    }

    fn build_intra_residue(
        &self,
        structure: &Structure,
        bonds: &mut Vec<Bond>,
    ) -> Result<(), Error> {
        let mut global_atom_offset = 0;

        for chain in structure.iter_chains() {
            for residue in chain.iter_residues() {
                let atom_count = residue.atom_count();

                if residue.category == ResidueCategory::Ion {
                    global_atom_offset += atom_count;
                    continue;
                }

                if residue.category == ResidueCategory::Standard {
                    let tmpl_name = &residue.name;
                    let tmpl_view = db::get_template(tmpl_name).ok_or_else(|| {
                        Error::MissingInternalTemplate {
                            res_name: tmpl_name.clone(),
                        }
                    })?;

                    for (a1_name, a2_name, order) in tmpl_view.bonds() {
                        self.try_add_bond(
                            residue,
                            global_atom_offset,
                            a1_name,
                            a2_name,
                            order,
                            bonds,
                        )?;
                    }

                    for (h_name, _, anchors) in tmpl_view.hydrogens() {
                        if let Some(anchor) = anchors.into_iter().next() {
                            if residue.has_atom(h_name) {
                                self.try_add_bond(
                                    residue,
                                    global_atom_offset,
                                    h_name,
                                    anchor,
                                    BondOrder::Single,
                                    bonds,
                                )?;
                            }
                        }
                    }

                    self.handle_terminal_intra_bonds(residue, global_atom_offset, bonds)?;
                } else if residue.category == ResidueCategory::Hetero {
                    let tmpl = self.user_templates.get(&residue.name).ok_or_else(|| {
                        Error::MissingUserTemplate {
                            res_name: residue.name.clone(),
                        }
                    })?;

                    for (a1_name, a2_name, order) in tmpl.bonds() {
                        self.try_add_bond(
                            residue,
                            global_atom_offset,
                            a1_name,
                            a2_name,
                            *order,
                            bonds,
                        )?;
                    }
                }

                global_atom_offset += atom_count;
            }
        }
        Ok(())
    }

    fn try_add_bond(
        &self,
        residue: &crate::model::residue::Residue,
        offset: usize,
        name1: &str,
        name2: &str,
        order: BondOrder,
        bonds: &mut Vec<Bond>,
    ) -> Result<(), Error> {
        let idx1 = residue.iter_atoms().position(|a| a.name == name1);
        let idx2 = residue.iter_atoms().position(|a| a.name == name2);

        match (idx1, idx2) {
            (Some(i1), Some(i2)) => {
                bonds.push(Bond::new(offset + i1, offset + i2, order));
                Ok(())
            }
            (None, _) if self.is_optional_terminal_atom(residue, name1) => Ok(()),
            (_, None) if self.is_optional_terminal_atom(residue, name2) => Ok(()),
            (None, _) => Err(Error::topology_atom_missing(
                &residue.name,
                residue.id,
                name1,
            )),
            (_, None) => Err(Error::topology_atom_missing(
                &residue.name,
                residue.id,
                name2,
            )),
        }
    }

    fn is_optional_terminal_atom(
        &self,
        residue: &crate::model::residue::Residue,
        atom_name: &str,
    ) -> bool {
        let is_protein = residue.standard_name.is_some_and(|std| std.is_protein());
        let is_nucleic = residue.standard_name.is_some_and(|std| std.is_nucleic());

        match residue.position {
            ResiduePosition::NTerminal if is_protein => atom_name == "H",
            ResiduePosition::CTerminal if is_protein => matches!(atom_name, "HXT" | "HOXT"),
            ResiduePosition::FivePrime if is_nucleic => atom_name == "HO5'",
            ResiduePosition::ThreePrime if is_nucleic => atom_name == "HO3'",
            _ => false,
        }
    }

    fn handle_terminal_intra_bonds(
        &self,
        residue: &crate::model::residue::Residue,
        offset: usize,
        bonds: &mut Vec<Bond>,
    ) -> Result<(), Error> {
        if residue.position == ResiduePosition::NTerminal
            && residue.standard_name.is_some_and(|s| s.is_protein())
        {
            for h_name in ["H1", "H2", "H3"] {
                if residue.has_atom(h_name) {
                    if let (Some(h_idx), Some(n_idx)) = (
                        residue.iter_atoms().position(|a| a.name == h_name),
                        residue.iter_atoms().position(|a| a.name == "N"),
                    ) {
                        bonds.push(Bond::new(offset + h_idx, offset + n_idx, BondOrder::Single));
                    }
                }
            }
        }

        if residue.position == ResiduePosition::CTerminal
            && residue.standard_name.is_some_and(|s| s.is_protein())
        {
            if let Some(c_idx) = residue.iter_atoms().position(|a| a.name == "C") {
                if let Some(oxt_idx) = residue.iter_atoms().position(|a| a.name == "OXT") {
                    bonds.push(Bond::new(
                        offset + c_idx,
                        offset + oxt_idx,
                        BondOrder::Single,
                    ));

                    for h_name in ["HXT", "HOXT"] {
                        if let Some(h_idx) = residue.iter_atoms().position(|a| a.name == h_name) {
                            bonds.push(Bond::new(
                                offset + oxt_idx,
                                offset + h_idx,
                                BondOrder::Single,
                            ));
                        }
                    }
                }
            }
        }

        if residue.position == ResiduePosition::FivePrime
            && residue.standard_name.is_some_and(|s| s.is_nucleic())
        {
            if let (Some(h_idx), Some(o_idx)) = (
                residue.iter_atoms().position(|a| a.name == "HO5'"),
                residue.iter_atoms().position(|a| a.name == "O5'"),
            ) {
                bonds.push(Bond::new(offset + h_idx, offset + o_idx, BondOrder::Single));
            }
        }

        if residue.position == ResiduePosition::ThreePrime
            && residue.standard_name.is_some_and(|s| s.is_nucleic())
        {
            if let (Some(h_idx), Some(o_idx)) = (
                residue.iter_atoms().position(|a| a.name == "HO3'"),
                residue.iter_atoms().position(|a| a.name == "O3'"),
            ) {
                bonds.push(Bond::new(offset + h_idx, offset + o_idx, BondOrder::Single));
            }
        }

        Ok(())
    }

    fn build_inter_residue(
        &self,
        structure: &Structure,
        bonds: &mut Vec<Bond>,
    ) -> Result<(), Error> {
        let mut residue_offsets: Vec<Vec<usize>> = Vec::new();
        let mut current_offset = 0;

        for chain in structure.iter_chains() {
            let mut chain_offsets = Vec::new();
            for residue in chain.iter_residues() {
                chain_offsets.push(current_offset);
                current_offset += residue.atom_count();
            }
            residue_offsets.push(chain_offsets);
        }

        for (c_idx, chain) in structure.iter_chains().enumerate() {
            let residues: Vec<_> = chain.iter_residues().collect();
            if residues.len() < 2 {
                continue;
            }

            for i in 0..residues.len() - 1 {
                let curr = residues[i];
                let next = residues[i + 1];

                if curr.category != ResidueCategory::Standard
                    || next.category != ResidueCategory::Standard
                {
                    continue;
                }

                let curr_offset = residue_offsets[c_idx][i];
                let next_offset = residue_offsets[c_idx][i + 1];

                if let (Some(std1), Some(std2)) = (curr.standard_name, next.standard_name) {
                    if std1.is_protein() && std2.is_protein() {
                        self.connect_atoms_if_close(
                            curr,
                            curr_offset,
                            "C",
                            next,
                            next_offset,
                            "N",
                            self.peptide_bond_cutoff,
                            BondOrder::Single,
                            bonds,
                        );
                    } else if std1.is_nucleic() && std2.is_nucleic() {
                        self.connect_atoms_if_close(
                            curr,
                            curr_offset,
                            "O3'",
                            next,
                            next_offset,
                            "P",
                            self.nucleic_bond_cutoff,
                            BondOrder::Single,
                            bonds,
                        );
                    }
                }
            }
        }

        let mut sulfur_atoms = Vec::new();

        for (c_idx, chain) in structure.iter_chains().enumerate() {
            for (r_idx, residue) in chain.iter_residues().enumerate() {
                if matches!(residue.name.as_str(), "CYX" | "CYM") {
                    if let Some(sg) = residue.atom("SG") {
                        let offset = residue_offsets[c_idx][r_idx]
                            + residue.iter_atoms().position(|a| a.name == "SG").unwrap();
                        sulfur_atoms.push((offset, sg.pos));
                    }
                }
            }
        }

        let cutoff_sq = self.disulfide_bond_cutoff * self.disulfide_bond_cutoff;
        for i in 0..sulfur_atoms.len() {
            for j in (i + 1)..sulfur_atoms.len() {
                let (idx1, pos1) = sulfur_atoms[i];
                let (idx2, pos2) = sulfur_atoms[j];

                if nalgebra::distance_squared(&pos1, &pos2) <= cutoff_sq {
                    bonds.push(Bond::new(idx1, idx2, BondOrder::Single));
                }
            }
        }

        Ok(())
    }

    fn connect_atoms_if_close(
        &self,
        res1: &crate::model::residue::Residue,
        offset1: usize,
        name1: &str,
        res2: &crate::model::residue::Residue,
        offset2: usize,
        name2: &str,
        cutoff: f64,
        order: BondOrder,
        bonds: &mut Vec<Bond>,
    ) {
        if let (Some(idx1), Some(idx2)) = (
            res1.iter_atoms().position(|a| a.name == name1),
            res2.iter_atoms().position(|a| a.name == name2),
        ) {
            let p1 = res1.atoms()[idx1].pos;
            let p2 = res2.atoms()[idx2].pos;

            if nalgebra::distance_squared(&p1, &p2) <= cutoff * cutoff {
                bonds.push(Bond::new(offset1 + idx1, offset2 + idx2, order));
            }
        }
    }
}
