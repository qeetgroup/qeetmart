import {
  readPersonalizationProfile,
  writePersonalizationProfile,
  trackCategoryBrowse,
  trackProductView,
  trackCartAddition,
} from "@/lib/personalization/profile-engine";

export const personalizationRepository = {
  readProfile: readPersonalizationProfile,
  writeProfile: writePersonalizationProfile,
  trackCategoryBrowse,
  trackProductView,
  trackCartAddition,
};
