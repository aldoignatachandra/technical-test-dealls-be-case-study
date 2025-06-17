import { log } from "../../helpers/logger";
import { IdParam, PaginationResponse, UserRes } from "../../types";
import { SearchReimbursementBuilder, ShowBuilder, StoreBuilder } from "../sql/reimbursement";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";
import {
  CreateReimbursement,
  ReimbursementData,
  ReimbursementSearch,
} from "../../types/reimbursement";
import { PaginationBuilder } from "../../helpers/pagination";

export const createReimbursement = async (
  body: CreateReimbursement,
  user: UserRes
): Promise<string> => {
  const data = await StoreBuilder(body, user);
  const bodyExt = body as CreateReimbursement & {
    ip_address?: string;
    user_agent?: string;
  };

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.REIMBURSEMENTS,
    record_id: data,
    action: actionType.CREATE,
    module: moduleName.REIMBURSEMENTS,
    ip_address: bodyExt.ip_address,
    user_agent: bodyExt.user_agent,
    additional_data: { reimbursement_id: data },
  });

  const ctx = "create-reimbursement";
  const logMsg = `Success create new data reimbursement with id ( ${data} ) - ${user.username}`;
  log(ctx, logMsg, `${user.name}`);

  return data;
};

export const indexReimbursement = async (
  params: ReimbursementSearch
): Promise<PaginationResponse> => {
  const { data, total, total_row } = await SearchReimbursementBuilder(params);
  const paginationMeta = PaginationBuilder(params, total, total_row);
  return { data, ...paginationMeta };
};

export const show = async (params: IdParam): Promise<ReimbursementData> => {
  return await ShowBuilder(params);
};
