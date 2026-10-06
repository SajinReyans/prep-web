const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ---------- Fallback Section Metadata ----------
const DEFAULT_SECTIONS = [
  {
    id: "react",
    name: "React.js",
    slug: "react",
    shortName: "React",
    logo: "atom",
    tagline: "Complete React course: Fundamentals to Production",
    heroPrefix: "comprehensive course · 31 modules · no account needed",
    heroTitle: "Complete React.js Course: All 31 Chapters with syntax, code & diagrams.",
    heroSubtitle: "Thirty-one modules covering everything from Fundamentals to Production. Preserving all explanations, syntax, runnable examples, responsive tables, callout notes, and interactive flow diagrams with persistent Learned tracking.",
    badgeNote: "★ marks essential core concepts",
    searchPlaceholder: "search react topics, hooks, props, state…",
    language: "jsx"
  },
  {
    id: "python",
    name: "Python",
    slug: "python",
    shortName: "Python",
    logo: "py",
    tagline: "Strings, Lists & Tuples core reference",
    heroPrefix: "reference · no account needed",
    heroTitle: "Python Strings, Lists & Tuples, explained with syntax & runnable examples.",
    heroSubtitle: "Twenty-eight groups covering Strings, Lists, and Tuples directly from your learning guides. Track each topic with the independent Learned checkbox.",
    badgeNote: "★ marks essential interview & LeetCode patterns",
    searchPlaceholder: "search python strings, lists, tuples…",
    language: "python"
  },
  {
    id: "javascript",
    name: "JavaScript",
    slug: "javascript",
    shortName: "JS",
    logo: "js",
    tagline: "Modern syntax, array methods & async patterns",
    heroPrefix: "reference · no account needed",
    heroTitle: "Every piece of JavaScript syntax, explained in one line each.",
    heroSubtitle: "Nineteen groups, from variables to modules. Each entry gets a plain-English explanation and a runnable example tucked behind a dropdown — expand only what you need.",
    badgeNote: "★ marks patterns React leans on heavily",
    searchPlaceholder: "search syntax…",
    language: "javascript"
  },
  {
    id: "numpy",
    name: "NumPy",
    slug: "numpy",
    shortName: "NumPy",
    logo: "np",
    tagline: "Numerical computing, n-dim arrays & linear algebra",
    heroPrefix: "reference · no account needed",
    heroTitle: "Every NumPy array operation & function, explained in one line each.",
    heroSubtitle: "Twelve groups, from array creation to linear algebra & missing values. Each entry gets a plain-English explanation and a runnable example tucked behind a dropdown — expand only what you need.",
    badgeNote: "★ marks essential operations for Data Science & ML",
    searchPlaceholder: "search numpy functions…",
    language: "python"
  }
];

// ---------- Data hooks ----------

function useSections() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => {
    fetch("/api/sections")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch sections");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSections(data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_SECTIONS if endpoint is unreachable
      });
  }, []);

  return sections;
}

