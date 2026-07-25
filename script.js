// ======================================================================
// --- Database of Daily Lessons ---
// ======================================================================
const defaultLessonDatabase = {
    blank: {
        id: 'blank',
        class: '',
        unit: '',
        day: '',
        title: 'Blank Page',
        tabs: {
            intro: {
                content: ["<h3>📄 Blank Page</h3><p>Use this blank page for quick notes and drawings during class. Anything you draw, type, or paste here is saved automatically.</p>"],
                pdfUrl: "",
                pageRange: ""
            }
        },
        resources: []
    },
    day2: {
        id: 'day2',
        class: 'class9',
        unit: 'unit4',
        day: 'day2',
        title: 'रीत वा बहुलक (Mode)',
        tabs: {
            intro: {
                content: ["<h3>रीत वा बहुलक (Mode)</h3><p>Today we will learn how to calculate the Mode of continuous data.</p>"],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "1-3"
            },
            concept: {
                content: ["<p>The mode is the value that appears most frequently in a data set. For grouped data, we find the modal class first.</p>"],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "4-5"
            },
            formula: {
                content: [
                    `<div class="formula-box">
                        <strong>रीत (Mode) को सूत्र:</strong><br><br>
                        \\[ Mode = L + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h \\]
                        <br><p style="font-size:0.9rem; color:#555;">Where: L = Lower limit of modal class, h = Class interval size</p>
                     </div>`
                ],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "6"
            },
            activities: {
                content: ["<p>Group Activity: Find the heights of 10 students and group them into intervals.</p>"],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "7-8"
            },
            examples: {
                content: ["<p>Example 1: Calculate the mode of the given dataset on the board.</p>"],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "9"
            },
            practice: {
                content: ["<p>Find the mode for the following dataset: [Class: 10-20, 20-30, 30-40] [Freq: 4, 12, 5]</p>"],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "10-12"
            },
            quiz: {
                content: ["<p>Quick Question: Does the modal class always have the highest frequency? (Yes/No)</p>"],
                pdfUrl: "pdfs/sample.pdf",
                pageRange: "13"
            }
        },
        resources: []
    },
    day1: {
        id: 'day1',
        class: 'class9',
        unit: 'unit3',
        day: 'day1',
        title: "Heron's Formula",
        tabs: {
            intro: {
                content: ["<h3>Heron's Formula</h3><p>Review of calculating the area of a triangle.</p>"],
                pdfUrl: "pdfs/heron.pdf",
                pageRange: "1-2"
            },
            formula: {
                content: [
                    `<div class="formula-box">
                        <strong>Area of Triangle:</strong><br><br>
                        \\[ s = \\frac{a + b + c}{2} \\]
                        \\[ Area = \\sqrt{s(s-a)(s-b)(s-c)} \\]
                     </div>`
                ],
                pdfUrl: "pdfs/heron.pdf",
                pageRange: "3-4"
            },
            practice: {
                content: ["<p>Calculate the area of a triangle with sides 3cm, 4cm, and 5cm.</p>"],
                pdfUrl: "pdfs/heron.pdf",
                pageRange: "5"
            }
        },
        resources: []
    }
};

// --- Storage Keys for Persistence ---
const DB_STORAGE_KEY = 'math_simulation_db_v1';
const FILTER_STORAGE_KEY = 'math_simulation_filters_v1';
const ANNOT_STORAGE_KEY = 'math_simulation_annotations_v1';

let lessonDatabase = loadSavedDatabase();
let annotationsDB = loadSavedAnnotations();

function loadSavedDatabase() {
    try {
        const saved = localStorage.getItem(DB_STORAGE_KEY);
        return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultLessonDatabase));
    } catch (e) {
        return JSON.parse(JSON.stringify(defaultLessonDatabase));
    }
}

function persistDatabase() {
    try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(lessonDatabase));
    } catch (e) {
        console.error("Could not save lessons to LocalStorage:", e);
        showToast('Storage is full — could not save. Try exporting a Backup and clearing old data.', 'error');
    }
}

function loadSavedAnnotations() {
    try {
        const saved = localStorage.getItem(ANNOT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
}

function persistAnnotations() {
    try {
        localStorage.setItem(ANNOT_STORAGE_KEY, JSON.stringify(annotationsDB));
    } catch (e) {
        console.error("Could not save drawings to LocalStorage:", e);
    }
}

// Helper: ensure tab structure exists
function getTabData(lessonId, tabKey) {
    const lesson = lessonDatabase[lessonId];
    if (!lesson) return { content: [""], pdfUrl: "", pageRange: "" };

    if (!lesson.tabs[tabKey]) {
        lesson.tabs[tabKey] = { content: ["<p>Content for this section is not uploaded yet.</p>"], pdfUrl: "", pageRange: "" };
    } else if (Array.isArray(lesson.tabs[tabKey])) {
        lesson.tabs[tabKey] = { content: lesson.tabs[tabKey], pdfUrl: "", pageRange: "" };
    }
    return lesson.tabs[tabKey];
}

// Helper: basic escaping for headings
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) { console.log(message); return; }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// ======================================================================
// --- Navigation & Pagination State ---
// ======================================================================
let currentLesson = 'day2';
let currentTab = 'intro';
let currentPageIndex = 0;
let currentTabContentArray = [];
let currentTool = 'pen';
let currentShape = 'rectangle';
let isDrawing = false;
let textInputPosition = { x: 0, y: 0 };
let editingTextBox = null;
let editingEquationEl = null;
let shapeStartX = 0;
let shapeStartY = 0;
let currentPenColor = '#e53e3e';
let currentPenWeight = 3;
let activeAnnotationKey = null;
let blankCanvasSnapshot = null;
let topZIndex = 10;

function getAnnotationKey() {
    return `${currentLesson}::${currentTab}::${currentPageIndex}`;
}

function loadContent() {
    const contentDiv = document.getElementById('lesson-content');
    const paginationControls = document.getElementById('pagination-controls');
    const pageIndicator = document.getElementById('page-indicator');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    const contentStage = document.querySelector('.content-stage');
    const lessonContainer = document.querySelector('.lesson-container');

    // Save whatever was on the board before we switch away
    swapAnnotations();

    // Handle blank page
    if (currentLesson === 'blank') {
        contentStage.classList.add('blank-page');
        lessonContainer.classList.add('hidden');
        renderReferences();
        return;
    } else {
        contentStage.classList.remove('blank-page');
        lessonContainer.classList.remove('hidden');
    }

    const tabData = getTabData(currentLesson, currentTab);
    currentTabContentArray = tabData.content || ["<p>Content for this section is not uploaded yet.</p>"];

    if (currentPageIndex >= currentTabContentArray.length) {
        currentPageIndex = 0;
    }

    let htmlOutput = currentTabContentArray[currentPageIndex] || "";

    if (tabData.pdfUrl && tabData.pageRange) {
        let targetPdfPage = 1;
        if (tabData.pageRange.includes('-')) {
            const parts = tabData.pageRange.split('-').map(p => parseInt(p.trim(), 10));
            const startP = parts[0] || 1;
            const endP = parts[1] || startP;
            targetPdfPage = Math.min(startP + currentPageIndex, endP);
        } else {
            targetPdfPage = parseInt(tabData.pageRange.trim(), 10) || 1;
        }

        htmlOutput += `
            <div class="pdf-viewer-wrapper">
                <div class="pdf-badge">
                    <i class="fa-solid fa-file-pdf"></i> Assigned PDF Range: <strong>Pages ${escapeHtml(tabData.pageRange)}</strong> (Viewing Page ${targetPdfPage})
                </div>
                <iframe class="pdf-viewer-frame" src="${escapeHtml(tabData.pdfUrl)}#page=${targetPdfPage}"></iframe>
            </div>
        `;
    }

    contentDiv.innerHTML = htmlOutput;

    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([contentDiv]).catch((err) => console.log(err.message));
    }

    if (currentTabContentArray.length > 1) {
        paginationControls.style.display = "flex";
        pageIndicator.innerText = `Page ${currentPageIndex + 1} / ${currentTabContentArray.length}`;
        btnPrev.disabled = currentPageIndex === 0;
        btnNext.disabled = currentPageIndex === currentTabContentArray.length - 1;
    } else {
        paginationControls.style.display = "none";
    }

    renderReferences();
}

