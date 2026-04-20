const TabulatorMock = jest.fn().mockImplementation(() => ({}));

TabulatorMock.registerModule = jest.fn();

module.exports = {
  Tabulator: TabulatorMock,
  default: TabulatorMock,
};
