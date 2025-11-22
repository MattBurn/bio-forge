use crate::io::error::Error;
use crate::model::{
    atom::Atom, residue::Residue, structure::Structure, topology::Topology, types::ResidueCategory,
};
use std::collections::HashMap;
use std::io::Write;

pub fn write_structure<W: Write>(writer: W, structure: &Structure) -> Result<(), Error> {
    let mut ctx = WriterContext::new(writer);

    ctx.write_cryst1(structure.box_vectors)?;

    ctx.write_atoms(structure)?;

    ctx.write_end()?;

    Ok(())
}

pub fn write_topology<W: Write>(writer: W, topology: &Topology) -> Result<(), Error> {
    let mut ctx = WriterContext::new(writer);
    let structure = topology.structure();

    ctx.write_cryst1(structure.box_vectors)?;

    ctx.write_atoms(structure)?;

    ctx.write_connects(topology)?;

    ctx.write_end()?;

    Ok(())
}

struct WriterContext<W> {
    writer: W,
    current_serial: usize,
    atom_index_to_serial: HashMap<usize, usize>,
}

impl<W: Write> WriterContext<W> {
    fn new(writer: W) -> Self {
        Self {
            writer,
            current_serial: 1,
            atom_index_to_serial: HashMap::new(),
        }
    }

    fn write_cryst1(&mut self, box_vectors: Option<[[f64; 3]; 3]>) -> Result<(), Error> {
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

            writeln!(
                self.writer,
                "CRYST1{:9.3}{:9.3}{:9.3}{:7.2}{:7.2}{:7.2} P 1           1",
                a, b, c, alpha, beta, gamma
            )
            .map_err(|e| Error::from_io(e, None))?;
        }
        Ok(())
    }

    fn write_atoms(&mut self, structure: &Structure) -> Result<(), Error> {
        let mut global_idx = 0;

        for chain in structure.iter_chains() {
            for residue in chain.iter_residues() {
                for atom in residue.iter_atoms() {
                    let record_type = match residue.standard_name {
                        Some(std) if std.is_protein() || std.is_nucleic() => "ATOM  ",
                        _ => "HETATM",
                    };

                    let serial = self.current_serial;

                    self.atom_index_to_serial.insert(global_idx, serial);

                    self.write_atom_record(record_type, serial, atom, residue, &chain.id)?;

                    self.current_serial += 1;
                    global_idx += 1;
                }
            }

            if let Some(last_standard) = chain
                .iter_residues()
                .rev()
                .find(|res| res.category == ResidueCategory::Standard)
            {
                let serial = self.current_serial;
                self.write_ter_record(serial, last_standard, &chain.id)?;
                self.current_serial += 1;
            }
        }
        Ok(())
    }

    fn write_atom_record(
        &mut self,
        record_type: &str,
        serial: usize,
        atom: &Atom,
        residue: &Residue,
        chain_id: &str,
    ) -> Result<(), Error> {
        let atom_name = if atom.name.len() >= 4 {
            format!("{:<4}", &atom.name[0..4])
        } else {
            format!(" {:<3}", atom.name)
        };

        let res_name = if residue.name.len() > 3 {
            &residue.name[0..3]
        } else {
            &residue.name
        };

        let element_str = format!("{:>2}", atom.element.symbol().to_uppercase());

        writeln!(
            self.writer,
            "{:6}{:5} {:4}{:1}{:3} {:1}{:4}{:1}   {:8.3}{:8.3}{:8.3}{:6.2}{:6.2}          {:2}",
            record_type,
            serial % 100000,
            atom_name,
            ' ',
            res_name,
            chain_id.chars().next().unwrap_or(' '),
            residue.id % 10000,
            residue.insertion_code.unwrap_or(' '),
            atom.pos.x,
            atom.pos.y,
            atom.pos.z,
            1.00,
            0.00,
            element_str
        )
        .map_err(|e| Error::from_io(e, None))
    }

    fn write_ter_record(
        &mut self,
        serial: usize,
        residue: &Residue,
        chain_id: &str,
    ) -> Result<(), Error> {
        let res_name = if residue.name.len() > 3 {
            &residue.name[0..3]
        } else {
            &residue.name
        };

        writeln!(
            self.writer,
            "TER   {:5}      {:3} {:1}{:4}{:1}",
            serial % 100000,
            res_name,
            chain_id.chars().next().unwrap_or(' '),
            residue.id % 10000,
            residue.insertion_code.unwrap_or(' ')
        )
        .map_err(|e| Error::from_io(e, None))
    }

    fn write_connects(&mut self, topology: &Topology) -> Result<(), Error> {
        let mut adjacency: HashMap<usize, Vec<usize>> = HashMap::new();

        for bond in topology.bonds() {
            let s1 = *self.atom_index_to_serial.get(&bond.a1_idx).ok_or_else(|| {
                Error::inconsistent_data(
                    "PDB",
                    None,
                    format!(
                        "bond references atom index {} that was not written",
                        bond.a1_idx
                    ),
                )
            })?;
            let s2 = *self.atom_index_to_serial.get(&bond.a2_idx).ok_or_else(|| {
                Error::inconsistent_data(
                    "PDB",
                    None,
                    format!(
                        "bond references atom index {} that was not written",
                        bond.a2_idx
                    ),
                )
            })?;

            adjacency.entry(s1).or_default().push(s2);
            adjacency.entry(s2).or_default().push(s1);
        }

        let mut serials: Vec<_> = adjacency.keys().copied().collect();
        serials.sort();

        for src_serial in serials {
            let targets = adjacency.get(&src_serial).unwrap();
            let mut targets = targets.clone();
            targets.sort();
            targets.dedup();

            for chunk in targets.chunks(4) {
                write!(self.writer, "CONECT{:5}", src_serial)
                    .map_err(|e| Error::from_io(e, None))?;
                for target in chunk {
                    write!(self.writer, "{:5}", target).map_err(|e| Error::from_io(e, None))?;
                }
                writeln!(self.writer).map_err(|e| Error::from_io(e, None))?;
            }
        }

        Ok(())
    }

    fn write_end(&mut self) -> Result<(), Error> {
        writeln!(self.writer, "END   ").map_err(|e| Error::from_io(e, None))
    }
}
