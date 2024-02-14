export default function SearchInput({ searchQuery, setSearchQuery }) {
    return (
      <div>
        <label htmlFor="searchInput">Search by location: </label>
        <input
          id="searchInput"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    );
  }