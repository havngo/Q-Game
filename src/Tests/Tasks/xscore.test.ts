import { runJsonTests } from "./task-utils";
import { performXScoreTest } from "../../Tasks/xscore";
import { GAME_STATE_CONSTANTS } from "../../Common/Types/constants";

const gc = GAME_STATE_CONSTANTS as any;
gc.Q_BONUS = 6;
gc.EMPTY_HAND_BONUS = 6;
runJsonTests("5/Tests", 5, performXScoreTest);
