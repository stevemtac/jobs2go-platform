# Environment Variables Setup Guide

This guide helps you configure all necessary environment variables for the Jobs2Go platform.

## 🔧 Required Environment Variables

### Application Configuration
\`\`\`env
NEXT_PUBLIC_APP_URL=https://your-live-app-url.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

### Database & Authentication
\`\`\`env
DATABASE_URL=your-database-connection-string
NEXTAUTH_URL=https://your-live-app-url.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
\`\`\`

### Synthetic Monitoring
\`\`\`env
SCREENSHOT_DIR=./synthetic-monitoring-results
SYNTHETIC_HEADLESS=true
TEST_USER_EMAIL=test-jobseeker@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_EMPLOYER_EMAIL=test-employer@example.com
TEST_EMPLOYER_PASSWORD=TestPassword123!
\`\`\`

### Monitoring Configuration
\`\`\`env
TIMEOUT_NAVIGATION=30000
TIMEOUT_ELEMENT=10000
TIMEOUT_ACTION=5000
TEST_RETRIES=2
SCHEDULE_ENABLED=true
SCHEDULE_INTERVAL_MINUTES=15
\`\`\`

### Notifications
\`\`\`env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SLACK_DEFAULT_CHANNEL=#alerts
ALERT_EMAIL_RECIPIENTS=admin@example.com
\`\`\`

### Screenshot Management
\`\`\`env
RETAIN_SCREENSHOTS=false
SCREENSHOT_RETENTION_DAYS=7
\`\`\`

## 🚀 Setup Instructions

### 1. Local Development
1. Copy `.env.example` to `.env`
2. Fill in your actual values
3. Run `npm run verify:env` to validate

### 2. Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all variables from the list above
4. Set appropriate targets (Production, Preview, Development)

### 3. Automated Setup
Run the setup script:
\`\`\`bash
chmod +x scripts/deploy-with-env.sh
./scripts/deploy-with-env.sh
\`\`\`

## 🔍 Verification

After setup, verify your configuration:
\`\`\`bash
npm run verify:env
\`\`\`

## 📋 Environment Variable Checklist

- [ ] Application URLs configured
- [ ] Database connection working
- [ ] Authentication secrets set
- [ ] Test user accounts created
- [ ] Monitoring timeouts configured
- [ ] Notification channels set up
- [ ] Screenshot settings configured
- [ ] All variables verified

## 🆘 Troubleshooting

### Common Issues:
1. **Build failures**: Check NEXT_PUBLIC_APP_URL format
2. **Database errors**: Verify DATABASE_URL connection string
3. **Auth issues**: Ensure NEXTAUTH_SECRET is set
4. **Monitoring failures**: Check test user credentials

### Getting Help:
- Check deployment logs in Vercel dashboard
- Run `npm run verify:env` for validation
- Review error messages in monitoring dashboard
