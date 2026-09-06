const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ---------- Fallback Section Metadata ----------
const DEFAULT_SECTIONS = [
  {
    id: "javascript",
    name: "JavaScript",
    slug: "javascript",
    shortName: "JavaScript",
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

function matches(item, category, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.explain.toLowerCase().includes(q) ||
    (item.code && item.code.toLowerCase().includes(q)) ||
    (item.output && item.output.toLowerCase().includes(q)) ||
    category.title.toLowerCase().includes(q)
  );
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

function EntryCard({ item, isOpen, onToggle, language }) {
  return (
    <div
      id={item.id}
      className={
        "rounded-xl border transition-colors " +
        (isOpen ? "border-violet/40 bg-surface-raised" : "border-hairline bg-surface hover:border-hairline hover:bg-surface-hover")
      }
    >
      <button
        onClick={onToggle}
        className="focus-ring flex w-full items-start justify-between gap-4 rounded-xl px-4 py-3.5 text-left"
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-[15px] font-medium text-paper">{item.title}</h3>
            {item.core && <SparkBadge />}
          </div>
          <p className="mt-1 text-sm leading-snug text-muted">{item.explain}</p>
        </div>
        <svg
          className={"mt-1 h-4 w-4 flex-shrink-0 text-muted transition-transform duration-150 " + (isOpen ? "rotate-180 text-violet" : "")}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <CodeBlock code={item.code} output={item.output} language={language} />
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, query, openIds, toggle, registerRef, language }) {
  const visibleItems = category.items.filter((it) => matches(it, category, query));
  if (query && visibleItems.length === 0) return null;

  return (
    <section
      id={"cat-" + category.id}
      ref={(el) => registerRef(category.id, el)}
      className="scroll-mt-24 mb-14"
    >
      <div className="mb-5 flex items-baseline gap-3 border-b border-hairline pb-3">
        <span className="font-mono text-sm text-spark">{category.number}</span>
        <h2 className="font-display text-xl font-semibold text-paper sm:text-2xl">{category.title}</h2>
        <span className="ml-auto hidden font-mono text-xs text-muted sm:inline">{category.tagline}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleItems.map((item) => (
          <EntryCard
            key={item.id}
            item={item}
            isOpen={!!openIds[item.id]}
            onToggle={() => toggle(item.id)}
            language={language}
          />
        ))}
      </div>
    </section>
  );
}

function SectionSwitcher({ sections, activeSection, onSelectSection }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-hairline bg-ink p-1.5">
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={
              "focus-ring flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-mono font-medium transition-all " +
              (isActive
                ? "bg-surface-raised text-paper shadow-sm border border-hairline text-spark font-semibold"
                : "text-muted hover:text-paper hover:bg-surface/60")
            }
          >
            <span className={isActive ? "text-spark" : "text-muted/60"}>•</span>
            <span>{sec.shortName || sec.name}</span>
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
  closeMobile
}) {
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  const nav = (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="px-5 pt-6 pb-4">
        <a href="#top" className="font-display text-lg font-semibold tracking-tight text-paper">
          {currentSectionMeta.logo || "ref"}<span className="text-spark">.</span>cheatsheet
        </a>
        <p className="mt-1 font-mono text-[11px] text-muted">{totalItems} entries · no login · read freely</p>
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
        <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-wider text-muted/80">Categories</div>
        {categories.map((c) => (
          <a
            key={c.id}
            href={"#cat-" + c.id}
            onClick={closeMobile}
            className={
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors " +
              (activeCat === c.id ? "bg-surface-raised text-paper" : "text-muted hover:bg-surface hover:text-paper")
            }
          >
            <span className={"font-mono text-xs " + (activeCat === c.id ? "text-spark" : "text-muted group-hover:text-spark")}>
              {c.number}
            </span>
            <span className="truncate">{c.title}</span>
            <span className="ml-auto font-mono text-[10px] text-muted">{c.items.length}</span>
          </a>
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

function Hero({ currentSectionMeta, totalCategories, totalItems, sections, activeSection, onSelectSection }) {
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
      <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-muted">
        <span className="rounded-full border border-hairline px-3 py-1">click a card to reveal its example</span>
        <span className="rounded-full border border-hairline px-3 py-1">search anything from the sidebar</span>
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
    if (hash.includes("numpy") || window.location.search.includes("numpy")) return "numpy";
    return "javascript";
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const { loading, error, categories } = useTopics(activeSection);
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState({});
  const [activeCat, setActiveCat] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionRefs = useRef({});

  const currentSectionMeta = useMemo(() => {
    return sections.find((s) => s.id === activeSection) || sections[0] || DEFAULT_SECTIONS[0];
  }, [sections, activeSection]);

  const handleSelectSection = useCallback((sectionId) => {
    if (sectionId === activeSection) return;
    setActiveSection(sectionId);
    setQuery("");
    setOpenIds({});
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

  // scrollspy
  useEffect(() => {
    if (!categories.length) return;
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
  }, [categories]);

  const totalMatches = useMemo(() => {
    if (!query) return null;
    return categories.reduce(
      (sum, c) => sum + c.items.filter((it) => matches(it, c, query)).length,
      0
    );
  }, [categories, query]);

  const totalItems = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.items.length, 0);
  }, [categories]);

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
            sections={sections}
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
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
            categories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                query={query}
                openIds={openIds}
                toggle={toggle}
                registerRef={registerRef}
                language={currentSectionMeta.language}
              />
            ))
          )}

          <footer className="mt-16 border-t border-hairline pt-6 pb-2 text-center font-mono text-xs text-muted">
            built for reading, not logging in.
          </footer>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
