import { useEffect } from "react";

const KeyboardShortcuts = ({ onGlobalSearch, onReplay }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Cmd/Ctrl + K for global search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (onGlobalSearch) {
          onGlobalSearch();
        }
      }

      // R key for replay (when not in input field)
      if (
        event.key === "r" &&
        !event.target.matches("input, textarea, [contenteditable]")
      ) {
        event.preventDefault();
        if (onReplay) {
          onReplay();
        }
      }

      // Escape key to close modals/overlays
      if (event.key === "Escape") {
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent("close-modals"));
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onGlobalSearch, onReplay]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
