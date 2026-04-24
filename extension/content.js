async function lockPage() {
  const unlockTime = localStorage.getItem("etf-unlock-time");

  if (unlockTime && Date.now() < parseInt(unlockTime, 10)) return;

  if (document.getElementById("earn-the-feed-container")) return;

  const style = document.createElement("style");
  style.textContent = `
    body > *:not(#earn-the-feed-container) { display: none !important; }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    @keyframes pulseDot {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(167, 139, 250, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
    }

    @keyframes pulseContainer {
      0% { box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.05); }
      50% { box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5), 0 0 50px rgba(124, 58, 237, 0.15); }
      100% { box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.05); }
    }

    @keyframes shake {
      0% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
      100% { transform: translateX(0); }
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: radial-gradient(circle at 15% 50%, rgba(124, 58, 237, 0.15), transparent 45%),
                  radial-gradient(circle at 85% 30%, rgba(56, 189, 248, 0.15), transparent 45%),
                  linear-gradient(220deg, #050812, #0f1322, #0a0e1c) !important;
      background-size: 200% 200% !important;
      animation: gradientShift 15s ease infinite !important;
      color: #eef2ff !important;
      font-family: Inter, system-ui, -apple-system, sans-serif !important;
      overflow: hidden !important;
    }

    html::before, body::before {
      content: "";
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 999998;
    }

    #earn-the-feed-container {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      z-index: 999999;
      animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .etf-ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(124, 58, 237, 0.12);
      border: 1px solid rgba(124, 58, 237, 0.25);
      border-radius: 999px;
      color: #c4b5fd;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 20px;
      backdrop-filter: blur(8px);
    }

    .etf-ai-dot {
      width: 6px;
      height: 6px;
      background: #a78bfa;
      border-radius: 50%;
      animation: pulseDot 2s infinite;
    }

    .etf-heading {
      font-size: 3.2rem;
      line-height: 1.1;
      margin-bottom: 14px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.03em;
      text-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .etf-subtitle {
      color: #94a3b8;
      line-height: 1.6;
      font-size: 1.1rem;
      margin-bottom: 36px;
      max-width: 680px;
      font-weight: 400;
      text-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }

    .etf-puzzle-container {
      position: relative;
      background: rgba(15, 20, 35, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.05);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      padding: 32px;
      width: 600px;
      max-width: 90%;
      text-align: left;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
      animation: pulseContainer 6s infinite alternate;
    }

    .etf-puzzle-container::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 28px;
      border: 1px solid transparent;
      background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%) border-box;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
    }

    .etf-puzzle-container:hover {
      transform: translateY(-6px);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.15);
    }

    .etf-puzzle-question {
      font-size: 1.25rem;
      font-weight: 600;
      color: #f8fafc;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
      line-height: 1.4;
    }

    .etf-puzzle-code {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 20px;
      margin: 1.5rem 0 28px 0;
      text-align: left;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #38bdf8;
      font-size: 0.95rem;
      overflow-x: auto;
      box-shadow: inset 0 2px 15px rgba(0,0,0,0.3);
    }

    .etf-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      color: #f8fafc;
      font-size: 1.05rem;
      padding: 16px 20px;
      outline: none;
      margin-bottom: 20px;
      font-family: inherit;
      box-sizing: border-box;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .etf-input:focus {
      background: rgba(0, 0, 0, 0.4);
      border-color: #8b5cf6;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15), inset 0 1px 3px rgba(0,0,0,0.3);
      transform: translateY(-2px);
    }

    .etf-submit {
      position: relative;
      width: 100%;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white;
      border: none;
      border-radius: 16px;
      padding: 16px 20px;
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(109, 40, 217, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .etf-submit::before {
      content: "";
      position: absolute;
      top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.6s ease;
    }

    .etf-submit:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 15px 35px rgba(109, 40, 217, 0.45);
      background: linear-gradient(135deg, #9366f6, #7633e0);
    }

    .etf-submit:hover::before {
      left: 100%;
    }

    .etf-submit:active {
      transform: translateY(1px) scale(0.99);
      box-shadow: 0 5px 15px rgba(109, 40, 217, 0.3);
    }

    .etf-submit.loading {
      color: transparent;
      pointer-events: none;
    }

    .etf-submit.loading::after {
      content: "";
      position: absolute;
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spinner 0.8s linear infinite;
    }

    @keyframes spinner {
      to { transform: rotate(360deg); }
    }

    .etf-error {
      color: #fb7185;
      margin-top: 1.2rem;
      text-align: center;
      font-size: 0.95rem;
      font-weight: 500;
      animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    .etf-success {
      color: #34d399;
      margin-top: 1.2rem;
      text-align: center;
      font-size: 0.95rem;
      font-weight: 500;
      text-shadow: 0 0 10px rgba(52, 211, 153, 0.4);
    }

    .etf-success-glow {
      animation: successGlow 0.8s ease-out forwards !important;
    }

    @keyframes successGlow {
      0% { box-shadow: 0 18px 50px rgba(0,0,0,0.5), 0 0 30px rgba(124, 58, 237, 0.05); }
      50% { box-shadow: 0 18px 50px rgba(0,0,0,0.5), 0 0 80px rgba(52, 211, 153, 0.4); border-color: rgba(52, 211, 153, 0.5); }
      100% { box-shadow: 0 18px 50px rgba(0,0,0,0.5), 0 0 40px rgba(52, 211, 153, 0.2); border-color: rgba(52, 211, 153, 0.2); }
    }

    #result {
      text-align: center;
      margin-top: 1.2rem;
      font-size: 0.95rem;
      font-weight: 500;
      min-height: 20px;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "earn-the-feed-container";
  container.innerHTML = `
    <div class="etf-ai-badge"><span class="etf-ai-dot"></span> AI Protocol</div>
    <div class="etf-heading">System Locked</div>
    <div class="etf-subtitle">Establishing secure connection to neural network...</div>
  `;
  document.body.appendChild(container);

  try {
    const res = await fetch("http://localhost:3000/get-puzzle");
    const data = await res.json();

    container.innerHTML = `
      <div class="etf-ai-badge"><span class="etf-ai-dot"></span> Generated Task</div>
      <div class="etf-heading">System Locked</div>
      <div class="etf-subtitle">Complete the technical task to verify neural alignment and regain access.</div>

      <div class="etf-puzzle-container" id="etf-card">
        <div class="etf-puzzle-question">${data.question}</div>
        <div class="etf-puzzle-code">${data.code}</div>

        <input id="answer" class="etf-input" placeholder="Enter output..." autocomplete="off" spellcheck="false" />
        <button id="submit" class="etf-submit">Authenticate</button>
        <div id="result"></div>
      </div>
    `;

    document.getElementById("submit").onclick = async () => {
      const submitBtn = document.getElementById("submit");
      const answer = document.getElementById("answer").value;
      const resultDiv = document.getElementById("result");
      const card = document.getElementById("etf-card");

      submitBtn.classList.add("loading");
      resultDiv.innerText = "";
      resultDiv.className = "";

      try {
        const verifyRes = await fetch("http://localhost:3000/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ answer })
        });

        submitBtn.classList.remove("loading");

        if (verifyRes.ok) {
          resultDiv.innerText = "ACCESS GRANTED ✅";
          resultDiv.className = "etf-success";
          card.classList.add("etf-success-glow");

          document.body.style.transition = "background 0.6s ease";
          document.body.style.background = "radial-gradient(circle at center, rgba(52, 211, 153, 0.15), transparent 60%), #0b1020";
          setTimeout(() => {
            document.body.style.background = "";
          }, 600);

          localStorage.setItem(
            "etf-unlock-time",
            Date.now() + 15 * 60 * 1000
          );

          setTimeout(() => location.reload(), 800);
        } else {
          resultDiv.innerText = "ACCESS DENIED ❌";
          resultDiv.className = "etf-error";
          // Trigger reflow to restart animation if multiple errors
          void resultDiv.offsetWidth;
        }
      } catch (err) {
        submitBtn.classList.remove("loading");
        resultDiv.innerText = "Connection Error";
        resultDiv.className = "etf-error";
      }
    };
  } catch (err) {
    container.innerHTML = `
      <div class="etf-ai-badge" style="border-color: rgba(251, 113, 133, 0.3); background: rgba(251, 113, 133, 0.1); color: #fda4af;">
        <span class="etf-ai-dot" style="background: #fb7185; animation: none;"></span> Connection Failed
      </div>
      <div class="etf-heading">Neural Link Offline</div>
      <div class="etf-error" style="animation: none;">Cannot connect to backend. Please ensure the server is running.</div>
    `;
  }
}

if (document.body) {
  lockPage();
} else {
  document.addEventListener("DOMContentLoaded", lockPage);
}