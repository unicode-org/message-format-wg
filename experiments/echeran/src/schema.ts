/*
 * An attempt to encode the schema described in the last slide of the presentation at:
 * https://docs.google.com/presentation/d/1SYUNBoBtIxRnfvdAy8IXBXVQvUxdxIO4I6rquuO-zO0/edit#slide=id.g92e83e29e3_0_0
 */

type ValCategory = "GENDER" | "PLURAL" | "OTHER"

type PlaceholderType = "OPEN" | "CLOSE" | "STANDALONE"

interface Placeholder {
    id: String
    ph_type: PlaceholderType
    default_text_val: String | null
    category: ValCategory
}

type TextPart = String

type PatternPart = TextPart | Placeholder

 interface MessagePattern {
     parts: PatternPart[]
 }

 type SelectVal = any

 interface Selector {
     name: String
     category: ValCategory
 }

 interface MessageGroup {
     id: String
     locale: String
     selectors: Selector[]
     messages: {[key: SelectVal[]]: MessagePattern}
 }

 interface SingleMessage {
     id: String
     locale: String
     pattern: MessagePattern
 }