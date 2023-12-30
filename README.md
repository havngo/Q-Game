# What is this project?

The game we are building is called Qwirkle. It is a board game you can find @ https://www.amazon.com/MindWare-MDS-32016W-Qwirkle-Board/dp/1933054395. The game is a tile based game where you have to match tiles based on color or shape. The game is played on a 6x6 grid. The game ends when a player has no more tiles to play and the game is over when there are no more tiles to draw. The player with the most points wins.

# Purpose

-   Planning
    -   The purpose for this directory is to work with the GUI library and show a visual representation of the data structures and algorithms. This is a work in progress and will be updated as time goes on.
-   Common
    -   The purpose for this directory is to hold the common code that is used by both our referee and our players. This includes the data structures and algorithms.

# Roadmap

The common folder holds all the data representation for all the tiles, gameState, and the map. It also holds the algorithms for the referee. The test files are also in the common directory signaled as [FILE_NAME].test.ts which corresponds to [FILE_NAME].ts

# Test

To test the GUI library, run the following command while in the B directory:

```
bash ./xgui < Other/Tests/0-in.json
```

To run internal tests run the following command from the Q directory:

```
./xtest
```
