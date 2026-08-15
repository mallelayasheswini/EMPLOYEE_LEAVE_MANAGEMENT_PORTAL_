import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MALE_LEAVE_BALANCES = [
  { leaveType: 'CASUAL', allocated: 12, used: 1 },
  { leaveType: 'SICK', allocated: 10, used: 0 },
  { leaveType: 'EARNED', allocated: 15, used: 2 },
  { leaveType: 'PARENTAL', allocated: 90, used: 0 },
  { leaveType: 'SECONDARY_PARENTAL', allocated: 14, used: 0 },
  { leaveType: 'SPECIAL_MEDICAL', allocated: 30, used: 0 },
  { leaveType: 'ADOPTION', allocated: 60, used: 0 },
  { leaveType: 'CHARITABLE', allocated: 5, used: 0 },
  { leaveType: 'UNPAID', allocated: 0, used: 0 },
];

const FEMALE_LEAVE_BALANCES = [
  ...MALE_LEAVE_BALANCES,
  { leaveType: 'MENSTRUAL', allocated: 12, used: 0 },
];

async function main() {
  console.log('🌱 Starting database seed with Gender-Based Leave Balances...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.user.updateMany({ data: { managerId: null } });
  await prisma.user.deleteMany();

  const commonPassword = await bcrypt.hash('Employee@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Create Primary Admin (Yasheswini Mallela - Female)
  const admin = await prisma.user.create({
    data: {
      name: 'Yasheswini Mallela',
      email: 'yasheswinireddy18@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      gender: 'FEMALE',
      department: 'Management',
      leaveBalances: {
        create: FEMALE_LEAVE_BALANCES,
      },
    },
  });

  // 2. Create Employee 1 - John Doe (Male)
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      password: commonPassword,
      role: 'EMPLOYEE',
      gender: 'MALE',
      department: 'Software Engineering',
      managerId: admin.id,
      leaveBalances: {
        create: MALE_LEAVE_BALANCES,
      },
    },
  });

  // 3. Create Employee 2 - Sarah Smith (Female)
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Smith',
      email: 'sarah.smith@company.com',
      password: commonPassword,
      role: 'EMPLOYEE',
      gender: 'FEMALE',
      department: 'UI/UX Design',
      managerId: admin.id,
      leaveBalances: {
        create: FEMALE_LEAVE_BALANCES,
      },
    },
  });

  // 4. Create Employee 3 - Alex Jones (Male)
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Jones',
      email: 'alex.jones@company.com',
      password: commonPassword,
      role: 'EMPLOYEE',
      gender: 'MALE',
      department: 'Product Marketing',
      managerId: admin.id,
      leaveBalances: {
        create: MALE_LEAVE_BALANCES,
      },
    },
  });

  // Seed Leave Requests
  const today = new Date();

  const addDays = (date: Date, days: number) => {
    const res = new Date(date);
    res.setDate(res.getDate() + days);
    return res;
  };

  // Admin's requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: admin.id,
        leaveType: 'EARNED',
        startDate: addDays(today, -15),
        endDate: addDays(today, -14),
        days: 2,
        reason: 'Executive Leadership Summit & Conference',
        status: 'APPROVED',
        managerComment: 'Self-approved for corporate summit.',
        createdAt: addDays(today, -20),
      },
    ],
  });

  // John's requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: john.id,
        leaveType: 'CASUAL',
        startDate: addDays(today, -20),
        endDate: addDays(today, -19),
        days: 2,
        reason: 'Family function and travel to hometown',
        status: 'APPROVED',
        managerComment: 'Approved. Enjoy your time with family.',
        createdAt: addDays(today, -25),
      },
      {
        userId: john.id,
        leaveType: 'SICK',
        startDate: addDays(today, -10),
        endDate: addDays(today, -10),
        days: 1,
        reason: 'High fever and medical consultation',
        status: 'APPROVED',
        managerComment: 'Approved. Get well soon!',
        createdAt: addDays(today, -11),
      },
    ],
  });

  // 5. Create Initial System Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'New Leave Request Submitted 📩',
        message: 'John Doe submitted a Casual Leave request for 3 day(s). Action required.',
        type: 'INFO',
        read: false,
        createdAt: addDays(today, -1),
      },
      {
        userId: john.id,
        title: 'Leave Application Approved 🎉',
        message: 'Your Casual Leave request for 2 day(s) has been approved by Manager Yasheswini Mallela.',
        type: 'SUCCESS',
        read: true,
        createdAt: addDays(today, -20),
      },
    ],
  });

  console.log('✅ Seed completed successfully! Menstrual Leave allocated specifically for Female employees.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
