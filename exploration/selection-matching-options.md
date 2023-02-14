# Selection Matching Options

## Recommendation

I recommend that we adopt a best-match selection scheme rather than the first-match scheme currently in the spec.

## Background

Currently the specification requires first-match pattern selection.

To fascilitate discussion, I will use this _message_ as an example:

```
match :plural($count) :plural($size) :plural($cost)
   when 0 * *     {You have no wildebeest remaining}
   when one 0 *   {You have {$count} wildebeest remaining that cost {$cost :number type=currency}}
   when one one * {You have {$count} {$size} wildebeeet remaining that cost {$cost :number type=currency}}
   when one * *   {You have {$count} {$size} wildebeest remaining that cost {$cost :number type=currency}}
   when * 0 0     {You have {$count} {$size} remaining free wildebeest}
   when * one one {You have {$count} {$size} wildebeeet remaining that cost {$cost :number type=currency}}
   when * * 0     {You have {$count} {$size} remaining free wildebeest}
   when * * one   {You have {$count} {$size} wildebeeet remaining that cost {$cost :number type=currency}}
   when * * *     {You have {$count} {$size} wildebeest remaining that cost {$cost :number type=currency}}
```

## First-Match
Using first-match selection, the order of the _variants_ within a _selector_ determines the match order. Each _variant_ is evaluated by the list of _selectors_ for a boolean match value. The first _variant_ to match all _selectors_ becomes the pattern. 

In the example message, the _variants_ are in a canonical order, so first-match produces the same order as best-match does.

**Pros**
+ Allows developers to control the order of selection.
+ Allows translators to tailor the order of selection.
+ Can visually inspect match order.
+ May be more efficient when perfoming match (??)

**Cons**
- Requires developers to specify _variants_ in the correct order.
- Requires translators to tailor the order of _variants_ if this is different from the source.
- Requires all translation tooling and runtime processing to preserve the order of the _variants_
- Translation tools that "explode" the selection matrix to support languages with additional needs (such as the way that the `pl` locale requires keywords `few` and `many` for plurals whereas the `en` locale does not) to order generated _variants_ correctly and to interpolate the developer's intent.

## Best-Match
Using best-match selection, each _selector_ determines the order of _variants_ from among this list provided. The most likely means to doing this is by returning a "score" for each value, with values processed from left-to-right. The best matching _variant_ becomes the pattern.


**Pros**
+ Variants can be written in any order and produce a consistent result.
+ Selector developers can write complex matches that produce different quality matches for the same value. For example, plural(1) matches both the variant `1` and the variant `one`, but prefers the value `1`. The plural _selector_ does not need to communicate with the other _selectors_ in order to arrive at the best matching pattern.
+ Translators do not need to worry about the order of variants or need to reorder variants (which can be difficult to do when only the translation segment for the pattern is shown or when only a changed or generated _variant_ is exposed to translation.
+ Translation tools do not have to preserve the order of _variants_ and are free to send only the translatable segment (the pattern) for translation.

**Cons**
- Developers cannot override the order that the _selector_ provides unless this is exposed as a feature of the given _selector_.
- More complex matching implementation; may be slower?

## Comparison

Suppose your user experience designer wanted to introduce a new message for the last remaining wildebeest. This would entail adding a set of messages for the explicit value `$count = 1`:

```
   when 1 * 0     {This is your last remaining free wildebeest}
   when 1 0 *     {This is your last wildebeest remaining that cost {$cost :number type=currency}}
   when 1 one one {This is your last {$size} wildebeeet remaining that cost {$cost :number type=currency}}
   when 1 one *   {This is your last {$size} wildebeeet remaining that cost {$cost :number type=currency}}
   when 1 * one   {This is your last {$size} wildebeeet remaining that cost {$cost :number type=currency}}
   when 1 * *     {This is your last {$size} wildebeest remaining that cost {$cost :number type=currency}}
```

With first-match, the new messages **must** be inserted just after the `when 0 * *` _variant_. Otherwise the `one` keyword (or `*` value) would capture the match. With best-match, the new messages can be inserted at the end, perhaps with a comment line, even if the best practice would probably be to use the canonical order.

With first-match, the entire message must be sent to translation, in case the translator needs to reorder the values and so that tools "know" what order the values need to be in post translation. Observe that the added lines need to be "exploded" for languages that use a different set of plural keywords (e.g. `zero`, `two`, `few`, or `many`)

## FAQ

#### Why isn't this an issue in MF1 or other formatting specs?

Most existing formatting specs, including MF1, only have single _selector_ matching. When a message contains multiple selectors, each one fires indepedently. The best practice is to nest selectors so that the pattern eventually exposed to the formatter is a complete thought/sentence, rather than concatenated.

This means that each _selector_ always produces a single match when evaluating the list of _variants_ (or produces an error if no match can be found). This also means that the **shape** of subsidiary matches can vary. Here is a pseudo-code example:

```
match :plural($count)
   when 0 {You have no wildebeest}
   when one {
       match :plural($size)
          when 0 {You have {$count} invisible wildebeest}
          when one {You have {$count} {$size} lb. wildebeeet}
          when * {You have {$count} {$size} lb. wildebeest}
    }
    when * {
       match :plural($cost)
          when 0 {You have {$count} free wildebeest}
          when one {You have {$count} {$cost :number type=currency} wildebeeet}
          when * {You have {$count} {$cost :number type=currency} wildebeest}
    }
```

MF2 is fundamentally different in that **all** _selectors_ must be evaluated to produce the match. In the above example, all three _selectors_ must appear in the `match` statement:

```
match :plural($count) :plural($size) :plural($cost)
   when 0 * * {You have no wildebeest}
   when one 0 * {You have {$count} invisible wildebeest}
   when one one * {You have {$count} {$size} lb. wildebeeet}
   when one * * {You have {$count} {$size} lb. wildebeest}
   when * * 0 {You have {$count} free wildebeest}
   when * * one {You have {$count} {$cost :number type=currency} wildebeeet}
   when * * * {You have {$count} {$cost :number type=currency} wildebeest}
```

