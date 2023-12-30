Below, in order of priority, are the fixes we hope to make with our codebase:

Completed:

1. Fix the scoring logic from milestone 4

-   Fixed by "Fixes scoring logic (#70)": https://github.khoury.northeastern.edu/CS4500-F23/whimsical-bees/commit/ca76882af9232d15a67cec45a3233fdf7010e6a7

    When running our code on all the xscore tests, we found two errors in the way we calculate scores: first, we assume that all placements in the same direction must be connected (for example, if all tiles in a turn are placed along row 3, we assumed they must all be connected), but this may not be the case if there's a gap and tiles are added to either side of the gap. We need to correct this to consider all unique sequences and assign the appropriate score amount. The second bug we found is how we calculate the Q bonus- we assume that a Q must consist of no surrounding tiles (that is, 5/6 tiles that meet the requirement and then nothing else neighboring them), but this is actually not this case, so we need to rework our logic for that.

2. Allow for different TilePouch implementations by creating an interface

-   Fixed by "Allow for different TilePouch implementations by creating an interface": https://github.khoury.northeastern.edu/CS4500-F23/whimsical-bees/commit/df3989b43eb46170bdb0b591550f815422eb5abc

    In our current implementation, TilePouches can be created via a factory and for testing purposes can receive much initial data, but ultimately we have no way to control how tiles are dealt because it is picked randomly, and while we can have a seed to create deterministic behavior, this does not let us control what tiles will be dealt next, which makes writing tests for complex games difficult. To fix this, we will break up TilePouch into an interface, and maybe an abstract class if needed, and allow for the construction of either a random TilePouch (same as current implementation) and a deterministic TilePouch.

3. Remove the map of player IDs to player states in the game state class

-   Fixed by "Remove the map of player IDs to player states in the game state class": https://github.khoury.northeastern.edu/CS4500-F23/whimsical-bees/commit/d1c9c91905adb8654b9c9e6194f34e3bccb1c282

    While this current setup is not causing any direct issues, it has become apparent that we should not store player states inside a map and instead store them directly into our circular iterator called 'Order'. This is because having these two separate yet parallel data structures can easily cause bugs in the future if the two get out of sync, and even with the current implementation, it gives a lot of hassle in having to check for errors or undefined that could theoretically happen if one data structure had data that the other didn't.

4. Add an additional interface over Board to represent an immutable Board, likely called "BoardState"

-   Fixed by "Implements ImmutableBoard": https://github.khoury.northeastern.edu/CS4500-F23/whimsical-bees/commit/15c752710f444843f676be093078121d7e700213

    Our code currently has several methods and functions which do mutate a board which is given as input and others that do not or else it would cause code bugs. While we have some documentation on this, it is never too obvious, and issues like this could and have cause bugs, particularly with other components like strategies which need access to boards. We hope to solve this by making a BoardState interface which only allows the use of methods which do not mutate the board, and then we can keep the normal board class to publicly expose methods that do expose the board. This way, when taking in Boards in functions or constructors, we can specify if the input type is BoardState or Board, and this will both enforce whether we want the board mutated or not as well as making the intent more clear directly in the code.

5. Separate Public and Private Game State

-   Fixed by "Separate Public and Private Game State": https://github.khoury.northeastern.edu/CS4500-F23/whimsical-bees/commit/ef6e5ac2d3409e2802fdd230eafa49ce08f118f2

    The Game State needs to be public because the player will receive the public game state knowledge. However, there is a lot of functionality that the player is not using in the game state that should be private. We should separate the public and private game state so that the player only has access to the public game state.

6. Refactor tile for scalability

-   Fixed by "Refactor tile for scalability": https://github.khoury.northeastern.edu/CS4500-F23/whimsical-bees/commit/a04ddf3a09da5e260e398ae6b069f86ed183851e

    The current tile implementation is not flexible with differently types of tiles or different implementations of tiles. Therefore, this should be refactored to allow for future scalability of tile implementations as well as less tight-coupling between the tile implementation and its logic.