function updateTabLabel(sourceBtn) {
    const label = document.getElementById('current-tab-label');
    if (label && sourceBtn) {
        label.innerHTML = sourceBtn.innerHTML;
    }
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        loadContent();
        restoreAnnotations(getAnnotationKey());
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPageIndex < currentTabContentArray.length - 1) {
        currentPageIndex++;
        loadContent();
        restoreAnnotations(getAnnotationKey());
    }
});

let lastDayLesson = currentLesson;

document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.id === 'blank-page-btn') return;
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTab = e.currentTarget.getAttribute('data-target');
        currentPageIndex = 0;
        if (currentLesson === 'blank') {
            currentLesson = lastDayLesson;
        }
        updateTabLabel(e.currentTarget);
        loadContent();
        restoreAnnotations(getAnnotationKey());
    });
});

document.getElementById('blank-page-btn').addEventListener('click', function (e) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    if (currentLesson !== 'blank') {
        lastDayLesson = currentLesson;
    }
    currentLesson = 'blank';
    currentTab = 'intro';
    currentPageIndex = 0;
    loadContent();
    restoreAnnotations(getAnnotationKey());
});

// ======================================================================
// --- Interactive Whiteboard (Canvas) Logic ---
// ======================================================================
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('shape-preview-board');
const previewCtx = previewCanvas.getContext('2d');
const contentStage = document.querySelector('.content-stage');
let isShapeDragging = false;

function resizeCanvas() {
    let preserved = null;
    if (canvas.width > 0 && canvas.height > 0) {
        try { preserved = canvas.toDataURL('image/png'); } catch (e) { preserved = null; }
    }
    canvas.width = contentStage.offsetWidth;
    canvas.height = contentStage.offsetHeight;
    previewCanvas.width = contentStage.offsetWidth;
    previewCanvas.height = contentStage.offsetHeight;

    ctx.lineWidth = currentPenWeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentPenColor;

    if (preserved) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = preserved;
    } else if (blankCanvasSnapshot === null) {
        blankCanvasSnapshot = canvas.toDataURL('image/png');
    }
}

window.addEventListener('resize', resizeCanvas);
setTimeout(() => {
    resizeCanvas();
    blankCanvasSnapshot = canvas.toDataURL('image/png');
    activeAnnotationKey = getAnnotationKey();
    restoreAnnotations(activeAnnotationKey);
}, 150);

function startDrawing(e) {
    if (currentTool === 'shape') {
        isShapeDragging = true;
        const rect = canvas.getBoundingClientRect();
        shapeStartX = e.clientX - rect.left;
        shapeStartY = e.clientY - rect.top;
        return;
    }
    if (currentTool !== 'pen' && currentTool !== 'eraser') return;
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'shape') {
        if (!isShapeDragging) return;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        renderShape(previewCtx, shapeStartX, shapeStartY, x, y, currentShape);
        return;
    }

    if (!isDrawing || (currentTool !== 'pen' && currentTool !== 'eraser')) return;

    if (currentTool === 'eraser') {
        ctx.clearRect(x - 15, y - 15, 30, 30);
    } else if (currentTool === 'pen') {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function stopDrawing(e) {
    if (currentTool === 'shape' && isShapeDragging) {
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        renderShape(ctx, shapeStartX, shapeStartY, endX, endY, currentShape);
    }
    isShapeDragging = false;
    isDrawing = false;
    ctx.beginPath();
}

// --- Shape Library ---
function polygonPoints(cx, cy, rx, ry, sides, rotationDeg) {
    const pts = [];
    const rot = (rotationDeg || -90) * Math.PI / 180;
    for (let i = 0; i < sides; i++) {
        const angle = rot + (i * 2 * Math.PI / sides);
        pts.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
    }
    return pts;
}

function starPoints(cx, cy, outerR, innerR, spikes) {
    const pts = [];
    const step = Math.PI / spikes;
    let rot = -Math.PI / 2;
    for (let i = 0; i < spikes; i++) {
        pts.push([cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR]);
        rot += step;
        pts.push([cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR]);
        rot += step;
    }
    return pts;
}

function strokePolygon(targetCtx, pts) {
    targetCtx.beginPath();
    targetCtx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) targetCtx.lineTo(pts[i][0], pts[i][1]);
    targetCtx.closePath();
    targetCtx.stroke();
}

