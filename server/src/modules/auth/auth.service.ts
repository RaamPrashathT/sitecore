import bcrypt from "bcryptjs";
import { User } from "../../shared/models/user.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import generateName from "../../shared/lib/fantastical.js";
import { createAccessToken, createRefreshToken } from "../../shared/lib/jose.js";

const AuthService = {
    async register(data: RegisterInput) {
        const existingUser = await User.findOne({email: data.email})

        if(existingUser) {
            const hasPasswordAccount = existingUser.accounts.some(account => account.provider === 'credentials')
            if(hasPasswordAccount) {
                throw new Error('EXISTS')
            }
            const hashedPassword = await bcrypt.hash(data.password, 10)
            await User.findOneAndUpdate(
                {email: data.email},
                {
                    $push: {
                        accounts: {
                            provider: 'credentials',
                            providerAccountId: data.email,
                            password: hashedPassword
                        }
                    }
                }
            )
            return { message: "LINKED"}
        }

        const randomName = generateName()
        const hashedPassword = await bcrypt.hash(data.password, 10)
        await User.create({
            username: randomName,
            email: data.email,
            accounts: [{
                provider: "credentials",
                providerAccountId: data.email,
                password: hashedPassword
            }]
        })
        return { message: "CREATED" };
    },

    async login(data: LoginInput) {
        const existingUser = await User.findOne({email: data.email})

        if(!existingUser) {
            throw new Error('INVALID')
        }

        const password = existingUser.accounts.find(account => account.provider === 'credentials')?.password

        if(!password) {
            throw new Error('INVALID')
        }
        const isPasswordCorrect = await bcrypt.compare(data.password,password)
        if(!isPasswordCorrect) {
            throw new Error('INVALID')
        }
        const accessToken = await createAccessToken({
            userId: existingUser.id,
            email: existingUser.email,
            tokenType: "access",
        });

        const refreshToken = await createRefreshToken({
            userId: existingUser.id,
            email: existingUser.email,
            tokenType: "refresh",
        });

        return { accessToken, refreshToken };

    }
}

export default AuthService;