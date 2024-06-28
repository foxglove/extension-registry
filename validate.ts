import JSZip from "jszip";
import registryJson from "./extensions.json";
import crypto from "node:crypto";
import path from "node:path";

function parsePackageName(name: string): { publisher?: string; name: string } {
  const res = /^@([^/]+)\/(.+)/.exec(name);
  if (res == undefined) {
    return { name };
  }
  return { publisher: res[1], name: res[2]! };
}

async function main() {
  for (const extension of registryJson) {
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
        `Digest mismatch, expected: ${extension.sha256sum}, actual: ${sha256sum}`
      );
    }
    console.log("  - Digest matches: ", sha256sum, extension.sha256sum);

    const zip = new JSZip();

    const content = await zip.loadAsync(foxeContent);
    const packageJsonContent = await content
      .file("package.json")
      ?.async("string");
    if (!packageJsonContent) {
      throw new Error("Missing package.json in extension");
    }
    const packageJson = JSON.parse(packageJsonContent);
    if (packageJson.name == undefined || packageJson.name.length === 0) {
      throw new Error("Invalid extension: missing name");
    }

    // FIXME: this parsing/normalizing is kind of garbage and we need to make sure it matches what the app actually does

    const { publisher: parsedPublisher, name } = parsePackageName(
      packageJson.name
    );
    const publisher = packageJson.publisher ?? parsedPublisher;
    if (publisher == undefined || publisher.length === 0) {
      throw new Error("Invalid extension: missing publisher");
    }

    const normalizedPublisher = packageJson.publisher.replace(
      /[^A-Za-z0-9_\s]+/g,
      ""
    );
    const actualId = `${normalizedPublisher}.${name.toLowerCase()}`;

    if (actualId !== extension.id) {
      throw new Error(
        `ID mismatch, expected: ${extension.id}, actual from .foxe: ${actualId}`
      );
    }

    const mainPath = packageJson.main;
    if (typeof mainPath !== "string") {
      throw new Error("Extension package.json main is missing");
    }

    // Normalize the package.json:main field so we can lookup the file in the zip archive.
    // This turns ./dist/extension.js into dist/extension.js because having a leading `./` is not
    // supported by jszip.
    const normalized = path.normalize(mainPath);
    const srcText = await content.file(normalized)?.async("string");
    if (srcText == undefined) {
      throw new Error("Extension is corrupted");
    }

    void foxeContent;
  }
}

void main().catch((err) => console.error(err));
