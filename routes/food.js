var express = require('express');
var axios = require('axios');
var router = express.Router();

const dfff = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');
const translate = require('@k3rn31p4nic/google-translate-api');
// const translate = require('translate-google');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

router.get('/', function(req, res, next){
    res.send("Hello World, this food.js")
});



router.post('/', function(req, res, next) {
  const agent = new dfff.WebhookClient({
    request : req,
    response : res
  });

  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));


  let intentMap = new Map();
  intentMap.set('webhookTest', webhookTest);
  intentMap.set('searchFood', searchFood);
  agent.handleRequest(intentMap);

});


 
function webhookTest(agent) {
  agent.add("sending response from webhook server")
}

function trans(foodName_id) {
  translate(foodName_id, {from:'id', to: 'en' }).then(res => {
    console.info(res); // OUTPUT: You are amazing!
    return(res);
  }).catch(err => {
    console.error(err);
  });
}

function searchFood (agent) {
  var foodName_id = agent.parameters["foodName"];
  var foodName_en;
  console.info(foodName_id);

  return translate(foodName_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      foodName_en=res.text;
  // foodName_en =trans(foodName_id);

  console.log("makanan untuk " +foodName_en);
  
  var endpoint = 'http://localhost:3030/food-BFPD/sparql';
  var query =  
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
          SELECT DISTINCT ?food_name ?man ?ing ?nut ?ss ?sh
          WHERE {
           ?a food:hasName ?food_name;
              food:productBy ?man;
              food:hasIng ?ing;
          food:hasNutrient ?nut;
           food:hasServingSize ?ss;
             food:hasServingHousehold ?sh
              FILTER regex(?food_name, "${foodName_en}", "i")
          }
      order by strlen(str(?food_name))
      LIMIT 7`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  var foodArray = [];
  // var foodArray_en = [];

  return getURL(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;
        
        agent.add(`Produk makanan ${foodName_id} : `);
        for(var i in data) {    
          var item = data[i];  
              foodArray[i] = item.food_name.value;
              // return translate(foodArray[i], {from:'en', to: 'id' }).then(ress => {
              //   console.info(ress.text); // OUTPUT: You are amazing!
              //   foodArray_en[i]=ress.text;
              //   agent.add('- ' + foodArray_en[i]);

              // })
              // .catch(err => {
              //   console.error(err);
              // });
              agent.add('- ' + foodArray[i]);
        }
          
          // var foodArraystr= foodArray.toString();
          // return translate(foodArraystr, {from:'en', to: 'id' }).then(ress => {
          //       console.info(ress.text); // OUTPUT: You are amazing!
          //       var foodArray_en=ress.text;
          //       agent.add(foodArray_en);
          //     })
          //     .catch(err => {
          //       console.error(err);
          //     });


    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      var bot_response ="Data tidak ditemukan";
      agent.add(bot_response);
  });


}
)


};


function getURL(queryUrl) {
  const axios = require('axios');
  return axios
      .get(queryUrl);
}




module.exports = router;