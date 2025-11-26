# Protein-DNA Complex Information Extraction Example

![3L1P Structure](./images/structure.png)

## Inputs

- **Structure**: `3L1P.pdb` — PDB structure of a protein-DNA complex.

## Command

```bash
bioforge info -i 3L1P.pdb
```

## Results

- Computes per-chain statistics (residue count, atom count, polymer class).
- Reports unit cell vectors/angles when available.
