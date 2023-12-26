import { MyBot } from "../bot";
import { State, GetSamplesState } from ".";

export class IdleState extends State {
  constructor(bot: MyBot) {
    super(bot);
  }

  update() {
    this.bot.state = new GetSamplesState(this.bot);
    this.bot.update();
  }
}
