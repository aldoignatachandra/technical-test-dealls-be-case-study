-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,        -- who performed the change, foreign key to employees.id
    table_name varchar(255) NOT NULL,
    record_id uuid,      -- the ID of the record that was changed (assuming UUID primary keys)
    action varchar(50),  -- e.g., 'insert', 'update', 'delete'
    module varchar(50), -- e.g., 'employee', 'department'
    ip_address VARCHAR(255) NULL,     -- origin of the request
    user_agent TEXT NULL,
    additional_data JSONB NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT audit_logs_pk PRIMARY KEY (id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES public.employees(id)
);

-- Index for audit_logs table (commonly needed for fast querying on table_name or user_id)
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
