
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Generic transactional email sender using Brevo's HTTP API.
 * Uses fetch (built into Node 18+), so no new dependency needed.
 */
export const sendTransactionalEmail = async ({ toEmail, toName, subject, htmlContent }) => {
    if (!process.env.BREVO_API_KEY) {
        console.error("BREVO_API_KEY is missing from environment variables.");
        return { success: false, error: "Email service not configured." };
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "api-key": process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME || "Your Clinic",
                    email: process.env.BREVO_SENDER_EMAIL
                },
                to: [{ email: toEmail, name: toName || toEmail }],
                subject,
                htmlContent
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Brevo API error (${response.status}):`, errorBody);
            return { success: false, error: `Brevo API returned ${response.status}` };
        }

        const data = await response.json();
        console.log(`Email sent via Brevo to ${toEmail}. Message ID: ${data.messageId}`);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error(`Error sending email via Brevo to ${toEmail}:`, error);
        return { success: false, error: error.message };
    }
};