import React from "react"
import styles from "./Badge.module.css"

type BadgeProps = React.JSX.IntrinsicElements["div"] & {
    variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const cls = [
        styles.badge,
        styles[variant] || styles.default,
        className,
    ]
        .filter(Boolean)
        .join(" ")

    return <div className={cls} {...props} />
}

export { Badge }
export type { BadgeProps }
