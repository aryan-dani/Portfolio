import { forwardRef, memo } from "react";
import { Link } from "react-router-dom";

const SIZES = {
  md: "px-6 md:px-8 py-3 md:py-4 text-sm md:text-base",
  sm: "px-4 py-2.5 text-xs md:text-sm",
};

const VARIANTS = {
  primary:
    "bg-primary-container text-on-primary-container border-4 border-outline shadow-[8px_8px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none",
  secondary:
    "bg-surface text-on-surface border-4 border-outline shadow-[8px_8px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none",
  quiet:
    "bg-transparent text-on-surface border-4 border-transparent hover:border-outline hover:bg-surface-variant",
};

/**
 * Pressable control: thick border, hard shadow, spring-like press, and a
 * single light sweep on hover. One component, every button on the site.
 */
const Button = memo(
  forwardRef(function Button(
    {
      as,
      to,
      href,
      variant = "primary",
      size = "md",
      className = "",
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const base =
      "btn-sheen relative isolate inline-flex items-center justify-center gap-2 overflow-hidden font-label-bold  tracking-wide transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[var(--ease-spring)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-45 disabled:pointer-events-none";
    const classes = `${base} ${SIZES[size] || SIZES.md} ${VARIANTS[variant] || VARIANTS.primary} ${className}`.trim();

    if (to) {
      return (
        <Link ref={ref} to={to} className={classes} {...rest}>
          {children}
        </Link>
      );
    }
    if (href || as === "a") {
      return (
        <a ref={ref} href={href} className={classes} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        {children}
      </button>
    );
  }),
);

export default Button;
