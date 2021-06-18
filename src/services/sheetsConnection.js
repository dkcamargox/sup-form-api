require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async () => {
  const doc = new GoogleSpreadsheet(process.env.SHEET_CODE);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
  });

  await doc.loadInfo();

  return doc;
};