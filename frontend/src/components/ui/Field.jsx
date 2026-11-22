import { forwardRef, memo } from "react";

const Field = memo(
  forwardRef(function Field(
    { as: Tag = "input", className = "", label, id, ...rest },
    ref,
  ) {
    const fieldId = id || rest.name;
    return (
      <label className="flex flex-col gap-2 w-full">
        {label ? (
          <span className="font-label-bold text-xs  tracking-[0.16em] text-text-muted">
            {label}
          </span>
        ) : null}
        <Tag
          ref={ref}
          id={fieldId}
          className={`w-full border-4 border-outline bg-surface-variant text-on-surface p-3 md:p-4 font-body-md text-base md:text-lg shadow-[2px_2px_0_0_var(--shadow-color)] transition-[box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)] focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_0_var(--shadow-color)] ${className}`.trim()}
          {...rest}
        />
      </label>
    );
  }),
);

export default Field;
