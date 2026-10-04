import { PrismaClient, AchievementCategory, AchievementStatus, ComplaintCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with rich mock data...");

  // 1. Wipe existing data
  await prisma.opportunityBookmark.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.houseTransferRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.perkItem.deleteMany();
  await prisma.pointsTransaction.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.profileSync.deleteMany();
  await prisma.profileLink.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.leaderboardSnapshot.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Core Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sece.ac.in', name: 'System Admin', passwordHash,
      role: 'ADMIN', house: 'PURPLE', points: 9999
    }
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@sece.ac.in', name: 'Prof. Security', passwordHash,
      role: 'TEACHER', house: 'BLUE', points: 5000
    }
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@sece.ac.in', name: 'Alex Cipher', passwordHash,
      role: 'STUDENT', house: 'RED', points: 3450,
      bio: 'Enthusiastic about web exploitation and CTFs. Currently hunting bugs on HackerOne.',
      workDomain: 'Offensive Security Researcher',
      skills: ['Python', 'Docker', 'Burp Suite', 'Reversing', 'Solidity'],
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    }
  });

  // Create 40 mock students for the leaderboard
  const houses = ['RED', 'BLUE', 'GREEN', 'PURPLE'] as const;
  const mockStudentsData = Array.from({ length: 40 }).map((_, i) => ({
    email: `student${i}@sece.ac.in`,
    name: `Agent ${i}`,
    passwordHash,
    role: 'STUDENT' as const,
    house: houses[i % 4]!,
    points: Math.floor(Math.random() * 8000)
  }));
  await prisma.user.createMany({ data: mockStudentsData });

  // 3. Populate Student Profile Data
  await prisma.workExperience.createMany({
    data: [
      { userId: student.id, company: 'Nullify CTF Team', role: 'Web Exploitation Lead', duration: '2025 - Present', isCurrent: true, description: 'Led the web exploitation team in regional CTFs.' },
      { userId: student.id, company: 'Local Tech Startup', role: 'Security Intern', duration: 'Summer 2024', isCurrent: false, description: 'Performed internal vulnerability scanning.' }
    ]
  });

  await prisma.profileLink.createMany({
    data: [
      { userId: student.id, provider: 'GITHUB', externalHandle: 'alex-cipher', verified: true },
      { userId: student.id, provider: 'HTB', externalHandle: 'alexcipher', verified: true }
    ]
  });

  await prisma.profileSync.createMany({
    data: [
      { userId: student.id, provider: 'GITHUB', status: 'SUCCESS', parsedStats: { publicRepos: 12, followers: 45, totalCommits: 340 }, rawSnapshot: {} },
      { userId: student.id, provider: 'HTB', status: 'SUCCESS', parsedStats: { rank: 'Hacker', systemOwns: 15, userOwns: 22 }, rawSnapshot: {} }
    ]
  });

  // 4. Create Badges & UserBadges
  const pwnBadge = await prisma.badge.create({
    data: { name: 'Pwn Master', description: 'Owned 10 systems on HTB', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png' }
  });
  const webBadge = await prisma.badge.create({
    data: { name: 'Web Expert', description: 'Solved 20 Web CTF challenges', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png' }
  });

  await prisma.userBadge.createMany({
    data: [
      { userId: student.id, badgeId: pwnBadge.id },
      { userId: student.id, badgeId: webBadge.id }
    ]
  });

  // 5. Create Achievements & Certificates
  await prisma.achievement.createMany({
    data: [
      { userId: student.id, title: 'DefCon Quals 2025', category: 'CTF', position: 'Top 50', date: new Date('2025-05-10'), status: 'APPROVED', pointsAwarded: 500, reviewedBy: teacher.id, blockchainTxHash: '0xabc123...', isAnchored: true },
      { userId: student.id, title: 'HackIndia Hackathon', category: 'HACKATHON', position: '1st Place', date: new Date('2025-06-15'), status: 'PENDING_VERIFICATION' },
      { userId: student.id, title: 'Local Bug Bounty', category: 'OTHER', position: 'Valid Bug found', date: new Date('2025-07-01'), status: 'REJECTED', reviewedBy: teacher.id }
    ]
  });

  await prisma.certificate.createMany({
    data: [
      { userId: student.id, name: 'AWS Certified Security', fileKey: 'mock_aws.pdf', mimeType: 'application/pdf', status: 'APPROVED', reviewedBy: teacher.id, blockchainTxHash: '0xdef456...', isAnchored: true },
      { userId: student.id, name: 'OSCP', fileKey: 'mock_oscp.pdf', mimeType: 'application/pdf', status: 'PENDING_VERIFICATION' }
    ]
  });

  // 6. Create Extensive Points Transactions (Heatmap Data)
  const today = new Date();
  const txData = [];
  for (let i = 0; i < 60; i++) {
    // Random dates within the last 90 days
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    txData.push({
      userId: student.id,
      delta: Math.floor(Math.random() * 50) + 10,
      reason: 'GitHub Activity Sync',
      referenceType: 'SYNC',
      createdAt: date
    });
  }
  txData.push(
    { userId: student.id, delta: 500, reason: 'DefCon Quals 2025', createdBy: teacher.id, referenceType: 'ACHIEVEMENT', createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { userId: student.id, delta: -50, reason: 'Redeemed Priority Workshop', createdBy: student.id, referenceType: 'REDEMPTION', createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) }
  );
  await prisma.pointsTransaction.createMany({ data: txData });

  // 7. Create Perks & Redemptions
  const perk = await prisma.perkItem.create({
    data: { name: "Priority Workshop Registration", description: "Get guaranteed access to the next limited-seat workshop.", cost: 50, quantityRemaining: 49 }
  });
  await prisma.perkItem.createMany({
    data: [
      { name: "Off-Duty Pass", description: "Get a half-day OD for CTF preparation.", cost: 1500, quantityRemaining: 10 },
      { name: "Exclusive Hoodie", description: "Official OffClass Hacker Hoodie.", cost: 5000, quantityRemaining: 5 },
    ]
  });

  await prisma.redemption.create({
    data: { userId: student.id, perkItemId: perk.id, idempotencyKey: "seed_red_1" }
  });

  // 8. Complaints
  await prisma.complaint.createMany({
    data: [
      { category: 'PLATFORM_BUG', content: 'We cannot access HackTheBox VPNs from the library network.', status: 'SUBMITTED', trackingCode: "CMP-1234", reportedDay: "2025-05-10" },
      { category: 'GRADING', content: 'My CTF points were not credited.', status: 'PUBLISHED', adminNotes: 'Credited manually.', trackingCode: "CMP-5678", reportedDay: "2025-06-15" }
    ]
  });

  // 9. House Transfer Requests
  await prisma.houseTransferRequest.create({
    data: { userId: student.id, currentHouse: 'RED', targetHouse: 'PURPLE', reason: 'I want to focus more on cryptography.', status: 'PENDING' }
  });

  // 10. Opportunities
  await prisma.opportunity.createMany({
    data: [
      { title: 'Google Summer of Code', description: 'Apply for open source summer internship.', externalUrl: 'https://summerofcode.withgoogle.com/', type: 'INTERNSHIP', targetHouses: ['RED', 'BLUE', 'GREEN', 'PURPLE'], postedById: teacher.id },
      { title: 'HackerOne Bug Bounty', description: 'Private program invites available for top students.', externalUrl: 'https://hackerone.com', type: 'BUG_BOUNTY', targetHouses: ['RED', 'BLUE'], postedById: teacher.id }
    ]
  });

  console.log("Database seeded successfully with rich mock data for all features!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
