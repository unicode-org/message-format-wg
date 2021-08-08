import {readFileSync} from "fs";
import {resolve} from "path";

export interface Glossary {
	[key: string]: Term;
}

export interface Term {
	[key: string]: boolean | number | string;
}

export function get_term(locale: string, term_id: string): Term {
	let file_name = `glossary_${locale}.json`;
	// TODO(stasm): Don't read the file every time.
	let file_data = readFileSync(new URL(file_name, import.meta.url), "utf8");
	let glossary = JSON.parse(file_data) as Glossary;
	return glossary[term_id];
}
