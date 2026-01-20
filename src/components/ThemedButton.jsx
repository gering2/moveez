import React from 'react'
import clsx from 'clsx'
import './themed-button.css'

const ThemedButton = React.forwardRef(function ThemedButton(
  { children, variant = 'default', active = false, size = 'md', leftIcon, rightIcon, onClick, disabled = false, className, type = 'button', ...rest },
  ref
) {
  const base = 'themed-btn'
  const vclass = `themed-btn--${variant}`
  const aclass = active ? 'themed-btn--active' : ''
  const sclass = `themed-btn--${size}`
  return (
    <button
      type={type}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, vclass, aclass, sclass, className)}
      {...rest}
    >
      {leftIcon ? <span className="themed-btn__icon themed-btn__icon--left">{leftIcon}</span> : null}
      <span className="themed-btn__label">{children}</span>
      {rightIcon ? <span className="themed-btn__icon themed-btn__icon--right">{rightIcon}</span> : null}
    </button>
  )
})

export default ThemedButton
