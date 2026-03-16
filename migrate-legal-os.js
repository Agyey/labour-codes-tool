/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    await client.connect();
    console.log("Connected to Railway database.");

    const ddl = `
CREATE TABLE IF NOT EXISTS "Act" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "enacted_at" TIMESTAMP(3),
  CONSTRAINT "Act_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ActSection" (
  "id" TEXT NOT NULL,
  "act_id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  CONSTRAINT "ActSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ComplianceObligation" (
  "id" TEXT NOT NULL,
  "section_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "trigger_event" TEXT,
  "applicable_entity" TEXT,
  "authority" TEXT,
  "required_form" TEXT,
  "filing_timeline" TEXT,
  "penalty_desc" TEXT,
  CONSTRAINT "ComplianceObligation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScenarioTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "ScenarioTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScenarioRule" (
  "id" TEXT NOT NULL,
  "scenario_id" TEXT NOT NULL,
  "obligation_id" TEXT NOT NULL,
  CONSTRAINT "ScenarioRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ScenarioRule_scenario_id_obligation_id_key" ON "ScenarioRule"("scenario_id", "obligation_id");

CREATE TABLE IF NOT EXISTS "Matter" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "scenario_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Matter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MatterMember" (
  "id" TEXT NOT NULL,
  "matter_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  CONSTRAINT "MatterMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MatterMember_matter_id_user_id_key" ON "MatterMember"("matter_id", "user_id");

CREATE TABLE IF NOT EXISTS "TaskTemplate" (
  "id" TEXT NOT NULL,
  "obligation_id" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'Structuring',
  CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT NOT NULL,
  "matter_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'Structuring',
  "status" TEXT NOT NULL DEFAULT 'To Do',
  "due_date" TIMESTAMP(3),
  "assignee_id" TEXT,
  "dependency_id" TEXT,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MatterDocument" (
  "id" TEXT NOT NULL,
  "matter_id" TEXT NOT NULL,
  "task_id" TEXT,
  "name" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatterDocument_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ActSection" DROP CONSTRAINT IF EXISTS "ActSection_act_id_fkey";
ALTER TABLE "ActSection" ADD CONSTRAINT "ActSection_act_id_fkey" FOREIGN KEY ("act_id") REFERENCES "Act"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ComplianceObligation" DROP CONSTRAINT IF EXISTS "ComplianceObligation_section_id_fkey";
ALTER TABLE "ComplianceObligation" ADD CONSTRAINT "ComplianceObligation_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "ActSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScenarioRule" DROP CONSTRAINT IF EXISTS "ScenarioRule_scenario_id_fkey";
ALTER TABLE "ScenarioRule" ADD CONSTRAINT "ScenarioRule_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "ScenarioTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScenarioRule" DROP CONSTRAINT IF EXISTS "ScenarioRule_obligation_id_fkey";
ALTER TABLE "ScenarioRule" ADD CONSTRAINT "ScenarioRule_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "ComplianceObligation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Matter" DROP CONSTRAINT IF EXISTS "Matter_scenario_id_fkey";
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "ScenarioTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MatterMember" DROP CONSTRAINT IF EXISTS "MatterMember_matter_id_fkey";
ALTER TABLE "MatterMember" ADD CONSTRAINT "MatterMember_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatterMember" DROP CONSTRAINT IF EXISTS "MatterMember_user_id_fkey";
ALTER TABLE "MatterMember" ADD CONSTRAINT "MatterMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskTemplate" DROP CONSTRAINT IF EXISTS "TaskTemplate_obligation_id_fkey";
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "ComplianceObligation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_matter_id_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assignee_id_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_dependency_id_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_dependency_id_fkey" FOREIGN KEY ("dependency_id") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MatterDocument" DROP CONSTRAINT IF EXISTS "MatterDocument_matter_id_fkey";
ALTER TABLE "MatterDocument" ADD CONSTRAINT "MatterDocument_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatterDocument" DROP CONSTRAINT IF EXISTS "MatterDocument_task_id_fkey";
ALTER TABLE "MatterDocument" ADD CONSTRAINT "MatterDocument_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `;
    
    await client.query(ddl);
    console.log("Migration executed successfully!");
    
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
