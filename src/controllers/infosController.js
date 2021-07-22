const {
  createSucursalConnection,
  createMaestroConnection
} = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");

const prettyfyTrueFalse = (string) => (string === true ? "Sí" : "No");
const prettyfyFrequency = (frequency) =>
  ({
    once: "Una ves",
    twice: "Dos veces",
    no: "No visita",
    distance: "A distancia"
  }[frequency]);

const getSupervisorNameById = async (userId) => {
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
  }
};

const getSellerNameById = async (sucursalId, sellerId) => {
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
  }
};
const getRouteNameById = async (sucursalId, routeId) => {
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
      .find((seller) => seller.id === routeId && seller.sucursal === sucursalId)
      .name;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  /**
   * recieves userId<string> => id of the user for log
   * recieves password<string> => password to test
   * recieves sucursal<string> => sucursal
   * return true of false for the password match { match: true/false }
   * writes in the sheet the information about the login
   */
  async postSurvey(request, response) {
    try {
      console.log(request.body);
      const sucursalDoc = await createSucursalConnection(request.body.sucursal);
      const surveySheet = sucursalDoc.sheetsByTitle["relevameinto"];

      const {
        supervisor,
        seller,
        route,
        cordy,
        cordx,
        clientId,
        clientName,
        clientVisited,
        frequency,
        generalComments,
        logisticsProblems,
        logisicProblemComment
      } = request.body;

      const supervisorName = await getSupervisorNameById(supervisor);
      const sellerName = await getSellerNameById(request.body.sucursal, seller);
      const routeName = await getRouteNameById(request.body.sucursal, route);

      surveySheet.addRow({
        Supervisor: supervisorName,
        Preventista: sellerName,
        Ruta: routeName,
        Data: getDate(),
        Hora: getTime(),
        Latitud: cordy,
        Longitud: cordx,
        "Codigo de cliente": clientId,
        "Nombre del cliente": clientName,
        "Visitado?": prettyfyTrueFalse(clientVisited),
        Frecuencia: prettyfyFrequency(frequency),
        Comentarios: generalComments,
        "Problemas de logistica?": prettyfyTrueFalse(logisticsProblems),
        "Comentarios acerca de los problemas de logistica": logisicProblemComment
      });

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Cadastro de Relevamiento falló" });
    }
  }
};
