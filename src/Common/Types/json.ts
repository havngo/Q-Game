import { Color, Shape } from "../tile";

/**
 * Represents the different strategy types in the game
 */
export type JsonStrategy = "dag" | "ldasg";

/**
 * Represents the different action types in the game
 */
export type JsonAction = "pass" | "replace" | Json1Placement;

/**
 * A JSON representation of public data that may be sent back to the player requesting it, where
 * map is a Json representation of the board, tile* is the score of the referee,
 * and players is an array, consisting firstly of Json player data and secondly of
 * the remaining scores of the other players
 */
export interface JsonPub {
    map: JsonMap;
    "tile*": number;
    players: [JsonPlayer, ...number[]];
}

/**
 * A JSON representation of a player which contains the player's score and the tiles in their hand
 */
export interface JsonPlayer {
    score: number;
    name: string;
    "tile*": JsonTile[];
}

/**
 * A JSON representation of many placements as an array
 */
export type JsonPlacements = Json1Placement[];

/**
 * A JSON representation of a placement consisting of a {@link JsonCoordinate} and a {@link JsonTile}
 */
export interface Json1Placement {
    coordinate: JsonCoordinate;
    "1tile": JsonTile;
}

/**
 * A JSON representation of a map as an array where each element is a {@link JsonRow}
 */
export type JsonMap = JsonRow[];

/**
 * A JSON representation of a row as a array where the first element is the row number and the rest are {@link JsonCell}s
 */
export type JsonRow = [number, ...JsonCell[]];

/**
 * A JSON representation of a cell as a array where the first element is the column number and the second is the {@link JsonTile}
 */
export type JsonCell = [number, JsonTile];

/**
 * A JSON representation containing data that is relevant for a tile
 */
export interface JsonTile {
    color: Color;
    shape: Shape;
}

/**
 * A JSON representation of a coordinate
 */
export interface JsonCoordinate {
    row: number;
    column: number;
}

/**
 * Represents the names of players in the Q game
 */
export type JsonName = string;

/**
 * Represents methods that could throw an exception in the player class
 */
export type JsonExn = MName;

/**
 * Represents a type of player in the Q game and how they will act
 */
export type JsonActorSpec = [JsonName, JsonStrategy] | [JsonName, JsonStrategy, JsonExn];

export type JsonActorSpecA = JsonActorSpec | [JsonName, JsonStrategy, "a cheat", JsonCheat];

export type JsonActorSpecB = JsonActorSpecA | [JsonName, JsonStrategy, JsonExn, number];

export type RemoteJsonActorSpec = [JsonName, "a proxy", number | undefined, string | undefined];

export type JsonActorSpecAll =
    | JsonActorSpec
    | JsonActorSpecA
    | JsonActorSpecB
    | RemoteJsonActorSpec;

export enum JsonCheat {
    // Denotes a player that in response to being granted a turn,
    // requests the placement of a tile that is not adjacent to a placed tile.
    NotAdjacent = "non-adjacent-coordinate",
    // requests the placement of a tile that it does not own.
    NotOwned = "tile-not-owned",
    // requests placements that are not in one line (row, column).
    NotALine = "not-a-line",
    // requests a tile replacement but it owns more tiles than the referee has left.
    BadReplacement = "bad-ask-for-tiles",
    // requests the placement of a tile that does not match its adjacent tiles.
    NotFit = "no-fit",
}

/**
 * Represents an array of json actor specs
 */
export type JsonActors = JsonActorSpecAll[];

/**
 * Represents private data that can be used to create a game state
 */
export interface JsonState {
    map: JsonMap;
    "tile*": JsonTile[];
    players: JsonPlayer[];
}

export type JsonChoice = "pass" | "replace" | JsonPlacements;

export enum MName {
    TAKE_TURN = "take-turn",
    NEW_TILES = "new-tiles",
    SETUP = "setup",
    WIN = "win",
}

export interface ClientConfig {
    port: number;
    host: string;
    wait: number;
    quiet: boolean;
    players: JsonActorSpecB[];
}

export interface ServerConfig {
    port: number;
    "server-tries": number;
    "server-wait": number;
    "wait-for-signup": number;
    quiet: boolean;
    "ref-spec": RefereeConfig;
}

export interface RefereeConfig {
    state0: JsonState;
    quiet: boolean;
    "config-s": RefereeStateConfig;
    "per-turn": number;
    observe: boolean;
}

export interface RefereeStateConfig {
    qbo: number;
    fbo: number;
}
