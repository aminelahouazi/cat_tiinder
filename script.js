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
        const likeData = {
            name: userName,
            liked: cardData.name,
            likedStatus: action
        };
        
        // Save data to GitHub
        saveDataToGitHub(likeData);

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

// Modify the name submission handler to store the user's name
document.getElementById('submitName').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput').value;
    if (nameInput) {
        userName = nameInput; // Store the user's name
        document.getElementById('nameInputCard').style.display = 'none';
        document.querySelector('.card-container').style.display = 'block';
        document.querySelector('.buttons').style.display = 'block';
        loadCards();
    } else {
        alert('Please enter your name!');
    }
});

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


// Constants at the top of your file
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'aminelahouazi';
const REPO_NAME = 'cat_tiinder';
const FILE_PATH = 'userLikes.txt';
// You'll replace this with your new classic token
const GITHUB_TOKEN = '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';

async function saveDataToGitHub(data) {
    try {
        // Test authentication first
        const testAuth = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,  // Changed to 'token' instead of 'Bearer'
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (testAuth.status === 401) {
            const errorData = await testAuth.json();
            throw new Error(`Authentication failed: ${errorData.message}`);
        }

        // Get the current file content
        const getCurrentFile = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,  // Changed to 'token' instead of 'Bearer'
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha;
        let existingContent = '';
        
        const fileInfo = await getCurrentFile.json();
        
        if (getCurrentFile.ok) {
            sha = fileInfo.sha;
            // Decode existing content from base64
            existingContent = atob(fileInfo.content.replace(/\n/g, '')) + '\n';
        } else {
            console.error('GitHub API Error:', fileInfo);
            throw new Error(`GitHub API Error: ${fileInfo.message}`);
        }

        // Prepare new content
        const newEntry = `User: ${userName}, Action: ${data.likedStatus}, Profile: ${data.liked}\n`;
        const updatedContent = existingContent + newEntry;

        // Update file in repository
        const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,  // Changed to 'token' instead of 'Bearer'
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Update user likes data - ${new Date().toISOString()}`,
                content: btoa(updatedContent),
                sha: sha,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to save data: ${errorData.message}`);
        }

        console.log('Successfully saved data to GitHub');
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        alert(error.message);
    }
}



document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));








































































