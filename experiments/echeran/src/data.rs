use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::fmt;
use std::hash::{Hash, Hasher};

//
// traits
//

// This trait represents the action of formatting a struct 
// by using and interpolating known values for placeholders.
// Such known values might only be combined with the message templates later
// (ex: "runtime") than when the message template was created
// (ex: "authoring time").
trait FmtMsg {
    fn fmt_str(&self, act_ph_vals: &PHValsMap) -> String;
}

//
// structs
//

pub struct PHTypeAttributes {
    enumerated: bool,
}

#[derive(Clone, Hash, Eq, PartialEq, Debug)]
pub enum PlaceholderType {
    UNKNOWN, // from Google protobuf style guide, but is this necessary? I think not
    GENDER,
    PLURAL,
    OTHER(String) // let this be open-ended for all the things we know and
                  // all the future needs we can't predict.
}

// return a map with pre-defined meta-information about common PlaceholderTypes.
// I think this is useful, esp for an l10n/TMS system.  But I haven't decided
// if/how it relates strictly to message formatting itself, so unil then,
// this will actually be unused.  If this is useful, then the user can extend
//  this map to support whatever custom PH types that the user chooses to use
// in `Placeholder.OTHER(String)`.
pub fn ph_type_attrs_map() -> HashMap<PlaceholderType, PHTypeAttributes> {
    let mut m = HashMap::new();
    m.insert(
        PlaceholderType::GENDER,
        PHTypeAttributes{ enumerated: true }
    );
    m.insert(
        PlaceholderType::PLURAL,
        PHTypeAttributes{ enumerated: true }
    );
    m
}

#[derive(Clone, Debug, PartialEq)]
pub struct Placeholder {
    // id & name for PH, used for val interpolation in the formatted string.
    // Let the user decide whether this should be unique or shared
    // across multiple PH instances within the same message.
    // Ex: if PH represents a product name, then maybe you want to
    // call it PRODUCT_NAME everywhere that same string is reoccurs
    // in the message.
    // Ex: if you have multiple inline <span> tags that need to be
    // turned into placeholders, then you might want to use SPAN1,
    // SPAN2, ... to indicate that the contents may very well differ.
    // and <b> and <i> tags may just all be B and I because they are
    // semantically same, and therefore interchangeable.
    id: String,

    // type of the PH.
    // See notes for PlaceholderType for nuances of PH types.
    ph_type: PlaceholderType,

    // a user-supplied text representation of the PH, if available.
    // For PHs that are created by the user (or user's l10n tool),
    // taking a source document, parsing text units out of the doc file format, 
    // and replacing inline non-translatable content in each TU with a PH,
    // we already know the text that the PH is "holding the place" for.
    // If not present, then the value must be present in the map 
    // `SingleMessage.ph_vals` that is keyed by this PH's `Placeholder.id`.
    default_text_val: Option<String>,
}

impl fmt::Display for Placeholder {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", format!("{{{}}}", self.id))
    }
}

// PHValsMap indicates how to uniquely select a message,
// and it can also be used to hold the runtime values needed during
// during the formatting phase.
#[derive(Clone, Eq, Debug)] // impl for Hash and PartialEq below
pub struct PHValsMap {
    map: HashMap<String, String>, // TODO: type of value should prob be Any
}

impl PHValsMap {
    fn new() -> PHValsMap {
        PHValsMap { map: HashMap::default() }
    }
}

impl std::hash::Hash for PHValsMap {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let mut hasher = DefaultHasher::new();

        for (key, val) in &self.map {
            key.hash(&mut hasher);
            val.hash(&mut hasher);
        }

        hasher.finish();
    }
}

impl PartialEq for PHValsMap {
    fn eq(&self, other: &PHValsMap) -> bool {
        &self.map == &other.map
    }
}

impl fmt::Display for PHValsMap {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let entries = &self.map.iter();
        let entry_strs: &Vec<String> =
            (&self.map
                .iter()
                .map(|(k,v)| format!("{}:{}", k.clone(), v.clone()))
            .collect::<Vec<String>>());
        let entry_list_str = entry_strs.join(", ");
        let result_str = format!("{{{}}}", entry_list_str);
        write!(f, "{}", format!("{}", result_str))
    }
}

#[derive(Clone, Debug)]
pub struct TextPart {
    text: String,
}

impl fmt::Display for TextPart {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", format!("{}", self.text))
    }
}

