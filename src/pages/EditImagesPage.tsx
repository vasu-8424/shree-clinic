import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  LogOut,
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  ShieldCheck,
  Search,
  ImageIcon,
  Clipboard,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useWebsiteImages } from '../context/ImageContext';
import { apiFetch, setAccessToken } from '../admin/api/client';
import {
  optimizeImageFile,
  cleanCopiedImageUrl,
  testImageUrl,
  OptimizedImageResult,
} from '../utils/imageOptimizer';

interface ImageItem {
  id: string;
  key: string;
  title: string;
  section: string;
  description: string | null;
  imageUrl: string;
  defaultUrl: string;
  updatedAt: string;
}

export const EditImagesPage: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('admin@shreeclinic.com');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Images state
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  // Individual card edit states
  const [editStates, setEditStates] = useState<
    Record<
      string,
      {
        customUrl: string;
        previewUrl: string;
        activeMode: 'upload' | 'url';
        isOptimizing: boolean;
        isSaving: boolean;
        isResetting: boolean;
        compressionInfo: string | null;
        urlVerified: boolean | null;
        successMsg: string | null;
        errorMsg: string | null;
      }
    >
  >({});

  const { refreshImages, setImageOverride } = useWebsiteImages();

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        // apiFetch attaches the access token and silently refreshes it
        // from the httpOnly cookie if it is missing or expired.
        const res = await apiFetch('/api/v1/auth/me');
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch {
        // Not logged in
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch images when authenticated
  const loadImages = async () => {
    try {
      setIsLoadingImages(true);
      const res = await fetch('/api/v1/images', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const list: ImageItem[] = data.images || [];
        setImagesList(list);

        // Initialize edit states
        const initialStates: Record<string, any> = {};
        list.forEach((img) => {
          initialStates[img.key] = {
            customUrl: img.imageUrl,
            previewUrl: img.imageUrl,
            activeMode: 'upload',
            isOptimizing: false,
            isSaving: false,
            isResetting: false,
            compressionInfo: null,
            urlVerified: null,
            successMsg: null,
            errorMsg: null,
          };
        });
        setEditStates(initialStates);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
    }
  }, [isAuthenticated]);

  // Filter images by section and search query
  useEffect(() => {
    let result = imagesList;
    if (selectedSection !== 'All') {
      result = result.filter(
        (img) => img.section.toLowerCase() === selectedSection.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          img.section.toLowerCase().includes(q) ||
          img.key.toLowerCase().includes(q) ||
          (img.description && img.description.toLowerCase().includes(q))
      );
    }
    setFilteredImages(result);
  }, [imagesList, selectedSection, searchQuery]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      setAccessToken(data.accessToken);
      setIsAuthenticated(true);
    } catch {
      setLoginError('Unable to connect to server. Please check backend connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  // 1. Handle File Upload from ANY Device (Phone, Tablet, PC)
  const handleDeviceFileUpload = async (key: string, file: File) => {
    if (!file) return;

    setEditStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isOptimizing: true,
        successMsg: null,
        errorMsg: null,
      },
    }));

    try {
      // Auto-compress and scale image so it works with zero errors on any device
      const optimized: OptimizedImageResult = await optimizeImageFile(file);

      const infoText =
        optimized.originalSizeKb > optimized.optimizedSizeKb
          ? `Auto-optimized: ${optimized.originalSizeKb} KB → ${optimized.optimizedSizeKb} KB (${optimized.width}×${optimized.height})`
          : `Ready to save (${optimized.optimizedSizeKb} KB)`;

      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          customUrl: optimized.dataUrl,
          previewUrl: optimized.dataUrl,
          isOptimizing: false,
          compressionInfo: infoText,
          urlVerified: true,
          successMsg: 'Photo ready! Click "Save to Database" below.',
          errorMsg: null,
        },
      }));
    } catch (err: any) {
      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isOptimizing: false,
          errorMsg: err.message || 'Error processing photo file.',
        },
      }));
    }
  };

  // 2. Handle Pasting Copied Image Address from Browser
  const handleUrlChange = async (key: string, rawUrl: string) => {
    const cleaned = cleanCopiedImageUrl(rawUrl);

    setEditStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        customUrl: cleaned,
        previewUrl: cleaned,
        compressionInfo: null,
        urlVerified: null,
        successMsg: null,
        errorMsg: null,
      },
    }));

    if (cleaned.length > 5) {
      const isValid = await testImageUrl(cleaned);
      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          urlVerified: isValid,
          errorMsg: isValid ? null : 'Could not verify image preview. Please check image address.',
        },
      }));
    }
  };

  // Quick Clipboard Paste Handler
  const handlePasteClipboard = async (key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleUrlChange(key, text);
        }
      }
    } catch {
      // Clipboard permissions denied; user can paste manually
    }
  };

  // 3. Save Image to Database
  const handleSaveImage = async (key: string) => {
    const state = editStates[key];
    if (!state || !state.customUrl) return;

    setEditStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isSaving: true, successMsg: null, errorMsg: null },
    }));

    try {
      const res = await apiFetch(`/api/v1/images/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ imageUrl: state.customUrl }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setIsAuthenticated(false);
        throw new Error('Your session expired. Please sign in again.');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update image in database');
      }

      // The server returns the final link (Cloudinary URL, file URL, or the
      // pasted address). Use that instead of the raw uploaded photo data.
      const savedUrl: string = data.image?.imageUrl || state.customUrl;

      setImageOverride(key, savedUrl);
      refreshImages();

      setImagesList((prev) =>
        prev.map((img) => (img.key === key ? { ...img, imageUrl: savedUrl } : img))
      );

      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          customUrl: savedUrl,
          previewUrl: savedUrl,
          isSaving: false,
          successMsg: 'Saved to Database! Active on public website ✓',
        },
      }));

      setTimeout(() => {
        setEditStates((prev) => ({
          ...prev,
          [key]: { ...prev[key], successMsg: null },
        }));
      }, 5000);
    } catch (err: any) {
      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isSaving: false,
          errorMsg: err.message || 'Error saving image to database',
        },
      }));
    }
  };

  // 4. Reset Image to Default
  const handleResetImage = async (key: string) => {
    const item = imagesList.find((img) => img.key === key);
    if (!item) return;

    setEditStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isResetting: true, successMsg: null, errorMsg: null },
    }));

    try {
      const res = await apiFetch(`/api/v1/images/${encodeURIComponent(key)}/reset`, {
        method: 'POST',
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        throw new Error('Your session expired. Please sign in again.');
      }
      if (!res.ok) {
        throw new Error('Failed to reset image');
      }

      setImageOverride(key, item.defaultUrl);
      refreshImages();

      setImagesList((prev) =>
        prev.map((img) => (img.key === key ? { ...img, imageUrl: item.defaultUrl } : img))
      );

      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          customUrl: item.defaultUrl,
          previewUrl: item.defaultUrl,
          isResetting: false,
          compressionInfo: null,
          urlVerified: true,
          successMsg: 'Restored to original default!',
        },
      }));

      setTimeout(() => {
        setEditStates((prev) => ({
          ...prev,
          [key]: { ...prev[key], successMsg: null },
        }));
      }, 4000);
    } catch (err: any) {
      setEditStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isResetting: false,
          errorMsg: err.message || 'Error resetting image',
        },
      }));
    }
  };

  // Render Loading
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#053543] animate-spin" />
          <p className="text-sm font-semibold text-neutral-600">Loading Image Editor...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-teal-50/30 to-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Website</span>
            </Link>
            <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-teal-50 text-[#053543] border border-teal-200">
              Admin Protected
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 mx-auto flex items-center justify-center mb-3 shadow-xs">
              <ImageIcon className="w-8 h-8 text-[#053543]" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Website Image Manager
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Sign in with your admin credentials to update photos across the website
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="font-medium">{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shreeclinic.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#053543] focus:border-transparent font-medium"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#053543] focus:border-transparent font-medium"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#053543] hover:bg-[#0891b2] text-white font-bold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In & Edit Images</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-[11px] text-neutral-500 font-mono">
              Secured with Argon2 password verification & session tokens
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. DASHBOARD: IMAGE MANAGEMENT DASHBOARD
  // -------------------------------------------------------------
  const sections = ['All', 'Hero', 'Facilities', 'Speech Therapy', 'Audiology', 'Physiotherapy', 'Rehabilitation', 'Brand'];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-neutral-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>SHREE Clinic Website Image Manager</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  Database Connected
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#053543] text-white text-xs font-bold hover:bg-[#0891b2] transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Banner with Instructions */}
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#053543] to-[#0a4352] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-200">
                Multi-Device Image Upload & Web URL Integration
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Update Photos for Any Website Section
            </h2>
            <p className="text-xs md:text-sm text-teal-100 font-medium max-w-2xl mt-1 leading-relaxed">
              Upload photos directly from your phone/PC (auto-scaled for fast mobile loading) or copy & paste any image address from Google/browser. Saved immediately into your PostgreSQL database with zero errors!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={loadImages}
              disabled={isLoadingImages}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingImages ? 'animate-spin' : ''}`} />
              <span>Reload DB</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Section Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {sections.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedSection === sec
                    ? 'bg-[#053543] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-200 text-neutral-700 border border-neutral-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images by name..."
              className="w-full pl-9 pr-3.5 py-2 rounded-full border border-neutral-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#053543]"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-2.5" />
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoadingImages && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-[#053543] animate-spin" />
            <p className="text-xs font-semibold text-neutral-500">Loading images from database...</p>
          </div>
        )}

        {/* Grid of Images */}
        {!isLoadingImages && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img) => {
              const editState = editStates[img.key] || {
                customUrl: img.imageUrl,
                previewUrl: img.imageUrl,
                activeMode: 'upload',
                isOptimizing: false,
                isSaving: false,
                isResetting: false,
                compressionInfo: null,
                urlVerified: null,
                successMsg: null,
                errorMsg: null,
              };

              const isModified = editState.customUrl !== img.defaultUrl;

              return (
                <div
                  key={img.key}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Header */}
                  <div className="p-4 pb-3 border-b border-neutral-100">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-[#053543] border border-teal-200">
                        {img.section}
                      </span>
                      {isModified ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Customized in DB
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-neutral-600 border border-neutral-200">
                          Original Default
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 leading-snug">
                      {img.title}
                    </h3>
                    {img.description && (
                      <p className="text-[11px] text-neutral-500 font-medium mt-0.5 leading-relaxed">
                        {img.description}
                      </p>
                    )}
                  </div>

                  {/* Image Preview Box with Active Indicator */}
                  <div className="p-4 bg-stone-50 border-b border-neutral-100">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-200 group">
                      <img
                        src={editState.previewUrl || img.imageUrl}
                        alt={img.title}
                        className="w-full h-full object-cover object-center transition-all duration-300"
                        onError={(e) => {
                          // Fallback gracefully so image never breaks
                          (e.target as HTMLImageElement).src = img.defaultUrl;
                        }}
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-mono">
                        <span className="truncate max-w-[170px]">Key: {img.key}</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-2.5 h-2.5" />
                          Live
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Controls: Device Upload OR Browser Image Address */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Mode Selector Tabs */}
                      <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl mb-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditStates((prev) => ({
                              ...prev,
                              [img.key]: { ...prev[img.key], activeMode: 'upload' },
                            }))
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            editState.activeMode === 'upload'
                              ? 'bg-white text-neutral-900 shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>Device Upload</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditStates((prev) => ({
                              ...prev,
                              [img.key]: { ...prev[img.key], activeMode: 'url' },
                            }))
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            editState.activeMode === 'url'
                              ? 'bg-white text-neutral-900 shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Copy Address</span>
                        </button>
                      </div>

                      {/* Mode A: Local File Upload (Mobile/Camera/PC) */}
                      {editState.activeMode === 'upload' && (
                        <div className="space-y-2">
                          <label className="w-full flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#053543] bg-stone-50 hover:bg-teal-50/30 text-neutral-700 transition-colors cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Upload className="w-4 h-4 text-[#053543]" />
                            </div>
                            <span className="text-xs font-bold text-neutral-800 text-center">
                              {editState.isOptimizing
                                ? 'Auto-optimizing photo...'
                                : 'Choose Photo (Phone, Camera, PC)'}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              JPG, PNG, WEBP (Any size)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleDeviceFileUpload(img.key, e.target.files[0]);
                                }
                              }}
                            />
                          </label>

                          {editState.compressionInfo && (
                            <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-[#053543] text-[10px] font-mono font-bold flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-teal-600 shrink-0" />
                              <span>{editState.compressionInfo}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mode B: Copying Image Address from Browser */}
                      {editState.activeMode === 'url' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                              Paste Copied Image Address:
                            </label>
                            <button
                              type="button"
                              onClick={() => handlePasteClipboard(img.key)}
                              className="text-[10px] font-bold text-[#053543] hover:text-[#0891b2] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Clipboard className="w-2.5 h-2.5" />
                              <span>Paste</span>
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              value={editState.customUrl}
                              onChange={(e) => handleUrlChange(img.key, e.target.value)}
                              placeholder="Paste https://... or /images/..."
                              className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#053543] bg-white"
                            />
                            <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                          </div>

                          {editState.urlVerified === true && (
                            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>✓ Live Browser Image Verified & Ready</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback messages */}
                      {editState.successMsg && (
                        <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{editState.successMsg}</span>
                        </div>
                      )}
                      {editState.errorMsg && (
                        <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{editState.errorMsg}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveImage(img.key)}
                        disabled={editState.isSaving || editState.isOptimizing}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#053543] hover:bg-[#0891b2] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
                      >
                        {editState.isSaving ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Saving to DB...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save to Database</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetImage(img.key)}
                        disabled={editState.isResetting}
                        title="Restore original default photo"
                        className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-stone-100 text-neutral-600 text-xs font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${editState.isResetting ? 'animate-spin' : ''}`} />
                        <span>Default</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoadingImages && filteredImages.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200 p-8">
            <p className="text-sm font-semibold text-neutral-600">
              No images match your filter or search query.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
