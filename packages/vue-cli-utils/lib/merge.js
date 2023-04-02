function mergeDeps(sourceDeps, depsToInject) {
  let result = Object.assign({}, sourceDeps);
  for (const depName of depsToInject) {
    result[depName] = depsToInject[depName];
  }
  return result;
}
