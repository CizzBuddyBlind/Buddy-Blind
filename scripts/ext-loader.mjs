export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !specifier.endsWith(".js") && !specifier.endsWith(".mjs")) {
    return nextResolve(`${specifier}.js`, context);
  }
  return nextResolve(specifier, context);
}
