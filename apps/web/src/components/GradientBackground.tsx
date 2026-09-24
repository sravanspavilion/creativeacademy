/**
 * Full-screen Instagram-inspired layered gradient background.
 * Deep dark base + slow-drifting, heavily blurred radial color orbs
 * (purple → magenta → pink → orange → amber → blue) + readability veil
 * so the central clock always stays high-contrast.
 */
export function GradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#06040f]" />

      <div
        className="orb left-[-8%] top-[-12%] h-[55vmax] w-[55vmax] bg-[radial-gradient(circle_at_center,rgba(131,58,180,0.5),transparent_65%)]"
      />
      <div
        className="orb right-[-10%] top-[6%] h-[50vmax] w-[50vmax] bg-[radial-gradient(circle_at_center,rgba(225,48,108,0.42),transparent_65%)]"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="orb bottom-[-14%] left-[6%] h-[48vmax] w-[48vmax] bg-[radial-gradient(circle_at_center,rgba(64,93,230,0.4),transparent_65%)]"
        style={{ animationDelay: "-16s" }}
      />
      <div
        className="orb bottom-[10%] right-[12%] h-[40vmax] w-[40vmax] bg-[radial-gradient(circle_at_center,rgba(252,175,69,0.26),transparent_65%)]"
        style={{ animationDelay: "-22s" }}
      />
      <div
        className="orb left-[30%] top-[42%] h-[36vmax] w-[36vmax] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent_65%)]"
        style={{ animationDelay: "-12s" }}
      />
      <div
        className="orb left-[55%] top-[16%] h-[30vmax] w-[30vmax] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_65%)]"
        style={{ animationDelay: "-5s" }}
      />

      {/* Readability veil: keeps the center bright, edges deep. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,3,12,0.78)_100%)]" />
    </div>
  );
}