const {
    createMaestroConnection,
    createSucursalConnection
} = require("../services/sheetsConnections");

const { 
    getDate,
    getTime,
    parseDate } = require("../utils/dates");
const { invertedprettyfyTrueFalse } = require("../utils/prettyfiers");
const { 
    getProductsBySucursalId,
    getSellerNameById,
    getRouteNameById,
    getSellerBySucursal,
    getSupervisorNameById
} = require("../utils/searches");
const surveyController = require("./surveyController");


const pool = require('../services/connection');

module.exports = {
    async getSurveyData(request, response) {
        console.log('GET SURVEY DATA GRAPHICS');
        console.log(`REQUEST`);
        console.log(`branch: ${request.params.sucursal}`);
        const branch = request.params.sucursal;
        const client = await pool.connect();
        try {
                
            const { rows: supervisorsSurveyCountRows } = await client.query(`
                SELECT sup.name, count(sur.id) AS survey_countage
                FROM supervisors AS sup,
                surveys AS sur,
                supervisors_branches AS sb
                WHERE sur.supervisor_id = sup.id
                AND sb.supervisor_id = sup.id
                AND sb.branch_id = $1
                GROUP BY sup.id;
            `,[
                branch
            ]);
            
            const supervisorSurveyCountsArray = supervisorsSurveyCountRows.map(
                ({name, survey_countage}) => {
                return [
                    name,
                    parseInt(survey_countage),
                ];
            });
            
            // adding headers
            // reversing for the headers be on position 0
            supervisorSurveyCountsArray.reverse();
            supervisorSurveyCountsArray.push(['Supervisor', 'Cuantidad de Relevamientos']);
            supervisorSurveyCountsArray.reverse();
            
            console.log(supervisorSurveyCountsArray);
            
            const { rows: sellersSurveyCountRows } = await client.query(`
                SELECT slr.name, count(sur.id) AS survey_countage
                FROM routes AS rut,
                surveys AS sur,
                sellers AS slr
                WHERE 
                sur.route_id = rut.id
                AND slr.id = rut.seller_id
                AND slr.branch_id=$1
                GROUP BY slr.id
                ORDER BY slr.name;
            `,[
                branch
            ]);
            
            const sellersSurveyCountsArray = sellersSurveyCountRows.map(
                ({name, survey_countage}) => {
                return [
                    name,
                    parseInt(survey_countage),
                ];
            });
            // adding headers
            // reversing for the headers be on position 0
            sellersSurveyCountsArray.reverse();
            sellersSurveyCountsArray.push(["Preventista","Cuantidad de Relevamientos"]);
            sellersSurveyCountsArray.reverse();
            
            console.log(sellersSurveyCountsArray);
            
            
            const { rows: logisticsProblemsRows } = await client.query(`
                SELECT sur.logistics_problems as value,
                count(sur.logistics_problems) as countage
                FROM routes AS rut,
                surveys AS sur,
                sellers AS slr
                WHERE 
                sur.route_id = rut.id
                AND slr.id = rut.seller_id
                AND slr.branch_id=$1
                GROUP BY sur.logistics_problems
                ORDER BY sur.logistics_problems DESC;
            `,[
                branch
            ]);
            
            const logisticsProblemsArray = logisticsProblemsRows.map(
                ({value, countage}) => {
                return [
                    value ? 'Sí' : 'No',
                    parseInt(countage),
                ];
            });
            // adding headers
            // reversing for the headers be on position 0
            logisticsProblemsArray.reverse();
            logisticsProblemsArray.push(["Valor","Cantidad"]);
            logisticsProblemsArray.reverse();
            
            console.log(logisticsProblemsArray);
            
            responseData = {
                supervisor: supervisorSurveyCountsArray,
                seller: sellersSurveyCountsArray,
                logistic: logisticsProblemsArray
            }
            // clog for debug
            

            return response
                .status(200)
                .json(responseData)
            
            
        } catch (error) {
            console.log(error);
            await client.query('ROLLBACK');
            return response.status(502).json({ error: "Cadastro de Coaching falló" });
        }
    },

    async getProductsSurveyData(request, response) {
        console.log('GET PRODUCTS SURVEY DATA GRAPHICS');
        console.log(`REQUEST`);
        console.log(`branch: ${request.params.sucursal}`);
        const branch = request.params.sucursal;
        const client = await pool.connect();
        try {
                
            // apply filters here and store in surveyRows
            console.log(request.query)

            if (`${request.query.filter}` === 'true') {
                const {
                    selectedSeller,
                    selectedRoute,
                    selectedSupervisor
                } = request.query;

                const finalDate = new Date(request.query.finalDate)
                const initialDate = new Date(request.query.initialDate)
                
                let supervisor;
                let seller;
                let route;

                if (selectedSupervisor !== '') {
                    supervisor = await getSupervisorNameById(selectedSupervisor)
                }
                if (selectedSeller !== '') {
                    seller = await getSellerNameById(request.params.sucursal, selectedSeller)
                }
                
                if (selectedRoute !== '') {
                    route = await getRouteNameById(request.params.sucursal, selectedRoute)
                }                
                
                // TODO APPLY FILTERS
                
            }
            
            const { rows: visitedRows } = await client.query(`
                SELECT sur.client_visited as value,
                count(sur.client_visited) as countage
                FROM routes AS rut,
                surveys AS sur,
                sellers AS slr
                WHERE 
                sur.route_id = rut.id
                AND slr.id = rut.seller_id
                AND slr.branch_id=$1
                GROUP BY sur.client_visited
                ORDER BY sur.client_visited DESC;
            `,[
                branch
            ]);
            const { rows: mixRows } = await client.query(`
                SELECT sur.client_with_mix as value,
                count(sur.client_with_mix) as countage
                FROM routes AS rut,
                surveys AS sur,
                sellers AS slr
                WHERE 
                sur.route_id = rut.id
                AND slr.id = rut.seller_id
                AND slr.branch_id=$1
                GROUP BY sur.client_with_mix
                ORDER BY sur.client_with_mix DESC;
            `,[
                branch
            ]);
            
            const visitedArray = visitedRows.filter(({value, countage}) => value !== null).map(
                ({value, countage}) => {
                return [
                    value ? 'Sí' : 'No',
                    parseInt(countage),
                ];
            });
            
            const mixArray = mixRows.filter(({value, countage}) => value !== null).map(
                ({value, countage}) => {
                return [
                    value ? 'Sí' : 'No',
                    parseInt(countage),
                ];
            });

            const { rows: surveyRows } = await client.query(`
                SELECT count(sur.id) as countage
                FROM routes AS rut,
                surveys AS sur,
                sellers AS slr
                WHERE 
                sur.route_id = rut.id
                AND slr.id = rut.seller_id
                AND slr.branch_id=$1
            `,[
                branch
            ]);
            
            const surveyCount = surveyRows[0].countage;
            
            const { rows: surveyProductsRows } = await client.query(`
                SELECT 
                t.name AS product_type,
                p.label AS product,
                st.type AS survey_type,
                AVG( (sp.value)::int ) AS media 
                FROM
                surveys_products AS sp,
                products AS p,
                surveys AS sur, 
                sellers AS slr, 
                routes AS rut,
                products_types_branches AS ptb,
                types AS t,
                survey_types AS st
                WHERE 
                rut.seller_id = slr.id 
                AND sp.survey_id= sur.id
                AND sur.route_id=rut.id 
                AND slr.branch_id = $1
                and ptb.branch_id = $1
                AND ptb.type_id = t.id
                AND sp.survey_type_id = st.id
                AND sp.product_id = p.id
                AND ptb.product_id = p.id
                GROUP BY t.name, st.type, st.id, p.label, p.id, ptb.type_id
                ORDER BY ptb.type_id, p.id, st.id DESC;
            `,[
                branch
            ]);
            
            var groupBy = (xs, key) => {
                return xs.reduce((rv, x) => {
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            };

            let groupedByProductType = groupBy(surveyProductsRows, 'product_type')
            
            Object.entries(groupedByProductType).forEach(
                ([key, row]) => {
                    groupedByProductType[key] = groupBy(row, 'product')
                }
            )
            let productsPercentages = {};
            Object.entries(groupedByProductType).forEach(
                ([ikey, irow]) => {
                    productsPercentages[ikey] = [...Object.entries(irow).map(
                        ([jkey, jrow]) => {
                            return [...Object.entries(jrow).map(
                                ([zkey, zrow]) => {
                                    return parseFloat(zrow.media)
                                }
                            ),
                            jkey].reverse()
                        }
                    )]
                }
            )
            // adding headers
            visitedArray.reverse()
            visitedArray.push(["Valor","Cantidad"])
            visitedArray.reverse()
            
            mixArray.reverse()
            mixArray.push(["Valor","Cantidad"])
            mixArray.reverse()
            
            let productsPercetageByType = {...productsPercentages}
            productsPercetageByType['visitedPdv']  = visitedArray;
            
            
            
            productsPercetageByType['surveyCount']  = surveyCount;
            productsPercetageByType['mixedPdv']  = mixArray;
            

            
            if (surveyRows === 0) {
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

            const allSellers = await getSellerBySucursal(request.params.sucursal);


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
            Object.entries(dataBySeller).forEach(async ([seller, coaching]) => {
                console.log(seller)
                const thisSellerData = allSellers.find(thisSeller => thisSeller.name === seller);
                console.log(thisSellerData)
                coachingDataBySeller.push({
                    id: thisSellerData.id,
                    name: seller,
                    coaching: coaching
                })
            });
            
            // sorting by id
            coachingDataBySeller.sort((a, b) => (a.id - b.id));

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
    },
    async getCoachingHistoryBySellerId(request, response) {
        

        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const coachingSheet = await sucursalDoc.sheetsByTitle["post-coaching"];

            const coachingsRows = await coachingSheet.getRows();

            const sellerName = await getSellerNameById(request.params.sucursal, request.params.sellerId);
            
            const coachings = coachingsRows.map(row => {
                return {
                    'coachingId': row['_rowNumber'],
                    'supervisor': row['Supervisor'],
                    'seller': row['Preventista'],
                    'sellerId': request.params.sellerId,
                    'date': new Date(parseDate(row['Data'])),
                    'coaching': row['Puntaje Final'],
                    'pop': row['¿POP?'],
                    'exibition': row['¿Trabaja en una mayor exposición de los productos?'],
                }
            }).filter(row => {
                return row.seller === sellerName
            });
            
            let responseFormated = {};
            responseFormated['sellerName'] = sellerName;
            responseFormated['coachings'] = coachings.reverse();
            
            console.log(responseFormated)
            
            return response
            .status(200)
                .json(responseFormated)
            
            
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de coachings falló!" });
        }
    },
    async getCoachingDataById(request, response) {
        const parsePercentageToFloat = percentage => {
            var floatPercentage = parseFloat(percentage); // 20.1

            if(!isNaN(floatPercentage)){
                floatPercentage /= 100; // .201
            }

            return floatPercentage
        }

        try {
            const sucursalDoc = await createSucursalConnection(request.params.sucursal);
            const coachingSheet = await sucursalDoc.sheetsByTitle["post-coaching"];

            const coachingsRows = await coachingSheet.getRows();

            const sellerName = await getSellerNameById(request.params.sucursal, request.params.sellerId);
            
            const coaching = coachingsRows.map(row => {
                return {
                    'coachingId': row['_rowNumber'],
                    'supervisor': row['Supervisor'],
                    'seller': row['Preventista'],
                    'sellerId': request.params.sellerId,
                    'date': new Date(parseDate(row['Data'])),
                    total: parsePercentageToFloat(row["Puntaje Final"]),
                    lastOrder: parsePercentageToFloat(row["¿Indaga sobre el último pedido?"]),
                    sellPlan: parsePercentageToFloat(row["¿Planifica el pedido antes de ingresar al PDV?"]),
                    popStat: parsePercentageToFloat(row["¿POP?"]),
                    stock: parsePercentageToFloat(row["¿Verifica el stock en todas las áreas del PDV?"]),
                    exposition: parsePercentageToFloat(row["¿Trabaja en una mayor exposición de los productos?"]),
                    competitorSales: parsePercentageToFloat(row["¿Indaga y verifica la situación y las acciones de la competencia?"]),
                    sales: parsePercentageToFloat(row["¿Comunica las acciones comerciales vigentes?"]),
                    sellPropouse: parsePercentageToFloat(row["¿Realiza la propuesta de ventas, ofreciendo todos los productos?"]),
                    deliveryPrecautions: parsePercentageToFloat(row["¿Toma todos los recaudos necesarios para facilitar la entrega? (pedido, dinero, horario, etc.)"]),
                    popPricing: parsePercentageToFloat(row["¿Renueva, coloca y pone precios al POP? Siguiendo criterios del PDV"]),
                    timeManagement: parsePercentageToFloat(row["¿Administra el tiempo de permanencia en el PDV?"]),
                    catalogue: parsePercentageToFloat(row["¿Uso de Catálogo?"]),
                    comment: row['Comentarios'],
                    strongPoints: row['Puntos Fuertes'],
                    weakPoints: row['Puntos a desarollar']   
                }
            }).find(row => {
                return `${row.coachingId}` === `${request.params.coachingId}`
            });
            
            let responseFormated = {};
            responseFormated['sellerName'] = sellerName;
            responseFormated['coaching'] = coaching;
            
            console.log(responseFormated)
            
            return response
            .status(200)
                .json(responseFormated)
            
            
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de coachings falló!" });
        }
    }
}