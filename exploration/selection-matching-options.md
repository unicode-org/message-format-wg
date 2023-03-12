# Selection Matching Options

## Recommendation

We are discussing whether to change First-Match to another value. Currently voting looks like:

| Person | Supports |
|---|---|
| APP | C-F, then B-M, no F-M |
| STA | F-M, then B-M, the C-F with optional \* |
| SCL | F-M, then C-F, then optional \* |
| RGN | C-F optional \*, F-M, CF required \* |
| MIH | B-M, C-F lexical sort, C-F required \* |
| EAO | C-F optional \*, F-M, C-F required \* |
| ECH | C-F, B-M (distant 2nd), F-M \* behind that |

## Background

Currently the specification requires first-match pattern selection.

I would like to reopen this discussion because I believe that using first-match places an unfriendly burden on developers, tools, and translators. I particularly am concerned that developers be able to efficiently learn to write messages and trust that the translation process will produce the correct outcome without developer oversight. I am also concerned that we provide for complex format or selector functions, whose output may match several values. `PluralFormat` in ICU is an example of a formatter with complex selector behavior.

## Comparison

| Criterion | First-Match | Scored Best-Match | Column-First Best-Match | Column-First req `*` | Notes |
|---|---|---|---|---|---|
| MF1 Compat | ? | ? | - | + | some say F-M not compat. |
| Devlopers/Translators can control | +++ | - | - | - | D/Ts have the ability to influence or override selection |
| Developers/Translator must control | - | +++ | ++ | +++ | D/Ts are required to manage selection order |
| Visual Inspection | +++ | + | + | + | It is possible to order any matrix canonically, enabling visual inspection |
| Complex matching (varies by locale) | - | +++ | +++ | +++ | Matrix explosion may conflict with manual ordering in FM |
| Complex matching (multi-value) | - | +++ | ++ | ++ | F-M stops on first match; B-M gives developer full control of matching |
| Translation tool variant order | - | +++ | +++ | +++ | Translations tools are required to maintain the order and/or provide for reordering that itself is remembers (eg. in the TM) |
| Partial leverage on added keys | - | +++ | +++ | +++ | Changes or additions to matrix only affect some entries |
| Programmable selection order | + | + | + | + | Selector authors can provide options for tailoring matches |


### Example

To fascilitate discussion, I will use this _message_ as an example:

```
match {$days :plural} {$items :plural} {$coins :plural}
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

First-Match selection evaluates the list of _keys_ row-by-row and selects the first _variant_ that matches the list of _selectors_ as the _pattern_.

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
- Translation tools that "explode" the selection matrix to support languages with additional needs (such as the way that the `pl` locale requires keywords `few` and `many` for plurals whereas the `en` locale does not) must order the generated _variants_ correctly.

## Best-Match

Best-Match selection evaluates the full list of _keys_ and selects the _variant_ that, according to the matching strategy used, "best matches" the list of _selectors_ as the _pattern_. There are three best-match selection strategies in this document:

1. Sorted Matching
1. Column-First with required default `*`
1. Column-First without required default `*`

**Pros**
+ Variants can be written in any order and produce a consistent result.
+ Selector developers can write complex matches that produce different quality matches for the same value. For example, `{|1| :plural}` matches both the variant `1` and the variant `one`, but prefers the value `1`. The plural _selector_ does not need to communicate with the other _selectors_ in order to arrive at the best matching pattern.
+ Translators do not need to worry about the order of variants or need to reorder variants (which can be difficult to do when only the translation segment for the pattern is shown or when only a changed or generated _variant_ is exposed to translation.
+ Translation tools do not have to preserve the order of _variants_ and are free to send only the translatable segment (the pattern) for translation.

**Cons**
- Developers cannot override the order that the _selector_ provides unless this is exposed as a feature of the given _selector_.
- More complex matching implementation; may be slower?

### Sorted

Sorted Matching evaluates the full list of _keys_ by sorting the matrix. Each _selector_ provides a "comparator" for values in its column (such as computing a weight for the value in its column). Rows that contain a non-matching value for any selector are eliminated as potential matches. The default value `*` always matches. Ordering is maintained for preceding columns, that is, _selector_ number 2 can only reorder items whose _selector_ number 1 key match. The highest ranking _key_ is returned as the _pattern_. Ties are broken by column. If no matching row is found, returns an error.

**Pros**
(All of the pros of best match plus:)
+ Allows for better selection in some corner cases. 

**Cons**
- Complex to evaluate visually
- More complex to implement

Let's look at the example's matrix:

```
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

