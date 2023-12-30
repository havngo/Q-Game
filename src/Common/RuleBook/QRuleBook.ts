import { Color, Shape, Tile } from "../tile";
import { Cell, ImmutableBoard } from "../map";
import { AdjacentCells } from "../map";
import { Placement, TurnType } from "../turn";
import { Coordinate } from "../coordinate";
import { arrayToBag } from "../Utils/utils";
import { TurnAction } from "../../Player/Types/types";
import { GAME_STATE_CONSTANTS } from "../Types/constants";
import { Set as ObjectSet } from "typescript-collections";

/**
 * Represents a rule book for the Q game which determines legality for turns, placements,
 * and the scores of moves.
 */
export interface IRuleBook {
    /**
     * Determines if an exchange can be made with the given hand and tile pool size.
     *
     * @param hand the player's hand
     * @param tilePoolSize the number of tiles in the referee's tile pool
     */
    canExchange(hand: Tile[], tilePoolSize: number): boolean;

    /**
     * Determines if the attributes of the given place turn are legal
     *
     * @param placements the placements of the place turn
     * @param board the board of the game
     * @param originalHand the original hand of the player
     */
    isPlaceTurnLegal(
        placements: Placement[],
        board: ImmutableBoard,
        originalHand: ReadonlyArray<Tile>
    ): boolean;

    /**
     * Given a tile, the method returns all the valid placements for that tile.
     *
     * @param tile the tile to check for valid placements
     * @returns all tile placements that are valid to place a given tile
     */
    getCoordinatesForTile(tile: Tile, board: ImmutableBoard): Coordinate[];

    /**
     * Determines whether the given turn is legal based on the given data.
     * Copies of board must be passed in because this function will modify the board.
     *
     * @param turn the turn to check
     * @param board a copy of the current game board
     * @param playerHand the player's hand
     * @param tilesRemaining the number of tiles remaining in the game
     * @returns whether this turn is legal
     */
    isTurnLegal(
        turn: TurnAction,
        board: ImmutableBoard,
        playerHand: ReadonlyArray<Tile>,
        tilesRemaining: number
    ): boolean;

    /**
     * Scores the given placements on the given board with the given hand size.
     *
     * @param placements the placements to be scored
     * @param board the board to score with
     * @param handSize the current size of the player's hand
     */
    scoreMove(placements: Placement[], board: ImmutableBoard, handSize: number): number;
}

export class QRuleBook implements IRuleBook {
    constructor() {}

    canExchange(hand: readonly Tile[], tilePoolSize: number): boolean {
        return hand.length <= tilePoolSize;
    }

    scoreMove(placements: Placement[], board: ImmutableBoard, handSize: number): number {
        if (placements.length === 0) {
            return 0;
        }

        let score = this.scorePlacementLength(placements);
        score += this.scoreFromContiguousTiles(placements, board);
        score += this.scoreFromEmptyHand(handSize);

        return score;
    }

    getCoordinatesForTile(tile: Tile, board: ImmutableBoard): Coordinate[] {
        return board.surroundingTiles.filter((coordinate) =>
            this.validTilePlacementAtCoordinate({ coordinate, tile }, board)
        );
    }

    isTurnLegal(
        turn: TurnAction,
        board: ImmutableBoard,
        playerHand: ReadonlyArray<Tile>,
        tilesRemaining: number
    ) {
        switch (turn.turnType) {
            case TurnType.PLACE:
                return this.isPlaceTurnLegal(turn.tilePlacements, board, playerHand);
            case TurnType.EXCHANGE:
                return this.canExchange(playerHand, tilesRemaining);
            case TurnType.PASS:
                return true;
        }
    }

    isPlaceTurnLegal(
        placements: Placement[],
        board: ImmutableBoard,
        originalHand: ReadonlyArray<Tile>
    ) {
        const hand = arrayToBag(originalHand);
        if (!this.placementsInSameRowOrColumn(placements)) {
            return false;
        }
        let updatedBoard = board;
        for (const placement of placements) {
            const validPlacement = this.validTilePlacementAtCoordinate(placement, updatedBoard);
            if (!validPlacement) {
                return false;
            }
            if (!hand.contains(placement.tile)) {
                return false;
            }
            hand.remove(placement.tile);
            updatedBoard = updatedBoard.addTile(placement.coordinate, placement.tile);
        }

        return true;
    }

    protected placementsInSameRowOrColumn(placements: Placement[]) {
        const coordinates = placements.map((placement) => placement.coordinate);
        return Coordinate.onSameRow(coordinates) || Coordinate.onSameColumn(coordinates);
    }

