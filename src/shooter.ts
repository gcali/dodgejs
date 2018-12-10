import { Movable, SpatiallyDescribed, Boundaries, CanBreak } from "./physics";
import Coordinates, { Rectangle, Circle } from "./geometry";
import { Drawable, DrawingShape } from "./drawing/drawingShapes";
export class Shooter implements Movable, CanBreak, Drawable {
    public isColliding: boolean = false;
    public get shapes(): DrawingShape[] {
        if (this.stillPoweredFor && this.stillPoweredFor > 0) {
            let rectangle = new Rectangle(new Coordinates(this.pos.x - this.size.x / 2, 0), new Coordinates(this.size.x, this.size.y));
            return [new DrawingShape({ shape: rectangle, color: "yellow" })];
        }
        else {
            let color = this.isColliding ? "red" : "white";
            return [
                new DrawingShape({
                    shape: new Rectangle(
                        new Coordinates(this.pos.x - this.size.x / 4, this.pos.y + this.size.x * 0.25),
                        new Coordinates(this.size.x / 2, this.size.y - 0.5 * this.size.x)
                    ),
                    color: color
                }),
                new DrawingShape({
                    shape: new Circle(
                        new Coordinates(this.pos.x, this.pos.y + this.size.y * 2 / 3),
                        this.size.x * 0.25
                    ),
                    color: color
                }),
                new DrawingShape({
                    shape: new Circle(
                        new Coordinates(this.pos.x, this.pos.y + this.size.x * 0.25),
                        this.size.x * 0.25
                    ),
                    color: color
                })
            ]
        }
    }

    public stillPoweredFor?: number;
    breakingSpeed: number = 2 * 0.002
    public isBreaking: boolean = false;
    private maxSpeed: number = 2;
    private movementAcc: number = 0.002;

    get movingRight(): boolean {
        return this.speed.x > 0;
    };

    get movingLeft(): boolean {
        return this.speed.x < 0;
    }

    moveRight(): void {
        this.isBreaking = false;
        if (this.movingLeft) {
            this.speed = this.speed.setX(0);
        }
        this.acc = new Coordinates(this.movementAcc, 0);
    }
    moveLeft(): void {
        this.isBreaking = false;
        if (this.movingRight) {
            this.speed = this.speed.setX(0);
        }
        this.acc = new Coordinates(-this.movementAcc, 0);
    }
    stopMoving(): void {
        this.isBreaking = true;
    }
    public update(updateBy: SpatiallyDescribed): Movable {
        let shooter = new Shooter(updateBy.pos, this.size);
        shooter.acc = updateBy.acc;
        shooter.speed = updateBy.speed.clamp(new Coordinates(-this.maxSpeed, 0), new Coordinates(this.maxSpeed, 0));
        shooter.isColliding = this.isColliding;
        shooter.stillPoweredFor = this.stillPoweredFor;
        return shooter;
    }

    useExternalBoundaries: boolean = true;
    boundaries: Boundaries = {
        min: new Coordinates(-this.size.x / 2, 0),
        max: new Coordinates(this.size.x / 2, this.size.y)
    };
    shouldBounce: boolean = false;
    speed: Coordinates = new Coordinates(0, 0);
    acc: Coordinates = new Coordinates(0, 0);

    public get collisionRectangle(): Rectangle {
        let xSize = this.size.x / 2;
        if (!this.stillPoweredFor) {
            xSize /= 2;
        }
        return new Rectangle(new Coordinates(this.pos.x - xSize, 0), new Coordinates(2 * xSize, this.size.y));
    }

    public collidesWith(ball: Circle): boolean {
        let rectangle = this.collisionRectangle;
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

    constructor(public pos: Coordinates, public size: Coordinates) {
    }
}