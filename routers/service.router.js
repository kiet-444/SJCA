const express = require('express');
const router = express.Router(); 

const ServiceController = require('../controllers/Service.controlller');

router.get('/services', ServiceController.getAllServices);

router.put('/services/:id', ServiceController.updateServices);

router.delete('/services/:id', ServiceController.deleteServices);

module.exports = router;