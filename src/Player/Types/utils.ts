const worker_threads = require("worker_threads");
import { Worker } from "worker_threads";

let worker;
/**
 * Enters an infinite loop.
 */
const byeBye = () => {
    if (worker_threads.isMainThread) {
        worker = worker_threads.Worker(__filename, { workerData: { action: "byeBye" } });
        worker.on("error", function (e: Error) {});
    } else {
        while (true) {}
    }
};

export default byeBye;
