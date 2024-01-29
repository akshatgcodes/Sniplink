// Deterministic pseudo-QR pattern purely for visual flavor in the dashboard
// mockup below — not a real, scannable QR code.
const GRID = 11;

const FINDER_CELLS = new Set<string>();
function markFinder(originRow: number, originCol: number) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      FINDER_CELLS.add(`${originRow + r}-${originCol + c}`);
    }
  }
}
markFinder(0, 0);
markFinder(0, GRID - 3);
markFinder(GRID - 3, 0);

// Fixed bit pattern (hand-picked, not random) so server/client output match.
const PATTERN = [
  0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1,
  0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1,
  0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
  1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1,
];

export function QrMock({ className = "" }: { className?: string }) {
  const cells = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const key = `${row}-${col}`;
      const isFinder = FINDER_CELLS.has(key);
      const finderRing =
        isFinder &&
        (row % 3 === 1 || col % 3 === 1) &&
        !(row % 3 === 1 && col % 3 === 1);
      const on = isFinder
        ? !finderRing
        : PATTERN[(row * GRID + col) % PATTERN.length] === 1;
      cells.push(
        <div
          key={key}
          className={on ? "bg-[#16181c]" : "bg-transparent"}
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
        />
      );
    }
  }

  return (
    <div
      className={`grid aspect-square w-full gap-[1px] rounded-md bg-white p-2 ${className}`}
      style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
    >
      {cells}
    </div>
  );
}
