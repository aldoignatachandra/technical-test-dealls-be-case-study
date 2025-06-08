import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { CreateOvertime, UserRes } from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";
import { currDate } from "../../helpers/times";

const table = escapeIdentifier(tableName.OVERTIME);
const db = new Pool(pgConnection);

export const StoreBuilder = async (
  body: CreateOvertime,
  user: UserRes
): Promise<string> => {
  const queryStore = {
    text: `
        INSERT INTO ${table} (employee_id, overtime_date, hours, submitted_at, payroll_period_id) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `,
    values: [
      user.id,
      body.overtime_date,
      body.hours,
      currDate(),
      body.payroll_period_id,
    ],
  };

  const data = (await db.query(queryStore)).rows[0];

  return data.id;
};

export const CountOvertimeByDate = async (
  overtimeDate: Date,
  user: UserRes
): Promise<number> => {
  const queryCount = {
    text: `SELECT SUM(hours) as total_hours FROM ${table} WHERE overtime_date = $1 AND employee_id = $2`,
    values: [overtimeDate, user.id],
  };

  const data = (await db.query(queryCount)).rows[0];

  return parseInt(data.total_hours) || 0;
};
