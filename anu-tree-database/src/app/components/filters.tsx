export default function Filters() {
  return (
    <div className="absolute h-10 mt-1 ml-2">
      <div>
        <label htmlFor="genus-select" className="sr-only">Choose a Genus to filter by:</label>
        <select name="Genus" id="genus-select" multiple={true} size={1}>
          <option value="test1">Test Genus 1</option>
          <option value="test2">Test Genus 2</option>
        </select>
      </div>
     
      <div>

      </div>
    </div>
  );
}