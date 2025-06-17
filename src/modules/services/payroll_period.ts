import { log } from "../../helpers/logger";
import {
  CreatePayrollPeriod,
  IdParam,
  PaginationResponse,
  PayrollPeriodData,
  PayrollPeriodSearch,
  UserRes,
} from "../../types";
import { SearchPayrollPeriodBuilder, ShowBuilder, StoreBuilder } from "../sql/payroll_period";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";
import { PaginationBuilder } from "../../helpers/pagination";

export const createPayrollPeriod = async (
  body: CreatePayrollPeriod,
  user: UserRes
): Promise<string> => {
  const data = await StoreBuilder(body, user);
  const bodyExt = body as CreatePayrollPeriod & {
    ip_address?: string;
    user_agent?: string;
  };

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.PAYROLL_PERIODS,
    record_id: data,
    action: actionType.CREATE,
    module: moduleName.PAYROLL_PERIOD,
    ip_address: bodyExt.ip_address,
    user_agent: bodyExt.user_agent,
    additional_data: { payroll_period_id: data },
  });

  const ctx = "create-payroll-period";
  const logMsg = `Success create new data payroll period with id ( ${data} ) - ${user.username}`;
  log(ctx, logMsg, `${user.name}`);

  return data;
};

export const indexPayrollPeriod = async (
  params: PayrollPeriodSearch
): Promise<PaginationResponse> => {
  const { data, total, total_row } = await SearchPayrollPeriodBuilder(params);
  const paginationMeta = PaginationBuilder(params, total, total_row);
  return { data, ...paginationMeta };
};

export const show = async (params: IdParam): Promise<PayrollPeriodData> => {
  return await ShowBuilder(params);
};
