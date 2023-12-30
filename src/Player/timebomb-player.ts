import { JsonExn, JsonActorSpecAll } from "../Common/Types/json";
import { JsonBuilder } from "../Common/Json/json-builder";
import byeBye from "./Types/utils";
import { Player } from "./player";
import { IStrategy } from "./strategy";

/**
 * A player that will enter an infinite loop after a certain number of calls to a method.
 */
export class TimebombPlayer extends Player {
    /**
     * Creates a new timebomb player that will enter an infinite loop after a certain number of
     * calls to a method.
     *
     * @param name the name of the player
     * @param strategy the player's strategy
     * @param jExn the name of the method the player will enter the loop on
     * @param count the number of times the player will call the method before entering the loop
     */
    constructor(
        name: string,
        strategy: IStrategy,
        private readonly jExn: JsonExn,
        private count: number
    ) {
        super(name, strategy);
        const exceptionMethodName = JsonBuilder.toMethodOfPlayer(jExn);
        const regularMethod: (...args: any[]) => any = this[exceptionMethodName].bind(this);
        this[exceptionMethodName] = (...params: Parameters<typeof regularMethod>) => {
            if (this.count <= 1) {
                byeBye();
            } else {
                const output = regularMethod(...params);
                this.count--;
                return output;
            }
        };
    }

    toJson(): JsonActorSpecAll {
        return [this._name, this.strategy.toJson(), this.jExn, this.count];
    }
}
