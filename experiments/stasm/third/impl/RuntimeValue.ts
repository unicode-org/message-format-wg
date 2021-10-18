export abstract class RuntimeValue<T> {
	public value: T;

	constructor(value: T) {
		this.value = value;
	}
}

export class RuntimeBoolean extends RuntimeValue<boolean> {}
export class RuntimeNumber extends RuntimeValue<number> {}
export class RuntimeString extends RuntimeValue<string> {}
