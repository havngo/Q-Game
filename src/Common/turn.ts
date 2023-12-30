import { Coordinate } from "./coordinate";
import { Tile } from "./tile";

/**
 * Represents information needed for making a tile placement.
 */
export interface Placement {
    coordinate: Coordinate;
    tile: Tile;
}

/**
 * Represents a type of turn in the game
 */
export enum TurnType {
    PLACE = "place",
    EXCHANGE = "exchange",
    PASS = "pass",
}