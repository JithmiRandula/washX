# Email Configuration Guide for WashX

## How to Set Up Email Sending (Gmail)

The password reset feature sends emails to users. Follow these steps to configure Gmail SMTP:

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Find **2-Step Verification** and turn it ON
4. Follow the prompts to set it up

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **WashX Backend**
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update Backend .env File

Open `backend/.env` and update these values:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (the app password from step 2)
EMAIL_FROM=your-actual-email@gmail.com
EMAIL_FROM_NAME=WashX
```

### Step 4: Restart Backend Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### Step 5: Test Email

1. Go to: http://localhost:5173/forgot-password
2. Enter a test email address (one that exists in database)
3. Check that email inbox for the reset link

---

## Alternative Email Services

### Using Other Gmail Accounts
- Follow the same steps above with any Gmail account
- Make sure 2FA is enabled and app password is generated

### Using Outlook/Hotmail
Update `.env` with:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Using Custom SMTP Server
Update `.env` with your SMTP server details:
```env
EMAIL_HOST=smtp.yourserver.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

---

## Troubleshooting

### "Email not configured" message
- Make sure you've updated `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Restart the backend server after changing `.env`

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Factor Authentication is enabled on your Google account

### Emails not arriving
- Check spam/junk folder
- Verify the email address exists in the database
- Check backend console for email sending errors

### "Less secure app access" error
- Use App Password instead (see Step 2)
- Don't enable "Less secure app access" - it's not secure!

---

## Development Mode

If email is not configured, the system will:
- Still generate and save the reset token
- Return the reset link in the API response
- Show the link on the frontend for testing

This allows you to test the password reset feature without configuring email.

---

## Production Deployment

For production, consider using:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (pay as you go, very cheap)

These services are more reliable and have better deliverability than Gmail SMTP.
