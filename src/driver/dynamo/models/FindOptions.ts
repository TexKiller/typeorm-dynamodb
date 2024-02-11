import { dynamoAttributeHelper } from '../helpers/DynamoAttributeHelper'
import { poundToUnderscore } from '../helpers/DynamoTextHelper'
import { isNotEmpty } from '../helpers/DynamoObjectHelper'
import { marshall } from '@aws-sdk/util-dynamodb'
import { commonUtils } from '../utils/common-utils'
import { captureQuotes, splitOperators } from '../parsers/property-parser'
import { isReservedKeyword } from '../helpers/keyword-helper'

const containsToFilterExpression = (expression: string) => {
    if (expression && expression.toLowerCase().includes('contains(')) {
        const haystack = expression.replace(/^contains\(/gi, '').replace(/\)$/, '')
        const parts = haystack.split(',')
        if (parts.length === 2) {
            const name = parts[0].trim()
            const value = captureQuotes(parts[1].trim())
            const re = new RegExp(`${name}(?=(?:(?:[^']*'){2})*[^']*$)`)
            let newExpression = haystack.replace(re, `#${poundToUnderscore(name)}`)
            newExpression = newExpression.replace(value, `:${poundToUnderscore(name)}`)
            return `contains(${newExpression})`
        } else {
            throw Error(`Failed to parse contains to ExpressionAttributeNames: ${expression}`)
        }
    }
    return expression
}

const containsToAttributeValues = (expression: string, values: any) => {
    if (expression && expression.toLowerCase().includes('contains(')) {
        const haystack = expression.replace(/^contains\(/gi, '').replace(/\)$/, '')
        const parts = haystack.split(',')
        if (parts.length === 2) {
            const name = parts[0].trim()
            const value = captureQuotes(parts[1].trim()).replace(/'/g, '')
            values[
                `:${poundToUnderscore(name)}`
            ] = marshall(value.replace(/'/g, ''))
        } else {
            throw Error(`Failed to parse contains to ExpressionAttributeNames: ${expression}`)
        }
    }
    return expression
}

export class BeginsWith {
    attribute: string
    value: string
}

export class FindOptions {
    index?: string
    where?: any
    beginsWith?: BeginsWith
    limit?: number
    sort?: string
    exclusiveStartKey?: string
    filter?: string
    select?: string

    static toAttributeNames (findOptions: FindOptions) {
        return dynamoAttributeHelper.toAttributeNames(
            findOptions.where,
            findOptions.beginsWith,
            findOptions.filter,
            findOptions.select
        )
    }

    static toKeyConditionExpression (findOptions: FindOptions) {
        if (isNotEmpty(findOptions.where)) {
            const keys = Object.keys(findOptions.where)
            const values = []
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                const attribute = poundToUnderscore(key)
                values.push(`#${attribute} = :${attribute}`)
            }
            return FindOptions.appendBeginsWith(
                values.join(' and '),
                findOptions.beginsWith
            )
        }
        return undefined
    }

    static appendBeginsWith (expression: string, beginsWith?: BeginsWith) {
        if (beginsWith) {
            const attribute = poundToUnderscore(beginsWith.attribute)
            return `${expression} and begins_with(#${attribute}, :${attribute})`
        }
        return expression
    }

    static toExpressionAttributeValues (findOptions: FindOptions) {
        const values: any = {}
        if (isNotEmpty(findOptions.where)) {
            const keys = Object.keys(findOptions.where)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                values[`:${poundToUnderscore(key)}`] = marshall(findOptions.where[key])
            }
            if (findOptions.beginsWith) {
                values[
                    `:${poundToUnderscore(findOptions.beginsWith.attribute)}`
                ] = marshall(findOptions.beginsWith.value)
            }
        }
        if (findOptions.filter) {
            const expressions = findOptions.filter.split(/and|or/gi).map(expression => expression.trim())
            expressions.forEach(expression => {
                expression = containsToAttributeValues(expression, values)
                if (!expression.toLowerCase().includes('contains(')) {
                    const parts = splitOperators(expression)
                    if (parts.length === 2) {
                        const name = parts[0].trim()
                        const value = captureQuotes(parts[1].trim())
                        values[
                            `:${poundToUnderscore(name)}`
                        ] = marshall(value.replace(/'/g, ''))
                    } else {
                        throw Error(`Failed to convert filter to ExpressionAttributeValues: ${findOptions.filter}`)
                    }
                }
            })
        }
        return commonUtils.isNotEmpty(values) ? values : undefined
    }

    static toFilterExpression (options: FindOptions) {
        if (options.filter) {
            let filterExpression = `${options.filter}`
            const expressions = options.filter.split(/and|or/gi).map(expression => expression.trim())
            expressions.forEach(expression => {
                filterExpression = containsToFilterExpression(expression)
                if (!expression.toLowerCase().includes('contains(')) {
                    const parts = splitOperators(expression)
                    if (parts.length === 2) {
                        const name = parts[0].trim()
                        const value = captureQuotes(parts[1].trim())
                        const re = new RegExp(`${name}(?=(?:(?:[^']*'){2})*[^']*$)`)
                        filterExpression = filterExpression.replace(re, `#${poundToUnderscore(name)}`)
                        filterExpression = filterExpression.replace(value, `:${poundToUnderscore(name)}`)
                    } else {
                        throw Error(`Failed to convert filter to ExpressionAttributeValues: ${options.filter}`)
                    }
                }
            })
            return filterExpression
        }
        return undefined
    }

    static toProjectionExpression (options: FindOptions) {
        if (options.select) {
            const names = options.select.split(',')
            const safeNames: string[] = []
            names.forEach((name: string) => {
                if (isReservedKeyword(name)) {
                    safeNames.push(`#${name}`)
                } else {
                    safeNames.push(name)
                }
            })
            return safeNames.join(',')
        }
        return undefined
    }
}
