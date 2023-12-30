import { Readable } from "stream-json/Parser";
import { JsonAction, JsonPub, JsonStrategy } from "../Common/Types/json";
import { readInputFrom } from "./task-utils";
import { JsonBuilder } from "../Common/Json/json-builder";
import { TurnType } from "../Common/turn";
import { GameState } from "../Referee/game-state";
import { arrayToBag } from "../Common/Utils/utils";

export async function xstrategy() {
    const testResults = await performXStrategyTest(process.stdin);
    console.log(JSON.stringify(testResults));
}

export async function performXStrategyTest(inputStream: Readable): Promise<JsonAction> {
    const [arg1, arg2] = await readInputFrom(inputStream, 2);
    const [jPub, jStrategy]: [JsonPub, JsonStrategy] =
        arg1["tile*"] === undefined ? [arg2, arg1] : [arg1, arg2];
    const board = JsonBuilder.toBoard(jPub.map);
    const tiles = jPub.players[0]["tile*"].map((jsonTile) => JsonBuilder.toTile(jsonTile));
    const numTilesRemaining = jPub["tile*"];
    const bag = arrayToBag(tiles);

    const playerId = "TEST CASE PLAYER ID YUHHHHH 💯💯🔥🥶💰💸💪💪";
    const playerState = JsonBuilder.toPlayerState(jPub.players[0], playerId);
    const gameStateFactory = new GameState.Factory();
    const gameState = gameStateFactory.setBoard(board).addPlayerState(playerState).create();

    const strategy = JsonBuilder.toStrategy(jStrategy);
    const action = strategy.getNextTurnType(bag, numTilesRemaining, board);
    switch (action) {
        case TurnType.PASS:
            return "pass";
        case TurnType.EXCHANGE:
            return "replace";
        case TurnType.PLACE:
            const { coordinate, tile } = strategy.getPlacement(bag, board).value;
            return { coordinate: coordinate.toJson(), "1tile": tile.toJson() };
    }
}
