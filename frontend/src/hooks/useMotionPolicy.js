import { useMediaQuery } from "./useMediaQuery";
import { MOBILE_LITE_QUERY, FINE_POINTER_QUERY } from "../utils/device";

export function useMotionPolicy() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lite = useMediaQuery(MOBILE_LITE_QUERY);
  const fine = useMediaQuery(FINE_POINTER_QUERY);
  if (reduced) return "reduced";
  if (lite || !fine) return "lite";
  return "full";
}
