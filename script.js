import { Octokit } from "https://esm.sh/@octokit/core";
  import {
    createOrUpdateTextFile,
    composeCreateOrUpdateTextFile,
  } from "https://esm.sh/@octokit/plugin-create-or-update-text-file";
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



        let sha;
        let existingContent = '';

    

        // Create new log entry
        const timestamp = getFormattedDateTime();
        const newEntry = `[${timestamp}] Type: ${interactionType}, User: ${userName}`;

        // Add additional details if they exist
        if (details.profile) newEntry += `, Profile: ${details.profile}`;
        if (details.action) newEntry += `, Action: ${details.action}`;
        
        const updatedContent = existingContent + newEntry + '\n';

        // Prepare the request body
        const MyOctokit = Octokit.plugin(createOrUpdateTextFile);
const octokit = new MyOctokit({ auth: "secret123" });
const {
  updated,
  data: { commit },
} = await octokit.createOrUpdateTextFile({
  owner: "aminelahouazi",
  repo: "cat_tiinder",
  path: "userLikes.txt",
  content: updatedContent,
  message: "update userLikes.txt",
});

if (updated) {
  console.log("test.txt updated via %s", data.commit.html_url);
} else {
  console.log("test.txt already up to date");
}
        
        

document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));








































































