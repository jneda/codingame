import type { Molecule } from "./types";

export class Project {
  cost: Record<Molecule, number>;

  constructor(cost: Record<Molecule, number>) {
    this.cost = { ...cost };
  }
}
