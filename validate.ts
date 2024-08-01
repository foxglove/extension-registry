import JSZip from "jszip";
import registryJson from "./extensions.json";
import crypto from "node:crypto";
import path from "node:path";

/**
 * Check that a URL points at a plain-text file (Markdown). This helps avoid accidentally pointing
 * at an HTML page (like a non-raw github.com URL)
 */
async function validateMarkdownUrl(url: string, name: string) {
  if (url.startsWith("https://github.com/")) {
    throw new Error(
      `Invalid ${name} URL: use raw.githubusercontent.com instead of github.com`
    );
  }
  const response = await fetch(url);
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    throw new Error(
      `Invalid ${name} URL: expected status 200, got ${response.status} ${response.statusText}`
    );
  }
  if (contentType == undefined || !contentType.startsWith("text/plain")) {
    throw new Error(
      `Invalid ${name} URL: expected content-type text/plain, got: ${contentType}`
    );
  }
}

async function validateExtension(extension: (typeof registryJson)[number]) {
  console.log(`Validating ${extension.id}...`);
  const foxeResponse = await fetch(extension.foxe);
  if (foxeResponse.status !== 200) {
    throw new Error(
      `Extension ${extension.id} has invalid foxe URL. Expected 200 response, got ${foxeResponse.status}`
    );
  }

  const foxeContent = await foxeResponse.arrayBuffer();
  const sha256sum = crypto
    .createHash("sha256")
    .update(new DataView(foxeContent))
    .digest("hex");
  if (sha256sum !== extension.sha256sum) {
    throw new Error(
      `Digest mismatch for ${extension.foxe}, expected: ${extension.sha256sum}, actual: ${sha256sum}`
    );
  }

  const zip = await JSZip.loadAsync(foxeContent, { checkCRC32: true });
  let uncompressedFiles = [];
  for (const [path, zipObj] of Object.entries(zip.files)) {
    if (!zipObj.dir && zipObj.options.compression !== "DEFLATE") {
      uncompressedFiles.push(path);
    }
  }
  if (uncompressedFiles.length > 0) {
    console.log(
      `  - Warning: the following files are stored without compression: ${uncompressedFiles.join(
        ", "
      )}`
    );
  }

  const packageJsonContent = await zip.file("package.json")?.async("string");
  if (!packageJsonContent) {
    throw new Error("Missing package.json in extension");
  }
  const packageJson = JSON.parse(packageJsonContent);
  if (packageJson.name == undefined || packageJson.name.length === 0) {
    throw new Error("Invalid extension: missing name");
  }

  const mainPath = packageJson.main;
  if (typeof mainPath !== "string") {
    throw new Error("Extension package.json main is missing");
  }

  // Normalize the package.json:main field so we can lookup the file in the zip archive.
  // This turns ./dist/extension.js into dist/extension.js because having a leading `./` is not
  // supported by jszip.
  const normalized = path.normalize(mainPath);
  const srcText = await zip.file(normalized)?.async("string");
  if (srcText == undefined) {
    throw new Error("Extension is corrupted: unable to extract main JS file");
  }

  await validateMarkdownUrl(extension.readme, "readme");
  await validateMarkdownUrl(extension.changelog, "changelog");
}

async function main() {
  for (const extension of registryJson) {
    await validateExtension(extension);
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
