import "./style/site.scss";
import Ball, { BallHandler } from "./ball";
import Coordinates, { Rectangle } from "./geometry";
import { Constants, simulateTime, Movable, getStartEnergy } from "./physics";
import { Updater } from "./drawing/updater";
import ConverterCreator from "./drawing/converter";
import { Shooter } from "./shooter";
import InputHandler from "./inputHandler";
import template from "./templates/index.handlebars";
import sidebarTemplate from "./templates/sidebar.handlebars";
import Drawer from "./drawing/drawer";
import { nameStorage, scoreStorage } from "./storage";

let indexHTML = template({
    mainScene: {
        width: 800,
        height: 600
    },
    sidebar: {
        scores: scoreStorage.loadScores()
    }
});

let pause: boolean = true;


let mainWrapper = document.createElement("div");
mainWrapper.innerHTML = indexHTML;
let index = mainWrapper.children[0];
document.body.appendChild(index);

let baseTimer: number;

let timer = document.getElementById("js-timer");

const shootIndicator = document.getElementById("js-shoot-delay"); 
const superIndicatorContainer = document.getElementById("js-super-indicators");
const scorePopup = document.getElementById("js-score-popup");
const startPopup = document.getElementById("js-start-popup");
const pausePopup = document.getElementById("js-pause-popup");

const superIndicators: HTMLDivElement[] = [];

const indicatorRemover = () => {
    if (superIndicators.length > 0) {
        const [toRemove] = superIndicators.splice(0, 1);
        superIndicatorContainer.removeChild(toRemove);
    }
};


let canvas = document.getElementById("js-main-scene") as HTMLCanvasElement;
let sidebarWrapper = document.getElementById("js-sidebar-wrapper");

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

let score: number | null = null;

const setupClearButton = () => {
    const clearButton = document.getElementById("js-score-clear");
    if (clearButton) {
        clearButton.onclick = () => {
            scoreStorage.clearScores();
            refreshSidebar();
        }
    }
};

setupClearButton();

const refreshSidebar = () => {
    const sidebar = sidebarTemplate({scores: scoreStorage.loadScores()});
    sidebarWrapper.innerHTML = sidebar;
    setupClearButton();
}

const init = () => {
    pause = false;
    score = null;
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
    refreshSidebar();
}

let pauseTimer: number | null = null;

let inputHandler = new InputHandler(
    () => shooter, 
    init,
    (show: boolean) => {
        if (show) {
            pauseTimer = new Date().getTime();
            pausePopup.classList.remove("hidden");
        } else {
            pausePopup.classList.add("hidden");
            if (pauseTimer !== null && baseTimer !== null) {
                baseTimer = new Date().getTime() - (pauseTimer - baseTimer);
                pauseTimer = null;
            }
        }
    }
);

const showScorePopup = (okCallback: ((name: string) => void)) => {
    const input = document.getElementById("js-name") as HTMLInputElement;
    input.value = nameStorage.loadName();
    scorePopup.classList.remove("hidden");
    input.focus();
    const handler = (e: Event) => {
        e.preventDefault();
        const name = input.value || "";
        nameStorage.saveName(name);
        okCallback(name);
        scorePopup.removeEventListener("submit", handler);
        scorePopup.classList.add("hidden");
    };
    scorePopup.addEventListener("submit", handler);
};


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
        if (!pause) {
            const seconds = Math.floor((new Date().getTime() - baseTimer) / 1000);
            score = seconds;
            timer.innerText = "" + seconds;
        }
    }
]

let updater = new Updater(canvas, context => new Drawer({ converter, context }));
updater.graphicUpdates = graphicUpdates;
updater.modelUpdates = modelUpdates;
updater.inputHandler = inputHandler;

shooter.onColliding = () => {
    pause = true;
    updater.pause();
    inputHandler.pause();
    showScorePopup(name => {
        if (score !== null) {
            scoreStorage.addScore({
                name,
                timestamp: Date.now(),
                value: score
            });
        }
        init();
        inputHandler.restore();
        updater.restore();
    });
};


const startButton = document.getElementById("js-start-button");
if (startButton) {
    startButton.focus();
}

startPopup.addEventListener("submit", (event) => {
    event.preventDefault();
    startPopup.classList.add("hidden");
    init();
    updater.update();
});

