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

class TeamManager {
  fishDetails: Map<number, FishDetail>;
  uglies: number[];
  myScore: number;
  foeScore: number;
  myScans: number[];
  foeScans: number[];
  myDrones: DroneData[];
  team: Drone[];
  foeDrones: DroneData[];
  myRadarBlips: Map<number, RadarBlip[]>;
  visibleFish: Fish[];

  constructor(fishDetails: Map<number, FishDetail>, uglies: number[]) {
    this.fishDetails = fishDetails;
    this.uglies = uglies;
    this.myScore = 0;
    this.foeScore = 0;
    this.myScans = [];
    this.foeScans = [];
    this.myDrones = [];
    this.team = [];
    this.foeDrones = [];
    this.myRadarBlips = new Map<number, RadarBlip[]>();
    this.visibleFish = [];
  }

  update() {
    this.myScore = parseInt(readline());
    this.foeScore = parseInt(readline());

    this.getScans();
    this.getDrones();

    this.getVisibleFish();
    // console.error(this.visibleFish);

    this.updateRadarBlips();
  }

  getScans() {
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

    this.myScans = myScans;
    this.foeScans = foeScans;
  }

  getDrones() {
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

    if (this.team.length === 0) {
      const leftmostDrone = myDrones
        .slice()
        .sort((a, b) => a.pos.x - b.pos.x)[0];
      for (let i = 0; i < myDrones.length; i++) {
        const { droneId, pos, dead, battery, scans } = myDrones[i];
        const droneIndex = droneId === leftmostDrone.droneId ? 0 : 1;
        const drone = new Drone(
          droneId,
          pos,
          dead,
          battery,
          scans,
          droneIndex,
          this
        );
        this.team.push(drone);
      }
    } else {
      for (const data of myDrones) {
        const { droneId, pos, dead, battery, scans } = data;
        const drone = this.team.find((drone) => drone.droneId === droneId);
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

    this.myDrones = myDrones;
    this.myRadarBlips = myRadarBlips;
    this.foeDrones = foeDrones;
  }

  getVisibleFish() {
    const visibleFish: Fish[] = [];

    const visibleFishCount = parseInt(readline());
    for (let i = 0; i < visibleFishCount; i++) {
      const [fishId, fishX, fishY, fishVx, fishVy] = readline()
        .split(" ")
        .map(Number);
      const pos = { x: fishX, y: fishY };
      const speed = { x: fishVx, y: fishVy };
      visibleFish.push({
        fishId,
        pos,
        speed,
        detail: fishDetails.get(fishId)!,
      });
    }

    this.visibleFish = visibleFish;
  }

  updateRadarBlips() {
    const myRadarBlipCount = parseInt(readline());
    for (let i = 0; i < myRadarBlipCount; i++) {
      const [_droneId, _fishId, dir] = readline().split(" ");
      const droneId = parseInt(_droneId);
      const fishId = parseInt(_fishId);
      this.myRadarBlips.get(droneId)!.push({ fishId, dir });
    }
  }
}

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
  teamManager: TeamManager;
  turnsSinceLightsOn: number;

  constructor(
    droneId: number,
    pos: Vector,
    dead: number,
    battery: number,
    scans: number[],
    i: number,
    teamManager: TeamManager
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
    this.teamManager = teamManager;
    this.turnsSinceLightsOn = 0;
  }

  update = (pos: Vector, dead: number, battery: number, scans: number[]) => {
    this.pos = pos;
    this.dead = dead;
    this.battery = battery;
    this.scans = scans;
  };

  takeAction() {
    // TO DO: make better use of the target and state

    if (this.dead) return `WAIT 0`;

    // handle light

    this.handleLight();

    // handle radar blips

    this.handleBlips();

    // avoid uglies at all costs
    // chase scanned fish if possible

    const ownVisibleFish = this.getVisibleFish();

    const previousState = this.state;

    let action: string | undefined;

    // do we see fish?
    if (ownVisibleFish.length > 0) {
      // handle uglies

      action = this.handleUglies();
      if (action) return action;

      // chase fish

      action = this.chaseFish(ownVisibleFish);
      if (action) return action;
    }

    this.state = previousState === "CHASING" ? "SCANNING" : previousState;

    // reset target

    let targetX = 0;
    let targetY = 0;

    // if we have scans, go save them

    if (this.scans.length > 0) {
      this.state = "SAVING";
    }

    // else, follow the lane path, hoping to scan fish

    if (this.state === "SCANNING") {
      const { x, y } = this.lane[this.currentTarget];
      targetX = x;
      targetY = y;

      if (magnitude(subtractV(this.pos, { x: targetX, y: targetY })) > 600) {
        return `MOVE ${targetX} ${targetY} ${this.light} TARGET ${this.currentTarget} ID: ${this.droneId} INDEX: ${this.i}`;
      } else {
        this.currentTarget++;
        if (this.currentTarget === this.lane.length) {
          this.currentTarget = 0;
        }
        return `WAIT ${this.light}`;
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

  handleUglies() {
    // do we see an ungly?
    const visibleUglies = this.getVisibleUglies();
    if (visibleUglies.length > 0) {
      // try and run away
      const closestUgly = visibleUglies[0];
      const vectorToUgly = subtractV(this.pos, closestUgly.pos);

      const uglyDirection = direction(vectorToUgly);
      const uglyDistance = magnitude(vectorToUgly);

      const oppositeV = {
        mag: 1,
        dir: uglyDirection + Math.PI, // clockwise
      };
      let oppositeP = scale(toXY(oppositeV), 600);

      let destination = addV(this.pos, oppositeP);

      let tries;

      if (destination.x < 0) {
        tries = 0;
        while (destination.x < 0) {
          destination = addV(
            this.pos,
            scale(
              normalize(
                addV(
                  toXY(oppositeV),
                  toXY({ mag: 1, dir: (Math.PI / 4) * tries + 1 })
                )
              ),
              600
            )
          );
          tries++;
        }
      }

      if (destination.x > WIDTH - 1) {
        tries = 0;
        while (destination.x > WIDTH - 1) {
          destination = addV(
            this.pos,
            scale(
              normalize(
                addV(
                  toXY(oppositeV),
                  toXY({ mag: 1, dir: (-Math.PI / 4) * tries + 1 })
                )
              ),
              600
            )
          );
          tries++;
        }
      }

      console.error({ current: this.pos, destination });
      console.error({ dist: magnitude(subtractV(this.pos, destination)) });

      if (isNaN(destination.x) || isNaN(destination.y)) {
        console.error(`${destination.x} or ${destination.y} is not a number!`);
        return `MOVE ${this.pos.x} ${Math.min(
          0,
          this.pos.y - 600
        )} 0 FLEEING BUG :(`;
      }

      return `MOVE ${Math.floor(destination.x)} ${Math.floor(
        destination.y
      )} 0 FLEEING!`;
    }
  }

  chaseFish(ownVisibleFish: Fish[]) {
    // are there fish we can chase off to deny the opponent a scan?
    const chaseableFish = this.getChaseableFish(ownVisibleFish);
    // if so, chase the closest one
    if (chaseableFish.length > 0) {
      const fish = chaseableFish[0];
      // turn off the light if not needed
      if (euclideanDistance(this.pos, fish.pos) <= SIGHT_RADIUS) this.light = 0;
      this.state = "CHASING";
      return `MOVE ${fish.pos.x} ${fish.pos.y} ${this.light} CHASING`;
    }
  }

  handleLight() {
    if (this.battery > 5 && this.pos.y > 2000 && this.turnsSinceLightsOn >= 3) {
      this.light = 1;
      this.turnsSinceLightsOn = 0;
    } else {
      this.light = 0;
      this.turnsSinceLightsOn++;
    }
  }

  handleBlips() {
    const radarBlips = teamManager.myRadarBlips.get(this.droneId)!;
    const unscannedBlips = radarBlips.filter(({ fishId }) => {
      return (
        !this.scans.includes(fishId) &&
        !this.teamManager.myScans.includes(fishId)
      );
    });
  }

  getVisibleFish() {
    const ownVisibleFish = this.teamManager.visibleFish.filter((fish) => {
      const dist = euclideanDistance(this.pos, fish.pos);
      const sightRadius =
        this.light === 1
          ? FLASH_RADIUS
          : fish.detail.type > -1
          ? SIGHT_RADIUS
          : SIGHT_RADIUS + 300;
      return dist <= sightRadius;
    });
    return ownVisibleFish.sort(
      (a, b) =>
        euclideanDistance(this.pos, a.pos) - euclideanDistance(this.pos, b.pos)
    );
  }

  getChaseableFish(ownVisibleFish: Fish[]) {
    const border = this.i === 0 ? 0 : WIDTH;

    const chaseableFish = ownVisibleFish.filter((fish) => {
      const fishDistToBorder = Math.abs(border - fish.pos.x);
      const ownDistToBorder = Math.abs(border - this.pos.x);
      return (
        fishDistToBorder < ownDistToBorder &&
        !this.teamManager.foeScans.includes(fish.fishId)
      );
    });
    return chaseableFish;
  }

  getVisibleUglies() {
    const visibleUglies = this.teamManager.visibleFish.filter(
      (fish) => fish.detail.type === -1
    );
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

// vector utils

function euclideanDistance(a: Vector, b: Vector) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function toPolar({ x, y }: Vector) {
  return {
    mag: magnitude({ x, y }),
    dir: direction({ x, y }),
  };
}

function toXY({ mag, dir }: { mag: number; dir: number }) {
  return {
    x: Math.cos(dir) * mag,
    y: Math.sin(dir) * mag,
  };
}

function direction(v: Vector) {
  return Math.atan2(v.y, v.x);
}

function magnitude({ x, y }: Vector) {
  return Math.hypot(x, y);
}

function addV(v1: Vector, v2: Vector) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

function subtractV(v1: Vector, v2: Vector) {
  return {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
  };
}

function scale(v: Vector, scalar: number) {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

function normalize(v: Vector) {
  return scale(v, 1 / magnitude(v));
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

const teamManager = new TeamManager(fishDetails, uglies);

// game loop
while (true) {
  // data updates
  teamManager.update();

  // drone actions
  for (let i = 0; i < teamManager.team.length; i++) {
    const drone = teamManager.team[i];
    // console.error({ drone });
    const action = drone.takeAction();
    console.log(action);
  }
}
