import { Shooter } from "./shooter";

export default class InputHandler {
    public documentHidden(): void {
        this.isLeftDown = false;
        this.isRightDown = false;
    }

    private isLeftDown = false;
    private isRightDown = false;
    constructor(private shooterExtractor: () => Shooter) {
        let handlerCreator = (whatToSet: boolean) => ((e: KeyboardEvent) => {
            if (e.keyCode === 37) /*left */ {
                this.isLeftDown = whatToSet;
            }
            else if (e.keyCode === 39) /*right*/ {
                this.isRightDown = whatToSet;
            }
        });
        window.onkeydown = handlerCreator(true);
        window.onkeyup = handlerCreator(false);
    }

    public handleInput() {
        let shooter = this.shooterExtractor();
        if ((this.isLeftDown && this.isRightDown) || (!this.isLeftDown && !this.isRightDown)) {
            shooter.stopMoving();
        }
        else if (this.isLeftDown) {
            shooter.moveLeft();
        }
        else if (this.isRightDown) {
            shooter.moveRight();
        }
    }
}