import { Logger } from "@/utils/logger";
import {
  DataType,
  SecureStorage,
  SecureStoragePlugin,
  StorageError,
} from "@aparajita/capacitor-secure-storage";
import { Capacitor } from "@capacitor/core";

type StorageKeys = "someToken";

export class SecureStorageService {
  private static _instance: SecureStorageService;
  private readonly logger = new Logger(SecureStorageService.name);
  private _storage: SecureStoragePlugin;

  private readonly KEY_PREFIX = "my-custom-prefix_";

  private constructor() {
    this._storage = SecureStorage;
  }

  public static async getInstance(): Promise<SecureStorageService> {
    if (!this._instance) {
      this._instance = new SecureStorageService();
      this._instance.logger.log("new instance created");
      await this._instance.init();
      this._instance.logger.log("initialized");
    }
    return this._instance;
  }

  private async init(): Promise<void> {
    this.logger.log("init start");
    await this._storage.setKeyPrefix(this.KEY_PREFIX + "_");
    this.logger.log("setKeyPrefix done");

    const platform = Capacitor.getPlatform();
    if (platform === "ios") {
      await this._storage.setSynchronize(false);
    }
  }

  private async set(
    key: StorageKeys,
    value: DataType,
    sync = false
  ): Promise<void> {
    return this._storage.set(key, value, false, sync);
  }

  private async get(key: string): Promise<DataType | null> {
    return this._storage.get(key);
  }

  private async remove(key: string, sync = false): Promise<boolean> {
    return this._storage.remove(key, sync);
  }

  private async clear(sync = false): Promise<void> {
    return this._storage.clear(sync);
  }

  private defaultCrud(key: StorageKeys, value?: DataType, sync = false) {
    return {
      set: async (data: DataType) => {
        return this.set(key, data);
      },
      get: async <T extends DataType>() => {
        const res = await this.get(key).catch((e: StorageError) => {
          this.logger.log(e);
          return undefined;
        });
        return res as T | undefined;
      },
      remove: async () => {
        return this.remove(key);
      },
    };
  }

  public get someToken() {
    return this.defaultCrud("someToken");
  }
}
