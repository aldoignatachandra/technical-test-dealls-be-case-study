-- Table: payroll_periods
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    start_date date NOT NULL,
    end_date date NOT NULL,
    status varchar(50),    -- e.g., 'open', 'closed', 'processed'
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,       -- references public.employees(id)
    processed_at timestamp with time zone,
    processed_by uuid,     -- references public.employees(id)
    CONSTRAINT payroll_periods_pkey PRIMARY KEY (id),
    CONSTRAINT fk_payroll_created_by FOREIGN KEY (created_by) REFERENCES public.employees(id),
    CONSTRAINT fk_payroll_processed_by FOREIGN KEY (processed_by) REFERENCES public.employees(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_periods_start_date ON public.payroll_periods(start_date);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_end_date ON public.payroll_periods(end_date);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_status ON public.payroll_periods(status);

-- Create or replace trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION payroll_periods_update_timestamp()
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

-- Create trigger for the payroll_periods table
DROP TRIGGER IF EXISTS payroll_periods_set_timestamp ON public.payroll_periods;
CREATE TRIGGER payroll_periods_set_timestamp
BEFORE INSERT OR UPDATE ON public.payroll_periods
FOR EACH ROW
EXECUTE FUNCTION payroll_periods_update_timestamp();
