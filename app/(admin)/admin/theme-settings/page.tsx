"use client";

import React from "react";
import RestaurantThemeSettingsModule from "@/components/theme/RestaurantThemeSettingsModule";

export default function AdminThemeSettingsPage() {
  return <RestaurantThemeSettingsModule isAdminMode={true} />;
}
