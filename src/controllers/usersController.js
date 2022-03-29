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
        .json({ error: "Busqueda de 434rdfv  falló!" });
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
    const client = await pool.connect()
    try {
      const {
        userId,
        password,
        sucursal,
        cordy,
        cordx
      } = request.body

      const { rows: passwordRows } = await pool.query(
        'SELECT COUNT(*) FROM supervisors WHERE id = $1 AND password = $2',
        [userId, password]
      );
      const { count: passwordCount } = passwordRows[0];

      const { rows: branchesRows } = await pool.query(
        'SELECT COUNT(*) FROM supervisors_branches AS sb\
        WHERE sb.supervisor_id = $1 AND\
        sb.branch_id = $2',
        [userId, sucursal]
      );
      const { count: branchCount } = branchesRows[0];
      
      
      if (passwordCount !== '1') {
        return response.status(401).json({
          match: false,
          error: "Login falló, su contraseña esta incorrecta"
        })
      }

      if (branchCount !== '1') {
        return response.status(401).json({
          match: false,
          error: "Login falló, no tiene accesso a esa sucursal"
        })
      }
      
      await client.query('BEGIN')
      await pool.query(
        'INSERT INTO logins(supervisor_id, date, time, cordy, cordx) VALUES($1,$2,$3,$4,$5);',
        [
          userId,
          getDate(),
          getTime(),
          cordy,
          cordx
        ]
      )
      await client.query('COMMIT')

      let { rows: userRows } = await pool.query(
        'SELECT s.name, s.id, s.roll AS roll FROM supervisors AS s, supervisors_branches AS sb\
        WHERE s.id = $1 AND s.password = $2 AND\
        sb.supervisor_id = $1 AND\
        sb.branch_id = $3',
        [userId, password, sucursal]
      );

      const {
        id,
        name,
        roll
      } = userRows[0]
      
      return response.status(200).json({
        match: true,
        user: {
          userId,
          id,
          name,
          roll: roll === 0 ? 'admin' : 'super'
        }
      });
    } catch (error) {
      console.log(error);
      await client.query('ROLLBACK')
      return response.status(502).json({ error: "Teste de constraseña falló" });
    } finally {
      client.release()
    }
  }
};
