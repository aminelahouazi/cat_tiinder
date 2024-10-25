// script.js
const cardsData = [
    { name: 'Person 1', image: 'https://via.placeholder.com/300x400?text=Person+1' },
    { name: 'Person 2', image: 'https://via.placeholder.com/300x400?text=Person+2' },
    { name: 'Person 3', image: 'https://via.placeholder.com/300x400?text=Person+3' },
];

let currentCardIndex = 0;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let animationId = null;
let userName = ""; // Store the user's name
let userLikes = []; // Store user's likes


// Load initial cards
function loadCards() {
    const container = document.querySelector('.card-container');
    container.innerHTML = ''; // Clear previous cards
    cardsData.forEach((data, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.backgroundImage = `url(${data.image})`;
        card.style.zIndex = cardsData.length - index;
        card.innerHTML = `<h3>${data.name}</h3>`;

        // Add touch and mouse event listeners for swiping
        card.addEventListener('touchstart', handleTouchStart);
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', handleTouchEnd);

        card.addEventListener('mousedown', handleMouseDown);
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseup', handleMouseUp);
        card.addEventListener('mouseleave', handleMouseLeave);

        container.appendChild(card);
    });
}

// Handle the submission of the name
document.getElementById('submitName').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput').value;
    if (nameInput) {
        document.getElementById('nameInputCard').style.display = 'none'; // Hide the name input card
        document.querySelector('.card-container').style.display = 'block'; // Show the card container
        document.querySelector('.buttons').style.display = 'block'; // Show the card container
        loadCards();
    } else {
        alert('Please enter your name!');
    }
});

function handleSwipe(action) {
    const container = document.querySelector('.card-container');
    const currentCard = container.querySelector('.card:last-child');
    if (currentCard) {
        currentCard.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        currentCard.style.transform = action === 'like' ? 'translateX(100%)' : 'translateX(-100%)';
        currentCard.style.opacity = '0';

        const cardData = cardsData[currentCardIndex];
        
        // Log the swipe interaction
        logInteraction('swipe', {
            profile: cardData.name,
            action: action
        });

        currentCardIndex++;
        setTimeout(() => {
            currentCard.remove();
            if (currentCardIndex < cardsData.length) {
                loadCards();
            } else {
                alert('No more profiles!');
            }
        }, 300);
    }
}

// Modify your name submission handler to log the start of a session
document.getElementById('submitName').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput').value;
    if (nameInput) {
        userName = nameInput;
        // Log the session start
        logInteraction('session_start');
        
        document.getElementById('nameInputCard').style.display = 'none';
        document.querySelector('.card-container').style.display = 'block';
        document.querySelector('.buttons').style.display = 'block';
        loadCards();
    } else {
        alert('Please enter your name!');
    }
});

// Add end session logging when all cards are done
function handleEndSession() {
    logInteraction('session_end');
}

// Touch event handlers
function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    isDragging = true;
    
}

function handleTouchMove(event) {
    if (!isDragging) return;
    const currentX = event.touches[0].clientX;
    currentTranslate = currentX - startX;
    const currentCard = document.querySelector('.card:last-child');
    if (currentCard) {
        currentCard.style.transform = `translateX(${currentTranslate}px)`;
    }
}

function handleTouchEnd(event) {
    const currentCard = document.querySelector('.card:last-child');
    isDragging = false;
    cancelAnimationFrame(animationId);
    if (currentTranslate > 100) {
        handleSwipe('like');
    } else if (currentTranslate < -100) {
        handleSwipe('dislike');
    } else {
        currentCard.style.transform = 'translateX(0)';
    }
}

function handleMouseDown(event) {
    startX = event.clientX;
    isDragging = true;
    animationId = requestAnimationFrame(animation);
}

function handleMouseMove(event) {
    if (!isDragging) return;
    const currentX = event.clientX;
    currentTranslate = currentX - startX;
    const currentCard = document.querySelector('.card:last-child');
    if (currentCard) {
        currentCard.style.transform = `translateX(${currentTranslate}px)`;
    }
}

function handleMouseUp(event) {
    const currentCard = document.querySelector('.card:last-child');
    isDragging = false;
    cancelAnimationFrame(animationId);
    if (currentTranslate > 100) {
        handleSwipe('like');
    } else if (currentTranslate < -100) {
        handleSwipe('dislike');
    } else {
        currentCard.style.transform = 'translateX(0)';
    }
}

function handleMouseLeave(event) {
    const currentCard = document.querySelector('.card:last-child');
    isDragging = false;
    cancelAnimationFrame(animationId);
    currentCard.style.transform = 'translateX(0)';
}


const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'aminelahouazi';
const REPO_NAME = 'cat_tiinder';
const FILE_PATH = 'interactions.txt';  // New file to track all interactions
const GITHUB_TOKEN = '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'; // Replace with your token

// Function to format the current date and time
function getFormattedDateTime() {
    const now = new Date();
    return now.toISOString();
}

// Function to handle interaction logging
async function logInteraction(interactionType, details = {}) {
    try {
        // Get current file content if it exists
        const getCurrentFile = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha;
        let existingContent = '';

        if (getCurrentFile.ok) {
            const fileInfo = await getCurrentFile.json();
            sha = fileInfo.sha;
            existingContent = atob(fileInfo.content.replace(/\n/g, '')) + '\n';
        } else if (getCurrentFile.status !== 404) {
            console.error('Failed to get current file:', getCurrentFile.status);
            return;
        }

        // Create new log entry
        const timestamp = getFormattedDateTime();
        const newEntry = `[${timestamp}] Type: ${interactionType}, User: ${userName || 'Anonymous'}`;

        // Add additional details if they exist
        if (details.profile) newEntry += `, Profile: ${details.profile}`;
        if (details.action) newEntry += `, Action: ${details.action}`;
        
        const updatedContent = existingContent + newEntry + '\n';

        // Prepare the request body
        const requestBody = {
            message: `Update interaction log - ${timestamp}`,
            content: btoa(updatedContent),
            branch: 'main'
        };

        if (sha) {
            requestBody.sha = sha;
        }

        // Update or create the file
        const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Failed to save interaction log: ${response.status}`);
        }

        console.log('Successfully logged interaction');
    } catch (error) {
        console.error('Error logging interaction:', error);
    }
}


document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));








































































