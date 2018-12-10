import InputHandler from "../input-handler";

export interface TickCallback {
    (dt: number): boolean;
};

export interface GraphicCallback {
    (context: CanvasRenderingContext2D): boolean;
}


let clear = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export class Updater {
    public modelUpdates: TickCallback[] = [];
    public graphicUpdates: GraphicCallback[] = [];

    public inputHandler?: InputHandler;

    constructor(private canvas: HTMLCanvasElement) {
    }

    public update(): void {
        let startTicks: number = undefined;
        let context = this.canvas.getContext('2d');
        let updater = () => {
            let now = new Date().getTime();
            if (!startTicks) {
                startTicks = now;
            }
            if (document.hasFocus && (!this.inputHandler || !this.inputHandler.isPaused)) {
                clear(context, this.canvas);
                let dt = now - startTicks;
                this.modelUpdates = this.modelUpdates.filter(tick => tick(dt));
                this.graphicUpdates = this.graphicUpdates.filter(tick => tick(context));
            }
            startTicks = now;
            setTimeout(updater, 16);
        }
        updater();
    }
}

// export const createUpdater = (canvas: HTMLCanvasElement, ticks: TickCallback[]): (() => void) => {
//     let startTicks: number = undefined;
//     let context = canvas.getContext('2d');
//     let updater = () => {
//         let now = new Date().getTime();
//         if (!startTicks) {
//             startTicks = now;
//         }
//         clear(context, canvas);
//         let dt = now - startTicks;
//         ticks = ticks.filter(tick => tick(dt, context));
//         startTicks = now;
//         setTimeout(updater, 16);
//     }
//     return updater;
// } 
