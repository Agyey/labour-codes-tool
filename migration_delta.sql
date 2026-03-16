-- AlterTable
ALTER TABLE "Provision" ADD COLUMN     "framework_id" TEXT;

-- CreateTable
CREATE TABLE "Framework" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "org_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "org_id" TEXT,
    "name" TEXT NOT NULL,
    "incorporation_date" TIMESTAMP(3),
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCompliance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "provision_id" TEXT NOT NULL,
    "applicability" TEXT NOT NULL DEFAULT 'Applicable',
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "next_audit_date" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "CompanyCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementVariable" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',

    CONSTRAINT "AgreementVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementInstance" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "company_id" TEXT,
    "name" TEXT NOT NULL,
    "filled_variables" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapTableEntry" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "round_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pre_money_val" DOUBLE PRECISION,
    "post_money_val" DOUBLE PRECISION,
    "shares_issued" INTEGER NOT NULL,
    "price_per_share" DOUBLE PRECISION,
    "investor_name" TEXT NOT NULL,
    "compliance_check" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "CapTableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateHygieneLog" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "potential_penalty" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "CorporateHygieneLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessContract" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "contract_type" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "value" DOUBLE PRECISION,
    "key_obligations" TEXT,

    CONSTRAINT "BusinessContract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Provision" ADD CONSTRAINT "Provision_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "Framework"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCompliance" ADD CONSTRAINT "CompanyCompliance_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementVariable" ADD CONSTRAINT "AgreementVariable_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "AgreementTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementInstance" ADD CONSTRAINT "AgreementInstance_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "AgreementTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementInstance" ADD CONSTRAINT "AgreementInstance_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapTableEntry" ADD CONSTRAINT "CapTableEntry_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateHygieneLog" ADD CONSTRAINT "CorporateHygieneLog_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContract" ADD CONSTRAINT "BusinessContract_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

