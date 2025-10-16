import JSZip from "jszip";
import registryJson from "./extensions.json";
import crypto from "node:crypto";
import path from "node:path";
import * as core from "@actions/core";
import semver from "semver";

function warning(message: string) {
  core.warning(message, { file: "extensions.json" });
}

function error(message: string) {
  core.error(message, { file: "extensions.json" });
  process.exitCode = core.ExitCode.Failure;
}

/**
 * We require newly submitted extensions to use at least this version of create-foxglove-extension.
 *
 * 1.0.3: fixed a bug where packaged extensions were not compressed
 */
const createFoxgloveExtensionMinVersion = "1.0.3";
/**
 * SHA sums of extensions that are exempt from the version check. For these we will only log a warning.
 * For other (newer) ones it will be an error if compression is not used.
 */
const exemptExtensionsSHAs = [
  "fa2b11af8ed7c420ca6e541196bca608661c0c1a81cd1f768c565c72a55a63c8",
  "ac07f5f84b96ad1139b4d66b685b864cf5713081e198e63fccef7a0546dd1ab2",
  "1193589eb2779a1224328defca4e2ca378ef786474be1842ac43b674b9535d82",
  "f03d7a517ba6f7d57564eec965358055c87285a8a504d5488af969767a76c4ab",
  "71ae6c6ffa4b86aa427d14fcc86af437fdca4b5e10cd714e70f95e1af324ceaf",
  "87e0a4fe397974fb2e3771f370009ccdbe195498d4792c04bc08b2e2482bda71",
  "6afa4437c45cb5b60a99405e40b0c51b4edfcc0f9a640532cc218962da1ee2b8",
  "b5c02cb834005affcf1873a6a481281a73428d04062bbf763863c8fb7e64fc95",
  "12863df314ec682e23ebb74598e3e3e89e610fa960f3461b5e91a6896ed8228f",
  "bfbb33b91f337a25de79449f9b529bc94bfaf908187f39cef24d70d4e1083434",
  "5b2dbe3280a7833c8d827e4f3b8acfa4df9cf4cd16a5db037885a6cfcdd42041",
  "249be37fe7c42a2bf647b344f639b755956b5f656e232770b13353dea75c7696",
  "3c1ba8195e31809939c89ce73320cdc47147f012f41b050029f6aae4dabc7c93",
];

/**
 * Check that a URL points at a plain-text file (Markdown). This helps avoid accidentally pointing
 * at an HTML page (like a non-raw github.com URL)
 */
async function validateMarkdownUrl(url: string, id: string, name: string) {
  if (url.startsWith("https://github.com/")) {
    error(
      `${id}: Invalid ${name} URL: use raw.githubusercontent.com instead of github.com`
    );
    return;
  }
  const response = await fetch(url);
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    error(
      `${id}: Invalid ${name} URL: expected status 200, got ${response.status} ${response.statusText}`
    );
    return;
  }
  if (contentType == undefined || !contentType.startsWith("text/plain")) {
    error(
      `${id}: Invalid ${name} URL: expected content-type text/plain, got: ${contentType}`
    );
  }
}

async function validateExtension(extension: (typeof registryJson)[number]) {
  console.log(`\nValidating ${extension.id}...`);
  const foxeResponse = await fetch(extension.foxe);
  if (foxeResponse.status !== 200) {
    error(
      `Extension ${extension.id} has invalid foxe URL. Expected 200 response, got ${foxeResponse.status}`
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
      `${extension.id}:Digest mismatch for ${extension.foxe}, expected: ${extension.sha256sum}, actual: ${sha256sum}`
    );
    return;
  }

  const zip = await JSZip.loadAsync(foxeContent, { checkCRC32: true });

  const packageJsonContent = await zip.file("package.json")?.async("string");
  if (!packageJsonContent) {
    error(`${extension.id}: Missing package.json`);
    return;
  }
  const packageJson = JSON.parse(packageJsonContent);
  if (packageJson.name == undefined || packageJson.name.length === 0) {
    error(`${extension.id}: Invalid package.json: missing name`);
    return;
  }

  const createFoxgloveExtensionRange =
    packageJson.devDependencies?.["create-foxglove-extension"] ??
    packageJson.devDependencies?.["@foxglove/fox"];
  if (!createFoxgloveExtensionRange) {
    error(
      `${extension.id}: Invalid package.json: expected create-foxglove-extension in devDependencies`
    );
    return;
  }
  const actualMinVersion = semver.minVersion(createFoxgloveExtensionRange);
  if (!actualMinVersion) {
    error(
      `${extension.id}: Invalid package.json: unable to determine min version of create-foxglove-extension`
    );
    return;
  }
  if (!semver.gte(actualMinVersion, createFoxgloveExtensionMinVersion)) {
    const message = `${extension.id}: must use create-foxglove-extension ${createFoxgloveExtensionMinVersion}, found ${createFoxgloveExtensionRange}`;
    if (exemptExtensionsSHAs.includes(extension.sha256sum)) {
      warning(message);
    } else {
      error(message);
      return;
    }
  } else if (exemptExtensionsSHAs.includes(extension.sha256sum)) {
    error(
      `The following SHA should be removed from exemptExtensionsSHAs: ${extension.sha256sum}`
    );
  }

  const mainPath = packageJson.main;
  if (typeof mainPath !== "string") {
    error(`${extension.id}: Invalid package.json: missing "main" field`);
    return;
  }

  // Normalize the package.json:main field so we can lookup the file in the zip archive.
  // This turns ./dist/extension.js into dist/extension.js because having a leading `./` is not
  // supported by jszip.
  const normalized = path.normalize(mainPath);
  const srcText = await zip.file(normalized)?.async("string");
  if (srcText == undefined) {
    error(
      `${extension.id}: Extension ${extension.foxe} is corrupted: unable to extract main JS file`
    );
    return;
  }

  await validateMarkdownUrl(extension.readme, extension.id, "readme");
  await validateMarkdownUrl(extension.changelog, extension.id, "changelog");
}

async function main() {
  const unusedSHAs = exemptExtensionsSHAs.filter(
    (sha) => !registryJson.find((ext) => ext.sha256sum === sha)
  );
  for (const sha of unusedSHAs) {
    error(
      `The following SHA should be removed from exemptExtensionSHAs: ${sha}`
    );
  }

  for (const extension of registryJson) {
    await validateExtension(extension);
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