function renderShape(targetCtx, startX, startY, endX, endY, shape) {
    const width = endX - startX;
    const height = endY - startY;
    const cx = startX + width / 2;
    const cy = startY + height / 2;
    const rx = Math.abs(width) / 2;
    const ry = Math.abs(height) / 2;

    targetCtx.strokeStyle = currentPenColor;
    targetCtx.fillStyle = currentPenColor;
    targetCtx.lineWidth = currentPenWeight;
    targetCtx.lineJoin = 'round';
    targetCtx.lineCap = 'round';

    switch (shape) {
        case 'rectangle':
            targetCtx.strokeRect(startX, startY, width, height);
            break;
        case 'square': {
            const side = Math.max(Math.abs(width), Math.abs(height));
            const sx = width < 0 ? startX - side : startX;
            const sy = height < 0 ? startY - side : startY;
            targetCtx.strokeRect(sx, sy, side, side);
            break;
        }
        case 'circle': {
            const radius = Math.sqrt(width * width + height * height) / 2;
            targetCtx.beginPath();
            targetCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
            targetCtx.stroke();
            break;
        }
        case 'ellipse':
            targetCtx.beginPath();
            targetCtx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, 2 * Math.PI);
            targetCtx.stroke();
            break;
        case 'triangle':
            targetCtx.beginPath();
            targetCtx.moveTo(startX + width / 2, startY);
            targetCtx.lineTo(endX, endY);
            targetCtx.lineTo(startX, endY);
            targetCtx.closePath();
            targetCtx.stroke();
            break;
        case 'right-triangle':
            targetCtx.beginPath();
            targetCtx.moveTo(startX, startY);
            targetCtx.lineTo(startX, endY);
            targetCtx.lineTo(endX, endY);
            targetCtx.closePath();
            targetCtx.stroke();
            break;
        case 'parallelogram': {
            const skew = width * 0.25;
            targetCtx.beginPath();
            targetCtx.moveTo(startX + skew, startY);
            targetCtx.lineTo(endX, startY);
            targetCtx.lineTo(endX - skew, endY);
            targetCtx.lineTo(startX, endY);
            targetCtx.closePath();
            targetCtx.stroke();
            break;
        }
        case 'rhombus':
            strokePolygon(targetCtx, [[cx, startY], [endX, cy], [cx, endY], [startX, cy]]);
            break;
        case 'trapezoid': {
            const inset = width * 0.2;
            targetCtx.beginPath();
            targetCtx.moveTo(startX + inset, startY);
            targetCtx.lineTo(endX - inset, startY);
            targetCtx.lineTo(endX, endY);
            targetCtx.lineTo(startX, endY);
            targetCtx.closePath();
            targetCtx.stroke();
            break;
        }
        case 'pentagon':
            strokePolygon(targetCtx, polygonPoints(cx, cy, rx, ry, 5));
            break;
        case 'hexagon':
            strokePolygon(targetCtx, polygonPoints(cx, cy, rx, ry, 6, 0));
            break;
        case 'star':
            strokePolygon(targetCtx, starPoints(cx, cy, Math.max(rx, ry), Math.max(rx, ry) * 0.45, 5));
            break;
        case 'line':
            targetCtx.beginPath();
            targetCtx.moveTo(startX, startY);
            targetCtx.lineTo(endX, endY);
            targetCtx.stroke();
            break;
        case 'arrow':
            drawArrow(targetCtx, startX, startY, endX, endY, true, false);
            break;
        case 'double-arrow':
            drawArrow(targetCtx, startX, startY, endX, endY, true, true);
            break;
        case 'angle':
            drawAngleMarker(targetCtx, startX, startY, endX, endY);
            break;
        case 'axes':
            drawAxes(targetCtx, startX, startY, endX, endY);
            break;
        case 'number-line':
            drawNumberLine(targetCtx, startX, startY, endX, endY);
            break;
    }
}

function drawArrow(targetCtx, fromX, fromY, toX, toY, headAtEnd, headAtStart) {
    const headlen = 14;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    targetCtx.beginPath();
    targetCtx.moveTo(fromX, fromY);
    targetCtx.lineTo(toX, toY);
    targetCtx.stroke();

    if (headAtEnd) {
        targetCtx.beginPath();
        targetCtx.moveTo(toX, toY);
        targetCtx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        targetCtx.moveTo(toX, toY);
        targetCtx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        targetCtx.stroke();
    }
    if (headAtStart) {
        const rAngle = angle + Math.PI;
        targetCtx.beginPath();
        targetCtx.moveTo(fromX, fromY);
        targetCtx.lineTo(fromX - headlen * Math.cos(rAngle - Math.PI / 6), fromY - headlen * Math.sin(rAngle - Math.PI / 6));
        targetCtx.moveTo(fromX, fromY);
        targetCtx.lineTo(fromX - headlen * Math.cos(rAngle + Math.PI / 6), fromY - headlen * Math.sin(rAngle + Math.PI / 6));
        targetCtx.stroke();
    }
}

function drawAngleMarker(targetCtx, startX, startY, endX, endY) {
    // Vertex at startX/startY: one ray horizontal, one ray toward endX/endY
    const vertex = [startX, startY];
    const rayLen = Math.hypot(endX - startX, endY - startY) || 60;
    targetCtx.beginPath();
    targetCtx.moveTo(vertex[0], vertex[1]);
    targetCtx.lineTo(vertex[0] + rayLen, vertex[1]);
    targetCtx.stroke();
    targetCtx.beginPath();
    targetCtx.moveTo(vertex[0], vertex[1]);
    targetCtx.lineTo(endX, endY);
    targetCtx.stroke();
    const angle = Math.atan2(endY - startY, endX - startX);
    targetCtx.beginPath();
    targetCtx.arc(vertex[0], vertex[1], 28, 0, angle < 0 ? angle : -angle, angle >= 0);
    targetCtx.stroke();
}

function drawAxes(targetCtx, startX, startY, endX, endY) {
    const cx = (startX + endX) / 2;
    const cy = (startY + endY) / 2;
    const halfW = Math.abs(endX - startX) / 2 || 100;
    const halfH = Math.abs(endY - startY) / 2 || 100;
    drawArrow(targetCtx, cx - halfW, cy, cx + halfW, cy, true, false);
    drawArrow(targetCtx, cx, cy + halfH, cx, cy - halfH, true, false);
    const ticks = 4;
    for (let i = -ticks; i <= ticks; i++) {
        if (i === 0) continue;
        const tx = cx + (halfW / ticks) * i;
        targetCtx.beginPath();
        targetCtx.moveTo(tx, cy - 4);
        targetCtx.lineTo(tx, cy + 4);
        targetCtx.stroke();
        const ty = cy + (halfH / ticks) * i;
        targetCtx.beginPath();
        targetCtx.moveTo(cx - 4, ty);
        targetCtx.lineTo(cx + 4, ty);
        targetCtx.stroke();
    }
}

function drawNumberLine(targetCtx, startX, startY, endX, endY) {
    const y = startY;
    drawArrow(targetCtx, startX, y, endX, y, true, true);
    const segments = 8;
    const step = (endX - startX) / segments;
    for (let i = 1; i < segments; i++) {
        const tx = startX + step * i;
        targetCtx.beginPath();
        targetCtx.moveTo(tx, y - 6);
        targetCtx.lineTo(tx, y + 6);
        targetCtx.stroke();
    }
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', (e) => { startDrawing(e.touches[0]); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { draw(e.touches[0]); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// --- Tool Button Events ---
function setPanelsForTool(showPen, showShape) {
    document.getElementById('pen-tools').style.display = showPen ? 'flex' : 'none';
    document.getElementById('shape-tools').style.display = showShape ? 'block' : 'none';
}

document.getElementById('btn-move').addEventListener('click', function () {
    currentTool = 'move';
    canvas.style.pointerEvents = 'none';
    setPanelsForTool(false, false);
    updateToolButtons(this);
});

document.getElementById('btn-draw').addEventListener('click', function () {
    currentTool = 'pen';
    canvas.style.pointerEvents = 'auto';
    setPanelsForTool(true, false);
    updateToolButtons(this);
});

document.getElementById('btn-type').addEventListener('click', function () {
    currentTool = 'type';
    canvas.style.pointerEvents = 'none';
    setPanelsForTool(false, false);
    updateToolButtons(this);
});

document.getElementById('btn-shape').addEventListener('click', function () {
    currentTool = 'shape';
    canvas.style.pointerEvents = 'auto';
    setPanelsForTool(false, true);
    updateToolButtons(this);
});

document.getElementById('btn-equation').addEventListener('click', function () {
    updateToolButtons(this);
    showEquationModal();
});

document.getElementById('btn-erase').addEventListener('click', function () {
    currentTool = 'eraser';
    canvas.style.pointerEvents = 'auto';
    setPanelsForTool(false, false);
    updateToolButtons(this);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Clear all pen strokes and shapes from this page? (Photos, text and equations are not affected)')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

document.getElementById('pen-color').addEventListener('input', (e) => {
    currentPenColor = e.target.value;
    ctx.strokeStyle = currentPenColor;
});

document.getElementById('pen-weight').addEventListener('change', (e) => {
    currentPenWeight = parseInt(e.target.value);
    ctx.lineWidth = currentPenWeight;
});

document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentShape = e.currentTarget.getAttribute('data-shape');
    });
});

