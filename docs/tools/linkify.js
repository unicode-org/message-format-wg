// Work in progress: tooling to linkify the HTML produced from
// the MessageFormat v2 markdown.
// this has been tested on the tr35-messageformat.html file
// but not implemented in LDML45

const terms = new Array();
var missing = new Set();

function findTerms() {
  document.querySelectorAll("dfn").forEach(generateAnchor);
  // console.log(terms.length);
}

function generateAnchor(item, index) {
  // console.log(index + ": " + item.textContent);
  let t = generateId(item.textContent);
  terms.push(t);
  item.setAttribute("id", t);
}

function linkify() {
  const links = document.querySelectorAll("em");
  links.forEach(checkLink);
  // debugging
  // console.log(terms.length);
  // console.log(missing.length);
  // console.log(missing);
}

function checkLink(item) {
  var t = generateId(item.textContent);
  if (terms.includes(t)) {
    link(item, t);
  } else {
    missing.add(t);
  }
}

function link(item, target) {
  var a = document.createElement("a");
  a.appendChild(document.createTextNode(item.textContent));
  a.href = "#" + target;

  var el = item.lastElementChild;
  if (el) {
    el.innerHTML = "";
    el.appendChild(a);
  } else {
    item.innerHTML = "";
    item.appendChild(a);
  }
}

function generateId(term) {
  var retval = term.toLowerCase();

  if (retval.endsWith("rategies")) {
    // found in the bidi isolation strategies
    retval = retval.substring(0, term.length - 3) + "y";
  } else if (retval.endsWith("s") && retval !== "status") {
    // regular English plurals
    retval = retval.substring(0, term.length - 1);
  }
  return retval.replaceAll(/ /g, "-");
}
