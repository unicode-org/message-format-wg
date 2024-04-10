// Work in progress: tooling to linkify the HTML produced from
// the MessageFormat 2 markdown.
// this has been tested on the tr35-messageformat.html file
// but not implemented in LDML45
const terms = new Set();
const missing = new Set();
function findTerms() {
  terms.clear();
  document.querySelectorAll("dfn").forEach((item) => {
    // console.log(index + ": " + item.textContent);
    const term = generateId(item.textContent);
    terms.add(term);
    item.setAttribute("id", term);
  });
  // console.log(terms.length);
}

function linkify() {
  missing.clear();
  const links = document.querySelectorAll("em");
  links.forEach((item) => {
    const target = generateId(item.textContent);
    if (terms.has(target)) {
      const el = item.lastElementChild ?? item;
      el.innerHTML = `<a href="#${target}">${item.textContent}</a>`;
    } else {
      missing.add(target);
    }
  });
  // console.log(terms.length);
  // console.log(missing.length);
  // console.log(missing);
}

function generateId(term) {
  const id = term.toLowerCase().replaceAll(" ", "-");
  if (id.endsWith("rategies")) {
    // found in the bidi isolation strategies
    return id.slice(0, -3) + "y";
  } else if (id.endsWith("s") && id !== "status") {
    // regular English plurals
    return id.slice(0, -1);
  }
  return id;
}
