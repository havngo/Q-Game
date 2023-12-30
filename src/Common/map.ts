import { Tile } from "./tile";
import { JsonMap, JsonCell } from "./Types/json";
import { Coordinate } from "./coordinate";
import { Optional } from "./Types/optional";
import { Dictionary, Set as ObjectSet } from "typescript-collections";
import { Placement } from "./turn";

/**
 * Represents a cell on the board which may or may not have a tile in it
 */
export type Cell = Optional<Tile>;

/**
 * Represents cells adjacent to a particular cell
 */
export interface AdjacentCells {
    top: Cell;
    right: Cell;
    bottom: Cell;
    left: Cell;
}

/**
 * Reresents a board which is immutable and can only be read from or copied.
 */
export interface ImmutableBoard {
    /**
     * Returns a list of coordinates on the board
     */
    getCoordinates(): Coordinate[];

    /**
     * Represents empty tiles that are adjacent to placed tiles on the board
     */
    surroundingTiles: ReadonlyArray<Coordinate>;

    /**
     * Returns data about the cell at a given coordinate
     *
     * @param coordinate the coordinate to get the tile from
     * @returns the cell which may or may not contain a tile
     */
    getCell(coordinate: Coordinate): Optional<Tile>;

    /**
     * Returns data about the cells adjacent to a given coordinate
     *
     * @param coordinate the coordinate to get the adjacent cells from
     * @returns the adjacent cells to the given coordinate
     */
    getAdjacentCells(coordinate: Coordinate): AdjacentCells;

    /**
     * Provides a row of chained tile placements represented as a list given a coordinate
     *
     * @param coordinate the coordinate to get the row from
     * @returns a row of tiles from left to right, with the tile at the given coordinate if it is a tile
     */
    getRow(coordinate: Coordinate): Placement[];

    /**
     * Provides a column of chained tile placements represented as a list given a coordinate
     *
     * @param coordinate the coordinate to get the column from
     * @returns a column of tiles from top to bottom, with the tile at the given coordinate if it is a tile
     */
    getColumn(coordinate: Coordinate): Placement[];

    /**
     * Determines if the board has a tile at the given coordinate
     *
     * @param coordinate the coordinate to check the position of
     * @returns whether the board has a tile at the given coordinate
     */
    hasTile(coordinate: Coordinate): boolean;

    /**
     * Constructs the Json representation of this board
     *
     * @returns the JsonMap representation of this board
     */
    toJson(): JsonMap;

    addTile(coordinate: Coordinate, tile: Tile): ImmutableBoard;

}

/**
 * Represents a board of tiles
 */
export class Board implements ImmutableBoard {
    /**
     * A map which maps coordinates to the tiles located at them.
     */
    private coordinateToTile: Dictionary<Coordinate, Tile>;
    /**
     * A set of coordinates which have no tiles on them but are adjacent to tiles on the board.
     */
    private surroundingTilesCoordinates: ObjectSet<Coordinate>;

    /**
     * Creates a new empty board
     */
    constructor() {
        this.coordinateToTile = new Dictionary();
        this.surroundingTilesCoordinates = new ObjectSet();
    }

    getCoordinates(): Coordinate[] {
        return this.coordinateToTile.keys();
    }

    get surroundingTiles(): ReadonlyArray<Coordinate> {
        return this.surroundingTilesCoordinates.toArray();
    }

    getCell(coordinate: Coordinate): Optional<Tile> {
        const tile = this.coordinateToTile.getValue(coordinate);
        if (tile === undefined) {
            return Optional.withNoData();
        } else {
            return Optional.with(tile);
        }
    }

    getAdjacentCells(coordinate: Coordinate): AdjacentCells {
        const top = this.getCell(Coordinate.getTop(coordinate));
        const right = this.getCell(Coordinate.getRight(coordinate));
        const bottom = this.getCell(Coordinate.getBottom(coordinate));
        const left = this.getCell(Coordinate.getLeft(coordinate));
        return { top, right, bottom, left };
    }

    getRow(coordinate: Coordinate) {
        let row: Placement[] = [];

        let leftCoordinate = Coordinate.getLeft(coordinate);
        let leftTile = this.getCell(leftCoordinate);

        while (leftTile.hasValue()) {
            row.unshift({ coordinate: leftCoordinate, tile: leftTile.value });
            leftCoordinate = Coordinate.getLeft(leftCoordinate);
            leftTile = this.getCell(leftCoordinate);
        }

        const tile = this.getCell(coordinate);
        if (tile.hasValue()) {
            row.push({ coordinate, tile: tile.value });
        }

        let rightCoordinate = Coordinate.getRight(coordinate);
        let rightTile = this.getCell(rightCoordinate);

        while (rightTile.hasValue()) {
            row.push({ coordinate: rightCoordinate, tile: rightTile.value });
            rightCoordinate = Coordinate.getRight(rightCoordinate);
            rightTile = this.getCell(rightCoordinate);
        }

        return row;
    }

