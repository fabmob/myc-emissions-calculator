import React from "react"

export default function TdDiagonalBar (props: any) {
    return (
        <td className="tdDiagonalBar" style={{position: "relative", padding: "0", verticalAlign: "top"}} {...props}>
            <svg className="diagonalBar" viewBox="0 0 10 10" preserveAspectRatio="none">
                <line x1="0" y1="10" x2="10" y2="0" stroke="#67CAE4" strokeWidth="0.2" />
            </svg>
        </td>
    )
}
