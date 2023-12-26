import { Sample } from "./sample";

export type Module =
  | "START_POS"
  | "SAMPLES"
  | "DIAGNOSIS"
  | "MOLECULES"
  | "LABORATORY";

export function isModule(module: string): module is Module {
  return (
    module === "START_POS" ||
    module === "SAMPLES" ||
    module === "DIAGNOSIS" ||
    module === "MOLECULES" ||
    module === "LABORATORY"
  );
}

export type Molecule = "A" | "B" | "C" | "D" | "E";

export type BotInput = {
  target: Module;
  eta: number;
  score: number;
  storage: Record<Molecule, number>;
  expertise: Record<Molecule, number>;
  samples: Sample[];
};

export type MyBotInput = BotInput & {
  availableMolecules: Record<Molecule, number>;
};
