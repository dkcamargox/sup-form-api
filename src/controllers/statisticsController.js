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
            let queryFilter = ``;

            if (`${request.query.filter}` === 'true') {
                const {
                    selectedSeller,
                    selectedRoute,
                    selectedSupervisor
                } = request.query;
                
                const finalDate = new Date(request.query.finalDate)
                const initialDate = new Date(request.query.initialDate)       


                queryFilter += `AND sur.date >= '${initialDate.toLocaleString('en-GB').split(',')[0]}'` 
                queryFilter += ` AND sur.date <= '${finalDate.toLocaleString('en-GB').split(',')[0]}'` 
                
                if (selectedSupervisor !== '') {
                    queryFilter += `
                    AND sur.supervisor_id = ${selectedSupervisor}` 
                }
                if (selectedSeller !== '') {
                    queryFilter += `
                    AND sur.route_id = rut.id
                    AND rut.seller_id = ${selectedSeller}`
                }
                
                if (selectedRoute !== '') {
                    queryFilter += `
                    AND sur.route_id = ${selectedRoute}` 
                }
                
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
                ${queryFilter}
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
                ${queryFilter}
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
                ${queryFilter}
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
                ${queryFilter}
                GROUP BY t.name, st.type, st.id, p.label, p.id, ptb.type_id
                ORDER BY ptb.type_id, p.id, st.id DESC;
            `,[
                branch
            ]);
            
            console.log(`
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
            ${queryFilter}
            GROUP BY t.name, st.type, st.id, p.label, p.id, ptb.type_id
            ORDER BY ptb.type_id, p.id, st.id DESC;
        `)
            
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
        console.log('GET COACHING DATA');
        console.log(`REQUEST`);
        console.log(`branch: ${request.params.sucursal}`);
        const branch = request.params.sucursal;
        const client = await pool.connect();
        try {
            const { rows: coachingRows } = await client.query(`
                SELECT x.*
                FROM (
                    SELECT slr.id,
                    spr.name as supervisor,
                    slr.name as name, 
                    ct.date, 
                    pc.total * 100 as coaching, 
                    pc.pop * 100 as pop, 
                    pc.exposition * 100 as exhibition, 
                    ROW_NUMBER() OVER (PARTITION BY slr.name ORDER BY pc.date DESC) AS n
                    FROM post_coachings AS pc, coaching_threads AS ct, routes AS rut, sellers as slr, supervisors as spr
                    WHERE pc.thread_id=ct.id AND 
                    ct.route_id=rut.id AND 
                    rut.seller_id=slr.id AND 
                    ct.supervisor_id = spr.id AND
                    slr.branch_id = $1
                    ORDER BY slr.id
                ) AS x
                WHERE n <= 1;
            `,[
                branch
            ]);
            
            const coachings = coachingRows.map(coaching => {
                return {
                    id: coaching.id,
                    name: coaching.name,
                    coaching:{
                        supervisor: coaching.supervisor,
                        seller: coaching.seller,
                        date: coaching.date,
                        coaching: `${coaching.coaching.toFixed(2)}%`.replace('.', ','),
                        pop: `${coaching.pop.toFixed(2)}%`.replace('.', ','),
                        exibition: `${coaching.exhibition.toFixed(2)}%`.replace('.', ',')
                    }
                }
            })
            
            return response
                .status(200)
                .json(coachings)
            
        } catch (error) {
            console.log(error);
            return response
                .status(502)
                .json({ error: "Busqueda de datos de coachings falló!" });
        }
    },
    async getCoachingHistoryBySellerId(request, response) {
        console.log('GET COACHING DATA BY SELLER ID');
        console.log(`REQUEST`);
        console.log(`branch: ${request.params.sucursal}`);
        console.log(request.params);
        console.log(request.body);
        const branch = request.params.sucursal;
        const sellerId = request.params.sellerId;
        const client = await pool.connect();
        try {
            const { rows: coachingRows } = await client.query(`
                SELECT
                    ct.id as coaching_id, 
                    spr.name as supervisor,
                    slr.id as seller_id,
                    slr.name as seller,
                    ct.date, 
                    pc.total * 100 as coaching, 
                    pc.pop * 100 as pop, 
                    pc.exposition * 100 as exhibition
                FROM post_coachings AS pc, coaching_threads AS ct, routes AS rut, sellers as slr, supervisors as spr
                WHERE pc.thread_id=ct.id AND 
                ct.route_id=rut.id AND 
                rut.seller_id=slr.id AND 
                spr.id = ct.supervisor_id AND
                slr.id= $1
                ORDER BY pc.date DESC;
            `,[
                sellerId
            ]);

            const { rows: sellers } = await client.query(`
                SELECT name FROM sellers WHERE id = $1;
            `,[
                sellerId
            ]);

            var responseFormated = {}
            responseFormated['sellerName'] = sellers[0].name
            responseFormated['coachings'] = coachingRows.map(coaching => {
                return {
                    coachingId: coaching.coaching_id,
                    supervisor: coaching.supervisor,
                    seller: coaching.seller,
                    sellerId: coaching.seller_id,
                    date: coaching.date,
                    coaching: `${coaching.coaching.toFixed(2)}%`.replace('.', ','),
                    pop: `${coaching.pop.toFixed(2)}%`.replace('.', ','),
                    exibition: `${coaching.exhibition.toFixed(2)}%`.replace('.', ',')
                }
            })

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
        console.log('GET COACHING DATA BY COACHING ID');
        console.log(`REQUEST`);
        console.log(`branch: ${request.params.sucursal}`);
        console.log(request.params);
        console.log(request.body);
        const sellerId = request.params.sellerId;
        const coachingId = request.params.coachingId;
        const client = await pool.connect();
        try {
            const { rows: coachingRows } = await client.query(`
                    SELECT
                        ct.id,
                        spr.name as supervisor,
                        slr.id as seller_id,
                        slr.name as seller,
                        pc.date,
                        pc.total,
                        pc.last_order,
                        pc.sell_plan,
                        pc.pop,
                        pc.stock,
                        pc.exposition,
                        pc.competitor_sales,
                        pc.sales,
                        pc.sell_propouse,
                        pc.delivery_precautions,
                        pc.pop_pricing,
                        pc.time_management,
                        pc.catalogue,
                        pc.comment,
                        pc.strong_point,
                        pc.weak_point
                    FROM post_coachings AS pc, coaching_threads AS ct, routes AS rut, sellers as slr, supervisors as spr
                    WHERE pc.thread_id=ct.id AND 
                    ct.route_id=rut.id AND 
                    rut.seller_id=slr.id AND 
                    spr.id = ct.supervisor_id AND
                    ct.id = $1
                    ORDER BY pc.date DESC;
            `,[
                coachingId
            ]);
            
            const { rows: sellers } = await client.query(`
                SELECT name FROM sellers WHERE id = $1;
            `,[
                sellerId
            ]);

            var responseFormated = {}
            responseFormated['sellerName'] = sellers[0].name
            responseFormated['coaching'] = coachingRows.map(coaching => {
                return {
                    coachingId: coaching.id,
                    supervisor: coaching.supervisor,
                    seller: coaching.seller,
                    sellerId: coaching.seller_id,
                    date: coaching.date,
                    total: Math.round(100 * coaching.total) / 100,
                    lastOrder: Math.round(100 * coaching.last_order) / 100,
                    sellPlan: Math.round(100 * coaching.sell_plan) / 100,
                    popStat: Math.round(100 * coaching.pop) / 100,
                    stock: Math.round(100 * coaching.stock) / 100,
                    exposition: Math.round(100 * coaching.exposition) / 100,
                    competitorSales: Math.round(100 * coaching.competitor_sales) / 100,
                    sales: Math.round(100 * coaching.sales) / 100,
                    sellPropouse: Math.round(100 * coaching.sell_propouse) / 100,
                    deliveryPrecautions: Math.round(100 * coaching.delivery_precautions) / 100,
                    popPricing: Math.round(100 * coaching.pop_pricing) / 100,
                    timeManagement: Math.round(100 * coaching.time_management) / 100,
                    catalogue: Math.round(100 * coaching.catalogue) / 100,
                    comment: coaching.comment,
                    strongPoints: coaching.strong_point === null?"":coaching.strong_point,
                    weakPoints: coaching.weak_point === null?"":coaching.weak_point
                }
            })[0];

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