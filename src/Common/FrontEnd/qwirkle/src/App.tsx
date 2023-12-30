import { useEffect, useState } from "react";
import "./App.css";
import { getJsonStates } from "./api";
import Observer from "./components/Observer";
import { GameInfo, deserializeJsonState } from "./util";

function App() {
    const [gameInfoList, setGameInfoList] = useState<GameInfo[]>([]);

    useEffect(() => {
        async function fetchData() {
            const jsonStateData = await getJsonStates();
            const gameInfoData = jsonStateData.map(deserializeJsonState);
            setGameInfoList(gameInfoData);
        }

        fetchData();
    }, []);

    if (gameInfoList.length > 0) {
        return <Observer states={gameInfoList} />;
    } else {
        return <div>Loading...</div>;
    }
}

export default App;
