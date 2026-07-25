// --- Database of Daily Lessons ---
const defaultLessonDatabase = {
    blank: {
        id: 'blank',
        class: '',
        unit: '',
        day: '',
        title: 'Blank Page',
        tabs: {
            intro: {
                content: ["<h3>📄 Blank Page</h3><p>Use this blank page for quick notes and drawings during class.</p>"],
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

// Load Database from LocalStorage or Default
let lessonDatabase = loadSavedDatabase();

function loadSavedDatabase() {
    try {
        const saved = localStorage.getItem(DB_STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultLessonDatabase;
    } catch(e) {
        return defaultLessonDatabase;
    }
}

function persistDatabase() {
    try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(lessonDatabase));
    } catch(e) {
        console.error("Could not save to LocalStorage:", e);
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

// --- Navigation & Pagination Logic ---
let currentLesson = 'day2';
let currentTab = 'intro';
let currentPageIndex = 0;
let currentTabContentArray = [];
let currentTool = 'pen';
let currentShape = 'rectangle';
let isDrawing = false;
let textInputPosition = { x: 0, y: 0 };
let editingTextBox = null;
let shapeStartX = 0;
let shapeStartY = 0;
let currentPenColor = '#e53e3e';
let currentPenWeight = 3;
let geogebraApp = null;

function loadContent() {
    const contentDiv = document.getElementById('lesson-content');
    const paginationControls = document.getElementById('pagination-controls');
    const pageIndicator = document.getElementById('page-indicator');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    const contentStage = document.querySelector('.content-stage');
    const lessonContainer = document.querySelector('.lesson-container');

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

    // Build standard text/html content
    let htmlOutput = currentTabContentArray[currentPageIndex] || "";

    // Append embedded PDF viewer if PDF URL and page range exist
    if (tabData.pdfUrl && tabData.pageRange) {
        // Calculate dynamic PDF page offset based on currentPageIndex if range provided
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
    
    if (window.MathJax) {
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
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPageIndex < currentTabContentArray.length - 1) {
        currentPageIndex++;
        loadContent();
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
    });
});

document.getElementById('blank-page-btn').addEventListener('click', function(e) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    if (currentLesson !== 'blank') {
        lastDayLesson = currentLesson;
    }
    currentLesson = 'blank';
    currentTab = 'intro';
    currentPageIndex = 0;
    loadContent();
});

// --- Interactive Whiteboard (Canvas) Logic ---
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('shape-preview-board');
const previewCtx = previewCanvas.getContext('2d');
const contentStage = document.querySelector('.content-stage');
let isShapeDragging = false;

function resizeCanvas() {
    canvas.width = contentStage.offsetWidth;
    canvas.height = contentStage.offsetHeight;
    previewCanvas.width = contentStage.offsetWidth;
    previewCanvas.height = contentStage.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

ctx.lineWidth = currentPenWeight;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = currentPenColor;

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

function renderShape(targetCtx, startX, startY, endX, endY, shape) {
    const width = endX - startX;
    const height = endY - startY;

    targetCtx.strokeStyle = currentPenColor;
    targetCtx.lineWidth = currentPenWeight;
    targetCtx.lineJoin = 'round';
    targetCtx.lineCap = 'round';

    switch (shape) {
        case 'rectangle':
            targetCtx.strokeRect(startX, startY, width, height);
            break;
        case 'circle': {
            const radius = Math.sqrt(width * width + height * height) / 2;
            targetCtx.beginPath();
            targetCtx.arc(startX + width / 2, startY + height / 2, radius, 0, 2 * Math.PI);
            targetCtx.stroke();
            break;
        }
        case 'triangle':
            targetCtx.beginPath();
            targetCtx.moveTo(startX + width / 2, startY);
            targetCtx.lineTo(endX, endY);
            targetCtx.lineTo(startX, endY);
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
        case 'line':
            targetCtx.beginPath();
            targetCtx.moveTo(startX, startY);
            targetCtx.lineTo(endX, endY);
            targetCtx.stroke();
            break;
        case 'arrow':
            drawArrow(targetCtx, startX, startY, endX, endY);
            break;
    }
}

function drawArrow(targetCtx, fromX, fromY, toX, toY) {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    targetCtx.beginPath();
    targetCtx.moveTo(fromX, fromY);
    targetCtx.lineTo(toX, toY);
    targetCtx.stroke();

    targetCtx.beginPath();
    targetCtx.moveTo(toX, toY);
    targetCtx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    targetCtx.moveTo(toX, toY);
    targetCtx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    targetCtx.stroke();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', (e) => startDrawing(e.touches[0]));
canvas.addEventListener('touchmove', (e) => draw(e.touches[0]));
canvas.addEventListener('touchend', stopDrawing);

// --- Tool Button Events ---
document.getElementById('btn-move').addEventListener('click', function() {
    currentTool = 'move';
    canvas.style.pointerEvents = 'none';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-draw').addEventListener('click', function() {
    currentTool = 'pen';
    canvas.style.pointerEvents = 'auto';
    document.getElementById('pen-tools').style.display = 'block';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-type').addEventListener('click', function() {
    currentTool = 'type';
    canvas.style.pointerEvents = 'none';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-shape').addEventListener('click', function() {
    currentTool = 'shape';
    canvas.style.pointerEvents = 'auto';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'block';
    updateToolButtons(this);
});

document.getElementById('btn-equation').addEventListener('click', function() {
    currentTool = 'equation';
    canvas.style.pointerEvents = 'none';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
    showEquationModal();
});

document.getElementById('btn-erase').addEventListener('click', function() {
    currentTool = 'eraser';
    canvas.style.pointerEvents = 'auto';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('pen-color').addEventListener('change', (e) => {
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
    activeBtn.classList.add('active');
}

// --- Photo Upload & Manipulation ---
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
            createPhotoElement(event.target.result);
        };
        reader.readAsDataURL(file);
    }
    photoInput.value = '';
});

function createPhotoElement(imageSrc) {
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.style.left = '50px';
    photoElement.style.top = '50px';
    photoElement.style.width = '250px';
    photoElement.style.height = '200px';
    
    photoElement.innerHTML = `
        <img src="${imageSrc}" alt="Inserted photo" draggable="false">
        <div class="photo-controls">
            <button class="photo-btn rotate-btn" title="Rotate"><i class="fa-solid fa-rotate-right"></i></button>
            <button class="photo-btn resize-btn" title="Resize"><i class="fa-solid fa-expand"></i></button>
            <button class="photo-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    
    photosContainer.appendChild(photoElement);
    setupPhotoInteraction(photoElement);
}

function setupPhotoInteraction(photoElement) {
    const img = photoElement.querySelector('img');
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    let rotation = 0;
    
    photoElement.addEventListener('mousedown', (e) => {
        if (e.target.closest('.photo-controls')) return;
        if (currentTool !== 'move') return;
        
        isDragging = true;
        startX = e.clientX - photoElement.offsetLeft;
        startY = e.clientY - photoElement.offsetTop;
        photoElement.classList.add('dragging');
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
    
    const rotateBtn = photoElement.querySelector('.rotate-btn');
    rotateBtn.addEventListener('click', () => {
        rotation = (rotation + 90) % 360;
        img.style.transform = `rotate(${rotation}deg)`;
    });
    
    const resizeBtn = photoElement.querySelector('.resize-btn');
    resizeBtn.addEventListener('click', () => {
        isResizing = !isResizing;
        if (isResizing) {
            resizeBtn.style.backgroundColor = '#dc2626';
            photoElement.style.cursor = 'nwse-resize';
            photoElement.style.borderWidth = '3px';
            photoElement.style.borderStyle = 'dashed';
            photoElement.style.borderColor = '#dc2626';
        } else {
            resizeBtn.style.backgroundColor = '';
            photoElement.style.cursor = 'move';
            photoElement.style.borderWidth = 'unset';
            photoElement.style.borderStyle = 'unset';
            photoElement.style.borderColor = 'unset';
        }
    });
    
    photoElement.addEventListener('mousedown', (e) => {
        if (!isResizing) return;
        const rect = photoElement.getBoundingClientRect();
        const isNearCorner = e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20;
        if (!isNearCorner) return;
        
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = photoElement.offsetWidth;
        startHeight = photoElement.offsetHeight;
        
        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            const newWidth = Math.max(100, startWidth + deltaX);
            const newHeight = Math.max(80, startHeight + deltaY);
            
            photoElement.style.width = newWidth + 'px';
            photoElement.style.height = newHeight + 'px';
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    photoElement.querySelector('.delete-btn').addEventListener('click', () => {
        photoElement.remove();
    });
}

// --- Text Input Tool ---
const textModal = document.getElementById('text-modal');
const editTextModal = document.getElementById('edit-text-modal');
const textInput = document.getElementById('text-input');
const editTextInput = document.getElementById('edit-text-input');
const textBoxesContainer = document.getElementById('text-boxes-container');

contentStage.addEventListener('click', (e) => {
    if (currentTool !== 'type') return;
    if (e.target.closest('.text-box') || e.target.closest('.text-box-controls')) return;
    
    textInputPosition.x = e.clientX - contentStage.getBoundingClientRect().left;
    textInputPosition.y = e.clientY - contentStage.getBoundingClientRect().top;
    
    textInput.value = '';
    textModal.style.display = 'flex';
    textInput.focus();
});

document.getElementById('text-modal-save').addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        createTextBox(text, textInputPosition.x, textInputPosition.y);
    }
    textModal.style.display = 'none';
});

document.getElementById('text-modal-cancel').addEventListener('click', () => {
    textModal.style.display = 'none';
});

document.getElementById('edit-text-save').addEventListener('click', () => {
    const text = editTextInput.value.trim();
    if (text && editingTextBox) {
        editingTextBox.textContent = text;
        editingTextBox.setAttribute('data-text', text);
    }
    editTextModal.style.display = 'none';
    editingTextBox = null;
});

document.getElementById('edit-text-cancel').addEventListener('click', () => {
    editTextModal.style.display = 'none';
    editingTextBox = null;
});

function createTextBox(text, x, y) {
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    textBox.textContent = text;
    textBox.setAttribute('data-text', text);
    textBox.style.left = x + 'px';
    textBox.style.top = y + 'px';
    
    textBox.innerHTML = `${text}<div class="text-box-controls">
            <button class="text-box-btn edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="text-box-btn delete-box-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    
    textBoxesContainer.appendChild(textBox);
    setupTextBoxInteraction(textBox);
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
    
    textBox.querySelector('.edit-btn').addEventListener('click', () => {
        editingTextBox = textBox;
        editTextInput.value = textBox.getAttribute('data-text');
        editTextModal.style.display = 'flex';
        editTextInput.focus();
    });
    
    textBox.querySelector('.delete-box-btn').addEventListener('click', () => {
        textBox.remove();
    });
}

// --- Equation Tool ---
function showEquationModal() {
    const equationModal = document.getElementById('equation-modal');
    equationModal.style.display = 'flex';
    
    if (!geogebraApp) {
        const parameters = {
            "appName": "graphing",
            "width": 800,
            "height": 600,
            "showToolBar": true,
            "showAlgebraInput": true,
            "showMenuBar": false,
            "showResetIcon": true,
            "enableLabelDrags": false,
            "enableShiftDragZoom": true,
            "enableRightClick": false,
            "errorDialogsActive": false,
            "useBrowserForJS": false,
            "allowStyleBar": true,
            "appletOnLoad": function(api) {
                geogebraApp = api;
            }
        };
        const appletElement = document.getElementById('geogebra-applet');
        GGBApplet = window.GGBApplet || new window.GGBApplet(parameters, true);
        GGBApplet.inject(appletElement);
    }
}

document.getElementById('equation-modal-save').addEventListener('click', () => {
    if (geogebraApp) {
        const svg = geogebraApp.getPNGBase64(1, true, 300);
        const eqContainer = document.createElement('div');
        eqContainer.className = 'equation-item';
        eqContainer.style.left = '100px';
        eqContainer.style.top = '100px';
        eqContainer.innerHTML = `<img src="data:image/png;base64,${svg}" alt="Equation"><div class="equation-controls">
            <button class="eq-btn delete-eq-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>`;
        document.getElementById('equation-container').appendChild(eqContainer);
        setupEquationInteraction(eqContainer);
    }
    document.getElementById('equation-modal').style.display = 'none';
});

document.getElementById('equation-modal-cancel').addEventListener('click', () => {
    document.getElementById('equation-modal').style.display = 'none';
});

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
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    eqContainer.querySelector('.delete-eq-btn').addEventListener('click', () => {
        eqContainer.remove();
    });
}

// --- Add Page & PDF Page Range Functionality (Enhanced with 3 Options) ---
const pageEditorModal = document.getElementById('page-editor-modal');
const pageEditorTitle = document.getElementById('page-editor-title');
const genericFields = document.getElementById('generic-page-fields');
const formulaFields = document.getElementById('formula-page-fields');
const photoFields = document.getElementById('photo-page-fields');

const genericHeadingInput = document.getElementById('generic-page-heading');
const genericContentInput = document.getElementById('generic-page-content');
const formulaHeadingInput = document.getElementById('formula-page-heading');
const formulaLatexInput = document.getElementById('formula-latex-input');
const formulaPreview = document.getElementById('formula-preview');
const photoHeadingInput = document.getElementById('photo-page-heading');
const photoFileInput = document.getElementById('photo-page-file');
const photoUrlInput = document.getElementById('photo-page-url');

const pdfUrlInput = document.getElementById('pdf-url-input');
const pdfPageRangeInput = document.getElementById('pdf-page-range-input');

const tabDisplayNames = {
    intro: 'Intro',
    concept: 'Concept',
    formula: 'Formula',
    activities: 'Activity',
    examples: 'Example',
    practice: 'Practice',
    quiz: 'Quiz',
    blank: 'Page'
};

// Handle Radio Toggle for 3 Options
document.querySelectorAll('input[name="pageContentType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        switchPageContentType(e.target.value);
    });
});

