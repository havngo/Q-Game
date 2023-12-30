import { runJsonTests } from "./task-utils";
import { performXGamesTest } from "../../Tasks/xgames";

runJsonTests("7/Tests", 10, performXGamesTest);
