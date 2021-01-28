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
  
  intentMap.set('getIngredients', getIngredients);
  intentMap.set('getNutrients', getNutrients);
  
  intentMap.set('getFoodByIngredients', getFoodByIngredients);
  intentMap.set('getFoodByNutrients', getFoodByNutrients);
  
  intentMap.set('getInfoIngredients', getInfoIngredients);
  intentMap.set('getInfoNutrients', getInfoNutrients);
  
  intentMap.set('checkIngredients',checkIngredients);
  intentMap.set('checkNutrients', checkNutrients);
  agent.handleRequest(intentMap);

});

 
function webhookTest(agent) {
  agent.add("sending response from webhook server")
}

function getURL(queryUrl) {
  const axios = require('axios');
  return axios
      .get(queryUrl);
}

function searchFood (agent) {

  if(agent.parameters["foodName"] == '' || agent.parameters["foodName"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var foodName_id = agent.parameters["foodName"];

  var foodName_en;
  console.info(foodName_id);

  return translate(foodName_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      foodName_en=res.text;

  console.log("makanan untuk " +foodName_en);
  var endpoint = 'http://localhost:3030/food-BFPD/sparql';
  var query =  
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
          SELECT DISTINCT ?food_name
          WHERE {
           ?a food:hasName ?food_name
              FILTER regex(?food_name, "${foodName_en}", "i")
          }
      order by strlen(str(?food_name))
      LIMIT 7`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  var foodArray = [];

  return getURL(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;

        if(data == '' || data == null) { 
          agent.add('Makanan tidak ada') 
        } else{

          agent.add(`Produk makanan ${foodName_id} : `);
                    for(var i in data) {    
                      var item = data[i];  
                          foodArray[i] = item.food_name.value;
                          agent.add('- ' + foodArray[i]);
                            }
        }
    
    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      var bot_response ="Data tidak ditemukan";
      agent.add(bot_response);
  });
  
}

)

   }

};

function getInfoNutrients(agent) {

  if(agent.parameters["nutrients"] == '' || agent.parameters["nutrients"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var nut_id = agent.parameters["nutrients"];
  var nut_en;
  console.info(nut_id);

  return translate(nut_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      nut_en=res.text;

  
      // var nut = nut_en.replace(/\s/g, "");

  console.log("Cari DbPedia Source " +nut_en);

  var endpoint = 'http://localhost:3030/BFPD-food/sparql';
  var query =  `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  
  select ?label ?dbpedia
  where {
  ?a rdfs:label ?label;
     owl:sameAs ?dbpedia.
     FILTER regex(?label, "${nut_en}", "i")
  }
  order by strlen(str(?label))
  LIMIT 1
  `;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
  return axios
      .get(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var label = aRes.data.results.bindings[0].label.value;
        var dbpedia = aRes.data.results.bindings[0].dbpedia.value;
        var dbpedia_src = "<" + dbpedia + ">"; 

        // agent.add(label);
        // agent.add(dbpedia_src);
  

                      var endpoint2 = 'https://dbpedia.org/sparql';
                      var query2 =  `
                      select ?label ?desc ?link
                        where {
                         
                        ${dbpedia_src} rdfs:label  ?label.
                        ${dbpedia_src} rdfs:comment  ?desc.
                        ${dbpedia_src} foaf:isPrimaryTopicOf  ?link.

                        FILTER (lang(?label) = 'in')
                        FILTER (lang(?desc) = 'in')
                        }
                        `;
                      
                        var queryUrl2 = endpoint2 + "?query=" + encodeURIComponent(query2) + "&format=json";
                        return axios
                            .get(queryUrl2)
                            .then(aRes => {
                              console.log('data ',aRes.data.results.bindings)
                              var label = aRes.data.results.bindings[0].label.value;
                              var desc = aRes.data.results.bindings[0].desc.value;
                              var link = aRes.data.results.bindings[0].link.value;
                        
                              // let textResponse = `Label: ${label} \n Deskripsi : ${desc} \n link : ${link}`;
                              // res.render('index', { title: textResponse });

                              agent.add('Informasi ' + label);
                              agent.add(desc);
                              agent.add('Source :' + link);
                              
                        }).catch(err => {
                          console.log(err);
                          console.info("DATA INDONESIA TIDAK TERSEDIA");
                          agent.add("Informasi bahasa tidak tersedia");
                        })
                        

  }).catch(err => {
    console.log(err);
    console.info("DATA TIDAK TERSEDIA");
    agent.add("Informasi tidak tersedia");
  })


}
)

   }


};

function getInfoIngredients(agent) {

  if(agent.parameters["ingredients"] == '' || agent.parameters["ingredients"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var ing_id = agent.parameters["ingredients"];
  var ing_en;
  console.info(ing_id);

  return translate(ing_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      ing_en=res.text;

  
      // var nut = nut_en.replace(/\s/g, "");

  console.log("Cari DbPedia Source " +ing_en);

  var endpoint = 'http://localhost:3030/BFPD-food/sparql';
  var query =  `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  
  select ?label ?dbpedia
  where {
  ?a rdfs:label ?label;
     owl:sameAs ?dbpedia.
     FILTER regex(?label, "${ing_en}", "i")
  }
  order by strlen(str(?label))
  LIMIT 1
  `;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
  return axios
      .get(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var label = aRes.data.results.bindings[0].label.value;
        var dbpedia = aRes.data.results.bindings[0].dbpedia.value;
        var dbpedia_src = "<" + dbpedia + ">"; 

        // agent.add(label);
        // agent.add(dbpedia_src);
  

                      var endpoint2 = 'https://dbpedia.org/sparql';
                      var query2 =  `
                      select ?label ?desc ?link
                        where {
                         
                        ${dbpedia_src} rdfs:label  ?label.
                        ${dbpedia_src} rdfs:comment  ?desc.
                        ${dbpedia_src} foaf:isPrimaryTopicOf  ?link.

                        FILTER (lang(?label) = 'in')
                        FILTER (lang(?desc) = 'in')
                        }
                        `;
                      
                        var queryUrl2 = endpoint2 + "?query=" + encodeURIComponent(query2) + "&format=json";
                        return axios
                            .get(queryUrl2)
                            .then(aRes => {
                              console.log('data ',aRes.data.results.bindings)
                              var label = aRes.data.results.bindings[0].label.value;
                              var desc = aRes.data.results.bindings[0].desc.value;
                              var link = aRes.data.results.bindings[0].link.value;
                        
                              // let textResponse = `Label: ${label} \n Deskripsi : ${desc} \n link : ${link}`;
                              // res.render('index', { title: textResponse });

                              agent.add('Informasi ' + label);
                              agent.add(desc);
                              agent.add('Source :' + link);
                              
                        }).catch(err => {
                          console.log(err);
                          console.info("DATA INDONESIA TIDAK TERSEDIA");
                          agent.add("Informasi bahasa tidak tersedia");
                        })
                        

  }).catch(err => {
    console.log(err);
    console.info("DATA TIDAK TERSEDIA");
    agent.add("Informasi tidak tersedia");
  })


}
)

   }

};

function getIngredients(agent) {

  if(agent.parameters["foodName"] == '' || agent.parameters["foodName"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var foodName_id = agent.parameters["foodName"];
  var foodName_en;
  console.info(foodName_id);

  return translate(foodName_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      foodName_en=res.text;

  console.log("Bahan untuk " +foodName_en);
  var endpoint = 'http://localhost:3030/food-BFPD/sparql';
  var query =  
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
          SELECT DISTINCT ?food_name ?ing
          WHERE {
           ?a food:hasName ?food_name;
              food:hasIng ?ing
              FILTER regex(?food_name, "${foodName_en}", "i")
          }
      order by strlen(str(?food_name))
      LIMIT 1`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  return getURL(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings[0];
        
        var foodName = data.food_name.value;
        var ingredients= data.ing.value;
        // var ing = ingredients.replace(/--/g , ". ");

        return translate(ingredients, {from:'en', to: 'id' }).then(res => {
          console.info(res.text); // OUTPUT: You are amazing!
          var ing_trans=res.text;

          // agent.add('OK');
        agent.add('Bahan Makanan ' + foodName + ' : ');
        agent.add(ing_trans);
        
        }).catch(err => {
          console.error(err);
        });
   
    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      agent.add('Makanan tidak ditemukan');
  });


    }
  )

   }

};

