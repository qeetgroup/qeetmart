import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const OPENAPI_DIR = 'contracts/openapi';
const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

const walk = (dir) => {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const info = statSync(fullPath);
    if (info.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (extname(fullPath) === '.json') {
      files.push(fullPath);
    }
  }
  return files;
};

const readJson = (filePath) => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
  }
};

const lintSpec = (filePath, spec) => {
  const errors = [];

  if (typeof spec.openapi !== 'string' || !spec.openapi.startsWith('3.')) {
    errors.push('`openapi` must be a 3.x string');
  }

  if (!spec.info || typeof spec.info !== 'object') {
    errors.push('`info` object is required');
  } else {
    if (!spec.info.title || typeof spec.info.title !== 'string') {
      errors.push('`info.title` must be a non-empty string');
    }
    if (!spec.info.version || typeof spec.info.version !== 'string') {
      errors.push('`info.version` must be a non-empty string');
    }
  }

  if (!spec.paths || typeof spec.paths !== 'object') {
    errors.push('`paths` object is required');
    return errors;
  }

  const operationIds = new Set();

  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    if (!pathKey.startsWith('/')) {
      errors.push(`path '${pathKey}' must start with '/'`);
    }

    if (!pathItem || typeof pathItem !== 'object') {
      errors.push(`path '${pathKey}' must be an object`);
      continue;
    }

    let pathHasOperation = false;
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method)) {
        continue;
      }
      pathHasOperation = true;

      if (!operation || typeof operation !== 'object') {
        errors.push(`${pathKey} ${method}: operation must be an object`);
        continue;
      }

      if (!operation.summary || typeof operation.summary !== 'string') {
        errors.push(`${pathKey} ${method}: summary is required`);
      }

      if (!operation.operationId || typeof operation.operationId !== 'string') {
        errors.push(`${pathKey} ${method}: operationId is required`);
      } else {
        if (operationIds.has(operation.operationId)) {
          errors.push(`${pathKey} ${method}: duplicate operationId '${operation.operationId}'`);
        }
        operationIds.add(operation.operationId);
      }

      if (!operation.responses || typeof operation.responses !== 'object' || Object.keys(operation.responses).length === 0) {
        errors.push(`${pathKey} ${method}: responses must define at least one status code`);
      }
    }

    if (!pathHasOperation) {
      errors.push(`path '${pathKey}' has no HTTP operations`);
    }
  }

  return errors;
};

const files = walk(OPENAPI_DIR);
if (files.length === 0) {
  console.error(`No OpenAPI files found under ${OPENAPI_DIR}`);
  process.exit(1);
}

const allErrors = [];
for (const file of files) {
  const spec = readJson(file);
  const errors = lintSpec(file, spec);
  for (const error of errors) {
    allErrors.push(`${file}: ${error}`);
  }
}

if (allErrors.length > 0) {
  console.error('OpenAPI lint failed:');
  for (const error of allErrors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`OpenAPI lint passed for ${files.length} file(s).`);
