import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const METHOD_NAMES = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

const run = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const getBaseRef = () => {
  const baseBranch = process.env.GITHUB_BASE_REF;
  if (baseBranch) {
    try {
      run(`git rev-parse --verify origin/${baseBranch}`);
    } catch {
      run(`git fetch --depth=1 origin ${baseBranch}`);
    }
    return `origin/${baseBranch}`;
  }
  try {
    run('git rev-parse --verify HEAD~1');
    return 'HEAD~1';
  } catch {
    return 'HEAD';
  }
};

const getChangedOpenApiFiles = (baseRef) => {
  const range =
    process.env.GITHUB_ACTIONS === 'true'
      ? `${baseRef}...HEAD`
      : 'HEAD';

  const output = run(`git diff --name-only ${range} -- contracts/openapi`);
  if (!output) {
    return [];
  }
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.json'));
};

const readJsonFile = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'));

const readJsonFromGit = (ref, filePath) => JSON.parse(run(`git show ${ref}:${filePath}`));

const hasFileInRef = (ref, filePath) => {
  try {
    run(`git cat-file -e ${ref}:${filePath}`);
    return true;
  } catch {
    return false;
  }
};

const collectRequiredParameters = (operation, pathItem) => {
  const operationParams = Array.isArray(operation.parameters) ? operation.parameters : [];
  const pathParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];
  const merged = [...pathParams, ...operationParams];

  const required = new Set();
  for (const param of merged) {
    if (!param || typeof param !== 'object') {
      continue;
    }
    if (param.required !== true) {
      continue;
    }
    const key = `${String(param.in)}:${String(param.name)}`;
    required.add(key);
  }

  return required;
};

const getJsonRequestRequiredProps = (operation) => {
  const schema = operation?.requestBody?.content?.['application/json']?.schema;
  if (!schema || typeof schema !== 'object') {
    return new Set();
  }

  const required = Array.isArray(schema.required) ? schema.required : [];
  return new Set(required.map((item) => String(item)));
};

const getResponseCodes = (operation) => {
  const responses = operation?.responses;
  if (!responses || typeof responses !== 'object') {
    return new Set();
  }

  return new Set(
    Object.keys(responses).filter((code) => code === 'default' || /^[2-5][0-9][0-9]$/.test(code))
  );
};

const compareSpecs = (baseSpec, headSpec, filePath) => {
  const errors = [];

  const basePaths = baseSpec.paths ?? {};
  const headPaths = headSpec.paths ?? {};

  for (const basePath of Object.keys(basePaths)) {
    if (!(basePath in headPaths)) {
      errors.push(`${filePath}: removed path '${basePath}'`);
      continue;
    }

    const basePathItem = basePaths[basePath] ?? {};
    const headPathItem = headPaths[basePath] ?? {};

    for (const method of METHOD_NAMES) {
      const baseOperation = basePathItem[method];
      if (!baseOperation) {
        continue;
      }

      const headOperation = headPathItem[method];
      if (!headOperation) {
        errors.push(`${filePath}: removed operation '${method.toUpperCase()} ${basePath}'`);
        continue;
      }

      const baseRequiredParams = collectRequiredParameters(baseOperation, basePathItem);
      const headRequiredParams = collectRequiredParameters(headOperation, headPathItem);
      for (const requiredParam of headRequiredParams) {
        if (!baseRequiredParams.has(requiredParam)) {
          errors.push(
            `${filePath}: '${method.toUpperCase()} ${basePath}' added required parameter '${requiredParam}'`
          );
        }
      }

      const baseRequestRequired = getJsonRequestRequiredProps(baseOperation);
      const headRequestRequired = getJsonRequestRequiredProps(headOperation);
      for (const requiredProp of headRequestRequired) {
        if (!baseRequestRequired.has(requiredProp)) {
          errors.push(
            `${filePath}: '${method.toUpperCase()} ${basePath}' added required request field '${requiredProp}'`
          );
        }
      }

      const baseResponses = getResponseCodes(baseOperation);
      const headResponses = getResponseCodes(headOperation);
      for (const code of baseResponses) {
        if (!headResponses.has(code)) {
          errors.push(`${filePath}: '${method.toUpperCase()} ${basePath}' removed response code '${code}'`);
        }
      }
    }
  }

  return errors;
};

const baseRef = getBaseRef();
const changedFiles = getChangedOpenApiFiles(baseRef);

if (changedFiles.length === 0) {
  console.log('No OpenAPI contract changes detected.');
  process.exit(0);
}

const failures = [];

for (const file of changedFiles) {
  if (!existsSync(file)) {
    failures.push(`${file}: contract file deletion is breaking`);
    continue;
  }

  if (!hasFileInRef(baseRef, file)) {
    continue;
  }

  const baseSpec = readJsonFromGit(baseRef, file);
  const headSpec = readJsonFile(file);
  failures.push(...compareSpecs(baseSpec, headSpec, file));
}

if (failures.length > 0) {
  console.error('OpenAPI breaking changes detected:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('OpenAPI breaking change check passed.');
