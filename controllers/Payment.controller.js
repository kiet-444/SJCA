const dotenv = require('dotenv');
const User = require('../models/User');
const EscrowWallet = require('../models/EscrowWallet');
const JobGroup = require('../models/JobGroup');
const JobPosting = require('../models/JobPosting');
const JobExecute = require('../models/JobExecute');
const Payment = require('../models/Payment');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const PayOS = require('@payos/node');

const nodemailer = require('nodemailer');

const { sequelize } = require('../models'); 
const { Op } = require('sequelize');

dotenv.config();

const payos = new PayOS(
    process.env.PAYOS_API_SECRET, 
    process.env.PAYOS_API_KEY, 
    process.env.PAYOS_ENVIRONMENT
);

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


const createPaymentService = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId, name, price, description } = req.body;

        
        const response = {
            amount: price,
            orderCode: orderId,
            description: "Thanh toán Service",
            returnUrl: "https://seasonal-job.vercel.app",
            cancelUrl: "https://seasonal-job.vercel.app",
        };

        await Service.create({ userId, name, price, description, orderCode: orderId });

        const paymentLink = await payos.createPaymentLink(response);
        res.json({ checkoutUrl: paymentLink.checkoutUrl });        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const createPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId, jobGroupId } = req.body;
     
        const jobGroup = await JobGroup.findByPk(jobGroupId);
        if (!jobGroup || jobGroup.userId !== userId) {
            return res.status(404).json({ success: false, message: "JobGroup không tồn tại hoặc không thuộc người dùng" });
        }

        const calculateJobGroupTotal = async (jobGroupId) => {
            const jobPostings = await JobPosting.findAll({
                where: { jobGroupId },
            });
        
            let total = 0;
            for (const job of jobPostings) {
                const number_of_person = job.number_of_person || 1; 
                total += (job.salary || 0) * number_of_person;
            }

            const exitService = await Service.findOne({
                where: {
                    userId
                }
            });

            if (exitService && exitService.status === 'active') {
                total +=0 ;
            }
            
            total += 50000;
        
            return total;
        };

        const totalAmount = await calculateJobGroupTotal(jobGroupId);
        

        const exitEscrowWallet = await EscrowWallet.findOne({ where: { userId } });
        if (exitEscrowWallet) {
            await exitEscrowWallet.update({ orderCode: orderId, jobGroupId });
        } else {
            await EscrowWallet.create({ userId, jobGroupId, balance: 0, orderCode: orderId });
        }
        
        
        const response = {
            amount: totalAmount,
            orderCode: orderId,
            description: "Thanh toán JobGroup",
            returnUrl: " https://seasonal-job.vercel.app/employer/employer-job-groups",
            cancelUrl: " https://seasonal-job.vercel.app/employer/employer-job-groups",
            webhookUrl: "https://sjcp-fha4a5e8f6arc7cg.eastasia-01.azurewebsites.net/api/payment/callback",
        };

        const paymentLink = await payos.createPaymentLink(response);
        res.json({ checkoutUrl: paymentLink.checkoutUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tạo thanh toán JobGroup" });
    }
};

// Xử lý callback từ PayOS khi thanh toán thành công
// const paymentCallback = async (req, res) => {
//     try {
//         const { data } = req.body;

//         await Payment.create({
//             orderCode: escrowWallet.orderCode,
//             description: 'Thanh toán JobGroup',
//             employerId: escrowWallet.userId,
//             jobGroupId: jobGroup.id,
//             amount: parseFloat(data.amount),
//             status: 'HELD'
//         }, { transaction });

//     if (data.code === '00') {
//         const orderCode = String(data.orderCode);  // ép chuỗichuỗi
//         const escrowWallet = await EscrowWallet.findOne({
//             where: { orderCode }
//         });

//         if (escrowWallet) {
//             await escrowWallet.update({
//             balance: parseFloat(escrowWallet.balance) + parseFloat(data.amount) //ep kieu balance
//         });
        
//         const jobGroup = await JobGroup.findOne({
//             where: { id: escrowWallet.jobGroupId, userId: escrowWallet.userId }
//         });

//         if (jobGroup) {
//             await jobGroup.update({
//                 isPaid: true,
//                 status: 'inactive'
//             });

