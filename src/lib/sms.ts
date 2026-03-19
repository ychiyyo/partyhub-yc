import twilio from "twilio";

interface SMSOptions {
  to: string;
  body: string;
}

export async function sendSMS({ to, body }: SMSOptions) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  // If not configured, log to console for development
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("⚠️ Twilio credentials not configured. Logging SMS instead:");
    console.log(`To: ${to}\nMessage: ${body}`);
    return { success: true, fake: true };
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to,
    });

    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}
