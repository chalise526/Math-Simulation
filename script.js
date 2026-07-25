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
let currentLesson = 'blank';
let currentTab = 'intro';
let currentPageIndex = 0;
let currentTabContentArray = [];
let currentTool = 'pen';
let isDrawing = false;
let draggedElement = null;
let resizingElement = null;
let textInputPosition = { x: 0, y: 0 };

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

document.getElementById('lesson-history').addEventListener('change', (e) => {
    currentLesson = e.target.value;
    currentPageIndex = 0;
    currentTab = 'intro';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-target="intro"]').classList.add('active');
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

ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = '#e53e3e';

function startDrawing(e) {
    if (currentTool !== 'pen' && currentTool !== 'eraser') return;
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
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

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
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
    updateToolButtons(this);
});

document.getElementById('btn-draw').addEventListener('click', function(e) {
    currentTool = 'pen';
    canvas.style.pointerEvents = 'auto';
    updateToolButtons(this);
});

document.getElementById('btn-type').addEventListener('click', function(e) {
    currentTool = 'type';
    canvas.style.pointerEvents = 'none';
    updateToolButtons(this);
});

document.getElementById('btn-erase').addEventListener('click', function(e) {
    currentTool = 'eraser';
    canvas.style.pointerEvents = 'auto';
    updateToolButtons(this);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    photoElement.style.left = '100px';
    photoElement.style.top = '100px';
    photoElement.style.width = '250px';
    photoElement.style.height = '200px';
    
    photoElement.innerHTML = `
        <img src="${imageSrc}" alt="Inserted photo" draggable="false">
        <div class="photo-controls">
            <button class="photo-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
            <button class="photo-btn resize-btn" title="Resize"><i class="fa-solid fa-expand"></i></button>
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
    
    // Allow drawing on photo when pen tool is active
    img.addEventListener('mousedown', (e) => {
        if (currentTool === 'pen' || currentTool === 'eraser') {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    });
}

// --- Text Input Tool ---
const textModal = document.getElementById('text-modal');
const textInput = document.getElementById('text-input');
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

function createTextBox(text, x, y) {
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    textBox.textContent = text;
    textBox.style.left = x + 'px';
    textBox.style.top = y + 'px';
    
    textBox.innerHTML += `
        <div class="text-box-controls">
            <button class="text-box-btn delete-box-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    
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
    
    textBox.querySelector('.delete-box-btn').addEventListener('click', () => {
        textBox.remove();
    });
}

// --- Add Panel Functionality ---
const panelModal = document.getElementById('panel-modal');
const panelNameInput = document.getElementById('panel-name-input');
const navContainer = document.getElementById('nav-container');

document.getElementById('btn-add-panel').addEventListener('click', () => {
    panelNameInput.value = '';
    panelModal.style.display = 'flex';
    panelNameInput.focus();
});

document.getElementById('panel-modal-save').addEventListener('click', () => {
    const panelName = panelNameInput.value.trim();
    if (panelName) {
        createNewPanel(panelName);
        panelModal.style.display = 'none';
    }
});

document.getElementById('panel-modal-cancel').addEventListener('click', () => {
    panelModal.style.display = 'none';
});

function createNewPanel(name) {
    const panelId = 'panel-' + Date.now();
    lessonDatabase[panelId] = {
        intro: [`<h3>${name}</h3><p>Custom panel created for class.</p>`]
    };
    
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.setAttribute('data-target', 'intro');
    btn.innerHTML = `<i class="fa-solid fa-sticky-note"></i> ${name}`;
    
    btn.addEventListener('click', (e) => {
        currentLesson = panelId;
        currentTab = 'intro';
        currentPageIndex = 0;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        loadContent();
    });
    
    navContainer.appendChild(btn);
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
    if (e.target === panelModal) {
        panelModal.style.display = 'none';
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        textModal.style.display = 'none';
        panelModal.style.display = 'none';
    }
});
