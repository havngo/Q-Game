import { ImmutableBoard } from "../map";
import { PlayerState } from "../player-state";
import { JsonPub } from "./json";

/**
 * A representation of the data known in JsonPublicData as concrete
 * types used by the game
 */
export class PublicState {
    constructor(
        public readonly map: ImmutableBoard,
        public readonly tilesLeft: number,
        public readonly players: [PlayerState, ...number[]]
    ) {}

    toJson(): JsonPub {
        const [playerState, ...playerNumbers] = this.players;
        const jsonPlayer = playerState.toJson();
        return {
            map: this.map.toJson(),
            "tile*": this.tilesLeft,
            players: [jsonPlayer, ...playerNumbers],
        };
    }
}
