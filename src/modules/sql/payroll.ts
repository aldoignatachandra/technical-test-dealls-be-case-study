import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import {
  CreatePayrollResponse,
  CreatePayroll,
  UserRes,
  PayrollData,
  CheckEmployeePayslip,
  EmployeePayslip,
  PayrollPeriodData,
} from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";
import { currDate, getWorkingDays, isoDate } from "../../helpers/times";
import { DateTime } from "luxon";
import { ShowBuilder as ShowPayrollPeriodBuilder } from "../sql/payroll_period";

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
      Number(Math.round(attendanceAmount)) +
      Number(Math.round(overtimeAmount)) +
      Number(Math.round(reimbursementAmount));

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
        Math.round(attendanceAmount),
        totalOvertimeHours,
        Math.round(overtimeAmount),
        Math.round(reimbursementAmount),
        Math.round(totalAmount),
        Math.round(totalAmount), // Assuming total take home is same as total amount
        currDate(),
        user.id,
        user.id,
      ],
    };
    const payslipResult = await db.query(payslipQuery);

    payslips.push({
      id: payslipResult.rows[0].id,
      employee_id: employee.id,
      total_amount: Math.round(totalAmount),
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

// Show Minimal Employee Payslips Data
export const ShowBuilder = async (
  body: CheckEmployeePayslip
): Promise<PayrollData> => {
  const query = {
    text: `SELECT * FROM ${tablePayslip} WHERE payroll_period_id = $1 AND employee_id = $2 LIMIT 1`,
    values: [body.payroll_period_id, body.employee_id],
  };
  const result = await db.query(query);

  return result.rows[0];
};

// Show Detail Employee Payslips Data
export const ShowDetailPayslipsByPeriodBuilder = async (
  body: PayrollData,
  user: UserRes
): Promise<EmployeePayslip> => {
  // Get the payroll period details
  const period = await ShowPayrollPeriodBuilder({ id: body.payroll_period_id });

  // Get employee details
  const employeeQuery = {
    text: `SELECT id, name, username, salary FROM ${tableEmployee} WHERE id = $1`,
    values: [user.id],
  };

  const employeeResult = await db.query(employeeQuery);
  const employee = employeeResult.rows[0];

  // Get attendance data
  const attendanceQuery = {
    text: `
      SELECT attendance_date
      FROM ${tableAttendance}
      WHERE employee_id = $1 AND payroll_period_id = $2
      ORDER BY attendance_date ASC
    `,
    values: [user.id, period.id],
  };
  const attendanceResult = await db.query(attendanceQuery);
  const attendanceDates = attendanceResult.rows.map((row) =>
    isoDate(row.attendance_date)
  );
  const attendanceCount = attendanceResult.rowCount;

  // Calculate workdays in the period (excluding weekends)
  const workdaysCount = getWorkingDays(period.start_date, period.end_date);

  // Calculate daily rate
  const dailyRate = employee.salary / workdaysCount;

  // Calculate attendance amount
  const attendanceAmount = attendanceCount * dailyRate;

  // Get overtime data
  const overtimeQuery = {
    text: `
      SELECT overtime_date, hours
      FROM ${tableOvertime}
      WHERE employee_id = $1 AND payroll_period_id = $2
      ORDER BY overtime_date ASC
    `,
    values: [user.id, period.id],
  };

  const overtimeResult = await db.query(overtimeQuery);
  const overtimeEntries = overtimeResult.rows;

  // Calculate hourly rate (assuming 8-hour workdays)
  const hourlyRate = dailyRate / 8;

  // Apply overtime multiplier (1.5x for this example)
  const overtimeMultiplier = 1.5;

  // Calculate total overtime hours and amount
  let totalOvertimeHours = 0;
  const overtimeDetails = overtimeEntries.map((entry) => {
    const hours = parseFloat(entry.hours);
    totalOvertimeHours += hours;
    const amount = hours * hourlyRate * overtimeMultiplier;

    return {
      date: isoDate(entry.overtime_date),
      hours,
      amount,
    };
  });

  const overtimeAmount = totalOvertimeHours * hourlyRate * overtimeMultiplier;

  // Get reimbursement data
  const reimbursementQuery = {
    text: `
      SELECT id, reimbursement_date, amount, description
      FROM ${tableReimbursement}
      WHERE employee_id = $1 AND payroll_period_id = $2
      ORDER BY reimbursement_date ASC
    `,
    values: [user.id, period.id],
  };

  const reimbursementResult = await db.query(reimbursementQuery);
  const reimbursements = reimbursementResult.rows.map((item) => ({
    id: item.id,
    date: isoDate(item.reimbursement_date),
    amount: parseFloat(item.amount),
    description: item.description,
  }));

  // Calculate total reimbursement amount
  const reimbursementAmount = reimbursements.reduce(
    (total, item) => total + parseFloat(item.amount),
    0
  );

  const totalTakeHomePay =
    Number(attendanceAmount) +
    Number(overtimeAmount) +
    Number(reimbursementAmount);

  // Check if payslip already exists for this period
  let payslipId = null;
  const payslipQuery = {
    text: `SELECT id FROM ${tablePayslip} WHERE employee_id = $1 AND payroll_period_id = $2`,
    values: [user.id, period.id],
  };

  const payslipResult = await db.query(payslipQuery);
  if (payslipResult.rows.length > 0) {
    payslipId = payslipResult.rows[0].id;
  }

  // Format response
  return {
    payslip_id: payslipId,
    period: {
      id: period.id,
      start_date: isoDate(period.start_date),
      end_date: isoDate(period.end_date),
      status: period.status,
    },
    employee: {
      id: user.id,
      name: user.name,
      username: user.username,
    },
    salary: {
      base_salary: Math.round(employee.salary),
      daily_rate: Math.round(dailyRate),
      hourly_rate: Math.round(hourlyRate),
    },
    attendance: {
      working_days: workdaysCount,
      attended_days: attendanceCount,
      attendance_rate: Number(
        ((attendanceCount / workdaysCount) * 100).toFixed(2)
      ),
      dates: attendanceDates,
      amount: Math.round(attendanceAmount),
    },
    overtime: {
      entries: overtimeDetails,
      total_hours: totalOvertimeHours,
      multiplier: overtimeMultiplier,
      amount: Math.round(overtimeAmount),
    },
    reimbursements: {
      entries: reimbursements,
      amount: Math.round(reimbursementAmount),
    },
    summary: {
      attendance_amount: Math.round(attendanceAmount),
      overtime_amount: Math.round(overtimeAmount),
      reimbursement_amount: Math.round(reimbursementAmount),
      total_take_home_pay: Math.round(totalTakeHomePay),
    },
  };
};

export const EmployeeSummaryByPeriodBuilder = async (
  body: PayrollPeriodData,
  user: UserRes
): Promise<any> => {
  // Get the payroll period details
  const period = body as PayrollPeriodData;

  // Get all employees
  const employeesQuery = {
    text: `SELECT id, name, username, salary FROM ${tableEmployee} WHERE role != 'admin' ORDER BY name ASC`,
    values: [],
  };

  const employeesResult = await db.query(employeesQuery);
  const employees = employeesResult.rows;

  // Calculate payslips for all employees
  const employeePayslips: any = [];
  let totalSalaryAmount = 0;
  let totalAttendanceAmount = 0;
  let totalOvertimeAmount = 0;
  let totalReimbursementAmount = 0;
  let grandTotal = 0;

  for (const employee of employees) {
    // Get attendance data
    const attendanceQuery = {
      text: `
        SELECT COUNT(*)::int as count
        FROM ${tableAttendance}
        WHERE employee_id = $1 AND payroll_period_id = $2
      `,
      values: [employee.id, period.id],
    };

    const attendanceResult = await db.query(attendanceQuery);
    const attendanceCount = attendanceResult.rows[0].count;

    // Calculate workdays in the period (excluding weekends)
    const workdaysCount = getWorkingDays(period.start_date, period.end_date);

    // Calculate daily rate and attendance amount
    const dailyRate = employee.salary / workdaysCount;
    const attendanceAmount = attendanceCount * dailyRate;

    // Get overtime data
    const overtimeQuery = {
      text: `
        SELECT COALESCE(SUM(hours), 0) as total_hours
        FROM ${tableOvertime}
        WHERE employee_id = $1 AND payroll_period_id = $2
      `,
      values: [employee.id, period.id],
    };

    const overtimeResult = await db.query(overtimeQuery);
    const overtimeHours = parseFloat(overtimeResult.rows[0].total_hours || "0");

    // Calculate hourly rate and overtime amount
    const hourlyRate = dailyRate / 8;
    const overtimeMultiplier = 1.5;
    const overtimeAmount = overtimeHours * hourlyRate * overtimeMultiplier;

    // Get reimbursement data
    const reimbursementQuery = {
      text: `
        SELECT COALESCE(SUM(amount), 0) as total_amount
        FROM ${tableReimbursement}
        WHERE employee_id = $1 AND payroll_period_id = $2
      `,
      values: [employee.id, period.id],
    };

    const reimbursementResult = await db.query(reimbursementQuery);
    const reimbursementAmount = parseFloat(
      reimbursementResult.rows[0].total_amount || "0"
    );

    // Calculate take-home pay
    const takeHomePay =
      Number(attendanceAmount) +
      Number(overtimeAmount) +
      Number(reimbursementAmount);

    // Add to summary
    employeePayslips.push({
      employee_id: employee.id,
      name: employee.name,
      username: employee.username,
      base_salary: Math.round(employee.salary),
      attendance: {
        working_days: workdaysCount,
        attended_days: attendanceCount,
        attendance_rate:
          ((attendanceCount / workdaysCount) * 100).toFixed(2) + "%",
        amount: Math.round(attendanceAmount),
      },
      overtime: {
        hours: overtimeHours.toFixed(2),
        amount: Math.round(overtimeAmount),
      },
      reimbursement: {
        amount: Math.round(reimbursementAmount),
      },
      take_home_pay: Math.round(takeHomePay),
    });

    // Update totals
    totalSalaryAmount += Math.round(employee.salary);
    totalAttendanceAmount += Math.round(attendanceAmount);
    totalOvertimeAmount += Math.round(overtimeAmount);
    totalReimbursementAmount += Math.round(reimbursementAmount);
    grandTotal += Math.round(takeHomePay);
  }

  // 4. Format the response
  return {
    period: {
      id: period.id,
      start_date: period.start_date,
      end_date: period.end_date,
      status: period.status,
    },
    summary: {
      employee_count: employees.length,
      total_base_salary: totalSalaryAmount,
      total_attendance_amount: totalAttendanceAmount,
      total_overtime_amount: totalOvertimeAmount,
      total_reimbursement_amount: totalReimbursementAmount,
      grand_total: grandTotal,
    },
    employees: employeePayslips,
  };
};
