# Free Portfolio Deployment

This deployment is intended for a non-commercial portfolio demo:

- Next.js frontend and BFF: Vercel Hobby
- Spring Boot API: Koyeb Free Instance
- PostgreSQL: Neon Free
- Uploads: Cloudinary
- Email: Resend
- Payments: Stripe test mode only

The Koyeb free service scales to zero after inactivity, so the first request can
take longer. Do not use this setup for live payments or production traffic.

## 1. Create Neon PostgreSQL

1. Create a Neon Free project in Frankfurt.
2. Copy the connection details into the Koyeb variables below.
3. Convert the connection URL to JDBC format and retain `sslmode=require`:

   `jdbc:postgresql://<host>/<database>?sslmode=require`

Flyway runs automatically when the backend starts and loads the portfolio demo
data.

## 2. Deploy Spring Boot to Koyeb

Create a web service from this GitHub repository with:

- Work directory: `backend`
- Builder: Dockerfile
- Dockerfile: `Dockerfile`
- Region: Frankfurt
- Exposed port: `8080`
- Health check: HTTP `GET /actuator/health`

Set these environment variables:

```text
SPRING_PROFILES_ACTIVE=prod
PORT=8080
DATABASE_URL=jdbc:postgresql://<neon-host>/<database>?sslmode=require
DATABASE_USERNAME=<neon-user>
DATABASE_PASSWORD=<neon-password>
JWT_SECRET=<long-random-secret>
INTERNAL_API_SECRET=<long-random-secret-shared-with-vercel>
STRIPE_SECRET_KEY=<stripe-test-secret-key>
STRIPE_WEBHOOK_SECRET=<stripe-test-webhook-secret>
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL=FreelanceHub <onboarding@resend.dev>
EMAIL_DEV_OVERRIDE=<resend-account-owner-email>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
FRONTEND_URL=https://<vercel-project>.vercel.app
CORS_ALLOWED_ORIGINS=https://<vercel-project>.vercel.app
JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=70 -XX:+UseSerialGC
```

Generate the two application secrets independently, for example with
`openssl rand -base64 48`. Do not commit their values.

## 3. Deploy Next.js to Vercel

Import this GitHub repository into Vercel with:

- Framework preset: Next.js
- Root directory: `frontend`
- Node.js version: 22.x
- Function region: Frankfurt (`fra1`, also configured in `vercel.json`)

Set these environment variables:

```text
BACKEND_INTERNAL_URL=https://<koyeb-service>.koyeb.app/api/v1
INTERNAL_API_SECRET=<same-value-as-koyeb>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

After Vercel assigns the final URL, update `FRONTEND_URL` and
`CORS_ALLOWED_ORIGINS` on Koyeb and redeploy the backend.

## 4. Configure Stripe Test Webhook

Create a Stripe test-mode webhook endpoint:

`https://<koyeb-service>.koyeb.app/api/v1/payments/webhook`

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`
- `refund.created`
- `refund.updated`
- `refund.failed`
- `account.updated`

Copy its signing secret to Koyeb as `STRIPE_WEBHOOK_SECRET`.

## Demo Credentials

Flyway creates verified demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `admin123` |
| Client | `alice@example.com` | `password123` |
| Freelancer | `bob@example.com` | `password123` |

## Verification

1. Open `https://<koyeb-service>.koyeb.app/actuator/health` and confirm
   `{"status":"UP"}`.
2. Open the Vercel application and log in with all three demo roles.
3. Register an account and confirm the verification email reaches
   `EMAIL_DEV_OVERRIDE`.
4. Upload an image and confirm it loads from Cloudinary.
5. Complete a Stripe test checkout and confirm the webhook succeeds.
6. Redeploy Koyeb and confirm Neon data remains available.
7. After the backend sleeps, confirm the first application request recovers
   after the expected cold start.
