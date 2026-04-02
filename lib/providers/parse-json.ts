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

  // Step 1: Handle unclosed strings (odd number of unescaped quotes)
  const quoteCount = (json.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    const lastQuote = json.lastIndexOf('"');
    const beforeQuote = json.slice(0, lastQuote).trimEnd();

    if (beforeQuote.endsWith(":")) {
      // Truncated at value start — remove the entire trailing key-value pair
      json = json.slice(0, lastQuote).replace(/,?\s*"[^"]*"\s*:\s*$/, "");
    } else if (beforeQuote.endsWith(",") || beforeQuote.endsWith("[")) {
      // Truncated inside an array element or after comma
      json = json.slice(0, lastQuote).replace(/,?\s*$/, "");
    } else {
      // Mid-string truncation — strip trailing backslashes to avoid creating \"
      let truncated = json;
      const trailingBackslashes = truncated.match(/\\+$/);
      if (trailingBackslashes && trailingBackslashes[0].length % 2 !== 0) {
        // Odd number of trailing backslashes — last one is an incomplete escape
        truncated = truncated.slice(0, -1);
      }
      json = truncated + '"';
    }
  }

  // Step 2: Remove trailing truncated non-string values (tru, fals, nul — not complete values)
  json = json.replace(
    /,\s*"[^"]*"\s*:\s*(?:tru|fals|nul|[-\d.]+e\+?)\s*$/i,
    ""
  );

  // Step 3: Remove trailing incomplete key without closing quote (e.g. , "partial_key)
  json = json.replace(/,\s*"[^"]*$/, "");

  // Step 4: Remove trailing "key": with colon but no value
  json = json.replace(/,?\s*"[^"]*"\s*:\s*$/, "");

  // Step 5: Close unclosed brackets and braces
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

  // Step 6: Strip trailing commas and close remaining brackets
  json = json.replace(/,\s*$/, "");

  for (let i = openBrackets.length - 1; i >= 0; i--) {
    json = json.replace(/,\s*$/, "");
    json += openBrackets[i] === "{" ? "}" : "]";
  }

  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
