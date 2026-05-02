// --- კონფიგურაცია ---
const firebaseBaseURL = "https://ge-rp-web-default-rtdb.europe-west1.firebasedatabase.app/chats";
const jsonDatabaseURL = "bot_data.json";

// მომხმარებლის უნიკალური ID (ინახება ბრაუზერში)
let userId = localStorage.getItem("chat_user_id");
if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("chat_user_id", userId);
}

const chatRef = `${firebaseBaseURL}/${userId}`;
let botDatabase = {};
let adminJoined = false;
let lastMessageCount = 0;

// 1. JSON ბაზის ჩატვირთვა
fetch(jsonDatabaseURL)
    .then(res => res.json())
    .then(data => { botDatabase = data; })
    .catch(err => console.error("ბოტის ბაზა ვერ ჩაიტვირთა:", err));

// 2. ჩატის ფანჯრის გადართვა
function toggleChat() {
    const win = document.getElementById('chat-window');
    win.style.display = (win.style.display === 'flex') ? 'none' : 'flex';
}

// 3. ჩატის მოსმენა (Live რეჟიმი)
function listenToChat() {
    fetch(chatRef + ".json")
    .then(res => res.json())
    .then(data => {
        const box = document.getElementById('chat-box');
        
        // თუ ბაზიდან ჩათი წაიშალა (ადმინმა წაშალა)
        if (!data) {
            box.innerHTML = '<div class="msg bot-msg">გამარჯობა რით შემიძლია დაგეხმაროთ</div>';
            adminJoined = false;
            lastMessageCount = 0;
            return;
        }

        adminJoined = data.adminJoined || false;
        const messages = data.messages ? Object.values(data.messages) : [];

        // განახლება მხოლოდ იმ შემთხვევაში, თუ ახალი მესიჯია
        if (messages.length !== lastMessageCount) {
            box.innerHTML = "";
            messages.forEach(m => {
                let senderClass = "";
                if (m.sender === "admin") senderClass = "bot-msg admin-style"; // ადმინის მესიჯი
                else if (m.sender === "Bot" || m.sender === "System") senderClass = "bot-msg";
                else senderClass = "user-msg";

                box.innerHTML += `<div class="msg ${senderClass}"><b>${m.sender}:</b> ${m.text}</div>`;
            });
            box.scrollTop = box.scrollHeight;
            lastMessageCount = messages.length;
        }
    });
}

// ჩართვა ყოველ 2 წამში
setInterval(listenToChat, 2000);

// 4. მესიჯის გაგზავნა
function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (text === "") return;

    // ა) მომხმარებლის მესიჯის გაგზავნა Firebase-ში
    const userMsg = { sender: "მომხმარებელი", text: text, time: Date.now() };
    
    fetch(chatRef + "/messages.json", {
        method: "POST",
        body: JSON.stringify(userMsg)
    }).then(() => {
        input.value = "";
        
        // ბ) ბოტის პასუხი (მხოლოდ თუ ადმინი არ არის შემოსული)
        if (!adminJoined) {
            processBotResponse(text);
        }
    });
}

// 5. ბოტის ლოგიკა
function processBotResponse(userText) {
    let response = null;

    // ძებნა JSON-ში
    for (let key in botDatabase) {
        if (userText.toLowerCase().includes(key.toLowerCase())) {
            response = botDatabase[key];
            break;
        }
    }

    // თუ პასუხი არ არის - მეილის მოთხოვნა
    setTimeout(() => {
        if (response) {
            sendToFirebase("Bot", response);
        } else {
            const savedEmail = localStorage.getItem("userEmail");
            if (savedEmail) {
                sendToFirebase("Bot", `ბოდიში, პასუხი არ მაქვს. თქვენი მეილი (${savedEmail}) შენახულია და ადმინი მალე შემოვა.`);
            } else {
                showEmailForm();
            }
        }
    }, 1000);
}

