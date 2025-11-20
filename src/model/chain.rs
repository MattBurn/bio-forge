use super::residue::Residue;
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub struct Chain {
    pub id: String,
    residues: Vec<Residue>,
}

impl Chain {
    pub fn new(id: &str) -> Self {
        Self {
            id: id.to_string(),
            residues: Vec::new(),
        }
    }

    pub fn add_residue(&mut self, residue: Residue) {
        debug_assert!(
            self.residue(residue.id).is_none(),
            "Attempted to add a duplicate residue ID '{}' to chain '{}'",
            residue.id,
            self.id
        );
        self.residues.push(residue);
    }

    pub fn residue(&self, id: i32) -> Option<&Residue> {
        self.residues.iter().find(|r| r.id == id)
    }

    pub fn residue_mut(&mut self, id: i32) -> Option<&mut Residue> {
        self.residues.iter_mut().find(|r| r.id == id)
    }

    pub fn residues(&self) -> &[Residue] {
        &self.residues
    }

    pub fn residue_count(&self) -> usize {
        self.residues.len()
    }

    pub fn is_empty(&self) -> bool {
        self.residues.is_empty()
    }

    pub fn iter_residues(&self) -> std::slice::Iter<'_, Residue> {
        self.residues.iter()
    }

    pub fn iter_residues_mut(&mut self) -> std::slice::IterMut<'_, Residue> {
        self.residues.iter_mut()
    }

    pub fn iter_atoms(&self) -> impl Iterator<Item = &super::atom::Atom> {
        self.residues.iter().flat_map(|r| r.iter_atoms())
    }

    pub fn iter_atoms_mut(&mut self) -> impl Iterator<Item = &mut super::atom::Atom> {
        self.residues.iter_mut().flat_map(|r| r.iter_atoms_mut())
    }
}

impl fmt::Display for Chain {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Chain {{ id: \"{}\", residues: {} }}",
            self.id,
            self.residue_count()
        )
    }
}
