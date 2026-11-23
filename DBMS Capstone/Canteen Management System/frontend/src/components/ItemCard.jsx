import { rupees } from "../data.js";
import VegDot from "./VegDot.jsx";
import FoodImage from "./FoodImage.jsx";

// One menu item: photo, name, price and the Add / quantity button
export default function ItemCard({ item, qty, setQty, popular }) {
  return (
    <article className={"item " + (item.available ? "" : "off")}>
      <div className="photo">
        <FoodImage key={item.item_id + (item.image || "")} item={item} />
        {popular && item.available && <span className="pop">Popular</span>}
        {!item.available && <span className="pop sold">Sold out</span>}
      </div>
      <div className="item-body">
        <span className="item-cat">{item.category_name}</span>
        <h3><VegDot veg={item.is_veg} />{item.name}</h3>
        <div className="item-foot">
          <span className="price">{rupees(item.price)}</span>
          {!item.available ? null : qty === 0 ? (
            <button className="btn small" onClick={() => setQty(item.item_id, 1)}>Add</button>
          ) : (
            <div className="stepper">
              <button onClick={() => setQty(item.item_id, qty - 1)} aria-label="Remove one">−</button>
              <b>{qty}</b>
              <button onClick={() => setQty(item.item_id, qty + 1)} aria-label="Add one">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
