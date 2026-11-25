interface ShapePickerProps {
  label: string;
  shapes: string[];
  isPicked: (shape: string) => boolean;
  onPick: (shape: string) => void;
}

// Small outline drawn next to each shape's name, by the name used in the
// backend's "shape" filters. A shape not listed here just shows its name.
const ShapeIcon = ({ shape }: { shape: string }) => {
  const base = "shrink-0 border-2 border-current";
  switch (shape.toLowerCase()) {
    case "round":
    case "circular":
      return <span aria-hidden="true" className={`${base} h-5 w-5 rounded-full`} />;
    case "square":
      return <span aria-hidden="true" className={`${base} h-5 w-5 rounded-[3px]`} />;
    case "edge":
      return <span aria-hidden="true" className={`${base} h-5 w-5`} />;
    case "rectangular":
      return <span aria-hidden="true" className={`${base} h-4 w-6 rounded-[3px]`} />;
    case "with side":
      return (
        <span aria-hidden="true" className={`${base} flex h-4 w-6 justify-end rounded-[3px]`}>
          <span className="h-full w-2 border-l-2 border-current" />
        </span>
      );
    case "with bidet":
      return (
        <span
          aria-hidden="true"
          className={`${base} flex h-5 w-5 items-center justify-center rounded-full`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      );
    default:
      return null;
  }
};

/** A category's shapes as pill buttons; a picked one is filled white. */
const ShapePicker = ({ label, shapes, isPicked, onPick }: ShapePickerProps) => (
  <div>
    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">{label}</h3>
    <div className="mt-3 flex flex-wrap gap-3">
      {shapes.map((shape) => {
        const active = isPicked(shape);
        return (
          <button
            key={shape}
            type="button"
            onClick={() => onPick(shape)}
            aria-pressed={active}
            className={`flex items-center gap-3 rounded-full border py-2 pl-3 pr-5 text-sm font-medium transition-colors ${
              active
                ? "border-white bg-white text-black"
                : "border-white/15 text-white hover:border-white/50"
            }`}
          >
            <ShapeIcon shape={shape} />
            {shape}
          </button>
        );
      })}
    </div>
  </div>
);

export default ShapePicker;
