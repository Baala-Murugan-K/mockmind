const MockMindLogo = ({ size = 32, showText = true }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c6fff"/>
          <stop offset="100%" stopColor="#c084fc"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc"/>
          <stop offset="100%" stopColor="#7c6fff"/>
        </linearGradient>
      </defs>
      {/* Outer hexagon */}
      <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" fill="url(#lg1)" opacity="0.15"/>
      <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" stroke="url(#lg1)" strokeWidth="1.5" fill="none"/>
      {/* Brain circuit paths */}
      <circle cx="20" cy="20" r="5" fill="url(#lg2)"/>
      <circle cx="20" cy="20" r="2.5" fill="white" opacity="0.9"/>
      {/* Circuit lines */}
      <line x1="20" y1="15" x2="20" y2="8" stroke="url(#lg1)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="25" x2="20" y2="32" stroke="url(#lg1)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="20" x2="8" y2="20" stroke="url(#lg1)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="25" y1="20" x2="32" y2="20" stroke="url(#lg1)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16.5" y1="16.5" x2="11" y2="11" stroke="url(#lg1)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="23.5" y1="23.5" x2="29" y2="29" stroke="url(#lg1)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="23.5" y1="16.5" x2="29" y2="11" stroke="url(#lg1)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="16.5" y1="23.5" x2="11" y2="29" stroke="url(#lg1)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Dots at line ends */}
      {[[20,8],[20,32],[8,20],[32,20],[11,11],[29,29],[29,11],[11,29]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="url(#lg1)" opacity="0.8"/>
      ))}
    </svg>
    {showText && (
      <span style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.6,
        background: 'linear-gradient(135deg, var(--text), var(--primary))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.3px'
      }}>
        MockMind
      </span>
    )}
  </div>
);

export default MockMindLogo;