function useTopics(sectionId) {
  const [state, setState] = useState({ loading: true, error: null, categories: [] });

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetch(`/api/topics?section=${encodeURIComponent(sectionId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((categories) => setState({ loading: false, error: null, categories }))
      .catch((err) => setState({ loading: false, error: err.message, categories: [] }));
  }, [sectionId]);

  return state;
}

// Persistent Learned items hook
function useLearnedItems() {
  const STORAGE_KEY = "prepweb_learned_items";
  const [learnedMap, setLearnedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleLearned = useCallback((id) => {
    setLearnedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn("Could not save to localStorage", err);
      }
      return next;
    });
  }, []);

  return { learnedMap, toggleLearned };
}

function matches(item, category, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (
    item.title.toLowerCase().includes(q) ||
    item.explain.toLowerCase().includes(q) ||
    (item.syntax && item.syntax.toLowerCase().includes(q)) ||
    (item.code && item.code.toLowerCase().includes(q)) ||
    (item.output && item.output.toLowerCase().includes(q)) ||
    category.title.toLowerCase().includes(q)
  ) return true;

  if (item.blocks && Array.isArray(item.blocks)) {
    for (let i = 0; i < item.blocks.length; i++) {
      const b = item.blocks[i];
      if (b.content && b.content.toLowerCase().includes(q)) return true;
      if (b.text && b.text.toLowerCase().includes(q)) return true;
      if (b.code && b.code.toLowerCase().includes(q)) return true;
      if (b.title && b.title.toLowerCase().includes(q)) return true;
      if (b.steps && b.steps.some((s) => s.toLowerCase().includes(q))) return true;
      if (b.headers && b.headers.some((h) => h.toLowerCase().includes(q))) return true;
      if (b.rows && b.rows.some((r) => r.some((c) => c.toLowerCase().includes(q)))) return true;
      if (b.items && b.items.some((it) => it.toLowerCase().includes(q))) return true;
    }
  }

  return false;
}

// ---------- UI Components ----------

function SparkBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-spark/30 bg-spark/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-spark">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.2 6.8H21l-5.6 4.1L17.6 20 12 15.9 6.4 20l2.2-7.1L3 8.8h6.8z"/>
      </svg>
      used constantly
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }, [text]);

  return (
    <button
      onClick={onCopy}
      className="focus-ring rounded-md px-2 py-1 text-[11px] font-mono text-muted hover:text-paper hover:bg-white/5 transition-colors"
      aria-label="Copy code"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

function CodeBlock({ code, output, language }) {
  return (
    <div className="reveal mt-3 overflow-hidden rounded-lg border border-hairline bg-ink">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
          </div>
          {language && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted/60 ml-2">
              {language}
            </span>
          )}
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed font-mono text-paper/90 whitespace-pre">
        <code>{code}</code>
      </pre>
      {output && (
        <div className="border-t border-hairline bg-surface/50 px-4 py-2.5">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">output</div>
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-mint whitespace-pre">{output}</pre>
        </div>
      )}
    </div>
  );
}

function CalloutIcon({ variant }) {
  if (variant === "warning") {
    return (
      <svg className="h-4 w-4 text-[#ff5f57] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    );
  }
  if (variant === "tip") {
    return (
      <svg className="h-4 w-4 text-spark flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.2 6.8H21l-5.6 4.1L17.6 20 12 15.9 6.4 20l2.2-7.1L3 8.8h6.8z"/>
      </svg>
    );
  }
  if (variant === "note") {
    return (
      <svg className="h-4 w-4 text-mint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-violet flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}

function LessonBlocks({ blocks, language }) {
  if (!blocks || !blocks.length) return null;

  return (
    <div className="space-y-3.5 pt-2">
      {blocks.map((block, idx) => {
        if (block.type === "text") {
          return (
            <p key={idx} className="text-[13px] leading-relaxed text-paper/90 whitespace-pre-line font-sans">
              {block.content}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <div key={idx} className="pt-3 pb-1 border-b border-hairline/40 flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-violet">#</span>
              <h4 className="font-display text-sm font-semibold text-paper tracking-wide">
                {block.text}
              </h4>
            </div>
          );
        }

        if (block.type === "syntax") {
          return (
            <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-spark/30 bg-ink/80 px-3.5 py-2 font-mono text-xs">
              <span className="rounded bg-spark/15 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-spark">Syntax</span>
              <code className="text-spark font-medium break-all">{block.code}</code>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <div key={idx} className="my-2">
              {block.caption && (
                <div className="mb-1 font-mono text-[11px] text-muted flex items-center gap-1.5">
                  <span className="text-mint font-semibold">›</span>
                  <span>{block.caption}</span>
                </div>
              )}
              <CodeBlock code={block.code} language={block.language || language} />
            </div>
          );
        }

        if (block.type === "output") {
          return (
            <div key={idx} className="overflow-hidden rounded-lg border border-hairline bg-surface/50 p-3">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-mint"></span>
                Output
              </div>
              <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-mint whitespace-pre">{block.content}</pre>
            </div>
          );
        }

        if (block.type === "callout") {
          const variantClasses = {
            warning: "border-red-500/40 bg-red-950/20 text-red-200",
            tip: "border-spark/40 bg-spark/10 text-amber-100",
            important: "border-violet/40 bg-violet/10 text-violet-100",
            note: "border-mint/40 bg-mint/10 text-emerald-100"
          }[block.variant || "important"] || "border-violet/40 bg-violet/10 text-violet-100";

          return (
            <div key={idx} className={`rounded-xl border p-3.5 transition-all ${variantClasses}`}>
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider mb-1.5 text-paper">
                <CalloutIcon variant={block.variant} />
                <span>{block.title}</span>
              </div>
              <div className="text-[13px] leading-relaxed whitespace-pre-line text-paper/90 font-sans">
                {block.content}
              </div>
            </div>
          );
        }

        if (block.type === "diagram") {
          if (block.diagramType === "tree") {
            return (
              <div key={idx} className="overflow-hidden rounded-lg border border-hairline bg-ink/90 p-3.5">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5 font-semibold">
                  <span className="text-violet">✦</span>
                  Structure Diagram
                </div>
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-mint whitespace-pre">{block.raw}</pre>
              </div>
            );
          }

          return (
            <div key={idx} className="rounded-xl border border-hairline bg-ink/70 p-3.5">
              {block.title && (
                <div className="mb-3 font-mono text-xs font-semibold text-spark flex items-center gap-2">
                  <span className="text-mint">⚡</span>
                  <span>{block.title}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 justify-start">
                {block.steps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-raised px-3 py-1.5 text-xs font-mono text-paper shadow-sm">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet/20 text-[10px] font-bold text-violet">{sIdx + 1}</span>
                      <span>{step}</span>
                    </div>
                    {sIdx < block.steps.length - 1 && (
                      <span className="text-spark font-mono font-bold text-sm transform sm:rotate-0 rotate-90 my-0.5 sm:my-0">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "table") {
          return (
            <div key={idx} className="overflow-x-auto rounded-xl border border-hairline bg-surface/40 my-3">
              <table className="w-full text-left text-xs font-mono">
                {block.headers && block.headers.length > 0 && (
                  <thead className="border-b border-hairline bg-surface text-muted uppercase text-[10px] tracking-wider">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2 font-semibold text-paper">{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-hairline/60">
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-paper/90 whitespace-normal leading-normal">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <div key={idx} className="rounded-lg border border-hairline/60 bg-surface/30 p-3 my-2">
              {block.title && (
                <div className="font-mono text-xs font-medium text-paper mb-2">{block.title}</div>
              )}
              <ul className="space-y-1.5">
                {block.items.map((it, itIdx) => (
                  <li key={itIdx} className="flex items-start gap-2 text-xs text-muted">
                    <span className="text-mint font-bold mt-0.5">•</span>
                    <span className="text-paper/90 leading-relaxed font-sans">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function EntryCard({ item, isOpen, onToggle, language, isLearned, onToggleLearned }) {
  const hasBlocks = item.blocks && item.blocks.length > 0;

  return (
    <div
      id={item.id}
      className={
        "rounded-xl border transition-all duration-150 " +
        (isOpen && hasBlocks ? "md:col-span-2 " : "") +
        (isLearned
          ? (isOpen
              ? "border-mint/60 bg-[#0e211d]/90 shadow-[0_0_20px_rgba(95,217,184,0.08)]"
              : "border-mint/40 bg-[#0e201b]/60 hover:border-mint/60 hover:bg-[#0e201b]/80")
          : (isOpen
              ? "border-violet/40 bg-surface-raised"
              : "border-hairline bg-surface hover:border-hairline hover:bg-surface-hover"))
      }
    >
      <div className="flex w-full items-start justify-between gap-3 p-4">
        {/* Main interactive area: Title, Badges, Explanation */}
        <button
          onClick={onToggle}
          className="focus-ring flex-1 text-left min-w-0"
          aria-expanded={isOpen}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={"font-mono text-[15px] font-medium transition-colors " + (isLearned ? "text-mint font-semibold" : "text-paper")}>
              {item.title}
            </h3>
            {item.core && <SparkBadge />}
            {isLearned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-mint/40 bg-mint/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-mint">
                <svg className="h-2.5 w-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Learned
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-snug text-muted">{item.explain}</p>
        </button>

        {/* Action column: Learned checkbox + Expand arrow */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {/* Learned Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLearned(item.id);
            }}
            title={isLearned ? "Mark as unlearned" : "Mark as learned"}
            className={
              "focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-all select-none " +
              (isLearned
                ? "bg-mint/15 text-mint border border-mint/40 hover:bg-mint/25 font-semibold"
                : "bg-surface/90 text-muted border border-hairline hover:text-paper hover:border-hairline hover:bg-surface-hover")
            }
          >
            <span
              className={
                "flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors " +
                (isLearned ? "border-mint bg-mint text-ink" : "border-muted/50 bg-ink/60")
              }
            >
              {isLearned && (
                <svg className="h-2.5 w-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span>Learned</span>
          </button>

          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label="Expand lesson details"
            className="focus-ring p-1 rounded-md text-muted hover:text-paper hover:bg-white/5 transition-colors"
          >
            <svg
              className={"h-4 w-4 transition-transform duration-150 " + (isOpen ? "rotate-180 text-violet" : "")}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-hairline/40 pt-3">
          {hasBlocks ? (
            <LessonBlocks blocks={item.blocks} language={language} />
          ) : (
            <React.Fragment>
              {item.syntax && (
                <div className="mb-2.5 flex flex-wrap items-center gap-2 rounded-lg border border-hairline/80 bg-ink/70 px-3 py-2 font-mono text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-muted/70 font-semibold">Syntax:</span>
                  <code className="text-spark font-medium break-all">{item.syntax}</code>
                </div>
              )}
              {item.code && <CodeBlock code={item.code} output={item.output} language={language} />}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, query, openIds, toggle, registerRef, language, learnedMap, toggleLearned }) {
  const visibleItems = category.items.filter((it) => matches(it, category, query));
  if (query && visibleItems.length === 0) return null;

  const learnedCount = visibleItems.filter((it) => learnedMap[it.id]).length;

  return (
    <section
      id={"cat-" + category.id}
      ref={(el) => registerRef(category.id, el)}
      className="scroll-mt-24 mb-14"
    >
      <div className="mb-5 flex flex-wrap items-baseline gap-3 border-b border-hairline pb-3">
        <span className="font-mono text-sm text-spark">{category.number}</span>
        <h2 className="font-display text-xl font-semibold text-paper sm:text-2xl">{category.title}</h2>
        {category.group && (
          <span className="rounded-md border border-hairline/70 bg-surface/50 px-2 py-0.5 font-mono text-[11px] text-muted">
            {category.group}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2 font-mono text-xs text-muted">
          {learnedCount > 0 && (
            <span className="text-mint font-medium">
              ✓ {learnedCount}/{visibleItems.length} learned
            </span>
          )}
          <span className="hidden sm:inline text-muted/60">·</span>
          <span className="hidden sm:inline">{category.tagline}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleItems.map((item) => (
          <EntryCard
            key={item.id}
            item={item}
            isOpen={!!openIds[item.id]}
            onToggle={() => toggle(item.id)}
            language={language}
            isLearned={!!learnedMap[item.id]}
            onToggleLearned={toggleLearned}
          />
        ))}
      </div>
    </section>
  );
}

function SectionSwitcher({ sections, activeSection, onSelectSection }) {
  const cols = sections.length >= 4 ? "grid-cols-4" : (sections.length >= 3 ? "grid-cols-3" : "grid-cols-2");
  return (
    <div className={"grid gap-1 rounded-xl border border-hairline bg-ink p-1.5 " + cols}>
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={
              "focus-ring flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-mono font-medium transition-all " +
              (isActive
                ? "bg-surface-raised text-paper shadow-sm border border-hairline text-spark font-semibold"
                : "text-muted hover:text-paper hover:bg-surface/60")
            }
          >
            <span className={isActive ? "text-spark" : "text-muted/60"}>•</span>
            <span className="truncate">{sec.shortName || sec.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function Sidebar({
  sections,
  activeSection,
  onSelectSection,
  currentSectionMeta,
  categories,
  query,
  setQuery,
  activeCat,
  mobileOpen,
  closeMobile,
  learnedMap,
  activeGroup,
  setActiveGroup
}) {
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  // Group categories if available (e.g. React or Python modules)
  const groupedCategories = useMemo(() => {
    if (activeSection === "react") {
      const groups = [
        "Fundamentals",
        "UI & Interaction",
        "Effects & Routing",
        "State & Hooks",
        "Internals & Optimization",
        "Architecture & Production"
      ];
      return groups.map((grp) => ({
        groupName: grp,
        items: categories.filter((c) => c.group === grp)
      })).filter((g) => g.items.length > 0);
    }
    if (activeSection !== "python") {
      return [{ groupName: null, items: categories }];
    }
    const groups = ["Strings", "Lists", "Tuples"];
    return groups.map((grp) => ({
      groupName: grp,
      items: categories.filter((c) => c.group === grp)
    })).filter((g) => g.items.length > 0);
  }, [activeSection, categories]);

  const nav = (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="px-5 pt-6 pb-4">
        <a href="#top" className="font-display text-lg font-semibold tracking-tight text-paper">
          {currentSectionMeta.logo || "ref"}<span className="text-spark">.</span>cheatsheet
        </a>
        <p className="mt-1 font-mono text-[11px] text-muted">{totalItems} entries · persistent progress · read freely</p>
      </div>

      {/* Top Section / Library Switcher */}
      <div className="px-5 pb-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted/80">Section</div>
        <SectionSwitcher
          sections={sections}
          activeSection={activeSection}
          onSelectSection={(id) => {
            onSelectSection(id);
            closeMobile();
          }}
        />
      </div>

      {/* Search Input */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-hairline bg-ink px-3 py-2 focus-within:border-violet/50">
          <span className="font-mono text-sm text-violet">&gt;</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentSectionMeta.searchPlaceholder || "search syntax…"}
            className="w-full bg-transparent font-mono text-sm text-paper placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted hover:text-paper" aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categories Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {groupedCategories.map((grp, gIdx) => (
          <div key={grp.groupName || gIdx} className="mb-4">
            {grp.groupName && (
              <div className="flex items-center justify-between px-2 pt-2 pb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-spark/90 font-semibold">
                  {grp.groupName}
                </span>
                <span className="font-mono text-[10px] text-muted/60">
                  {grp.items.reduce((sum, c) => sum + c.items.length, 0)} items
                </span>
              </div>
            )}
            {!grp.groupName && (
              <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-wider text-muted/80">
                Categories
              </div>
            )}
            {grp.items.map((c) => {
              const catLearned = c.items.filter((it) => learnedMap[it.id]).length;
              const isAllLearned = catLearned > 0 && catLearned === c.items.length;
              return (
                <a
                  key={c.id}
                  href={"#cat-" + c.id}
                  onClick={closeMobile}
                  className={
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors " +
                    (activeCat === c.id ? "bg-surface-raised text-paper font-medium" : "text-muted hover:bg-surface hover:text-paper")
                  }
                >
                  <span className={"font-mono text-xs " + (activeCat === c.id ? "text-spark" : "text-muted group-hover:text-spark")}>
                    {c.number}
                  </span>
                  <span className="truncate flex-1">{c.title.replace(/^(Strings|Lists|Tuples):\s*/i, "")}</span>
                  <span className="font-mono text-[10px] flex items-center gap-1">
                    {catLearned > 0 ? (
                      <span className={isAllLearned ? "text-mint font-semibold" : "text-mint/80"}>
                        {catLearned}/{c.items.length}
                      </span>
                    ) : (
                      <span className="text-muted/60">{c.items.length}</span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <React.Fragment>
      {/* desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-72 lg:border-r lg:border-hairline lg:bg-ink-soft">
        {nav}
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobile}></div>
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] border-r border-hairline bg-ink shadow-2xl">
            {nav}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

function Hero({
  currentSectionMeta,
  totalCategories,
  totalItems,
  totalLearned,
  sections,
  activeSection,
  onSelectSection,
  activeGroup,
  setActiveGroup,
  categories,
  learnedMap
}) {
  const pct = totalItems > 0 ? Math.round((totalLearned / totalItems) * 100) : 0;

  return (
    <div id="top" className="mb-14 border-b border-hairline pb-10">
      {/* Top quick-switch banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface/50 p-2 sm:p-2.5">
        <div className="flex items-center gap-2 px-2 font-mono text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-mint"></span>
          <span>Active cheat sheet: <span className="font-semibold text-paper">{currentSectionMeta.name}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={
                "focus-ring rounded-lg px-3 py-1 font-mono text-xs font-medium transition-all " +
                (activeSection === sec.id
                  ? "bg-spark text-ink font-semibold shadow-sm"
                  : "bg-surface border border-hairline text-muted hover:text-paper hover:bg-surface-hover")
              }
            >
              {sec.name}
            </button>
          ))}
        </div>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet">
        {currentSectionMeta.heroPrefix || "reference · no account needed"}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
        {currentSectionMeta.heroTitle}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        {currentSectionMeta.heroSubtitle}
      </p>

      {/* Learning Progress Meter */}
      <div className="mt-6 rounded-xl border border-hairline bg-surface/40 p-3.5 max-w-xl">
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-2">
          <span className="flex items-center gap-2">
            <span className={"h-2 w-2 rounded-full " + (totalLearned > 0 ? "bg-mint animate-pulse" : "bg-muted")}></span>
            <span className="text-paper font-medium">Topic Mastery:</span>
          </span>
          <span className="font-semibold text-mint">
            {totalLearned} of {totalItems} learned ({pct}%)
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink">
          <div
            className="h-full bg-mint transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* React Sub-Module Filters */}
      {activeSection === "react" && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted/80 mr-1">Filter Module:</span>
          {[
            { id: "all", label: "All Chapters (31)" },
            { id: "Fundamentals", label: "Fundamentals" },
            { id: "UI & Interaction", label: "UI & Interaction" },
            { id: "Effects & Routing", label: "Effects & Routing" },
            { id: "State & Hooks", label: "State & Hooks" },
            { id: "Internals & Optimization", label: "Internals & Optimization" },
            { id: "Architecture & Production", label: "Production & Debugging" }
          ].map((grp) => {
            const isSel = activeGroup === grp.id;
            const count = grp.id === "all"
              ? categories.reduce((sum, c) => sum + c.items.length, 0)
              : categories.filter((c) => c.group === grp.id).reduce((sum, c) => sum + c.items.length, 0);
            const learned = grp.id === "all"
              ? categories.reduce((sum, c) => sum + c.items.filter((it) => learnedMap[it.id]).length, 0)
              : categories.filter((c) => c.group === grp.id).reduce((sum, c) => sum + c.items.filter((it) => learnedMap[it.id]).length, 0);

            return (
              <button
                key={grp.id}
                onClick={() => setActiveGroup(grp.id)}
                className={
                  "focus-ring flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs transition-all " +
                  (isSel
                    ? "bg-paper text-ink font-semibold shadow"
                    : "border border-hairline bg-surface/70 text-muted hover:border-hairline hover:bg-surface-hover hover:text-paper")
                }
              >
                <span>{grp.label}</span>
                <span className={"rounded px-1.5 py-0.2 text-[10px] " + (isSel ? "bg-ink/15 text-ink font-bold" : "bg-ink text-muted")}>
                  {learned > 0 ? `${learned}/${count}` : count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Python Sub-Module Filters (Strings, Lists, Tuples) */}
      {activeSection === "python" && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted/80 mr-1">Filter Module:</span>
          {[
            { id: "all", label: "All Python" },
            { id: "Strings", label: "Strings" },
            { id: "Lists", label: "Lists" },
            { id: "Tuples", label: "Tuples" }
          ].map((grp) => {
            const isSel = activeGroup === grp.id;
            const count = grp.id === "all"
              ? categories.reduce((sum, c) => sum + c.items.length, 0)
              : categories.filter((c) => c.group === grp.id).reduce((sum, c) => sum + c.items.length, 0);
            const learned = grp.id === "all"
              ? categories.reduce((sum, c) => sum + c.items.filter((it) => learnedMap[it.id]).length, 0)
              : categories.filter((c) => c.group === grp.id).reduce((sum, c) => sum + c.items.filter((it) => learnedMap[it.id]).length, 0);

            return (
              <button
                key={grp.id}
                onClick={() => setActiveGroup(grp.id)}
                className={
                  "focus-ring flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs transition-all " +
                  (isSel
                    ? "bg-paper text-ink font-semibold shadow"
                    : "border border-hairline bg-surface/70 text-muted hover:border-hairline hover:bg-surface-hover hover:text-paper")
                }
              >
                <span>{grp.label}</span>
                <span className={"rounded px-1.5 py-0.2 text-[10px] " + (isSel ? "bg-ink/15 text-ink font-bold" : "bg-ink text-muted")}>
                  {learned > 0 ? `${learned}/${count}` : count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-muted">
        <span className="rounded-full border border-hairline px-3 py-1">click a card to view syntax & example</span>
        <span className="rounded-full border border-hairline px-3 py-1">toggle [Learned] to track mastery</span>
        <span className="rounded-full border border-hairline px-3 py-1">persists on refresh</span>
        {currentSectionMeta.badgeNote && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-spark/30 bg-spark/10 px-3 py-1 text-spark">
            {currentSectionMeta.badgeNote}
          </span>
        )}
      </div>
    </div>
  );
}

function App() {
  const sections = useSections();

  // Determine initial active section from hash or URL param
  const getInitialSection = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes("javascript") || window.location.search.includes("javascript")) return "javascript";
    if (hash.includes("numpy") || window.location.search.includes("numpy")) return "numpy";
    if (hash.includes("python") || window.location.search.includes("python")) return "python";
    if (hash.includes("react") || window.location.search.includes("react")) return "react";
    return "react"; // Default to React so new React course appears first
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const { loading, error, categories } = useTopics(activeSection);
  const { learnedMap, toggleLearned } = useLearnedItems();

  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState({});
  const [activeCat, setActiveCat] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState("all");
  const sectionRefs = useRef({});

  const currentSectionMeta = useMemo(() => {
    return sections.find((s) => s.id === activeSection) || sections[0] || DEFAULT_SECTIONS[0];
  }, [sections, activeSection]);

  const handleSelectSection = useCallback((sectionId) => {
    if (sectionId === activeSection) return;
    setActiveSection(sectionId);
    setQuery("");
    setOpenIds({});
    setActiveGroup("all");
    sectionRefs.current = {};
    window.location.hash = sectionId;
  }, [activeSection]);

  // Sync hash changes (e.g. browser back / forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith("#numpy")) {
        setActiveSection("numpy");
      } else if (hash.startsWith("#javascript")) {
        setActiveSection("javascript");
      } else if (hash.startsWith("#python")) {
        setActiveSection("python");
      } else if (hash.startsWith("#react")) {
        setActiveSection("react");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const toggle = useCallback((id) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const registerRef = useCallback((id, el) => {
    if (el) sectionRefs.current[id] = el;
  }, []);

  // Filter categories by activeGroup (for React and Python)
  const displayedCategories = useMemo(() => {
    if ((activeSection !== "python" && activeSection !== "react") || activeGroup === "all") {
      return categories;
    }
    return categories.filter((c) => c.group === activeGroup);
  }, [categories, activeSection, activeGroup]);

  // scrollspy
  useEffect(() => {
    if (!displayedCategories.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("cat-", "");
            setActiveCat(id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [displayedCategories]);

  const totalMatches = useMemo(() => {
    if (!query) return null;
    return displayedCategories.reduce(
      (sum, c) => sum + c.items.filter((it) => matches(it, c, query)).length,
      0
    );
  }, [displayedCategories, query]);

  const totalItems = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.items.length, 0);
  }, [categories]);

  const totalLearned = useMemo(() => {
    return categories.reduce(
      (sum, c) => sum + c.items.filter((it) => learnedMap[it.id]).length,
      0
    );
  }, [categories, learnedMap]);

  return (
    <div className="min-h-screen bg-ink">
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        currentSectionMeta={currentSectionMeta}
        categories={categories}
        query={query}
        setQuery={setQuery}
        activeCat={activeCat}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
        learnedMap={learnedMap}
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
      />

      {/* mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <a href="#top" className="font-display text-base font-semibold text-paper">
          {currentSectionMeta.logo || "ref"}<span className="text-spark">.</span>cheatsheet
        </a>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-hairline bg-surface p-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSection(s.id)}
                className={
                  "px-2 py-0.5 text-xs font-mono rounded " +
                  (activeSection === s.id ? "bg-spark text-ink font-semibold" : "text-muted hover:text-paper")
                }
              >
                {s.shortName || s.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="focus-ring rounded-md border border-hairline px-3 py-1.5 font-mono text-xs text-muted"
          >
            menu
          </button>
        </div>
      </div>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Hero
            currentSectionMeta={currentSectionMeta}
            totalCategories={categories.length}
            totalItems={totalItems}
            totalLearned={totalLearned}
            sections={sections}
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            categories={categories}
            learnedMap={learnedMap}
          />

          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="font-mono text-sm text-muted animate-pulse">
                loading {currentSectionMeta.name} cheatsheet…
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
              <div>
                <p className="font-mono text-sm text-[#ff6b6b]">Couldn't load cheatsheet: {error}</p>
                <p className="mt-2 text-sm text-muted">Make sure the Express server is running.</p>
              </div>
            </div>
          )}

          {!loading && !error && query && (
            <p className="mb-6 font-mono text-xs text-muted">
              {totalMatches} result{totalMatches === 1 ? "" : "s"} for <span className="text-paper">"{query}"</span> in {currentSectionMeta.name}
            </p>
          )}

          {!loading && !error && (
            displayedCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                query={query}
                openIds={openIds}
                toggle={toggle}
                registerRef={registerRef}
                language={currentSectionMeta.language}
                learnedMap={learnedMap}
                toggleLearned={toggleLearned}
              />
            ))
          )}

          <footer className="mt-16 border-t border-hairline pt-6 pb-2 text-center font-mono text-xs text-muted">
            built for reading and tracking mastery · no account needed.
          </footer>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
