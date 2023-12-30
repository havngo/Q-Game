import { runMilestoneTests } from "../../Tasks/task-utils";
import { performXGameWithObserverTest } from "../../Tasks/xgames-with-observer";

runMilestoneTests("milestone 8 tests for xgames", "8", performXGameWithObserverTest, [
    "Tests", // excluding our tests because we forgot the name field
    "grade-first-run", // excluding tests from the first run
]);
