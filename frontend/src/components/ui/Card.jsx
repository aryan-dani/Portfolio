import { memo } from "react";

/**
 * Flat card: thick border. Raised card: thick border plus the hard shadow
 * (use sparingly; one focal element per screen).
 */
const Card = memo(function Card({
  as: Tag = "div",
  raised = false,
  className = "",
  children,
  ...rest
}) {
  const elevation = raised
    ? "border-4 border-outline bg-surface shadow-[8px_8px_0_0_var(--shadow-color)]"
    : "border-4 border-outline bg-surface shadow-[4px_4px_0_0_var(--shadow-color)]";
  return (
    <Tag className={`${elevation} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
});

export default Card;