function updateToolButtons(activeBtn) {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    if (activeBtn && activeBtn.id !== 'btn-equation') activeBtn.classList.add('active');
}

// --- Sidebar collapse (extra canvas room) ---
const sidebarHeader = document.querySelector('.sidebar-header');
if (sidebarHeader) {
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'sidebar-collapse-btn';
    collapseBtn.title = 'Collapse sidebar for more canvas room';
    collapseBtn.innerHTML = '<i class="fa-solid fa-angles-left"></i>';
    collapseBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
        setTimeout(resizeCanvas, 260);
    });
    sidebarHeader.appendChild(collapseBtn);
}

// --- Fullscreen board toggle ---
document.getElementById('btn-fullscreen').addEventListener('click', function () {
    document.body.classList.toggle('board-fullscreen');
    const icon = this.querySelector('i');
    const isFull = document.body.classList.contains('board-fullscreen');
    icon.className = isFull ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    this.lastChild.textContent = isFull ? ' Exit Fullscreen' : ' Fullscreen';
    setTimeout(resizeCanvas, 280);
});

// ======================================================================
// --- Photo Upload & Manipulation ---
// ======================================================================
const photoInput = document.getElementById('photo-input');
const photosContainer = document.getElementById('photos-container');

document.getElementById('btn-photo').addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            createPhotoElement(event.target.result, { left: '60px', top: '60px', width: '250px', height: '200px' });
        };
        reader.readAsDataURL(file);
    }
    photoInput.value = '';
});

function createPhotoElement(imageSrc, opts) {
    opts = opts || {};
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.style.left = opts.left || '50px';
    photoElement.style.top = opts.top || '50px';
    photoElement.style.width = opts.width || '250px';
    photoElement.style.height = opts.height || '200px';
    photoElement.style.zIndex = opts.zIndex || (++topZIndex);
    photoElement.dataset.rotation = opts.rotation || 0;

    photoElement.innerHTML = `
        <div class="rotate-handle" title="Drag to rotate"><i class="fa-solid fa-rotate"></i></div>
        <img src="${imageSrc}" alt="Inserted photo" draggable="false" style="transform: rotate(${opts.rotation || 0}deg); opacity:${opts.opacity != null ? opts.opacity : 1};">
        <div class="photo-controls">
            <button class="photo-btn front-btn" title="Bring to front"><i class="fa-solid fa-arrow-up-1-9"></i></button>
            <button class="photo-btn flip-btn" title="Flip horizontal"><i class="fa-solid fa-left-right"></i></button>
            <button class="photo-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="resize-handle" title="Drag to resize"></div>
    `;

    photosContainer.appendChild(photoElement);
    setupPhotoInteraction(photoElement);
    return photoElement;
}

