import { runMilestoneTests } from "../../Tasks/task-utils";
import { performXLegalTest } from "../../Tasks/xlegal";

runMilestoneTests("milestone 4 tests for xlegal", "4", performXLegalTest, [
    "1", // contains bad test where the board is not valid
]);
