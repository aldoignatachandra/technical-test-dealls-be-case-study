import { Pool } from "pg";
import { pgConnection } from "../../helpers/constant";
import { UserModel, UserRes } from "../../types";
import { escapeIdentifier } from "pg";
import { tableName } from "../../helpers/constant";

const table = escapeIdentifier(tableName.EMPLOYEES);
const db = new Pool(pgConnection);

// ShowByIdBuilder retrieves a user by their ID ( Including password )
export const ShowWithPassBuilder = async (username: string): Promise<UserModel> => {
  const queryShow = {
    text: `SELECT * FROM ${table} WHERE username = $1`,
    values: [username],
  };

  return (await db.query(queryShow)).rows[0];
};

// ShowByIdBuilder retrieves a user by their Username ( Excluding password )
export const ShowByUsernameBuilder = async (username: string): Promise<UserRes> => {
  const queryShow = {
    text: `SELECT * FROM ${table} WHERE username = $1`,
    values: [username],
  };

  return (await db.query(queryShow)).rows[0];
};

// ShowByIdBuilder retrieves a user by their ID ( Excluding password )
export const ShowByIdBuilder = async (id: string): Promise<UserRes> => {
  const queryShow = {
    text: `SELECT * FROM ${table} WHERE id = $1`,
    values: [id],
  };

  return (await db.query(queryShow)).rows[0];
};

export const UpdateTokenBuilder = async (
  id: string,
  token: string
): Promise<void> => {
  const queryUpdate = {
    text: `UPDATE ${table} SET token = $1, updated_by = $2 WHERE id = $3`,
    values: [token, id, id],
  };

  await db.query(queryUpdate);
};

export const DeleteTokenBuilder = async (id: string): Promise<void> => {
  const queryDelete = {
    text: `UPDATE ${table} SET token = NULL, updated_by = $1 WHERE id = $2`,
    values: [id, id],
  };
  await db.query(queryDelete);
};