function switchPageContentType(type) {
    genericFields.style.display = type === 'standard' ? 'block' : 'none';
    formulaFields.style.display = type === 'latex' ? 'block' : 'none';
    photoFields.style.display = type === 'photo' ? 'block' : 'none';
}

document.getElementById('btn-add-page').addEventListener('click', () => {
    const tabData = getTabData(currentLesson, currentTab);

    // Reset Form Fields
    genericHeadingInput.value = '';
    genericContentInput.value = '';
    formulaHeadingInput.value = '';
    formulaLatexInput.value = '';
    photoHeadingInput.value = '';
    photoFileInput.value = '';
    photoUrlInput.value = '';
    formulaPreview.innerHTML = '<em>Your formula will appear here...</em>';

    pdfUrlInput.value = tabData.pdfUrl || '';
    pdfPageRangeInput.value = tabData.pageRange || '';

    // Default choice dynamically based on tab or set to Standard
    const defaultType = currentTab === 'formula' ? 'latex' : 'standard';
    const radioToSelect = document.querySelector(`input[name="pageContentType"][value="${defaultType}"]`);
    if (radioToSelect) radioToSelect.checked = true;
    switchPageContentType(defaultType);

    pageEditorTitle.textContent = `Add Page to ${tabDisplayNames[currentTab] || 'Tab'}`;
    pageEditorModal.style.display = 'flex';
});

