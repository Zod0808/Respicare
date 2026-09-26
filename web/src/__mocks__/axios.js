const buildClient = () => {
  const client = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    head: jest.fn(() => Promise.resolve({ data: {} })),
    options: jest.fn(() => Promise.resolve({ data: {} })),
    request: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(() => 0), eject: jest.fn() },
      response: { use: jest.fn(() => 0), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return client;
};

const axiosMock = buildClient();
axiosMock.create = jest.fn(() => buildClient());
axiosMock.CancelToken = {
  source: () => ({ token: {}, cancel: jest.fn() }),
};
axiosMock.isCancel = jest.fn(() => false);
axiosMock.isAxiosError = jest.fn(() => false);
axiosMock.all = jest.fn((promises) => Promise.all(promises));
axiosMock.spread = jest.fn((fn) => (arr) => fn.apply(null, arr));

module.exports = axiosMock;
module.exports.default = axiosMock;
