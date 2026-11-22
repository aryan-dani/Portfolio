import { lazy, memo, Suspense } from "react";
import { useMotionPolicy } from "../../hooks/useMotionPolicy";
import TechGlobeFallback from "./TechGlobeFallback";

const TechGlobeWebGL = lazy(() => import("./TechGlobeWebGL"));

/**
 * Skills globe entry. WebGL on full-motion desktop; static chips otherwise.
 */
const TechGlobe = memo(function TechGlobe() {
  const policy = useMotionPolicy();
  if (policy !== "full") {
    return <TechGlobeFallback />;
  }
  return (
    <Suspense fallback={<TechGlobeFallback />}>
      <TechGlobeWebGL />
    </Suspense>
  );
});

export default TechGlobe;
