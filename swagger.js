const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Swagger API',
        version: '1.0.0',
        description: 'Swagger API Documentation',
    },
    servers: [
        {
            url: 'https://sjcp-fha4a5e8f6arc7cg.eastasia-01.azurewebsites.net',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
