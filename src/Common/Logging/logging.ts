export class SimpleLogging {
    private verbose: boolean = false;

    constructor(private header: string = 'VERBOSE') {}

    setVerbose(val: boolean) {
        this.verbose = val
    }

    log(msg: string) {
        this.write("log", msg)
    }

    warn(msg: string) {
        this.write("warn", msg)
    }

    error(e: Error) {
        this.write("error", e.message);
    }

    private write(type: string, msg: string) {
        if (this.verbose) {
            console.log(`${new Date().toLocaleTimeString()} ${this.header} ${type}: ${msg}`);
        }
    }
}