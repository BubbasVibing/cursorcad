"use client";

/**
 * Home page -- Root entry point for the CAD Cursor application.
 *
 * Composes the main split-pane layout:
 *   - Left panel:  ChatPanel (chat interface with input)
 *   - Right panel: Viewport  (3D scene with R3F Canvas)
 *
 * Owns the shared `jscadCode` state that connects the chat panel
 * (which fetches code from the API) to the viewport (which renders it).
 */

import { useState } from "react";
import SplitPane from "@/components/layout/SplitPane";
import ChatPanel from "@/components/chat/ChatPanel";
import Viewport from "@/components/viewport/Viewport";

export default function Home() {
  const [jscadCode, setJscadCode] = useState<string | null>(null);

  return (
    <SplitPane>
      {/* Left panel: chat interface */}
      <ChatPanel onCodeGenerated={setJscadCode} />

      {/* Right panel: 3D viewport */}
      <Viewport jscadCode={jscadCode} />
    </SplitPane>
  );
}
