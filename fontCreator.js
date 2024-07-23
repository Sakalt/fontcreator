const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let currentChar = '';
let slots = [];
let radicals = {};
let drawing = false;
let brushSize = 5;
let brushColor = 'black';
let clipboard = null; // クリップボード
let history = []; // Undo/Redo履歴
let historyIndex = -1; // 履歴のインデックス

// UI Elements
const addSlotButton = document.getElementById('addSlot');
const copyButton = document.getElementById('copy');
const cutButton = document.getElementById('cut');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const saveButton = document.getElementById('save');
const loadButton = document.getElementById('load');
const exportButton = document.getElementById('export');
const importButton = document.getElementById('import');
const flipButton = document.getElementById('flip');
const charInput = document.getElementById('charInput');
const addRadicalButton = document.getElementById('addRadical');
const loadRadicalsButton = document.getElementById('loadRadicals');
const fileInput = document.getElementById('fileInput');
const radicalNameInput = document.getElementById('radicalName');
const radicalElementsInput = document.getElementById('radicalElements');

// Drawing setup
canvas.addEventListener('mousedown', () => { drawing = true; });
canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
});

// クリップボード操作
function copy() {
    clipboard = canvas.toDataURL();
}

function cut() {
    copy();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスから削除
}

// Undo/Redo操作
function addToHistory() {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toDataURL());
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.src = history[historyIndex];
        img.onload = () => ctx.drawImage(img, 0, 0);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.src = history[historyIndex];
        img.onload = () => ctx.drawImage(img, 0, 0);
    }
}

// 部首読み込み
function loadRadicalsFromFile() {
    fileInput.click();
}

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        radicals = data.radicals || {};
        console.log('Radicals loaded:', radicals);
    };
    reader.readAsText(file);
});

// Save to local storage
function saveToLocalStorage() {
    const fontData = {
        slots: slots,
        radicals: radicals
    };
    localStorage.setItem('fontData', JSON.stringify(fontData));
    console.log('Data saved to local storage');
}

saveButton.addEventListener('click', saveToLocalStorage);

// Load from local storage
function loadFromLocalStorage() {
    const storedData = localStorage.getItem('fontData');
    if (storedData) {
        const fontData = JSON.parse(storedData);
        slots = fontData.slots || [];
        radicals = fontData.radicals || {};
        console.log('Data loaded from local storage', fontData);
    } else {
        console.log('No data found in local storage');
    }
}

loadButton.addEventListener('click', loadFromLocalStorage);

// Export functionality
exportButton.addEventListener('click', () => {
    const data = JSON.stringify({ slots, radicals });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'font.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Import functionality
importButton.addEventListener('click', () => {
    fileInput.click();
});
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        slots = data.slots || [];
        radicals = data.radicals || {};
        console.log('Data imported:', data);
    };
    reader.readAsText(file);
});

// Flip functionality
flipButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, -canvas.width, 0);
    ctx.restore();
});

// Add slot functionality
addSlotButton.addEventListener('click', () => {
    const char = charInput.value;
    if (char) {
        slots.push({ char, data: null });
        currentChar = char;
        console.log('Slot added:', char);
    }
});

// Copy functionality
copyButton.addEventListener('click', copy);

// Cut functionality
cutButton.addEventListener('click', cut);

// Undo functionality
undoButton.addEventListener('click', () => {
    addToHistory();
    undo();
});

// Redo functionality
redoButton.addEventListener('click', redo);

// Add radical functionality
addRadicalButton.addEventListener('click', () => {
    const name = radicalNameInput.value;
    const elementsData = radicalElementsInput.value;
    if (name && elementsData) {
        try {
            const data = JSON.parse(elementsData);
            radicals[name] = data;
            console.log('Radical added:', name, data);
        } catch (e) {
            console.error('Invalid data format');
        }
    }
});

// Load radicals functionality
loadRadicalsButton.addEventListener('click', loadRadicalsFromFile);
