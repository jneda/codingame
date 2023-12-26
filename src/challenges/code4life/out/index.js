"use strict";
(() => {
  // src/states/State.ts
  var State = class {
    constructor(bot) {
      this.bot = bot;
    }
    update() {
    }
  };

  // src/states/IdleState.ts
  var IdleState = class extends State {
    constructor(bot) {
      super(bot);
    }
    update() {
      this.bot.state = new GetSamplesState(this.bot);
      this.bot.update();
    }
  };

  // src/states/GetSamplesState.ts
  var GetSamplesState = class extends State {
    constructor(bot) {
      super(bot);
    }
    update() {
      if (this.bot.target !== "SAMPLES") {
        this.bot.target = "SAMPLES";
        return this.bot.goto();
      }
      if (this.bot.target === "SAMPLES" && this.bot.eta > 0) {
        return this.bot.noOp();
      }
      if (this.bot.samples.length < 3) {
        const botExpertise = this.bot.getTotalExpertise();
        const targetRank = botExpertise >= 10 ? 3 : botExpertise >= 5 ? 2 : 1;
        return this.bot.fetchSample(targetRank);
      } else {
        this.bot.state = new GetDiagnosesState(this.bot);
        this.bot.update();
      }
    }
  };

  // src/states/GetDiagnosesState.ts
  var GetDiagnosesState = class extends State {
    constructor(bot) {
      super(bot);
    }
    update() {
      if (this.bot.target !== "DIAGNOSIS") {
        this.bot.target = "DIAGNOSIS";
        return this.bot.goto();
      }
      if (this.bot.target === "DIAGNOSIS" && this.bot.eta > 0) {
        return this.bot.noOp();
      }
      if (this.bot.getDiagnoses().length < 3) {
        const sample = this.bot.getUndiagnosed()[0];
        return this.bot.fetchDiagnosis(sample.id);
      } else {
        this.bot.state = new GetMoleculesState(this.bot);
        this.bot.update();
      }
    }
  };

  // src/states/GetMoleculesState.ts
  var GetMoleculesState = class extends State {
    constructor(bot) {
      super(bot);
    }
    update() {
      if (this.bot.target !== "MOLECULES") {
        this.bot.target = "MOLECULES";
        return this.bot.goto();
      }
      if (this.bot.target === "MOLECULES" && this.bot.eta > 0) {
        return this.bot.noOp();
      }
      const storageAvailable = 10 - this.bot.getStorageUsage();
      console.error({ storageAvailable });
      const manageableRecipes = this.bot.getDiagnoses().filter(
        (diagnosis) => diagnosis.getStorageRequirement(this.bot) < storageAvailable && Object.values(diagnosis.getActualCosts(this.bot)).reduce(
          (a, b) => a + b,
          0
        ) > 0
      ).sort(
        (a, b) => a.getActualCostsTotal(this.bot) - b.getActualCostsTotal(this.bot)
      );
      const neededMoleculesCount = this.bot.samples.map(
        (sample) => Object.values(sample.getActualCosts(this.bot)).reduce(
          (a, b) => a + b,
          0
        )
      ).reduce((a, b) => a + b);
      if (manageableRecipes.length === 0 || neededMoleculesCount === 0 || storageAvailable === 0) {
        this.bot.state = new MakeMedicineState(this.bot);
        return this.bot.update();
      }
      let done2 = false;
      while (!done2) {
        const targetRecipe = manageableRecipes.shift();
        if (targetRecipe === void 0) {
          this.bot.state = new MakeMedicineState(this.bot);
          return this.bot.update();
        }
        console.error({
          targetRecipe,
          actualCosts: targetRecipe.getActualCosts(this.bot)
        });
        const relevantAvailableMolecules = Object.entries(
          this.bot.availableMolecules
        ).filter(([mol, qty]) => qty > 0).filter(
          ([mol, _qty]) => Object.keys(targetRecipe.getActualCosts(this.bot)).includes(mol)
        ).map(([mol, _qty]) => mol);
        if (relevantAvailableMolecules.length > 0) {
          return this.bot.getMolecule(
            relevantAvailableMolecules[0],
            targetRecipe.id
          );
        }
      }
    }
  };

  // src/states/MakeMedicineState.ts
  var MakeMedicineState = class extends State {
    constructor(bot) {
      super(bot);
    }
    update() {
      if (this.bot.target !== "LABORATORY") {
        this.bot.target = "LABORATORY";
        return this.bot.goto();
      }
      if (this.bot.target === "LABORATORY" && this.bot.eta > 0) {
        return this.bot.noOp();
      }
      const doableRecipes = this.bot.samples.filter((sample) => sample.canBeMade(this.bot)).sort((a, b) => b.rank - a.rank);
      if (doableRecipes.length > 0) {
        return this.bot.makeMedicine(doableRecipes[0].id);
      }
      this.bot.state = new GetSamplesState(this.bot);
      this.bot.update();
    }
  };

  // src/bot.ts
  var Bot = class {
    constructor() {
      this.target = null;
      this.eta = 0;
      this.score = 0;
      this.storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      this.expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      this.samples = [];
      this.reserved = {};
    }
    getInputs({ target, eta, score, storage, expertise, samples }) {
      this.target = target;
      this.eta = eta;
      this.score = score;
      this.storage = { ...storage };
      this.expertise = { ...expertise };
      this.samples = [...samples];
    }
  };
  var MyBot = class extends Bot {
    constructor() {
      super();
      this.state = new IdleState(this);
      this.availableMolecules = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    }
    getInputs(myBotInput) {
      const { availableMolecules, ...botInput } = myBotInput;
      super.getInputs(botInput);
      this.availableMolecules = { ...availableMolecules };
    }
    update() {
      this.state.update();
    }
    goto() {
      console.log(`GOTO ${this.target}`);
    }
    getDiagnoses() {
      return this.samples.filter((sample) => sample.isDiagnosed());
    }
    getUndiagnosed() {
      return this.samples.filter((sample) => !sample.isDiagnosed());
    }
    getStorageUsage() {
      let storageUsage = 0;
      for (const [_molecule, quantity] of Object.entries(this.storage)) {
        storageUsage += quantity;
      }
      return storageUsage;
    }
    getTotalExpertise() {
      return Object.values(this.expertise).reduce((a, b) => a + b);
    }
    reserveMolecule(type, sampleId) {
      const reservedForSample = this.reserved[sampleId];
      if (reservedForSample === void 0) {
        this.reserved[sampleId] = {};
      }
      const reserved = this.reserved[sampleId][type];
      if (reserved === void 0) {
        this.reserved[sampleId][type] = 0;
      }
      this.reserved[sampleId][type]++;
      console.error({
        reserved: Object.keys(this.reserved).map(
          (id) => `${id}: ${JSON.stringify(this.reserved[Number(id)])}`
        )
      });
    }
    getReservedMoleculeCountByType(type) {
      let count = 0;
      for (const id of Object.keys(this.reserved)) {
        const countForThisId = this.reserved[Number(id)][type];
        if (countForThisId) {
          count += countForThisId;
        }
      }
      return count;
    }
    fetchSample(rank) {
      console.log(`CONNECT ${rank}`);
    }
    fetchDiagnosis(id) {
      console.log(`CONNECT ${id}`);
    }
    makeMedicine(id) {
      console.log(`CONNECT ${id}`);
      this.reserved[id] = {};
    }
    wait() {
      console.log("WAIT");
    }
    getMolecule(type, sampleId) {
      console.log(`CONNECT ${type}`);
      this.reserveMolecule(type, sampleId);
    }
    noOp() {
      console.log("");
    }
  };

  // src/project.ts
  var Project = class {
    constructor(cost) {
      this.cost = { ...cost };
    }
  };

  // src/sample.ts
  var Sample = class {
    constructor(id, carriedBy, rank, gain, health, costs) {
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
    getReservedQuantity(bot, molecule) {
      let reservedForRecipe = 0;
      const allReservedForRecipe = bot.reserved[this.id];
      if (allReservedForRecipe !== void 0) {
        const actualValue = bot.reserved[this.id][molecule];
        reservedForRecipe = actualValue !== void 0 ? actualValue : 0;
      }
      return reservedForRecipe;
    }
    getStorageRequirement(bot) {
      let storageRequirement = 0;
      for (const [molecule, quantity] of Object.entries(this.costs)) {
        let reservedForRecipe = this.getReservedQuantity(
          bot,
          molecule
        );
        storageRequirement += quantity - bot.expertise[molecule] - (bot.storage[molecule] - reservedForRecipe);
      }
      return storageRequirement;
    }
    canBeMade(bot) {
      for (const [molecule, quantity] of Object.entries(this.costs)) {
        if (bot.expertise[molecule] + bot.storage[molecule] < quantity)
          return false;
      }
      return true;
    }
    getActualCosts(bot) {
      const actualCosts = {};
      for (const [mol, qty] of Object.entries(this.costs)) {
        const actualCost = qty - this.getReservedQuantity(bot, mol) - bot.expertise[mol];
        if (actualCost > 0) {
          actualCosts[mol] = actualCost;
        }
      }
      return actualCosts;
    }
    getActualCostsTotal(bot) {
      return Object.values(this.getActualCosts(bot)).reduce((a, b) => a + b, 0);
    }
  };

  // src/types.ts
  function isModule(module) {
    return module === "START_POS" || module === "SAMPLES" || module === "DIAGNOSIS" || module === "MOLECULES" || module === "LABORATORY";
  }

  // src/parseUtils.ts
  var readline = () => "";
  function getProjects() {
    const projects2 = [];
    const projectCount = Number(readline());
    for (let i = 0; i < projectCount; i++) {
      const [A, B, C, D, E] = readline().split(" ").map(Number);
      const project = new Project({ A, B, C, D, E });
      projects2.push(project);
    }
    return projects2;
  }
  function getBotData() {
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
      expertiseE
    ] = rest.map(Number);
    const storage = {
      A: storageA,
      B: storageB,
      C: storageC,
      D: storageD,
      E: storageE
    };
    const expertise = {
      A: expertiseA,
      B: expertiseB,
      C: expertiseC,
      D: expertiseD,
      E: expertiseE
    };
    return { target, eta, score, storage, expertise };
  }
  function getSamples() {
    const samples = [];
    const sampleCount = Number(readline());
    for (let i = 0; i < sampleCount; i++) {
      const [id, carriedBy, rank, gain, health, A, B, C, D, E] = readline().split(" ");
      const costs = {
        A: Number(A),
        B: Number(B),
        C: Number(C),
        D: Number(D),
        E: Number(E)
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
  function getAvailableMolecules() {
    const [A, B, C, D, E] = readline().split(" ").map(Number);
    return { A, B, C, D, E };
  }

  // src/index.ts
  var projects = getProjects();
  var myBot = new MyBot();
  var otherBot = new Bot();
  var done = false;
  while (!done) {
    const myBotInputs = getBotData();
    const otherBotInputs = getBotData();
    const availableMolecules = getAvailableMolecules();
    const samples = getSamples();
    const myBotSamples = samples.filter((sample) => sample.carriedBy === 0);
    const otherBotSamples = samples.filter((sample) => sample.carriedBy === 1);
    myBot.getInputs({
      ...myBotInputs,
      samples: myBotSamples,
      availableMolecules
    });
    otherBot.getInputs({ ...otherBotInputs, samples: otherBotSamples });
    myBot.update();
    console.error(myBot.state);
  }
})();
