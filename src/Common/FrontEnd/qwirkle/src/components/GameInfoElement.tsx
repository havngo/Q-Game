import { GameInfo } from "../util";
import Board from "./Board";
import PlayerInfo from "./PlayerState";
import "../style/GameInfoElement.css";

export interface GameInfoElementProps {
    gameInfo: GameInfo;
}

function GameInfoElement({ gameInfo }: GameInfoElementProps) {
    return (
        <div>
            <div className="playerInfoContainer">
                {gameInfo.players.map((player) => (
                    <PlayerInfo playerState={player} />
                ))}
            </div>
            <div className="gameInfoBoard">
                <Board boardData={gameInfo.map} />
            </div>
        </div>
    );
}

export default GameInfoElement;
