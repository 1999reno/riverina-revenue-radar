import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  label?: string;
  testId?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost" | "secondary";
};

export const CopyButton = ({ value, label = "Copy", testId, size = "sm", variant = "outline" }: Props) => {
  const [state, setState] = useState<"idle" | "ok" | "fallback">("idle");
  const [showFallback, setShowFallback] = useState(false);

  const onCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        setState("ok");
        setTimeout(() => setState("idle"), 1800);
        return;
      }
      throw new Error("clipboard unavailable");
    } catch {
      setShowFallback(true);
      setState("fallback");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size={size}
        variant={variant}
        onClick={onCopy}
        data-testid={testId}
        className="gap-1.5"
      >
        {state === "ok" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {state === "ok" ? "Copied" : state === "fallback" ? "Select below" : label}
      </Button>
      {showFallback && (
        <textarea
          readOnly
          value={value}
          className="w-full min-h-[120px] text-xs font-mono border border-border rounded-md p-2 bg-muted/40"
          onFocus={(e) => e.currentTarget.select()}
          data-testid={testId ? `${testId}-fallback` : undefined}
        />
      )}
    </div>
  );
};
