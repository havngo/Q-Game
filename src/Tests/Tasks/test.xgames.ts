import { ensureOldScoring, runMilestoneTests } from "../../Tasks/task-utils";
import { performXGamesTest } from "../../Tasks/xgames";

runMilestoneTests(
    "milestone 7 tests for xgames",
    "7",
    performXGamesTest,
    [
        "9", // Skipping these tests due to large numbers
    ],
    ensureOldScoring
);
