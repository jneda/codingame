// types

interface Vector {
  x: number;
  y: number;
}

interface FishDetail {
  color: number;
  type: number;
}

interface Fish {
  fishId: number;
  pos: Vector;
  speed: Vector;
  detail: FishDetail;
}

interface DroneData {
  droneId: number;
  pos: Vector;
  dead: number;
  battery: number;
  scans: number[];
}

interface RadarBlip {
  fishId: number;
  dir: string;
}

type State = "SCANNING" | "SAVING" | "CHASING";

// classes

class Drone implements DroneData {
  droneId: number;
  pos: Vector;
  dead: number;
  battery: number;
  scans: number[];
  lane: Vector[];
  state: State;
  currentTarget: number;
  light: number;
  i: number;

  constructor(
    droneId: number,
    pos: Vector,
    dead: number,
    battery: number,
    scans: number[],
    i: number
  ) {
    this.droneId = droneId;
    this.pos = pos;
    this.dead = dead;
    this.battery = battery;
    this.scans = scans;
    this.lane = makeLane(i);
    this.state = "SCANNING";
    this.currentTarget = 0;
    this.light = 0;
    this.i = i;
  }

  update = (pos: Vector, dead: number, battery: number, scans: number[]) => {
    this.pos = pos;
    this.dead = dead;
    this.battery = battery;
    this.scans = scans;
  };

  takeAction(
    visibleFish: Fish[],
    myScans: number[],
    foeScans: number[],
    radarBlips: RadarBlip[]
  ) {
    // TO DO: make better use of the target and state

    console.error(JSON.stringify(this, null, 1));

    const unscannedBlips = radarBlips.filter(({ fishId }) => {
      return !this.scans.includes(fishId) && !myScans.includes(fishId);
    });
    console.error(JSON.stringify(unscannedBlips, null, 1));

    // avoid uglies at all costs
    // chase scanned fish if possible

    const ownVisibleFish = this.getVisibleFish(visibleFish);

    const previousState = this.state;

    // do we see fish?
    if (ownVisibleFish.length > 0) {
      // do we see an ungly?
      const visibleUglies = this.getVisibleUglies(visibleFish);
      if (visibleUglies.length > 0) {
        // better safe than sorry: go save scans if we have any
        if (this.scans.length > 0) {
          this.state === "SAVING";
          return `MOVE ${this.pos.x} 0 0 FLEEING!`;
        }
        // else, run away
        const closestUgly = visibleUglies[0];
        const vectorToUgly = {
          x: this.pos.x - closestUgly.pos.x,
          y: this.pos.y - closestUgly.pos.y,
        };
        const oppositeUnitVector = {
          x: (-1 / vectorToUgly.x) * vectorToUgly.x,
          y: (-1 / vectorToUgly.y) * vectorToUgly.y,
        };
        const destination = {
          x: Math.floor(oppositeUnitVector.x * 600),
          y: Math.floor(oppositeUnitVector.y * 600),
        };
        if (isNaN(destination.x) || isNaN(destination.y)) {
          console.error(
            `${destination.x} or ${destination.y} is not a number!`
          );
          return `MOVE ${this.pos.x} ${Math.min(0, this.pos.y - 600)} 0 FLEEING BUG :(`;
        }
        return `MOVE ${this.pos.x + destination.x} ${
          this.pos.y + destination.y
        } 0 FLEEING!`;
      }

      // are there fish we can chase off to deny the opponent a scan?
      const chaseableFish = this.getChaseableFish(ownVisibleFish, foeScans);
      // if so, chase the closest one
      if (chaseableFish.length > 0) {
        const fish = chaseableFish[0];
        // turn off the light if not needed
        if (euclideanDistance(this.pos, fish.pos) <= SIGHT_RADIUS)
          this.light = 0;
        this.state = "CHASING";
        return `MOVE ${fish.pos.x} ${fish.pos.y} ${this.light} CHASING`;
      }
    }

    this.state = previousState === "CHASING" ? "SCANNING" : previousState;

    // reset target and light

    let targetX = 0;
    let targetY = 0;
    this.light = 0;
    if (this.battery > 5) {
      this.light = 1;
    }

    // if we have scans, go save them

    if (this.scans.length > 0) {
      this.state = "SAVING";
    }

    // else, follow the lane path, hoping to scan fish

    if (this.state === "SCANNING") {
      const { x, y } = this.lane[this.currentTarget];
      targetX = x;
      targetY = y;

      if (this.pos.x !== targetX || this.pos.y !== targetY) {
        return `MOVE ${targetX} ${targetY} ${this.light} TARGET ${this.currentTarget}`;
      } else {
        this.currentTarget++;
        if (this.currentTarget === this.lane.length) {
          this.currentTarget = 0;
        }
        return "WAIT 1";
      }
    }

    // to save samples, go to the surface

    if (this.state === "SAVING") {
      targetX = this.pos.x;
      targetY = SURFACE - SINK_DIST;

      if (this.pos.y > SURFACE - SINK_DIST) {
        return `MOVE ${targetX} ${targetY} ${this.light}`;
      } else {
        this.state = "SCANNING";
        return `MOVE ${this.pos.x} ${this.pos.y + 600} 0`;
      }
    }
  }

