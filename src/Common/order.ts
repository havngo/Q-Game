import { AtLeastOne } from "./Types/types";
import { PlayerState } from "./player-state";

/**
 * Represents a cyclic order of player states, which can be empty or non-empty.
 */
export class Order {
    /**
     * The data inside the order, which ought to contain one sentinel node
     * and then the player states in the order.
     */
    private data: AtLeastOne<PlayerState | Sentinel>;

    /**
     * Constructs an order with the given players states, in the given order.
     *
     * @param playerStates the states of the players in the order
     */
    constructor(playerStates: PlayerState[]) {
        this.data = [new Sentinel(), ...playerStates];
    }

    /**
     * Determines the size of the current order.
     */
    get size(): number {
        return this.data.length - 1;
    }

    /**
     * Determines the current item in the order.
     * @throws if the order is empty or is currently at the sentinel
     */
    get currentItem(): PlayerState {
        const current = this.data[0];
        if (current instanceof Sentinel) {
            throw new Error("Cannot retrieve the sentinel as a value");
        }
        return current;
    }

    /**
     * Determines whether the order is at its starting sentinel.
     *
     * @returns a boolean which is true if the order is at its starting point
     */
    isNewRound() {
        return this.data[0] instanceof Sentinel;
    }

    /**
     * Removes the given player state from the order.
     *
     * @param playerId the id of the player to remove from the order
     * @throws if given an id that is not in the order
     */
    removeItem(playerId: string) {
        const index = this.data.findIndex((playerState) => {
            if (playerState instanceof Sentinel) {
                return false;
            }
            return playerState.playerId === playerId;
        });
        if (index === -1) {
            throw new Error("Cannot remove item that is not in the order");
        }
        this.data.splice(index, 1);
    }

    /**
     * Returns an array representation of the order counting from the head.
     * This represents the original order of the players.
     *
     * @returns an array representation of the order
     */
    toArrayFromHead(): PlayerState[] {
        const sentinelIndex = this.data.findIndex((val) => val instanceof Sentinel);
        if (sentinelIndex === -1) {
            throw new Error("Order must contain a sentinel node");
        }
        return Order.ensureNoSentinel([
            ...this.data.slice(sentinelIndex + 1),
            ...this.data.slice(0, sentinelIndex),
        ]);
    }

    /**
     * Returns an array representation of the order counting for the current position.
     * This represents the order of the players currently.
     *
     * @returns an array representation of the order
     */
    toArrayFromCurrent(): PlayerState[] {
        return Order.ensureNoSentinel(this.data);
    }

    /**
     * Advances the order to the next player or sentinel.
     */
    advance() {
        this.data = [...this.data.slice(1), this.data[0]];
    }

    private static ensureNoSentinel(arr: (PlayerState | Sentinel)[]): PlayerState[] {
        return arr.filter(
            (playerState): playerState is PlayerState => playerState instanceof PlayerState
        );
    }
}

/**
 * Represents an empty sentinel node with no data.
 */
class Sentinel {}
