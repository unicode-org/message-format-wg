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

| Elango / Mihai             | Eemeli + Zibi     |
| -------------------------- | ----------------- |
|                            | Resource          |
| MessageGroup | Message     | Entry             |
| MessageGroup               | MessageGroup      |
| Message                    | Message           |
| SimpleMessage              |                   |
| Pattern (Part[])           | Pattern (Value[]) |
| SelectorMessage            |                   |
|                            | Select            |
| Part                       | Part              |
| SelectorArg                | Key               |
| SelectorVal                | Literal           |
| PlainText                  | string            |
| Placeholder                | number            |
|                            | boolean           |
| Placeholder+formatter_name | VariableReference |
| Placeholder+formatter_name | FunctionReference |
| Placeholder+formatter_name | MessageReference  |
|                            | Path              |
|                            | Meta              |
|                            | Comment           |
|                            | Scope             |
