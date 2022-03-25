const {
  createMaestroConnection,
  createSucursalConnection
} = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");

const pool = require('../services/connection');

module.exports = {
  /**
   * return a list of users object => { id, name }
   */
  async getUsers(request, response) {
    try {
      const { rows } = await pool.query('SELECT *  FROM supervisors');
        
      const supervisors = rows.map(({id, name}) => {
        return {
          id: `${id}`,
          name
        };
      });


      console.log(supervisors)
      return response.status(200).json(supervisors)
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de usuarios falló!" });
    }
  },
  async getLoginData(request, response) {
    try {
      const { rows: rowsSupervisores } = await pool.query('SELECT *  FROM supervisors;');
      const { rows: rowsBranches } = await pool.query('SELECT *  FROM branches;');
      console.log(rowsBranches)
        
      const supervisors = rowsSupervisores.map(({id, name}) => {
        return {
          id: `${id}`,
          name
        };
      });

      
      const branches = rowsBranches.map(({id, name}) => {
        return {
          id: `${id}`,
          name
        };
      });


      console.log(supervisors)
      return response.status(200).json({
        supervisors,
        branches
      });
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de usuarios falló!" });
    }
  },
  /**
   * return a list of users object => { id, name } by suc
   */
  async getUsersBySucursal(request, response) {
    try {
      const { rows } = await pool.query(
        'SELECT supervisors.id, supervisors.name\
          FROM supervisors_branches, branches, supervisors\
          WHERE supervisors_branches.supervisor_id = supervisors.id\
          AND supervisors_branches.branch_id = branches.id\
          AND branches.id = $1;', 
        [request.params.sucursal]
      );

      console.log(rows)
        
      const supervisors = rows.map(({id, name}) => {
        return {
          id: `${id}`,
          name
        };
      });


      console.log(supervisors)
      return response.status(200).json(supervisors)
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
          sucursal: user.sucursal,
          roll: user.roll
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
        return response.status(200).json({ match: true, user: logInUser});
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
