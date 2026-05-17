--
-- PostgreSQL database dump
--

\restrict iAb51xRHesd2mnweO19eky3dpxFfjii8DE7VPAUBbvGeh3GMN5Vjxj8Bp5XVmB4

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_offers DROP CONSTRAINT IF EXISTS user_offers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_offers DROP CONSTRAINT IF EXISTS user_offers_offer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cv_documents DROP CONSTRAINT IF EXISTS cv_documents_user_id_fkey;
DROP INDEX IF EXISTS public.idx_offers_created_at;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_offers DROP CONSTRAINT IF EXISTS user_offers_pkey;
ALTER TABLE IF EXISTS ONLY public.offers DROP CONSTRAINT IF EXISTS offers_url_key;
ALTER TABLE IF EXISTS ONLY public.offers DROP CONSTRAINT IF EXISTS offers_pkey;
ALTER TABLE IF EXISTS ONLY public.cv_documents DROP CONSTRAINT IF EXISTS cv_documents_user_id_key;
ALTER TABLE IF EXISTS ONLY public.cv_documents DROP CONSTRAINT IF EXISTS cv_documents_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cv_documents ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_offers;
DROP TABLE IF EXISTS public.offers;
DROP SEQUENCE IF EXISTS public.cv_documents_id_seq;
DROP TABLE IF EXISTS public.cv_documents;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cv_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cv_documents (
    id integer NOT NULL,
    user_id integer NOT NULL,
    data jsonb DEFAULT '{"cv": {"title": {"variants": []}, "skills": {"items": []}, "summary": {"variants": []}, "projects": {}, "education": {}, "interests": {"items": []}, "hackathons": {}}}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: cv_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cv_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cv_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cv_documents_id_seq OWNED BY public.cv_documents.id;


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    url text NOT NULL,
    title character varying(255),
    company character varying(255),
    short_description text,
    full_description text,
    salary character varying(255),
    contract_type character varying(255),
    email character varying(255),
    address text,
    availability character varying(255),
    campus character varying(255),
    expertises character varying(255),
    target character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_offers (
    user_id integer NOT NULL,
    offer_id integer NOT NULL,
    apply boolean DEFAULT false,
    answer boolean DEFAULT false
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cv_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cv_documents ALTER COLUMN id SET DEFAULT nextval('public.cv_documents_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cv_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cv_documents (id, user_id, data, created_at, updated_at) FROM stdin;
6	1	{"cv": {"title": {"variants": ["Développeur Fullstack orienté IA et systèmes temps réel", "Développeur Backend / Fullstack Node.js, Python et PostgreSQL", "Ingénieur logiciel junior orienté produits web, automatisation et infrastructure", "Développeur systèmes et web issu du cursus 42", "Fullstack Developer spécialisé React, Fastify, Docker et IA appliquée", "Développeur logiciel orienté backend, réseau et architectures distribuées"]}, "skills": {"items": ["React", "C", "C++98", "Python", "JavaScript", "TypeScript", "Bash", "SQL", "React 19", "Vite", "Tailwind CSS", "Zustand", "Fastify", "Node.js", "FastAPI", "PostgreSQL", "MariaDB", "Qdrant", "Parquet", "Docker", "Docker Compose", "NGINX", "Traefik", "WebSockets", "TCP/IP", "Sockets", "poll", "MQTT", "Eclipse Mosquitto", "ESP8266", "Arduino", "PlatformIO", "OpenAI API", "LLM", "Embeddings", "BAAI/bge-m3", "Recherche vectorielle", "AHP", "TOPSIS", "Lissage bayésien", "Pthreads", "Mutex", "Concurrence", "Processus Unix", "File descriptors", "Pipes", "Signaux Unix", "Parsing", "Raycasting", "miniLibX", "Git", "OAuth 2.0", "i18n", "Chrome Extension Manifest V3", "Discord Webhooks", "Linux", "XDG Autostart", "Rust"]}, "summary": {"variants": ["Étudiant à 42 Paris, je recherche un stage de 4 à 6 mois à partir de mai 2026 (date\\nflexible) ou une alternance d’un an en développement full-stack. Je m’intéresse\\nparticulièrement à l’IA appliquée, à l’automatisation et aux architectures web\\nmodernes.", "Développeur fullstack issu de l'École 42, avec une expérience projet couvrant React, Fastify, PostgreSQL, Docker, WebSockets et intégration IA. J'aime transformer des besoins concrets en systèmes fiables, testables et déployables.", "Profil backend/fullstack orienté produit, capable de concevoir des APIs, structurer des bases de données, intégrer des services temps réel et industrialiser des environnements Dockerisés.", "Développeur logiciel junior avec un socle solide en programmation système C/C++, réseau, concurrence et web moderne. Expérience sur des projets exigeants : shell Unix, serveur IRC, moteur raycasting, microservices et routage IA.", "Je construis des outils pragmatiques mêlant automatisation, IA appliquée et architecture distribuée, avec une attention particulière à la robustesse, la clarté du code et l'expérience utilisateur.", "Expérience pratique sur des stacks modernes React/TypeScript, Node.js/Fastify, Python/FastAPI, PostgreSQL, Docker et WebSockets, complétée par des projets système bas niveau du cursus 42.", "Développeur autonome et curieux, habitué à apprendre vite, documenter mes choix techniques et itérer sur des architectures allant du firmware IoT aux plateformes web temps réel."]}, "projects": {"project-cub3d": {"title": {"variants": ["cub3D - moteur raycasting en C", "cub3D - rendu 3D temps réel avec miniLibX", "Moteur graphique inspiré de Wolfenstein en C"]}, "description": {"variants": ["Développement en C d'un moteur de rendu 3D inspiré de Wolfenstein, basé sur le raycasting et la bibliothèque miniLibX.\\nCréation d'un affichage en perspective à la première personne dans un labyrinthe, avec textures de murs différenciées selon l'orientation.\\nImplémentation des déplacements clavier, de la rotation de caméra et de la fermeture propre de la fenêtre via événements système.\\nConception d'un parser de fichiers .cub validant les textures, les couleurs sol / plafond, la position initiale du joueur et la fermeture complète de la carte.", "Réalisation d'un projet graphique bas niveau en C combinant parsing, mathématiques appliquées et rendu temps réel.\\nUtilisation du raycasting pour calculer la distance aux murs et projeter une scène 3D à partir d'une carte 2D.\\nGestion des ressources miniLibX, des images, des couleurs RGB et des événements clavier afin de maintenir une navigation fluide dans la scène.\\nAjout d'une validation stricte des fichiers de configuration pour retourner des erreurs explicites en cas de carte ouverte ou de paramètres invalides.", "Implémentation d'un moteur visuel minimaliste permettant d'explorer un environnement 3D simulé à partir d'une grille de caractères.\\nTransformation des données de scène .cub en structures exploitables pour le rendu, les collisions de base et la position du joueur.\\nCalcul de la projection des murs colonne par colonne, en tenant compte de l'orientation et des textures associées.\\nTravail sur la robustesse de l'application graphique : gestion mémoire, événements de fenêtre, entrées utilisateur et arrêt propre du programme."]}}, "project-ft-irc": {"title": {"variants": ["ft_irc - serveur IRC en C++98", "Serveur TCP non bloquant compatible client IRC", "ft_irc - protocoles réseau et boucle d'événements"]}, "description": {"variants": ["Développement en C++98 d'un serveur IRC compatible avec un client réel, basé sur des sockets TCP/IP et une boucle d'événements non bloquante.\\nGestion simultanée de plusieurs clients sans fork grâce à poll et à des file descriptors configurés pour éviter les blocages d'entrée/sortie.\\nImplémentation du parcours d'authentification, des pseudos, usernames, salons, messages privés et diffusion des messages de channel.\\nAjout des commandes opérateur KICK, INVITE, TOPIC et MODE avec gestion des rôles, mots de passe de salon, limites d'utilisateurs et salons sur invitation.", "Réalisation d'un serveur réseau bas niveau appliquant les contraintes du protocole IRC dans un environnement C++98 sans bibliothèque externe.\\nConception d'un parser capable d'assembler les commandes reçues partiellement, notamment lorsque les paquets TCP arrivent en plusieurs fragments.\\nMaintien d'un état serveur pour suivre clients connectés, authentification, channels, opérateurs et relations entre utilisateurs.\\nTraitement robuste des erreurs et des cas limites afin que le serveur reste disponible même avec des entrées incomplètes ou invalides.", "Implémentation d'un service IRC multi-clients centré sur la programmation réseau, les protocoles textuels et les entrées/sorties non bloquantes.\\nUtilisation de poll comme point de coordination unique pour accepter les connexions, lire les messages et envoyer les réponses sans bloquer le serveur.\\nCréation des mécanismes de salons publics et privés, avec diffusion aux membres et commandes spécifiques aux opérateurs.\\nRespect des contraintes C++98, compilation stricte et architecture orientée objets pour structurer clients, channels, commandes et réponses serveur."]}}, "project-inception": {"title": {"variants": ["Inception - infrastructure Docker multi-services", "Stack Docker Compose NGINX, WordPress et MariaDB", "Infrastructure système conteneurisée avec TLS et volumes persistants"]}, "description": {"variants": ["Mise en place d'une infrastructure Docker Compose composée de services isolés NGINX, WordPress / php-fpm et MariaDB.\\nÉcriture de Dockerfiles dédiés pour chaque service, sans images applicatives prêtes à l'emploi, afin de maîtriser la construction de l'environnement.\\nConfiguration de NGINX comme point d'entrée unique en HTTPS avec TLSv1.2 / TLSv1.3 et routage vers le service WordPress.\\nGestion de la persistance via volumes Docker nommés pour la base MariaDB et les fichiers WordPress, avec réseau Docker interne entre conteneurs.", "Réalisation d'un projet d'administration système visant à comprendre les bonnes pratiques Docker, réseau et persistance de données.\\nConfiguration d'une stack complète avec MariaDB, WordPress/php-fpm et NGINX, chaque composant exécuté dans son propre conteneur.\\nUtilisation de variables d'environnement et de secrets locaux pour séparer configuration, identifiants et code source.\\nCréation d'un Makefile et d'une structure de projet permettant de construire, démarrer et arrêter l'infrastructure de manière reproductible.", "Développement d'une infrastructure conteneurisée respectant des contraintes strictes de production locale : pas de latest tag, pas de host network et pas de processus artificiels de type sleep infinity.\\nMise en réseau des services avec Docker Compose afin que seul NGINX expose l'application via le port HTTPS.\\nPréparation des volumes persistants dans l'arborescence attendue pour conserver la base de données et les fichiers applicatifs entre redémarrages.\\nDocumentation des choix techniques autour de Docker versus VM, secrets versus variables d'environnement, réseaux Docker et stratégie de stockage."]}}, "project-minishell": {"title": {"variants": ["Minishell - implémentation d'un shell Unix en C", "Shell interactif en C inspiré de Bash", "Minishell - parsing, processus et file descriptors"]}, "description": {"variants": ["Développement en C d'un shell interactif reproduisant les comportements fondamentaux de Bash dans le cadre du cursus 42.\\nImplémentation d'un prompt avec historique, recherche d'exécutables via PATH, lancement de commandes par fork / execve et propagation des statuts de sortie.\\nGestion des redirections, heredocs, pipes et duplications de file descriptors afin de construire des pipelines de commandes fiables.\\nAjout des builtins requis, notamment echo, cd, pwd, export, unset, env et exit, avec une attention portée à la gestion mémoire et aux erreurs système.", "Réalisation d'un interpréteur de commandes Unix en C mettant l'accent sur le parsing, les processus et les interactions bas niveau avec le système.\\nConception d'une logique de traitement des quotes simples et doubles, de l'expansion des variables d'environnement et de la variable spéciale $?.\\nCoordination des processus enfants, des pipes et des redirections pour exécuter des commandes simples ou chaînées de manière conforme au comportement attendu.\\nGestion des signaux interactifs comme Ctrl-C, Ctrl-D et Ctrl-\\\\ afin de rapprocher l'expérience utilisateur de celle d'un shell standard.", "Implémentation d'un mini-shell robuste avec séparation entre analyse syntaxique, préparation de l'exécution et orchestration des processus.\\nTraitement des entrées utilisateur, des chemins relatifs ou absolus, des variables d'environnement et des erreurs d'accès aux fichiers.\\nManipulation précise des file descriptors pour connecter les commandes entre elles et rediriger leurs entrées ou sorties.\\nTravail approfondi sur la stabilité du programme, l'absence de fuites mémoire maîtrisables et la conformité aux contraintes strictes de compilation du projet."]}}, "project-philosophers": {"title": {"variants": ["Philosophers - simulation concurrente en C", "Synchronisation multithread avec pthreads et mutexes", "Philosophers - gestion de concurrence sans data races"]}, "description": {"variants": ["Implémentation en C du problème des philosophes afin de modéliser l'accès concurrent à des ressources partagées.\\nCréation d'un thread par philosophe avec synchronisation des fourchettes via mutexes pour éviter les duplications de ressource et les data races.\\nGestion précise des temporisations time_to_die, time_to_eat et time_to_sleep, avec détection de la mort d'un philosophe dans les délais attendus.\\nSérialisation des logs afin d'empêcher le chevauchement des messages d'état et de conserver une sortie lisible pendant la simulation.", "Développement d'une simulation multithread en C centrée sur les problématiques de concurrence, famine et synchronisation.\\nConception d'un modèle de données partagé protégé par mutexes pour suivre les repas, les états et les conditions d'arrêt globales.\\nImplémentation d'une routine de monitoring capable d'arrêter proprement la simulation lorsqu'un philosophe meurt ou lorsque tous ont assez mangé.\\nTravail sur les cas limites, notamment philosophe unique, faibles temporisations et arrêt coordonné des threads sans comportement indéfini.", "Réalisation d'un programme concurrent bas niveau utilisant pthread_create, pthread_join et pthread_mutex pour coordonner plusieurs routines indépendantes.\\nPrévention des interblocages en contrôlant l'ordre de prise des ressources et la progression des philosophes dans les cycles manger, dormir et penser.\\nMesure des temps en millisecondes avec une attention portée à la précision des événements et à la réactivité du superviseur.\\nValidation du comportement attendu sous contraintes strictes : pas de variables globales, pas de data race et gestion propre de la mémoire allouée."]}}, "project-focus-timebox": {"title": {"variants": ["Focus Timebox - extension anti-procrastination pilotée par IA", "Focus Timebox - surveillance de navigation avec FastAPI et GPT", "Extension Chrome de focus assistée par IA"]}, "description": {"variants": ["Conception d'une application anti-procrastination combinant extension Chrome Manifest V3, backend FastAPI, GPT-3.5 et notifications Discord.\\nDéveloppement d'un mode focus qui surveille les navigations web pendant une tâche active et transmet le contexte visité au serveur d'analyse.\\nExtraction ciblée des informations utiles selon le type de page, notamment titre YouTube, requête Google Search ou balise title d'un site classique.\\nMise en place d'une architecture Docker Compose avec nginx en reverse proxy, service FastAPI d'analyse IA et relais HTTP vers Discord.", "Développement d'une extension Chrome permettant de définir des tâches de concentration, une blocklist et un état de focus persistés dans chrome.storage.local.\\nImplémentation d'un backend FastAPI qui classe chaque navigation comme utile ou distrayante à l'aide d'un appel LLM borné.\\nDéclenchement automatique d'un message Discord lorsqu'une distraction est détectée, via un service relay dédié et un webhook.\\nOrganisation de l'architecture en services séparés afin d'isoler la collecte navigateur, l'analyse IA, le reverse proxy nginx et l'intégration Discord.", "Réalisation d'un outil expérimental de productivité qui transforme l'historique de navigation en signal d'attention exploitable pendant des sessions de travail.\\nCréation d'une logique de préparation de contexte pour distinguer les pages neutres, les recherches utiles et les contenus réellement hors sujet.\\nUtilisation de GPT pour produire un verdict structuré sur la pertinence de la page vis-à-vis de la tâche active.\\nConteneurisation complète du backend et configuration du routage nginx pour simplifier l'installation et l'exécution locale."]}}, "entry-mp4akcgu-yrfhp5y5": {"title": {"variants": ["MatchLLM", "MatchLLM — Routeur sémantique d'IA", "MatchLLM - outil d'aide à la décision IA", "MatchLLM - routeur multicritère de modèles IA"]}, "description": {"variants": ["Développement de MatchLLM, une plateforme qui exploite les données Compar:IA pour recommander le modèle de langage le plus pertinent selon le contenu réel d'un prompt.\\nMise en place d'un pipeline de recherche vectorielle basé sur BAAI/bge-m3, Qdrant et des fichiers Parquet afin de retrouver les conversations historiquement proches d'une requête.\\nCalcul d'un score de récompense à partir des retours utilisateurs, avec lissage bayésien pour limiter les biais liés aux faibles volumes de données.\\nClassement final des LLM par arbitrage multicritère entre performance sémantique, consommation énergétique et souveraineté.", "Réalisation d'un routeur intelligent de LLM capable de transformer une requête utilisateur en recommandation argumentée de modèle IA.\\nConstruction d'une base vectorielle pré-calculée pour éviter les recalculs coûteux d'embeddings et accélérer l'analyse de similarité.\\nAgrégation des signaux humains Compar:IA, positifs comme négatifs, pour évaluer les modèles sur des conversations proches plutôt que sur des moyennes globales.\\nAjout d'un moteur de décision AHP / TOPSIS permettant d'adapter le classement selon les priorités métier, environnementales ou souveraines de l'utilisateur.", "Conception de MatchLLM, un système d'aide à la décision qui analyse sémantiquement une requête utilisateur pour recommander le LLM le plus adapté au besoin.\\nExploitation des données Compar:IA et des réactions utilisateurs afin d'évaluer les modèles sur des conversations historiquement proches du prompt soumis.\\nUtilisation d'embeddings BAAI/bge-m3 et de Qdrant pour effectuer une recherche vectorielle par similarité sur une base pré-calculée.\\nClassement des modèles avec une logique multicritère combinant performance sémantique, consommation énergétique, souveraineté, lissage bayésien, AHP et TOPSIS.", "Création d'un pipeline d'analyse pour rapprocher un prompt utilisateur de conversations similaires issues de Compar:IA et en déduire les modèles ayant fourni les meilleures réponses.\\nFusion de données Parquet contenant les embeddings, les conversations et les réactions humaines afin de construire une base vectorielle exploitable par Qdrant.\\nCalcul d'un score de récompense sémantique pondéré par les signaux positifs et négatifs des utilisateurs, avec lissage bayésien pour éviter les résultats extrêmes.\\nAjout d'un arbitrage AHP / TOPSIS pour adapter la recommandation finale aux priorités de performance, d'énergie et de souveraineté."]}}, "project-goinfre-auto-setup": {"title": {"variants": ["Goinfre Auto-Setup Daemon - automatisation d'environnement 42", "CLI Bash de provisioning pour environnements Linux contraints", "Automatisation Rust et VS Code sur partition goinfre"]}, "description": {"variants": ["Conception d'un utilitaire Bash destiné aux environnements 42 où le répertoire HOME est fortement limité en espace disque.\\nRedirection des installations lourdes vers la partition locale goinfre, notamment les toolchains Rust via RUSTUP_HOME / CARGO_HOME et les extensions VS Code via liens symboliques.\\nGénération d'entrées XDG Autostart pour restaurer automatiquement l'environnement de développement à chaque ouverture de session.\\nAjout d'une logique idempotente basée sur manifeste afin de réinstaller uniquement les dépendances manquantes et de limiter les opérations réseau inutiles.", "Développement d'un daemon de provisioning Linux permettant de rendre un environnement de développement persistant malgré un stockage local volatile.\\nImplémentation d'un mécanisme de polling sécurisé avec timeout pour attendre la disponibilité de goinfre sans bloquer indéfiniment la session utilisateur.\\nAutomatisation de la configuration shell, des variables d'environnement Rust et des chemins d'extensions VS Code.\\nConception d'un système sans dépendance externe, reposant sur Bash, les outils UNIX natifs, les fichiers desktop XDG et des symlinks contrôlés.", "Réalisation d'un outil CLI pour préparer automatiquement un poste de développement dans un environnement scolaire à quotas stricts.\\nDéplacement transparent des composants volumineux hors du HOME afin d'éviter la saturation du profil itinérant.\\nSynchronisation de l'état attendu des extensions VS Code à partir d'un manifeste utilisateur, avec réconciliation au démarrage.\\nMise en place d'une approche robuste et répétable, adaptée à des machines partagées où le stockage local peut disparaître entre deux sessions."]}}, "project-pc-power-controller": {"title": {"variants": ["PC Power Controller - contrôle IoT d'alimentation PC", "Système IoT de commande électrique via MQTT", "Contrôle distant d'un PC avec ESP8266, MQTT et Fastify"]}, "description": {"variants": ["Conception d'un système IoT permettant d'allumer, d'éteindre ou de forcer l'arrêt d'un PC fixe à distance en simulant une pression physique sur le bouton d'alimentation.\\nDéveloppement d'une API Node.js / Fastify qui valide les commandes HTTP puis les publie sur un topic MQTT dédié.\\nIntégration d'un broker Eclipse Mosquitto pour assurer une communication légère et quasi temps réel entre le backend et le microcontrôleur.\\nImplémentation du firmware ESP8266 en C++ / Arduino avec PlatformIO, incluant la gestion des impulsions courtes et longues envoyées à la carte mère.", "Réalisation d'une architecture distribuée reliant une API web, un broker MQTT et un ESP8266 connecté au circuit d'alimentation d'un PC.\\nUtilisation d'un optocoupleur afin d'isoler électriquement le microcontrôleur du circuit de la carte mère et de sécuriser la commande physique.\\nDéfinition de commandes différenciées pour appui court et appui long, avec durées d'impulsion adaptées aux comportements d'allumage et d'arrêt forcé.\\nConteneurisation du backend et du broker MQTT avec Docker Compose pour faciliter le déploiement sur un serveur local ou un Raspberry Pi.", "Développement d'un contrôleur IoT complet pour transformer une action matérielle locale en commande réseau fiable.\\nMise en place d'un backend Fastify exposant une API REST simple et robuste, connectée à Mosquitto pour la diffusion des ordres.\\nProgrammation d'un ESP8266 abonné au topic MQTT afin de déclencher précisément la broche reliée au circuit de démarrage du PC.\\nStructuration du projet autour de composants indépendants, permettant de séparer logique applicative, messagerie temps réel et interaction matérielle."]}}, "project-ft-transcendence-backend": {"title": {"variants": ["ft_transcendence - backend temps réel et architecture microservices", "ft_transcendence - lead backend sur application Pong multijoueur", "Backend Fastify, WebSockets et PostgreSQL pour jeu temps réel"]}, "description": {"variants": ["Pilotage technique du backend de ft_transcendence, une application web permettant de jouer à Pong en temps réel avec profils, amis, chat et invitations.\\nConception d'une architecture microservices séparant authentification, chat et moteur de jeu, exposée via Traefik et déployée avec Docker Compose.\\nDéveloppement des APIs Fastify, du modèle PostgreSQL et des flux WebSocket nécessaires aux matchs, aux notifications et aux interactions temps réel.\\nImplémentation d'un moteur Pong server-authoritative avec tick rate fixe afin de garantir une simulation cohérente entre joueurs distants.", "Réalisation du socle backend d'une SPA multijoueur construite autour de services Node.js / Fastify, WebSockets et PostgreSQL.\\nDéfinition de l'architecture de données pour gérer utilisateurs, matchs, relations sociales et messages directs.\\nMise en place d'une logique de matchmaking, de défis directs et de synchronisation de l'état de jeu pour des parties Pong en ligne.\\nPrise de rôle de technical lead sur les choix d'architecture, la séparation des domaines backend et la cohérence de l'intégration Docker / Traefik.", "Développement d'un backend temps réel pour un jeu Pong multijoueur avec authentification, lobby, historique de matchs et fonctionnalités sociales.\\nCréation de services spécialisés auth-api, chat-api et game-api afin de limiter le couplage entre identité, messagerie et logique de gameplay.\\nUtilisation des WebSockets pour diffuser les états de jeu, router les messages et transmettre les notifications sans polling côté client.\\nConception d'une logique de jeu côté serveur pour éviter les divergences de simulation et conserver une source de vérité unique pendant les matchs."]}}}, "education": {"education-42": {"title": {"variants": ["École 42 - formation développeur logiciel", "Cursus 42 - programmation système, web et infrastructure", "Formation intensive en informatique à l'École 42"]}, "description": {"variants": ["Formation par projets centrée sur l'autonomie, la revue par les pairs et la résolution de problèmes concrets en C, C++, web, réseau, infrastructure et bases de données.", "Réalisation de projets exigeants couvrant programmation système, concurrence, parsing, rendu graphique, sockets réseau, Docker, backend web et temps réel.", "Développement d'une méthode de travail orientée apprentissage autonome, debugging, peer review, documentation technique et amélioration continue."]}}}, "interests": {"items": ["Intelligence artificielle appliquée", "Automatisation d'environnements de développement", "Systèmes distribués", "Programmation système", "Réseau et protocoles", "Applications temps réel", "IoT", "Optimisation énergétique des modèles IA"]}, "hackathons": {}}}	2026-05-13 16:30:33.272349+00	2026-05-17 16:03:30.650982+00
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offers (id, url, title, company, short_description, full_description, salary, contract_type, email, address, availability, campus, expertises, target, created_at) FROM stdin;
27458	https://companies.intra.42.fr/en/offers/27458	Développeur Web Fullstack en STARTUP	Histia	Se former sur des technologies web et projets avec dvp Full-Stack, architecture de base de données, expérience utilisateur (UX/UI)	STAGE - Développeur Web Fullstack en STARTUP - H/F\nÀ propos d’Histia\nFondée fin 2023, Histia est une jeune pousse en Intelligence Artificielle incubée à CentraleSupélec et\nHEC Paris (Station F) depuis début 2024.\nNous développons un outil SaaS qui permet aux fonds d’investissement et aux banques d’analyser\nn'importe quelle entreprise (structure capitalistique, marché, réputation, etc.) en quelques minutes\npour accélérer et dérisquer leurs processus d’investissement, grâce à notre technologie propriétaire\nde traitement de données et d'IA.\n●\nNote site : https://histia.net\nContexte de l’offre\nHistia est en pleine croissance commerciale, et nous sommes sur le point de sécuriser plusieurs gros\nclients. Pour accompagner cette croissance, la scalabilité et l'ergonomie de notre plateforme web\nsont cruciales.\nNous cherchons donc à agrandir notre équipe technique et souhaitons pour cela recruter un stagiaire\nqui travaillera sur le développement de notre application web. En collaboration directe avec les\nfondateurs et l'équipe IA, vous contribuerez à améliorer l'expérience utilisateur, à développer de\nnouvelles fonctionnalités et à garantir la robustesse de notre plateforme.\nRejoindre une jeune-pousse comme Histia, c'est une formidable opportunité :\n●\nDe se former sur des technologies web modernes (Next.js, TypeScript, Prisma) et de travailler\nsur un produit à forte valeur ajoutée.\n●\nDe laisser la part belle à sa créativité dans un environnement très libre.\n●\nDe se forger une vision panoramique en travaillant sur des projets qui mêlent\ndéveloppement Full-Stack, architecture de base de données, expérience utilisateur (UX/UI),\net bien sûr l'intégration avec nos services d'IA.\n●\nDe découvrir la structure d'une jeune entreprise, et comment le travail des ingénieurs et\ndéveloppeurs s'intègre dans les décisions des autres secteurs : financier, commercial,\njuridique, etc.\n●\nET SURTOUT de participer à la croissance d'une belle entreprise en faisant partie des\npremiers à rejoindre une grande aventure !\nMissions\n●\n●\n●\n●\nDévelopper de nouvelles fonctionnalités front-end avec Next.js et TypeScript en suivant les\nmaquettes UI/UX réalisées par l’équipe des graphistes.\nAméliorer l'interface et l'expérience utilisateur (UI/UX) de notre plateforme.\nParticiper au développement back-end de l'application : gestion de la base de données\n(PostgreSQL avec Prisma), création et maintenance des routes d'API, etc.\nAssurer la bonne communication entre le front-end et les services internes.\n1\n●\n●\nTravailler en synergie avec l’équipe IA pour explorer, intégrer et exploiter des modèles\nd’intelligence artificielle. Et co-construire des fonctionnalités IA innovantes pour le produit.\nParticiper à la revue de code et à l'amélioration continue de notre stack technique.\nProfil recherché\n●\nÉtudiant en école d'ingénieur ou d'informatique, avec une spécialisation en développement\nweb/logiciel.\n●\nConnaissance de l'écosystème JavaScript/TypeScript.\n●\nUne première expérience (projets personnels ou académiques) avec Next.js ou React.\n●\nConnaissance des principes de base des API REST et de la gestion de base de données (une\nexpérience avec Prisma et PostgreSQL est un gros plus).\n●\nConnaissance des Broker Messages (RabbitMQ, Kafka)\n●\nBonne connaissance de Git et des pratiques de développement collaboratif.\n●\nCuriosité pour le développement Full-Stack et les architectures web modernes (Clean\nArchitecture, FSD)\n●\nConnaissance de la conteneurisation (Docker, Kubernetes, Docker compose, etc.)\n●\nAtout apprécié mais optionnel : Connaissance des bibliothèques web (React Hook Form,\nTanstack Query, Zustand)\nQualités personnelles\n●\nAutonomie et rigueur;\n●\nCapacité d'adaptation;\n●\nAptitude au travail en équipe, bonne organisation et bonne communication;\n●\nPrise d'initiative;\n●\nVraie curiosité et passion pour les thématiques technologiques mentionnées précédemment;\nConditions\n●\n●\n●\nDurée : Stage de 6 mois\nDate de début : à compter de juillet 2026 (date flexible)\nLieu : Station F à Paris, possibilité de télétravail\nContact\nSi notre offre vous intéresse, ou si vous souhaitez en savoir plus, contactez nous à l’adresse suivante :\ncontact@histia.net	630	Internship	contact@histia.net	5 Parvis Alan Turing, Paris, 75013, France	Between 2026-05-14 and 2026-06-11	Paris	\N	I wish to share this offer with both students and alumni.	2026-05-17 12:50:44.586395+00
27454	https://companies.intra.42.fr/en/offers/27454	Software Engineering Intern	Boston Consulting Group	Kickstart your career as a Software Engineering Intern at BCG X Delivery Casablanca: 6 months, real projects & hands-on impact.	We’re a diverse team of more than 3,000 tech experts united by a drive to make a difference. Working across industries and disciplines, we combine our experience and expertise to tackle the biggest challenges faced by society today. We go beyond what was once thought possible, creating new and innovative solutions to the world’s most complex problems. Leveraging BCG’s global network and partnerships with leading organizations, BCG X provides a stable ecosystem for talent to build game-changing businesses, products, and services from the ground up, all while growing their career. Together, we strive to create solutions that will positively impact the lives of millions.\n\nWhat You'll Do\n\nAs a Software Engineering Intern at BCG X Delivery, you will:\n\n•Take part in a six-month internship immersed in real project\n\n•Support consulting and product teams in designing, building, and delivering technology solutions that create measurable client impact\n\n•Work alongside experienced engineers and consultants, contributing to real project work\n\n•Gain hands-on exposure to modern engineering practices across the software development lifecycle\n\n•Participate in translating business needs into technical requirements and scalable solutions\n\n•Contribute to building secure, high-quality, and maintainable software components\n\n•Apply clean code principles, testing practices, and modern development standards with guidance from senior team members\n\n• Collaborate within multidisciplinary teams and communicate effectively with stakeholders\n\nWhat You'll Bring\n\nEducation:\n\n\n•Students &amp; recent graduates seeking an internship, are eligible for this role.\n\nCore Technical Skills (Must-Haves): \n\nYou should have practical experience or strong foundational knowledge in at least one area of modern web application development. Experience in multiple areas is a plus, but not required.\n\n• Backend (one or more): Python (Flask, Django, FastAPI), Node.js (NestJS, Express), Java/Spring Boot, .NET\n\n• Frontend (one or more): React, Vue.js, Angular\n\n• Databases (one or more): Postgres, MariaDB, MySQL\n\nSolid understanding of:\n\n• Clean code, OOP, design patterns\n\n• RESTful API design\n\n• UI libraries (Material UI, Ant Design, Bootstrap)\n\n• Unit testing: Mocha, Jest, Jasmine\n\n• Integrating UI with REST APIs\n\n• Git and version-control workflows\n\nAdditional Skills (Nice-to-Haves):\n\nExposure to any of the following is beneficial, but not required:\n\n• Linux, shell scripting\n\n• Docker, Kubernetes, Terraform\n\n• Microservices\n\n• AWS, Azure, GCP\n\n• CI/CD tooling\n\n• NoSQL databases\n\n• Mobile development\n\n• Data visualization libraries\n\n• Wireframing basics\n\nProblem Solving Skills:\n\n• Clearly define a scope and structure problems thoughtfully\n\n• Select appropriate methodologies\n\n• Demonstrate resilience and adaptability\n \nCommunication &amp; Precision:\n\n•Communicate clearly in English (French is a plus) and explain technical concepts confidently and fluently.	N/A	Internship	bouziani.ghita@bcg.com	CFC Cube Tower Lot 65.1, Avenue Mainstreet, Quartier Casa Anfa, Hay Hassani, Casablanca, 20250, Morocco	Between 2026-05-12 and 2026-10-01	Paris	Java, JavaScript, Node.js, Python, React, Angular, and TypeScript	I wish to share this offer with both students and alumni.	2026-05-17 13:37:51.97224+00
\.


--
-- Data for Name: user_offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_offers (user_id, offer_id, apply, answer) FROM stdin;
1	27458	f	f
1	27454	f	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash) FROM stdin;
1	aaa@gmail.com	$2b$10$vOYshAIC8SN0J.G4MLfkyOXXWgTzQEGGeCyYrK20ODZ06AhtgGU1C
\.


--
-- Name: cv_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cv_documents_id_seq', 445, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: cv_documents cv_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cv_documents
    ADD CONSTRAINT cv_documents_pkey PRIMARY KEY (id);


--
-- Name: cv_documents cv_documents_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cv_documents
    ADD CONSTRAINT cv_documents_user_id_key UNIQUE (user_id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: offers offers_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_url_key UNIQUE (url);


--
-- Name: user_offers user_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_offers
    ADD CONSTRAINT user_offers_pkey PRIMARY KEY (user_id, offer_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_offers_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_created_at ON public.offers USING btree (created_at DESC);


--
-- Name: cv_documents cv_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cv_documents
    ADD CONSTRAINT cv_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_offers user_offers_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_offers
    ADD CONSTRAINT user_offers_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- Name: user_offers user_offers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_offers
    ADD CONSTRAINT user_offers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict iAb51xRHesd2mnweO19eky3dpxFfjii8DE7VPAUBbvGeh3GMN5Vjxj8Bp5XVmB4

