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

export const isDev = import.meta.env.DEV;
export const platform = Capacitor.getPlatform();
export const vueApp = createApp(App);

console.log("Initializing app...");
console.log("Platform:", platform);

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
      console.error("Error during bootstrapping: ", error);
      throw new Error(`Error: ${error}`);
    }
  });
} else {
  try {
    await bootstrap();
  } catch (error) {
    console.error("Error during bootstrapping: ", error);
    throw new Error(`Error: ${error}`);
  }
}

async function initDb() {
  // init db
  let _sqliteConnection: SQLiteConnection = undefined!;
  let _sqliteDataSource: DataSource = undefined!;

  _sqliteConnection = new SQLiteConnection(CapacitorSQLite);

  if (platform === "web") {
    console.log("Appending jeep-sqlite to body");
    const jeepSqliteEl = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepSqliteEl);
    await customElements.whenDefined("jeep-sqlite");
    await _sqliteConnection.initWebStore();
    console.log("Web store initialized");
  }

  CapacitorSQLite.checkConnectionsConsistency({
    openModes: ["RW", "RO"],
    // dbNames: [this.DATABASE_NAME],
    dbNames: [],
  }).catch((e) => {
    console.log(e);
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
        console.error("Error running migrations", err);
        throw err;
      });

    if (migrationRes.length > 0) {
      console.log(`${migrationRes.length} migrations run successfully`);
    } else {
      console.log("No migrations were run");
    }

    if (platform === "web") {
      await _sqliteConnection.saveToStore("myDb");
    }
  } catch (error) {
    console.error("Error during Data Source initialization", error);
    throw error;
  }
}

async function bootstrap() {
  vueApp.use(IonicVue).use(router);

  const secureStorageService = await SecureStorageService.getInstance();

  // init db
  try {
    await initDb();
  } catch (error) {
    console.error("Error during db initialization", error);
    throw error;
  }

  // init app
  router.isReady().then(() => {
    vueApp.mount("#app");
  });
}
