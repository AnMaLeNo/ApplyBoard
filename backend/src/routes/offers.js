import { pool } from '../db/init.js';

const offerFields = [
  'title',
  'company',
  'short_description',
  'full_description',
  'salary',
  'contract_type',
  'email',
  'address',
  'availability',
  'campus',
  'expertises',
  'target'
];

const offerFieldsProperties = offerFields.reduce((acc, key) => {
  acc[key] = { type: ['string', 'null'] };
  return acc;
}, {});

// Schéma partagé du payload "offre" sérialisé en réponse (liste + détail).
// `apply`/`answer` ne sont peuplés que sur les endpoints joints à `user_offers` ;
// fast-json-stringify les omettra automatiquement sur les réponses du catalogue global.
const offerResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    url: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    apply: { type: 'boolean' },
    answer: { type: 'boolean' },
    ...offerFieldsProperties,
  },
};

const paginationQueryProperty = {
  type: 'integer',
  minimum: 1,
  maximum: 500,
};

const filterQueryProperties = {
  apply: { type: 'boolean' },
  answer: { type: 'boolean' },
};

async function offerRoutes(fastify, opts) {
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
          },
          ...offerFieldsProperties
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

  const getOffersRouteOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          ...filterQueryProperties,
          limit: { ...paginationQueryProperty, default: 500 }
        }
      },
      response: {
        200: { type: 'array', items: offerResponseSchema }
      }
    }
  };

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
        200: offerResponseSchema,
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  };

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

  const getGlobalOffersRouteOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { ...paginationQueryProperty, default: 50 }
        }
      },
      response: {
        200: { type: 'array', items: offerResponseSchema }
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

    const columns = ['id', 'url'];
    const placeholders = ['$1', '$2'];
    const values = [extractedId, url];
    let paramIndex = 3;

    for (const field of offerFields) {
      if (request.body[field] !== undefined) {
        columns.push(field);
        placeholders.push(`$${paramIndex++}`);
        values.push(request.body[field]);
      }
    }

    try {
      await pool.query(
        `INSERT INTO offers (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) ON CONFLICT (id) DO NOTHING`,
        values
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

  const offerColumnsSelect = ['o.id', 'o.url', 'o.created_at', ...offerFields.map(f => `o.${f}`)].join(', ');

  fastify.get('/api/offers', getOffersRouteOptions, async (request, reply) => {
    const { apply, answer, limit } = request.query;

    let sql = `
      SELECT ${offerColumnsSelect}, uo.apply, uo.answer
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

    sql += ` ORDER BY o.created_at DESC LIMIT $${paramIndex++}`;
    values.push(limit);

    const res = await pool.query(sql, values);
    return reply.code(200).send(res.rows);
  });

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

  fastify.get('/api/offers/:id', getSingleOfferRouteOptions, async (request, reply) => {
    const { id } = request.params;

    try {
      const res = await pool.query(
        `SELECT ${offerColumnsSelect}, uo.apply, uo.answer
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

  fastify.get('/api/global-offers', getGlobalOffersRouteOptions, async (request, reply) => {
    const { limit } = request.query;

    try {
      const res = await pool.query(
        `SELECT ${offerColumnsSelect} FROM offers o ORDER BY o.created_at DESC LIMIT $1`,
        [limit]
      );

      return reply.code(200).send(res.rows);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Exception lors de l\'opération DQL sur le catalogue global.' });
    }
  });

}

export default offerRoutes;
