const ALLOWED_PATHS = [
  ["agents", "defaults", "model"],
  ["agents", "defaults", "compaction"],
  ["agents", "defaults", "memorySearch"],
  ["agents", "defaults", "sandbox"],
  ["plugins", "slots"],
];

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function setDeep(target, keys, value) {
  let cursor = target;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    cursor[key] ??= {};
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = cloneJson(value);
}

export function extractOpenClawTemplate(config) {
  const template = {};
  for (const keys of ALLOWED_PATHS) {
    let cursor = config;
    let found = true;
    for (const key of keys) {
      if (!cursor || !(key in cursor)) {
        found = false;
        break;
      }
      cursor = cursor[key];
    }
    if (found) {
      setDeep(template, keys, cursor);
    }
  }
  return template;
}
