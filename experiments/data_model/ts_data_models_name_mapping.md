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

| Elango / Mihai             | Zibi                          | Eemeli            | Elango - Rust                  |
| -------------------------- | ----------------------------- | ----------------- | ------------------------------ |
|                            |                               | Bundle            |                                |
| MessageGroup               |                               | MessageSet        |                                |
| Message                    | Message / MessageValue        |                   |                                |
| SimpleMessage              | Single / Pattern              | Message           | SingleMessage / MessagePattern |
| SelectorMessage            | Multi                         | Select            | MessageGroup                   |
| Part                       | PatternElement                | Value             | PatternPart                    |
| SelectorArg                | InlineExpression              |                   | Selector                       |
| SelectorVal                | Variant.VariantKey            |                   | SelectVal                      |
| PlainText                  | NumberLiteral / StringLiteral | Literal           | TextPart                       |
| Placeholder+formatter_name | VariableReference             | VariableReference | Placeholder                    |
| Placeholder+formatter_name | FunctionReference             | FunctionReference | Placeholder                    |
| Placeholder+formatter_name |                               | MessageReference  | Placeholder                    |
