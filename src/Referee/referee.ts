import { GameState } from "./game-state";
import { TurnType } from "../Common/turn";
import { IPlayer } from "../Player/player";
import { TurnAction } from "../Player/Types/types";
import { arrayToBag } from "../Common/Utils/utils";
import { IObserver } from "./observer";
import { resolveWithinMs } from "./Types/utils";
import { REFEREE_CONSTANTS } from "./Types/constants";

/**
 * Represents the results from playing a full game of Qwirkle
 */
export type GameResults = {
    winners: string[];
    cheaters: string[];
};

/**
 * Represents the conditions that can cause a game to end
 */
type GameOverConiditions = {
    playerHasEmptyHand: boolean;
    allPlayersPassedOrReplaced: boolean;
    noPlayersLeft: boolean;
};

/**
 * A function which will reject a given promise if it takes longer than the given
 * number of milliseconds.
 */
const strictTimeout = resolveWithinMs(REFEREE_CONSTANTS.PLAYER_TIMEOUT_MS);

/**
 * Plays a game of Qwirkle with the given players and returns the winners and cheaters
 *
 * @param players the players in the game, sorted by age
 * @param seed an optional seed which determines the random number generator used
 * @returns the names of the winners of the game and the cheaters that got caught and kicked out
 */
export async function runGame(
    players: IPlayer[],
    seed?: number,
    observer?: IObserver
): Promise<GameResults>;

/**
 * Plays a game of Qwirkle with the given players and returns the winners and cheaters
 *
 * @param players the players in the game, sorted by age
 * @param gameState the state of the game to be used
 * @returns the names of the winners of the game and the cheaters that got caught and kicked out
 */
export async function runGame(
    players: IPlayer[],
    gameState: GameState,
    observer?: IObserver
): Promise<GameResults>;

export async function runGame(
    players: IPlayer[],
    arg2: (number | undefined) | GameState,
    arg3: IObserver | undefined
): Promise<GameResults> {
    const gameState = arg2 instanceof GameState ? arg2 : initGameState(players, arg2);
    const playerStore = initPlayerStore(players);
    const observers: IObserver[] = arg3 === undefined ? [] : [arg3];
    informObserversOfState(observers, gameState);
    await setupPlayers(playerStore, gameState);
    let gameOver = gameState.getNumPlayers() === 0;

    while (!gameOver) {
        gameOver = await runRound(gameState, playerStore, observers);
    }

    observers.forEach((observer) => observer.gameEnded());
    let { winners, losers } = gameState.getGameResult();
    const cheaters = gameState.getEliminatedPlayers();
    await announceGameResult(playerStore, winners, true, cheaters);
    await announceGameResult(playerStore, losers, false, cheaters);
    winners = winners.filter((playerName) => !cheaters.includes(playerName));
    return { winners, cheaters };
}

/**
 * Consturcts a new game state with the given players and potential seed
 *
 * @param players the players of the game
 * @param seed the seed to use for the game
 * @returns a new game state with the given information
 */
function initGameState(players: IPlayer[], seed?: number): GameState {
    const playerNames = players.map((player) => player.name());
    return new GameState(playerNames, undefined, seed);
}

/**
 * Creates an object mapping the given players' names to their objects
 *
 * @param players the players to use for the initialization
 * @returns an object of player names to player objects
 */
function initPlayerStore(players: IPlayer[]): Record<string, IPlayer> {
    const playerStore: Record<string, IPlayer> = {};
    for (const player of players) {
        const playerName = player.name();
        playerStore[playerName] = player;
    }
    return playerStore;
}

/**
 * Uses the given game state to update the obersvers with a new state.
 *
 * @param observers the observers to be informed
 * @param gameState the game state to be sent in json form
 */
function informObserversOfState(observers: IObserver[], gameState: GameState) {
    const jsonState = gameState.toJson();
    observers.forEach((observer) => {
        observer.newState(jsonState);
    });
}

/**
 * Initializes the players with the given game state by calling their setup methods
 *
 * @param playerStore the store of names and players
 * @param gameState the state of the game
 */
async function setupPlayers(playerStore: Record<string, IPlayer>, gameState: GameState) {
    for (const [name, player] of Object.entries(playerStore)) {
        const publicState = gameState.getPublicState(name);
        const tiles = publicState.players[0].hand;
        try {
            await strictTimeout(player.setup(publicState, arrayToBag(tiles)));
        } catch (e) {
            // throw e
            gameState.removePlayer(name);
        }
    }
}

