import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { AuditLogData } from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";

const table = escapeIdentifier(tableName.AUDIT_LOGS);
const db = new Pool(pgConnection);

export const StoreBuilder = async (data: AuditLogData): Promise<void> => {
  const queryStore = {
    text: `
        INSERT INTO ${table} 
        (user_id, table_name, record_id, action, module, ip_address, user_agent, additional_data) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    values: [
      data.user_id || null,
      data.table_name || null,
      data.record_id || null,
      data.action,
      data.module,
      data.ip_address || null,
      data.user_agent || null,
      data.additional_data ? JSON.stringify(data.additional_data) : null,
    ],
  };

  await db.query(queryStore);
};
