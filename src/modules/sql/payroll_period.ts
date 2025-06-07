import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { CreatePayrollPeriod, UserRes } from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";

const table = escapeIdentifier(tableName.PAYROLL_PERIODS);
const db = new Pool(pgConnection);

export const StoreBuilder = async (
  body: CreatePayrollPeriod,
  user: UserRes
): Promise<string> => {
  const queryStore = {
    text: `
        INSERT INTO ${table} (start_date, end_date, status, created_by, updated_by) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `,
    values: [body.start_date, body.end_date, body.status, user.id, user.id],
  };

  const data = (await db.query(queryStore)).rows[0];

  return data.id;
};

export const CheckOverlappingPeriods = async (
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  const queryCount = {
    text: `
      SELECT COUNT(*) as count 
      FROM public.payroll_periods 
      WHERE 
      (start_date <= $1 AND end_date >= $1) OR 
      (start_date <= $2 AND end_date >= $2) OR 
      (start_date >= $1 AND end_date <= $2)
    `,
    values: [endDate, startDate],
  };

  const data = (await db.query(queryCount)).rows[0];

  return parseInt(data.count) > 0;
};
