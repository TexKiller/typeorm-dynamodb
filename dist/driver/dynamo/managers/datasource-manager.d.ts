import { ObjectType } from 'typeorm/common/ObjectType';
import { EntitySchema } from 'typeorm/entity-schema/EntitySchema';
import { EntityTarget } from 'typeorm';
import { PagingAndSortingRepository } from '../repository/PagingAndSortingRepository';
import { DynamoDBClientConfigType } from '@aws-sdk/client-dynamodb';
export declare class DatasourceManagerOptions {
    entities?: ((Function | string | EntitySchema))[];
    clientConfig?: DynamoDBClientConfigType;
    synchronize?: boolean;
}
export declare const datasourceManager: {
    open(options: DatasourceManagerOptions): Promise<any>;
    getConnection(name?: string): any;
    getCustomRepository<T, Entity>(customRepository: new (a: any, b: any) => T, customEntity: ObjectType<Entity>, name?: string): T;
    getRepository<Entity_1>(target: EntityTarget<Entity_1>, name?: string): PagingAndSortingRepository<Entity_1>;
    close(): Promise<void>;
};
export declare const open: (options: DatasourceManagerOptions) => Promise<any>;
export declare const getConnection: (name?: string) => any;
export declare const getCustomRepository: <T, Entity>(customRepository: new (a: any, b: any) => T, customEntity: ObjectType<Entity>, name?: string) => T;
export declare const getRepository: <Entity>(target: EntityTarget<Entity>, name?: string) => PagingAndSortingRepository<Entity>;
export declare const close: () => Promise<void>;
