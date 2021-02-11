# Comparing MF2 Data Models

Eemeli : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_eemeli
Elango : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_elango
Mihai  : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_mihai
Zibi   : https://github.com/unicode-org/message-format-wg/tree/experiments/experiments/data_model/ts_zibi

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

## Note

In some cases I've added enough "scafolding" to build, lint, or even test:
```
npm install
npm run lint
npm test
```
