const dotenv = require('dotenv');
const User = require('../models/User');
const EscrowWallet = require('../models/EscrowWallet');
const JobGroup = require('../models/JobGroup');
const JobPosting = require('../models/JobPosting');
const JobExecute = require('../models/JobExecute');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const PayOS = require('@payos/node');
const { sequelize } = require('../models'); 
const { Op } = require('sequelize');

dotenv.config();
const payos = new PayOS(
    process.env.PAYOS_API_SECRET, 
    process.env.PAYOS_API_KEY, 
    process.env.PAYOS_ENVIRONMENT
);


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

        if (!escrowWallet) {
            return res.status(400).send("EscrowWallet không tìm thấy.");
        }

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
    } catch (error) {
        console.error("Lỗi xử lý callback từ PayOS:", error);
        return res.status(500).send("Lỗi xử lý callback từ PayOS");
    }
};



// Giải phóng tiền từ Escrow Wallet sang Worker khi công việc hoàn thành
const releasePayment = async (req, res) => {
    const transaction = await sequelize.transaction(); // Bắt đầu transaction
    try {
        const employerId = req.userId;
        const { userIds, jobPostingId } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: "Danh sách người dùng không hợp lệ" });
        }

        const users = await User.findAll({ where: { id: userIds } });
        if (users.length !== userIds.length) {
            return res.status(404).json({ success: false, message: "Một hoặc nhiều người dùng không tìm thấy" });
        }

        const jobPosting = await JobPosting.findByPk(jobPostingId);
        if (!jobPosting || jobPosting.status !== 'completed' || jobPosting.number_of_person !== userIds.length) {
            return res.status(404).json({ success: false, message: "Công việc không hợp lệ" });
        }

        const escrowWalletEmployer = await EscrowWallet.findOne({ where: { userId: employerId } });
        if (!escrowWalletEmployer) {
            return res.status(404).json({ success: false, message: "Escrow Wallet của nhà tuyển dụng không tìm thấy" });
        }
        // Tinh tien nguoi dung
        const totalAmountOnePerson = jobPosting.salary / jobPosting.number_of_person;
        let totalAmountToDeduct = 0;

        for (const user of users) {
            const jobExecutes = await JobExecute.findAll({ where: { jobPostingId, userId: user.id } });

            if (jobExecutes.length === 0) {
                return res.status(400).json({ success: false, message: `Không có công việc thực hiện bởi người dùng ${user.id}` });
            }

            const totalDaySuccess = jobExecutes.filter(jobExecute => jobExecute.status === 'success').length;
            const amountToTransfer = (totalDaySuccess / jobExecutes.length) * totalAmountOnePerson;
            totalAmountToDeduct += amountToTransfer;

            const escrowWallet = await EscrowWallet.findOne({ where: { userId: user.id } });
            if (!escrowWallet) {
                return res.status(404).json({ success: false, message: `Escrow Wallet của người dùng ${user.id} không tìm thấy` });
            }

            // Cập nhật số dư tài khoản nhân viên
            await escrowWallet.update({ balance: escrowWallet.balance + amountToTransfer }, { transaction });

            await Transaction.create({
                senderId: employerId,
                receiverId: user.id,
                amount: amountToTransfer,
                balance: escrowWallet.balance + amountToTransfer,
                description: "Luong cong viec",
                status: "COMPLETED",
            }, {transaction})
        }

        if (escrowWalletEmployer.balance < totalAmountToDeduct) {
            return res.status(400).json({ success: false, message: "Số dư của Escrow Wallet không đủ" });
        }
//send mail
        // await sendEmail({
        //     to: employer.email,
        //     subject: 'Thông báo trừ tiền trước khi thanh toán cho nhân viên',
        //     html: `
        //       <p>Bạn sắp thực hiện thanh toán cho công việc "${jobPosting.title}".</p>
        //       <p>Tổng số tiền sẽ bị trừ: <strong>${totalAmountToDeduct.toLocaleString()} VND</strong></p>
        //       <ul>
        //         ${users.map(user => `<li>${user.fullname} (ID: ${user.id})</li>`).join('')}
        //       </ul>
        //     `
        //   });
          

        // Trừ tiền từ nhà tuyển dụng
        await escrowWalletEmployer.update({ balance: escrowWalletEmployer.balance - totalAmountToDeduct }, { transaction });

        await Transaction.create({
            senderId: employerId,
            receiverId: null,
            amount: totalAmountToDeduct,
            balance: escrowWalletEmployer.balance - totalAmountToDeduct,
            description: "Pay for job",
            status: "COMPLETED",
        }, {transaction});

        await transaction.commit(); // Xác nhận thay đổi
        return res.status(200).json({ success: true, message: "success when release payment" });
    } catch (error) {
        await transaction.rollback(); // Hoàn tác nếu có lỗi
        console.error(error);
        return res.status(500).json({ success: false, message: "Wrong when release payment" });
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


module.exports = { createPayment, 
    paymentCallback, 
    releasePayment, 
    getEscrowWallet, 
    paymentHistory};