export class UnAuthorizedError extends Error {
    constructor(message: string = "Invalid email or password") {
        super(message);
        this.name = "UnAuthorizedError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnAuthorizedError);
        }
    }
}