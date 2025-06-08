-- Table: reimbursements
CREATE TABLE IF NOT EXISTS public.reimbursements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    reimbursement_date date NOT NULL,
    description text,
    submitted_at timestamp with time zone NOT NULL DEFAULT now(),
    payroll_period_id uuid,  -- ties to a payroll cycle
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT reimbursements_pk PRIMARY KEY (id),
    CONSTRAINT fk_reimbursements_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id),
    CONSTRAINT fk_reimbursements_payroll FOREIGN KEY (payroll_period_id) REFERENCES public.payroll_periods(id)
);

-- Indexes for reimbursements table
CREATE INDEX IF NOT EXISTS idx_reimbursements_employee ON public.reimbursements(employee_id);

-- Create or replace trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION reimbursements_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = now();
        NEW.updated_at = now();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = now();
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the reimbursements table
DROP TRIGGER IF EXISTS reimbursements_set_timestamp ON public.reimbursements;
CREATE TRIGGER reimbursements_set_timestamp
BEFORE INSERT OR UPDATE ON public.reimbursements
FOR EACH ROW
EXECUTE FUNCTION reimbursements_update_timestamp();
