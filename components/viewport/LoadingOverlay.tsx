/**
 * LoadingOverlay -- Centered overlay for the viewport during model generation.
 *
 * Displays a spinner and a status message while JSCAD is processing.
 * Future versions will cycle through sequential states:
 *   "Interpreting prompt..." -> "Generating geometry..." -> "Compiling model..."
 *
 * For now, shows a single static message controlled by the `message` prop.
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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-zinc-900/90 px-8 py-6 shadow-xl">
        {/* Spinner ring */}
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />

        {/* Status message */}
        <p className="text-sm font-medium text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
