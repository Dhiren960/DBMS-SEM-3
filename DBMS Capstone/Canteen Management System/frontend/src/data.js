// Small constants used by the UI. The menu, orders and users come from the API (MySQL database).

export const ORDER_STATUSES = ["Placed", "Preparing", "Ready", "Collected"];
export const PAYMENT_MODES = ["UPI", "Cash", "Card"];

// Shown when an item has no photo
export const CATEGORY_ICONS = { 1: "🥪", 2: "🍝", 3: "🧀", 4: "🥤", 5: "🍹", 6: "🍨" };

// Photo used on each category tile on the home page
export const CATEGORY_PHOTOS = {
  1: "/images/veg-burger.jpg",
  2: "/images/white-sauce-pasta.jpg",
  3: "/images/cheese-pizza.jpg",
  4: "/images/oreo-shake.jpg",
  5: "/images/orange-juice.jpg",
  6: "/images/oreo-shake-with-ice-cream.jpg",
};

export const HERO_PHOTOS = [
  "/images/cheese-pizza.jpg",
  "/images/cheese-burst-burger.jpg",
  "/images/oreo-shake.jpg",
  "/images/brownie.jpg",
];

// Items shown in "Popular right now" (by name)
export const POPULAR = ["Cheese Pizza", "Cheese Burst Burger", "Oreo Shake", "Brownie", "White Sauce Pasta", "Cold Coffee", "Veg Burger", "Mix Veg Grilled Sandwich"];

export const rupees = (n) => "₹" + n;
