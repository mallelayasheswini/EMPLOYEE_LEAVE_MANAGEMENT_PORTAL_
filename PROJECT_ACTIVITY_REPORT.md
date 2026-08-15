# 📄 Vibe Coding Project Activity Report

---

## 2. Problem Statement
Traditional enterprise employee leave management systems often rely on fragmented manual emails, spreadsheets, or rigid legacy applications. These systems suffer from several key limitations:
- Lack of real-time balance tracking across statutory leave policies (e.g., Casual, Sick, Parental, Menstrual, Special Medical, Adoption, Charitable, and Unpaid leaves).
- Absence of automated, resilient cloud backups, leaving organization data vulnerable to single points of failure.
- Inefficient approval workflows without multi-channel notifications or cloud audit trails.
- High complexity and manual overhead in deploying and managing cloud infrastructure for enterprise workforce applications.

---

## 3. Objective
The objective of this project is to build and deploy a full-stack, cloud-native **Employee Leave Management & Cloud Automation Portal** that achieves:
1. **Automated Statutory Leave Management**: Provision and track all 10 statutory leave categories with automatic balance calculations and date range validations.
2. **Multi-Role Authorization**: Provide dedicated interfaces and secure access control for Employees and System Administrators using JWT and HttpOnly cookies.
3. **Cloud Resilience & Backups**: Enable live, 1-click database snapshot backups from MongoDB Atlas directly to Amazon S3.
4. **Cloud Observability & Alerts**: Integrate native AWS Cloud services (CloudWatch Logs, SNS Push Alerts, SES Cloud Email, KMS Encryption, DynamoDB NoSQL Audit Trail, SQS Queue) for enterprise event monitoring and alerting.

---

## 4. Syllabus Concept Used
This application implements core Cloud Computing & Cloud Strategy concepts:
- **Database as a Service (DBaaS)**: Managed MongoDB Atlas cloud cluster for scalable document persistence.
- **Infrastructure & Storage as a Service (IaaS/S3)**: Amazon Web Services S3 object storage for automated cloud database backups.
- **Cloud Observability & Event Streaming**: Amazon CloudWatch Logs for audit trail logging and Amazon SNS for real-time notification publishing.
- **Cloud Security & Cryptography**: AWS Key Management Service (KMS) for managed encryption key policies and HttpOnly JWT cookie authorization.
- **Serverless Architecture**: Next.js Serverless API Routes operating on modern cloud runtime environments.

---

## 5. Tools and Technologies Used

| Category | Tool / Technology Used |
|---|---|
| **Vibe Coding Tool** | Antigravity AI Agentic Coding Assistant |
| **Programming Language** | TypeScript / JavaScript (Node.js v20) |
| **Frontend Tool** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons |
| **Backend Tool** | Next.js Serverless API Routes, Node.js, Prisma ORM |
| **Database** | MongoDB Atlas Cloud Database (`cluster0`) |
| **Cloud Platform** | Amazon Web Services (AWS) — S3, CloudWatch Logs, SNS, SES, KMS, DynamoDB, SQS |

---

## 6. Application Design

### • Simple Architecture Diagram

```mermaid
graph TD
    User[Employee / Admin Browser] -->|HTTPS Requests| NextJS[Next.js 14 Serverless Portal]
    NextJS -->|JWT Auth Cookie| Security[Auth Guard]
    NextJS -->|Prisma ORM| MongoDB[(MongoDB Atlas Cloud DB)]
    NextJS -->|@aws-sdk/client-s3| S3[(AWS S3 Backup Bucket)]
    NextJS -->|@aws-sdk/client-cloudwatch-logs| CloudWatch[AWS CloudWatch Logs]
    NextJS -->|@aws-sdk/client-sns| SNS[AWS SNS Alert Topic]
    NextJS -->|Nodemailer / AWS SES| Email[Gmail SMTP & AWS SES]
```

### • Application Workflow
1. **Employee Application**: An employee selects leave dates on an interactive dual-month calendar, selects one of 10 leave categories, and submits a request.
2. **Validation Engine**: System verifies balance sufficiency, date range logic, and checks for overlapping pending/approved requests.
3. **Admin Review & Approval**: Administrator reviews requests on the Admin Dashboard and approves the leave.
4. **Atomic Execution Pipeline**:
   - `LeaveRequest.status` converts to `APPROVED`.
   - `LeaveBalance.used` is automatically incremented.
   - Real-time notification appears on Employee Dashboard.
   - Dual email notification is dispatched via Google Cloud SMTP & AWS SES to `yasheswinireddy18@gmail.com`.
5. **Cloud Backup & Logging**: Admin triggers 1-click backup to AWS S3 (`yasheswini-leave-portal-1786762161`), while audit events stream to AWS CloudWatch Logs (`/aws/leave-management-portal/logs`).

