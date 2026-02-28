/**
 * LoadingOverlay -- Centered overlay for the viewport during model generation.
 *
 * Theme: Light frosted-glass -- white/80 card with backdrop blur, violet spinner.
 *
 * Displays a spinner and a status message while JSCAD is processing.
 * Future versions will cycle through sequential states:
 *   "Interpreting prompt..." -> "Generating geometry..." -> "Compiling model..."
 *
 * Props:
 *   visible -- whether the overlay is shown
 *   message -- the status text to display
 */

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible = false,
  message = "Generating geometry...",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/80 px-8 py-6 shadow-xl backdrop-blur-md border border-gray-100">
        {/* Spinner ring: violet accent */}
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-violet-500" />

        {/* Status message */}
        <p className="text-sm font-medium text-gray-500">{message}</p>
      </div>
    </div>
  );
}
