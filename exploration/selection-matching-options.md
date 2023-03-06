# Selection Matching Options

## Recommendation

I recommend that we adopt a best-match selection scheme rather than the first-match scheme currently in the spec.

## Background

Currently the specification requires first-match pattern selection.

I would like to reopen this discussion because I believe that using first-match places an unfriendly burden on developers, tools, and translators. I particularly am concerned that developers be able to efficiently learn to write messages and trust that the translation process will produce the correct outcome without developer oversight. I am also concerned that we provide for complex format or selector functions, whose output may match several values. `PluralFormat` in ICU is an example of a formatter with complex selector behavior.

### Example

To fascilitate discussion, I will use this _message_ as an example:

```
match :plural($days) :plural($items) :plural($coins)
when 0   *   *   {This opportunity has ended}
when one 0   one {Congratulations, you earned {$coins} coin}
when one 0   *   {Congratulations, you earned {$coins} coins}
when one one one {You have {$days} day to purchase {$items} item to earn {$coins} coin}
when one one *   {You have {$days} day to purchase {$items} item to earn {$coins} coins}
when one *   one {You have {$days} day to purchase {$items} items to earn {$coins} coin}
when one *   *   {You have {$days} day to purchase {$items} items to earn {$coins} coins}
when *   0   one {Congratulations, you earned {$coins} coin}
when *   0   *   {Congratulations, you earned {$coins} coins}
when *   one one {You have {$days} days to purchase {$items} item to earn {$coins} coin}
when *   one *   {You have {$days} days to purchase {$items} item to earn {$coins} coins}
when *   *   one {You have {$days} day to purchase {$items} items to earn {$coins} coin}
when *   *   *   {You have {$days} days to purchase {$items} items to earn {$coins} coins}
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
Using best-match selection, each _selector_ determines the order of _variants_ from among the list provided. The most likely means to doing this is by returning a "score" for each value, with values processed from left-to-right. The best matching _variant_ becomes the pattern.


**Pros**
+ Variants can be written in any order and produce a consistent result.
+ Selector developers can write complex matches that produce different quality matches for the same value. For example, `{:plural |1|}` matches both the variant `1` and the variant `one`, but prefers the value `1`. The plural _selector_ does not need to communicate with the other _selectors_ in order to arrive at the best matching pattern.
+ Translators do not need to worry about the order of variants or need to reorder variants (which can be difficult to do when only the translation segment for the pattern is shown or when only a changed or generated _variant_ is exposed to translation.
+ Translation tools do not have to preserve the order of _variants_ and are free to send only the translatable segment (the pattern) for translation.

**Cons**
- Developers cannot override the order that the _selector_ provides unless this is exposed as a feature of the given _selector_.
- More complex matching implementation; may be slower?

### Column-First Matching

Mark suggests that there is a third option. Using column-first selection, the first selector picks the best match among the first keys (aka first column), then among the remaining rows, the second selector picks the best match among the remaining second keys, and so on. 
In the example, with `$days = 0`, the first row is picked. With `$days = 1` => `one`, it picks rows 2,3,4,5,6, and 7. With `$items=0` you get rows 4 and 5. And so on.

**Pros**
* Same as Best-Match, plus:
   * Each selector is independent; there is no need to assess different weight strengths among different selectors.
   * Successive selectors only need to pick among the remaining rows, other keys don't need to be assessed
   * Easier to port message from MF1.0 — easier for existing translator tooling to migrate to MF2.0

**Cons**
* Developers cannot override the order that the selector provides unless this is exposed as a feature of the given selector. 
* Comparison: like B-M, adding a new row is easy and doesn't require that "the entire message must be sent to translation"

Mark suggests that: _"In short C-F shares most of the benefits of B-M. What would be interesting and useful would be to come up with an example where one is clearly better than the other."_

I disagree that C-F is different from B-M, except in terms of how the topology of the matrix is traversed (I have not yet found a case where they produce different outputs: the difference is in how the keys are processed?). I have not had time to incorporate this item into the comparison, but document it here for completeness. Please note that the description of "Best Match" is not an algorithm.

## Comparison

Suppose your user experience designer wanted to introduce a new message for the last day of the promotion. This would entail adding a set of messages for the explicit value, e.g. `let $days = |1|`:

```
when 1   one one {This is your last day to purchase {$items} item to earn {$coins} coin}
when 1   one *   {This is your last day to purchase {$items} item to earn {$coins} coins}
when 1   *   one {This is your last day to purchase {$items} items to earn {$coins} coin}
when 1   *   *   {This is your last day to purchase {$items} items to earn {$coins} coins}
```

With first-match, the new messages **must** be inserted just after the `when 0 * *` _variant_. Otherwise the `one` keyword (or `*` value) would capture the match. With best-match, the new messages can be inserted at the end, perhaps with a comment line, even if the best practice would probably be to use the canonical order.

With first-match, the entire message must be sent to translation, in case the translator needs to reorder the values and so that tools "know" what order the values need to be in post translation. Observe that the added lines need to be "exploded" for languages that use a different set of plural keywords (e.g. `zero`, `two`, `few`, or `many`)

## FAQ

#### How could best-match work? How could we specify the pattern match?

The goal of selection is to filter a list of _keys_ down to a single _variant_ that will serve as the pattern. This might be done by filtering the list using a "column first" approach (which, as noted, is not described here) or by ranking the _variants_ (where any _variant_ that produces a "no match" eliminated from the candidate list). This section will consider ranking as the approach.

We could specify that for-each _key_ the _selector_ must produce a ranked value (say between 0 and 1) or `0` for no match. **Non-matching items (that is, any _key_ value that scores `0`) are eliminated.** The value `*` **must** produce at least the minimal non-zero (matching) value, but ***may*** return a higher value. If no _key_ values match, throw an error (this should never happen as it is a syntax error to omit `*`)

Using the example at top, let's consider some values:

| selector | days | items | coins | score | winner? | notes |
|---|---|---|---|---|---|---|
| `when 0 * *` | 0 | any | any | 1.0 + 0.1 + 0.1 = 1.2 | Y | 0 is perfect match |
| `when one 0 *` | 0 | 0 | 0 | **0** + 1.0 + 0.1 = 0.0 (!!) | N | no-match on first item ends processing |
| `when one 0 *` | 1 | 0 | 0 | 0.5 + 1.0 + 0.1 = 1.6 | Y | keyword match on one |
| `when one one *` | 1 | 0 | 0 | 0.5 + **0** + 0.1 = 0.0 (!!) | N | no-match on second item ends processing |
| `when one one *` | 1 | 1 | 0 | 0.5 + 0.5 + 0.1 = 1.1 | Y | keyword match on one |
| `when * * *` | 1 | 1 | 0 | 0.1 + 0.1 + 0.1 = 0.3 | N | `*` here is default |
| `when * * *` | 11 | 11 | 42.0 | 0.5 + 0.5 + 0.5 = 1.5 | Y | `*` here is like `other` |

Note: to actually work through this you'd need to stack rank the matrix, crossing out no-match items, for each example. The trick here is that a lower score first item might be bumped up by a high score item later in the `match`.

Now let's consider the same values with the "last day" (`1`) keys added:

| selector | days | items | coins | score | winner? | notes |
|---|---|---|---|---|---|---|
| `when 0 * *` | 0 | any | any | 1.0 + 0.1 + 0.1 = 1.2 | Y | 0 is perfect match |
| `when one 0 *` | 0 | 0 | 0 | **0.0** + 1.0 + 0.1 = 0.0 (!!) | N | no-match on first item ends processing |
| `when one 0 *` | 1 | 0 | 0 | 0.5 + 1.0 + 0.1 = 1.6 | N | keyword match on one and value match on size `0` |
| `when 1 0 *` | 1 | 0 | 0 | 1.0 + 1.0 + 0.1 = 2.1 | Y | value match on count `1` and size `0` |
| `when one one *` | 1 | 0 | 0 | 0.5 + **0** + 0.1 = 0.0 (!!) | N | no-match on second item ends processing |
| `when one one *` | 1 | 1 | 0 | 0.5 + 0.5 + 0.1 = 1.1 | N | keyword match on one |
| `when 1 one *` | 1 | 1 | 0 | 1.0 + 0.5 + 0.1 = 1.6 | Y | value match on count `1`, keyword `one` on size |
| `when * * *` | 1 | 1 | 0 | 0.1 + 0.1 + 0.1 = 0.3 | N | `*` here is default |
| `when * * *` | 11 | 11 | 42.3 | 0.5 + 0.5 + 0.5 = 1.5 | Y | `*` here is like `other` |


#### Why isn't this an issue in MF1 or other formatting specs?

Most existing formatting specs, including MF1, only have single _selector_ matching. When a message contains multiple selectors, each one fires indepedently. The best practice is to nest selectors so that the pattern eventually exposed to the formatter is a complete thought/sentence, rather than concatenated.

This means that each _selector_ always produces a single match when evaluating the list of _variants_ (or produces an error if no match can be found). This also means that the **shape** of subsidiary matches can vary. Here is a pseudo-code example:

```
match :plural($days)
   when 0 {You have no no days left}
   when one {
       match :plural($items)
          when 0 {You already earned your reward.}
          when one {You need {$items} more item}
          when * {You need {$items} more items}
    }
    when * {
       match :plural($coins)
          when 0 {There are no coins on offer.}
          when one {You have {$days} days to earn {$coins} coin}
          when * {You have {$days} days to earn {$coins} coins}
    }