#[derive(Clone, Debug)]
pub enum PatternPart {
    TEXTPART(TextPart),
    PLACEHOLDER(Placeholder),
}

impl fmt::Display for PatternPart {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let result = match &self {
            PatternPart::TEXTPART(text_part) => {
                write!(f, "{}", format!("{}", text_part))
            }
            PatternPart::PLACEHOLDER(placeholder) => {
                write!(f, "{}", format!("{}", placeholder))
            }
        };
        result
    }
}

#[derive(Clone)]
pub struct MessagePattern {
    parts: Vec<PatternPart>
}

impl fmt::Display for MessagePattern {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let part_strs: Vec<String> = self.parts.iter().map(|part| format!("{}", part)).collect();
        let pattern_str = part_strs.join("");
        write!(f, "{}", format!("[{}]", pattern_str))
    }
}

#[derive(Clone)]
pub struct MessageBase {
    pattern: MessagePattern,
    // The values stored in `ph_vals` should be the actual vals known for the
    // placeholders used in `pattern`.
    act_ph_vals: PHValsMap,
}

impl FmtMsg for MessageBase {
    fn fmt_str(&self, act_ph_vals: &PHValsMap) -> String {
        let mut result = String::new();
        for part in &self.pattern.parts {
            match part {
                PatternPart::TEXTPART(text_part) => {
                    result.push_str(&format!("{}", text_part));
                },
                PatternPart::PLACEHOLDER(placeholder) => {
                    let ph_id = &placeholder.id;
                    let ph_val_opt = act_ph_vals.map.get(ph_id);
                    match ph_val_opt {
                        Some(ph_val) => {
                            result.push_str(ph_val);
                        },
                        None => {
                            match &placeholder.default_text_val {
                                Some(default_text) => {
                                    result.push_str(&default_text);
                                },
                                None => {
                                    result.push_str(&format!("{}", placeholder));
                                }
                            }
                        }
                    }
                }
            }
        }
        result
    }
}

impl fmt::Display for MessageBase {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", format!("{}", self.pattern))
    }
}

pub struct SingleMessage {
    // unique id for the SingleMessage, globally unique.
    id: String,
    locale: String,
    msg_base: MessageBase,
}

impl fmt::Display for SingleMessage {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", format!("{}", self.msg_base))
    }
}

impl FmtMsg for SingleMessage {
    fn fmt_str(&self, act_ph_vals: &PHValsMap) -> String {
        let msg_base_clone = self.msg_base.clone();
        let updated_msg_base_clone = MessageBase {
            act_ph_vals: act_ph_vals.clone(),
            ..msg_base_clone
        };
        updated_msg_base_clone.fmt_str(act_ph_vals)
    }
}

fn phs_in_msg(msg: &SingleMessage) -> HashMap<String,Placeholder> {
    let mut result = HashMap::new();
    let base_message = &msg.msg_base;
    for part in &base_message.pattern.parts {
        match part {
            PatternPart::TEXTPART(text_part) => {},
            PatternPart::PLACEHOLDER(placeholder) => {
                let ph_name = &placeholder.id;
                if !&result.contains_key(ph_name) {
                    result.insert(ph_name.clone(), placeholder.clone());
                }
            }
        }
    }
    result
}

pub struct MessageGroup {
    id: String,
    messages: HashMap<PHValsMap, MessageBase>,
}

impl fmt::Display for MessageGroup {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let line1 = format!("{}: {{", &self.id);
        let last_line = format!("}}");
        let entries = &self.messages.iter();
        let mut entry_strs: &Vec<String> =
            (&self.messages
                .iter()
                .map(|(k,v)| format!("  {}: {}", k.clone(), v.clone()))
            .collect::<Vec<String>>());

        let mut all_lines: Vec<String> = Vec::new();
        all_lines.append(&mut vec![line1]);
        all_lines.extend((*entry_strs).clone());
        all_lines.append(&mut vec![last_line]);
        let result_str = all_lines.join("\n");

        write!(f, "{}", format!("{}", result_str))
    }
}

