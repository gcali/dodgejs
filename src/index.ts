import "./style/site.scss";
import Ball, { BallHandler } from "./ball";
import Coordinates from "./geometry";
import { Constants, simulateTime, Movable, getStartEnergy } from "./physics";
import { Updater } from "./drawing/updater";
import ConverterCreator from "./drawing/converter";
import { Shooter } from "./shooter";
import InputHandler from "./input-handler";

let canvas = document.createElement("canvas");

canvas.classList.add("main-scene");
canvas.width = 800;
canvas.height = 600;

let context = canvas.getContext('2d');

document.body.appendChild(canvas);

let logger = document.createElement("div");

document.body.appendChild(logger);

let boundariesCalculator = (canvas: HTMLCanvasElement) => ({
    min: new Coordinates(0, 0),
    max: new Coordinates(canvas.width, canvas.height)
});

let boundaries = boundariesCalculator(canvas);

let ballCreator = new BallHandler(4000, () => boundariesCalculator(canvas));

let shooterSize = new Coordinates(80, 80);

let shooter = new Shooter(new Coordinates((boundaries.min.x + boundaries.max.x) * 0.5, 0), shooterSize);
let converter = new ConverterCreator(canvas);

let inputHandler = new InputHandler(() => shooter);

let modelUpdates = [
    (tick: number) => {
        if (document.hidden || !document.hasFocus()) {
            inputHandler.documentHidden();
        }
        inputHandler.handleInput();
        return true;
    },
    (tick: number) => {
        ballCreator.handleTimePassage(tick);
        return true;
    },
    (tick: number) => {
        let externalBoundaries = boundariesCalculator(canvas);
        ballCreator.balls = ballCreator.balls.map(ball => <Ball>simulateTime(ball, tick, externalBoundaries));
        return true;
    },
    (tick: number) => {
        let externalBoundaries = boundariesCalculator(canvas);
        shooter = <Shooter>simulateTime(shooter, tick, externalBoundaries);
        return true;
    }
];
let graphicUpdates = [
    (context: CanvasRenderingContext2D) => {
        ballCreator.balls.forEach(ball => {
            context.beginPath();
            let viewCoordinates = converter.coordinateToView(ball.pos);
            context.arc(viewCoordinates.x, viewCoordinates.y, 8, 0, Math.PI * 2);
            context.fillStyle = "white";//"#EEC900";            //"black";//"#4f2f2f";//"white";
            context.fill();
        });

        return true;
    },
    (context: CanvasRenderingContext2D) => {
        let from = new Coordinates(shooter.pos.x - shooter.size.x / 2, shooter.pos.y);
        let to = new Coordinates(shooter.pos.x + shooter.size.x / 2, shooter.pos.y + shooter.size.y);

        let viewFrom = converter.coordinateToView(from);
        let viewTo = converter.coordinateToView(to);

        let minX = Math.min(viewFrom.x, viewTo.x);
        let minY = Math.min(viewFrom.y, viewTo.y);

        context.beginPath();
        context.rect(minX, minY, shooter.size.x, shooter.size.y);
        context.fillStyle = "white";
        context.fill();
        return true;
    }
]

let updater = new Updater(canvas);
updater.graphicUpdates = graphicUpdates;
updater.modelUpdates = modelUpdates;

updater.update();