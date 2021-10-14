const {
    createMaestroConnection,
    createSucursalConnection
} = require("../services/sheetsConnections");

const { 
    getDate,
    getTime,
    parseDate } = require("../utils/dates");
const { 
    getProductsBySucursalId,
    getSellerNameById,
    getRouteNameById
} = require("../utils/searches");
const surveyController = require("./surveyController");

module.exports = {
    async getSurveyData(request, response) {
        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const surveySheet = await sucursalDoc.sheetsByTitle["relevameinto"];

            const surveyRows = await surveySheet.getRows();

            let responseData = {};

            // Surveys by supervisors

            // getting supervisors rows
            const supervisorSurveyData = surveyRows.map(row => {
                return row['Supervisor']
            });

            // parsing from obj to array
            const supervisorSurveyCounts = {};
            supervisorSurveyData.forEach(function (x) { supervisorSurveyCounts[x] = (supervisorSurveyCounts[x] || 0) + 1; });
            
            // threating data to fit react-google-charts
            const supervisorSurveyCountsArray = Object.entries(supervisorSurveyCounts).map(supervisorSurveyCounts => supervisorSurveyCounts);
            
            // adding headers
            supervisorSurveyCountsArray.push(['Supervisor', 'Cuantidad de Relevamientos']);
            
            // reversing for the headers be on position 0
            supervisorSurveyCountsArray.reverse();
            
            // clog for debug
            console.log(supervisorSurveyCountsArray);
            
            // adding to the response
            responseData['supervisor'] = supervisorSurveyCountsArray;


            // Surveys by sellers

            // getting sellers rows
            const sellerSurveyData = surveyRows.map(row => {
                return row['Preventista']
            });
            
            // parsing from obj to array
            const sellerSurveyCounts = {};
            sellerSurveyData.forEach(function (x) { sellerSurveyCounts[x] = (sellerSurveyCounts[x] || 0) + 1; });
            
            // threating data to fit react-google-charts
            const sellerSurveyCountsArray = Object.entries(sellerSurveyCounts).map(surveyCount => surveyCount);
            
            // adding headers
            sellerSurveyCountsArray.push(['Preventista', 'Cuantidad de Relevamientos']);

            // reversing for the headers be on position 0
            sellerSurveyCountsArray.reverse();
            
            // clog for debug
            console.log(sellerSurveyCountsArray);
            
            // adding to the response
            responseData['seller'] = sellerSurveyCountsArray;


            // Surveys by sellers

            // getting sellers rows
            const logisticSurveyData = surveyRows.map(row => {
                return row['Problemas de logistica?']
            });
            
            // parsing from obj to array
            const logisticSurveyCounts = {};
            logisticSurveyData.forEach(function (x) { logisticSurveyCounts[x] = (logisticSurveyCounts[x] || 0) + 1; });
            
            // threating data to fit react-google-charts
            const logisticSurveyCountsArray = Object.entries(logisticSurveyCounts).map(surveyCount => surveyCount);
            
            // adding headers
            logisticSurveyCountsArray.push(['Valor', 'Cantidad']);

            // reversing for the headers be on position 0
            logisticSurveyCountsArray.reverse();
            
            // clog for debug
            console.log(logisticSurveyCountsArray);
            
            // adding to the response
            responseData['logistic'] = logisticSurveyCountsArray;

            return response
                .status(200)
                .json(responseData)
            
            
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
            
            let surveyRows = await surveySheet.getRows();


            // apply filters here and store in surveyRows
            console.log(request.query)

            if (`${request.query.filter}` === 'true') {
                const {
                    selectedSeller,
                    selectedRoute
                } = request.query;

                const finalDate = new Date(request.query.finalDate)
                const initialDate = new Date(request.query.initialDate)
                
                let seller;
                let route;

                if (selectedSeller !== '') {
                    seller = await getSellerNameById(request.params.sucursal, selectedSeller)
                }
                
                if (selectedRoute !== '') {
                    route = await getRouteNameById(request.params.sucursal, selectedRoute)
                }                
                
                surveyRows = surveyRows.filter(row => {
                    const date = new Date(parseDate(row['Data']))

                    if (selectedSeller === '') {
                        return (
                            date >= initialDate &&
                            date <= finalDate
                        )
                    } else if (selectedRoute === '') {
                        return (
                            date >= initialDate &&
                            date <= finalDate &&
                            row['Preventista'] === seller
                        )
                    } else {
                        return (
                            date >= initialDate &&
                            date <= finalDate &&
                            row['Preventista'] === seller &&
                            row['Ruta'] === route
                        )
                    }
                });
                
            }
            
            const numberOfSurveys = surveyRows.map(row => {
                return row['Supervisor']
            }).length;

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

            productsPercetageByType['surveyCount']  = numberOfSurveys;
            if (surveyRows.length === 0) {
                productsPercetageByType['code']  = 1;
            } else {
                productsPercetageByType['code']  = 0;
            }

            console.log(productsPercetageByType)
            return response
                .status(200)
                .json(productsPercetageByType);

        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de relevamiento falló!" });
        }
    },
    async getCoachingData(request, response) {
        

        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const coachingSheet = await sucursalDoc.sheetsByTitle["post-coaching"];

            const coachingsRows = await coachingSheet.getRows();

            const coachings = coachingsRows.map(row => {
                return {
                    'supervisor': row['Supervisor'],
                    'seller': row['Preventista'],
                    'date': new Date(parseDate(row['Data'])),
                    'coaching': row['Puntaje Final'],
                    'pop': row['¿POP?'],
                    'exibition': row['¿Trabaja en una mayor exposición de los productos?'],
                }
            });
            
            let dataBySeller = Object()

            coachings.forEach(coaching => {
                if (dataBySeller.hasOwnProperty(coaching.seller)) {
                    dataBySeller[coaching.seller].push(coaching)
                } else {
                    dataBySeller[coaching.seller] = [coaching]
                }
            });

            // Object.entries(productsByType).forEach(([productsType, products])
            Object.entries(dataBySeller).forEach(([seller, coachings]) => {
                dataBySeller[seller] = coachings.reduce((a, b) => {
                    return new Date(a.MeasureDate) > new Date(b.MeasureDate) ? a : b;
                });
            })

            const coachingDataBySeller = []
            Object.entries(dataBySeller).forEach(([seller, coaching]) => {
                coachingDataBySeller.push({
                    seller: seller,
                    coaching: coaching
                })
            })
            console.log(coachingDataBySeller)
            return response
                .status(200)
                .json(coachingDataBySeller)
            
            
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de coachings falló!" });
        }
    }
}