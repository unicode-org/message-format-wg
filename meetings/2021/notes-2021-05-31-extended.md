[Automatic Transcription](https://docs.google.com/document/d/1DN9BDkJqtnY3UoI28k3PYUcLhsjlhk3fJK5J2LC_Atk/edit)

### May 31, extended meeting Attendees
- Romulo Cintra - CaixaBank (RCA)
- David Filip - Huawei, OASIS XLIFF TC (DAF)
- Daniel Minor - Mozilla (DLM)
- Eemeli Aro - OpenJSF (EAO)
- Richard Gibson - OpenJSF (RGN)
- Elango Cheran - Google (ECH)
- Zibi Braniecki - Mozilla (ZBI)
- Staś Małolepszy - Google (STA)


## MessageFormat Working Group Contacts: 

- [Mailing list](https://groups.google.com/a/chromium.org/forum/#!forum/message-format-wg)

## Next Meeting 

June 21, 11am PST (6pm GMT)  
July 5, 11am PST (6pm GMT)  - Extended



### Moderator : Rômulo Cintra 
 
Related issues : 
[68#](https://github.com/unicode-org/message-format-wg/issues/68)
[48#](https://github.com/unicode-org/message-format-wg/issues/48)
RCA: How should we start this discussion?
 
EAO: My understanding is that we want to define a particular syntax for MFv2 just like we have for current MessageFormat. That would be parseable and handled by tooling. 
 
ECH: Do we say "the canonical syntax" or "a canonical syntax"?
 
EAO: It says "the syntax".
 
ECH: That's fine, so that means to me that we maintain one syntax, and there will be other syntaxes, but there will be only one data model, which is the important part to me.
 
RCA: Do you have any examples in which you have started looking at them?
 
EAO: Those examples are the JSON files and the Fluent examples which can be read by my prototyping code.  But we need our own syntax that supports features that cannot be supported by current MessageFormat or Fluent, like having selections on messages using more than 1 selector arg to define a selection case.
 
RCA: What is our starting point?
 
EAO: I think we can start at select messages. Whether the syntax for the selection should be embedded in a message, or should it be part of the structure of the larger message that approaches a file format.
 
ECH: What does "approaches a file format" mean?
 
EAO: MessageFormat defines a simple message format and selection message. But Fluent designed its own format for representing collections of messages.
 
RCA: STA, could you share the principles or drivers that made Fluent come up with the new format?
 
STA: Well, EAO was there a question of a single version or a collection of messages. But then there was the question of how Fluent compares to MFv1?
 
EAO: MFv1 defines a simple message, and a selection message. But if we define a collection of messages, and in a way that is clear for how selects happen. That could work for a simple message. But 
 
STA: Are you suggesting that we have a hierarchy of messages?
 
EAO: I'm saying that this is a decision that we should address and find an answer to.
 
ECH: I don’t think that supporting a collection of messages implies that there is a file format that needs to be designed. I don’t think it needs to be a file either.
 
STA: Talking about collections is useful. I’m not sure we need to solve syntax right now, that is ahead of us.
 
ZBI: I think that ECH is conflating two concepts. I don’t think we should be narrowing ourselves and we need to make sure we can express our data in a non-file format. But at the same time, we do need to define a file format to target the web. Once we move beyond pure JavaScript, we need to think about how what we’re doing will be used by further projects without trying to scope creep our current project. I hope whatever we design will be a good candidate for a localization system for HTML, and that will require a file format. But we need to recognize that it isn’t the only way to store data.
 
ECH: Having a grouping of messages is something that in the data model huddle meetings is something [we agreed upon early](https://github.com/unicode-org/message-format-wg/blob/experiments/experiments/data_model/ts_data_models_name_mapping.md). I think if you can create something that can be serialized to a stream of bytes, either a message or group of messages, where it is persisted is a detail exterior to MF2.0. There has to be some syntax, at least one syntax that we maintain. That syntax is not important, whatever is commonplace and requires the least amount of adoption effort, associative data (maps), sequential data (lists), then that is sufficient. Pretty much any syntax does that. JSON is common and does that, we’d have to define a schema.
 
EAO: I think we’re conflating two different things. One is the canonical source for how you write a message, e.g. in Fluent, MF1.0. The second is what is the expression of some set of messages that has been parsed, how is that to be represented. These are not the same and are optimized for different purposes. How well do we support the expression / embedding of MF2.0 messages into data structures that are used by traditional systems that are technically capable of having a single message being expressed. Is this concern high enough for us should we discard the possibility of using the structures and keys to drive how we do their select.
 
ECH: I don’t understand the distinction between the serialized format and the representation in memory.
 
EAO: If I’m writing a message, I want to write it in something humane and easy to write, something terse and easy to read and usable that way. Once this is parsed into the data model, the expression of this can be transferred in a different format that is useful for computers talking to computers. E.g. using YAML vs. using JSON.
 
ZBI: I think I have a better way to frame this: why is CSS not expressed in JSON? There were debates on how to encode CSS for the web in the early days, and they chose something other than JavaScript. So it’s worth considering we’d have a syntax that is not JavaScript based, we should not assume that JSON is the best way of handling this.
ECH: I consider this not metadata but data, I think the priority is that it is unambiguous to the computer and that making it human friendly is good. I think there’s an assumption in the analogy to CSS that doesn’t apply in the way I see things. Using CSS is talking about something that is a language and is mostly written by programmers and you’re editing it by hand. Translators are not usually programmers so to what extent are things being written by translators. Is CSS really crafted by hand these days.
 
ZBI: Is CSS really written by programmers these days, that is a good question.
 
ECH: Does optimization for presentation really matter? I don’t see what is special about a MF syntax that requires something that is specialized.
 
ZBI: Do you see it for CSS. Would you still create a separate syntax for CSS if you were designing it today?
 
ECH: Yes, because you’re editing it directly, so the text format is important. I don’t see that as being in MF. If we require that you need to be a programmer to do translation work, then how is the industry working.
 
EAO: Example from <…> When we’re talking about syntax for humans it needs to be easy to read, but when serialized for computers, it needs a structure that is easy to process. The other thing is that is representable in the data model should be representable in the syntax. We can imagine something that the data model can support that we would not necessarily want to be directly in the syntax, something that results from processing the syntax.
 
STA: I want to respond to ZBI who is talking about CSS. I do think it is a good analogy, but what is implicit is that we consider CSS a well-designed language. Is it? It represents complex ideas, but I’d hope that the result of our work is simpler than CSS. The syntax is simple, but the semantics are complex. If we want to design something for non-programmers so that it is easy, but we realize we’re working with a complex matter of grammar and languages.
 
RCA: I just want to share some thoughts on this analogy to CSS. I'm seeing more and more, nowadays, different ways of expressing CSS, ex: CSS-in-GS, etc. It's quite easy to represent CSS as it is to others who know CSS. A good starting point to represent them differently in structure -- a very non-standard way to represent CSS -- the existing ways how flexible we can be in representing CSS. But it brings up the question of how effective were they in designing the original CSS file format? In this year 
 
ECH: I’m going to not touch that question for now, because it is more like a programming language question. I wanted to respond to EAO’s example. EAO, you were talking about two different use cases, the more important use case is the one in which computers talk. And that goes with the idea that we’re including functionality. I’m not precluding the idea that we should have a compact, concise representation for humans, but we shouldn’t maintain as a group a syntax which limits what you can do in the data model. If we choose JSON, and we have a YAML representation that doesn’t have all of the functionality, but we shouldn’t limit our canonical syntax. I prioritize computers over humans when push comes to shove.
 
EAO: I think computer exchange of data model is relatively easy and non-controversial if we ensure that the data model is representable in json. If it supported by json, it is easy to guarantee that machine exchange will work. I don’t think that that expression is the best expression for humans to use. It is verbose and not suitable for humans to write by hand.
 
RCA: Adoption of MF2.0 could be affected based upon this decision.
 
ECH: I was going to say we don’t need to consider the human representation, our job should just be the version that works with computers and if other people want to make something human readable, that is fine. How different is that going to be from JSON for simple messages? If things get more complicated then we need something fully functional. If that does affect adoption, then human friendly representation might be important. How often are people editing things by hand that are complicated?
 
EAO: At least with MF1, the only way to do it is to write the source by hand. We don’t know where the future will take us, but at the moment, anything complicated needs to be written by hand.
 
STA: From Fluent, we designed it such that it could be edited by hand by pretty much anyone. Once we started using it, I realized that the only people who were interested in editing Fluent by hand were mostly programmers, and a few translators with programming experience. My recollection is that I personally felt some disappointment that we weren’t able to convince “regular” translators to use Fluent syntax. Instead we jumped through hoops to hide syntax from them and design rich UIs so they don’t have to see syntax. This could be part of a larger conversation about who we expect to edit these files. It is easy to think about translators, but they will likely favour graphical UIs over syntax. But programmers create those localizable strings when they write code, and they will favour a text syntax.
 
ZBI: We shared this experience, but I think I see it slightly differently. This is more in alignment with how ECH sees it. Editing by hand is a fallback. Predominantly localizers will work with UI. I see three scenarios where this doesn’t happen:
1) Programmers adding new localizable sources.
2) Some organizations will lack resources for UI design / development, and will want to just edit files for simplicity.
3) Fallback, in a big project we create a chain through localization UI, and then there is a last second mess that needs to be fixed quickly. E.g. mistranslated string days before release, can be fixed directly, skipping all of the UI steps.
 
ZBI: I think that it is a fallacy to say that because UI is the primary target, that we can discount the fallback to text, even if it is the minority of use cases. We could let other people design the human representation, but I think it is a fallacy to say that it is not necessary.
 
ECH: We can build tooling to handle complicated messages and tooling in text editors can help programmers with this. It is important to make things work for translators, let programmers deal with complexity and textual representations if they need to. Tooling can solve some complications from verbosity. I trust programmers to handle this.
 
RCA: Do we have an idea of next steps?
 
EAO: We need a decision on whether we consider human friendly syntax to be a deliverable. We agree on computer friendly representation, but we need to decide on what will fulfill our deliverable with regard to syntax.
 
RCA: I’m not sure if we can decide this now, or after we have one data model.
 
EAO: I think it is orthogonal between how the data model looks and whether it has a single syntax.
 
RCA: We might not want to go deep on syntax while we still have to merge data models. The syntax is the representation of the data model, for the end user the syntax is what matters, not the data model.
 
STA: I think we should proceed in parallel, since we’re somewhat blocked on the data model front. The syntax discussions might inform the data model discussions. The select logic would be a good action item for this group. We should limit ourselves to a single message for now. I think syntax is tricky whenever people use ‘human friendly’ or ‘readable’ because no one understands these terms the same way.
 
RCA: If we parallelize this, everything we do requires pushing something further in the future. This might require more effort if we split, we might not finish our first goal.
 
EAO: I second what STA said. Since we’ve postponed the decision on the data model discussion, one thing that the syntax discussion might give is feedback on how we can represent parts of the data model in the syntax which might inform the data model design. If something is very difficult to represent in the syntax, it might not be worthwhile including in the data model.
 
ECH: I think the syntax discussion won’t be super in depth and abstract like the data model discussion. So I think it makes sense to do things in parallel. I do want to clarify that we haven’t postponed the data model discussion, it is just taking a long time.
 
EAO: I meant that we postponed making a decision on the data model, not postponed the data model itself.
 
RCA: I think we’ve made a good start.
 
ECH: We should check with the larger group on whether to proceed with the syntax in parallel.
EAO: We should open an issue for this.
 
ECH: Clarifying in an issue, with some of the points about machine readable vs. human friendly.
 
RCA: Creating an issue would help people who are not here. We can make things more concrete.
 
ECH: We should also discuss adoption, but that is subjective in the absence of more data. At some point we’ll have to make a decision and we probably won’t have data to base it on.
 
EAO: We’re 15 minutes over, the meeting is officially over.
 
 
 