//             // try {
//             //     await Payment.create({
//             //         orderCode: escrowWallet.orderCode,
//             //         description: 'Thanh toán JobGroup',
//             //         employerId: escrowWallet.userId,
//             //         jobGroupId: jobGroup.id,
//             //         amount: parseFloat(data.amount),
//             //         status: 'HELD'
//             //     });
//             //     console.log('Payment created successfully');
//             // } catch (err) {
//             //     console.error('Error creating payment:', err);
//             // }

//         }
//     }
// }
//         res.status(200).send("OK");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Lỗi xử lý callback từ PayOS");
//     }
// };

const paymentCallback = async (req, res) => {
    try {
        const { data } = req.body;
        const orderCode = String(data.orderCode);

        const escrowWallet = await EscrowWallet.findOne({
            where: { orderCode }
        });

        if(escrowWallet) {
            if (data.code === '00') {
                // Cập nhật số dư của escrowWallet
                await escrowWallet.update({
                    balance: parseFloat(escrowWallet.balance) + parseFloat(data.amount)
                });
    
                const jobGroup = await JobGroup.findOne({
                    where: { id: escrowWallet.jobGroupId, userId: escrowWallet.userId }
                });
    
                if (!jobGroup) {
                    return res.status(400).send("Không tìm thấy JobGroup.");
                }
    
                // Cập nhật trạng thái jobGroup
                await jobGroup.update({
                    isPaid: true,
                    status: 'inactive'
                });
    
                // Tạo payment
                await Payment.create({
                    orderCode: escrowWallet.orderCode,
                    description: 'Payment JobGroup',
                    employerId: escrowWallet.userId,
                    jobGroupId: jobGroup.id,
                    amount: parseFloat(data.amount),
                    status: 'HELD'
                });
    
                console.log('Payment created successfully');
                return res.status(200).send("OK");
            } else {
                return res.status(400).send("Thanh toán không thành công.");
            }
        }

        const service = await Service.findOne({
            where: { orderCode }
        });

        if(service) {
            if (data.code === '00') {

                await service.update({
                    status: "active"
                })

                console.log('Payment created successfully');
                return res.status(200).send("OK");
            } else {
                return res.status(400).send("Thanh toán không thành công.");
            }
        }
    } catch (error) {``
        console.error("Lỗi xử lý callback từ PayOS:", error);
        return res.status(500).send("Lỗi xử lý callback từ PayOS");``
    }
};

