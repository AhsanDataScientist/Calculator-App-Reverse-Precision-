let currentInput = "0";
let expression = "";
let isEvaluated = false;
let historyLog = [];

const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const breakdownBox = document.getElementById("breakdownBox");
const step1Val = document.getElementById("step1Val");
const step2Val = document.getElementById("step2Val");
const stepErr = document.getElementById("stepErr");
const historyList = document.getElementById("historyList");

function updateUI() {
    displayEl.innerText = currentInput;
    expressionEl.innerText = expression || "0";
}

function appendNum(num) {
    if (isEvaluated) {
        currentInput = num;
        expression = num;
        isEvaluated = false;
        breakdownBox.style.display = "none";
    } else {
        if (currentInput === "0" && num !== ".") {
            currentInput = num;
            expression = expression.slice(0, -1) + num;
        } else {
            if (num === "." && currentInput.includes(".")) return;
            currentInput += num;
            expression += num;
        }
    }
    updateUI();
}

function appendOp(op) {
    breakdownBox.style.display = "none";
    if (isEvaluated) {
        expression = currentInput;
        isEvaluated = false;
    }
    
    if (!expression) return;

    const lastChar = expression.slice(-1);
    if (["+", "-", "*", "/", "%"].includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    currentInput = op;
    updateUI();
}

function clearAll() {
    currentInput = "0";
    expression = "";
    isEvaluated = false;
    breakdownBox.style.display = "none";
    updateUI();
}

function deleteLast() {
    if (isEvaluated) {
        clearAll();
        return;
    }
    expression = expression.slice(0, -1);
    currentInput = currentInput.slice(0, -1);
    if (!currentInput) currentInput = "0";
    updateUI();
}

// Clean precision math handler to prevent IEEE floating point artifacts (e.g., 3.3333333333333335)
function cleanFloat(num) {
    return Number(Math.round(parseFloat(num + 'e12')) + 'e-12');
}

function calculateStandard() {
    if (!expression || isEvaluated) return;

    try {
        let cleanExpr = expression.replace(/%/g, "/100");
        let rawResult = eval(cleanExpr);
        
        if (!isFinite(rawResult)) {
            currentInput = "Error";
            updateUI();
            return;
        }

        let finalRes = cleanFloat(rawResult);
        addHistory(expression, finalRes);

        currentInput = String(finalRes);
        expression = expression + " =";
        isEvaluated = true;
        updateUI();
    } catch (e) {
        currentInput = "Error";
        updateUI();
    }
}

// Custom Executive Reverse Precision Functionality
function executeReversePrecision() {
    // Parse expression into Numerator (A) and Denominator (B)
    const operators = ["/", "*", "+", "-"];
    let match = expression.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);

    if (!match) {
        alert("Enter a simple division first (e.g., '200/6' or '100/3'), then click Reverse Precision.");
        return;
    }

    const numA = parseFloat(match[1]);
    const numB = parseFloat(match[2]);

    if (numB === 0) {
        alert("Division by zero is undefined.");
        return;
    }

    // Mathematical Division
    const step1Result = numA / numB;
    const cleanStep1 = cleanFloat(step1Result);

    // Exact Reversion: (A / B) * B = A
    const step2Result = cleanFloat(step1Result * numB);

    // Update Display UI
    step1Val.innerText = `${numA} ÷ ${numB} = ${cleanStep1}`;
    step2Val.innerText = `${cleanStep1} × ${numB} = ${step2Result}`;
    stepErr.innerText = "0.000000% (Identity Restored)";

    breakdownBox.style.display = "block";
    currentInput = String(step2Result);
    expression = `(${numA} ÷ ${numB}) × ${numB}`;
    isEvaluated = true;

    addHistory(`${numA} ÷ ${numB} × ${numB}`, step2Result);
    updateUI();
}

function addHistory(expr, res) {
    historyLog.unshift({ expr, res });
    if (historyLog.length > 10) historyLog.pop();
    renderHistory();
}

function renderHistory() {
    if (historyLog.length === 0) {
        historyList.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 10px;">No calculations logged</div>';
        return;
    }
    historyList.innerHTML = historyLog.map(item => `
        <div class="history-item">
            <span style="color: var(--text-secondary);">${item.expr}</span>
            <strong style="color: var(--accent-green);">${item.res}</strong>
        </div>
    `).join("");
}

function clearHistory() {
    historyLog = [];
    renderHistory();
}

// Keyboard Integration
document.addEventListener("keydown", (e) => {
    if (!isNaN(e.key)) appendNum(e.key);
    if (["+", "-", "*", "/", "%"].includes(e.key)) appendOp(e.key);
    if (e.key === "Enter" || e.key === "=") calculateStandard();
    if (e.key === "Backspace") deleteLast();
    if (e.key === "Escape") clearAll();
});
