/* eslint-disable */
const { Client } = require('pg');
const crypto = require('crypto');

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

// Generate cuid-like ID (since Prisma uses cuid, we can use a random hex string or simple UUID)
const generateId = () => 'c' + crypto.randomBytes(11).toString('hex');

async function main() {
  const connectionString = "postgresql://postgres:KDOPAXAcyFMApecAtoxHxlSxzVlsSmRl@turntable.proxy.rlwy.net:13912/railway";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to Railway Postgres via pg client");
    
    for (const [key, code] of Object.entries(CODES)) {
      // Check if framework exists
      const checkRes = await client.query('SELECT id FROM "Framework" WHERE name = $1 LIMIT 1', [code.n]);
      let frameworkId;
      
      if (checkRes.rows.length === 0) {
        console.log(`Creating framework: ${code.n}`);
        frameworkId = generateId(); // Prisma compatible ID
        await client.query(
          'INSERT INTO "Framework" (id, name, description, created_at) VALUES ($1, $2, $3, NOW())',
          [frameworkId, code.n, code.desc]
        );
      } else {
        frameworkId = checkRes.rows[0].id;
        console.log(`Framework ${code.n} already exists with ID: ${frameworkId}`);
      }
      
      // Update provisions
      console.log(`Linking provisions for code: ${code.s} to framework: ${frameworkId}`);
      const updateRes = await client.query(
        'UPDATE "Provision" SET framework_id = $1 WHERE code = $2 AND framework_id IS NULL',
        [frameworkId, code.s]
      );
      
      console.log(`Updated ${updateRes.rowCount} provisions for ${code.n}.`);
    }
    
    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("Database operation failed", err);
  } finally {
    await client.end();
  }
}

main();
