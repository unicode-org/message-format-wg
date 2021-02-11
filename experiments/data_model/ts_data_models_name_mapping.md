# Comparing MF2 Data Models

* Elango
  - branch of Mihai : https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_elango/branch_from_mihai/src/imessageformat.ts
  - Rust : https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_elango/ts_from_rust/src/imessageformat_v3.ts
* Eemeli
  - MFWG repo : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_eemeli
  - eemeli@ fork : https://github.com/eemeli/message-format-wg/blob/data-model/docs/data-model.d.ts
* Mihai  : https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_mihai/src/imessageformat.ts
* Zibi
  - MFWG repo : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_zibi

## Work in progress

| Elango           | Mihai            | Zibi                          | Eemeli            | Elango - Rust                  |
| ---------------- | ---------------- | ----------------------------- | ----------------- | ------------------------------ |
|                  |                  |                               | Bundle            |                                |
|                  | MessageGroup     |                               | MessageSet        |                                |
| Message          | Message          | Message / MessageValue        |                   |                                |
| SimpleMessage    | SimpleMessage    | Single / Pattern              | Message           | SingleMessage / MessagePattern |
| SelectorMessage  | SelectorMessage  | Multi                         | Select            | MessageGroup                   |
| Part             | Part             | PatternElement                | Value             | PatternPart                    |
| SelectorArg      | Switch           | InlineExpression              |                   | Selector                       |
| SelectorVal      | Case             | Variant.VariantKey            |                   | SelectVal                      |
| PlainText        | PlainText        | NumberLiteral / StringLiteral | Literal           | TextPart                       |
| Placeholder      | Placeholder+type | VariableReference             | VariableReference | Placeholder                    |
| Placeholder      | Placeholder+type | FunctionReference             | FunctionReference | Placeholder                    |
| Placeholder      | Placeholder+type |                               | MessageReference  | Placeholder                    |
