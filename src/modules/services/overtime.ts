import { log } from "../../helpers/logger";
import { UserRes } from "../../types";
import { StoreBuilder } from "../sql/overtime";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";
import { CreateOvertime } from "../../types/overtime";

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
