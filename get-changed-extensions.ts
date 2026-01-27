import { execSync } from "node:child_process";

interface Extension {
  id: string;
  [key: string]: unknown;
}

/**
 * Get the extensions.json content from the base branch (origin/main or specified ref).
 * Returns an empty array if the file doesn't exist in the base branch.
 */
function getBaseExtensions(baseRef: string): Extension[] {
  try {
    const content = execSync(`git show ${baseRef}:extensions.json`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return JSON.parse(content) as Extension[];
  } catch {
    // File doesn't exist in base branch, treat as empty
    return [];
  }
}

/**
 * Get the current extensions.json content from the working directory.
 */
function getCurrentExtensions(): Extension[] {
  // Use dynamic import to avoid caching issues
  const content = require("fs").readFileSync("./extensions.json", "utf-8");
  return JSON.parse(content) as Extension[];
}

/**
 * Compare two extension objects to check if they differ.
 */
function extensionsEqual(a: Extension, b: Extension): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Find extensions that were added or modified compared to the base branch.
 */
function getChangedExtensionIds(
  baseExtensions: Extension[],
  currentExtensions: Extension[]
): string[] {
  const baseMap = new Map(baseExtensions.map((ext) => [ext.id, ext]));
  const changedIds: string[] = [];

  for (const current of currentExtensions) {
    const base = baseMap.get(current.id);
    if (!base) {
      // New extension
      changedIds.push(current.id);
    } else if (!extensionsEqual(base, current)) {
      // Modified extension
      changedIds.push(current.id);
    }
  }

  return changedIds;
}

function main() {
  const baseRef = process.argv[2] ?? "origin/main";

  const baseExtensions = getBaseExtensions(baseRef);
  const currentExtensions = getCurrentExtensions();

  const changedIds = getChangedExtensionIds(baseExtensions, currentExtensions);

  // Output the changed IDs, one per line (empty output if no changes)
  if (changedIds.length > 0) {
    console.log(changedIds.join("\n"));
  }
}

main();
