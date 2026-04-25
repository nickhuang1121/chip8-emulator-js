class Chip8 {
    constructor(obj) {
        this.canvas = obj.canvas; //畫布canvas的DOM
        this.canvasWidth = null; //畫布寬
        this.canvasHeight = null; //畫布高
        this.canvasAspectRatio = null; //畫布比例
        this.file = obj.file; //ROM檔案路徑
        this.fps = obj.fps || 60; //遊戲速度
        this.scale = obj.scale || 10; //點陣放大比例
        this.display = new Display({ width: 64, height: 32, canvas: this.canvas }, this); //實例顯示器資訊
        this.keyboard = new Keyboard();
        this.memory = new Memory(this);
        this.fileSize = 0;
        this.opcode = new Uint16Array(1).fill(0);
        this.sound = new Audio("./sound/digi-beep-qst-346094.mp3");
        this.cpu = new Cpu(this);
        this.pause = false;
        this.debugMode = obj.debugMode || false;
        this.catchDebugMsg = obj.catchDebugMsg || null;
        this.debugStartMessageShow = false;
        this.timer = null;
        this.rwd = obj.rwd || true;
        this.needRwdReset = false;
        this.color1 = obj.color1 || "#333333";
        this.color2 = obj.color2 || "#00DD00"
    }


    outputDebugJSON() {
        let str = `[${JSON.stringify(this.cpu.registers)},`;
        str += `${JSON.stringify(this.opcode)}`;
        str += ']';
        return str;
    }
    debugHandle() {
        if (!this.debugStartMessageShow) {
            console.log("測試模式已開啟");
            this.debugStartMessageShow = true;
        }
        if (this.catchDebugMsg == null) {
            this.debugMode = false;
            console.log("請設定接收degug資訊的位置");
            return
        }
        this.catchDebugMsg[0] = this.outputDebugJSON();
    }
    fetch() {
        return (this.memory.bytes[this.cpu.registers.pc[0]] << 8) | this.memory.bytes[this.cpu.registers.pc[0] + 1];
    }
    soundPlay() {
        this.sound.volume = 0.6;
        this.sound.currentTime = 0;
        this.sound.play();
    }
    gameLoop() {
        this.display.draw();
        for (let i = 0; i < 10; i++) {
            this.opcode[0] = this.fetch();
            this.cpu.registers.pc[0] += 2;
            this.cpu.decode();
        }
        if (this.cpu.registers.delayTimer[0] > 0) {
            this.cpu.registers.delayTimer[0] -= 1;
        }
        if (this.cpu.registers.soundTimer[0] > 0) {
            this.soundPlay();
            this.cpu.registers.soundTimer[0] -= 1;
        }
        if (this.debugMode)
            this.debugHandle();
        if (this.pause)
            return;

        this.timer = setTimeout(() => {
            this.gameLoop();
        }, 1000 / this.fps);

    }
    pauseClick() {
        this.pause = true;
    }
    continueClick() {
        this.pause = false;
        this.gameLoop();
    }
    changeCanvasSize() {
        this.canvas.width = document.querySelector("body").clientWidth;
        this.canvas.height = this.canvas.width * this.canvasAspectRatio;
        this.scale = this.canvas.width / 64;
        this.needRwdReset = true;
    }
    resetCanvasSize() {
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.scale = this.canvas.width / 64;
        this.needRwdReset = false;
    }
    rwdActive() {
        console.log(0)
        this.canvasWidth = this.canvas.clientWidth;
        this.canvasHeight = this.canvas.clientHeight;
        this.canvasAspectRatio = this.canvasHeight / this.canvasWidth;

        if (document.querySelector("body").clientWidth < this.canvasWidth) {
            this.changeCanvasSize();
        }
        window.addEventListener("resize", () => {
            if (document.querySelector("body").clientWidth <= this.canvasWidth) {
                this.changeCanvasSize();
            } else {
                if (this.needRwdReset)
                    this.resetCanvasSize();
            }
        })
    }
    init() {
        this.memory.loadROM(this.file);
        this.keyboard.keysAddListener();
        if (this.rwd)
            this.rwdActive();
    }
}




