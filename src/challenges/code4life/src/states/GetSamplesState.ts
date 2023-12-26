import { MyBot } from "../bot";
import { State, GetDiagnosesState } from ".";

export class GetSamplesState extends State {
  constructor(bot: MyBot) {
    super(bot);
  }

  update() {
    // go get samples if we are elsewhere
    if (this.bot.target !== "SAMPLES") {
      this.bot.target = "SAMPLES";
      return this.bot.goto();
    }

    // do nothing while we are en route
    if (this.bot.target === "SAMPLES" && this.bot.eta > 0) {
      return this.bot.noOp();
    }

    // gather undiagnosed samples up to capacity
    if (this.bot.samples.length < 3) {
      // target more expensive recipes as expertise grows 
      const botExpertise = this.bot.getTotalExpertise();
      const targetRank = botExpertise >= 10 ? 3 : botExpertise >= 5 ? 2 : 1;
      return this.bot.fetchSample(targetRank);
    } else {
      // move to diagnostics
      this.bot.state = new GetDiagnosesState(this.bot);
      this.bot.update();
    }
  }
}
