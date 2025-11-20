use super::types::BondOrder;
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Template {
    pub name: String,
    atom_names: Vec<String>,
    bonds: Vec<(String, String, BondOrder)>,
}

impl Template {
    pub fn new<S: Into<String>>(
        name: S,
        atom_names: Vec<String>,
        bonds: Vec<(String, String, BondOrder)>,
    ) -> Self {
        debug_assert!(
            bonds
                .iter()
                .all(|(a1, a2, _)| { atom_names.contains(a1) && atom_names.contains(a2) }),
            "Bond in template '{}' refers to an atom name that does not exist in the atom list.",
            name.into()
        );

        Self {
            name: name.into(),
            atom_names,
            bonds,
        }
    }

    pub fn has_bond(&self, name1: &str, name2: &str) -> bool {
        self.bonds
            .iter()
            .any(|(a1, a2, _)| (a1 == name1 && a2 == name2) || (a1 == name2 && a2 == name1))
    }

    pub fn has_atom(&self, name: &str) -> bool {
        self.atom_names.contains(&name.to_string())
    }

    pub fn atom_names(&self) -> &[String] {
        &self.atom_names
    }

    pub fn bonds(&self) -> &[(String, String, BondOrder)] {
        &self.bonds
    }

    pub fn atom_count(&self) -> usize {
        self.atom_names.len()
    }

    pub fn bond_count(&self) -> usize {
        self.bonds.len()
    }
}

impl fmt::Display for Template {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Template {{ name: \"{}\", atoms: {}, bonds: {} }}",
            self.name,
            self.atom_count(),
            self.bond_count()
        )
    }
}
