/** Wire format for conversation messages between client and server.
 *  Structurally compatible with Anthropic's MessageParam. */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}
