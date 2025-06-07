export type AuditLogData = RequestInfo & {
  user_id?: string;
  table_name: string;
  record_id: string;
  action: string;
  module: string;
  additional_data?: any;
};

export type RequestInfo = {
  ip_address?: string;
  user_agent?: string;
};
