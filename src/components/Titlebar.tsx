import React, { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Square, Copy, X } from "lucide-react";
import { getCurrentWindow, type ResizeDirection } from "@tauri-apps/api/window";

const win = getCurrentWindow();

export const Titlebar: React.FC = () => {
  const [isMax, setIsMax] = useState(false);
  const dragRef = useRef<HTMLDivElement | null>(null);

  const refreshMax = useCallback(async () => {
    try {
      setIsMax(await win.isMaximized());
    } catch {}
  }, []);

  useEffect(() => {
    void refreshMax();
  }, [refreshMax]);

  const onMinimize = async () => win.minimize();
  const onToggleMax = async () => {
    await win.toggleMaximize();
    await refreshMax();
  };
  const onClose = async () => win.close();

  const onDoubleClick = async (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("[data-window-controls]")) {
      await onToggleMax();
    }
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 h-9 px-3 flex items-center justify-between bg-header-gradient-smooth supports-[backdrop-filter]:backdrop-blur-sm border-b border-neutral-800/60 has-noise"
        onDoubleClick={onDoubleClick}
      >
        {/* Drag region */}
        <div
          ref={dragRef}
          data-tauri-drag-region
          className="flex items-center gap-2 select-none h-full"
        >
          <div className="h-5 w-5 rounded-md bg-avatar-gradient-smooth has-noise-light shadow-md" />
          <span className="text-sm font-semibold text-cyan-200">Lightning</span>
        </div>

        {/* Controls */}
        <div data-window-controls className="flex items-center gap-1">
          <TitlebarBtn
            label="Minimize"
            onClick={onMinimize}
            icon={<Minus className="h-3.5 w-3.5" />}
          />
          <TitlebarBtn
            label={isMax ? "Restore" : "Maximize"}
            onClick={onToggleMax}
            icon={
              isMax ? (
                <Copy className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )
            }
          />
          <TitlebarBtn
            label="Close"
            onClick={onClose}
            accent="danger"
            icon={<X className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      <ResizeHandles />
    </>
  );
};

function TitlebarBtn({
  label,
  icon,
  onClick,
  accent = "normal",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void | Promise<void>;
  accent?: "danger" | "normal";
}) {
  const base =
    "flex items-center justify-center h-8 w-8 rounded-md transition-colors duration-150 text-cyan-100/80 hover:text-cyan-100 focus:outline-none";
  const normalHover = "hover:bg-white/10";
  const dangerHover =
    "hover:bg-red-500/20 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-400/40";

  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`${base} ${accent === "danger" ? dangerHover : normalHover}`}
    >
      <div className="flex items-center justify-center">{icon}</div>
    </button>
  );
}

const ResizeHandles: React.FC = () => {
  const start = async (edge: ResizeDirection) => {
    try {
      await win.startResizeDragging(edge);
    } catch {}
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-2 cursor-n-resize"
        onMouseDown={() => void start("North")}
      />
      <div
        className="fixed bottom-0 left-0 right-0 h-2 cursor-s-resize"
        onMouseDown={() => void start("South")}
      />
      <div
        className="fixed top-0 bottom-0 left-0 w-2 cursor-w-resize"
        onMouseDown={() => void start("West")}
      />
      <div
        className="fixed top-0 bottom-0 right-0 w-2 cursor-e-resize"
        onMouseDown={() => void start("East")}
      />
      <div
        className="fixed top-0 left-0 w-3 h-3 cursor-nw-resize"
        onMouseDown={() => void start("NorthWest")}
      />
      <div
        className="fixed top-0 right-0 w-3 h-3 cursor-ne-resize"
        onMouseDown={() => void start("NorthEast")}
      />
      <div
        className="fixed bottom-0 left-0 w-3 h-3 cursor-sw-resize"
        onMouseDown={() => void start("SouthWest")}
      />
      <div
        className="fixed bottom-0 right-0 w-3 h-3 cursor-se-resize"
        onMouseDown={() => void start("SouthEast")}
      />
    </>
  );
};
