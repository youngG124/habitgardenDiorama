import { useEffect, useState } from "react";

export default function App() {
  // --- 기본 상수 ---
  const TILE_W = 64;      // 타일 윗면 너비(px)
  const TILE_H = 32;      // 타일 윗면 높이(px)
  const WALL_H = 12;      // 옆면(두께) 픽셀
  const COLS = 5;
  const ROWS = 5;
  const STEP = 1 / 9;     // 한 번에 1/9칸 이동

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // 그리드 -> 화면 좌표 (실수 좌표 허용)
  function toScreen(x: number, y: number) {
    const mapPxW = ((COLS + ROWS) * TILE_W) / 2;
    const originX = mapPxW / 2;
    const originY = 40; // 상단 여백
    const left = originX + (x - y) * (TILE_W / 2);
    const top  = originY + (x + y) * (TILE_H / 2);
    return { left, top };
  }

  // 셀 목록 생성 (0,0) ~ (4,4)
  const cells: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) cells.push({ x, y });

  // 컨테이너 크기(옆면 포함)
  const mapPxW = ((COLS + ROWS) * TILE_W) / 2;
  const mapPxH = ((COLS + ROWS) * TILE_H) / 2 + WALL_H;

  // --- 마커 상태 (중앙에서 시작, 실수 좌표 허용) ---
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: COLS / 2,
    y: ROWS / 2,
  });

  // --- 컨트롤 모드: true=화면직교, false=격자축 ---
  const [screenOrtho, setScreenOrtho] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") {
        setScreenOrtho((v) => !v);
        return;
      }

      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        setPos((p) => {
          let { x, y } = p;

          if (screenOrtho) {
            // 화면축 모드
            if (e.key === "ArrowUp")    { x -= STEP; y -= STEP; }
            if (e.key === "ArrowDown")  { x += STEP; y += STEP; }
            if (e.key === "ArrowLeft")  { x -= STEP; y += STEP; }
            if (e.key === "ArrowRight") { x += STEP; y -= STEP; }
          } else {
            // 격자축 모드
            if (e.key === "ArrowUp")    y -= STEP;
            if (e.key === "ArrowDown")  y += STEP;
            if (e.key === "ArrowLeft")  x -= STEP;
            if (e.key === "ArrowRight") x += STEP;
          }

          x = clamp(x, 0, COLS - 1);
          y = clamp(y, 0, ROWS - 1);
          return { x, y };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screenOrtho]);

  const pin = toScreen(pos.x, pos.y);

  // 현재 가장 가까운 타일 index
  const selX = Math.round(pos.x);
  const selY = Math.round(pos.y);

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
      <div
        style={{
          width: mapPxW,
          height: mapPxH,
          position: "relative",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
        }}
      >
        {cells.map(({ x, y }) => {
          const { left, top } = toScreen(x, y);
          const selected = selX === x && selY === y;
          return (
            <div key={`${x}-${y}`} style={{ position: "absolute", left, top, width: TILE_W, height: TILE_H + WALL_H }}>
              <svg width={TILE_W} height={TILE_H + WALL_H} style={{ overflow: "visible" }}>
                {/* 왼쪽 옆면 */}
                <polygon
                  points={`0,16 32,32 32,${32 + WALL_H} 0,${16 + WALL_H}`}
                  fill={selected ? "#5fa15f" : "#61a761"}
                  opacity={0.95}
                />
                {/* 오른쪽 옆면 */}
                <polygon
                  points={`64,16 32,32 32,${32 + WALL_H} 64,${16 + WALL_H}`}
                  fill={selected ? "#66b366" : "#6abb69"}
                  opacity={0.95}
                />
                {/* 윗면 */}
                <polygon
                  points="32,0 64,16 32,32 0,16"
                  fill={selected ? "#76cb6e" : "#7ccf74"}
                  stroke="#00000022"
                />
              </svg>
            </div>
          );
        })}

        {/* 핀 */}
        <div
          style={{
            position: "absolute",
            left: pin.left,
            top: pin.top - 18,
            width: TILE_W,
            height: TILE_H,
            pointerEvents: "none",
            transition: "left 60ms linear, top 60ms linear",
          }}
        >
          <svg width={TILE_W} height={TILE_H} style={{ overflow: "visible" }}>
            <circle cx="32" cy="10" r="6" fill="#222" />
            <polygon points="27,10 37,10 32,26" fill="#444" />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>
        ← ↑ ↓ → 이동 (한 번에 <strong>1/9칸</strong>) / <strong>M</strong> 모드 전환 (
        {screenOrtho ? "화면축" : "격자축"})
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
          pos=({pos.x.toFixed(2)}, {pos.y.toFixed(2)}) · tile=({selX}, {selY})
        </div>
      </div>
    </div>
  );
}
