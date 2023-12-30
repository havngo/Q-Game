import { runJsonTests } from "./task-utils";
import { performXLegalTest } from "../../Tasks/xlegal";

runJsonTests("4/Tests", 5, performXLegalTest);
