import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function normalizePrivateKey(key: string) {
  // Support escaped newlines from .env file
  return key.replace(/\\n/g, '\n');
}

async function getSheetsClient() {
  const clientEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = normalizePrivateKey(getEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'));

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

function toStringSafe(v: any): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
}

function splitName(full?: string): { first: string; last: string } {
  const n = (full || '').trim();
  if (!n) return { first: '', last: '' };
  const parts = n.split(/\s+/);
  const first = parts.shift() || '';
  const last = parts.join(' ');
  return { first, last };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Normalize incoming payload
    const incoming = payload as Record<string, any>;

    const spreadsheetId = getEnv('GOOGLE_SHEETS_SPREADSHEET_ID');
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'FormResponses';

    const sheets = await getSheetsClient();

    // 1) Read header row (A1:1)
    const headerResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });
    const headerRow = (headerResp.data.values?.[0] || []) as string[];

    // 2) Build row aligned strictly to existing header (do not modify header)
    // Map common footer fields to the target schema used in your sheet
    const fromExplicit = {
      first: toStringSafe(incoming.firstName || incoming.firstname || ''),
      last: toStringSafe(incoming.lastName || incoming.lastname || ''),
    };
    const nameSplit = (fromExplicit.first || fromExplicit.last)
      ? { first: fromExplicit.first, last: fromExplicit.last }
      : splitName(toStringSafe(incoming.name));
    const mapping: Record<string, string> = {
      'State': toStringSafe(incoming.state || ''),
      'First name': nameSplit.first,
      'Last name': nameSplit.last,
      'Email': toStringSafe(incoming.email),
      'Industry': toStringSafe(incoming.industry || incoming.company || ''),
      'Phone number': toStringSafe(incoming.phone || incoming.phoneNumber || ''),
      'Website': toStringSafe(incoming.website || ''),
      'Context': toStringSafe(incoming.message || incoming.context || ''),
    };

    const row = headerRow.map((h) => mapping[h] ?? '');

    // 3) Append
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[form endpoint] error', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  // quick health check
  return NextResponse.json({ ok: true });
}
