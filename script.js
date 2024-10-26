// First, add these script tags to your HTML file, above your main script:
// <script src="https://cdn.jsdelivr.net/npm/@octokit/core"></script>
// <script src="https://cdn.jsdelivr.net/npm/@octokit/plugin-create-or-update-text-file"></script>

// script.js
const MyOctokit = Octokit.plugin(createOrUpdateTextFile);
const octokit = new MyOctokit({ 
  auth: "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" // Replace with your actual GitHub token
});

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
let userName = "";

// Helper function to get formatted date-time
function getFormattedDateTime() {
    const now = new Date();
    return now.toISOString();
}

// Main logging function
async function logInteraction(interactionType, details = {}) {
    try {
        // Create new log entry
        const timestamp = getFormattedDateTime();
        const newEntry = {
            timestamp,
            type: interactionType,
            user: userName,
            ...details
        };

        try {
            // Try to get existing content
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: "aminelahouazi",
                repo: "cat_tiinder",
                path: "userLikes.txt"
            });

            // Decode existing content from base64
            const existingContent = Buffer.from(data.content, 'base64').toString();
            const updatedContent = existingContent + JSON.stringify(newEntry) + '\n';

            // Update file
            await octokit.createOrUpdateTextFile({
                owner: "aminelahouazi",
                repo: "cat_tiinder",
                path: "userLikes.txt",
                content: updatedContent,
                message: `Update userLikes.txt - ${interactionType} by ${userName}`,
            });

        } catch (error) {
            if (error.status === 404) {
                // File doesn't exist yet, create it
                await octokit.createOrUpdateTextFile({
                    owner: "aminelahouazi",
                    repo: "cat_tiinder",
                    path: "userLikes.txt",
                    content: JSON.stringify(newEntry) + '\n',
                    message: `Create userLikes.txt - First entry by ${userName}`,
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error logging interaction:", error);
    }
}

function loadCards() {
    const container = document.querySelector('.card-container');
    container.innerHTML = '';
    cardsData.forEach((data, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.backgroundImage = `url(${data.image})`;
        card.style.zIndex = cardsData.length - index;
        card.innerHTML = `<h3>${data.name}</h3>`;

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
            action: action,
            timestamp: new Date().toISOString()
        });

        currentCardIndex++;
        setTimeout(() => {
            currentCard.remove();
            if (currentCardIndex < cardsData.length) {
                loadCards();
            } else {
                alert('No more profiles!');
                logInteraction('session_end');
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

function handleTouchEnd() {
    const currentCard = document.querySelector('.card:last-child');
    isDragging = false;
    cancelAnimationFrame(animationId);
    if (currentTranslate > 100) {
        handleSwipe('like');
    } else if (currentTranslate < -100) {
        handleSwipe('dislike');
    } else if (currentCard) {
        currentCard.style.transform = 'translateX(0)';
    }
}

// Mouse event handlers
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

function handleMouseUp() {
    const currentCard = document.querySelector('.card:last-child');
    isDragging = false;
    cancelAnimationFrame(animationId);
    if (currentTranslate > 100) {
        handleSwipe('like');
    } else if (currentTranslate < -100) {
        handleSwipe('dislike');
    } else if (currentCard) {
        currentCard.style.transform = 'translateX(0)';
    }
}

function handleMouseLeave() {
    const currentCard = document.querySelector('.card:last-child');
    if (currentCard) {
        isDragging = false;
        cancelAnimationFrame(animationId);
        currentCard.style.transform = 'translateX(0)';
    }
}

function animation() {
    if (isDragging) {
        animationId = requestAnimationFrame(animation);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitName').addEventListener('click', async () => {
        const nameInput = document.getElementById('nameInput').value;
        if (nameInput) {
            userName = nameInput;
            // Log the session start
            await logInteraction('session_start');
            
            document.getElementById('nameInputCard').style.display = 'none';
            document.querySelector('.card-container').style.display = 'block';
            document.querySelector('.buttons').style.display = 'block';
            loadCards();
        } else {
            alert('Please enter your name!');
        }
    });

    document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
    document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));
});
