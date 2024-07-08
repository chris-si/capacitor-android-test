import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FirstEntity } from "./firstEntity";

@Entity("SecondEntity")
export class SecondEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @ManyToOne(() => FirstEntity, (firstEntity) => firstEntity.relationCol, {
    onDelete: "CASCADE",
  })
  relationCol: FirstEntity;

  @Column({ type: "integer" })
  firstEntityId: number;

  @Column({ type: "integer", nullable: false })
  aCol: number;

  @Column({ type: "text", nullable: true })
  bCol: number;

  @Index("IDX_SecondEntity_cCol")
  @Column({ type: "integer", nullable: false })
  cCol: number;
}
