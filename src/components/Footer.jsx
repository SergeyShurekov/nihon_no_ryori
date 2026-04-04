import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { ui } from "../i18n/translations";

const Footer = () => {
  const { language } = useLanguage();
  const t = ui[language];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__copy">
          <p className="eyebrow">Nihon no Ryori</p>
          <h2>{t.footerTitle}</h2>
          <p>{t.footerBody}</p>
        </div>

        <div className="site-footer__links">
          <Link to="/" className="footer-link">{t.footerHome}</Link>
          <a href="#catalog" className="footer-link">{t.footerCatalog}</a>
          <a href="#about" className="footer-link">{t.footerAbout}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
