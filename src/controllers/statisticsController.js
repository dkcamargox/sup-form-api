const {
    createMaestroConnection,
    createSucursalConnection
} = require("../services/sheetsConnections");

const { getDate, getTime } = require("../utils/dates");
const { getProductsBySucursalId } = require("../utils/searches");
const surveyController = require("./surveyController");

module.exports = {
    async getSurveyDataBySupervisor(request, response) {
        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const surveySheet = sucursalDoc.sheetsByTitle["relevameinto"];

            const surveyRows = await surveySheet.getRows();

            const surveyData = surveyRows.map(row => {
                return row['Supervisor']
            });

            const surveyCounts = {};
            surveyData.forEach(function (x) { surveyCounts[x] = (surveyCounts[x] || 0) + 1; });
            
            // threating data to fit react-google-charts
            const surveyCountsArray = Object.entries(surveyCounts).map(surveyCount => surveyCount)
            surveyCountsArray.push(['Supervisor', 'Cuantidad de Relevamientos'])
            surveyCountsArray.reverse()
            console.log(surveyCountsArray)
            return response
                .status(200).json(surveyCountsArray);
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de relevamiento falló!" });
        }
    },
    async getSurveyDataBySeller(request, response) {
        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const surveySheet = sucursalDoc.sheetsByTitle["relevameinto"];

            const surveyRows = await surveySheet.getRows();

            const surveyData = surveyRows.map(row => {
                return row['Preventista']
            });

            const surveyCounts = {};
            surveyData.forEach(function (x) { surveyCounts[x] = (surveyCounts[x] || 0) + 1; });
            
            // threating data to fit react-google-charts
            const surveyCountsArray = Object.entries(surveyCounts).map(surveyCount => surveyCount)
            surveyCountsArray.push(['Preventista', 'Cuantidad de Relevamientos'])
            surveyCountsArray.reverse()
            console.log(surveyCountsArray)
            return response
                .status(200).json(surveyCountsArray);
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de relevamiento falló!" });
        }
    },
    async getSurveyDataByLogistic(request, response) {
        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const surveySheet = sucursalDoc.sheetsByTitle["relevameinto"];

            const surveyRows = await surveySheet.getRows();

            const surveyData = surveyRows.map(row => {
                return row['Problemas de logistica?']
            });

            const surveyCounts = {};
            surveyData.forEach(function (x) { surveyCounts[x] = (surveyCounts[x] || 0) + 1; });
            
            // threating data to fit react-google-charts
            const surveyCountsArray = Object.entries(surveyCounts).map(surveyCount => surveyCount)
            surveyCountsArray.push(['Valor', 'Cantidad'])
            surveyCountsArray.reverse()
            console.log(surveyCountsArray)
            return response
                .status(200).json(surveyCountsArray);
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de relevamiento falló!" });
        }
    },
    async getProductsSurveyData(request, response) {
        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const surveySheet = sucursalDoc.sheetsByTitle["relevameinto"];

            const surveyRows = await surveySheet.getRows();

            const productsByType = await getProductsBySucursalId(request.params.sucursal);
            const productsPercetageByType = {}

            Object.entries(productsByType).forEach(([productsType, products]) => {
    
                // getting each product label and parsing to the title sheet format
                let treatedProductData = products.map(product => {
                    return [
                        `hay ${product.label}?`, //cobertura
                        `tiene afiche de ${product.label}?`, //afiche
                        `está ${product.label} precificado correctamente?` //precificacion
                    ]
                })
                
                // getting product survey info
                let productRows = treatedProductData.map(productData => {
                    // get the raw suvey data
                    const productPercentages = productData.map(productLabel => {
                        surveyCounts = {}
                        //iterates over each column of data of each product
                        surveyRows.map(row => {
                            // return the data in the column
                            return row[productLabel]
                        })
                        .forEach(function (x) { surveyCounts[x] = (surveyCounts[x] || 0) + 1; }); //count the times of yes and no for taking data
                        const aux = {}
    
                        // counting if its not null tho
                        const yesCount = surveyCounts['Sí'] || 0;
                        const noCount = surveyCounts['No'] || 0;
                        // geting percentages returning
                        return  aux[productLabel] = yesCount / (yesCount + noCount)
                        
                    });
                    // putting data into array to match the googlecharts data format
                    return Object.values(productPercentages)
                });
                
                // adding the corresponding product to match the data
                const productsTreatedData = products.map((product, index) => {
                    return [product.label, ...productRows[index]]
                });
                return productsPercetageByType[productsType] = productsTreatedData;
            })

            

            return response
                .status(200)
                .json(productsPercetageByType);

        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de relevamiento falló!" });
        }
    }
}