const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

function requestHeaders(extra: HeadersInit = {}) {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Supabase no está configurado en el servidor.");
  return { apikey: secret, Authorization: `Bearer ${secret}`, ...extra };
}

export async function supabaseSelect<T>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers: requestHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T[]>;
}

export async function supabaseInsert(table: string, value: Record<string, unknown>) {
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: requestHeaders({ "content-type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function supabaseUpdate(table: string, query: string, value: Record<string, unknown>) {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: requestHeaders({ "content-type": "application/json", Prefer: "return=representation" }),
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<Record<string, unknown>[]>;
}

export async function supabaseDelete(table: string, query: string) {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: requestHeaders({ Prefer: "return=minimal" }),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function uploadReceipt(path: string, file: File) {
  const bucket = process.env.SUPABASE_RECEIPTS_BUCKET ?? "payment-receipts";
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: requestHeaders({ "content-type": file.type || "application/octet-stream", "x-upsert": "false" }),
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(await response.text());
}

export async function createReceiptUrl(path: string) {
  const bucket = process.env.SUPABASE_RECEIPTS_BUCKET ?? "payment-receipts";
  const response = await fetch(`${url}/storage/v1/object/sign/${bucket}/${path}`, {
    method: "POST",
    headers: requestHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ expiresIn: 300 }),
  });
  if (!response.ok) throw new Error(await response.text());
  const result = await response.json() as { signedURL?: string; signedUrl?: string };
  const signed = result.signedURL ?? result.signedUrl;
  if (!signed) throw new Error("Supabase no devolvió la URL del comprobante.");
  return signed.startsWith("http") ? signed : `${url}/storage/v1${signed}`;
}

export async function uploadEventAsset(path: string, file: File) {
  const bucket = process.env.SUPABASE_EVENT_ASSETS_BUCKET ?? "event-assets";
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: requestHeaders({ "content-type": file.type || "application/octet-stream", "x-upsert": "false" }),
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(await response.text());
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
