"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Renders a circular avatar container for displaying user images or fallback content.
 *
 * Combines default styling for size, shape, and layout with any additional classes provided via {@link className}. Forwards all other props to the underlying Radix UI Avatar root element. Includes a `data-slot="avatar"` attribute for targeting.
 *
 * @param className - Additional CSS classes to customize the avatar's appearance.
 *
 * @remark
 * The avatar container is accessible and supports all props accepted by Radix UI's Avatar root, including ARIA attributes.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the image within an avatar, ensuring it fills the container and maintains a square aspect ratio.
 *
 * Accepts all props supported by Radix UI's AvatarPrimitive.Image, including `alt` for accessibility.
 *
 * @param className - Additional class names to customize styling.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * Provides a styled fallback UI for the avatar when the image cannot be loaded.
 *
 * Renders its children centered within a circular, muted background. Supports custom content and accessibility attributes via props.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
