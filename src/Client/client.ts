import * as net from "net";
import { refereeProxy } from "./referee";
import { CLIENT_CONFIGURATIONS as config } from "../Common/Types/constants";
import { SimpleLogging } from "../Common/Logging/logging";
import { Parser } from "stream-json";
import StreamValues from "stream-json/streamers/StreamValues";
import { IPlayer } from "../Player/player";

const logger = new SimpleLogging("CLIENT");

/**
 * Creates a tcp socket connection from real player(s) to a server. Client helps
 * a player register to a game by sending the player's name on an established socket
 * connection to the server, then run a referee proxy with the current client and player.
 * @param _player a player of Q game
 */
export function client(player: IPlayer) {
    logger.setVerbose(config.VERBOSE);
    logger.log(`Creating a tcp socket for player ${player.name()}`);

    const client: net.Socket = net.createConnection(config.SOCKET_OPTIONS, () =>
        onConnect(client, player)
    );
    client.on("error", (error: Error) => retryConnection(client, error));
    client.on("close", () => cleanup(client));
}

/**
 * Once the connection is established, immediately send the player's name
 * to the server and create a referee proxy for that player.
 * @param socket the connection to the server
 * @param player the player
 */
function onConnect(socket: net.Socket, player: IPlayer) {
    logger.log(`Player ${player.name()} connected to the server`);
    const pipeline = socket.pipe(new Parser({ jsonStreaming: true })).pipe(new StreamValues());
    socket.write(JSON.stringify(player.name()));
    refereeProxy(socket, pipeline, player);
}

/**
 * Invoked when an error event is emitted, if the given error is connection refuse,
 * attempt to reconnect to the server after an amount of time.
 * @param socket the tcp socket
 * @param error the error message
 * @param delay (in ms) the wait time for another attempt to reconnect
 */
export function retryConnection(socket: net.Socket, error: Error, delay?: number) {
    logger.error(error);
    if (error.message.includes("ECONNREFUSED")) {
        logger.warn(`Waiting for server to boot up...`);
        if (config.CLIENT_RETRY > 0) {
            config.CLIENT_RETRY--;
            setTimeout(() => {
                socket.connect(config.SOCKET_OPTIONS);
            }, delay ?? config.CLIENT_RECONNECT_PERIOD);
        }
    }
}

/**
 * Invoked when a close event is emitted, removes all listenters of the given socket
 * @param socket
 */
function cleanup(socket: net.Socket) {
    logger.log(`Client closes connection.`);
    socket.removeAllListeners();
}
