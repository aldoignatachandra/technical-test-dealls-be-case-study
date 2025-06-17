import { log } from "../../helpers/logger";
import { IdParam, PaginationResponse, UserRes } from "../../types";
import { StoreBuilder, ShowBuilder, SearchAttendanceBuilder } from "../sql/attendance";
import { createAuditLog } from "./audit_log";
import { actionType, tableName, moduleName } from "../../helpers/constant";
import { AttendanceData, AttendanceSearch, CreateAttendance } from "../../types/attendance";
import { PaginationBuilder } from "../../helpers/pagination";

export const createAttendance = async (body: CreateAttendance, user: UserRes): Promise<string> => {
  const data = await StoreBuilder(body, user);
  const bodyExt = body as CreateAttendance & {
    ip_address?: string;
    user_agent?: string;
  };

  // Database audit logging
  await createAuditLog({
    user_id: user.id,
    table_name: tableName.ATTENDANCE,
    record_id: data,
    action: actionType.CREATE,
    module: moduleName.ATTENDANCE,
    ip_address: bodyExt.ip_address,
    user_agent: bodyExt.user_agent,
    additional_data: { attendance_id: data },
  });

  const ctx = "create-attendance";
  const logMsg = `Success create new data attendance with id ( ${data} ) - ${user.username}`;
  log(ctx, logMsg, `${user.name}`);

  return data;
};

export const indexAttendance = async (params: AttendanceSearch): Promise<PaginationResponse> => {
  const { data, total, total_row } = await SearchAttendanceBuilder(params);
  const paginationMeta = PaginationBuilder(params, total, total_row);
  return { data, ...paginationMeta };
};

export const show = async (params: IdParam): Promise<AttendanceData> => {
  return await ShowBuilder(params);
};
