import { MyBot } from "../bot";
import { State, GetMoleculesState } from ".";

export class GetDiagnosesState extends State {
  constructor(bot: MyBot) {
    super(bot);
  }

  update() {
    // go get diagnoses if we are elsewhere
    if (this.bot.target !== "DIAGNOSIS") {
      this.bot.target = "DIAGNOSIS";
      return this.bot.goto();
    }

    // do nothing while we are en route
    if (this.bot.target === "DIAGNOSIS" && this.bot.eta > 0) {
      return this.bot.noOp();
    }

    // get diagnoses as long as we have undiagnosed samples
    if (this.bot.getDiagnoses().length < 3) {
      const sample = this.bot.getUndiagnosed()[0];
      return this.bot.fetchDiagnosis(sample.id);
    } else {
      // move to molecules
      this.bot.state = new GetMoleculesState(this.bot);
      this.bot.update();
    }
  }
}
