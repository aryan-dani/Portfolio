import { memo } from "react";

const Rule = memo(function Rule({ className = "" }) {
  return (
    <hr
      aria-hidden="true"
      className={`border-0 border-t-4 border-outline w-full m-0 ${className}`.trim()}
    />
  );
});

export default Rule;