function getNutrients(agent) {

  if(agent.parameters["foodName"] == '' || agent.parameters["foodName"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var foodName_id = agent.parameters["foodName"];
  var foodName_en;
  console.info(foodName_id);

  return translate(foodName_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      foodName_en=res.text;

  console.log("Cari nutrisi untuk " +foodName_en);
  
  var endpoint = 'http://localhost:3030/food-BFPD/sparql';
  var query =  
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
          SELECT DISTINCT ?food_name ?nut ?ss ?sh
          WHERE {
           ?a food:hasName ?food_name;
          food:hasNutrient ?nut;
           food:hasServingSize ?ss;
             food:hasServingHousehold ?sh
              FILTER regex(?food_name, "${foodName_en}", "i")
          }
      order by strlen(str(?food_name))
      LIMIT 1`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  return getURL(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings[0];
        
        var foodName = data.food_name.value;
        var nut= data.nut.value;
        var ss= data.ss.value;
        var sh= data.sh.value;

        if(nut !== null && nut !== 'NULL') {        

              return translate(nut, {from:'en', to: 'id' }).then(res => {
                console.info(res.text); // OUTPUT: You are amazing!
                var nut_temp=res.text;

                var nut_temp2= nut_temp.replace(/--/g , " \n");
                var nut_id= nut_temp2.replace(/-/g , " \n");
            
                  agent.add('Fakta Nutrisi ' + foodName + ' : ');
                  agent.add('Jumlah per ' + ss);
                  agent.add(nut_id);
          
              }).catch(err => {
                console.error(err);
              });

      }else {
        agent.add('Fakta Nutrisi tidak tersedia');
      }
   
    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      agent.add('Makanan tidak ditemukan');
  });


    }
  )

   }
};

function getFoodByIngredients(agent) {

  if(agent.parameters["ingredients"] == '' || agent.parameters["ingredients"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var ing_id = agent.parameters["ingredients"];
  var ing_en;
  console.info(ing_id);

  return translate(ing_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      ing_en=res.text;

  console.log("makanan untuk " +ing_en);
  var endpoint = 'http://localhost:3030/food-BFPD/sparql';
  var query =  
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
          SELECT DISTINCT ?food_name
          WHERE {
           ?a food:hasName ?food_name;
              food:hasIng ?ing
              FILTER regex(?ing, "${ing_en}", "i")
          }
      order by strlen(str(?food_name))
      LIMIT 7`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  var foodArray = [];

  return getURL(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;

        if(data == '' || data == null) { 
          agent.add('Makanan tidak ada') 
        } else{
        
                agent.add(`Produk makanan mengandung ${ing_id} : `);
                for(var i in data) {    
                  var item = data[i];  
                      foodArray[i] = item.food_name.value;
                      agent.add('- ' + foodArray[i]);
                }
        }
    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      var bot_response ="Data tidak ditemukan";
      agent.add(bot_response);
  });
}
)


   }

};