/**
 * Runs a round of the game and determines if it should end after this round
 *
 * @param gameState the state of the game
 * @param playerStore an object storing players to their name
 * @param cheaters in array of cheaters of the game which may be added to
 * @returns whether the game should end after this round
 */
async function runRound(
    gameState: GameState,
    playerStore: Record<string, IPlayer>,
    observers: IObserver[]
) {
    const gameOverConditions = initGameOverConditions();
    let gameOughtToEnd = false;
    gameState.startRound();
    while (!(gameState.isNewRound() || gameOughtToEnd)) {
        gameOughtToEnd = await runTurn(playerStore, gameState, gameOverConditions);
        informObserversOfState(observers, gameState);
    }
    gameOverConditions.noPlayersLeft = gameState.getNumPlayers() === 0;
    return gameOughtToEnd || Object.values(gameOverConditions).some(Boolean);
}

/**
 * Initializes the game over conditions that would be present at the start of a round.
 *
 * @returns the game over conditions at the start of a round
 */
function initGameOverConditions(): GameOverConiditions {
    return {
        playerHasEmptyHand: false,
        allPlayersPassedOrReplaced: true,
        noPlayersLeft: false,
    };
}

/**
 * Runs a turn of the game and mutates the given game state and cheaters list if needed
 *
 * @param players the players of the game
 * @param gameState the current state of the game which should be mutated
 * @param gameOverConditions the conditions that can cause a game to end which should be mutated
 *
 * @returns whether the game should end soley based on this turn
 */
async function runTurn(
    playerStore: Record<string, IPlayer>,
    gameState: GameState,
    gameOverConditions: GameOverConiditions
): Promise<boolean> {
    const playerName = gameState.getActivePlayerId();
    const player = playerStore[playerName];
    const publicState = gameState.getPublicState(playerName);
    let turnAction: TurnAction;
    try {
        turnAction = await strictTimeout(player.takeTurn(publicState));
    } catch (e) {
        gameState.removePlayer(playerName);
        return false;
    }
    if (turnAction.turnType === TurnType.PLACE) {
        gameOverConditions.allPlayersPassedOrReplaced = false;
    }
    if (!gameState.isTurnLegal(turnAction)) {
        gameState.removePlayer(playerName);
        return false;
    }
    const playerHasEmptyHand = gameState.completeTurn(turnAction);
    if (playerHasEmptyHand) {
        gameOverConditions.playerHasEmptyHand = true;
    } else {
        gameState.advance();
        if (turnAction.turnType !== TurnType.PASS) {
            const playerBehaved = await dealNewTiles(
                gameState,
                player,
                playerName,
                gameOverConditions
            );
            if (!playerBehaved) {
                gameState.removePlayer(playerName);
                return false;
            }
        }
    }
    return playerHasEmptyHand;
}

/**
 * Deals new tiles to the given player based on the current state of the game, and mutates
 * the given game over conditions if needed
 *
 * @param gameState the current state of the game
 * @param player the player whom to deal new tiles to
 * @param playerName the name of the player
 * @param gameOverConditions the conditions that can cause a game to end which can be mutated
 */
async function dealNewTiles(
    gameState: GameState,
    player: IPlayer,
    playerName: string,
    gameOverConditions: GameOverConiditions
): Promise<boolean> {
    const newPublicState = gameState.getPublicState(playerName);
    const newPlayerState = newPublicState.players[0];
    const newTileBag = arrayToBag(newPlayerState.hand);
    try {
        await strictTimeout(player.newTiles(newTileBag));
    } catch {
        return false;
    }

    if (newTileBag.size() === 0) {
        gameOverConditions.playerHasEmptyHand = true;
    }
    return true;
}

/**
 * Announces the given game result to the given players and adds any cheaters to the given list
 *
 * @param playerStore the store of players from their names
 * @param names the names of the players to announce to
 * @param win whether these people won
 * @param cheaters a list of cheaters which may be added to
 */
async function announceGameResult(
    playerStore: Record<string, IPlayer>,
    names: string[],
    win: boolean,
    cheaters: string[]
) {
    for (const name of names) {
        const playerToAnnounce = playerStore[name];
        try {
            await strictTimeout(playerToAnnounce.win(win));
        } catch (e) {
            cheaters.push(name);
        }
    }
}
