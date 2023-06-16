import expect from 'expect'
import { unmarshall } from '@aws-sdk/util-dynamodb'

describe('unmarshall', () => {
    it('unmarshall B', async (): Promise<any> => {
        /** given: an object **/
        const uint8Array = new Uint8Array([
            31, 139, 8, 0, 0, 0, 0, 0, 0, 3, 171,
            86, 74, 42, 202, 47, 47, 78, 45, 82, 178, 82,
            114, 206, 40, 202, 207, 77, 181, 50, 52, 52, 208,
            3, 67, 165, 90, 0, 23, 118, 232, 121, 30, 0,
            0, 0
        ])
        const input = {
            data: {
                B: uint8Array
            }
        }

        /** when: customUnmarshall is called **/
        const output = unmarshall(input)

        /** then: annotations are parsed **/
        expect(output.data).toBe(uint8Array)
    })
})
