-- Trilha de Auditoria Continua (Secao 6 do PROMPT.md)
--
-- Funcao generica de trigger: grava em audit_logs o estado anterior/novo de
-- qualquer linha alterada nas tabelas monitoradas. O autor da alteracao e
-- lido de uma variavel de sessao (`app.current_user_id`) que a aplicacao
-- deve definir via `SET LOCAL app.current_user_id = '<uuid>'` dentro da
-- mesma transacao antes de gravar (ex.: em um middleware/interceptor do
-- Prisma). Se a variavel nao estiver definida, o autor fica nulo.
CREATE OR REPLACE FUNCTION fn_write_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  BEGIN
    v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF (TG_OP = 'UPDATE') THEN
    IF to_jsonb(OLD) IS NOT DISTINCT FROM to_jsonb(NEW) THEN
      RETURN NEW;
    END IF;
    INSERT INTO audit_logs (id, table_name, record_id, action, user_id, previous_value, new_value, changed_at)
    VALUES (gen_random_uuid(), TG_TABLE_NAME, NEW.id::text, 'UPDATE', v_user_id, to_jsonb(OLD), to_jsonb(NEW), now());
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (id, table_name, record_id, action, user_id, previous_value, new_value, changed_at)
    VALUES (gen_random_uuid(), TG_TABLE_NAME, NEW.id::text, 'INSERT', v_user_id, NULL, to_jsonb(NEW), now());
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- "Toda modificacao de valor" e "Alteracao no Estado Residente": ambas
-- materializadas em indicator_responses (o campo is_resident_state do
-- indicador de origem marca quais respostas representam Estado Residente).
CREATE TRIGGER trg_audit_indicator_responses
AFTER INSERT OR UPDATE ON indicator_responses
FOR EACH ROW EXECUTE FUNCTION fn_write_audit_log();

-- "Upload de nova evidencia".
CREATE TRIGGER trg_audit_evidence_files
AFTER INSERT OR UPDATE ON evidence_files
FOR EACH ROW EXECUTE FUNCTION fn_write_audit_log();

-- Garante que uma evidencia pertence exatamente a uma resposta de indicador
-- OU a um registro de validacao (contraprova do Aprovador), nunca ambos ou
-- nenhum.
ALTER TABLE evidence_files
  ADD CONSTRAINT chk_evidence_files_single_owner
  CHECK (
    (indicator_response_id IS NOT NULL AND validation_record_id IS NULL)
    OR (indicator_response_id IS NULL AND validation_record_id IS NOT NULL)
  );

-- Imutabilidade do audit_logs: nenhuma UPDATE ou DELETE e permitida, nem
-- mesmo pelo Administrador via aplicacao.
CREATE OR REPLACE FUNCTION fn_prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs e imutavel: % nao e permitido', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_log_mutation();
