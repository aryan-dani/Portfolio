import { memo } from "react";

const Section = memo(function Section({
  as: Tag = "section",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={`flex flex-col gap-6 md:gap-8 w-full ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Section;
