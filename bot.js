import { talkData } from './data.js';

export class Bot {
    constructor(scene, onSelect) {
        this.scene = scene;
        this.onSelect = onSelect;
        this.id = Date.now() + Math.random();
        
        // Advanced Archetypes
        const types = ['type-cyber', 'type-steampunk', 'type-astral'];
        this.botType = types[Math.floor(Math.random() * types.length)];
        
        this.moods = ['neutral', 'happy', 'sad', 'depleted'];
        this.currentMoodIndex = 0;
        this.isSocializing = false;
        this.isBusyWorking = false;
        this.energy = 100; // Starts full
        
        const pos = this.findSpawnPosition();
        this.x = pos.x;
        this.y = pos.y;
        
        this.element = this.createBotElement();
        this.updateTransform();
        this.startLifeCycles();
        
        this.select();
    }

    findSpawnPosition() {
        let attempt = 0;
        while (attempt < 10) {
            const tx = Math.random() * (window.innerWidth - 200) + 25;
            const ty = Math.random() * (window.innerHeight - 400) + 50;
            return { x: tx, y: ty };
        }
    }

    createBotElement() {
        const botDiv = document.createElement("div");
        botDiv.className = `bot ${this.botType}`;
        
        // Sophisticated Mechanical Rig DOM
        botDiv.innerHTML = `
            <div class="shadow"></div>
            <div class="rig">
                <div class="head">
                    <div class="visor">
                        <div class="eye left"></div>
                        <div class="eye right"></div>
                    </div>
                    <div class="modulator"></div>
                </div>
                <div class="torso">
                    <div class="core"></div>
                </div>
                <div class="arm left"></div>
                <div class="arm right"></div>
                <div class="base"></div>
                <div class="energy-cell"></div>
            </div>
        `;

        let isDragging = false;
        let startX, startY;

        botDiv.onpointerdown = (e) => {
            if (this.isBusyWorking) return;
            e.stopPropagation();
            this.select();
            isDragging = true;
            startX = e.clientX - this.x;
            startY = e.clientY - this.y;
            botDiv.classList.add("dragging");
            botDiv.setPointerCapture(e.pointerId);
        };

        botDiv.onpointermove = (e) => {
            if (!isDragging || this.isBusyWorking) return;
            this.x = e.clientX - startX;
            this.y = e.clientY - startY;
            this.updateTransform();
        };

        botDiv.onpointerup = (e) => {
            if (!isDragging) return;
            isDragging = false;
            botDiv.classList.remove("dragging");
            botDiv.releasePointerCapture(e.pointerId);
        };

        botDiv.onclick = (e) => {
            if (this.isBusyWorking) return;
            e.stopPropagation();
            this.select();
        };

        this.scene.appendChild(botDiv);
        return botDiv;
    }

    select() {
        this.onSelect(this);
    }

    remove(botsArray) {
        this.element.style.transform += " scale(0) translateY(-100px)";
        this.element.style.opacity = "0";
        this.element.style.filter = "brightness(5) blur(10px)"; // Decommission effect
        setTimeout(() => {
            this.element.remove();
            const idx = botsArray.findIndex(b => b.id === this.id);
            if (idx !== -1) botsArray.splice(idx, 1);
        }, 500);
    }

    move(dx, dy) {
        if (this.isBusyWorking) return;
        const speed = 20; // Slightly faster movement for sleek bots
        this.x += dx * speed;
        this.y += dy * speed;
        const margin = 70;
        this.x = Math.max(-margin, Math.min(window.innerWidth - 100, this.x));
        this.y = Math.max(-margin, Math.min(window.innerHeight - 300, this.y));
        
        this.element.classList.add("moving-manual");
        this.updateTransform();
        
        if (this.moveStopTimer) clearTimeout(this.moveStopTimer);
        this.moveStopTimer = setTimeout(() => {
            this.element.classList.remove("moving-manual");
        }, 100);
    }

