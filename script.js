import { db } from './database.js';
// script.js
const cardsData = [
   
    { name: 'baby cat', image: "catbaby.jpg" },
    { name: 'carrot', image: "carrot.jpg" },
    { name: 'literally me cat', image: "literallymecat.jpg" },
    { name: 'a cat idontlike', image: "contented_cat.jpg" },
    { name: 'uprobably cat', image: "catcurious.jpg" },
    

];

let currentCardIndex = 0;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let animationId = null;
let currentUserId = null; // Store the current user's ID

window.addEventListener('load', async () => {
    try {
        await db.init();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
});
// Load initial cardsrdsData.length}`);
function loadCards() {
    const container = document.querySelector('.card-container');
    container.innerHTML = ''; // Clear previous cards
    
    // Load cards in reverse order so the first card is on top
    for (let i = cardsData.length - 1; i >= currentCardIndex; i--) {
        const data = cardsData[i];
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-index', i); // Add index as data attribute
        card.style.backgroundImage = `url(${data.image})`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
        
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
    }
    
    console.log(`Loaded cards. Current index: ${currentCardIndex}, Total cards: ${cardsData.length}`);
}
async function handleSwipe(action) {
    if (currentCardIndex >= cardsData.length) {
        console.log('No more cards to swipe');
        return;
    }

    const container = document.querySelector('.card-container');
    const currentCard = container.querySelector(`.card[data-index="${currentCardIndex}"]`);
    
    if (!currentCard) {
        console.log('No current card found');
        return;
    }

    try {
        // Store the current card's data
        const cardData = cardsData[currentCardIndex];
        
        // Animate the card
        currentCard.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        currentCard.style.transform = action === 'like' ? 'translateX(100%)' : 'translateX(-100%)';
        currentCard.style.opacity = '0';

        // Save the like/dislike to database
        await db.addLike(currentUserId, cardData, action === 'like');
        
        // Remove the card after animation
        setTimeout(async () => {
            currentCard.remove();
            currentCardIndex++;
            console.log(`Card swiped. New index: ${currentCardIndex}`);
            
            if (currentCardIndex >= cardsData.length) {
                console.log('No more cards. Showing results.');
                document.getElementById('message').style.display = "block";
                document.getElementById('message').style.transition ="opacity 5s ease";
            
            }
        }, 300);

    } catch (error) {
        console.error('Error in handleSwipe:', error);
    }
}

// Modified name submission handler
document.getElementById('submitName').addEventListener('click', async () => {
    const nameInput = document.getElementById('nameInput').value;
    if (nameInput) {
        try {
            currentUserId = await db.addUser(nameInput);
            document.getElementById('nameInputCard').style.display = 'none';
            document.querySelector('.card-container').style.display = 'block';
            document.querySelector('.buttons').style.display = 'block';
            currentCardIndex = 0;
            loadCards();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user. Please try again.');
        }
    } else {
        alert('Please enter your name!');
    }
});

// Modified touch handlers
function handleTouchStart(event) {
    if (currentCardIndex >= cardsData.length) return;
    startX = event.touches[0].clientX;
    isDragging = true;
}

function handleTouchMove(event) {
    if (!isDragging || currentCardIndex >= cardsData.length) return;
    const currentX = event.touches[0].clientX;
    currentTranslate = currentX - startX;
    const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
    if (currentCard) {
        currentCard.style.transform = `translateX(${currentTranslate}px)`;
    }
}

function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
    if (currentCard) {
        if (currentTranslate > 100) {
            handleSwipe('like');
        } else if (currentTranslate < -100) {
            handleSwipe('dislike');
        } else {
            currentCard.style.transform = 'translateX(0)';
        }
    }
    currentTranslate = 0;
}

// Modified mouse handlers
function handleMouseDown(event) {
    if (currentCardIndex >= cardsData.length) return;
    startX = event.clientX;
    isDragging = true;
    animationId = requestAnimationFrame(animation);
}

function handleMouseMove(event) {
    if (!isDragging || currentCardIndex >= cardsData.length) return;
    const currentX = event.clientX;
    currentTranslate = currentX - startX;
    const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
    if (currentCard) {
        currentCard.style.transform = `translateX(${currentTranslate}px)`;
    }
}

function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationId);
    const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
    if (currentCard) {
        if (currentTranslate > 100) {
            handleSwipe('like');
        } else if (currentTranslate < -100) {
            handleSwipe('dislike');
        } else {
            currentCard.style.transform = 'translateX(0)';
        }
    }
    currentTranslate = 0;
}

function handleMouseLeave() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationId);
    const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
    if (currentCard) {
        currentCard.style.transform = 'translateX(0)';
    }
    currentTranslate = 0;
}


document.getElementById('like').addEventListener('click', () => handleSwipe('like'));
document.getElementById('dislike').addEventListener('click', () => handleSwipe('dislike'));
