import { ASSETS, BRAND } from '../constants/brand';
import './footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img
            src={ASSETS.navLogo}
            alt={BRAND.name}
            width={120}
            height={36}
            className="footer__logo"
            decoding="async"
          />
        </div>
        <p className="footer__tagline">{BRAND.tagline}</p>
        <p className="footer__copy">
          © {year} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
