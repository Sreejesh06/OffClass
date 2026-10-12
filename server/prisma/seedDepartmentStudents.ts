import { PrismaClient, House } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface StudentRoster {
  rollNo: string;
  name: string;
  house: House;
  year: string;
  email: string;
}

const STUDENTS_ROSTER: StudentRoster[] = [
  { rollNo: "24SY001", name: "Aarockya Rathish Raj A", house: House.GREEN, year: "III CYS", email: "aarockyarathishraj.a2024csecs@sece.ac.in" },
  { rollNo: "24SY002", name: "Aksharaa L", house: House.GREEN, year: "III CYS", email: "aksharaa.l2024csecs@sece.ac.in" },
  { rollNo: "24SY003", name: "Amitha P", house: House.BLUE, year: "III CYS", email: "amitha.p2024csecs@sece.ac.in" },
  { rollNo: "24SY004", name: "Aravind J", house: House.RED, year: "III CYS", email: "aravind.j2024csecs@sece.ac.in" },
  { rollNo: "24SY005", name: "Aswin M S", house: House.BLUE, year: "III CYS", email: "aswin.ms2024csecs@sece.ac.in" },
  { rollNo: "24SY006", name: "Avinash R", house: House.BLUE, year: "III CYS", email: "avinash.r2024csecs@sece.ac.in" },
  { rollNo: "24SY007", name: "Balasaravanan K", house: House.BLUE, year: "III CYS", email: "balasaravanan.k2024csecs@sece.ac.in" },
  { rollNo: "24SY008", name: "BHAVADHARANI R", house: House.BLUE, year: "III CYS", email: "bhavadharani.r2024csecs@sece.ac.in" },
  { rollNo: "24SY009", name: "Deechanya S J", house: House.BLUE, year: "III CYS", email: "deechanya.sj2024csecs@sece.ac.in" },
  { rollNo: "24SY010", name: "DHARANI M", house: House.BLUE, year: "III CYS", email: "dharani.m2024csecs@sece.ac.in" },
  { rollNo: "24SY011", name: "Dharshini V", house: House.GREEN, year: "III CYS", email: "dharshini.v2024csecs@sece.ac.in" },
  { rollNo: "24SY012", name: "Dhinakar S", house: House.GREEN, year: "III CYS", email: "dhinakar.s2024csecs@sece.ac.in" },
  { rollNo: "24SY013", name: "DISHANYAA SHRII K M", house: House.RED, year: "III CYS", email: "dishanyaashrii.km2024csecs@sece.ac.in" },
  { rollNo: "24SY014", name: "Divya Dharshini K", house: House.RED, year: "III CYS", email: "divyadharshini.k2024csecs@sece.ac.in" },
  { rollNo: "24SY015", name: "Elangovan S", house: House.GREEN, year: "III CYS", email: "elangovan.s2024csecs@sece.ac.in" },
  { rollNo: "24SY016", name: "Gaurav D", house: House.GREEN, year: "III CYS", email: "gaurav.d2024csecs@sece.ac.in" },
  { rollNo: "24SY017", name: "Harini B", house: House.BLUE, year: "III CYS", email: "harini.b2024csecs@sece.ac.in" },
  { rollNo: "24SY018", name: "Harisaran S", house: House.GREEN, year: "III CYS", email: "harisaran.s2024csecs@sece.ac.in" },
  { rollNo: "24SY019", name: "Jamuna R", house: House.BLUE, year: "III CYS", email: "jamuna.r2024csecs@sece.ac.in" },
  { rollNo: "24SY020", name: "Jeeva Dharshini P", house: House.RED, year: "III CYS", email: "jeevadharshini.p2024csecs@sece.ac.in" },
  { rollNo: "24SY021", name: "Kamalesh K V", house: House.GREEN, year: "III CYS", email: "kamalesh.kv2024csecs@sece.ac.in" },
  { rollNo: "24SY022", name: "Kanishka V S", house: House.GREEN, year: "III CYS", email: "kanishka.vs2024csecs@sece.ac.in" },
  { rollNo: "24SY023", name: "Kavin Krishna G", house: House.GREEN, year: "III CYS", email: "kavinkrishna.g2024csecs@sece.ac.in" },
  { rollNo: "24SY024", name: "Kavithaipriya K", house: House.GREEN, year: "III CYS", email: "kavithaipriya.k2024csecs@sece.ac.in" },
  { rollNo: "24SY025", name: "Keerthi Laksana K", house: House.BLUE, year: "III CYS", email: "keerthilaksana.k2024csecs@sece.ac.in" },
  { rollNo: "24SY026", name: "Kishan Karthick A S", house: House.BLUE, year: "III CYS", email: "kishankarthick.as2024csecs@sece.ac.in" },
  { rollNo: "24SY027", name: "Kuraloviyan P", house: House.BLUE, year: "III CYS", email: "kuraloviyan.p2024csecs@sece.ac.in" },
  { rollNo: "24SY028", name: "Latika abhi shri J", house: House.GREEN, year: "III CYS", email: "latikaabhishri.j2024csecs@sece.ac.in" },
  { rollNo: "24SY029", name: "Logesh R", house: House.RED, year: "III CYS", email: "logesh.r2024csecs@sece.ac.in" },
  { rollNo: "24SY030", name: "Madhusree B", house: House.GREEN, year: "III CYS", email: "madhusree.b2024csecs@sece.ac.in" },
  { rollNo: "24SY031", name: "Manikandan S", house: House.GREEN, year: "III CYS", email: "manikandan.s2024csecs@sece.ac.in" },
  { rollNo: "24SY032", name: "Manisha R", house: House.BLUE, year: "III CYS", email: "manisha.r2024csecs@sece.ac.in" },
  { rollNo: "24SY033", name: "Manoj D", house: House.PURPLE, year: "III CYS", email: "manoj.d2024csecs@sece.ac.in" },
  { rollNo: "24SY034", name: "Meenu Sri Devi A", house: House.BLUE, year: "III CYS", email: "meenusridevi.a2024csecs@sece.ac.in" },
  { rollNo: "24SY035", name: "MONISHA T", house: House.GREEN, year: "III CYS", email: "monisha.t2024csecs@sece.ac.in" },
  { rollNo: "24SY036", name: "Nethra Harshini S", house: House.GREEN, year: "III CYS", email: "nethraharshini.s2024csecs@sece.ac.in" },
  { rollNo: "24SY037", name: "Pavithra M", house: House.BLUE, year: "III CYS", email: "pavithra.m2024csecs@sece.ac.in" },
  { rollNo: "24SY038", name: "Pragadeesh S", house: House.RED, year: "III CYS", email: "pragadeesh.s2024csecs@sece.ac.in" },
  { rollNo: "24SY039", name: "Pranitha Nandhakumar", house: House.GREEN, year: "III CYS", email: "pranithanandhakumar.2024csecs@sece.ac.in" },
  { rollNo: "24SY040", name: "PRASANTH S", house: House.RED, year: "III CYS", email: "prasanth.s2024csecs@sece.ac.in" },
  { rollNo: "24SY041", name: "Raksheedha V K", house: House.BLUE, year: "III CYS", email: "raksheedha.vk2024csecs@sece.ac.in" },
  { rollNo: "24SY042", name: "Ramkumar P", house: House.GREEN, year: "III CYS", email: "ramkumar.p2024csecs@sece.ac.in" },
  { rollNo: "24SY043", name: "Rubika M", house: House.BLUE, year: "III CYS", email: "rubika.m2024csecs@sece.ac.in" },
  { rollNo: "24SY044", name: "Sandeep Prabakar", house: House.PURPLE, year: "III CYS", email: "sandeepprabakar.2024csecs@sece.ac.in" },
  { rollNo: "24SY045", name: "Selvapriya R", house: House.GREEN, year: "III CYS", email: "selvapriya.r2024csecs@sece.ac.in" },
  { rollNo: "24SY046", name: "Shabhika S", house: House.RED, year: "III CYS", email: "shabhika.s2024csecs@sece.ac.in" },
  { rollNo: "24SY047", name: "Shathigul mahdhi S A", house: House.RED, year: "III CYS", email: "shathigulmahdhi.sa2024csecs@sece.ac.in" },
  { rollNo: "24SY048", name: "Shivatharun S", house: House.BLUE, year: "III CYS", email: "shivatharun.s2024csecs@sece.ac.in" },
  { rollNo: "24SY049", name: "SHREE NIDHI RL", house: House.BLUE, year: "III CYS", email: "shreenidhi.rl2024csecs@sece.ac.in" },
  { rollNo: "24SY050", name: "Shreenithi V", house: House.BLUE, year: "III CYS", email: "shreenithi.v2024csecs@sece.ac.in" },
  { rollNo: "24SY051", name: "Shruthi Sree S", house: House.GREEN, year: "III CYS", email: "shruthisree.s2024csecs@sece.ac.in" },
  { rollNo: "24SY052", name: "Sreejesh S", house: House.GREEN, year: "III CYS", email: "sreejesh.s2024csecs@sece.ac.in" },
  { rollNo: "24SY053", name: "Sri Rajanayagi B", house: House.GREEN, year: "III CYS", email: "srirajanayagi.b2024csecs@sece.ac.in" },
  { rollNo: "24SY054", name: "Srinithi S", house: House.BLUE, year: "III CYS", email: "srinithi.s2024csecs@sece.ac.in" },
  { rollNo: "24SY055", name: "Sri Sabari Doss R", house: House.GREEN, year: "III CYS", email: "srisabaridoss.r2024csecs@sece.ac.in" },
  { rollNo: "24SY056", name: "Sujan B", house: House.BLUE, year: "III CYS", email: "sujan.b2024csecs@sece.ac.in" },
  { rollNo: "24SY057", name: "Suryaganthan R", house: House.BLUE, year: "III CYS", email: "suryaganthan.r2024csecs@sece.ac.in" },
  { rollNo: "24SY058", name: "Swetha B", house: House.BLUE, year: "III CYS", email: "swetha.b2024csecs@sece.ac.in" },
  { rollNo: "24SY059", name: "Thejeswini S", house: House.GREEN, year: "III CYS", email: "thejeswini.s2024csecs@sece.ac.in" },
  { rollNo: "24SY060", name: "Uma Sankari M", house: House.BLUE, year: "III CYS", email: "umasankari.m2024csecs@sece.ac.in" },
  { rollNo: "24SY061", name: "Venisha S", house: House.BLUE, year: "III CYS", email: "venisha.s2024csecs@sece.ac.in" },
  { rollNo: "24SY062", name: "Vibbhu A", house: House.GREEN, year: "III CYS", email: "vibbhu.a2024csecs@sece.ac.in" },
  { rollNo: "24SY063", name: "Vinitha M", house: House.BLUE, year: "III CYS", email: "vinitha.m2024csecs@sece.ac.in" },
  { rollNo: "24SY301", name: "DIVYANAND R S", house: House.GREEN, year: "III CYS", email: "divyanand.rs2024lcs@sece.ac.in" },
];

