"use client";
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import styles from './BubblePicker.module.css';

export type BubbleOption = {
  label: string;
  value: string;
  colorClass: string; // background tint
  dotClass: string;   // small dot color
};

export type BubblePickerHandle = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

type Props = {
  name: string;
  options: BubbleOption[];
  value?: string;
  onChange?: (val: string) => void;
  idleLabel?: string; // shown when no value selected; default ''
  renderTrigger?: boolean; // if false, don't render pill trigger (parent controls opening)
};

const BubblePicker = forwardRef<BubblePickerHandle, Props>(function BubblePicker(
  { name, options, value = '', onChange, idleLabel = '', renderTrigger = true },
  ref
) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ignoreNextDocClick = useRef(false);

  const current = options.find(o => o.value === value);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ignoreNextDocClick.current) {
        ignoreNextDocClick.current = false;
        return;
      }
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    // use click (not mousedown) so menu item onClick can fire before closing
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function select(val: string) {
    onChange?.(val);
    setOpen(false);
  }

  // Imperative API
  useImperativeHandle(ref, () => ({
    open: () => { ignoreNextDocClick.current = true; setOpen(true); },
    close: () => setOpen(false),
    toggle: () => {
      setOpen(v => {
        const next = !v;
        if (next) ignoreNextDocClick.current = true;
        return next;
      });
    },
  }), []);

  return (
    <div ref={rootRef} className={`${styles.pickerRoot} ${!renderTrigger ? styles.rootOverlay : ''}`}>
      {/* hidden input so it posts with the form */}
      <input type="hidden" name={name} value={value} />

      {/* optional pill trigger */}
      {renderTrigger && (
        <div
          className={`${styles.pill} ${current ? (styles as any)[`col${current.label.replace(/\s+/g, '')}`] : ''}`}
          onDoubleClick={() => setOpen(v => !v)}
          role="button"
          aria-haspopup="menu"
          aria-expanded={open}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setOpen(v => !v); }}
        >
          <span className={`${styles.dot} ${current ? (styles as any)[`dot${current.label.replace(/\s+/g, '')}`] : ''}`} />
          {current ? current.label : idleLabel}
          <span className={styles.chev}>▾</span>
        </div>
      )}

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuList}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.menuItem}`}
                role="menuitemradio"
                aria-checked={value === opt.value}
                onClick={() => select(opt.value)}
                title={opt.label}
              >
                <span className={`${styles.dot} ${(styles as any)[`dot${opt.label.replace(/\s+/g, '')}`]}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default BubblePicker;
