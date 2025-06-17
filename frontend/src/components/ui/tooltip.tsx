"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * Provides context for tooltip components, enabling consistent configuration and timing.
 *
 * @param delayDuration - Time in milliseconds before the tooltip appears after hovering or focusing. Defaults to 0 for immediate display.
 *
 * @remark
 * Adds a `data-slot="tooltip-provider"` attribute for identification and accessibility.
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

/**
 * Provides a tooltip context and root element for displaying contextual information on hover or focus.
 *
 * Wraps the tooltip root in a provider to ensure consistent context and configuration for all tooltips.
 * Adds a `data-slot="tooltip"` attribute for styling or identification.
 */
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

/**
 * Renders an element that acts as the interactive trigger for displaying a tooltip.
 *
 * @remark
 * Passes all props to the underlying Radix UI trigger and adds a `data-slot="tooltip-trigger"` attribute for identification and styling.
 */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * Renders the content of a tooltip in a portal with customizable styling and positioning.
 *
 * Displays tooltip content with animation, rounded corners, and an arrow pointing to the trigger element. Supports custom class names and side offsets for precise positioning.
 *
 * @param className - Additional CSS classes to apply to the tooltip content.
 * @param sideOffset - Distance in pixels between the tooltip and its trigger element. Defaults to 0.
 * @param children - The content to display inside the tooltip.
 *
 * @remark The tooltip content is rendered in a portal for accessibility and proper stacking context.
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