```

MF2 is fundamentally different in that **all** _selectors_ must be evaluated to produce the match. In the above example, all three _selectors_ must appear in the `match` statement (this is the original example above). The messages might have varying shape, but `items` and `coins` can't be disconnected completely.

#### What is "complex matching"? How does plural exemplify it?

Complex matching is when a _selector_ can match multiple different _variants_ to a single value. 

Many types of _selector_ do equality matching. For example, `SelectFormat` is generally matching a variable's value against a static literal.

`PluralFormat`, by contrast, can match multiple variants to a single input value. And example of this would be the following set of _variants_:

```
match :plural($days)
   when 2   { two }
   when few { few }
   when *   { star }
```

In the locale `en`, the value `$count = 2` can match both `2` and `*`. In the `pl` locale, the same value can match _all three_ variants. However, in each case, the "quality" of the match is different. In `en`, the `2` _variant_ has a better quality match than `*`. In `pl`, `2` trumps `few` which is better than `*`.

Elango has pointed out that there can be other considerations, for example:

```
match :plural(:number($count numDigits=2)) // produces localized equiv of 2.00
   when few { never matches in en or pl }
   when *   { matches because it has a fractional part }
```

By letting the _selector_ decide how to process the input and range of _variants_, we can allow for complex matching without burdening our specification with a lot of details.


As an aside, how does the above express the `when` clause for the value `2.00`? It can't use a literal (what if the decimal separator were `,`!!) and the _nmtoken_ `2.00` could be complicated to handle? Also, does `2` match?

#### How does this compare to programming language constructs (such as switch)?

It's difficult to say if the MF2 `match` statement should work like familiar selection methods in programming languages. Internationalization APIs, such as resource managers, MF1, and date/number skeletons have tended towards "do what I want", hiding the need for both developers and translators to know about cultural and lingusitic variation and account for it in code. Modern I18N APIs hide most of this complexity. Some of the analogous cases in I18N APIs are:
* resource fallback with sparse population
* skeletons for dates, such as (`yyyyMMddjm`) do not require translators to touch "picture strings" (such as `MM/dd/yyyy HH:mm a`) to handle the time or date separators `/` and `:`, the use of 24-hour time vs. 12-hour time, the order of the fields

When coding a plural using ICU4J's `PluralFormat`, the developer only needs to worry about _specific value_ messages (`when 1 {This is your last chance.}`) vs. value based messages (`when one {You have {$count} chance remaining.}`).

Many programming languages feature multi-value selection using logic constructs such as Java's `switch` statement. These statements do depend on the order of the "cases":

```java
switch (count) {
   case 0:
   case 1:
   case 2:
   default:
};
```

Programming constructs like `switch` generally match a single value exactly. Sometimes developers use features, such as "fall through", to allow two or more blocks of code to operate on a single value. But the core of a `switch` is binary matching of the value. Generally the same input (`count` in the example above) can't match more than one `case`.

We could model `match` as a switch:

```
match ($count)
when 1   {This is your last chance}
when one {You have {$count} chance remaining}
when *   {...}
```
vs.
```
match ($count)
when one {You have {$count} chance remaining}
when 1   {This message cannot be reached in English, but would be reached in Japanese!!}
when *   {...}
```

This exposes developers and translators to managing the complexity versus having the API take care of it.


#### Are there other complex matching cases? Or is `plural` everything?

Currently there are no other complex rule-based selectors in ICU. However, there are a number of cases where complex matching might come into play. The criteria for it being a complex match are:

1. The selector generates different output by locale (the way that plural generates `few` and `many` for e.g. Polish or fails to generate `one` in Japanese). If the states vary according to something other than locale all of the states have to be accounted for in the `root` locale resource and all translations (so it's not "complex" any more); or:
2. The selector can generate more than one match for the same value (compare with plural `=1` and `one`), with varying quality of match.
3. Any combination of the above.

The key thing here is that the static text produced by the translator needs to reflect the grammatical needs of the language and depends on knowing something about the (invisible) value being inserted at runtime.

Some potential examples of (1) (and this is "thinking out loud"):

1. **Date/time based selection.** Date/time types, including the newer Temporal types, can present complex matching needs. While _incremental time_ values (such as `java.time.Instant`, `java.util.Date`, or JavaScript's `Date`) can resolve every field and be cast to any time zone, Other types, such as `java.time.ZonedDate`, are incomplete. There are different calendars that can affect presentation and selection as well. Some cases for complex time selection include:
   * **Relative time formats.** The values available (such as `yesterday`, `tomorrow`, `day after tomorrow`) vary by locale. 
   * **Periodic time formats.** Recurring values might require message selection.

1. **Gender or part-of-speech selection.** Grammatical gender is strongly linked to language and varies by language--very much like plurals. These types of selection might not have the multiple selection quirks of plurals, but will have varying shape by locale. 

   For example, I built a "product name format" function into Amazon's devices. Each product knew (in each supported locale) its generic, short, medium, long, and full name, and each product's name could vary in gender/count/etc. per language. That is, the generic might be a "tablet" or "TV" (or whatever) and then the e.g. tablet might be called a "Fire", a "Fire 8 HDX", etc. 
   
   The software doesn't know which device it'll be built into (actually, it's built into all of them), so the formatter needs to select the correct pattern string according to device it is in at runtime. Rather than build separate strings for every device, we generated variations based on the (smaller) set of grammar variations per-locale. A simple message like `The {whatever} is ready` in English might look sort of like the following (in our syntax) in a French locale (and I'm omitting for clarity such things as enclitic handling, e.g. when it's `l'ordinateur` not `le ordinateur`):

   ```
   match {:gender $product}
   when masculine {Le {:product format=generic} est prêt.}  ; le téléphone est prêt
   when feminine {La {:product format=generic} est prête.}  ; la télévision est prête
   when * {L'appareil est prêt.} 
   ```

   Notice that it isn't just the article that changes. And notice that the list of enumerated values changes by language (so German has three noun genders while English mostly has one)
   
Some potential examples of (2):

1. **Application specific selection.** Developers may need to write selectors with varying degrees of selection. For example, one might have a message that varies by category and then, for specific items, by sub-category:

```
match :category($itemData)
when categoryElectronics  {There is a sale in electronics today}
when subcategoryComputers {There is a sale on computers today}
when *                    {There is a sale in this category today}
```
