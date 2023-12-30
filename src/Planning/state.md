# Data Representation

## GameState

Our game state will consist of a board class, a mapping of player ID's to their state (the referee will have all mappings while each player will only have their own), and a list of turns. The board class will contain a Record of coordinate strings to pieces. The player state will contain the player's score and what is currently in their hand. The turn will contain the player ID, a list of moves, and the score of the turn. Below is a diagram of how we envision the data representation for the state of the game to be.

```
GameState
  - Map
	- Coordinate
		- x : Number
		- y : Number
	- Pieces: Map<Coordinate, Piece>
  - Players: Map<String (playerID), PlayerState>
    - PlayerState
        - Score
        - Hand : [ListOf Pieces]
  - Turns: [ListOf Turns]
	- Turn
		- playerID
		- Moves: [Listof Moves]
            - Move
                - Piece
                - Coordinate
        - Score
```

# Wish List

-   Add a tile to the board
    -   Determine if a tile placement is valid
-   Give a tile to player
-   Initialize a game by placing the first tile
-   Determine whose turn it is
-   Calculate score of a turn
-   Send information to players (prev turns, score, whose turn it is etc)
-   Kick player out
-   Recieve turn from player
-   Get a random piece
-   Determine when game is over
-   Determine winner/send winner to players
-   Handle exchanging tiles
