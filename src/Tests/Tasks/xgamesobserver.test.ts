import { runJsonTests } from "./task-utils";
import { performXGameWithObserverTest } from "../../Tasks/xgames-with-observer";

runJsonTests("8/Tests", 10, performXGameWithObserverTest);
