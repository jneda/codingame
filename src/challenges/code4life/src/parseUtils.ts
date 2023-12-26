import { Project } from "./project";
import { Sample } from "./sample";
import { isModule } from "./types";

const readline = () => "";

export function getProjects() {
  const projects: Project[] = [];

  const projectCount = Number(readline());
  for (let i = 0; i < projectCount; i++) {
    const [A, B, C, D, E] = readline().split(" ").map(Number);
    const project = new Project({ A: A, B: B, C: C, D: D, E: E });
    projects.push(project);
  }

  return projects;
}

export function getBotData() {
  const [target, ...rest] = readline().split(" ");
  if (!isModule(target)) {
    throw new Error(`Invalid target: ${target}.`);
  }
  const [
    eta,
    score,
    storageA,
    storageB,
    storageC,
    storageD,
    storageE,
    expertiseA,
    expertiseB,
    expertiseC,
    expertiseD,
    expertiseE,
  ] = rest.map(Number);
  const storage = {
    A: storageA,
    B: storageB,
    C: storageC,
    D: storageD,
    E: storageE,
  };
  const expertise = {
    A: expertiseA,
    B: expertiseB,
    C: expertiseC,
    D: expertiseD,
    E: expertiseE,
  };
  return { target, eta, score, storage, expertise };
}

export function getSamples() {
  const samples: Sample[] = [];
  const sampleCount = Number(readline());
  for (let i = 0; i < sampleCount; i++) {
    const [id, carriedBy, rank, gain, health, A, B, C, D, E] =
      readline().split(" ");
    const costs = {
      A: Number(A),
      B: Number(B),
      C: Number(C),
      D: Number(D),
      E: Number(E),
    };
    const sample = new Sample(
      Number(id),
      Number(carriedBy),
      Number(rank),
      gain,
      Number(health),
      costs
    );
    samples.push(sample);
  }
  return samples;
}

export function getAvailableMolecules() {
  const [A, B, C, D, E] = readline().split(" ").map(Number);
  return { A: A, B: B, C: C, D: D, E: E };
}
