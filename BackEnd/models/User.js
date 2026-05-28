const db = require('../config/connection');

class User {
    // pg returns { rows } not [rows] like mysql2
    static async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows;
    }

    static async findById(id) {
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows;
    }

    static async create(userData) {
        const { nama, email, alamat, daerah, password, role, status } = userData;
        const query = `
            INSERT INTO users (nama, email, alamat, daerah, password, role, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        const { rows } = await db.query(query, [nama, email, alamat, daerah, password, role, status]);
        return rows[0];
    }

    static async getKetuaDaerah(id) {
        const { rows } = await db.query('SELECT daerah FROM users WHERE id = $1', [id]);
        return rows;
    }

    static async findAll(role, daerah) {
        let query = 'SELECT id, nama, email, alamat, daerah, komoditas, lahan, role, status, created_at FROM users';
        let params = [];

        if (role === 'ketua' && daerah) {
            query += ' WHERE (role = $1 OR role = $2) AND daerah = $3';
            params = ['petani', 'ketua', daerah];
        }

        const { rows } = await db.query(query, params);
        return rows;
    }

    static async findProfileById(id) {
        const query = 'SELECT id, nama, email, alamat, daerah, komoditas, lahan, role, status, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows;
    }

    static async updateProfile(id, data) {
        const { nama, alamat, daerah } = data;
        const query = 'UPDATE users SET nama = $1, alamat = $2, daerah = $3 WHERE id = $4';
        const { rowCount } = await db.query(query, [nama, alamat, daerah, id]);
        return { affectedRows: rowCount };
    }

    static async approveKetua(id) {
        const query = "UPDATE users SET status = 'acc' WHERE id = $1 AND role = 'ketua'";
        const { rowCount } = await db.query(query, [id]);
        return { affectedRows: rowCount };
    }

    static async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = $1';
        const { rowCount } = await db.query(query, [id]);
        return { affectedRows: rowCount };
    }

    static async getStatus(id) {
        const { rows } = await db.query('SELECT status FROM users WHERE id = $1', [id]);
        return rows;
    }

    static async updateStatus(id, newStatus) {
        const query = 'UPDATE users SET status = $1 WHERE id = $2';
        const { rowCount } = await db.query(query, [newStatus, id]);
        return { affectedRows: rowCount };
    }
}

module.exports = User;
