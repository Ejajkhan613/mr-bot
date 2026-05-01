import { Bot } from './bot.js';
import { loadAllTalkData } from './data.js';

const scene = document.getElementById("scene");
const bots = [];
let selectedBot = null;
let projectData = [];

// Expose for bot.js to access the array for socializing
window.globalBots = bots;

// Load Project Data
async function loadProjectData() {
    try {
        const response = await fetch('works.json');
        const data = await response.json();
        projectData = data.projects;
    } catch (e) {
        console.warn("Could not load works.json");
    }
}

async function startCollaborativeProject() {
    if (bots.length < 2) {
        alert("At least 2 units required for collaboration.");
        return;
    }

    const project = projectData[Math.floor(Math.random() * projectData.length)];
    if (bots.length < project.minBots) {
        alert(`Unit count insufficient. ${project.name} requires ${project.minBots} units.`);
        return;
    }

    const progressUI = document.getElementById("workProgress");
    const nameLabel = document.getElementById("projectName");
    const statusLabel = document.getElementById("projectStatus");
    const bar = document.getElementById("progressBar");
    const countLabel = document.getElementById("workerCount");

    progressUI.style.display = "block";
    nameLabel.innerText = project.name;
    countLabel.innerText = `Active Units: ${bots.length}`;

    // Create building object visual
    const buildingObj = document.createElement("div");
    buildingObj.className = "building-object";
    buildingObj.innerHTML = '<div class="progress-mesh"></div>';
    const mesh = buildingObj.querySelector(".progress-mesh");
    // Add blocks
    for (let i = 0; i < 25; i++) {
        const block = document.createElement("div");
        block.className = "block";
        mesh.appendChild(block);
    }
    scene.appendChild(buildingObj);
    
    // Trigger appearance
    setTimeout(() => {
        buildingObj.style.transform = "translate(-50%, -50%) scale(1)";
    }, 100);
    
    // Command all bots to work position
    bots.forEach((bot, index) => {
        bot.isBusyWorking = true;
        const angle = (index / bots.length) * Math.PI * 2;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const tx = centerX + Math.cos(angle) * 300 - 70;
        const ty = centerY + Math.sin(angle) * 200 - 110;
        bot.x = tx;
        bot.y = ty;
        
        // Face the center
        const isRightOfCenter = bot.x + 70 > centerX;
        bot.element.classList.toggle("facing-left", isRightOfCenter);

        bot.element.classList.add("working");
        bot.updateTransform();
        bot.lookAt(centerX, centerY);
    });

    let progress = 0;
    const stepCount = project.steps.length;
    const blocks = buildingObj.querySelectorAll(".block");
    
    for (let i = 0; i < stepCount; i++) {
        statusLabel.innerText = project.steps[i];
        progress = ((i + 1) / stepCount) * 100;
        bar.style.width = `${progress}%`;

        // Activate blocks based on progress
        const blocksToActivate = Math.floor((progress / 100) * blocks.length);
        for (let j = 0; j < blocksToActivate; j++) {
            blocks[j].classList.add("active");
        }

        await new Promise(r => setTimeout(r, project.duration / stepCount));
    }

    statusLabel.innerText = "PROJECT COMPLETE";
    buildingObj.style.transform = "translate(-50%, -50%) scale(1.5)";
    buildingObj.style.opacity = "0";
    setTimeout(() => buildingObj.remove(), 1000);
    
    // Inject dynamic visual
    if (project.css) {
        const styleId = `style-${project.id}`;
        if (!document.getElementById(styleId)) {
            const styleTag = document.createElement("style");
            styleTag.id = styleId;
            styleTag.innerHTML = project.css;
            document.head.appendChild(styleTag);
        }
    }

    if (project.html) {
        const container = document.createElement("div");
        container.innerHTML = project.html;
        const visual = container.firstChild;
        scene.appendChild(visual);
        
        // Trigger entrance animation
        requestAnimationFrame(() => {
            visual.style.transform = "translate(-50%, -50%) scale(1)";
        });

        // Clear visual after delay
        setTimeout(() => {
            visual.style.transform = "translate(-50%, -50%) scale(0)";
            setTimeout(() => visual.remove(), 1000);
        }, 10000);
    }

    await new Promise(r => setTimeout(r, 2000));
    
    progressUI.style.display = "none";
    bar.style.width = "0%";
    
    bots.forEach(bot => {
        bot.isBusyWorking = false;
        bot.element.classList.remove("working");
        bot.setMood('happy');
        bot.jump();
    });
}

window.startCollaborativeProject = startCollaborativeProject;

function onBotSelect(bot) {
    if (selectedBot) {
        selectedBot.element.classList.remove("selected");
    }
    selectedBot = bot;
    selectedBot.element.classList.add("selected");
}

function addBot() {
    const newBot = new Bot(scene, onBotSelect);
    const otherBots = bots.filter(b => b.id !== newBot.id);
    
    if (otherBots.length > 0) {
        const nearest = otherBots.reduce((prev, curr) => {
            const distPrev = Math.sqrt(Math.pow(prev.x - newBot.x, 2) + Math.pow(prev.y - newBot.y, 2));
            const distCurr = Math.sqrt(Math.pow(curr.x - newBot.x, 2) + Math.pow(curr.y - newBot.y, 2));
            return distPrev < distCurr ? prev : curr;
        });
        newBot.interactWith(nearest);
    }
    bots.push(newBot);
}

function deleteSelected() {
    if (selectedBot) {
        selectedBot.remove(bots);
        selectedBot = null;
    } else {
        alert("Please select a bot to delete!");
    }
}

// Global Event Handlers for UI
window.addBot = addBot;
window.deleteSelected = deleteSelected;
window.performAction = (action) => {
    if (selectedBot) {
        if (action === 'sayHi') selectedBot.say('greetings');
        else selectedBot[action]();
    } else {
        alert("Please select a bot first!");
    }
};

// Keyboard Controls
window.addEventListener("keydown", (e) => {
    if (!selectedBot) return;
    const key = e.key.toLowerCase();
    
    if (['w','a','s','d'].includes(key)) {
        const dx = key === 'a' ? -1 : (key === 'd' ? 1 : 0);
        const dy = key === 'w' ? -1 : (key === 's' ? 1 : 0);
        selectedBot.move(dx, dy);
        return;
    }

    switch(key) {
        case ' ': e.preventDefault(); selectedBot.jump(); break;
        case 'b': selectedBot.blink(); break;
        case 'v': selectedBot.wave(); break;
        case 'h': selectedBot.say('greetings'); break;
        case 'm': selectedBot.toggleMood(); break;
        case 'e': selectedBot.eat(); break;
        case 'delete': 
        case 'backspace': deleteSelected(); break;
    }
});

// Deselect on clicking empty scene
scene.onclick = () => {
    if (selectedBot) {
        selectedBot.element.classList.remove("selected");
        selectedBot = null;
    }
};

// Initialization
async function init() {
    await loadAllTalkData();
    await loadProjectData();
    addBot(); // Initial bot
}

init();
