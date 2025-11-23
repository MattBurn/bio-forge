use crate::model::structure::Structure;
use crate::model::types::Point;
use nalgebra::{Rotation3, Vector3};

pub struct Transform;

impl Transform {
    pub fn translate(structure: &mut Structure, x: f64, y: f64, z: f64) {
        let translation = Vector3::new(x, y, z);
        for atom in structure.iter_atoms_mut() {
            atom.translate_by(&translation);
        }
    }

    pub fn center_geometry(structure: &mut Structure, target: Option<Point>) {
        let current_center = structure.geometric_center();
        let target_point = target.unwrap_or(Point::origin());
        let translation = target_point - current_center;

        for atom in structure.iter_atoms_mut() {
            atom.translate_by(&translation);
        }
    }

    pub fn center_mass(structure: &mut Structure, target: Option<Point>) {
        let current_com = structure.center_of_mass();
        let target_point = target.unwrap_or(Point::origin());
        let translation = target_point - current_com;

        for atom in structure.iter_atoms_mut() {
            atom.translate_by(&translation);
        }
    }

    pub fn rotate_x(structure: &mut Structure, radians: f64) {
        let rotation = Rotation3::from_axis_angle(&Vector3::x_axis(), radians);
        Self::apply_rotation(structure, rotation);
    }

    pub fn rotate_y(structure: &mut Structure, radians: f64) {
        let rotation = Rotation3::from_axis_angle(&Vector3::y_axis(), radians);
        Self::apply_rotation(structure, rotation);
    }

    pub fn rotate_z(structure: &mut Structure, radians: f64) {
        let rotation = Rotation3::from_axis_angle(&Vector3::z_axis(), radians);
        Self::apply_rotation(structure, rotation);
    }

    pub fn rotate_euler(structure: &mut Structure, x_rad: f64, y_rad: f64, z_rad: f64) {
        let rotation = Rotation3::from_euler_angles(x_rad, y_rad, z_rad);
        Self::apply_rotation(structure, rotation);
    }

    fn apply_rotation(structure: &mut Structure, rotation: Rotation3<f64>) {
        for atom in structure.iter_atoms_mut() {
            atom.pos = rotation * atom.pos;
        }

        if let Some(box_vecs) = structure.box_vectors {
            let v1 = Vector3::from(box_vecs[0]);
            let v2 = Vector3::from(box_vecs[1]);
            let v3 = Vector3::from(box_vecs[2]);

            let v1_rot = rotation * v1;
            let v2_rot = rotation * v2;
            let v3_rot = rotation * v3;

            structure.box_vectors = Some([v1_rot.into(), v2_rot.into(), v3_rot.into()]);
        }
    }
}
