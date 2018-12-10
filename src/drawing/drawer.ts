import ConverterCreator from "./converter";
import { Drawable, IsCircle, DrawingShape, GeometricDrawingShape } from "./drawingShapes";

interface DrawerInterface {
    converter: ConverterCreator,
    context: CanvasRenderingContext2D
}
export default class Drawer {
    private converter: ConverterCreator;
    private context: CanvasRenderingContext2D;
    constructor({ converter, context }: DrawerInterface) {
        this.converter = converter;
        this.context = context;
    }

    public drawShape(shape: Drawable): void {
        Array.prototype.forEach.call(shape.shapes, (atomShape: DrawingShape) => {
            this.context.beginPath();
            if (IsCircle(atomShape.shape)) {
                let viewCoordinates = this.converter.coordinateToView(atomShape.shape.center);
                this.context.arc(viewCoordinates.x, viewCoordinates.y, atomShape.shape.radius, 0, Math.PI * 2);
                this.context.fillStyle = atomShape.color;
            }
            else {
                let viewCoordinates = this.converter.coordinateToView(atomShape.shape.origin);
                console.log(viewCoordinates);
                console.log(atomShape.shape.size);
                this.context.rect(viewCoordinates.x, viewCoordinates.y, atomShape.shape.size.x, -atomShape.shape.size.y);
                this.context.fillStyle = atomShape.color;
            }
            this.context.fill();
        });
    }
}