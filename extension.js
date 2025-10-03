const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function activate(context) {
    console.log('Congratulations, your extension "reelherbs" is now active!');
    let disposable = vscode.commands.registerCommand("reelherbs.RellHerbs", function () {
        const panel = vscode.window.createWebviewPanel(
            "reelherbs",
            "Reel Herbs",
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath))
                ]
            }
        );

        panel.iconPath = {
            light: vscode.Uri.joinPath(context.extensionUri, "ReelHerbs_logo1.png"), // light theme
            dark: vscode.Uri.joinPath(context.extensionUri, "ReelHerbs_logo1.png")   // dark theme
        };


        const qrPath = vscode.Uri.file(
            path.join(context.extensionPath, 'qr.jpg')
        );
        const qrUri = panel.webview.asWebviewUri(qrPath);

        const jsonPath = path.join(context.extensionPath, "video_data.json");
        let jsonData = [];

        try {
            const raw = fs.readFileSync(jsonPath, "utf8");
            jsonData = JSON.parse(raw);
        } catch (err) {
            vscode.window.showErrorMessage("Error reading video_data.json: " + err.message);
        }

        // Convert file paths to webview URIs
        const items = jsonData.map(item => {
            if (!(item.audio_file || item.video_file)) return null

            const audioFilePath = path.join(context.extensionPath, 'audio', item.audio_file);
            item.audioUri = panel.webview.asWebviewUri(vscode.Uri.file(audioFilePath));
            const videoFilePath = path.join(context.extensionPath, 'video', item.video_file);
            item.videoUri = panel.webview.asWebviewUri(vscode.Uri.file(videoFilePath));

            return item;
        });

        panel.webview.onDidReceiveMessage((message) => {
            if (message.command === "scroll") {
                console.log("📜 Scroll detected in webview:", message.scrollTop);
                // 👉 you can add logic here, e.g. trigger audio start
            }
        });

        panel.webview.html = getWebviewContent(items, qrUri);
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;


