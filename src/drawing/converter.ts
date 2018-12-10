import Coordinates from "../geometry";

export default class ConverterCreator {
    constructor(private canvas: HTMLCanvasElement) {
    }

    public coordinateToView(worldCoordinates: Coordinates): Coordinates {
        return worldCoordinates.setY(this.canvas.height - worldCoordinates.y);
    }

    public coordinateToWorld(viewCoordinates: Coordinates): Coordinates {
        return viewCoordinates.setY(viewCoordinates.y - this.canvas.height);
    }

    public sizeToView(worldSize: Coordinates): Coordinates {
        return worldSize;
    }

    public sizeToWorld(viewSize: Coordinates): Coordinates {
        return viewSize;
    }

}