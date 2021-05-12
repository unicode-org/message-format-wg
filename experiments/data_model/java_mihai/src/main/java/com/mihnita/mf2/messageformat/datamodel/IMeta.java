package com.mihnita.mf2.messageformat.datamodel;

public interface IMeta { // xliff:notes
	String comment();
	// Should be able to attach it to the main types (group of messages, message, placeholder, maybe plain_text?)
	// TBD what exactly we put here
	// But we would probably have things like
	//   - comments (with at lease category)
	//   - examples
	//   - restrictions (width, storage size, charset, see https://www.w3.org/TR/its20/)
	//   - links to screenshots, demos, help, etc (or even "embedded" screenshots?)

	// Beneficiaries of the meta:
	//   - translators & translation tools (think validation)
	//   - developers, dev tools (think lint)
	//   - in general dropped from runtime (at compile time, or ignored when doing the format)
}
