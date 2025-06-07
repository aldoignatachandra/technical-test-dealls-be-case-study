import { AuditLogData } from "../../types";
import { StoreBuilder } from "../sql/audit_log";

export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    await StoreBuilder(data);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