// Giải phóng tiền từ Escrow Wallet sang Worker khi công việc hoàn thành
const releasePayment = async (req, res) => {
    // const transaction = await sequelize.transaction();
    try {
        const employerId = req.userId;
        const { userIds, jobPostingId } = req.body;
        const employer = await User.findByPk(employerId);

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: "Danh sách người dùng không hợp lệ" });
        }

        const users = await User.findAll({ where: { id: userIds }, Transaction });
        if (users.length !== userIds.length) {
            return res.status(404).json({ success: false, message: "Một hoặc nhiều người dùng không tìm thấy" });
        }

        const jobPosting = await JobPosting.findByPk(jobPostingId, { Transaction });
        if (!jobPosting || jobPosting.status !== 'completed' /*|| jobPosting.number_of_person !== userIds.length*/) {
            return res.status(404).json({ success: false, message: "Công việc không hợp lệ" });
        }

        const escrowWalletEmployer = await EscrowWallet.findOne({ where: { userId: employerId }, Transaction });
        if (!escrowWalletEmployer) {
            return res.status(404).json({ success: false, message: "Escrow Wallet của nhà tuyển dụng không tìm thấy" });
        }
        // const totalAmountOnePerson = jobPosting.salary / jobPosting.number_of_person;
        let totalAmountToDeduct = 0;

        for (const user of users) {
            const jobExecutes = await JobExecute.findAll({ where: { jobPostingId, userId: user.id }, Transaction });

            if (jobExecutes.length === 0) {
                return res.status(400).json({ success: false, message: `Không có công việc thực hiện bởi người dùng ${user.id}` });
            }

            const totalProgressComplete = jobExecutes.reduce((sum, jobExe) => {
                return sum + (jobExe.processComplete || 0); // đảm bảo không bị NaN nếu field null
            }, 0);

            // const totalDaySuccess = jobExecutes.filter(jobExecute => jobExecute.status === 'success').length;
            // const amountToTransfer = parseFloat(((totalDaySuccess / jobExecutes.length) * totalAmountOnePerson).toFixed(2));
            const amountToTransfer = parseFloat(((totalProgressComplete / 100) * jobPosting.salary).toFixed(2));
            totalAmountToDeduct += amountToTransfer;


            const escrowWallet = await EscrowWallet.findOne({ where: { userId: user.id }, Transaction });
            if (!escrowWallet) {
                await EscrowWallet.create({
                    orderCode: Date.now(),
                    userId: user.id,
                    balance: amountToTransfer,
                    jobGroupId: jobPosting.jobGroupId
                }, { Transaction });
            } else {
                await escrowWallet.update({
                    balance: parseFloat(escrowWallet.balance) + amountToTransfer
                }, { Transaction });
            }

            await Transaction.create({
                senderId: employerId,
                receiverId: user.id,
                // jobPostingId,
                amount: amountToTransfer,
                status: 'COMPLETED'
            }, { Transaction });
            // const worker = await User.findByPk(userIds[0]);
            if (worker) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Thanh toán công việc',
                    html: `
                  <p>Thanh toán cho công việc "${jobPosting.title}".</p>
                  <p>Số tiền nhận: <strong>${amountToTransfer.toLocaleString()} VND</strong></p>
                  <p>Người tuyển dụng: ${employer?.companyName || 'Unknown'} </p>

                  <p>SJCP gửi worker : ${user?.fullName || 'Unknown'}</p>

                  <p>Kính gửi ! </p>
                `
                });
            }
        }
        if (escrowWalletEmployer.balance < totalAmountToDeduct) {
            // await Transaction.rollback();
            return res.status(400).json({ success: false, message: "Số dư không đủ trong Escrow Wallet" });
        }
        await escrowWalletEmployer.update({
            balance: parseFloat(escrowWalletEmployer.balance) - totalAmountToDeduct
        }, { Transaction });

        // await Transaction.commit();

        if (employer) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: employer.email,
                subject: 'Thông báo trừ tiền trước khi thanh toán cho nhân viên',
                html: `
                  <p>Bạn sắp thực hiện thanh toán cho công việc "${jobPosting.title}".</p>
                  <p>Thanh toán:</p>
                  <ul>
                    <li>Transfer tiền cho người dùng: <strong>${totalAmountToDeduct.toLocaleString()} VND</strong></li>
                  </ul>
                  <p>SJCP gửi nhà tuyển dụng: ${employer?.companyName || 'Unknown'} </p>

                  <p>Kính gửi! </p>
                `
            });
        }

        return res.status(200).json({ success: true, message: "Giải phóng tiền thành công" });

    } catch (error) {
        // await Transaction.rollback();
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi giải phóng thanh toán" });
    }
};


const getEscrowWallet = async (req, res) => {
    try {
        const userId = req.userId; 
        
        const escrowWallet = await EscrowWallet.findOne({
            where: { userId },
        });

        // Nếu không tìm thấy ví Escrow
        if (!escrowWallet) {
            return res.status(404).json({
                success: false,
                message: "Escrow Wallet của người dùng không tìm thấy",
            });
        }

        // Trả về số dư trong ví Escrow
        return res.status(200).json({
            success: true,
            balance: escrowWallet.balance,  
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tìm thấy ví Escrow",
        });
    }
};

const updateEscrowWallet = async (req, res) => {
    try {
        const userId = req.userId;
        const { balance } = req.body;

        const escrowWallet = await EscrowWallet.findOne({
            where: { userId },
        });

        if (!escrowWallet) {
            return res.status(404).json({
                success: false,
                message: "Escrow Wallet của người dùng không tìm thấy",
            });
        }

        await escrowWallet.update({
            balance,
        });

        return res.status(200).json({
            success: true,
            message: "Cap nhat Escrow Wallet thanh cong",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cap nhật Escrow Wallet",
        });
    }
};

const paymentHistory = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('User ID:', userId);  

        const payments = await Payment.findAll({
            where: { [Op.or]: [{ employerId: userId }, { workerId: userId }] },
            order: [['createdAt', 'DESC']],
        });

        console.log('Payments:', payments);

        if (!payments || payments.length === 0) {
            return res.status(404).json({ success: false, message: "The user has no payment history" });
        }

        return res.status(200).json({ success: true, data: payments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Wrong when get payment history" });
    }
};


module.exports = {
    createPaymentService,
    createPayment, 
    paymentCallback, 
    releasePayment, 
    getEscrowWallet,
    updateEscrowWallet, 
    paymentHistory};