fn phs_in_msg_group(msg_group: &MessageGroup) -> HashMap<String,Placeholder> {
    let mut result = HashMap::new();
 //   let base_message = &msg.msg_base;
    for base_message in msg_group.messages.values() {
        for part in &base_message.pattern.parts {
            match part {
                PatternPart::TEXTPART(text_part) => {},
                PatternPart::PLACEHOLDER(placeholder) => {
                    let ph_name = &placeholder.id;
                    if !&result.contains_key(ph_name) {
                        result.insert(ph_name.clone(), placeholder.clone());
                    }
                }
            }
        }
    }
    result
}

// TODO: implement
// fn is_selectable(act_ph_vals: &PHValsMap, selector_ph_vals: &PHValsMap) -> bool {
//     true
// }

// TODO: implement
// impl FmtMsg for MessageGroup {
//     fn fmt(&self, act_ph_vals: &PHValsMap) -> String {
//     }
// }

pub enum MessageType {
    SINGLE(SingleMessage),
    GROUP(MessageGroup)
}

pub struct TextUnit {
    src: MessageType,
    tgt: MessageType,
}


//
// unit tests
// 

#[cfg(test)]
mod tests {
    use super::*;

    // Test the hash fn and equality overrides for the HashMap
    // in `PHValsMap`, which cares about the entire contents of the map (keys
    // and vals).
    #[test]
    fn test_ph_vals_map_hasheq() {
        let mut map1 = HashMap::new();
        &map1.insert(String::from("COUNT"), String::from("5"));
        let ph_vals1 =
         PHValsMap {
             map: map1,
            };

        let mut map2 = HashMap::new();
        &map2.insert(String::from("COUNT"), String::from("14"));
        let ph_vals2 =
         PHValsMap {
             map: map2,
            };

        let mut map3 = HashMap::new();
        &map3.insert(String::from("COUNT"), String::from("5"));
        let ph_vals3 =
            PHValsMap {
                map: map3,
            };

        assert_eq!(&ph_vals1, &ph_vals3);
        assert_ne!(&ph_vals1, &ph_vals2);
        assert_ne!(&ph_vals2, &ph_vals3);

        let mut map4 = HashMap::new();
        &map4.insert(String::from("count"), String::from("5"));
        &map4.insert(String::from("COUNT"), String::from("5"));
        let ph_vals4 =
            PHValsMap {
                map: map4,
            };

        assert_ne!(&ph_vals1, &ph_vals4);
        assert_ne!(&ph_vals3, &ph_vals4);
    }

