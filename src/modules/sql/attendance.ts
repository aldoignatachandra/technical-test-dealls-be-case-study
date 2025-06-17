import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { CreateAttendance, UserRes } from "../../types";
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
