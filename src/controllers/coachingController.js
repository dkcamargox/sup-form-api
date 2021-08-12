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
        .json({ error: "Cadastro de Pre Coaching falló" });
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

      const {
        commentsText,
        strongPoints,
        weakPoints,
        total,
        lastOrder,
        sellPlan,
        pop,
        stock,
        exposition,
        competitorSales,
        sales,
        sellPropouse,
        deliveryPrecautions,
        popPricing,
        timeManagement,
        catalogue
      } = request.body;

      surveySheet.addRow({
        Supervisor: supervisorName,
        Preventista: sellerName,
        Ruta: routeName,
        Data: getDate(),
        Hora: getTime(),
        Latitud: cordy,
        Longitud: cordx,
        Comentarios: commentsText,
        "Puntaje Final": total,
        "Puntos Fuertes": strongPoints,
        "Puntos a desarollar": weakPoints,
        "¿Indaga sobre el último pedido?": lastOrder,
        "¿Planifica el pedido antes de ingresar al PDV?": sellPlan,
        "¿POP?": pop,
        "¿Verifica el stock en todas las áreas del PDV?": stock,
        "¿Trabaja en una mayor exposición de los productos?": exposition,
        "¿Indaga y verifica la situación y las acciones de la competencia?": competitorSales,
        "¿Comunica las acciones comerciales vigentes?": sales,
        "¿Realiza la propuesta de ventas, ofreciendo todos los productos?": sellPropouse,
        "¿Toma todos los recaudos necesarios para facilitar la entrega? (pedido, dinero, horario, etc.)": deliveryPrecautions,
        "¿Renueva, coloca y pone precios al POP? Siguiendo criterios del PDV": popPricing,
        "¿Administra el tiempo de permanencia en el PDV?": timeManagement,
        "¿Uso de Catálogo?": catalogue,
      });

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Cadastro de Post Coaching falló" });
    }
  },
  async postCoaching(request, response) {
    try {
      console.log(request.body);
      const sucursalDoc = await createSucursalConnection(request.body.sucursal);
      const surveySheet = sucursalDoc.sheetsByTitle["coaching"];

      const { supervisor, seller, route, cordy, cordx } = request.body;

      const supervisorName = await getSupervisorNameById(supervisor);
      const sellerName = await getSellerNameById(request.body.sucursal, seller);
      const routeName = await getRouteNameById(request.body.sucursal, route);

      console.log(request.body);
      const {
        clientId,
        clientName,
        loadingSend,
        lastOrder,
        sellPlan,
        pop,
        stock,
        exposition,
        competitorSales,
        sales,
        sellPropouse,
        deliveryPrecautions,
        popPricing,
        timeManagement,
        catalogue,
        relationship
      } = request.body;

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
        "¿Indaga sobre el último pedido?": prettyfyTrueFalse(lastOrder),
        "¿Planifica el pedido antes de ingresar al PDV?": prettyfyTrueFalse(
          sellPlan
        ),
        "¿POP?": prettyfyTrueFalse(pop),
        "¿Verifica el stock en todas las áreas del PDV?": prettyfyTrueFalse(
          stock
        ),
        "¿Trabaja en una mayor exposición de los productos?": prettyfyTrueFalse(
          exposition
        ),
        "¿Indaga y verifica la situación y las acciones de la competencia?": prettyfyTrueFalse(
          competitorSales
        ),
        "¿Comunica las acciones comerciales vigentes?": prettyfyTrueFalse(
          sales
        ),
        "¿Realiza la propuesta de ventas, ofreciendo todos los productos?": prettyfyTrueFalse(
          sellPropouse
        ),
        "¿Toma todos los recaudos necesarios para facilitar la entrega? (pedido, dinero, horario, etc.)": prettyfyTrueFalse(
          deliveryPrecautions
        ),
        "¿Renueva, coloca y pone precios al POP? Siguiendo criterios del PDV": prettyfyTrueFalse(
          popPricing
        ),
        "¿Administra el tiempo de permanencia en el PDV?": prettyfyTrueFalse(
          timeManagement
        ),
        "¿Uso de Catálogo?": prettyfyTrueFalse(catalogue),
        "¿Relación con el cliente?": relationship
      });

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      return response.status(502).json({ error: "Cadastro de Coaching falló" });
    }
  }
};
