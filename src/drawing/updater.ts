
export interface TickCallback {
    (dt: number, context: CanvasRenderingContext2D): boolean;
};

let clear = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export const createUpdater = (canvas: HTMLCanvasElement, ticks: TickCallback[]): (() => void) => {
    let startTicks: number = undefined;
    let context = canvas.getContext('2d');
    let updater = () => {
        let now = new Date().getTime();
        if (!startTicks) {
            startTicks = now;
        }
        clear(context, canvas);
        let dt = now - startTicks;
        ticks = ticks.filter(tick => tick(dt, context));
        startTicks = now;
        setTimeout(updater, 16);
    }
    return updater;
} 
