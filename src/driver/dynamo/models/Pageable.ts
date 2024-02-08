import { Order } from './Order'
import { Sort } from './Sort'

const replaceMap = (text: string, map: any) => {
    if (text) {
        text = decodeURIComponent(text)
        Object.keys(map).forEach((key: string) => {
            const re = new RegExp(` ${key} `, 'ig')
            const value = map[key]
            text = text.replace(re, value)
        })
        return text
    }
    return text
}

const toDynamoOperators = (text: string) => {
    return replaceMap(text, {
        eq: '=',
        ne: '<>'
    })
}

const toQueryStringOperators = (text: string) => {
    return replaceMap(text, {
        '=': 'eq',
        '<>': 'ne'
    })
}

export class Pageable {
    pageNumber: number
    pageSize: number
    sort: Sort
    exclusiveStartKey?: string
    filter?: string
    select?: string

    static DEFAULT_PAGE_NUMBER: number = 0
    static DEFAULT_PAGE_SIZE: number = 15
    static ONE: number = 1

    constructor (
        pageNumber: number,
        pageSize?: number,
        sort?: Sort,
        exclusiveStartKey?: string,
        filter?: string,
        select?: string
    ) {
        this.pageNumber = pageNumber
        this.pageSize = pageSize || Pageable.DEFAULT_PAGE_SIZE
        this.sort = sort || Sort.UNSORTED
        this.exclusiveStartKey = exclusiveStartKey
        this.filter = filter
        this.select = select
    }

    toQueryString (prefix?: string) {
        prefix = prefix || '?'
        let sort = this.sort.orders
            .map((order: Order) => {
                return `sort=${order.property},${order.direction}`
            })
            .join('&')
        if (sort) {
            sort = `&${sort}`
        }
        const filter = this.filter ? `&filter=${toQueryStringOperators(this.filter)}` : ''
        const select = this.select ? `&select=${this.select}` : ''
        return `${prefix}page=${this.pageNumber}&size=${this.pageSize}${sort}${filter}${select}`
    }

    static mixin (params: any, pageable?: any) {
        if (pageable) {
            return {
                ...params,
                pageNumber:
                    pageable.pageNumber || Pageable.DEFAULT_PAGE_NUMBER,
                pageSize: pageable.pageSize || Pageable.DEFAULT_PAGE_SIZE
            }
        }
        return params
    }

    static parse (req: any) {
        const pageNumber = parseInt(
            req.query.page || Pageable.DEFAULT_PAGE_NUMBER
        )
        const pageSize = parseInt(
            req.query.size || Pageable.DEFAULT_PAGE_SIZE
        )
        const sort = Sort.parse(req)
        const exclusiveStartKey = req.query.exclusiveStartKey
        const filter = toDynamoOperators(req.query.filter)
        const select = req.query.select
        return Pageable.of(pageNumber, pageSize, sort, exclusiveStartKey, filter, select)
    }

    static getDefault () {
        return new Pageable(this.DEFAULT_PAGE_NUMBER)
    }

    static one (sort?: Sort) {
        return new Pageable(this.DEFAULT_PAGE_NUMBER, this.ONE, sort)
    }

    static of (
        pageNumber: number,
        pageSize?: number,
        sort?: Sort,
        exclusiveStartKey?: string,
        filter?: string,
        select?: string
    ) {
        return new Pageable(pageNumber, pageSize, sort, exclusiveStartKey, filter, select)
    }
}