function setupPhotoInteraction(photoElement) {
    const img = photoElement.querySelector('img');
    let rotation = parseFloat(photoElement.dataset.rotation) || 0;
    let flipped = false;

    function applyTransform() {
        img.style.transform = `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;
        photoElement.dataset.rotation = rotation;
    }

    // Drag to move
    let isDragging = false;
    let startX, startY;
    photoElement.addEventListener('mousedown', (e) => {
        if (e.target.closest('.photo-controls') || e.target.closest('.resize-handle') || e.target.closest('.rotate-handle')) return;
        if (currentTool !== 'move') return;
        isDragging = true;
        startX = e.clientX - photoElement.offsetLeft;
        startY = e.clientY - photoElement.offsetTop;
        photoElement.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            photoElement.style.left = (e.clientX - startX) + 'px';
            photoElement.style.top = (e.clientY - startY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        photoElement.classList.remove('dragging');
    });

    // Resize via handle
    const resizeHandle = photoElement.querySelector('.resize-handle');
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const startWidth = photoElement.offsetWidth;
        const startHeight = photoElement.offsetHeight;
        const sx = e.clientX, sy = e.clientY;

        const onMove = (moveEvent) => {
            const newWidth = Math.max(80, startWidth + (moveEvent.clientX - sx));
            const newHeight = Math.max(60, startHeight + (moveEvent.clientY - sy));
            photoElement.style.width = newWidth + 'px';
            photoElement.style.height = newHeight + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    // Rotate via handle
    const rotateHandle = photoElement.querySelector('.rotate-handle');
    rotateHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const onMove = (moveEvent) => {
            const rect = photoElement.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const angle = Math.atan2(moveEvent.clientY - cy, moveEvent.clientX - cx) * 180 / Math.PI + 90;
            rotation = Math.round(angle);
            applyTransform();
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    photoElement.querySelector('.front-btn').addEventListener('click', () => {
        photoElement.style.zIndex = ++topZIndex;
    });

    photoElement.querySelector('.flip-btn').addEventListener('click', () => {
        flipped = !flipped;
        applyTransform();
    });

    photoElement.querySelector('.delete-btn').addEventListener('click', () => {
        photoElement.remove();
    });
}

// ======================================================================
// --- Text Input Tool (with formatting) ---
// ======================================================================
const textModal = document.getElementById('text-modal');
const editTextModal = document.getElementById('edit-text-modal');
const textInput = document.getElementById('text-input');
const editTextInput = document.getElementById('edit-text-input');
const textBoxesContainer = document.getElementById('text-boxes-container');

function makeTextStyleState(prefix) {
    return {
        bold: false,
        italic: false,
        underline: false,
        align: 'left',
        get fontFamily() { return document.getElementById(`${prefix}-font-family`).value; },
        get fontSize() { return document.getElementById(`${prefix}-font-size`).value; },
        get color() { return document.getElementById(`${prefix}-color-input`).value; },
        get bg() { return document.getElementById(`${prefix}-bg-input`).value; }
    };
}

const addTextStyle = makeTextStyleState('text');
const editTextStyle = makeTextStyleState('edit-text');

function wireFormatToolbar(prefix, state) {
    const boldBtn = document.getElementById(`${prefix}-bold-btn`);
    const italicBtn = document.getElementById(`${prefix}-italic-btn`);
    const underlineBtn = document.getElementById(`${prefix}-underline-btn`);
    const alignBtns = {
        left: document.getElementById(`${prefix}-align-left`),
        center: document.getElementById(`${prefix}-align-center`),
        right: document.getElementById(`${prefix}-align-right`)
    };

    boldBtn.addEventListener('click', () => { state.bold = !state.bold; boldBtn.classList.toggle('active', state.bold); });
    italicBtn.addEventListener('click', () => { state.italic = !state.italic; italicBtn.classList.toggle('active', state.italic); });
    underlineBtn.addEventListener('click', () => { state.underline = !state.underline; underlineBtn.classList.toggle('active', state.underline); });

    Object.keys(alignBtns).forEach(key => {
        alignBtns[key].addEventListener('click', () => {
            state.align = key;
            Object.values(alignBtns).forEach(b => b.classList.remove('active'));
            alignBtns[key].classList.add('active');
        });
    });

    return { boldBtn, italicBtn, underlineBtn, alignBtns };
}

const addFormatEls = wireFormatToolbar('text', addTextStyle);
const editFormatEls = wireFormatToolbar('edit-text', editTextStyle);

function resetFormatToolbar(prefix, state, els) {
    state.bold = false; state.italic = false; state.align = 'left';
    els.boldBtn.classList.remove('active');
    els.italicBtn.classList.remove('active');
    els.underlineBtn.classList.remove('active');
    Object.values(els.alignBtns).forEach(b => b.classList.remove('active'));
    els.alignBtns.left.classList.add('active');
    document.getElementById(`${prefix}-font-family`).value = 'Poppins, sans-serif';
    document.getElementById(`${prefix}-font-size`).value = '16';
    document.getElementById(`${prefix}-color-input`).value = '#1f2937';
    document.getElementById(`${prefix}-bg-input`).value = '#ffffff';
}

contentStage.addEventListener('click', (e) => {
    if (currentTool !== 'type') return;
    if (e.target.closest('.text-box') || e.target.closest('.text-box-controls')) return;

    textInputPosition.x = e.clientX - contentStage.getBoundingClientRect().left;
    textInputPosition.y = e.clientY - contentStage.getBoundingClientRect().top;

    textInput.value = '';
    resetFormatToolbar('text', addTextStyle, addFormatEls);
    textModal.style.display = 'flex';
    textInput.focus();
});

document.getElementById('text-modal-save').addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        createTextBox(text, textInputPosition.x, textInputPosition.y, {
            fontFamily: addTextStyle.fontFamily,
            fontSize: addTextStyle.fontSize,
            color: addTextStyle.color,
            bg: addTextStyle.bg,
            bold: addTextStyle.bold,
            italic: addTextStyle.italic,
            underline: addTextStyle.underline,
            align: addTextStyle.align
        });
    }
    textModal.style.display = 'none';
});

document.getElementById('text-modal-cancel').addEventListener('click', () => {
    textModal.style.display = 'none';
});

document.getElementById('edit-text-save').addEventListener('click', () => {
    const text = editTextInput.value.trim();
    if (text && editingTextBox) {
        applyTextBoxStyle(editingTextBox, {
            fontFamily: editTextStyle.fontFamily,
            fontSize: editTextStyle.fontSize,
            color: editTextStyle.color,
            bg: editTextStyle.bg,
            bold: editTextStyle.bold,
            italic: editTextStyle.italic,
            underline: editTextStyle.underline,
            align: editTextStyle.align
        });
        editingTextBox.setAttribute('data-text', text);
        renderTextBoxContent(editingTextBox, text);
    }
    editTextModal.style.display = 'none';
    editingTextBox = null;
});

document.getElementById('edit-text-cancel').addEventListener('click', () => {
    editTextModal.style.display = 'none';
    editingTextBox = null;
});

function applyTextBoxStyle(textBox, style) {
    textBox.style.fontFamily = style.fontFamily;
    textBox.style.fontSize = (style.fontSize || 16) + 'px';
    textBox.style.color = style.color;
    textBox.style.backgroundColor = style.bg;
    textBox.style.textAlign = style.align || 'left';
    textBox.dataset.bold = style.bold ? '1' : '0';
    textBox.dataset.italic = style.italic ? '1' : '0';
    textBox.dataset.underline = style.underline ? '1' : '0';
}

function renderTextBoxContent(textBox, text) {
    textBox.innerHTML = `${escapeHtml(text).replace(/\n/g, '<br>')}<div class="text-box-controls">
            <button class="text-box-btn edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="text-box-btn delete-box-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    textBox.querySelector('.edit-btn').addEventListener('click', () => openEditTextModal(textBox));
    textBox.querySelector('.delete-box-btn').addEventListener('click', () => textBox.remove());
}

function openEditTextModal(textBox) {
    editingTextBox = textBox;
    editTextInput.value = textBox.getAttribute('data-text');
    document.getElementById('edit-text-font-family').value = textBox.style.fontFamily || 'Poppins, sans-serif';
    document.getElementById('edit-text-font-size').value = parseInt(textBox.style.fontSize) || 16;
    document.getElementById('edit-text-color-input').value = rgbToHex(textBox.style.color) || '#1f2937';
    document.getElementById('edit-text-bg-input').value = rgbToHex(textBox.style.backgroundColor) || '#ffffff';
    editTextStyle.bold = textBox.dataset.bold === '1';
    editTextStyle.italic = textBox.dataset.italic === '1';
    editTextStyle.underline = textBox.dataset.underline === '1';
    editTextStyle.align = textBox.style.textAlign || 'left';
    editFormatEls.boldBtn.classList.toggle('active', editTextStyle.bold);
    editFormatEls.italicBtn.classList.toggle('active', editTextStyle.italic);
    editFormatEls.underlineBtn.classList.toggle('active', editTextStyle.underline);
    Object.values(editFormatEls.alignBtns).forEach(b => b.classList.remove('active'));
    (editFormatEls.alignBtns[editTextStyle.align] || editFormatEls.alignBtns.left).classList.add('active');
    editTextModal.style.display = 'flex';
    editTextInput.focus();
}

function rgbToHex(rgb) {
    if (!rgb) return null;
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/\d+/g);
    if (!match) return null;
    return '#' + match.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

function createTextBox(text, x, y, style) {
    style = style || {};
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    textBox.setAttribute('data-text', text);
    textBox.style.left = x + 'px';
    textBox.style.top = y + 'px';
    textBox.style.zIndex = ++topZIndex;

    applyTextBoxStyle(textBox, {
        fontFamily: style.fontFamily || 'Poppins, sans-serif',
        fontSize: style.fontSize || 16,
        color: style.color || '#1f2937',
        bg: style.bg || '#ffffff',
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
        align: style.align || 'left'
    });

    renderTextBoxContent(textBox, text);
    textBoxesContainer.appendChild(textBox);
    setupTextBoxInteraction(textBox);
    return textBox;
}

function setupTextBoxInteraction(textBox) {
    let isDragging = false;
    let offsetX, offsetY;

    textBox.addEventListener('mousedown', (e) => {
        if (e.target.closest('.text-box-controls')) return;
        if (currentTool !== 'move') return;

        isDragging = true;
        offsetX = e.clientX - textBox.offsetLeft;
        offsetY = e.clientY - textBox.offsetTop;
        textBox.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            textBox.style.left = (e.clientX - offsetX) + 'px';
            textBox.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        textBox.classList.remove('dragging');
    });
}

// ======================================================================
// --- Equation Tool: LaTeX with live preview & symbol palette ---
// ======================================================================
const equationModal = document.getElementById('equation-modal');
const equationLatexInput = document.getElementById('equation-latex-input');
const equationLivePreview = document.getElementById('equation-live-preview');
const equationContainer = document.getElementById('equation-container');

function showEquationModal() {
    editingEquationEl = null;
    equationLatexInput.value = '';
    updateEquationPreview();
    equationModal.style.display = 'flex';
    equationLatexInput.focus();
}

function updateEquationPreview() {
    const latex = equationLatexInput.value.trim();
    if (!latex) {
        equationLivePreview.innerHTML = '<em>Your equation will appear here...</em>';
        return;
    }
    equationLivePreview.innerHTML = `\\[ ${latex} \\]`;
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([equationLivePreview]).catch((err) => console.log(err.message));
    }
}