    getColumn(coordinate: Coordinate) {
        let column: Placement[] = [];

        let topCoordinate = Coordinate.getTop(coordinate);
        let topTile = this.getCell(topCoordinate);

        while (topTile.hasValue()) {
            column.unshift({ coordinate: topCoordinate, tile: topTile.value });
            topCoordinate = Coordinate.getTop(topCoordinate);
            topTile = this.getCell(topCoordinate);
        }

        const tile = this.getCell(coordinate);
        if (tile.hasValue()) {
            column.push({ coordinate, tile: tile.value });
        }

        let bottomCoordinate = Coordinate.getBottom(coordinate);
        let bottomTile = this.getCell(bottomCoordinate);

        while (bottomTile.hasValue()) {
            column.push({ coordinate: bottomCoordinate, tile: bottomTile.value });
            bottomCoordinate = Coordinate.getBottom(bottomCoordinate);
            bottomTile = this.getCell(bottomCoordinate);
        }

        return column;
    }

    hasTile(coordinate: Coordinate) {
        return this.getCell(coordinate).hasValue();
    }

    /**
     * check if there is already a tile at the given coordinate, if not add itK
     *
     * @param coordinate the coordinate to add the tile to
     * @param tile the tile to add
     *
     * @throws Error if there is already a tile at the given coordinate
     */
    addTile(coordinate: Coordinate, tile: Tile): ImmutableBoard {
        if (this.coordinateToTile.containsKey(coordinate)) {
            throw new Error("There is already a tile at this coordinate");
        }
        const newDict = new Dictionary<Coordinate, Tile>();
        this.coordinateToTile.forEach((key: Coordinate, value: Tile) => {
            newDict.setValue(key, value)
        })
        newDict.setValue(coordinate, tile);

        const newBoard = new Board()
        newBoard.coordinateToTile = newDict;
        this.surroundingTilesCoordinates.forEach((coord: Coordinate) => {
            newBoard.surroundingTilesCoordinates.add(coord)
        })
        newBoard.updateSurroundingTiles(coordinate);

        return newBoard;
    }

    toJson(): JsonMap {
        const rowMap = new Map<number, JsonCell[]>();
        this.coordinateToTile.forEach((coordinate, tile) => {
            const { row, column } = coordinate.toJson();
            let curRow = rowMap.get(row);
            if (curRow === undefined) {
                curRow = [];
                rowMap.set(row, curRow);
            }
            curRow.push([column, tile.toJson()]);
        });
        return [...rowMap.entries()]
            .sort(([row1], [row2]) => row1 - row2)
            .map(([rowIndex, jsonCells]) => [
                rowIndex,
                ...jsonCells.sort(([col1], [col2]) => col1 - col2),
            ]);
    }

    copy(): ImmutableBoard {
        let boardCopy: ImmutableBoard = new Board();
        this.coordinateToTile.forEach((coordinate, tile) => boardCopy = boardCopy.addTile(coordinate, tile));
        return boardCopy;
    }

    private getEmptySurroundingTiles(coordinate: Coordinate) {
        const topCoordinate = Coordinate.getTop(coordinate);
        const rightCoordinate = Coordinate.getRight(coordinate);
        const bottomCoordinate = Coordinate.getBottom(coordinate);
        const leftCoordinate = Coordinate.getLeft(coordinate);

        const surroundingCoordinates = [
            topCoordinate,
            rightCoordinate,
            bottomCoordinate,
            leftCoordinate,
        ];

        const emptySurroundingTiles = surroundingCoordinates.filter(
            (coordinate) => !this.getCell(coordinate).hasValue()
        );

        return emptySurroundingTiles;
    }

    private updateSurroundingTiles(coordinate: Coordinate) {
        this.surroundingTilesCoordinates.remove(coordinate);
        const emptySurroundingTiles = this.getEmptySurroundingTiles(coordinate);
        emptySurroundingTiles.forEach((coordinate) => {
            this.surroundingTilesCoordinates.add(coordinate);
        });
    }
}
