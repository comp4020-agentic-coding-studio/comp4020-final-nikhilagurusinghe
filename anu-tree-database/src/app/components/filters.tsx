import genus from "@/test_data/genus";
import ComboBox from "./combo-box";

export default function Filters() {
  return (
    <div className="absolute h-10 mt-5 ml-4">
      <div className="backdrop-blur-sm px-2 py-2 rounded-full border border-white/20">
        <ComboBox
          options={genus}
          ariaLabel="Choose genuses to filter by"
          pluralLabel="genera"
        />
      </div>

      <div></div>
    </div>
  );
}
