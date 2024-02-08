import expect from 'expect'
import { open, getRepository, DynamoClient } from '../../src'
import { Dummy } from '../entities/dummy'
import { Request } from '../entities/request'
import sinon from 'sinon'
import { marshall } from '@aws-sdk/util-dynamodb'

describe('dynamic-repository', () => {
    afterEach(() => {
        sinon.restore()
    })
    it('put undefined', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy: any = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'
        dummy.error = undefined

        const results: any = {
            Items: [marshall(dummy, { convertClassInstanceToMap: true, removeUndefinedValues: true })]
        }

        const getStub = sinon.stub(DynamoClient.prototype, 'query')
        getStub.resolves(results)
        const putStub = sinon.stub(DynamoClient.prototype, 'put')
        putStub.resolves()

        await repository.put(dummy)

        const item = await repository.get(dummy.id)

        // expect(putStub.calledOnce).toBe(true)
        // expect(getStub.calledOnce).toBe(true)
        expect(item).toBeDefined()
    })
    it('query', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'

        const results: any = {
            Items: [marshall(dummy, { convertClassInstanceToMap: true })]
        }

        const getStub = sinon.stub(DynamoClient.prototype, 'query')
        getStub.resolves(results)
        const putStub = sinon.stub(DynamoClient.prototype, 'put')
        putStub.resolves()

        await repository.put(dummy)

        const item = await repository.get(dummy.id)

        expect(putStub.calledOnce).toBe(true)
        expect(getStub.calledOnce).toBe(true)
        expect(item).toBeDefined()
    })
    it('find', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'

        const results: any = {
            Items: [marshall(dummy, { convertClassInstanceToMap: true })]
        }

        const getStub = sinon.stub(DynamoClient.prototype, 'scan')
        getStub.resolves(results)
        const putStub = sinon.stub(DynamoClient.prototype, 'put')
        putStub.resolves()

        await repository.put(dummy)

        const items = await repository.find()

        expect(putStub.calledOnce).toBe(true)
        expect(getStub.calledOnce).toBe(true)
        expect(items.length).toBe(1)
    })
    it('findAll', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'

        const results: any = {
            Items: [marshall(dummy, { convertClassInstanceToMap: true })]
        }

        const getStub = sinon.stub(DynamoClient.prototype, 'scan')
        getStub.resolves(results)
        const putStub = sinon.stub(DynamoClient.prototype, 'put')
        putStub.resolves()

        await repository.put(dummy)

        const items = await repository.findAll()

        expect(putStub.calledOnce).toBe(true)
        expect(getStub.calledOnce).toBe(true)
        expect(items.length).toBe(1)
    })

    it('filter and select', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'

        const results: any = {
            Items: [marshall(dummy, { convertClassInstanceToMap: true })]
        }

        const getStub = sinon.stub(DynamoClient.prototype, 'scan')
        getStub.resolves(results)
        const putStub = sinon.stub(DynamoClient.prototype, 'put')
        putStub.resolves()

        await repository.put(dummy)

        const items = await repository.findAll({
            filter: "name = 'some-dummy-name'",
            select: 'id,adjustmentStatus'
        })

        const expectedInput: any = {
            FilterExpression: '#name = :name',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: {
                ':name': { S: 'some-dummy-name' }
            },
            ProjectionExpression: 'id,adjustmentStatus'
        }
        expect(putStub.calledOnce).toBe(true)
        expect(getStub.calledOnce).toBe(true)
        sinon.assert.calledWithMatch(getStub, expectedInput)
        expect(items.length).toBe(1)
    })

    it('batchGetAndBatchWrite', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'

        const results: any = {
            Responses: {
                dummy_t: [marshall(dummy, { convertClassInstanceToMap: true })]
            }
        }

        const batchWriteStub = sinon.stub(DynamoClient.prototype, 'batchWrite')
        batchWriteStub.resolves()
        const batchGetStub = sinon.stub(DynamoClient.prototype, 'batchGet')
        batchGetStub.resolves(results)

        await repository.batchWrite([
            {
                type: 'PutRequest',
                item: dummy
            }
        ])

        const items = await repository.batchRead([{ id: '123' }])

        await repository.batchWrite([
            {
                type: 'DeleteRequest',
                item: { id: dummy.id }
            }
        ])

        expect(batchGetStub.calledOnce).toBe(true)
        expect(batchWriteStub.calledTwice).toBe(true)
        expect(items.length).toBe(1)
    })
    it('scan', async (): Promise<any> => {
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        const repository = getRepository(Dummy)

        const dummy = new Dummy()
        dummy.id = '123'
        dummy.name = 'some-dummy-name'
        dummy.adjustmentGroupId = '1'
        dummy.adjustmentStatus = 'processed'

        const results: any = {
            Items: [marshall(dummy, { convertClassInstanceToMap: true })]
        }

        const getStub = sinon.stub(DynamoClient.prototype, 'scan')
        getStub.resolves(results)
        const putStub = sinon.stub(DynamoClient.prototype, 'put')
        putStub.resolves()

        await repository.put(dummy)

        const items = await repository.scan()

        expect(putStub.calledOnce).toBe(true)
        expect(getStub.calledOnce).toBe(true)
        expect(items.length).toBe(1)
    })
    it('updateExpression', async (): Promise<any> => {
        const createTableStub = sinon.stub(DynamoClient.prototype, 'createTable').resolves()
        const updateStub = sinon.stub(DynamoClient.prototype, 'update').resolves()

        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        await getRepository(Dummy).updateExpression({
            where: {
                id: '111-222-333'
            },
            setValues: {
                adjustmentStatus: 'failed',
                adjustmentGroupId: '444-555-666',
                error: 'some error occurred'
            }
        })

        const expected: any = {
            TableName: 'dummy_t',
            Key: {
                id: '111-222-333'
            },
            UpdateExpression: 'SET #adjustmentStatus = :adjustmentStatus, #adjustmentGroupId = :adjustmentGroupId, #error = :error, #adjustmentGroupId_adjustmentStatus = :adjustmentGroupId_adjustmentStatus, #id_adjustmentStatus = :id_adjustmentStatus',
            ExpressionAttributeNames: {
                '#adjustmentStatus': 'adjustmentStatus',
                '#adjustmentGroupId': 'adjustmentGroupId',
                '#error': 'error',
                '#adjustmentGroupId_adjustmentStatus': 'adjustmentGroupId#adjustmentStatus',
                '#id_adjustmentStatus': 'id#adjustmentStatus'
            },
            ExpressionAttributeValues: {
                ':adjustmentStatus': 'failed',
                ':adjustmentGroupId': '444-555-666',
                ':error': 'some error occurred',
                ':adjustmentGroupId_adjustmentStatus': '444-555-666#failed',
                ':id_adjustmentStatus': '111-222-333#failed'
            }
        }

        expect(createTableStub.calledTwice).toBe(true)
        expect(updateStub.calledWith(expected)).toBe(true)
    })

    it('updateExpression 2', async () => {
        const updateStub = sinon.stub(DynamoClient.prototype, 'update').resolves()

        await open({
            entities: [Dummy, Request]
        })
        await getRepository(Dummy).updateExpression({
            where: {
                id: '111-222-333'
            },
            setValues: {
                adjustmentGroupId: '444-555-666',
                adjustmentStatus: 'failed'
            },
            addValues: {
                lineItemNumber: 1
            }
        })

        const expected: any = {
            TableName: 'dummy_t',
            Key: {
                id: '111-222-333'
            },
            UpdateExpression: 'SET #adjustmentGroupId = :adjustmentGroupId, #adjustmentStatus = :adjustmentStatus, #adjustmentGroupId_adjustmentStatus = :adjustmentGroupId_adjustmentStatus, #id_adjustmentStatus = :id_adjustmentStatus ADD #lineItemNumber :lineItemNumber',
            ExpressionAttributeNames: {
                '#lineItemNumber': 'lineItemNumber',
                '#adjustmentGroupId': 'adjustmentGroupId',
                '#adjustmentStatus': 'adjustmentStatus',
                '#adjustmentGroupId_adjustmentStatus': 'adjustmentGroupId#adjustmentStatus',
                '#id_adjustmentStatus': 'id#adjustmentStatus'
            },
            ExpressionAttributeValues: {
                ':lineItemNumber': 1,
                ':adjustmentGroupId': '444-555-666',
                ':adjustmentStatus': 'failed',
                ':adjustmentGroupId_adjustmentStatus': '444-555-666#failed',
                ':id_adjustmentStatus': '111-222-333#failed'
            }
        }

        expect(updateStub.calledWith(expected)).toBe(true)
    })

    it('updateExpression 3', async (): Promise<any> => {
        const createTableStub = sinon.stub(DynamoClient.prototype, 'createTable').resolves()
        const updateStub = sinon.stub(DynamoClient.prototype, 'update').resolves()
        await open({
            entities: [Dummy, Request],
            synchronize: true
        })
        await getRepository(Request).updateExpression({
            where: {
                id: '111-222-333'
            },
            setValues: {
                overdue: 'Y'
            }
        })

        const expected: any = {
            TableName: 'request',
            Key: {
                id: '111-222-333'
            },
            UpdateExpression: 'SET #overdue = :overdue',
            ExpressionAttributeNames: {
                '#overdue': 'overdue'
            },
            ExpressionAttributeValues: {
                ':overdue': 'Y'
            }
        }

        expect(createTableStub.calledTwice).toBe(true)
        expect(updateStub.calledWith(expected)).toBe(true)
    })
})
