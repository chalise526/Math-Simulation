// --- Database of Daily Lessons ---
const lessonDatabase = {
    blank: {
        intro: ["<h3>📄 Blank Page</h3><p>Use this blank page for quick notes and drawings during class.</p>"]
    },
    day2: {
        intro: ["<h3>रीत वा बहुलक (Mode)</h3><p>Today we will learn how to calculate the Mode of continuous data.</p>"],
        concept: ["<p>The mode is the value that appears most frequently in a data set. For grouped data, we find the modal class first.</p>"],
        formula: [
            `<div class="formula-box">
                <strong>रीत (Mode) को सूत्र:</strong><br><br>
                \\[ Mode = L + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h \\]
                <br><p style="font-size:0.9rem; color:#555;">Where: L = Lower limit of modal class, h = Class interval size</p>
             </div>`,
            `<div class="formula-box">
                <strong>Correction Factor (If classes are not continuous):</strong><br><br>
                \\[ CF = \\frac{\\text{Lower limit of 2nd class} - \\text{Upper limit of 1st class}}{2} \\]
             </div>`
        ],
        activities: ["<p>Group Activity: Find the heights of 10 students and group them into intervals.</p>"],
        examples: ["<p>Example 1: Calculate the mode of the given dataset on the board.</p>"],
        practice: ["<p>Find the mode for the following dataset: [Class: 10-20, 20-30, 30-40] [Freq: 4, 12, 5]</p>"],
        quiz: ["<p>Quick Question: Does the modal class always have the highest frequency? (Yes/No)</p>"]
    },
    day1: {
        intro: ["<h3>Heron's Formula</h3><p>Review of calculating the area of a triangle.</p>"],
        formula: [
            `<div class="formula-box">
                <strong>Area of Triangle:</strong><br><br>
                \\[ s = \\frac{a + b + c}{2} \\]
                \\[ Area = \\sqrt{s(s-a)(s-b)(s-c)} \\]
             </div>`
        ],
        practice: ["<p>Calculate the area of a triangle with sides 3cm, 4cm, and 5cm.</p>"]
    }
};

// --- Navigation & Pagination Logic ---
let currentLesson = 'day2';
let currentTab = 'intro';
let currentPageIndex = 0;
let currentTabContentArray = [];
let currentTool = 'pen';
let currentShape = 'rectangle';
let isDrawing = false;
let draggedElement = null;
let resizingElement = null;
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
        return;
    } else {
        contentStage.classList.remove('blank-page');
        lessonContainer.classList.remove('hidden');
    }

    currentTabContentArray = lessonDatabase[currentLesson][currentTab] || ["<p>Content for this section is not uploaded yet.</p>"];
    
    if (currentPageIndex >= currentTabContentArray.length) {
        currentPageIndex = 0; 
    }

    contentDiv.innerHTML = currentTabContentArray[currentPageIndex];
    
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

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTab = e.currentTarget.getAttribute('data-target');
        currentPageIndex = 0;
        loadContent();
    });
});

// Blank page button handler
document.getElementById('blank-page-btn').addEventListener('click', function(e) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentLesson = 'blank';
    currentPageIndex = 0;
    loadContent();
});

loadContent();

// --- Interactive Whiteboard (Canvas) Logic ---
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const contentStage = document.querySelector('.content-stage');

