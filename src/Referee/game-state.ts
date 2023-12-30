import { Board, ImmutableBoard } from "../Common/map";
import { Placement, TurnType } from "../Common/turn";
import { Order } from "../Common/order";
import { PlayerState } from "../Common/player-state";
import { RandomTilePouch, TilePouch } from "../Common/tile-pouch";
import { Tile } from "../Common/tile";
import { GAME_STATE_CONSTANTS } from "../Common/Types/constants";
import { IRuleBook, QRuleBook } from "../Common/RuleBook/QRuleBook";
import { PublicState } from "../Common/Types/public-state";
import { JsonState } from "../Common/Types/json";
import { TurnAction } from "../Player/Types/types";

/**
 * A class that represents the state of a game of Qwirkle.
 */
export class GameState {
    // The board of the game
    private board: ImmutableBoard;

    // A circular queue of players which keeps track of the current player
    private order: Order;

    // A tile pouch which can be used to draw tiles from
    private tilePouch: TilePouch;

    private rulebook: IRuleBook;

    private eliminatedPlayers: string[] = [];

    /**
     * Creates a new game state for Qwirkle.
     *
     * @param playerIds the unique IDs of the players in the game
     * @param startingPlacement an optional initial placement of the game.
     *                          A random one will be created if this is not provided.
     * @param seed an optional random seed to use for random elements of the game
     */
    constructor(
        playerIds: string[],
        startingPlacement?: Placement,
        seed = Math.random(),
        rulebook?: IRuleBook
    ) {
        this.rulebook = rulebook ?? new QRuleBook();

        if (new Set(playerIds).size !== playerIds.length) {
            throw new Error("Cannot create a game with duplicate player IDs");
        }
        this.board = new Board();
        this.order = new Order(playerIds.map((playerId) => new PlayerState(playerId)));
        this.tilePouch = new RandomTilePouch(seed);

        if (!startingPlacement) {
            const startingTile = this.tilePouch.takeOne();
            this.board = this.board.addTile(
                GAME_STATE_CONSTANTS.DEFAULT_STARTING_POSITION,
                startingTile
            );
        } else {
            this.board = this.board.addTile(startingPlacement.coordinate, startingPlacement.tile);
        }

        const playerStates = this.order.toArrayFromHead();
        playerStates.forEach((playerState) => {
            const newTiles = this.getTilesFromPouch(GAME_STATE_CONSTANTS.INITIAL_HAND_SIZE);
            playerState.addTiles(newTiles);
        });
    }

    /**
     * Determines the number of players currently in the game
     *
     * @returns the number of players in the game
     */
    getNumPlayers() {
        return this.order.size;
    }

    /**
     * Determines if the current round has ended
     * @returns
     */
    isNewRound(): boolean {
        return this.order.isNewRound();
    }

    /**
     * If the current round has ended (ie. current order is at Sentinel), advances to a new round.
     */
    startRound(): void {
        if (this.isNewRound()) {
            this.order.advance();
        }
    }

    /**
     * Determines the ids of the players who are winning
     *
     * @returns an array of the ids of the winning players
     */
    getGameResult(): { winners: string[]; losers: string[] } {
        const playerStates = this.order.toArrayFromCurrent();
        const bestScore = playerStates.reduce(
            (bestVal, playerState) => Math.max(bestVal, playerState.score),
            0
        );
        const winners = playerStates
            .filter((playerState) => playerState.score === bestScore)
            .map((playerState) => playerState.playerId);
        const losers = playerStates
            .filter((playerState) => playerState.score !== bestScore)
            .map((playerState) => playerState.playerId);
        return { winners, losers };
    }

