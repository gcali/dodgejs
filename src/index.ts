import "./style/site.scss";
import Ball from "./ball";
import Coordinates from "./geometry";
import { Constants, simulateTime, Movable, getStartEnergy } from "./physics";
import { createUpdater } from "./drawing/updater";
import ConverterCreator from "./drawing/converter";

let canvas = document.createElement("canvas");

canvas.classList.add("main-scene");
canvas.width = 900;
canvas.height = 300;

let context = canvas.getContext('2d');

document.body.appendChild(canvas);

let logger = document.createElement("div");

document.body.appendChild(logger);

let ball: Movable = new Ball({
    pos: new Coordinates(100, 200),
    speed: new Coordinates(0.5, 0),
    acc: new Coordinates(0, Constants.Gravity),
    boundaries: {
        min: new Coordinates(0, 0),
        max: new Coordinates(900, 300)
    }
});

let converter = new ConverterCreator(canvas);
let updater = createUpdater(canvas, [(tick, context) => {
    let externalBoundaries = {
        min: new Coordinates(0, 0),
        max: new Coordinates(canvas.width, canvas.height)
    };
    ball = simulateTime(ball, tick, externalBoundaries);

    logger.innerHTML = `Energy: ${getStartEnergy(ball.pos.y, ball.speed.y)}`;

    context.beginPath();
    let viewCoordinates = converter.coordinateToView(ball.pos);
    context.arc(viewCoordinates.x, viewCoordinates.y, 10, 0, Math.PI * 2);
    context.stroke();

    return true;
}]);

updater();