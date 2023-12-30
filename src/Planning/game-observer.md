### TO: CEOs of Q Game

### FROM: Nicolas Araujo and David O'Brien

### DATE: October 26 2023

### SUBJECT: Architecture for Game-Observer Communication

# Interface of the Component

The game-observer component should provide a real-time view of the game as it progresses. It should display the current state of the game, including the map, the tiles, the scores, and the remaining tiles. The observer should be able to see the moves made by each player, as well as the scores they have earned.

# Interaction with the Existing System

The game-observer component should interact with the existing game system by receiving updates from the referee whenever a player makes a move. The observer should be able to subscribe to the game state and receive updates in real-time.

# Interaction with the Observer's View

A single person may wish to interact with the observer's view in several ways. They may want to view the game in real-time, or they may want to view previous turns and analyze how the game was previously. They may then want to go back to the live game.

# Methods

-   addObserver(observer): Adds an observer function to the list of observers that will be notified when the game state changes.

-   removeObserver(observer): Removes an observer function from the list of observers.

-   notifyObservers(): Notifies all observers in the list that the game state has changed.

-   rewind(): Rewinds the game to the beginning and updates the game state. Notifies observers of changes to the game state.

-   backward(): Rewinds the game one turn and updates the game state.

-   forward(): forwards the game one turn and updates the game state.

-   fastForward(): Fast-forwards the game to the end and updates the game state. Notifies observers of changes to the game state.