  getVisibleFish(visibleFish: Fish[]) {
    const ownVisibleFish = visibleFish.filter((fish) => {
      const dist = euclideanDistance(this.pos, fish.pos);
      const sightRadius = this.light === 1 ? FLASH_RADIUS : SIGHT_RADIUS;
      return dist <= sightRadius;
    });
    return ownVisibleFish.sort(
      (a, b) =>
        euclideanDistance(this.pos, a.pos) - euclideanDistance(this.pos, b.pos)
    );
  }

  getChaseableFish(ownVisibleFish: Fish[], foeScans: number[]) {
    const border = this.i === 0 ? 0 : WIDTH;

    const chaseableFish = ownVisibleFish.filter((fish) => {
      const fishDistToBorder = Math.abs(border - fish.pos.x);
      const ownDistToBorder = Math.abs(border - this.pos.x);
      return (
        fishDistToBorder < ownDistToBorder && !foeScans.includes(fish.fishId)
      );
    });
    return chaseableFish;
  }

  getVisibleUglies(visibleFish: Fish[]) {
    const visibleUglies = visibleFish.filter((fish) => fish.detail.type === -1);
    return visibleUglies.sort(
      (a, b) =>
        euclideanDistance(this.pos, a.pos) - euclideanDistance(this.pos, b.pos)
    );
  }
}

// utils

const readline = () => "";

function getFishDetails() {
  const fishDetails = new Map<number, FishDetail>();

  const fishCount = parseInt(readline());
  for (let i = 0; i < fishCount; i++) {
    const [fishId, color, type] = readline().split(" ").map(Number);
    fishDetails.set(fishId, { color, type });
  }

  return fishDetails;
}

function getScans() {
  const myScans: number[] = [];
  const foeScans: number[] = [];

  const myScanCount = parseInt(readline());
  for (let i = 0; i < myScanCount; i++) {
    const fishId = parseInt(readline());
    myScans.push(fishId);
  }

  const foeScanCount = parseInt(readline());
  for (let i = 0; i < foeScanCount; i++) {
    const fishId = parseInt(readline());
    foeScans.push(fishId);
  }

  return { myScans, foeScans };
}

