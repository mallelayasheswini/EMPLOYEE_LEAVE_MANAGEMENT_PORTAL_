import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_LEAVE_BALANCES = [
  { leaveType: 'CASUAL', allocated: 12, used: 1 },
  { leaveType: 'SICK', allocated: 10, used: 0 },
  { leaveType: 'EARNED', allocated: 15, used: 2 },
  { leaveType: 'PARENTAL', allocated: 90, used: 0 },
  { leaveType: 'SECONDARY_PARENTAL', allocated: 14, used: 0 },
  { leaveType: 'SPECIAL_MEDICAL', allocated: 30, used: 0 },
  { leaveType: 'MENSTRUAL', allocated: 12, used: 0 },
  { leaveType: 'ADOPTION', allocated: 60, used: 0 },
  { leaveType: 'CHARITABLE', allocated: 5, used: 0 },
  { leaveType: 'UNPAID', allocated: 0, used: 0 },
];

async function main() {
  console.log('🌱 Starting database seed with ALL 10 Leave Type Balances for all users...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.user.updateMany({ data: { managerId: null } });
  await prisma.user.deleteMany();

  const commonPassword = await bcrypt.hash('Employee@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Create Primary Admin (Yasheswini Mallela)
  const admin = await prisma.user.create({
    data: {
      name: 'Yasheswini Mallela',
      email: 'yasheswinireddy18@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Management',
      leaveBalances: {
        create: DEFAULT_LEAVE_BALANCES,
      },
    },
  });

  // 2. Create Employee 1 - John Doe
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      password: commonPassword,
      role: 'EMPLOYEE',
      department: 'Software Engineering',
      managerId: admin.id,
      leaveBalances: {
        create: [
          { leaveType: 'CASUAL', allocated: 12, used: 2 },
          { leaveType: 'SICK', allocated: 10, used: 1 },
          { leaveType: 'EARNED', allocated: 15, used: 0 },
          { leaveType: 'PARENTAL', allocated: 90, used: 0 },
          { leaveType: 'SECONDARY_PARENTAL', allocated: 14, used: 0 },
          { leaveType: 'SPECIAL_MEDICAL', allocated: 30, used: 0 },
          { leaveType: 'MENSTRUAL', allocated: 12, used: 0 },
          { leaveType: 'ADOPTION', allocated: 60, used: 0 },
          { leaveType: 'CHARITABLE', allocated: 5, used: 0 },
          { leaveType: 'UNPAID', allocated: 0, used: 0 },
        ],
      },
    },
  });

  // 3. Create Employee 2 - Sarah Smith
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Smith',
      email: 'sarah.smith@company.com',
      password: commonPassword,
      role: 'EMPLOYEE',
      department: 'UI/UX Design',
      managerId: admin.id,
      leaveBalances: {
        create: [
          { leaveType: 'CASUAL', allocated: 12, used: 0 },
          { leaveType: 'SICK', allocated: 10, used: 3 },
          { leaveType: 'EARNED', allocated: 15, used: 5 },
          { leaveType: 'PARENTAL', allocated: 90, used: 0 },
          { leaveType: 'SECONDARY_PARENTAL', allocated: 14, used: 0 },
          { leaveType: 'SPECIAL_MEDICAL', allocated: 30, used: 0 },
          { leaveType: 'MENSTRUAL', allocated: 12, used: 1 },
          { leaveType: 'ADOPTION', allocated: 60, used: 0 },
          { leaveType: 'CHARITABLE', allocated: 5, used: 0 },
          { leaveType: 'UNPAID', allocated: 0, used: 0 },
        ],
      },
    },
  });

  // 4. Create Employee 3 - Alex Jones
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Jones',
      email: 'alex.jones@company.com',
      password: commonPassword,
      role: 'EMPLOYEE',
      department: 'Product Marketing',
      managerId: admin.id,
      leaveBalances: {
        create: [
          { leaveType: 'CASUAL', allocated: 12, used: 1 },
          { leaveType: 'SICK', allocated: 10, used: 0 },
          { leaveType: 'EARNED', allocated: 15, used: 0 },
          { leaveType: 'PARENTAL', allocated: 90, used: 0 },
          { leaveType: 'SECONDARY_PARENTAL', allocated: 14, used: 0 },
          { leaveType: 'SPECIAL_MEDICAL', allocated: 30, used: 0 },
          { leaveType: 'MENSTRUAL', allocated: 12, used: 0 },
          { leaveType: 'ADOPTION', allocated: 60, used: 0 },
          { leaveType: 'CHARITABLE', allocated: 5, used: 1 },
          { leaveType: 'UNPAID', allocated: 0, used: 2 },
        ],
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

  console.log('✅ Seed completed successfully with ALL 10 Leave Balances for all users!');
  console.log(`👤 Admin Created: ${admin.name} (${admin.email})`);
  console.log(`👤 Employee Created: ${john.name} (${john.email})`);
  console.log(`👤 Employee Created: ${sarah.name} (${sarah.email})`);
  console.log(`👤 Employee Created: ${alex.name} (${alex.email})`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
