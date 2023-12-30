import { JsonCoordinate } from "./Types/json";

/**
 * A coordinate in a 2D plane with x and y integer values as cartesian coordinates, where
 * positive x is to the right and positive y is up.
 */
export class Coordinate {
    private readonly x: number;
    private readonly y: number;

    /**
     * Constructs a new coordinate with the given x and y values.
     *
     * @param x the x coordinate
     * @param y the y coordinate
     * @throws if given non integer values
     */
    constructor(x: number, y: number) {
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error("Cannot instantiate a coordinate with non integer values");
        }
        this.x = x;
        this.y = y;
    }

    /**
     * Compares this coordinate to another coordinate by first considering the y values.
     *
     * @param other the other coordinate to compare to
     * @returns an integer less than 0 if this coordinate is less than the other coordinate,
     *          0 if they are equal, and an integer greater than 0 if this coordinate is
     *          greater than the other coordinate.
     */
    compare(other: Coordinate): number {
        if (this.y !== other.y) {
            return other.y - this.y;
        }
        return this.x - other.x;
    }

    /**
     * Determines if all the given coordinates are in the same row or column.
     *
     * @param others the coordinates to check
     * @returns a boolean indicating if all the given coordinates are in the same row or column
     */
    inSameRowOrColumn(others: Coordinate[]) {
        const inSameRow = others.every((other) => this.y === other.y);
        const inSameColumn = others.every((other) => this.x === other.x);
        return inSameRow || inSameColumn;
    }

    equals(other: Coordinate): boolean {
        return this.x === other.x && this.y === other.y;
    }

    /**
     * Constructs a JSON representation of this coordinate, represented
     * by its row and column position.
     *
     * @returns a JsonCoordinate representation of this coordinate
     */
    toJson(): JsonCoordinate {
        return {
            row: -this.y,
            column: this.x,
        };
    }

    toString() {
        return `Coordinate(x: ${this.x}, y: ${this.y})`;
    }

    /**
     * Get the css grid style object for this coordinate, where the gridRow and gridColumn are positive integers.
     *
     * @param topMostCoordinate the top most coordinate who's y will be added to the row to keep the row positive.
     * @param leftMostCoordinate the left most coordinate who's x will be subtracted to the column to keep the column positive.
     * @returns a gridRow and gridColumn object.
     */
    getGrid(
        topMostCoordinate: Coordinate,
        leftMostCoordinate: Coordinate
    ): { gridRow: number; gridColumn: number } {
        const gridRow = -this.y + 1 + topMostCoordinate.y; // add one since css grid starts at 1
        const gridColumn = this.x + 1 - leftMostCoordinate.x; // add one since css grid starts at 1

        if (gridRow <= 0) {
            throw new Error("gridRow must be positive");
        }
        if (gridColumn <= 0) {
            throw new Error("gridColumn must be positive");
        }

        return { gridRow, gridColumn };
    }

    static getRight(coordinate: Coordinate): Coordinate {
        return new Coordinate(coordinate.x + 1, coordinate.y);
    }

    static getLeft(coordinate: Coordinate): Coordinate {
        return new Coordinate(coordinate.x - 1, coordinate.y);
    }

    static getTop(coordinate: Coordinate): Coordinate {
        return new Coordinate(coordinate.x, coordinate.y + 1);
    }

    static getBottom(coordinate: Coordinate): Coordinate {
        return new Coordinate(coordinate.x, coordinate.y - 1);
    }

    /**
     * Determines if all the given coordinates are on the same row.
     *
     * @param coordinates the coordinates to check
     * @returns whether all the given coordinates are on the same row
     */
    static onSameRow(coordinates: Coordinate[]): boolean {
        if (coordinates.length === 0) throw new Error("coordinates must not be empty");
        const firstCoordinate = coordinates[0];
        return coordinates.every((coordinate) => coordinate.y === firstCoordinate.y);
    }

    /**
     * Determines if all the given coordinates are on the same column.
     *
     * @param coordinates the coordinates to check
     * @returns whether all the given coordinates are on the same column
     */
    static onSameColumn(coordinates: Coordinate[]): boolean {
        if (coordinates.length === 0) throw new Error("coordinates must not be empty");
        const firstCoordinate = coordinates[0];
        return coordinates.every((coordinate) => coordinate.x === firstCoordinate.x);
    }

    /**
     * Get the top most coordinate of the given coordinates.
     *
     * @param coordinates the coordinates to get the top most coordinate from.
     * @returns a {@link Coordinate}.
     */
    static getTopMostCoordinate(coordinates: Coordinate[]): Coordinate {
        if (coordinates.length === 0) throw new Error("coordinates must not be empty");

        let topMostCoordinate = coordinates[0];
        for (const coordinate of coordinates) {
            if (coordinate.y > topMostCoordinate.y) {
                topMostCoordinate = coordinate;
            }
        }
        return topMostCoordinate;
    }

    /**
     * get the left most coordinate of the given coordinates.
     *
     * @param coordinates the coordinates to get the left most coordinate from.
     * @returns a {@link Coordinate}.
     */
    static getLeftMostCoordinate(coordinates: Coordinate[]): Coordinate {
        let mostLeftCoordinate = coordinates[0];
        for (const coordinate of coordinates) {
            if (coordinate.x < mostLeftCoordinate.x) {
                mostLeftCoordinate = coordinate;
            }
        }
        return mostLeftCoordinate;
    }

    /**
     * Determines the boundary of the given coordinates list in row-col terms.
     *
     * @param coordinates the coordinates to get the bounds from
     * @returns the row and column boundaries of the given coordinates
     */
    static getBounds(coordinates: Coordinate[]) {
        if (coordinates.length === 0) {
            return {
                minRow: 0,
                maxRow: 0,
                minCol: 0,
                maxCol: 0,
            };
        }
        const jsonCoords = coordinates.map((coord) => coord.toJson());
        const minRow = jsonCoords.reduce(
            (curr, { row }) => Math.min(row, curr),
            Number.MAX_SAFE_INTEGER
        );
        const maxRow = jsonCoords.reduce(
            (curr, { row }) => Math.max(row, curr),
            Number.MIN_SAFE_INTEGER
        );
        const minCol = jsonCoords.reduce(
            (curr, { column }) => Math.min(column, curr),
            Number.MAX_SAFE_INTEGER
        );
        const maxCol = jsonCoords.reduce(
            (curr, { column }) => Math.max(column, curr),
            Number.MIN_SAFE_INTEGER
        );
        return {
            minRow,
            maxRow,
            minCol,
            maxCol,
        };
    }
}
