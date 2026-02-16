import React from "react"
import styles from "./Label.module.css"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={[styles.label, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
