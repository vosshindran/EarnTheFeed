async function lockPage() {
    const unlockTime = localStorage.getItem("etf-unlock-time");

    if (unlockTime && Date.now() < parseInt(unlockTime, 10)) return;

    if (document.getElementById("earn-the-feed-container")) return;

    const style = document.createElement("style");
    style.textContent = `
    body > *:not(#earn-the-feed-container) { display: none !important; }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: radial-gradient(circle, #050505, #000000);
      overflow: hidden !important;
    }

    #earn-the-feed-container {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #00ff41;
      font-family: monospace;
      text-align: center;
    }

    .etf-title {
      font-size: 4rem;
      text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41;
      animation: glitch 1.5s infinite;
    }

    .etf-subtitle {
      margin-bottom: 2rem;
      opacity: 0.7;
    }

    .etf-puzzle-container {
      border: 1px solid #00ff41;
      padding: 2rem;
      background: rgba(0,255,65,0.05);
      box-shadow: 0 0 20px rgba(0,255,65,0.3);
      width: 600px;
      max-width: 90%;
    }

    .etf-puzzle-code {
      background: rgba(0,255,65,0.1);
      padding: 10px;
      margin: 1rem 0;
      text-align: left;
    }

    .etf-input {
      border: none;
      border-bottom: 2px solid #00ff41;
      background: transparent;
      color: #00ff41;
      font-size: 1.2rem;
      padding: 10px;
      width: 70%;
      text-align: center;
      outline: none;
    }

    .etf-submit {
      margin-top: 1rem;
      padding: 10px 30px;
      border: 2px solid #00ff41;
      background: transparent;
      color: #00ff41;
      cursor: pointer;
    }

    .etf-submit:hover {
      background: #00ff41;
      color: black;
      box-shadow: 0 0 10px #00ff41;
    }

    .etf-error {
      color: #ff003c;
      margin-top: 1rem;
      animation: shake 0.3s;
    }

    @keyframes glitch {
      0% { text-shadow: 2px 2px #00ff41; }
      25% { text-shadow: -2px -2px #00ff41; }
      50% { text-shadow: 2px -2px #00ff41; }
      75% { text-shadow: -2px 2px #00ff41; }
      100% { text-shadow: 2px 2px #00ff41; }
    }

    @keyframes shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
      75% { transform: translateX(-5px); }
      100% { transform: translateX(0); }
    }
  `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.id = "earn-the-feed-container";
    container.innerHTML = `
    <div class="etf-title">EARN THE FEED</div>
    <div class="etf-subtitle">Connecting to neural network...</div>
  `;
    document.body.appendChild(container);

    try {
        const res = await fetch("http://localhost:3000/get-puzzle");
        const data = await res.json();

        container.innerHTML = `
      <div class="etf-title">EARN THE FEED</div>
      <div class="etf-subtitle">System Locked</div>

      <div class="etf-puzzle-container">
        <div>> ${data.question}</div>
        <div class="etf-puzzle-code">${data.code}</div>

        <input id="answer" class="etf-input" placeholder="Enter answer" />
        <br/>
        <button id="submit" class="etf-submit">Authenticate</button>
        <div id="result"></div>
      </div>
    `;

        document.getElementById("submit").onclick = async () => {
            const answer = document.getElementById("answer").value;

            const verifyRes = await fetch("http://localhost:3000/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ answer })
            });

            if (verifyRes.ok) {
                document.getElementById("result").innerText = "ACCESS GRANTED ✅";
                document.getElementById("result").style.color = "#00ff41";

                document.body.style.background = "#00ff41";
                setTimeout(() => {
                    document.body.style.background = "black";
                }, 200);

                localStorage.setItem(
                    "etf-unlock-time",
                    Date.now() + 15 * 60 * 1000
                );

                setTimeout(() => location.reload(), 800);
            } else {
                const result = document.getElementById("result");
                result.innerText = "ACCESS DENIED ❌";
                result.className = "etf-error";
            }
        };
    } catch (err) {
        container.innerHTML = `
      <div class="etf-title">ERROR</div>
      <div class="etf-error">Cannot connect to backend</div>
    `;
    }
}

if (document.body) {
    lockPage();
} else {
    document.addEventListener("DOMContentLoaded", lockPage);
}