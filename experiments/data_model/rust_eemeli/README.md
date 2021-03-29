# Proof of Concept for Handling Deep & Variable Message Structures

This is a PoC requested by Mihai for handling function references with an unlimited number of arguments of variable shapes. This was seen as obviously possible in dynamically types languages such as JavaScript; hence the Rust implementation here.

The example reads its input from two files:

- `messages.json` contains the JSON representation of a message resource in the shape defined in [ts_eemeli/data-model.d.ts](../ts_eemeli/data-model.d.ts).
- `scope.json` describes the variables available in the current scope, slightly simplified to use `Record<string, string | string[]>` as its shape.

For the sake of simplicity, only the following `Part` values are accepted:

- `string` - literals
- `{ var_path: [string] }` - scope variable references with a path length of one
- `{ func: 'list-format', args: Part[] }` - simplified list formatter

Of the example messages, note in particular:

- `mix-three` includes both literals and variable references as arguments
- `list-in-list` includes the output of one list formatter as one of the arguments of another list formatter.

To run the Rust PoC, you'll need to have [Cargo](https://doc.rust-lang.org/cargo/index.html) and Rust installed; then run the following command in this directory:

```
cargo run messages.json scope.json
```

A matching JS implementation is also provided:

```
node list-format-proto messages.json scope.json
```

Please note that this is literally the first thing I've ever written in Rust, so the code is probably uglier than I can actually imagine. Also, "error handling" is done by panicking if anything at all goes wrong.
