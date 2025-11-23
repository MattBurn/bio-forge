use crate::model::structure::Structure;
use crate::model::types::{ResidueCategory, StandardResidue};
use crate::ops::error::Error;
use std::collections::HashSet;

#[derive(Debug, Clone, Default)]
pub struct CleanConfig {
    pub remove_water: bool,
    pub remove_ions: bool,
    pub remove_hydrogens: bool,
    pub remove_hetero: bool,
    pub remove_residue_names: HashSet<String>,
    pub keep_residue_names: HashSet<String>,
}

impl CleanConfig {
    pub fn water_only() -> Self {
        Self {
            remove_water: true,
            ..Default::default()
        }
    }

    pub fn water_and_ions() -> Self {
        Self {
            remove_water: true,
            remove_ions: true,
            ..Default::default()
        }
    }
}

pub fn clean_structure(structure: &mut Structure, config: &CleanConfig) -> Result<(), Error> {
    if config.remove_hydrogens {
        for chain in structure.iter_chains_mut() {
            for residue in chain.iter_residues_mut() {
                residue.strip_hydrogens();
            }
        }
    }

    structure.retain_residues(|_chain_id, residue| {
        if config.keep_residue_names.contains(&residue.name) {
            return true;
        }

        if config.remove_residue_names.contains(&residue.name) {
            return false;
        }

        if config.remove_water && residue.standard_name == Some(StandardResidue::HOH) {
            return false;
        }

        if config.remove_ions && residue.category == ResidueCategory::Ion {
            return false;
        }

        if config.remove_hetero && residue.category == ResidueCategory::Hetero {
            return false;
        }

        true
    });

    structure.prune_empty_chains();

    Ok(())
}
