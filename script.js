let count = 0;
const display = document.getElementById('display');

function updateDisplay() {
    display.innerHTML = count;
    // تغيير اللون بناءً على القيمة
    if (count > 0) display.style.color = "#28a745";
    else if (count < 0) display.style.color = "#dc3545";
    else display.style.color = "#333";
}

function increment() {
    count++;
    updateDisplay();
}

function decrement() {
    count--;
    updateDisplay();
}

function reset() {
    count = 0;
    updateDisplay();
}
