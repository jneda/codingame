import { MyBot } from "../bot";
import { State, MakeMedicineState } from ".";
import { Molecule } from "../types";

export class GetMoleculesState extends State {
  constructor(bot: MyBot) {
    super(bot);
  }

  update() {
    // go get molecules if we are elsewhere
    if (this.bot.target !== "MOLECULES") {
      this.bot.target = "MOLECULES";
      return this.bot.goto();
    }

    // do nothing while we are en route
    if (this.bot.target === "MOLECULES" && this.bot.eta > 0) {
      return this.bot.noOp();
    }

    // figure out if we have room for molecules
    const storageAvailable = 10 - this.bot.getStorageUsage();
    console.error({ storageAvailable });
    const manageableRecipes = this.bot
      .getDiagnoses()
      .filter(
        (diagnosis) =>
          diagnosis.getStorageRequirement(this.bot) < storageAvailable &&
          Object.values(diagnosis.getActualCosts(this.bot)).reduce(
            (a, b) => a + b,
            0
          ) > 0
      )
      .sort(
        (
          a,
          b // let's sort them by actual costs for now
        ) => a.getActualCostsTotal(this.bot) - b.getActualCostsTotal(this.bot)
      );
    // console.error({ manageableRecipes });

    // let's also check if we acutally miss some molecules for the samples we have
    const neededMoleculesCount = this.bot.samples
      .map((sample) =>
        Object.values(sample.getActualCosts(this.bot)).reduce(
          (a, b) => a + b,
          0
        )
      )
      .reduce((a, b) => a + b);
    // console.error({ neededMoleculesCount });

    // if not, go make medicine
    if (
      manageableRecipes.length === 0 ||
      neededMoleculesCount === 0 ||
      storageAvailable === 0
    ) {
      this.bot.state = new MakeMedicineState(this.bot);
      return this.bot.update();
    }

    let done = false;

    while (!done) {
      // for now, let's select the cheapest recipe
      const targetRecipe = manageableRecipes.shift();
      if (targetRecipe === undefined) {
        // let's wait for now...
        this.bot.state = new MakeMedicineState(this.bot);
        return this.bot.update();
      }

      console.error({
        targetRecipe,
        actualCosts: targetRecipe.getActualCosts(this.bot),
      });

      // and let's ask for the first relevant molecule available
      const relevantAvailableMolecules = Object.entries(
        this.bot.availableMolecules
      )
        .filter(([mol, qty]) => qty > 0)
        .filter(([mol, _qty]) =>
          Object.keys(targetRecipe.getActualCosts(this.bot)).includes(mol)
        )
        .map(([mol, _qty]) => mol);
      // console.error({ relevantAvailableMolecules });

      if (relevantAvailableMolecules.length > 0) {
        // otherwise grab it
        return this.bot.getMolecule(
          relevantAvailableMolecules[0] as Molecule,
          targetRecipe.id
        );
      }
    }
  }
}