const WORDS = [
  "Falcon", "Cipher", "Viper", "Shield", "Zenith", "Apex", "Matrix", "Titan",
  "Phantom", "Cobalt", "Vector", "Cosmos", "Nexus", "Blaze", "Stellar", "Quasar",
  "Pulse", "Vortex", "Echo", "Hydra", "Orion", "Raven", "Spectre", "Phoenix",
  "Krypton", "Obsidian", "Quantum", "Hyper", "Solar", "Thunder", "Inferno", "Glacier",
  "Aurora", "Tempest", "Vanguard", "Ranger", "Sentinel", "Aegis", "Valiant", "Strike",
  "Mirage", "Prism", "Sentry", "Boreal", "Eclipse", "Horizon", "Nebula", "Astral",
  "Nova", "Onyx", "Rogue", "Spire", "Vertex", "Zephyr", "Arcane", "Cascade",
  "Polaris", "Triton", "Beacon", "Crest", "Dynasty", "Loom", "Pinnacle", "Helios"
];

const SPECIALS = ["!", "@", "#", "$", "*"];

function generateStudentPassword(rollNo: string, index: number): string {
  const word = WORDS[index % WORDS.length]!;
  const charSum = rollNo.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pin = ((charSum * 37 + index * 97) % 9000) + 1000;
  const special = SPECIALS[(charSum + index) % SPECIALS.length]!;
  return `${word}${special}${pin}`;
}

