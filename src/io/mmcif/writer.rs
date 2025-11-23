use crate::io::error::Error;
use crate::model::{
    atom::Atom, residue::Residue, structure::Structure, topology::Topology, types::BondOrder,
};
use std::collections::HashMap;
use std::io::Write;

pub fn write_structure<W: Write>(writer: W, structure: &Structure) -> Result<(), Error> {
    let mut ctx = WriterContext::new(writer);

    ctx.write_header()?;

    ctx.write_cell(structure.box_vectors)?;

    ctx.write_atoms(structure)?;

    Ok(())
}

pub fn write_topology<W: Write>(writer: W, topology: &Topology) -> Result<(), Error> {
    let mut ctx = WriterContext::new(writer);
    let structure = topology.structure();

    ctx.write_header()?;

    ctx.write_cell(structure.box_vectors)?;

    ctx.write_atoms(structure)?;

    ctx.write_connections(topology)?;

    Ok(())
}

struct WriterContext<W> {
    writer: W,
    current_atom_id: usize,
    atom_index_to_id: HashMap<usize, usize>,
}

impl<W: Write> WriterContext<W> {
    fn new(writer: W) -> Self {
        Self {
            writer,
            current_atom_id: 1,
            atom_index_to_id: HashMap::new(),
        }
    }

    fn write_header(&mut self) -> Result<(), Error> {
        writeln!(self.writer, "data_bio_forge_export")
            .and_then(|_| writeln!(self.writer, "#"))
            .map_err(|e| Error::from_io(e, None))
    }

