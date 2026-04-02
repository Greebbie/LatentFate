/**
 * Robustly extract and parse JSON from LLM responses.
 * Handles thinking tags, markdown fences, truncated output, and other wrapper content.
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
      // Fall through — might be truncated
    }
  }

  // Try to repair truncated JSON (common with token limits)
  const repaired = repairTruncatedJSON(text);
  if (repaired !== null) {
    return repaired;
  }

  throw new Error(
    `Failed to extract JSON from LLM response: ${text.slice(0, 200)}...`
  );
}

/**
 * Attempt to repair truncated JSON by closing unclosed strings, arrays, and objects.
 */
function repairTruncatedJSON(text: string): unknown | null {
  // Find the start of JSON
  const start = text.indexOf("{");
  if (start === -1) return null;

  let json = text.slice(start);

  // Remove any trailing incomplete string value (cut mid-sentence)
  // Look for the last complete key-value pair
  json = json.replace(/,\s*"[^"]*":\s*"[^"]*$/, "");
  json = json.replace(/,\s*"[^"]*$/, "");

  // Close any unclosed string
  const quoteCount = (json.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    json += '"';
  }

  // Close unclosed brackets and braces
  const openBrackets: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of json) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{" || char === "[") {
      openBrackets.push(char);
    } else if (char === "}") {
      if (
        openBrackets.length > 0 &&
        openBrackets[openBrackets.length - 1] === "{"
      ) {
        openBrackets.pop();
      }
    } else if (char === "]") {
      if (
        openBrackets.length > 0 &&
        openBrackets[openBrackets.length - 1] === "["
      ) {
        openBrackets.pop();
      }
    }
  }

  // Close remaining open brackets in reverse order
  for (let i = openBrackets.length - 1; i >= 0; i--) {
    json += openBrackets[i] === "{" ? "}" : "]";
  }

  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
