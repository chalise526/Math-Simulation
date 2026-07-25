// --- Database of Daily Lessons ---
// You will edit this object daily to add new classes and keep history.
const lessonDatabase = {
    day2: {
        intro: "<h3>रीत वा बहुलक (Mode)</h3><p>Today we will learn how to calculate the Mode of continuous data.</p>",
        concept: "<p>The mode is the value that appears most frequently in a data set. For grouped data, we find the modal class first.</p>",
        formula: `<div class="formula-box">
                    <strong>रीत (Mode) को सूत्र:</strong><br><br>
                    \\[ Mode = L + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h \\]
                    <br><br>
                    <p style="font-size:0.9rem; color:#555;">Where:<br>
                    L = Lower limit of modal class<br>
                    f1 = Frequency of modal class<br>
                    f0 = Frequency of preceding class<br>
                    f2 = Frequency of succeeding class<br>
                    h = Class interval size</p>
                  </div>`,
        practice: "<p>Find the mode for the following dataset: [Class: 10-20, 20-30, 30-40] [Freq: 4, 12, 5]</p>"
    },
    day1: {
        intro: "<h3>Heron's Formula</h3><p>Review of calculating the area of a triangle when all three sides are known.</p>",
        concept: "<p>Unlike 1/2 * base * height, Heron's formula requires the semi-perimeter.</p>",
        formula: `<div class="formula-box">
                    <strong>Area of Triangle:</strong><br><br>
                    \\[ s = \\frac{a + b + c}{2} \\]
                    \\[ Area = \\sqrt{s(s-a)(s-b)(s-c)} \\]
                  </div>`,
        practice: "<p>Calculate the area of a triangle with sides 3cm, 4cm, and 5cm.</p>"
    }
};

// --- Navigation & History Logic ---
let currentLesson = 'day2';
let currentTab = 'formula';

function loadContent() {
    const contentDiv = document.getElementById('lesson-content');
    const htmlContent = lessonDatabase[currentLesson][currentTab] || "<p>Content being updated...</p>";
    contentDiv.innerHTML = `<div class="content-section active">${htmlContent}</div>`;
    
    // Tell MathJax to re-render the new equations
    if (window.MathJax) {
        MathJax.typesetPromise([contentDiv]).catch((err) => console.log(err.message));
    }
}

// Sidebar Click Event
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.getAttribute('data-target');
        loadContent();
    });
});

// History Dropdown Event
document.getElementById('lesson-history').addEventListener('change', (e) => {
    currentLesson = e.target.value;
    loadContent();
});

// Load initial content on start
loadContent();

// --- Interactive Whiteboard (Canvas) Logic ---
const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const contentStage = document.querySelector('.content-stage');

let isDrawing = false;
let currentTool = 'pen'; // 'pen' or 'eraser'

// Resize canvas to fit the container
function resizeCanvas() {
    canvas.width = contentStage.offsetWidth;
    canvas.height = contentStage.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing variables
ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.strokeStyle = '#e53e3e'; // Red ink

// Mouse Events for drawing
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
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'eraser') {
        ctx.clearRect(x - 15, y - 15, 30, 30);
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

// Toolbar tool selection
document.getElementById('btn-draw').addEventListener('click', (e) => {
    currentTool = 'pen';
    canvas.style.pointerEvents = 'auto'; // Enable canvas interactions
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
});

document.getElementById('btn-erase').addEventListener('click', (e) => {
    currentTool = 'eraser';
    canvas.style.pointerEvents = 'auto';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
});

// Clear board
document.getElementById('btn-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Toggle canvas pointer events so user can click buttons underneath when not drawing
document.querySelector('.content-stage').addEventListener('dblclick', () => {
    canvas.style.pointerEvents = canvas.style.pointerEvents === 'none' ? 'auto' : 'none';
    if (canvas.style.pointerEvents === 'none') {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    }
});
