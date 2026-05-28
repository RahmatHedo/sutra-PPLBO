require('dotenv').config();
const db = require('./config/connection');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    const daerah = 'padang_panjang'; // Single region

    // 1. Insert or Get 1 Ketua for this region
    let res = await db.query("SELECT id FROM users WHERE role = 'ketua' AND daerah = $1 LIMIT 1", [daerah]);
    let ketuaId;
    if (res.rows.length === 0) {
      const q = `INSERT INTO users (nama, email, password, role, daerah, alamat, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
      const values = ['Ketua Padang Panjang', 'ketua@pp.com', passwordHash, 'ketua', daerah, 'Alamat PP', 'acc'];
      const inserted = await db.query(q, values);
      ketuaId = inserted.rows[0].id;
    } else {
      ketuaId = res.rows[0].id;
    }

    // 2. Insert or Get 5 Petani for this region
    res = await db.query("SELECT id FROM users WHERE role = 'petani' AND daerah = $1", [daerah]);
    let petaniIds = res.rows.map(r => r.id);
    
    let neededPetani = 5 - petaniIds.length;
    for (let i = 0; i < neededPetani; i++) {
      const q = `INSERT INTO users (nama, email, password, role, daerah, alamat, status, komoditas, lahan) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`;
      const values = [`Petani Dummy ${i+1}`, `petani${Date.now() + i}@pp.com`, passwordHash, 'petani', daerah, 'Alamat Petani', 'acc', 'Padi', '2'];
      const inserted = await db.query(q, values);
      petaniIds.push(inserted.rows[0].id);
    }

    // 3. Insert 15 harvests for each of the 5 petani
    const statuses = ['pending', 'verified', 'rejected'];
    const komoditasList = ['Padi', 'Jagung', 'Singkong'];
    const catatans = ['Baik sekali', 'Kurang bagus, revisi', 'Kualitas bagus', '', 'Perlu dijemur lagi'];

    let count = 0;
    for (const pId of petaniIds) {
      // Check existing harvests for this petani
      const hRes = await db.query("SELECT COUNT(*) FROM harvests WHERE petani_id = $1", [pId]);
      const currentHarvests = parseInt(hRes.rows[0].count);
      const harvestsToAdd = 15 - currentHarvests;

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
        const values = [pId, randKomoditas, jumlah, 'ton', 'Lahan Dummy', randStatus, randCatatan, pastDate, pastDate];
        await db.query(q, values);
        count++;
      }
    }

    console.log(`Seed complete! Added ${count} new harvests. Region: ${daerah}, Petani IDs: ${petaniIds.join(', ')}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seed();
