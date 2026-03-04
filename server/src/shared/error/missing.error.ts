export class MissingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MissingError";

        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, MissingError);
        }
    }
}