"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PROVIDER_OPTIONS } from "@/lib/providers";
import { getProviderConfig, saveProviderConfig } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("claude");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("http://localhost:11434");
  const [model, setModel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = getProviderConfig();
    if (config) {
      setProviderId(config.providerId);
      setApiKey(config.apiKey ?? "");
      setBaseUrl(config.baseUrl ?? "http://localhost:11434");
      setModel(config.model ?? "");
    }
  }, []);

  const selectedProvider = PROVIDER_OPTIONS.find((p) => p.id === providerId);

  const handleSave = () => {
    saveProviderConfig({
      providerId,
      apiKey: apiKey || undefined,
      baseUrl: providerId === "ollama" ? baseUrl : undefined,
      model: model || undefined,
    });
    setSaved(true);
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="font-mono text-lg tracking-[0.25em] text-foreground/80">
            设置
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
            配置推演引擎
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Provider selection */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              LLM Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDER_OPTIONS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setProviderId(provider.id);
                    setModel("");
                  }}
                  className={`p-3 rounded-lg border text-xs font-mono transition-colors ${
                    providerId === provider.id
                      ? "border-latent-blue/40 bg-latent-blue/5 text-latent-blue"
                      : "border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          {selectedProvider?.requiresApiKey && (
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`输入 ${selectedProvider.name} API Key`}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-latent-blue/50 focus:border-latent-blue/50 transition-colors font-mono"
              />
              <p className="text-[10px] text-muted-foreground/30">
                API Key 仅存储在本地浏览器中，不会发送到任何第三方服务器。
              </p>
            </div>
          )}

          {/* Base URL for Ollama */}
          {providerId === "ollama" && (
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Ollama URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-latent-blue/50 focus:border-latent-blue/50 transition-colors font-mono"
              />
            </div>
          )}

          {/* Model selection */}
          {selectedProvider && (
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Model
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.models.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={`px-3 py-1.5 rounded border text-[11px] font-mono transition-colors ${
                      model === m || (!model && m === selectedProvider.defaultModel)
                        ? "border-latent-blue/40 bg-latent-blue/5 text-latent-blue"
                        : "border-border text-muted-foreground/60 hover:text-muted-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-latent-blue/10 border border-latent-blue/20 text-latent-blue hover:bg-latent-blue/15 hover:border-latent-blue/30 transition-colors font-mono text-xs uppercase tracking-[0.15em]"
          >
            保存
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-confidence-high/60 font-mono"
            >
              ✓ 已保存
            </motion.span>
          )}
          <button
            onClick={() => router.push("/")}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono"
          >
            ← 返回
          </button>
        </div>
      </div>
    </main>
  );
}
