const {
  createMaestroConnection,
  createSucursalConnection
} = require("../services/sheetsConnections");
const { getAllProductsDataBySucursalId } = require("../utils/searches");
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
  },
  async updateProducts(request, response) {
    // use react-chartjs-2
    /*
    const getSurveyQnAObject = (serverSideData, clientSideData) => {
      return serverSideData.map((data) => {
        return JSON.parse(`{
          "hay ${data.label}?": "${invertedprettyfyTrueFalse(
          clientSideData[`${data.name}Noproduct`]
        )}",
            "está ${data.label} en gondola?": "${prettyfyTrueFalse(
          clientSideData[`${data.name}Gondola`]
        )}",
            "tiene afiche de ${data.label}?": "${prettyfyTrueFalse(
          clientSideData[`${data.name}Poster`]
        )}",
            "está ${
              data.label
            } precificado correctamente?": "${prettyfyTrueFalse(
          clientSideData[`${data.name}Pricing`]
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
    
    
    

      const threatedSurveyData = [].concat(
        getSurveyQnAObject(surveyData.redcom, surveyRedcom),
        getSurveyQnAObject(surveyData.water, surveySoda),
        getSurveyQnAObject(surveyData.soda, surveyWater),
        getExhibitionQnAObject(surveyData.redcom, exhibition)
      );

      threatedSurveyData.forEach((threatedSurveyInfo) => {
        Object.entries(threatedSurveyInfo).forEach(([key, value]) => {
          addRowData[key] = value;
        });
      });

    */
    try {
      /**
       * TODO:
       * UPDATE ALL SUCURSAL SHEETS HEADERS
       * GET HEADERS
       * SEPARATE THE IMUTABLE HEADERS
       * CREATE AN ARRAY WITH THE NEW ONES (RE RIGHT THE MUTABLES)
       * JOIN THE ARRAYS
       * SET HEADERS TO THE JOINED ARRAY
       * RETURN
       * Comentarios acerca de los problemas de logistica
       */

      const sucursalDoc = await createSucursalConnection("1");
      const surveySheet = sucursalDoc.sheetsByTitle["relevameinto"];

      await surveySheet.loadHeaderRow();
      const imutableHeaders = surveySheet.headerValues.slice(0, 14);
      // getProductsBySucursalId(1);
      console.log(imutableHeaders);

      const productsData = await getAllProductsDataBySucursalId("1");
      console.log(productsData);

      let mutableHeaders = [];

      productsData.forEach((productData) => {
        if (productData.table === "redcom") {
          return mutableHeaders.push(
            `hay ${productData.label}?`,
            `está ${productData.label} en gondola?`,
            `tiene afiche de ${productData.label}?`,
            `está ${productData.label} precificado correctamente?`,
            `está ${productData.label} exhibido correctamente?`
          );
        } else {
          return mutableHeaders.push(
            `hay ${productData.label}?`,
            `está ${productData.label} en gondola?`,
            `tiene afiche de ${productData.label}?`,
            `está ${productData.label} precificado correctamente?`
          );
        }
      });

      console.log(mutableHeaders);

      // return response.status(200).json();

      // return response.status(200).json();
      const newHeaders = [...imutableHeaders, ...mutableHeaders];

      // console.log(newHeaders);
      await surveySheet.resize({
        rowCount: surveySheet.rowCount,
        columnCount: newHeaders.length + 2
      });

      await surveySheet.setHeaderRow(newHeaders);

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      return response.status(502);
    }
  }
};
