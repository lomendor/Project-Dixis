import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Dixis - Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #ffffff 60%, #f0fdf4 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(26, 122, 62, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(26, 122, 62, 0.06)',
          }}
        />

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Leaf icon */}
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75"
              stroke="#1a7a3e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#1a7a3e',
              letterSpacing: '-2px',
            }}
          >
            Dixis
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: '#374151',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          Φρέσκα τοπικά προϊόντα
          <br />
          απευθείας από Έλληνες παραγωγούς
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            padding: '20px 48px',
            background: 'rgba(26, 122, 62, 0.08)',
            borderRadius: 16,
          }}
        >
          {[
            { value: '100%', label: 'Ελληνικά' },
            { value: '0', label: 'Μεσάζοντες' },
            { value: '>80%', label: 'Στον Παραγωγό' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#1a7a3e',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: '#6b7280',
                  marginTop: 4,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 20,
            color: '#9ca3af',
            letterSpacing: '1px',
          }}
        >
          dixis.gr
        </div>
      </div>
    ),
    { ...size }
  )
}
