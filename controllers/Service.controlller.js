const {Service, User} = require('../models');


const ServiceController = {

    getAllServices: async (req, res) => {
        try {
            const services = await Service.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'companyName', 'email']
                }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json(services);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateServices: async (req, res) => {
        try {
            const services = await Service.update(req.body, {
                where: {
                    id: req.params.id
                }
            });
            res.status(200).json(services);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    deleteServices: async (req, res) => {
        try {
            const services = await Service.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.status(200).json(services);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = ServiceController;