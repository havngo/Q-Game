import { JsonState } from "../../../Types/json";
import { JsonBuilder } from "../../../Json/json-builder";
import { ImmutableBoard } from "../../../map";
import { PlayerState } from "../../../player-state";
import { Tile } from "../../../tile";

export interface GameInfo {
    map: ImmutableBoard;
    refTiles: Tile[];
    players: PlayerState[];
}

export function deserializeJsonState(json: JsonState): GameInfo {
    return {
        map: JsonBuilder.toBoard(json.map),
        refTiles: json["tile*"].map((jTile) => JsonBuilder.toTile(jTile)),
        players: json.players.map((jPlayer) => JsonBuilder.toPlayerState(jPlayer, jPlayer.name)),
    };
}

export function serializeGameInfo({ map, refTiles, players }: GameInfo): JsonState {
    return {
        map: map.toJson(),
        "tile*": refTiles.map((tile) => tile.toJson()),
        players: players.map((player) => player.toJson()),
    };
}
