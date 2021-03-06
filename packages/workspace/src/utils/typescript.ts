import { dirname } from 'path';
import * as ts from 'typescript';
import { appRootPath } from './app-root';

const normalizedAppRoot = appRootPath.replace(/\\/g, '/');

export function readTsConfig(tsConfigPath: string) {
  const readResult = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  return ts.parseJsonConfigFileContent(
    readResult.config,
    ts.sys,
    dirname(tsConfigPath)
  );
}

let compilerHost: {
  host: ts.CompilerHost;
  options: ts.CompilerOptions;
  moduleResolutionCache: ts.ModuleResolutionCache;
};

/**
 * Find a module based on it's import
 *
 * @param importExpr Import used to resolve to a module
 * @param filePath
 */
export function resolveModuleByImport(importExpr: string, filePath: string) {
  compilerHost = compilerHost || getCompilerHost();
  const { options, host, moduleResolutionCache } = compilerHost;

  const { resolvedModule } = ts.resolveModuleName(
    importExpr,
    filePath,
    options,
    host,
    moduleResolutionCache
  );

  if (!resolvedModule) {
    return;
  } else {
    return resolvedModule.resolvedFileName.replace(`${normalizedAppRoot}/`, '');
  }
}

function getCompilerHost() {
  const { options } = readTsConfig(`${appRootPath}/tsconfig.base.json`);
  const host = ts.createCompilerHost(options, true);
  const moduleResolutionCache = ts.createModuleResolutionCache(
    appRootPath,
    host.getCanonicalFileName
  );
  return { options, host, moduleResolutionCache };
}
