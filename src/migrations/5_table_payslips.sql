-- Table: payslips
CREATE TABLE IF NOT EXISTS public.payslips (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    payroll_period_id uuid NOT NULL,
    base_salary numeric(12,2) NOT NULL,
    attendance_bonus numeric(12,2),        -- prorated adjustment based on attendance
    overtime_amount numeric(12,2),         -- calculated using double rate based on overtime hours
    reimbursement_total numeric(12,2),
    total_take_home numeric(12,2),         -- sum of all components
    generated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT payslips_pk PRIMARY KEY (id),
    CONSTRAINT fk_payslips_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id),
    CONSTRAINT fk_payslips_payroll FOREIGN KEY (payroll_period_id) REFERENCES public.payroll_periods(id)
);

-- Indexes for payslips table
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON public.payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_payroll ON public.payslips(payroll_period_id);

-- Create or replace trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION payslips_update_timestamp()
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

-- Create trigger for the payslips table
DROP TRIGGER IF EXISTS payslips_set_timestamp ON public.payslips;
CREATE TRIGGER payslips_set_timestamp
BEFORE INSERT OR UPDATE ON public.payslips
FOR EACH ROW
EXECUTE FUNCTION payslips_update_timestamp();
