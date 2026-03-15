import { PrismaClient } from '@prisma/client'
import { SEED_PROVISIONS } from '../src/data/seed-provisions'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  for (const p of SEED_PROVISIONS) {
    const provision = await prisma.provision.create({
      data: {
        code: p.code,
        chapter: p.ch,
        chapter_name: p.chName,
        section: p.sec,
        sub_section: p.sub,
        title: p.title,
        summary: p.summary,
        full_text: p.fullText,
        impact: p.impact,
        rule_authority: p.ruleAuth,
        change_tags: p.changeTags,
        workflow_tags: p.workflowTags || [],
        penalty_old: p.penaltyOld,
        penalty_new: p.penaltyNew,
        notes: p.notes,
        assignee: p.assignee,
        due_date: p.dueDate ? new Date(p.dueDate) : null,
        verified: p.verified || false,
        pinned: p.pinned || false,
        
        oldMappings: {
          create: p.oldMappings?.map((m: any) => ({
            act_name: m.act,
            section: m.sec,
            summary: m.summary,
            full_text: m.fullText,
            change_description: m.change,
            change_tags: m.changeTags || [],
          })) || [],
        },
        
        complianceItems: {
          create: p.compItems?.map((c: any) => ({
            task: c.task,
            assignee: c.assignee,
            status: c.status || 'Not Started',
            due_date: c.due ? new Date(c.due) : null,
          })) || [],
        },
        
        stateData: {
          create: Object.entries(p.stateNotes || {}).map(([state, notes]) => ({
            state,
            notes: typeof notes === 'string' ? notes : null,
            rule_text: null,
            compliance_status: 'Not Started',
          })) || [],
        },
      },
    })
    console.log(`Created provision with id: ${provision.id}`)
  }
  
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
