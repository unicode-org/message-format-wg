# Comparing MF2 Data Models

Mihai  : https://github.com/mihnita/msgfmt_experiments/blob/main/ts/src/imessageformat.ts
Elango : https://github.com/mihnita/msgfmt_experiments/blob/main/ts_elango/src/imessageformat_v3.ts
Zibi   : https://github.com/mihnita/msgfmt_experiments/blob/main/ts_zibi/src/imessageformat_v3.ts
Eemeli : https://github.com/eemeli/message-format-wg/blob/data-model/docs/data-model.d.ts


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
