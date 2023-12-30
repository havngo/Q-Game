import { Readable } from "stream";
import { JsonState, JsonActors } from "../Common/Types/json";
import { hasCommandLineArg, readInputFrom } from "./task-utils";
import { JsonBuilder } from "../Common/Json/json-builder";
import { runGame } from "../Referee/referee";
import { SyncObserver } from "../Referee/observer";

export async function xgamesWithObserver() {
    const testResults = await performXGameWithObserverTest(process.stdin);
    console.log(JSON.stringify(testResults));
}

export async function performXGameWithObserverTest(
    inputStream: Readable
): Promise<[string[], string[]]> {
    const testInput = await readInputFrom(inputStream, 2);
    const [jState, jActors] = testInput as [JsonState, JsonActors];
    const gameState = JsonBuilder.toGameState(jState);
    const players = jActors.map((actor) => JsonBuilder.toPlayer(actor));
    const observer = hasCommandLineArg("-show") ? new SyncObserver() : undefined;
    const { winners, cheaters } = await runGame(players, gameState, observer);
    return [winners.sort(), cheaters];
}
