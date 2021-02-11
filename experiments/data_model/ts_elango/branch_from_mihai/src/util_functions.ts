export function mapToObject<T>(obj?: Map<string, T>) : {[k: string]: T} {
	const result: {[k: string]: T} = {};
	if (obj) {
		obj.forEach((val: T, key: string) => {
			result[key] = val;
		});
	}
	return result;
}

export function objectToMap<T>(obj?: {[k: string]: T}) : Map<string, T> {
	const result = new Map<string, T>();
	for (const key in obj) {
		result.set(key, obj[key]);
	}
	return result;
}
