Attendees:
Please fill in a 3-letter acronym if this is your first meeting:
- Suggestion 1: First letter of given name, First letter of surname, Last letter of surname
- Suggestion 2: First initial, middle initial, last initial
- Suggestion 3: Custom


#### March 29, Meeting Attendees:
- Romulo Cintra - CaixaBank (RCA)
- Daniel Minor - Mozilla (DLM)
- Nicolas Bouvrette - Expedia (NIC)
- Eemeli Aro - OpenJSF (EAO)
- Mihai Nita (MIH)
- Elango Cheran - Google (ECH)
- Luke Swartz - Google (LHS)
- Shane Carr (SFC)
- Robert Heinz - Nike (RHZ)
- Zibi Braniecki - Mozilla (ZBI)
- David Filip - Huawei, XLIFF TC liaison (DAF)


## MessageFormat Working Group Contacts: 

- [Mailing list](https://groups.google.com/a/chromium.org/forum/#!forum/message-format-wg)

## Extended Meeting
 
 
## Summary documents
 
ECH: I created documents to summarize the existing proposals. How do people feel about these docs to summarize and collect the arguments? I believe that we will need such summaries, and that these can be done in parallel to any other discussions.
 
https://docs.google.com/document/d/1L5W1PE7V_UyO1XgYdPouOwRZfpI2vGozNb47PM7puz8/edit#heading=h.2tho5bx87ubb
 
https://docs.google.com/document/d/13jc78fnrIBq-qSHMDXK_bILzlKbgJVmAuek5Xj1lAvI/edit#heading=h.2tho5bx87ubb
 
Everyone with the link has edit permissions, so feel free to contribute and share with others who may also want to. I also want to suggest that we only contribute to the proposal(s) that we agree with, and that we don’t leave critical comments on other proposals. Instead, view other proposal documents as read-only and use those arguments to strengthen your own argument.
 
EAO: I agree that these proposal documents are worth expanding on, and that they can be done in parallel to other discussions.
 
## Discussion on [Issue 159](https://github.com/unicode-org/message-format-wg/issues/159)
 
EAO: I would like to discuss Issue 159. This is something that arose for me very strongly after the plenary discussions. It is not about the data model, but it is about the assumptions made about how the data model relates to what we are doing, and whether there are other parts. It is important to build this as a system that is relevant and powerful for translators. The view into the structure of the message that the data model provides -- should it be a 1-to-1 mapping between that and what the translators see? Or could the data model be more complex, and then we have a subset that converts to and from XLIFF, and have tooling to support more featureful views to translators?
 
MIH: My position is that the two things should not be tightly coupled, but relatively coupled. The two things will be used by translators, so they should match, otherwise it is a misfit. We should not confuse what translators do with XLIFF. XLIFF has standard ways to be extended.
 
LHS: I haven't read through ECH's summaries yet, so I may oversimplify, but I think this view is helpful to think about. When I think about these 2 proposals, I think the one that EAO is proposing is one that can sit on top of the data model. I think the same is true for the other proposal, there are some that are useful for translators and some are useful for developers. Or maybe it's between professional translators and developer-translators. But I see that there are tradeoffs, and that it is messy, which is why it is not easy. Does that not make sense?
 
MIH: Hearing what LHS said helps clarify what bothers me about the question posed in issue 159. The real question at hand is what do human languages require? When we discover requirements based on that, we change the data model. But that is what should drive our decisions more than what translators see.
 
DAF: To MIH's point about accessibility to translators doesn't mean expressible in XLIFF, it doesn't mean they are disconnected / laissez-faire. There is a core that is required in XLIFF. I am fairly sure that a module or two in XLIFF that extends the core may be required of MF 2.0, but we cannot create a data model that is incompatible with the core.
 
MIH: What DAF is mentioning about modules are the extensions that I proposed for XLIFF 2.
 
DAF: There was an issue in the past in XLIFF about text units and grouping, and I prefer supporting that issue through grouping.
 
EAO: Regarding the XLIFF 2 discussion, can we design the data model independently of XLIFF 2? We could have a data model for MF, and have a separate data model that is more compatible with XLIFF 2? I would prefer these 2 things to be separate. Otherwise, the design of the data model will be coupled with XLIFF 2.
 
MIH: My position is clear -- the design of the MF data model and the transformation of XLIFF 2 should be done in parallel. But we cannot design the data model without XLIFF informing our decision. But I would like to go back to the point about requirements coming from linguistic features. We should consider our requirements coming from linguistic features. Can we decide on that?
 
RCA: Let us have everyone give their opinions and then we can try to come to an agreement on this.
 
ZBI: Maybe we are conflating 2 concepts that do not need to be conflated? I am not being opinionated. On the topic of whether the data model should be coupled to XLIFF, I think MIH is describing what I'll call "semantic representation", and EAO is describing "container representation". What MIH says about linguistic features (plurals, gender, case) are about semantic features. For container features, we think about the features that the formats represent, and we think about how the transformations could happen. I wonder if there is a way to escape the responsibility of supporting all linguistic features and being a custodian to having to represent all linguistic features in MF?
 
EAO: The shape of the XLIFF representation doesn't have to match the shape of the data model. When I put together the proposed model, I put together 3 different possible examples of what can be done. My point here is to ensure that our model can represent the examples. But the question is whether there can be multiple representations or should there be only one?
 
DAF: To support what MIH said, these designs can be done in parallel. But we should be sure that they are done in connection with each other. Regarding "semantic representation" vs. "container representation", not all features in XLIFF are translation-specific. For example, the metadata module contains information that has information that the translators may or may not use. It might be possible to put data in the metadata module that is developer-specific that are not shown to the translators, but that is not how it is designed.
 
If you round-trip something as a container, that is by design. If you represent something in the core, it will likely round-trip. If you represent something using existing modules, then it will probably round-trip. If you represent something in new modules, then it might translate. But if you don't need information from a module, then you don't have to touch it for translation purposes, and we just need a good fallback mechanism.
 
MIH: What ZBI said is not what I mean. I don't argue for semantic representations at all. We should look at what languages require as features and make sure they are representable in our data model. We don’t need to reflect those features 1:1. A map has keys and values, I can design a collection with generic keys and values and it is usable for all kinds of stuff. But I’m not going to design a tree when all I need is a map. It needs to be rich enough to represent any linguistic features, but no more than that. Otherwise it is too complex.
 
STA: Going back to the presentation from last time, there were two approaches that are related to this question. Is this really about the data model vs. the standard library, where we can express some of the linguistic features directly in the data model, or we can provide an agnostic way in the data model to call functions? And in the XLIFF translation layer, can we provide a mapping between the standard library and XLIFF?
 
EAO: This issue is that some aspects of the data model defining the structure of the data model and this structure can’t be extended by standard library components really. If we need a strong link between the data model and the XLIFF2 representation that forces certain simplifications on the data model. If we don’t have the forced link, we can consider structures in the data model that are not represented in XLIFF2.
 
STA: Is there a specific example of something we worry about not being able to express, or is this more of an abstract worry?
 
EAO: The intent was to structure the question so that we don't go into the details of the data model, but instead to describe the edges of the discussion where the decision affects how we proceed on those details. One example is the range formatter, where the start and the end variables are coming in.
 
RCA: After our first rounds of discussion, do we have enough information to set up votes and take clear decisions? Or do we need more information?
 
EAO: How about the +1 to -1 range we used earlier for voting?
 
MIH: This decides something we’ve been discussing for months. Having a vote in the smaller group bypasses the larger group and the work we’ve been putting together for the past month.
 
RCA: Although at some point, we do have to do it.
 
EAO: My point of voting is not to take a decision, but it is to get a gauge on how people in the room are thinking.
 
ZBI: The phrase I like to use is to "check the temperature of the room".
 
RCA: Okay, let's do that, voting to check the temperature of the room.
 
https://www.apache.org/foundation/voting.html 
+0: 'I don't feel strongly about it, but I'm okay with this.'
-0: 'I won't get in the way, but I'd rather we didn't do this.'
-0.5: 'I don't like this idea, but I can't find any rational justification for my feelings.'
-0.9: 'I really don't like this, but I'm not going to stand in the way if everyone else wants to go ahead with it.'
+0.9: 'This is a cool idea and i like it, but I don't have time/the skills necessary to help out.'
++1: 'Wow! I like this! Let's do it!'
 
Q1: Should the interface of the data model be directly connected (+1.0) or indirectly connected (-1.0) to translators?
Zibi: -0.5
DAF: 0
 
Q2: Should the data model be designed independently of the design of the transformation of the data model to/from the XLIFF, while still knowing that XLIFF transformation is required (+1.0), or should the design of the data model be based on linguistic features and with transformation to/from XLIFF being taken into account in the structure of the data model (-1.0)?
ZBI: +0.4
LHS: -0
EAO: +1
RCA: -0
MIH: -1
DLM: +0.7
STA: ?
ECH: -0.8
DAF: +0.7
 
DAF: I agree with STA that maybe we are agreeing with each other violently. The development should happen iteratively. We can always adjust as we go along.-1
 
MIH: I think we should design iteratively based on linguistic features. We should go in parallel and iterating, so that we don't make a difficult decision.
 
DAF: I don't agree with MIH on one point -- I think we should have a good idea of the design we are intending and what kind of features we are trying to support. Where the uncertainty comes is how do we support linguistic features that we haven't considered yet.
 
MIH: I'm not saying that the data model should be designed based on linguistic features, but that linguistic features should be encode-able in the data model.
 
ZBI: What I am understanding from MIH, is that data model nodes should be added for the sake of supporting linguistic features, but not for the sake of being more flexible. What DAF said that reminded me of an example from HTML/CSS, which is <div>. You can attach semantic information to <div> if you want, and over time, if you're using <div> to semantically represent a navigation bar, and over time, as several people start using it, the HTML spec evolves to represent that semantic / conceptual construct with the <navbar> tag itself. And if that is the model that DAF 
 
EAO: Can everyone read the shape of Q2 in the document, and do the Apache voting on that before the end of the hour?
 
STA: It sounded like there is a "tighter" model that MIH has been describing, but it is not clear to me what the other extreme is, and it doesn't seem like there is a clearly defined opposite, and maybe that's why it feels like there is no disagreement?
 
DAF: I agree that the other pole doesn't exist.
 
LHS: I wasn't hearing a clear difference between the options, so it's not clear where one ends and the other begins.
 
RCA: Let's vote in the doc on Q2. We don't have an agreement or that we're not opinionated. What are the next steps?
 
LHS: I think the two proposals should have their proponents to flesh out the contours of their proposal to make it more precise.
 
EAO: The shortest example for the proposal I support is, when you have a list range formatter, can you have the values for the 2 ends of the range come from 2 different variables, or must they come from one single variable? I think that question helps distinguish the 2 proposals, currently.
 
MIH: I went through the exercise of asking myself, "What would it take, what extra would need to change, for me to be able to support it?" After thinking, the answer I came up with is that linguistic features should be represented
But 
 
STA: I have a question for MIH, why did you choose -1?
 
LHS: Yes, it doesn't seem to me like there is a clear distinction between the options.

RCA: We are 10 minutes over time. Do we have any last comments? We have STA, and we should prepare for the next plenary meeting.
 
STA: As a meta-point, I think we're not really clear about what the disagreement is. And I'm glad we have more frequent meetings now. I put created an example here:
 
interface Element { name: string, value: string | Element };
 
<div></div>
<nav></nav>
<div><style>color: red;</style></div>
 
interface Element { name: string, value: string | Element; attributes: Map<string, string>};
 
<div style=”color: red;”></div>
 
 
I hope this is useful. I'm coming back to the analogy that ZBI mentioned. Imagine in HTML that we have a super simplistic model where Elements can only have Element and string children. We can then later add <nav> and <style> Elements. Or we could extend the data model itself by adding an attributes map to an Element, so that you can represent the new semantic information within the data model itself. Does this help the discussion?
 
MIH: No, this doesn't help. It is hard to make a comparison this way, because there are always new features to add. A better comparison would be to take the scenario where you have content in HTML that you want to translate, and then developers have code in the "onClick" / "onLoad" attributes that modify the page, and do you force the translators to look at the Javascript code in those attributes in order to do their translation, or to what extent?
 
EAO: I think the data model should be designed in such a way that the shape of the toggles can be decided later.
 
MIH: I don't understand what the shape of the toggles means in this example.
 
EAO: The shape of the data model is based on the shape of XLIFF.
 
MIH: No, but the design of XLIFF strongly informs the design of the proposal I support.
 
EAO: THe proposal that ZBI and I support is designed to be the minimal amount of nodes to represent any possible message construct.
 
STA: In Fluent, we used to call "push model" vs. "pull model" for design, in relation to the example of HTML content with relevant "onClick" code. The "push model" was about accepting any requirements that come through, while the "pull model" was
 
EAO: MIH, did you put together an interface for dynamic message references that we talked about?
 
MIH: I looked at it, but I realized that I didn't know what it meant.
 
EAO: There is an example in the prototype code, in file _____ at lines 106-123, there is "const extMessages: Resource = { … ". The object with "func: 'sparkle', args: …" is the dynamic message reference.
 
RCA: I may also change my vote because the differences are less clear to me. Let's work on summarizing the discussion for the plenary. We can also work on the discussion in the Github issue (159). Thanks for coming to this extra meeting, let's continue the discussions going. I am interested in how to hear 
 
EAO: Did you send an invite to the next extended meeting invite?
 
RCA: Yes, I have already sent out all of the instances of this event in the calendar invite.
 
