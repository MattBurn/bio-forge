use super::structure::Structure;
use super::types::BondOrder;
use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Bond {
    pub a1_idx: usize,
    pub a2_idx: usize,
    pub order: BondOrder,
}

impl Bond {
    pub fn new(idx1: usize, idx2: usize, order: BondOrder) -> Self {
        if idx1 <= idx2 {
            Self {
                a1_idx: idx1,
                a2_idx: idx2,
                order,
            }
        } else {
            Self {
                a1_idx: idx2,
                a2_idx: idx1,
                order,
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct Topology {
    structure: Structure,
    bonds: Vec<Bond>,
}

impl Topology {
    pub fn new(structure: Structure, bonds: Vec<Bond>) -> Self {
        debug_assert!(
            bonds.iter().all(|b| b.a2_idx < structure.atom_count()),
            "Bond index out of bounds"
        );
        Self { structure, bonds }
    }

    pub fn structure(&self) -> &Structure {
        &self.structure
    }

    pub fn bonds(&self) -> &[Bond] {
        &self.bonds
    }

    pub fn bond_count(&self) -> usize {
        self.bonds.len()
    }

    pub fn atom_count(&self) -> usize {
        self.structure.atom_count()
    }

    pub fn bonds_of(&self, atom_idx: usize) -> impl Iterator<Item = &Bond> {
        self.bonds
            .iter()
            .filter(move |b| b.a1_idx == atom_idx || b.a2_idx == atom_idx)
    }

    pub fn neighbors_of(&self, atom_idx: usize) -> impl Iterator<Item = usize> + '_ {
        self.bonds_of(atom_idx).map(move |b| {
            if b.a1_idx == atom_idx {
                b.a2_idx
            } else {
                b.a1_idx
            }
        })
    }
}

impl fmt::Display for Topology {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Topology {{ atoms: {}, bonds: {} }}",
            self.atom_count(),
            self.bond_count()
        )
    }
}
