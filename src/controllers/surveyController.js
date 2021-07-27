const { createSucursalConnection } = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");
const {
  getSupervisorNameById,
  getSellerNameById,
  getRouteNameById,
  getProductsBySucursalId
} = require("../utils/searches");
const {
  prettyfyTrueFalse,
  prettyfyFrequency,
  invertedprettyfyTrueFalse
} = require("../utils/prettyfiers");

const CSStoObjectNotation = require("../utils/notation");

module.exports = {
  /**
   * recieves survey data loads to spreadsheet
   */
  async postSurvey(request, response) {
    const getSurveyQnAObject = (serverSideData, clientSideData) => {
      return serverSideData.map((data) => {
        return JSON.parse(`{
          "hay ${data.label}?": "${invertedprettyfyTrueFalse(
          clientSideData[`${CSStoObjectNotation(data.name)}Noproduct`]
        )}",
            "está ${data.label} en gondola?": "${prettyfyTrueFalse(
          clientSideData[`${CSStoObjectNotation(data.name)}Gondola`]
        )}",
            "tiene afiche de ${data.label}?": "${prettyfyTrueFalse(
          clientSideData[`${CSStoObjectNotation(data.name)}Poster`]
        )}",
            "está ${
              data.label
            } precificado correctamente?": "${prettyfyTrueFalse(
          clientSideData[`${CSStoObjectNotation(data.name)}Pricing`]
        )}"
        }`);
      });
    };
    const getExhibitionQnAObject = (serverSideData, clientSideData) => {
      return serverSideData.map((data) => {
        return JSON.parse(`{
          "está ${
            data.label
          } exhibido correctamente?": "${invertedprettyfyTrueFalse(
          clientSideData[CSStoObjectNotation(`exhibition-${data.name}`)]
        )}"}`);
      });
    };
    try {
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
        logisicProblemComment,
        surveyRedcom,
        surveySoda,
        surveyWater,
        exhibition
      } = request.body;

      const surveyData = await getProductsBySucursalId(request.body.sucursal);

      const threatedSurveyData = [].concat(
        getSurveyQnAObject(surveyData.redcom, surveyRedcom),
        getSurveyQnAObject(surveyData.water, surveyWater),
        getSurveyQnAObject(surveyData.soda, surveySoda),
        getExhibitionQnAObject(surveyData.redcom, exhibition)
      );

      const supervisorName = await getSupervisorNameById(supervisor);
      const sellerName = await getSellerNameById(request.body.sucursal, seller);
      const routeName = await getRouteNameById(request.body.sucursal, route);
      const addRowData = {
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
        "Comentarios acerca de los problemas de logistica": logisicProblemComment // secco
      };

      threatedSurveyData.forEach((threatedSurveyInfo) => {
        Object.entries(threatedSurveyInfo).forEach(([key, value]) => {
          addRowData[key] = value;
        });
      });

      surveySheet.addRow(addRowData);

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      return response
        .status(502)
        .json({ error: "Cadastro de Relevamiento falló" });
    }
  }
};
