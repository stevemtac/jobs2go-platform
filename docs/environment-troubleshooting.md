# Environment Variables Troubleshooting Guide

## Common Issues and Solutions

### 1. Variables Not Accessible in Client Components

**Problem**: Environment variables are `undefined` in client-side React components.

**Solution**: 
- Only variables prefixed with `NEXT_PUBLIC_` are accessible in client components
- Server-only variables are not available in the browser for security reasons

\`\`\`typescript
// ❌ Won't work in client components
const dbUrl = process.env.DATABASE_URL

// ✅ Works in client components
const publicUrl = process.env.NEXT_PUBLIC_APP_URL
\`\`\`

### 2. Variables Not Available During Build

**Problem**: Environment variables are `undefined` during the build process.

**Solutions**:
- Ensure variables are set in Vercel dashboard under "Environment Variables"
- Check that variables are available for the correct environment (Production, Preview, Development)
- Verify variable names match exactly (case-sensitive)

### 3. Variables Work Locally But Not in Production

**Problem**: Environment variables work in development but fail in production.

**Solutions**:
- Add variables to Vercel dashboard, not just local `.env` file
- Ensure variables are set for "Production" environment in Vercel
- Redeploy after adding environment variables

### 4. Build-Time vs Runtime Variables

**Problem**: Some variables need to be available at build time, others at runtime.

**Solutions**:
- Build-time variables: Must be set in Vercel dashboard
- Runtime variables: Can be set in Vercel dashboard or through API
- Use `NEXT_PUBLIC_` prefix for variables needed in client-side code

## Verification Steps

### 1. Check Local Environment
\`\`\`bash
# Run environment check script
npm run check:env

# Or manually check
node -e "console.log(process.env.NEXT_PUBLIC_APP_URL)"
\`\`\`

### 2. Check Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Verify all required variables are present
4. Check they're enabled for the correct environments

### 3. Check Build Logs
1. Go to Vercel dashboard → Deployments
2. Click on latest deployment
3. Check "Build Logs" for environment-related errors
4. Look for missing variable warnings

### 4. Use Debug Panel
Visit `/debug/env` on your deployed application to see:
- Which variables are set
- Environment validation status
- Client vs server variable accessibility

## Environment Variable Checklist

### Required for Basic Functionality
- [ ] `NEXT_PUBLIC_APP_URL` - Your application URL
- [ ] `DATABASE_URL` - Database connection string
- [ ] `NEXTAUTH_SECRET` - Authentication secret
- [ ] `NEXTAUTH_URL` - Authentication callback URL

### Required for Monitoring
- [ ] `SLACK_WEBHOOK_URL` - Slack notifications
- [ ] `EMAIL_SERVER_HOST` - Email notifications
- [ ] `ALERT_EMAIL_RECIPIENTS` - Alert recipients

### Required for Testing
- [ ] `TEST_USER_EMAIL` - Test user account
- [ ] `TEST_USER_PASSWORD` - Test user password
- [ ] `SYNTHETIC_HEADLESS` - Headless browser mode

## Best Practices

1. **Use Environment-Specific Values**
   - Different values for development, staging, production
   - Use Vercel's environment targeting

2. **Secure Sensitive Data**
   - Never commit secrets to git
   - Use strong, unique values for production
   - Rotate secrets regularly

3. **Validate Early**
   - Use environment validation in your application
   - Fail fast if required variables are missing
   - Provide clear error messages

4. **Document Requirements**
   - Maintain an up-to-date `.env.example` file
   - Document which variables are required vs optional
   - Include setup instructions for new developers

## Debugging Commands

\`\`\`bash
# Check environment validation
npm run check:env

# View all environment variables (development only)
npm run debug:env

# Test specific functionality
npm run test:monitoring
npm run test:notifications
