import { Movable, SpatiallyDescribed, Boundaries } from "./physics";
import Coordinates from "./geometry";
export class Shooter implements Movable {
    public update(updateBy: SpatiallyDescribed): Movable {
        return new Shooter(updateBy.pos, this.size);
    }
    boundaries?: Boundaries;
    speed: Coordinates = new Coordinates(0, 0);
    acc: Coordinates = new Coordinates(0, 0);
    constructor(public pos: Coordinates, public size: Coordinates) {
    }
}