import { Bag } from "typescript-collections";
import { Board, ImmutableBoard } from "../Common/map";
import { Tile } from "../Common/tile";
import { PublicState } from "../Common/Types/public-state";
import { TurnAction } from "./Types/types";
import { IStrategy } from "./strategy";
import { TurnType } from "../Common/turn";
import { arrayToBag } from "../Common/Utils/utils";
import { JsonActorSpecAll } from "../Common/Types/json";
import { QRuleBook } from "../Common/RuleBook/QRuleBook";

/**
 * Represents a player who will play the Q game and make decisions.
 */
export interface IPlayer {
    /**
     * Gets the player name
     *
     * @returns the name of the player
     */
    name(): string;

    /**
     * Sets up the player using pertinent information from the game
     *
     * @param map the current map of the game
     * @param tiles the tiles the player has
     */
    setup(state: PublicState, tiles: Bag<Tile>): Promise<void>;

    /**
     * Determines the turn action that the player wishes to take based on the given public state
     *
     * @param publicState a state of public information of the game known by this player
     * @returns a turn action that the player wishes to take
     */
    takeTurn(publicState: PublicState): Promise<TurnAction>;

    /**
     * Updates the player's hand to the given set of tiles
     *
     * @param newSetOfTiles the new tiles the player ought to have
     */
    newTiles(newSetOfTiles: Bag<Tile>): Promise<void>;

    /**
     * Notifies the player whether they won
     *
     * @param result whether the player won the game
     */
    win(result: boolean): Promise<void>;

    /**
     * Returns a JSON representation of the player
     */
    toJson(): JsonActorSpecAll;
}

/**
 * Represents a basic player of the Q game who makes decisions based on the given strategy.
 */
export class Player implements IPlayer {
    /**
     * A bag of tiles that the player has in their hand, to their knowledge
     */
    private hand: Bag<Tile>;

    /**
     * The current information of board
     */
    private board: ImmutableBoard = new Board();

    /**
     * Constructs a new player to play the game of Qwirkle
     *
     * @param _name the name of the player
     * @param strategy the stratergy the player will use to make decisions
     */
    constructor(protected readonly _name: string, protected readonly strategy: IStrategy) {
        this.hand = new Bag();
    }

    name() {
        return this._name;
    }

    async setup(state: PublicState, tiles: Bag<Tile>) {
        this.hand = tiles;
        this.board = state.map;
    }

    async takeTurn(publicState: PublicState): Promise<TurnAction> {
        const numTilesRemaining = publicState.tilesLeft;
        const board = publicState.map;
        this.hand = arrayToBag(publicState.players[0].hand);
        const rulebook = new QRuleBook();
        switch (this.strategy.getNextTurnType(this.hand, numTilesRemaining, board, rulebook)) {
            case TurnType.EXCHANGE:
                this.hand.clear();
                return { turnType: TurnType.EXCHANGE };
            case TurnType.PASS:
                return { turnType: TurnType.PASS };
            case TurnType.PLACE:
                const placements = this.strategy.getPlacements(this.hand, board, rulebook);
                placements.forEach(({ tile }) => this.hand.remove(tile));
                return { turnType: TurnType.PLACE, tilePlacements: placements };
        }
    }

    async newTiles(newSetOfTiles: Bag<Tile>) {
        this.hand = newSetOfTiles;
    }

    async win(result: boolean): Promise<void> {
        result ? "😁" : "😭";
    }

    toJson(): JsonActorSpecAll {
        return [this._name, this.strategy.toJson()];
    }
}
