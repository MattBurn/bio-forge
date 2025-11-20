use super::atom::Atom;
use super::types::{ResidueCategory, ResiduePosition};
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub struct Residue {
    pub id: i32,
    pub name: String,
    pub category: ResidueCategory,
    pub position: ResiduePosition,
    atoms: Vec<Atom>,
}

impl Residue {
    pub fn new(id: i32, name: &str, category: ResidueCategory) -> Self {
        Self {
            id,
            name: name.to_string(),
            category,
            position: ResiduePosition::None,
            atoms: Vec::new(),
        }
    }

    pub fn add_atom(&mut self, atom: Atom) {
        debug_assert!(
            self.atom(&atom.name).is_none(),
            "Attempted to add a duplicate atom name '{}' to residue '{}'",
            atom.name,
            self.name
        );
        self.atoms.push(atom);
    }

    pub fn remove_atom(&mut self, name: &str) -> Option<Atom> {
        if let Some(index) = self.atoms.iter().position(|a| a.name == name) {
            Some(self.atoms.remove(index))
        } else {
            None
        }
    }

    pub fn atom(&self, name: &str) -> Option<&Atom> {
        self.atoms.iter().find(|a| a.name == name)
    }

    pub fn atom_mut(&mut self, name: &str) -> Option<&mut Atom> {
        self.atoms.iter_mut().find(|a| a.name == name)
    }

    pub fn has_atom(&self, name: &str) -> bool {
        self.atom(name).is_some()
    }

    pub fn atoms(&self) -> &[Atom] {
        &self.atoms
    }

    pub fn atom_count(&self) -> usize {
        self.atoms.len()
    }

    pub fn is_empty(&self) -> bool {
        self.atoms.is_empty()
    }

    pub fn iter_atoms(&self) -> std::slice::Iter<'_, Atom> {
        self.atoms.iter()
    }

    pub fn iter_atoms_mut(&mut self) -> std::slice::IterMut<'_, Atom> {
        self.atoms.iter_mut()
    }

    pub fn strip_hydrogens(&mut self) {
        self.atoms
            .retain(|a| a.element != crate::model::types::Element::H);
    }
}

impl fmt::Display for Residue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Residue {{ id: {}, name: \"{}\", category: {}, atoms: {} }}",
            self.id,
            self.name,
            self.category,
            self.atom_count()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::types::{Element, Point};

    fn create_test_atom(name: &str, element: Element) -> Atom {
        Atom::new(name, element, Point::new(0.0, 0.0, 0.0))
    }

    #[test]
    fn residue_new_creates_correct_residue() {
        let residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        assert_eq!(residue.id, 1);
        assert_eq!(residue.name, "ALA");
        assert_eq!(residue.category, ResidueCategory::Standard);
        assert_eq!(residue.position, ResiduePosition::None);
        assert!(residue.is_empty());
        assert_eq!(residue.atom_count(), 0);
    }

    #[test]
    fn residue_add_atom_adds_atom_correctly() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        let atom = create_test_atom("CA", Element::C);

        residue.add_atom(atom);

        assert_eq!(residue.atom_count(), 1);
        assert!(residue.has_atom("CA"));
        assert_eq!(residue.atom("CA").unwrap().name, "CA");
    }

    #[test]
    fn residue_remove_atom_removes_existing_atom() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        let atom = create_test_atom("CA", Element::C);
        residue.add_atom(atom);

        let removed = residue.remove_atom("CA");

