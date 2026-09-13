import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * RouteChangeFocus
 * A critical accessibility component for SPAs.
 * When the route changes, this hook programmatically moves screen-reader focus
 * to the <h1> element inside the <main> tag. This informs visually impaired users
 * that a new page has loaded.
 */
export function RouteChangeFocus() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only fire if the path actually changed
    if (prevPathRef.current !== location.pathname) {
      // Find the main h1 to focus for screen readers
      const mainHeader = document.querySelector("main h1");
      if (mainHeader instanceof HTMLElement) {
        // Must add tabindex="-1" to focus non-interactive elements programmatically
        mainHeader.setAttribute("tabindex", "-1");
        mainHeader.focus();
        // Remove visual outline for mouse users, but keep focus ring for keyboard if desired
        mainHeader.style.outline = "none";
      }
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return null;
}
