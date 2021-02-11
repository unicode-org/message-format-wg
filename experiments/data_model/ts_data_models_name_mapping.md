# Comparing MF2 Data Models

* Mihai  : https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_mihai/src/imessageformat.ts
* Elango
  - branch of Mihai : https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_elango/branch_from_mihai/src/imessageformat.ts
  - Rust : https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_elango/ts_from_rust/src/imessageformat_v3.ts
* Zibi
  - MFWG repo : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_zibi
* Eemeli
  - MFWG repo : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_eemeli
  - eemeli@ fork : https://github.com/eemeli/message-format-wg/blob/data-model/docs/data-model.d.ts


Very first draft.

| Elango                         | Mihai           | Zibi                          | Eemeli            |
| ------------------------------ | --------------- | ----------------------------- | ----------------- |
|                                |                 |                               | Bundle            |
|                                |                 |                               | MessageSet        |
|                                | Message         | Message / MessageValue        |                   |
| SingleMessage / MessagePattern | SimpleMessage   | Single / Pattern              | Message           |
| MessageGroup                   | SelectorMessage | Multi                         | Select            |
| PatternPart                    | Part            | PatternElement                | Value             |
| Selector                       | Switch          | InlineExpression              |                   |
| SelectVal                      | Case            | Variant.VariantKey            |                   |
| TextPart                       | PlainText       | NumberLiteral / StringLiteral | Literal           |
| Placeholder                    | Placeholder     | VariableReference             | VariableReference |
| Placeholder                    | ?               | FunctionReference             | FunctionReference |
| Placeholder                    | Placeholder     |                               | MessageReference  |
