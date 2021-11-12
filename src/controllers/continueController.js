const {
    createMaestroConnection
} = require("../services/sheetsConnections");

module.exports = {
    /**
     * CREATE A NEW UNFINISHED ROUTE
     * @param {recives all data from body} request 
     * @param {returns ok or err} response 
     * @returns 
     */
    async createContinue(request, response) {
        try {
            
            const maestroDoc = await createMaestroConnection();

            const continueSheet = maestroDoc.sheetsByTitle["continuar"];

            console.log(request.body);

            let rowId;

            if(request.body.formType === 'coaching') {
                rowId = await continueSheet.addRow({
                    'id supervisor': request.body.supervisor,
                    'id ruta': request.body.route,
                    'tipo de formulario': request.body.formType,
                    'ultimo cargado': 0,
                    '¿Indaga sobre el último pedido?': 0,
                    '¿Planifica el pedido antes de ingresar al PDV?': 0,
                    '¿POP?': 0,
                    '¿Verifica el stock en todas las áreas del PDV?': 0,
                    '¿Trabaja en una mayor exposición de los productos?': 0,
                    '¿Indaga y verifica la situación y las acciones de la competencia?': 0,
                    '¿Comunica las acciones comerciales vigentes?': 0,
                    '¿Realiza la propuesta de ventas, ofreciendo todos los productos?': 0,
                    '¿Toma todos los recaudos necesarios para facilitar la entrega? (pedido, dinero, horario, etc.)': 0,
                    '¿Renueva, coloca y pone precios al POP? Siguiendo criterios del PDV': 0,
                    '¿Administra el tiempo de permanencia en el PDV?': 0,
                    '¿Uso de Catálogo?': 0,
                });
            } else {
                rowId = await continueSheet.addRow({
                    'id supervisor': request.body.supervisor,
                    'id ruta': request.body.route,
                    'tipo de formulario': request.body.formType,
                    'ultimo cargado': 0,
                });
            }
            console.log({ error: false, id: rowId['_rowNumber'] });

            return response
                .status(200)
                .json({ error: false, id: rowId['_rowNumber'] });

        } catch (error) {
            console.log(error);
            return response.status(502).json({ error: "create continue falló" });
        }
    },
    /**
     * DELETE A ROUTE
     * @param {recives ID from body} request 
     * @param {returns ok or err} response 
     * @returns 
     */
    async deleteContinue(request, response) {
        try {
            
            const maestroDoc = await createMaestroConnection();

            const continueSheet = maestroDoc.sheetsByTitle["continuar"];

            const continueRows = await continueSheet.getRows();
            
            const row = await continueRows.find(row => {
                return `${row['_rowNumber']}` === `${request.params.id}`;
            });

            row.delete();

            console.log({ error: false, id: request.params.id });

            return response
                .status(200)
                .json({ error: false, id: request.params.id });
                
        } catch (error) {
            console.log(error);
            return response.status(502).json({ error: "delete continue falló" });
        }
    },
    /**
     * UPDATE A UNFINISHED ROUTE
     * @param {recives ID from body} request 
     * @param {returns ok or err} response 
     * @returns 
     */
    async updateContinue(request, response) {
        try {
            
            const maestroDoc = await createMaestroConnection();

            const continueSheet = maestroDoc.sheetsByTitle["continuar"];

            const continueRows = await continueSheet.getRows();
            
            const row = await continueRows.find(row => {
                return `${row['_rowNumber']}` === `${request.params.id}`;
            });

            row['ultimo cargado'] = request.body.countage;

            if (row['tipo de formulario'] === 'coaching') {
                row['¿Indaga sobre el último pedido?'] = request.body.stats.lastOrder
                row['¿Planifica el pedido antes de ingresar al PDV?'] = request.body.stats.sellPlan
                row['¿POP?'] = request.body.stats.pop
                row['¿Verifica el stock en todas las áreas del PDV?'] = request.body.stats.stock
                row['¿Trabaja en una mayor exposición de los productos?'] = request.body.stats.exposition
                row['¿Indaga y verifica la situación y las acciones de la competencia?'] = request.body.stats.competitorSales
                row['¿Comunica las acciones comerciales vigentes?'] = request.body.stats.sales
                row['¿Realiza la propuesta de ventas, ofreciendo todos los productos?'] = request.body.stats.sellPropouse
                row['¿Toma todos los recaudos necesarios para facilitar la entrega? (pedido, dinero, horario, etc.)'] = request.body.stats.deliveryPrecautions
                row['¿Renueva, coloca y pone precios al POP? Siguiendo criterios del PDV'] = request.body.stats.popPricing
                row['¿Administra el tiempo de permanencia en el PDV?'] = request.body.stats.timeManagement
                row['¿Uso de Catálogo?'] = request.body.stats.catalogue
            }

            await row.save();

            console.log({ error: false, id: request.params.id });

            return response
                .status(200)
                .json({ error: false, id: request.params.id });
                
        } catch (error) {
            console.log(error);
            return response.status(502).json({ error: "delete continue falló" });
        }
    },
    /**
     * GET ALL UNFINISHED ROUTE
     * @param {recives ID from body} request 
     * @param {returns ok or err} response 
     * @returns 
     */
    async getContinuesBySupervisor(request, response) {
        console.log(request.params)

        const getSellerById = (rows, sucursalId, sellerId) => {

            return rows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    name: row.nombre
                };
            }).find(
                (seller) => `${seller.id}` === `${sellerId}` && `${seller.sucursal}` === `${sucursalId}`
            );
        };
        
        const getRouteNameById =  (rows, routeId) => {
            return rows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    name: row.ruta
                };  
            }).find(
                (route) => `${route.id}` === `${routeId}`
            ).name
        };

        const getRouteSucursal =  (rows, routeId) => {
            return rows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    name: row.ruta
                };  
            }).find(
                (route) => `${route.id}` === `${routeId}`
            ).sucursal
        };

        const getSellerByRouteId = (routesRows, sellersRows, routeId) => {
            const route = routesRows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    sellerId: row['id vendedor']
                };  
            }).find(
                (route) => `${route.id}` === `${routeId}`
            );

            const seller = getSellerById(sellersRows, route.sucursal, route.sellerId);
            
            return {
                sellerId: seller.id,
                seller: seller.name
            }
        };
        
        
        try {
            
            const maestroDoc = await createMaestroConnection();

            const continueSheet = maestroDoc.sheetsByTitle["continuar"];
            const continueRows = await continueSheet.getRows();

            const routesRows = await maestroDoc.sheetsByTitle["rutas"].getRows();
            const sellersRows = await maestroDoc.sheetsByTitle["vendedores"].getRows();

            
            const rows = await continueRows.map(row => {
                if (row['tipo de formulario'] === 'relevamiento') {
                    return {
                        id: row['_rowNumber'],
                        sucursal: getRouteSucursal(routesRows, row['id ruta']),
                        route: getRouteNameById(routesRows, row['id ruta']),
                        seller: getSellerByRouteId(
                            routesRows,
                            sellersRows,
                            row['id ruta']
                        ).seller,
                        routeId: row['id ruta'],
                        sellerId: getSellerByRouteId(
                            routesRows,
                            sellersRows, 
                            row['id ruta']
                        ).sellerId,
                        formType: row['tipo de formulario'],
                        clientCountage: row['ultimo cargado'],
                        supervisorId: row['id supervisor']
                    };
                } else {
                    return {
                        id: row['_rowNumber'],
                        sucursal: getRouteSucursal(routesRows, row['id ruta']),
                        route: getRouteNameById(routesRows, row['id ruta']),
                        seller: getSellerByRouteId(
                            routesRows,
                            sellersRows,
                            row['id ruta']
                        ).seller,
                        routeId: row['id ruta'],
                        sellerId: getSellerByRouteId(
                            routesRows,
                            sellersRows,
                            row['id ruta']
                        ).sellerId,
                        formType: row['tipo de formulario'],
                        clientCountage: row['ultimo cargado'],
                        supervisorId: row['id supervisor'],
                        stats: {
                            lastOrder: Number(row['¿Indaga sobre el último pedido?']),
                            sellPlan: Number(row['¿Planifica el pedido antes de ingresar al PDV?']),
                            pop: Number(row['¿POP?']),
                            stock: Number(row['¿Verifica el stock en todas las áreas del PDV?']),
                            exposition: Number(row['¿Trabaja en una mayor exposición de los productos?']),
                            competitorSales: Number(row['¿Indaga y verifica la situación y las acciones de la competencia?']),
                            sales: Number(row['¿Comunica las acciones comerciales vigentes?']),
                            sellPropouse: Number(row['¿Realiza la propuesta de ventas, ofreciendo todos los productos?']),
                            deliveryPrecautions: Number(row['¿Toma todos los recaudos necesarios para facilitar la entrega? (pedido, dinero, horario, etc.)']),
                            popPricing: Number(row['¿Renueva, coloca y pone precios al POP? Siguiendo criterios del PDV']),
                            timeManagement: Number(row['¿Administra el tiempo de permanencia en el PDV?']),
                            catalogue: Number(row['¿Uso de Catálogo?'])
                        }
                    };
                    
                }
            }).filter(row => {
                return `${row.supervisorId}` === `${request.params.supervisor}` && `${row.sucursal}` === `${request.params.sucursal}`
            });

            console.log(rows);

            return response
                .status(200)
                .json(rows);
                
        } catch (error) {
            console.log(error);
            return response.status(502).json({ error: "delete continue falló" });
        }
    }
};
