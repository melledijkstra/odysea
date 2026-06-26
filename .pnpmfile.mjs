import fs from 'fs';
import path from 'path';

function readPackage(pkg, context) {
  const targetPackages = [
    '@melledijkstra/auth',
    '@melledijkstra/extension',
    '@melledijkstra/storage',
    '@melledijkstra/toolbox'
  ];

  const rootDir = import.meta.dirname;

  for (const name of targetPackages) {
    // Prioritize root .yalc folder if it exists
    const rootYalcPath = path.resolve(rootDir, '.yalc', name);
    const extYalcPath = path.resolve(rootDir, 'apps/extension/.yalc', name);

    let resolvedPath = null;
    if (fs.existsSync(rootYalcPath)) {
      resolvedPath = rootYalcPath;
    } else if (fs.existsSync(extYalcPath)) {
      resolvedPath = extYalcPath;
    }

    if (resolvedPath) {
      if (pkg.dependencies && pkg.dependencies[name]) {
        pkg.dependencies[name] = `file:${resolvedPath}`;
      }
      if (pkg.devDependencies && pkg.devDependencies[name]) {
        pkg.devDependencies[name] = `file:${resolvedPath}`;
      }
    }
  }

  return pkg;
}

export const hooks = {
  readPackage
};
