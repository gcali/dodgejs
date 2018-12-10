import "./style/site.scss";
import Ball, { BallHandler } from "./ball";
import Coordinates from "./geometry";
import { Constants, simulateTime, Movable, getStartEnergy } from "./physics";
import { Updater } from "./drawing/updater";
import ConverterCreator from "./drawing/converter";
import { Shooter } from "./shooter";
import InputHandler from "./input-handler";
// import template from "./templates/sidebar.handlebars";
import template from "./templates/index.handlebars";

// let canvas = document.createElement("canvas");

// canvas.classList.add("main-scene");
// canvas.width = 800;
// canvas.height = 600;

// let context = canvas.getContext('2d');

// document.body.appendChild(canvas);

// let sidebar = document.createElement("div");
// sidebar.innerHTML = template({
//     lifes: 3
// });
// document.body.appendChild(sidebar);

let indexHTML = template({
    mainScene: {
        width: 800,
        height: 600
    },
    sidebar: {
        lifes: 3
    }
});

let mainWrapper = document.createElement("div");
mainWrapper.innerHTML = indexHTML;
let index = mainWrapper.children[0];
document.body.appendChild(index);

let canvas = document.getElementById("js-main-scene") as HTMLCanvasElement;
let sidebar = document.getElementById("js-sidebar");

let logger = document.createElement("div");
logger.classList.add("logger");
document.body.appendChild(logger);

let appendLoggerLine = (function (): ((line: string) => void) {
    let loggerLines: string[] = [];
    function updateLogger(): void {
        logger.innerHTML = loggerLines.join("<br/>");
    }
    function appendLoggerLine(line: string): void {
        let newSize = loggerLines.push(line);
        if (newSize > 4) {
            loggerLines.shift();
        }
        updateLogger();
    }
    return appendLoggerLine;
})();


let boundariesCalculator = (canvas: HTMLCanvasElement) => ({
    min: new Coordinates(0, 0),
    max: new Coordinates(canvas.width, canvas.height)
});

let boundaries = boundariesCalculator(canvas);

let ballCreator = new BallHandler(4000, () => boundariesCalculator(canvas), 8);

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
    },
    (context: CanvasRenderingContext2D) => {
        ballCreator.balls.forEach(ball => {
            context.beginPath();
            let viewCoordinates = converter.coordinateToView(ball.pos);
            context.arc(viewCoordinates.x, viewCoordinates.y, ball.radius, 0, Math.PI * 2);
            context.fillStyle = "white";//"#EEC900";            //"black";//"#4f2f2f";//"white";
            if (ball.collidesWith(shooter.collisionRectangle)) {
                context.fillStyle = "yellow";
            }
            else if (ball.isRed) {
                context.fillStyle = "red";
                appendLoggerLine(`${ball.pos.x}, ${ball.pos.y}, ${ball.radius}, ${shooter.pos.x}`);
            }
            context.fill();
        });

        return true;
    }
]

let updater = new Updater(canvas);
updater.graphicUpdates = graphicUpdates;
updater.modelUpdates = modelUpdates;
updater.inputHandler = inputHandler;

updater.update();