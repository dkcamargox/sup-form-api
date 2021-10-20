const { createMaestroConnection } = require("../services/sheetsConnections");
module.exports = {
  async getSellerBySucursal(sucursalId) {
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
        .filter(
          (seller) => seller.sucursal === sucursalId
        );
    } catch (error) {
      console.log(error);
      return null;
    }
  },
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
  },
  async getProductsBySucursalId(sucursalId) {
    const tableId = (tableString) => {
      return {
        "Competencia de Aguas": "water",
        "Competencia de Gaseosas": "soda",
        "Competencia de Vinos": "wine",
        "Productos Redcom": "redcom"
      }[tableString];
    };
    const isAnulado = (string) => (string === "No" ? false : true);

    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["lineas"];

      const rows = await sheet.getRows();
      const sucursalLines = rows
        .map((row) => {
          // linea	label	sucursal	table
          return {
            linea: row.linea,
            label: row.label,
            sucursal: row.sucursal,
            table: tableId(row.table),
            notNull: !isAnulado(row.anulado)
          };
        })
        .filter((line) => line.sucursal.includes(sucursalId) && line.notNull);

      const treatedSucursalLines = {
        water: sucursalLines
          .filter((line) => line.table === "water")
          .map((waterLine) => {
            return JSON.parse(`{
              "label": "${waterLine.label}",
              "name": "${waterLine.linea}"
            }`);
          }),
        redcom: sucursalLines
          .filter((line) => line.table === "redcom")
          .map((redcomLine) => {
            return JSON.parse(`{
              "label": "${redcomLine.label}",
              "name": "${redcomLine.linea}"
            }`);
          }),
        soda: sucursalLines
          .filter((line) => line.table === "soda")
          .map((sodaLine) => {
            return JSON.parse(`{
              "label": "${sodaLine.label}",
              "name": "${sodaLine.linea}"
            }`);
          }),
        wine: sucursalLines
          .filter((line) => line.table === "wine")
          .map((wineLine) => {
            return JSON.parse(`{
              "label": "${wineLine.label}",
              "name": "${wineLine.linea}"
            }`);
          }),
      };
      return treatedSucursalLines;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async getAllProductsDataBySucursalId(sucursalId) {
    const tableId = (tableString) => {
      return {
        "Competencia de Aguas": "water",
        "Competencia de Gaseosas": "soda",
        "Competencia de Vinos": "wine",
        "Productos Redcom": "redcom"
      }[tableString];
    };
    const isAnulado = (string) => (string === "No" ? false : true);

    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["lineas"];

      const rows = await sheet.getRows();
      const sucursalLines = rows
        .map((row) => {
          // linea	label	sucursal	table
          return {
            linea: row.linea,
            label: row.label,
            sucursal: row.sucursal,
            table: tableId(row.table),
            notNull: !isAnulado(row.anulado)
          };
        })
        .filter((line) => line.sucursal.includes(sucursalId));

      return sucursalLines;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
};
