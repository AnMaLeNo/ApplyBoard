import bcrypt from 'bcrypt';
import { pool } from '../db/init.js';

async function authRoutes(fastify, opts) {
    fastify.post('/api/register', async (request, reply) => {
        const { email, password } = request.body;
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        try {
            const res = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
            [email, hash]
            );
            return reply.code(201).send({ userId: res.rows[0].id, status: 'Account provisioned' });
        } catch (error) {
            if (error.code === '23505') {
            return reply.code(409).send({ error: 'Identifiant de messagerie déjà alloué.' });
            }
            return reply.code(500).send({ error: 'Erreur lors de la transaction DML.' });
        }
    });

    fastify.post('/api/login', async (request, reply) => {
    const { email, password } = request.body;

    try {
        const res = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
        const user = res.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return reply.code(401).send({ error: 'Vecteur d\'authentification invalide.' });
        }

        const token = await reply.jwtSign({ id: user.id });

        reply.setCookie('authToken', token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
        });

        return reply.send({ status: 'Authentication successful' });
    } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Erreur interne du serveur lors de la connexion.' });
    }
    });

    fastify.post('/api/logout', async (request, reply) => {
    reply.clearCookie('authToken', { path: '/' });
    return reply.send({ status: 'Logged out' });
    });
}

export default authRoutes;