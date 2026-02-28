export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";

        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, ConflictError);
        }
    }
}