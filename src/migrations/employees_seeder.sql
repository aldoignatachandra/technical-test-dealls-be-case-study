-- src/migrations/faker_seeder.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert 1 fake admin
INSERT INTO public.employees (id, username, name, password, salary, role)
VALUES (gen_random_uuid(), 'admin', 'Admin User', crypt('admin123', gen_salt('bf')), 10000000, 'admin');

-- Insert 100 fake employees with alphabetical sequence (AA, AB, AC, etc.)
WITH alphabet_series AS (
  SELECT chr(65 + (n / 26)) || chr(65 + (n % 26)) AS code, n + 1 AS num
  FROM generate_series(0, 99) AS n
)
INSERT INTO public.employees (id, username, name, password, salary, role, created_by, updated_by)
SELECT 
  gen_random_uuid(),
  'employee_' || LOWER(a.code), 
  'Employee ' || a.code, 
  crypt('employee123', gen_salt('bf')), 
  (ARRAY[5000000, 5500000, 6000000, 6500000, 7000000, 7500000, 8000000, 8500000, 9000000])[floor(random() * 9 + 1)], 
  'employee', 
  admin.id, 
  admin.id
FROM  alphabet_series a, (SELECT id FROM public.employees WHERE role = 'admin' LIMIT 1) AS admin;
