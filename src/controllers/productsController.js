const { createMaestroConnection } = require("../services/sheetsConnections");
module.exports = {
  /**
   * return a list of users object => { id, name }
   */
  async getProductsById(request, response) {
    const tableId = (tableString) => {
      return {
        "Competencia de Aguas": "water",
        "Competencia de Gaseosas": "soda",
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
        .filter(
          (line) =>
            line.sucursal.includes(request.params.sucursal) && line.notNull
        );

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
          })
      };

      return response.status(200).json(treatedSucursalLines);
    } catch (error) {
      console.log(error);
      return response.status(502).json({ error: "Busqueda de lineas falló!" });
    }
  }
};
