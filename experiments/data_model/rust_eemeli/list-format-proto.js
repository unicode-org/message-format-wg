const { resolve } = require('path')

if (process.argv.length < 4)
  throw new Error(`Usage: list-format-proto messages.json scope.json`)
const messages = require(resolve(process.argv[2]))
const scope = require(resolve(process.argv[3]))

/**
 * Really simple list formatter
 *
 * @param {string[]} values
 * @returns string
 */
function formatList(values) {
  switch (values.length) {
    case 0:
      return ''
    case 1:
      return values[0]
    case 2:
      return values[0] + ' and ' + values[1]
    default: {
      const start = values.slice(0, -1)
      const last = values[values.length - 1]
      return start.join(', ') + ', and ' + last
    }
  }
}

/**
 * Resolve the value of a variable in the scope
 *
 * @param {{var_path:[string]}} arg
 * @param {Record<string, string|string[]>} scope
 * @returns unknown
 */
function resolveVar({ var_path }, scope) {
  return scope[var_path[0]]
}

/**
 * Resolve & flatten the argument values
 *
 * @param {Array<string|{var_path:[string]}>} args
 * @param {Record<string, string|string[]>} scope
 * @returns string[]
 */
function flattenArgs(args, scope) {
  const values = []
  for (const arg of args) {
    const res = resolvePart(arg, scope)
    if (Array.isArray(res)) Array.prototype.push.apply(values, res)
    else if (typeof res === 'string') values.push(res)
    else throw new Error(`Unsupported arg: ${res}`)
  }
  return values
}

function resolvePart(part, scope) {
  if (typeof part === 'string') {
    return part
  } else if (typeof part === 'object' && Array.isArray(part.var_path)) {
    return resolveVar(part, scope)
  } else if (typeof part === 'object' && part.func === 'list-format') {
    const values = flattenArgs(part.args, scope)
    return formatList(values)
  } else throw new Error(`Unsupported part: ${part}`)
}

/**
 * Format a message in a given scope
 *
 * @param {{ value: Array<string|{func:string,args:Array<string|{var_path:[string]}>}>}} msg
 * @param {Record<string, string|string[]>} scope
 * @returns
 */
function formatMessage(msg, scope) {
  let res = ''
  for (const part of msg.value) res += resolvePart(part, scope)
  return res
}

for (const [key, msg] of Object.entries(messages.entries)) {
  const fmt = formatMessage(msg, scope)
  console.log(`${key}: ${fmt}`)
}
