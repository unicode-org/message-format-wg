# Decision making process

## Definitions

1. _Consensus_ is defined as lack of sustained opposition.
2. _Good standing_ is a characteristic of group members who fullfill their implicit and explicit obligations and hence are allowed to excercise all of their rights within the group without restriction.
3. _Proscribe_ (_proscribe_, _proscribed_, _proscription_) is a taxative enumeration of group members who are temporarily excluded from exercising their rights within the group.
4. _Normative keywords_ as defined in [BCP 14](https://tools.ietf.org/html/bcp14)

## Rules

1. Any current group member is deemed to be in good standing unless proscribed.
2. Any group member in good standing MAY make a proposal to the group via
   - raising an issue,
   - PR (against the repo or wiki), or
   - orally in a group meeting.
3. Approval or rejection of proposed solutions and decisions SHOULD be driven by consensus.
4. Consensus MAY be reached as part of the PR or issue resolution process.
5. The working group has the sole decision making authority.
6. In case consensus cannot be found over multiple iterations of arguments and counter arguments, a group meeting MAY reach consensus to mandate the Chair to organize a ballot among all group members in good standing. The ballot wording, options, and success criteria SHOULD be explicitely defined in a meeting. The Chair only administers and implements the ballot and its results.
7. Proscription procedure is TBD by meeting consensus if and when needed.

## Fast-Tracking PRs

Special exception is made for pull requests seeking to make any of the following
changes to this repository:

- Errata fixes.
- Editorial changes.
- Meeting minutes.
- Updates to the delegate list.
- Doc Fixes.

Spec changes cannot be fast-tracked.

To propose fast-tracking a pull request, apply the **_fast-track_** label.
Then add a comment that group members may upvote.

If someone disagrees with the fast-tracking request, remove the label.
Do not fast-track the pull request in that case.

The pull request may be fast-tracked if two group members approve the fast-tracking request.
To land, the pull request itself also needs two approvals from group members.

Group members may request fast-tracking of pull requests they did not author.
In that case only, the request itself is also one fast-track approval.
Upvote the comment anyway to avoid any doubt.
