const {
  createMaestroConnection,
  createSucursalConnection
} = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");
module.exports = {
  /**
   * return a list of users object => { id, name }
   */
  async getUsers(request, response) {
    try {
      const maestroDoc = await createMaestroConnection();

      const sheet = maestroDoc.sheetsByTitle["usuarios"];

      const rows = await sheet.getRows();

      const users = rows.map((row) => {
        return {
          id: row.id,
          name: row.usuario
        };
      });
      console.log(users)
      return response.status(200).json(users);
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de usuarios falló!" });
    }
  },
  /**
   * recieves userId<string> => id of the user for log
   * recieves password<string> => password to test
   * recieves sucursal<string> => sucursal
   * return true of false for the password match { match: true/false }
   * writes in the sheet the information about the login
   */
  async logIn(request, response) {
    try {
      const maestroDoc = await createMaestroConnection();

      const usersSheet = maestroDoc.sheetsByTitle["usuarios"];

      const usersSheetRows = await usersSheet.getRows();

      const usersList = usersSheetRows.map((user) => {
        return {
          id: user.id,
          name: user.usuario,
          password: user.password,
          sucursal: user.sucursal
        };
      });

      const logInUser = usersList.find(
        (user) => user.id === String(request.body.userId)
      );
      let sucursalDoc;

      /**
       * if user sucursal is 0 then he has access to whatever sucursal he wants
       * else he has to access the sucursal he is design to
       */
      console.log(request.body);
      console.log(logInUser);
      if (
        logInUser.sucursal === "0" ||
        String(request.body.sucursal) === logInUser.sucursal
      ) {
        console.log(request.body.sucursal);
        sucursalDoc = await createSucursalConnection(request.body.sucursal);
      } else {
        return response
          .status(403)
          .json({ error: "No tenés accesso a esa sucursal" });
      }

      if (logInUser.password === request.body.password) {
        try {
          /**
           * add a login log into the sheet
           * usuario	data 	hora	coordenada y	coordenada x
           */
          const loginSheet = sucursalDoc.sheetsByTitle["logueos de supervisor"];

          loginSheet.addRow({
            usuario: logInUser.name,
            data: getDate(),
            hora: getTime(),
            latitud: request.body.cordy,
            longitud: request.body.cordx
          });
        } catch (error) {
          console.log(error);
          return response
            .status(502)
            .json({ error: "Registrar el login falló" });
        }
        return response.status(200).json({ match: true });
      } else {
        return response
          .status(401)
          .json({ match: false, error: "Contraseña incorrecta" });
      }
    } catch (error) {
      console.log(error);
      return response.status(502).json({ error: "Teste de constraseña falló" });
    }
  }
};
