# Decision making process


## Definitions
1. *Consensus* is defined as lack of sustained opposition.
2. *Good standing* is a characteristic of group members who fullfill their implicit and explicit obligations and hence are allowed to excercise all of their rights within the group without restriction.
3. *Blacklist* (*blacklisted*, *blacklisting*) is a taxative enumeration of group members who are temporarily excluded from exercising their rights within the group.
4. *Normative keywords* as defined in [BCP 14](https://tools.ietf.org/html/bcp14)

## Rules
1. Any current group member is deemed to be in good standing unless blacklisted.
2. Any group member in good standing MAY make a proposal to the group via
    - raising an issue,
    - PR (against the repo or wiki), or
    - orally in a monthly group meeting.
3. Approval or rejection of proposed solutions and decisions SHOULD be driven by consensus.
4. Consensus MAY be reached as part of the PR or issue resolution process.
5. The monthly group meeting has the ultimate decision making authority.
    - Chair Group or Chair don't have a decision making authority, see [chair-group.md](chair-group.md) and [chair-group-members.md](chair-group-members.md).
6. In case consensus cannot be found over multiple iterations of arguments and counter arguments, a monthly group meeting MAY reach consensus to mandate the Chair Group to organize a ballot among all group members in good standing. The ballot wording, options, and success criteria SHOULD be explicitely defined in a monthly meeting. The Chair Group only administers and implements the ballot and its results.
7. Blacklisting procedure is TBD by monthly meeting consensus if and when needed.

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
