# 🚀 Jobs2Go Platform

A comprehensive job platform built with Next.js, featuring advanced monitoring, email systems, and administrative tools.

## ✨ Features

### 🎯 Core Platform
- **Job Management**: Post, search, and manage job listings
- **User Authentication**: Secure login with NextAuth.js
- **Role-Based Access**: Admin, employer, and job seeker roles
- **Source Map Monitoring**: Advanced error tracking and cleanup

### 📧 Communication System
- **Dual Email Providers**: Resend (primary) + SMTP (backup)
- **Alert Notifications**: Real-time system alerts
- **User Communications**: Registration, notifications, updates

### 📊 Monitoring & Analytics
- **Sentry Integration**: Comprehensive error tracking
- **Google Analytics**: User behavior and performance metrics
- **Performance Monitoring**: Real-time system health
- **Synthetic Monitoring**: Automated testing with Playwright

### 🔧 Admin Tools
- **Monitoring Dashboard**: System health and metrics
- **Template Management**: Source map cleanup templates
- **User Management**: Role and permission management
- **Health Checks**: Comprehensive system status

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Vercel account (for deployment)

### Installation

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd jobs2go-platform
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   # Configure your environment variables
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   npm run db:migrate
   npm run db:generate
   \`\`\`

4. **Development**
   \`\`\`bash
   npm run dev
   \`\`\`

### Production Deployment

1. **Final Check**
   \`\`\`bash
   npm run check:deployment
   \`\`\`

2. **Deploy**
   \`\`\`bash
   npm run deploy:production
   \`\`\`

3. **Verify**
   \`\`\`bash
   npm run verify:deployment
   \`\`\`

## 🔧 Configuration

### Environment Variables

#### Application
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Authentication URL

#### Database
- `DATABASE_URL` - Primary database connection
- `SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

#### Email
- `EMAIL_PROVIDER` - Email provider (resend/smtp)
- `RESEND_API_KEY` - Resend API key
- `EMAIL_HOST` - SMTP host (backup)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password
- `ALERT_RECIPIENTS` - Alert email recipients

#### Monitoring
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` - Google Analytics ID
- `BROWSERSTACK_USERNAME` - BrowserStack username
- `BROWSERSTACK_ACCESS_KEY` - BrowserStack access key

## 📊 API Endpoints

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/complete` - Comprehensive system status
- `GET /api/health/deployment` - Deployment-specific health

### Testing
- `GET /api/test/email` - Email system test
- `GET /debug/env` - Environment validation

### Admin
- `GET /admin/monitoring` - Monitoring dashboard
- `GET /admin/source-maps` - Source map management

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check:deployment` - Pre-deployment validation
- `npm run deploy:production` - Deploy to production
- `npm run verify:deployment` - Post-deployment verification
- `npm run test:email` - Test email configuration
- `npm run setup:monitoring` - Initialize monitoring
- `npm run synthetic:monitoring` - Run synthetic tests

## 📈 Monitoring

### Error Tracking
- **Sentry**: Real-time error monitoring and alerting
- **Custom Error Boundaries**: React error handling
- **API Error Handling**: Comprehensive API error tracking

### Performance
- **Web Vitals**: Core web vitals tracking
- **Database Monitoring**: Query performance and health
- **Response Time Tracking**: API and page load times

### Synthetic Monitoring
- **Playwright Tests**: Automated browser testing
- **Health Checks**: Continuous endpoint monitoring
- **Screenshot Capture**: Visual regression testing

## 🔒 Security

- **NextAuth.js**: Secure authentication
- **Role-Based Access Control**: Granular permissions
- **CRON Protection**: Secured scheduled tasks
- **Environment Validation**: Runtime configuration checks

## 📧 Email System

### Primary Provider (Resend)
- High deliverability
- Advanced analytics
- Template management

### Backup Provider (SMTP)
- Failover protection
- Custom SMTP configuration
- Enterprise email support

## 🎯 Production Ready

✅ **Fully Configured**
- All environment variables set
- Database connections established
- Email providers configured
- Monitoring systems active

✅ **Enterprise Features**
- Comprehensive error tracking
- Performance monitoring
- Automated testing
- Alert notifications

✅ **Scalable Architecture**
- Next.js App Router
- Prisma ORM
- Supabase integration
- Vercel deployment

## 📞 Support

For issues or questions:
1. Check the health endpoints
2. Review Sentry error logs
3. Verify environment configuration
4. Contact system administrators

## 📄 License

This project is proprietary software for Jobs2Go platform.

---

**🎉 Your Jobs2Go platform is production-ready!**
