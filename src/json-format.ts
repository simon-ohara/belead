interface Config {
  type: string;
  size?: number;
}

interface CharConfig {
  char: string;
  size: number;
}

let p: string[] = [];

const indentConfig: Record<string, CharConfig> = {
  tab: {char: '\t', size: 1},
  space: {char: ' ', size: 4},
};

const configDefault = {
  type: 'tab',
};

const push = function (m: string) {
  return '\\' + p.push(m) + '\\';
};
const pop = function (m: string, i: number) {
  return p[i - 1];
};
const tabs = function (count: number, indentType: string) {
  return new Array(count + 1).join(indentType);
};

const JSONFormat: (json: string, indentType: string) => string = (
  json,
  indentType
) => {
  p = [];
  let out = '';
  let indent = 0;

  // Extract backslashes and strings
  json = json
    .replace(/\\./g, push)
    .replace(/(".*?"|'.*?')/g, push)
    .replace(/\s+/, '');

  // Indent and insert newlines
  for (let i = 0; i < json.length; i++) {
    const c = json.charAt(i);

    switch (c) {
      case '{':
        out += c + ' ';
        break;
      case '[':
        out += c + '\n' + tabs(++indent, indentType);
        break;
      case '}':
        out += ' ' + c;
        break;
      case ']':
        out += '\n' + tabs(--indent, indentType) + c;
        break;
      case ',':
        if (json.charAt(i - 1) === '}' || json.charAt(i - 1) === ']') {
          out += ',\n' + tabs(indent, indentType);
        } else {
          out += ',\t';
        }
        break;
      case ':':
        out += ': ';
        break;
      default:
        out += c;
        break;
    }
  }

  // Strip whitespace from numeric arrays and put backslashes
  // and strings back in
  out = out
    .replace(/\[[\d,\s]+?\]/g, m => m.replace(/\s/g, ''))
    .replace(/\\(\d+)\\/g, pop) // strings
    .replace(/\\(\d+)\\/g, pop); // backslashes in strings

  return out;
};

export const format: (subject: unknown, config?: Config) => string = (
  subject,
  config
) => {
  config = config || configDefault;
  const indent = indentConfig[config.type];

  if (indent === null) {
    throw new Error('Unrecognized indent type: "' + config.type + '"');
  }
  const indentType = new Array((config.size || indent.size) + 1).join(
    indent.char
  );
  return JSONFormat(JSON.stringify(subject), indentType);
};
