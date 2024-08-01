import JSZip from "jszip";
import registryJson from "./extensions.json";
import crypto from "node:crypto";
import path from "node:path";
import { warning, error } from "@actions/core";

/**
 * Check that a URL points at a plain-text file (Markdown). This helps avoid accidentally pointing
 * at an HTML page (like a non-raw github.com URL)
 */
async function validateMarkdownUrl(url: string, id: string, name: string) {
  if (url.startsWith("https://github.com/")) {
    error(
      `${id}: Invalid ${name} URL: use raw.githubusercontent.com instead of github.com`,
      { file: "extensions.json" }
    );
    return;
  }
  const response = await fetch(url);
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    error(
      `${id}: Invalid ${name} URL: expected status 200, got ${response.status} ${response.statusText}`,
      { file: "extensions.json" }
    );
    return;
  }
  if (contentType == undefined || !contentType.startsWith("text/plain")) {
    error(
      `${id}: Invalid ${name} URL: expected content-type text/plain, got: ${contentType}`,
      { file: "extensions.json" }
    );
  }
}

async function validateExtension(extension: (typeof registryJson)[number]) {
  console.log(`Validating ${extension.id}...`);
  const foxeResponse = await fetch(extension.foxe);
  if (foxeResponse.status !== 200) {
    error(
      `Extension ${extension.id} has invalid foxe URL. Expected 200 response, got ${foxeResponse.status}`,
      { file: "extensions.json" }
    );
    return;
  }

  const foxeContent = await foxeResponse.arrayBuffer();
  const sha256sum = crypto
    .createHash("sha256")
    .update(new DataView(foxeContent))
    .digest("hex");
  if (sha256sum !== extension.sha256sum) {
    error(
      `${extension.id}:Digest mismatch for ${extension.foxe}, expected: ${extension.sha256sum}, actual: ${sha256sum}`,
      { file: "extensions.json" }
    );
    return;
  }

  const zip = await JSZip.loadAsync(foxeContent, { checkCRC32: true });
  let uncompressedFiles = [];
  for (const [path, zipObj] of Object.entries(zip.files)) {
    if (!zipObj.dir && zipObj.options.compression !== "DEFLATE") {
      uncompressedFiles.push(path);
    }
  }
  if (uncompressedFiles.length > 0) {
    warning(
      `${
        extension.id
      }: the following files are stored without compression: ${uncompressedFiles.join(
        ", "
      )}`,
      { file: "extensions.json" }
    );
  }

  const packageJsonContent = await zip.file("package.json")?.async("string");
  if (!packageJsonContent) {
    error(`${extension.id}: Missing package.json in extension`, {
      file: "extensions.json",
    });
    return;
  }
  const packageJson = JSON.parse(packageJsonContent);
  if (packageJson.name == undefined || packageJson.name.length === 0) {
    error(`${extension.id}: Invalid extension: missing name`, {
      file: "extensions.json",
    });
    return;
  }

  const mainPath = packageJson.main;
  if (typeof mainPath !== "string") {
    error(`${extension.id}: Extension package.json main is missing`, {
      file: "extensions.json",
    });
    return;
  }

  // Normalize the package.json:main field so we can lookup the file in the zip archive.
  // This turns ./dist/extension.js into dist/extension.js because having a leading `./` is not
  // supported by jszip.
  const normalized = path.normalize(mainPath);
  const srcText = await zip.file(normalized)?.async("string");
  if (srcText == undefined) {
    error(
      `${extension.id}: Extension ${extension.foxe} is corrupted: unable to extract main JS file`,
      { file: "extensions.json" }
    );
    return;
  }

  await validateMarkdownUrl(extension.readme, extension.id, "readme");
  await validateMarkdownUrl(extension.changelog, extension.id, "changelog");
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