async function main() {
  console.log(`Starting account provisioning for ${STUDENTS_ROSTER.length} students...`);

  const credentialsList: Array<{
    rollNo: string;
    name: string;
    house: string;
    email: string;
    password: string;
    year: string;
  }> = [];

  for (let i = 0; i < STUDENTS_ROSTER.length; i++) {
    const s = STUDENTS_ROSTER[i]!;
    const password = generateStudentPassword(s.rollNo, i);
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { rollNo: s.rollNo },
          { email: s.email },
        ],
      },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          rollNo: s.rollNo,
          email: s.email,
          name: s.name,
          house: s.house,
          passwordHash,
          role: "STUDENT",
          emailVerified: new Date(),
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: s.email,
          rollNo: s.rollNo,
          name: s.name,
          house: s.house,
          passwordHash,
          role: "STUDENT",
          points: 0,
          emailVerified: new Date(),
        },
      });
    }

    credentialsList.push({
      rollNo: s.rollNo,
      name: s.name,
      house: s.house,
      email: s.email,
      password,
      year: s.year,
    });
  }

  // Generate distribution file
  const rootDir = path.resolve(__dirname, "../../");
  const markdownPath = path.join(rootDir, "STUDENT_CREDENTIALS.md");

  let mdContent = `# Cryptid — Student Login Credentials\n\n`;
  mdContent += `**Department:** Cyber Security (III CYS)\n`;
  mdContent += `**Total Accounts Provisioned:** ${credentialsList.length}\n`;
  mdContent += `**Portal Login URL:** \`https://cryptid.sece.ac.in/login\` (or \`http://localhost:5173/login\` in development)\n\n`;
  mdContent += `> [!IMPORTANT]\n`;
  mdContent += `> **Flexible Login:** Students can log in using either their **Roll Number** (e.g. \`24SY001\`) as their username **OR** their **Official College Email** (\`name.initial2024csecs@sece.ac.in\`).\n`;
  mdContent += `> Each student is strictly mapped to their house (**GREEN**, **BLUE**, **RED**, **PURPLE**). Their earned points automatically feed their house's leaderboard standing.\n\n`;

  mdContent += `| Sl. No. | Roll No (Username) | Name | Assigned House | Official College Email | Default Password |\n`;
  mdContent += `| :---: | :---: | :--- | :---: | :--- | :--- |\n`;

  credentialsList.forEach((c, idx) => {
    mdContent += `| ${idx + 1} | **\`${c.rollNo}\`** | ${c.name} | **${c.house}** | \`${c.email}\` | \`${c.password}\` |\n`;
  });

  mdContent += `\n---\n\n`;
  mdContent += `### First-Time Login Instructions\n`;
  mdContent += `1. Go to the login page (\`/login\`).\n`;
  mdContent += `2. In the **Roll Number / College Email** field, type your Roll No (e.g. \`24SY052\`) or your full email (\`sreejesh.s2024csecs@sece.ac.in\`).\n`;
  mdContent += `3. Enter your assigned default password.\n`;
  mdContent += `4. Upon login, your account is immediately verified and placed into your designated specialization house.\n`;
  mdContent += `5. You may update your password anytime via user profile settings or the password reset page.\n`;

  fs.writeFileSync(markdownPath, mdContent, "utf8");

  console.log(`✅ Provisioned ${credentialsList.length} student accounts into PostgreSQL successfully!`);
  console.log(`📄 Saved credentials table to ${markdownPath}`);
}

main()
  .catch((e) => {
    console.error("Provisioning failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
