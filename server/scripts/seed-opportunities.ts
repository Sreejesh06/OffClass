import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding opportunities...");

  // Get an admin user to be the author
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!admin) {
    console.error("No ADMIN user found. Please run the main seed script first or create an admin.");
    process.exit(1);
  }

  const opportunities = [
    {
      title: "Flipkart GRiD 6.0 - Software Development Track",
      description: "Flipkart GRiD is Flipkart's Flagship Engineering Campus Challenge which provides you the opportunity to apply your technical knowledge and architectural skills to solve real e-commerce challenges.",
      externalUrl: "https://unstop.com/hackathons/flipkart-grid-60",
      type: "HACKATHON",
      targetHouses: ["GREEN", "BLUE"],
      postedById: admin.id,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      isActive: true,
    },
    {
      title: "Google Summer of Code (GSoC) 2026",
      description: "Spend your summer writing code for open source organizations. Get paired with mentors and build your portfolio while earning a stipend.",
      externalUrl: "https://summerofcode.withgoogle.com/",
      type: "INTERNSHIP",
      targetHouses: ["GREEN", "PURPLE"],
      postedById: admin.id,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      isActive: true,
    },
    {
      title: "HackTheBox Cyber Apocalypse 2026",
      description: "The biggest global CTF event of the year! Form a team and hack your way through pwn, web, crypto, and forensics challenges to save the world.",
      externalUrl: "https://www.hackthebox.com/events/cyber-apocalypse-2026",
      type: "CTF",
      targetHouses: ["RED", "BLUE"],
      postedById: admin.id,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      isActive: true,
    },
    {
      title: "HackerOne: Apple Security Bounty",
      description: "Apple is offering significant rewards for researchers who share critical vulnerabilities. Great opportunity for Red house members to test iOS and macOS bounds.",
      externalUrl: "https://security.apple.com/bounty/",
      type: "BUG_BOUNTY",
      targetHouses: ["RED"],
      postedById: admin.id,
      deadline: null, // No deadline
      isActive: true,
    },
    {
      title: "TCS CodeVita Season 13",
      description: "The Guinness World Record holder for the largest programming competition! Show your competitive programming skills and secure a global rank.",
      externalUrl: "https://unstop.com/competitions/tcs-codevita-season-13",
      type: "OTHER",
      targetHouses: ["BLUE", "GREEN"],
      postedById: admin.id,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isActive: true,
    },
    {
      title: "AWS Certified Security - Specialty Discount",
      description: "Get a 50% discount voucher for the AWS Security Specialty certification. Limited slots available through the university partner program.",
      externalUrl: "https://aws.amazon.com/certification/certified-security-specialty/",
      type: "CERT_DISCOUNT",
      targetHouses: ["PURPLE", "BLUE"],
      postedById: admin.id,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      isActive: true,
    },
    {
      title: "DEF CON 34 Qualifying Rounds",
      description: "The qualifiers for the world's longest-running and largest underground hacking conference. Only the elite will make it to Las Vegas.",
      externalUrl: "https://defcon.org/",
      type: "CTF",
      targetHouses: ["RED", "PURPLE"],
      postedById: admin.id,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (urgent)
      isActive: true,
    }
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({
      // @ts-ignore
      data: opp
    });
  }

  console.log(`Successfully seeded ${opportunities.length} opportunities!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
