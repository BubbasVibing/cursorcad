/**
 * Home page -- Root entry point for the CAD Cursor application.
 *
 * Composes the main split-pane layout:
 *   - Left panel:  ChatPanel (chat interface with input)
 *   - Right panel: Viewport  (3D scene with R3F Canvas)
 *
 * The Viewport is dynamically imported inside its own component file
 * to prevent Three.js from being bundled into the server-side build.
 */

import SplitPane from "@/components/layout/SplitPane";
import ChatPanel from "@/components/chat/ChatPanel";
import Viewport from "@/components/viewport/Viewport";

export default function Home() {
  return (
    <SplitPane>
      {/* Left panel: chat interface */}
      <ChatPanel />

      {/* Right panel: 3D viewport */}
      <Viewport />
    </SplitPane>
  );
}
