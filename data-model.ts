// Message Resource

interface Resource {
  type: 'resource'
  id: string
  locale: string
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}

interface MessageGroup {
  type: 'group'
  entries: Record<string, Message | MessageGroup>
  comment?: string
  meta?: Meta
}

type Meta = Record<string, string>

// Message

type Message = PatternMessage | SelectMessage

interface PatternMessage {
  type: 'message'
  pattern: PatternElement[]
  comment?: string
  meta?: Meta
}

// Select Message

interface SelectMessage {
  type: 'select'
  select: Selector[]
  cases: SelectCase[]
  comment?: string
  meta?: Meta
}

interface Selector {
  value: PatternElement
  fallback?: string
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
  var_path: string[]
}

interface Alias extends PatternElement {
  type: 'alias'
  alias: string
}

type Argument = Literal | VariableRef | Alias

interface FunctionRef extends PatternElement {
  type: 'function'
  func: string
  args: Argument[]
  options?: Record<string, Argument>
}

interface MessageRef extends PatternElement {
  type: 'message'
  msg_path: Argument[]
  values?: Record<string, Argument>
}

interface Element extends PatternElement {
  type: 'element'
  name: string
  tag: 'empty' | 'start' | 'end'
  options?: Record<string, Argument>
}
