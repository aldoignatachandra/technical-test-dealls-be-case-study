export type AuditLogData = {
  user_id?: string;
  table_name: string;
  record_id: string;
  action: string;
  module: string;
  ip_address?: string;
  user_agent?: string;
  additional_data?: any;
};

export type RequestInfo = {
  ip: string;
  userAgent: string;
};
