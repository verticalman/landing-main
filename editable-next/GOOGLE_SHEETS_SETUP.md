# Google Sheets setup for /api/form

Create a `.env.local` file in `editable-next/` with:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# Keep literal \n escapes in the key value
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
# Optional: defaults to FormResponses
GOOGLE_SHEETS_SHEET_NAME=FormResponses
```

Then share your Google Sheet with the service account email (Editor access).

To test locally after installing deps and starting the dev server:

```bash
curl -X POST http://localhost:3000/api/form \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","company":"ACME","message":"Hi!"}'
```
