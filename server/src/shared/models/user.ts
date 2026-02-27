import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    role: "USER" | "SUPERADMIN";
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, enum: ["USER", "SUPERADMIN"], default: "USER" },
        image: { type: String },
    },
    {
        timestamps: true,
    },
);

export interface IAccount extends Document {
    userId: mongoose.Types.ObjectId;
    provider: "credentials" | "google";
    providerAccountId: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        provider: {
            type: String,
            enum: ["credentials", "google"],
            required: true,
        },
        providerAccountId: { type: String, required: true },
        password: { type: String },
    },
    {
        timestamps: true,
    },
);

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const User = mongoose.model<IUser>("User", UserSchema);
export const Account = mongoose.model<IAccount>("Account", AccountSchema);
