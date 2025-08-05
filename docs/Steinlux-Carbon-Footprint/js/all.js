//聊天室
  document.addEventListener("DOMContentLoaded", () => {
    class Story extends HTMLElement {
connectedCallback() {
    this.innerHTML = `
    <div class="story-body">
    <div id="radial-overlay"></div>
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

            <div class="story-chat-container" id="chatContainer"></div>

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

function StartQuestionnaire() {
    document.querySelector(".story-body").style.display = "none";
    document.querySelector("body").style.display = "flex";
    document.querySelector(".scene-1").classList.add("active");
    document.documentElement.style.backgroundImage = `url('images/圖片1.webp')`;
}

sendButton.addEventListener("click", () => {
    const overlay = document.getElementById('radial-overlay');
    overlay.style.opacity = '1';
    gsap.to(overlay, {
      duration: 1.75,
      width: '300vw',
      height: '300vw',
      ease: "power2.out",
      onComplete: () => {
        // 動畫結束跳轉頁面
        StartQuestionnaire();
      }
    });
});

playIntroMessages()


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
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        
        // 如果不是時間戳記且不是第一條訊息，顯示打字指示器
        if (message.type !== "time" && i > 0) {
            const typingIndicator = createTypingIndicator(message.from);
            chatContainer.appendChild(typingIndicator);
            scrollToBottom();
            
            // 等待打字時間
            await new Promise(resolve => setTimeout(resolve, message.typingTime || 1000));
            
            // 移除打字指示器
            chatContainer.removeChild(typingIndicator);
        }
        
        // 顯示訊息
        const messageEl = createMessageElement(message);
        chatContainer.appendChild(messageEl);
        scrollToBottom();
        
        // 等待訊息顯示時間
        await new Promise(resolve => setTimeout(resolve, message.time || 1000));
    }
    
    // 對話結束後，讓出發按鈕開始晃動
    setTimeout(() => {
        sendButton.classList.add("shake-animation");
        
        // 5秒後停止晃動，避免過度干擾
        setTimeout(() => {
            sendButton.classList.remove("shake-animation");
        }, 5000);
    }, 500);
}
})
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
    button.addEventListener('mouseover', () => {
        button.classList.add('animate__rubberBand')
    })
    button.addEventListener('mouseout', () => {
        button.classList.remove('animate__rubberBand')
    })
})

document.querySelectorAll('.slider:before').forEach(button => {
    button.addEventListener('mouseover', () => {
        button.classList.add('animate__rubberBand')
    })
    button.addEventListener('mouseout', () => {
        button.classList.remove('animate__rubberBand')
    })
})

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