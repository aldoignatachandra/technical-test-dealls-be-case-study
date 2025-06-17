import { Context } from "hono";
import { RequestInfo } from "../types";

/**
 * Extract client information from the request
 * @param c Hono context
 * @returns Object containing IP address and user agent
 */
export const getRequestInfo = (c: Context): RequestInfo => {
  // Get IP address with fallbacks for different header formats
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0] || // Standard proxy header (first IP if multiple)
    c.req.header("x-real-ip") || // Used by some proxies
    c.req.header("cf-connecting-ip") || // Cloudflare
    c.req.header("true-client-ip") || // Akamai and Cloudflare
    c.req.raw?.headers?.get?.("x-forwarded-for")?.split(",")[0] || // For raw fetch requests
    c.env?.ip || // Environment variable (if available)
    (c.req.raw as any)?.socket?.remoteAddress || // Direct connection (Node.js)
    "127.0.0.1"; // Fallback for local testing

  // Get user agent with fallback
  const userAgent =
    c.req.header("user-agent") || c.req.raw?.headers?.get?.("user-agent") || "Unknown Client";

  return {
    ip_address: ip,
    user_agent: userAgent,
  };
};

/**
 * Add client information to request body
 * @param c Hono context
 * @param body Request body object
 * @returns Updated body with client information
 */
export const addRequestInfoToBody = async (c: Context): Promise<any> => {
  const body = await c.req.json();
  const info = getRequestInfo(c);
  return { ...body, ...info };
};
