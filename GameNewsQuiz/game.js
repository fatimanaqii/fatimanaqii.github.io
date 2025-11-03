// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to all the HTML elements we'll need to interact with
    const gameContainer = document.getElementById('game-container');
    const instructionsEl = document.getElementById('instructions');
    const startButton = document.getElementById('start-btn');
    const gameAreaEl = document.getElementById('game-area');
    const scenarioTextEl = document.getElementById('scenario-text');
    const choicesContainerEl = document.getElementById('choices-container');
    const timeStatEl = document.getElementById('time-stat');
    const qualityStatEl = document.getElementById('quality-stat');

    let gameState = {}; // This will hold the player's current stats (time, quality)
    let gameData = {}; // This will hold all the scenes and choices from game.json

    // --- 1. Load the Game Data from JSON ---
    // We use fetch() to load the game.json file
    fetch('game.json')
        .then(response => response.json()) // Parse the JSON data
        .then(data => {
            gameData = data; // Store the game data
            // Show the start button now that the game is ready
            startButton.addEventListener('click', startGame);
        })
        .catch(error => {
            console.error('Error loading game data:', error);
            scenarioTextEl.textContent = 'Failed to load game. Please try again.';
        });

    // --- 2. Start the Game ---
    // This function is called when the "Start Reporting" button is clicked
    function startGame() {
        // Hide the instructions and show the main game area
        instructionsEl.style.display = 'none';
        gameAreaEl.style.display = 'block';

        // Set the initial game state from the JSON file
        gameState = { ...gameData.initialState };

        // Show the first scene
        showScene('START');
    }

    // --- 3. Show a Scene ---
    // This function displays a scene based on its ID
    function showScene(sceneId) {
        
        // Handle the special "RESTART" scene ID
        if (sceneId === 'RESTART') {
            gameAreaEl.style.display = 'none';
            instructionsEl.style.display = 'block';
            return;
        }

        // Find the scene data in our gameData object
        const scene = gameData.scenes.find(s => s.id === sceneId);

        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }

        // --- Check for Game Over Conditions ---
        // This is a special check for the "WRITE_NOW" sequence
        if (scene.id === 'FINAL_CHECK') {
            if (gameState.quality >= 5) {
                showScene('WIN');
            } else {
                showScene('LOSE_QUALITY');
            }
            return; // Stop here
        }

        // Update the HTML with the scene's text
        scenarioTextEl.textContent = scene.text;

        // Clear out any old choices from the previous scene
        choicesContainerEl.innerHTML = '';

        // Create and display buttons for each new choice
        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.className = 'choice-btn'; // Apply our CSS style
            button.addEventListener('click', () => makeChoice(choice));
            choicesContainerEl.appendChild(button);
        });

        // Update the visible stats display
        updateStats();
    }

    // --- 4. Make a Choice ---
    // This function is called when a choice button is clicked
    function makeChoice(choice) {
        // Apply the effects of the choice to the game state
        if (choice.effects) {
            gameState.time += choice.effects.time || 0;
            gameState.quality += choice.effects.quality || 0;
        }

        // Check if the player ran out of time
        if (gameState.time <= 0) {
            showScene('LOSE_TIME');
        } else {
            // If not, show the next scene
            showScene(choice.nextScene);
        }
    }

    // --- 5. Update Stats Display ---
    // A helper function to keep the stats on screen up-to-date
    function updateStats() {
        timeStatEl.textContent = `Time Left: ${gameState.time}`;
        qualityStatEl.textContent = `Story Quality: ${gameState.quality}`;
    }

});