function getFoodByNutrients(agent) {

  if(agent.parameters["nutrients"] == '' || agent.parameters["nutrients"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var nut_id = agent.parameters["nutrients"];
  var nut_en;
  console.info(nut_id);

  return translate(nut_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      nut_en=res.text;

  console.log("makanan untuk " +nut_en);
  var endpoint = 'http://localhost:3030/food-BFPD/sparql';
  var query =  
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
          SELECT DISTINCT ?food_name
          WHERE {
           ?a food:hasName ?food_name;
              food:hasNutrient ?nut
              FILTER regex(?nut, "${nut_en}", "i")
          }
      order by strlen(str(?food_name))
      LIMIT 7`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  var foodArray = [];

  return getURL(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;

        if(data == '' || data == null) { 
          agent.add('Makanan tidak ada') 
        } else{

                      agent.add(`Produk makanan mengandung ${nut_id} : `);
                      
                      for(var i in data) {    
                        var item = data[i];  
                            foodArray[i] = item.food_name.value;
                            agent.add('- ' + foodArray[i]);
                      }

        }
    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      var bot_response ="Data tidak ditemukan";
      agent.add(bot_response);
  });
}
)


   }
};

function checkIngredients(agent) {

  if(agent.parameters["foodName"] == '' || agent.parameters["foodName"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var foodName_id = agent.parameters["foodName"];
  var foodName_en;
  console.info(foodName_id);


  var ing_id = agent.parameters["ingredients"];
  var ing_en;
  console.info(ing_id);

  return translate(foodName_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      foodName_en=res.text;

      return translate(ing_id, {from: 'id', to: 'en'}).then(
        res=> {
          console.log(res.text);
          ing_en=res.text;

                console.log("cek ing " +foodName_en)+ "dengan bahan " +ing_en;
                var endpoint = 'http://localhost:3030/food-BFPD/sparql';
                var query =  
                `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
                        SELECT DISTINCT ?food_name ?ing
                        WHERE {
                        ?a food:hasName ?food_name;
                            food:hasIng ?ing
                            FILTER regex(?food_name, "${foodName_en}", "i")
                            FILTER regex(?ing, "${ing_en}", "i")
                        }
                    order by strlen(str(?food_name))
                    LIMIT 1`;

                var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

                return getURL(queryUrl)
                    .then(aRes => {
                      console.log('data ',aRes.data.results.bindings)
                      var data = aRes.data.results.bindings[0];
                      var foodName = data.food_name.value;
                      
                      agent.add('Ya, terdapat '+ing_id+ ' pada produk seperti ' +foodName);
                    

                  }).catch (error => {
                    console.log("Something is wrong  !! ");
                    console.log(error);
                    agent.add('Tidak');
                });


      }
    )


    }
  )

   }

};

function checkNutrients(agent) {

  if(agent.parameters["foodName"] == '' || agent.parameters["foodName"] == null) { 
    agent.add("Informarsi tidak tersedia");
   }else {

  var foodName_id = agent.parameters["foodName"];
  var foodName_en;
  console.info(foodName_id);


  var nut_id = agent.parameters["nutrients"];
  var nut_en;
  console.info(nut_id);

  return translate(foodName_id, {from: 'id', to: 'en'}).then(
    res=> {
      console.log(res.text);
      foodName_en=res.text;

      return translate(nut_id, {from: 'id', to: 'en'}).then(
        res=> {
          console.log(res.text);
          nut_en=res.text;

                console.log("cek nutrisi " +foodName_en)+ "dengan bahan " +nut_en;
                var endpoint = 'http://localhost:3030/food-BFPD/sparql';
                var query =  
                `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
                        SELECT DISTINCT ?food_name ?nut
                        WHERE {
                        ?a food:hasName ?food_name;
                            food:hasNutrient ?nut
                            FILTER regex(?food_name, "${foodName_en}", "i")
                            FILTER regex(?nut, "${nut_en}", "i")
                        }
                    order by strlen(str(?food_name))
                    LIMIT 1`;

                var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

                return getURL(queryUrl)
                    .then(aRes => {
                      console.log('data ',aRes.data.results.bindings)
                      var data = aRes.data.results.bindings[0];
                      var foodName = data.food_name.value;
                      
                      agent.add('Ya, terdapat '+nut_id+ ' pada ' +foodName);

                  }).catch (error => {
                    console.log("Something is wrong  !! ");
                    console.log(error);
                    agent.add('Tidak');
                });


      }
    )


    }
  )


   }
};





module.exports = router;