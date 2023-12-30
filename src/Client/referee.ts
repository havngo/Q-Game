import { IPlayer } from "../Player/player";
import { JsonPub, JsonTile, MName } from "../Common/Types/json";
import { JsonBuilder } from "../Common/Json/json-builder";
import { FunctionCallArguments, JsonValidator } from "../Common/Json/json-validator";
import { Tile } from "../Common/tile";
import { arrayToBag } from "../Common/Utils/utils";
import { SimpleLogging } from "../Common/Logging/logging";
import { VOID } from "../Common/Types/constants";
import { REFEREE_CONSTANTS } from "../Referee/Types/constants";
import { Duplex } from "stream-json/Parser";
import StreamValues from "stream-json/streamers/StreamValues";
import { CommandFunction } from "./types";

const logger = new SimpleLogging("REFEREE PROXY");

/**
 * Represents a remote proxy referee, which connects to a remote player proxy via a
 * TCP socket and talks to an actual player in a game. It is a simulation of the
 * referee, allowing a player to play a Q game with setup, take turn, new tiles,
 * and win methods.
 * @param c the tcp net socket connection to the server
 * @param pipeline the pipeline to read json data
 * @param player the player it is interacting with
 */
export const refereeProxy = (c: Duplex, pipeline: StreamValues, player: IPlayer) => {
    logger.setVerbose(REFEREE_CONSTANTS.VERBOSE);

    logger.log(`Player ${player.name()} signed up and had a referee proxy.`);
    pipeline.on("data", async ({ value }) => {
        if (JsonValidator.validateFunctionCall(value)) {
            await handleData(value, player, c);
        } else {
            logger.warn(`Player ${player.name()} received an invalid json format ${value}`);
            c.end();
        }
    });
};

/**
 * Invoke setup method with appropriate args on the given player
 * @param args includes jPub and jTiles in a json format, assuming the data is well-formed
 * @param player the player this proxy is communicating to
 * @param c the tcp socket to server
 */
const playerSetup = async (args: [JsonPub, JsonTile[]], player: IPlayer, c: Duplex) => {
    const state = JsonBuilder.toPublicState(args[0]);
    const tiles = args[1].map((jTile: JsonTile) => JsonBuilder.toTile(jTile));
    try {
        await player.setup(state, arrayToBag<Tile>(tiles));
        c.write(JSON.stringify(VOID));
    } catch (e) {
        c.emit("error", new Error("Can't resolve setup"));
    }
};

/**
 * Invoke take turn method with appropriate args on the given player
 * @param args includes jPub in a json format, assuming the data is well-formed
 * @param player the player this proxy is communicating to
 * @param c the tcp socket to server
 */
const playerTakeTurn = async (args: [JsonPub], player: IPlayer, c: Duplex) => {
    const state = JsonBuilder.toPublicState(args[0]);
    try {
        const action = await player.takeTurn(state);
        c.write(JSON.stringify(JsonBuilder.toJChoice(action)));
    } catch (e) {
        c.emit("error", new Error("Can't resolve take turn"));
    }
};

/**
 * Invoke new tiles method with appropriate args on the given player
 * @param args includes jTiles in a json format, assuming the data is well-formed
 * @param player the player this proxy is communicating to
 * @param c the tcp socket to server
 */
const playerNewTiles = async (args: [JsonTile[]], player: IPlayer, c: Duplex) => {
    const tiles = args[0].map((jTile: JsonTile) => JsonBuilder.toTile(jTile));
    try {
        await player.newTiles(arrayToBag<Tile>(tiles));
        c.write(JSON.stringify(VOID));
    } catch (e) {
        c.emit("error", new Error("Can't resolve new tiles"));
    }
};

/**
 * Invoke win method with appropriate args on the given player
 * @param args includes a boolean for winning status in a json format, assuming the data is well-formed
 * @param player the player this proxy is communicating to
 * @param c the tcp socket to server
 */
const playerWin = async (args: [boolean], player: IPlayer, c: Duplex) => {
    try {
        await player.win(args[0]);
        c.write(JSON.stringify(VOID));
    } catch (e) {
        c.emit("error", new Error("Can't resolve win method"));
    }
};


/**
 * A map mapping IPlayer method names to helper functions that handles each method call
 */
const commandMap: Record<MName, CommandFunction> = {
    setup: playerSetup,
    "take-turn": playerTakeTurn,
    "new-tiles": playerNewTiles,
    win: playerWin,
};

/**
 * Helper to delegate specific function call to appropriate command handler
 * @param data the json format of a function call
 * @param player the player to invoke the function on
 * @param c socket connection to the server
 */
const handleData = async (
    [methodName, args]: [MName, FunctionCallArguments],
    player: IPlayer,
    c: Duplex
) => {
    logger.log(`Player ${player.name()} received a method call ${methodName}`);
    const execute = commandMap[methodName];
    await execute(args, player, c);
};
