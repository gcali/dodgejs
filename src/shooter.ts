import { Movable, SpatiallyDescribed, Boundaries, CanBreak } from "./physics";
import Coordinates from "./geometry";
export class Shooter implements Movable, CanBreak {
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
    constructor(public pos: Coordinates, public size: Coordinates) {
    }
}