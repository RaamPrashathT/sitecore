import mongoose, { Schema, type Document } from "mongoose";

export interface IAccount {
  provider: "credentials" | "google";
  providerAccountId: string;
  password?: string | null;
}

export interface IUser extends Document {
  username: string;
  email: string;
  emailVerified: boolean;
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
      default: null,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    accounts: {
      type: [AccountSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);