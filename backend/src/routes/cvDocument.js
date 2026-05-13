import { pool } from '../db/init.js';
import cvDocumentSchema, { emptyCvDocument } from '../schemas/cvDocumentSchema.js';

async function cvDocumentRoutes(fastify, opts) {
  const getDocumentOptions = {
    onRequest: [fastify.authenticate],
  };

  const putDocumentOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: cvDocumentSchema,
        },
      },
    },
  };

  fastify.get('/api/cv-document', getDocumentOptions, async (request, reply) => {
    try {
      const res = await pool.query(
        `INSERT INTO cv_documents (user_id, data)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id) DO UPDATE
           SET user_id = EXCLUDED.user_id
         RETURNING id, user_id, data, created_at, updated_at`,
        [request.user.id, JSON.stringify(emptyCvDocument)]
      );
      return reply.code(200).send(res.rows[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la lecture du document CV.' });
    }
  });

  fastify.put('/api/cv-document', putDocumentOptions, async (request, reply) => {
    const { data } = request.body;
    try {
      const res = await pool.query(
        `INSERT INTO cv_documents (user_id, data)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id) DO UPDATE
           SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
         RETURNING id, user_id, data, created_at, updated_at`,
        [request.user.id, JSON.stringify(data)]
      );
      return reply.code(200).send(res.rows[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la mise à jour du document CV.' });
    }
  });
}

export default cvDocumentRoutes;
