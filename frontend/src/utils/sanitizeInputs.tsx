export function sanitizeFloatInput (val: string | undefined) : string  {
    if (val) {
        val = val
            .replace(',', '.') // use dots instead of commas
            .replace(/[^\d.-]+/g, '') // prevent anything not being a number or dot and minus chars
    }
    return val || ''
}
