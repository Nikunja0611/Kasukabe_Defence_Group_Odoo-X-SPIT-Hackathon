import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  ChevronRight, 
  ArrowRight,
  Package,
  Users,
  Layers,
  Zap,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

/* --- CSS STYLES --- */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    /* --- PURPLE THEME --- */
    --primary: #7149D8;       /* Mid Purple */
    --primary-dark: #6C3AD6;  /* Deep Purple */
    --secondary: #9D70F9;     /* Light Purple */
    --accent: #9D70F9;        /* Light Purple Accent */
    
    --bg-light: #ffffff;
    --bg-off-white: #faf5ff;  /* Very light purple tint */
    --text-main: #1e1b4b;     /* Dark Indigo/Purple text */
    --text-muted: #64748b;    /* Slate gray */
    
    --shadow-sm: 0 1px 2px 0 rgba(113, 73, 216, 0.05);
    --shadow-glow: 0 20px 40px -5px rgba(113, 73, 216, 0.25);
    --shadow-lg: 0 10px 15px -3px rgba(113, 73, 216, 0.1), 0 4px 6px -4px rgba(113, 73, 216, 0.1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-light);
    color: var(--text-main);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
  }

  /* --- UTILITY --- */
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .text-gradient {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* --- ANIMATIONS --- */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }

  /* --- NAVIGATION --- */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    z-index: 1000;
    border-bottom: 1px solid rgba(113, 73, 216, 0.1);
    padding: 16px 0;
  }
  
  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    font-size: 1.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--primary);
  }

  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-link { color: var(--text-muted); text-decoration: none; font-weight: 600; transition: color 0.2s; }
  .nav-link:hover { color: var(--primary); }
  .nav-btn {
    background: var(--primary); color: white; padding: 10px 24px;
    border-radius: 50px; font-weight: 600; transition: all 0.2s; border: none; cursor: pointer;
  }
  .nav-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }

  /* --- HERO SECTION --- */
  .hero-section {
    position: relative;
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    /* [IMAGE SPOT 1]: Replace 'radial-gradient(...)' with 'url("/your-hero-bg.jpg")' */
    background: radial-gradient(circle at 50% 0%, #f3e8ff 0%, #fff 70%); 
    background-size: cover; /* Ensure image covers area if added */
    background-position: center;
    padding-top: 80px;
  }

  .hero-title {
    font-size: 4.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -2px;
    color: var(--text-main);
    animation: fadeInUp 0.8s ease-out 0.1s forwards;
    opacity: 0;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin-bottom: 48px;
    max-width: 640px;
    margin: 0 auto 48px;
    animation: fadeInUp 0.8s ease-out 0.2s forwards;
    opacity: 0;
  }

  .btn-main {
    background: var(--primary); color: white; padding: 16px 36px;
    border-radius: 50px; font-weight: 600; font-size: 1.1rem; border: none;
    cursor: pointer; transition: all 0.3s;
    box-shadow: 0 10px 20px -10px rgba(113, 73, 216, 0.5);
    animation: fadeInUp 0.8s ease-out 0.3s forwards; opacity: 0;
  }
  .btn-main:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 30px -10px rgba(113, 73, 216, 0.6);
    background: var(--primary-dark);
  }

  /* --- SCROLL WHEEL SECTION STYLES --- */
  .scroll-wheel-container {
    position: relative;
    width: 100%;
    height: 400vh; 
    background: var(--bg-off-white);
  }

  .sticky-viewport {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .wheel-stage {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 500px;
    perspective: 1000px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wheel-card {
    position: absolute;
    width: 100%;
    background: white;
    padding: 48px 36px;
    border-radius: 24px;
    border: 1px solid rgba(113, 73, 216, 0.08);
    box-shadow: var(--shadow-glow);
    text-align: center;
    opacity: 0; 
    will-change: transform, opacity;
    transition: box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .wheel-card-icon {
    width: 80px;
    height: 80px;
    background: #f3e8ff; /* Light Purple Tint */
    color: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
    font-size: 2rem;
    border: 1px solid rgba(113, 73, 216, 0.1);
  }

  .progress-indicators {
    position: absolute;
    bottom: 40px;
    display: flex;
    gap: 12px;
    z-index: 10;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e2e8f0;
    transition: all 0.3s;
  }

  .dot.active {
    background: var(--primary);
    transform: scale(1.3);
  }

  /* --- HIGHLIGHT SECTIONS --- */
  .section { padding: 120px 0; position: relative; }
  
  .highlight-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    margin-bottom: 140px;
  }

  .highlight-content h3 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 24px;
    color: var(--text-main);
    letter-spacing: -1px;
  }

  .highlight-content p {
    color: var(--text-muted);
    font-size: 1.15rem;
    line-height: 1.8;
    margin-bottom: 32px;
  }

  .highlight-list {
    list-style: none;
    margin-bottom: 40px;
  }

  .highlight-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    color: var(--text-main);
    font-weight: 500;
  }
  
  .highlight-image-container {
    position: relative;
  }
  
  .highlight-image {
    width: 100%;
    height: 500px;
    border-radius: 32px;
    /* Purple Gradient */
    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-lg);
    transition: transform 0.5s ease;
    overflow: hidden; /* Ensure images stay inside border radius */
  }
  
  /* Optional: If you add an <img> tag inside .highlight-image, make it cover the area */
  .highlight-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .highlight-row:hover .highlight-image { transform: scale(1.02); }

  /* FLOATING BOX */
  .floating-stat {
    position: absolute;
    bottom: 40px;
    left: -30px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    padding: 20px 30px;
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 15px;
    animation: float 6s ease-in-out infinite;
    border: 1px solid rgba(255,255,255,0.8);
    z-index: 5;
  }

  .highlight-row.reversed { direction: rtl; }
  .highlight-row.reversed .highlight-content { direction: ltr; }
  .highlight-row.reversed .floating-stat { left: auto; right: -30px; animation-delay: 1s; }

  /* --- FOOTER --- */
  .footer {
    background: #1e1b4b; /* Very Dark Purple */
    color: white;
    padding: 100px 0 60px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 60px;
    margin-bottom: 80px;
  }

  .footer-brand h2 { font-size: 2rem; margin-bottom: 24px; letter-spacing: -1px; }
  .footer-col h4 { color: #a78bfa; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 28px; }
  .footer-links { list-style: none; }
  .footer-links li { margin-bottom: 16px; }
  .footer-links a { color: #e2e8f0; text-decoration: none; transition: all 0.2s; font-size: 0.95rem; }
  .footer-links a:hover { color: var(--secondary); transform: translateX(4px); display: inline-block; }

  @media (max-width: 768px) {
    .hero-title { font-size: 3rem; }
    .highlight-row, .highlight-row.reversed { grid-template-columns: 1fr; direction: ltr; gap: 40px; }
    .wheel-stage { max-width: 90%; height: 450px; }
    .floating-stat { display: none; } 
    .footer-grid { grid-template-columns: 1fr; gap: 40px; }
    .nav-links { display: none; }
  }
`;

/* --- SCROLL OBSERVER HOOK --- */
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal-section');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
};

/* --- CARD DATA --- */
const CARD_DATA = [
  {
    id: 1,
    icon: TrendingUp,
    title: "Real-time Analytics",
    desc: "Visualize your sales velocity and turnover rates instantly. Make decisions based on live data, not guesses."
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "Bank-grade encryption and automated daily backups ensure your critical business data is never at risk."
  },
  {
    id: 3,
    icon: Globe,
    title: "Multi-Location",
    desc: "Seamlessly sync stock across unlimited warehouses, retail stores, and 3PL providers worldwide."
  },
  {
    id: 4,
    icon: Zap,
    title: "Smart Automation",
    desc: "Set low-stock alerts and automate purchase orders to ensure you never miss a sale due to stockouts."
  },
  {
    id: 5,
    icon: Users,
    title: "Role Management",
    desc: "Granular permission settings let you control exactly what your team members can see and perform."
  },
  {
    id: 6,
    icon: Layers,
    title: "Seamless API",
    desc: "Connect with Shopify, WooCommerce, Xero, and QuickBooks with our native one-click integrations."
  }
];

/* --- HIGHLIGHT SECTION COMPONENT --- */
const HighlightSection = ({ title, desc, listItems, reversed, floatIcon: FloatIcon, floatText, imagePlaceholder }) => (
  <div className={`highlight-row reveal-section ${reversed ? 'reversed' : ''}`}>
    <div className="highlight-content">
      <h3>{title}</h3>
      <p>{desc}</p>
      {listItems && (
        <ul className="highlight-list">
          {listItems.map((item, idx) => (
            <li key={idx}><CheckCircle2 size={20} color="var(--primary)" /> {item}</li>
          ))}
        </ul>
      )}
      <button className="btn-main" style={{ padding: '14px 28px', fontSize: '1rem', boxShadow: 'none' }}>
        Explore Details <ArrowRight size={18} />
      </button>
    </div>
    <div className="highlight-image-container">
      <div className="highlight-image">
        {/* <img src="/assets/landing1_main.jpg" alt="Feature" />
        */}
        <div style={{ opacity: 0.1 }}>
           {imagePlaceholder}
        </div>
      </div>
      
      <div className="floating-stat">
        <div style={{ background: '#f3e8ff', padding: 10, borderRadius: '50%', color: 'var(--primary)' }}>
          <FloatIcon size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Status</div>
          <div style={{ fontWeight: '700', color: '#1e1b4b' }}>{floatText}</div>
        </div>
      </div>
    </div>
  </div>
);

/* --- MAIN COMPONENT --- */
export default function StockOpsLanding() {
  const navigate = useNavigate(); // Navigation Hook
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useScrollReveal();

  // Scroll Listener for the Sticky Section
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Calculate progress (0 to 1) within the container
      let progress = (scrollTop - containerTop) / (containerHeight - windowHeight);

      // Clamp progress
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to calculate styles for each card based on progress
  const getCardStyle = (index, totalCards, progress) => {
    const activeIndex = progress * (totalCards - 1);
    const offset = index - activeIndex;

    let opacity = 0;
    let transform = '';
    let zIndex = 0;
    
    if (offset === 0) {
      opacity = 1;
      transform = `scale(1) translateX(0px) rotateY(0deg)`;
      zIndex = 10;
    } else if (offset > 0) {
      if (offset <= 1.5) {
        const enterProgress = 1 - offset;
        opacity = Math.max(0, enterProgress); 
        const tx = offset * 600; 
        const ry = offset * 45; 
        const scale = 0.8 + (0.2 * (1 - offset));
        transform = `scale(${Math.max(0.8, scale)}) translateX(${tx}px) rotateY(${-ry}deg)`;
        zIndex = 10 - index;
      } else {
        opacity = 0;
        transform = `translateX(1000px)`;
      }
    } else {
      if (offset >= -1.5) {
        const exitProgress = 1 + offset;
        opacity = Math.max(0, exitProgress);
        const tx = offset * 600;
        const ry = offset * 45;
        const scale = 0.8 + (0.2 * (1 + offset));
        transform = `scale(${Math.max(0.8, scale)}) translateX(${tx}px) rotateY(${-ry}deg)`;
        zIndex = 10 - Math.abs(index);
      } else {
        opacity = 0;
        transform = `translateX(-1000px)`;
      }
    }

    return { opacity, transform, zIndex };
  };

  // Global Click Redirect Handler
  const handleGlobalClick = (e) => {
    // If clicking the navbar, allow default interaction (don't redirect)
    if (e.target.closest('.navbar')) return;
    
    // Otherwise, redirect to login
    navigate('/login');
  };

  // Explicit Login Handler for Navbar Button
  const handleLoginClick = (e) => {
    e.stopPropagation(); // Prevent triggering global click
    navigate('/login');
  };

  return (
    <div onClick={handleGlobalClick} style={{ cursor: 'pointer' }}>
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="brand">
            <Package size={32} strokeWidth={2.5} color="var(--primary)" />
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

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: 20, background: '#fff', padding: '8px 16px', borderRadius: 50, color: 'var(--primary)', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <Zap size={14} fill="var(--secondary)" style={{ marginRight: 5 }} /> v2.0 Now Live
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
        
        {/* Floating Backgrounds */}
        <div style={{ position: 'absolute', top: '20%', left: '5%', opacity: 0.05, animation: 'float 8s infinite' }}>
          <LayoutDashboard size={160} color="var(--primary)" />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', opacity: 0.05, animation: 'float 10s infinite reverse' }}>
          <BarChart3 size={180} color="var(--secondary)" />
        </div>
      </section>

      {/* --- STICKY SCROLL CAROUSEL (THE WHEEL) --- */}
      <div ref={scrollContainerRef} className="scroll-wheel-container">
        <div className="sticky-viewport">
          
          <div style={{ textAlign: 'center', marginBottom: 40, opacity: Math.max(0, 1 - scrollProgress * 3) }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Built for Performance</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Scroll to explore features</p>
          </div>

          <div className="wheel-stage">
            {CARD_DATA.map((card, idx) => {
              const style = getCardStyle(idx, CARD_DATA.length, scrollProgress);
              return (
                <div key={card.id} className="wheel-card" style={style}>
                  <div className="wheel-card-icon">
                    <card.icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: 16, color: 'var(--text-main)' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="progress-indicators">
            {CARD_DATA.map((_, idx) => {
              const total = CARD_DATA.length - 1;
              const isActive = Math.abs(scrollProgress * total - idx) < 0.5;
              return <div key={idx} className={`dot ${isActive ? 'active' : ''}`} />;
            })}
          </div>

        </div>
      </div>

      {/* DETAILED HIGHLIGHTS */}
      <section className="section container">
        
        <HighlightSection 
          title="Centralize Your Operations" 
          desc="StockOps acts as the single source of truth for your inventory, syncing orders and stock levels across all your sales channels in real-time. Never oversell again."
          listItems={["Sync Shopify, Amazon, & eBay", "Prevent stockouts automatically", "Centralized return management"]}
          floatIcon={CheckCircle2}
          floatText="All Systems Synced"
          imagePlaceholder={<Layers size={120} color="var(--primary)" />}
        />

        <HighlightSection 
          title="Forecast Demand with AI" 
          desc="Our proprietary forecasting engine analyzes historical sales data to predict future demand, seasonal trends, and reorder points with 98% accuracy."
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                <Package size={32} color="var(--secondary)" />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>StockOps</span>
              </div>
              <p style={{ color: '#a78bfa', lineHeight: 1.6, maxWidth: 300 }}>
                Empowering modern commerce with intelligent inventory solutions.
              </p>
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
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 30, textAlign: 'center', color: '#a78bfa', fontSize: '0.9rem' }}>
            © 2025 StockOps Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}