import genus from "@/test_data/genus";
import ComboBox from "./combo-box";

export default function Filters() {
  return (
    <div className="absolute h-10 mt-1 ml-2">
      <div>
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
