import Coordinates from "./geometry";
import { Movable, Constants, Boundaries, SpatiallyDescribed, MovableWithStartEnergy, getStartEnergy } from "./physics";

export interface BallParameters {
    pos: Coordinates,
    speed: Coordinates,
    acc: Coordinates,
    startEnergy?: number,
    boundaries: Boundaries
};

export default class Ball implements MovableWithStartEnergy {
    startEnergy: number;
    pos: Coordinates;
    speed: Coordinates;
    acc: Coordinates;
    boundaries: Boundaries;

    public update(updateBy: SpatiallyDescribed): Movable {
        let newBall = new Ball({
            ...updateBy,
            startEnergy: this.startEnergy,
            boundaries: updateBy.boundaries ? updateBy.boundaries : this.boundaries
        });
        newBall.startEnergy = this.startEnergy;
        return newBall;
    }

    constructor({ pos, speed, acc, startEnergy, boundaries }: BallParameters) {
        this.pos = pos;
        this.speed = speed;
        this.acc = acc;
        this.boundaries = boundaries;
        if (!startEnergy) {
            this.startEnergy = getStartEnergy(this.pos.y, this.speed.y);
        }
    }
}