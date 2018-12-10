import { Rectangle, Circle } from "../geometry";

export type GeometricDrawingShape = Circle | Rectangle;

export function IsCircle(shape: GeometricDrawingShape): shape is Circle {
    return (<Circle>shape).radius !== undefined;
}

interface DrawingShapeParams {
    shape: GeometricDrawingShape,
    color: string
}
export class DrawingShape {
    public shape: GeometricDrawingShape;
    public color: string;
    constructor({ shape, color }: DrawingShapeParams) {
        this.shape = shape;
        this.color = color;
    }
}

export interface Drawable {
    shapes: DrawingShape[];
}