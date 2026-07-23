-- AlterTable
ALTER TABLE "form_indicators" ADD COLUMN     "score_weight" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "report_instances" ADD COLUMN     "indicator_score" DECIMAL(5,2),
ADD COLUMN     "is_elaboration_on_time" BOOLEAN,
ADD COLUMN     "is_review_on_time" BOOLEAN,
ADD COLUMN     "sla_deflator_applied" DECIMAL(5,2),
ADD COLUMN     "total_score" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "sla_approval_business_day" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "sla_deflator_score" DECIMAL(5,2) NOT NULL DEFAULT 2,
ADD COLUMN     "sla_elaboration_business_day" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "sla_reproval_extension_days" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "sla_review_business_day" INTEGER NOT NULL DEFAULT 8;