function getWebviewContent(items, qrUri) {

    let mediaElements = items.map((item, index) => {

        // after every 8th video, insert an image card
        let extraCard = "";
        if ((index + 1) % 11 === 0) {
            extraCard = `
                <div class="card donation-box">
                    <img class="qr-img" src="${qrUri}"/>
                    <p class="donation-text"> ☕ “Enjoying the reels? Buy me a coffee with a quick scan.” </p>
                </div>
            `;
        }


        if (item.audioUri && item.videoUri) {
            return `
        <div class="card" data-audio="${item.audioUri}">
            <video  muted class="reel-video">
                <source src="${item.videoUri}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        ${extraCard}
    `;
        }

        return "";
    }).join("");


    return `
    <!DOCTYPE html>
    <html>
    <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>

        <meta charset="UTF-8">
        <style>
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                background: #111;
                font-family: 'Space Mono', monospace;
                overflow: hidden;
            }

            body {
                overflow-y: scroll;
                scroll-behavior: smooth; /* smooth scrolling */
                scroll-snap-type: y mandatory; /* snap vertically */
                width: 100%;
                max-width: fit-content;
            }

            .card {
                height: 100vh;       /* full screen per video */
                width: 100%;
                max-width: 295px; 
                display: flex;
                box-sizing: border-box;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                scroll-snap-align: start;     /* snap to top */
                scroll-snap-stop: always;     /* force full snap */
                background: #000;
                position: relative;
            }
            .reel-video {
                width: 100%;
                max-width: 270px;
                height: 82vh;
                object-fit: contain;  /* keep whole video visible */
                background: #000;
            }
            audio {
                position: absolute;
                bottom: 20px;
                width: 90%;
            }

            .card-container {
                width: 234px;
                background: #ffffff;
                border: 4px solid #000000;
                box-shadow: 8px 8px 0 #000;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .upper-container {
                height: 140px;
                background: #ffe600;
                border-bottom: 4px solid #000;
                display: flex;
                justify-content: center;
                align-items: flex-end;
            }

            .image-container {
                width: 100px;
                height: 100px;
                background: #ffffff;
                border: 4px solid #000;
                transform: translateY(50%);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .image-container img {
                width: 90px;
                height: 90px;
                object-fit: cover;
                border: 2px solid #000;
            }

            .lower-container {
                padding: 60px 20px 30px;
                text-align: center;
            }

            .lower-container h3 {
                margin: 0;
                font-size: 20px;
                font-weight: bold;
                color: #000;
            }

            .lower-container h4 {
                margin: 5px 0 15px;
                font-size: 14px;
                color: #333;
                font-weight: normal;
            }

            .lower-container p {
                font-size: 14px;
                color: #000;
                border: 2px dashed #000;
                padding: 10px;
                background: #f0f0f0;
                margin-bottom: 20px;
            }

            .btn, .btn-top {
                display: inline-block;
                padding: 10px 20px;
                background: #ff006e;
                color: #fff;
                text-decoration: none;
                font-weight: bold;
                border: 3px solid #000;
                box-shadow: 4px 4px 0 #000;
                transition: all 0.2s ease;
            }

            .btn:hover {
                background: #fff;
                color: #ff006e;
                border: 3px solid #ff006e;
                box-shadow: none;
            } 

             .donation-box {
                text-align: center;
                margin: 20px auto;
                padding: 15px;
                max-width: 280px;
            }

            .donation-text {
                font-size: 18px;
                font-weight: bold;
                line-height: 1.4em;
            }
        </style>
    </head>
    <body>
    <div style="background: #ffff" class="card">
        <div class="card-container">
            <div class="upper-container" style="height: 120px; ">
                <div class="image-container">
                <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=Alaina" alt="profile image" />
                </div>
            </div>

            <div class="lower-container" style="padding:62px 12px 30px;">
                <div>
                <h3>Short Extension</h3>
                <h4>Scroll to Roll</h4>
                </div>
                <div>
                <p>this is reel extension where you watch shorts like instagram and you tube </p>
                <p>👉 “Don’t scroll — use the space bar or the up and down keys to enjoy.”</p>
                </div>
                <div>
                <a href="#" class="btn">Scroll down ⬇️</a>
                </div>
            </div>
        </div>
    </div>     
    
    ${mediaElements}

    <!-- Reel ended -->
    <div class="card" style="background: #ffff">
        <div class="card-container">
        <div class="upper-container" style="background: #87ceeb;">
            <div class="image-container">
            <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=End" alt="end image" />
            </div>
        </div>
        <div class="lower-container">
            <h3>Hey👋</h3>
            <h4>Reel was ended if you go down something special 🤩</h4>
            <p>You've reached the end of the reels.</p>
            <a href="#" class="btn">Back to Top ⬆️</a>
        </div>
        </div>
    </div>

    <!-- Stop scrolling -->
    <div class="card" style="background: #ffff">
        <div class="card-container">
        <div class="upper-container" style="background:#ff4444;">
            <div class="image-container">
            <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=Stop" alt="stop image" />
            </div>
        </div>
        <div class="lower-container">
            <h3>⚠️ Stop Scrolling</h3>
            <h4>This is the end But it something new if you want?!</h4>
            <p>No more reels beyond this point.</p>
            <a href="#" class="btn">Back to Top ⬆️</a>
        </div>
        </div>
    </div>

    <!-- Otherwise I do something -->
    <div class="card" style="background: #ffff">
        <div class="card-container">
        <div class="upper-container" style="background:#ffa500;">
            <div class="image-container">
            <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=Warning" alt="warning image" />
            </div>
        </div>
        <div class="lower-container">
            <h3>⚠️ Stopped Scroll</h3>
            <h4>Otherwise U will pay what ever will hapeens next ☠️</h4>    
            <p>You shouldn't go further…</p>
            <a href="#" class="btn">Back to Scroll it will save U ⬆️</a>
        </div>
        </div>
    </div>

    <!-- Corrupted -->
    <div class="card" style="background: #ffff">
        <div class="card-container">
        <div class="upper-container" style="background:#5500aa;">
            <div class="image-container">
            <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=Corrupted" alt="corrupted image" />
            </div>
        </div>
        <div class="lower-container">
            <h3 style="color:#ff004c;">Now I was Corrupted</h3>
            <h4 style="color:#ff004c;">You will pay for this</h4>
            <p>System corruption initiated…</p>
        </div>
        </div>
    </div>

    <!-- Hacking -->
    <div class="card" style="background: #ffff">
        <div class="card-container">
        <div class="upper-container" style="background:#000;">
            <div class="image-container" style="background:#111;">
            <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=Hacker" alt="hack image"/>
            </div>
        </div>
        <div class="lower-container">
            <h3 style="color:#00ff00;">😵‍💫 𒅌 💀 į̕͘ ŵ͠͠ǟ̸ŋ̵ŧ ü̷ 👾 </h3>
            <h4> 𝕾𝖐𝖎𝖇𝖎𝖉𝖎 👁️⃤  𝕿𝖔𝖎𝖑𝖊𝖙</h4>
            <p style="color:#00ff00;">ACcE***/S..Den##D...w̸͏ιⅼƖ... p͞ą͡y</p>
        </div>
        </div>
    </div>
    
    </body>

    <script>

        const cards = document.querySelectorAll(".card");
        const audioPlayers = new Map(); // store Howl instances


        document.querySelectorAll(".donation-box").forEach(box => {
        let skipTimer = null;
        new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                // console.log("image processign....")
                // Start 2s timer to skip this donation box
                skipTimer = setTimeout(() => {
                    const next = box.nextElementSibling;
                    if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 2000);
            } 
            else {
                // console.log("image 2 processign....")
                // Stop the timer only if a video card is visible
                const visibleVideo = document.querySelector(".card video");
                if (visibleVideo) {
                    clearTimeout(skipTimer);
                    skipTimer = null;
                }
            }
        }, { threshold: 0.5 }).observe(box);
        });



        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const video = entry.target.querySelector("video");
                const audioUri = entry.target.dataset.audio;

                if (entry.isIntersecting) {
                    // ✅ Play video
                    if (video) {
                        video.muted = true; // required for autoplay
                        video.play().catch(err => console.log("⚠️ Video blocked:", err));

                    // Auto-scroll to next card when video ends
                        video.addEventListener("ended", () => {
                            const nextCard = entry.target.nextElementSibling;
                            if (nextCard) {
                                nextCard.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                        });
                    }

                    // ✅ Play audio using Howler
                    if (audioUri) {
                        if (!audioPlayers.has(audioUri)) {
                            const sound = new Howl({
                                src: [audioUri],
                                volume: 1.0,
                            });
                            audioPlayers.set(audioUri, sound);
                        }
                        audioPlayers.get(audioUri).play();
                    }

                    // console.log("▶️ Playing media for visible card");
                } else {
                    // ✅ Stop video
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }

                    // ✅ Stop audio
                    if (audioUri && audioPlayers.has(audioUri)) {
                        audioPlayers.get(audioUri).stop();
                    }

                    // console.log("⏸️ Stopped media for hidden card", entry.target);
                }
            });
        }, { threshold: 0.8 }); // 80% visible to trigger

        cards.forEach(card => observer.observe(card));



        // first card interstion
        document.querySelector(".btn").addEventListener("click", ()=>{

            const btn = document.querySelector(".btn");
            
            if (btn.innerText === "Scroll down ⬇️") {
                // console.log("⏸️ Stopped media for hidden card");
                document.querySelectorAll(".card")[1].scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                console.log("The button text is something else:", btn.innerText);
                // Stop all Howler.js audio
                btn.innerText = "Scroll down ⬇️";
                if (typeof audioPlayers !== "undefined") {
                    audioPlayers.forEach(sound => {
                        sound.stop();
                    });
                }
            }    
        })


        
		// Back to Top button handler
		const btns = document.querySelectorAll(".btn")

        btns.forEach((btn,index) => {
            if (index !== 0) {
            
                btn.addEventListener("click", e => {

                    // Scroll to very first card
                    document.querySelector(".card").scrollIntoView({ behavior: "smooth", block: "start" });
                    const video = entry.target.querySelector("video");
                
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }

                        // ✅ Stop audio
                    if (audioUri && audioPlayers.has(audioUri)) {
                        audioPlayers.get(audioUri).stop();
                    }
                    console.log("🔝 Back to Top clicked: all media stopped.");
                });
            }
		});



        let containerTimer = null; // global tracker
        let blockUp = false;

        function toggleBlockUp(state) {
            blockUp = state;
        }

        // Block ArrowUp
        window.addEventListener("keydown", (e) => {
            if (blockUp && e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        // Block Wheel Up
        window.addEventListener("wheel", (e) => {
            if (blockUp && e.deltaY < 0) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, { passive: false });
                

        // Last card trigger 
        window.addEventListener("DOMContentLoaded", () => {
            const cards = [...document.querySelectorAll(".card")];
            const btn = document.querySelector(".btn");
            const [firstCard, lastCard] = [cards[0], cards[cards.length - 1]];
            
            new IntersectionObserver(entries => {
                if (entries.some(e => e.isIntersecting && e.target === lastCard)) {
                    console.log("📍Last card reached, enabling all audio + auto-scroll...");

                    btn.textContent = "Stop Sound";

                    setTimeout(() => {
                        console.log('working2')
                        firstCard.scrollIntoView({ behavior: "smooth", block: "start" });
                            audioPlayers.forEach((sound) => {
                            sound.loop(true);   // enable looping
                            sound.play();       // start again
                        });
                    }, 2500);
                }
            }, { threshold: 0.5 }).observe(lastCard);
            
        });


        const containers = document.querySelectorAll(".card-container");

        const containerObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const parentCard = entry.target.closest(".card");
                    const [firstCard, lastCard] = [cards[0], cards[cards.length - 1]];

                    // Skip if first or last
                    if (parentCard === firstCard || parentCard === lastCard) return;

                    console.log("📦 Card-container visible inside:", parentCard);

                    // Clear any running timer before setting new one
                    if (containerTimer) clearTimeout(containerTimer);

                    toggleBlockUp(true); // ⛔ block scroll up only in container

                    containerTimer = setTimeout(() => {
                        // Double-check still visible
                        if (entry.isIntersecting) {
                            const next = parentCard.nextElementSibling;
                            if (next && next.classList.contains("card")) {
                                console.log("➡️ Auto-scroll to next card from container");
                                next.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                        }
                        // release block after scroll finishes
                        setTimeout(() => toggleBlockUp(false), 800);
                        containerTimer = null; // reset after firing
                    }, 2000);
                } else {
                    // If scrolled away before timer fires → cancel
                    if (containerTimer) {
                        clearTimeout(containerTimer);
                        containerTimer = null;
                    }
                    toggleBlockUp(false); // re-enable scroll when container not in view
                }
            });
        }, { threshold: 0.6 });

        containers.forEach(c => containerObserver.observe(c));

	</script>

</html>`;

}
