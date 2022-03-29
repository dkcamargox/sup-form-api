const { createSucursalConnection } = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");
const {
  getSupervisorNameById,
  getSellerNameById,
  getRouteNameById
} = require("../utils/searches");
const { prettyfyTrueFalse } = require("../utils/prettyfiers");

const pool = require('../services/connection');

module.exports = {
  /**
   * recieves pre-coaching data loads to spreadsheet
   */
  async postPreCoaching(request, response) {
    console.log('POST PRE COACHING');
    console.log(`REQUEST`);
    console.log(`seller: ${request.body.seller}`);
    console.log(`route: ${request.body.route}`);

    const client = await pool.connect();

    try {

      const { supervisor, route, cordy, cordx } = request.body;

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

      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO pre_coachings(\
        supervisor_id,\
        route_id,\
        date,\
        time,\
        cordx,\
        cordy,\
        uniform_pop,\
        daily_goal,\
        price,\
        posters,\
        plan,\
        sales,\
        helmet,\
        no_cellphone,\
        laws\
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)',
      [
        supervisor,
        route,
        getDate(),
        getTime(),
        cordx,
        cordy,
        uniformPop==='true' ? true : false,
        dailyGoal==='true' ? true : false,
        price==='true' ? true : false,
        posters==='true' ? true : false,
        plan==='true' ? true : false,
        sales==='true' ? true : false,
        helmet==='true' ? true : false,
        noCellphone==='true' ? true : false,
        laws==='true' ? true : false
      ]);
      
      client.query('COMMIT');

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      client.query('ROLLBACK');
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