function getDrones(team: Drone[]) {
  const droneById = new Map<number, DroneData>();
  const myDrones: DroneData[] = [];
  const foeDrones: DroneData[] = [];
  const myRadarBlips = new Map<number, RadarBlip[]>();

  const myDroneCount = parseInt(readline());
  for (let i = 0; i < myDroneCount; i++) {
    const [droneId, droneX, droneY, dead, battery] = readline()
      .split(" ")
      .map(Number);
    const pos = { x: droneX, y: droneY };
    const drone = { droneId, pos, dead, battery, scans: [] };
    droneById.set(droneId, drone);
    myDrones.push(drone);
    myRadarBlips.set(droneId, []);
  }

  if (team.length === 0) {
    for (let i = 0; i < myDrones.length; i++) {
      const { droneId, pos, dead, battery, scans } = myDrones[i];
      const drone = new Drone(droneId, pos, dead, battery, scans, i);
      team.push(drone);
    }
  } else {
    for (const data of myDrones) {
      const { droneId, pos, dead, battery, scans } = data;
      const drone = team.find((drone) => drone.droneId === droneId);
      drone?.update(pos, dead, battery, scans);
    }
  }

  const foeDroneCount = parseInt(readline());
  for (let i = 0; i < foeDroneCount; i++) {
    const [droneId, droneX, droneY, dead, battery] = readline()
      .split(" ")
      .map(Number);
    const pos = { x: droneX, y: droneY };
    const drone = { droneId, pos, dead, battery, scans: [] };
    droneById.set(droneId, drone);
    foeDrones.push(drone);
  }

  const droneScanCount = parseInt(readline());
  for (let i = 0; i < droneScanCount; i++) {
    const [droneId, fishId] = readline().split(" ").map(Number);
    droneById.get(droneId)!.scans.push(fishId);
  }

  return { myDrones, myRadarBlips, foeDrones };
}

function getVisibleFish() {
  const visibleFish: Fish[] = [];

  const visibleFishCount = parseInt(readline());
  for (let i = 0; i < visibleFishCount; i++) {
    const [fishId, fishX, fishY, fishVx, fishVy] = readline()
      .split(" ")
      .map(Number);
    const pos = { x: fishX, y: fishY };
    const speed = { x: fishVx, y: fishVy };
    visibleFish.push({ fishId, pos, speed, detail: fishDetails.get(fishId)! });
  }

  return visibleFish;
}

function updateRadarBlips(myRadarBlips: Map<number, RadarBlip[]>) {
  const myRadarBlipCount = parseInt(readline());
  for (let i = 0; i < myRadarBlipCount; i++) {
    const [_droneId, _fishId, dir] = readline().split(" ");
    const droneId = parseInt(_droneId);
    const fishId = parseInt(_fishId);
    myRadarBlips.get(droneId)!.push({ fishId, dir });
  }
}

function makeLane(index: number) {
  const lane: Vector[] = [];

  const left = index === 0 ? 0 + SIGHT_RADIUS : HALF_WIDTH + SIGHT_RADIUS;
  const right = index === 0 ? HALF_WIDTH - SIGHT_RADIUS : WIDTH - SIGHT_RADIUS;
  const top = BIOME1_UPPER + SIGHT_RADIUS;
  const bottom = HEIGHT - SIGHT_RADIUS;

  lane.push(
    index === 0 ? { x: left, y: top } : { x: right, y: top },
    index === 0 ? { x: left, y: bottom } : { x: right, y: bottom },
    index === 0 ? { x: right, y: bottom } : { x: left, y: bottom },
    index === 0 ? { x: right, y: top } : { x: left, y: top }
  );

  return lane;
}

function euclideanDistance(a: Vector, b: Vector) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// constants

const WIDTH = 10 * 1000;
const HALF_WIDTH = WIDTH / 2;
const HEIGHT = 10 * 1000;

const SURFACE = 500;
const SINK_DIST = 300;

const BIOME1_UPPER = 2500;
const BIOME2_UPPER = 5000;
const BIOME3_UPPER = 7500;

const SIGHT_RADIUS = 800;
const FLASH_RADIUS = 2000;

// initial data

const fishDetails = getFishDetails();

const uglies: number[] = [];
fishDetails.forEach((fishDetail, fishId) => {
  if (fishDetail.type === -1) uglies.push(fishId);
});

const team: Drone[] = [];

// game loop
while (true) {
  // data updates
  const myScore = parseInt(readline());
  const foeScore = parseInt(readline());

  const { myScans, foeScans } = getScans();
  const { myDrones, myRadarBlips, foeDrones } = getDrones(team);

  const visibleFish = getVisibleFish();

  updateRadarBlips(myRadarBlips);

  // drone actions
  for (let i = 0; i < team.length; i++) {
    const drone = team[i];
    const action = drone.takeAction(
      visibleFish,
      myScans,
      foeScans,
      myRadarBlips.get(drone.droneId)!
    );
    console.log(action);
  }
}
