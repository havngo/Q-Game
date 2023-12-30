import { runJsonTests } from "./task-utils";
import { performXStrategyTest } from "../../Tasks/xstrategy";

runJsonTests("6/Tests", 5, performXStrategyTest);