Let's use values `0`/`3`/`3`. The first _selector_, `{$days :plural}`, matches the value `0` and the `*` rule, producing this matrix:

```
0   *   *
*   one one
*   one *
*   *   one
*   1   *
*   *   *
```

The second _selector_ `{$items :plural}`, matches the `*` rule, producing this matrix:

```
0   *   *
*   *   one
*   *   *
```

The third and final _selector_ `{$coins :plural}` matches the `*` rule, producing this matrix:

```
0   *   * <-- winner
*   *   *
```

The value `3`/`1`/`3` produce different matching. The first selector now only matches the `*` rule:

```
*   one one
*   one *
*   *   one
*   1   *
*   *   *
```

The second _selector_ matches the explicit value `1`, which is prefers to the keyword value `one` and the default value `*` _in that order_:

```
*   1   *
*   one one
*   one *
*   *   one
*   *   *
```

The final _selector_ matches the default value `*` but not the keyword `one`, thus producing this matrix:


```
*   1   * <-- winner
*   one *
*   *   *
```

### Column-First with Required `*`

This is a "sorted" best match algorithm that works as follows: each _selector_ provides a "comparator" for values in its column (such as computing a weight for the value in its column). Rows that contain a non-matching value for any selector are eliminated as potential matches. The default value `*` always matches. Ordering is maintained for preceding columns, that is, _selector_ number 2 can only reorder items whose _selector_ number 1 key match. The highest ranking _key_ is returned as the _pattern_. Ties are broken by column. If no matching row is found, returns an error.


