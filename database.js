// database.js
class TinderDatabase {
    constructor() {
        this.db = null;
        this.dbName = 'tinderCloneDB';
        this.version = 1;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject('Error opening database');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create users store
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                }

                // Create likes store
                if (!db.objectStoreNames.contains('likes')) {
                    const likesStore = db.createObjectStore('likes', { keyPath: 'id', autoIncrement: true });
                    likesStore.createIndex('userId', 'userId', { unique: false });
                }
            };
        });
    }

    async addUser(userName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            const user = {
                name: userName,
                createdAt: new Date().toISOString()
            };

            const request = store.add(user);

            request.onsuccess = () => {
                resolve(request.result); // Returns the userId
            };

            request.onerror = () => {
                reject('Error adding user');
            };
        });
    }

    async addLike(userId, cardData, isLike) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['likes'], 'readwrite');
            const store = transaction.objectStore('likes');
            
            const like = {
                userId: userId,
                cardName: cardData.name,
                isLike: isLike,
                timestamp: new Date().toISOString()
            };

            const request = store.add(like);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Error adding like');
            };
        });
    }

    async getUserLikes(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['likes'], 'readonly');
            const store = transaction.objectStore('likes');
            const index = store.index('userId');
            
            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Error getting user likes');
            };
        });
    }
}

export const db = new TinderDatabase();