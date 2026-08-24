"use client";

import React, { useState, useEffect } from "react";
import { 
  Palette, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Upload, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Store,
  Layout,
  Sliders,
  Navigation,
  Tag
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { storageService } from "@/services/storageService";
import { SliderImageItem, HomeHeroSliderItem } from "@/types";

const DEFAULT_HEADER_IMAGES: SliderImageItem[] = [
  {
    id: "default-1",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
    active: true,
    order: 1,
  },
  {
    id: "default-2",
    url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop",
    active: true,
    order: 2,
  },
  {
    id: "default-3",
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
    active: true,
    order: 3,
  },
];

const DEFAULT_HOME_HERO_SLIDERS: HomeHeroSliderItem[] = [
  {
    id: "hero-1",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
    title: "FLAT 50% OFF ON FIRST ORDER",
    description: "Taste the finest handcrafted artisanal pizzas in town",
    buttonText: "Order Now",
    actionType: "ORDER_NOW",
    active: true,
    order: 1,
  },
  {
    id: "hero-2",
    url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop",
    title: "FAMILY COMBO SPECIAL SAVINGS",
    description: "Buy 2 Medium Pizzas & get 1 Garlic Bread + 2 Drinks Free",
    buttonText: "Explore Menu",
    actionType: "EXPLORE_MENU",
    active: true,
    order: 2,
  },
  {
    id: "hero-3",
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
    title: "CHEESY DELIGHT WEEKEND DEAL",
    description: "Flat ₹100 Cashback with Reward Points on all orders",
    buttonText: "Grab Deal",
    actionType: "GRAB_DEAL",
    active: true,
    order: 3,
  },
];

interface RestaurantThemeSettingsModuleProps {
  isAdminMode?: boolean;
}

export default function RestaurantThemeSettingsModule({ isAdminMode = false }: RestaurantThemeSettingsModuleProps) {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const updateBranch = useStore((state) => state.updateBranch);

  const [activeTab, setActiveTab] = useState<"HOME_HERO" | "HEADER_SLIDER">("HOME_HERO");

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isAdminMode ? branches[0]?.id || "" : user?.branchId || branches[0]?.id || ""
  );

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Header Slider State
  const [sliderImages, setSliderImages] = useState<SliderImageItem[]>([]);
  // Home Hero Slider State
  const [homeHeroSliders, setHomeHeroSliders] = useState<HomeHeroSliderItem[]>([]);

  const [uploadingIndex, setUploadingIndex] = useState<{ section: string; index: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeBranch) {
      if (activeBranch.sliderImages && activeBranch.sliderImages.length > 0) {
        setSliderImages(activeBranch.sliderImages);
      } else {
        setSliderImages(DEFAULT_HEADER_IMAGES);
      }

      if (activeBranch.homeHeroSliders && activeBranch.homeHeroSliders.length > 0) {
        setHomeHeroSliders(activeBranch.homeHeroSliders);
      } else {
        setHomeHeroSliders(DEFAULT_HOME_HERO_SLIDERS);
      }
    }
  }, [selectedBranchId, activeBranch]);

  // -------------------------------------------------------------
  // HOME HERO SLIDER HANDLERS
  // -------------------------------------------------------------
  const handleAddHeroSlider = () => {
    const newHero: HomeHeroSliderItem = {
      id: `hero_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
      title: "NEW PROMOTIONAL OFFER",
      description: "Exclusive discount on delicious food",
      buttonText: "Order Now",
      actionType: "ORDER_NOW",
      targetBranchId: activeBranch?.id || "",
      targetRestaurantId: activeBranch?.restaurantId || activeBranch?.id || "",
      active: true,
      order: homeHeroSliders.length + 1,
    };
    setHomeHeroSliders([...homeHeroSliders, newHero]);
  };

  const handleUpdateHeroItem = (index: number, field: keyof HomeHeroSliderItem, value: any) => {
    const updated = [...homeHeroSliders];
    updated[index] = { ...updated[index], [field]: value };
    setHomeHeroSliders(updated);
  };

  const handleToggleHeroActive = (index: number) => {
    const updated = [...homeHeroSliders];
    updated[index].active = !updated[index].active;
    setHomeHeroSliders(updated);
  };

  const handleDeleteHero = (index: number) => {
    if (homeHeroSliders.length <= 1) {
      alert("You must keep at least 1 Home Hero slider.");
      return;
    }
    const updated = homeHeroSliders.filter((_, i) => i !== index);
    setHomeHeroSliders(updated);
  };

  const handleMoveHeroUp = (index: number) => {
    if (index === 0) return;
    const updated = [...homeHeroSliders];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setHomeHeroSliders(updated);
  };

  const handleMoveHeroDown = (index: number) => {
    if (index === homeHeroSliders.length - 1) return;
    const updated = [...homeHeroSliders];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setHomeHeroSliders(updated);
  };

  // -------------------------------------------------------------
  // RESTAURANT HEADER SLIDER HANDLERS
  // -------------------------------------------------------------
  const handleAddHeaderImage = () => {
    const newImage: SliderImageItem = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
      active: true,
      order: sliderImages.length + 1,
    };
    setSliderImages([...sliderImages, newImage]);
  };

  const handleToggleHeaderActive = (index: number) => {
    const updated = [...sliderImages];
    updated[index].active = !updated[index].active;
    setSliderImages(updated);
  };

  const handleDeleteHeader = (index: number) => {
    if (sliderImages.length <= 1) {
      alert("You must keep at least 1 image slide.");
      return;
    }
    const updated = sliderImages.filter((_, i) => i !== index);
    setSliderImages(updated);
  };

  const handleMoveHeaderUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sliderImages];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSliderImages(updated);
  };

  const handleMoveHeaderDown = (index: number) => {
    if (index === sliderImages.length - 1) return;
    const updated = [...sliderImages];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSliderImages(updated);
  };

  // -------------------------------------------------------------
  // FILE UPLOADS & SAVE
  // -------------------------------------------------------------
  const handleFileUpload = async (section: "HEADER" | "HERO", index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex({ section, index });
      const downloadUrl = await storageService.uploadImage(file, section === "HERO" ? "hero_sliders" : "slider_images");
      if (downloadUrl) {
        if (section === "HERO") {
          handleUpdateHeroItem(index, "url", downloadUrl);
        } else {
          const updated = [...sliderImages];
          updated[index].url = downloadUrl;
          setSliderImages(updated);
        }
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm("Reset theme settings to original Perfect Pizza defaults?")) {
      setSliderImages(DEFAULT_HEADER_IMAGES);
      setHomeHeroSliders(DEFAULT_HOME_HERO_SLIDERS);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch) return;

    try {
      setIsSaving(true);

      const reorderedHeaderImages = sliderImages.map((img, idx) => ({
        ...img,
        order: idx + 1,
      }));

      const reorderedHomeHeroes = homeHeroSliders.map((hero, idx) => ({
        ...hero,
        order: idx + 1,
        targetBranchId: hero.targetBranchId || activeBranch.id,
        targetRestaurantId: hero.targetRestaurantId || activeBranch.restaurantId || activeBranch.id,
      }));

      await updateBranch(activeBranch.id, {
        sliderImages: reorderedHeaderImages,
        homeHeroSliders: reorderedHomeHeroes,
        bannerUrl: reorderedHeaderImages.find((img) => img.active)?.url || reorderedHeaderImages[0]?.url || activeBranch.bannerUrl,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save theme error:", err);
      alert("Failed to save theme settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeHeroCount = homeHeroSliders.filter((h) => h.active).length;
  const activeHeaderCount = sliderImages.filter((img) => img.active).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Palette className="w-6 h-6 text-amber-600" /> Restaurant Theme Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage dynamic Home Page Hero Sliders, Header Carousels & Visual Branding ({activeBranch?.name})
        </p>
      </div>

      {/* Admin Branch Selector */}
      {isAdminMode && branches.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <Store className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Outlet / Branch</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.restaurantName ? `${b.restaurantName} - ${b.name}` : b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("HOME_HERO")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "HOME_HERO"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" /> Home Page Hero Slider ({activeHeroCount} Active)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("HEADER_SLIDER")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "HEADER_SLIDER"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Layout className="w-4 h-4" /> Restaurant Header Carousel ({activeHeaderCount} Active)
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Theme settings saved successfully! Customer app updated in real-time.
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* ========================================================= */}
        {/* TAB 1: HOME PAGE HERO SLIDERS */}
        {/* ========================================================= */}
        {activeTab === "HOME_HERO" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Home Page Hero Banners ({activeHeroCount} Active / {homeHeroSliders.length} Total)
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Configure titles, images, descriptions, button text & action destinations for Home Page hero cards.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddHeroSlider}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Hero Banner Card
                </button>
              </div>
            </div>

            {/* List of Home Hero Cards */}
            <div className="space-y-5">
              {homeHeroSliders.map((hero, index) => (
                <div
                  key={hero.id || index}
                  className={`p-5 border rounded-2xl transition-all space-y-4 ${
                    hero.active ? "bg-slate-50/50 border-slate-200" : "bg-slate-100/50 border-slate-200/60 opacity-65"
                  }`}
                >
                  {/* Top Bar: Card Header & Actions */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-black rounded-lg">
                        HERO SLIDER #{index + 1}
                      </span>
                      {hero.active && (
                        <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Live on Home
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Active Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleHeroActive(index)}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                          hero.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {hero.active ? "ENABLED" : "DISABLED"}
                      </button>

                      {/* Move Up / Move Down */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveHeroUp(index)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-200"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === homeHeroSliders.length - 1}
                        onClick={() => handleMoveHeroDown(index)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-200"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteHero(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Form Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Image Preview & Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Banner Image</label>
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                        {hero.url ? (
                          <img src={hero.url} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={hero.url}
                          onChange={(e) => handleUpdateHeroItem(index, "url", e.target.value)}
                          placeholder="https://..."
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0">
                          {uploadingIndex?.section === "HERO" && uploadingIndex.index === index ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("HERO", index, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Column 2: Title & Description */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Banner Main Title</label>
                        <input
                          type="text"
                          value={hero.title}
                          onChange={(e) => handleUpdateHeroItem(index, "title", e.target.value)}
                          placeholder="e.g. FLAT 50% OFF ON FIRST ORDER"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description / Subtitle</label>
                        <textarea
                          rows={2}
                          value={hero.description}
                          onChange={(e) => handleUpdateHeroItem(index, "description", e.target.value)}
                          placeholder="e.g. Taste the finest handcrafted artisanal pizzas"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs resize-none"
                        />
                      </div>
                    </div>

                    {/* Column 3: Button Text, Action Type & Destination */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                        <input
                          type="text"
                          value={hero.buttonText}
                          onChange={(e) => handleUpdateHeroItem(index, "buttonText", e.target.value)}
                          placeholder="e.g. Order Now / Explore Menu / Grab Deal"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-amber-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-amber-600" /> Button Action Type
                        </label>
                        <select
                          value={hero.actionType}
                          onChange={(e) => handleUpdateHeroItem(index, "actionType", e.target.value as any)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          <option value="ORDER_NOW">Order Now (Navigate to Restaurant Details)</option>
                          <option value="EXPLORE_MENU">Explore Menu (Navigate to Menu Screen)</option>
                          <option value="GRAB_DEAL">Grab Deal (Navigate to Offers / Deals Context)</option>
                        </select>
                      </div>

                      {/* Destination Branch / Restaurant Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-amber-600" /> Target Outlet / Restaurant
                        </label>
                        <select
                          value={hero.targetBranchId || activeBranch?.id || ""}
                          onChange={(e) => {
                            const bId = e.target.value;
                            const targetB = branches.find((b) => b.id === bId);
                            handleUpdateHeroItem(index, "targetBranchId", bId);
                            handleUpdateHeroItem(index, "targetRestaurantId", targetB?.restaurantId || bId);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.restaurantName ? `${b.restaurantName} (${b.name})` : b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RESTAURANT HEADER SLIDERS */}
        {/* ========================================================= */}
        {activeTab === "HEADER_SLIDER" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Restaurant Details Header Carousel ({activeHeaderCount} Active / {sliderImages.length} Total)
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The first active image automatically becomes the primary card image on the Customer Home page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddHeaderImage}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Header Image
                </button>
              </div>
            </div>

            {/* Image Cards List */}
            <div className="space-y-4">
              {sliderImages.map((image, index) => (
                <div
                  key={image.id || index}
                  className={`p-4 border rounded-2xl transition-all ${
                    image.active ? "bg-slate-50/50 border-slate-200" : "bg-slate-100/50 border-slate-200/60 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Image Preview */}
                    <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      {image.url ? (
                        <img src={image.url} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      {index === 0 && image.active && (
                        <span className="absolute top-1 left-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md shadow">
                          HOME PAGE CARD
                        </span>
                      )}
                    </div>

                    {/* Controls & Inputs */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Header Slide #{index + 1}</span>
                        <div className="flex items-center gap-1">
                          {/* Active Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleHeaderActive(index)}
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                              image.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {image.active ? "ACTIVE" : "DISABLED"}
                          </button>

                          {/* Move Up / Move Down */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveHeaderUp(index)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-200"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sliderImages.length - 1}
                            onClick={() => handleMoveHeaderDown(index)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-200"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteHeader(index)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* URL Input & File Upload Button */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={image.url}
                          onChange={(e) => {
                            const updated = [...sliderImages];
                            updated[index].url = e.target.value;
                            setSliderImages(updated);
                          }}
                          placeholder="https://..."
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0">
                          {uploadingIndex?.section === "HEADER" && uploadingIndex.index === index ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("HEADER", index, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Theme Settings...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Save Theme Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
