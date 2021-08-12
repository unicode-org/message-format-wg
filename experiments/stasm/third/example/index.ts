let args = process.argv.slice(2);
if (args.length !== 1) {
	console.error("Usage: npm run example EXAMPLE_NAME (e.g. glossary)");
	process.exit(1);
}

let example_name = args[0];
import(`./example_${example_name}.js`);
