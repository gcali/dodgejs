import InputHandler from "../inputHandler";
import Drawer from "./drawer";

export interface TickCallback {
    (dt: number): (boolean | void);
};

export interface GraphicCallback {
    (drawer: Drawer): (boolean | void);
}


let clear = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export class Updater {
    public modelUpdates: TickCallback[] = [];
    public graphicUpdates: GraphicCallback[] = [];

    public inputHandler?: InputHandler;

    constructor(private canvas: HTMLCanvasElement, private drawerFactory: ((context: CanvasRenderingContext2D) => Drawer)) {
    }

    public update(): void {
        let startTicks: number = undefined;
        let context = this.canvas.getContext('2d');
        let updater = () => {
            let now = new Date().getTime();
            if (!startTicks) {
                startTicks = now;
            }
            if (this.inputHandler) {
                this.inputHandler.handleInput();
            }
            if (document.hasFocus && (!this.inputHandler || !this.inputHandler.isPaused)) {
                clear(context, this.canvas);
                let dt = now - startTicks;
                if (this.inputHandler && this.inputHandler.slowDown) {
                    dt *= 0.5;
                }
                this.modelUpdates = this.modelUpdates.filter(tick => !tick(dt));
                this.graphicUpdates = this.graphicUpdates.filter(tick => !tick(this.drawerFactory(context)));
            }
            startTicks = now;
            setTimeout(updater, 16);
        }
        updater();
    }
}