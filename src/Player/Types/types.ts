import { Placement, TurnType } from "../../Common/turn";

export type TurnAction =
    | {
          turnType: Exclude<TurnType, TurnType.PLACE>;
      }
    | {
          turnType: TurnType.PLACE;
          tilePlacements: Placement[];
      };
      