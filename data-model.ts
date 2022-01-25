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

type Meta = Record<string, string | number | boolean>

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

interface Element extends PatternElement {
  type: 'element'
  elem: string
  has_body: boolean
  options?: Record<string, Literal | VariableRef | Alias>
}

interface ElementEnd extends PatternElement {
  type: 'element-end'
  elem: string
}