    /**
     * Determines whether the given placement is valid based on the given data.
     * Copies of board must be passed in because this function will modify the board.
     *
     * @param placement the placement to be checked
     * @param board the current state of the board
     * @returns whether the given placement is valid considering the state of the board
     */
    protected validTilePlacementAtCoordinate(placement: Placement, board: ImmutableBoard) {
        if (board.hasTile(placement.coordinate)) {
            return false;
        }
        const adjacentCells = board.getAdjacentCells(placement.coordinate);
        const hasAdjacentTile = this.tileSharesSideWithAnotherTile(adjacentCells);
        const matchesNeighbors = this.tileMatchesNeighbors(placement.tile, adjacentCells);
        const validTilePlacement = hasAdjacentTile && matchesNeighbors;
        return validTilePlacement;
    }

    /**
     *
     * @param coordinate potential coordinate to place a tile
     * @param board the board to check with
     * @returns if the coordinate shares a side with another tile on the board
     */
    protected tileSharesSideWithAnotherTile(adjacentCells: AdjacentCells) {
        const adjacentCellsArray = Object.values(adjacentCells);

        const hasAdjacentTile = adjacentCellsArray.some((cell: Cell) => cell.hasValue());

        return hasAdjacentTile;
    }

    protected tileMatchesNeighbors(tile: Tile, adjacentCells: AdjacentCells) {
        const { top, bottom, left, right } = adjacentCells;
        const cellRow = [left, right].filter((cell) => cell.hasValue());
        const cellColumn = [top, bottom].filter((cell) => cell.hasValue());
        const tileRow = cellRow.map((cell) => cell.value);
        const tileColumn = cellColumn.map((cell) => cell.value);

        const rowMatchesColorOrShape = tile.matchesColorOrShape(tileRow);
        const columnMatchesColorOrShape = tile.matchesColorOrShape(tileColumn);
        return rowMatchesColorOrShape && columnMatchesColorOrShape;
    }

    private scoreFromContiguousTiles(placements: Placement[], board: ImmutableBoard) {
        let score = 0;
        const coords = placements.map((placement) => placement.coordinate);
        const sequences = this.getContiguousTiles(coords, board);
        for (const sequence of sequences) {
            score += this.scoreSequence(sequence);
        }
        return score;
    }

    private scoreFromEmptyHand(handsize: number) {
        return handsize === 0 ? GAME_STATE_CONSTANTS.EMPTY_HAND_BONUS : 0;
    }

    private getContiguousTiles(coordinates: Coordinate[], board: ImmutableBoard) {
        const tileSequencesOfInterest: Tile[][] = [];
        const rowSet = new ObjectSet<Coordinate>();
        const colSet = new ObjectSet<Coordinate>();
        for (const coordinate of coordinates) {
            if (!rowSet.contains(coordinate)) {
                const newRow = board.getRow(coordinate);
                tileSequencesOfInterest.push(newRow.map((placement) => placement.tile));
                newRow.forEach((placement) => rowSet.add(placement.coordinate));
            }
            if (!colSet.contains(coordinate)) {
                const newCol = board.getColumn(coordinate);
                tileSequencesOfInterest.push(newCol.map((placement) => placement.tile));
                newCol.forEach((placement) => colSet.add(placement.coordinate));
            }
        }
        return tileSequencesOfInterest;
    }

    private scorePlacementLength(placement: Placement[]) {
        return placement.length * GAME_STATE_CONSTANTS.PER_TILE_SCORE;
    }

    private scoreSequence(tiles: Tile[]) {
        let output = 0;
        if (tiles.length > 1) {
            output += tiles.length;
        }
        if (this.isQ(tiles)) {
            output += GAME_STATE_CONSTANTS.Q_BONUS;
        }
        return output;
    }

    private isQ(tiles: Tile[]) {
        const allColors = Object.values(Color);
        const allShapes = Object.values(Shape);
        const allUniqueColors = this.uniqueTiles(tiles, allColors, (a, b) => !a.sameColor(b));
        const allUniqueShapes = this.uniqueTiles(tiles, allShapes, (a, b) => !a.sameShape(b));
        return allUniqueColors || allUniqueShapes;
    }

    private uniqueTiles(
        tiles: Tile[],
        possibleValues: any[],
        differentiator: (a: Tile, b: Tile) => boolean
    ) {
        return (
            tiles.length === possibleValues.length &&
            tiles.every((tile, i) => {
                return tiles.every((otherTile, j) => differentiator(tile, otherTile) || i === j);
            })
        );
    }
}
