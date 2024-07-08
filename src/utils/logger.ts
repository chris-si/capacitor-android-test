// A logger class which supports multiple namespaces, colors and log levels.

import { QueryRunner, Logger as TypeOrmLogger } from "typeorm";

type logLevel = "log" | "info" | "error" | "warn" | "debug";

export class Logger {
  protected namespace: string;

  constructor(ns: string) {
    this.namespace = ns;
  }

  public log(message?: any, ...optionalParams: any[]): void {
    this.logToConsole("log", message, optionalParams);
  }

  public error(message?: any, ...optionalParams: any[]): void {
    this.logToConsole("error", message, optionalParams);
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    this.logToConsole("warn", message, optionalParams);
  }

  public debug(message?: any, ...optionalParams: any[]): void {
    this.logToConsole("debug", message, optionalParams);
  }

  private logToConsole(
    level: logLevel,
    message: any,
    optionalParams: any[]
  ): void {
    const messageString = `[${this.namespace}] ${message}`;

    switch (level) {
      case "error":
        if (typeof message === "string") {
          console.error(messageString, ...optionalParams);
        } else {
          console.error(messageString, message, ...optionalParams);
        }
        break;
      case "warn":
        if (typeof message === "string") {
          console.warn(messageString, ...optionalParams);
        } else {
          console.warn(messageString, message, ...optionalParams);
        }
        break;
      case "debug":
        if (typeof message === "string") {
          console.debug(messageString, ...optionalParams);
        } else {
          console.debug(messageString, message, ...optionalParams);
        }
        break;
      case "info":
        if (typeof message === "string") {
          console.info(messageString, ...optionalParams);
        } else {
          console.info(messageString, message, ...optionalParams);
        }
        break;
      case "log":
      default:
        if (typeof message === "string") {
          console.log(messageString, ...optionalParams);
        } else {
          console.log(messageString, message, ...optionalParams);
        }
    }
  }
}

export class CustomTypeOrmLogger extends Logger implements TypeOrmLogger {
  constructor() {
    super("DB-ORM");
  }

  public logQuery(
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ): void {
    this.log(`[Query] ${query}`);
  }

  public logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ): void {
    this.error(`[Query Error] ${error}: ${query}`);
  }

  public logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ): void {
    this.warn(`[Query Slow] Execution time: ${time}ms: ${query}`);
  }

  public logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    this.log(`[Schema Build] ${message}`);
  }

  public logMigration(message: string, queryRunner?: QueryRunner): void {
    this.log(`[Migration] ${message}`);
  }
}
