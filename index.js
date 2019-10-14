const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const webApp = express();

webApp.use(bodyParser.urlencoded({
    extended: true
}))

webApp.use(bodyParser.json()); 

webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const sgMail = require('@sendgrid/mail');

const toEmail = 'mlihl@gmx.at';
const fromEmail = 'mlihl@gmx.at';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function sends email
const sendMessage = async (message) => {

    let text = 'Die folgende Nachricht wurde von einem Besucher / Patienten übermittelt\n\n';
    text += `${message}\n\n`;
    text += 'lorem ipsum...';

    let conf = {
        to: toEmail,
        from: fromEmail,
        subject: 'WICHTIG: Nachricht von einem Besucher',
        text: text
    };

    let response = await sgMail.send(conf);

    return {
        'statusCode':response[0]['statusCode'],
        'statusMessage': response[0]['statusMessage']
    };
};

webApp.post('/webhook', async (req, res) => {

    let action = req['body']['queryResult']['action'];
    let responseText = {};
    let outString;

    if (action === 'send-message') {
        let message = req['body']['queryResult']['parameters']['message'];
        let response = await sendMessage(message);
        if (response['statusCode'] == 202 && response['statusMessage'] === 'Accepted') {
            outString = 'Vielen Dank! Ich habe das so weitergegeben.';
            console.log('Message sent successfully.');
        } else {
            outString = 'Ich bin auf einen Fehler gestoßen.';
            console.log('Some error  occured.');
        }
    }
    responseText['fulfillmentText'] = outString;
    res.send(responseText);
});

const PORT = process.env.PORT;

webApp.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});