import { Logger } from "@/utils/logger";
import {
  DataType,
  SecureStorage,
  SecureStoragePlugin,
  StorageError,
} from "@aparajita/capacitor-secure-storage";
import { Capacitor } from "@capacitor/core";
import {
  SecureStoragePlugin as SecureStoragePluginAndroid,
  SecureStoragePluginPlugin as SecureStoragePluginPluginAndroid,
} from "capacitor-secure-storage-plugin";

type StorageKeys = "someToken";

export class SecureStorageService {
  private static _instance: SecureStorageService;
  private readonly logger = new Logger(SecureStorageService.name);
  private _platform: string;
  private _isPlatformAndroid: boolean;
  private _storage: SecureStoragePlugin;
  private _storageAndroid: SecureStoragePluginPluginAndroid;

  private readonly KEY_PREFIX = "my-custom-prefix_";

  private constructor() {
    this._platform = Capacitor.getPlatform();
    this._isPlatformAndroid = this._platform === "android";

    if (this._isPlatformAndroid) {
      this._storageAndroid = SecureStoragePluginAndroid;
    } else {
      this._storage = SecureStorage;
    }
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
    if (this._isPlatformAndroid) {
      this.logger.log("using Android storage plugin");
    } else {
      await this._storage.setKeyPrefix(this.KEY_PREFIX + "_");
      this.logger.log("setKeyPrefix done");
    }

    if (this._platform === "ios") {
      await this._storage.setSynchronize(false);
    }
  }

  private async set(
    key: StorageKeys,
    value: string,
    sync = false
  ): Promise<void> {
    if (this._isPlatformAndroid) {
      await this._storageAndroid.set({
        key: key,
        value: value,
      });
    } else {
      return this._storage.set(key, value, false, sync);
    }
  }

  private async get(key: string): Promise<DataType | null | string> {
    if (this._isPlatformAndroid) {
      try {
        const res = await this._storageAndroid.get({ key: key });
        return res.value;
      } catch (e) {
        this.logger.log(e);
        return null;
      }
    } else {
      return this._storage.get(key);
    }
  }

  private async remove(key: string, sync = false): Promise<boolean> {
    if (this._isPlatformAndroid) {
      try {
        await this._storageAndroid.remove({ key: key });
        return true;
      } catch (e) {
        this.logger.log(e);
        return false;
      }
    } else {
      return this._storage.remove(key, sync);
    }
  }

  private async clear(sync = false): Promise<void> {
    if (this._isPlatformAndroid) {
      await this._storageAndroid.clear();
    } else {
      return this._storage.clear(sync);
    }
  }

  private defaultCrud(key: StorageKeys, value?: DataType, sync = false) {
    return {
      set: async (data: string) => {
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
