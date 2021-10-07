const { createMaestroConnection } = require("../services/sheetsConnections");
const { getUsers } = require("./usersController");
module.exports = {
  /**
   * recieves the supervisor id path
   * return a list of sellers object => { id, name }
   */
  async getSellers(request, response) {
    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["vendedores"];

      const rows = await sheet.getRows();

      const sellers = rows.map((row) => {
        return {
          id: row.id,
          name: row.nombre,
          sup_id: row["id supervisor"],
          sucursal: row.sucursal
        };
      });

      const supervisorsSheet = maestroDoc.sheetsByTitle["usuarios"];

      const supervisorsRows = await supervisorsSheet.getRows();

      const supervisors = supervisorsRows.map((supervisorsRow) => {
        return {
          id: supervisorsRow.id,
          name: supervisorsRow.usuario,
          sucursal: supervisorsRow.sucursal,
          roll: supervisorsRow.roll
        };
      });
      const supervisor = supervisors.find((user) => {
        return user.id === `${request.params.supervisor}`;
      });

      let filteredSellers;
      
      filteredSellers = sellers.filter((seller) => {
        return `${request.params.sucursal}` === seller.sucursal;
      });

      return response.status(200).json(filteredSellers);
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de vendedores falló!" });
    }
  },

  async getRoutes(request, response) {
    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["rutas"];

      const rows = await sheet.getRows();

      const routes = rows.map((row) => {
        return {
          id: row.id,
          seller_id: row["id vendedor"],
          name: row.ruta,
          sucursal: row.sucursal
        };
      });

      const filteredRoutes = routes.filter((route) => {
        return (
          `${request.params.seller_id}` === route.seller_id &&
          `${request.params.sucursal}` === route.sucursal
        );
      });

      return response.status(200).json(filteredRoutes);
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de vendedores falló!" });
    }
  }
};
