# CHIP-8 模擬器

這是一個使用原生 HTML、CSS、JavaScript 製作的 CHIP-8 模擬器。專案透過 Canvas 呈現 64×32 像素畫面，並實作 CPU、記憶體、顯示器、鍵盤輸入與音效等核心功能，可載入多款經典 CHIP-8 ROM 遊戲。

## 功能特色

- 支援 CHIP-8 ROM 載入與執行
- 使用 Canvas 繪製像素畫面
- 支援鍵盤與手機虛擬按鍵操作
- 可切換模擬速度：10 / 30 / 60 / 90 / 120 FPS
- 提供暫停、繼續、單步執行功能
- 內建除錯模式，可查看：
  - 目前 Opcode
  - V 暫存器
  - Stack
  - I、PC、SP
  - Delay Timer、Sound Timer
- 支援多種畫面配色
- 內建蜂鳴音效

## 內建遊戲 ROM

- INVADERS 太空入侵者
- PONG 乒乓
- UFO 外星飛船
- BRIX 打磚塊

## 操作方式

CHIP-8 原始按鍵對應如下：

| CHIP-8 | 鍵盤 |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| C | 4 |
| 4 | Q |
| 5 | W |
| 6 | E |
| D | R |
| 7 | A |
| 8 | S |
| 9 | D |
| E | F |
| A | Z |
| 0 | X |
| B | C |
| F | V |

手機版會顯示虛擬按鍵，可直接點擊操作。

## 專案結構

```text
.
├── index.html
├── style.css
├── script
│   ├── chip8.js
│   ├── cpu.js
│   ├── display.js
│   ├── keyboard.js
│   └── memory.js
├── game
│   ├── BRIX
│   ├── INVADERS
│   ├── PONG
│   └── UFO
└── sound
    └── digi-beep-qst-346094.mp3
