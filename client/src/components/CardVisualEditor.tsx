import { useState, useRef, useEffect, useCallback } from "react";
import type { CardFieldConfig } from "@/lib/cardGenerator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CANVAS_W = 2480;
const CANVAS_H = 926;

// Demo data shown as overlay for calibration
const DEMO_TEXT: Record<string, string> = {
  cardNumber:  "KU-2024-00001",
  name:        "ਹਰਜਿੰਦਰ ਸਿੰਘ",
  designation: "ਮੈਂਬਰ",
  validUntil:  "31/12/2025",
  address:     "ਪਿੰਡ: ਲੁਧਿਆਣਾ",
  mobile:      "98765-43210",
  aadhaar:     "XXXX-XXXX-1234",
};

type FieldKey = keyof CardFieldConfig;

const FIELD_META: {
  key: FieldKey;
  label: string;
  color: string;
  type: "box" | "point";
}[] = [
  { key: "photoBox",    label: "📷 ਫੋਟੋ",   color: "#e91e63", type: "box"   },
  { key: "stamp",       label: "💮 ਸਟੈਂਪ",   color: "#c2185b", type: "box"   },
  { key: "qrCode",      label: "QR ਕੋਡ",    color: "#7b1fa2", type: "box"   },
  { key: "cardNumber",  label: "ਕਾਰਡ ਨੰ",   color: "#d32f2f", type: "point" },
  { key: "name",        label: "ਨਾਮ",        color: "#e64a19", type: "point" },
  { key: "designation", label: "ਅਹੁਦਾ",     color: "#f57c00", type: "point" },
  { key: "validUntil",  label: "ਮਿਆਦ",       color: "#f9a825", type: "point" },
  { key: "address",     label: "ਪਤਾ",        color: "#388e3c", type: "point" },
  { key: "mobile",      label: "ਫ਼ੋਨ",       color: "#1976d2", type: "point" },
  { key: "aadhaar",     label: "ਆਧਾਰ",       color: "#0097a7", type: "point" },
];

interface DragState {
  field: FieldKey;
  handle: "move" | "resize";
  startClientX: number;
  startClientY: number;
  origField: Record<string, number | string>;
}

interface Props {
  config: CardFieldConfig;
  onChange: (cfg: CardFieldConfig) => void;
  templateTs?: number;
}

