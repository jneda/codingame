import { MyBot } from "../bot";

export class State {
  bot: MyBot;
  constructor(bot: MyBot) {
    this.bot = bot;
  }

  update() {}
}
