import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AnchorRef = React.RefObject<Element | null>;

/**
 * 앵커 요소 기준 fixed 툴팁 — HTML 라벨·SVG g 등 공통 사용
 */
export function DescriptionTooltipPortal({
  open,
  anchorRef,
  description,
  onDismiss,
}: {
  open: boolean;
  anchorRef: AnchorRef;
  description: string;
  /** 스크롤·리사이즈 시 앵커와 어긋나므로 툴팁 닫기 */
  onDismiss?: () => void;
}) {
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipStyle, setTipStyle] = useState<CSSProperties>({
    visibility: "hidden",
  });

  useLayoutEffect(() => {
    if (!open || !description) return;
    const run = () => {
      const tr = anchorRef.current;
      const tip = tipRef.current;
      if (!tr || !tip) return;
      const r = tr.getBoundingClientRect();
      const maxW = Math.min(352, window.innerWidth - 16);
      let left = r.left;
      if (left + maxW > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - maxW - 8);
      }
      const margin = 8;
      const h = tip.offsetHeight;
      let top = r.bottom + margin;
      if (top + h > window.innerHeight - margin) {
        top = r.top - margin - h;
      }
      top = Math.max(margin, Math.min(top, window.innerHeight - h - margin));
      setTipStyle({
        position: "fixed",
        left,
        top,
        zIndex: 9999,
        maxWidth: maxW,
        visibility: "visible",
      });
    };
    run();
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [open, description, anchorRef]);

  useEffect(() => {
    if (!open || !onDismiss) return;
    const close = () => onDismiss();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, onDismiss]);

  if (!open || !description) return null;

  return createPortal(
    <div
      ref={tipRef}
      role="tooltip"
      style={tipStyle}
      className="pointer-events-none rounded-lg border border-brand-line bg-white px-3 py-2 text-left text-[11px] font-normal leading-snug text-brand-navy shadow-lg"
    >
      {description}
    </div>,
    document.body
  );
}

type Props = {
  label: string;
  description: string;
  className?: string;
};

/**
 * 지표명 호버 시 설명을 바로 표시 (portal + fixed)
 */
export function TuringHoverDescription({
  label,
  description,
  className = "",
}: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-block min-w-0 max-w-full cursor-help truncate border-b border-dotted border-brand-mint/45 ${className}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {label}
      </span>
      <DescriptionTooltipPortal
        open={open}
        anchorRef={triggerRef}
        description={description}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
}
