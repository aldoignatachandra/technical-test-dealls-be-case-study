import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import {
  CreatePayrollPeriod,
  IdParam,
  PayrollPeriodData,
  PayrollPeriodSearch,
  SearchQuery,
  UserRes,
} from "../../types";
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

export const SearchPayrollPeriodBuilder = async (
  params: PayrollPeriodSearch
): Promise<SearchQuery> => {
  const order_by = params.sort_by || "created_at";
  const order_type = params.sort_type || "desc";
  const limit = params.limit || 10;
  const page = params.page || 1;

  let query = `FROM ${table}`;

  // Add status filter if provided
  if (params.status) {
    query += ` WHERE status = '${params.status.toLowerCase()}'`;
  }

  const querySelect = {
    text: `SELECT * ${query} ORDER BY ${order_by} ${order_type} LIMIT $1 OFFSET $2`,
    values: [limit, limit * (page - 1)],
  };

  const queryCount = {
    text: `SELECT count(*)::int total ${query}`,
    values: [],
  };

  const data = await db.query(querySelect);
  const total = (await db.query(queryCount)).rows[0].total;

  return {
    data: data.rows satisfies PayrollPeriodData[],
    total,
    total_row: data.rowCount,
  };
};

export const ShowBuilder = async (
  params: IdParam
): Promise<PayrollPeriodData> => {
  const queryShow = {
    text: `SELECT * FROM ${table} WHERE id = $1`,
    values: [params.id],
  };

  return (await db.query(queryShow)).rows[0];
};

export const CheckOverlappingPeriods = async (
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  const queryCount = {
    text: `
      SELECT COUNT(*) as count 
      FROM ${table} 
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

export const CheckAvailablePayrollPeriodByDate = async (
  attendanceDate: Date
): Promise<string | null> => {
  const queryCount = {
    text: `SELECT id FROM ${table} WHERE start_date <= $1 AND end_date >= $1 AND status = 'open' LIMIT 1`,
    values: [attendanceDate],
  };

  return (await db.query(queryCount)).rows[0];
};
