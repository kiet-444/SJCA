// const {Service} = require('../models'); 

// const ServiceController = {

//     createServices: async (req, res) => {
//         try {
//             const services = await Service.create(req.body);
//             res.status(201).json(services);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     },
//     getAllServices: async (req, res) => {
//         try {
//             const services = await Service.findAll();
//             res.status(200).json(services);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     },
//     deleteServices: async (req, res) => {
//         try {
//             const services = await Service.destroy({
//                 where: {
//                     id: req.params.id
//                 }
//             });
//             res.status(200).json(services);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }


// }

// module.exports = ServiceController