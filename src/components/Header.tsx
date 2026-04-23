import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const t = ui[language];
  const navItems = [
    { to: "/", label: t.navHome, end: true },
    { to: "/#catalog", label: t.navCatalog, end: false },
    { to: "/#about", label: t.navAbout, end: false },
  ];

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" end className="brand-mark">
          <span className="brand-mark__kanji">日本</span>
          <span className="brand-mark__copy">
            <strong>Nihon no Ryori</strong>
            <small>{t.brandSubtitle}</small>
          </span>
        </NavLink>

        <div className="site-header__controls">
          <nav className="site-nav" aria-label={t.navAria}>
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `site-nav__link${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="language-switcher" aria-label={t.languageSwitcher}>
            <button
              type="button"
              className={`language-switcher__button${language === "ja" ? " is-active" : ""}`}
              onClick={() => setLanguage("ja")}
            >
              JP
            </button>
            <button
              type="button"
              className={`language-switcher__button${language === "ru" ? " is-active" : ""}`}
              onClick={() => setLanguage("ru")}
            >
              RU
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
