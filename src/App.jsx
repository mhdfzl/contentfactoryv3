import React, { useState, useEffect, useMemo } from 'react';
import { fetchBootstrapData, postUpdateScript } from './services/api.js';
import {
  Package,
  Film,
  BookOpen,
  Search,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Tag,
  ShoppingBag,
  TrendingUp,
  FileText,
  Clock,
  X,
  Bot,
  Terminal,
  Layers,
  Save,
  Share2
} from 'lucide-react';


export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'library' | 'rules'

  // Server Data States
  const [products, setProducts] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [rules, setRules] = useState([]);
  const [library, setLibrary] = useState([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter States for Product Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // Filter States for Output Library
  const [libraryFilterStatus, setLibraryFilterStatus] = useState('ALL');
  const [librarySearch, setLibrarySearch] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // State for Agent Task Modal
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPromptText, setGeneratedPromptText] = useState('');
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [editorDraft, setEditorDraft] = useState(null);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await fetchBootstrapData();
      
      const rawProducts = data.products || data.data?.products || [];
      const rawHooks = data.hooks || data.data?.hooks || [];
      const rawRules = data.rules || data.data?.rules || [];
      const rawLibrary = data.library || data.data?.library || [];

      setProducts(rawProducts);
      setHooks(rawHooks);
      setRules(rawRules);
      setLibrary(rawLibrary);
    } catch (err) {
      console.error('Fetch Bootstrap Error:', err);
      setError('Gagal menyambung ke pangkalan data Google Sheets: ' + err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyTextToClipboard = async (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback below
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.warn('Clipboard fallback failed:', err);
      return false;
    }
  };

  const handleCopyAction = (key, text) => {
    copyTextToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Helper to count words accurately
  const getWordCount = (text) => {
    if (!text || typeof text !== 'string') return 0;
    const cleanText = text.trim();
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).filter(Boolean).length;
  };

  const brandList = useMemo(() => {
    const brands = new Set();
    products.forEach((p) => {
      const brand = p['Brand Shop'] || p['Brand'] || p['brand'] || 'Lain-lain';
      if (brand) brands.add(brand);
    });
    return ['ALL', ...Array.from(brands)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const id = String(prod['Product ID'] || prod['id'] || '').toLowerCase();
      const name = String(prod['Produk_Name'] || prod['Produk_Name_Full'] || prod['name'] || '').toLowerCase();
      const brand = String(prod['Brand Shop'] || prod['Brand'] || '').toLowerCase();
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch = !search || id.includes(search) || name.includes(search) || brand.includes(search);
      const matchesBrand = selectedBrand === 'ALL' || (prod['Brand Shop'] || prod['Brand']) === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [products, searchQuery, selectedBrand]);

  // Selection handlers
  const handleToggleSelectProduct = (productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      filteredProducts.forEach((p) => {
        const id = p['Product ID'] || p['id'];
        if (id) next.add(id);
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const handleOpenBatchPromptModal = () => {
    if (selectedProductIds.size === 0) return;

    // Extract Product IDs only
    const idList = Array.from(selectedProductIds).join(', ');

    const prompt = `Sila proses aliran kerja Affiliate Content Factory Siri V3 untuk Product ID berikut:
${idList}

Aliran Kerja:
1. Dav V3: Semak pangkalan data produk dan arkib TikTok_Content_Library.
2. Tara V3: Tetapkan Target Persona, POV, dan Hook daripada Hooks_Library.
3. Jess V3: Tulis skrip VO lisan (120-140 patah perkataan, konsistensi POV penuh), caption, hashtags (maks 7), headline, dan subheadline.
4. Vero V3: Semak pematuhan 12 kriteria. Jika lulus, komit rekod ke Google Sheets TikTok_Content_Library.`;

    setGeneratedPromptText(prompt);
    setIsPromptCopied(false);
    setIsPromptModalOpen(true);
  };

  const handleCopyGeneratedPrompt = () => {
    copyTextToClipboard(generatedPromptText);
    setIsPromptCopied(true);
    setTimeout(() => {
      setIsPromptCopied(false);
    }, 2000);
  };

  const handleLibraryFieldChange = (videoId, field, value) => {
    setLibrary((prev) =>
      prev.map((item) => {
        if ((item['Video_ID'] || item['id']) === videoId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleStatusChange = async (item, newStatus) => {
    const videoId = item['Video_ID'] || item['id'];
    if (!videoId) return;

    setUpdatingId(videoId);
    const updatedRecord = {
      ...item,
      Status: newStatus
    };

    // Optimistic UI update
    setLibrary((prev) =>
      prev.map((libItem) => {
        if ((libItem['Video_ID'] || libItem['id']) === videoId) {
          return { ...libItem, Status: newStatus };
        }
        return libItem;
      })
    );

    try {
      await postUpdateScript(updatedRecord);
      showToast(`Status ${videoId} dikemas kini kepada "${newStatus}"!`);
    } catch (err) {
      console.error('Update status error:', err);
      showToast(`Gagal kemas kini status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveHeadlineSubheadline = async (item) => {
    const videoId = item['Video_ID'] || item['id'];
    if (!videoId) return;

    setUpdatingId(videoId);
    try {
      await postUpdateScript(item);
      showToast(`Headline & Subheadline bagi ${videoId} berjaya disimpan!`);
    } catch (err) {
      console.error('Save headline error:', err);
      showToast(`Ralat menyimpan: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const openLibraryEditor = (item) => {
    const script = item['Final_Script'] || item['Script'] || '';
    setEditorDraft({
      ...item,
      Hook_Type: item['Hook_Type'] || '',
      Hook: item['Hook'] || '',
      Headline: item['Headline'] || '',
      Subheadline: item['Subheadline'] || '',
      Angle: item['Angle'] || '',
      Final_Script: script,
      Caption: item['Caption'] || '',
      Hashtags: item['Hashtags'] || '',
      Status: item['Status'] || 'Draft',
    });
  };

  const handleSaveLibraryEditor = async () => {
    if (!editorDraft) return;
    const videoId = editorDraft['Video_ID'] || editorDraft['id'];
    setUpdatingId(videoId);
    try {
      await postUpdateScript(editorDraft);
      setLibrary((prev) => prev.map((item) =>
        (item['Video_ID'] || item['id']) === videoId ? editorDraft : item
      ));
      setEditorDraft(null);
      showToast(`Perubahan ${videoId} berjaya disimpan.`);
    } catch (err) {
      console.error('Save library record error:', err);
      showToast(`Gagal menyimpan ${videoId}: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLibrary = useMemo(() => {
    return library.filter((item) => {
      const status = item['Status'] || 'Draft';
      const videoId = String(item['Video_ID'] || '').toLowerCase();
      const prodId = String(item['Product_ID'] || '').toLowerCase();
      const headline = String(item['Headline'] || '').toLowerCase();
      const script = String(item['Final_Script'] || item['Script'] || '').toLowerCase();
      const q = librarySearch.toLowerCase().trim();

      const matchesStatus = libraryFilterStatus === 'ALL' || status.toLowerCase() === libraryFilterStatus.toLowerCase();
      const matchesSearch = !q || videoId.includes(q) || prodId.includes(q) || headline.includes(q) || script.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [library, libraryFilterStatus, librarySearch]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">Content Factory</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                    Siri V3
                  </span>
                </div>
                <p className="text-xs text-slate-400">TikTok Affiliate Automation System</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 sm:space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Katalog Produk</span>
                <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-900/60 text-slate-300">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'library'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Output Library</span>
                <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-900/60 text-slate-300">
                  {library.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'rules'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Peraturan V3</span>
                <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-slate-900/60 text-slate-300">
                  {rules.length || 11}
                </span>
              </button>
            </nav>

            {/* Quick Refresh Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadData(false)}
                disabled={loading}
                title="Muat Semula Data"
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-xl shadow-blue-900/50 border border-blue-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Menyambung ke Google Apps Script REST API...</p>
          </div>
        ) : (
          <>
            {/* ========================================================
                TAB 1: KATALOG PRODUK (157 PRODUK)
                ======================================================== */}
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                {/* Control Panel: Search, Brand Filter, Batch Actions */}
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari ID Produk, Nama Produk, atau Jenama..."
                        className="w-full bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Brand Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {brandList.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand === 'ALL' ? 'Semua Jenama (Brand Shop)' : brand}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Batch Selection Action Bar */}
                  <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <button
                        onClick={handleSelectAllFiltered}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-medium transition"
                      >
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                        Pilih Semua Tapisan ({filteredProducts.length})
                      </button>

                      <button
                        onClick={handleClearSelection}
                        disabled={selectedProductIds.size === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium transition disabled:opacity-40"
                      >
                        <Square className="w-4 h-4" />
                        Batal Pilihan
                      </button>

                      <span className="text-slate-400 ml-2">
                        Dipilih:{' '}
                        <span className="font-semibold text-blue-400">{selectedProductIds.size}</span> daripada{' '}
                        {products.length}
                      </span>
                    </div>

                    {/* Main Action: Jana Arahan Batch (Modal Trigger) */}
                    <button
                      onClick={handleOpenBatchPromptModal}
                      disabled={selectedProductIds.size === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm active:scale-95"
                    >
                      <Bot className="w-4 h-4 text-blue-200" />
                      <span>Jana Arahan Batch ({selectedProductIds.size} Produk)</span>
                    </button>
                  </div>
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((prod, idx) => {
                    const prodId = prod['Product ID'] || prod['id'] || `P-${idx}`;
                    const name = prod['Produk_Name'] || prod['Produk_Name_Full'] || prod['name'] || 'Nama Produk Tiada';
                    const brand = prod['Brand Shop'] || prod['Brand'] || 'TikTok Shop';
                    const desc = prod['Produk_Description'] || prod['description'] || 'Penerangan produk tidak tersedia.';
                    const angle = prod['Marketing_angle'] || prod['angle'] || 'Fokus Manfaat & Kegunaan Pantas';
                    const review = prod['Review'] || 'Tiada ulasan lagi.';
                    const isSelected = selectedProductIds.has(prodId);

                    return (
                      <div
                        key={prodId}
                        onClick={() => handleToggleSelectProduct(prodId)}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/30 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                            : 'bg-slate-800/50 hover:bg-slate-800/90 border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          {/* Header card with ID, Brand, Checkbox */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                              {prodId}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {brand}
                              </span>
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center transition ${
                                  isSelected ? 'bg-blue-600 text-white' : 'border border-slate-600'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </div>

                          {/* Product Title */}
                          <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2" title={name}>
                            {name}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{desc}</p>
                        </div>

                        {/* Metadata Footer */}
                        <div className="pt-3 border-t border-slate-700/50 space-y-1.5 text-xs">
                          <div className="flex items-start gap-1.5 text-amber-400/90">
                            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1 italic font-medium">Angle: {angle}</span>
                          </div>
                          <div className="text-slate-400 line-clamp-1 text-[11px]">
                            <span className="text-slate-500 font-semibold">Review:</span> "{review}"
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-800">
                    <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Tiada produk sepadan dengan carian anda.</p>
                    <p className="text-xs text-slate-500 mt-1">Cuba laraskan kata kunci carian atau penapis jenama.</p>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TAB 2: OUTPUT LIBRARY (SEMAKAN, EDITING, & KELULUSAN SKRIP)
                ======================================================== */}
            {activeTab === 'library' && (
              <div className="space-y-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-medium text-slate-400">Status:</span>
                    {['ALL', 'Draft', 'Approved', 'Posted'].map((status) => (
                      <button key={status} onClick={() => setLibraryFilterStatus(status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${libraryFilterStatus === status ? 'bg-blue-600 text-white' : 'bg-slate-700/60 text-slate-400 hover:text-white'}`}>
                        {status === 'ALL' ? 'Semua' : status}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)}
                      placeholder="Cari Video ID, produk, headline..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-200">
                  <Film className="h-4 w-4 text-slate-400" />
                  SENARAI VIDEO KANDUNGAN
                  <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs text-slate-300">{filteredLibrary.length} VIDEO</span>
                </div>

                <div className="space-y-3">
                  {filteredLibrary.map((item, idx) => {
                    const videoId = item['Video_ID'] || `VID-${idx}`;
                    const productId = item['Product_ID'] || '-';
                    const product = products.find((p) => String(p['Product ID'] || p['id'] || '') === String(productId));
                    const productName = product?.['Produk_Name'] || product?.['Produk_Name_Full'] || product?.['name'] || productId;
                    const headline = item['Headline'] || 'Headline belum diisi';
                    const script = item['Final_Script'] || item['Script'] || '';
                    const status = item['Status'] || 'Draft';
                    const words = getWordCount(script);
                    const qaPass = words >= 120 && words <= 140;
                    const statusClass = status === 'Posted' ? 'bg-purple-100 text-purple-700' : status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700';
                    const isUpdating = updatingId === videoId;
                    return (
                      <article key={videoId} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded bg-slate-700 px-2 py-1 font-mono font-semibold text-slate-100">{videoId}</span>
                              <span className="rounded-full bg-slate-700/70 px-2.5 py-1 text-slate-300">{productId}</span>
                              <span className="text-slate-400">• {item['Hook_Type'] || 'Video'} – {productName}</span>
                            </div>
                            <h3 className="font-semibold leading-snug text-slate-100">{headline}</h3>
                            <p className="line-clamp-1 text-sm italic text-slate-400">{item['Hook'] || item['Subheadline'] || script || 'Belum ada preview kandungan.'}</p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item['Created_At'] || 'Tarikh tidak tersedia'}</span>
                              <span className={`rounded border px-2 py-0.5 font-semibold ${qaPass ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>QA: {qaPass ? 'PASS' : `${words} perkataan`}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                            <button onClick={() => handleCopyAction(`vo-${videoId}`, script)} disabled={!script}
                              className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-40">
                              {copiedKey === `vo-${videoId}` ? 'Disalin!' : 'Salin VO'}
                            </button>
                            <select value={status} onChange={(e) => handleStatusChange(item, e.target.value)} disabled={isUpdating}
                              className={`rounded-lg border px-2.5 py-2 text-xs font-semibold ${statusClass}`}>
                              <option value="Draft">Draft</option><option value="Approved">Approved</option><option value="Posted">Posted</option>
                            </select>
                            <button onClick={() => openLibraryEditor(item)}
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold tracking-wide text-white hover:bg-blue-700">
                              BUKA <span aria-hidden="true">→</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {filteredLibrary.length === 0 && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/40 py-16 text-center">
                    <Film className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                    <p className="font-medium text-slate-300">Tiada video sepadan dengan carian.</p>
                  </div>
                )}

                {editorDraft && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="editor-title">
                    <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
                        <div><h2 id="editor-title" className="font-semibold text-white">Edit {editorDraft['Video_ID']}</h2><p className="mt-1 text-xs text-slate-400">Perubahan disimpan ke Google Sheets.</p></div>
                        <button onClick={() => setEditorDraft(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Tutup"><X className="h-5 w-5" /></button>
                      </div>
                      <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-2">
                        {[
                          ['Headline', 'Headline', 'text'], ['Subheadline', 'Subheadline', 'text'],
                          ['Hook_Type', 'Jenis Hook', 'text'], ['Angle', 'Angle', 'text'],
                          ['Hook', 'Hook / ayat pembuka', 'textarea'], ['Final_Script', 'Skrip Voice-Over', 'textarea'],
                          ['Caption', 'Caption', 'textarea'], ['Hashtags', 'Hashtags', 'textarea'],
                        ].map(([field, label, type]) => (
                          <label key={field} className={`space-y-1.5 text-xs font-medium text-slate-300 ${type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                            <span>{label}</span>
                            {type === 'textarea' ? (
                              <textarea value={editorDraft[field] || ''} onChange={(e) => setEditorDraft((prev) => ({ ...prev, [field]: e.target.value }))} rows={field === 'Final_Script' ? 8 : 3}
                                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-relaxed text-slate-100 focus:border-blue-500 focus:outline-none" />
                            ) : (
                              <input value={editorDraft[field] || ''} onChange={(e) => setEditorDraft((prev) => ({ ...prev, [field]: e.target.value }))}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none" />
                            )}
                          </label>
                        ))}
                        <label className="space-y-1.5 text-xs font-medium text-slate-300">
                          <span>Status</span>
                          <select value={editorDraft.Status || 'Draft'} onChange={(e) => setEditorDraft((prev) => ({ ...prev, Status: e.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                            <option>Draft</option><option>Approved</option><option>Posted</option>
                          </select>
                        </label>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-slate-700 px-5 py-4">
                        <button onClick={() => setEditorDraft(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Batal</button>
                        <button onClick={handleSaveLibraryEditor} disabled={Boolean(updatingId)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
                          {updatingId ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Simpan perubahan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TAB 3: PERATURAN LALAI V3 (11 SCRIPT RULES VIEWER)
                ======================================================== */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
                  <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-2">Garis Panduan & Peraturan Skrip V3</h2>
                    <p className="text-sm text-slate-400">
                      Standard penulisan skrip TikTok Affiliate bagi memastikan kadar tontonan (retention rate) tinggi,
                      mengelakkan penalti algoritma, dan memaksimumkan kadar klik-masuk ke Beg Kuning.
                    </p>
                  </div>
                </div>

                {/* Rules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(rules.length > 0 ? rules : DEFAULT_V3_RULES).map((rule, idx) => {
                    const ruleNo = rule['Rule_No'] || rule['no'] || idx + 1;
                    const ruleName = rule['Rule_Name'] || rule['name'] || `Peraturan ${ruleNo}`;
                    const ruleDesc = rule['Rule_Description'] || rule['desc'] || rule['Description'] || '';

                    return (
                      <div
                        key={ruleNo}
                        className="bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 rounded-2xl p-5 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                            #{ruleNo}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-white">{ruleName}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{ruleDesc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hooks Library Reference Accordion */}
                <div className="mt-8 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Pustaka Hook Siap Sedia (Hooks Library - {hooks.length} Pola)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {hooks.slice(0, 9).map((h, index) => {
                      const hookType = h['Hook_Type'] || 'General';
                      const hookText = h['Hook_Text'] || h['Hook'] || '';
                      return (
                        <div
                          key={index}
                          className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1"
                        >
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                            {hookType}
                          </span>
                          <p className="text-slate-300 italic">"{hookText}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================
          MODAL POPUP: ARAHAN TASK EJEN V3 (RINGKAS & PADAT)
          ======================================================== */}
      {}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Arahan Task Ejen V3</h3>
                  <p className="text-xs text-slate-400">
                    Format ringkas (Product ID sahaja untuk Dav &amp; Tara V3)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="text-xs text-slate-300 bg-blue-950/30 border border-blue-800/50 rounded-xl p-3 flex items-start gap-2.5">
                <Bot className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Arahan ini telah diringkaskan. Dav V3 dan Tara V3 akan membaca butiran produk secara automatik daripada Google Sheets.
                </span>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={generatedPromptText}
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none selection:bg-blue-600"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/40 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Pilih <span className="font-semibold text-blue-400">{selectedProductIds.size}</span> Product ID
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={handleCopyGeneratedPrompt}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition active:scale-95"
                >
                  {isPromptCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span className="text-emerald-200">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Arahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>TikTok Affiliate Content Factory &copy; Siri V3 &bull; REST API Google Sheets Sync</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Google Apps Script Terhubung
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DEFAULT_V3_RULES = [
  {
    Rule_No: 1,
    Rule_Name: 'Formula Hook 3-Saat Pertama',
    Rule_Description: 'Wajib menghentikan skrol dalam masa 1-3 saat dengan visual disruptif atau soalan provokatif berkaitan masalah harian.'
  },
  {
    Rule_No: 2,
    Rule_Name: 'Elak Ayat Jualan Murahan',
    Rule_Description: 'Jangan mulakan video dengan "Hai guys hari ni saya nak jual...", sebaliknya fokus kepada situasi masalah sebenar audiens.'
  },
  {
    Rule_No: 3,
    Rule_Name: 'Struktur Cerita P.A.S',
    Rule_Description: 'Problem (Masalah), Agitate (Beri emosi/tekanan akibat masalah tersebut), Solution (Perkenalkan produk sebagai jalan keluar pantas).'
  },
  {
    Rule_No: 4,
    Rule_Name: 'Bahasa Santai & Mesra (Conversational)',
    Rule_Description: 'Gunakan laras bahasa harian rakyat Malaysia seperti "Korang", "Confirm", "Padu", tanpa jargon teknikal yang membosankan.'
  },
  {
    Rule_No: 5,
    Rule_Name: 'Tempoh Ideal 30-45 Saat',
    Rule_Description: 'Pengekalan perhatian paling optimum untuk affiliate adalah antara 30 hingga 45 saat sebelum audiens bosan.'
  },
  {
    Rule_No: 6,
    Rule_Name: 'Bukti Sosial (Social Proof)',
    Rule_Description: 'Wajib masukkan ulasan positif atau pengalaman peribadi untuk membina kepercayaan segera.'
  },
  {
    Rule_No: 7,
    Rule_Name: 'Panggilan Bertindak (CTA) Jelas',
    Rule_Description: 'Arahkan audiens secara khusus menekan ikon "Beg Kuning" di penjuru kiri bawah video.'
  },
  {
    Rule_No: 8,
    Rule_Name: 'Pematuhan Garis Panduan Komuniti',
    Rule_Description: 'Jangan buat tuntutan kesihatan melampau (overclaiming) atau perkataan terlarang seperti "Pasti 100% Sembuh".'
  },
  {
    Rule_No: 9,
    Rule_Name: 'Visual Text-on-Screen',
    Rule_Description: 'Pastikan teks sari kata atau tajuk penting berada dalam zon selamat (elak tertutup dengan butang like/komen TikTok).'
  },
  {
    Rule_No: 10,
    Rule_Name: 'Variasi Hook A/B Testing',
    Rule_Description: 'Gunakan satu skrip asas tetapi buat sekurang-kurangnya 3 variasi hook permulaan berbeza untuk menguji algoritma.'
  },
  {
    Rule_No: 11,
    Rule_Name: 'Tagar Relevan & Bersasar',
    Rule_Description: 'Gunakan 3-5 hashtag berkaitan niche produk, jenama rasmi, dan kempen trending semasa sahaja.'
  }
];
