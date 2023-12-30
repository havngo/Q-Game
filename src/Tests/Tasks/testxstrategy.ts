import { ensureOldScoring, runMilestoneTests } from "../../Tasks/task-utils";
import { performXStrategyTest } from "../../Tasks/xstrategy";

runMilestoneTests(
    "milestone 6 tests for xstrategy",
    "6",
    performXStrategyTest,
    [],
    ensureOldScoring
);
