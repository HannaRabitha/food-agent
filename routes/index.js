var express = require('express');
var router = express.Router();
var axios = require('axios');
const translate = require('@k3rn31p4nic/google-translate-api');



/* GET home page. */
router.get('/', function(req, res, next) {

  // translate('Tu es incroyable!', { to: 'en' }).then(res => {
  //   console.info(res.text); // OUTPUT: You are amazing!
  //   var hasil = res.text;


  //   // res.render('index', { title: hasil });
  // }).catch(err => {
  //   console.error(err);
  // });

  // var product = "MOCHI";
 
  // var endpoint = 'http://localhost:3030/food-hanna/sparql';
  // var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  // PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  // PREFIX food: <http://www.paguyubankseusu.org/hanna/hanna-food.owl#>
  // SELECT ?food_name
  // WHERE {
  //   ?no food:has_name ?food_name;
    
  // }`;

  var nut = "Calcium";

 
  var endpoint = 'http://localhost:3030/test-bfpd/sparql';
  var query =  `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX food: <http://localhost:3030/hanna/food-BFPD#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

select ?dbpedia
where {
food:${nut} owl:sameAs ?dbpedia
}
  `;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
  axios
      .get(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var dbpedia = aRes.data.results.bindings[0].dbpedia.value;
        var dbpedia_src = "<" + dbpedia + ">"; 
  


                      var endpoint2 = 'https://dbpedia.org/sparql';
                      var query2 =  `
                    
                      select ?label ?desc ?link
                        where {
                        ${dbpedia_src} rdfs:label ?label.
                        ${dbpedia_src} rdfs:comment ?desc.
                        ${dbpedia_src} prov:wasDerivedFrom ?link.

                          FILTER (lang(?label) = 'in')
                        FILTER (lang(?desc) = 'in')
                        }

                        `;
                      
                        var queryUrl2 = endpoint2 + "?query=" + encodeURIComponent(query2) + "&format=json";
                        axios
                            .get(queryUrl2)
                            .then(aRes => {
                              console.log('data ',aRes.data.results.bindings)
                              var label = aRes.data.results.bindings[0].label.value;
                              var desc = aRes.data.results.bindings[0].desc.value;
                              var link = aRes.data.results.bindings[0].link.value;
                        
                              let textResponse = `Label: ${label} \n Deskripsi : ${desc} \n link : ${link}`;
                              res.render('index', { title: textResponse });
                              
                        }).catch(err => {
                          console.log(err);
                        })
                        

        
  }).catch(err => {
    console.log(err);
  })
  
});

         

module.exports = router;
