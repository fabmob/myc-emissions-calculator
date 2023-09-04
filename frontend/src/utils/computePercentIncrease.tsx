export function computePercentIncrease (currentVal: number, lastVal: number | undefined) : string  {
    if (lastVal === undefined) {
        return "+0%"
    }
    const percentIncrease = Math.round(currentVal*100/lastVal - 100)
    if (percentIncrease >= 0) {
        return "+" + percentIncrease + "%"
    }
    return percentIncrease + "%"
}
