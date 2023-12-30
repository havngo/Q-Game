-   All these changes required as to change our objects which store the constants to be mutable instead of immutable. This way, upon loading the config from json, we can just override the default values with the new configured values.

The server configuration specifies the port to listen to, for how many rounds the server waits, for how long each waiting period lasts, for how long it waits for a player’s name, and a referee configuration.

-   Since our original server was initialized in the global scope, we had to refactor the code to wrap this logic in a callback since we needed to allow time for the program to read the config file and change the appropriate constants before trying to create a server and read from them.
-   Additionally, we needed to allow for our server to allow for custom game states and observers, functionality which we did not originally have as we had assumed a new server implied a new game. This made us have to revise a lot of the structure of our code, and it also made us factor our logic to return the results of the game by the function call rather than printing it directly inside the server functions.

A referee configuration contains a state, the per-turn time for a calls to players, and optionally an observer.

-   Our referee code required a bit of modification to account for the new "quiet" to debug output. We needed to add areas to be able to console-log, but otherwise we did not need too many modifications, particularly since we had already wrapped our client logic in a function.

A scoring configuration determines the bonus values for finishing a game or completing a Q during a turn.

-   The scoring did not require any modifications beyond what we mentioned earlier about needing to make the scoring constants object mutable.
