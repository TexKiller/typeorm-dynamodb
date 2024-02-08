import { BeginsWith } from '../models/FindOptions'
import { poundToUnderscore } from './DynamoTextHelper'
import { isNotEmpty } from './DynamoObjectHelper'

export const dynamoAttributeHelper = {
    toAttributeNames (
        object: any,
        beginsWith?: BeginsWith,
        filter?: string,
        attributeNames?: any
    ) {
        if (isNotEmpty(object)) {
            attributeNames = attributeNames || {}
            const keys = Object.keys(object)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                attributeNames[`#${poundToUnderscore(key)}`] = key
            }
        }
        if (beginsWith) {
            attributeNames = attributeNames || {}
            attributeNames[`#${poundToUnderscore(beginsWith.attribute)}`] =
                beginsWith.attribute
        }
        if (filter) {
            attributeNames = attributeNames || {}
            const expressions = filter.split(/and|or/gi).map(expression => expression.trim())
            expressions.forEach(expression => {
                // todo check for contains
                const parts = expression.trim().split(/=|<>/gi)
                if (parts.length === 2) {
                    const name = parts[0].trim()
                    attributeNames[`#${poundToUnderscore(name)}`] = name
                } else {
                    throw Error(`Failed to convert filter to ExpressionAttributeNames: ${filter}`)
                }
            })
        }
        return attributeNames
    }
}
