import { model, Schema, Types, type Document } from "mongoose";

export interface IAccount {
    provider: "credentials" | "google";
    providerAccountId: string;
    password?: string;
}

export interface IUser extends Document {
    username: string;
    email: string;
    emailVerified: boolean;
    onboarded: boolean;
    phone?: string;
    profileImage?: string;
    accounts: IAccount[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IVerificationToken extends Document {
    userId: Types.ObjectId;
    token: string;
    otpHash: string;
    email: string;
    expiresAt: Date;
}

export interface IPasswordResetToken extends Document {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
}

export interface ITwoFactorAuth extends Document {
    userId: Types.ObjectId;
    secret: string;
    isEnabled: boolean;
    backupCodes: string[];
    createdAt: Date;
    updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
    {
        provider: {
            type: String,
            enum: ["credentials", "google"],
            required: true,
        },
        providerAccountId: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            select: false,
        },
    },
    { _id: false },
);

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: { type: String },
        onboarded: { type: Boolean, default: false },
        emailVerified: { type: Boolean, default: false },
        profileImage: { type: String },
        accounts: [AccountSchema],
    },
    { timestamps: true },
);

UserSchema.index(
    { "accounts.provider": 1, "accounts.providerAccountId": 1 },
    { unique: true },
);

const VerificationTokenSchema = new Schema<IVerificationToken>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    otpHash: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    expiresAt: { type: Date, required: true },
});

VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationTokenSchema.index({ userId: 1 }, { unique: true });

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
});

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TwoFactorAuthSchema = new Schema<ITwoFactorAuth>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        secret: { type: String, required: true },
        isEnabled: { type: Boolean, default: false },
        backupCodes: [{ type: String }],
    },
    { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
export const VerificationToken = model<IVerificationToken>("VerificationToken", VerificationTokenSchema);
export const PasswordResetToken = model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
export const TwoFactorAuth = model<ITwoFactorAuth>("TwoFactorAuth", TwoFactorAuthSchema);