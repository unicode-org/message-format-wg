/**
 * THIS IS NOT A GENERAL-PURPOSE EXAMPLE.
 *
 * This is a PoC requested by Mihai for handling function references with an
 * unlimited number of arguments of variable shapes. This was seen as obviously
 * possible in dynamically types languages such as JavaScript; hence this
 * implementation showing that it can also be used with statically typed
 * languages such as Rust.
 *
 * In other words, this partial implementation should not be taken as any
 * indication of the suggested execution model of the EZ data model. For that,
 * see:
 *
 * https://github.com/messageformat/messageformat/tree/mf2/packages/messageformat/src
 */

use serde_json::{Map, Value};
use std::env;
use std::fs;

fn format_list(values: Vec<String>) -> String {
    let mut res: String = "".to_owned();
    match values.len() {
        0 => {}
        1 => res.push_str(&values[0]),
        2 => {
            res.push_str(&values[0]);
            res.push_str(" and ");
            res.push_str(&values[1]);
        }
        _ => {
            let (last, head) = values.split_last().unwrap();
            res.push_str(&head.join(", "));
            res.push_str(", and ");
            res.push_str(last);
        }
    }
    res
}

fn resolve_var<'a>(var_ref: &Map<String, Value>, scope: &'a Map<String, Value>) -> &'a Value {
    let path = var_ref["var_path"].as_array().unwrap();
    assert_eq!(path.len(), 1);
    let id = path[0].as_str().unwrap();
    return &scope[id];
}

fn flatten_args(args: &Vec<Value>, scope: &Map<String, Value>) -> Vec<String> {
    let mut vec = Vec::new();
    for arg in args {
        let res = resolve_part(arg, scope);
        match res {
            Value::String(string) => vec.push(string),
            Value::Array(array) => {
                for string in array {
                    vec.push(string.as_str().unwrap().to_string())
                }
            }
            _ => {
                panic!("Unsupported arg part: {:?}", res)
            }
        }
    }
    vec
}

fn resolve_part(part: &Value, scope: &Map<String, Value>) -> Value {
    match part {
        Value::String(literal) => Value::String(literal.to_string()),
        Value::Object(fn_ref) => {
            match fn_ref.get("var_path") {
                Some(_path) => {
                    return resolve_var(fn_ref, scope).clone();
                }
                None => {}
            }
            assert_eq!(fn_ref["func"].as_str().unwrap(), "list-format");
            let args = fn_ref["args"].as_array().unwrap();
            let values = flatten_args(args, scope);
            let list = format_list(values);
            return Value::from(list);
        }
        _ => {
            panic!("Unsupported part: {:?}", part)
        }
    }
}

fn format_message(value: &Vec<Value>, scope: &Map<String, Value>) -> String {
    let mut res: String = "".to_owned();
    for part in value {
        let res_part = resolve_part(part, scope);
        res.push_str(res_part.as_str().unwrap());
    }
    res
}

fn main() {
    let args: Vec<String> = env::args().collect();

    let messages_str = fs::read_to_string(&args[1]).expect("Failed to read messages");
    let messages: Value = serde_json::from_str(&messages_str).expect("Failed to parse messages");
    let entries = messages["entries"].as_object().unwrap();
    println!("Message resource: {}", messages["id"]);

    let scope_str = fs::read_to_string(&args[2]).expect("Failed to read scope");
    let scope: Value = serde_json::from_str(&scope_str).expect("Failed to parse scope");
    let scope_map = scope.as_object().unwrap();
    println!("Scope: {}\n", scope);

    for (msg_id, obj) in entries {
        let value = obj["value"].as_array().unwrap();
        let msg = format_message(value, scope_map);
        println!("{}: {}", msg_id, msg)
    }
}