    // Test the ability to create all constituent parts of a `SingleMessage`
    // and `MessageGroup`.  Also test the default string conversion fn impls
    // for the `Display` trait.
    #[test]
    fn test_construct_message() {
        // create `PHValsMap`s for selecting specific messages and holding
        // onto runtime PH values to interpolate during the formatting phase.
        let ph_vals1 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("=0"));
            m
        }};
        let ph_vals2 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("ONE"));
            m
        }};
        let ph_vals3 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("OTHER"));
            m
        }};

        // create `MessageBase`s to be (re-)used in `SingleMessage`s and `MessageGroup`s.
        let msg_base1 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::TEXTPART(TextPart{ text: String::from("No items selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };
        let msg_base2 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(Placeholder{
                        id: String::from("COUNT"),
                        ph_type: PlaceholderType::PLURAL,
                        default_text_val: Option::None,
                     }),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" item selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };
        let msg_base3 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(Placeholder{
                        id: String::from("COUNT"),
                        ph_type: PlaceholderType::PLURAL,
                        default_text_val: Option::None,
                     }),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" items selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };

        // build `SingleMessage`s and print

        let msg1 = SingleMessage {
            id: String::from("msg1"),
            locale: String::from("en"),
            msg_base: msg_base1.clone(),
        };
        let msg2 = SingleMessage {
            id: String::from("msg2"),
            locale: String::from("en"),
            msg_base: msg_base2.clone(),
        };
        let msg3 = SingleMessage {
            id: String::from("msg3"),
            locale: String::from("en"),
            msg_base: msg_base3.clone(),
        };

        assert_eq!("[No items selected.]", format!("{}", msg1));
        assert_eq!("[{COUNT} item selected.]", format!("{}", msg2));
        assert_eq!("[{COUNT} items selected.]", format!("{}", msg3));

        // Build up `GroupMessage` and print

        let msg_grp_key_1 = ph_vals1.clone();
        let msg_grp_key_2 = ph_vals2.clone();
        let msg_grp_key_3 = ph_vals3.clone();

        let mut messages: HashMap<PHValsMap, MessageBase> = HashMap::new();
        messages.insert(msg_grp_key_1, msg_base1.clone());
        messages.insert(msg_grp_key_2, msg_base2.clone());
        messages.insert(msg_grp_key_3, msg_base3.clone());

        let msg_grp = MessageGroup {
            id: String::from("msg_grp"),
            messages,
        };

        // Output*
        //
        // (*hashmap keys are not ordered, so output may vary)
        //
        // msg_grp =
        // msg_grp: {
        //     {COUNT:OTHER}: [{COUNT} items selected.]
        //     {COUNT:=0}: [No items selected.]
        //     {COUNT:ONE}: [{COUNT} item selected.]
        //   }
        println!("msg_grp =");
        println!("{}", msg_grp);
    }

    // Test the `fmt_str` method from the `MsgFmt` trait, on the `MessageBase`
    // struct.
    #[test]
    fn test_fmt_str_message_base() {
        let select_ph_vals2 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("ONE"));
            m
        }};

        // create a clone of the selection map and substitute actual/runtime
        // vals
        let mut interpolate_ph_vals2: PHValsMap = select_ph_vals2.clone();
        interpolate_ph_vals2.map.insert(String::from("COUNT"), String::from("1"));

        let msg_base2 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(Placeholder{
                        id: String::from("COUNT"),
                        ph_type: PlaceholderType::PLURAL,
                        default_text_val: Option::None,
                     }),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" item selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };

        assert_eq!("[{COUNT} item selected.]", format!("{}", msg_base2));
        assert_eq!("1 item selected.", msg_base2.fmt_str(&interpolate_ph_vals2));
    }

    // Test the `fmt_str` method from the `MsgFmt` trait, on the
    // `SingleMessage` struct.
    #[test]
    fn test_fmt_str_single_message() {
        let select_ph_vals2 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("ONE"));
            m
        }};

        let msg_base2 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(Placeholder{
                        id: String::from("COUNT"),
                        ph_type: PlaceholderType::PLURAL,
                        default_text_val: Option::None,
                     }),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" item selected.") }),
                ],
            },
            act_ph_vals: PHValsMap { map: HashMap::default() },
        };

        let msg2 = SingleMessage {
            id: String::from("msg2"),
            locale: String::from("en"),
            msg_base: msg_base2.clone(),
        };

        // create a clone of the selection map and substitute actual/runtime
        // vals
        let mut interpolate_ph_vals2: PHValsMap = select_ph_vals2.clone();
        interpolate_ph_vals2.map.insert(String::from("COUNT"), String::from("1"));
        let empty_ph_vals = PHValsMap::new();

        assert_eq!("{COUNT} item selected.", msg_base2.fmt_str(&empty_ph_vals));
        assert_eq!("1 item selected.", msg_base2.fmt_str(&interpolate_ph_vals2));
        assert_eq!("1 item selected.", msg2.fmt_str(&interpolate_ph_vals2));
    }

    // Test the `fmt_str` method from the `MsgFmt` trait, on the
    // `MessageGroup` struct.
    #[test]
    fn test_fmt_str_message_group() {
        // create `PHValsMap`s for selecting specific messages and holding
        // onto runtime PH values to interpolate during the formatting phase.
        // These are the keys in a `MessageGroup` map.
        let ph_vals1 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("=0"));
            m
        }};
        let ph_vals2 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("ONE"));
            m
        }};
        let ph_vals3 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("OTHER"));
            m
        }};

        // create `MessageBase`s for the vals in a `MessageGroup` map.
        let msg_base1 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::TEXTPART(TextPart{ text: String::from("No items selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };
        let msg_base2 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(Placeholder{
                        id: String::from("COUNT"),
                        ph_type: PlaceholderType::PLURAL,
                        default_text_val: Option::None,
                     }),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" item selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };
        let msg_base3 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(Placeholder{
                        id: String::from("COUNT"),
                        ph_type: PlaceholderType::PLURAL,
                        default_text_val: Option::None,
                     }),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" items selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };

        // Construct the `MessageGroup`

        let msg_grp_key_1 = ph_vals1.clone();
        let msg_grp_key_2 = ph_vals2.clone();
        let msg_grp_key_3 = ph_vals3.clone();

        let mut messages: HashMap<PHValsMap, MessageBase> = HashMap::new();
        messages.insert(msg_grp_key_1, msg_base1.clone());
        messages.insert(msg_grp_key_2, msg_base2.clone());
        messages.insert(msg_grp_key_3, msg_base3.clone());

        let msg_grp = MessageGroup {
            id: String::from("msg_grp"),
            messages,
        };

        // Create and test various examples of the actual PH vals known at runtime.

        // TODO: implement
        // let act_ph_vals1: PHValsMap = PHValsMap::new();
        // println!("interpolation of {} yields: {}", &act_ph_vals1,
        //     msg_grp.fmt_str(&act_ph_vals1));
    }

    #[test]
    fn test_phs_in_msg() {
        // setup

        let ph_name = String::from("COUNT");
        let ph = Placeholder {
            id: ph_name.clone(),
            ph_type: PlaceholderType::PLURAL,
            default_text_val: Option::None,
         };
        let msg_base2 = MessageBase {
            pattern: MessagePattern{
                parts: vec![
                    PatternPart::PLACEHOLDER(ph.clone()),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" item selected.") }),
                ],
            },
            act_ph_vals: PHValsMap { map: HashMap::default() },
        };

        let msg2 = SingleMessage {
            id: String::from("msg2"),
            locale: String::from("en"),
            msg_base: msg_base2.clone(),
        };

        // get actual
        let act_msg2_phs = phs_in_msg(&msg2);

        // construct expected
        let mut exp_msg2_phs: HashMap<String,Placeholder> = HashMap::new();
        exp_msg2_phs.insert(ph_name.clone(), ph.clone());

        // assert equal
        let act_msg2_phs_names = &act_msg2_phs.keys().collect::<Vec<&String>>();
        let exp_msg2_phs_names = &exp_msg2_phs.keys().collect::<Vec<&String>>();
        assert_eq!(act_msg2_phs_names, exp_msg2_phs_names);
        for k in act_msg2_phs.keys() {
            let x = act_msg2_phs.get(k).unwrap();
            let y = exp_msg2_phs.get(k).unwrap();
            assert_eq!(*x, *y);
        }
    }

    #[test]
    fn test_phs_in_msg_group() {
        // setup

        let ph = Placeholder {
            id: String::from("COUNT"),
            ph_type: PlaceholderType::PLURAL,
            default_text_val: Option::None,
         };

        let ph_vals1 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("=0"));
            m
        }};
        let ph_vals2 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("ONE"));
            m
        }};
        let ph_vals3 = PHValsMap{ map: {
            let mut m = HashMap::default();
            m.insert(String::from("COUNT"), String::from("OTHER"));
            m
        }};

        // create `MessageBase`s for the vals in a `MessageGroup` map.
        let msg_base1 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::TEXTPART(TextPart{ text: String::from("No items selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };
        let msg_base2 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(ph.clone()),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" item selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };
        let msg_base3 = MessageBase {
            pattern: MessagePattern{ 
                parts: vec![
                    PatternPart::PLACEHOLDER(ph.clone()),
                    PatternPart::TEXTPART(TextPart{ text: String::from(" items selected.") }),
                ],
            },
            act_ph_vals: PHValsMap::new(),
        };

        // Construct the `MessageGroup`

        let msg_grp_key_1 = ph_vals1.clone();
        let msg_grp_key_2 = ph_vals2.clone();
        let msg_grp_key_3 = ph_vals3.clone();

        let mut messages: HashMap<PHValsMap, MessageBase> = HashMap::new();
        messages.insert(msg_grp_key_1, msg_base1.clone());
        messages.insert(msg_grp_key_2, msg_base2.clone());
        messages.insert(msg_grp_key_3, msg_base3.clone());

        let msg_grp = MessageGroup {
            id: String::from("msg_grp"),
            messages,
        };

        // get actual
        let act_phs = phs_in_msg_group(&msg_grp);

        // construct expected
        let mut exp_phs: HashMap<String,Placeholder> = HashMap::new();
        exp_phs.insert(ph.id.clone(), ph.clone());

        // assert equal
        let act_phs_names = &act_phs.keys().collect::<Vec<&String>>();
        let exp_phs_names = &exp_phs.keys().collect::<Vec<&String>>();
        assert_eq!(act_phs_names, exp_phs_names);
        for k in act_phs.keys() {
            let x = act_phs.get(k).unwrap();
            let y = exp_phs.get(k).unwrap();
            assert_eq!(*x, *y);
        }
    }
}