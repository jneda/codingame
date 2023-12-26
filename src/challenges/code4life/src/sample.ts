import { MyBot } from "./bot";
import type { Molecule } from "./types";

export class Sample {
  id: number;
  carriedBy: number;
  rank: number;
  gain: string;
  health: number;
  costs: Record<Molecule, number>;

  constructor(
    id: number,
    carriedBy: number,
    rank: number,
    gain: string,
    health: number,
    costs: Record<Molecule, number>
  ) {
    this.id = id;
    this.carriedBy = carriedBy;
    this.rank = rank;
    this.gain = gain;
    this.health = health;
    this.costs = { ...costs };
  }

  isDiagnosed() {
    return this.health !== -1;
  }

  getReservedQuantity(bot: MyBot, molecule: Molecule) {
    // TODO: figure out a better safe way to access reserved molecules
    let reservedForRecipe = 0;
    const allReservedForRecipe = bot.reserved[this.id];
    if (allReservedForRecipe !== undefined) {
      const actualValue = bot.reserved[this.id][molecule];
      reservedForRecipe = actualValue !== undefined ? actualValue : 0;
    }
    return reservedForRecipe;
  }

  getStorageRequirement(bot: MyBot) {
    let storageRequirement = 0;
    for (const [molecule, quantity] of Object.entries(this.costs)) {
      // TODO: figure out a better safe way to access reserved molecules
      let reservedForRecipe = this.getReservedQuantity(
        bot,
        molecule as Molecule
      );
      storageRequirement +=
        quantity -
        bot.expertise[molecule as Molecule] -
        (bot.storage[molecule as Molecule] - reservedForRecipe);
    }
    return storageRequirement;
  }

  canBeMade(bot: MyBot) {
    for (const [molecule, quantity] of Object.entries(this.costs)) {
      if (
        bot.expertise[molecule as Molecule] +
          bot.storage[molecule as Molecule] <
        quantity
      )
        return false;
    }
    return true;
  }

  getActualCosts(bot: MyBot) {
    const actualCosts: Partial<Record<Molecule, number>> = {};
    for (const [mol, qty] of Object.entries(this.costs)) {
      const actualCost =
        qty -
        this.getReservedQuantity(bot, mol as Molecule) -
        bot.expertise[mol as Molecule];
      if (actualCost > 0) {
        actualCosts[mol as Molecule] = actualCost;
      }
    }
    return actualCosts;
  }

  getActualCostsTotal(bot: MyBot) {
    return Object.values(this.getActualCosts(bot)).reduce((a, b) => a + b, 0);
  }
}
