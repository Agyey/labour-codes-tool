const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      email: {
        in: ["shreeyash1998@gmail.com", "agyey1997@gmail.com"]
      }
    },
    data: { role: "admin" }
  })
  console.log("Updated users:", result.count)
}

main().catch(console.error).finally(() => prisma.$disconnect())
