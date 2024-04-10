// Work in progress: tooling to linkify the HTML produced from
// the MessageFormat v2 markdown.
// this has been tested on the tr35-messageformat.html file
// but not implemented in LDML45

	const terms = new Array();
	
	function findTerms() {
	   document.querySelectorAll('dfn').forEach(generateAnchor);
	   console.log(terms.length);
   }
	
	function generateAnchor(item, index) {
    // debugging: print the list of terms
		// console.log(index + ": " + item.textContent);
		let t = generateId(item.textContent);
		terms.push(t);
		item.setAttribute('id', t);
	}
	
	function linkify() {
		const links = document.querySelectorAll('em');
		links.forEach(checkLink);
		// console.log(terms.length);
	}
	
	function checkLink(item) {
		var t = generateId(item.textContent);
		if (terms.includes(t)) {
			link(item, t);
	  } else {
      // check that these are all just italicized strings that aren't terms
			console.log(t);
	  }
	}
	
	function link(item, target) {
		var a = document.createElement('a');
		a.appendChild(document.createTextNode(item.textContent));
		a.href = '#' + target;

    // 'dfn' (or maybe other markup) appears inside the 'em'
		var el = item.lastElementChild;
		if (el) {
		   el.innerHTML = '';
		   el.appendChild(a);
		} else {
		   item.innerHTML = '';
			 item.appendChild(a);
	  }
	}
	
	function generateId(term) {
		var retval = '';
		if (term.endsWith('s') && term !== 'status') {
			retval = term.substring(0, term.length - 1);
		} else {
			retval = term;
		}
		retval = retval.replaceAll(/ /g, '-');
		return retval.toLowerCase();
	}
