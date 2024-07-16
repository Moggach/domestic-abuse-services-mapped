export default function SearchInput({ searchQuery, setSearchQuery, onSubmit, onClear }) {
  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    onSubmit(searchQuery);
  };

  return (
    <div>
      <label htmlFor="searchInput">Search by location: </label>
      <input
        id="searchInput"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}