    /**
     * Returns a new json of public data about the game known by the player corresponding
     * to the given player information.
     *
     * @param playerId the id of the player retrieving the data
     * @returns a JsonPublicData for the specified player
     */
    getPublicState(playerId: string): PublicState {
        const playerState = this.getPlayerState(playerId);
        const playerStates = this.order.toArrayFromHead();
        const otherPlayerScores = [...playerStates]
            .filter((playerState) => playerState.playerId !== playerId)
            .map((playerState) => playerState.score);
        return new PublicState(this.board, this.tilePouch.getNumberOfTiles(), [
            playerState.copy(),
            ...otherPlayerScores,
        ]);
    }

    /**
     * Determines if the proposed turn is a legal one to make right now
     *
     * @param turn the turn to be checked
     * @returns whether the turn is a legal one
     */
    isTurnLegal(turnAction: TurnAction) {
        const playerState = this.getActivePlayerState();
        return this.rulebook.isTurnLegal(
            turnAction,
            this.board,
            playerState.hand,
            this.tilePouch.getNumberOfTiles()
        );
    }

    /**
     * Completes the given turn
     *
     * @param turn the turn to execute
     * @throws if given a turn which breaks the current state of the game
     *
     * @returns a boolean indicating if the game should end after the given turn
     */
    completeTurn(turn: TurnAction): boolean {
        let gameShouldEndAfterTurn = false;
        if (!this.isTurnLegal(turn)) {
            throw new Error("Turn is not legal");
        }

        if (turn.turnType === TurnType.PLACE) {
            const allTilesPlaced = this.completePlaceTurn(turn.tilePlacements);
            gameShouldEndAfterTurn = allTilesPlaced;
        } else if (turn.turnType === TurnType.EXCHANGE) {
            this.completeExchangeTurn();
        }

        return gameShouldEndAfterTurn;
    }

    /**
     * Advances the game to the next player
     */
    advance() {
        this.order.advance();
    }

    /**
     * Determines the score that the given placements should receive, assuming legality
     *
     * @param placements the placements to calculate the score for
     * @returns the score from those given placements
     */
    calculateScoreForPlaceTurn(placements: Placement[]) {
        return this.rulebook.scoreMove(
            placements,
            this.board,
            this.getActivePlayerState().hand.length
        );
    }

    /**
     * Removes the given player ID from the game. If the player is the current player,
     * the game will advance to the next possible player. The player's tiles will be added
     * to the pool of referee tiles.
     * EFFECTS: advance the turn order if the remove player is the current active one
     * @param playerId the id of the player to remove
     */
    removePlayer(playerId: string) {
        const playerState = this.getPlayerState(playerId);
        this.eliminatedPlayers.push(playerId);
        this.order.removeItem(playerId);
        this.addToRefTiles(playerState.hand);
    }

    /**
     * Returns the list of eliminated players in the order in which they got kicked out
     * @returns a list of eliminated players' IDs
     */
    getEliminatedPlayers() {
        return [...this.eliminatedPlayers];
    }

    /**
     * Returns the active player's ID
     */
    getActivePlayerId() {
        return this.order.currentItem.playerId;
    }

    /**
     * Adds the given list of tiles to the end of the tile pool
     * @param tiles
     */
    private addToRefTiles(tiles: Tile[]) {
        this.tilePouch.addTiles(tiles);
    }

    /**
     * Get the player state of the given ID
     * @param playerId
     * @returns the player state, including public information for that player
     * @throw error if the given player id is not found
     */
    private getPlayerState(playerId: string) {
        const playerStates = this.order.toArrayFromHead();
        const playerState = playerStates.find((playerState) => playerState.playerId === playerId);
        if (playerState === undefined) {
            throw new Error(`Cannot find associated player data for player ID ${playerId}`);
        }
        return playerState;
    }

    /**
     * Retrieves a given number of tiles from the tile pool
     * @param numTiles the number of tiles to take from the pouch
     * @returns the number of tiles you want, or as many as are left in the pouch
     */
    private getTilesFromPouch(numTiles: number) {
        if (numTiles > this.tilePouch.getNumberOfTiles()) {
            return this.tilePouch.takeMany(this.tilePouch.getNumberOfTiles());
        }

        return this.tilePouch.takeMany(numTiles);
    }

