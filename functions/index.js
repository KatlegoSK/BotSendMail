// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

//Firebase declaration
const  firebase = require('firebase') ;
const config = {
       apiKey: "AIzaSyCG5b_vjxWK4TuIbbADhPZ7-HVXdD_br44",
		authDomain: "kat-ent.firebaseapp.com",
		databaseURL: "https://kat-ent.firebaseio.com",
		projectId: "kat-ent",
		storageBucket: "",
		messagingSenderId: "917615467272"
  };
  
 firebase.initializeApp(config);
 
//Node mailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ // Use an app specific password here
  service: 'Gmail',
  auth: {
    user: 'Katlego.kg27@gmail.com',
    pass: 'passwordInputRemoved'
  }
});

 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  //const agent = new WebhookClient({ request, response });
  const agent = new WebhookClient({request: request, response: response});
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
 
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}



  
/*Set options that will come from Dialogflow*/
function setOptions(fileName,toEmail)
{
	
	
	let promise = new Promise((resolve, reject)=>{
		
		let list = [];
		let persons ;
		let options;
		
		/*Read data from Firebase and comparing it against filename provided in order to get the base64 string stored in the database*/
		list = firebase.database().ref('/files');
				 list.on('value', (dataSnapshot)=> {
				persons = [];
	  
				dataSnapshot.forEach((childSnapshot) => {
				  let person = childSnapshot.val();
				  person.key = childSnapshot.key
				  
			
				  persons.push(person);
				  
				  if(person.fname == fileName )
				  {
					  
					  options = {
						from: 'Katlego.kg27@gmail.com',
						to: toEmail,
						subject: fileName,
						html: 'Good day, <br><br> Please find  my '+ fileName +' attached. Thank you',
						attachments: [
						 
							{   // data uri as an attachment
								
								path: person.fpath
							}
						]
					};
					
					resolve(options);
					  
					  
				  }
				  
				  });
				  

				
				

           
          });
		  

			
		
	})
	
	
	
	return promise;
}

/*Send mail using the provided email*/
function sendmail(agent)
{
		
	
	setOptions(agent.request_.body.queryResult.outputContexts[0].parameters.infosend,agent.request_.body.queryResult.outputContexts[0].parameters.torequest)
	.then(options =>{
		
		transporter.sendMail(options, (error, info) =>{
			;
		if(error) {
			  //console.log("Error occured while trying to send");
			  agent.add('Unable to send email, Please check your net work and try again.');
		} else {
			  //res.send('Im sending email')
				//console.log('An email was successfully sent to '+ agent.request_.body.queryResult.outputContexts[0].parameters.torequest+' Thank you.');
			  agent.add('An email was successfully sent ');
			  
		}
	});
		
		
		
	}).catch(error =>{
		agent.add(error);
	})
		
	
		
		
	
	
}


  let intentMap = new Map();
  //intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
   intentMap.set('information.getemail', sendmail);
  //intentMap.set('qualification.university', qualification);
  intentMap.set('restaurant.booking.create', createBooking);
  
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
