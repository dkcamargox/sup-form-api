const { createSucursalConnection } = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");
const {
  getSupervisorNameById,
  getSellerNameById,
  getRouteNameById
} = require("../utils/searches");
const {
  prettyfyTrueFalse,
  prettyfyFrequency,
  invertedprettyfyTrueFalse
} = require("../utils/prettyfiers");

module.exports = {
  /**
   * recieves survey data loads to spreadsheet
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
        logisicProblemComment,
        surveyRedcom,
        surveySoda,
        surveyWater,
        exhibition
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
        "Comentarios acerca de los problemas de logistica": logisicProblemComment, // secco
        /**
         * redcom products
         * */

        // secco
        "hay Secco?": invertedprettyfyTrueFalse(surveyRedcom.seccoNoproduct),
        "está Secco en gondola?": prettyfyTrueFalse(surveyRedcom.seccoGondola),
        "tiene afiche de Secco?": prettyfyTrueFalse(surveyRedcom.seccoPoster),
        "está Secco precificado correctamente?": prettyfyTrueFalse(
          surveyRedcom.seccoPricing
        ),

        // sdlp
        "hay Siera de los Padres?": prettyfyTrueFalse(
          !surveyRedcom.sdlpNoproduct
        ),
        "está Siera de los Padres en gondola?": prettyfyTrueFalse(
          surveyRedcom.sdlpGondola
        ),
        "tiene afiche de Siera de los Padres?": prettyfyTrueFalse(
          surveyRedcom.sdlpPoster
        ),
        "está Siera de los Padres precificado correctamente?": prettyfyTrueFalse(
          surveyRedcom.sdlpPricing
        ),

        // nevares
        "hay Nevares?": prettyfyTrueFalse(!surveyRedcom.nevaresNoproduct),
        "está Nevares en gondola?": prettyfyTrueFalse(
          surveyRedcom.nevaresGondola
        ),
        "tiene afiche de Nevares?": prettyfyTrueFalse(
          surveyRedcom.nevaresPoster
        ),
        "está Nevares precificado correctamente?": prettyfyTrueFalse(
          surveyRedcom.nevaresPricing
        ),

        // vitalissima
        "hay Vitalissima?": prettyfyTrueFalse(
          !surveyRedcom.vitalissimaNoproduct
        ),
        "está Vitalissima en gondola?": prettyfyTrueFalse(
          surveyRedcom.vitalissimaGondola
        ),
        "tiene afiche de Vitalissima?": prettyfyTrueFalse(
          surveyRedcom.vitalissimaPoster
        ),
        "está Vitalissima precificado correctamente?": prettyfyTrueFalse(
          surveyRedcom.vitalissimaPricing
        ),

        // quentos
        "hay Quentos?": prettyfyTrueFalse(!surveyRedcom.quentoNoproduct),
        "está Quentos en gondola?": prettyfyTrueFalse(
          surveyRedcom.quentoGondola
        ),
        "tiene afiche de Quentos?": prettyfyTrueFalse(
          surveyRedcom.quentoPoster
        ),
        "está Quentos precificado correctamente?": prettyfyTrueFalse(
          surveyRedcom.quentoPricing
        ),

        // papel
        "hay Papel?": prettyfyTrueFalse(!surveyRedcom.papelNoproduct),
        "está Papel en gondola?": prettyfyTrueFalse(surveyRedcom.papelGondola),
        "tiene afiche de Papel?": prettyfyTrueFalse(surveyRedcom.papelPoster),
        "está Papel precificado correctamente?": prettyfyTrueFalse(
          surveyRedcom.papelPricing
        ),
        /**
         * competence products
         * */

        // cabalgata
        "hay Cabalgata?": prettyfyTrueFalse(!surveySoda.cabalgataNoproduct),
        "está Cabalgata en gondola?": prettyfyTrueFalse(
          surveySoda.cabalgataGondola
        ),
        "tiene afiche de Cabalgata?": prettyfyTrueFalse(
          surveySoda.cabalgataPoster
        ),
        "está Cabalgata precificado correctamente?": prettyfyTrueFalse(
          surveySoda.cabalgataPricing
        ),

        // manaos
        "hay Manaos?": prettyfyTrueFalse(!surveySoda.manaosNoproduct),
        "está Manaos en gondola?": prettyfyTrueFalse(surveySoda.manaosGondola),
        "tiene afiche de Manaos?": prettyfyTrueFalse(surveySoda.manaosPoster),
        "está Manaos precificado correctamente?": prettyfyTrueFalse(
          surveySoda.manaosPricing
        ),

        // caribe
        "hay Caribe?": prettyfyTrueFalse(!surveySoda.caribeNoproduct),
        "está Caribe en gondola?": prettyfyTrueFalse(surveySoda.caribeGondola),
        "tiene afiche de Caribe?": prettyfyTrueFalse(surveySoda.caribePoster),
        "está Caribe precificado correctamente?": prettyfyTrueFalse(
          surveySoda.caribePricing
        ),

        // cunnington
        "hay Cunnington?": prettyfyTrueFalse(!surveySoda.cunningtonNoproduct),
        "está Cunnington en gondola?": prettyfyTrueFalse(
          surveySoda.cunningtonGondola
        ),
        "tiene afiche de Cunnington?": prettyfyTrueFalse(
          surveySoda.cunningtonPoster
        ),
        "está Cunnington precificado correctamente?": prettyfyTrueFalse(
          surveySoda.cunningtonPricing
        ),

        // axis
        "hay Axis?": prettyfyTrueFalse(!surveySoda.axisNoproduct),
        "está Axis en gondola?": prettyfyTrueFalse(surveySoda.axisGondola),
        "tiene afiche de Axis?": prettyfyTrueFalse(surveySoda.axisPoster),
        "está Axis precificado correctamente?": prettyfyTrueFalse(
          surveySoda.axisPricing
        ),
        /**
         * competence aguas
         * */

        // levite
        "hay Levite?": prettyfyTrueFalse(!surveyWater.leviteNoproduct),
        "está Levite en gondola?": prettyfyTrueFalse(surveyWater.leviteGondola),
        "tiene afiche de Levite?": prettyfyTrueFalse(surveyWater.levitePoster),
        "está Levite precificado correctamente?": prettyfyTrueFalse(
          surveyWater.levitePricing
        ),

        // aquarius
        "hay Aquarius?": prettyfyTrueFalse(!surveyWater.aquariusNoproduct),
        "está Aquarius en gondola?": prettyfyTrueFalse(
          surveyWater.aquariusGondola
        ),
        "tiene afiche de Aquarius?": prettyfyTrueFalse(
          surveyWater.aquariusPoster
        ),
        "está Aquarius precificado correctamente?": prettyfyTrueFalse(
          surveyWater.aquariusPricing
        ),

        // awafruit
        "hay Awafruit?": prettyfyTrueFalse(!surveyWater.awafruitNoproduct),
        "está Awafruit en gondola?": prettyfyTrueFalse(
          surveyWater.awafruitGondola
        ),
        "tiene afiche de Awafruit?": prettyfyTrueFalse(
          surveyWater.awafruitPoster
        ),
        "está Awafruit precificado correctamente?": prettyfyTrueFalse(
          surveyWater.awafruitPricing
        ),

        // baggio fresh
        "hay Baggio Fresh?": prettyfyTrueFalse(
          !surveyWater.baggioFreshNoproduct
        ),
        "está Baggio Fresh en gondola?": prettyfyTrueFalse(
          surveyWater.baggioFreshGondola
        ),
        "tiene afiche de Baggio Fresh?": prettyfyTrueFalse(
          surveyWater.baggioFreshPoster
        ),
        /**
         * exhibiciones redcom
         * */
        "está Baggio Fresh precificado correctamente?": prettyfyTrueFalse(
          exhibition.baggioFreshPricing
        ),
        "está Secco exhibido correctamente?": prettyfyTrueFalse(
          exhibition.exhibitionSecco
        ),
        "está Siera de los Padres exhibido correctamente?": prettyfyTrueFalse(
          exhibition.exhibitionSdlp
        ),
        "está Nevares exhibido correctamente?": prettyfyTrueFalse(
          exhibition.exhibitionNevares
        ),
        "está Vitalissima exhibido correctamente?": prettyfyTrueFalse(
          exhibition.exhibitionVitalissima
        ),
        "está Quentos exhibido correctamente?": prettyfyTrueFalse(
          exhibition.exhibitionQuento
        ),
        "está Papel exhibido correctamente?": prettyfyTrueFalse(
          exhibition.exhibitionPape
        )
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
