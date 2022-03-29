const { getDate, getTime } = require("../utils/dates");
const pool = require('../services/connection');

module.exports = {
  /**
   * recieves survey data loads to spreadsheet
   */
  async postSurvey(request, response) {
    console.log('POST SURVEY');
    console.log('REQUEST');
    console.log(request.body.supervisor);
    console.log(request.body.route);

    const client = await pool.connect()    
    try {
      const {
        supervisor,
        seller,
        route,
        cordy,
        cordx,
        clientId,
        clientName,
        clientVisited,
        clientWithMix,
        frequency,
        generalComments,
        logisticsProblems,
        logisicProblemComment,
        surveyRedcom,
        surveySoda,
        surveyWater,
        surveyWines,
        exhibition
      } = request.body;

      await client.query('BEGIN')
      
      const { rows: surveyRow } = await client.query(
        'INSERT INTO surveys(\
        supervisor_id,\
        route_id,\
        date,\
        time,\
        cordx,\
        cordy,\
        client_id,\
        client_name,\
        client_visited,\
        client_with_mix,\
        frequency,\
        general_comments,\
        logistics_problems,\
        logisic_problem_comment\
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id',
      [
        supervisor,
        route,
        getDate(),
        getTime(),
        cordx,
        cordy,
        clientId,
        clientName,
        clientVisited==='true'?true:false,
        clientWithMix==='true'?true:false,
        frequency,
        generalComments,
        logisticsProblems==='true'?true:false,
        logisicProblemComment
      ]);
      
      console.log(surveyRow)
      
      const surveyId = surveyRow[0].id
      
      /*
      WHATS HAPPENING HERE?

      apparently node-pg takes too much time to do separate insertions,
      so im doing only one in one query string, so i recieve in a object

      productType: value => [product, type, value]
      i use subqueries to find the id's of time and product

      it takes less time and works, i do it 5 times [redcom, soda, wine, water, exibhition]
      i recieve a diferent obj from exhibition thats why its separated

      i put it all in a array called values and send it to queryText, removing the last char witch is a , replacing it a ;
      */
      const surveys = [
        surveyRedcom,
        surveySoda,
        surveyWater,
        surveyWines
      ]
      
      values = []
      
      surveys.forEach(survey => Object.entries(survey).forEach(([key, value]) => {
        // parsing obj to strings
        const keySplit = key.split(/(?=[A-Z])/)
        const product = keySplit[0].toLowerCase()
        const type = keySplit[1].toLowerCase()
        
        values.push([
          // subquery finding id
          `(SELECT id FROM products WHERE name='${product}')`,
          surveyId, 
          // subquery finding id
          `(SELECT id FROM survey_types WHERE type='${type}')`, 
          value
        ])
      }));
      Object.entries(exhibition).forEach(([key, value]) => {

        // parsing obj to strings
        const keySplit = key.split(/(?=[A-Z])/)
        const product = keySplit[1].toLowerCase()
        const type = keySplit[0].toLowerCase()
        
        values.push([
          // subquery finding id
          `(SELECT id FROM products WHERE name='${product}')`,
          surveyId, 
          // subquery finding id
          `(SELECT id FROM survey_types WHERE type='${type}')`,
          value
        ])
      });

      // standart insert for every values
      let queryText = 'INSERT INTO surveys_products(product_id, survey_id, survey_type_id, value) VALUES ';

      // building values in query text based in array
      values.forEach(([product, surveyId, type, value]) => {
        queryText = queryText + `(${product}, ${surveyId}, ${type}, ${value}),`
      })
        
      // replacing last char
      queryText = queryText.slice(0, -1)
      queryText = queryText + ';'

      // querying
      await client.query(queryText);
      
      client.query('COMMIT')



      return response.status(200).json();
    } catch (error) {
      console.log(error);
      client.query('ROLLBACK')
      return response
        .status(502)
        .json({ error: "Cadastro de Relevamiento falló" });
    }
  }
};