equationLatexInput.addEventListener('input', updateEquationPreview);

document.querySelectorAll('.latex-sym-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const snippet = btn.getAttribute('data-insert');
        insertLatexSnippet(snippet);
    });
});

function insertLatexSnippet(snippet) {
    const el = equationLatexInput;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = el.value.substring(0, start);
    const after = el.value.substring(end);
    const caretIndex = snippet.indexOf('§');
    const clean = snippet.replace('§', '');
    el.value = before + clean + after;
    const newCaret = start + (caretIndex >= 0 ? caretIndex : clean.length);
    el.focus();
    el.setSelectionRange(newCaret, newCaret);
    updateEquationPreview();
}

document.getElementById('equation-modal-save').addEventListener('click', () => {
    const latex = equationLatexInput.value.trim();
    if (!latex) { equationModal.style.display = 'none'; return; }

    if (editingEquationEl) {
        editingEquationEl.setAttribute('data-latex', latex);
        renderEquationContent(editingEquationEl, latex);
    } else {
        createEquationElement(latex, 100, 100);
    }
    equationModal.style.display = 'none';
});

document.getElementById('equation-modal-cancel').addEventListener('click', () => {
    equationModal.style.display = 'none';
});

function renderEquationContent(eqEl, latex) {
    eqEl.innerHTML = `<div class="equation-render">\\[ ${latex} \\]</div><div class="equation-controls">
            <button class="eq-btn edit-eq-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="eq-btn delete-eq-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([eqEl]).catch((err) => console.log(err.message));
    }
    eqEl.querySelector('.edit-eq-btn').addEventListener('click', () => {
        editingEquationEl = eqEl;
        equationLatexInput.value = eqEl.getAttribute('data-latex') || '';
        updateEquationPreview();
        equationModal.style.display = 'flex';
    });
    eqEl.querySelector('.delete-eq-btn').addEventListener('click', () => eqEl.remove());
}

function createEquationElement(latex, x, y) {
    const eqContainer = document.createElement('div');
    eqContainer.className = 'equation-item';
    eqContainer.style.left = x + 'px';
    eqContainer.style.top = y + 'px';
    eqContainer.style.zIndex = ++topZIndex;
    eqContainer.setAttribute('data-latex', latex);
    renderEquationContent(eqContainer, latex);
    equationContainer.appendChild(eqContainer);
    setupEquationInteraction(eqContainer);
    return eqContainer;
}

function setupEquationInteraction(eqContainer) {
    let isDragging = false;
    let offsetX, offsetY;

    eqContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('.equation-controls')) return;
        if (currentTool !== 'move') return;

        isDragging = true;
        offsetX = e.clientX - eqContainer.offsetLeft;
        offsetY = e.clientY - eqContainer.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            eqContainer.style.left = (e.clientX - offsetX) + 'px';
            eqContainer.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
}

// ======================================================================
// --- Annotation Persistence (drawings/photos/text/equations per page) ---
// ======================================================================
function captureAnnotations() {
    let drawing = null;
    try {
        const dataUrl = canvas.toDataURL('image/png');
        if (dataUrl !== blankCanvasSnapshot) drawing = dataUrl;
    } catch (e) { /* ignore */ }

    const photos = Array.from(photosContainer.children).map(el => ({
        src: el.querySelector('img').getAttribute('src'),
        left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height,
        rotation: el.dataset.rotation || 0,
        zIndex: el.style.zIndex || 1,
        opacity: el.querySelector('img').style.opacity || 1
    }));

    const textBoxes = Array.from(textBoxesContainer.children).map(el => ({
        text: el.getAttribute('data-text'),
        left: el.style.left, top: el.style.top,
        fontFamily: el.style.fontFamily, fontSize: el.style.fontSize,
        color: el.style.color, bg: el.style.backgroundColor,
        bold: el.dataset.bold === '1', italic: el.dataset.italic === '1',
        underline: el.dataset.underline === '1', align: el.style.textAlign,
        zIndex: el.style.zIndex || 1
    }));

    const equations = Array.from(equationContainer.children).map(el => ({
        latex: el.getAttribute('data-latex'),
        left: el.style.left, top: el.style.top,
        zIndex: el.style.zIndex || 1
    }));

    if (!drawing && photos.length === 0 && textBoxes.length === 0 && equations.length === 0) {
        return null;
    }
    return { drawing, photos, textBoxes, equations };
}

function swapAnnotations() {
    if (activeAnnotationKey) {
        const snapshot = captureAnnotations();
        if (snapshot) {
            annotationsDB[activeAnnotationKey] = snapshot;
        } else {
            delete annotationsDB[activeAnnotationKey];
        }
        persistAnnotations();
    }
}

function restoreAnnotations(key) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    photosContainer.innerHTML = '';
    textBoxesContainer.innerHTML = '';
    equationContainer.innerHTML = '';

    activeAnnotationKey = key;
    const data = annotationsDB[key];
    if (!data) return;

    if (data.drawing) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = data.drawing;
    }
    (data.photos || []).forEach(p => createPhotoElement(p.src, p));
    (data.textBoxes || []).forEach(t => {
        const box = createTextBox(t.text, parseFloat(t.left) || 0, parseFloat(t.top) || 0, t);
        if (t.zIndex) box.style.zIndex = t.zIndex;
    });
    (data.equations || []).forEach(eq => createEquationElement(eq.latex, parseFloat(eq.left) || 0, parseFloat(eq.top) || 0));
}

window.addEventListener('beforeunload', () => {
    swapAnnotations();
});

// ======================================================================
// --- Add Page: Section Builder ---
// ======================================================================
const pageEditorModal = document.getElementById('page-editor-modal');
const pageEditorTitle = document.getElementById('page-editor-title');
const pageSectionsList = document.getElementById('page-sections-list');
const sectionBlockTemplate = document.getElementById('section-block-template');
const pdfUrlInput = document.getElementById('pdf-url-input');
const pdfPageRangeInput = document.getElementById('pdf-page-range-input');

let sectionIdCounter = 0;

const tabDisplayNames = {
    intro: 'Intro', concept: 'Concept', formula: 'Formula', activities: 'Activity',
    examples: 'Example', practice: 'Practice', quiz: 'Quiz', blank: 'Page'
};

function addSectionBlock(defaultType) {
    const clone = sectionBlockTemplate.content.cloneNode(true);
    const block = clone.querySelector('.section-block');
    const id = ++sectionIdCounter;
    block.dataset.sectionId = id;

    const typeSelect = block.querySelector('.section-type-select');
    typeSelect.value = defaultType || 'standard';

    const standardFields = block.querySelector('.section-standard-fields');
    const latexFields = block.querySelector('.section-latex-fields');
    const photoFields = block.querySelector('.section-photo-fields');

    function refreshVisibility() {
        const type = typeSelect.value;
        standardFields.style.display = type === 'standard' ? 'block' : 'none';
        latexFields.style.display = type === 'latex' ? 'block' : 'none';
        photoFields.style.display = type === 'photo' ? 'block' : 'none';
    }
    typeSelect.addEventListener('change', refreshVisibility);
    refreshVisibility();

    const latexTextarea = block.querySelector('.section-formula-latex');
    const latexPreview = block.querySelector('.section-formula-preview');
    latexTextarea.addEventListener('input', () => {
        const val = latexTextarea.value.trim();
        if (!val) { latexPreview.innerHTML = '<em>Your formula will appear here...</em>'; return; }
        latexPreview.innerHTML = `\\[ ${val} \\]`;
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([latexPreview]).catch(err => console.log(err.message));
        }
    });

    block.querySelector('.section-remove-btn').addEventListener('click', () => {
        block.remove();
    });

    pageSectionsList.appendChild(block);
}

document.getElementById('add-section-btn').addEventListener('click', () => addSectionBlock('standard'));

document.getElementById('btn-add-page').addEventListener('click', () => {
    const tabData = getTabData(currentLesson, currentTab);
    pageSectionsList.innerHTML = '';

    const defaultType = currentTab === 'formula' ? 'latex' : 'standard';
    addSectionBlock(defaultType);

    pdfUrlInput.value = tabData.pdfUrl || '';
    pdfPageRangeInput.value = tabData.pageRange || '';

    pageEditorTitle.textContent = `Add Page to ${tabDisplayNames[currentTab] || 'Tab'}`;
    pageEditorModal.style.display = 'flex';
});

function buildSectionHtml(block) {
    const type = block.querySelector('.section-type-select').value;

    if (type === 'latex') {
        const latex = block.querySelector('.section-formula-latex').value.trim();
        if (!latex) return Promise.resolve('');
        const heading = block.querySelector('.section-formula-heading').value.trim();
        const html = `<div class="page-section formula-box">${heading ? `<strong>${escapeHtml(heading)}:</strong><br><br>` : ''}\\[ ${latex} \\]</div>`;
        return Promise.resolve(html);
    }

    if (type === 'photo') {
        const heading = block.querySelector('.section-photo-heading').value.trim();
        const urlVal = block.querySelector('.section-photo-url').value.trim();
        const file = block.querySelector('.section-photo-file').files[0];

        if (file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(`<div class="page-section tab-photo-page">${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}<img src="${event.target.result}" alt="Page Photo" class="tab-content-image"></div>`);
                };
                reader.readAsDataURL(file);
            });
        } else if (urlVal) {
            return Promise.resolve(`<div class="page-section tab-photo-page">${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}<img src="${escapeHtml(urlVal)}" alt="Page Photo" class="tab-content-image"></div>`);
        }
        return Promise.resolve('');
    }

    // standard
    const heading = block.querySelector('.section-heading').value.trim();
    const body = block.querySelector('.section-content').value.trim();
    if (!body && !heading) return Promise.resolve('');
    const html = `<div class="page-section">${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}${body ? `<p>${escapeHtml(body).replace(/\n/g, '<br>')}</p>` : ''}</div>`;
    return Promise.resolve(html);
}

document.getElementById('page-editor-save').addEventListener('click', () => {
    const tabData = getTabData(currentLesson, currentTab);
    tabData.pdfUrl = pdfUrlInput.value.trim();
    tabData.pageRange = pdfPageRangeInput.value.trim();

    const blocks = Array.from(pageSectionsList.querySelectorAll('.section-block'));
    Promise.all(blocks.map(buildSectionHtml)).then((htmlPieces) => {
        const combined = htmlPieces.filter(h => h && h.trim()).join('');
        if (combined) {
            tabData.content.push(combined);
            currentPageIndex = tabData.content.length - 1;
        }
        persistDatabase();
        pageEditorModal.style.display = 'none';
        loadContent();
        showToast('Page saved!', 'success');
    });
});

document.getElementById('page-editor-cancel').addEventListener('click', () => {
    pageEditorModal.style.display = 'none';
});

// ======================================================================
// --- References & Resources ---
// ======================================================================
const referenceModal = document.getElementById('reference-modal');
const refTitleInput = document.getElementById('ref-title-input');
const refTypeSelect = document.getElementById('ref-type-select');
const refFileGroup = document.getElementById('ref-file-group');
const refLinkGroup = document.getElementById('ref-link-group');
const refFileInput = document.getElementById('ref-file-input');
const refLinkInput = document.getElementById('ref-link-input');
const referencesContainer = document.getElementById('references-container');

const refIcons = {
    image: 'fa-solid fa-image',
    pdf: 'fa-solid fa-file-pdf',
    link: 'fa-solid fa-link'
};

function renderReferences() {
    const lesson = lessonDatabase[currentLesson];
    referencesContainer.innerHTML = '';

    if (!lesson || !lesson.resources || lesson.resources.length === 0) {
        referencesContainer.innerHTML = '<p class="no-references">No references added for this day yet.</p>';
        return;
    }

    lesson.resources.forEach((ref, index) => {
        const item = document.createElement('div');
        item.className = 'reference-item';
        item.innerHTML = `
            <a href="${ref.url}" target="_blank" rel="noopener" title="${escapeHtml(ref.title)}">
                <i class="${refIcons[ref.type] || 'fa-solid fa-file'} ref-icon"></i>${escapeHtml(ref.title)}
            </a>
            <button class="ref-delete-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
        `;
        item.querySelector('.ref-delete-btn').addEventListener('click', () => {
            lesson.resources.splice(index, 1);
            persistDatabase();
            renderReferences();
        });
        referencesContainer.appendChild(item);
    });
}

document.getElementById('btn-add-reference').addEventListener('click', () => {
    refTitleInput.value = '';
    refFileInput.value = '';
    refLinkInput.value = '';
    refTypeSelect.value = 'image';
    refFileGroup.style.display = 'block';
    refLinkGroup.style.display = 'none';
    referenceModal.style.display = 'flex';
    refTitleInput.focus();
});

refTypeSelect.addEventListener('change', () => {
    if (refTypeSelect.value === 'link') {
        refFileGroup.style.display = 'none';
        refLinkGroup.style.display = 'block';
    } else {
        refFileGroup.style.display = 'block';
        refLinkGroup.style.display = 'none';
    }
});

function addReference(type, title, url) {
    if (lessonDatabase[currentLesson]) {
        if (!lessonDatabase[currentLesson].resources) {
            lessonDatabase[currentLesson].resources = [];
        }
        lessonDatabase[currentLesson].resources.push({ type, title, url });
        persistDatabase();
        renderReferences();
    }
    referenceModal.style.display = 'none';
}

document.getElementById('reference-modal-save').addEventListener('click', () => {
    const title = refTitleInput.value.trim();
    const type = refTypeSelect.value;

    if (!title) { refTitleInput.focus(); return; }

    if (type === 'link') {
        const url = refLinkInput.value.trim();
        if (!url) { refLinkInput.focus(); return; }
        addReference('link', title, url);
        return;
    }

    const file = refFileInput.files[0];
    if (!file) { refFileInput.focus(); return; }
    const reader = new FileReader();
    reader.onload = (event) => { addReference(type, title, event.target.result); };
    reader.readAsDataURL(file);
});

document.getElementById('reference-modal-cancel').addEventListener('click', () => {
    referenceModal.style.display = 'none';
});

// ======================================================================
// --- Filter Bar Logic & LocalStorage Persistence ---
// ======================================================================
const classFilter = document.getElementById('class-filter');
const unitFilter = document.getElementById('unit-filter');
const titleFilter = document.getElementById('title-filter');
const dayFilter = document.getElementById('day-filter');
const filterStatus = document.getElementById('filter-status');
const filterResultsGroup = document.getElementById('filter-results-group');
const fileResultsSelect = document.getElementById('file-results-select');

function saveFilterPreferences() {
    const filterState = {
        classVal: classFilter.value,
        unitVal: unitFilter.value,
        dayVal: dayFilter.value,
        titleVal: titleFilter.value
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterState));
}

function loadSavedFilters() {
    try {
        const saved = localStorage.getItem(FILTER_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            classFilter.value = parsed.classVal || '';
            unitFilter.value = parsed.unitVal || '';
            dayFilter.value = parsed.dayVal || '';
            titleFilter.value = parsed.titleVal || '';
        }
    } catch (e) { /* ignore */ }
}

function loadLessonById(lessonId) {
    currentLesson = lessonId;
    if (lessonId !== 'blank') lastDayLesson = lessonId;
    currentTab = 'intro';
    currentPageIndex = 0;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const introBtn = document.querySelector('.nav-btn[data-target="intro"]');
    if (introBtn) {
        introBtn.classList.add('active');
        updateTabLabel(introBtn);
    }

    loadContent();
    restoreAnnotations(getAnnotationKey());
}

function applyFilters() {
    saveFilterPreferences();

    const classVal = classFilter.value;
    const unitVal = unitFilter.value;
    const dayVal = dayFilter.value;
    const titleVal = titleFilter.value.trim().toLowerCase();

    const anyFilterActive = classVal || unitVal || dayVal || titleVal;

    if (!anyFilterActive) {
        filterStatus.textContent = '';
        filterStatus.className = 'filter-status';
        filterResultsGroup.style.display = 'none';
        return;
    }

    const matches = Object.values(lessonDatabase).filter(lesson => {
        if (lesson.id === 'blank') return false;
        if (classVal && lesson.class !== classVal) return false;
        if (unitVal && lesson.unit !== unitVal) return false;
        if (dayVal && lesson.day !== dayVal) return false;
        if (titleVal && !lesson.title.toLowerCase().includes(titleVal)) return false;
        return true;
    });

    if (matches.length === 0) {
        filterStatus.textContent = 'No matching day file found';
        filterStatus.className = 'filter-status no-results';
        filterResultsGroup.style.display = 'none';
        return;
    }

    filterStatus.textContent = `${matches.length} day file${matches.length > 1 ? 's' : ''} found`;
    filterStatus.className = 'filter-status has-results';

    if (matches.length === 1) {
        filterResultsGroup.style.display = 'none';
        loadLessonById(matches[0].id);
        return;
    }

    filterResultsGroup.style.display = 'flex';
    fileResultsSelect.innerHTML = matches.map(m => `<option value="${m.id}">${escapeHtml(m.title)} (${m.day})</option>`).join('');
    loadLessonById(matches[0].id);
}

fileResultsSelect.addEventListener('change', () => {
    if (fileResultsSelect.value) loadLessonById(fileResultsSelect.value);
});

[classFilter, unitFilter, dayFilter].forEach(el => el.addEventListener('change', applyFilters));
titleFilter.addEventListener('input', applyFilters);

document.getElementById('btn-filter-clear').addEventListener('click', () => {
    classFilter.value = '';
    unitFilter.value = '';
    dayFilter.value = '';
    titleFilter.value = '';
    filterStatus.textContent = '';
    filterStatus.className = 'filter-status';
    filterResultsGroup.style.display = 'none';
    saveFilterPreferences();
});

// ======================================================================
// --- Export: PNG snapshot & real PDF ---
// ======================================================================
function withExportChrome(hideFn, showFn) {
    document.body.classList.add('exporting');
    const paginationControls = document.getElementById('pagination-controls');
    const originalDisplay = paginationControls.style.display;
    paginationControls.style.display = 'none';
    return () => {
        document.body.classList.remove('exporting');
        paginationControls.style.display = originalDisplay;
    };
}

document.getElementById('btn-download').addEventListener('click', () => {
    const exportArea = document.getElementById('export-area');
    const restore = withExportChrome();

    html2canvas(exportArea, { backgroundColor: null, useCORS: true }).then(canvasElement => {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        link.download = `Math_Simulation_${currentLesson}_${currentTab}_${timestamp}.png`;
        link.href = canvasElement.toDataURL('image/png');
        link.click();
        restore();
    }).catch(() => {
        restore();
        showToast('PNG export failed.', 'error');
    });
});

document.getElementById('btn-pdf').addEventListener('click', () => {
    const exportArea = document.getElementById('export-area');
    const restore = withExportChrome();
    const timestamp = new Date().toISOString().slice(0, 10);

    const opt = {
        margin: 8,
        filename: `Lesson_${currentLesson}_${currentTab}_p${currentPageIndex + 1}_${timestamp}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast('Generating PDF...', 'info');
    html2pdf().set(opt).from(exportArea).save().then(() => {
        restore();
        showToast('PDF downloaded!', 'success');
    }).catch(() => {
        restore();
        showToast('PDF export failed.', 'error');
    });
});

