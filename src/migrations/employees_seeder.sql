-- src/migrations/faker_seeder.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert 1 fake admin
INSERT INTO public.employees (id, username, name, password, salary, role)
VALUES (gen_random_uuid(), 'admin', 'Admin User', crypt('admin123', gen_salt('bf')), 10000, 'admin');

-- Insert 100 fake employees
INSERT INTO public.employees (id, username, name, password, salary, role, created_by, updated_by)
SELECT gen_random_uuid(),'employee_' || gs, 'Employee ' || gs, crypt('employee123', gen_salt('bf')), round(((random() * 5000) + 3000)::numeric, 0), 'employee', admin.id, admin.id
FROM generate_series(1, 100) AS gs, (SELECT id FROM public.employees WHERE role = 'admin' LIMIT 1) AS admin;
