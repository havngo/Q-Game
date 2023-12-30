import { JsonTile } from "./Types/json";

/**
 * Represents all possible colors of a tile.
 */
export enum Color {
    RED = "red",
    GREEN = "green",
    BLUE = "blue",
    YELLOW = "yellow",
    ORANGE = "orange",
    PURPLE = "purple",
}

/**
 * Represents all possible shapes of a tile.
 */
export enum Shape {
    STAR = "star",
    EIGHT_STAR = "8star",
    SQUARE = "square",
    CIRCLE = "circle",
    CLOVER = "clover",
    DIAMOND = "diamond",
}

/**
 * The sort-order of shapes.
 */
const SHAPE_ORDER = [
    Shape.STAR,
    Shape.EIGHT_STAR,
    Shape.SQUARE,
    Shape.CIRCLE,
    Shape.CLOVER,
    Shape.DIAMOND,
] as const;

/**
 * The sort-order of colors.
 */
const COLOR_ORDER = [
    Color.RED,
    Color.GREEN,
    Color.BLUE,
    Color.YELLOW,
    Color.ORANGE,
    Color.PURPLE,
] as const;

export interface Tile {
    /**
     * Constructs a string representation of this tile.
     *
     * @returns a string which holds data pertinent to this tile
     */
    toString(): string;

    /**
     * Compares this tile with the other one
     *
     * @param other the other tile to compare to
     * @returns an integer representing the result of the comparison, where negative
     *          is a less-than relation, positive is greater-than, and zero is equal
     */
    compare(other: Tile): number;

    matchesColorOrShape(others: Tile[]): boolean;

    sameColor(other: Tile): boolean;

    sameShape(other: Tile): boolean;

    matchesColor(color: Color): boolean;

    matchesShape(shape: Shape): boolean;

    toJson(): JsonTile;
}

abstract class ATile implements Tile {
    abstract toString(): string;

    abstract compare(other: Tile): number;

    /**
     * Given list of {@link Tile}, the method checks to see if this tile matches the color or shape of all of the {@link others}.
     *
     * @param others the list of {@link Tile} to compare against this tile
     * @returns true if this tile matches the color or shape of all of the {@link others}
     */
    matchesColorOrShape(others: Tile[]): boolean {
        const matchesColor = others.every((tile) => tile.sameColor(this));
        const matchesShape = others.every((tile) => tile.sameShape(this));
        return matchesShape || matchesColor;
    }

    abstract sameColor(other: Tile): boolean;

    abstract sameShape(other: Tile): boolean;

    abstract matchesColor(color: Color): boolean;

    abstract matchesShape(shape: Shape): boolean;

    abstract toJson(): JsonTile;
}

/**
 * Represents a tile used in the game.
 */
export class RegularTile extends ATile {
    /**
     * Creates a new tile with the given data.
     *
     * @param color the color of the tile
     * @param shape the shape of the tile
     */
    constructor(private readonly color: Color, private readonly shape: Shape) {
        super();
    }

    toString(): string {
        return `${this.color}_${this.shape}`;
    }

    compare(other: Tile) {
        if (other instanceof RegularTile) {
            const shapeIndex = SHAPE_ORDER.indexOf(this.shape);
            const otherShapeIndex = SHAPE_ORDER.indexOf(other.shape);
            if (shapeIndex != otherShapeIndex) {
                return shapeIndex - otherShapeIndex;
            }

            const colorIndex = COLOR_ORDER.indexOf(this.color);
            const otherColorIndex = COLOR_ORDER.indexOf(other.color);
            return colorIndex - otherColorIndex;
        }
        return -1;
    }

    sameColor(other: Tile) {
        return other.matchesColor(this.color);
    }

    sameShape(other: Tile) {
        return other.matchesShape(this.shape);
    }

    matchesColor(color: Color): boolean {
        return this.color === color;
    }
    matchesShape(shape: Shape): boolean {
        return this.shape === shape;
    }

    toJson(): JsonTile {
        return {
            color: this.color,
            shape: this.shape,
        };
    }

    /**
     * Returns a list of all possible tiles in the game
     *
     * @returns a list of all possible tiles in the game
     */
    static getAllTiles() {
        let tiles: Tile[] = [];

        for (const color of Object.values(Color)) {
            for (const shape of Object.values(Shape)) {
                tiles.push(new RegularTile(color, shape));
            }
        }

        return tiles;
    }
}
