/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const {setup} = require('particula');

let app;
beforeAll(async () => {
  app = await setup();
});

test('Should handle 404', async done => {
  const res = await app.inject({
    method: 'get',
    url: '/404',
  });

  expect(res.statusCode).toEqual(404);
  expect(res.body).toEqual('Route /404 Not found.');

  done();
});

test('Should throw errors', async done => {
  try {
    await app.inject({
      method: 'get',
      url: '/throw',
    });
  } catch (e) {
    expect(e).toBeDefined();
    expect(e.message).toEqual('test error');
  }

  done();
});
