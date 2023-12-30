import { Dag, Ldasg, IStrategy } from "../../Player/strategy";
import { Coordinate } from "../coordinate";
import { Board, ImmutableBoard } from "../map";
import { PlayerState } from "../player-state";
import { RegularTile, Tile } from "../tile";
import { Placement, TurnType } from "../turn";
import {
    JsonMap,
    JsonCoordinate,
    JsonPlacements,
    JsonTile,
    JsonPub,
    JsonPlayer,
    JsonStrategy,
    JsonExn,
    JsonState,
    JsonActorSpecAll,
    JsonChoice,
    JsonCheat,
} from "../Types/json";
import { IPlayer, Player } from "../../Player/player";
import { AsyncMethodsOf } from "../Types/types";
import { GameState } from "../../Referee/game-state";
import { DeterministicTilePouch } from "../tile-pouch";
import { EvilPlayer } from "../../Player/evil-player";
import { TimebombPlayer } from "../../Player/timebomb-player";
import { TurnAction } from "../../Player/Types/types";
import { Bag } from "typescript-collections";
import { FilthyCheater } from "../../Player/filthy-cheater";
import * as Cheat from "../../Player/cheat";
import * as net from "net";
import { PlayerProxy } from "../../Server/player";
import { PublicState } from "../Types/public-state";

/**
 * A class which builds instances of objects from their JSON representations.
 */
export class JsonBuilder {
    /**
     * Converts the given Json Coordinate to an instace of the Coordinate class
     *
     * @param input the json to be converted to a coordinate
     * @returns the new coordiante
     */
    static toCoordinate({ column, row }: JsonCoordinate) {
        return new Coordinate(column, -row);
    }

    /**
     * Converts the given Json Tile to an instance of the Tile class
     *
     * @param input the json to be convered to a tile
     * @returns the new tile
     */
    static toTile({ color, shape }: JsonTile): Tile {
        return new RegularTile(color, shape);
    }

    /**
     * Converts the given Json Map array to an instance of the Board class
     *
     * @param jsonMap the Json array to be converted to a board
     * @returns the new board
     */
    static toBoard(jsonMap: JsonMap) {
        let output: ImmutableBoard = new Board();
        jsonMap.forEach(([row, ...jsonCells]) =>
            jsonCells.forEach(([column, jsonTile]) => {
                const coordinate = this.toCoordinate({ row, column });
                const tile = this.toTile(jsonTile);
                output = output.addTile(coordinate, tile);
            })
        );
        return output;
    }

    /**
     * Creates an array of Placement instaces from a JsonPlacements inout
     *
     * @param jsonPlacements the json array of json placements
     * @returns an instance of an array of actual placements
     */
    static toPlacementArray(jsonPlacements: JsonPlacements): Placement[] {
        return jsonPlacements.map(({ "1tile": jsonTile, coordinate: jsonCoord }) => ({
            tile: this.toTile(jsonTile),
            coordinate: this.toCoordinate(jsonCoord),
        }));
    }

    /**
     * Converts the given Json Player to an instance of the PlayerState class with the
     * given player id.
     *
     * @param jsonPlayer the json player to be converted to a player state
     * @param playerId the id of the new player state
     * @returns a player state containing the given data
     */
    static toPlayerState(jsonPlayer: JsonPlayer, playerId?: string) {
        const playerState = new PlayerState(playerId ?? jsonPlayer.name);
        const playerHand = jsonPlayer["tile*"].map((jsonTile) => this.toTile(jsonTile));
        playerState.addScore(jsonPlayer.score);
        playerState.addTiles(playerHand);
        return playerState;
    }

    /**
     * Creates an instance of PublicState given the necessary json data
     *
     * @param jsonPub the public json state to be converted to a public state
     * @param playerId the id of the player requesting the data
     * @returns a public state object containing the pertinent data
     */
    static toPublicState(jsonPub: JsonPub) {
        const map = this.toBoard(jsonPub.map);
        const tilesLeft = jsonPub["tile*"];
        const [jsonPlayer, ...playerNumbers] = jsonPub.players;
        const playerState = this.toPlayerState(jsonPlayer);
        return new PublicState(map, tilesLeft, [playerState, ...playerNumbers]);
    }

    /**
     * Returns a strategy that corresponds to the given json strategy
     *
     * @param jsonStrat the json strategy to be converted to a strategy
     * @returns a strategy implementation based on the given json
     */
    static toStrategy(jsonStrat: JsonStrategy): IStrategy {
        switch (jsonStrat) {
            case "dag":
                return new Dag();
            case "ldasg":
                return new Ldasg();
        }
    }

