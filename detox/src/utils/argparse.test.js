jest.unmock('process');

describe('argparse', () => {
  describe('getArgValue()', () => {
    describe('using env variables', () => {
      let _env;
      let argparse;

      beforeEach(() => {
        _env = process.env;

        process.env = {
          ..._env,
          fooBar: 'legacy env format',
          DETOX_FOO_BAR: 'new env format',
          testUndefinedProp: 'undefined',
        };

        argparse = require('./argparse');
      });

      afterEach(() => {
        process.env = _env;
      });

      it(`nonexistent key should return undefined`, () => {
        expect(argparse.getArgValue('blah')).not.toBeDefined();
      });

      it(`existing key should return DETOX_SNAKE_FORMAT value first`, () => {
        expect(argparse.getArgValue('foo-bar')).toBe('new env format');
      });

      it(`existing key should return legacyCamelFormat value if there is no DETOX_SNAKE_FORMAT`, () => {
        delete process.env.DETOX_FOO_BAR;
        expect(argparse.getArgValue('foo-bar')).toBe('legacy env format');
      });

      it('should return undefined if process.env contain something with a string of undefined' ,() => {
        expect(argparse.getArgValue('testUndefinedProp')).toBe(undefined);
      });
    });

    describe('using arguments', () => {
      let argparse;

      beforeEach(() => {
        jest.mock('minimist');
        const minimist = require('minimist');
        minimist.mockReturnValue({'kebab-case-key': 'a value'});
        argparse = require('./argparse');
      });

      it(`nonexistent key should return undefined result`, () => {
        expect(argparse.getArgValue('blah')).not.toBeDefined();
      });

      it(`existing key should return a result`, () => {
        expect(argparse.getArgValue('kebab-case-key')).toBe('a value');
      });
    });
  });

  describe('getFlag()', () => {
    let argparse;

    beforeEach(() => {
      jest.mock('minimist');
      const minimist = require('minimist');
      minimist.mockReturnValue({'flag-true': 1, 'flag-false': 0});
      argparse = require('./argparse');
    });

    it('should return true if flag value is truthy', () => {
      expect(argparse.getFlag('flag-true')).toBe(true);
    });

    it('should return false if flag is not set', () => {
      expect(argparse.getFlag('flag-false')).toBe(false);
    });

    it('should return true if flag is not set', () => {
      expect(argparse.getFlag('flag-missing')).toBe(false);
    });
  });

  describe('joinArgs()', () => {
    let argparse;

    beforeEach(() => {
      argparse = require('./argparse');
    });

    it('should convert key-values to args string', () => {
      expect(argparse.joinArgs({
        optional: undefined,
        debug: true,
        timeout: 3000,
        logLevel: 'verbose',
        '-w': 1,
        'device-name': 'iPhone X'
      })).toBe('--debug --timeout 3000 --logLevel verbose -w 1 --device-name "iPhone X"');
    });

    it('should accept options', () => {
      const options = { prefix: '-', joiner: '=' };
      const argsObject = {
        'version': 100,
        '--help': true
      };

      expect(argparse.joinArgs(argsObject, options)).toBe('-version=100 --help');
    });
  })
});