// ======================================================================
// --- Backup / Restore (JSON export & import, for manual cloud sync) ---
// ======================================================================
document.getElementById('btn-backup').addEventListener('click', () => {
    swapAnnotations();
    const backupData = {
        type: 'math-simulation-backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        lessonDatabase,
        annotationsDB
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `math-simulation-backup-${dateStr}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded — save it to Drive/Dropbox to access it elsewhere.', 'success');
});

const restoreInput = document.getElementById('restore-input');
document.getElementById('btn-restore').addEventListener('click', () => {
    restoreInput.click();
});

restoreInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (!parsed.lessonDatabase) throw new Error('Invalid backup file');
            lessonDatabase = parsed.lessonDatabase;
            annotationsDB = parsed.annotationsDB || {};
            persistDatabase();
            persistAnnotations();
            activeAnnotationKey = null;
            loadLessonById(currentLesson in lessonDatabase ? currentLesson : Object.keys(lessonDatabase)[0]);
            showToast('Backup restored successfully!', 'success');
        } catch (err) {
            showToast('That file could not be read as a backup.', 'error');
        }
    };
    reader.readAsText(file);
    restoreInput.value = '';
});

// ======================================================================
// --- Modal dismissal ---
// ======================================================================
document.addEventListener('click', (e) => {
    if (e.target === textModal) textModal.style.display = 'none';
    if (e.target === editTextModal) editTextModal.style.display = 'none';
    if (e.target === pageEditorModal) pageEditorModal.style.display = 'none';
    if (e.target === referenceModal) referenceModal.style.display = 'none';
    if (e.target === equationModal) equationModal.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        textModal.style.display = 'none';
        editTextModal.style.display = 'none';
        pageEditorModal.style.display = 'none';
        referenceModal.style.display = 'none';
        equationModal.style.display = 'none';
    }
});

// ======================================================================
// --- Initial Load & Filter Restoration ---
// ======================================================================
loadSavedFilters();
if (classFilter.value || unitFilter.value || dayFilter.value || titleFilter.value) {
    applyFilters();
} else {
    loadContent();
}
