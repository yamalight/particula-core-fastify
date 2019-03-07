/* eslint-env jest */
const path = require('path');
jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'fixtures'));

const {setup} = require('particula');
const mockMiddleware = require('./fixtures/middlewares/mock');

test('Should load middlewares', async done => {
  const app = await setup();

  const res = await app.inject({
    method: 'GET',
    url: '/',
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual('ok');

  expect(mockMiddleware).toBeCalled();

  done();
});
