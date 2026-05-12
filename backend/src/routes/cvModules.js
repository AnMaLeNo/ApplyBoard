import { pool } from '../db/init.js';

const KINDS = [
  'title',
  'headline',
  'education',
  'projects',
  'hackathons',
  'interests',
  'skills',
  'experience',
  'custom',
];

const isString = (v) => typeof v === 'string';
const isOptionalString = (v) => v == null || typeof v === 'string';
const isStringArray = (v) => Array.isArray(v) && v.every(isString);

const contentValidatorsByKind = {
  title: (content) => {
    if (!content || typeof content.text !== 'string') return 'content.text (string) requis.';
    return null;
  },
  headline: (content) => {
    if (!content || typeof content.text !== 'string') return 'content.text (string) requis.';
    return null;
  },
  custom: (content) => {
    if (!content || typeof content.text !== 'string') return 'content.text (string) requis.';
    return null;
  },
  interests: (content) => {
    if (!content || !isStringArray(content.items)) return 'content.items (string[]) requis.';
    return null;
  },
  skills: (content) => {
    if (!content || !isStringArray(content.items)) return 'content.items (string[]) requis.';
    return null;
  },
  // Kinds "composables" : une variante = une entrée unique (pas un tableau d'entrées).
  // Le générateur de CV sélectionne N variantes de N modules distincts pour composer la section.
  education: (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return 'content doit être un objet.';
    if (!isString(content.degree)) return 'degree (string) requis.';
    if (!isString(content.school)) return 'school (string) requis.';
    if (!isOptionalString(content.year)) return 'year doit être string.';
    if (!isOptionalString(content.description)) return 'description doit être string.';
    return null;
  },
  projects: (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return 'content doit être un objet.';
    if (!isString(content.name)) return 'name (string) requis.';
    if (!isOptionalString(content.description)) return 'description doit être string.';
    if (!isOptionalString(content.link)) return 'link doit être string.';
    if (content.tech != null && !isStringArray(content.tech)) return 'tech doit être string[].';
    return null;
  },
  hackathons: (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return 'content doit être un objet.';
    if (!isString(content.name)) return 'name (string) requis.';
    if (!isOptionalString(content.year)) return 'year doit être string.';
    if (!isOptionalString(content.description)) return 'description doit être string.';
    if (!isOptionalString(content.prize)) return 'prize doit être string.';
    return null;
  },
  experience: (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return 'content doit être un objet.';
    if (!isString(content.role)) return 'role (string) requis.';
    if (!isString(content.company)) return 'company (string) requis.';
    if (!isOptionalString(content.start)) return 'start doit être string.';
    if (!isOptionalString(content.end)) return 'end doit être string.';
    if (!isOptionalString(content.location)) return 'location doit être string.';
    if (content.bullets != null && !isStringArray(content.bullets)) return 'bullets doit être string[].';
    return null;
  },
};

function validateContentForKind(kind, content) {
  const validator = contentValidatorsByKind[kind];
  if (!validator) return `kind inconnu : ${kind}.`;
  return validator(content);
}

