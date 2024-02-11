import { gzip, ungzip } from 'node-gzip'
import { Dummy } from '../entities/dummy'

export const dummyZipper = {

    zip: async (dummy: Dummy) => {
        if (dummy.question) {
            dummy.question = await gzip(dummy.question)
        }
        return dummy
    },

    unzip: async (dummy: Dummy) => {
        if (dummy.question) {
            try {
                const question = await ungzip(dummy.question)
                dummy.question = question.toString()
            } catch (error) {
                console.error(`failed to unzip question for dummy id: ${dummy.id}`, error)
            }
        }
        return dummy
    }

}