formulaLatexInput.addEventListener('input', () => {
    const latex = formulaLatexInput.value.trim();
    if (!latex) {
        formulaPreview.innerHTML = '<em>Your formula will appear here...</em>';
        return;
    }
    formulaPreview.innerHTML = `\\[ ${latex} \\]`;
    if (window.MathJax) {
        MathJax.typesetPromise([formulaPreview]).catch((err) => console.log(err.message));
    }
});

document.getElementById('page-editor-save').addEventListener('click', () => {
    const tabData = getTabData(currentLesson, currentTab);

    // Save updated PDF configs for this tab
    tabData.pdfUrl = pdfUrlInput.value.trim();
    tabData.pageRange = pdfPageRangeInput.value.trim();

    const selectedType = document.querySelector('input[name="pageContentType"]:checked').value;

    const commitAndClose = () => {
        currentPageIndex = tabData.content.length - 1;
        persistDatabase();
        pageEditorModal.style.display = 'none';
        loadContent();
    };

    if (selectedType === 'latex') {
        const latex = formulaLatexInput.value.trim();
        if (latex) {
            const heading = formulaHeadingInput.value.trim();
            const html = `<div class="formula-box">${heading ? `<strong>${escapeHtml(heading)}:</strong><br><br>` : ''}\\[ ${latex} \\]</div>`;
            tabData.content.push(html);
        }
        commitAndClose();
    } else if (selectedType === 'photo') {
        const heading = photoHeadingInput.value.trim();
        const urlVal = photoUrlInput.value.trim();
        const file = photoFileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgHtml = `<div class="tab-photo-page">${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}<img src="${event.target.result}" alt="Page Photo" class="tab-content-image"></div>`;
                tabData.content.push(imgHtml);
                commitAndClose();
            };
            reader.readAsDataURL(file);
            return;
        } else if (urlVal) {
            const imgHtml = `<div class="tab-photo-page">${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}<img src="${escapeHtml(urlVal)}" alt="Page Photo" class="tab-content-image"></div>`;
            tabData.content.push(imgHtml);
            commitAndClose();
        } else {
            commitAndClose();
        }
    } else {
        // Standard Text Option
        const heading = genericHeadingInput.value.trim();
        const body = genericContentInput.value.trim();
        if (body || heading) {
            const html = `${heading ? `<h3>${escapeHtml(heading)}</h3>` : ''}<p>${escapeHtml(body).replace(/\n/g, '<br>')}</p>`;
            tabData.content.push(html);
        }
        commitAndClose();
    }
});

