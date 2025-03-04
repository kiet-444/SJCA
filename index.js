    const express = require('express');
    const bodyParser = require('body-parser');
    const sequelize = require('./config/db')
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./swagger');
  

    require('dotenv').config();

    const Auth = require('./routers/auth.router')
    const JobRouter = require('./routers/Job.router')
    const CVRouter = require('./routers/cv.router')
    const ApplicationRouter = require('./routers/application.router')
    const UserRouter = require('./routers/user.router')
    const ExecuteRouter = require('./routers/jobExecute.router')

    const app = express();

    app.use(express.json());

    const port = process.env.PORT || 3000;
    const YOUR_DOMAIN = process.env.DOMAIN || 'http://localhost:3000';


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss:
            '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
        customCssUrl: CSS_URL,
    }));

    // Define routes
    app.use('/api/auth', Auth);
    app.use('/api/users', UserRouter);
    app.use('/api/jobs', JobRouter);
    app.use('/api/cvs', CVRouter);
    app.use('/api/applications', ApplicationRouter);
    app.use('/api/executes', ExecuteRouter);


    app.listen(port, async  () => {
        try {
            await sequelize.sync();
            console.log(`Server listening on port ${port}`);
        } catch (error) {
            console.error('Error starting the server:', error);
        }
    });

