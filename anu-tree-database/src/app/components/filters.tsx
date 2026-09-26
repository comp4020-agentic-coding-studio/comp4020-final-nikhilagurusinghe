import ComboBox from "./combobox";

export default function Filters() {
  return (
    <div className="absolute h-10 mt-1 ml-2">
      <div>
        <label htmlFor="genus-select" className="sr-only">
          Choose a Genus to filter by:
        </label>
        {/* <ComboBox /> */}
      </div>

      <div></div>
    </div>
  );
}
