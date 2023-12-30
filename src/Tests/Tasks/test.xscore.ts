import { ensureOldScoring, runMilestoneTests } from "../../Tasks/task-utils";
import { performXScoreTest } from "../../Tasks/xscore";

runMilestoneTests(
    "milestone 5 tests for xscore",
    "5",
    performXScoreTest,
    [
        "grade-first-run", // contains broken tests
        "1", // contains a bad test where two placements overlap
    ],
    ensureOldScoring
);
