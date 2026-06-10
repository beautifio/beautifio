import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 px-4 rounded-md border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 ${
            error ? "border-destructive" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
        {hint && !error && (
          <span className="text-xs text-text-secondary">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`min-h-[100px] px-4 py-3 rounded-md border bg-surface text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/50 resize-y focus:border-primary focus:ring-2 focus:ring-ring/20 ${
            error ? "border-destructive" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
