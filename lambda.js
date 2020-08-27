const awsServerlessExpress = require('aws-serverless-express');
const createApp = require('./app');

let app;
let server;

exports.handler = async (event, context) => {
    console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2));
    console.info("EVENT\n" + JSON.stringify(event, null, 2));

    try {
        if (!app) {
            app = await createApp();
        }

        if (!server) {
            server = awsServerlessExpress.createServer(app);
        }

        return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
    } catch (err) {
        console.warn(err);
    }
};