document.getElementById('page-editor-cancel').addEventListener('click', () => {
    pageEditorModal.style.display = 'none';
});

// --- References & Resources ---
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

    if (!title) {
        refTitleInput.focus();
        return;
    }

    if (type === 'link') {
        const url = refLinkInput.value.trim();
        if (!url) {
            refLinkInput.focus();
            return;
        }
        addReference('link', title, url);
        return;
    }

    const file = refFileInput.files[0];
    if (!file) {
        refFileInput.focus();
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        addReference(type, title, event.target.result);
    };
    reader.readAsDataURL(file);
});

document.getElementById('reference-modal-cancel').addEventListener('click', () => {
    referenceModal.style.display = 'none';
});

// --- Filter Bar Logic & LocalStorage Persistence ---
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
    } catch(e) {}
}

function loadLessonById(lessonId) {
    currentLesson = lessonId;
    if (lessonId !== 'blank') {
        lastDayLesson = lessonId;
    }
    currentTab = 'intro';
    currentPageIndex = 0;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const introBtn = document.querySelector('.nav-btn[data-target="intro"]');
    if (introBtn) {
        introBtn.classList.add('active');
        updateTabLabel(introBtn);
    }

    loadContent();
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
    if (fileResultsSelect.value) {
        loadLessonById(fileResultsSelect.value);
    }
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

// --- Download / Screenshot Logic ---
document.getElementById('btn-download').addEventListener('click', () => {
    const exportArea = document.getElementById('export-area');
    const paginationControls = document.getElementById('pagination-controls');
    const originalDisplay = paginationControls.style.display;
    paginationControls.style.display = 'none';

    html2canvas(exportArea, { backgroundColor: null }).then(canvasElement => {
        const link = document.createElement('a');
        const timestamp = new Date().toLocaleString();
        link.download = `Math_Simulation_${currentLesson}_${timestamp}.png`;
        link.href = canvasElement.toDataURL('image/png');
        link.click();
        
        paginationControls.style.display = originalDisplay;
    });
});

// Modals event handling
document.addEventListener('click', (e) => {
    if (e.target === textModal) textModal.style.display = 'none';
    if (e.target === editTextModal) editTextModal.style.display = 'none';
    if (e.target === pageEditorModal) pageEditorModal.style.display = 'none';
    if (e.target === referenceModal) referenceModal.style.display = 'none';
    if (e.target === document.getElementById('equation-modal')) {
        document.getElementById('equation-modal').style.display = 'none';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        textModal.style.display = 'none';
        editTextModal.style.display = 'none';
        pageEditorModal.style.display = 'none';
        referenceModal.style.display = 'none';
        document.getElementById('equation-modal').style.display = 'none';
    }
});
// --- Expand / Collapse Canvas Feature ---
const btnExpand = document.getElementById('btn-expand');

btnExpand.addEventListener('click', function() {
    document.body.classList.toggle('canvas-expanded');
    
    // Change the icon and text based on the state
    if (document.body.classList.contains('canvas-expanded')) {
        this.innerHTML = '<i class="fa-solid fa-minimize"></i> Collapse';
        this.classList.add('active');
    } else {
        this.innerHTML = '<i class="fa-solid fa-maximize"></i> Expand';
        this.classList.remove('active');
    }
    
    // Force the canvas to recalculate its new, larger dimensions immediately
    setTimeout(resizeCanvas, 50);
});
// Initial Load & Filter Restoration
loadSavedFilters();
if (classFilter.value || unitFilter.value || dayFilter.value || titleFilter.value) {
    applyFilters();
} else {
    loadContent();
}
