# Notes on How to Create a Pour Over

Being a compendium of tasks needed to get a clean pour over of the spec.

> [!IMPORTANT]
> This is a work in progress. Do not believe anything you read in this page.
> If you are reading this, you're probably in the wrong place.

- get a JIRA ticket for the pour over
- update forks of cldr, message-format-wg
- pull message-format-wg
- pull cldr
- make a branch on cldr for the pour over (e.g. CLDR-18323-message-format-v47-pour) and check out the branch
- insert the spec parts over the contents of part 9 (tr35-messageFormat.md under docs/ldml)
   - remove subsidiary TOCs (from the README.md files in subdirectory parts and in intro.md)
   - as you go, change all cross-document links to local
      - some links are to spec/ and some are to <document>.md;
        generally you can replace `filename.md` with `#filename`, although the README ones are tricksy
      - change the many links to message.abnf to a section link
      - change the link to message.json to a section link
   - make a ## section for the message.abnf and insert with abnf backticks
   - make a ### section of message.json and insert with json backticks
   - altogether remove the why_mf_next link
- generate the toc (I used https://bitdowntoc.derlin.ch/) and check for errors

- git add/git commit/git push
- use the tools/scripts/tr-archive tools to generate the HTML
  instructions in that location in the CLDR repo
  use `npm run serve` to view the HTML output locally

> [!IMPORTANT]
> Be sure to make all commits in the CLDR style:
> `CLDR-jiranum <SPACE> description`



- Create a release in the message-format-wg repo
