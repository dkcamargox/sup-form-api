const { createSucursalConnection } = require("../services/sheetsConnections");
const { getDate, getTime } = require("../utils/dates");

const format = require('pg-format');

const pool = require('../services/connection');

module.exports = {
  /**
   * recieves pre-coaching data loads to spreadsheet
   */
  async postPreCoaching(request, response) {
    console.log('POST PRE COACHING');
    console.log(`REQUEST`);
    console.log(`seller: ${request.body.seller}`);
    console.log(`route: ${request.body.route}`);

    const client = await pool.connect();

    try {

      const { supervisor, route, cordy, cordx } = request.body;

      const {
        uniformPop,
        dailyGoal,
        price,
        posters,
        plan,
        sales,
        helmet,
        noCellphone,
        laws,
        threadId
      } = request.body;

      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO pre_coachings(\
        thread_id,\
        date,\
        time,\
        cordx,\
        cordy,\
        uniform_pop,\
        daily_goal,\
        price,\
        posters,\
        plan,\
        sales,\
        helmet,\
        no_cellphone,\
        laws\
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
      [
        threadId,
        getDate(),
        getTime(),
        cordx,
        cordy,
        uniformPop === 'true' ? true : false,
        dailyGoal === 'true' ? true : false,
        price === 'true' ? true : false,
        posters === 'true' ? true : false,
        plan === 'true' ? true : false,
        sales === 'true' ? true : false,
        helmet === 'true' ? true : false,
        noCellphone === 'true' ? true : false,
        laws === 'true' ? true : false
      ]);

      await client.query('COMMIT');

      return response.status(200).json({
        threadId
      });
    } catch (error) {
      console.log(error);
      await client.query('ROLLBACK');
      return response
        .status(502)
        .json({ error: "Cadastro de Pre Coaching falló" });
    }
  },
  async postPostCoaching(request, response) {
    console.log('POST POST-COACHING');
    console.log(`REQUEST`);
    console.log(`seller: ${request.body.seller}`);
    console.log(`route: ${request.body.route}`);

    const client = await pool.connect();
    try {
      
      const {
        threadId,
        strongPoints,
        weakPoints,
        commentsText,
        lastOrder,
        sellPlan,
        pop,
        stock,
        exposition,
        competitorSales,
        sales,
        sellPropouse,
        deliveryPrecautions,
        popPricing,
        timeManagement,
        catalogue,
        total,
        cordx,
        cordy      
      } = request.body;

      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO post_coachings(
          thread_id,
          date,
          time,
          cordx,
          cordy,
          total,
          last_order,
          sell_plan,
          pop,
          stock,
          exposition,
          competitor_sales,
          sales,
          sell_propouse,
          delivery_precautions,
          pop_pricing,
          time_management,
          catalogue,
          comment,
          strong_point,
          weak_point
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          threadId,
          getDate(),
          getTime(),
          cordx,
          cordy,  
          total,
          lastOrder,
          sellPlan,
          pop,
          stock,
          exposition,
          competitorSales,
          sales,
          sellPropouse,
          deliveryPrecautions,
          popPricing,
          timeManagement,
          catalogue,
          commentsText?commentsText:'no comments',
          strongPoints?strongPoints:'no comments',
          weakPoints?weakPoints:'no comments'
        ]
      );

      await client.query('COMMIT');

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      await client.query('ROLLBACK');
      return response
        .status(502)
        .json({ error: "Cadastro de Post Coaching falló" });
    }
  },
  async postCoaching(request, response) {
    console.log('POST COACHING');
    console.log(`REQUEST`);
    console.log(`seller: ${request.body.seller}`);
    console.log(`route: ${request.body.route}`);

    const client = await pool.connect();
    try {

      await client.query('BEGIN');

      client.query(
        `INSERT INTO coachings(
          thread_id,
          date,
          time,
          cordx,
          cordy,
          client_id,
          client_name,
          last_order,
          sell_plan,
          pop,
          stock,
          exposition,
          competitor_sales,
          sales,
          sell_propouse,
          delivery_precautions,
          pop_pricing,
          time_management,
          catalogue,
          relationship
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          request.body.threadId,
          getDate(),
          getTime(),
          request.body.cordx,
          request.body.cordy,
          parseInt(request.body.clientId),
          request.body.clientName,
          request.body.lastOrder === 'true' ? true:false,
          request.body.sellPlan === 'true' ? true:false,
          request.body.pop === 'true' ? true:false,
          request.body.stock === 'true' ? true:false,
          request.body.exposition === 'true' ? true:false,
          request.body.competitorSales === 'true' ? true:false,
          request.body.sales === 'true' ? true:false,
          request.body.sellPropouse === 'true' ? true:false,
          request.body.deliveryPrecautions === 'true' ? true:false,
          request.body.popPricing === 'true' ? true:false,
          request.body.timeManagement === 'true' ? true:false,
          request.body.catalogue === 'true' ? true:false,
          request.body.relationship,
        ]
      );

      await client.query('COMMIT');

      return response.status(200).json();
    } catch (error) {
      console.log(error);
      await client.query('ROLLBACK');
      return response.status(502).json({ error: "Cadastro de Coaching falló" });
    }
  }
};
