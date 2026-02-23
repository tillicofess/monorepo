import crypto from 'crypto';

function normalize(val) {
  return String(val || '').trim().toLowerCase();
}

export function createFingerprint(error) {
  let base = '';

  switch (error.category) {
    case 'js':
      base = [
        normalize(error.type),
        normalize(error.message),
        normalize(error.fileName),
        error.line,
        error.column
      ].join('|');
      break;

    case 'promise':
      base = [
        normalize(error.type),
        normalize(error.message)
      ].join('|');
      break;

    case 'resource':
      base = [
        normalize(error.url),
        normalize(error.tagName)
      ].join('|');
      break;

    default:
      base = normalize(error.message);
  }

  return crypto.createHash('md5').update(base).digest('hex');
}