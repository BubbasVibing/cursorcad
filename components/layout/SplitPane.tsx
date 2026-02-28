/**
 * SplitPane -- Two-column layout for the main application shell.
 *
 * Left column: fixed-width chat panel (~420 px).
 * Right column: fluid viewport that fills remaining space.
 * A 1 px divider separates the two regions.
 *
 * The component expects exactly two children:
 *   1. The chat panel (left)
 *   2. The viewport  (right)
 */
export default function SplitPane({ children }: { children: React.ReactNode }) {
  /* Convert children to an array so we can slot them into the grid */
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      {/* ---- Left panel: chat ---- */}
      <aside className="flex w-[420px] shrink-0 flex-col border-r border-zinc-800">
        {childArray[0]}
      </aside>

      {/* ---- Right panel: viewport ---- */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {childArray[1]}
      </main>
    </div>
  );
}
