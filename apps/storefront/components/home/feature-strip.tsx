export function FeatureStrip() {
  const features = [
    {
      id: "premium-selection",
      title: "ПРЕМИАЛЬНЫЙ ОТБОР",
      description: "Только лучшие вещи от мировых брендов",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      ),
    },
    {
      id: "quality-first",
      title: "КАЧЕСТВО ПРЕЖДЕ ВСЕГО",
      description: "Каждая вещь проходит тщательную проверку",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h.77a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
        </svg>
      ),
    },
    {
      id: "conscious-consumption",
      title: "ОСОЗНАННОЕ ПОТРЕБЛЕНИЕ",
      description: "Продлеваем жизнь вещам, уменьшаем след",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
    },
    {
      id: "secure-purchase",
      title: "БЕЗОПАСНАЯ ПОКУПКА",
      description: "Удобная оплата и быстрая доставка по всей России",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="feature-strip" aria-label="Преимущества магазина">
      <div className="container">
        <ul className="feature-list">
          {features.map((feature, index) => (
            <li key={feature.id} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-body">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
              {index < features.length - 1 && (
                <div className="feature-divider" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
