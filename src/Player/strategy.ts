import { Coordinate } from "../Common/coordinate";
import { ImmutableBoard } from "../Common/map";
import { Optional } from "../Common/Types/optional";
import { Tile } from "../Common/tile";
import { Placement, TurnType } from "../Common/turn";
import { Bag } from "typescript-collections";
import { copyBag } from "../Common/Utils/utils";
import { AtLeastOne, hasAtLeastOneElem } from "../Common/Types/types";
import { JsonStrategy } from "../Common/Types/json";
import { PublicState } from "../Common/Types/public-state";
import { IRuleBook, QRuleBook } from "../Common/RuleBook/QRuleBook";

/**
 * Represents a strategy to be used to play Q Game.
 */
export interface IStrategy {
    /**
     * Determines the type of turn that should be played next by the player.
     *
     * @param hand the current hand of the player
     * @param remainingTiles the number of referee tiles remaining in the game
     * @param board the current board
     * @returns the type of turn that should be played
     */
    getNextTurnType(
        hand: Bag<Tile>,
        remainingTiles: number,
        board: ImmutableBoard,
        rulebook?: IRuleBook
    ): TurnType;

    /**
     * Gets the array of placements that should be made by the player considering the given hand.
     *
     * @param hand the current hand of the player
     * @param board the current board
     * @returns an array of placements that should be made
     */
    getPlacements(
        originalHand: Bag<Tile>,
        board: ImmutableBoard,
        rulebook?: IRuleBook
    ): Placement[];

    /**
     * Get a placement for the given tiles
     *
     * @param tiles the tiles to get the placement for
     * @param board the current board
     * @returns an optional placement depending on if there is a legal placement for the given to be made
     */
    getPlacement(
        tiles: Bag<Tile>,
        board: ImmutableBoard,
        rulebook?: IRuleBook
    ): Optional<Placement>;

    /**
     * Returns a json string representation of this strategy.
     */
    toJson(): JsonStrategy;
}

/**
 * An abstract class which holds shared functionality among strategies
 */
abstract class AStrategy implements IStrategy {
    protected constructor() {}

    getNextTurnType(
        hand: Bag<Tile>,
        remainingTiles: number,
        board: ImmutableBoard,
        rulebook: IRuleBook = new QRuleBook()
    ): TurnType {
        if (this.getPlacements(hand, board, rulebook).length !== 0) {
            return TurnType.PLACE;
        } else if (hand.size() <= remainingTiles) {
            return TurnType.EXCHANGE;
        } else {
            return TurnType.PASS;
        }
    }

    getPlacements(
        originalHand: Bag<Tile>,
        board: ImmutableBoard,
        rulebook: IRuleBook = new QRuleBook()
    ): Placement[] {
        const placements: Placement[] = [];
        const tiles = copyBag(originalHand);
        let updatedBoard = board;
        let potentialPlacement: Optional<Placement> = this.getPlacement(
            tiles,
            updatedBoard,
            rulebook
        );
        let canIterate = potentialPlacement.hasValue();
        while (canIterate) {
            const placement = potentialPlacement.value;
            placements.push(placement);
            tiles.remove(placement.tile);
            updatedBoard = updatedBoard.addTile(placement.coordinate, placement.tile);
            potentialPlacement = this.getPlacement(tiles, updatedBoard, rulebook);
            canIterate =
                potentialPlacement.hasValue() &&
                rulebook.isPlaceTurnLegal(
                    [...placements, potentialPlacement.value],
                    board,
                    originalHand.toArray()
                );
        }
        return placements;
    }

    abstract getPlacement(
        tiles: Bag<Tile>,
        board: ImmutableBoard,
        rulebook?: IRuleBook
    ): Optional<Placement>;

    abstract toJson(): JsonStrategy;

    /**
     * Breaks a tie between coordinates by choosing the coordinate that is first in row-column order.
     *
     * @param tile the tile to place
     * @param coordinates the coordinates where the tile can be placed
     * @returns the placement of the tile at on of the given coordinates
     */
    protected breakTieWithRowColumnOrder(
        tile: Tile,
        coordinates: AtLeastOne<Coordinate>
    ): Placement {
        coordinates.sort((a, b) => a.compare(b));
        const coordinate = coordinates[0];
        return { coordinate, tile };
    }
}

/**
 * A strategy that places tiles in the first available spot and breaks ties with row-column order.
 */
export class Dag extends AStrategy {
    constructor() {
        super();
    }

    getPlacement(
        originalTiles: Bag<Tile>,
        board: ImmutableBoard,
        rulebook: IRuleBook = new QRuleBook()
    ): Optional<Placement> {
        const tiles = originalTiles.toArray();
        tiles.sort((a, b) => a.compare(b));
        for (const tile of tiles) {
            let coordinates = rulebook.getCoordinatesForTile(tile, board);
            if (hasAtLeastOneElem(coordinates)) {
                return Optional.with(this.breakTieWithRowColumnOrder(tile, coordinates));
            }
        }

        return Optional.withNoData();
    }

    toJson(): JsonStrategy {
        return "dag";
    }
}

/**
 * A strategy that places tiles in the coordinate with most neighbors and breaks ties with row-column order.
 */
export class Ldasg extends AStrategy {
    constructor() {
        super();
    }

    getPlacement(
        originalTiles: Bag<Tile>,
        board: ImmutableBoard,
        rulebook: IRuleBook = new QRuleBook(),
        publicState?: PublicState
    ): Optional<Placement> {
        const tiles = originalTiles.toArray();
        tiles.sort((a, b) => a.compare(b));
        for (const tile of tiles) {
            let coordinates = rulebook.getCoordinatesForTile(tile, board);
            coordinates = this.getCoordinatesWithMostNeighbors(coordinates, board);
            if (hasAtLeastOneElem<Coordinate>(coordinates)) {
                return Optional.with(this.breakTieWithRowColumnOrder(tile, coordinates));
            }
        }

        return Optional.withNoData();
    }

    toJson(): JsonStrategy {
        return "ldasg";
    }

    /**
     * Break ties between coordinates by choosing the coordinate with the most neighbors, if there is a tie, choose all of them
     * @param coordinates the coordinates to break the tie between
     * @param board the current board
     * @returns a list of {@link Coordinate}s with the most neighbors
     */
    private getCoordinatesWithMostNeighbors(
        coordinates: Coordinate[],
        board: ImmutableBoard
    ): Coordinate[] {
        let coordinatesWithMostNeighbors: Coordinate[] = [];
        let maxNeighbors = 0;
        coordinates.forEach((coordinate) => {
            const adjacentCells = board.getAdjacentCells(coordinate);
            const cellsArray = Object.values(adjacentCells);
            const adjacentTiles = cellsArray.filter((cell: Optional<Tile>) => cell.hasValue());
            if (adjacentTiles.length > maxNeighbors) {
                coordinatesWithMostNeighbors = [coordinate];
                maxNeighbors = adjacentTiles.length;
            } else if (adjacentTiles.length === maxNeighbors) {
                coordinatesWithMostNeighbors.push(coordinate);
            }
        });
        return coordinatesWithMostNeighbors;
    }
}
