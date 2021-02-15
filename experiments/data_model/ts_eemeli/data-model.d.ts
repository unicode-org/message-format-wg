/**
 * The root of a message structure is a Resource.
 *
 * The `[id, locale]` tuple must be unique for each resource
 */
interface Resource {
  id: string
  locale: string
  entries: Entry[]
  meta?: Meta
}

type Entry = Message | MessageSet

interface MessageSet {
  id: string
  entries: Entry[]
  meta?: Meta
}

/**
 * Additional meta information amy be attached to most nodes. In common use,
 * this information is not required when formatting a message.
 */
interface Meta {
  comment?: string
  [key: string]: unknown
}

/**
 * The string parts of a message represent fixed values, while placeholder
 * values are variable.
 */
interface Message {
  id: string
  value: Value[] | Select
  meta?: Meta
}

/**
 * Select generalises the plural, selectordinal and select argument types of
 * MessageFormat 1. Each case is defined by a key of one or more string
 * identifiers, and selection between them is made according to the values of
 * a corresponding number of placeholders.
 *
 * It is likely that in nearly all cases the source of the placeholder's value
 * will be a variable in the local scope.
 */
interface Select {
  select: Value[]
  cases: Array<{ key: Literal[]; value: Value[]; meta?: Meta }>
}

/**
 * A Value is either a literal, immediately defined value, or a reference to a
 * value that depends on another message, the value of some runtime variable,
 * or some function defined elsewhere.
 *
 * Each of the types that may be used as a Value must be (and are) immediately
 * distinguishable from each other.
 */
type Value = Literal | VariableReference | FunctionReference | MessageReference

/**
 * An immediately defined value.
 *
 * A numerical value probably only makes sense when used e.g. as a fixed
 * argument of a FunctionReference, but its use is not technically prohibited
 * elsewhere.
 */
type Literal = string | number

/**
 * Variables are defined by the current scope.
 *
 * Using an array with more than one value refers to an inner property of an
 * object value, so e.g. `['user', 'name']` would require something like
 * `{ name: 'Kat' }` as the value of the `'user'` scope variable.
 */
interface VariableReference {
  var_path: Path
  meta?: Meta
}

/**
 * To resolve a FunctionReference, an externally defined function is called.
 *
 * The `func` identifies a function that takes in the arguments `args`, the
 * current locale, as well as any `options`, and returns some corresponding
 * output. Likely functions available by default would include `'plural'` for
 * determining the plural category of a numeric value, as well as `'number'`
 * and `'date'` for formatting values.
 *
 * It is intentional that the `options` do not allow for reference values to
 * be used, as that would add significant requirements to the runtime
 * resolution of a FunctionReference.
 */
interface FunctionReference {
  func: string
  args: Value[]
  options?: Array<{ key: string; value: string | number | boolean }>
  meta?: Meta
}

/**
 * A MessageReference is a pointer to a Message or a Select.
 *
 * If `resource` is undefined, the message is sought in the current Resource.
 * If it is set, it identifies the resource for the sought message.
 *
 * While `msg` has superficially the same type as a Message, all but the last
 * of its parts are used to identify a parent MessageSet for the Message or
 * Select that's being sought. Allowing for reference values here enables
 * dynamic references to be used.
 *
 * `scope` overrides values in the current scope when resolving the message.
 */
interface MessageReference {
  res_id?: string
  msg_path: Path
  scope?: Scope[]
  meta?: Meta
}

interface Scope {
  name: string
  value: Value | boolean | Scope
}

type Path = Value[]
