import { useCallback, useEffect, useRef, useState } from "react";
import { createApiClient } from "@mfe-sols/data-access";
import { getSharedValue, setSharedValue, subscribeSharedValue } from "@mfe-sols/contracts";
import {
  defineDesignSystem,
  ensureTokens,
  ensureThemeToggle,
  initThemeMode,
  createToast,
  initDialog,
  initDropdown,
  initTooltip,
  initAutocomplete,
  initDatepicker,
  initDatepickerDropdown,
  initDateRangeCalendar,
  initDateRangeDropdown,
  initDateTimeDropdown,
  initDatagrid,
  initTabs,
  initSlider,
  initRangeSlider,
  initTreeView,
  initSelectMenu,
  mountEditor,
  motionPresets,
  motionTransitions,
  sanitizeInlineHtml,
} from "@mfe-sols/ui-kit";
import { motion } from "framer-motion";
import { getStoredLocale, setLocale, t } from "@mfe-sols/i18n";
import "./root.component.css";

declare const __API_BASE_URL__: string | undefined;
const compactYearRange = (current: Date) => ({
  start: current.getFullYear() - 6,
  end: current.getFullYear() + 6,
});

export default function Root(props) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === "undefined") return "en";
    return getStoredLocale();
  });
  const [localeLabel, setLocaleLabel] = useState(() => t("localeLabel"));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const apply = (next: string) => {
      const normalized = next === "vi" ? "vi" : "en";
      setLocale(normalized);
      setLocaleState(normalized);
      setLocaleLabel(t("localeLabel"));
      document.documentElement.setAttribute("lang", normalized);
    };
    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ locale?: string }>).detail;
      if (detail?.locale) apply(detail.locale);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "app-locale") {
        apply(getStoredLocale());
      }
    };
    apply(getStoredLocale());
    window.addEventListener("app-locale-change", onLocaleChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("app-locale-change", onLocaleChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const prev = document.title;
    document.title = "Playground React";
    return () => {
      document.title = prev;
    };
  }, []);

  let isDisabled = false;
  try {
    const raw = window.localStorage.getItem("mfe-disabled");
    if (raw) {
      const parsed = JSON.parse(raw);
      isDisabled = Array.isArray(parsed) && parsed.includes("@org/playground");
    }
  } catch {
    isDisabled = false;
  }

  if (isDisabled) {
    return <section>React module is disabled in monitor.</section>;
  }

  const [apiStatus, setApiStatus] = useState("idle");
  const [sharedMessage, setSharedMessage] = useState(
    getSharedValue<string>("shared:message", "")
  );
  const [phoneValue, setPhoneValue] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+1");
  const [cardValue, setCardValue] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [quantityValue, setQuantityValue] = useState(1);
  const [currencyValue, setCurrencyValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [editorSavedAt, setEditorSavedAt] = useState<string | null>(null);
  const [inlineEditorOpen, setInlineEditorOpen] = useState(false);
  const [inlineEditorValue, setInlineEditorValue] = useState("");
  const [inlineEditorLeft, setInlineEditorLeft] = useState(0);
  const [inlineEditorTop, setInlineEditorTop] = useState(0);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const treeRef = useRef<HTMLDivElement | null>(null);
  const datagridRef = useRef<HTMLTableElement | null>(null);
  const datepickerRef = useRef<HTMLDivElement | null>(null);
  const datepickerDropdownRef = useRef<HTMLDivElement | null>(null);
  const datepickerRangeInlineRef = useRef<HTMLDivElement | null>(null);
  const datepickerRangeRef = useRef<HTMLDivElement | null>(null);
  const datepickerDateTimeRef = useRef<HTMLDivElement | null>(null);
  const tooltipTriggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const sliderRangeRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<HTMLDivElement | null>(null);
  const selectMenuRef = useRef<HTMLDivElement | null>(null);
  const selectMenuMultiRef = useRef<HTMLDivElement | null>(null);
  const selectPhoneCountryRef = useRef<HTMLDivElement | null>(null);
  const selectCurrencyRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inlineEditorOpenRef = useRef(false);
  const inlineEditorValueRef = useRef("");
  const inlineEditorTargetRef = useRef<HTMLElement | null>(null);
  const inlineEditorDisposeRef = useRef<(() => void) | null>(null);
  const inlineEditorHoverRef = useRef(false);
  const inlineEditorHideTimerRef = useRef<number | null>(null);
  const inlineEditorMountRetriesRef = useRef(0);
  const inlineEditorPointerDownRef = useRef(false);
  const inlineEditorLastHoverRef = useRef(0);
  const inlineEditorFocusRef = useRef(false);
  const inlineEditorLastPointerXRef = useRef(0);
  const inlineEditorLastPointerYRef = useRef(0);
  const inlineEditorSelectionActiveRef = useRef(false);
  const inlineEditorFocusRequestRef = useRef(false);

  useEffect(() => {
    inlineEditorOpenRef.current = inlineEditorOpen;
  }, [inlineEditorOpen]);

  useEffect(() => {
    inlineEditorValueRef.current = inlineEditorValue;
  }, [inlineEditorValue]);
  useEffect(() => {
    defineDesignSystem({ tailwind: true });
    ensureTokens();
    let cleanup: (() => void) | null = null;
    const rootEl = rootRef.current as HTMLDivElement | null;
    if (rootEl) {
      const storageKey = "ds-theme:playground-react";
      initThemeMode(rootEl, storageKey);
      cleanup = ensureThemeToggle(rootEl, "Toggle theme", {
        target: rootEl,
        storageKey,
        placement: "bottom-right",
      });
    }
    const apiBaseUrl = __API_BASE_URL__ || "";
    if (!apiBaseUrl) {
      return () => {
        if (cleanup) cleanup();
      };
    }
    const api = createApiClient({
      baseUrl: apiBaseUrl,
      storage: {
        getTokens: () => null,
        setTokens: () => undefined,
        clearTokens: () => undefined,
      },
    });
    api
      .get("/health")
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (!tabsRef.current) return;
    const dispose = initTabs(tabsRef.current, { activeValue: "overview" });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!datagridRef.current) return;
    const dispose = initDatagrid(datagridRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!datepickerRef.current) return;
    const dispose = initDatepicker(datepickerRef.current, {
      showMonthYearDropdown: true,
      monthFormat: "short",
      locale: "en-US",
      yearRange: compactYearRange,
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!datepickerDropdownRef.current) return;
    const dispose = initDatepickerDropdown(datepickerDropdownRef.current, {
      yearRange: compactYearRange,
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!datepickerRangeInlineRef.current) return;
    const dispose = initDateRangeCalendar(datepickerRangeInlineRef.current, {
      showMonthYearDropdown: true,
      monthFormat: "short",
      locale: "en-US",
      yearRange: compactYearRange,
      initialStart: new Date(),
      initialEnd: new Date(new Date().setDate(new Date().getDate() + 4)),
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!datepickerRangeRef.current) return;
    const dispose = initDateRangeDropdown(datepickerRangeRef.current, {
      showMonthYearDropdown: true,
      monthFormat: "short",
      enableTimeRange: true,
      timeStepMinutes: 15,
      locale: "en-US",
      yearRange: compactYearRange,
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!datepickerDateTimeRef.current) return;
    const dispose = initDateTimeDropdown(datepickerDateTimeRef.current, {
      disabledWeekdays: [0, 6],
      locale: "en-US",
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!treeRef.current) return;
    const dispose = initTreeView(treeRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!sliderRef.current) return;
    const dispose = initSlider(sliderRef.current, { value: 40 });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!sliderRangeRef.current) return;
    const dispose = initRangeSlider(sliderRangeRef.current, { minValue: 25, maxValue: 70 });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!autocompleteRef.current) return;
    const dispose = initAutocomplete(autocompleteRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!selectMenuRef.current) return;
    const dispose = initSelectMenu(selectMenuRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!selectMenuMultiRef.current) return;
    const dispose = initSelectMenu(selectMenuMultiRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!selectPhoneCountryRef.current) return;
    const dispose = initSelectMenu(selectPhoneCountryRef.current, {
      onChange: (value) => {
        const next = Array.isArray(value) ? value[0] : value;
        setPhoneCountry(next || "+1");
      },
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!selectCurrencyRef.current) return;
    const dispose = initSelectMenu(selectCurrencyRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    const editorShell = document.getElementById("playground-editor");
    if (!editorShell) return;
    const dispose = mountEditor(editorShell, {
      label: "Content",
      helper: "Rich text editor with typography, color, and layout controls.",
      placeholder: "Write something... (Markdown not required)",
      characterLimit: 800,
      toolbar: {
        variant: "full",
        items: [
          "undo",
          "redo",
          "bold",
          "italic",
          "underline",
          "link",
          "image",
          "imageUrl",
          "videoUrl",
          "fontSize",
          "highlight",
          "textColor",
          "quote",
          "code",
          "clear",
        ],
      },
      showGrid: true,
      showStatus: true,
      onChange: ({ html, markdown, text }) => {
        setEditorValue(html);
        console.log("[editor html]", html);
        console.log("[editor markdown]", markdown);
        console.log("[editor text]", text);
      },
    });
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!tooltipTriggerRef.current || !tooltipRef.current) return;
    const dispose = initTooltip(tooltipTriggerRef.current, tooltipRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!dropdownTriggerRef.current || !dropdownContentRef.current) return;
    const dispose = initDropdown(dropdownTriggerRef.current, dropdownContentRef.current);
    return () => dispose();
  }, []);

  useEffect(() => {
    if (!showDialog || !dialogRef.current) return;
    const dispose = initDialog(dialogRef.current, backdropRef.current, {
      onClose: () => setShowDialog(false),
    });
    return () => dispose();
  }, [showDialog]);

  useEffect(() => {
    const unsubscribe = subscribeSharedValue<string>("shared:message", (value) => {
      setSharedMessage(value ?? "");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const inlineTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-ds-inline-edit]"));
    if (!inlineTargets.length) return;
    const disposers: Array<() => void> = [];
    inlineTargets.forEach((el) => {
      const onEnter = () => {
        if (inlineEditorOpenRef.current && inlineEditorTargetRef.current === el) return;
        openInlineEditor(el, false);
      };
      const onLeave = () => {
        scheduleInlineEditorHide();
      };
      const onClick = (event: MouseEvent) => {
        event.preventDefault();
        openInlineEditor(el, true);
      };
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("click", onClick);
      disposers.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("click", onClick);
      });
    });
    return () => {
      disposers.forEach((dispose) => dispose());
    };
  }, []);

  useEffect(() => {
    if (!inlineEditorOpen) return;
    const ensureMounted = () => {
      if (!inlineEditorOpenRef.current) return;
      const host = document.getElementById("inline-richtext-editor");
      if (!host) {
        if (inlineEditorMountRetriesRef.current < 5) {
          inlineEditorMountRetriesRef.current += 1;
          requestAnimationFrame(ensureMounted);
        }
        return;
      }
      mountInlineEditor(inlineEditorFocusRequestRef.current);
    };
    ensureMounted();
  }, [inlineEditorOpen]);

  useEffect(() => {
    return () => {
      if (inlineEditorHideTimerRef.current !== null) {
        window.clearTimeout(inlineEditorHideTimerRef.current);
        inlineEditorHideTimerRef.current = null;
      }
      inlineEditorDisposeRef.current?.();
      inlineEditorDisposeRef.current = null;
    };
  }, []);

  const formatPhone = (raw: string, country: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, country === "+1" ? 10 : 12);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 10);
    if (digits.length <= 3) return p1;
    if (digits.length <= 6) return `(${p1}) ${p2}`;
    return `(${p1}) ${p2}-${p3}`;
  };

  const formatCard = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g) ?? [];
    return groups.join(" ");
  };

  const formatCurrency = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const [whole, fraction] = cleaned.split(".");
    const safeWhole = (whole || "").slice(0, 9);
    const safeFraction = (fraction || "").slice(0, 2);
    return safeFraction.length ? `${safeWhole}.${safeFraction}` : safeWhole;
  };

  const clearInlineEditorHideTimer = useCallback(() => {
    if (inlineEditorHideTimerRef.current !== null) {
      window.clearTimeout(inlineEditorHideTimerRef.current);
      inlineEditorHideTimerRef.current = null;
    }
  }, []);

  const resetInlineEditorInteraction = useCallback(() => {
    inlineEditorHoverRef.current = false;
    inlineEditorPointerDownRef.current = false;
    inlineEditorFocusRef.current = false;
    inlineEditorSelectionActiveRef.current = false;
    inlineEditorLastHoverRef.current = 0;
    clearInlineEditorHideTimer();
  }, [clearInlineEditorHideTimer]);

  const saveEditor = useCallback(() => {
    const safeHtml = sanitizeInlineHtml(editorValue);
    console.log("[editor save sanitized]", safeHtml);
    setEditorSavedAt(new Date().toISOString());
  }, [editorValue]);

  const scheduleInlineEditorHide = useCallback(() => {
    if (
      inlineEditorHoverRef.current ||
      inlineEditorPointerDownRef.current ||
      inlineEditorFocusRef.current ||
      inlineEditorSelectionActiveRef.current
    ) {
      return;
    }
    clearInlineEditorHideTimer();
    inlineEditorHideTimerRef.current = window.setTimeout(() => {
      if (
        !inlineEditorHoverRef.current &&
        !inlineEditorPointerDownRef.current &&
        !inlineEditorFocusRef.current &&
        !inlineEditorSelectionActiveRef.current
      ) {
        inlineEditorDisposeRef.current?.();
        inlineEditorDisposeRef.current = null;
        setInlineEditorOpen(false);
        inlineEditorTargetRef.current = null;
        resetInlineEditorInteraction();
      }
    }, 120);
  }, [clearInlineEditorHideTimer, resetInlineEditorInteraction]);

  const openInlineEditor = useCallback(
    (target: HTMLElement, focus: boolean) => {
      resetInlineEditorInteraction();
      inlineEditorTargetRef.current = target;
      const safeHtml = sanitizeInlineHtml(target.innerHTML || "");
      setInlineEditorValue(safeHtml);
      inlineEditorValueRef.current = safeHtml;
      const rect = target.getBoundingClientRect();
      const left = Math.min(Math.max(16, rect.left + window.scrollX), window.innerWidth - 360);
      const top = rect.bottom + window.scrollY + 8;
      setInlineEditorLeft(left);
      setInlineEditorTop(top);
      setInlineEditorOpen(true);
      inlineEditorMountRetriesRef.current = 0;
      inlineEditorFocusRequestRef.current = focus;
      clearInlineEditorHideTimer();
    },
    [clearInlineEditorHideTimer, resetInlineEditorInteraction, sanitizeInlineHtml]
  );

  const mountInlineEditor = useCallback((focus: boolean) => {
    const host = document.getElementById("inline-richtext-editor");
    if (!host) return;
    if (inlineEditorDisposeRef.current) {
      inlineEditorDisposeRef.current();
      inlineEditorDisposeRef.current = null;
    }
    inlineEditorDisposeRef.current = mountEditor(host, {
      placeholder: "Edit text...",
      characterLimit: 400,
      toolbar: {
        variant: "full",
        items: ["bold", "italic", "underline", "fontSize", "textColor", "clear"],
      },
      showGrid: false,
      showStatus: false,
      onChange: ({ html }) => {
        inlineEditorValueRef.current = html;
        setInlineEditorValue(html);
      },
    });
    queueMicrotask(() => {
      const content = host.querySelector<HTMLElement>("[data-ds-editor-content]");
      if (!content) return;
      content.innerHTML = inlineEditorValueRef.current || "";
      if (!focus) return;
      content.focus();
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (selection && content.firstChild) {
          const range = document.createRange();
          range.selectNodeContents(content);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      });
    });
  }, []);

  const onInlineEditorEnter = useCallback(() => {
    inlineEditorLastHoverRef.current = Date.now();
    inlineEditorHoverRef.current = true;
    clearInlineEditorHideTimer();
  }, [clearInlineEditorHideTimer]);

  const onInlineEditorLeave = useCallback(() => {
    if (inlineEditorPointerDownRef.current || inlineEditorSelectionActiveRef.current) return;
    inlineEditorHoverRef.current = false;
    scheduleInlineEditorHide();
  }, [scheduleInlineEditorHide]);

  const onInlineEditorPointerDown = useCallback(() => {
    inlineEditorPointerDownRef.current = true;
    inlineEditorHoverRef.current = true;
    inlineEditorSelectionActiveRef.current = true;
    clearInlineEditorHideTimer();
    const onPointerUp = () => {
      inlineEditorPointerDownRef.current = false;
      const editor = document.querySelector(".ds-inline-editor [data-ds-editor-content]");
      if (editor) {
        const selection = window.getSelection();
        inlineEditorSelectionActiveRef.current = (selection && selection.toString().length > 0) || false;
      }
      window.removeEventListener("pointerup", onPointerUp);
      const host = document.querySelector(".ds-inline-editor");
      const el = document.elementFromPoint(
        inlineEditorLastPointerXRef.current,
        inlineEditorLastPointerYRef.current
      );
      if (host && el && host.contains(el)) {
        inlineEditorHoverRef.current = true;
      } else {
        const now = Date.now();
        inlineEditorHoverRef.current = now - inlineEditorLastHoverRef.current < 250;
      }
      if (!inlineEditorSelectionActiveRef.current) {
        scheduleInlineEditorHide();
      }
    };
    window.addEventListener("pointerup", onPointerUp, { once: true });
  }, [clearInlineEditorHideTimer, scheduleInlineEditorHide]);

  const onInlineEditorPointerMove = useCallback((event: React.PointerEvent) => {
    inlineEditorLastPointerXRef.current = event.clientX;
    inlineEditorLastPointerYRef.current = event.clientY;
  }, []);

  const onInlineEditorFocus = useCallback(() => {
    inlineEditorFocusRef.current = true;
    clearInlineEditorHideTimer();
  }, [clearInlineEditorHideTimer]);

  const onInlineEditorBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget || null;
      if (next) {
        const host = document.querySelector(".ds-inline-editor");
        if (host && host.contains(next as Node)) {
          return;
        }
      }
      inlineEditorFocusRef.current = false;
      inlineEditorSelectionActiveRef.current = false;
      scheduleInlineEditorHide();
    },
    [scheduleInlineEditorHide]
  );

  const saveInlineEditor = useCallback(() => {
    const host = document.getElementById("inline-richtext-editor");
    const content = host?.querySelector<HTMLElement>("[data-ds-editor-content]");
    const updatedHtml = content?.innerHTML ?? inlineEditorValueRef.current;
    const safeHtml = sanitizeInlineHtml(updatedHtml);
    if (inlineEditorTargetRef.current) {
      inlineEditorTargetRef.current.innerHTML = safeHtml;
    }
    inlineEditorDisposeRef.current?.();
    inlineEditorDisposeRef.current = null;
    setInlineEditorOpen(false);
    inlineEditorTargetRef.current = null;
    resetInlineEditorInteraction();
  }, []);

  const cancelInlineEditor = useCallback(() => {
    inlineEditorDisposeRef.current?.();
    inlineEditorDisposeRef.current = null;
    setInlineEditorOpen(false);
    inlineEditorTargetRef.current = null;
    resetInlineEditorInteraction();
  }, []);

  return (
    <section ref={rootRef} className="playground-react">
      <style>{`
        .playground-react .ds-inline-edit {
          position: relative;
          border-radius: var(--radius-md);
          padding: 2px 6px;
          transition: background-color 150ms ease;
          cursor: text;
        }
        .playground-react .ds-inline-edit:hover {
          background-color: var(--color-surface-muted);
        }
        .playground-react .ds-inline-editor {
          position: absolute;
          z-index: 40;
          width: min(360px, calc(100vw - 32px));
          min-width: 300px;
          max-width: min(720px, calc(100vw - 32px));
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          padding: 8px 12px 12px 8px;
          box-shadow: var(--ds-shadow-2);
          resize: both;
          overflow: auto;
        }
        .playground-react .ds-inline-editor__textarea {
          min-height: 96px;
        }
      `}</style>
      <div className="ds-container ds-stack-6">
        <header className="ds-appbar">
          <div className="ds-toolbar">
            <div className="ds-toolbar__title">UI Kit Playground</div>
            <div className="ds-toolbar__actions">
              <span className="ds-caption">React</span>
              <span className="ds-caption">
                {localeLabel}: {locale}
              </span>
              <span className="ds-caption">{t("playgroundsMeta")}</span>
            </div>
          </div>
        </header>

        <section className="ds-card ds-stack-3">
          <h1 className="ds-h3">Status</h1>
          <p className="ds-body2">API_BASE_URL: {__API_BASE_URL__ ?? ""}</p>
          <p className="ds-body2">API /health: {apiStatus}</p>
          <p className="ds-body2">Shared message: {sharedMessage}</p>
          <div className="ds-inline-3">
            <motion.button
              className="ds-btn ds-btn--primary ds-btn--md"
              variants={motionPresets.scaleIn as any}
              initial="initial"
              animate="animate"
              transition={motionTransitions.fast as any}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const next = `React updated ${new Date().toISOString()}`;
                setSharedValue("shared:message", next);
                setSharedMessage(next);
              }}
            >
              React UI Button
            </motion.button>
            <button className="ds-btn ds-btn--secondary ds-btn--md">Secondary</button>
            <button className="ds-btn ds-btn--ghost ds-btn--md">Ghost</button>
          </div>
        </section>
        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Typography</h2>
          <div className="ds-stack-2">
            <div className="ds-h1">Heading 1</div>
            <div className="ds-h2">Heading 2</div>
            <div className="ds-h3">Heading 3</div>
            <div className="ds-h4">Heading 4</div>
            <div className="ds-h5">Heading 5</div>
            <div className="ds-h6">Heading 6</div>
          </div>
          <div className="ds-stack-2">
            <div className="ds-subtitle1">Subtitle 1</div>
            <div className="ds-subtitle2">Subtitle 2</div>
            <div className="ds-body1">Body 1 — The quick brown fox jumps over the lazy dog.</div>
            <div className="ds-body2">Body 2 — The quick brown fox jumps over the lazy dog.</div>
            <div className="ds-caption">Caption text</div>
            <div className="ds-overline">Overline</div>
            <div className="ds-button-text">Button text</div>
            <a className="ds-link" href="#">
              Link style
            </a>
            <code className="ds-mono">Monospace sample</code>
          </div>
        </section>
        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Grid Layout</h2>
          <div className="ds-grid-2">
            <div className="ds-card">Grid 2 — Item A</div>
            <div className="ds-card">Grid 2 — Item B</div>
          </div>
          <div className="ds-grid-3">
            <div className="ds-card">Grid 3 — Item A</div>
            <div className="ds-card">Grid 3 — Item B</div>
            <div className="ds-card">Grid 3 — Item C</div>
          </div>
          <div className="ds-grid-4">
            <div className="ds-card">Grid 4 — Item A</div>
            <div className="ds-card">Grid 4 — Item B</div>
            <div className="ds-card">Grid 4 — Item C</div>
            <div className="ds-card">Grid 4 — Item D</div>
          </div>
          <div className="ds-grid-6">
            <div className="ds-card">1</div>
            <div className="ds-card">2</div>
            <div className="ds-card">3</div>
            <div className="ds-card">4</div>
            <div className="ds-card">5</div>
            <div className="ds-card">6</div>
          </div>
        </section>
        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Timeline</h2>
          <div className="ds-timeline">
            <div className="ds-timeline-item">
              <div className="ds-timeline-marker ds-timeline-marker--active">1</div>
              <div className="ds-timeline-content">
                <div className="ds-timeline-time">Today · 09:30</div>
                <div className="ds-timeline-title">Order confirmed</div>
                <div className="ds-timeline-description">
                  We have received your payment and confirmed the order.
                </div>
              </div>
            </div>
            <div className="ds-timeline-item">
              <div className="ds-timeline-marker">2</div>
              <div className="ds-timeline-content">
                <div className="ds-timeline-time">Today · 11:00</div>
                <div className="ds-timeline-title">Preparing shipment</div>
                <div className="ds-timeline-description">
                  Items are being packed and assigned to a courier.
                </div>
              </div>
            </div>
            <div className="ds-timeline-item">
              <div className="ds-timeline-marker">3</div>
              <div className="ds-timeline-content">
                <div className="ds-timeline-time">Tomorrow · 08:45</div>
                <div className="ds-timeline-title">Out for delivery</div>
                <div className="ds-timeline-description">
                  The package is on its way to your address.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Tabs</h2>
          <motion.div
            className="ds-tabs"
            ref={tabsRef}
            id="demo-tabs"
            variants={motionPresets.fadeIn as any}
            initial="initial"
            animate="animate"
            transition={motionTransitions.fast as any}
          >
            <span className="ds-tabs-indicator" data-ds-tab-indicator></span>
            <motion.button
              className="ds-tab"
              data-ds-tab-trigger
              data-ds-value="overview"
              whileTap={{ scale: 0.98 }}
            >
              Overview
            </motion.button>
            <motion.button
              className="ds-tab"
              data-ds-tab-trigger
              data-ds-value="details"
              whileTap={{ scale: 0.98 }}
            >
              Details
            </motion.button>
            <motion.button
              className="ds-tab"
              data-ds-tab-trigger
              data-ds-value="settings"
              whileTap={{ scale: 0.98 }}
            >
              Settings
            </motion.button>
          </motion.div>
          <motion.div
            data-ds-tab-panel
            data-ds-value="overview"
            variants={motionPresets.fadeInUp as any}
            initial="initial"
            animate="animate"
            transition={motionTransitions.base as any}
          >
            Overview content
          </motion.div>
          <motion.div
            data-ds-tab-panel
            data-ds-value="details"
            hidden
            variants={motionPresets.fadeInUp as any}
            initial="initial"
            animate="animate"
            transition={motionTransitions.base as any}
          >
            Details content
          </motion.div>
          <motion.div
            data-ds-tab-panel
            data-ds-value="settings"
            hidden
            variants={motionPresets.fadeInUp as any}
            initial="initial"
            animate="animate"
            transition={motionTransitions.base as any}
          >
            Settings content
          </motion.div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">DataGrid + DatePicker</h2>
          <div className="ds-datagrid">
            <table className="ds-datagrid__table" id="demo-grid" ref={datagridRef}>
              <thead className="ds-datagrid__head">
                <tr>
                  <th className="ds-datagrid__th" data-ds-sortable data-ds-field="name">
                    Name
                  </th>
                  <th className="ds-datagrid__th" data-ds-sortable data-ds-field="status">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ds-datagrid__td" data-ds-field="name">
                    Project A
                  </td>
                  <td className="ds-datagrid__td" data-ds-field="status">
                    Active
                  </td>
                </tr>
                <tr>
                  <td className="ds-datagrid__td" data-ds-field="name">
                    Project B
                  </td>
                  <td className="ds-datagrid__td" data-ds-field="status">
                    Paused
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="ds-datepicker" id="demo-datepicker" ref={datepickerRef}></div>
          <div className="ds-datepicker" ref={datepickerRangeInlineRef}></div>
          <div className="ds-datepicker-menu" ref={datepickerDropdownRef}>
            <div className="ds-datepicker-trigger">
              <input
                className="ds-input ds-datepicker-input"
                data-ds-datepicker-input
                placeholder="Pick a date"
                readOnly
              />
              <span className="ds-datepicker-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M6.5 3.5V5.5M13.5 3.5V5.5M4.5 7.5H15.5M5.5 6.5H14.5C15.0523 6.5 15.5 6.94772 15.5 7.5V15.5C15.5 16.0523 15.0523 16.5 14.5 16.5H5.5C4.94772 16.5 4.5 16.0523 4.5 15.5V7.5C4.5 6.94772 4.94772 6.5 5.5 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="ds-datepicker-panel" data-ds-datepicker-panel hidden></div>
          </div>
          <div className="ds-datepicker-menu" ref={datepickerRangeRef}>
            <div className="ds-datepicker-trigger">
              <input
                className="ds-input ds-datepicker-input"
                data-ds-datepicker-input
                placeholder="Select date range"
                readOnly
              />
              <span className="ds-datepicker-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M6.5 3.5V5.5M13.5 3.5V5.5M4.5 7.5H15.5M5.5 6.5H14.5C15.0523 6.5 15.5 6.94772 15.5 7.5V15.5C15.5 16.0523 15.0523 16.5 14.5 16.5H5.5C4.94772 16.5 4.5 16.0523 4.5 15.5V7.5C4.5 6.94772 4.94772 6.5 5.5 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="ds-datepicker-panel" data-ds-datepicker-panel hidden></div>
          </div>
          <div className="ds-datepicker-menu" ref={datepickerDateTimeRef}>
            <div className="ds-datepicker-trigger">
              <input
                className="ds-input ds-datepicker-input"
                data-ds-datepicker-input
                placeholder="Pick date & time"
                readOnly
              />
              <span className="ds-datepicker-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M6.5 3.5V5.5M13.5 3.5V5.5M4.5 7.5H15.5M5.5 6.5H14.5C15.0523 6.5 15.5 6.94772 15.5 7.5V15.5C15.5 16.0523 15.0523 16.5 14.5 16.5H5.5C4.94772 16.5 4.5 16.5 4.5 15.5V7.5C4.5 6.94772 4.94772 6.5 5.5 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="ds-datepicker-panel" data-ds-datepicker-panel hidden>
              <div data-ds-datepicker-calendar></div>
              <div className="ds-datepicker__footer" data-ds-datepicker-footer>
                <span className="ds-datepicker__footer-label">Time</span>
                <div className="ds-time-picker" data-ds-datetime-picker>
                  <div
                    className="ds-select-menu ds-time-picker__segment"
                    data-ds-time-hour
                    data-placeholder="HH"
                    data-searchable="true"
                    data-options='["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]'
                  >
                    <button className="ds-select-trigger" type="button">
                      <span className="ds-select-trigger__label">HH</span>
                      <span className="ds-select-trigger__icon" aria-hidden="true">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path
                            d="M5 7.5L10 12.5L15 7.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <span className="ds-time-picker__colon">:</span>
                  <div
                    className="ds-select-menu ds-time-picker__segment"
                    data-ds-time-minute
                    data-placeholder="MM"
                    data-searchable="true"
                    data-options='["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59"]'
                  >
                    <button className="ds-select-trigger" type="button">
                      <span className="ds-select-trigger__label">MM</span>
                      <span className="ds-select-trigger__icon" aria-hidden="true">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path
                            d="M5 7.5L10 12.5L15 7.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">TreeView</h2>
          <div className="ds-tree mfe-tree" ref={treeRef} id="demo-tree">
            <div className="ds-tree__item" data-ds-tree-item data-ds-id="root" data-state="open">
              <button className="ds-tree__toggle" data-ds-tree-toggle>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M7.5 5L12.5 10L7.5 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className="mfe-tree__node-icon" aria-hidden="true">WS</span>
              <span className="mfe-tree__content">
                <span className="ds-tree__label mfe-tree__label">Workspace</span>
                <span className="mfe-tree__meta">Unified platform modules</span>
              </span>
              <span className="mfe-tree__pill">Live</span>
              <div className="ds-tree__children" data-ds-tree-children data-state="open">
                <div className="ds-tree__item" data-ds-tree-item data-ds-id="projects" data-state="open">
                  <button className="ds-tree__toggle" data-ds-tree-toggle>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="mfe-tree__node-icon" aria-hidden="true">PJ</span>
                  <span className="mfe-tree__content">
                    <span className="ds-tree__label mfe-tree__label">Projects</span>
                    <span className="mfe-tree__meta">Production applications</span>
                  </span>
                  <span className="mfe-tree__pill">3</span>
                  <div className="ds-tree__children" data-ds-tree-children data-state="open">
                    <div className="ds-tree__item" data-ds-tree-item data-ds-id="project-a">
                      <span className="mfe-tree__spacer" aria-hidden="true"></span>
                      <span className="mfe-tree__node-icon mfe-tree__node-icon--leaf" aria-hidden="true">A</span>
                      <span className="mfe-tree__content">
                        <span className="ds-tree__label mfe-tree__label">Project Alpha</span>
                        <span className="mfe-tree__meta">Core commerce shell</span>
                      </span>
                    </div>
                    <div className="ds-tree__item" data-ds-tree-item data-ds-id="project-b">
                      <span className="mfe-tree__spacer" aria-hidden="true"></span>
                      <span className="mfe-tree__node-icon mfe-tree__node-icon--leaf" aria-hidden="true">B</span>
                      <span className="mfe-tree__content">
                        <span className="ds-tree__label mfe-tree__label">Project Beta</span>
                        <span className="mfe-tree__meta">Analytics workspace</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ds-tree__item" data-ds-tree-item data-ds-id="teams" data-state="closed">
                  <button className="ds-tree__toggle" data-ds-tree-toggle>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="mfe-tree__node-icon" aria-hidden="true">TM</span>
                  <span className="mfe-tree__content">
                    <span className="ds-tree__label mfe-tree__label">Teams</span>
                    <span className="mfe-tree__meta">Organization units</span>
                  </span>
                  <span className="mfe-tree__pill">2</span>
                  <div className="ds-tree__children" data-ds-tree-children data-state="closed" hidden>
                    <div className="ds-tree__item" data-ds-tree-item data-ds-id="team-a">
                      <span className="mfe-tree__spacer" aria-hidden="true"></span>
                      <span className="mfe-tree__node-icon mfe-tree__node-icon--leaf" aria-hidden="true">DS</span>
                      <span className="mfe-tree__content">
                        <span className="ds-tree__label mfe-tree__label">Design</span>
                        <span className="mfe-tree__meta">UX and visual language</span>
                      </span>
                    </div>
                    <div className="ds-tree__item" data-ds-tree-item data-ds-id="team-b">
                      <span className="mfe-tree__spacer" aria-hidden="true"></span>
                      <span className="mfe-tree__node-icon mfe-tree__node-icon--leaf" aria-hidden="true">EN</span>
                      <span className="mfe-tree__content">
                        <span className="ds-tree__label mfe-tree__label">Engineering</span>
                        <span className="mfe-tree__meta">Platform and delivery</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ds-tree__item" data-ds-tree-item data-ds-id="archives" data-state="closed">
                  <button className="ds-tree__toggle" data-ds-tree-toggle>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="mfe-tree__node-icon" aria-hidden="true">AR</span>
                  <span className="mfe-tree__content">
                    <span className="ds-tree__label mfe-tree__label">Archives</span>
                    <span className="mfe-tree__meta">Historical snapshots</span>
                  </span>
                  <span className="mfe-tree__pill">2</span>
                  <div className="ds-tree__children" data-ds-tree-children data-state="closed" hidden>
                    <div className="ds-tree__item" data-ds-tree-item data-ds-id="2023">
                      <span className="mfe-tree__spacer" aria-hidden="true"></span>
                      <span className="mfe-tree__node-icon mfe-tree__node-icon--leaf" aria-hidden="true">23</span>
                      <span className="mfe-tree__content">
                        <span className="ds-tree__label mfe-tree__label">2023</span>
                        <span className="mfe-tree__meta">Release notes and logs</span>
                      </span>
                    </div>
                    <div className="ds-tree__item" data-ds-tree-item data-ds-id="2022">
                      <span className="mfe-tree__spacer" aria-hidden="true"></span>
                      <span className="mfe-tree__node-icon mfe-tree__node-icon--leaf" aria-hidden="true">22</span>
                      <span className="mfe-tree__content">
                        <span className="ds-tree__label mfe-tree__label">2022</span>
                        <span className="mfe-tree__meta">Baseline archive</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Feedback + Overlays</h2>
          <div className="ds-inline-3">
            <button
              className="ds-btn ds-btn--primary ds-btn--md"
              onClick={() =>
                createToast({
                  title: "Saved",
                  description: "Your changes were saved.",
                  variant: "success",
                })
              }
            >
              Show toast
            </button>
            <button className="ds-btn ds-btn--secondary ds-btn--md" onClick={() => setShowDialog(true)}>
              Open dialog
            </button>
            <div className="relative">
              <button className="ds-btn ds-btn--ghost ds-btn--md" ref={tooltipTriggerRef}>
                Tooltip
              </button>
              <div className="ds-tooltip ds-tooltip--top" ref={tooltipRef} hidden>
                Tooltip content
              </div>
            </div>
          </div>
          <div className="ds-progress">
            <div className="ds-progress__bar" style={{ width: "60%" }}></div>
          </div>
          <div className="ds-snackbar" role="status" aria-live="polite">
            Snackbar message
            <div className="ds-snackbar__actions">
              <button className="ds-snackbar__action">Undo</button>
            </div>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Form Inputs</h2>
          <div className="ds-grid-2">
            <div className="ds-field">
              <label className="ds-label">First name</label>
              <input className="ds-input" placeholder="Jane" />
              <span className="ds-helper">Required</span>
            </div>
            <div className="ds-field">
              <label className="ds-label">Last name</label>
              <input className="ds-input" placeholder="Doe" />
            </div>
          </div>
          <div className="ds-field">
            <label className="ds-label">Email</label>
            <div className="ds-input-group">
              <input className="ds-input" placeholder="you@domain.com" />
              <button className="ds-btn ds-btn--secondary ds-btn--md">Verify</button>
            </div>
            <span className="ds-error">Invalid email</span>
          </div>
          <div className="ds-field">
            <label className="ds-label">Password</label>
            <div className="ds-input-group relative">
              <input
                className="ds-input pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.7 10.7a3 3 0 0 0 4.24 4.24" />
                    <path d="M9.88 4.73A9.96 9.96 0 0 1 12 4.5c6 0 9.5 7 9.5 7a18.4 18.4 0 0 1-4.27 5.12" />
                    <path d="M6.11 6.11A18.4 18.4 0 0 0 2.5 11.5s3.5 7 9.5 7a9.96 9.96 0 0 0 5.16-1.45" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <span className="ds-helper">Use at least 8 characters.</span>
          </div>
          <div className="ds-grid-2">
            <div className="ds-field">
              <label className="ds-label">Phone number</label>
              <div className="ds-input-group">
                <div
                  className="ds-select-menu ds-phone-select"
                  data-placeholder="Code"
                  data-options='["+1","+33","+44","+49","+65","+81","+84"]'
                  ref={selectPhoneCountryRef}
                >
                  <button className="ds-select-trigger" type="button">
                    <span className="ds-select-trigger__label">+1</span>
                    <span className="ds-select-trigger__icon" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
                <input
                  className="ds-input"
                  inputMode="tel"
                  placeholder="(555) 123-4567"
                  value={phoneValue}
                  onChange={(event) => setPhoneValue(formatPhone(event.target.value, phoneCountry))}
                />
              </div>
              <span className="ds-helper">Select country code</span>
            </div>
          </div>
          <div className="ds-credit-card-group">
            <div className="ds-credit-card-group__title">Card details</div>
            <div className="ds-grid-3">
              <div className="ds-field" style={{ gridColumn: "span 2" }}>
                <label className="ds-label">Credit card</label>
                <div className="ds-input-group">
                  <input
                    className="ds-input"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardValue}
                    onChange={(event) => setCardValue(formatCard(event.target.value))}
                  />
                  <span className="ds-input-suffix">VISA</span>
                </div>
                <span className="ds-helper">Auto formatted</span>
              </div>
              <div className="ds-field">
                <label className="ds-label">CVC</label>
                <input
                  className="ds-input"
                  inputMode="numeric"
                  placeholder="123"
                  value={cardCvc}
                  onChange={(event) =>
                    setCardCvc(event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
                <span className="ds-helper">3–4 digits</span>
              </div>
            </div>
          </div>
          <div className="ds-grid-2">
            <div className="ds-field">
              <label className="ds-label">Quantity</label>
              <div className="ds-input-group">
                <button
                  className="ds-btn ds-btn--ghost ds-btn--sm"
                  onClick={() => setQuantityValue(Math.max(0, quantityValue - 1))}
                >
                  −
                </button>
                <input
                  className="ds-input"
                  inputMode="numeric"
                  value={String(quantityValue)}
                  onChange={(event) => {
                    const next = Number(event.target.value.replace(/\D/g, ""));
                    setQuantityValue(Number.isNaN(next) ? 0 : next);
                  }}
                />
                <button
                  className="ds-btn ds-btn--ghost ds-btn--sm"
                  onClick={() => setQuantityValue(quantityValue + 1)}
                >
                  +
                </button>
              </div>
              <span className="ds-helper">Stepper input</span>
            </div>
            <div className="ds-field">
              <label className="ds-label">Amount</label>
              <div className="ds-input-group">
                <div
                  className="ds-select-menu ds-currency-select"
                  data-placeholder="USD"
                  data-options='["USD","EUR","VND","JPY","SGD"]'
                  ref={selectCurrencyRef}
                >
                  <button className="ds-select-trigger" type="button">
                    <span className="ds-select-trigger__label">USD</span>
                    <span className="ds-select-trigger__icon" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
                <input
                  className="ds-input"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={currencyValue}
                  onChange={(event) => setCurrencyValue(formatCurrency(event.target.value))}
                />
                <span className="ds-input-suffix">.00</span>
              </div>
              <span className="ds-helper">Currency input</span>
            </div>
          </div>
          <div className="ds-inline-4">
            <label className="ds-inline-2">
              <input type="checkbox" className="ds-checkbox" />
              <span className="ds-body2">Remember me</span>
            </label>
            <label className="ds-inline-2">
              <input type="radio" name="opt" className="ds-radio" />
              <span className="ds-body2">Option A</span>
            </label>
            <label className="ds-switch-field">
              <input className="ds-switch-input" type="checkbox" />
              <span className="ds-switch-control"></span>
              <span className="ds-body2">Notifications</span>
            </label>
          </div>
          <textarea className="ds-textarea" placeholder="Message"></textarea>
          <div
            className="ds-select-menu"
            data-placeholder="Choose an option"
            data-options='["Option 1","Option 2","Option 3"]'
            ref={selectMenuRef}
          >
            <button className="ds-select-trigger" type="button">
              <span className="ds-select-trigger__label">Choose an option</span>
              <span className="ds-select-trigger__icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
          <div
            className="ds-select-menu"
            data-placeholder="Select tags"
            data-multiple="true"
            data-options='["Design","Product","Engineering","Ops","Research"]'
            data-value='["Design","Product"]'
            ref={selectMenuMultiRef}
          >
            <button className="ds-select-trigger" type="button">
              <span className="ds-select-trigger__label">Select tags</span>
              <span className="ds-select-trigger__icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Editor</h2>
          <div id="playground-editor" data-ds-editor-shell></div>
          <div className="ds-inline-3">
            <button className="ds-btn ds-btn--primary ds-btn--sm" onClick={saveEditor}>
              Save
            </button>
            <span className="ds-body2">{editorSavedAt ? `Saved ${editorSavedAt}` : "Not saved yet"}</span>
          </div>
        </section>

        <section className="ds-card ds-stack-3 z-10">
          <h2 className="ds-h4">Inline Text Editor</h2>
          <p className="ds-body1 ds-inline-edit" data-ds-inline-edit="headline">
            Build delightful experiences with a unified design system.
          </p>
          <p className="ds-body2 ds-inline-edit" data-ds-inline-edit="subhead">
            Hover or click to edit inline. Changes save to the text immediately.
          </p>
          {inlineEditorOpen ? (
            <div
              className="ds-inline-editor ds-anim-fade-in"
              style={{ left: inlineEditorLeft, top: inlineEditorTop }}
              onMouseEnter={onInlineEditorEnter}
              onMouseLeave={onInlineEditorLeave}
              onPointerDown={onInlineEditorPointerDown}
              onPointerMove={onInlineEditorPointerMove}
              onFocus={onInlineEditorFocus}
              onBlur={onInlineEditorBlur}
            >
              <div className="ds-stack-2">
                <label className="ds-label">Edit text</label>
                <div id="inline-richtext-editor" data-ds-editor-shell></div>
                <div className="ds-inline-3">
                  <button className="ds-btn ds-btn--primary ds-btn--sm" onClick={saveInlineEditor}>
                    Save
                  </button>
                  <button className="ds-btn ds-btn--secondary ds-btn--sm" onClick={cancelInlineEditor}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Dropdown</h2>
          <div className="ds-dropdown">
            <button className="ds-btn ds-btn--secondary ds-btn--md" ref={dropdownTriggerRef}>
              Open menu
            </button>
            <div className="ds-dropdown__content" ref={dropdownContentRef} data-align="start" hidden>
              <div className="ds-menu" id="menu-content">
                <button className="ds-menu-item">Edit</button>
                <button className="ds-menu-item">Duplicate</button>
                <div className="ds-menu-separator"></div>
                <button className="ds-menu-item">Archive</button>
              </div>
            </div>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Data Display</h2>
          <div className="ds-inline-4">
            <span className="ds-badge">Default</span>
            <span className="ds-badge ds-badge--success">Success</span>
            <span className="ds-badge ds-badge--warning">Warning</span>
            <span className="ds-badge ds-badge--danger">Danger</span>
          </div>
          <div className="ds-inline-3">
            <span className="ds-chip">Design</span>
            <span className="ds-chip">
              Tag
              <button className="ds-chip__close" aria-label="Remove">
                ×
              </button>
            </span>
          </div>
          <div className="ds-avatar-group">
            <span className="ds-avatar">JD</span>
            <span className="ds-avatar">AB</span>
            <span className="ds-avatar">MN</span>
          </div>
          <div className="ds-list">
            <div className="ds-list-item">
              <span className="ds-avatar ds-avatar--sm">JD</span>
              <div className="ds-list-item__content">
                <div className="ds-list-item__title">Jane Doe</div>
                <div className="ds-list-item__subtitle">Admin</div>
              </div>
              <span className="ds-badge ds-badge--info">New</span>
            </div>
          </div>
          <table className="ds-table">
            <thead className="ds-thead">
              <tr className="ds-tr">
                <th className="ds-th">Name</th>
                <th className="ds-th">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="ds-tr">
                <td className="ds-td">Project A</td>
                <td className="ds-td">
                  <span className="ds-badge ds-badge--success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
          <nav className="ds-pagination" aria-label="Pagination">
            <button className="ds-page" aria-label="Previous">
              Prev
            </button>
            <button className="ds-page" data-state="active">
              1
            </button>
            <button className="ds-page">2</button>
            <button className="ds-page" aria-label="Next">
              Next
            </button>
          </nav>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Navigation</h2>
          <nav className="ds-breadcrumbs" aria-label="Breadcrumb">
            <a className="ds-breadcrumbs__item" href="#">
              Home
            </a>
            <span className="ds-breadcrumbs__separator">/</span>
            <a className="ds-breadcrumbs__item" href="#">
              Library
            </a>
            <span className="ds-breadcrumbs__separator">/</span>
            <span className="ds-breadcrumbs__item" aria-current="page">
              Data
            </span>
          </nav>
          <div className="ds-bottom-nav" style={{ position: "relative" }}>
            <div className="ds-bottom-nav__list">
              <button className="ds-bottom-nav__item" data-state="active">
                Home
              </button>
              <button className="ds-bottom-nav__item">Search</button>
              <button className="ds-bottom-nav__item">Profile</button>
            </div>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Advanced Inputs</h2>
          <div className="ds-button-group">
            <button className="ds-btn ds-btn--ghost ds-btn--sm">Left</button>
            <button className="ds-btn ds-btn--ghost ds-btn--sm">Middle</button>
            <button className="ds-btn ds-btn--ghost ds-btn--sm">Right</button>
          </div>
          <div className="ds-toggle-group">
            <button className="ds-toggle" data-state="on">
              Day
            </button>
            <button className="ds-toggle" data-state="off">
              Week
            </button>
            <button className="ds-toggle" data-state="off">
              Month
            </button>
          </div>
          <div className="ds-rating" aria-label="Rating">
            <span className="ds-rating__star">★</span>
            <span className="ds-rating__star">★</span>
            <span className="ds-rating__star">★</span>
            <span className="ds-rating__star">☆</span>
            <span className="ds-rating__star">☆</span>
          </div>
          <div className="ds-stepper">
            <div className="ds-step" data-state="completed">
              <span className="ds-step__dot">1</span>
              <span className="ds-step__label">Info</span>
            </div>
            <div className="ds-step" data-state="active">
              <span className="ds-step__dot">2</span>
              <span className="ds-step__label">Shipping</span>
            </div>
            <div className="ds-step">
              <span className="ds-step__dot">3</span>
              <span className="ds-step__label">Pay</span>
            </div>
          </div>
          <div className="ds-slider__labels">
            <span>0</span>
            <span>100</span>
          </div>
          <div className="ds-slider" ref={sliderRef} data-ds-slider>
            <div className="ds-slider__track">
              <div className="ds-slider__range" data-ds-slider-range></div>
            </div>
            <div className="ds-slider__tooltip" data-ds-slider-tooltip></div>
            <div
              className="ds-slider__thumb"
              data-ds-slider-thumb
              style={{ width: 16, height: 16 }}
            ></div>
          </div>
          <div className="ds-slider__labels">
            <span>0</span>
            <span>100</span>
          </div>
          <div className="ds-slider ds-slider--range" ref={sliderRangeRef} data-ds-slider>
            <div className="ds-slider__track"></div>
            <div className="ds-slider__range" data-ds-slider-range></div>
            <div className="ds-slider__tooltip" data-ds-slider-tooltip-start></div>
            <div className="ds-slider__tooltip" data-ds-slider-tooltip-end></div>
            <div
              className="ds-slider__thumb ds-slider__thumb--range"
              data-ds-slider-thumb-start
              style={{ width: 16, height: 16 }}
            ></div>
            <div
              className="ds-slider__thumb ds-slider__thumb--range"
              data-ds-slider-thumb-end
              style={{ width: 16, height: 16 }}
            ></div>
          </div>
          <div className="ds-autocomplete" ref={autocompleteRef}>
            <input className="ds-input" placeholder="Search..." data-ds-autocomplete-input />
            <div className="ds-autocomplete__list" data-ds-autocomplete-list>
              <button className="ds-autocomplete__item" data-ds-autocomplete-item>
                Option A
              </button>
              <button className="ds-autocomplete__item" data-ds-autocomplete-item>
                Option B
              </button>
            </div>
          </div>
        </section>

        <section className="ds-card ds-stack-3">
          <h2 className="ds-h4">Feedback</h2>
          <div className="ds-alert ds-alert--success">
            <span className="ds-alert__icon">✓</span>
            <div>Success message</div>
          </div>
          <div className="ds-progress-circular" aria-label="Loading">
            <span className="ds-progress-circular__ring"></span>
            <span className="ds-progress-circular__value"></span>
          </div>
          <div className="ds-skeleton" style={{ height: 16, width: 160 }}></div>
        </section>
      </div>
      {showDialog && (
        <>
          <div className="ds-modal-backdrop" ref={backdropRef}></div>
          <div className="ds-modal" ref={dialogRef}>
            <div className="ds-modal-header">Confirm</div>
            <div className="ds-modal-body">Are you sure you want to continue?</div>
            <div className="ds-modal-footer">
              <button className="ds-btn ds-btn--secondary ds-btn--md" onClick={() => setShowDialog(false)}>
                Cancel
              </button>
              <button className="ds-btn ds-btn--primary ds-btn--md" onClick={() => setShowDialog(false)}>
                Confirm
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
