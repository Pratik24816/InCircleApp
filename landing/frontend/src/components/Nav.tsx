import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ASSETS, BRAND } from '../constants/brand';
import './nav.css';

const links = [
  { href: '#story', label: 'Story' },
  { href: '#features', label: 'Features' },
  { href: '#experience', label: 'Experience' },
  { href: '#circle', label: 'Circle' },
  { href: '#waitlist', label: 'Waitlist' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nav__inner container">
        <a href="#top" className="nav__brand" aria-label={`${BRAND.name} home`}>
          <img
            src={ASSETS.navLogo}
            alt={BRAND.name}
            className="nav__logo"
            width={140}
            height={40}
            decoding="async"
          />
        </a>

        <nav className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`} aria-label="Main">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="nav__link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#waitlist" className="btn btn--primary nav__cta" onClick={() => setMenuOpen(false)}>
            Get early access
          </a>
        </nav>

        <button
          type="button"
          className={`nav__burger ${menuOpen ? 'nav__burger--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </motion.header>
  );
}
