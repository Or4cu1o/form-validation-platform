-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "export_naming_pattern" TEXT NOT NULL DEFAULT 'Relatorio Operacional de Tecnologia da Informacao - {SIGLA_UNIDADE} - {DATA_ISO}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
