[Transcription](https://docs.google.com/document/d/1nDqbUaGwUVq_m8vBe4Jpjhdu50tu3D4vCXweQbOhivs/edit?usp=sharing)

#### May 3, Meeting Attendees:
- George Rhoten - Apple (GWR)
- David Filip - Huawei, OASIS XLIFF TC (DAF)
- Zibi Braniecki - Mozilla (ZBI)
- Daniel Minor - Mozilla (DLM)
- Eemeli Aro - OpenJSF (EAO)
- Mihai Nita (MIH)
- Jean Aurambault - Pinterest (JAU)
- Nicolas Bouvrette - Expedia (NIC)
- Elango Cheran - Google (ECH)
- Romulo Cintra - CaixaBank (RCA)
- Janne Tynkkynen - PayPal (JMT)
- Romulo Cintra - CaixaBank (RCA)
- Robert Heinz - Nike (RHZ)




## MessageFormat Working Group Contacts: 

- [Mailing list](https://groups.google.com/a/chromium.org/forum/#!forum/message-format-wg)

## Next Meeting

May 17, 11am PST (6pm GMT)

## Agenda
- [ Agenda on Github ](https://github.com/unicode-org/message-format-wg/issues/165)

### Moderator : Rômulo Cintra 
 
 
 
## [Issue #165](https://github.com/unicode-org/message-format-wg/issues/165) Candidate features to be implemented/tested in both data models
 
RCA: Let me open the issue and go through them. Before going through them, how should we prioritize the features? Do we vote here in the meeting, or count the points on Github?
 
EAO: I think this should be a pass / fail sort of thing.
 
RCA: Let's start with dynamic references.
 
EAO: The description should explain it.
 
MIH: I will implement because I said I would. As a feature, I think it is useless, because you can just pass the variable values as options.
 
ZBI: If I hear what MIH said right, dynamic references are not needed because fetch a translation and pass it formatted to another message. I specifically want this feature because they cannot work like that. In the case of UI bindings, you lose the lifecycle in dynamic overlays. If you do this in 2 steps, meaning you make changes at two points in time, if you change languages on the fly, then you lose the ability to make a proper message. You lose consistency and fallbacking. If you don't consider UI messages as a part of our work, then it is tempting to exclude points that 
 
MIH: Ok, fair enough.
 
EAO: I encourage anyone on the call to asynchronously review the issues. I have a comment on a couple of issues on the thread that ECH raised, because I don't think they have an impact on the data model. So I think we should start with people who have opinions on whether issues should _not_ be included so that we can have a negative filter and focus our time better.
 
RCA: +1, I agree. Let's focus on teh list. Can we jump to the next one? Okay, Plural Range Selectors.
 
MIH: This is one of the very things where I would give it a thumbs down. It feels artificial. A range has a start and end, so to pass only one endpoint as a parameter seems strange. It would be like formatting a date where the month and day are fixed, but the year is passed through -- why would you do that?
 
NIC: The only thing I can think of is the "a"/"an" issue where it depends on the number (?), and 
 
MIH: Is that a different feature, or is that a modification of this one?
 
NIC: I thought it was an application of plural range.
 
EAO: I opened #125, and there is another issue that is very similar. If I understand correctly,, what MIH doesn't like is that one range end comes in as a variable, but the other one doesn't.
 
MIH: Yes, pretty much.
 
EAO: I want to include this as it shows a clear difference between the data models, but I understand MIH's point that there are no real world use cases that 
 
GRH: As far as CLDR plural rules go, there should be explicit support for ___. Even if ranges are required, they can be separated and handled elsewhere. As far as definiteness, they can be defined in CLDR plural rules, anyways.
 
ZBI: I think GHR answered this. It sounds like translators, in GRH's experience, don't actually need this feature.
 
MIH: This feature feels intentionally construed, so 
 
RCA: Before we continue, I just want to reiterate that the main point here is to go through the features and understand and learn. We don't want to compete between data models. We just want to 
 
EAO: I want to point out that I have experience with a situation where the start and end of a range in a translation needed to be supplied from an external source, and that source (file) only supported numbers, not ranges, so I would have benefitted from range formatting.
 
DAF: I have a use case, and I want to see if MIH, EAO, ZBI can support this. In Czech, you have plural keywords many, one, few, etc. But for large numbers, you have this again, and I wonder if that would be supported.
 
GRH: I think I understand the problem. It sounds like there is a confusion between plural rules, where you have the ONE case, and the need to have ranges. I really want CLDR plural rules to be handle ranges. I don't these ranges handle if the last digit is a 1, which is a CLDR plural rules thing.
 
MIH: So there is no discussion here about supporting / not supporting ranges. I think the feature DAF was mentioning and the one GRH wants supported is something like "1 - 5 files" which depends on the start and/or end values of the range. The issue we're discussing here in #165 is whether you can pass the start and end as 2 individual parameters or as a tuple of 2 values. I am okay to implement it, but I don't think it will show any difference in the models.
 
DAF: You want to split month from day name because the months can have different genders. So that is a case where you want to split things up.
 
ZBI: 
 
`foo { PLURAL_RANGE($dateStart, $dateEnd) }`
vs.
`foo { PLURAL_RANGE($dateRange) }`
where `dateRange = ($dateStart, $dateEnd)` tuple written by an engineer
in practice, the difference is that in the latter model, the localizer interacts only with one variable and cannot fiddle with separately start/end variables.
 
Does that answer your question?
 
EAO: Just an observation, since we have agreed to include this one for now, it might be good to move to the next one.
 
RCA: Let's move to the next one, the multi-selector message. Issue #119.
 
EAO: That's a collection of deeply nested real-world selector messages. The point of this issue is to show that it can be handled in the data model.
 
RCA: Any comments? We have STA's example, NIC's examples, MIH's examples, EAO's examples.
 
EAO: I think we're fine, we're all in agreement that this one should be included.
 
RCA: Next is the custom list formatter.
 
EAO: This issue has a lot of overlap with the next issue, the first one from ECH. The issue is whether you can concatenate lists in the data model. It requires transformation/formatting on each item in the list.
 
MIH: Can you explain what you mean about concatenating lists?
 
EAO: Let's look at the link to the test suite, [line 354](https://github.com/messageformat/messageformat/blob/mf2/packages/messageformat/src/mf2-features.test.ts#L354). That takes in a list at run time and appends a word, and appends a word at the end. You have the list items on line 358, and you append another word at the end.
 
MIH: No, you can't concatenate to the list because you can't guarantee that it works in all languages.
 
EAO: So you're saying what's on line 370 doesn't work?
 
MIH: Not in all languages. It works in English, but it doesn't work in all languages.
 
EAO: Can you give an example of a language where it doesn't work?
 
MIH: You gave an example where you said some language could put that "another vehicle" at the beginning. The "another vehicle" is not in teh same bucket of the list items. I have a hard time explaining it.
 
EAO: Can someone else chime in? Am I off base / not understanding something?
 
DAF: I think I understand what MIH is saying. The "another vehicle" is an operator on the whole list, it is not an item of the list. Does that sound like what you were saying, MIH?
 
MIH: Yes, I can't explain it better.
 
DAF: Can you give an example of a language?
 
RCA: Let's move on to the next. ECH, do you have any comments?
 
ECH: The only thing I would point out is that the in the Tamil example, you have a word at the end of the list for conjunction / disjunction, and then when you conjugate that word for the dative case, you might have to double the consonant phoneme that begins the next word. But it also requires looking at the phoneme level of the words to know the beginning phoneme of the next word, which is a space not represented by code points or grapheme clusters segmentation. But these are issues that might apply to both data models in a way that might not affect the design of the data model itself.
 
GRH: ECH brings up good points on lists. I haven't seen use cases of adding an item to the end of the list. But we do have use cases of making it definite or indefinite, changing the case ("to"/"from"), etc.
 
EAO: It's something that I don't think affects how the data model should be.
 
MIH: I agree, I think it's about how smart the list formatter is.
 
DAF: I say that they are totally different features. I say "neighborhood-dependent formatting" is not constrained to lists at all. And then there are lists. I think the neighborhood-dependent formatting is completely orthogonal. Back to lists. You have operators on the list, like conjunction, disjunction, and so on. But "etc." is also an operator on the list, it is not an item.
 
ECH: I just wanted to reiterate what DAF described as "neighborhood-dependent formatting" as a formatting concern that's higher-level than just the list, because the list formatter will never know what the next word after the list is, no matter how smart it is. I wanted to make sure that the point is not lost.
 
MIH: Let's just take the list formatting operator point, but leave aside the higher-level formatting concern from the Tamil example, which also introduces an issue that doesn't affect the data models.
 
EAO: +1
 
RCA: Let's look at the next issue.
 
EAO: I think with the "inflections in interpolating placeholders" issue and the "Inflections" issue, these issues are similar. I think these won't make a difference in the models. But the "Full message fallback" is a different category of issue.
 
GRH: I want to point out that CLDR gives you rules about inflections, but it doesn't tell you whether the rules apply.
 
EAO: Since we are running out of time, can we leave out the "neighborhood" formatting feature?
 
DAF: Yes, this is orthogonal.
 
MIH: I +1 EAO's suggestion to leave it out, for considering later.
 
RCA: Next one is "Full message fallback". Any comments?
 
EAO: It impacts syntax, and it requires that the data model has metadata, but that is ia thing we've already agreed on doing. And it requires runtime formatting to change.
 
MIH: What does this have to do with metadata.
 
EAO: You have to provide a value for the fallback.
 
RCA: Next is inflections.
 
EAO: We agree that this was related to the neighborhood- / sentence-level formatting.
 
MIH: I wouldn't call it "Inflections" though. This isn't an inflection. For example, in English, to make something a definite using an article
 
GRH: For stuff like that, that is called a new surface form. You have a lemma, and in some languages, when it changes, it's a different surface form.
 
RCA: What should we do for next steps?
 
EAO: The next step is compare how these data models look after we support each of these features and analyze.
 
MIH: To implement, basically.
 
EAO: I would also like to present implementations of the tests for the proposal I'm supporting and a preliminary XLIFF conversion module.
