import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTables1679564893341 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "FirstEntity",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "firstCol",
            type: "text",
            isNullable: false,
          },
          {
            name: "secondCol",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "thirdCol",
            type: "integer",
          },
          {
            name: "fourthCol",
            type: "integer",
            isNullable: false,
          },
        ],
        indices: [
          {
            name: "IDX_FirstEntity_fourthCol",
            columnNames: ["fourthCol"],
          },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "SecondEntity",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "firstEntityId",
            type: "integer",
          },
          {
            name: "aCol",
            type: "integer",
            isNullable: false,
          },
          {
            name: "bCol",
            type: "text",
            isNullable: true,
          },
          {
            name: "cCol",
            type: "integer",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["firstEntityId"],
            referencedColumnNames: ["id"],
            referencedTableName: "FirstEntity",
            onDelete: "CASCADE",
          },
        ],
        indices: [
          {
            name: "IDX_SecondEntity_firstEntityId_aCol",
            columnNames: ["firstEntityId", "aCol"],
          },
          {
            name: "IDX_SecondEntity_cCol",
            columnNames: ["cCol"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("SecondEntity");
    await queryRunner.dropTable("FirstEntity");
  }
}
