import "react";
import { useState } from "react";
import { GameInfo, serializeGameInfo } from "../util";
import GameInfoElement from "./GameInfoElement";

export interface ObserverProps {
    states: GameInfo[];
}

function Observer({ states }: ObserverProps) {
    const [currentState, setCurrentState] = useState(0);

    function downloadGameInfo() {
        const currentGameInfo = states[currentState];
        const serializedInfo = serializeGameInfo(currentGameInfo);
        const serializedString = JSON.stringify(serializedInfo);
        const file = new Blob([serializedString], { type: "application/json" });
        const aElem = document.createElement("a");
        aElem.href = URL.createObjectURL(file);
        aElem.download = `game-state-${currentState}.json`;
        aElem.click();
    }

    return (
        <div>
            <button
                onClick={() => setCurrentState(currentState + 1)}
                disabled={currentState >= states.length - 1}
            >
                Next
            </button>
            <button onClick={() => setCurrentState(currentState - 1)} disabled={currentState <= 0}>
                Previous
            </button>
            <button onClick={downloadGameInfo} disabled={!states[currentState]}>
                Save
            </button>
            {states[currentState] && <GameInfoElement gameInfo={states[currentState]} />}
        </div>
    );
}

export default Observer;
