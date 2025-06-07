import { log } from "../../helpers/logger";
import { CreatePayrollPeriod, UserRes } from "../../types";
import { StoreBuilder } from "../sql/payroll_period";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";

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
