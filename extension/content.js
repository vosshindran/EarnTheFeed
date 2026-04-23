(function() {
    console.log("Earn The Feed: Content script loaded.");

    const DEFAULT_SITES = [
        { id: "instagram", name: "Instagram", domain: "instagram.com" },
        { id: "facebook", name: "Facebook", domain: "facebook.com" },
        { id: "twitter", name: "Twitter / X", domain: "twitter.com" },
        { id: "youtube", name: "YouTube", domain: "youtube.com" },
        { id: "reddit", name: "Reddit", domain: "reddit.com" },
        { id: "tiktok", name: "TikTok", domain: "tiktok.com" },
        { id: "linkedin", name: "LinkedIn", domain: "linkedin.com" }
    ];

    function getSettings() {
        const settings = localStorage.getItem("etf-settings");
        return settings ? JSON.parse(settings) : { duration: 15, blockedSites: DEFAULT_SITES.map(s => s.id) };
    }

    function saveSettings(settings) {
        localStorage.setItem("etf-settings", JSON.stringify(settings));
    }

    function getUnlockTime() {
        return parseInt(localStorage.getItem("etf-unlock-time") || "0", 10);
    }

    function isUnlocked() {
        return Date.now() < getUnlockTime();
    }

    function isCurrentSiteBlocked() {
        const settings = getSettings();
        const host = window.location.hostname;
        return settings.blockedSites.some(siteId => {
            const site = DEFAULT_SITES.find(s => s.id === siteId);
            return site && host.includes(site.domain);
        });
    }

    function createTimerUI() {
        const updateTimer = () => {
            const remaining = getUnlockTime() - Date.now();
            if (remaining <= 0) {
                const timerEl = document.getElementById("etf-timer");
                if (timerEl) timerEl.remove();
                lockPage(true);
                return;
            }
            const fiveMinutes = 5 * 60000;
            if (remaining <= fiveMinutes) {
                let timerEl = document.getElementById("etf-timer");
                if (!timerEl) {
                    timerEl = document.createElement("div");
                    timerEl.id = "etf-timer";
                    Object.assign(timerEl.style, {
                        position: "fixed", bottom: "110px", right: "30px", background: "rgba(0,0,0,0.9)",
                        backdropFilter: "blur(20px)", border: "1px solid var(--primary)", borderRadius: "20px",
                        padding: "12px 20px", color: "#00f2ff", fontFamily: "var(--font)", fontSize: "0.9rem",
                        fontWeight: "800", zIndex: "2147483646", pointerEvents: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                    });
                    timerEl.innerHTML = `⏳ <span id="etf-time-left">--:--</span>`;
                    document.body.appendChild(timerEl);
                }
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                document.getElementById("etf-time-left").innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            setTimeout(updateTimer, 1000);
        };
        updateTimer();
    }

    async function lockPage(isTimeout = false) {
        if (!isCurrentSiteBlocked()) return;
        if (isUnlocked() && !isTimeout) { createTimerUI(); return; }
        if (document.getElementById("etf-overlay")) return;

        const style = document.createElement("style");
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

            :root { --primary: #00f2ff; --secondary: #7000ff; --accent: #ff00c8; --bg: #000; --card-bg: #111; --font: 'DM Sans', sans-serif; }
            body > *:not(#etf-overlay) { display: none !important; }
            html, body { background: var(--bg) !important; margin: 0 !important; overflow: hidden !important; width: 100vw; height: 100vh; }

            #etf-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: var(--bg); display: flex; flex-direction: column;
                z-index: 2147483647; font-family: var(--font); color: white;
                overflow-y: auto; overflow-x: hidden;
            }

            .etf-header { height: 70px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
            .etf-logo { font-size: 1rem; font-weight: 800; color: var(--primary); letter-spacing: 2px; }

            .etf-main { flex: 1; width: 100%; display: flex; justify-content: center; padding: 40px 0 120px 0; }
            
            .etf-dashboard-card {
                background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
                border-radius: 32px; padding: 3rem; width: 850px; max-width: 95%; 
                box-shadow: 0 40px 80px rgba(0,0,0,0.6);
                height: fit-content; margin: auto; display: flex; gap: 40px;
                animation: cardIn 0.5s ease-out;
            }
            @keyframes cardIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

            .etf-col-left { flex: 0 0 320px; text-align: left; display: flex; flex-direction: column; justify-content: center; }
            .etf-col-right { flex: 1; display: flex; flex-direction: column; gap: 12px; }

            .etf-locked-badge {
                display: inline-flex; align-items: center; gap: 8px; background: rgba(0,242,255,0.1);
                padding: 6px 12px; border-radius: 100px; font-size: 0.6rem; font-weight: 800;
                color: var(--primary); margin-bottom: 12px; border: 1px solid rgba(0,242,255,0.2);
                text-transform: uppercase; letter-spacing: 1px; width: fit-content;
            }
            .etf-locked-badge span { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 8px var(--primary); }

            .etf-title { font-size: 2.1rem; font-weight: 800; margin: 0; line-height: 1.1; letter-spacing: -1px; }
            .etf-subtitle { opacity: 0.4; font-size: 0.95rem; margin-top: 15px; line-height: 1.5; }

            .etf-card-row {
                background: #181818; border-radius: 20px; padding: 18px 24px;
                display: flex; align-items: center; cursor: pointer; transition: 0.3s;
                border: 1px solid rgba(255,255,255,0.02); position: relative; overflow: hidden;
            }
            .etf-card-content { display: flex; align-items: center; width: 100%; transition: 0.3s; }
            .etf-card-hover-text { 
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                display: flex; align-items: center; justify-content: center;
                opacity: 0; transform: translateY(10px); transition: 0.3s;
                font-weight: 800; letter-spacing: 1px; color: var(--primary); text-transform: uppercase; font-size: 0.95rem;
            }
            .etf-card-row:hover { background: #222; transform: translateX(5px); border-color: var(--primary); box-shadow: 0 0 20px rgba(0,242,255,0.1); }
            .etf-card-row:hover .etf-card-content { opacity: 0; transform: scale(0.97); }
            .etf-card-row:hover .etf-card-hover-text { opacity: 1; transform: translateY(0); }

            .etf-card-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-right: 18px; }
            .etf-card-info { flex: 1; text-align: left; }
            .etf-card-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 2px; }
            .etf-card-name { font-size: 1.05rem; font-weight: 700; }

            .etf-visualizer { 
                width: 100%; height: 260px; background: #000; border-radius: 24px; 
                display: flex; align-items: center; justify-content: center; 
                border: 1px solid rgba(0,242,255,0.15); box-shadow: inset 0 0 20px rgba(0,242,255,0.05);
                position: relative; overflow: hidden;
            }
            .visualizer-svg { width: 100%; height: 100%; max-width: 180px; max-height: 180px; }
            .svg-character { stroke: var(--primary); stroke-width: 7; stroke-linecap: round; fill: none; filter: drop-shadow(0 0 5px var(--primary)); }
            .svg-head { fill: var(--primary); stroke: none; filter: drop-shadow(0 0 8px var(--primary)); }

            .jack-anim .body-anim { animation: jack-cycle 0.8s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95); }
            @keyframes jack-cycle { from { transform: translateY(10px); } to { transform: translateY(-15px); } }
            .jack-anim .arm-l { animation: jack-arm-l 0.8s infinite alternate ease-in-out; transform-origin: 50px 45px; }
            .jack-anim .arm-r { animation: jack-arm-r 0.8s infinite alternate ease-in-out; transform-origin: 50px 45px; }
            .jack-anim .leg-l { animation: jack-leg-l 0.8s infinite alternate ease-in-out; transform-origin: 50px 65px; }
            .jack-anim .leg-r { animation: jack-leg-r 0.8s infinite alternate ease-in-out; transform-origin: 50px 65px; }
            @keyframes jack-arm-l { from { transform: rotate(0deg); } to { transform: rotate(140deg); } }
            @keyframes jack-arm-r { from { transform: rotate(0deg); } to { transform: rotate(-140deg); } }
            @keyframes jack-leg-l { from { transform: rotate(0deg); } to { transform: rotate(35deg); } }
            @keyframes jack-leg-r { from { transform: rotate(0deg); } to { transform: rotate(-35deg); } }
            .pushup-anim .body-anim { animation: pushup-cycle 1s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95); }
            @keyframes pushup-cycle { from { transform: translateY(15px); } to { transform: translateY(-15px); } }

            .etf-footer { 
                position: fixed; bottom: 0; left: 0; width: 100%; height: 90px; 
                background: rgba(255,255,255,0.03); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
                border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-around; 
                align-items: center; z-index: 2147483647; 
            }
            .etf-tab { 
                display: flex; flex-direction: column; align-items: center; gap: 8px; 
                opacity: 0.3; font-weight: 800; font-size: 0.7rem; cursor: pointer; 
                transition: 0.3s; position: relative; width: 100px; 
            }
            .etf-tab-icon { font-size: 1.4rem; }
            .etf-tab.active { opacity: 1; color: var(--primary); }
            .etf-tab.active::before { content: ''; position: absolute; top: -10px; width: 40px; height: 3px; background: var(--primary); border-radius: 0 0 5px 5px; box-shadow: 0 0 15px var(--primary); }

            .etf-section { text-align: left; margin-bottom: 2rem; width: 100%; }
            .etf-label { font-size: 0.7rem; font-weight: 800; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 10px; display: block; text-transform: uppercase; }
            .etf-slider { width: 100%; accent-color: var(--primary); height: 8px; border-radius: 10px; margin: 10px 0; }
            .etf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .etf-checkbox { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); padding: 12px; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700; border: 1px solid transparent; }
            .etf-checkbox:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); }

            .etf-input { width: 100%; background: #000; border: 1px solid rgba(255,255,255,0.1); padding: 1.1rem; border-radius: 18px; color: white; margin-bottom: 1.2rem; outline: none; font-size: 1.1rem; }
            .etf-submit { width: 100%; background: var(--primary); border: none; padding: 1.2rem; border-radius: 18px; font-weight: 800; cursor: pointer; color: black; font-size: 1rem; }
            
            /* CHALLENGE SCREEN ADAPTIVE CENTERING */
            .etf-challenge-container { display: flex; width: 100%; gap: 40px; align-items: flex-start; }
            .etf-challenge-container.centered { justify-content: center; text-align: center; }
            .etf-challenge-container.centered .etf-challenge-col-right { max-width: 500px; text-align: center; }
            .etf-challenge-container.centered #etf-question { text-align: center; }
            .etf-challenge-container.centered #etf-code { text-align: left; margin: 0 auto 1.2rem auto; }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement("div");
        overlay.id = "etf-overlay";
        
        const renderQuests = () => {
            overlay.innerHTML = `
                <div class="etf-header"><div class="etf-logo">EARN THE FEED</div></div>
                <div class="etf-main">
                    <div class="etf-dashboard-card">
                        <div id="selection-screen" style="display:flex; width:100%; gap:40px;">
                            <div class="etf-col-left">
                                <div class="etf-locked-badge"><span></span> SYSTEM LOCKED</div>
                                <h1 class="etf-title">CHOOSE A CHALLENGE</h1>
                                <p class="etf-subtitle">The protocol is active. Complete a challenge to restore access to your feed.</p>
                            </div>
                            <div class="etf-col-right">
                                <div class="etf-card-row" data-type="workout">
                                    <div class="etf-card-content"><div class="etf-card-icon" style="color: #ffd700;">💪</div><div class="etf-card-info"><div class="etf-card-label" style="color: #ffd700;">STRENGTH</div><div class="etf-card-name">Workout Challenge</div></div></div>
                                    <div class="etf-card-hover-text">Start now ✨</div>
                                </div>
                                <div class="etf-card-row" data-type="puzzle">
                                    <div class="etf-card-content"><div class="etf-card-icon" style="color: #00ff41;">🧩</div><div class="etf-card-info"><div class="etf-card-label" style="color: #00ff41;">COGNITIVE</div><div class="etf-card-name">Logical Puzzle</div></div></div>
                                    <div class="etf-card-hover-text">Start now ✨</div>
                                </div>
                                <div class="etf-card-row" data-type="coding">
                                    <div class="etf-card-content"><div class="etf-card-icon" style="color: #00f2ff;">&lt;&gt;</div><div class="etf-card-info"><div class="etf-card-label" style="color: #00f2ff;">TECHNICAL</div><div class="etf-card-name">Coding Challenge</div></div></div>
                                    <div class="etf-card-hover-text">Start now ✨</div>
                                </div>
                            </div>
                        </div>
                        <div id="challenge-screen" class="etf-challenge-container" style="display:none;">
                            <div class="etf-challenge-col-left" style="flex:0 0 300px;">
                                <div class="etf-visualizer" id="etf-visualizer"></div>
                            </div>
                            <div class="etf-challenge-col-right" style="flex:1; text-align:left; padding-top: 20px;">
                                <p id="etf-question" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.2rem;"></p>
                                <pre id="etf-code" style="background:#000; padding:1.2rem; border-radius:18px; color:#00ff41; overflow-x:auto; margin-bottom:1.2rem; border: 1px solid rgba(0,255,65,0.1); font-family: monospace; font-size: 0.95rem;"></pre>
                                <input type="text" id="etf-answer" class="etf-input" placeholder="Your answer..." />
                                <button id="etf-submit" class="etf-submit">AUTHENTICATE</button>
                                <button id="etf-back" style="background:none; border:none; color:rgba(255,255,255,0.3); margin-top:1.2rem; cursor:pointer; font-weight: 800; width: 100%; font-size: 0.85rem;">← BACK</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="etf-footer">
                    <div class="etf-tab active" id="tab-quests"><span class="etf-tab-icon">⚔️</span>QUESTS</div>
                    <div class="etf-tab" id="tab-dashboard"><span class="etf-tab-icon">📊</span>DASHBOARD</div>
                    <div class="etf-tab" id="tab-settings"><span class="etf-tab-icon">⚙️</span>SETTINGS</div>
                </div>
            `;
            attachQuestsEvents();
            attachTabEvents();
        };

        const renderSettings = () => {
            const settings = getSettings();
            overlay.innerHTML = `
                <div class="etf-header"><div class="etf-logo">EARN THE FEED</div></div>
                <div class="etf-main">
                    <div class="etf-dashboard-card" style="display:block;">
                        <h1 class="etf-title">SETTINGS</h1>
                        <p class="etf-subtitle" style="margin-bottom:30px;">Configure your focus protocol and site restrictions.</p>
                        <div style="display:flex; gap:40px;">
                            <div class="etf-section" style="flex:1;">
                                <label class="etf-label">Unlock Duration: <span id="dur-val" style="color:var(--primary); font-weight:800;">${settings.duration}</span> MINS</label>
                                <input type="range" id="etf-dur-slider" class="etf-slider" min="5" max="60" step="5" value="${settings.duration}">
                            </div>
                            <div class="etf-section" style="flex:1.5;">
                                <label class="etf-label">Target Domains:</label>
                                <div class="etf-grid">
                                    ${DEFAULT_SITES.map(site => `
                                        <label class="etf-checkbox">
                                            <input type="checkbox" value="${site.id}" ${settings.blockedSites.includes(site.id) ? 'checked' : ''}>
                                            ${site.name}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <button id="etf-save-settings" class="etf-submit" style="margin-top:20px;">SAVE PROTOCOL</button>
                    </div>
                </div>
                <div class="etf-footer">
                    <div class="etf-tab" id="tab-quests"><span class="etf-tab-icon">⚔️</span>QUESTS</div>
                    <div class="etf-tab" id="tab-dashboard"><span class="etf-tab-icon">📊</span>DASHBOARD</div>
                    <div class="etf-tab active" id="tab-settings"><span class="etf-tab-icon">⚙️</span>SETTINGS</div>
                </div>
            `;
            const slider = overlay.querySelector("#etf-dur-slider");
            slider.oninput = () => overlay.querySelector("#dur-val").innerText = slider.value;
            overlay.querySelector("#etf-save-settings").onclick = () => {
                const blockedSites = Array.from(overlay.querySelectorAll("input[type='checkbox']:checked")).map(i => i.value);
                saveSettings({ duration: parseInt(slider.value, 10), blockedSites });
                renderQuests();
            };
            attachTabEvents();
        };

        const renderDashboard = () => {
            overlay.innerHTML = `
                <div class="etf-header"><div class="etf-logo">EARN THE FEED</div></div>
                <div class="etf-main"><div class="etf-dashboard-card" style="display:block;"><h1 class="etf-title">DASHBOARD</h1><p class="etf-subtitle">Protocol metrics and streaks coming soon.</p></div></div>
                <div class="etf-footer">
                    <div class="etf-tab" id="tab-quests"><span class="etf-tab-icon">⚔️</span>QUESTS</div>
                    <div class="etf-tab active" id="tab-dashboard"><span class="etf-tab-icon">📊</span>DASHBOARD</div>
                    <div class="etf-tab" id="tab-settings"><span class="etf-tab-icon">⚙️</span>SETTINGS</div>
                </div>
            `;
            attachTabEvents();
        };

        const attachTabEvents = () => {
            overlay.querySelector("#tab-quests").onclick = renderQuests;
            overlay.querySelector("#tab-dashboard").onclick = renderDashboard;
            overlay.querySelector("#tab-settings").onclick = renderSettings;
        };

        const characterSVG = (className, isPushup) => `
            <svg class="visualizer-svg ${className}" viewBox="0 0 100 100">
                <g class="body-anim" ${isPushup ? 'transform="rotate(-90 50 50)"' : ''}>
                    <circle class="svg-head" cx="50" cy="40" r="10" />
                    <line class="svg-character" x1="50" y1="50" x2="50" y2="75" />
                    <line class="arm-l svg-character" x1="50" y1="55" x2="30" y2="70" />
                    <line class="arm-r svg-character" x1="50" y1="55" x2="70" y2="70" />
                    <line class="leg-l svg-character" x1="50" y1="75" x2="35" y2="95" />
                    <line class="leg-r svg-character" x1="50" y1="75" x2="65" y2="95" />
                </g>
            </svg>
        `;

        const attachQuestsEvents = () => {
            const selectionScreen = overlay.querySelector("#selection-screen");
            const challengeScreen = overlay.querySelector("#challenge-screen");
            const visualizerCol = overlay.querySelector(".etf-challenge-col-left");
            const visualizer = overlay.querySelector("#etf-visualizer");
            const questionEl = overlay.querySelector("#etf-question");
            const codeEl = overlay.querySelector("#etf-code");
            const inputEl = overlay.querySelector("#etf-answer");

            overlay.querySelectorAll(".etf-card-row").forEach(btn => {
                btn.onclick = async () => {
                    const type = btn.dataset.type;
                    try {
                        const res = await fetch(`http://127.0.0.1:3000/get-challenge?type=${type}`);
                        const data = await res.json();
                        const isWorkout = type === "workout";
                        
                        // Adaptive Centering Logic
                        if (isWorkout) {
                            challengeScreen.classList.remove("centered");
                            visualizerCol.style.display = "block";
                        } else {
                            challengeScreen.classList.add("centered");
                            visualizerCol.style.display = "none";
                        }

                        questionEl.innerText = data.question;
                        codeEl.innerText = data.code || "";
                        codeEl.style.display = (isWorkout || (!data.code && type !== "puzzle")) ? "none" : "block";
                        visualizer.style.display = isWorkout ? "flex" : "none";
                        inputEl.placeholder = isWorkout ? "Type 'DONE' when finished..." : "Your answer...";
                        if (isWorkout) {
                            const isPushup = data.question.toLowerCase().includes("pushup");
                            visualizer.innerHTML = characterSVG(isPushup ? "pushup-anim" : "jack-anim", isPushup);
                        }
                        selectionScreen.style.display = "none";
                        challengeScreen.style.display = "flex";
                        inputEl.focus();
                        overlay.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (err) { alert("Backend unreachable."); }
                };
            });

            overlay.querySelector("#etf-back").onclick = () => {
                challengeScreen.style.display = "none";
                selectionScreen.style.display = "flex";
                overlay.scrollTo({ top: 0, behavior: 'smooth' });
            };

            const verify = async () => {
                const answer = inputEl.value;
                try {
                    const res = await fetch("http://127.0.0.1:3000/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ answer })
                    });
                    if (res.ok) {
                        const settings = getSettings();
                        localStorage.setItem("etf-unlock-time", Date.now() + (settings.duration || 15) * 60000);
                        location.reload();
                    }
                } catch (err) {}
            };
            overlay.querySelector("#etf-submit").onclick = verify;
            inputEl.onkeypress = (e) => { if (e.key === 'Enter') verify(); };
        };

        const muteMedia = () => {
            document.querySelectorAll("video, audio").forEach(media => { media.muted = true; media.pause(); });
        };

        renderQuests();
        const muteInterval = setInterval(() => {
            if (!document.getElementById("etf-overlay")) { clearInterval(muteInterval); return; }
            muteMedia();
        }, 500);
        document.body.appendChild(overlay);
        muteMedia();
    }

    if (document.body) { lockPage(); } else {
        const observer = new MutationObserver(() => { if (document.body) { lockPage(); observer.disconnect(); } });
        observer.observe(document.documentElement, { childList: true });
    }
})();