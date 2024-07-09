import { base64Image } from "@/utils/image";
import { Logger } from "@/utils/logger";
import { base64ToBlob } from "@/utils/misc";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { file } from "bun";
import write_blob from "capacitor-blob-writer";

export type FilePlatformData =
  | {
      platform: "web";
      blob: Blob;
    }
  | {
      platform: "native";
      uri: string;
    };

export class FileWriterService {
  private static _instance: FileWriterService;
  private readonly logger = new Logger(FileWriterService.name);

  private _directory: Directory = Directory.Data;
  private _prefix = "files";

  private constructor() {}

  public static async getInstance(): Promise<FileWriterService> {
    if (!this._instance) {
      this._instance = new FileWriterService();
    }
    return this._instance;
  }

  private async writeBlob(filePath: string, data: Blob, encoding?: Encoding) {
    const relativePath = `${this._prefix}/${filePath}`;

    const writeRes = await write_blob({
      path: relativePath,
      directory: this._directory,
      blob: data,
      recursive: true,
      fast_mode: true, // only applies to Web platform
      on_fallback(error) {
        console.error(error);
      },
    });

    return {
      absolutePath: `/${this._directory}/${relativePath}`,
      relativePath: relativePath,
    };
  }

  private async readBlob(fullPath: string): Promise<FilePlatformData> {
    if (!fullPath.startsWith(`/${this._directory}/${this._prefix}/`)) {
      throw new Error(
        `Invalid fullPath: ${fullPath}, must begin with /${this._directory}/${this._prefix}`
      );
    }
    const relativePath = fullPath.replace(`/${this._directory}/`, "");

    if (Capacitor.getPlatform() === "web") {
      const resFile = await Filesystem.readFile({
        path: `${relativePath}`,
        directory: this._directory,
      });

      return {
        platform: "web",
        blob: resFile.data as Blob,
      };
    } else {
      const resUri = await Filesystem.getUri({
        path: `${relativePath}`,
        directory: this._directory,
      });

      const uri = Capacitor.convertFileSrc(resUri.uri);
      return {
        platform: "native",
        uri: uri,
      };
    }
  }

  private async deleteFile(fullPath: string) {
    return Filesystem.deleteFile({
      path: `${fullPath}`,
      directory: this._directory,
    });
  }

  public async test(): Promise<FilePlatformData> {
    const fileName = "apple";
    const absolutePath = `/${this._directory}/${this._prefix}/${fileName}`;
    const relativePath = `${this._prefix}/${fileName}`;

    let fileFound = false;
    this.logger.log("Checking if test file exists...");
    try {
      this.logger.log("Reading blob via readBlob...");
      const readRes = await this.readBlob(absolutePath); // doesn't return error if file doesn't exist!
      this.logger.log("readBlob result", JSON.stringify(readRes));

      this.logger.log("Reading file via Filesystem.readFile...");
      const resFile = await Filesystem.readFile({
        path: `${relativePath}`,
        directory: this._directory,
      });
      this.logger.log("Filesystem.readFile result", resFile);
      if (resFile) {
        fileFound = true;
      }
    } catch (error) {
      // this.logger.warn("readBlob error", error);
      this.logger.log("Test file doesn't exist yet");
    }

    if (fileFound) {
      this.logger.log("Deleting already existing test file...");
      try {
        const deleteRes = await this.deleteFile(relativePath);
        this.logger.log("deleteFile result", deleteRes);
      } catch (error) {
        this.logger.error("deleteFile error", error);
        throw error;
      }
    }

    this.logger.log("Creating test file blob...");
    const blob = base64ToBlob(base64Image, "image/png");

    this.logger.log("Writing test file...");
    try {
      const writeRes = await this.writeBlob(fileName, blob);
      this.logger.log("writeBlob result", writeRes);
    } catch (error) {
      this.logger.error("writeBlob error", error);
    }

    this.logger.log("Reading new test file...");
    try {
      const resFile = await Filesystem.readFile({
        path: `${relativePath}`,
        directory: this._directory,
      });
      this.logger.log("readFile result", resFile);
    } catch (error) {
      this.logger.error("Test file doesn't exist yet");
      throw error;
    }

    this.logger.log("Retrieving test file...");
    if (Capacitor.getPlatform() === "web") {
      const resFile = await Filesystem.readFile({
        path: `${relativePath}`,
        directory: this._directory,
      });

      return {
        platform: "web",
        blob: resFile.data as Blob,
      };
    } else {
      const resUri = await Filesystem.getUri({
        path: `${relativePath}`,
        directory: this._directory,
      });

      const uri = Capacitor.convertFileSrc(resUri.uri);
      return {
        platform: "native",
        uri: uri,
      };
    }
  }
}
