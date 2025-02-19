import { bold, generateUUID, semver, Tar, underline } from "./deps.ts";
import { NestError } from "./utils/error.ts";
import { log } from "./utils/log.ts";
import type { Module } from "./utils/types.ts";

interface PublishOptions {
  module: Module;
  version: semver.SemVer;
  files: string[];
  token: string;
  wallet?: string;
  deno?: semver.Range;
  unlisted?: boolean;
}

/** Publish your module to the nest.land registry. */
export async function publish(
  { module, version, files, token, deno, wallet, unlisted }: PublishOptions,
) {
  const uuid = generateUUID();
  const tar = new Tar();

  /** 1 - create a tarball */

  for (const file of files) {
    if (!file.startsWith("/")) {
      log.error(
        "Incorrect file path:",
        underline(bold(file)),
        'It should start with a slash ("/").',
      );
      throw new NestError("Incorrect file path (publish)");
    }
    try {
      await tar.append(file, {
        filePath: `.${file}`,
      });
    } catch (err) {
      log.error(
        `Unable to append ${underline(bold(file.substr(1)))} to the tarball`,
      );
      log.debug(err.stack);
      throw new NestError("Unable to append file to the tarball (publish)");
    }
  }

  if (wallet) {
    /** 2.1 upload the tarball to arweave and get the file urls */
    const response = await uploadArweave(wallet, tar.getReader());

    // TODO
    const urls: string[] = [];
    /** 2.2.1 sends the arweave URLs and the config to the api */
    const response_ = await sendURLs(urls, token);
  } else {
    /** 2.2.1 - upload the tarball and config to twig */
    const response = await twigUpload(module, uuid, token, tar.getReader());
  }
}

async function twigUpload(
  module: Module,
  uuid: string,
  token: string,
  reader: Deno.Reader,
) {
  // TODO
}

async function uploadArweave(wallet: string, reader: Deno.Reader) {
  // TODO
}

async function sendURLs(urls: string[], token: string) {
  // TODO
}
