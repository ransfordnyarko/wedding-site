/**
 * Wedding RSVP → Google Sheet
 *
 * One-time setup (about 5 minutes):
 *  1. Create a Google Sheet (e.g. "Wedding RSVPs").
 *  2. In the sheet: Extensions → Apps Script. Delete what's there and paste
 *     this whole file in. Save.
 *  3. Deploy → New deployment → gear icon → "Web app".
 *       Execute as:    Me
 *       Who has access: Anyone
 *     Click Deploy, approve the permissions, and copy the Web app URL
 *     (it ends in /exec).
 *  4. In the website project, set VITE_RSVP_SHEET_URL to that URL:
 *       - locally in .env.local
 *       - on Vercel: Project → Settings → Environment Variables, then redeploy.
 *
 * If you edit this script later, use Deploy → Manage deployments → edit
 * (pencil) → Version: "New version", so the URL stays the same.
 *
 * Each RSVP becomes one row on the "RSVPs" tab, which is created with headers
 * on the first submission.
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Submitted at', 'Name', 'Email', 'Attending', 'Guests', 'Plus-one name', 'Message'];
const MAX_LEN = 1000;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: bots fill in every field; real guests never see this one.
  if (p.website) return json({ ok: true });

  if (!p.name || !p.email || !p.attending) {
    return json({ ok: false, error: 'Missing name, email or attendance.' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    sheet.appendRow([
      new Date(),
      clean(p.name),
      clean(p.email),
      clean(p.attending),
      Number(p.guests) || 0,
      clean(p.plusOne),
      clean(p.message),
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the URL in a browser just confirms the script is live.
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint is running.' });
}

/** Trims, caps length, and stops text being read as a spreadsheet formula. */
function clean(value) {
  const s = String(value || '').trim().slice(0, MAX_LEN);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
