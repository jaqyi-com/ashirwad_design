import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Unlock, 
  Download, 
  Search, 
  Eye, 
  Sparkles, 
  FileCode, 
  X, 
  KeyRound, 
  ChevronLeft, 
  ChevronRight,
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
      
      if (targetDownloadDesign) {
        triggerDownload(targetDownloadDesign);
        setTargetDownloadDesign(null);
      }
    } else {
      setPasswordError('Incorrect Access Password.');
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
      {/* Header Navigation with Top Categories */}
      <header className="header-nav">
        <div className="header-container">
          <a href="#" className="brand-logo">
            <div className="logo-icon-bg">
              <FileCode size={22} />
            </div>
            <div className="brand-text">
              <h1>ASHIRWAD DESIGN</h1>
              <p>9,185 CNC Cut & Vector Designs</p>
            </div>
          </a>

          <div className="header-actions">
            <button 
              className={`lock-status-btn ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={handleLockToggle}
              title={isUnlocked ? "Unlocked - Click to Lock Session" : "Click to Unlock Downloads"}
            >
              {isUnlocked ? <Unlock size={15} /> : <Lock size={15} />}
              <span>{isUnlocked ? 'UNLOCKED' : 'ENTER ACCESS KEY'}</span>
            </button>
          </div>
        </div>

        {/* Top Category Filter Bar */}
        <div className="top-category-bar">
          <div className="tag-pills-container">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Ashirwad Design Collection</span>
          </div>
          <h2 className="hero-title">Ashirwad Design DXF Portfolio</h2>
          <p className="hero-subtitle">
            Explore 9,185 high-precision DXF, SVG, AI, and CDR design files with assigned part numbers. Protected with instant download authorization.
          </p>
        </div>

        {/* Search Controls Bar */}
        <div className="controls-bar">
          <div className="search-and-sort">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="search-input"
                placeholder="Search by Part Number (e.g. PART-GWORV) or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="main-container">
        <div className="results-meta">
          <span>
            Showing <strong>{filteredDesigns.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDesigns.length)}</strong> of <strong>{filteredDesigns.length}</strong> vector designs
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>LOADING VECTOR PORTFOLIO...</p>
          </div>
        ) : paginatedDesigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No designs matched your search.</h3>
            <p>Try searching by a different Part Number or clear active filters.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {paginatedDesigns.map(design => (
              <div key={design.id} className="design-card">
                {/* Image Container with Part Number Badge */}
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
                  {/* Part Number Badge */}
                  <div className="part-number-badge">
                    <Layers size={11} />
                    <span>{design.partNumber}</span>
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="card-content">
                  <h3 className="card-title" title={design.title}>{design.title}</h3>

                  <div className="format-badges">
                    {design.formats.map(fmt => (
                      <span key={fmt} className="format-chip">{fmt}</span>
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
              title="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>

            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0 0.75rem', fontWeight: '600' }}>
              {currentPage} / {totalPages}
            </span>

            <button 
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              title="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* Password Authorization Modal */}
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

              <h3 className="password-modal-title">ACCESS AUTHENTICATION</h3>
              <p className="password-modal-sub">
                Enter the access key to unlock downloads for 
                {targetDownloadDesign ? <strong style={{ color: '#ffffff' }}> {targetDownloadDesign.partNumber}</strong> : ' the full design vault'}.
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
                    <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    {passwordError}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}>
                  <Unlock size={16} />
                  <span>UNLOCK DOWNLOADS</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Design Detail View Modal */}
      {selectedDesign && (
        <div className="modal-overlay" onClick={() => setSelectedDesign(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDesign(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative', width: '100%', background: '#050505', borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '1.25rem', textAlign: 'center', border: '1px solid var(--border-medium)' }}>
                <img 
                  src={selectedDesign.preview} 
                  alt={selectedDesign.title}
                  style={{ maxHeight: '340px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', color: '#000000', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.65rem' }}>
                  <Layers size={13} />
                  <span>{selectedDesign.partNumber}</span>
                </div>

                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
                  {selectedDesign.title}
                </h2>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Design ID: {selectedDesign.id} | Slug: {selectedDesign.slug}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Download File Formats:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {selectedDesign.formats.map(fmt => (
                    <button 
                      key={fmt}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.1rem' }}
                      onClick={() => triggerDownload(selectedDesign, fmt)}
                    >
                      <Download size={14} />
                      <span>{fmt.toUpperCase()}</span>
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
