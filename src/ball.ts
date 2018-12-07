import Coordinates from "./geometry";
import { Movable, Boundaries, SpatiallyDescribed, MovableWithStartEnergy, getStartEnergy, Constants } from "./physics";
import { random } from "./utils";

export interface BallParameters {
    pos: Coordinates,
    speed: Coordinates,
    acc: Coordinates,
    startEnergy?: number,
};

export class BallHandler {
    public balls: Ball[] = [];

    private remainder: number = 0;

    constructor(public interval: number, private boundariesGenerator: (() => Boundaries)) {
        this.remainder = interval * 0.5;
    }

    private throwBall() {
        let boundaries = this.boundariesGenerator();
        this.balls.push(new Ball({
            pos: new Coordinates(
                random(boundaries.min.x, boundaries.max.x),
                random((boundaries.max.y + boundaries.min.y) * 0.7, boundaries.max.y - 20)
            ),
            speed: new Coordinates(random(20, 50) * (random(0, 1) * 2 - 1) * 0.01, 0),
            acc: new Coordinates(0, Constants.Gravity),
        }));
    }

    public handleTimePassage(interval: number) {
        if (document.hasFocus() && !document.hidden) {
            this.remainder += interval;
            while (this.remainder >= this.interval) {
                this.throwBall();
                this.remainder -= this.interval;
            }
        }
    }

}

export default class Ball implements MovableWithStartEnergy {
    startEnergy: number;
    pos: Coordinates;
    speed: Coordinates;
    acc: Coordinates;
    boundaries: Boundaries = {
        min: new Coordinates(0, 0),
        max: new Coordinates(0, 0)
    };
    useExternalBoundaries = true;
    shouldBounce = true;

    public update(updateBy: SpatiallyDescribed): Ball {
        let newBall = new Ball({
            ...updateBy,
            startEnergy: this.startEnergy,
        });
        newBall.startEnergy = this.startEnergy;
        return newBall;
    }

    constructor({ pos, speed, acc, startEnergy }: BallParameters) {
        this.pos = pos;
        this.speed = speed;
        this.acc = acc;
        if (!startEnergy) {
            this.startEnergy = getStartEnergy(this.pos.y, this.speed.y);
        }
    }
}