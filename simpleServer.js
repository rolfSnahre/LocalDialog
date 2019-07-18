
const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const fetch = require("node-fetch");

app.get('/', (req, res) => res.send('online'))
app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function welcome() {
    agent.add('Welcome to my agent2!');
  };
  
  function falback(){
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  };
  
  function name() {
    agent.add('My name is Dialogu');
  };
  
  function languages(agent) {
    var language = agent.parameters.language;
    var ProgrammingLanguage = agent.parameters.ProgrammingLanguage;
    if (language) {
      agent.add(`how long have you known ${language}`);
      agent.setContext({
        name: 'languages-followup',
        lifespan: 2,
        parameters:{language: language}
      });
    } else if (ProgrammingLanguage) {
      agent.add(`how long have you known ${ProgrammingLanguage}`);
      agent.setContext({
        name: 'languages-followup',
        lifespan: 2,
        parameters:{ProgrammingLanguage: ProgrammingLanguage}
      });
    } else {
      agent.add(`Code: What language do you know?`);
    }
  };
  
  function languages_Custom(agent){
    const langContext = agent.getContext('languages-followup');
    const language = langContext.parameters.language || langContext.parameters.ProgrammingLanguage;
    const duration = agent.parameters.duration;
    agent.add(`Code:  I can´t belive you´ve know ${language} for ${duration.amount+" "+duration.unit}`);
  };
    
  
  var urlEndpoint = 'https://newsapi.org/v2/everything';
  var key = '7a268b5b61af411b8f2798f06840f8ae';
  
  function buildUrl(topic,date){
      var url = urlEndpoint;
      url = url+'?';	
      
      if(topic){
          url = url+'q='+topic+'&';
      }
      if(date){
          url = url+'from='+date+'&';
      }
      
      url = url+'apiKey='+key;
  
      return url;
  
  }
  const head = {
      'Accept': 'application/json',
      'content-type':'applicaton/json'
  };
  
  const getParams={
      headers:head,
      method:"GET"
  };
  
  async function getNews(agent) {
    const topic = agent.parameters.topic;
    const date = agent.parameters.date;
  
    var url = buildUrl(topic,date);
      
     await fetch(url)
    .then(resp => {return resp.text();})
    .then(respStr =>{
      var respObj = JSON.parse(respStr);
      var content = respObj.articles[0].content;
      agent.add('art:' + content);
    })
    .catch(err => {
      agent.add(err);
    });
  };

  let intentMap = new Map()
  
  intentMap.set('Default Welcome Intent', welcome)
  intentMap.set('Default Falback Intent', falback)
  intentMap.set('Languages', languages)
  intentMap.set('Languages - custom', languages_Custom)
  intentMap.set('GetNews', getNews) 



  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)






