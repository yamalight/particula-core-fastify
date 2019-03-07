const fastify = require('fastify');

// init fastify app
const app = fastify();

// core metadata
exports.server = app;
exports.name = 'particula-core-fastify';

// setup scripts
exports.setup = () => {
  return app;
};

// plugin setup script
exports.setupPlugin = async plugin => {
  const pluginData = await plugin.setup(app);
  app.decorate(plugin.name, pluginData);
};
exports.postsetupPlugin = plugin => plugin.postsetup(app);

exports.setupMiddleware = async middlewareHandler => {
  await app.use(middlewareHandler);
};

// postsetup script
exports.postSetup = async () => {
  // Handle 404
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send(`Route ${req.raw.url} Not found.`);
  });

  // Handle 500
  app.setErrorHandler((error, req, reply) => {
    const {statusCode} = error;
    reply.code(500).send(`${statusCode}: Internal Server Error`);
  });

  return app;
};

// start scripts
exports.start = async (port = 8080) => {
  await app.ready();
  app.listen(port, () => console.log(`Started at ${port}`));
};

/**
 * Routes handling
 */

// stored map of routes and corresponding routers
// used for hot swapping the modules in development
const routesMap = {};

// dummy router that does nothing
// user for failed route init and deleted routes
const dummyRouter = (instance, opts, next) => next();

// (re-)registers routes on the app when needed
const registerRoutes = app => {
  Object.keys(routesMap).forEach(route => {
    // skip already registered routes
    if (routesMap[route].register) {
      return;
    }
    // create new register function, indicates that route has been registered
    routesMap[route].register = (instance, opts, next) => routesMap[route].router(instance, opts, next);
    // use register function in server
    app.register(routesMap[route].register);
  });
};

// loads given file into router
exports.applyFile = ({routeName, filePath}) => {
  const routeHandler = require(filePath);

  if (typeof routeHandler.default === 'function') {
    app.get(routeName, routeHandler.default);
    return;
  }

  if (typeof routeHandler === 'function') {
    app.get(routeName, routeHandler);
    return;
  }

  if (routeHandler.useRouter && typeof routeHandler.useRouter === 'function') {
    app.register((instance, opts, next) => {
      routeHandler.useRouter(instance);
      next();
    });
    return;
  }

  const allowedMethods = ['put', 'get', 'post', 'delete'];
  const methods = Object.keys(routeHandler);
  if (!methods.some(method => allowedMethods.includes(method))) {
    throw new Error(`Route definition doesn't match possible formats`);
  }

  methods.forEach(method => {
    app[method](routeName, routeHandler[method]);
  });
};

// loads given file into router
const loadRoute = ({routeName, routeHandler, filePath, routeType}) => {
  if (routeType === 'esm') {
    return (instance, o, next) => {
      instance.get(routeName, routeHandler.default);
      next();
    };
  }

  if (routeType === 'module') {
    return (instance, o, next) => {
      instance.get(routeName, routeHandler);
      next();
    };
  }

  if (routeType === 'router') {
    return (instance, o, next) => {
      routeHandler.useRouter(instance);
      next();
    };
  }

  if (routeType === 'methods') {
    return (instance, o, next) => {
      Object.keys(routeHandler).forEach(method => {
        instance[method](routeName, routeHandler[method]);
      });
      next();
    };
  }
};

exports.loadRoutes = routes => {
  // load routes into memory
  for (const route of routes) {
    const router = loadRoute(route);
    routesMap[route.routeName] = {router, register: undefined};
  }

  // add routes to express
  registerRoutes(app);
};
