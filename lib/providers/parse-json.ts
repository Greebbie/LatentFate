/**
 * Robustly extract and parse JSON from LLM responses.
 * Handles thinking tags, markdown fences, and other wrapper content.
 */
export function extractJSON(raw: string): unknown {
  let text = raw.trim();

  // Strip <think>...</think> blocks (Qwen, DeepSeek thinking mode)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Fall through
  }

  // Try to find the first { ... } or [ ... ] block
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // Fall through
    }
  }

  throw new Error(`Failed to extract JSON from LLM response: ${text.slice(0, 100)}...`);
}
