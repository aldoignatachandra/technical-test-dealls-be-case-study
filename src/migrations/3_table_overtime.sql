-- Table: overtime
CREATE TABLE IF NOT EXISTS public.overtime (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    overtime_date date NOT NULL,
    hours numeric NOT NULL,  -- hours of overtime (application should enforce <=3 per day)
    submitted_at timestamp with time zone NOT NULL DEFAULT now(),
    payroll_period_id uuid,  -- nullable until payroll is processed
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT overtime_pk PRIMARY KEY (id),
    CONSTRAINT fk_overtime_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id),
    CONSTRAINT fk_overtime_payroll FOREIGN KEY (payroll_period_id) REFERENCES public.payroll_periods(id)
);

-- Indexes for overtime table
CREATE INDEX IF NOT EXISTS idx_overtime_employee ON public.overtime(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_date ON public.overtime(overtime_date);

-- Create or replace trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION overtime_update_timestamp()
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

-- Create trigger for the overtime table
DROP TRIGGER IF EXISTS overtime_set_timestamp ON public.overtime;
CREATE TRIGGER overtime_set_timestamp
BEFORE INSERT OR UPDATE ON public.overtime
FOR EACH ROW
EXECUTE FUNCTION overtime_update_timestamp();
