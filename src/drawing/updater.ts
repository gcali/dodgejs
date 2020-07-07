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

    public restore() {
        this.pauseUpdates = false;
        this.lastTicks = undefined;
    }
    public pause() {
        if (this.timeoutHandlers !== null) {
            window.clearTimeout(this.timeoutHandlers.id);
            this.timeoutHandlers.callback();
        }
        this.pauseUpdates = true;
    }

    private pauseUpdates: boolean = false;

    private timeoutHandlers: {
        id: number;
        callback: () => void;
    } | null = null;

    private lastTicks?: number = undefined;

    public update(): void {
        let context = this.canvas.getContext('2d');
        let updater = () => {
            if (!this.pauseUpdates) {
                let now = new Date().getTime();
                if (!this.lastTicks) {
                    this.lastTicks = now;
                }
                if (this.inputHandler) {
                    this.inputHandler.handleInput();
                }
                if ((!this.inputHandler || !this.inputHandler.isPaused)) {
                    clear(context, this.canvas);
                    let dt = now - this.lastTicks;
                    if (this.inputHandler && this.inputHandler.slowDown) {
                        dt *= 0.5;
                    }
                    this.modelUpdates = this.modelUpdates.filter(tick => !tick(dt));
                    this.graphicUpdates = this.graphicUpdates.filter(tick => !tick(this.drawerFactory(context)));
                }
                this.lastTicks = now;
            }
            const id = window.setTimeout(updater, 16);
            this.timeoutHandlers = {
                id,
                callback: updater.bind(this)
            };
        }
        updater();
    }
}