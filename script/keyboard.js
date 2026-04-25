class Keyboard {
    constructor() {
        this.keys = new Array(16).fill(false);
        this.keyMap = {
            '1': 0x1,
            '2': 0x2,
            '3': 0x3,
            '4': 0xC,
            'q': 0x4,
            'w': 0x5,
            'e': 0x6,
            'r': 0xD,
            'a': 0x7,
            's': 0x8,
            'd': 0x9,
            'f': 0xE,
            'z': 0xA,
            'x': 0x0,
            'c': 0xB,
            'v': 0xF
        };
        this.timer = null
    }
    keysAddListener() {
        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            console.log(key)
            if (key in this.keyMap) {
                const keyIndex = this.keyMap[key];
                this.keys[keyIndex] = true;
            }
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.keys.fill(false);
            }, 50)
        });
        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (key in this.keyMap) {
                const keyIndex = this.keyMap[key];
                this.keys[keyIndex] = false;
            }
        });

    }

}