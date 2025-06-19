'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { cn } from '@/lib/utils';

import { AVAILABLE_MODELS, type ModelSelectorProps } from '../chat.types';

/**
 * Renders a dropdown selector for choosing a model from a predefined list.
 *
 * Displays the currently selected model or a placeholder if none is selected. Supports disabling interaction and custom styling via props. The dropdown is accessible and keyboard-navigable.
 *
 * @param selectedModel - The ID of the currently selected model
 * @param onModelChange - Callback invoked with the new model ID when selection changes
 * @param disabled - If true, disables the selector
 * @param className - Additional CSS classes for custom styling
 */
export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled,
  className,
}: ModelSelectorProps) {
  return (
    <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'h-12 w-full rounded-lg rounded-t-none rounded-l-none rounded-b-none border-none bg-white/10 text-white transition-colors duration-200 ease-in-out hover:bg-white/20 focus:border-none focus:ring-0 focus:ring-offset-0 focus:outline-none sm:w-[160px]',
          className,
        )}
      >
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent className="bg-white-400 bg-opacity-50 h-full w-full rounded-md border border-white/10 bg-clip-padding text-white shadow-lg backdrop-blur-3xl backdrop-filter">
        {AVAILABLE_MODELS.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="my-1 cursor-pointer rounded-md text-white/90 hover:text-white focus:bg-white/10 focus:text-white data-[highlighted]:text-white [highlighted]:bg-white/10"
          >
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
