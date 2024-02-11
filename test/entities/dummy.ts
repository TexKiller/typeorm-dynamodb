import { Column, Entity, PrimaryColumn } from 'typeorm'
import { GlobalSecondaryIndex } from '../../src'

@GlobalSecondaryIndex({ name: 'idAndAdjustmentStatusIndex', partitionKey: ['id', 'adjustmentStatus'], sortKey: 'created' })
@GlobalSecondaryIndex({ name: 'adjustmentGroupIdStatusIndex', partitionKey: ['adjustmentGroupId', 'adjustmentStatus'], sortKey: 'lineItemNumber' })
@Entity({ name: 'dummy_t' })
export class Dummy {
    @PrimaryColumn({ name: 'id', type: 'varchar' })
    id: string

    @Column({ name: 'adjustmentGroupId', type: 'varchar' })
    adjustmentGroupId: string

    @Column({ name: 'adjustmentStatus', type: 'varchar' })
    adjustmentStatus: string

    // in dynamodb  we don't need to map all columns
    name: string

    @Column({ name: 'lineItemNumber', type: 'int' })
    lineItemNumber: number

    @Column({ name: 'error', type: 'varchar' })
    error: string

    @Column({ name: 'created', type: 'varchar' })
    created: string

    @Column({ name: 'question', type: 'varchar' })
    question: any

    // this column name matches a "reserved" keyword in dynamodb.
    // want to make sure our library handles it
    @Column({ name: 'source', type: 'varchar' })
    source: string
}
