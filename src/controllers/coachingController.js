const { createSucursalConnection } = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");
const {
  getSupervisorNameById,
  getSellerNameById,
  getRouteNameById
} = require("../utils/searches");
const { prettyfyTrueFalse } = require("../utils/prettyfiers");

module.exports = {
  /**
   * recieves pre-coaching data loads to spreadsheet
   */
  async postPreCoaching(request, response) {
    try {
      console.log(request.body);
      const sucursalDoc = await createSucursalConnection(request.body.sucursal);
      const surveySheet = sucursalDoc.sheetsByTitle["pre-coaching"];

      const { supervisor, seller, route, cordy, cordx } = request.body;

      const supervisorName = await getSupervisorNameById(supervisor);
      const sellerName = await getSellerNameById(request.body.sucursal, seller);
      const routeName = await getRouteNameById(request.body.sucursal, route);

      const {
        uniformPop,
        dailyGoal,
        price,
        posters,
        plan,
        sales,
        helmet,
        noCellphone,
        laws
      } = request.body;

      surveySheet.addRow({
        Supervisor: supervisorName,
        Preventista: sellerName,
        Ruta: routeName,
        Data: getDate(),
        Hora: getTime(),
        Latitud: cordy,
        Longitud: cordx,
        "¿Tiene el uniforme correspondiente, el kit básico y suficiente material POP?": prettyfyTrueFalse(
          uniformPop
        ),
        "¿Conoce el avance de las marcas y los objetivos del día, plani,ficados para los principales calibres?": prettyfyTrueFalse(
          dailyGoal
        ),
        "¿Conoce los precios de los 6 principales prod,uctos que vende?": prettyfyTrueFalse(
          price
        ),
        "¿Conoce el estado de los afi,ches en la ruta?": prettyfyTrueFalse(
          posters
        ),
        "¿Planifica la ruta del día?": prettyfyTrueFalse(plan),
        "¿Conoce las acci,ones del día y sus respectivos precios?": prettyfyTrueFalse(
          sales
        ),
        "¿Utiliza casco?": prettyfyTrueFalse(helmet),
        "¿Conduce sin utilizar celular?": prettyfyTrueFalse(noCellphone),
        "¿Respeta leyes de transito?": prettyfyTrueFalse(laws)
      });

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Cadastro de Relevamiento falló" });
    }
  },
  async postPostCoaching(request, response) {
    try {
      console.log(request.body);
      const sucursalDoc = await createSucursalConnection(request.body.sucursal);
      const surveySheet = sucursalDoc.sheetsByTitle["post-coaching"];

      const { supervisor, seller, route, cordy, cordx } = request.body;

      const supervisorName = await getSupervisorNameById(supervisor);
      const sellerName = await getSellerNameById(request.body.sucursal, seller);
      const routeName = await getRouteNameById(request.body.sucursal, route);

      const { commentsText, strongPoints, weakPoints } = request.body;

      surveySheet.addRow({
        Supervisor: supervisorName,
        Preventista: sellerName,
        Ruta: routeName,
        Data: getDate(),
        Hora: getTime(),
        Latitud: cordy,
        Longitud: cordx,
        Comentarios: commentsText,
        "Puntos Fuertes": strongPoints,
        "Puntos a desarollar": weakPoints
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
