const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();
const payos = new PayOS(
    process.env.PAYOS_API_SECRET, 
    process.env.PAYOS_API_KEY, 
    process.env.PAYOS_ENVIRONMENT
);


// Tạo thanh toán (Employer thanh toán trước, tiền giữ trong Escrow Wallet)
exports.createPayment = async (req, res) => {
    try {
        const { amount, orderId, employerId } = req.body;

        // Gọi API PayOS để tạo thanh toán
        const response = await axios.post(`${PAYOS_ENDPOINT}/payment/create`, {
            amount: amount,
            orderCode: orderId,
            description: "Thanh toán cho công việc",
            returnUrl: "https://your-platform.com/payment-success",
            cancelUrl: "https://your-platform.com/payment-fail",
            merchantId: PAYOS_MERCHANT_ID,
        }, {
            headers: {
                "x-api-key": PAYOS_API_KEY
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tạo thanh toán" });
    }
};

// Xử lý callback từ PayOS khi thanh toán thành công
exports.paymentCallback = async (req, res) => {
    try {
        const { orderCode, status } = req.body; // Lấy dữ liệu callback từ PayOS

        if (status === "PAID") {
            // Cập nhật trạng thái đơn hàng trong DB -> Tiền đang giữ trong Escrow Wallet
            await updateOrderStatus(orderCode, "ESCROW");
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi xử lý callback từ PayOS");
    }
};

// Giải phóng tiền từ Escrow Wallet sang Worker khi công việc hoàn thành
exports.releasePayment = async (req, res) => {
    try {
        const { orderCode, workerId } = req.body;

        // Gọi API PayOS để chuyển tiền từ Escrow Wallet sang Worker
        const response = await axios.post(`${PAYOS_ENDPOINT}/escrow/release`, {
            orderCode: orderCode,
            recipientId: workerId, // Worker nhận tiền
        }, {
            headers: {
                "x-api-key": PAYOS_API_KEY
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi giải phóng thanh toán" });
    }
};

//  Hàm cập nhật trạng thái đơn hàng trong database 
async function updateOrderStatus(orderId, status) {
    try {
        console.log(`Cập nhật đơn hàng ${orderId} thành trạng thái: ${status}`);
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái đơn hàng", error);
    }
}