**Pros**
+ Variants can be written in any order and produce a consistent result.
+ Selector developers can write complex matches that produce different quality matches for the same value. For example, `{|1| :plural}` matches both the variant `1` and the variant `one`, but prefers the value `1`. The plural _selector_ does not need to communicate with the other _selectors_ in order to arrive at the best matching pattern.
+ Translators do not need to worry about the order of variants or need to reorder variants (which can be difficult to do when only the translation segment for the pattern is shown or when only a changed or generated _variant_ is exposed to translation.
+ Translation tools do not have to preserve the order of _variants_ and are free to send only the translatable segment (the pattern) for translation.
+ Easier to evaluate visually than sorting strategies.

**Cons**
- Developers cannot override the order that the _selector_ provides unless this is exposed as a feature of the given _selector_.
- Can require more processing than First-Match


### Column-First with Optional `*`

This is a "sorted" best match algorithm. Unlike other options, this algorithm does not require that the key set contain a default (\*\) message value for a given column combination, including, presumably, the default message with all `*` values. Matching proceeds exactly like column-first-with-required-\*\. If no matching row is found, returns an error.

**Pros**
+ (all of the "pros" for "with `*`")
+ Avoids having extra rows in cases where the default value and `*` might be distinct, for example `other` vs. `*` in plural.
+ Allows for _selectors_ whose default value varies by locale but for which the set of matching keys remains a closed set, for example, if the default gender were different by locale or if there were something like a default grammatical case.

**Cons**
- Easier to produce a non-functional message that returns only an error for some set of values.
- Loses the ability to validate message completeness.

### Scored Best Matching

Computes row order in the `match` statement rather than in each _selector_. Each _selector_ returns a "score" for a given variant (in this example, the values are between 0 and 1, but they could be integers instead). Each _selector's_ score is added together for the row and rows are sorted by score. Tie scores go the highest left-most column. A score of 0 by any _selector_ eliminates the row. A primary difference with scoring is that a later column can boost a row past a higher quality match in an earlier column.

Using the example at top, let's consider some values:

| selector | count | size | cost | score | winner? | notes |
|---|---|---|---|---|---|---|
| `when 0 * *` | 0 | any | any | 1.0 + 0.1 + 0.1 = 1.2 | Y | 0 is perfect match |
| `when one 0 *` | 0 | 0 | 0 | 0.0 + 1.0 + 0.1 = 0.0 (!!) | N | no-match on first item ends processing |
| `when one 0 *` | 1 | 0 | 0 | 0.5 + 1.0 + 0.1 = 1.6 | Y | keyword match on one |
| `when one one *` | 1 | 0 | 0 | 0.5 + **0** = 0 | N | no-match on second item ends processing |
| `when one one *` | 1 | 1 | 0 | 0.5 + 0.5 + 0.1 = 1.1 | Y | keyword match on one |
| `when * * *` | 1 | 1 | 0 | 0.1 + 0.1 + 0.1 = 0.3 | N | `*` here is default |
| `when * * *` | 11 | 11 | 42.0 | 0.5 + 0.5 + 0.5 = 1.5 | Y | `*` here is like `other` |

## FAQ

### How do I insert a new _variant_?

Suppose your user experience designer wanted to introduce a new message for the last day of the promotion. This would entail adding a set of messages for the explicit value, e.g. `let $days = {|1|}`:

```
when 1   one one {This is your last day to purchase {$items} item to earn {$coins} coin}
when 1   one *   {This is your last day to purchase {$items} item to earn {$coins} coins}
when 1   *   one {This is your last day to purchase {$items} items to earn {$coins} coin}
when 1   *   *   {This is your last day to purchase {$items} items to earn {$coins} coins}
```

With first-match, the new messages **must** be inserted just after the `when 0 * *` _variant_. Otherwise the `one` keyword (or `*` value) would capture the match. With best-match, the new messages can be inserted at the end, perhaps with a comment line, even if the best practice would probably be to use the canonical order.

Note that the above example easily fits at the "top" of the matrix, but the user experience designer might just as easily have made the change to the 2nd or 3rd _selector_. For example:

```
; e.g. let $items = {|1|}
when one 1   one {You only need one more item in the next {$days} day to earn {$coins} coin}
when one 1   *   {You only need one more item in the next {$days} day to earn {$coins} coins}
when *   1   one {You only need one more item in the next {$days} days to earn {$coins} coin}
when *   1   *   {You only need one more item in the next {$days} days to earn {$coins} coins}
```

With first-match these items must be inserted into different parts of the matrix.

### If a new _variant_ is created, what happens to the translations?

With first-match, the entire message must be sent to translation, in case the translator needs to reorder the values and so that tools "know" what order the values need to be in post translation. Observe that the added lines need to be "exploded" for languages that use a different set of plural keywords (e.g. `zero`, `two`, `few`, or `many`)

For First-Match the entire message must be sent through the entire translation system, since the translator might need to reorder _variants_ during the translation process. The translation memory for the existing parts of the message might not be easily applied.

For any of the Best-Match straegies, MF2's design allows tools to treat each _variant_ as a separable _segment_. Each _variant_ can be leveraged against previous iterations in translation memory, while the tool can use the _message_ to group the _variants_ into a related _translation unit_ ("TU"). In the translation editor the translator can still be provided the necessary metadata to perform an accurate translation, so perhaps such segment might look something like:

```
source: en
target: pl
$PH1 = "$day", keyword=few
$PH2 = "$coins", keyword=many
segment: "You only need one more item in the next <ph id=$PH1/> days to earn <ph id=$PH2/> coins"
```

Note that translation systems still need to "explode" the matrix of available values based on the target locale's needs. Using the "one more item" example above, here's what the Polish translator might need to create:

```
when one  1   one  {You only need one more item in the next {$days} day to earn {$coins} coin}
when one  1   few  {You only need one more item in the next {$days} day to earn {$coins} coins}
when one  1   many {You only need one more item in the next {$days} day to earn {$coins} coins}
when one  1   *    {You only need one more item in the next {$days} day to earn {$coins} coins}
when few  1   one  {You only need one more item in the next {$days} days to earn {$coins} coin}
when few  1   few  {You only need one more item in the next {$days} days to earn {$coins} coins}
when few  1   many {You only need one more item in the next {$days} days to earn {$coins} coins}
when few  1   *    {You only need one more item in the next {$days} days to earn {$coins} coins}
when many 1   one  {You only need one more item in the next {$days} days to earn {$coins} coin}
when many 1   few  {You only need one more item in the next {$days} days to earn {$coins} coins}
when many 1   many {You only need one more item in the next {$days} days to earn {$coins} coins}
when many 1   *    {You only need one more item in the next {$days} days to earn {$coins} coins}
when *    1   one  {You only need one more item in the next {$days} days to earn {$coins} coin}
when *    1   few  {You only need one more item in the next {$days} days to earn {$coins} coins}
when *    1   many {You only need one more item in the next {$days} days to earn {$coins} coins}
when *    1   *    {You only need one more item in the next {$days} days to earn {$coins} coins}
```

Working on 16 separate segments (which will have high internal leverage) is easier than getting the entire message and needing to order it manually. The original example message has 13 _keys_ in the `root` locale, but will have 82 _keys_ in the Polish locale--before adding the 16 new _keys_ above (for a total of 98). This will effectively require better tools for translator acceptance. An alternative would be for First-Match implementations to define a canonical order for the _key_ matrix so that the _segments_ are separable in the TU but can be assembled into a working _message_.

#### Why isn't matching or reordering an issue in MF1 or other formatting specs?

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
match {$count :plural}
   when 2   { two }
   when few { few }
   when *   { star }
```

In the locale `en`, the value `$count = 2` can match both `2` and `*`. In the `pl` locale, the same value can match _all three_ variants. However, in each case, the "quality" of the match is different. In `en`, the `2` _variant_ has a better quality match than `*`. In `pl`, `2` trumps `few` which is better than `*`.

Elango has pointed out that there can be other considerations, for example:

```
match {$count :plural numDigits=2} // produces localized equiv of 2.00
   when few { never matches in en or pl }
   when *   { matches because it has a fractional part }
```

By letting the _selector_ decide how to process the input and range of _variants_, we can allow for complex matching without burdening our specification with a lot of details.


As an aside, how does the above express the `when` clause for the value `2.00`? It can't use a literal (what if the decimal separator were `,`!!) and the _nmtoken_ `2.00` could be complicated to handle? Also, does `2` match?

#### How does this compare to programming language constructs (such as switch)?

It's difficult to say if the MF2 `match` statement should work like familiar selection methods in programming languages. Internationalization APIs, such as resource managers, MF1, and date/number skeletons have tended towards "do what I want", hiding the need for both developers and translators to know about cultural and lingusitic variation and account for it in code. Modern I18N APIs hide most of this complexity. Some of the analogous cases in I18N APIs are:
* **Resource fallback**, particularly with sparsely populated localized resource files
* **Skeletons** such as for dates (for example, `yyyyMMddjm`), which do not require translators to touch "picture strings" (such as `MM/dd/yyyy HH:mm a`) to handle the time or date separators `/` and `:`, the use of 24-hour time vs. 12-hour time, the order of the fields. 
* **Built-in formats** such as `short`/`medium`/`long`/`full` do not guarantee any particular separators, field order, or format and vary widely between locales.
* **Locale negotiation** matches the best particular locale to a requested language range.

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
match {$count}
when 1   {This is your last chance}
when one {You have {$count} chance remaining}
when *   {...}
```
vs.
```
match {$count}
when one {You have {$count} chance remaining}
when 1   {This message cannot be reached in English, but would be reached in Japanese!!}
when *   {...}
```

This exposes developers and translators to managing the complexity versus having the API take care of it.


#### Are there other complex matching cases? Or is `plural` everything?

Currently there are no other complex rule-based selectors in ICU. However, there are a number of cases where complex matching might come into play. The criteria for it being a complex match are:

1. The selector generates different output by locale (the way that plural generates `few` and `many` for e.g. Polish or fails to generate `one` in Japanese). If the states vary according to something other than locale all of the states have to be accounted for in the `root` locale resource and all translations (so it's not "complex" any more); or:
2. The selector can generate more than one match for the same value (compare with plural `1` and `one`), with varying quality of match.
3. Any combination of the above.

The key thing here is that the static text produced by the translator needs to reflect the grammatical needs of the language and depends on knowing something about the (invisible) value being inserted at runtime.

Some potential examples of (1) (and this is "thinking out loud"):

1. **Date/time based selection.** Date/time types, including the newer Temporal types, can present complex matching needs. While _incremental time_ values (such as `java.time.Instant`, `java.util.Date`, or JavaScript's `Date`) can resolve every field and be cast to any time zone, Other types, such as `java.time.ZonedDate`, are incomplete. There are different calendars that can affect presentation and selection as well. Some cases for complex time selection include:
   * **Relative time formats.** The values available (such as `yesterday`, `tomorrow`, `day after tomorrow`) vary by locale. Here's one example in the [German CLDR charts](https://unicode-org.github.io/cldr-staging/charts/latest/summary/de.html#1d45310cbcf1b2e5)
   * **Periodic time formats.** Recurring values might require message selection.

1. **Gender or part-of-speech selection.** Grammatical gender is strongly linked to language and varies by language--very much like plurals. These types of selection might not have the multiple selection quirks of plurals, but will have varying shape by locale. 

   For example, I built a "product name format" function into Amazon's devices. Each product knew (in each supported locale) its generic, short, medium, long, and full name, and each product's name could vary in gender/count/etc. per language. That is, the generic might be a "tablet" or "TV" (or whatever) and then the e.g. tablet might be called a "Fire", a "Fire 8 HDX", etc. 
   
   The software doesn't know which device it'll be built into (actually, it's built into all of them), so the formatter needs to select the correct pattern string according to device it is in at runtime. Rather than build separate strings for every device, we generated variations based on the (smaller) set of grammar variations per-locale. A simple message like `The {whatever} is ready` in English might look sort of like the following (in our syntax) in a French locale (and I'm omitting for clarity such things as enclitic handling, e.g. when it's `l'ordinateur` not `le ordinateur`):

   ```
   match {$product :gender}
   when masculine {Le {:product format=generic} est prêt.}  ; le téléphone est prêt
   when feminine {La {:product format=generic} est prête.}  ; la télévision est prête
   when * {L'appareil est prêt.} 
   ```

   Notice that it isn't just the article that changes. And notice that the list of enumerated values changes by language (so German has three noun genders while English mostly has one)
   
Some potential examples of (2):

1. **Application specific selection.** Developers may need to write selectors with varying degrees of selection. For example, one might have a message that varies by category and then, for specific items, by sub-category:

```
match {$itemData :category}
when categoryElectronics  {There is a sale in electronics today}
when subcategoryComputers {There is a sale on computers today}
when *                    {There is a sale in this category today}
```

---

(worked examples)

#### Column-First Sorting

Using the value `1` for the first _selector_ matches values `1` and `one` in the `en` locale. The matrix removes other values and sorts the remainder thusly:

```
1   one one
1   one *
1   *   one
1   *   *
one one one
one one *
one *   one
one *   *
```

Using the value `1` for the second _selector_ results in this list:

```
1   one one
1   one *
one one one
one one *
```

Using the value `1` for the third _selector_ results in this list:

```
1   one one <-- the winner
one one one
```

Using the values `11`, `11`, `1` goes like this:

```
*   one one
*   one *
*   *   one
*   *   *
```
=>
```
*   *   one
*   *   *
```
=>
```
*   *   one <-- winner
```

**What about backtracking?**

It is possible to write matrix values that require column-first selection to go back to the larger matrix:

```
0   *   *
2   0   0
one one one
one one *
one *   one
one *   *
*   one one
*   one *
*   *   one
1   one one
1   one *
1   *   one
1   *   *
*   1   *
*   *   *
```

with values `2`/`1`/`11` goes like this:

```
2   0   0
```
=>
```
(empty set) <-- 1 != 0
```

If the `*` value is considered a match (not filtered) this isn't a problem:

```
2   0   0
*   one one
*   one *
*   *   one
*   1   *
*   *   *
```
=>
```
*   1   *
*   one one
*   one *
*   *   one
```
=>
```
*   1   * <-- winner
*   one *
```

