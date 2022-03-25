const pool = require('../services/connection');

module.exports = {
  /**
   * recieves the supervisor id path
   * return a list of sellers object => { id, name }
   */
  async getSellers(request, response) {
    try {
      const { rows } = await pool.query('SELECT * FROM sellers WHERE branch_id=$1;', [request.params.sucursal]);
        
      const sellers = rows.map(({id, name, branch_id}) => {
        return {
          id: `${id}`,
          name,
          sucursal: branch_id
        };
      });


      console.log(sellers);
      return response.status(200).json(sellers);
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de vendedores falló!" });
    }
  },

  async getRoutes(request, response) {
    try {
      const { rows } = await pool.query('SELECT * FROM routes WHERE seller_id=$1;', [request.params.seller_id]);
        
      const routes = rows.map(({id, name, seller_id}) => {
        return {
          id: `${id}`,
          name,
        };
      });

      console.log(routes);
      return response.status(200).json(routes);
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Busqueda de rutas por vendedor falló!" });
    }
  }
};
