import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

async function authPlugin(fastify, opts) {
    fastify.register(fastifyCookie);

    fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'default_fallback_secret_key_change_in_prod',
    cookie: {
        cookieName: 'authToken',
        signed: false
    }
    });

    fastify.decorate("authenticate", async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.code(401).send({ error: "Défaut d'authentification. Jeton JWT manquant ou invalide." });
    }
    });
}

export default fp(authPlugin);