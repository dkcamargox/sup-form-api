const pool = require('../services/connection');

module.exports = {
  /**
   * return a list of users object => { id, name }
   */
  async getProductsById(request, response) {
    try {
      const { rows } = await pool.query(
        'SELECT\
        p.id,\
        p.name,\
        p.label,\
        t.name AS type,\
        b.name AS sucursal FROM\
        products AS p,\
        products_types_branches AS pbt,\
        types AS t,\
        branches AS b WHERE\
        pbt.product_id = p.id AND\
        pbt.branch_id = b.id AND\
        pbt.type_id = t.id AND\
        b.id = $1'
        , 
        [request.params.sucursal]
      );

      let products = rows.map( ({id, name, label, type}) => ({
        id: `${id}`,
        label,
        name,
        type
      }))

      products = products.reduce(
        (acc, item) => ({
          ...acc,
          [item.type]: [...(acc[item.type] ?? []), item],
        }),
        {},
      );

      return response.status(200).json(products)
    } catch (error) {
      console.log(error);
      return response.status(502).json({ error: "Busqueda de lineas de productos falló!" });
    }
  }
};
