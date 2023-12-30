import { TILE_CONSTANTS } from "./Types/constants";
import { JsonTile } from "./Types/json";
import { RegularTile, Tile } from "./tile";
import seedrandom from "seedrandom";

/**
 * Represents a pouch of tiles which can be distributed.
 */
export interface TilePouch {
    /**
     * Takes one tile randomly from the pouch
     *
     * @returns a random tile from the pouch
     * @throws if the pouch is empty
     */
    takeOne(): Tile;

    /**
     * Takes many tiles from the pouch.
     *
     * @param numTiles takes the given number of tiles from the pouch
     * @returns an array of the new tiles drawn
     * @throws if there are not enough tiles to draw
     */
    takeMany(numTiles: number): Tile[];

    /**
     * Adds the given tile to the pouch
     *
     * @param tileToAdd the tile to add to the pouch
     */
    add(tile: Tile): void;

    /**
     * Adds the given tiles to the pouch
     *
     * @param tilesToAdd the tiles to add to the pouch
     */
    addTiles(tiles: Tile[]): void;

    /**
     * Determines if the pouch is empty
     */
    isEmpty(): boolean;

    /**
     * Gets the number of tiles in the pouch
     */
    getNumberOfTiles(): number;

    /**
     * Converts the pouch to a JSON representation
     */
    toJson(): JsonTile[];
}

/**
 * Represents an abstract class which contains common logic among tile pouches.
 */
abstract class ATilePouch implements TilePouch {
    constructor(protected readonly tiles: Tile[]) {}

    abstract takeOne(): Tile;

    addTiles(tilesToAdd: Tile[]) {
        tilesToAdd.forEach((tile) => {
            this.add(tile);
        });
    }

    takeMany(numTiles: number) {
        let tiles: Tile[] = [];

        for (let i = 0; i < numTiles; i++) {
            tiles.push(this.takeOne());
        }

        return tiles;
    }

    add(tileToAdd: Tile) {
        this.tiles.push(tileToAdd);
    }

    isEmpty() {
        return this.tiles.length === 0;
    }

    getNumberOfTiles() {
        return this.tiles.length;
    }

    toJson(): JsonTile[] {
        return this.tiles.map((tile) => tile.toJson());
    }
}

/**
 * Represents a pouch of tiles which can be drawn from randomly.
 */
export class RandomTilePouch extends ATilePouch {
    // A random number generator used to draw tiles from the pouch
    private readonly randomGenerator: seedrandom.PRNG;

    /**
     * Creates a new tile pouch with the given seed and tiles.
     *
     * @param seed the seed to use for the random number generator
     * @param tiles an optional array of tiles to construct the pouch with
     */
    constructor(seed: number = Math.random(), tiles?: Tile[]) {
        super(tiles ?? RandomTilePouch.initTiles());
        this.randomGenerator = seedrandom(seed.toString());
    }

    private static initTiles() {
        const tileOutput: Tile[] = [];
        /** Initializes the pouch with {@link uniqueTileKindCount} of each tile */
        for (let i = 0; i < TILE_CONSTANTS.UNIQUE_TILE_KIND_COUNT; i++) {
            RegularTile.getAllTiles().forEach((tile) => tileOutput.push(tile));
        }
        return tileOutput;
    }

    takeOne() {
        if (this.tiles.length === 0) {
            throw new Error("There are no more tiles to take");
        }

        const randomIndex = this.getRandomIndex();
        const tile = this.tiles[randomIndex];
        this.tiles.splice(randomIndex, 1); // remove the tile from the pouch
        return tile;
    }

    private getRandomIndex() {
        const randomFloat = this.randomGenerator.quick(); // get a random float between 0 and 1, [0, 1)
        return Math.floor(randomFloat * this.tiles.length);
    }

    /**
     * A factory for creating tile pouches.
     */
    static Factory = class {
        private tiles: Tile[] | undefined;
        private tileCount: number | undefined;
        private seed: number | undefined;
        constructor() {}

        setTileCount(tileCount: number) {
            this.tileCount = tileCount;
            return this;
        }

        setSeed(seed: number) {
            this.seed = seed;
            return this;
        }

        create(): TilePouch {
            const tilePouch = new RandomTilePouch(this.seed, this.tiles);
            if (this.tileCount !== undefined) {
                tilePouch.tiles.splice(this.tileCount, tilePouch.tiles.length - this.tileCount);
            }
            return tilePouch;
        }
    };
}

/**
 * Represents a tile pouch which will always return the same tiles in the same order as given.
 */
export class DeterministicTilePouch extends ATilePouch {
    /**
     * Creates a tile pouch where the tiles will be drawn in the order given.
     *
     * @param tiles the tiles which the pouch will draw in order from
     */
    constructor(tiles: Tile[]) {
        super(tiles);
    }

    takeOne(): Tile {
        const nextTile = this.tiles.shift();
        if (nextTile === undefined) {
            throw new Error("There are no more tiles to take");
        }
        return nextTile;
    }
}
