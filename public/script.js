const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Menyimpan riwayat obrolan agar AI ingat konteks
let messageHistory = []; 

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan pesan user di layar
    appendMessage("user", text);
    userInput.value = "";
    
    // 2. Masukkan ke riwayat untuk dikirim ke backend
    messageHistory.push({ role: "user", content: text });

    // 3. Buat bubble kosong untuk balasan AI yang akan masuk secara streaming
    const botBubble = appendMessage("bot", "");