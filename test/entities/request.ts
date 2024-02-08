import { Column, Entity, PrimaryColumn } from 'typeorm'
import { GlobalSecondaryIndex } from '../../src'

interface Attachment{
    name: string
    path: string
    size: string
}
@Entity({ name: 'request' })
@GlobalSecondaryIndex({ name: 'statusIndex', partitionKey: 'status', sortKey: 'modified' })
@GlobalSecondaryIndex({ name: 'statusAndEmployeePinIndex', partitionKey: ['status', 'employeePin'], sortKey: 'modified' })
@GlobalSecondaryIndex({ name: 'statusAndFormIdIndex', partitionKey: ['status', 'formId'], sortKey: 'modified' })
export class Request {
    @PrimaryColumn({ name: 'id', type: 'varchar' })
    id: string;

    @Column({ name: 'employeePin', type: 'varchar' })
    employeePin: string;

    @Column({ name: 'displayName', type: 'varchar' })
    displayName: string;

    @Column({ name: 'status', type: 'varchar' })
    status: string;

    @Column({ name: 'requestType', type: 'varchar' })
    requestType: string;

    @Column({ name: 'formId', type: 'varchar' })
    formId: string;

    @Column({ name: 'subject', type: 'varchar' })
    subject: string;

    @Column({ name: 'question', type: 'varchar' })
    question: string;

    @Column({ name: 'attachments', type: 'varchar' })
    attachments: Attachment[];

    @Column({ name: 'caseNumber', type: 'varchar' })
    caseNumber: string;

    @Column({ name: 'queue', type: 'varchar' })
    queue: string;

    @Column({ name: 'days', type: 'number' })
    days: number;

    @Column({ name: 'dueDate', type: 'varchar' })
    dueDate: string;

    @Column({ name: 'overdue', type: 'varchar' })
    overdue: string;

    @Column({ name: 'overdueModified', type: 'varchar' })
    overdueModified: string;

    @Column({ name: 'modified', type: 'varchar' })
    modified: string;
}
