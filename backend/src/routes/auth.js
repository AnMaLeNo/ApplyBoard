import bcrypt from 'bcrypt';
import { pool } from '../db/init.js';

async function authRoutes(fastify, opts) {

  const registerRouteOptions = {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            maxLength: 255 
          },
          password: { 
            type: 'string', 
            minLength: 8, 
            maxLength: 72 // Limitation imposée par la taille de bloc de l'algorithme bcrypt
          }
        },
        additionalProperties: false // Rejet strict des champs non déclarés
      },
      response: {
        201: {
          type: 'object',
          properties: {
            userId: { type: 'integer' },
            status: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: { error: { type: 'string' } }
        },
        500: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  };

  const loginRouteOptions = {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email' 
          },
          password: { 
            type: 'string',
            minLength: 1 // Vérification de la présence d'une chaîne non vide
          }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' } }
        },
        401: {
          type: 'object',
          properties: { error: { type: 'string' } }
        },
        500: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  };

  const logoutRouteOptions = {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string' } }
        }
      }
    }
  };

  fastify.post('/api/register', registerRouteOptions, async (request, reply) => {
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

  fastify.post('/api/login', loginRouteOptions, async (request, reply) => {
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

  fastify.post('/api/logout', logoutRouteOptions, async (request, reply) => {
  reply.clearCookie('authToken', { path: '/' });
  return reply.send({ status: 'Logged out' });
  });
}

export default authRoutes;