function resizeCanvas() {
    canvas.width = contentStage.offsetWidth;
    canvas.height = contentStage.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

ctx.lineWidth = currentPenWeight;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = currentPenColor;

function startDrawing(e) {
    if (currentTool === 'shape') {
        shapeStartX = e.clientX - canvas.getBoundingClientRect().left;
        shapeStartY = e.clientY - canvas.getBoundingClientRect().top;
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
    if (currentTool === 'shape') return;
    if (!isDrawing || (currentTool !== 'pen' && currentTool !== 'eraser')) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'eraser') {
        ctx.clearRect(x - 15, y - 15, 30, 30);
    } else if (currentTool === 'pen') {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function stopDrawing(e) {
    if (currentTool === 'shape' && isDrawing) {
        const endX = e.clientX - canvas.getBoundingClientRect().left;
        const endY = e.clientY - canvas.getBoundingClientRect().top;
        drawShape(shapeStartX, shapeStartY, endX, endY, currentShape);
    }
    isDrawing = false;
    ctx.beginPath();
}

function drawShape(startX, startY, endX, endY, shape) {
    const width = endX - startX;
    const height = endY - startY;
    
    ctx.strokeStyle = currentPenColor;
    ctx.lineWidth = currentPenWeight;
    
    switch(shape) {
        case 'rectangle':
            ctx.strokeRect(startX, startY, width, height);
            break;
        case 'circle':
            const radius = Math.sqrt(width * width + height * height) / 2;
            ctx.beginPath();
            ctx.arc(startX + width/2, startY + height/2, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(startX + width/2, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(startX, endY);
            ctx.closePath();
            ctx.stroke();
            break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            break;
        case 'arrow':
            drawArrow(startX, startY, endX, endY);
            break;
    }
}

function drawArrow(fromX, fromY, toX, toY) {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', (e) => startDrawing(e.touches[0]));
canvas.addEventListener('touchmove', (e) => draw(e.touches[0]));
canvas.addEventListener('touchend', stopDrawing);

// --- Tool Button Events ---
document.getElementById('btn-move').addEventListener('click', function(e) {
    currentTool = 'move';
    canvas.style.pointerEvents = 'none';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-draw').addEventListener('click', function(e) {
    currentTool = 'pen';
    canvas.style.pointerEvents = 'auto';
    document.getElementById('pen-tools').style.display = 'block';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-type').addEventListener('click', function(e) {
    currentTool = 'type';
    canvas.style.pointerEvents = 'none';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-shape').addEventListener('click', function(e) {
    currentTool = 'shape';
    canvas.style.pointerEvents = 'auto';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'block';
    updateToolButtons(this);
});

document.getElementById('btn-equation').addEventListener('click', function(e) {
    currentTool = 'equation';
    canvas.style.pointerEvents = 'none';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
    showEquationModal();
});

document.getElementById('btn-erase').addEventListener('click', function(e) {
    currentTool = 'eraser';
    canvas.style.pointerEvents = 'auto';
    document.getElementById('pen-tools').style.display = 'none';
    document.getElementById('shape-tools').style.display = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Pen color and weight
document.getElementById('pen-color').addEventListener('change', (e) => {
    currentPenColor = e.target.value;
    ctx.strokeStyle = currentPenColor;
});

document.getElementById('pen-weight').addEventListener('change', (e) => {
    currentPenWeight = parseInt(e.target.value);
    ctx.lineWidth = currentPenWeight;
});

// Shape buttons
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
    
    // Drag functionality
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
    
    // Rotate functionality
    const rotateBtn = photoElement.querySelector('.rotate-btn');
    rotateBtn.addEventListener('click', () => {
        rotation = (rotation + 90) % 360;
        img.style.transform = `rotate(${rotation}deg)`;
    });
    
    // Resize functionality
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
    
    // Resize by dragging corner
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
    
    // Delete button
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

// --- Add Subpage Functionality ---
const subpageModal = document.getElementById('subpage-modal');
const subpageNameInput = document.getElementById('subpage-name-input');
let currentTabParent = null;

document.querySelectorAll('.add-subpage-btn').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTabParent = btn.previousElementSibling;
        subpageNameInput.value = '';
        subpageModal.style.display = 'flex';
        subpageNameInput.focus();
    });
});

document.getElementById('subpage-modal-save').addEventListener('click', () => {
    const subpageName = subpageNameInput.value.trim();
    if (subpageName && currentTabParent) {
        createSubpage(subpageName, currentTabParent);
        subpageModal.style.display = 'none';
    }
});

document.getElementById('subpage-modal-cancel').addEventListener('click', () => {
    subpageModal.style.display = 'none';
});

function createSubpage(name, parentBtn) {
    const tabId = 'tab-' + Date.now();
    const parentTab = parentBtn.getAttribute('data-target');
    const lessonKey = 'day2';
    
    if (!lessonDatabase[lessonKey][tabId]) {
        lessonDatabase[lessonKey][tabId] = [`<h3>${name}</h3><p>Custom page created for your notes.</p>`];
    }
    
    const newBtn = document.createElement('button');
    newBtn.className = 'nav-btn';
    newBtn.setAttribute('data-target', tabId);
    newBtn.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${name}`;
    
    newBtn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTab = tabId;
        currentPageIndex = 0;
        loadContent();
    });
    
    parentBtn.parentElement.appendChild(newBtn);
}

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

// Modal close on outside click
document.addEventListener('click', (e) => {
    if (e.target === textModal) {
        textModal.style.display = 'none';
    }
    if (e.target === editTextModal) {
        editTextModal.style.display = 'none';
    }
    if (e.target === subpageModal) {
        subpageModal.style.display = 'none';
    }
    if (e.target === document.getElementById('equation-modal')) {
        document.getElementById('equation-modal').style.display = 'none';
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        textModal.style.display = 'none';
        editTextModal.style.display = 'none';
        subpageModal.style.display = 'none';
        document.getElementById('equation-modal').style.display = 'none';
    }
});