    fn write_cell(&mut self, box_vectors: Option<[[f64; 3]; 3]>) -> Result<(), Error> {
        if let Some(vectors) = box_vectors {
            let v1 = nalgebra::Vector3::from(vectors[0]);
            let v2 = nalgebra::Vector3::from(vectors[1]);
            let v3 = nalgebra::Vector3::from(vectors[2]);

            let a = v1.norm();
            let b = v2.norm();
            let c = v3.norm();

            let alpha = v2.angle(&v3).to_degrees();
            let beta = v1.angle(&v3).to_degrees();
            let gamma = v1.angle(&v2).to_degrees();

            writeln!(self.writer, "_cell.entry_id           bio_forge_export")
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.length_a           {:.3}", a)
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.length_b           {:.3}", b)
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.length_c           {:.3}", c)
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.angle_alpha        {:.2}", alpha)
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.angle_beta         {:.2}", beta)
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.angle_gamma        {:.2}", gamma)
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "_cell.Z_PDB              1")
                .map_err(|e| Error::from_io(e, None))?;
            writeln!(self.writer, "#").map_err(|e| Error::from_io(e, None))?;
        }
        Ok(())
    }

    fn write_atoms(&mut self, structure: &Structure) -> Result<(), Error> {
        writeln!(self.writer, "loop_").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.group_PDB").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.type_symbol").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.label_atom_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.label_alt_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.label_comp_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.label_asym_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.label_entity_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.label_seq_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.pdbx_PDB_ins_code")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.Cartn_x").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.Cartn_y").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.Cartn_z").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.occupancy").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.B_iso_or_equiv").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.auth_seq_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.auth_comp_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.auth_asym_id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_atom_site.auth_atom_id").map_err(|e| Error::from_io(e, None))?;

        self.atom_index_to_id.clear();
        let mut entity_ids: HashMap<String, usize> = HashMap::new();
        let mut next_entity_id = 1usize;
        let mut global_atom_index = 0usize;

        for chain in structure.iter_chains() {
            let chain_id = chain.id.clone();
            let entity_id = *entity_ids.entry(chain_id.clone()).or_insert_with(|| {
                let val = next_entity_id;
                next_entity_id += 1;
                val
            });

            for residue in chain.iter_residues() {
                for atom in residue.iter_atoms() {
                    let group_pdb = match residue.standard_name {
                        Some(std) if std.is_protein() || std.is_nucleic() => "ATOM",
                        _ => "HETATM",
                    };

                    let atom_id = self.current_atom_id;

                    self.write_atom_record(
                        group_pdb, atom_id, atom, residue, &chain_id, entity_id,
                    )?;

                    self.atom_index_to_id.insert(global_atom_index, atom_id);
                    global_atom_index += 1;
                    self.current_atom_id += 1;
                }
            }
        }
        writeln!(self.writer, "#").map_err(|e| Error::from_io(e, None))?;
        Ok(())
    }

    fn write_atom_record(
        &mut self,
        group_pdb: &str,
        atom_id: usize,
        atom: &Atom,
        residue: &Residue,
        chain_id: &str,
        entity_id: usize,
    ) -> Result<(), Error> {
        let type_symbol = atom.element.symbol();
        let label_atom_id = quote_string(&atom.name);
        let label_comp_id = quote_string(&residue.name);
        let label_asym_id = quote_string(chain_id);
        let label_seq_id = residue.id.to_string();
        let ins_code = residue
            .insertion_code
            .map(|c| c.to_string())
            .unwrap_or_else(|| "?".to_string());

        let auth_seq_id = residue.id.to_string();
        let auth_comp_id = label_comp_id.clone();
        let auth_asym_id = label_asym_id.clone();
        let auth_atom_id = label_atom_id.clone();

        writeln!(
            self.writer,
            "{group_pdb} {atom_id} {type_symbol} {label_atom_id} . {label_comp_id} {label_asym_id} {entity_id} {label_seq_id} {ins_code} {x:.3} {y:.3} {z:.3} 1.00 0.00 {auth_seq_id} {auth_comp_id} {auth_asym_id} {auth_atom_id}",
            group_pdb = group_pdb,
            atom_id = atom_id,
            type_symbol = type_symbol,
            label_atom_id = label_atom_id,
            label_comp_id = label_comp_id,
            label_asym_id = label_asym_id,
            entity_id = entity_id,
            label_seq_id = label_seq_id,
            ins_code = ins_code,
            x = atom.pos.x,
            y = atom.pos.y,
            z = atom.pos.z,
            auth_seq_id = auth_seq_id,
            auth_comp_id = auth_comp_id,
            auth_asym_id = auth_asym_id,
            auth_atom_id = auth_atom_id
        )
        .map_err(|e| Error::from_io(e, None))
    }

    fn write_connections(&mut self, topology: &Topology) -> Result<(), Error> {
        if topology.bond_count() == 0 {
            return Ok(());
        }

        writeln!(self.writer, "loop_").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.id").map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.conn_type_id").map_err(|e| Error::from_io(e, None))?;

        writeln!(self.writer, "_struct_conn.ptnr1_label_atom_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_label_alt_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_label_comp_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_label_asym_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_label_seq_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_PDB_ins_code")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_symmetry")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_auth_asym_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_auth_comp_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr1_auth_seq_id")
            .map_err(|e| Error::from_io(e, None))?;

        writeln!(self.writer, "_struct_conn.ptnr2_label_atom_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_label_alt_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_label_comp_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_label_asym_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_label_seq_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_PDB_ins_code")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_symmetry")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_auth_asym_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_auth_comp_id")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.ptnr2_auth_seq_id")
            .map_err(|e| Error::from_io(e, None))?;

        writeln!(self.writer, "_struct_conn.pdbx_dist_value")
            .map_err(|e| Error::from_io(e, None))?;
        writeln!(self.writer, "_struct_conn.pdbx_value_order")
            .map_err(|e| Error::from_io(e, None))?;

        let atom_lookup: Vec<(&crate::model::chain::Chain, &Residue, &Atom)> =
            topology.structure().iter_atoms_with_context().collect();

        for (conn_idx, bond) in topology.bonds().iter().enumerate() {
            let _ = self.atom_index_to_id.get(&bond.a1_idx).ok_or_else(|| {
                Error::inconsistent_data(
                    "mmCIF",
                    None,
                    format!(
                        "bond references atom index {} that was not written",
                        bond.a1_idx
                    ),
                )
            })?;
            let _ = self.atom_index_to_id.get(&bond.a2_idx).ok_or_else(|| {
                Error::inconsistent_data(
                    "mmCIF",
                    None,
                    format!(
                        "bond references atom index {} that was not written",
                        bond.a2_idx
                    ),
                )
            })?;

            let (chain1, res1, atom1) = atom_lookup[bond.a1_idx];
            let (chain2, res2, atom2) = atom_lookup[bond.a2_idx];

            let conn_id = format!("conn_{:04}", conn_idx + 1);
            let conn_type_id = "covale";
            let symmetry = "1_555";
            let order_str = match bond.order {
                BondOrder::Single => "SING",
                BondOrder::Double => "DOUB",
                BondOrder::Triple => "TRIP",
                BondOrder::Aromatic => "AROM",
            };
            let dist = atom1.distance(atom2);

            let ins1 = res1
                .insertion_code
                .map(|c| c.to_string())
                .unwrap_or_else(|| "?".to_string());
            let ins2 = res2
                .insertion_code
                .map(|c| c.to_string())
                .unwrap_or_else(|| "?".to_string());

            writeln!(
                self.writer,
                "{conn_id} {conn_type_id} {pt1_atom} . {pt1_res} {pt1_asym} {pt1_seq} {pt1_ins} {symmetry} {pt1_auth_asym} {pt1_auth_res} {pt1_auth_seq} {pt2_atom} . {pt2_res} {pt2_asym} {pt2_seq} {pt2_ins} {symmetry} {pt2_auth_asym} {pt2_auth_res} {pt2_auth_seq} {dist:.3} {order_str}",
                conn_id = conn_id,
                conn_type_id = conn_type_id,
                pt1_atom = quote_string(&atom1.name),
                pt1_res = quote_string(&res1.name),
                pt1_asym = quote_string(&chain1.id),
                pt1_seq = res1.id,
                pt1_ins = ins1,
                symmetry = symmetry,
                pt1_auth_asym = quote_string(&chain1.id),
                pt1_auth_res = quote_string(&res1.name),
                pt1_auth_seq = res1.id,
                pt2_atom = quote_string(&atom2.name),
                pt2_res = quote_string(&res2.name),
                pt2_asym = quote_string(&chain2.id),
                pt2_seq = res2.id,
                pt2_ins = ins2,
                pt2_auth_asym = quote_string(&chain2.id),
                pt2_auth_res = quote_string(&res2.name),
                pt2_auth_seq = res2.id,
                dist = dist,
                order_str = order_str
            )
            .map_err(|e| Error::from_io(e, None))?;
        }
        writeln!(self.writer, "#").map_err(|e| Error::from_io(e, None))?;

        Ok(())
    }
}

fn quote_string(s: &str) -> String {
    if s.is_empty() {
        return "?".to_string();
    }
    if !s.contains(char::is_whitespace) && !s.contains('\'') && !s.contains('"') {
        return s.to_string();
    }
    if s.contains('\'') && !s.contains('"') {
        return format!("\"{}\"", s);
    }
    format!("'{}'", s)
}
