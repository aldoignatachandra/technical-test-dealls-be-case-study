import { log } from "../../helpers/logger";
import { IdParam, PaginationResponse, UserRes } from "../../types";
import { SearchOvertimeBuilder, ShowBuilder, StoreBuilder } from "../sql/overtime";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";
import { CreateOvertime, OvertimeData, OvertimeSearch } from "../../types/overtime";
import { PaginationBuilder } from "../../helpers/pagination";

export const createOvertime = async (body: CreateOvertime, user: UserRes): Promise<string> => {
  const data = await StoreBuilder(body, user);
  const bodyExt = body as CreateOvertime & {
    ip_address?: string;
    user_agent?: string;
  };

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.OVERTIME,
    record_id: data,
    action: actionType.CREATE,
    module: moduleName.OVERTIME,
    ip_address: bodyExt.ip_address,
    user_agent: bodyExt.user_agent,
    additional_data: { overtime_id: data },
  });

  const ctx = "create-overtime";
  const logMsg = `Success create new data overtime with id ( ${data} ) - ${user.username}`;
  log(ctx, logMsg, `${user.name}`);

  return data;
};

export const indexOvertime = async (params: OvertimeSearch): Promise<PaginationResponse> => {
  const { data, total, total_row } = await SearchOvertimeBuilder(params);
  const paginationMeta = PaginationBuilder(params, total, total_row);
  return { data, ...paginationMeta };
};

export const show = async (params: IdParam): Promise<OvertimeData> => {
  return await ShowBuilder(params);
};
