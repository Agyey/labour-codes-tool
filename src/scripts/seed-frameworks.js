/* eslint-disable */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CODES = {
  CoW: {
    n: "Code on Wages, 2019",
    s: "CoW",
    desc: "Amalgamates Payment of Wages Act, Minimum Wages Act, Payment of Bonus Act, and Equal Remuneration Act."
  },
  IRC: {
    n: "Industrial Relations Code, 2020",
    s: "IRC",
    desc: "Amalgamates Trade Unions Act, Industrial Employment (Standing Orders) Act, and Industrial Disputes Act."
  },
  CoSS: {
    n: "Code on Social Security, 2020",
    s: "CoSS",
    desc: "Amalgamates 9 major social security laws including EPF, ESI, Maternity Benefit, and Gratuity."
  },
  OSHW: {
    n: "OSH & Working Conditions Code, 2020",
    s: "OSHW",
    desc: "Amalgamates 13 labour laws relating to safety, health and working conditions of workers."
  },
};

async function main() {
  console.log("Seeding Legal Frameworks...");
  
  for (const [key, code] of Object.entries(CODES)) {
    // Check if framework already exists
    let framework = await prisma.framework.findFirst({
      where: { name: code.n }
    });
    
    if (!framework) {
      console.log(`Creating framework: ${code.n}`);
      framework = await prisma.framework.create({
        data: {
          name: code.n,
          description: code.desc
        }
      });
    } else {
      console.log(`Framework ${code.n} already exists with ID: ${framework.id}`);
    }
    
    // Update existing provisions that belong to this code
    console.log(`Linking provisions for code: ${code.s} to framework: ${framework.id}`);
    const updateResult = await prisma.provision.updateMany({
      where: { 
        code: code.s,
        framework_id: null 
      },
      data: {
        framework_id: framework.id
      }
    });
    
    console.log(`Updated ${updateResult.count} provisions for ${code.n}.`);
  }
  
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
