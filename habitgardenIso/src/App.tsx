import { useEffect, useState } from "react";

export default function App() {
  // --- 기본 상수 ---
  const TILE_W = 64;  // 다이아 윗면 너비(px)
  const TILE_H = 32;  // 다이아 윗면 높이(px)
  const COLS = 3;
  const ROWS = 3;

  // 그리드 → 화면 좌표
  function toScreen(x: number, y: number) {
    const mapPxW = ((COLS + ROWS) * TILE_W) / 2;
    const originX = mapPxW / 2;
    const originY = 40;
    const left = originX + (x - y) * (TILE_W / 2);
    const top = originY + (x + y) * (TILE_H / 2);
    return { left, top };
  }

  // 셀 목록 (0,0) ~ (2,2)
  const cells = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) cells.push({ x, y });

  // 컨테이너 크기
  const mapPxW = ((COLS + ROWS) * TILE_W) / 2;
  const mapPxH = ((COLS + ROWS) * TILE_H) / 2;

  // --- 마커 위치 상태 (한가운데에서 시작: 1,1) ---
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 1, y: 1 });

  // --- 키보드 이동 ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault(); // 페이지 스크롤 방지
        setPos((p) => {
          let { x, y } = p;
          if (e.key === "ArrowLeft") x = Math.max(0, x - 1);
          if (e.key === "ArrowRight") x = Math.min(COLS - 1, x + 1);
          if (e.key === "ArrowUp") y = Math.max(0, y - 1);
          if (e.key === "ArrowDown") y = Math.min(ROWS - 1, y + 1);
          return { x, y };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 마커 화면 좌표
  const pinScreen = toScreen(pos.x, pos.y);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#eef2f7",
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica, Arial, sans-serif",
      }}
    >
      {/* 맵 컨테이너 */}
      <div
        style={{
          width: mapPxW,
          height: mapPxH,
          position: "relative",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
        }}
      >
        {/* 3×3 타일 */}
        {cells.map(({ x, y }) => {
          const { left, top } = toScreen(x, y);
          return (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left,
                top,
                width: TILE_W,
                height: TILE_H,
                pointerEvents: "none",
              }}
            >
              <svg width={TILE_W} height={TILE_H} style={{ overflow: "visible" }}>
                <polygon
                  points="32,0 64,16 32,32 0,16"
                  fill="#7ccf74"
                  stroke="#00000022"
                  // 마커가 있는 칸은 살짝 강조
                  opacity={pos.x === x && pos.y === y ? 1 : 0.95}
                />
              </svg>
            </div>
          );
        })}

        {/* 핀(마커) */}
        <div
          style={{
            position: "absolute",
            left: pinScreen.left,
            top: pinScreen.top - 18, // 타일 중앙 위쪽으로 살짝 올림
            width: TILE_W,
            height: TILE_H,
            pointerEvents: "none",
          }}
        >
          <svg width={TILE_W} height={TILE_H} style={{ overflow: "visible" }}>
            <circle cx="32" cy="10" r="6" fill="#222" />
            <polygon points="27,10 37,10 32,26" fill="#444" />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 14 }}>
        ← ↑ ↓ → 방향키로 마커 이동
      </div>
    </div>
  );
}
