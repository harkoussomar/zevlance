CREATE OR REPLACE FUNCTION prevent_admin_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'admin_audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_audit_logs_no_update ON admin_audit_logs;
CREATE TRIGGER trg_admin_audit_logs_no_update
BEFORE UPDATE ON admin_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_admin_audit_log_mutation();

DROP TRIGGER IF EXISTS trg_admin_audit_logs_no_delete ON admin_audit_logs;
CREATE TRIGGER trg_admin_audit_logs_no_delete
BEFORE DELETE ON admin_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_admin_audit_log_mutation();
