class Display {
    constructor(_, chip8) {
        this.width = _.width;
        this.height = _.height;
        this.buffer = new Array(this.width * this.height).fill(0);
        this.canvas = _.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.chip8 = chip8;
    }
    setColor(color) {
        this.ctx.fillStyle = color;
    }
    cls() {
        this.buffer.fill(0);
    }
    clear() {
        this.setColor(this.chip8.color1);
        this.ctx.fillRect(0, 0, 64 * this.chip8.scale, 32 * this.chip8.scale);
    }
    draw() {
        this.clear();
        this.setColor(this.chip8.color2);
        for (let i = 0; i < this.buffer.length; i++) {
            if (this.buffer[i]) {
                let x = Math.floor(i % 64);
                let y = Math.floor(i / 64);
                this.ctx.fillRect(x * this.chip8.scale, y * this.chip8.scale, this.chip8.scale, this.chip8.scale);
            }
        }
    }

}