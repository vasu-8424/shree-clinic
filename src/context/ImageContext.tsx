import React, { createContext, useContext, useState, useEffect } from 'react';

// Default initial fallbacks
export const DEFAULT_WEBSITE_IMAGES: Record<string, string> = {
  hero_image: '/images/hero-clinic-room.jpg',
  clinic_facility_reception: '/images/clinic-facility-reception.jpg',
  hearing_aid_fitting: '/images/hearing-aid-fitting.jpg',
  speech_pediatric_therapy: '/images/speech-pediatric-therapy.png',
  speech_adult_therapy: '/images/speech-adult-therapy.png',
  vitalstim_swallowing: '/images/vitalstim-swallowing-therapy.png',
  audiology_soundproof_booth: '/images/audiology-soundproof-booth.png',
  audiology_middle_ear: '/images/audiology-middle-ear-exam.jpg',
  audiology_pediatric_screening: '/images/audiology-pediatric-screening.jpg',
  audiology_digital_hearing_aids: '/images/audiology-digital-hearing-aids.jpg',
  audiology_tinnitus_consultation: '/images/audiology-tinnitus-consultation.jpg',
  physiotherapy_clinic_rehab: '/images/physiotherapy-clinic-rehab.jpg',
  shree_logo: '/shree-logo.png',
};

// Automatic path to key mapping
export const PATH_TO_KEY: Record<string, string> = {
  '/images/hero-clinic-room.jpg': 'hero_image',
  '/images/clinic-facility-reception.jpg': 'clinic_facility_reception',
  '/images/hearing-aid-fitting.jpg': 'hearing_aid_fitting',
  '/images/speech-pediatric-therapy.png': 'speech_pediatric_therapy',
  '/images/speech-adult-therapy.png': 'speech_adult_therapy',
  '/images/vitalstim-swallowing-therapy.png': 'vitalstim_swallowing',
  '/images/vitalstim-swallowing-therapy.jpg': 'vitalstim_swallowing',
  '/images/audiology-soundproof-booth.png': 'audiology_soundproof_booth',
  '/images/audiology-middle-ear-exam.jpg': 'audiology_middle_ear',
  '/images/audiology-pediatric-screening.jpg': 'audiology_pediatric_screening',
  '/images/audiology-digital-hearing-aids.jpg': 'audiology_digital_hearing_aids',
  '/images/audiology-tinnitus-consultation.jpg': 'audiology_tinnitus_consultation',
  '/images/physiotherapy-clinic-rehab.jpg': 'physiotherapy_clinic_rehab',
  '/shree-logo.png': 'shree_logo',
};

interface ImageContextType {
  images: Record<string, string>;
  getImage: (key: string, fallback?: string) => string;
  resolveImageUrl: (pathOrKey: string) => string;
  refreshImages: () => Promise<void>;
  setImageOverride: (key: string, url: string) => void;
  isLoading: boolean;
}

const ImageContext = createContext<ImageContextType>({
  images: DEFAULT_WEBSITE_IMAGES,
  getImage: (key: string, fallback?: string) => fallback || DEFAULT_WEBSITE_IMAGES[key] || '',
  resolveImageUrl: (p: string) => p,
  refreshImages: async () => {},
  setImageOverride: () => {},
  isLoading: false,
});

const STORAGE_KEY = 'shree_clinic_website_images_cache';

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_WEBSITE_IMAGES, ...JSON.parse(cached) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_WEBSITE_IMAGES;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchImagesFromApi = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/images');
      if (res.ok) {
        const data = await res.json();
        if (data.map && typeof data.map === 'object') {
          const merged = { ...DEFAULT_WEBSITE_IMAGES, ...data.map };
          setImages(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore quota errors
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch dynamic images from server, using local cache/defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesFromApi();
  }, []);

  const getImage = (key: string, fallback?: string): string => {
    return images[key] || fallback || DEFAULT_WEBSITE_IMAGES[key] || '';
  };

  const resolveImageUrl = (pathOrKey: string): string => {
    if (!pathOrKey) return '';
    // If it's directly a key in images
    if (images[pathOrKey]) {
      return images[pathOrKey];
    }
    // If it's a known static path
    const key = PATH_TO_KEY[pathOrKey];
    if (key && images[key]) {
      return images[key];
    }
    return pathOrKey;
  };

  const setImageOverride = (key: string, url: string) => {
    setImages((prev) => {
      const next = { ...prev, [key]: url };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <ImageContext.Provider
      value={{
        images,
        getImage,
        resolveImageUrl,
        refreshImages: fetchImagesFromApi,
        setImageOverride,
        isLoading,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useWebsiteImages = () => useContext(ImageContext);
