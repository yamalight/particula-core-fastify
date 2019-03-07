/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const {setup} = require('particula');

// test routes
const indexRoute = require('./fixtures/routes/index');
const es6Route = require('./fixtures/routes/es6');
const methodsRoute = require('./fixtures/routes/methods');
const routerRoute = require('./fixtures/routes/router');
const nestedIndexRoute = require('./fixtures/routes/nested/index');
const nestedRoute = require('./fixtures/routes/nested/nest');

// create app and setup routes
let app;
beforeAll(async () => {
  app = await setup();
});

test('Should load basic route', async done => {
  const res = await app.inject({
    method: 'GET',
    url: '/',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('ok');

  expect(indexRoute).toBeCalled();

  done();
});

test('Should load es6 route', async done => {
  const res = await app.inject({
    method: 'GET',
    url: '/es6',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('ok');

  expect(es6Route.default).toBeCalled();

  done();
});

test('Should load router route', async done => {
  const res = await app.inject({
    method: 'GET',
    url: '/router',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('router');

  expect(routerRoute.useRouter).toBeCalled();

  done();
});

test('Should load methods from route', async done => {
  const res = await app.inject({
    method: 'GET',
    url: '/methods',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('get');
  expect(methodsRoute.get).toBeCalled();

  const postRes = await app.inject({
    method: 'POST',
    url: '/methods',
    payload: {},
  });
  expect(postRes.statusCode).toEqual(200);
  expect(postRes.body).toEqual('post');
  expect(methodsRoute.post).toBeCalled();

  const putRes = await app.inject({
    method: 'PUT',
    url: '/methods',
    payload: {},
  });
  expect(putRes.statusCode).toEqual(200);
  expect(putRes.body).toEqual('put');
  expect(methodsRoute.put).toBeCalled();

  const delRes = await app.inject({
    method: 'DELETE',
    url: '/methods',
    payload: {},
  });
  expect(delRes.statusCode).toEqual(200);
  expect(delRes.body).toEqual('delete');
  expect(methodsRoute.delete).toBeCalled();

  done();
});

test('Should load nested index route', async done => {
  const res = await app.inject({
    method: 'GET',
    url: '/nested/',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('nested');

  expect(nestedIndexRoute).toBeCalled();

  done();
});

test('Should load nested route', async done => {
  const res = await app.inject({
    method: 'GET',
    url: '/nested/nest',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('nest');

  expect(nestedRoute).toBeCalled();

  done();
});