    /**
     * Helper to get the active player state
     * @returns
     */
    private getActivePlayerState() {
        return this.getPlayerState(this.getActivePlayerId());
    }

    /**
     * completes a place turn by adding the tiles to the board, removing them from the players hand, and adding new tiles to the players hand.
     *
     * @param turn the turn to complete
     * @throws a Error if a player does not have the tiles to complete the turn.
     * @returns whether the player used all of their tiles
     */
    private completePlaceTurn(placements: Placement[]): boolean {
        let playerUsedAllHands = false;
        const playerId = this.order.currentItem.playerId;
        for (let placement of placements) {
            this.board = this.board.addTile(placement.coordinate, placement.tile);
        }
        const tilesToRemove = placements.map((placement) => placement.tile);
        this.removeTilesFromPlayer(playerId, tilesToRemove);

        const score = this.calculateScoreForPlaceTurn(placements);
        const playerState = this.getPlayerState(playerId);
        playerState.addScore(score);
        if (playerState.isHandEmpty()) {
            playerUsedAllHands = true;
        }
        this.replaceTilesForPlayer(playerId, tilesToRemove.length);
        return playerUsedAllHands;
    }

    /**
     * Helper to complete an exchange turn
     */
    private completeExchangeTurn() {
        const playerId = this.order.currentItem.playerId;
        const player = this.getPlayerState(playerId);
        const tilesToReplace = player.hand;
        this.removeTilesFromPlayer(playerId, tilesToReplace);
        this.tilePouch.addTiles(tilesToReplace);
        this.replaceTilesForPlayer(playerId, tilesToReplace.length);
    }

    /**
     * Helper to replace tiles for player with the given ID and number of tiles to replace
     * @param playerId
     * @param tilesToRemove
     */
    private replaceTilesForPlayer(playerId: string, tilesToRemove: number) {
        const newTiles = this.getTilesFromPouch(tilesToRemove);
        this.addTilesToPlayer(playerId, newTiles);
    }

    /**
     * Helper to remove the given list of tiles from a player
     * @param playerId
     * @param tiles
     */
    private removeTilesFromPlayer(playerId: string, tiles: Tile[]) {
        const playerState = this.getPlayerState(playerId);
        for (let tile of tiles) {
            playerState.removeTile(tile);
        }
    }

    /**
     * Helper to add the given list of tiles from a player
     * @param playerId
     * @param tiles
     */
    private addTilesToPlayer(playerId: string, tiles: Tile[]) {
        const playerState = this.getPlayerState(playerId);
        playerState.addTiles(tiles);
    }

    /**
     * Converts the current game state to a corresponding json
     * @returns a jState
     */
    toJson(): JsonState {
        const map = this.board.toJson();
        const refTiles = this.tilePouch.toJson();
        const players = this.order.toArrayFromHead().map((playerState) => playerState.toJson());
        return { map, "tile*": refTiles, players };
    }

    /**
     * A factory class for creating a {@link GameState}.
     */
    static Factory = class {
        private board: ImmutableBoard;
        private playerStates: PlayerState[];
        private initialPlacement: Placement | undefined;
        private tilePouch: TilePouch | undefined;
        constructor() {
            this.board = new Board();
            this.playerStates = [];
        }

        setBoard(board: ImmutableBoard) {
            this.board = board;
            return this;
        }

        addPlayerState(playerState: PlayerState) {
            this.playerStates.push(playerState);
            return this;
        }

        setInitialPlacement(placement: Placement) {
            this.initialPlacement = placement;
            return this;
        }

        setTilePouch(tilePouch: TilePouch) {
            this.tilePouch = tilePouch;
            return this;
        }

        create(): GameState {
            const gameState = new GameState([], this.initialPlacement, 0);
            gameState.board = this.board;

            if (this.tilePouch) {
                gameState.tilePouch = this.tilePouch;
            }

            gameState.order = new Order(this.playerStates);

            return gameState;
        }
    };
}
