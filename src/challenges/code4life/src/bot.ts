import type { Module, Molecule, BotInput, MyBotInput } from "./types";
import { Sample } from "./sample";
import { State, IdleState } from "./states";

export class Bot {
  target: Module | null;
  eta: number;
  score: number;
  storage: Record<Molecule, number>;
  expertise: Record<Molecule, number>;
  samples: Sample[];
  reserved: Record<number, Partial<Record<Molecule, number>>>;

  constructor() {
    this.target = null;
    this.eta = 0;
    this.score = 0;
    this.storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    this.expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    this.samples = [];
    this.reserved = {};
  }

  getInputs({ target, eta, score, storage, expertise, samples }: BotInput) {
    this.target = target;
    this.eta = eta;
    this.score = score;
    this.storage = { ...storage };
    this.expertise = { ...expertise };
    this.samples = [...samples];
  }
}

export class MyBot extends Bot {
  state: State;
  availableMolecules: Record<Molecule, number>;

  constructor() {
    super();
    this.state = new IdleState(this);
    this.availableMolecules = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  }

  getInputs(myBotInput: MyBotInput): void {
    const { availableMolecules, ...botInput } = myBotInput;
    super.getInputs(botInput);
    this.availableMolecules = { ...availableMolecules };
  }

  update() {
    this.state.update();
  }

  goto() {
    console.log(`GOTO ${this.target}`);
  }

  getDiagnoses() {
    return this.samples.filter((sample) => sample.isDiagnosed());
  }

  getUndiagnosed() {
    return this.samples.filter((sample) => !sample.isDiagnosed());
  }

  getStorageUsage() {
    let storageUsage = 0;
    for (const [_molecule, quantity] of Object.entries(this.storage)) {
      storageUsage += quantity;
    }
    return storageUsage;
  }

  getTotalExpertise() {
    return Object.values(this.expertise).reduce((a, b) => a + b);
  }

  reserveMolecule(type: Molecule, sampleId: number) {
    const reservedForSample = this.reserved[sampleId];
    if (reservedForSample === undefined) {
      this.reserved[sampleId] = {};
    }
    const reserved = this.reserved[sampleId][type];
    if (reserved === undefined) {
      this.reserved[sampleId][type] = 0;
    }
    this.reserved[sampleId][type]!++;
    console.error({
      reserved: Object.keys(this.reserved).map(
        (id) => `${id}: ${JSON.stringify(this.reserved[Number(id)])}`
      ),
    });
  }

  getReservedMoleculeCountByType(type: Molecule) {
    let count = 0;
    for (const id of Object.keys(this.reserved)) {
      const countForThisId = this.reserved[Number(id)][type];
      if (countForThisId) {
        count += countForThisId;
      }
    }
    return count;
  }

  fetchSample(rank: number) {
    console.log(`CONNECT ${rank}`);
  }

  fetchDiagnosis(id: number) {
    console.log(`CONNECT ${id}`);
  }

  makeMedicine(id: number) {
    console.log(`CONNECT ${id}`);
    this.reserved[id] = {};
  }

  wait() {
    console.log("WAIT");
  }

  getMolecule(type: Molecule, sampleId: number) {
    console.log(`CONNECT ${type}`);
    this.reserveMolecule(type, sampleId);
  }

  noOp() {
    console.log("");
  }
}
