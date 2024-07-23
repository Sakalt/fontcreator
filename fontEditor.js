const mainCanvas = document.getElementById('mainCanvas');
const mainCtx = mainCanvas.getContext('2d');
const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');

const slots = {};
let clipboard = null;
let undoStack = [];
let redoStack = [];
let currentChar = '';
let currentSlot = null;

// 描画の設定
let drawing = false;
let brushSize = 5;
let brushColor = 'black';

// メインキャンバスでの描画
mainCanvas.addEventListener('mousedown', () => { drawing = true; });
mainCanvas.addEventListener('mouseup', () => { drawing = false; mainCtx.beginPath(); });
mainCanvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;
    mainCtx.lineWidth = brushSize;
    mainCtx.lineCap = 'round';
    mainCtx.strokeStyle = brushColor;
    mainCtx.lineTo(event.clientX - mainCanvas.offsetLeft, event.clientY - mainCanvas.offsetTop);
    mainCtx.stroke();
    mainCtx.beginPath();
    mainCtx.moveTo(event.clientX - mainCanvas.offsetLeft, event.clientY - mainCanvas.offsetTop);
});

// グリフの保存
document.getElementById('saveGlyph').addEventListener('click', () => {
    if (currentChar) {
        const glyphData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        slots[currentChar] = glyphData;
        addToHistory();
        console.log('Glyph saved:', currentChar);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    } else {
        console.log('No character selected');
    }
});

// 新しいキャンバスでグリフを表示
document.getElementById('editGlyph').addEventListener('click', () => {
    const char = document.getElementById('charInput').value;
    if (slots[char]) {
        editorCtx.putImageData(slots[char], 0, 0);
        editorCanvas.style.display = 'block';
        console.log('Glyph loaded for editing:', char);
        currentSlot = char;
    } else {
        console.log('Glyph not found for character:', char);
    }
});

// コピー、切り取り、貼り付け機能
document.getElementById('copyGlyph').addEventListener('click', () => {
    if (currentSlot && slots[currentSlot]) {
        clipboard = slots[currentSlot];
        console.log('Glyph copied');
    }
});

document.getElementById('cutGlyph').addEventListener('click', () => {
    if (currentSlot && slots[currentSlot]) {
        clipboard = slots[currentSlot];
        delete slots[currentSlot];
        addToHistory();
        console.log('Glyph cut');
    }
});

document.getElementById('pasteGlyph').addEventListener('click', () => {
    if (clipboard) {
        slots[currentChar] = clipboard;
        editorCtx.putImageData(clipboard, 0, 0);
        console.log('Glyph pasted');
    }
});

// Undo/Redo機能
function addToHistory() {
    undoStack.push({ ...slots });
    redoStack = []; // Clear redo stack when new action is performed
}

document.getElementById('undo').addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push({ ...slots });
        slots = undoStack.pop();
        redraw();
        console.log('Undo performed');
    }
});

document.getElementById('redo').addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push({ ...slots });
        slots = redoStack.pop();
        redraw();
        console.log('Redo performed');
    }
});

function redraw() {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    Object.keys(slots).forEach(char => {
        mainCtx.putImageData(slots[char], 0, 0);
    });
}

// 部首の管理と読み込み
const radicalsList = document.getElementById('radicalsList');
let radicals = {};

document.getElementById('addSlot').addEventListener('click', () => {
    const char = document.getElementById('charInput').value;
    if (char) {
        if (!slots[char]) {
            slots[char] = mainCtx.createImageData(mainCanvas.width, mainCanvas.height);
            console.log('Slot added:', char);
        }
    }
});

document.getElementById('loadRadicals').addEventListener('click', () => {
    const fileInput = document.getElementById('radicalsInput');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            radicals = JSON.parse(e.target.result);
            updateRadicalsList();
            console.log('Radicals loaded');
        };
        reader.readAsText(file);
    }
});

function updateRadicalsList() {
    radicalsList.innerHTML = '';
    Object.keys(radicals).forEach(key => {
        const div = document.createElement('div');
        div.textContent = key;
        radicalsList.appendChild(div);
    });
}
