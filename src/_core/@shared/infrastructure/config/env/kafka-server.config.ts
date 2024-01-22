import * as dotenv from 'dotenv';
import { from, logger } from 'env-var';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});
const env = from(process.env, { logger });

export class KafkaServerConfig {
  public static readonly KAFKA_REPLICA_COUNT: number =
    this.envRequiredAsPortNumber('KAFKA_REPLICA_COUNT');

  public static readonly KAFKA_BROKER_0_HOST: string = this.envRequiredAsString(
    'KAFKA_BROKER_0_HOST',
  );

  public static readonly KAFKA_BROKER_0_PORT: number =
    this.envRequiredAsPortNumber('KAFKA_BROKER_0_PORT');

  public static readonly KAFKA_BROKER_1_HOST: string = this.envRequiredAsString(
    'KAFKA_BROKER_1_HOST',
  );

  public static readonly KAFKA_BROKER_1_PORT: number =
    this.envRequiredAsPortNumber('KAFKA_BROKER_1_PORT');

  public static readonly KAFKA_BROKER_2_HOST: string = this.envRequiredAsString(
    'KAFKA_BROKER_2_HOST',
  );

  public static readonly KAFKA_BROKER_2_PORT: number =
    this.envRequiredAsPortNumber('KAFKA_BROKER_2_PORT');

  private static envRequiredAsString(key): string {
    return env.get(key).required().asString();
  }

  private static envRequiredAsPortNumber(key): number {
    return env.get(key).required().asPortNumber();
  }

  public static readonly brokers = (): string[] => {
    const brokers: string[] = [];
    for (let i = 0; i < KafkaServerConfig.KAFKA_REPLICA_COUNT; i++) {
      brokers.push(
        `${KafkaServerConfig[`KAFKA_BROKER_${i}_HOST`]}:${KafkaServerConfig[`KAFKA_BROKER_${i}_PORT`]}`,
      );
    }
    return brokers;
  };
}
