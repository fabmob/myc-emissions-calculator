export function validateStringAsFloat(value: string) : string {
    if (value.endsWith('.') || value.endsWith('0')) {
        return value
    }
    return (parseFloat(value) || 0).toString()
}
export function validateStringAsPercent(value: string) : string {
    if (value.endsWith('.') || value.endsWith('0')) {
        return value
    }
    let percent = parseFloat(value) || 0
    percent = Math.min(100, percent)
    return percent.toString()
}
