import { Shooter, Shot } from "./shooter";

export default class InputHandler {
    public isPaused: boolean = false;
    public slowDown: boolean = false;
    public documentHidden(): void {
        this.isLeftDown = false;
        this.isRightDown = false;
    }

    private keysDown: Set<string> = new Set<string>();

    private isLeftDown: boolean = false;
    private isRightDown: boolean = false;
    private isDownDown: boolean = false;
    private isUpDown: boolean = false;
    constructor(private shooterExtractor: () => Shooter) {
        let translator: { [key: number]: string } = {
            80: "p",
            83: "s"
        };
        let handlerCreator = (whatToSet: boolean) => ((e: KeyboardEvent) => {
            if (e.keyCode === 37) /*left */ {
                this.isLeftDown = whatToSet;
            }
            else if (e.keyCode === 38) {
                this.isUpDown = whatToSet;
            }
            else if (e.keyCode === 39) /*right*/ {
                this.isRightDown = whatToSet;
            }
            else if (e.keyCode === 40) {
                this.isDownDown = whatToSet;
            }
            else if (translator[e.keyCode]) {
                if (whatToSet) {
                    this.keysDown.add(translator[e.keyCode]);
                }
            }
        });
        window.onkeydown = handlerCreator(true);
        window.onkeyup = handlerCreator(false);
    }

    public handleInput(): void {
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

        if (this.isDownDown) {
            shooter.activatePower();
        }

        if (this.isUpDown) {
            shooter.shoot();
        }

        if (this.keysDown.has("p")) {
            this.isPaused = !this.isPaused;
        }

        if (this.keysDown.has("s")) {
            this.slowDown = !this.slowDown;
        }



        this.keysDown = new Set<string>();
    }
}