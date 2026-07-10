import { Resend } from "resend";
import { env } from "../config/env.js";

// Email is optional for the demo. A placeholder keeps the API bootable when no
// Resend account is configured; send helpers already catch and log API errors.
export const resend = new Resend(env.RESEND_API_KEY ?? "re_not_configured");
