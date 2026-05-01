import Fastify from 'fastify';
import cors from '@fastify/cors'; // pas besoin j'ais l'impression
import Database from 'better-sqlite3';
import { join } from 'path';

// 1. Résolution du chemin absolu pour le fichier binaire de la base de données
const dbPath = join(process.cwd(), 'data', 'offers.sqlite');

// 2. Initialisation de l'instance HTTP et du SGBDR persistant
const fastify = Fastify({ logger: true });

// Configuration CORS : Autorise n'importe quelle extension ou site web à utiliser cette API
await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

// Le constructeur crée le fichier s'il est inexistant, à condition
// que le processus dispose des droits d'écriture (I/O) sur le répertoire.
const db = new Database(dbPath);

// 3. Optimisation de la concurrence via le protocole Write-Ahead Logging
db.pragma('journal_mode = WAL');

// 4. Définition du schéma de la base de données (DDL)
db.exec(`
  CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    apply INTEGER DEFAULT 0,
    answer INTEGER DEFAULT 0
  )
`);

// Précompilation de la requête de sélection totale d'un enregistrement unique
const getSingleOfferFullStmt = db.prepare(`
  SELECT id, url, apply, answer 
  FROM offers 
  WHERE id = @id
`);

// Précompilation de la requête de mise à jour.
// L'utilisation des variables de liaison prévient l'injection SQL.
const updateOfferStmt = db.prepare(`
  UPDATE offers 
  SET apply = @apply, answer = @answer 
  WHERE id = @id
`);

const getOfferStmt = db.prepare(`SELECT apply, answer FROM offers WHERE id = ?`);

// 5. Précompilation de la requête d'insertion (DML)
const insertOffer = db.prepare(`
  INSERT INTO offers (id, url, apply, answer) 
  VALUES (@id, @url, 0, 0)
`);

// 6. Définition du schéma de validation Fastify (JSON Schema)
const offerRouteOptions = {
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

// 7. Déclaration de l'Endpoint HTTP POST
fastify.post('/api/offers', offerRouteOptions, async (request, reply) => {
  const { url } = request.body;

  // Évaluation de l'expression régulière
  const match = url.match(/\/(\d+)$/);

  if (!match) {
    return reply.code(400).send({ error: 'Extraction de l\'ID impossible.' });
  }

  const extractedId = parseInt(match[1], 10);

  try {
    // Exécution de la transaction d'insertion (I/O sur disque)
    insertOffer.run({ id: extractedId, url: url });

    return reply.code(201).send({ id: extractedId, status: 'created' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return reply.code(409).send({ error: 'Violation de contrainte: Cet ID existe déjà dans la base.' });
    }

    fastify.log.error(error);
    return reply.code(500).send({ error: 'Erreur interne lors de l\'opération d\'entrée/sortie SQL.' });
  }
});





// 1. Définition du schéma JSON pour la validation des Query Parameters et de la réponse
const getOffersRouteOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        // Fastify appliquera une coercition de type automatique :
        // les chaînes 'true'/'false' seront transformées en primitives booléennes.
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
            // Les booléens SQLite étant stockés comme entiers (0/1),
            // le schéma de sortie doit refléter ce typage strict.
            apply: { type: 'integer' },
            answer: { type: 'integer' }
          }
        }
      }
    }
  }
};

// 2. Déclaration du point d'accès en lecture (Endpoint HTTP GET)
fastify.get('/api/offers', getOffersRouteOptions, async (request, reply) => {
  const { apply, answer } = request.query;

  // 3. Construction dynamique de l'instruction SQL (DQL)
  let sql = 'SELECT * FROM offers WHERE 1=1';
  const params = {};

  // Évaluation des conditions et mapping des variables de liaison (Bind Variables)
  if (apply !== undefined) {
    sql += ' AND apply = @apply';
    // Translation : Booléen V8 vers Integer SQLite
    params.apply = apply ? 1 : 0;
  }

  if (answer !== undefined) {
    sql += ' AND answer = @answer';
    params.answer = answer ? 1 : 0;
  }

  try {
    // 4. Précompilation et exécution de la requête
    const stmt = db.prepare(sql);

    // L'instruction stmt.all() exécute la requête et charge l'intégralité 
    // du result set dans la mémoire du processus Node.js sous forme de tableau.
    const rows = stmt.all(params);

    // 5. Sérialisation de la charge utile (Payload) JSON
    return reply.code(200).send(rows);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Erreur interne lors de l\'opération de lecture SQL.' });
  }
});





// Définition du schéma JSON pour l'opération PATCH
const patchOfferRouteOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' }
      }
    },
    body: {
      type: 'object',
      // Au moins un des deux champs doit être présent dans la charge utile (Payload)
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

// Instanciation du point d'accès pour la mutation partielle
fastify.patch('/api/offers/:id', patchOfferRouteOptions, async (request, reply) => {
  const { id } = request.params;
  const { apply, answer } = request.body;

  try {
    // 1. Extraction de l'état actuel de la ressource (Verrouillage en lecture implicite)
    const currentRecord = getOfferStmt.get(id);

    if (!currentRecord) {
      return reply.code(404).send({ error: 'Ressource non identifiée.' });
    }

    // 2. Résolution conditionnelle des états (Coalescence logique)
    // Translation des types booléens du moteur V8 vers les entiers SQLite (1/0)
    const newApply = apply !== undefined ? (apply ? 1 : 0) : currentRecord.apply;
    const newAnswer = answer !== undefined ? (answer ? 1 : 0) : currentRecord.answer;

    // 3. Exécution synchrone de la transaction d'écriture (I/O)
    updateOfferStmt.run({ id: id, apply: newApply, answer: newAnswer });

    return reply.code(200).send({ id: id, status: 'updated' });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Exception lors de l\'opération d\'entrée/sortie SQL.' });
  }
});





// Définition du schéma JSON pour la validation des paramètres d'URL et de la réponse
const getSingleOfferRouteOptions = {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' }
      }
    },
    response: {
      // Définition de la charge utile (Payload) en cas de succès
      200: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          url: { type: 'string' },
          apply: { type: 'integer' },
          answer: { type: 'integer' }
        }
      },
      // Définition de la charge utile en cas d'échec de résolution de la ressource
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

// Instanciation du point d'accès en lecture ciblée
fastify.get('/api/offers/:id', getSingleOfferRouteOptions, async (request, reply) => {
  // L'intergiciel de Fastify a déjà effectué la coercition du paramètre :id en entier
  const { id } = request.params;

  try {
    // Exécution synchrone de l'instruction préparée
    const record = getSingleOfferFullStmt.get({ id: id });

    // Évaluation de l'existence de l'enregistrement dans le result set
    if (!record) {
      return reply.code(404).send({ error: 'Offre introuvable.' });
    }

    // Sérialisation et transmission des données
    return reply.code(200).send(record);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Exception lors de l\'opération de lecture SQL.' });
  }
});





// 8. Instanciation du socket réseau
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();