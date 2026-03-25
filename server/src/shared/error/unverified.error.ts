export class UnverifiedError extends Error {
    constructor(message = "Email not verified") {
        super(message);
        this.name = "UnverifiedError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnverifiedError);
        }
    }
}