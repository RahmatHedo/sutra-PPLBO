const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
    createHarvest, 
    getHarvestsByPetani, 
    getHarvestsForKetua, 
    updateHarvestStatus, 
    getHarvestStats 
} = require('../controllers/harvestController');

// Harus login untuk semua route ini
router.use(authenticateToken);

// Endpoint Petani
router.post('/', createHarvest);           // foto_url dikirim lewat JSON body
router.get('/petani', getHarvestsByPetani);

// Endpoint Ketua
router.get('/ketua', getHarvestsForKetua);
router.put('/:id/status', updateHarvestStatus);

// Endpoint Dashboard
router.get('/stats', getHarvestStats);

module.exports = router;
