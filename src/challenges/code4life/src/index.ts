import { Bot, MyBot } from "./bot";
import {
  getAvailableMolecules,
  getBotData,
  getProjects,
  getSamples,
} from "./parseUtils";

// initialization
const projects = getProjects();

// console.error(projects);

const myBot = new MyBot();
const otherBot = new Bot();

// game loop
let done = false;
while (!done) {
  const myBotInputs = getBotData();

  const otherBotInputs = getBotData();

  const availableMolecules = getAvailableMolecules();
  // console.error(availableMolecules);

  const samples = getSamples();
  // console.error(samples);

  const myBotSamples = samples.filter((sample) => sample.carriedBy === 0);
  const otherBotSamples = samples.filter((sample) => sample.carriedBy === 1);

  myBot.getInputs({
    ...myBotInputs,
    samples: myBotSamples,
    availableMolecules,
  });
  // console.error(myBot);

  otherBot.getInputs({ ...otherBotInputs, samples: otherBotSamples });
  // console.error(otherBot);

  myBot.update();
  console.error(myBot.state);
}
