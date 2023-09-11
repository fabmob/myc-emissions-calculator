import React from "react"


const OutputNumberTd = ({value, decimals, ...props}: {value: number|string, decimals?: number, rowSpan?: number, style?: React.CSSProperties, cls?: string}) => {
    const dec = decimals != undefined ? decimals : 3
    if (typeof value === "string")
        value = parseFloat(value)
    let roundedVal = ""
    let fullVal = ""
    if (!isNaN(value) && value != null) {
        roundedVal = value.toFixed(dec)
        fullVal = value.toFixed(Math.max(dec, (value.toString().split('.')[1] || []).length))
    }
    const className = "outputNumber" + (props.cls ?  " " + props.cls : "")
    return (
        <td className={className} {...props}>
            <span className='regular'>{roundedVal}</span>
            <span className='hover'>{fullVal}</span>
        </td>
    )
}

export default OutputNumberTd
