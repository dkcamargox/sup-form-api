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

            const rowId = await continueSheet.addRow({
                'id supervisor': request.body.supervisor,
                'id ruta': request.body.route,
                'tipo de formulario': request.body.formType,
                'ultimo cargado': 0
            });

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

        const getSellerNameById = (rows, sucursalId, sellerId) => {

            return rows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    name: row.nombre
                };
            }).find(
                (seller) => `${seller.id}` === `${sellerId}` && `${seller.sucursal}` === `${sucursalId}`
            ).name;
        };
        
        const getRouteNameById =  (rows, sucursalId, routeId) => {
            return rows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    name: row.ruta
                    };  
            }).find(
                (seller) => `${seller.id}` === `${routeId}` && `${seller.sucursal}` === `${sucursalId}`
            ).name;
        };

        const getSellerNameByRouteId = (routesRows, sellersRows, sucursal, routeId) => {
            const sellerId = routesRows.map((row) => {
                return {
                    sucursal: row.sucursal,
                    id: row.id,
                    sellerId: row['id vendedor']
                };  
            }).find(
                (route) => `${route.id}` === `${routeId}` && `${route.sucursal}` === `${sucursal}`
            ).sellerId;

            return getSellerNameById(sellersRows, sucursal, sellerId);
        };
        
        
        try {
            
            const maestroDoc = await createMaestroConnection();

            const continueSheet = maestroDoc.sheetsByTitle["continuar"];
            const continueRows = await continueSheet.getRows();

            const routesRows = await maestroDoc.sheetsByTitle["rutas"].getRows();
            const sellersRows = await maestroDoc.sheetsByTitle["vendedores"].getRows();

            
            const rows = await continueRows.map(row => {
                return {
                    id: row['_rowNumber'],
                    route: getRouteNameById(routesRows, request.params.sucursal, row['id ruta']),
                    seller: getSellerNameByRouteId(
                        routesRows,
                        sellersRows,    
                        request.params.sucursal,
                        row['id ruta']
                    ),
                    formType: row['tipo de formulario'],
                    clientCountage: row['ultimo cargado'],
                    supervisorId: row['id supervisor']
                };
            }).filter(row => {
                return `${row.supervisorId}` === `${request.params.supervisor}`
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
