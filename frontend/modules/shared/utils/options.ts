import { CATEGORY_STYLES, PROJECT_STATUS_STYLES } from "../config/status.config";


export const CATEGORY_OPTIONS = Object.entries(CATEGORY_STYLES).map(
  ([value, { label }]) => ({ value, label })
);

export const STATUS_OPTIONS = Object.entries(PROJECT_STATUS_STYLES).map(
  ([value, { label }]) => ({ value, label })
);