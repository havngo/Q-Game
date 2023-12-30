import { Tile } from "./tile";
import { JsonPlayer } from "./Types/json";

/**
 * Represents data pertaining to a player in the game
 */
export class PlayerState {
    // The tiles owned by the player
    private readonly _hand: Tile[];

    // The score of the player
    private _score: number;

    /**
     * Creates a new player with the given player id
     *
     * @param playerId the id of the player
     */
    constructor(readonly playerId: string) {
        this._hand = [];
        this._score = 0;
    }

    get hand() {
        return [...this._hand];
    }

    get score() {
        return this._score;
    }

    /**
     * Adds the given tiles to the player's hand of tiles.
     *
     * @param tiles the tiles to add to the player's hand
     */
    addTiles(tiles: Tile[]) {
        this._hand.push(...tiles);
    }

    /**
     * Removes the given tile from the player's hand.
     *
     * @param tile the tile to remove from the player's hand
     * @throws an error if the tile is not in the player's hand
     */
    removeTile(tile: Tile) {
        const indexToRemove = this._hand.findIndex((t) => t.compare(tile) === 0);
        if (indexToRemove === -1) {
            throw new Error("Tile is not in player's hand");
        }
        this._hand.splice(indexToRemove, 1);
    }

    addScore(score: number) {
        this._score += score;
    }

    isHandEmpty() {
        return this._hand.length === 0;
    }

    /**
     * Creates a JSON representation of this player state
     *
     * @returns a json representation of the player
     */
    toJson(): JsonPlayer {
        return {
            score: this.score,
            "tile*": this.hand.map((tile) => tile.toJson()),
            name: this.playerId,
        };
    }

    /**
     * Creates a copy of this player state to contain identitcal data
     *
     * @returns a copy of this player state
     */
    copy(): PlayerState {
        const copy = new PlayerState(this.playerId);
        copy.addTiles(this._hand);
        copy.addScore(this.score);
        return copy;
    }
}
