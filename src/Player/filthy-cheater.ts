import { JsonActorSpecAll, JsonCheat } from "../Common/Types/json";
import { Optional } from "../Common/Types/optional";
import { PublicState } from "../Common/Types/public-state";
import { TurnAction } from "./Types/types";
import { Player } from "./player";
import { IStrategy } from "./strategy";
import { CheatFunction } from "./cheat";

/**
 * Represents a player that will cheat in a particular way if possible.
 */
export class FilthyCheater extends Player {
    /**
     * Creates a player which will always try to cheat in the given way if possible.
     *
     * @param name the name of the player
     * @param strategy this player's strategy
     * @param cheatInfo the information about the cheat this player will attempt
     */
    constructor(
        name: string,
        strategy: IStrategy,
        private readonly cheatInfo: { cheatName: JsonCheat; cheat: CheatFunction }
    ) {
        super(name, strategy);
    }

    async takeTurn(publicState: PublicState): Promise<TurnAction> {
        const cheatTurn: Optional<TurnAction> = this.cheatInfo.cheat(publicState, this.strategy);
        if (cheatTurn.hasValue()) {
            return cheatTurn.value;
        }
        return super.takeTurn(publicState);
    }

    toJson(): JsonActorSpecAll {
        return [this._name, this.strategy.toJson(), "a cheat", this.cheatInfo.cheatName];
    }
}
