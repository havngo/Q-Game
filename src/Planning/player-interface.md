# Player Interface

## Background 
This doc will be using some types currently defined in the project, but for convinience I have added them here.

### Placements
- Coordinate
- Tile 

### Turn (abstract class)
- PlacementTurn
- ExchangeTurn
- Pass Turn

## Methods

- acceptPlayer(playerId: string, age: number)
  - handle accepting a player in to the game.
- kickOutPlayer(playerId: string)
  - handle kicking out a player if they violated the rules.
- startGame()
  - handle starting a game once enough players.
- playerReady(playerId: string)
  - sets a player as ready allowing the game to start after everyone is ready.
- handleUpdatingPlayer(playerId: string, turn: Turn):
  - update a player after other players make moves and the referee makes sure it's a valid move.
- handleUpdatingReferee(playerId: string, turn: Turn): 
  - after a player makes a turn update the ref with the new move.
- endGame() 
  - handle ending the game and informing all players.
