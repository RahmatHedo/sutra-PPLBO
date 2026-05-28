const Harvest = require('../models/Harvest');
const User = require('../models/User');

// 1. CREATE HARVEST (Input Panen) — foto sekarang berupa URL dari Supabase Storage
const createHarvest = async (req, res) => {
    const petani_id = req.user.id;
    const { tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan, foto_url } = req.body;

    if (!tanggal_panen || !komoditas || !jumlah || !satuan || !lokasi) {
        return res.status(400).json({ message: "Data wajib (*) harus diisi!" });
    }

    try {
        const result = await Harvest.create({
            petani_id,
            tanggal_panen,
            komoditas,
            jumlah,
            satuan,
            lokasi,
            luas,
            cuaca,
            kualitas,
            catatan,
            foto: foto_url || null, // URL publik dari Supabase Storage
            status: 'pending'
        });

        res.status(201).json({
            message: "Data panen berhasil disimpan dan menunggu verifikasi ketua",
            harvestId: result.insertId
        });
    } catch (error) {
        console.error("Create Harvest Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. GET ALL HARVESTS BY PETANI (Riwayat & Tracking Petani)
const getHarvestsByPetani = async (req, res) => {
    const petani_id = req.user.id;

    try {
        const rows = await Harvest.findByPetaniId(petani_id);
        
        res.json({
            message: "Berhasil mengambil riwayat panen",
            data: rows
        });
    } catch (error) {
        console.error("Get Harvests Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. GET HARVESTS FOR KETUA (Berdasarkan daerah yang sama)
const getHarvestsForKetua = async (req, res) => {
    const ketua_id = req.user.id;

    try {
        const ketuaInfo = await User.getKetuaDaerah(ketua_id);
        if (ketuaInfo.length === 0) {
            return res.status(404).json({ message: "Ketua tidak ditemukan" });
        }
        
        const daerah = ketuaInfo[0].daerah;
        const rows = await Harvest.findByDaerah(daerah);
        
        res.json({
            message: "Berhasil mengambil data panen kelompok",
            data: rows
        });
    } catch (error) {
        console.error("Get Harvests For Ketua Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. UPDATE HARVEST STATUS (Verifikasi Ketua)
const updateHarvestStatus = async (req, res) => {
    const { id } = req.params;
    const { status, catatan } = req.body; // 'verified' atau 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status tidak valid" });
    }

    try {
        const result = await Harvest.updateStatus(id, status, catatan);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Data panen tidak ditemukan" });
        }

        res.json({ message: `Status panen berhasil diubah menjadi ${status}` });
    } catch (error) {
        console.error("Update Harvest Status Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. GET HARVEST STATS (Untuk Dashboard)
const getHarvestStats = async (req, res) => {
    const user_id = req.user.id;
    const role = req.user.role;

    try {
        let stats = {};
        if (role === 'petani') {
            const rows = await Harvest.getStatsPetani(user_id);
            stats = rows[0];
        } else if (role === 'ketua') {
            const ketuaInfo = await User.getKetuaDaerah(user_id);
            const daerah = ketuaInfo[0].daerah;
            
            const rows = await Harvest.getStatsKetua(daerah);
            stats = rows[0];
        }

        res.json({ data: stats });
    } catch (error) {
        console.error("Get Harvest Stats Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createHarvest,
    getHarvestsByPetani,
    getHarvestsForKetua,
    updateHarvestStatus,
    getHarvestStats
};
