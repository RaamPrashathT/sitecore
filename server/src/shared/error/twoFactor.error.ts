export class TwoFactorRequiredError extends Error {
    public tempToken: string;
    constructor(tempToken: string) {
        super("2FA Required");
        this.name = "TwoFactorRequiredError";
        this.tempToken = tempToken;
    }
}