//聊天室
  document.addEventListener("DOMContentLoaded", () => {
    class Story extends HTMLElement {
connectedCallback() {
    this.innerHTML = `
    <div class="stars-bg"></div>
    <div class="story-body">
        <div class="story-container">
            <header class="story-header">
                <div class="story-header-title">
                    <div class="story-header-title-lt">
                        <div class="story-header-profile-photo"></div>
                        <h1>Neo(2)</h1>
                        <i class="fa-solid fa-volume-low" style="color: #6c808f;"></i>
                    </div>
                    <div class="story-header-title-rt">
                        <i class="fa-solid fa-phone"></i>
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                </div>
            </header>

            <div class="story-chat-container" id="chatContainer">
                <button id="skip-button" class="skip-button" title="快速完成對話">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>

            <div class="input-container">
                <div class="input-wrapper">
                    <input
                        type="text"
                        class="message-input"
                        placeholder="請輸入訊息..."
                        aria-label="Message input"
                    />
                    <div class="action-buttons">
                        <button id="send-button" class="send-button">
                            <span>出發</span>
                            <i class="fa-regular fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
}

customElements.define('story-chatroom', Story);
  });

document.addEventListener("DOMContentLoaded", () => {
const chatContainer = document.getElementById("chatContainer");
const sendButton = document.getElementById("send-button");
let skipButton;
let isSkipping = false;
let isPlayingMessages = false;

function StartQuestionnaire() {
    document.querySelector(".story-body").style.display = "none";
    document.querySelector("body").style.display = "flex";
    document.querySelector(".scene-1").classList.add("active");
    // 取得目前檔案名稱
    const fileName = window.location.pathname.split("/").pop();

    // 預設背景
    let bgImage = "images/default.webp";

    // 根據不同檔案名稱設定背景
    switch (fileName) {
        case "traffic-daily.html":
            bgImage = "./images/bg-traffic-daily.webp";
            break;
        case "home.html":
            bgImage = "./images/bg-home.webp";
            break;
        case "traffic-travel.html":
            bgImage = "./images/bg-traffic-travel.webp";
            break;
        case "food.html":
            bgImage = "./images/bg-food.webp";
            break;
        case "fashion.html":
            bgImage = "./images/bg-fashion.webp";
            break;
        case "entertainment.html":
            bgImage = "./images/bg-entertainment.webp";
            break;
    }

    // 套用背景
    document.documentElement.style.backgroundImage = `url('${bgImage}')`;
}

sendButton.addEventListener("click", () => {
    const storyBody = document.querySelector('.story-body');

    // 啟動「從夢中醒來」動畫
    storyBody.classList.remove("awakening");

    // 2 秒後切換到問卷頁面
    setTimeout(() => {
        StartQuestionnaire();
    }, 2000);
});
setTimeout(() => {
    skipButton = document.getElementById("skip-button");
    
    if (skipButton) {
        skipButton.addEventListener("click", skipToEnd);
    }
    
    // 啟動醒來動畫
    startAwakeningAnimation();
}, 100);

function startAwakeningAnimation() {
    const storyBody = document.querySelector('.story-body');
    
    // 延遲一點開始醒來效果
    setTimeout(() => {
        storyBody.classList.add('awakening');
        
        // 醒來動畫完成後開始播放對話
        setTimeout(() => {
            playIntroMessages();
        }, 1500);
    }, 500);
}

function skipToEnd() {
    isSkipping = true;

    const skipBtn = skipButton;
    chatContainer.innerHTML = '';
    chatContainer.appendChild(skipBtn);

    messages.forEach(message => {
        const messageEl = createMessageElement(message);
        chatContainer.appendChild(messageEl);
    });

    scrollToBottom();

    skipButton.classList.add("hidden");

    setTimeout(() => {
        sendButton.classList.add("pulse");
        
        // 5秒後移除pulse效果並暫停
        setTimeout(() => {
            sendButton.classList.remove("pulse");
            
            // 暫停3秒後再次開始播放
            setTimeout(() => {
                sendButton.classList.add("pulse");
                
                // 再播放5秒後停止
                setTimeout(() => {
                    sendButton.classList.remove("pulse");
                }, 5000);
            }, 3000); // 暫停3秒
            
        }, 5000); // 播放5秒
    }, 500);
}

function createMessageElement(message) {
    if (message.type === "time") {
        const timeEl = document.createElement("div");
        timeEl.classList.add("story-time-stamp");
        timeEl.textContent = message.text;
        return timeEl;
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add(
        "story-message",
        message.from === "user" ? "story-user-message" : "story-cat-message"
    );

    const avatar = document.createElement("div");
    avatar.classList.add("story-avatar");
    avatar.textContent = message.from === "user" ? "U" : "A";

    const bubble = document.createElement("div");
    bubble.classList.add("story-message-bubble");
    bubble.textContent = message.text;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
}

function createTypingIndicator(from) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
        "typing-indicator",
        from === "user" ? "story-user-message" : "story-cat-message"
    );

    const avatar = document.createElement("div");
    avatar.classList.add("story-avatar");
    avatar.textContent = from === "user" ? "U" : "A";

    const dotsContainer = document.createElement("div");
    dotsContainer.classList.add("typing-dots");

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.classList.add("typing-dot");
        dotsContainer.appendChild(dot);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(dotsContainer);
    return wrapper;
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function playIntroMessages() {
    if (isSkipping) return;

    isPlayingMessages = true;

    for (let i = 0; i < messages.length; i++) {
        if (isSkipping) break;

        const message = messages[i];

        if (message.type !== "time" && i > 0) {
            const typingIndicator = createTypingIndicator(message.from);
            chatContainer.appendChild(typingIndicator);
            scrollToBottom();

            await new Promise(resolve => setTimeout(resolve, message.typingTime || 1000));

            if (isSkipping) break;

            if (chatContainer.contains(typingIndicator)) {
                chatContainer.removeChild(typingIndicator);
            }
        }

        if (isSkipping) break;

        const messageEl = createMessageElement(message);
        chatContainer.appendChild(messageEl);
        scrollToBottom();

        await new Promise(resolve => setTimeout(resolve, message.time || 1000));
    }

    isPlayingMessages = false;

// 無論是否跳過，都在聊天結束時執行音效播放
if (skipButton) {
    skipButton.classList.add("hidden");
}

// 開始播放
setTimeout(() => {
    sendButton.classList.add("pulse");
    
    // 5秒後移除pulse效果並暫停
    setTimeout(() => {
        sendButton.classList.remove("pulse");
        
        // 暫停3秒後再次開始播放
        setTimeout(() => {
            sendButton.classList.add("pulse");
            
            // 再播放5秒後停止
            setTimeout(() => {
                sendButton.classList.remove("pulse");
            }, 5000);
        }, 3000); // 暫停3秒
        
    }, 5000); // 播放5秒
}, 500);
}
});

// chapter-bar 設定

class ChapterBar extends HTMLElement {
connectedCallback() {
    this.innerHTML = `
    <div class="chapter-bar show">
        <div class="chapter-button animate__animated" onclick="window.location.href='traffic-daily.html'">
            <div class="chapter-icon"><i class="fa-solid fa-car-side"></i></div>
            <div class="chapter-label">日常</div>
        </div>
        <div class="chapter-button animate__animated" onclick="window.location.href='home.html'">
            <div class="chapter-icon"><i class="fa-solid fa-house-chimney"></i></div>
            <div class="chapter-label">居住</div>
        </div>
        <div class="chapter-button animate__animated" onclick="window.location.href='traffic-travel.html'">
            <div class="chapter-icon"><i class="fa-solid fa-plane-departure"></i></div>
            <div class="chapter-label">旅遊</div>
        </div>
        <div class="chapter-button animate__animated" onclick="window.location.href='food.html'">
            <div class="chapter-icon"><i class="fa-solid fa-drumstick-bite"></i></div>
            <div class="chapter-label">飲食</div>
        </div>
        <div class="chapter-button animate__animated" onclick="window.location.href='fashion.html'">
            <div class="chapter-icon"><i class="fa-solid fa-shirt"></i></div>
            <div class="chapter-label">時尚</div>
        </div>
        <div class="chapter-button animate__animated" onclick="window.location.href='entertainment.html'">
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

document.querySelectorAll('.chapter-button').forEach(button => {
  button.addEventListener('mouseenter', () => {
    button.classList.remove('rubberBand'); // 移除舊動畫
    void button.offsetWidth; // 觸發重排，確保動畫能重新播放
    button.classList.add('rubberBand');
  });

  button.addEventListener('mouseleave', () => {
    button.classList.remove('rubberBand'); // 滑出移除動畫
  });
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