const { ComplaintRecord, User } = require('../models');
const { uploadFile } = require('../controllers/Media.controller');


const ComplaintRecordController = {
    createComplaintRecord: async (req, res) => {
        try {
            const userId = req.userId;
            const { jobPostingId, description, type, image } = req.body;

            let imageUrls = [];

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const result = await uploadFile(file); // bạn cần đảm bảo uploadFile hỗ trợ buffer
                    imageUrls.push(result);
                    // console.log(result);
                }
            }
            const newComplaintRecord = await ComplaintRecord.create({
                userId,
                description,
                type,
                image: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
                status: 'pending'
            });
            res.status(201).json({ message: 'Complaint record created successfully', data: newComplaintRecord });
        } catch (error) {
            console.error('Error creating complaint record:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getAllComplaintRecords: async (req, res) => {
        try {
            const complaintRecords = await ComplaintRecord.findAll({
                include: [{
                    model: User,
                    attributes: ['email']
                }]
            });
            res.status(200).json({ message: 'All complaint records fetched successfully', data: complaintRecords });
        } catch (error) {
            console.error('Error fetching all complaint records:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getComplaintRecordById: async (req, res) => {
        try {
            const { id } = req.params;
            const complaintRecord = await ComplaintRecord.findByPk(id);
            if (!complaintRecord) {
                return res.status(404).json({ message: 'Complaint record not found' });
            }
            res.status(200).json({ message: 'Complaint record fetched successfully', data: complaintRecord });
        } catch (error) {
            console.error('Error fetching complaint record by ID:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // getAllComplaintRecordsByStaff : async (req, res) => {
    //     try {
    //         const complaintRecords = await ComplaintRecord.findAll();
    //         res.status(200).json({ message: 'All complaint records fetched successfully', data: complaintRecords });
    //     } catch (error) {
    //         console.error('Error fetching all complaint records:', error);
    //         res.status(500).json({ error: error.message });
    //     }
    // },

    updateComplaintRecord: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const complaintRecord = await ComplaintRecord.findByPk(id);

            if (!complaintRecord) {
                return res.status(404).json({ message: 'Complaint record not found' });
            }

            if (req.userRole !== 'support staff') {
                return res.status(403).json({ message: 'Access denied' });
            }

            complaint.status = status;
            await complaint.save();

            res.status(200).json({ message: 'Complaint record updated successfully', data: complaintRecord });
        } catch (error) {
            console.error('Error updating complaint record:', error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteComplaintRecord: async (req, res) => {
        try {
            const { id } = req.params;
            const complaintRecord = await ComplaintRecord.findByPk(id);
            if (!complaintRecord) {
                return res.status(404).json({ message: 'Complaint record not found' });
            }
            await complaintRecord.destroy();
            res.status(200).json({ message: 'Complaint record deleted successfully' });
        } catch (error) {
            console.error('Error deleting complaint record:', error);
            res.status(500).json({ error: error.message });
        }
    }


}

module.exports = ComplaintRecordController;