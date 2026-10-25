const STOPS = [
  {
    id: 'buenos-aires',
    x: 185,
    y: 865,
    label: 'Buenos Aires',
    labelX: 232,
    labelY: 842,
    labelWidth: 170,
    destination: false,
  },
  {
    id: 'rosario',
    x: 405,
    y: 365,
    label: 'Rosario',
    labelX: 302,
    labelY: 300,
    labelWidth: 132,
    destination: false,
  },
  {
    id: 'cordoba',
    x: 1440,
    y: 865,
    label: 'Córdoba',
    labelX: 1485,
    labelY: 890,
    labelWidth: 142,
    destination: false,
  },
  {
    id: 'mendoza',
    x: 1740,
    y: 215,
    label: 'Mendoza',
    labelX: 1540,
    labelY: 170,
    labelWidth: 150,
    destination: true,
  },
];

const ROAD_PATH =
  'M 185 865 C 230 720 265 500 405 365 C 560 215 830 205 1030 205 C 1210 205 1410 225 1740 215 C 1815 390 1780 620 1640 760 C 1540 860 1470 890 1440 865 C 1310 735 1190 720 1040 750';

export function RouteBackdrop({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <path
          d={ROAD_PATH}
          fill="none"
          strokeWidth="26"
          strokeLinecap="round"
          className="stroke-road"
        />
        <path
          d={ROAD_PATH}
          fill="none"
          strokeWidth="3"
          strokeDasharray="12 18"
          strokeLinecap="round"
          className="stroke-canvas"
        />

        {STOPS.map((stop) => (
          <g key={stop.id}>
            <circle
              cx={stop.x}
              cy={stop.y}
              r="34"
              className={stop.destination ? 'fill-road' : 'fill-brand/15'}
            />
            <circle
              cx={stop.x}
              cy={stop.y}
              r="13"
              className={stop.destination ? 'fill-ink' : 'fill-brand'}
            />
            <g
              transform={`translate(${stop.labelX} ${stop.labelY})`}
            >
              <rect
                width={stop.labelWidth}
                height="46"
                rx="23"
                className={stop.destination ? 'fill-ink' : 'fill-canvas'}
              />
              <text
                x={stop.labelWidth / 2}
                y="30"
                textAnchor="middle"
                className={`text-[19px] font-semibold ${
                  stop.destination ? 'fill-canvas' : 'fill-ink'
                }`}
              >
                {stop.label}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
