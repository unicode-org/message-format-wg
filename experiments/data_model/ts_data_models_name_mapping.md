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

| Elango                         | Mihai            | Zibi                          | Eemeli            |
| ------------------------------ | ---------------- | ----------------------------- | ----------------- |
|                                |                  |                               | Bundle            |
|                                | MessageGroup     |                               | MessageSet        |
|                                | Message          | Message / MessageValue        |                   |
| SingleMessage / MessagePattern | SimpleMessage    | Single / Pattern              | Message           |
| MessageGroup                   | SelectorMessage  | Multi                         | Select            |
| PatternPart                    | Part             | PatternElement                | Value             |
| Selector                       | Switch           | InlineExpression              |                   |
| SelectVal                      | Case             | Variant.VariantKey            |                   |
| TextPart                       | PlainText        | NumberLiteral / StringLiteral | Literal           |
| Placeholder                    | Placeholder+type | VariableReference             | VariableReference |
| Placeholder                    | Placeholder+type | FunctionReference             | FunctionReference |
| Placeholder                    | Placeholder+type |                               | MessageReference  |
