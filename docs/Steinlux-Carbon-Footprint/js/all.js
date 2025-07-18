//顯示問題

const sendButton = document.getElementById("send-button");

function StartQuestionnaire() {
    document.querySelector(".story-body").style.display = "none";
    document.querySelector("body").style.display = "flex";
    document.querySelector(".scene-1").classList.add("active");
}

sendButton.addEventListener("click", () => {
    StartQuestionnaire();
});

// chapter-bar 設定

class ChapterBar extends HTMLElement {
connectedCallback() {
    this.innerHTML = `
    <div class="chapter-bar show">
        <div class="chapter-button" onclick="window.location.href='traffic-daily.html'">
            <div class="chapter-icon"><i class="fa-solid fa-car-side"></i></div>
            <div class="chapter-label">日常</div>
        </div>
        <div class="chapter-button" onclick="window.location.href='home.html'">
            <div class="chapter-icon"><i class="fa-solid fa-house-chimney"></i></div>
            <div class="chapter-label">居住</div>
        </div>
        <div class="chapter-button" onclick="window.location.href='traffic.html'">
            <div class="chapter-icon"><i class="fa-solid fa-plane-departure"></i></div>
            <div class="chapter-label">旅遊</div>
        </div>
        <div class="chapter-button" onclick="window.location.href='food.html'">
            <div class="chapter-icon"><i class="fa-solid fa-drumstick-bite"></i></div>
            <div class="chapter-label">飲食</div>
        </div>
        <div class="chapter-button" onclick="window.location.href='fashion.html'">
            <div class="chapter-icon"><i class="fa-solid fa-shirt"></i></div>
            <div class="chapter-label">時尚</div>
        </div>
        <div class="chapter-button" onclick="window.location.href='entertainment.html'">
            <div class="chapter-icon"><i class="fa-solid fa-wifi"></i></div>
            <div class="chapter-label">娛樂</div>
        </div>
    </div>
    `;
    }
}

customElements.define('chapter-bar', ChapterBar);

const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.chapter-button').forEach(button => {
const href = button.getAttribute('onclick')?.match(/'(.*?)'/)?.[1];
if (href && currentPage === href) {
    button.classList.add('active');
}
});

//增減按鈕

const containers = document.querySelectorAll(".custom-number-input");

containers.forEach((container) => {
const input = container.querySelector('input[type="number"]');
const btnDec = container.querySelector(".btn-decrement");
const btnInc = container.querySelector(".btn-increment");

btnDec.addEventListener("click", () => {
    let current = parseInt(input.value) || 0;
    let min = input.min !== "" ? parseInt(input.min) : -Infinity;
    if (current > min) {
    input.value = current - 1;
    input.dispatchEvent(new Event("change"));
    }
});

btnInc.addEventListener("click", () => {
    let current = parseInt(input.value) || 0;
    let max = input.max !== "" ? parseInt(input.max) : Infinity;
    if (current < max) {
    input.value = current + 1;
    input.dispatchEvent(new Event("change"));
    }
});
});