        assert!(removed.is_some());
        assert_eq!(removed.unwrap().name, "CA");
        assert_eq!(residue.atom_count(), 0);
        assert!(!residue.has_atom("CA"));
    }

    #[test]
    fn residue_remove_atom_returns_none_for_nonexistent_atom() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        let removed = residue.remove_atom("NONEXISTENT");

        assert!(removed.is_none());
    }

    #[test]
    fn residue_atom_returns_correct_atom() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        let atom = create_test_atom("CA", Element::C);
        residue.add_atom(atom);

        let retrieved = residue.atom("CA");

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "CA");
    }

    #[test]
    fn residue_atom_returns_none_for_nonexistent_atom() {
        let residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        let retrieved = residue.atom("NONEXISTENT");

        assert!(retrieved.is_none());
    }

    #[test]
    fn residue_atom_mut_returns_correct_mutable_atom() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        let atom = create_test_atom("CA", Element::C);
        residue.add_atom(atom);

        let retrieved = residue.atom_mut("CA");

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "CA");
    }

    #[test]
    fn residue_atom_mut_returns_none_for_nonexistent_atom() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        let retrieved = residue.atom_mut("NONEXISTENT");

        assert!(retrieved.is_none());
    }

    #[test]
    fn residue_has_atom_returns_true_for_existing_atom() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        let atom = create_test_atom("CA", Element::C);
        residue.add_atom(atom);

        assert!(residue.has_atom("CA"));
    }

    #[test]
    fn residue_has_atom_returns_false_for_nonexistent_atom() {
        let residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        assert!(!residue.has_atom("NONEXISTENT"));
    }

    #[test]
    fn residue_atoms_returns_slice_of_all_atoms() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        let atom1 = create_test_atom("CA", Element::C);
        let atom2 = create_test_atom("CB", Element::C);
        residue.add_atom(atom1);
        residue.add_atom(atom2);

        let atoms = residue.atoms();

        assert_eq!(atoms.len(), 2);
        assert_eq!(atoms[0].name, "CA");
        assert_eq!(atoms[1].name, "CB");
    }

    #[test]
    fn residue_atom_count_returns_correct_count() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        assert_eq!(residue.atom_count(), 0);

        residue.add_atom(create_test_atom("CA", Element::C));
        assert_eq!(residue.atom_count(), 1);

        residue.add_atom(create_test_atom("CB", Element::C));
        assert_eq!(residue.atom_count(), 2);
    }

    #[test]
    fn residue_is_empty_returns_true_for_empty_residue() {
        let residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        assert!(residue.is_empty());
    }

    #[test]
    fn residue_is_empty_returns_false_for_non_empty_residue() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));

        assert!(!residue.is_empty());
    }

    #[test]
    fn residue_iter_atoms_iterates_over_all_atoms() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));
        residue.add_atom(create_test_atom("CB", Element::C));

        let mut names = Vec::new();
        for atom in residue.iter_atoms() {
            names.push(atom.name.clone());
        }

        assert_eq!(names, vec!["CA", "CB"]);
    }

    #[test]
    fn residue_iter_atoms_mut_allows_modification() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));

        for atom in residue.iter_atoms_mut() {
            atom.name = "MODIFIED".to_string();
        }

        assert_eq!(residue.atom("MODIFIED").unwrap().name, "MODIFIED");
    }

    #[test]
    fn residue_strip_hydrogens_removes_hydrogen_atoms() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));
        residue.add_atom(create_test_atom("HA", Element::H));
        residue.add_atom(create_test_atom("CB", Element::C));
        residue.add_atom(create_test_atom("HB", Element::H));

        residue.strip_hydrogens();

        assert_eq!(residue.atom_count(), 2);
        assert!(residue.has_atom("CA"));
        assert!(!residue.has_atom("HA"));
        assert!(residue.has_atom("CB"));
        assert!(!residue.has_atom("HB"));
    }

    #[test]
    fn residue_strip_hydrogens_preserves_non_hydrogen_atoms() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));
        residue.add_atom(create_test_atom("CB", Element::C));
        residue.add_atom(create_test_atom("N", Element::N));
        residue.add_atom(create_test_atom("O", Element::O));

        residue.strip_hydrogens();

        assert_eq!(residue.atom_count(), 4);
        assert!(residue.has_atom("CA"));
        assert!(residue.has_atom("CB"));
        assert!(residue.has_atom("N"));
        assert!(residue.has_atom("O"));
    }

    #[test]
    fn residue_display_formats_correctly() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));
        residue.add_atom(create_test_atom("CB", Element::C));

        let display = format!("{}", residue);
        let expected = "Residue { id: 1, name: \"ALA\", category: Standard Residue, atoms: 2 }";

        assert_eq!(display, expected);
    }

    #[test]
    fn residue_display_with_empty_residue() {
        let residue = Residue::new(1, "ALA", ResidueCategory::Standard);

        let display = format!("{}", residue);
        let expected = "Residue { id: 1, name: \"ALA\", category: Standard Residue, atoms: 0 }";

        assert_eq!(display, expected);
    }

    #[test]
    fn residue_clone_creates_identical_copy() {
        let mut residue = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue.add_atom(create_test_atom("CA", Element::C));
        residue.position = ResiduePosition::Internal;

        let cloned = residue.clone();

        assert_eq!(residue, cloned);
        assert_eq!(residue.id, cloned.id);
        assert_eq!(residue.name, cloned.name);
        assert_eq!(residue.category, cloned.category);
        assert_eq!(residue.position, cloned.position);
        assert_eq!(residue.atoms, cloned.atoms);
    }

    #[test]
    fn residue_partial_eq_compares_correctly() {
        let mut residue1 = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue1.add_atom(create_test_atom("CA", Element::C));

        let mut residue2 = Residue::new(1, "ALA", ResidueCategory::Standard);
        residue2.add_atom(create_test_atom("CA", Element::C));

        let residue3 = Residue::new(2, "ALA", ResidueCategory::Standard);
        let residue4 = Residue::new(1, "GLY", ResidueCategory::Standard);
        let residue5 = Residue::new(1, "ALA", ResidueCategory::Hetero);

        assert_eq!(residue1, residue2);
        assert_ne!(residue1, residue3);
        assert_ne!(residue1, residue4);
        assert_ne!(residue1, residue5);
    }
}
