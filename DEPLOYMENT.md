# Vercel + Render deployment

The frontend uses a same-origin Vercel function at `/api/*`. The function proxies
requests to Render, so browser sessions do not rely on third-party cookies and
normal production traffic does not need cross-origin requests.

## Render

Set the service root directory to `server`, build command to `npm ci && npm run build`,
start command to `npm start`, and health check path to `/health`.

Copy the variables listed in `server/.env.example` into Render. Use the real Vercel
production URL for both `CLIENT_ORIGIN` and `FRONTEND_URL`. `PORT` should be left to
Render. `RESEND_API_KEY` is optional for this demo; email sends fail gracefully without it.

## Vercel

Set the project root directory to `client`. Add one server-side environment variable:

- `BACKEND_URL=https://sitecore-asho.onrender.com`

The frontend production build always uses `/api`, so `VITE_API_URL` is ignored on
Vercel. The proxy also defaults to the current Render URL, making `BACKEND_URL` optional.
Cloudinary variables are only needed for image uploads.

## Google OAuth

Set `GOOGLE_REDIRECT_URI` on Render to:

`https://sitecore-eta.vercel.app/api/auth/google/callback`

Add that exact URL to the Google OAuth client's authorized redirect URIs. This keeps the
session cookie on the Vercel site even though Express runs on Render.

After both services deploy, verify `/health`, registration/login, a page refresh while
logged in, and a deep link such as `/organizations`.
