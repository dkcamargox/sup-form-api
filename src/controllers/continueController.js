const { getDate } = require('../utils/dates');

const pool = require('../services/connection');

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
        const client = await pool.connect()
        try {
            console.log('CREATE CONTINUE');
            console.log(`REQUEST ${request.body}`);

            const { supervisor, route, formType, sucursal } = request.body;

            await client.query('BEGIN');
            const { rows: continuesRows } = await pool.query(
                'INSERT INTO continues(route_id, date, supervisor_id, type, countage) VALUES($1,$2,$3, $4, $5) RETURNING id;',
                [
                    parseInt(route),
                    getDate(),
                    parseInt(supervisor),
                    formType,
                    0
                ]   
            );
            const continueId = continuesRows[0].id;

            if(request.body.formType === 'coaching') {
                /**
                 * add stats
                 * add continues_stats
                 */
                const { rows: statsRows } = await pool.query(
                    'INSERT INTO stats(\
                        last_order,\
                        sell_plan,\
                        pop,\
                        stock,\
                        exposition,\
                        competitor_sales,\
                        sales,\
                        sell_propouse,\
                        delivery_precautions,\
                        pop_pricing,\
                        time_management,\
                        catalogue\
                    ) VALUES(\
                        0,0,0,0,0,0,0,0,0,0,0,0\
                    ) RETURNING id;'
                );
                const statId = statsRows[0].id;

                await pool.query(
                    'INSERT INTO continues_stats(continue_id, stat_id) VALUES($1,$2) RETURNING id;',
                    [continueId, statId]
                );
            } 
            
            await client.query('COMMIT');
            
            
            return response
                .status(200)
                .json({ error: false, id: continueId });

        } catch (error) {
            console.log(error);
            await client.query('ROLLBACK');
            return response.status(502).json({ error: "Falla al crear el continue de la ruta" });
        }
    },
    /**
     * DELETE A ROUTE
     * @param {recives ID from body} request 
     * @param {returns ok or err} response 
     * @returns 
     */
    async deleteContinue(request, response) {
        console.log('DELETE CONTINUES BY SUPERVISOR');
        console.log('REQUEST');
        console.log(request.params);

        const client = await pool.connect()
        const id = parseInt(request.params.id)
        await client.query('BEGIN');

        try {
            const { rowCount } = await client.query('SELECT 1 FROM continues_stats WHERE continue_id = $1', [id]);

            if (rowCount) {
                // deleting relation if exists (if its a coaching)
                const { rows: continuesStatsRows } = await client.query(
                    'DELETE FROM continues_stats WHERE continue_id = $1 RETURNING stat_id',
                    [id]
                );
                const statId = continuesStatsRows[0].stat_id;

                // deleting from stats
                await client.query(
                    'DELETE FROM stats WHERE id = $1',
                    [statId]
                );
            }

            await client.query('DELETE FROM continues WHERE id = $1', [id]);
            client.query('COMMIT');

            return response
                .status(200)
                .json({ error: false, id: id });
        } catch (error) {
            console.log(error);
            client.query('ROLLBACK');
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
        console.log('UPDATE CONTINUES BY ID');
        console.log(`REQUEST`);
        console.log(request.params);
        console.log(request.body);

        const client = await pool.connect()
        
        const { 
            id
        } = request.params;

        try {
            
            await client.query('BEGIN');

            const { rows: continuesRows } = await pool.query(
                'UPDATE continues SET countage=$2 WHERE id=$1 RETURNING type;',
                [
                    request.params.id,
                    request.body.countage
                ]   
            );
            const continueType = continuesRows[0].type;

            if(continueType === 'coaching') {
                /**
                 * add stats
                 * add continues_stats
                 */
                await pool.query(
                    'UPDATE stats SET\
                        last_order=$2,\
                        sell_plan=$3,\
                        pop=$4,\
                        stock=$5,\
                        exposition=$6,\
                        competitor_sales=$7,\
                        sales=$8,\
                        sell_propouse=$9,\
                        delivery_precautions=$10,\
                        pop_pricing=$11,\
                        time_management=$12,\
                        catalogue=$13\
                    WHERE id = (SELECT stat_id FROM continues_stats WHERE continue_id = $1);',
                    [
                        request.params.id,
                        request.body.stats.lastOrder,
                        request.body.stats.sellPlan,
                        request.body.stats.pop,
                        request.body.stats.stock,
                        request.body.stats.exposition,
                        request.body.stats.competitorSales,
                        request.body.stats.sales,
                        request.body.stats.sellPropouse,
                        request.body.stats.deliveryPrecautions,
                        request.body.stats.popPricing,
                        request.body.stats.timeManagement,
                        request.body.stats.catalogue
                    ]
                );
            } 
            
            await client.query('COMMIT');
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
        console.log('GET CONTINUES BY SUPERVISOR');
        console.log(`REQUEST ${request.body}`);
        const { 
            sucursal,
            supervisor
        } = request.params;
        
        try {
            const { rows: continueRows } = await pool.query(
                "SELECT\
                c.id,\
                b.name AS sucursal,\
                r.name AS route, \
                sl.name AS seller_name,\
                r.id AS route_id, \
                sl.id AS seller_id,\
                c.type AS form_type,\
                sp.name AS supervisor,\
                c.countage AS client_countage,\
                sp.id AS supervisor_id,\
                c.date\
                FROM continues AS c, supervisors AS sp, routes AS r, sellers AS sl, branches as b WHERE \
                r.id = c.route_id AND \
                sl.id = r.seller_id AND\
                sl.branch_id = b.id AND\
                sp.id = c.supervisor_id AND\
                b.id = $1 AND\
                c.supervisor_id = $2\
                ORDER BY c.type, c.date;",
                [sucursal, supervisor]
            );

            const { rows: statsRows } = await pool.query(
                "SELECT\
                c.id,\
                s.last_order,\
                s.sell_plan,\
                s.pop,\
                s.stock,\
                s.exposition,\
                s.competitor_sales,\
                s.sales,\
                s.sell_propouse,\
                s.delivery_precautions,\
                s.pop_pricing,\
                s.time_management,\
                s.catalogue \
                FROM continues AS c, continues_stats AS cs, stats AS s WHERE \
                cs.continue_id = c.id AND\
                cs.stat_id = s.id;"
            )
            
            const continues = continueRows.map(continueRow => {
                return {
                    ...continueRow,
                    stats: statsRows.find(statsRow => statsRow.id === continueRow.id)
                }
            });

            console.log(continues)

            return response
                .status(200)
                .json(continues);
                
        } catch (error) {
            console.log(error);
            return response.status(502).json({ error: "busqueda de continuaciones falló" });
        }
    }
};
