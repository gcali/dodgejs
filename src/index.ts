import "./style/site.scss";
import Ball, { BallHandler } from "./ball";
import Coordinates, { Rectangle } from "./geometry";
import { Constants, simulateTime, Movable, getStartEnergy } from "./physics";
import { Updater } from "./drawing/updater";
import ConverterCreator from "./drawing/converter";
import { Shooter } from "./shooter";
import InputHandler from "./inputHandler";
import template from "./templates/index.handlebars";
import Drawer from "./drawing/drawer";

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

// let logger = document.createElement("div");
// logger.classList.add("logger");
// document.body.appendChild(logger);

// let appendLoggerLine = (function (): ((line: string) => void) {
//     let loggerLines: string[] = [];
//     function updateLogger(): void {
//         logger.innerHTML = loggerLines.join("<br/>");
//     }
//     function appendLoggerLine(line: string): void {
//         let newSize = loggerLines.push(line);
//         if (newSize > 4) {
//             loggerLines.shift();
//         }
//         updateLogger();
//     }
//     return appendLoggerLine;
// })();


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
    (tick: number) => ballCreator.handleTimePassage(tick),
    () => ballCreator.checkCollisions(shooter),
    (tick: number) => {
        let externalBoundaries = boundariesCalculator(canvas);
        ballCreator.balls = ballCreator.balls.map(ball => <Ball>simulateTime(ball, tick, externalBoundaries));
    },
    (tick: number) => {
        let externalBoundaries = boundariesCalculator(canvas);
        shooter = <Shooter>simulateTime(shooter, tick, externalBoundaries);
        if (shooter.stillPoweredFor) {
            shooter.stillPoweredFor -= tick;
            if (shooter.stillPoweredFor < 0) {
                shooter.stillPoweredFor = undefined;
            }
        }
    }
];
let graphicUpdates = [
    (drawer: Drawer) => drawer.drawShape(shooter),
    (drawer: Drawer) =>
        ballCreator.balls.forEach(ball => {
            drawer.drawShape(ball);
        })
]

let updater = new Updater(canvas, context => new Drawer({ converter, context }));
updater.graphicUpdates = graphicUpdates;
updater.modelUpdates = modelUpdates;
updater.inputHandler = inputHandler;

updater.update();