-- Table: attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL,
    attendance_date date NOT NULL,
    submitted_at timestamp with time zone NOT NULL DEFAULT now(),
    payroll_period_id uuid,  -- can be null if not yet associated to a payroll period
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT attendance_pk PRIMARY KEY (id),
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id),
    CONSTRAINT fk_attendance_payroll FOREIGN KEY (payroll_period_id) REFERENCES public.payroll_periods(id)
);

-- Indexes for attendance table
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);

-- Create or replace trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION attendance_update_timestamp()
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

-- Create trigger for the attendance table
DROP TRIGGER IF EXISTS attendance_set_timestamp ON public.attendance;
CREATE TRIGGER attendance_set_timestamp
BEFORE INSERT OR UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION attendance_update_timestamp();
