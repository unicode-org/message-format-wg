## Expression, Markup, and Message Attributes

> [!IMPORTANT]
> This part of the specification is under incubation by the MessageFormat WG,
> and may end up being finalized elsewhere.
> It is non-normative.

### Expression and Markup Attributes

- [@can-copy](expression-and-markup.md#can-copy)
- [@can-delete](expression-and-markup.md#can-delete)
- [@can-overlap](expression-and-markup.md#can-overlap) (Markup only)
- [@can-reorder](expression-and-markup.md#can-reorder) (Markup only)
- [@comment](expression-and-markup.md#comment)
- [@example](expression-and-markup.md#example) (Expression only)
- [@term](expression-and-markup.md#term)
- [@translate](mexpression-and-markup.md#translate)

### Message Attributes

- [@allow-empty](message.md#allow-empty)
- [@obsolete](message.md#obsolete)
- [@param](message.md#param)
- [@schema](message.md#schema)
- [@translate](message.md#translate)

### Attribute Values

_Attributes_ are not required to have a value.
For _attributes_ defined here that explicitly support `yes` as a value,
an _attribute_ with no value is considered synonymous
with the same _attribute_ with the value `yes`.
