const { createMaestroConnection } = require("../services/sheetsConnections");

module.exports = {
  async getSupervisorNameById(userId) {
    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["usuarios"];

      const rows = await sheet.getRows();

      return rows
        .map((row) => {
          return {
            id: row.id,
            name: row.usuario
          };
        })
        .find((user) => user.id === userId).name;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async getSellerNameById(sucursalId, sellerId) {
    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["vendedores"];

      const rows = await sheet.getRows();

      return rows
        .map((row) => {
          return {
            sucursal: row.sucursal,
            id: row.id,
            name: row.nombre
          };
        })
        .find(
          (seller) => seller.id === sellerId && seller.sucursal === sucursalId
        ).name;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async getRouteNameById(sucursalId, routeId) {
    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["rutas"];

      const rows = await sheet.getRows();

      return rows
        .map((row) => {
          return {
            sucursal: row.sucursal,
            id: row.id,
            name: row.ruta
          };
        })
        .find(
          (seller) => seller.id === routeId && seller.sucursal === sucursalId
        ).name;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
};
