import React from "react"
import styles from "./Input.module.css"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const cls = [styles.input, className].filter(Boolean).join(" ")
    return <input type={type} className={cls} ref={ref} {...props} />
  }
)
Input.displayName = "Input"

export { Input }
