"use client"

import * as React from "react"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Custom Switch component that doesn't use Radix UI
 * to prevent infinite re-render loops
 */
export function Switch({
  className,
  id = "default",
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  ...props
}: SwitchProps) {
  // Get state from our store
  const { switchStates, setSwitchState } = useUIStore();
  
  // Use local state if not controlled
  const [localChecked, setLocalChecked] = React.useState(defaultChecked);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : switchStates[id] ?? localChecked;
  
  // Handle click
  const handleClick = React.useCallback(() => {
    if (disabled) return;
    
    const newValue = !isChecked;
    
    // Update local state if uncontrolled
    if (!isControlled) {
      setLocalChecked(newValue);
      setSwitchState(id, newValue);
    }
    
    // Call onChange handler
    if (onCheckedChange) {
      onCheckedChange(newValue);
    }
  }, [isChecked, disabled, isControlled, id, onCheckedChange, setSwitchState]);
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          isChecked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
