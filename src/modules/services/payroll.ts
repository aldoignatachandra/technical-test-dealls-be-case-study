import { log } from "../../helpers/logger";
import {
  CheckEmployeePayslip,
  CreatePayroll,
  CreatePayrollResponse,
  EmployeePayslip,
  IdParam,
  PayrollData,
  PayrollPeriodData,
  UserRes,
} from "../../types";
import {
  ShowBuilder,
  StoreBuilder,
  ShowDetailPayslipsByPeriodBuilder,
  EmployeeSummaryByPeriodBuilder,
} from "../sql/payroll";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";

export const createPayroll = async (
  body: CreatePayroll,
  user: UserRes
): Promise<CreatePayrollResponse> => {
  const data = await StoreBuilder(body, user);
  const bodyExt = body as CreatePayroll & {
    ip_address?: string;
    user_agent?: string;
  };

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.PAYSLIPS,
    record_id: body.payroll_period_id,
    action: actionType.CREATE,
    module: moduleName.PAYSLIPS,
    ip_address: bodyExt.ip_address,
    user_agent: bodyExt.user_agent,
    additional_data: {
      description: "Generated Payroll",
      payroll_period_id: body.payroll_period_id,
      start_date: body.start_date,
      end_date: body.end_date,
      payslips_count: data.payslips.length,
      processed_at: data.processed_at,
    },
  });

  const ctx = "create-payroll";
  const logMsg = `Success create new data payroll with id ( ${data} ) - ${user.username}`;
  log(ctx, logMsg, `${user.name}`);

  return data;
};

// Show Minimal Employee Payslips Data
export const show = async (body: CheckEmployeePayslip): Promise<PayrollData> => {
  return await ShowBuilder(body);
};

// Show Detail Employee Payslips Data
export const showDetailPayslips = async (
  body: PayrollData,
  user: UserRes
): Promise<EmployeePayslip> => {
  return await ShowDetailPayslipsByPeriodBuilder(body, user);
};

export const SummaryPayslipsByPeriod = async (
  body: PayrollPeriodData,
  user: UserRes
): Promise<any> => {
  return await EmployeeSummaryByPeriodBuilder(body, user);
};
