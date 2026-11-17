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

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: messageHistory })
        });

        if (!response.ok) {
            throw new Error("Terjadi kesalahan pada server");
        }

        // 4. Proses membaca streaming response dari backend
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botFullResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith("data:")) {
                    const data = trimmedLine.slice(5).trim();
                    if (data === "[DONE]") break;

                    try {
                        // Mengubah string JSON (misal: "Halo") menjadi teks biasa
                        const parsedData = JSON.parse(data);
                        botFullResponse += parsedData;
                        // Update teks di dalam bubble AI secara bertahap
                        botBubble.textContent = botFullResponse;
                        // Scroll otomatis ke bawah
                        chatBox.scrollTop = chatBox.scrollHeight;
                    } catch (e) {
                        console.error("Error parsing chunk:", e);
                    }
                }
            }
        }

        // 5. Simpan balasan final AI ke riwayat
        messageHistory.push({ role: "assistant", content: botFullResponse });

    } catch (error) {
        botBubble.textContent = "Maaf, server sedang sibuk atau terjadi kesalahan.";
        console.error(error);
    }
}

// Fungsi pembantu untuk membuat elemen bubble chat baru
function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    
    const bubbleDiv = document.createElement("div");
    bubbleDiv.classList.add("bubble");
    bubbleDiv.textContent = text;
    
    msgDiv.appendChild(bubbleDiv);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return bubbleDiv; // Mengembalikan elemen untuk di-update saat streaming
}

// Event listener untuk tombol kirim dan enter
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});