import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL, // Ensure this environment variable is set in Vercel
    ssl: {
        rejectUnauthorized: false,
    },
});

export default async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
    }

    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
    }

    try {
        const client = await pool.connect();
        const queryText = `
            INSERT INTO users (first_name, last_name, email, phone, password)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [firstName, lastName, email, phone, password]; // Note: Hash the password in production

        const result = await client.query(queryText, values);
        client.release();

        res.status(200).json({ success: true, message: 'User registered successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
