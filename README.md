# 🏢 Enterprise Employee Leave Management Portal & Cloud Platform

A modern, full-stack enterprise **Employee Leave Management Portal** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **MongoDB Atlas Cloud Database**, and native **AWS Cloud Infrastructure Services** (S3, CloudWatch, SNS, SES, KMS, DynamoDB, SQS).

---

## ⚡ Quick Start (Run in 1 Step)

### Option A: Windows 1-Click Startup (Recommended)
Double-click **`run-app.bat`** in the project folder. It will automatically install dependencies, sync the database, and launch the server!

### Option B: Terminal Command
```bash
# 1. Install dependencies
npm install

# 2. Sync MongoDB Atlas Database
npx prisma db push

# 3. Launch Development Server
npm run dev
```

👉 Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📊 All 10 Supported Leave Categories

1. 🏖️ **Flexible Vacation - India** (Casual Leave - 12 Days/Year)
2. 🤒 **Sick Leave - India** (10 Days/Year)
3. 💼 **Earned / Annual Leave** (15 Days/Year)
4. 👶 **Primary Parental Leave** (90 Days)
5. 👨‍👩‍👧 **Secondary Parental Leave** (14 Days)
6. 🏥 **Special Medical Leave - India** (30 Days)
7. 🌸 **Menstrual Leave - India** (12 Days)
8. 👶 **Adoption - India** (60 Days)
9. 🤝 **Charitable Works** (5 Days)
10. ⌛ **Unpaid Leave - India** (Unlimited)

---

## ☁️ Live Cloud & AWS Infrastructure

- **Database**: MongoDB Atlas (`cluster0.cpxptag.mongodb.net`)
- **Email Dispatcher**: Google Cloud & AWS SES SMTP
- **AWS S3 Bucket**: `yasheswini-leave-portal-1786762161` (`us-west-1`)
- **AWS CloudWatch Logs**: `/aws/leave-management-portal/logs`
- **AWS SNS Topic**: `arn:aws:sns:us-west-1:713881814960:leave-portal-notifications`
- **AWS KMS Key**: `alias/leave-portal-kms-key`
- **AWS DynamoDB Table**: `LeavePortalAuditLogs`
- **AWS SQS Queue**: `leave-portal-email-queue`

---

## 📁 Key Project Structure

```
├── src/
│   ├── app/               # Next.js 14 App Router Pages & API Routes
│   │   ├── admin/         # Admin Dashboard, Employees Management, Leave Approvals
│   │   ├── apply-leave/   # Dual-Month Interactive Calendar & Time Off Form
│   │   ├── dashboard/     # Employee Portal & Leave Balance Cards
│   │   └── api/           # Serverless API Endpoints (Auth, Leaves, AWS Backups)
│   ├── components/        # Reusable UI Components (Navbar, StatusBadge, Toast)
│   └── lib/               # Security (auth.ts), Prisma (prisma.ts), AWS SDKs (aws-*.ts)
├── prisma/
│   ├── schema.prisma      # Prisma Data Schema for MongoDB Atlas
│   └── seed.ts            # Seeding Engine for 10 Leave Balances & Initial Accounts
├── run-app.bat            # 1-Click Windows Startup Script
└── Dockerfile             # AWS App Runner / EC2 Container Manifest
```