export function CardVisualEditor({ config, onChange, templateTs = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [selected, setSelected] = useState<FieldKey | null>(null);
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      if (el.offsetWidth > 0) setScale(el.offsetWidth / CANVAS_W);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load stamp preview
  useEffect(() => {
    fetch(`/api/admin/stamp?t=${Date.now()}`, { credentials: "include" })
      .then(r => r.ok ? r.blob() : null)
      .then(blob => {
        if (blob) setStampUrl(URL.createObjectURL(blob));
      })
      .catch(() => {});
  }, [templateTs]);

  const updateField = useCallback(
    (key: FieldKey, updates: Record<string, number | string>) => {
      const current = config[key] as Record<string, number | string>;
      onChange({ ...config, [key]: { ...current, ...updates } });
    },
    [config, onChange]
  );

  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent, field: FieldKey, handle: "move" | "resize") => {
      e.stopPropagation();
      e.preventDefault();
      setSelected(field);
      const f = config[field] as Record<string, number | string>;
      dragRef.current = {
        field,
        handle,
        startClientX: e.clientX,
        startClientY: e.clientY,
        origField: { ...f },
      };
    },
    [config]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (e.clientX - drag.startClientX) / scale;
      const dy = (e.clientY - drag.startClientY) / scale;

      if (drag.handle === "move") {
        updateField(drag.field, {
          x: Math.round((drag.origField.x as number) + dx),
          y: Math.round((drag.origField.y as number) + dy),
        });
      } else {
        const updates: Record<string, number> = {};
        if ("size" in drag.origField) {
          const s = Math.max(20, Math.round((drag.origField.size as number) + (dx + dy) / 2));
          updates.size = s;
        } else {
          if ("w" in drag.origField) updates.w = Math.max(20, Math.round((drag.origField.w as number) + dx));
          if ("h" in drag.origField) updates.h = Math.max(20, Math.round((drag.origField.h as number) + dy));
        }
        updateField(drag.field, updates);
      }
    },
    [scale, updateField]
  );

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const selectedMeta = FIELD_META.find((m) => m.key === selected) ?? null;
  const selectedField = selected ? (config[selected] as Record<string, number | string>) : null;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800 flex items-start gap-2">
        <span className="text-base">💡</span>
        <span>
          <b>ਕਿਵੇਂ ਵਰਤਣਾ:</b> ਹੇਠਾਂ ਤਸਵੀਰ ਉੱਤੇ ਕਿਸੇ ਵੀ <b>ਰੰਗਦਾਰ ਬਾਕਸ / ਟੈਕਸਟ</b> ਨੂੰ ਖਿੱਚੋ (drag ਕਰੋ) ਅਤੇ ਛੱਡੋ।
          ਬਾਕਸ ਦੇ ਹੇਠਲੇ-ਸੱਜੇ ਕੋਨੇ ਦੀ ਛੋਟੀ ਚੌਕ ਨੂੰ ਖਿੱਚ ਕੇ resize ਕਰੋ।
          Demo ਡੇਟਾ ਦਿਖਾਇਆ ਗਿਆ ਹੈ ਤਾਂ ਜੋ calibration ਸਹੀ ਹੋਵੇ।
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {FIELD_META.map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key === selected ? null : key)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border-2 font-medium transition-all"
            style={{
              borderColor: color,
              backgroundColor: selected === key ? color : "transparent",
              color: selected === key ? "#fff" : color,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg border-2 border-gray-300 shadow overflow-hidden bg-gray-200 cursor-crosshair select-none"
        style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={() => setSelected(null)}
      >
        {/* Template image */}
        <img
          src={`/api/card-template?t=${templateTs}`}
          alt="Card Template"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "fill" }}
          crossOrigin="anonymous"
          draggable={false}
        />

        {/* Field overlays */}
        {FIELD_META.map(({ key, label, color, type }) => {
          const f = config[key] as Record<string, number> | undefined;
          if (!f) return null;
          const isSelected = selected === key;

          if (type === "box") {
            const bw = ((f.w ?? f.size ?? 100) as number) * scale;
            const bh = ((f.h ?? f.size ?? 100) as number) * scale;
            const left = (f.x as number) * scale;
            const top = (f.y as number) * scale;
            const labelSize = Math.max(9, Math.min(13, 13 * scale * 3.2));

            return (
              <div
                key={key}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: bw,
                  height: bh,
                  border: `${isSelected ? 3 : 2}px solid ${color}`,
                  backgroundColor: isSelected ? `${color}33` : `${color}18`,
                  boxSizing: "border-box",
                  zIndex: isSelected ? 20 : 10,
                  boxShadow: isSelected ? `0 0 0 2px ${color}55` : "none",
                  overflow: "hidden",
                }}
              >
                {/* Stamp image preview inside stamp box */}
                {key === "stamp" && stampUrl && (
                  <img
                    src={stampUrl}
                    alt="stamp"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      pointerEvents: "none",
                      opacity: 0.85,
                    }}
                    draggable={false}
                  />
                )}

                {/* Move handle */}
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: -1,
                    backgroundColor: color,
                    color: "#fff",
                    fontSize: labelSize + "px",
                    padding: "1px 5px",
                    cursor: "move",
                    whiteSpace: "nowrap",
                    borderRadius: "0 0 4px 0",
                    userSelect: "none",
                    lineHeight: "1.5",
                    zIndex: 5,
                  }}
                  onMouseDown={(e) => onHandleMouseDown(e, key, "move")}
                >
                  {label}
                </div>
                {/* Resize handle — bottom-right */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -7,
                    right: -7,
                    width: Math.max(10, 14 * scale * 2.5),
                    height: Math.max(10, 14 * scale * 2.5),
                    backgroundColor: color,
                    cursor: "se-resize",
                    borderRadius: 3,
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,.4)",
                    zIndex: 30,
                  }}
                  onMouseDown={(e) => onHandleMouseDown(e, key, "resize")}
                />
              </div>
            );
          } else {
            // Point (text) field — show demo text + draggable label
            const fx = (f.x as number) * scale;
            const fy = (f.y as number) * scale;
            const fs = (f.fontSize as number) * scale;
            const maxW = f.maxWidth ? (f.maxWidth as number) * scale : undefined;
            const align = (f.textAlign as string) || "left";
            const demoText = DEMO_TEXT[key] ?? label;

            // For right-aligned: x is the right edge, so position using 'right'
            const posStyle: React.CSSProperties =
              align === "right"
                ? { right: (CANVAS_W - (f.x as number)) * scale, top: fy }
                : align === "center"
                ? { left: fx, top: fy, transform: "translateX(-50%)" }
                : { left: fx, top: fy };

            return (
              <div
                key={key}
                style={{
                  position: "absolute",
                  ...posStyle,
                  zIndex: isSelected ? 20 : 10,
                  cursor: "move",
                  userSelect: "none",
                }}
                onMouseDown={(e) => onHandleMouseDown(e, key, "move")}
                title={label}
              >
                {/* Demo text rendered at actual position */}
                <div
                  style={{
                    fontSize: fs + "px",
                    fontFamily: "'Noto Sans Gurmukhi', system-ui, sans-serif",
                    fontWeight: 500,
                    color: f.color as string || color,
                    whiteSpace: "nowrap",
                    maxWidth: maxW ? maxW + "px" : undefined,
                    overflow: "visible",
                    lineHeight: 1,
                    textAlign: align as "left" | "right" | "center",
                    // Outline so it's always readable on any background
                    textShadow: "0 0 3px rgba(255,255,255,0.9), 0 0 6px rgba(255,255,255,0.7)",
                    transform: "translateY(-100%)",
                    pointerEvents: "none",
                  }}
                >
                  {demoText}
                </div>

                {/* Colored drag handle dot */}
                <div
                  style={{
                    position: "absolute",
                    top: "-100%",
                    ...(align === "right" ? { right: 0 } : { left: 0 }),
                    transform: "translate(0, -" + (fs * 0.1) + "px)",
                    width: Math.max(8, fs * 0.4),
                    height: Math.max(8, fs * 0.4),
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: isSelected ? "2px solid white" : "1.5px solid rgba(255,255,255,0.8)",
                    boxShadow: isSelected
                      ? `0 0 0 2px ${color}, 0 2px 8px rgba(0,0,0,0.4)`
                      : "0 2px 6px rgba(0,0,0,0.3)",
                    zIndex: 2,
                  }}
                />

                {/* Label tag on hover / selected */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-100%",
                      ...(align === "right" ? { right: 0 } : { left: 0 }),
                      transform: `translateY(${-fs * 0.05}px)`,
                      backgroundColor: color,
                      color: "#fff",
                      fontSize: Math.max(8, fs * 0.55) + "px",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      whiteSpace: "nowrap",
                      zIndex: 3,
                      pointerEvents: "none",
                    }}
                  >
                    {label}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>

      {/* Selected field property panel */}
      {selected && selectedMeta && selectedField && (
        <div
          className="rounded-lg border-2 p-4 space-y-3 bg-white shadow-sm"
          style={{ borderColor: selectedMeta.color }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-full"
              style={{ background: selectedMeta.color, width: 14, height: 14 }}
            />
            <h3 className="font-semibold text-sm">{selectedMeta.label} — ਸੈਟਿੰਗਾਂ</h3>
            <span className="text-xs text-muted-foreground ml-auto">ਅੰਕ ਬਦਲ ਕੇ ਵੀ ਠੀਕ ਕਰੋ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(["x", "y", "w", "h", "size", "fontSize"] as const)
              .filter((k) => k in selectedField)
              .map((k) => (
                <div key={k} className="space-y-1">
                  <Label className="text-xs font-medium uppercase tracking-wide">
                    {k === "fontSize" ? "Font Size" : k === "size" ? "Size" : k.toUpperCase()}
                  </Label>
                  <Input
                    type="number"
                    value={(selectedField[k] as number) ?? 0}
                    onChange={(e) =>
                      updateField(selected, { [k]: Number(e.target.value) })
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
              ))}

            {"maxWidth" in selectedField && (
              <div className="space-y-1">
                <Label className="text-xs font-medium uppercase tracking-wide">Max Width</Label>
                <Input
                  type="number"
                  value={(selectedField.maxWidth as number) ?? 0}
                  onChange={(e) => updateField(selected, { maxWidth: Number(e.target.value) })}
                  className="h-8 text-sm font-mono"
                />
              </div>
            )}

            {"color" in selectedField && (
              <div className="space-y-1">
                <Label className="text-xs font-medium uppercase tracking-wide">ਰੰਗ</Label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={(selectedField.color as string) || "#000000"}
                    onChange={(e) => updateField(selected, { color: e.target.value })}
                    className="h-8 w-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={(selectedField.color as string) || "#000000"}
                    onChange={(e) => updateField(selected, { color: e.target.value })}
                    className="h-8 text-sm font-mono flex-1"
                  />
                </div>
              </div>
            )}

            {"textAlign" in selectedField && (
              <div className="space-y-1">
                <Label className="text-xs font-medium uppercase tracking-wide">Align</Label>
                <select
                  value={(selectedField.textAlign as string) || "left"}
                  onChange={(e) => updateField(selected, { textAlign: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="left">Left ←</option>
                  <option value="right">Right →</option>
                  <option value="center">Center ↔</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {!selected && (
        <p className="text-center text-xs text-muted-foreground py-1">
          ਉੱਪਰ ਕਿਸੇ field ਨੂੰ click ਜਾਂ drag ਕਰੋ
        </p>
      )}
    </div>
  );
}
