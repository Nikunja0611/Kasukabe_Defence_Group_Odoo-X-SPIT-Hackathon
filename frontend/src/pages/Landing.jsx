// File: StockOpsLanding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bgVideo from "../assets/background.mp4";

import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Package,
  Users,
  Layers,
  Zap,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

/* --- INLINE CSS STYLES (styles string) --- */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --primary: #7149D8;
    --primary-dark: #6C3AD6;
    --secondary: #9D70F9;
    --accent: #9D70F9;

    --bg-light: transparent; /* let video show through */
    --bg-off-white: rgba(250,245,255,0.06);
    --text-main: #1e1b4b;
    --text-muted: #64748b;

    --shadow-sm: 0 1px 2px 0 rgba(113, 73, 216, 0.05);
    --shadow-glow: 0 20px 40px -5px rgba(113, 73, 216, 0.22);
    --shadow-lg: 0 10px 15px -3px rgba(113, 73, 216, 0.08), 0 4px 6px -4px rgba(113, 73, 216, 0.06);
  }

  /* 🔥 Background video should be fullscreen and behind everything */
  .bg-video {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
    pointer-events: none;
  }

  * { box-sizing: border-box; margin:0; padding:0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-light);
    color: var(--text-main);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

  .text-gradient {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }

  /* NAV */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(12px);
    z-index: 1000;
    border-bottom: 1px solid rgba(113,73,216,0.06);
    padding: 14px 0;
  }
  .nav-content { display:flex; justify-content:space-between; align-items:center; }
  .brand { font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:10px; color:var(--primary); }
  .nav-links { display:flex; gap:28px; align-items:center; }
  .nav-link { color:var(--text-muted); text-decoration:none; font-weight:600; }
  .nav-link:hover { color:var(--primary); }
  .nav-btn { background:var(--primary); color:white; padding:8px 20px; border-radius:999px; border:none; cursor:pointer; font-weight:700; }

  /* HERO */
  .hero-section {
    position: relative;
    min-height: 90vh;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    background: transparent; /* allow video to show */
    padding-top: 80px;
  }
  .hero-title { font-size:4rem; font-weight:800; line-height:1.05; margin-bottom:18px; color:var(--text-main); animation:fadeInUp .7s ease-out .1s forwards; opacity:0; }
  .hero-subtitle { font-size:1.15rem; color:var(--text-muted); margin: 0 auto 40px; max-width:640px; animation:fadeInUp .7s ease-out .2s forwards; opacity:0; text-align:center; }
  .btn-main { background:var(--primary); color:white; padding:14px 30px; border-radius:999px; border:none; cursor:pointer; font-weight:700; box-shadow:0 12px 30px rgba(113,73,216,0.18); animation:fadeInUp .7s ease-out .3s forwards; opacity:0; }
  .btn-main:hover { transform: translateY(-3px); background:var(--primary-dark); }

  /* sticky wheel */
  .scroll-wheel-container { position: relative; width:100%; height:360vh; background: transparent; } /* transparent to show video */
  .sticky-viewport { position: sticky; top: 0; height: 100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .wheel-stage { position: relative; width:100%; max-width:760px; height:520px; perspective:1000px; display:flex; align-items:center; justify-content:center; }
  .wheel-card {
    position:absolute;
    width:100%;
    max-width:620px;
    background: rgba(255,255,255,0.92); /* keep cards readable over video */
    padding:40px 36px;
    border-radius:20px;
    border:1px solid rgba(113,73,216,0.06);
    box-shadow:var(--shadow-glow);
    text-align:center;
    opacity:0;
    transform-origin:center;
    transition: all 350ms cubic-bezier(.2,.8,.2,1);
  }
  .wheel-card-icon { width:80px; height:80px; border-radius:50%; background:#f6f0ff; display:flex; align-items:center; justify-content:center; margin-bottom:22px; color:var(--primary); }
  .progress-indicators { position:absolute; bottom:36px; display:flex; gap:12px; z-index:10; }
  .dot { width:10px; height:10px; border-radius:50%; background:#e6e9ef; transition:all .25s; }
  .dot.active { background:var(--primary); transform:scale(1.25); }

  /* highlights */
  .section { padding: 110px 0; position: relative; background: transparent; }
  .highlight-row { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; margin-bottom:90px; }
  .highlight-content h3 { font-size:2.25rem; font-weight:800; color:var(--text-main); margin-bottom:18px; }
  .highlight-content p { color:var(--text-muted); font-size:1.05rem; line-height:1.7; margin-bottom:20px; }
  .highlight-list { list-style:none; margin-bottom:24px; }
  .highlight-list li { display:flex; align-items:center; gap:12px; margin-bottom:12px; font-weight:600; color:var(--text-main); }
  .highlight-image { width:100%; height:420px; border-radius:20px; background: linear-gradient(135deg,#f3e8ff 0%, #e9d5ff 100%); box-shadow:var(--shadow-lg); display:flex; align-items:center; justify-content:center; overflow:hidden; }

  .floating-stat { position:absolute; bottom:22px; left:-30px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); padding:14px 18px; border-radius:14px; box-shadow:var(--shadow-lg); display:flex; gap:12px; align-items:center; animation:float 6s ease-in-out infinite; z-index:5; border:1px solid rgba(255,255,255,0.7); }

  .footer { background: rgba(30,27,75,0.92); color:white; padding:80px 0 40px; }
  .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:56px; }
  .footer-brand h2 { font-size:1.5rem; margin-bottom:12px; color:#e9d5ff; }
  .footer-col h4 { color:#a78bfa; font-size:0.85rem; font-weight:700; text-transform:uppercase; margin-bottom:18px; }
  .footer-links { list-style:none; }
  .footer-links li { margin-bottom:12px; }
  .footer-links a { color:#e6e6ff; text-decoration:none; }
  .footer-links a:hover { color:var(--secondary); transform:translateX(4px); display:inline-block; }

  /* reveal helper */
  .reveal-section { opacity:0; transform: translateY(12px); transition: all 600ms cubic-bezier(.2,.8,.2,1); }
  .reveal-section.is-visible { opacity:1; transform: translateY(0); }

  /* responsive */
  @media (max-width: 980px) {
    .hero-title { font-size:2.4rem; }
    .highlight-row { grid-template-columns:1fr; gap:36px; }
    .floating-stat { display:none; }
    .wheel-stage { max-width: 92%; height:420px; }
    .navbar { padding:12px 0; }
    .nav-links { display:none; }
  }
`;

/* --- SCROLL REVEAL HOOK --- */
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal-section');
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
};

/* --- CARD DATA --- */
const CARD_DATA = [
  { id:1, icon: TrendingUp, title: "Real-time Analytics", desc: "Visualize your sales velocity and turnover rates instantly." },
  { id:2, icon: ShieldCheck, title: "Enterprise Security", desc: "Bank-grade encryption and automated daily backups." },
  { id:3, icon: Globe, title: "Multi-Location", desc: "Sync stock across warehouses, retail stores, and 3PLs." },
  { id:4, icon: Zap, title: "Smart Automation", desc: "Set low-stock alerts and automate purchase orders." },
  { id:5, icon: Users, title: "Role Management", desc: "Granular permission settings for your team." },
  { id:6, icon: Layers, title: "Seamless API", desc: "Connect Shopify, WooCommerce, QuickBooks with one-click." }
];

/* --- HighlightSection component --- */
const HighlightSection = ({ title, desc, listItems, reversed, floatIcon: FloatIcon, floatText, imagePlaceholder }) => (
  <div className={`highlight-row reveal-section ${reversed ? 'reversed' : ''}`}>
    <div className="highlight-content">
      <h3>{title}</h3>
      <p>{desc}</p>
      {listItems && (
        <ul className="highlight-list">
          {listItems.map((item, idx) => (
            <li key={idx}><CheckCircle2 size={18} color="var(--primary)" /> {item}</li>
          ))}
        </ul>
      )}
      <button className="btn-main" style={{ padding: '12px 26px', marginTop: 8 }}>
        Explore Details <ArrowRight size={16} style={{ marginLeft: 8 }} />
      </button>
    </div>

    <div style={{ position: 'relative' }}>
      <div className="highlight-image">
        <div style={{ opacity: 0.06 }}>{imagePlaceholder}</div>
      </div>

      <div className="floating-stat">
        <div style={{ background:'#f3e8ff', padding:10, borderRadius:12, color:'var(--primary)' }}>
          <FloatIcon size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status</div>
          <div style={{ fontWeight: 700 }}>{floatText}</div>
        </div>
      </div>
    </div>
  </div>
);

/* --- MAIN COMPONENT --- */
export default function StockOpsLanding() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      let progress = (scrollTop - containerTop) / (containerHeight - windowHeight);
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCardStyle = (index, totalCards, progress) => {
    const activeIndex = progress * (totalCards - 1);
    const offset = index - activeIndex;
    let opacity = 0, transform = '', zIndex = 0;

    if (Math.abs(offset) <= 1.4) {
      const r = 1 - Math.abs(offset) / 1.4;
      opacity = Math.max(0, r);
      const tx = offset * 420;
      const ry = offset * 25;
      const scale = 0.85 + (0.15 * r);
      transform = `translateX(${tx}px) rotateY(${ry}deg) scale(${scale})`;
      zIndex = Math.round(100 - Math.abs(offset) * 10);
    } else {
      opacity = 0;
      transform = `translateX(${offset < 0 ? -1000 : 1000}px)`;
      zIndex = 1;
    }

    return { opacity, transform, zIndex, transition: 'all 420ms cubic-bezier(.2,.8,.2,1)' };
  };

  const handleGlobalClick = (e) => {
    if (e.target.closest('.navbar')) return;
    navigate('/login');
  };

  const handleLoginClick = (e) => {
    e.stopPropagation();
    navigate('/login');
  };

  return (
    <div onClick={handleGlobalClick} style={{ cursor: 'pointer' }}>
      <style>{styles}</style>

      {/* 🔥 Global background video */}
      <video
        className="bg-video"
        src={bgVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="brand">
            <Package size={28} strokeWidth={2} color="var(--primary)" />
            <span>StockOps</span>
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link">Products</a>
            <a href="#" className="nav-link">Solutions</a>
            <a href="#" className="nav-link">Pricing</a>
            <button className="nav-btn" onClick={handleLoginClick}>Login</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: 20, background: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: 999, color: 'var(--primary)', fontWeight: 800 }}>
            <Zap size={14} style={{ marginRight: 8 }} /> v2.0 Now Live
          </div>

          <h1 className="hero-title">
            Master Your Inventory <br />
            <span className="text-gradient">Automate Your Growth</span>
          </h1>

          <p className="hero-subtitle">
            The all-in-one platform that transforms how you manage stock, orders, and warehouses.
            Built for modern brands scaling fast.
          </p>

          <button className="btn-main">Start Free Trial</button>
        </div>

        {/* subtle floating icons for visual depth */}
        <div style={{ position: 'absolute', top: '18%', left: '6%', opacity: 0.06, zIndex:1 }}>
          <LayoutDashboard size={160} color="var(--primary)" />
        </div>
        <div style={{ position: 'absolute', bottom: '12%', right: '6%', opacity: 0.06, zIndex:1 }}>
          <BarChart3 size={160} color="var(--secondary)" />
        </div>
      </section>

      {/* STICKY WHEEL */}
      <div ref={scrollContainerRef} className="scroll-wheel-container">
        <div className="sticky-viewport">
          <div style={{ textAlign: 'center', marginBottom: 28, opacity: Math.max(0, 1 - scrollProgress * 3) }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Built for Performance</h2>
            <p style={{ color: 'var(--text-muted)' }}>Scroll to explore features</p>
          </div>

          <div className="wheel-stage">
            {CARD_DATA.map((card, idx) => {
              const style = getCardStyle(idx, CARD_DATA.length, scrollProgress);
              return (
                <div key={card.id} className="wheel-card" style={style}>
                  <div className="wheel-card-icon"><card.icon size={36} /></div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: 10 }}>{card.title}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="progress-indicators" style={{ zIndex: 3 }}>
            {CARD_DATA.map((_, idx) => {
              const total = CARD_DATA.length - 1;
              const isActive = Math.abs(scrollProgress * total - idx) < 0.6;
              return <div key={idx} className={`dot ${isActive ? 'active' : ''}`} />;
            })}
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <section className="section container">
        <HighlightSection
          title="Centralize Your Operations"
          desc="StockOps acts as the single source of truth for your inventory, syncing orders and stock levels across all your sales channels in real-time."
          listItems={["Sync Shopify, Amazon, & eBay", "Prevent stockouts automatically", "Centralized return management"]}
          floatIcon={CheckCircle2}
          floatText="All Systems Synced"
          imagePlaceholder={<Layers size={120} color="var(--primary)" />}
        />

        <HighlightSection
          title="Forecast Demand with AI"
          desc="Our forecasting engine predicts future demand, seasonal trends, and reorder points with high accuracy."
          reversed={true}
          listItems={["Reduce dead stock by 30%", "Optimize cash flow", "Smart reorder recommendations"]}
          floatIcon={TrendingUp}
          floatText="Growth +124%"
          imagePlaceholder={<TrendingUp size={120} color="var(--primary)" />}
        />
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                <Package size={28} color="var(--secondary)" />
                <span style={{ fontWeight:800, fontSize:18 }}>StockOps</span>
              </div>
              <p style={{ color:'#d7c7ff', maxWidth:320 }}>Empowering modern commerce with intelligent inventory solutions.</p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a href="#">Features</a></li>
                <li><a href="#">Integrations</a></li>
                <li><a href="#">Enterprise</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Customers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop:20, textAlign:'center', color:'#d7c7ff' }}>
            ©️ 2025 StockOps Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}