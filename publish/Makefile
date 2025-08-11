ldml = cldr/docs/ldml
mf-target = $(ldml)/tr35-messageFormat.md
tr-archive = cldr/tools/scripts/tr-archive

all: dist
.PHONY: prepare dist clean
prepare: cldr/.git $(tr-archive)/node_modules/.package-lock.json header.md
dist: dist/index.html dist/css/reports-v2.css dist/css/tr35.css dist/js/anchor.min.js dist/js/tr35search.js
clean:
	rm -r dist gtag.html header.html
	cd cldr && git restore .

dist/index.html: $(mf-target) fix-archive.mjs gtag.html header.html
	@mkdir -p dist
	cp $(mf-target) ./dist/index.md
	node $(tr-archive)/archive.js
	node fix-archive.mjs
	rm ./dist/index.md

$(mf-target): cldr/.git $(tr-archive)/node_modules/.package-lock.json collect.mjs check-toc.mjs $(shell find ../spec -type f) | header.md
	node collect.mjs > $(mf-target)
	cd $(tr-archive) && node fix-tocs.js
	node check-toc.mjs < $(mf-target)

cldr/.git:
	git submodule update --init --remote --rebase cldr
$(tr-archive)/node_modules/.package-lock.json: $(tr-archive)/package-lock.json
	cd $(tr-archive) && npm ci

header.md: update-header-footer.mjs
	node update-header-footer.mjs < $(mf-target)

dist/css/reports-v2.css:
	@mkdir -p dist/css
	cd dist/css && curl -O 'https://www.unicode.org/reports/reports-v2.css'
dist/css/tr35.css: $(tr-archive)/assets/css/tr35.css
	@mkdir -p dist/css
	cp $< $@
dist/js/anchor.min.js: $(tr-archive)/node_modules/.package-lock.json $(tr-archive)/node_modules/anchor-js/anchor.min.js
	@mkdir -p dist/js
	cp $< $@
dist/js/tr35search.js: $(tr-archive)/assets/js/tr35search.js
	@mkdir -p dist/js
	cp $< $@

gtag.html: $(tr-archive)/gtag.html
	ln -s $<
header.html: $(tr-archive)/header.html
	ln -s $<
