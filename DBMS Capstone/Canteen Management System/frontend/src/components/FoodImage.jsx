import { useState } from "react";
import { CATEGORY_ICONS } from "../data.js";

// Shows the photo; if there is none (or it fails to load) shows a soft icon tile instead
export default function FoodImage({ item }) {
  const [failed, setFailed] = useState(false);
  if (!item.image || failed) {
    return <span className="fallback">{CATEGORY_ICONS[item.category_id] || "🍽️"}</span>;
  }
  return <img src={item.image} alt={item.name} loading="lazy" onError={() => setFailed(true)} />;
}
