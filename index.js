require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./configs/creds.json'); 

(async function() {
  const doc = new GoogleSpreadsheet(process.env.SHEET_CODE);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  });

  await doc.loadInfo(); // loads document properties and worksheets
  
  const sheet = doc.sheetsByTitle['porcentages relevameinto'];
  console.log(sheet);
  const rows = await sheet.getRows();
  rows.forEach(row => {
    console.log(row._rawData);
  });

})(); 