### • Main Features
- 🌟 **All 10 Statutory Leave Balances**: Allocated automatically for every employee.
- 📅 **Dual-Month Range Calendar**: Visual date range selector with automatic day count calculation.
- 🔐 **Multi-Role Security**: JWT authentication with HttpOnly cookies for Admin and Employee roles.
- ☁️ **AWS S3 Cloud Database Backups**: 1-Click MongoDB Atlas snapshot upload to AWS S3.
- 🌩️ **AWS Multi-Cloud Suite**: Integrated CloudWatch Logs, SNS Alerts, SES Email, KMS Keys, DynamoDB Audit Logs, and SQS Queue.

---

## 7. Prompts Used

| S.No. | AI Tool | Prompt Used | Purpose |
|---|---|---|---|
| 1 | Antigravity AI | *"run the project and build employee leave management portal"* | Initialize project, setup Next.js App Router, Prisma ORM, and MongoDB Atlas connection. |
| 2 | Antigravity AI | *"add balances of all kinds of leaves not only few for all employees"* | Extend system to support all 10 statutory leave categories and update Prisma seeding engine. |
| 3 | Antigravity AI | *"i should integrate with cloud resources at aws, here are my aws credentials"* | Configure live AWS IAM credentials, region, and S3 bucket integration for database backups. |
| 4 | Antigravity AI | *"use more resources of aws: create SNS, SES, CloudWatch Logs, KMS, DynamoDB, SQS"* | Implement multi-service AWS Cloud SDK suite for logging, alerts, encryption, and NoSQL storage. |
| 5 | Antigravity AI | *"push all files to github https://github.com/mallelayasheswini/EMPLOYEE_LEAVE_MANAGEMENT_PORTAL_"* | Initialize Git, configure `.gitignore`, sanitize environment secrets, and push clean repository to GitHub. |

---

## 9. GitHub Link
👉 **[https://github.com/mallelayasheswini/EMPLOYEE_LEAVE_MANAGEMENT_PORTAL_](https://github.com/mallelayasheswini/EMPLOYEE_LEAVE_MANAGEMENT_PORTAL_)**

---

## 11. Blockers Faced & Solutions

| Blocker Faced | Cause / Root Cause | Solution Implemented |
|---|---|---|
| **Self-Referential User Deletion FK Error** | Prisma thrown `P2014` error during database re-seeding due to self-referential `managerId` relation on `User` model. | Added pre-deletion step `await prisma.user.updateMany({ data: { managerId: null } })` before clearing user tables. |
| **AWS S3 Region Redirect (`300 PermanentRedirect`)** | S3 bucket `yasheswini-leave-portal-1786762161` was registered under region `us-west-1` while client defaulted to `us-east-1`. | Updated `.env` and `aws-s3.ts` SDK configuration to target endpoint `us-west-1`. |
| **GitHub Secret Scanning Push Protection Block** | GitHub rejected `git push` because `.env.example` contained live AWS IAM key strings. | Replaced raw keys with clean placeholders (`YOUR_AWS_ACCESS_KEY_ID`), removed `.env` from tracking, and recreated clean single-commit history. |
| **Local DLL File Locks During Build** | Background Next.js dev server process locked Prisma `query_engine-windows.dll.node`. | Terminated background dev process using agent `manage_task` kill tool prior to executing build scripts. |

---

## 12. Experience of the Activity
Using **Vibe Coding** with the Antigravity AI assistant transformed complex full-stack web development and cloud infrastructure provisioning into an interactive, high-velocity experience. Instead of spending hours manually configuring AWS SDK clients, writing Prisma schemas, or fixing CSS flex layouts, natural language prompts allowed rapid architectural execution, instant feedback, and seamless git repository management.

---

## 13. Learning from the Activity
- **Cloud Concepts**: Practical understanding of DBaaS (MongoDB Atlas), S3 Object Storage, AWS CloudWatch logging streams, SNS notification publishing, and KMS key management.
- **Application Development**: Gained mastery over Next.js 14 App Router, atomic Prisma transactions, and secure JWT HttpOnly cookie management.
- **AI-Assisted Coding**: Learned how to leverage agentic workflows for end-to-end full-stack development, automated refactoring, and environment security.
- **Prompt Writing**: Developed techniques for writing precise, domain-specific prompts to instruct AI agents on cloud SDK setup and UI refinements.
- **Debugging & Testing**: Learned systematic diagnostic methods by inspecting raw background process logs and runtime tracebacks.

---

## 14. Conclusion
The **Employee Leave Management & Cloud Automation Portal** was successfully designed, developed, and deployed. The platform seamlessly combines modern web design, multi-role leave workflow automation across 10 statutory leave categories, and live AWS cloud infrastructure integrations (S3, CloudWatch Logs, SNS, SES, KMS, DynamoDB, SQS). All source code has been sanitized for security best practices and pushed to GitHub for 1-click execution.
