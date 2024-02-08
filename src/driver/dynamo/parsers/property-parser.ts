export const captureQuotes = (text: string) => {
    const matches = text.match(/'[^'"]*'(?=(?:[^"]*"[^"]*")*[^"]*$)/g)
    return matches && matches.length > 0 ? matches[0] : text
}

export const splitOperators = (text: string) => {
    if (text) {
        return text.trim().split(/=|<>|<|<=|>|>=/gi)
    }
    return []
}
