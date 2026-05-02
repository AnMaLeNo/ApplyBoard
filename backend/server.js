import Fastify from 'fastify';
import cors from '@fastify/cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
});

fastify.register(fastifyCookie);

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'default_fallback_secret_key_change_in_prod',
  cookie: {
    cookieName: 'authToken',
    signed: false
  }
});

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY,
        url TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_offers (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
        apply BOOLEAN DEFAULT FALSE,
        answer BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (user_id, offer_id)
      );
    `);
  } finally {
    client.release();
  }
};
initDB().catch(console.error);

fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: "Défaut d'authentification. Jeton JWT manquant ou invalide." });
  }
});

// --- ENDPOINTS D'AUTHENTIFICATION ---

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

// --- ENDPOINTS CRUD ---

const offerRouteOptions = {
  onRequest: [fastify.authenticate],
  schema: {
    body: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          pattern: '^https:\\/\\/companies\\.intra\\.42\\.fr\\/en\\/offers\\/\\d+$'
        }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          status: { type: 'string' }
        }
      }
    }
  }
};

fastify.post('/api/offers', offerRouteOptions, async (request, reply) => {
  const { url } = request.body;
  const match = url.match(/\/(\d+)$/);

  if (!match) {
    return reply.code(400).send({ error: 'Extraction de l\'ID impossible.' });
  }

  const extractedId = parseInt(match[1], 10);
  const userId = request.user.id;

  try {
    await pool.query(
      'INSERT INTO offers (id, url) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [extractedId, url]
    );
    await pool.query(
      'INSERT INTO user_offers (user_id, offer_id, apply, answer) VALUES ($1, $2, false, false)',
      [userId, extractedId]
    );
    return reply.code(201).send({ id: extractedId, status: 'created' });
  } catch (error) {
    if (error.code === '23505') return reply.code(409).send({ error: 'Association déjà existante pour cet utilisateur.' });
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Erreur DML d\'insertion.' });
  }
});

const getOffersRouteOptions = {
  onRequest: [fastify.authenticate],
  schema: {
    querystring: {
      type: 'object',
      properties: {
        apply: { type: 'boolean' },
        answer: { type: 'boolean' }
      }
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            url: { type: 'string' },
            apply: { type: 'boolean' },
            answer: { type: 'boolean' }
          }
        }
      }
    }
  }
};

fastify.get('/api/offers', getOffersRouteOptions, async (request, reply) => {
  const { apply, answer } = request.query;

  let sql = `
    SELECT o.id, o.url, uo.apply, uo.answer
    FROM offers o
    JOIN user_offers uo ON o.id = uo.offer_id
    WHERE uo.user_id = $1
  `;
  const values = [request.user.id];
  let paramIndex = 2;

  if (apply !== undefined) {
    sql += ` AND uo.apply = $${paramIndex++}`;
    values.push(apply);
  }
  if (answer !== undefined) {
    sql += ` AND uo.answer = $${paramIndex++}`;
    values.push(answer);
  }

  const res = await pool.query(sql, values);
  return reply.code(200).send(res.rows);
});

const patchOfferRouteOptions = {
  onRequest: [fastify.authenticate],
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' }
      }
    },
    body: {
      type: 'object',
      anyOf: [
        { required: ['apply'] },
        { required: ['answer'] }
      ],
      properties: {
        apply: { type: 'boolean' },
        answer: { type: 'boolean' }
      }
    }
  }
};

fastify.patch('/api/offers/:id', patchOfferRouteOptions, async (request, reply) => {
  const { apply, answer } = request.body;

  const updates = [];
  const values = [request.params.id, request.user.id];
  let paramIndex = 3;

  if (apply !== undefined) {
    updates.push(`apply = $${paramIndex++}`);
    values.push(apply);
  }
  if (answer !== undefined) {
    updates.push(`answer = $${paramIndex++}`);
    values.push(answer);
  }

  const sql = `UPDATE user_offers SET ${updates.join(', ')} WHERE offer_id = $1 AND user_id = $2`;
  const res = await pool.query(sql, values);

  if (res.rowCount === 0) return reply.code(404).send({ error: 'Association non résolue.' });
  return reply.code(200).send({ id: request.params.id, status: 'updated' });
});

const getSingleOfferRouteOptions = {
  onRequest: [fastify.authenticate],
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          url: { type: 'string' },
          apply: { type: 'boolean' },
          answer: { type: 'boolean' }
        }
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

fastify.get('/api/offers/:id', getSingleOfferRouteOptions, async (request, reply) => {
  const { id } = request.params;

  try {
    const res = await pool.query(
      `SELECT o.id, o.url, uo.apply, uo.answer
       FROM offers o
       JOIN user_offers uo ON o.id = uo.offer_id
       WHERE o.id = $1 AND uo.user_id = $2`,
      [id, request.user.id]
    );

    if (res.rows.length === 0) {
      return reply.code(404).send({ error: 'Offre introuvable.' });
    }

    return reply.code(200).send(res.rows[0]);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Exception lors de l\'opération de lecture SQL.' });
  }
});

const deleteOfferRouteOptions = {
  onRequest: [fastify.authenticate],
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          status: { type: 'string' }
        }
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

fastify.delete('/api/offers/:id', deleteOfferRouteOptions, async (request, reply) => {
  const { id } = request.params;

  try {
    const res = await pool.query(
      'DELETE FROM user_offers WHERE offer_id = $1 AND user_id = $2',
      [id, request.user.id]
    );

    if (res.rowCount === 0) return reply.code(404).send({ error: 'Association non résolue.' });
    return reply.code(200).send({ id: id, status: 'deleted' });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Exception lors de l\'exécution de l\'instruction DML.' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
