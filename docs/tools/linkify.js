// Work in progress: tooling to linkify the HTML produced from
// the MessageFormat 2 markdown.
// this has been tested on the tr35-messageformat.html file
// but not implemented in LDML45
function linkify() {
  const terms = findTerms();
  const missing = new Set();
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
  // report missing terms
  // (leave out sort if you want it in file order)
  Array.from(missing).sort().forEach((item)=> {
      console.log(item);
  });
}

function findTerms() {
  const terms = new Set();
  document.querySelectorAll("dfn").forEach((item) => {
    // console.log(index + ": " + item.textContent);
    const term = generateId(item.textContent);
    // guard against duplicates
    if (terms.has(term)) {
        console.log("Duplicate term: " + term);
    }
    terms.add(term);
    item.setAttribute("id", term);
  });
  return terms;
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
