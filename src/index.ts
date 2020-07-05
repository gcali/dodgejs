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

let baseTimer: number;

let timer = document.getElementById("js-timer");

const shootIndicator = document.getElementById("js-shoot-delay"); 
const superIndicatorContainer = document.getElementById("js-super-indicators");

const superIndicators: HTMLDivElement[] = [];

const indicatorRemover = () => {
    if (superIndicators.length > 0) {
        const [toRemove] = superIndicators.splice(0, 1);
        superIndicatorContainer.removeChild(toRemove);
    }
};


let canvas = document.getElementById("js-main-scene") as HTMLCanvasElement;
let sidebar = document.getElementById("js-sidebar");

let boundariesCalculator = (canvas: HTMLCanvasElement) => ({
    min: new Coordinates(0, 0),
    max: new Coordinates(canvas.width, canvas.height)
});

let boundaries = boundariesCalculator(canvas);

let ballCreator = new BallHandler(4000, () => boundariesCalculator(canvas), 8);

let shooterSize = new Coordinates(80, 80);

let shooter = new Shooter(new Coordinates((boundaries.min.x + boundaries.max.x) * 0.5, 0), shooterSize);
shooter.indicatorRemover = indicatorRemover;
shooter.areaHeight = () => {
    const boundaries = boundariesCalculator(canvas);
    return boundaries.max.y - boundaries.min.y;
};
let converter = new ConverterCreator(canvas);

const init = () => {
    baseTimer = new Date().getTime();
    shooter.init();
    ballCreator.init();
    superIndicatorContainer.innerHTML = "";
    superIndicators.length = 0;
    for (let i = 0; i < 3; i++) {
        const indicator = document.createElement("div");
        indicator.classList.add("super-indicator");
        superIndicators.push(indicator);
        superIndicatorContainer.appendChild(indicator);
    }
}

let inputHandler = new InputHandler(() => shooter, init);

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
        shooter.passTime(tick);
    },
    (tick: number) => {
        let externalBoundaries = boundariesCalculator(canvas);
        shooter.shots.forEach(shot => simulateTime(shot, tick, externalBoundaries));
        shooter.shots = shooter.shots.filter(shot => shot.shouldKeep(externalBoundaries));
    }
];
let graphicUpdates = [
    (drawer: Drawer) => drawer.drawShape(shooter),
    (drawer: Drawer) =>
        ballCreator.balls.forEach(ball => {
            drawer.drawShape(ball);
        }),
    (drawer: Drawer) => shooter.shots.forEach(shot => drawer.drawShape(shot)),
    () => {
        const width = shooter.indicatorRatio * 100 + "px";
        shootIndicator.style.width = width; 
    },
    () => {
        const seconds = Math.floor((new Date().getTime() - baseTimer) / 1000);
        timer.innerText = "" + seconds;
    }
]

let updater = new Updater(canvas, context => new Drawer({ converter, context }));
updater.graphicUpdates = graphicUpdates;
updater.modelUpdates = modelUpdates;
updater.inputHandler = inputHandler;

init();

updater.update();