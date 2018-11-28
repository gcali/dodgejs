import { clamp } from "./utils";

export default class Coordinates {
    constructor(public x: number, public y: number) {
    }

    public clamp(min: Coordinates, max: Coordinates) {
        return new Coordinates(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y));
    }

    public times(n: number) {
        return new Coordinates(this.x * n, this.y * n);
    }

    public add(other: Coordinates) {
        return new Coordinates(this.x + other.x, this.y + other.y);
    }

    public addDerivate(dt: number, derivate: Coordinates) {
        return this.add(derivate.times(dt));
    }

    public setX(x: number) {
        return new Coordinates(x, this.y);
    }
    public setY(y: number) {
        return new Coordinates(this.x, y);
    }
}