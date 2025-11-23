import twilio from 'twilio';

// Use a variable to hold the client
let twilioClient = null;

// Initialize the client on demand or lazily
const initializeTwilio = () => {
    if (twilioClient) return twilioClient;

    // 1. Get credentials (Ensure they are defined in .env)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
        console.error("TWILIO SETUP FAILED: Credentials missing in environment variables.");
        // We still need to return a client, even a mock one, to prevent crashes.
        return { messages: { create: () => Promise.resolve({ sid: 'MOCK_SID' }) } };
    }

    // 2. Initialize the client (This can be synchronous, but we control WHEN it runs)
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
};


export const sendSMS = async (toPhoneNumber, messageBody) => {
    console.log("in the phine");
    const client = initializeTwilio();
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (client.messages.create.toString().includes('MOCK_SID')) {
        console.log(`[MOCK SMS SEND] To: ${toPhoneNumber}, Message: ${messageBody}`);
        return;
    }

    try {
        const message = await client.messages.create({
            body: messageBody,
            from: twilioNumber,
            to: toPhoneNumber,
        });
        console.log(`Twilio message sent successfully. SID: ${message.sid}`);
    } catch (error) {
        console.error("Error sending SMS via Twilio:", error.message);
        // Continue application flow, but log failure
    }
};