async function cvModuleRoutes(fastify, opts) {
  const moduleResponseSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      kind: { type: 'string' },
      name: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
      variants: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            module_id: { type: 'integer' },
            label: { type: 'string' },
            content: {},
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  };

  const variantResponseSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      module_id: { type: 'integer' },
      label: { type: 'string' },
      content: {},
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
    },
  };

  const createModuleOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['kind', 'name'],
        properties: {
          kind: { type: 'string', enum: KINDS },
          name: { type: 'string', minLength: 1, maxLength: 255 },
        },
      },
    },
  };

  const listModulesOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      response: {
        200: { type: 'array', items: moduleResponseSchema },
      },
    },
  };

  const getModuleOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      response: { 200: moduleResponseSchema },
    },
  };

  const patchModuleOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 1, maxLength: 255 } },
      },
    },
  };

  const deleteModuleOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
    },
  };

  const createVariantOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        required: ['label', 'content'],
        properties: {
          label: { type: 'string', minLength: 1, maxLength: 255 },
          content: {},
        },
      },
      response: { 201: variantResponseSchema },
    },
  };

  const patchVariantOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        anyOf: [{ required: ['label'] }, { required: ['content'] }],
        properties: {
          label: { type: 'string', minLength: 1, maxLength: 255 },
          content: {},
        },
      },
      response: { 200: variantResponseSchema },
    },
  };

  const deleteVariantOptions = {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
    },
  };

  // ----- modules -----

  fastify.post('/api/cv-modules', createModuleOptions, async (request, reply) => {
    const { kind, name } = request.body;
    try {
      const res = await pool.query(
        `INSERT INTO cv_modules (user_id, kind, name)
         VALUES ($1, $2, $3)
         RETURNING id, kind, name, created_at, updated_at`,
        [request.user.id, kind, name]
      );
      const row = res.rows[0];
      return reply.code(201).send({ ...row, variants: [] });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Échec de la création du module." });
    }
  });

  fastify.get('/api/cv-modules', listModulesOptions, async (request, reply) => {
    try {
      const res = await pool.query(
        `SELECT
           m.id, m.kind, m.name, m.created_at, m.updated_at,
           COALESCE(
             (
               SELECT json_agg(v ORDER BY v.created_at DESC)
               FROM (
                 SELECT id, module_id, label, content, created_at, updated_at
                 FROM cv_module_variants
                 WHERE module_id = m.id
               ) v
             ),
             '[]'::json
           ) AS variants
         FROM cv_modules m
         WHERE m.user_id = $1
         ORDER BY m.created_at DESC`,
        [request.user.id]
      );
      return reply.code(200).send(res.rows);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors du listing des modules.' });
    }
  });

  fastify.get('/api/cv-modules/:id', getModuleOptions, async (request, reply) => {
    const { id } = request.params;
    try {
      const moduleRes = await pool.query(
        `SELECT id, kind, name, created_at, updated_at
         FROM cv_modules
         WHERE id = $1 AND user_id = $2`,
        [id, request.user.id]
      );
      if (moduleRes.rows.length === 0) {
        return reply.code(404).send({ error: 'Module introuvable.' });
      }
      const variantsRes = await pool.query(
        `SELECT id, module_id, label, content, created_at, updated_at
         FROM cv_module_variants
         WHERE module_id = $1
         ORDER BY created_at DESC`,
        [id]
      );
      return reply.code(200).send({ ...moduleRes.rows[0], variants: variantsRes.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la lecture du module.' });
    }
  });

  fastify.patch('/api/cv-modules/:id', patchModuleOptions, async (request, reply) => {
    const { id } = request.params;
    const { name } = request.body;
    try {
      const res = await pool.query(
        `UPDATE cv_modules
         SET name = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3`,
        [name, id, request.user.id]
      );
      if (res.rowCount === 0) {
        return reply.code(404).send({ error: 'Module introuvable.' });
      }
      return reply.code(200).send({ id, status: 'updated' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la mise à jour du module.' });
    }
  });

  fastify.delete('/api/cv-modules/:id', deleteModuleOptions, async (request, reply) => {
    const { id } = request.params;
    try {
      const res = await pool.query(
        `DELETE FROM cv_modules WHERE id = $1 AND user_id = $2`,
        [id, request.user.id]
      );
      if (res.rowCount === 0) {
        return reply.code(404).send({ error: 'Module introuvable.' });
      }
      return reply.code(200).send({ id, status: 'deleted' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la suppression du module.' });
    }
  });

  // ----- variantes -----

  fastify.post('/api/cv-modules/:id/variants', createVariantOptions, async (request, reply) => {
    const { id } = request.params;
    const { label, content } = request.body;
    try {
      const moduleRes = await pool.query(
        `SELECT kind FROM cv_modules WHERE id = $1 AND user_id = $2`,
        [id, request.user.id]
      );
      if (moduleRes.rows.length === 0) {
        return reply.code(404).send({ error: 'Module introuvable.' });
      }
      const validationError = validateContentForKind(moduleRes.rows[0].kind, content);
      if (validationError) {
        return reply.code(400).send({ error: `content invalide : ${validationError}` });
      }
      const res = await pool.query(
        `INSERT INTO cv_module_variants (module_id, label, content)
         VALUES ($1, $2, $3::jsonb)
         RETURNING id, module_id, label, content, created_at, updated_at`,
        [id, label, JSON.stringify(content)]
      );
      return reply.code(201).send(res.rows[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la création de la variante.' });
    }
  });

  fastify.patch('/api/cv-module-variants/:id', patchVariantOptions, async (request, reply) => {
    const { id } = request.params;
    const { label, content } = request.body;
    try {
      const ownershipRes = await pool.query(
        `SELECT m.kind
         FROM cv_module_variants v
         JOIN cv_modules m ON m.id = v.module_id
         WHERE v.id = $1 AND m.user_id = $2`,
        [id, request.user.id]
      );
      if (ownershipRes.rows.length === 0) {
        return reply.code(404).send({ error: 'Variante introuvable.' });
      }

      if (content !== undefined) {
        const validationError = validateContentForKind(ownershipRes.rows[0].kind, content);
        if (validationError) {
          return reply.code(400).send({ error: `content invalide : ${validationError}` });
        }
      }

      const updates = [];
      const values = [];
      let paramIndex = 1;
      if (label !== undefined) {
        updates.push(`label = $${paramIndex++}`);
        values.push(label);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramIndex++}::jsonb`);
        values.push(JSON.stringify(content));
      }
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const res = await pool.query(
        `UPDATE cv_module_variants SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, module_id, label, content, created_at, updated_at`,
        values
      );
      return reply.code(200).send(res.rows[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la mise à jour de la variante.' });
    }
  });

  fastify.delete('/api/cv-module-variants/:id', deleteVariantOptions, async (request, reply) => {
    const { id } = request.params;
    try {
      const res = await pool.query(
        `DELETE FROM cv_module_variants v
         USING cv_modules m
         WHERE v.id = $1 AND v.module_id = m.id AND m.user_id = $2`,
        [id, request.user.id]
      );
      if (res.rowCount === 0) {
        return reply.code(404).send({ error: 'Variante introuvable.' });
      }
      return reply.code(200).send({ id, status: 'deleted' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur lors de la suppression de la variante.' });
    }
  });
}

export default cvModuleRoutes;
