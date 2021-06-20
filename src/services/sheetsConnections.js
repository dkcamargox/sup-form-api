require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
  async createMaestroConnection() {
    const doc = new GoogleSpreadsheet(process.env.MAESTRO_SHEET_CODE);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    });

    await doc.loadInfo();

    return doc;
  },
  async createSucursalConnection(sucursal) {
    let doc;
    switch(sucursal) {
      case 1:
        doc = new GoogleSpreadsheet(process.env.CTES_SHEET_CODE);
      break;
      case 2:
        doc = new GoogleSpreadsheet(process.env.RCIA_SHEET_CODE);
      break;
      case 3:
        doc = new GoogleSpreadsheet(process.env.MNES_SHEET_CODE);
      break;
    }

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    });

    await doc.loadInfo();

    return doc;
  }
};