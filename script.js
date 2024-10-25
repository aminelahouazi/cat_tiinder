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


// First, add these constants at the top of your file where other constants are defined
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'aminelahouazi';
const REPO_NAME = 'cat_tiinder';
const FILE_PATH = '../userLikes.txt';
const GITHUB_TOKEN = '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';

// Add this function to handle saving data to GitHub
async function saveDataToGitHub(data) {
    try {
        console.log('Attempting to save data to GitHub...');
        
        // First, get the current file content and SHA
        const getCurrentFile = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,  // Changed to Bearer token format
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('Get current file status:', getCurrentFile.status);
        
        let sha;
        let existingContent = '';
        
        if (getCurrentFile.status === 404) {
            console.log('File does not exist yet - creating new file');
        } else if (getCurrentFile.ok) {
            const fileInfo = await getCurrentFile.json();
            console.log('Retrieved existing file info:', fileInfo);
            sha = fileInfo.sha;
            existingContent = atob(fileInfo.content) + '\n';
        } else {
            const errorText = await getCurrentFile.text();
            console.error('Failed to get current file:', getCurrentFile.status, errorText);
            throw new Error(`Failed to get current file: ${getCurrentFile.status} ${errorText}`);
        }

        // Prepare new content
        const newEntry = `User: ${userName}, Action: ${data.likedStatus}, Profile: ${data.liked}\n`;
        const updatedContent = existingContent + newEntry;
        console.log('Preparing to save content:', updatedContent);

        // Create request body
        const requestBody = {
            message: `Update user likes data - ${new Date().toISOString()}`,
            content: btoa(updatedContent)
        };

        // Only include sha if we have one (file exists)
        if (sha) {
            requestBody.sha = sha;
        }

        console.log('Sending PUT request to GitHub...');
        
        // Update file in repository
        const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,  // Changed to Bearer token format
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.text();
        console.log('GitHub API Response:', response.status, responseData);

        if (!response.ok) {
            throw new Error(`Failed to save data to GitHub: ${response.status} ${responseData}`);
        }

        console.log('Successfully saved data to GitHub');
    } catch (error) {
        console.error('Detailed error saving data to GitHub:', error);
        // Log the error details for debugging
        if (error.response) {
            console.error('Response:', await error.response.text());
        }
        alert(`Failed to save data. Error: ${error.message}`);
    }
}

// Rest of the code remains the same...









document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));








































































