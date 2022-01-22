// Messsage Resource

interface Resource {
  id: string
  locale: string
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}

interface MessageGroup {
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}

type Meta = Record<string, string | number | boolean>

// Message

type Message = PatternMessage | SelectMessage

type MessageBody = PatternElement[]

interface PatternMessage {
  value: MessageBody
  comment?: string
  meta?: Meta
}

// Select Message

interface SelectMessage {
  select: Selector[]
  cases: Map<string[], PatternMessage>
  comment?: string
  meta?: Meta
}

interface Selector {
  value: PatternElement
  fallback?: string
}

interface SelectMessageAlt {
  select: Selector[]
  cases: SelectCase[]
  comment?: string
  meta?: Meta
}

interface SelectCase {
  key: string[]
  value: PatternMessage
}

// Pattern Elements

interface PatternElement {
  type: string
  alias?: string
  comment?: string
  meta?: Meta
}

interface Literal extends PatternElement {
  type: 'literal'
  value: string
}

interface VariableRef extends PatternElement {
  type: 'variable'
  var_path: (Literal | VariableRef)[]
}

interface FunctionRef extends PatternElement {
  type: 'function'
  func: string
  args: (Literal | VariableRef)[]
  options?: Record<string, Literal | VariableRef>
}

interface MessageRef extends PatternElement {
  type: 'message'
  res_id?: string
  msg_path: (Literal | VariableRef)[]
  scope?: Record<string, Literal | VariableRef>
}

interface Alias extends PatternElement {
  type: 'alias'
  alias: string
}
