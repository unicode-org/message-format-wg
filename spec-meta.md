# META

To **add** content to or **change** a section of spec documents
or to **reorganise** sections,
please file a PR to this repo's `master` branch.
Each PR should only either add or change one section
(i.e. content directly under a `#` header or under a single `##` section title),
or reorganise sections.
Once a valid PR has been open for at least **two weeks**
it may be merged if:

- It is approved by:
  - **one active member** of the WG,
    if the PR adds a new section or reorganises sections
  - **three active members** of the WG,
    if the PR changes the contents of a section.
- No active members of the WG have reviewed it with "Request changes",
  or the specific concerns presented in their review have been addressed.
  Such a block on progress should only apply to the explicit minimal scope of the PR,
  so wanting it to be expanded should not prevent the smaller PR to be merged first.
- If an active member of the WG has requested additional time to review the PR,
  the PR has been open for **four weeks**,
  or said member has concluded their review.
- No other similarly approved PR exists with contents for the same section.
  If the PRs cannot be combined or have all but one withdrawn,
  the choice will be discussed at the next plenary meeting of the WG.
  If the plenary meeting does not conclude with a decision:
  - For PRs adding new sections or reorganising sections,
    a **simple coin toss** or some other fair random selection method
    will decide which PR gets initially merged at the end of the meeting.
  - For PRs changing the contents of an existing section,
    discussion will **continue offline** and at subsequent plenary meetings.

Contents of this working draft of the spec should be written in
[GitHub-flavoured markdown](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax),
with [semantic line breaks](https://sembr.org/)
separating sentences and other substantial units of thought.
Trailing whitespace should be trimmed,
and exactly one empty line should separate content blocks.
Typo fixes and other non-normative editorial corrections
may be merged with no regard for the minimum open time or other requirements,
as long as they have at least one approval and no change requests from active WG members.
Sections containing a single indented sentence _in italics_ should be considered empty,
as that is intended as an template for the section's contents.

This initial META section will not be a part of the final specification,
but the same above-defined rules apply to changing its contents.
The intent is to publish the specification first as a Draft Unicode Technical Standard (D-UTS)
and eventually have it accepted as a Unicode Technical Standard (UTS).
