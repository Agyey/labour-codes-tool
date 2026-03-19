
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Fetching frameworks...")
  const frameworks = await prisma.framework.findMany()
  console.log("Current Frameworks:", JSON.stringify(frameworks, null, 2))
  
  console.log("Checking for unique constraints on short_name...")
  try {
    const test = await prisma.framework.create({
      data: {
        name: "Test Framework " + Date.now(),
        short_name: "TEST_" + Date.now(),
      }
    })
    console.log("Creation successful:", test.id)
    await prisma.framework.delete({ where: { id: test.id } })
    console.log("Cleanup successful.")
  } catch (err) {
    console.error("Test creation failed:", err)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
