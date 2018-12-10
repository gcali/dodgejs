import Coordinates from "./geometry";

export interface Boundaries {
    min: Coordinates,
    max: Coordinates
};

export interface SpatiallyDescribed {
    pos: Coordinates,
    speed: Coordinates,
    acc: Coordinates,
    boundaries: Boundaries,
    useExternalBoundaries: boolean;
}

export interface Movable extends SpatiallyDescribed {
    update: (updateBy: SpatiallyDescribed) => Movable,
    shouldBounce: boolean
};

export interface CanBreak extends Movable {
    isBreaking: boolean,
    breakingSpeed: number
}

export interface MovableWithStartEnergy extends Movable {
    startEnergy: number
}

export const getStartEnergy = (height: number, speed: number) => (speed * speed * 0.5) - height * Constants.Gravity;

function hasStartEnergy(object: Movable | MovableWithStartEnergy): object is MovableWithStartEnergy {
    return (<MovableWithStartEnergy>object).startEnergy !== undefined;
}

function canBreak(object: Movable | CanBreak): object is CanBreak {
    return (<CanBreak>object).breakingSpeed !== undefined;
}

function calculateHeightFromStartEnergy(startEnergy: number, currentSpeed: number): number {
    return ((startEnergy - (currentSpeed * currentSpeed * 0.5)) / Constants.Gravity) * -1;
}

function calculateSpeedFromStartEnergy(startEnergy: number, currentHeight: number): number {
    return Math.sqrt((startEnergy + currentHeight * Constants.Gravity) * 2);
}

export const simulateTime = (movable: Movable, dt: number, externalBoundaries: Boundaries) => {
    let isMovingLeft = movable.speed.x < 0;
    let isMovingRight = movable.speed.x > 0;
    let isStill = !isMovingLeft && !isMovingRight;
    let acc = movable.acc;
    if (canBreak(movable) && movable.isBreaking) {
        if (isMovingLeft) {
            acc = acc.setX(movable.breakingSpeed);
        }
        else if (isMovingRight) {
            acc = acc.setX(-movable.breakingSpeed);
        }
        else {
            acc = acc.setX(0);
        }
    }
    let newPos = movable.pos.addDerivate(dt, movable.speed);
    let newSpeed = movable.speed.addDerivate(dt, acc);
    if (canBreak(movable)) {
        if ((isMovingLeft && newSpeed.x >= 0) || (isMovingRight && newSpeed.x <= 0)) {
            {
                movable.isBreaking = false;
                newSpeed = newSpeed.setX(0);
            }
        }
    }

    if (hasStartEnergy(movable)) {
        let calculatedNewY = calculateHeightFromStartEnergy(movable.startEnergy, newSpeed.y);
        newPos = newPos.setY(calculatedNewY);
    }

    if (movable.useExternalBoundaries) {
        let boundaries = {
            min: externalBoundaries.min.add(movable.boundaries.min.times(-1)),
            max: externalBoundaries.max.add(movable.boundaries.max.times(-1))
        };
        let clampedPos = newPos.clamp(boundaries.min, boundaries.max);
        if (clampedPos.x != newPos.x) {
            if (movable.shouldBounce) {
                newSpeed = newSpeed.setX(-newSpeed.x);
            }
            else {
                newSpeed = newSpeed.setX(0);
            }
        }
        if (clampedPos.y != newPos.y) {
            if (hasStartEnergy(movable)) {
                newSpeed = newSpeed.setY(calculateSpeedFromStartEnergy(movable.startEnergy, clampedPos.y));
                console.log(`New: ${newSpeed.y}, newEnergy: ${getStartEnergy(clampedPos.y, newSpeed.y)}, oldEnergy: ${movable.startEnergy}`);
            }
            else {
                if (movable.shouldBounce) {
                    newSpeed = newSpeed.setY(-newSpeed.y);
                }
                else {
                    newSpeed = newSpeed.setY(0);
                }
            }
        }
        newPos = clampedPos;
    }
    return movable.update({ ...movable, pos: newPos, speed: newSpeed });
};

export const Constants = {
    Gravity: -0.0009
};