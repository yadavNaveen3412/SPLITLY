import { OAuth2Client } from "google-auth-library";
import { AppError } from "./AppError.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export async function verifyGoogleIdToken(idToken) {
  if (!client) {
    throw new AppError(
      503,
      "AUTH_PROVIDER_UNAVAILABLE",
      "Google Sign-In is not configured",
    );
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid Google Authentication token",
    );
  }
}
