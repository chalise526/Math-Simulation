// --- Database of Daily Lessons ---
// Note: Numbers are kept in standard format (1, 2, 3), not Nepali.
// If a tab has multiple pages, use an array of strings [ "Page 1 Content", "Page 2 Content" ].
const lessonDatabase = {
    day2: {
        intro: ["<h3>रीत वा बहुलक (Mode)</h3><p>Today we will learn how to calculate the Mode of continuous data.</p>"],
        concept: ["<p>The mode is the value that appears most frequently in a data set. For grouped data, we find the modal class first.</p>"],
        formula: [
            // Page 1 of Formulas
            `<div class="formula-box">
                <strong>रीत (Mode) को सूत्र:</strong><br><br>
                \\[ Mode = L + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h \\]
                <br><p style="font-size:0.9rem; color:#555;">Where: L = Lower limit of modal class, h = Class interval size</p>
             </div>`,
            // Page 2 of Formulas
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
let currentTab = 'formula';
let currentPageIndex = 0;
let currentTabContentArray = [];

function loadContent() {
    const contentDiv = document.getElementById('lesson-content');
    const paginationControls = document.getElementById('pagination-controls');
    const pageIndicator = document.getElementById('page-indicator');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');

    // Fetch array of pages for the current tab (fallback to a "Not ready" message)
    currentTabContentArray = lessonDatabase[currentLesson][currentTab] || ["<p>Content for this section is not uploaded yet.</p>"];
    
    // Ensure page index is valid
    if (currentPageIndex >= currentTabContentArray.length) {
        currentPageIndex = 0; 
    }

    // Inject HTML
    contentDiv.innerHTML = currentTabContentArray[currentPageIndex];
    
    // Handle MathJax Rendering
    if (window.MathJax) {
        MathJax.typesetPromise([contentDiv]).catch((err) => console.log(err.message));
    }

    // Handle Pagination UI (Numbers kept in standard format)
    if (currentTabContentArray.length > 1) {
        paginationControls.style.display = "flex";
        pageIndicator.innerText = `Page ${currentPageIndex + 1} / ${currentTabContentArray.length}`;
        btnPrev.disabled = currentPageIndex === 0;
        btnNext.disabled = currentPageIndex === currentTabContentArray.length - 1;
    } else {
        paginationControls.style.display = "none";
    }
}

// Pagination Button Events
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

// Sidebar Click Event
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTab = e.currentTarget.getAttribute('data-target');
        currentPageIndex = 0; // Reset to page 1 on tab change
        loadContent();
    });
});

// History Dropdown Event
document.getElementById('lesson-history').addEventListener('change', (e) => {
    currentLesson = e.target.value;
    currentPageIndex = 0; // Reset page on lesson change
    loadContent();
});

// Load initial content on start
loadContent();


// --- Interactive Whiteboard (Canvas) Logic ---
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const contentStage = document.querySelector('.content-stage');

let isDrawing = false;
let currentTool = 'pen';

function resizeCanvas() {
    canvas.width = contentStage.offsetWidth;
    canvas.height = contentStage.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
// Small delay to ensure CSS has loaded layout sizes
setTimeout(resizeCanvas, 100); 

ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.strokeStyle = '#e53e3e';

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'eraser') {
        ctx.clearRect(x - 20, y - 20, 40, 40);
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

// Tool events
document.getElementById('btn-draw').addEventListener('click', (e) => {
    currentTool = 'pen';
    canvas.style.pointerEvents = 'auto';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
});

document.getElementById('btn-erase').addEventListener('click', (e) => {
    currentTool = 'eraser';
    canvas.style.pointerEvents = 'auto';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
});

document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Toggle canvas pointer events via double click on stage to click links/buttons underneath
document.querySelector('.content-stage').addEventListener('dblclick', () => {
    canvas.style.pointerEvents = canvas.style.pointerEvents === 'none' ? 'auto' : 'none';
    if (canvas.style.pointerEvents === 'none') {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    }
});

// --- Photo Upload & Display Logic ---
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
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-item';
            photoElement.innerHTML = `
                <img src="${event.target.result}" alt="Inserted photo" draggable="true">
                <div class="photo-controls">
                    <button class="photo-btn resize-btn" title="Resize"><i class="fa-solid fa-expand"></i></button>
                    <button class="photo-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            
            photosContainer.appendChild(photoElement);
            
            // Add drag functionality
            const img = photoElement.querySelector('img');
            let offsetX, offsetY;
            
            img.addEventListener('mousedown', (e) => {
                offsetX = e.clientX - photoElement.offsetLeft;
                offsetY = e.clientY - photoElement.offsetTop;
                photoElement.classList.add('dragging');
            });
            
            document.addEventListener('mousemove', (e) => {
                if (photoElement.classList.contains('dragging')) {
                    photoElement.style.left = (e.clientX - offsetX) + 'px';
                    photoElement.style.top = (e.clientY - offsetY) + 'px';
                }
            });
            
            document.addEventListener('mouseup', () => {
                photoElement.classList.remove('dragging');
            });
            
            // Delete button
            photoElement.querySelector('.delete-btn').addEventListener('click', () => {
                photoElement.remove();
            });
            
            // Resize button (makes image draggable by corners)
            photoElement.querySelector('.resize-btn').addEventListener('click', () => {
                photoElement.classList.toggle('resizable');
            });
        };
        reader.readAsDataURL(file);
    }
    // Reset file input
    photoInput.value = '';
});

// --- Download / Screenshot Logic ---
document.getElementById('btn-download').addEventListener('click', () => {
    const exportArea = document.getElementById('export-area');
    
    // Temporarily hide the pagination controls from the screenshot
    const paginationControls = document.getElementById('pagination-controls');
    const originalDisplay = paginationControls.style.display;
    paginationControls.style.display = 'none';

    html2canvas(exportArea).then(canvasElement => {
        // Create an image and trigger download
        const link = document.createElement('a');
        link.download = `Math_Simulation_${currentLesson}_${currentTab}.png`;
        link.href = canvasElement.toDataURL('image/png');
        link.click();
        
        // Restore pagination controls
        paginationControls.style.display = originalDisplay;
    });
});
