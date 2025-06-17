import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import {
  CreateOvertime,
  IdParam,
  OvertimeData,
  OvertimeSearch,
  SearchQuery,
  UserRes,
} from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";
import { currDate } from "../../helpers/times";

const table = escapeIdentifier(tableName.OVERTIME);
const db = new Pool(pgConnection);

export const StoreBuilder = async (body: CreateOvertime, user: UserRes): Promise<string> => {
  const queryStore = {
    text: `
        INSERT INTO ${table} (employee_id, overtime_date, hours, submitted_at, payroll_period_id) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `,
    values: [user.id, body.overtime_date, body.hours, currDate(), body.payroll_period_id],
  };

  const data = (await db.query(queryStore)).rows[0];

  return data.id;
};

export const CountOvertimeByDate = async (overtimeDate: Date, user: UserRes): Promise<number> => {
  const queryCount = {
    text: `SELECT SUM(hours) as total_hours FROM ${table} WHERE overtime_date = $1 AND employee_id = $2`,
    values: [overtimeDate, user.id],
  };

  const data = (await db.query(queryCount)).rows[0];

  return parseInt(data.total_hours) || 0;
};

export const ShowBuilder = async (params: IdParam): Promise<OvertimeData> => {
  const queryShow = {
    text: `SELECT * FROM ${table} WHERE id = $1`,
    values: [params.id],
  };

  return (await db.query(queryShow)).rows[0];
};

export const SearchOvertimeBuilder = async (params: OvertimeSearch): Promise<SearchQuery> => {
  const order_by = params.sort_by || "created_at";
  const order_type = params.sort_type || "desc";
  const limit = params.limit || 10;
  const page = params.page || 1;

  let query = `FROM ${table}`;
  let hasWhere = false;

  // Add filter by employee_id
  if (params.employee_id) {
    query += ` WHERE employee_id = '${params.employee_id}'`;
    hasWhere = true;
  }

  // Add filter by overtime_date
  if (params.overtime_date) {
    if (hasWhere) {
      query += ` AND overtime_date = '${params.overtime_date}'`;
    } else {
      query += ` WHERE overtime_date = '${params.overtime_date}'`;
      hasWhere = true;
    }
  }

  // Add filter by payroll_period_id
  if (params.payroll_period_id) {
    if (hasWhere) {
      query += ` AND payroll_period_id = '${params.payroll_period_id}'`;
    } else {
      query += ` WHERE payroll_period_id = '${params.payroll_period_id}'`;
    }
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
    data: data.rows satisfies OvertimeData[],
    total,
    total_row: data.rowCount,
  };
};
