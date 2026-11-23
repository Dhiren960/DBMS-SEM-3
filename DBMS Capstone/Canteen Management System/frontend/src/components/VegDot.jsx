export default function VegDot({ veg }) {
  return <span className={"dot " + (veg ? "" : "nonveg")} title={veg ? "Veg" : "Non-veg"}></span>;
}
