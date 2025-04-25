    const express = require('express');
    const bodyParser = require('body-parser');
    const sequelize = require('./config/db')
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./swagger');
    const multer = require('multer');
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    const  EscrowWallet  = require('./models/EscrowWallet');
    const  Payment  = require('./models/Payment');
    const  JobGroup = require('./models/JobGroup');


    const cors = require('cors');
  

    require('dotenv').config();

    const Auth = require('./routers/auth.router')
    const JobGroupRouter = require('./routers/jobgroup.router')
    const JobRouter = require('./routers/Job.router')
    const CVRouter = require('./routers/cv.router')
    const ApplicationRouter = require('./routers/application.router')
    const UserRouter = require('./routers/user.router')
    const ExecuteRouter = require('./routers/jobExecute.router')
    const ComplaintRouter = require('./routers/complaint.router')
    const PaymentRouter = require('./routers/payment.router')
    const ReviewRouter = require('./routers/review.router')
    const MediaRouter = require('./routers/media.router')
    
    const app = express();

    app.use(cors({
        origin: '*',
        credentials: true
    }));
    app.use(express.json());
    app.use('/api', MediaRouter);

    const port = process.env.PORT || 3000;
    const YOUR_DOMAIN = process.env.DOMAIN || 'http://localhost:3000';


    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    app.post('/callback', async (req, res) => {
      try {
          const { data } = req.body;
  
          if (data.code === '00') {
              const orderCode = String(data.orderCode);
              const escrowWallet = await EscrowWallet.findOne({ where: { orderCode } });
              if (!escrowWallet) {
                console.error('EscrowWallet not found for orderCode:', orderCode);
            } else {
                console.log('EscrowWallet found:', escrowWallet);
            }
  
              if (escrowWallet) {
                  await escrowWallet.update({
                      balance: parseFloat(escrowWallet.balance) + parseFloat(data.amount),
                  });
  
                  const jobGroup = await JobGroup.findOne({
                      where: { id: escrowWallet.jobGroupId, userId: escrowWallet.userId },
                  });
  
                  if (jobGroup) {
                      await jobGroup.update({
                          isPaid: true,
                          status: 'inactive',
                      });
  
                      try {
                          await Payment.create({
                              orderCode: escrowWallet.orderCode,
                              description: 'Thanh toán JobGroup',
                              employerId: escrowWallet.userId,
                              jobGroupId: jobGroup.id,
                              amount: parseFloat(data.amount),
                              status: 'HELD',
                          });
                          console.log('Payment created successfully');
                      } catch (err) {
                          console.error('Error creating payment:', err);
                      }
                  }
              }
          }
  
          res.status(200).send("OK");
      } catch (error) {
          console.error(error);
          res.status(500).send("Lỗi xử lý callback từ PayOS");
      }
  });


    const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
        customCssUrl: CSS_URL,
    }));

    // Define routes
    app.use('/api/auth', Auth);
    app.use('/api/users', UserRouter);
    app.use('/api/jobGroups', JobGroupRouter);
    app.use('/api/jobs', JobRouter);
    app.use('/api/cvs', CVRouter);
    app.use('/api/applications', ApplicationRouter);
    app.use('/api/executes', ExecuteRouter);
    app.use('/api/complaints', ComplaintRouter);
    app.use('/api/reviews', ReviewRouter);
    app.use('/api/payment', PaymentRouter);
    

    // app.post('/api/webhook/payos', async (req, res) => {
    //     const JobGroup = require('./models/JobGroup');
    
    //     try {
    //         const data = req.body;
    //         console.log('Webhook data received:', data); // Log dữ liệu webhook
    
    //         const jobGroupId = data.orderCode || data.extraData?.jobGroupId;
    
    //         if (!jobGroupId) {
    //             return res.status(400).json({ message: 'Thiếu jobGroupId trong webhook' });
    //         }
    
    //         if (data.status === 'SUCCESS') {
    //             await JobGroup.update({ is_paid: true }, { where: { id: jobGroupId } });
    //             console.log(` Đã xác nhận thanh toán cho JobGroup ID: ${jobGroupId}`);
    //         }
    
    //         res.status(200).json({ message: 'Webhook xử lý thành công' });
    //     } catch (error) {
    //         console.error(' Lỗi xử lý webhook PayOS:', error);
    //         res.status(500).json({ message: 'Webhook xử lý thất bại' });
    //     }
    // });

    app.get('/', (req, res) => {
        res.send('Hello, Welcome to our API!');
    });
    
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err.stack); // logs full error stack to console
        res.status(500).json({
          status: 'error',
          message: err.message || 'Internal Server Error'
        });
      });

      app.listen(port, async () => {
        try {
          console.log('Đang kết nối đến cơ sở dữ liệu...');
          await sequelize.sync();
          console.log(`Đã kết nối và đồng bộ cơ sở dữ liệu!`);
          console.log(`Server đang lắng nghe trên cổng ${port}`);
        } catch (error) {
          console.error('Lỗi khi khởi động server hoặc kết nối đến CSDL:', error);
        }
      });
