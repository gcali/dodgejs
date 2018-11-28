import Coordinates from "./geometry";

export interface Boundaries {
    min: Coordinates,
    max: Coordinates
};

export interface SpatiallyDescribed {
    pos: Coordinates,
    speed: Coordinates,
    acc: Coordinates,
    boundaries?: Boundaries,
}

export interface Movable extends SpatiallyDescribed {
    update: (updateBy: SpatiallyDescribed) => Movable
};

export interface MovableWithStartEnergy extends Movable {
    startEnergy: number;
}

export const getStartEnergy = (height: number, speed: number) => (speed * speed * 0.5) - height * Constants.Gravity;

function hasStartEnergy(object: Movable | MovableWithStartEnergy): object is MovableWithStartEnergy {
    return (<MovableWithStartEnergy>object).startEnergy !== undefined;
}

function calculateHeightFromStartEnergy(startEnergy: number, currentSpeed: number) {
    return ((startEnergy - (currentSpeed * currentSpeed * 0.5)) / Constants.Gravity) * -1;
}

function calculateSpeedFromStartEnergy(startEnergy: number, currentHeight: number) {
    return Math.sqrt((startEnergy + currentHeight * Constants.Gravity) * 2);
}

export const simulateTime = (movable: Movable, dt: number, externalBoundaries: Boundaries) => {
    let newPos = movable.pos.addDerivate(dt, movable.speed);
    let newSpeed = movable.speed.addDerivate(dt, movable.acc);

    if (hasStartEnergy(movable)) {
        let calculatedNewY = calculateHeightFromStartEnergy(movable.startEnergy, newSpeed.y);
        newPos = newPos.setY(calculatedNewY);
    }

    if (movable.boundaries) {
        let boundaries = {
            min: movable.boundaries.min.clamp(externalBoundaries.min, externalBoundaries.max),
            max: movable.boundaries.max.clamp(externalBoundaries.min, externalBoundaries.max)
        };
        let clampedPos = newPos.clamp(boundaries.min, boundaries.max);
        if (clampedPos.x != newPos.x) {
            newSpeed = newSpeed.setX(-newSpeed.x);
        }
        if (clampedPos.y != newPos.y) {
            if (hasStartEnergy(movable)) {
                newSpeed = newSpeed.setY(calculateSpeedFromStartEnergy(movable.startEnergy, clampedPos.y));
                console.log(`New: ${newSpeed.y}, newEnergy: ${getStartEnergy(clampedPos.y, newSpeed.y)}, oldEnergy: ${movable.startEnergy}`);
            }
            else {
                newSpeed = newSpeed.setY(-newSpeed.y);
            }
        }
        newPos = clampedPos;
    }
    return movable.update({ ...movable, pos: newPos, speed: newSpeed });
};

export const Constants = {
    Gravity: -0.001
};