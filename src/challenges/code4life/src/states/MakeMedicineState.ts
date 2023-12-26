import { MyBot } from "../bot";
import { State, GetSamplesState } from ".";

export class MakeMedicineState extends State {
  constructor(bot: MyBot) {
    super(bot);
  }

  update() {
    // go make medicine if we are elsewhere
    if (this.bot.target !== "LABORATORY") {
      this.bot.target = "LABORATORY";
      return this.bot.goto();
    }

    // do nothing while we are en route
    if (this.bot.target === "LABORATORY" && this.bot.eta > 0) {
      return this.bot.noOp();
    }

    // can we do a recipe?
    const doableRecipes = this.bot.samples
      .filter((sample) => sample.canBeMade(this.bot))
      .sort((a, b) => b.rank - a.rank); // let's sort by descending rank for now

    if (doableRecipes.length > 0) {
      return this.bot.makeMedicine(doableRecipes[0].id);
    }

    // else we are done
    // go get samples for now
    this.bot.state = new GetSamplesState(this.bot);
    this.bot.update();
  }
}
