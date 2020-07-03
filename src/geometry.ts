import { clamp } from "./utils";
import { IsCircle } from "./drawing/drawingShapes";

export default class Coordinates {
    constructor(public x: number, public y: number) {
    }

    public clamp(min: Coordinates, max: Coordinates): Coordinates {
        return new Coordinates(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y));
    }

    public times(n: number): Coordinates {
        return new Coordinates(this.x * n, this.y * n);
    }

    public add(other: Coordinates): Coordinates {
        return new Coordinates(this.x + other.x, this.y + other.y);
    }

    public addDerivate(dt: number, derivate: Coordinates): Coordinates {
        return this.add(derivate.times(dt));
    }

    public setX(x: number): Coordinates {
        return new Coordinates(x, this.y);
    }
    public setY(y: number): Coordinates {
        return new Coordinates(this.x, y);
    }

    public distanceFromX(other: Coordinates): number {
        return Math.abs(this.x - other.x);
    }
    public distanceFromY(other: Coordinates): number {
        return Math.abs(this.y - other.y);
    }

    public squaredDistanceFrom(other: Coordinates): number {
        let dx = this.distanceFromX(other);
        let dy = this.distanceFromY(other);
        return dx * dx + dy * dy;
    }

    public toString(): string {
        return `(${this.x},${this.y})`;
    }
}

export class Rectangle {
    constructor(public origin: Coordinates, public size: Coordinates) {
    }

    public get center(): Coordinates {
        return this.origin.add(this.size.times(0.5));
    }

    public toString(): string {
        return `${this.origin.toString()}[${this.size.x}x${this.size.y}]`;
    }

    private collidesWithRectangle(other: Rectangle): boolean {
        if (this.origin.x < other.origin.x + other.size.x &&
        this.origin.x + this.size.x > other.origin.x &&
        this.origin.y < other.origin.y + other.size.y &&
        this.origin.y + this.size.y > other.origin.y) {
            return true;
        }
        return false;
    }

    public collidesWith(other: Circle | Rectangle): boolean {
        if (IsCircle(other)) {
            return this.collidesWithCircle(other);
        } else {
            return this.collidesWithRectangle(other);
        }
    }

    private collidesWithCircle(other: Circle): boolean {
        const rectangle = this;
        const ball = other;
        let rectangleCenter = rectangle.center;
        let centerDistanceX = ball.center.distanceFromX(rectangleCenter);
        let centerDistanceY = ball.center.distanceFromY(rectangleCenter);

        if (centerDistanceX > rectangle.size.x / 2 + ball.radius) {
            return false;
        }
        if (centerDistanceY > rectangle.size.y / 2 + ball.radius) {
            return false;
        }
        if (centerDistanceX <= rectangle.size.x / 2) {
            return true;
        }
        if (centerDistanceY <= rectangle.size.y / 2) {
            return true;
        }

        var dx = centerDistanceX - rectangle.size.x / 2;
        var dy = centerDistanceY - rectangle.size.y / 2;
        return (dx * dx + dy * dy <= (ball.radius * ball.radius));
    }
    
}

export class Circle {
    constructor(public center: Coordinates, public radius: number) {

    }
}