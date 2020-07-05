import { Movable, SpatiallyDescribed, Boundaries, CanBreak } from "./physics";
import Coordinates, { Rectangle, Circle } from "./geometry";
import { Drawable, DrawingShape } from "./drawing/drawingShapes";

export class Shot implements Drawable, Movable {
    public update(updateBy: SpatiallyDescribed): Movable {
        this.pos = updateBy.pos;
        return this;
    }

    constructor(x: number, height: number, private startY: number) {
        this.pos = new Coordinates(x, startY);
        this.size.y = height - startY;
    }
    shouldBounce: boolean = false;
    pos: Coordinates;
    speed: Coordinates = new Coordinates(0, 1);
    acc: Coordinates = new Coordinates(0,0);
    public get boundaries(): Boundaries {
        return {
            min: new Coordinates(-this.size.x/2, Math.max(this.pos.y - this.size.y, this.startY)),
            max: new Coordinates(this.size.x/2, this.pos.y)
        } 
    }
    useExternalBoundaries: boolean = false;
    public size: Coordinates = new Coordinates(10, 0);
    public shouldKeep(externalBoundaries: Boundaries): boolean {
        return this.pos.y - this.size.y <= externalBoundaries.max.y;
    }

    public get mainRectangle(): Rectangle {
        const rectangle = new Rectangle(
            new Coordinates(
                this.pos.x - this.size.x/2, 
                Math.max(this.pos.y - this.size.y, this.startY)
            ), new Coordinates(
                this.size.x, 
                this.pos.y - this.startY
            )
        );
        return rectangle; 
    }
    public get shapes(): DrawingShape[] {
        return [new DrawingShape({shape: this.mainRectangle, color: "white"})];
    }
}

export class Shooter implements Movable, CanBreak, Drawable {
    init() {
        this.isColliding = false;
        this.shots = [];
        this.howManyPowers = 3;
        this.waitToShoot = 0;
        this.stillPoweredFor = undefined;
        this.isBreaking = false;
    }

    public isColliding: boolean = false;
    public shots: Shot[] = [];
    indicatorRemover: () => void;
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

    public passTime(tick: number): void {
        if (this.stillPoweredFor) {
            this.stillPoweredFor -= tick;
            if (this.stillPoweredFor < 0) {
                this.stillPoweredFor = undefined;
            }
        }
        this.waitToShoot = Math.max(0, this.waitToShoot - tick);
    }

    private howManyPowers = 3;

    public activatePower(): void {
        if (!this.stillPoweredFor && this.howManyPowers > 0) {
            this.howManyPowers--;
            this.stillPoweredFor = 4000;
            if (this.indicatorRemover) {
                this.indicatorRemover();
            }
        }
    }

    private waitToShoot: number = 0;
    public stillPoweredFor?: number;
    breakingSpeed: number = 2 * 0.002
    public isBreaking: boolean = false;
    public areaHeight?: () => number;
    private maxSpeed: number = 2;
    private movementAcc: number = 0.002;

    get indicatorRatio(): number {
        return ((this.waitToShoot || 0) / this.shootDelay);
    }

    get movingRight(): boolean {
        return this.speed.x > 0;
    };

    get movingLeft(): boolean {
        return this.speed.x < 0;
    }

    shoot(): void {
        if (this.waitToShoot === 0 && this.areaHeight) {
            this.shots.push(new Shot(this.pos.x, this.areaHeight(), 0.75 * this.size.x));
            this.waitToShoot = this.shootDelay;
        }
    }

    private shootDelay = 4500;

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
        this.pos = updateBy.pos;
        this.acc = updateBy.acc;
        this.speed = updateBy.speed.clamp(new Coordinates(-this.maxSpeed, 0), new Coordinates(this.maxSpeed, 0));
        return this;
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

    public collidingShots(ball: Circle): Shot[] {
        return this.shots.filter(shot => shot.mainRectangle.collidesWith(ball));
    }

    public removeShots(toRemove: Shot[]) {
        this.shots = this.shots.filter(s => !toRemove.includes(s));
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