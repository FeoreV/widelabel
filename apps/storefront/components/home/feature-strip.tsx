import { Typography } from "../ui/typography";

export function FeatureStrip() {
  const features = [
    {
      id: "1-of-1-hold",
      title: "15 МИНУТ БРОНИРОВАНИЯ",
      description: "1-of-1 вещь блокируется для вашей покупки",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-lime)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "verified-condition",
      title: "ПРОВЕРЕННОЕ СОСТОЯНИЕ",
      description: "Точные замеры и фотофиксация нюансов",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: "express-cdek",
      title: "ЭКСПРЕСС-ДОСТАВКА СДЭК",
      description: "Быстрая отправка с отслеживанием по РФ",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      id: "yookassa-checkout",
      title: "ОПЛАТА ЮKASSA",
      description: "Защищённый кассовый сервис и мгновенный чекинг",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.8"
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
    <section id="shipping" className="feature-strip" aria-label="Преимущества и сервис">
      <div className="container">
        <ul className="feature-list">
          {features.map((feature, index) => (
            <li key={feature.id} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-body">
                <Typography variant="title-lg" className="feature-title" style={{ fontSize: "11px" }}>
                  {feature.title}
                </Typography>
                <Typography variant="body-sm" className="feature-desc" style={{ fontSize: "11px" }}>
                  {feature.description}
                </Typography>
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
