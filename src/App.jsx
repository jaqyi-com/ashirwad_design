import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Unlock, 
  Download, 
  Search, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  FileCode, 
  X, 
  KeyRound, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const REQUIRED_PASSWORD = "2420074#Akshat";
const ITEMS_PER_PAGE = 48;

const CATEGORIES = [
  { id: 'all', label: 'All Designs' },
  { id: 'doors', label: 'Doors & Gates' },
  { id: 'panel', label: 'Panels & Screens' },
  { id: 'wall', label: 'Wall Decor' },
  { id: 'tree', label: 'Trees & Nature' },
  { id: 'clipart', label: 'Cliparts & Logos' },
  { id: 'animal', label: 'Animals' },
  { id: 'pattern', label: 'Patterns' }
];

export default function App() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Password state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [targetDownloadDesign, setTargetDownloadDesign] = useState(null);

  // Detail Modal state
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Check stored unlock status on mount
  useEffect(() => {
    const storedStatus = localStorage.getItem('dxf_portfolio_unlocked');
    if (storedStatus === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  // Fetch designs dataset
  useEffect(() => {
    fetch('/data/designs.json')
      .then(res => res.json())
      .then(data => {
        setDesigns(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load designs data:', err);
        setLoading(false);
      });
  }, []);

  // Password submission handler
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === REQUIRED_PASSWORD) {
      setIsUnlocked(true);
      localStorage.setItem('dxf_portfolio_unlocked', 'true');
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      
      // If triggered by a specific download, initiate download immediately
      if (targetDownloadDesign) {
        triggerDownload(targetDownloadDesign);
        setTargetDownloadDesign(null);
      }
    } else {
      setPasswordError('Incorrect Password. Access Denied.');
    }
  };

  const handleLockToggle = () => {
    if (isUnlocked) {
      setIsUnlocked(false);
      localStorage.removeItem('dxf_portfolio_unlocked');
    } else {
      setTargetDownloadDesign(null);
      setShowPasswordModal(true);
    }
  };

  // Trigger download action
  const triggerDownload = (design, format = 'dxf') => {
    if (!isUnlocked) {
      setTargetDownloadDesign(design);
      setShowPasswordModal(true);
      return;
    }

    // Direct download link or format page URL
    const downloadUrl = `${design.url}/download/${format}`;
    window.open(downloadUrl, '_blank');
  };

  // Filter designs based on search term & category
  const filteredDesigns = useMemo(() => {
    return designs.filter(item => {
      const matchesSearch = 
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;

      const slug = item.slug.toLowerCase();
      const title = item.title.toLowerCase();

      if (selectedCategory === 'doors') return slug.includes('door') || title.includes('door');
      if (selectedCategory === 'panel') return slug.includes('panel') || slug.includes('screen') || title.includes('panel');
      if (selectedCategory === 'wall') return slug.includes('wall') || slug.includes('decor') || title.includes('wall');
      if (selectedCategory === 'tree') return slug.includes('tree') || slug.includes('flower') || title.includes('tree');
      if (selectedCategory === 'clipart') return slug.includes('clipart') || slug.includes('logo') || title.includes('clipart');
      if (selectedCategory === 'animal') return slug.includes('cat') || slug.includes('dog') || slug.includes('elephant') || slug.includes('animal') || slug.includes('bird');
      if (selectedCategory === 'pattern') return slug.includes('pattern') || title.includes('pattern');

      return true;
    });
  }, [designs, searchTerm, selectedCategory]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredDesigns.length / ITEMS_PER_PAGE) || 1;
  const paginatedDesigns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDesigns.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDesigns, currentPage]);

  return (
    <div className="portfolio-app">
      {/* Header Navigation */}
      <header className="header-nav">
        <div className="header-container">
          <a href="#" className="brand-logo">
            <div className="logo-icon-bg">
              <FileCode size={24} />
            </div>
            <div className="brand-text">
              <h1>FREE DXF PORTFOLIO</h1>
              <p>9,000+ Premium Vector & CNC Designs</p>
            </div>
          </a>

          <div className="header-actions">
            <button 
              className={`lock-status-btn ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={handleLockToggle}
              title={isUnlocked ? "Session Unlocked - Click to Lock" : "Click to Enter Access Password"}
            >
              {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
              <span>{isUnlocked ? 'Downloads Unlocked' : 'Protected (Enter Key)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Search Header */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Complete DXF & Vector Collection</span>
          </div>
          <h2 className="hero-title">Browse & Download DXF Cut Files</h2>
          <p className="hero-subtitle">
            Explore 9,185 high-quality DXF, SVG, AI, and CDR design files with unique part numbers. Download button is protected by password authentication.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="search-and-sort">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input 
                type="text" 
                className="search-input"
                placeholder="Search by Part Number (e.g. PART-GWORV) or Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="tag-pills">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                className={`tag-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Portfolio Grid */}
      <main className="main-container">
        <div className="results-meta">
          <span>Showing <strong>{filteredDesigns.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDesigns.length)}</strong> of <strong>{filteredDesigns.length}</strong> designs</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p>Loading DXF Portfolio Collection...</p>
          </div>
        ) : paginatedDesigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>No designs found matching your search.</h3>
            <p>Try searching by Part Number or clear filters.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {paginatedDesigns.map(design => (
              <div key={design.id} className="design-card">
                {/* Image Container with Unique Part Number Badge */}
                <div className="card-image-wrapper" onClick={() => setSelectedDesign(design)}>
                  <img 
                    src={design.preview} 
                    alt={design.title}
                    className="card-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://free-dxf.com/images/logo.png';
                    }}
                  />
                  {/* Unique Part Number Displayed Prominently */}
                  <div className="part-number-badge">
                    <Layers size={12} />
                    <span>{design.partNumber}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="card-content">
                  <h3 className="card-title" title={design.title}>{design.title}</h3>

                  <div className="format-badges">
                    {design.formats.map(fmt => (
                      <span key={fmt} className={`format-chip ${fmt}`}>{fmt}</span>
                    ))}
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setSelectedDesign(design)}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>

                    <button 
                      className="btn btn-primary"
                      onClick={() => triggerDownload(design)}
                    >
                      {isUnlocked ? <Download size={14} /> : <Lock size={14} />}
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button 
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={18} />
            </button>

            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button 
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* Password Protection Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
              <X size={18} />
            </button>

            <div className="password-modal-box">
              <div className="password-icon-wrapper">
                <KeyRound size={28} />
              </div>

              <h3 className="password-modal-title">Password Protected Download</h3>
              <p className="password-modal-sub">
                Enter the portfolio access password to unlock download access for 
                {targetDownloadDesign ? <strong style={{ color: 'var(--accent-cyan)' }}> {targetDownloadDesign.partNumber}</strong> : ' all design files'}.
              </p>

              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="password-input-group">
                  <input 
                    type="password" 
                    className="password-input"
                    placeholder="Enter Access Password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    autoFocus
                  />
                </div>

                {passwordError && (
                  <div className="error-msg">
                    <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {passwordError}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  <Unlock size={16} />
                  <span>Unlock Downloads</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Design Detail Modal */}
      {selectedDesign && (
        <div className="modal-overlay" onClick={() => setSelectedDesign(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDesign(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative', width: '100%', background: '#04070d', borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '1rem', textAlign: 'center' }}>
                <img 
                  src={selectedDesign.preview} 
                  alt={selectedDesign.title}
                  style={{ maxHeight: '350px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  <Layers size={14} />
                  <span>PART NUMBER: {selectedDesign.partNumber}</span>
                </div>

                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                  {selectedDesign.title}
                </h2>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Design Code: {selectedDesign.id} | Slug: {selectedDesign.slug}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Available Asset Formats:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {selectedDesign.formats.map(fmt => (
                    <button 
                      key={fmt}
                      className="btn btn-secondary"
                      style={{ textTransform: 'uppercase', padding: '0.6rem 1rem' }}
                      onClick={() => triggerDownload(selectedDesign, fmt)}
                    >
                      <Download size={14} />
                      <span>Download {fmt.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
