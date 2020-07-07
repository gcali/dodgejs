import Coordinates, { Rectangle, Circle } from "./geometry";
import { Movable, Boundaries, SpatiallyDescribed, MovableWithStartEnergy, getStartEnergy, Constants } from "./physics";
import { random } from "./utils";
import { Drawable, DrawingShape } from "./drawing/drawingShapes";
import { Shooter, Shot } from "./shooter";

export interface BallParameters {
    pos: Coordinates,
    speed: Coordinates,
    acc: Coordinates,
    startEnergy?: number,
    radius: number
};

export class BallHandler {
    public balls: Ball[] = [];

    private remainder: number = 0;
    private isFirst: boolean = true;

    constructor(public interval: number, private boundariesGenerator: (() => Boundaries), public radius: number) {
        this.init();
    }

    public init(): void {
        this.balls = [];
        this.isFirst = true;
        this.remainder = this.interval * 0.5;
    }

    private throwBall(): void {
        let boundaries = this.boundariesGenerator();
        let ball = new Ball({
            pos: new Coordinates(
                random(boundaries.min.x, boundaries.max.x),
                random((boundaries.max.y + boundaries.min.y) * 0.7, boundaries.max.y - 20)
            ),
            speed: new Coordinates(random(20, 70) * (random(0, 1) * 2 - 1) * 0.01, 0),
            acc: new Coordinates(0, Constants.Gravity),
            radius: this.radius
        });
        ball.isRed = this.isFirst;
        this.isFirst = false;
        this.balls.push(ball);
    }

    public checkCollisions(shooter: Shooter): void {
        const shotsToRemove: Shot[] = [];
        const newBalls = this.balls.filter(ball => {
            const collidingShots = shooter.collidingShots(ball.collisionBall);
            collidingShots.forEach(shot => shotsToRemove.push(shot));
            return collidingShots.length === 0;
        });
        shooter.removeShots(shotsToRemove);
        this.balls = newBalls;
        if (shooter.stillPoweredFor) {
            this.balls = this.balls.filter(ball => !shooter.collidesWith(ball.collisionBall));
        } else {
            shooter.isColliding = this.balls.some(ball => shooter.collidesWith(ball.collisionBall));
        }
    }

    public handleTimePassage(interval: number): void {
        this.remainder += interval;
        while (this.remainder >= this.interval) {
            this.throwBall();
            this.remainder -= this.interval;
        }
    }

}

export default class Ball implements MovableWithStartEnergy, Drawable {
    public get shapes(): DrawingShape[] {
        return [
            new DrawingShape({
                shape: new Circle(this.pos, this.radius),
                color: "white"
            })
        ];
    }
    startEnergy: number;
    pos: Coordinates;
    speed: Coordinates;
    acc: Coordinates;
    boundaries: Boundaries = {
        min: new Coordinates(0, 0),
        max: new Coordinates(0, 0)
    };
    useExternalBoundaries: boolean = true;
    shouldBounce: boolean = true;
    radius: number;
    public isRed: boolean;

    public update(updateBy: SpatiallyDescribed): Ball {
        let newBall = new Ball({
            ...updateBy,
            startEnergy: this.startEnergy,
            radius: this.radius,
        });
        newBall.startEnergy = this.startEnergy;
        newBall.isRed = this.isRed;
        return newBall;
    }

    public get collisionBall(): Circle {
        return new Circle(this.pos, this.radius);
    }


    constructor({ pos, speed, acc, startEnergy, radius }: BallParameters) {
        this.pos = pos;
        this.speed = speed;
        this.acc = acc;
        this.radius = radius;
        if (!startEnergy) {
            this.startEnergy = getStartEnergy(this.pos.y, this.speed.y);
        }
        this.isRed = false;
    }
}