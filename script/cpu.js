class Cpu {
    constructor(chip8) {
        this.chip8 = chip8;
        this.code = {
            nnn: 0, kk: 0, n: 0, x: 0, y: 0,
        }

        this.registers = {
            v: new Uint8Array(16).fill(0),
            i: new Uint16Array(1),
            pc: new Uint16Array(1).fill(0x200),
            stack: new Uint16Array(16).fill(0),
            sp: 0,
            delayTimer: new Uint8Array(1).fill(0),
            soundTimer: new Uint8Array(1).fill(0),
        }
    }
    add(value1, value2) {
        return value1 + value2;
    }
    addVx(obj) {
        this.registers.v[obj.x] = (obj.value + this.registers.v[obj.x]) & 0xFF;
    }
    subVx(obj) {
        this.registers.v[obj.x] = (this.registers.v[obj.x] - obj.value) & 0xFF;
    }
    orVx(obj) {
        this.registers.v[obj.x] |= obj.value;
    }
    andVx(obj) {
        this.registers.v[obj.x] &= obj.value;
    }
    xorVx(obj) {
        this.registers.v[obj.x] ^= obj.value;
    }
    ret() {
        this.registers.pc[0] = this.registers.stack[this.registers.sp--];
    }
    call() {
        this.registers.stack[++this.registers.sp] = this.registers.pc[0];
        this.jp(this.code.nnn);
    }
    drw(n, x, y) {
        let posX = (this.registers.v[x] & 0x3F);
        let posY = (this.registers.v[y] & 0x1F);
        this.registers.v[0xF] = 0;
        for (let col = 0; col < n; col++) {
            let sprite = this.chip8.memory.bytes[this.registers.i[0] + col];
            for (let row = 0; row < 8; row++) {
                if (((sprite >> (7 - row)) & 1)) {
                    const xPix = (posX + row) & 63;
                    const yPix = (posY + col) & 31;
                    const index = xPix + yPix * 64;
                    if (index >= 2048) {
                        index -= 2048
                    }
                    if (this.chip8.display.buffer[index]) {
                        this.registers.v[0xF] = 1;
                    }
                    this.chip8.display.buffer[index] ^= 1;
                }
            }
        }
    }
    jp(nnn) {
        this.registers.pc[0] = nnn;
    }
    or(r1, r2) {
        return r1 | r2;
    }
    and(r1, r2) {
        return r1 & r2;
    }
    xor(r1, r2) {
        return r1 ^ r2;
    }
    se(value1, value2) {
        if (value1 === value2) {
            this.registers.pc[0] += 2;
        }
    }
    sne(value1, value2) {
        if (value1 !== value2) {
            this.registers.pc[0] += 2;
        }
    }
    sub(r1, r2) {
        return r1 - r2;
    }
    subn(r1, r2) {
        return this.sub(r2, r1);
    }
    shr(value) {
        return (value >> 1) & 0xFF;
    }
    shl(value) {
        return (value << 1) & 0xFF;
    }
    skp(value) {
        if (this.chip8.keyboard.keys[value])
            this.registers.pc[0] += 2;
    }
    skpn(value) {
        if (!this.chip8.keyboard.keys[value])
            this.registers.pc[0] += 2;
    }
    ldVx(obj) {
        this.registers.v[obj.x] = obj.value & 0xFF;
    }
    ldI(value) {
        this.registers.i[0] = value;
    }
    ldDT(value) {
        this.registers.delayTimer[0] = value;
    }
    ldST(value) {
        this.registers.soundTimer[0] = value;
    }
    storeMemory(obj) {
        this.chip8.memory.bytes[obj.addr] = obj.value;
    }
    loadMemory(addr) {
        return this.chip8.memory.bytes[addr];
    }
    ldBSD(obj) {
        this.storeMemory({ addr: obj.addr, Math, value: Math.floor(obj.value / 100) });
        this.storeMemory({ addr: obj.addr + 1, Math, value: Math.floor(obj.value / 10 % 10) });
        this.storeMemory({ addr: obj.addr + 2, Math, value: obj.value % 10 });
    }
    decode() {
        const op = this.chip8.opcode[0];
        this.code.nnn = op & 0xFFF;
        this.code.kk = op & 0xFF;
        this.code.n = op & 0xF;
        this.code.x = (op & 0x0F00) >> 8;
        this.code.y = (op & 0x00F0) >> 4;
        this.execute();
    }
    execute() {
        switch (this.chip8.opcode[0] & 0xF000) {
            case 0x0000:
                switch (this.chip8.opcode[0] & 0x00FF) {
                    case 0x00E0:
                        this.chip8.display.cls();
                        break;
                    case 0x00EE:
                        this.ret();
                        break;
                }
                break;
            case 0x1000:
                this.jp(this.code.nnn);
                break;
            case 0x2000:
                this.call();
                break;
            case 0x3000:
                this.se(this.code.kk, this.registers.v[this.code.x]);
                break;
            case 0x4000:
                this.sne(this.code.kk, this.registers.v[this.code.x]);
                break;
            case 0x5000:
                this.se(this.registers.v[this.code.x], this.registers.v[this.code.y]);
                break;
            case 0x6000:
                this.ldVx({ x: this.code.x, value: this.code.kk });
                break;
            case 0x7000:
                this.addVx({
                    x: this.code.x,
                    value: this.code.kk
                });
                break;
            case 0x8000:
                switch (this.chip8.opcode[0] & 0x000F) {
                    case 0x0000:
                        this.ldVx({ x: this.code.x, value: this.registers.v[this.code.y] });
                        break;
                    case 0x0001:
                        this.orVx({ x: this.code.x, value: this.registers.v[this.code.y] });
                        break;
                    case 0x0002:
                        this.andVx({ x: this.code.x, value: this.registers.v[this.code.y] });
                        break;
                    case 0x0003:
                        this.xorVx({ x: this.code.x, value: this.registers.v[this.code.y] });
                        break;
                    case 0x0004:
                        this.registers.v[0xF] = (this.registers.v[this.code.x] + this.registers.v[this.code.y]) > 0xFF ? 1 : 0;
                        this.addVx({ x: this.code.x, value: this.registers.v[this.code.y] });
                        break;
                    case 0x0005:
                        this.registers.v[0xF] = this.registers.v[this.code.x] > this.registers.v[this.code.y] ? 1 : 0;
                        this.subVx({ x: this.code.x, value: this.registers.v[this.code.y] })
                        break;
                    case 0x0006:
                        this.registers.v[0xF] = this.registers.v[this.code.x] & 0x1;
                        this.ldVx({ x: this.code.x, value: this.shr(this.registers.v[this.code.x]) });
                        break;
                    case 0x0007:
                        this.registers.v[0xF] = this.registers.v[this.code.y] > this.registers.v[this.code.x] ? 1 : 0;
                        this.ldVx({ x: this.code.x, value: this.subn(this.registers.v[this.code.x], this.registers.v[this.code.y]) });
                        break;
                    case 0x000E:
                        this.registers.v[0xF] = this.registers.v[this.code.x] & 0b10000000 ? 1 : 0;
                        this.ldVx({ x: this.code.x, value: this.shl(this.registers.v[this.code.x]) });
                        break;
                }
                break;
            case 0x9000:
                this.sne(this.registers.v[this.code.x], this.registers.v[this.code.y]);
                break;
            case 0xA000:
                this.ldI(this.code.nnn);
                break;
            case 0xB000:
                this.jp((this.registers.v[0] + this.code.nnn));
                break;
            case 0xC000:
                this.ldVx({ x: this.code.x, value: this.and(Math.floor(Math.random() * 256), this.code.kk) });
                break;
            case 0xD000:
                this.drw(this.code.n, this.code.x, this.code.y);
                break;
            case 0xE000:
                switch (this.chip8.opcode[0] & 0x00FF) {
                    case 0x009E:
                        this.skp(this.registers.v[this.code.x]);
                        break;
                    case 0x00A1:
                        this.skpn(this.registers.v[this.code.x]);
                        break;
                }
                break;
            case 0xF000:
                switch (this.chip8.opcode[0] & 0x00FF) {
                    case 0x0007:
                        this.ldVx({ x: this.code.x, value: this.registers.delayTimer[0] });
                        break;
                    case 0x0015:
                        this.ldDT(this.registers.v[this.code.x])
                        break;
                    case 0x0018:
                        this.ldST(this.registers.v[this.code.x])
                        break;
                    case 0x000A:
                        let pressed = false;
                        for (let i = 0; i < this.chip8.keyboard.keys.length; i++) {
                            if (this.chip8.keyboard.keys[i]) {
                                this.ldVx({ x: this.code.x, value: i });
                                pressed = true
                            }
                        }
                        if (!pressed) {
                            this.registers.pc[0] -= 2;
                        }
                        break;
                    case 0x001E:
                        this.ldI(this.add(this.registers.v[this.code.x], this.registers.i[0]));
                        break;
                    case 0x0029:
                        this.ldI(this.registers.v[this.code.x] * 5);
                        break;
                    case 0x0033:
                        this.ldBSD({
                            addr: this.registers.i[0],
                            value: this.registers.v[this.code.x]
                        });
                        break;
                    case 0x0055:
                        for (let i = 0; i <= this.code.x; i++) {
                            this.storeMemory({
                                addr: this.registers.i[0] + i,
                                value: this.registers.v[i]
                            });
                        }
                        break;
                    case 0x0065:
                        for (let i = 0; i <= this.code.x; i++) {
                            this.ldVx({
                                x: i,
                                value: this.loadMemory(this.registers.i[0] + i)
                            });
                        }
                        break;
                }
                break;
            default:
                console.error("找不到的opcode: " + this.chip8.opcode[0].toString(16));
                break;
        }
    }
}