import type { Request, Response } from "express";
import crypto from 'node:crypto';
import redis from "../../../shared/lib/redis.js";

export const OAuthController = {
    async google(request: Request, response: Response) {
        const state = crypto.randomBytes(64).toString('hex');
        const codeVerifier = crypto.randomBytes(64).toString('base64url');
        
        const codeChallenge = crypto.
            createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');
        
        await redis.set(`oauth_state:${state}`, codeVerifier, { ex: 600 });

        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: ['openid', 'email', 'profile'].join(' '),
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        };

        const qs = new URLSearchParams(options).toString();

        return response.redirect(`${rootUrl}?${qs}`);
    }
}