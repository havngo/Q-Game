TO: CEOs of Q Game 
FROM: Nicolas Araujo and David O'Brien 
DATE: November 2 2023 
SUBJECT: Future Changes

# Changing the bonus points again and allow more players to participate in a game;

1. Changing the bonus points is as simple as changing the `Q_BONUS` constant in `Q/Common/Types/constants.ts` from 6 to 8. Since this is as simple as changing a constant in a file we would rank it as a 1 in terms of the impact it would have on the codebase.
2. Changing the participating players is also as simple as changing the `MAXIMUM_NUMBER_OF_PLAYERS` and `MINIMUM_NUMBER_OF_PLAYERS` constant in `Q/Referee/Types/constants.ts` from 2 and 4 to however many players you would like. Since this is as simple as changing two constants in a file we would rank it as a 1 in terms of the impact it would have on the codebase.

# adding wildcard tiles;

1. Adding a wildcard tile is as simple as adding a new tile that extends `ATile`. This would then have to implement `sameColor`, `sameShape`, `matchesColor`, and `matchesShape` which would all return true. It would also have to implement `toString`, `compare`, and `toJson` which would be implemented according to how the wildcard tile should interact with other Regular tiles. This would be a 1 in terms of the impact it would have on the codebase.

# imposing restrictions that enforce the rules of Qwirkle instead of Q.

1. Changing the rules would be relatively simple since they are all in the rulebook file. If we also allow for the player to choose which tiles to exchange, as is possible in Qwirkle, this would have more impact on our code base. This would require refactoring both the ExchangeTurn class and the handle turn method in the GameState class. This would be a 3 in terms of impact to the codebase.
