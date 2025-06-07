-- Table: employees
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username varchar(255) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    salary numeric NOT NULL,
    role varchar(50) NOT NULL, -- e.g., 'admin' or 'employee'
    token text NULL DEFAULT '', -- JWT token for authentication
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,       -- nullable; references employees.id for audit
    updated_by uuid,       -- nullable; references employees.id for audit
    CONSTRAINT employees_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.employees(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES public.employees(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_username ON public.employees(username);

-- Create or replace trigger function for automatic timestamps
CREATE OR REPLACE FUNCTION employees_update_timestamp()
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

-- Create trigger for the employees table
DROP TRIGGER IF EXISTS employees_set_timestamp ON public.employees;
CREATE TRIGGER employees_set_timestamp
BEFORE INSERT OR UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION employees_update_timestamp();
