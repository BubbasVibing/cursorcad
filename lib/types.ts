/** Wire format for conversation messages between client and server.
 *  Structurally compatible with Anthropic's MessageParam. */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/** A single named/colored part returned by JSCAD code. */
export interface JscadPart {
  geometry: import("@jscad/modeling/src/geometries/types").Geom3;
  color?: string;
  name?: string;
}

/** Three.js-side representation of a part (BufferGeometry + metadata). */
export interface ThreePart {
  geometry: import("three").BufferGeometry;
  color?: string;
  name?: string;
}
