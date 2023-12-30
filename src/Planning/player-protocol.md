TO: CEOs of Q Game
FROM: Nicolas Araujo and David O'Brien
DATE: October 12 2023
SUBJECT: Architecture for Player-Referee Communication

This memo outlines the wishlist for our player-referee architecture. Considering that the player as a software system and the game itself as a software system function completely separately, we find it appropriate to design an archeitcutre such that these two mechanisms run as separate software and communicate via JSONs through endpoints.

# Referee and Game System

The first part of the architecture is the software system that will run the code for the game, including our implementations of referees and game states. Publically, it will have the following endpoint to take in JSON input from the client:

-   makeMove: Takes in a list of placements and the player ID of the player making the move and will make the move for that player
-   isValidMove: Takes in a list of placements and the player ID of the player and will send back whether the move is valid to make or not
-   getPublicInfo: Takes in a player ID and returns a JSON of the info public to that user, including the map, the scores of other players and the referee, and the current player state of the given player ID

# Player System

In a separate software system will run the player component, whether hosted through a house-player or through an actual connection to a remote client. This system will use the aforementioned endpoints to communicate directly with the game; however it will use internal logic to determine when to make a move and what strategies to use. The game system will regularly send information about the map of the game when important updates are made, and if the player performs an action that would caused it to be removed from the game (such as making a move that breaks the rules), the game system would communicate with the player system directly as well.

These endpoints and interactions will be created using ExpressJS.
