import { Octokit } from "https://esm.sh/@octokit/core";
  import {
    createOrUpdateTextFile,
    composeCreateOrUpdateTextFile,
  } from "https://esm.sh/@octokit/plugin-create-or-update-text-file";

// script.js
const cardsData = [
    { name: 'Carrot', image: 'https://github.com/aminelahouazi/cat_tiinder/carrot.jpg' },
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

        const cardData = cardsData[currentCardIndex]; // Get current card data
        userLikes.push({ name: userName, liked: cardData.name, likedStatus: action }); // Store user's choice

        currentCardIndex++;
        setTimeout(() => {
            currentCard.remove();
            if (currentCardIndex < cardsData.length) {
                loadCards();
            } else {
                saveDataToFile(); // Save the data to a text file after the last card
                alert('No more profiles!');
            }
        }, 300);
    }
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


// Replace these constants with your actual values// Use environment variables for security in real applicat
const MyOctokit = Octokit.plugin(createOrUpdateTextFile);
const octokit = new MyOctokit({ Authorization: `token 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`);

async function saveDataToFile(){

const {
  updated,
  data: { commit },
} = await octokit.createOrUpdateTextFile({
  owner: "aminelahouazi",
  repo: "cat_tiinder",
  path: "userLikes.txt",
  content: userLikes,
  message: "update userlikes.txt",
});

if (updated) {
  console.log("test.txt updated via %s");
} else {
  console.log("test.txt already up to date");
}

    
  }


document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));

