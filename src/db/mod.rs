mod loader;
mod schema;
mod store;

use crate::model::types::{BondOrder, Element, Point, StandardResidue};

pub fn get_template(name: &str) -> Option<TemplateView> {
    store::get_store()
        .templates_by_name
        .get(name)
        .map(|inner| TemplateView::new(inner))
}

#[derive(Debug, Clone, Copy)]
pub struct TemplateView<'a> {
    inner: &'a store::InternalTemplate,
}

impl<'a> TemplateView<'a> {
    pub fn new(inner: &'a store::InternalTemplate) -> Self {
        Self { inner }
    }

    pub fn name(&self) -> &'a str {
        &self.inner.schema.info.name
    }

    pub fn standard_name(&self) -> StandardResidue {
        self.inner.schema.info.standard_name
    }

    pub fn charge(&self) -> i32 {
        self.inner.schema.info.charge
    }

    pub fn heavy_atoms(&self) -> impl Iterator<Item = (&'a str, Element, Point)> {
        self.inner
            .schema
            .atoms
            .iter()
            .map(|a| (a.name.as_str(), a.element, Point::from(a.pos)))
    }

    pub fn hydrogens(
        &self,
    ) -> impl Iterator<Item = (&'a str, Point, impl Iterator<Item = &'a str>)> {
        self.inner.schema.hydrogens.iter().map(|h| {
            (
                h.name.as_str(),
                Point::from(h.pos),
                h.anchors.iter().map(|s| s.as_str()),
            )
        })
    }

    pub fn bonds(&self) -> impl Iterator<Item = (&'a str, &'a str, BondOrder)> {
        self.inner
            .schema
            .bonds
            .iter()
            .map(|b| (b.a1.as_str(), b.a2.as_str(), b.order))
    }
}
