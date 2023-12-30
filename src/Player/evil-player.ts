import { JsonActorSpecAll, JsonExn } from "../Common/Types/json";
import { JsonBuilder } from "../Common/Json/json-builder";
import { Player } from "./player";
import { IStrategy } from "./strategy";

/**
 * Represents an evil player which will throw exceptions.
 */
export class EvilPlayer extends Player {
    /**
     * Creates a new evil player that will throw an exception on the given method.
     *
     * @param name the name of the player
     * @param strategy the strategy of the player
     * @param jExn the string of the method to throw an exception on
     */
    constructor(name: string, strategy: IStrategy, private readonly jExn: JsonExn) {
        super(name, strategy);
        const exceptionMethod = JsonBuilder.toMethodOfPlayer(jExn);
        this[exceptionMethod] = () => {
            throw new Error(`Player ${name} threw an exception on method ${exceptionMethod}`);
        };
    }

    toJson(): JsonActorSpecAll {
        return [this._name, this.strategy.toJson(), this.jExn];
    }
}
