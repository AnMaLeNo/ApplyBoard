import Fastify from 'fastify';
import cors from '@fastify/cors';

import { initDB } from './db/init.js';
import authPlugin from './plugins/authenticate.js';
import authRoutes from './routes/auth.js';
import offerRoutes from './routes/offers.js';
import cvDocumentRoutes from './routes/cvDocument.js';

const fastify = Fastify({
  logger: true,
  // Surface les propriétés inconnues plutôt que de les stripper silencieusement,
  // pour que `additionalProperties: false` du schéma cvDocument soit honoré.
  ajv: { customOptions: { removeAdditional: false } },
});

await fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
});

const startServer = async () => {
  try {
    await initDB();

    await fastify.register(authPlugin);

    await fastify.register(authRoutes);
    await fastify.register(offerRoutes);
    await fastify.register(cvDocumentRoutes);

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