    updateTransform() {
        this.element.style.setProperty('--bx', `${this.x}px`);
        this.element.style.setProperty('--by', `${this.y}px`);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    startLifeCycles() {
        this.startIdleBlinking();
        this.startIdleLooking();
        this.startAutonomousMove();
        this.startAutonomousSocializing();
        this.startEnergyCycle();
    }

    startEnergyCycle() {
        const loop = () => {
            if (!this.element.classList.contains('recharging') && !this.isSocializing && !this.isBusyWorking) {
                // Deplete energy
                this.energy -= Math.random() * 10;
                
                if (this.energy <= 0) {
                    this.energy = 0;
                    this.setMood('depleted');
                    // Autonomous recharge
                    if (Math.random() > 0.5) {
                        setTimeout(() => this.eat(), 1000 + Math.random() * 3000);
                    }
                }
            }
            setTimeout(loop, 4000);
        };
        loop();
    }

    eat() {
        // Rebranded to Recharging
        if (this.element.classList.contains('recharging') || this.isBusyWorking) return;
        
        if (this.energy > 70 && !this.element.classList.contains('depleted')) {
            this.say('full'); // Still works logically, custom phrases can be added to full.json
            this.jump();
            return;
        }

        this.element.classList.add('recharging');
        this.sayCustom("Initiating core recharge...");
        
        this.element.classList.remove("facing-left");

        setTimeout(() => {
            this.element.classList.remove('recharging');
            this.energy = 100;
            this.setMood('happy');
            this.sayCustom("Core energy at 100%. Systems optimal.");
            this.jump();
        }, 4500);
    }

    setMood(mood) {
        this.moods.forEach(m => this.element.classList.remove(m));
        this.element.classList.add(mood);
    }

    toggleMood() {
        this.currentMoodIndex = (this.currentMoodIndex + 1) % (this.moods.length - 1);
        this.setMood(this.moods[this.currentMoodIndex]);
    }

    jump() {
        if (this.element.classList.contains('jump') || this.isBusyWorking) return;
        this.element.classList.add("jump");
        setTimeout(() => this.element.classList.remove("jump"), 800); // Matched to CSS
    }

    blink() {
        if (this.element.classList.contains('blink')) return;
        this.element.classList.add("blink");
        setTimeout(() => this.element.classList.remove("blink"), 400); // Matched to CSS
    }

    wave() {
        if (this.isBusyWorking) return;
        this.element.classList.toggle("wave");
    }

    say(category) {
        if (this.element.classList.contains("talking") || this.isBusyWorking) return;
        const pool = talkData[category] || ["..."];
        const msg = pool[Math.floor(Math.random() * pool.length)];
        this.sayCustom(msg);
    }

    sayCustom(msg) {
        const bubble = document.createElement("div");
        bubble.className = "speech-bubble";
        bubble.innerText = msg;
        // Append to rig so it moves with hover
        this.element.querySelector('.rig').appendChild(bubble);
        this.element.classList.add("talking");
        
        setTimeout(() => {
            bubble.style.animation = "popIn 0.3s reverse forwards";
            setTimeout(() => {
                bubble.remove();
                this.element.classList.remove("talking");
            }, 300);
        }, 3000);
    }

    startAutonomousMove() {
        const autoLoop = () => {
            const isInteracting = this.element.classList.contains("hifi") || 
                                this.element.classList.contains("dragging") ||
                                this.element.classList.contains("selected") ||
                                this.element.classList.contains("recharging") ||
                                this.isBusyWorking;

            if (!isInteracting) {
                const range = 250;
                const tx = this.x + (Math.random() - 0.5) * range;
                const ty = this.y + (Math.random() - 0.5) * range;
                this.x = Math.max(50, Math.min(window.innerWidth - 150, tx));
                this.y = Math.max(50, Math.min(window.innerHeight - 300, ty));
                this.updateTransform();
            }
            this.autoMoveTimer = setTimeout(autoLoop, 4000 + Math.random() * 6000);
        };
        this.autoMoveTimer = setTimeout(autoLoop, 2000 + Math.random() * 3000);
    }

    startAutonomousSocializing() {
        const socialLoop = () => {
            const isBusy = this.element.classList.contains("dragging") ||
                           this.element.classList.contains("selected") ||
                           this.isSocializing ||
                           this.element.classList.contains("recharging") ||
                           this.isBusyWorking;

            if (!isBusy && Math.random() > 0.6 && window.globalBots.length > 1) {
                const other = window.globalBots.filter(b => b.id !== this.id)[Math.floor(Math.random() * (window.globalBots.length - 1))];
                this.initiateConversation(other);
            }
            this.socialTimer = setTimeout(socialLoop, 12000 + Math.random() * 15000);
        };
        this.socialTimer = setTimeout(socialLoop, 8000 + Math.random() * 10000);
    }

    async initiateConversation(other) {
        if (this.isSocializing || other.isSocializing) return;
        this.isSocializing = true;
        other.isSocializing = true;

        if (this.lookTimer) clearTimeout(this.lookTimer);
        if (other.lookTimer) clearTimeout(other.lookTimer);
        if (this.autoMoveTimer) clearTimeout(this.autoMoveTimer);
        if (other.autoMoveTimer) clearTimeout(other.autoMoveTimer);

        const flip = this.x > other.x;
        this.element.classList.toggle("facing-left", flip);
        other.element.classList.toggle("facing-left", !flip);

        const updateEyes = () => {
            const r1 = this.element.getBoundingClientRect();
            const r2 = other.element.getBoundingClientRect();
            this.lookAt(r2.left + r2.width/2, r2.top + 60);
            other.lookAt(r1.left + r1.width/2, r1.top + 60);
        };
        updateEyes();

        this.say('greetings');
        await new Promise(r => setTimeout(r, 3500));

        const willAccept = Math.random() > 0.3;
        if (willAccept) {
            const responseType = Math.random() > 0.5 ? 'smalltalk' : 'compliments';
            other.say(responseType);
            await new Promise(r => setTimeout(r, 3500));
            this.jump();
            this.say(Math.random() > 0.5 ? 'smalltalk' : 'compliments');
        } else {
            other.say('busy');
            other.element.classList.add('sad');
            setTimeout(() => other.element.classList.remove('sad'), 3000);
        }

        await new Promise(r => setTimeout(r, 3500));
        this.isSocializing = false;
        other.isSocializing = false;
        this.startIdleLooking();
        other.startIdleLooking();
        this.startAutonomousMove();
        other.startAutonomousMove();
    }

    lookAt(targetX, targetY) {
        // Target eyes inside rig
        const rig = this.element.querySelector('.rig');
        const rect = rig.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + 60; 
        let angle = Math.atan2(targetY - centerY, targetX - centerX);
        const isFlipped = this.element.classList.contains("facing-left");
        const dist = Math.min(8, Math.sqrt(Math.pow(targetX - centerX, 2) + Math.pow(targetY - centerY, 2)) / 50);
        let lx = Math.cos(angle) * dist;
        let ly = Math.sin(angle) * dist;
        if (isFlipped) lx *= -1;
        this.updateEyes(lx, ly);
    }

    updateEyes(lx, ly) {
        this.element.style.setProperty('--eye-x', `${lx}px`);
        this.element.style.setProperty('--eye-y', `${ly}px`);
    }

    startIdleLooking() {
        if (this.lookTimer) clearTimeout(this.lookTimer);
        const lookLoop = () => {
            if (this.isBusyWorking) {
                this.lookTimer = setTimeout(lookLoop, 1000);
                return;
            }
            const tx = Math.random() * window.innerWidth;
            const ty = Math.random() * window.innerHeight;
            this.lookAt(tx, ty);
            this.lookTimer = setTimeout(lookLoop, 1500 + Math.random() * 3000);
        };
        lookLoop();
    }

    startIdleBlinking() {
        const blinkLoop = () => {
            this.blink();
            setTimeout(blinkLoop, 3000 + Math.random() * 6000);
        };
        setTimeout(blinkLoop, Math.random() * 3000);
    }

    interactWith(other) {
        if (this.lookTimer) clearTimeout(this.lookTimer);
        if (other.lookTimer) clearTimeout(other.lookTimer);

        const isLeft = this.x < other.x;
        this.element.classList.toggle("facing-left", !isLeft);
        other.element.classList.toggle("facing-left", isLeft);

        const r1 = this.element.querySelector('.rig').getBoundingClientRect();
        const r2 = other.element.querySelector('.rig').getBoundingClientRect();
        this.lookAt(r2.left + r2.width/2, r2.top + 60);
        other.lookAt(r1.left + r1.width/2, r1.top + 60);

        setTimeout(() => {
            this.element.classList.add("hifi");
            other.element.classList.add("hifi");
            this.sayCustom("Sync Handshake Accepted.");
            setTimeout(() => {
                this.element.classList.remove("hifi");
                other.element.classList.remove("hifi");
                setTimeout(() => {
                    this.startIdleLooking();
                    other.startIdleLooking();
                }, 1000);
            }, 800);
        }, 500);
    }
}
