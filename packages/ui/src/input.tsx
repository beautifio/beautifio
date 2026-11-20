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
            className="text-sm font-medium text-tinta"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 px-4 rounded-md border bg-white text-[15px] text-tinta shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-kabut/60 hover:border-laut-700/30 focus:border-laut-500 focus:ring-4 focus:ring-laut-500/15 ${
            error ? "border-danger" : "border-garis"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger">{error}</span>
        )}
        {hint && !error && (
          <span className="text-xs text-kabut">{hint}</span>
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
            className="text-sm font-medium text-tinta"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`min-h-[100px] px-4 py-3 rounded-md border bg-white text-[15px] text-tinta shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-kabut/60 hover:border-laut-700/30 resize-y focus:border-laut-500 focus:ring-4 focus:ring-laut-500/15 ${
            error ? "border-danger" : "border-garis"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
