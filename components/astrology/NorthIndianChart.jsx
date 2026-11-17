"use client";

export default function NorthIndianChart({
  chart,
  className = "",
  language = "en",
  onHouseClick = null,
  onPlanetClick = null,
}) {
  if (!chart || !chart.houses) {
    return (
      <div className="w-full aspect-square max-w-[440px] mx-auto border-2 border-dashed border-amber-300 rounded-2xl flex items-center justify-center text-stone-600 font-medium text-sm bg-amber-50/30">
        Chart data unavailable
      </div>
    );
  }

  const { houses = [], ascendant = {}, planets = [] } = chart;
  const isHi = language === "hi" || language === "hindi";

  const HINDI_GRAHA_ABBR = {
    Sun: "सू",
    Moon: "चं",
    Mars: "मं",
    Mercury: "बु",
    Jupiter: "गु",
    Venus: "शु",
    Saturn: "श",
    Rahu: "रा",
    Ketu: "के",
  };

  // Sign number for each house: (ascendant.signIndex + houseNumber - 1) % 12 + 1
  const ascSignNumber = ascendant.sign?.number || 1;

  // Map planets to their houses (1 to 12)
  const housePlanets = {};
  for (let h = 1; h <= 12; h++) {
    housePlanets[h] = [];
  }

  for (const p of planets) {
    const h = p.house || 1;
    if (housePlanets[h]) {
      const shortName = isHi && HINDI_GRAHA_ABBR[p.planet]
        ? HINDI_GRAHA_ABBR[p.planet]
        : p.planet
            .slice(0, 2)
            .charAt(0)
            .toUpperCase() + p.planet.slice(1, 2).toLowerCase();
      const retroSuffix = p.retrograde ? (isHi ? "(व)" : "(R)") : "";
      housePlanets[h].push({
        name: shortName + retroSuffix,
        fullName: p.planet,
        degree: typeof p.degree === "number" ? Math.floor(p.degree) : "",
      });
    }
  }

  // 12 House Centers and Sign Label Positions on 400x400 canvas
  const houseLayout = {
    1: { cx: 200, cy: 95, signX: 200, signY: 135 },
    2: { cx: 100, cy: 50, signX: 140, signY: 75 },
    3: { cx: 45, cy: 100, signX: 75, signY: 140 },
    4: { cx: 100, cy: 200, signX: 140, signY: 200 },
    5: { cx: 45, cy: 300, signX: 75, signY: 265 },
    6: { cx: 100, cy: 350, signX: 140, signY: 330 },
    7: { cx: 200, cy: 305, signX: 200, signY: 265 },
    8: { cx: 300, cy: 350, signX: 260, signY: 330 },
    9: { cx: 355, cy: 300, signX: 325, signY: 265 },
    10: { cx: 300, cy: 200, signX: 260, signY: 200 },
    11: { cx: 355, cy: 100, signX: 325, signY: 140 },
    12: { cx: 300, cy: 50, signX: 260, signY: 75 },
  };

  return (
    <div className={`w-full aspect-square max-w-[440px] mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label="Vedic North Indian Kundli Chart"
        className="w-full h-full bg-[#fdfbf7] rounded-2xl shadow-md border border-[#c99a53]"
      >
        <title>Vedic North Indian Kundli Birth Chart</title>
        {/* Background Subtle Gradient */}
        <defs>
          <radialGradient id="kundliGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbf2" />
            <stop offset="100%" stopColor="#f5e8d0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#kundliGlow)" rx="16" />

        {/* Outer border */}
        <rect
          x="6"
          y="6"
          width="388"
          height="388"
          fill="none"
          stroke="#9a5a1f"
          strokeWidth="2.5"
          rx="12"
        />
        <rect
          x="12"
          y="12"
          width="376"
          height="376"
          fill="none"
          stroke="#c4903c"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          rx="8"
        />

        {/* Diagonal Cross Lines */}
        <line x1="12" y1="12" x2="388" y2="388" stroke="#9a5a1f" strokeWidth="2" />
        <line x1="388" y1="12" x2="12" y2="388" stroke="#9a5a1f" strokeWidth="2" />

        {/* Central Diamond Lines */}
        <polygon
          points="200,12 388,200 200,388 12,200"
          fill="none"
          stroke="#9a5a1f"
          strokeWidth="2"
        />

        {/* Render each house's Sign Number and Planets */}
        {Object.entries(houseLayout).map(([houseStr, pos]) => {
          const houseNum = parseInt(houseStr, 10);
          // Sign in this house = ((ascSignNumber - 1 + houseNum - 1) % 12) + 1
          const signNum = ((ascSignNumber - 1 + (houseNum - 1)) % 12) + 1;
          const planetsInHouse = housePlanets[houseNum] || [];

          return (
            <g
              key={houseNum}
              onClick={() => onHouseClick && onHouseClick(houseNum)}
              className={onHouseClick ? "cursor-pointer transition hover:opacity-80" : ""}
              title={onHouseClick ? `Click to view classical lessons for House ${houseNum}` : ""}
            >
              {/* Sign number indicator (Traditional Red/Amber) */}
              <text
                x={pos.signX}
                y={pos.signY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#8c320d"
                fontSize="13"
                fontWeight="800"
                fontFamily="serif"
                opacity="0.95"
              >
                {signNum}
              </text>

              {/* Planets inside this house */}
              <g transform={`translate(${pos.cx}, ${pos.cy})`}>
                {planetsInHouse.map((p, idx) => {
                  const offsetY = (idx - (planetsInHouse.length - 1) / 2) * 14.5;
                  const isSunOrMoon = p.fullName === "SUN" || p.fullName === "MOON";
                  const isRetro = p.name.includes("(R)") || p.name.includes("(व)");

                  return (
                    <text
                      key={idx}
                      x="0"
                      y={offsetY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isRetro ? "#991b1b" : isSunOrMoon ? "#853606" : "#0f172a"}
                      fontSize={planetsInHouse.length > 3 ? "11" : "12.5"}
                      fontWeight="700"
                      fontFamily="system-ui, sans-serif"
                      onClick={(e) => {
                        if (onPlanetClick) {
                          e.stopPropagation();
                          onPlanetClick(p.fullName);
                        }
                      }}
                      className={onPlanetClick ? "cursor-pointer transition-opacity hover:opacity-75" : ""}
                    >
                      {p.name}
                      {p.degree !== "" && (
                        <tspan fontSize="9.5" fill="#334155" fontWeight="600" dx="2.5">
                          {p.degree}°
                        </tspan>
                      )}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}

        {/* Central Emblem / Shloka Marker */}
        <circle cx="200" cy="200" r="14" fill="#fff5e6" stroke="#9a5a1f" strokeWidth="1.8" />
        <text
          x="200"
          y="201"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#853606"
          fontSize="12"
          fontWeight="bold"
          fontFamily="serif"
        >
          ॐ
        </text>
      </svg>
    </div>
  );
}