    /**
     * Deserializes the json cheat into its corresponding cheat function
     *
     * @param jCheat the json cheat
     * @returns a cheat function
     */
    static toCheatFunction(jCheat: JsonCheat): Cheat.CheatFunction {
        switch (jCheat) {
            case JsonCheat.BadReplacement:
                return Cheat.badReplacement;
            case JsonCheat.NotAdjacent:
                return Cheat.notAdjacent;
            case JsonCheat.NotFit:
                return Cheat.noFit;
            case JsonCheat.NotOwned:
                return Cheat.notOwned;
            case JsonCheat.NotALine:
                return Cheat.notALine;
        }
    }

    /**
     * Returns a player that corresponds to the given json actor specs
     *
     * @param jsonActor the json actor specs needed to create a player
     * @returns a player corresponding to the specs
     */
    static toPlayer(jsonActor: JsonActorSpecAll): IPlayer {
        if (jsonActor.length === 2) {
            const [name, jsonStrategy] = jsonActor;
            return new Player(name, this.toStrategy(jsonStrategy));
        } else if (jsonActor.length === 3) {
            const [name, jsonStrategy, jExn] = jsonActor;
            return new EvilPlayer(name, this.toStrategy(jsonStrategy), jExn);
        } else {
            const [name, arg2, arg3, arg4] = jsonActor;
            if (arg2 === "a proxy") {
                const [port, host] = [arg3, arg4];
                const socket = new net.Socket();
                const proxyPlayer = new PlayerProxy(socket, name);
                if (port === undefined || host === undefined) {
                    socket.destroy();
                } else {
                    socket.connect(port, host);
                }
                return proxyPlayer;
            } else if (arg3 === "a cheat") {
                const [jsonStrategy, cheatName] = [arg2, arg4];
                return new FilthyCheater(name, this.toStrategy(jsonStrategy), {
                    cheatName,
                    cheat: JsonBuilder.toCheatFunction(cheatName),
                });
            } else {
                const [jsonStrategy, jExn, count] = [arg2, arg3, arg4];
                return new TimebombPlayer(name, this.toStrategy(jsonStrategy), jExn, count);
            }
        }
    }

    /**
     * Returns the method name of the player class corresponding to the given jExn
     *
     * @param jExn a string representing the part of the protocol which should error
     * @returns the string name of the method in the player class corresponding to the jExn
     */
    static toMethodOfPlayer(jExn: JsonExn): AsyncMethodsOf<IPlayer> {
        switch (jExn) {
            case "setup":
                return "setup";
            case "new-tiles":
                return "newTiles";
            case "take-turn":
                return "takeTurn";
            case "win":
                return "win";
            default:
                throw new Error("Method not found for jExn");
        }
    }

    /**
     * Creates a new game state which matches the given data
     *
     * @param jState a JsonState holding pertinent data of the game between rounds
     * @param playerNames the names of the players, which should match the length and order of
     *                    players in the jsonstate
     * @returns a game state at the start of a new round which represents the given data
     */
    static toGameState(
        { map, "tile*": refJsonTiles, players: jsonPlayers }: JsonState,
        namesOfPlayers?: string[]
    ) {
        const playerNames = namesOfPlayers ?? jsonPlayers.map((jsonPlayer) => jsonPlayer.name);
        if (playerNames !== undefined && playerNames.length !== jsonPlayers.length) {
            throw new Error("Cannot create game state with different number of players");
        }
        const board = this.toBoard(map);
        const refTiles = refJsonTiles.map(this.toTile);
        const playerStates = jsonPlayers.map((jsonPlayer, i) =>
            this.toPlayerState(jsonPlayer, playerNames[i])
        );

        const tilePouch = new DeterministicTilePouch(refTiles);
        const gameStateFactory = new GameState.Factory();
        playerStates.forEach((playerState) => gameStateFactory.addPlayerState(playerState));
        return gameStateFactory.setBoard(board).setTilePouch(tilePouch).create();
    }

    static toAction(jChoice: JsonChoice): TurnAction {
        switch (jChoice) {
            case "pass":
                return { turnType: TurnType.PASS };
            case "replace":
                return { turnType: TurnType.EXCHANGE };
            // case placements
            default:
                return { turnType: TurnType.PLACE, tilePlacements: this.toPlacementArray(jChoice) };
        }
    }

    static toJTiles(bagOfTiles: Bag<Tile>): JsonTile[] {
        return bagOfTiles.toArray().map((tile) => tile.toJson());
    }

    static toJChoice(action: TurnAction): JsonChoice {
        switch (action.turnType) {
            case TurnType.EXCHANGE:
                return "replace";
            case TurnType.PASS:
                return "pass";
            case TurnType.PLACE:
                return action.tilePlacements.map((placement) => ({
                    coordinate: placement.coordinate.toJson(),
                    "1tile": placement.tile.toJson(),
                }));
        }
    }
}
