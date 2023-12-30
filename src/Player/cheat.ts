import { Bag } from "typescript-collections";
import { IRuleBook, QRuleBook } from "../Common/RuleBook/QRuleBook";
import { Optional } from "../Common/Types/optional";
import { PublicState } from "../Common/Types/public-state";
import { ImmutableBoard } from "../Common/map";
import { RegularTile, Tile } from "../Common/tile";
import { TurnType } from "../Common/turn";
import { TurnAction } from "./Types/types";
import { arrayToBag } from "../Common/Utils/utils";
import { IStrategy } from "./strategy";
import { Coordinate } from "../Common/coordinate";
import { NotAdjacentRuleBook, NotFitRuleBook } from "../Common/RuleBook/cheatRuleBooks";

/**
 * A function which, given a public state and a strategy, will attempt to cheat in a certain
 * way and return an empty result if the cheating is unsuccessful or not possible.
 */
export type CheatFunction = (
    publicState: PublicState,
    baseStrategy: IStrategy
) => Optional<TurnAction>;

/**
 * Attempts to ask for a replacement tile when it is not possible to do so.
 *
 * @param publicState the state of the game
 * @param _ base strategy
 * @returns an optional replacement turn action
 */
export function badReplacement(publicState: PublicState, _: IStrategy): Optional<TurnAction> {
    const hand = publicState.players[0].hand;
    const numTilesRemaining = publicState.tilesLeft;
    if (!new QRuleBook().canExchange(hand, numTilesRemaining)) {
        return Optional.with({ turnType: TurnType.EXCHANGE });
    } else {
        return Optional.withNoData();
    }
}

/**
 * Attempts to form a place turn with a tile that is not owned by the player.
 *
 * @param publicState the public state of the game
 * @param strategy a base strategy to use
 * @returns an optional that may have a placement turn action
 */
export function notOwned(publicState: PublicState, strategy: IStrategy): Optional<TurnAction> {
    const hand = publicState.players[0].hand;
    const board = publicState.map;
    const handAsBag = arrayToBag(hand);
    const tilesNotOwned = RegularTile.getAllTiles().filter((tile) => !handAsBag.contains(tile));
    const bagOfBadTiles = arrayToBag(tilesNotOwned);
    return attemptCheatWithAPlacement(bagOfBadTiles, board, new QRuleBook(), strategy);
}

/**
 * Attempts to form a place turn with a tile that is not adjacent to any other tile.
 *
 * @param publicState the public state of the game
 * @param strategy a base strategy to use
 * @returns an optional that may have a placement turn action
 */
export function notAdjacent(publicState: PublicState, strategy: IStrategy): Optional<TurnAction> {
    const hand = publicState.players[0].hand;
    const board = publicState.map;
    return attemptCheatWithAPlacement(arrayToBag(hand), board, new NotAdjacentRuleBook(), strategy);
}

/**
 * Attempts to form a place turn with a tile that does not fit on the board accoding to the rules.
 *
 * @param publicState the public state of the game
 * @param strategy a base strategy to use
 * @returns an optional that may have a placement turn action
 */
export function noFit(publicState: PublicState, strategy: IStrategy): Optional<TurnAction> {
    const hand = publicState.players[0].hand;
    const board = publicState.map;
    return attemptCheatWithAPlacement(arrayToBag(hand), board, new NotFitRuleBook(), strategy);
}

/**
 * Attempts to form a place turn with two tiles which are not on the same row or column.
 *
 * @param publicState the public state of the game
 * @param _  a base strategy to use
 * @returns an optional that may have a placement turn action
 */
export function notALine(publicState: PublicState, _: IStrategy): Optional<TurnAction> {
    const hand = publicState.players[0].hand;
    const board = publicState.map;
    const rulebook = new QRuleBook();
    for (const [i, tile] of hand.entries()) {
        const firstPositions = rulebook.getCoordinatesForTile(tile, board);
        for (const position of firstPositions) {
            const newBoard = board.addTile(position, tile);
            const otherPlacements = hand
                .slice(i + 1)
                .flatMap((otherTile) =>
                    rulebook
                        .getCoordinatesForTile(otherTile, newBoard)
                        .map((coord) => ({ coordinate: coord, tile: otherTile }))
                )
                .filter(
                    ({ coordinate }) =>
                        !Coordinate.onSameRow([position, coordinate]) &&
                        !Coordinate.onSameColumn([position, coordinate])
                );
            if (otherPlacements.length > 0) {
                return Optional.with({
                    turnType: TurnType.PLACE,
                    tilePlacements: [{ coordinate: position, tile }, otherPlacements[0]],
                });
            }
        }
    }
    return Optional.withNoData();
}

function attemptCheatWithAPlacement(
    hand: Bag<Tile>,
    board: ImmutableBoard,
    rulebook: IRuleBook,
    strategy: IStrategy
): Optional<TurnAction> {
    const potentialPlacement = strategy.getPlacement(hand, board, rulebook);
    if (potentialPlacement.hasValue()) {
        return Optional.with({
            turnType: TurnType.PLACE,
            tilePlacements: [potentialPlacement.value],
        });
    } else {
        return Optional.withNoData();
    }
}
