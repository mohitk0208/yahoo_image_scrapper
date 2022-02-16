const express = require('express');

const yahooController = require('../controllers/yahoo-controller');

const router = express.Router();


router.get("/yahoo/:query", yahooController.getImages)

// Example for next route
// router.get("/google/:query/", yahooController.getImages)


module.exports = router;