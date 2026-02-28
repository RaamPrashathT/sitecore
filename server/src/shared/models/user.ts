import { model, Schema, type Document } from "mongoose";

export interface IAccount {
    provider: "credentials" | "google";
    providerAccountId: string;
    password?: string;
}

export interface IUser extends Document {
    username: string;
    email: string;
    emailVerified: boolean;
    profileImage?: string;
    accounts: IAccount[];
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

export const User = model<IUser>("User", UserSchema);
