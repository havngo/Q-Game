import { Readable } from "stream";
import { JsonState, JsonActors } from "../Common/Types/json";
import { readInputFrom } from "./task-utils";
import { JsonBuilder } from "../Common/Json/json-builder";
import { runGame } from "../Referee/referee";

export async function xbaddies() {
    const testResults = await performXBaddiesTest(process.stdin);
    console.log(JSON.stringify(testResults));
}

export async function performXBaddiesTest(inputStream: Readable): Promise<[string[], string[]]> {
    const testInput = await readInputFrom(inputStream, 2);
    const [jState, jActors] = testInput as [JsonState, JsonActors];
    const gameState = JsonBuilder.toGameState(jState);
    const players = jActors.map((actor) => JsonBuilder.toPlayer(actor));
    const { winners, cheaters } = await runGame(players, gameState);
    return [winners.sort(), cheaters];
}
