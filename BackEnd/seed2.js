require('dotenv').config();
const db = require('./config/connection');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Get all Petani currently in DB
    let res = await db.query("SELECT id, daerah, nama FROM users WHERE role = 'petani'");
    let petaniList = res.rows;

    // 2. If there are fewer than 3 Petani in total, add more dummy Petani
    let neededPetani = 3 - petaniList.length;
    for (let i = 0; i < neededPetani; i++) {
      const q = `INSERT INTO users (nama, email, password, role, daerah, alamat, status, komoditas, lahan) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, daerah, nama`;
      const values = [`Petani Tambahan ${i+1}`, `petani_extra${Date.now() + i}@pp.com`, passwordHash, 'petani', 'padang_panjang', 'Alamat Petani', 'acc', 'Padi', '2'];
      const inserted = await db.query(q, values);
      petaniList.push(inserted.rows[0]);
    }

    // Refresh the list just in case
    res = await db.query("SELECT id, daerah, nama FROM users WHERE role = 'petani'");
    petaniList = res.rows;

    // 3. Ensure every Petani has at least 15 harvests
    const statuses = ['pending', 'verified', 'rejected'];
    const komoditasList = ['Padi', 'Jagung', 'Singkong'];
    const catatans = ['Baik sekali', 'Kurang bagus, revisi', 'Kualitas bagus', '', 'Perlu dijemur lagi'];

    let totalAdded = 0;
    for (const petani of petaniList) {
      const pId = petani.id;
      // Check existing harvests for this petani
      const hRes = await db.query("SELECT COUNT(*) FROM harvests WHERE petani_id = $1", [pId]);
      const currentHarvests = parseInt(hRes.rows[0].count);
      const harvestsToAdd = 15 - currentHarvests;

      let count = 0;
      for (let i = 0; i < harvestsToAdd; i++) {
        const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randKomoditas = komoditasList[Math.floor(Math.random() * komoditasList.length)];
        const randCatatan = randStatus === 'rejected' ? catatans[Math.floor(Math.random() * catatans.length)] : '';
        const jumlah = (Math.floor(Math.random() * 50) + 10).toString();
        
        // Random date in the past 6 months
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - Math.floor(Math.random() * 6));
        
        const q = `INSERT INTO harvests (petani_id, komoditas, jumlah, satuan, lokasi, status, catatan, tanggal_panen, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
        // Using "Lahan Dummy" + Petani name for context
        const values = [pId, randKomoditas, jumlah, 'ton', `Lahan ${petani.nama}`, randStatus, randCatatan, pastDate, pastDate];
        await db.query(q, values);
        count++;
      }
      if (count > 0) {
        console.log(`Added ${count} harvests for Petani: ${petani.nama} (ID: ${pId})`);
        totalAdded += count;
      }
    }

    console.log(`Seed complete! Added ${totalAdded} new harvests across all petanis.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seed();
