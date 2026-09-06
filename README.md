# MediConnect 🩺

A full-stack doctor appointment booking platform with rule-based scheduling, payment-gated slot locking, and AI-powered nutrition guidance.

## Features

### Appointment Booking
- **Rule-based availability** — doctors set working hours, breaks, consultation duration, and buffer time; bookable slots are generated automatically rather than picked from a fixed list
- **Buffer enforcement** — configurable gap between consecutive appointments, validated both at slot-generation time and at booking time
- **Concurrency-safe booking** — a MongoDB unique partial index prevents two patients from ever double-booking the same doctor/date/slot, even under simultaneous requests
- **Payment-gated slot holds** — selecting a slot creates a temporary hold (TTL-based auto-expiry) so no one else can take it while payment is in progress
- **Reason for visit** captured at booking time

### Payments
- **Razorpay integration** — order creation, Checkout, and signature-verified payment confirmation
- **Webhook support** — server-to-server payment confirmation as the source of truth, independent of client-side callbacks
- Automatic hold release if payment fails, is abandoned, or times out

### Authentication
- Separate email/password authentication for **patients** and **doctors**, with distinct JWT cookies
- Forgot-password flow with time-limited, hashed reset tokens emailed via Brevo

### Notifications
- Transactional email (booking confirmations, password resets) via **Brevo's HTTP API** — chosen for reliable delivery on hosts that block outbound SMTP ports

### AI Nutrition Planner
- 7-day personalized nutrition plan generation via **Google Gemini**
- Interactive nutrition chatbot
- Daily health insight widget on the homepage
- Retry-with-backoff handling for transient AI service overload, with graceful fallback content

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, Express |
| Database | MongoDB, Mongoose |
| Templating | EJS + static HTML |
| Styling | Tailwind CSS |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Payments | Razorpay |
| Email | Brevo (Sendinblue) API |
| AI | Google Gemini (`@google/genai`) |

## Project Structure

```
├── controller/          # Route handlers (booking, auth, payments, AI, etc.)
├── middleware/          # JWT verification, role restriction
├── mongoose modules/    # Mongoose schemas (patient, doctor, appointment, etc.)
├── routes/              # Express routers
├── utils/               # Slot generation, buffer logic, email sending, Gemini retry wrapper
├── public/html/         # Static HTML pages (dashboards, forms, booking UI)
├── views/                # EJS templates (AI nutrition pages)
└── app.js               # App entry point
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Auth
ACCESS_TOKEN_SECRET=your_jwt_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxx

# Brevo (transactional email)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=your-verified-sender@yourdomain.com
BREVO_SENDER_NAME=Your Clinic

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-3.6-flash

# App
FRONTEND_BASE_URL=http://localhost:3000
```

> **Note:** `GEMINI_MODEL_NAME` is intentionally configurable — Gemini model versions are retired frequently, so this can be updated without a code change or redeploy.

## Setup

```bash
# Install dependencies
npm install

# Start the server
node app.js
```

The app will be available at `http://localhost:3000` (or your configured `PORT`).

## Payment Flow

1. Patient selects an available slot and provides a reason for visit
2. Backend validates the slot against the doctor's rules and creates a temporary hold (`pending_payment` status, TTL-based expiry) alongside a Razorpay order
3. Patient completes payment via Razorpay Checkout
4. On success, the appointment is confirmed via signature-verified frontend callback **and** a server-to-server webhook (whichever arrives first; both are idempotent)
5. If payment fails or the hold expires, the slot is automatically released — no manual cleanup required

## Deployment Notes

- Ensure all environment variables above are set on your hosting platform's dashboard — `.env` files are not read automatically in most production environments
- Register your **live** Razorpay webhook URL (`https://yourdomain.com/api/webhooks/razorpay`) separately from test mode once KYC is complete
- Verify your Brevo sender email/domain before going live — unverified senders will silently fail to send
- Confirm MongoDB Atlas Network Access allows connections from your host's IP range

## License

This project is provided as-is for educational/portfolio purposes.
