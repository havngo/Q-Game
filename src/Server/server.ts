import * as net from "net";
import { PlayerProxy } from "./player";
import { GameResults, runGame } from "../Referee/referee";
import { JsonValidator } from "../Common/Json/json-validator";
import { SERVER_CONFIGURATIONS as config } from "../Common/Types/constants";
import { GameState } from "../Referee/game-state";
import { IObserver } from "../Referee/observer";
import { SimpleLogging } from "../Common/Logging/logging";

/**
 * Represents the inputs that can be provided to the referee when running a game with a set
 * game state and potential observer.
 */
type RefereeInputs = { gameState: GameState; observer?: IObserver };

/**
 * Represents a callback which should be invoked when the server is done running a game and should
 * be called with the results of that game.
 */
type EndServerCallback = (results: GameResults) => void;

/**
 * Represents a callback which should be invoked when the server is ready to run a game. If given
 * game results as a function parameter, the callback should not run a game and instead assume the
 * given resutls.
 */
type RunGameCallback = (gameResults?: GameResults) => Promise<void>;

/**
 * The list of remote proxy players that have signed up to the server to play.
 */
let remoteProxyPlayers: PlayerProxy[] = [];

/**
 * The server timeout for waiting for players to sign up to play.
 */
let waitingTimeout: NodeJS.Timeout;

/**
 * The server which connects remote players to the game.
 */
let server: net.Server;

/**
 * A logger for the server which will log messages to the console if the server is in verbose mode.
 */
const logger = new SimpleLogging("SERVER");

/**
 * Runs a server that accepts connections from remote proxy players and runs a Q game. The server will
 * wait for a certain amount of time for players to sign up, then start a game if there are enough players.
 * Additionally, if the max number of players join the game, the server will start immediately. If not enough
 * players join the game, the server will not run the game, and the game results returned will be empty.
 *
 * @param refereeInputs an optional arguement containing the inputs for the referee. If not provided,
 *                      a game will be created from scratch using the players that sign up. If provided,
 *                      the game state must match the players and order of the players that sign up.
 * @returns the results of the game. Will return empty results if the game did not occur.
 */
export async function runServer(refereeInputs?: RefereeInputs): Promise<GameResults> {
    logger.setVerbose(config.VERBOSE);
    return new Promise((resolve) => {
        const runGameCallback = makeRunGameCallback(resolve, refereeInputs);
        server = net
            .createServer()
            .listen(config.SOCKET_OPTIONS.port, config.SOCKET_OPTIONS.host, () =>
                onListening(runGameCallback)
            )
            .on("connection", (s) => socketConnectionListener(s, runGameCallback));
    });
}

/**
 * Creates a callback function to run a Q game and return the results of the game to the given
 * `returnResults` callback function. If game results are provided to the resulting callback, then
 * the server will not run an actual game and will instead resolve with just the given game results.
 *
 * @param returnResults the callback function to return the game results to
 * @param refereeInputs an optional arguement containing the referee inputs. If not provided,
 *                      the referee will be ran with nothing but the proxy players.
 */
function makeRunGameCallback(
    returnResults: EndServerCallback,
    refereeInputs?: RefereeInputs
): RunGameCallback {
    return async (gameResults?: GameResults) => {
        server.close();
        if (gameResults !== undefined) {
            returnResults(gameResults);
        } else {
            logger.log(`Start a game :D`);
            const runGamePromise =
                refereeInputs === undefined
                    ? runGame(remoteProxyPlayers)
                    : runGame(remoteProxyPlayers, refereeInputs.gameState, refereeInputs.observer);
            const gameResults = await runGamePromise;
            logger.log(`Deliver game result: ${JSON.stringify(gameResults)}`);
            returnResults(gameResults);
        }
        cleanup();
    };
}

/**
 * A listening listener of the server, is invoked when a "listening" event
 * is emitted to the server. A timeout of 20 seconds is set for clients to
 * establish connections and register to play a Q game. At any point in the
 * waiting period, if there is a maximum number of player (according to the game)
 * registered, clears the timeout and starts a Q game.
 *
 * @param runGameCallback the callback function to run a Q game
 */
function onListening(runGameCallback: RunGameCallback) {
    logger.log(`Listening to address ${JSON.stringify(server.address())}`);

    waitingTimeout = setTimeout(
        () => endWaitingPeriod(waitingTimeout, runGameCallback),
        config.WAITS
    );
}

/**
 * A connection listener of the server, is invoked when a "connection" event
 * is emitted to the server. Here, a timeout of 3 seconds is set for the socket
 * connected to submit a player's name for registering that player to a Q Game.
 *
 * @param socket the socket connected between the server and the player
 * @param runGameCallback the callback function to run a Q game when the server is ready
 */
function socketConnectionListener(socket: net.Socket, runGameCallback: RunGameCallback) {
    logger.log(`Received a socket connection`);
    socket.setTimeout(config.SIGNUP_WAITS);
    socket.once("data", (data) => onSocketData(socket, data, runGameCallback));
    socket.once("timeout", () => endSocket(socket));
    socket.once("error", (error: Error) => endSocket(socket, error));
    socket.once("close", () => endSocket(socket));
}

/**
 * Handles data sent by the player over the given socket. If given a valid JName, the server will register
 * the player to the game. If the server has enough players to start a game, the server will run a game.
 *
 * @param socket the socket connected between the server and the player
 * @param data the data received by the player
 * @param runGameCallback the callback function to run a Q game when the server is ready to do so
 */
async function onSocketData(socket: net.Socket, data: Buffer, runGameCallback: RunGameCallback) {
    const requestData = JSON.parse(data.toString());
    if (JsonValidator.validateJName(requestData)) {
        logger.log(`Received a valid jName ${requestData}`);
        socket.setTimeout(0); // disable timeout
        remoteProxyPlayers.push(new PlayerProxy(socket, requestData));

        if (remoteProxyPlayers.length === config.MAXIMUM_NUMBER_OF_PLAYERS) {
            clearTimeout(waitingTimeout);
            runGameCallback();
        }
    } else {
        logger.warn(`Received an invalid jName ${requestData}`);
        endSocket(socket);
    }
}

/**
 * Stop communication with the given socket
 *
 * @param socket the socket to end connection
 * @param error potential cause of closing the connection
 */
function endSocket(socket: net.Socket, error?: Error) {
    if (error) logger.error(error);
    logger.log(`Close a socket connection`);
    socket.end();
}

/**
 * A callback function for the waiting timeout. When the waiting room is timed out
 * and there are enough player, run a Q game. In contrast, if at most 1 player joined
 * and this is the first wait room, refresh the timeout, or deliver a simple default
 * game result otherwise.
 *
 * @param timeout the timeout object contains this callback
 * @param runGameCallback the callback function to run a Q game when the server is ready to do so
 */
function endWaitingPeriod(timeout: NodeJS.Timeout, runGameCallback: RunGameCallback) {
    logger.log(`Has waited for ${config.WAITS} seconds.`);
    if (remoteProxyPlayers.length < config.MINIMUM_NUMBER_OF_PLAYERS) {
        if (config.TRIES === 1) {
            runGameCallback({ winners: [], cheaters: [] });
        } else {
            config.TRIES--;
            logger.log("Refreshing waiting time...");
            timeout.refresh();
        }
    } else {
        runGameCallback();
    }
}

/**
 * Closes socket connections on remote proxy players and removes all listeners on a listening server.
 */
function cleanup() {
    logger.log(`Clean up!!!`);
    remoteProxyPlayers.forEach((p) => p.closeConnection());
    server.removeAllListeners();
}
