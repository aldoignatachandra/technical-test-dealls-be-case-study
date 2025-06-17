import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import {
  AttendanceData,
  AttendanceSearch,
  CreateAttendance,
  IdParam,
  SearchQuery,
  UserRes,
} from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";
import { currDate } from "../../helpers/times";

const table = escapeIdentifier(tableName.ATTENDANCE);
const db = new Pool(pgConnection);

export const StoreBuilder = async (body: CreateAttendance, user: UserRes): Promise<string> => {
  const queryStore = {
    text: `
        INSERT INTO ${table} (employee_id, attendance_date, submitted_at, payroll_period_id) 
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `,
    values: [user.id, body.attendance_date, currDate(), body.payroll_period_id],
  };

  const data = (await db.query(queryStore)).rows[0];

  return data.id;
};

export const CheckAttendanceByDate = async (
  attendanceDate: Date,
  user: UserRes
): Promise<string | null> => {
  const queryCount = {
    text: `SELECT id FROM ${table} WHERE attendance_date = $1 AND employee_id = $2 LIMIT 1`,
    values: [attendanceDate, user.id],
  };

  return (await db.query(queryCount)).rows[0];
};

export const ShowBuilder = async (params: IdParam): Promise<AttendanceData> => {
  const queryShow = {
    text: `SELECT * FROM ${table} WHERE id = $1`,
    values: [params.id],
  };

  return (await db.query(queryShow)).rows[0];
};

export const SearchAttendanceBuilder = async (params: AttendanceSearch): Promise<SearchQuery> => {
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

  // Add filter by attendance_date
  if (params.attendance_date) {
    if (hasWhere) {
      query += ` AND attendance_date = '${params.attendance_date}'`;
    } else {
      query += ` WHERE attendance_date = '${params.attendance_date}'`;
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
    data: data.rows satisfies AttendanceData[],
    total,
    total_row: data.rowCount,
  };
};
