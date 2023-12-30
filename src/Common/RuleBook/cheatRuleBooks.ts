import { Coordinate } from "../coordinate";
import { AdjacentCells, ImmutableBoard } from "../map";
import { Tile } from "../tile";
import { QRuleBook } from "./QRuleBook";

/**
 * Tiles do not extend the current board
 */
export class NotAdjacentRuleBook extends QRuleBook {
    getCoordinatesForTile(_: Tile, board: ImmutableBoard): Coordinate[] {
        const topMostCoord = Coordinate.getTopMostCoordinate([...board.surroundingTiles]);
        const aboveTopMostCoord = Coordinate.getTop(topMostCoord);
        return [aboveTopMostCoord];
    }
}

/**
 * Tiles do not match their immediate neighbors in term of shape and color
 */
export class NotFitRuleBook extends QRuleBook {
    protected tileMatchesNeighbors(tile: Tile, adjacentCells: AdjacentCells) {
        const { top, bottom, left, right } = adjacentCells;
        const cellRow = [left, right].filter((cell) => cell.hasValue());
        const cellColumn = [top, bottom].filter((cell) => cell.hasValue());
        const tileRow = cellRow.map((cell) => cell.value);
        const tileColumn = cellColumn.map((cell) => cell.value);

        const rowMatchesColorOrShape = tile.matchesColorOrShape(tileRow);
        const columnMatchesColorOrShape = tile.matchesColorOrShape(tileColumn);
        return !rowMatchesColorOrShape || !columnMatchesColorOrShape;
    }
}
