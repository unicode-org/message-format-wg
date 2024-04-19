The tests in the `./tests/` directory were originally copied from the [messageformat project](https://github.com/messageformat/messageformat/tree/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/__fixtures)
and are here relicensed by their original author (Eemeli Aro) under the Unicode License.

These test files are intended to be useful for testing multiple different message processors in different ways:

- `syntax.json` — Test cases that do not depend on any registry definitions.

- `syntax-errors.json` — Strings that should produce a Syntax Error when parsed.

- `data-model-errors.json` - Strings that should produce Data Model Error when processed.
  Error names are defined in ["MessageFormat 2.0 Errors"](../spec/errors.md) in the spec.

- `functions/` — Test cases that correspond to built-in functions.
  The behaviour of the built-in formatters is implementation-specific so the `exp` field is often
  omitted and assertions are made on error cases.

Some examples of test harnesses using these tests, from the source repository:

- [CST parse/stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/cst/cst.test.ts)
- [Data model stringify tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/data-model/stringify.test.ts)
- [Formatting tests](https://github.com/messageformat/messageformat/blob/11c95dab2b25db8454e49ff4daadb817e1d5b770/packages/mf2-messageformat/src/messageformat.test.ts)

A JSON schema is included for the test files in this repository. [Semantic-versioned](https://semver.org/) schema files can be found in the [schemas folder](./schemas/).

For users of Visual Studio Code, a [settings file](./.vscode/settings.json) is included that enables schema validation while editing the test files.
