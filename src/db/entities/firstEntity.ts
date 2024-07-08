import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SecondEntity } from "./secondEntity";

@Entity("FirstEntity")
export class FirstEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "text", nullable: false })
  firstCol: string;

  @Column({ type: "boolean", nullable: false })
  secondCol: boolean;

  @Column({ type: "integer", nullable: true })
  thirdCol: number | null;

  @Index("IDX_FirstEntity_fourthCol")
  @Column({ type: "integer", nullable: false })
  fourthCol: number;

  @OneToMany(() => SecondEntity, (secondEntity) => secondEntity.relationCol)
  relationCol: SecondEntity[];
}
