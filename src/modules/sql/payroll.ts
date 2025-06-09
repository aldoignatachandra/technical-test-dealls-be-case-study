import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { CreatePayrollResponse, CreatePayroll, UserRes } from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";
import { currDate, getWorkingDays } from "../../helpers/times";
import { DateTime } from "luxon";

const tablePayrollPeriod = escapeIdentifier(tableName.PAYROLL_PERIODS);
const tableEmployee = escapeIdentifier(tableName.EMPLOYEES);
const tablePayslip = escapeIdentifier(tableName.PAYSLIPS);
const tableOvertime = escapeIdentifier(tableName.OVERTIME);
const tableReimbursement = escapeIdentifier(tableName.REIMBURSEMENTS);
const tableAttendance = escapeIdentifier(tableName.ATTENDANCE);

const db = new Pool(pgConnection);

// Builder For Generate Payroll Employee Payslips
export const StoreBuilder = async (
  body: CreatePayroll,
  user: UserRes
): Promise<CreatePayrollResponse> => {
  // Calculate working days in the payroll period
  const workingDays = getWorkingDays(body.start_date, body.end_date);

  await db.query("BEGIN");

  // Update payroll period status to 'closed'
  const queryUpdatePayrollPeriod = {
    text: `
      UPDATE ${tablePayrollPeriod}
      SET status = 'closed', updated_by = $1, processed_at = $2, processed_by = $3
      WHERE id = $4 AND status = 'open';
    `,
    values: [user.id, currDate(), user.id, body.payroll_period_id],
  };
  await db.query(queryUpdatePayrollPeriod);

  // Get Data All Employees In Payroll Period
  const queryCountEmployees = {
    text: `
        SELECT DISTINCT ta.employee_id, te.salary
        FROM ${tableAttendance} ta JOIN ${tableEmployee} te ON ta.employee_id = te.id
        WHERE payroll_period_id = $1
    `,
    values: [body.payroll_period_id],
  };
  const employees = await db.query(queryCountEmployees);

  // Total payslips array to store generated payslips
  const payslips: Array<{
    id: string;
    employee_id: string;
    total_amount: number;
  }> = [];

  // Process payroll for each employee
  for (const employee of employees.rows) {
    // Calculate attendance
    const queryCountAttendance = {
      text: `
          SELECT COUNT(DISTINCT attendance_date)::int as attendance_count
          FROM ${tableAttendance}
          WHERE employee_id = $1 AND payroll_period_id = $2
        `,
      values: [employee.employee_id, body.payroll_period_id],
    };
    const attendanceResult = await db.query(queryCountAttendance);
    const attendanceCount = attendanceResult.rows[0].attendance_count;

    // Calculate per-day salary
    const dailySalary = Number(employee.salary) / workingDays;
    const attendanceAmount = dailySalary * attendanceCount;

    // Calculate overtime
    const queryCountOvertime = {
      text: `
          SELECT COALESCE(SUM(hours), 0) as total_hours
          FROM ${tableOvertime}
          WHERE employee_id = $1 AND payroll_period_id = $2
        `,
      values: [employee.employee_id, body.payroll_period_id],
    };
    const overtimeResult = await db.query(queryCountOvertime);
    const totalOvertimeHours = overtimeResult.rows[0].total_hours;

    // Calculate overtime amount (assuming 1.5x hourly rate)
    const hourlyRate = employee.salary / (workingDays * 8);
    const overtimeAmount = totalOvertimeHours * hourlyRate * 1.5;

    // Calculate reimbursement
    const queryCountReimbursement = {
      text: `
          SELECT COALESCE(SUM(amount), 0) as total_amount
          FROM ${tableReimbursement}
          WHERE employee_id = $1 AND payroll_period_id = $2
        `,
      values: [employee.employee_id, body.payroll_period_id],
    };
    const reimbursementResult = await db.query(queryCountReimbursement);
    const reimbursementAmount = reimbursementResult.rows[0].total_amount;

    // Calculate total amount
    const totalAmount =
      Number(attendanceAmount) +
      Number(overtimeAmount) +
      Number(reimbursementAmount);

    // Create payslip each employee
    const payslipQuery = {
      text: `
          INSERT INTO ${tablePayslip} (
            employee_id, payroll_period_id, base_salary, month_working_days,
            attendance_count, attendance_amount, overtime_hours, overtime_amount,
            reimbursement_amount, total_amount, total_take_home,
            generated_at, created_by, updated_by
          )
          VALUES ($1, $2, $3, $4, $5, round($6::numeric, 2), $7, round($8::numeric, 2), round($9::numeric, 2), round($10::numeric, 2), round($11::numeric, 2), $12, $13, $14)
          RETURNING id;
        `,
      values: [
        employee.employee_id,
        body.payroll_period_id,
        employee.salary,
        workingDays,
        attendanceCount,
        attendanceAmount,
        totalOvertimeHours,
        overtimeAmount,
        reimbursementAmount,
        totalAmount,
        totalAmount, // Assuming total take home is same as total amount
        currDate(),
        user.id,
        user.id,
      ],
    };
    const payslipResult = await db.query(payslipQuery);

    payslips.push({
      id: payslipResult.rows[0].id,
      employee_id: employee.id,
      total_amount: totalAmount,
    });
  }

  await db.query("COMMIT");

  return {
    payroll_period_id: body.payroll_period_id,
    processed_at: DateTime.now().toJSDate(),
    payslips_count: payslips.length,
    payslips: payslips,
  };
};

// Check if payroll period already has generated payslips
export const CheckGeneratedPayroll = async (body: {
  id: string;
}): Promise<boolean> => {
  const query = {
    text: `SELECT COUNT(*) as count FROM ${tablePayslip} WHERE payroll_period_id = $1`,
    values: [body.id],
  };
  const result = await db.query(query);

  return result.rows[0].count > 0;
};
