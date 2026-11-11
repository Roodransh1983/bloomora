import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const staffAccounts = [
  { email: 'ceo.bloomora@gmail.com', name: 'BLOOMORA CEO' },
  { email: 'bloomoratechinalteam@gmail.com', name: 'BLOOMORA Technical Team' },
  { email: 'customerexperienceteam724@gmail.com', name: 'Customer Experience Team' },
  { email: 'salesmarketingbloomora@gmail.com', name: 'Sales & Marketing Team' },
  { email: 'financebudget738@gmail.com', name: 'Finance Budget Team' },
  { email: 'financebloomora@gmail.com', name: 'BLOOMORA Finance Team' },
  { email: 'artsbloomora@gmail.com', name: 'BLOOMORA Arts Team' },
  { email: 'bloomorasocialmedia@gmail.com', name: 'BLOOMORA Social Media Team' },
  { email: 'operations.bloomora@gmail.com', name: 'BLOOMORA Operations Team' },
];

const createPasscode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from(crypto.randomBytes(18), (byte) => alphabet[byte % alphabet.length]).join('');
};

async function main() {
  console.log('Creating missing BLOOMORA staff accounts...');

  for (const account of staffAccounts) {
    const email = account.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log(`EXISTS ${email} (no passcode changed)`);
      continue;
    }

    const passcode = createPasscode();
    const password = await bcrypt.hash(passcode, 12);
    await prisma.user.create({
      data: { email, name: account.name, password, role: 'ADMIN' },
    });

    // This is the only time the generated passcode is printed. The database stores only its hash.
    console.log(`${email}\t${passcode}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
