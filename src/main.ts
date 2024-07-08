import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/display.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";

/* Theme variables */
import "./theme/variables.css";

import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";
import { DataSource } from "typeorm";
import { FirstEntity, SecondEntity } from "./db/entities";
import { AddTables1679564893341 } from "./db/migrations";
import { SecureStorageService } from "./services/secure-storage.service";
import { Logger } from "./utils/logger";

export const isDev = import.meta.env.DEV;
export const platform = Capacitor.getPlatform();
export const vueApp = createApp(App);

const logger = new Logger("App-Main");
logger.log("Initializing app...");
logger.log("Platform:", platform);

if (platform === "web") {
  const jeepEl = customElements.get("jeep-sqlite");
  // check if custom element is already defined
  // mandatory to avoid crash during HMR because of already existing definitions!
  if (!jeepEl) {
    customElements.define("jeep-sqlite", JeepSqlite);
  }
  window.addEventListener("DOMContentLoaded", async () => {
    try {
      await bootstrap();
    } catch (error) {
      logger.error("Error during bootstrapping: ", error);
      throw new Error(`Error: ${error}`);
    }
  });
} else {
  try {
    await bootstrap();
  } catch (error) {
    logger.error("Error during bootstrapping: ", error);
    throw new Error(`Error: ${error}`);
  }
}

async function initDb() {
  // init db
  let _sqliteConnection: SQLiteConnection = undefined!;
  let _sqliteDataSource: DataSource = undefined!;

  _sqliteConnection = new SQLiteConnection(CapacitorSQLite);

  if (platform === "web") {
    logger.log("Appending jeep-sqlite to body");
    const jeepSqliteEl = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepSqliteEl);
    await customElements.whenDefined("jeep-sqlite");
    await _sqliteConnection.initWebStore();
    logger.log("Web store initialized");
  }

  CapacitorSQLite.checkConnectionsConsistency({
    openModes: ["RW", "RO"],
    // dbNames: [this.DATABASE_NAME],
    dbNames: [],
  }).catch((e) => {
    logger.log(e);
    return {};
  });

  const databaseEntities = [FirstEntity, SecondEntity];
  const migrations = [AddTables1679564893341];

  try {
    _sqliteDataSource = new DataSource({
      type: "capacitor",
      driver: _sqliteConnection,
      database: "myDb",
      synchronize: false,
      mode: "no-encryption",
      logger: "advanced-console",
      logging: "all",
      entities: databaseEntities,
      migrations: migrations,
      migrationsRun: false,
    });

    await _sqliteDataSource.initialize().catch((err) => {
      throw err;
    });

    const migrationRes = await _sqliteDataSource
      .runMigrations({ transaction: "all" })
      .catch((err) => {
        logger.error("Error running migrations", err);
        throw err;
      });

    if (migrationRes.length > 0) {
      logger.log(`${migrationRes.length} migrations run successfully`);
    } else {
      logger.log("No migrations were run");
    }

    if (platform === "web") {
      await _sqliteConnection.saveToStore("myDb");
    }
  } catch (error) {
    logger.error("Error during Data Source initialization", error);
    throw error;
  }
}

async function testSecureStorage() {
  const secureStorageService = await SecureStorageService.getInstance();
  logger.log("accessing secure storage...");
  await secureStorageService.someToken.set("someValue");
  logger.log("Some token was set to 'someValue'");
  const res = await secureStorageService.someToken.get();
  logger.log("Some token value:", res);
}

async function bootstrap() {
  vueApp.use(IonicVue).use(router);

  await testSecureStorage();

  // init db
  try {
    await initDb();
  } catch (error) {
    logger.error("Error during db initialization", error);
    throw error;
  }

  // init app
  router.isReady().then(() => {
    vueApp.mount("#app");
  });
}
