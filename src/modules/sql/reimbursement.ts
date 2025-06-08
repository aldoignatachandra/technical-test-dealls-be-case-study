import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { CreateReimbursement, UserRes } from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";
import { currDate } from "../../helpers/times";

const table = escapeIdentifier(tableName.REIMBURSEMENTS);
const db = new Pool(pgConnection);

export const StoreBuilder = async (
  body: CreateReimbursement,
  user: UserRes
): Promise<string> => {
  const queryStore = {
    text: `
        INSERT INTO ${table} (employee_id, reimbursement_date, amount, description, submitted_at, payroll_period_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `,
    values: [
      user.id,
      body.reimbursement_date,
      body.amount,
      body.description,
      currDate(),
      body.payroll_period_id,
    ],
  };

  const data = (await db.query(queryStore)).rows[0];

  return data.id;
};
