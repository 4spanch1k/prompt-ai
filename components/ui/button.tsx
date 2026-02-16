import React from "react"
import styles from "./Button.module.css"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const sizeMap: Record<string, string> = {
      default: styles.sizeDefault,
      sm: styles.sizeSm,
      lg: styles.sizeLg,
      icon: styles.sizeIcon,
    }

    const cls = [
      styles.button,
      styles[variant] || styles.default,
      sizeMap[size] || sizeMap.default,
      className,
    ]
      .filter(Boolean)
      .join(" ")

    return <button ref={ref} className={cls} {...props} />
  }
)
Button.displayName = "Button"

export { Button }