// დამხმარე ფუნქცია Firebase-ში ჩასაწერად
function sendToFirebase(sender, text) {
    fetch(chatRef + "/messages.json", {
        method: "POST",
        body: JSON.stringify({ sender: sender, text: text, time: Date.now() })
    });
}

// მეილის ფორმის გამოჩენა
function showEmailForm() {
    const box = document.getElementById('chat-box');
    const formHtml = `
        <div class="msg bot-msg">
            პასუხი არ მაქვს. დატოვეთ მეილი და ადმინი შემოვა Live-ში:
            <div style="margin-top:8px; display:flex; gap:5px;">
                <input type="email" id="bot-email-input" placeholder="Email..." style="flex:1; padding:4px; color:black;">
                <button onclick="saveEmail()" style="background:#ff9d00; border:none; padding:4px 10px; cursor:pointer;">OK</button>
            </div>
        </div>`;
    box.innerHTML += formHtml;
    box.scrollTop = box.scrollHeight;
}

// მეილის შენახვა
function saveEmail() {
    const email = document.getElementById('bot-email-input').value;
    if (!email.includes('@')) return alert("არასწორი მეილი!");

    localStorage.setItem("userEmail", email);
    
    // ვატყობინებთ ბაზას, რომ ახალი "მოთხოვნაა" (ადმინისთვის)
    fetch("https://ge-rp-web-default-rtdb.europe-west1.firebasedatabase.app/admin_notifications.json", {
        method: "POST",
        body: JSON.stringify({ userId: userId, email: email, status: "waiting" })
    });

    sendToFirebase("System", `მომხმარებელმა დატოვა მეილი: ${email}`);
}

// კლავიატურის ენთერი
function handleKey(e) {
    if (e.key === 'Enter') sendMessage();
}

// Quick Reply ფუნქცია
function askQuick(text) {
    document.getElementById('user-input').value = text;
    sendMessage();
}

function listenToChat() {
    fetch(chatRef + ".json")
    .then(res => res.json())
    .then(data => {
        const box = document.getElementById('chat-box');
        const statusDot = document.getElementById('admin-status-dot');
        const chatTitle = document.getElementById('chat-title');
        
        if (!data) {
            box.innerHTML = '<div class="msg bot-msg">ჩათის ისტორია გასუფთავებულია.</div>';
            updateStatus(false);
            return;
        }

        // ადმინის სტატუსის განახლება
        adminJoined = data.adminJoined || false;
        updateStatus(adminJoined);

        // მესიჯების ლოგიკა (იგივე რჩება რაც იყო)
        const messages = data.messages ? Object.values(data.messages) : [];
        if (messages.length !== lastMessageCount) {
            box.innerHTML = "";
            messages.forEach(m => {
                let senderClass = (m.sender === "admin") ? "bot-msg admin-style" : 
                                 (m.sender === "Bot" || m.sender === "System") ? "bot-msg" : "user-msg";
                box.innerHTML += `<div class="msg ${senderClass}"><b>${m.sender}:</b> ${m.text}</div>`;
            });
            box.scrollTop = box.scrollHeight;
            lastMessageCount = messages.length;
        }
    });
}

// სტატუსის ვიზუალური შეცვლა
function updateStatus(isLive) {
    const statusDot = document.getElementById('admin-status-dot');
    const chatTitle = document.getElementById('chat-title');

    if (isLive) {
        statusDot.style.background = "#00ff00"; // მწვანე
        statusDot.style.boxShadow = "0 0 8px #00ff00";
        chatTitle.innerText = "LIVE: ადმინისტრატორი";
        chatTitle.style.color = "#00ff00";
    } else {
        statusDot.style.background = "#555"; // ნაცრისფერი
        statusDot.style.boxShadow = "none";
        chatTitle.innerText = "SAMP GEORGIA BOT";
        chatTitle.style.color = "#ff9d00";
    }
}