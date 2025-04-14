const dotenv = require('dotenv');
const User = require('../models/User');
const EscrowWallet = require('../models/EscrowWallet');
const JobGroup = require('../models/JobGroup');
const JobPosting = require('../models/JobPosting');
const JobExecute = require('../models/JobExecute');
const PayOS = require('@payos/node');
const { sequelize } = require('../models'); 

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
                const number_of_person = job.number_of_person || 1; // fallback nếu không có field
                total += (job.salary || 0) * number_of_person;
            }
        
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
        };

        const paymentLink = await payos.createPaymentLink(response);
        res.json({ checkoutUrl: paymentLink.checkoutUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tạo thanh toán JobGroup" });
    }
};

// Xử lý callback từ PayOS khi thanh toán thành công
const paymentCallback = async (req, res) => {
    try {
        const { data } = req.body;

    if (data.code === '00') {
        const orderCode = String(data.orderCode);  // ép chuỗichuỗi
        const escrowWallet = await EscrowWallet.findOne({
            where: { orderCode }
        });

        if (escrowWallet) {
            await escrowWallet.update({
            balance: parseFloat(escrowWallet.balance) + parseFloat(data.amount) //ep kieu balance
        });
        
        const jobGroup = await JobGroup.findOne({
            where: { id: escrowWallet.jobGroupId, userId: escrowWallet.userId }
        });

        if (jobGroup) {
            await jobGroup.update({
                isPaid: true,
                status: 'inactive'
            });
        }
    }
}


        res.status(200).send("OK");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi xử lý callback từ PayOS");
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
        }

        if (escrowWalletEmployer.balance < totalAmountToDeduct) {
            return res.status(400).json({ success: false, message: "Số dư của Escrow Wallet không đủ" });
        }

        // Trừ tiền từ nhà tuyển dụng
        await escrowWalletEmployer.update({ balance: escrowWalletEmployer.balance - totalAmountToDeduct }, { transaction });

        await transaction.commit(); // Xác nhận thay đổi
        return res.status(200).json({ success: true, message: "success when release payment" });
    } catch (error) {
        await transaction.rollback(); // Hoàn tác nếu có lỗi
        console.error(error);
        return res.status(500).json({ success: false, message: "Wrong when release payment" });
    }
};

const paymentHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const escrowWallet = await EscrowWallet.findOne({ where: { userId } });
        if (!escrowWallet) {
            return res.status(404).json({ success: false, message: "Escrow Wallet của người dùng không tìm thấy" });
        }
        return res.status(200).json({ success: true, data: escrowWallet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi khi tìm thấy lịch sử giao dịch" });
    }
};



module.exports = { createPayment, paymentCallback, releasePayment, paymentHistory };