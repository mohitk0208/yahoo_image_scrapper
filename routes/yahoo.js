const express = require('express');

const yahooController = require('../controllers/yahoo-controller');

const router = express.Router();


router.get("/images/:query", yahooController.getImages)


module.exports = router;