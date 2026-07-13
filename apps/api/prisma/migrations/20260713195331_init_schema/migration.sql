-- CreateEnum
CREATE TYPE "role_name" AS ENUM ('OBSERVADOR', 'ELABORADOR', 'REVISOR', 'APROVADOR', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "unit_level" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "goal_operator" AS ENUM ('GTE', 'LTE', 'EQ', 'GT', 'LT');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('PENDENTE', 'EM_REVISAO', 'PENDENTE_APROVACAO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "indicator_validation_status" AS ENUM ('EM_REVISAO', 'PENDENTE_VALIDACAO', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "validation_verdict" AS ENUM ('APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('INSERT', 'UPDATE');

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "logo_url" TEXT,
    "level" "unit_level" NOT NULL,
    "form_template_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "role_name" NOT NULL,
    "primary_unit_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_unit_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_unit_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_topics" (
    "id" TEXT NOT NULL,
    "form_template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_indicators" (
    "id" TEXT NOT NULL,
    "form_topic_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "variable_keys" TEXT[],
    "formula_expression" TEXT NOT NULL,
    "goal_operator" "goal_operator" NOT NULL,
    "goal_value" DECIMAL(18,4) NOT NULL,
    "is_resident_state" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_instances" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "form_template_id" TEXT NOT NULL,
    "reference_month" DATE NOT NULL,
    "status" "report_status" NOT NULL DEFAULT 'PENDENTE',
    "elaboration_due_date" DATE NOT NULL,
    "review_due_date" DATE NOT NULL,
    "approval_due_date" DATE NOT NULL,
    "reproval_count" INTEGER NOT NULL DEFAULT 0,
    "sla_extension_due_date" DATE,
    "submitted_for_review_at" TIMESTAMP(3),
    "submitted_for_approval_at" TIMESTAMP(3),
    "concluded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicator_responses" (
    "id" TEXT NOT NULL,
    "report_instance_id" TEXT NOT NULL,
    "form_indicator_id" TEXT NOT NULL,
    "snapshot_title" TEXT NOT NULL,
    "snapshot_objective" TEXT NOT NULL,
    "snapshot_variable_keys" TEXT[],
    "snapshot_formula_expression" TEXT NOT NULL,
    "snapshot_goal_operator" "goal_operator" NOT NULL,
    "snapshot_goal_value" DECIMAL(18,4) NOT NULL,
    "variable_values" JSONB NOT NULL DEFAULT '{}',
    "calculated_value" DECIMAL(18,4),
    "is_compliant" BOOLEAN,
    "is_cloned_from_resident" BOOLEAN NOT NULL DEFAULT false,
    "validation_status" "indicator_validation_status" NOT NULL DEFAULT 'EM_REVISAO',
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicator_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_files" (
    "id" TEXT NOT NULL,
    "indicator_response_id" TEXT,
    "validation_record_id" TEXT,
    "file_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by_user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_records" (
    "id" TEXT NOT NULL,
    "indicator_response_id" TEXT NOT NULL,
    "aprovador_user_id" TEXT NOT NULL,
    "verdict" "validation_verdict" NOT NULL,
    "justification" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" "audit_action" NOT NULL,
    "user_id" TEXT,
    "previous_value" JSONB,
    "new_value" JSONB,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_sigla_key" ON "units"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "users_matricula_key" ON "users"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_unit_access_user_id_unit_id_key" ON "user_unit_access"("user_id", "unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_templates_name_key" ON "form_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "report_instances_unit_id_reference_month_key" ON "report_instances"("unit_id", "reference_month");

-- CreateIndex
CREATE UNIQUE INDEX "indicator_responses_report_instance_id_form_indicator_id_key" ON "indicator_responses"("report_instance_id", "form_indicator_id");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_record_id_idx" ON "audit_logs"("table_name", "record_id");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "form_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_primary_unit_id_fkey" FOREIGN KEY ("primary_unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_unit_access" ADD CONSTRAINT "user_unit_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_unit_access" ADD CONSTRAINT "user_unit_access_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_topics" ADD CONSTRAINT "form_topics_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_indicators" ADD CONSTRAINT "form_indicators_form_topic_id_fkey" FOREIGN KEY ("form_topic_id") REFERENCES "form_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_instances" ADD CONSTRAINT "report_instances_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_instances" ADD CONSTRAINT "report_instances_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_responses" ADD CONSTRAINT "indicator_responses_report_instance_id_fkey" FOREIGN KEY ("report_instance_id") REFERENCES "report_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_responses" ADD CONSTRAINT "indicator_responses_form_indicator_id_fkey" FOREIGN KEY ("form_indicator_id") REFERENCES "form_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_responses" ADD CONSTRAINT "indicator_responses_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_files" ADD CONSTRAINT "evidence_files_indicator_response_id_fkey" FOREIGN KEY ("indicator_response_id") REFERENCES "indicator_responses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_files" ADD CONSTRAINT "evidence_files_validation_record_id_fkey" FOREIGN KEY ("validation_record_id") REFERENCES "validation_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_files" ADD CONSTRAINT "evidence_files_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_records" ADD CONSTRAINT "validation_records_indicator_response_id_fkey" FOREIGN KEY ("indicator_response_id") REFERENCES "indicator_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_records" ADD CONSTRAINT "validation_records_aprovador_user_id_fkey" FOREIGN KEY ("aprovador_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
