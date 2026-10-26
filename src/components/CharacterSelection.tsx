'use client';

import Image from 'next/image';
import CharacterThumbnail from './CharacterThumbnail';
import { getCharacterName, type Character } from '@/lib/characters';

type CharacterSelectionProps = {
  characters: Character[];
  setSelectedCharacter: (character: Character) => void;
  selectedCharacter: Character;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  hasNextPage: boolean;
  searchInput: string;
  setSearchInput: (query: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
};

const CharacterSelection = ({
  characters,
  setSelectedCharacter,
  selectedCharacter,
  currentPage,
  setCurrentPage,
  isLoading,
  hasNextPage,
  searchInput,
  setSearchInput,
  onSearch,
  searchQuery,
}: CharacterSelectionProps) => (
  <section className="character-index" aria-label="Browse character records" aria-busy={isLoading}>
    <div className="index-heading">
      <div>
        <div className="eyebrow"><span>02</span> / THE ROSTER</div>
        <h3>{searchQuery ? 'Search results' : 'Known figures'}</h3>
      </div>
      <span className="page-indicator">
        PAGE <strong>{String(currentPage).padStart(2, '0')}</strong>
      </span>
    </div>

    <form
      className="character-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(searchInput);
      }}
    >
      <label className="sr-only" htmlFor="character-search">Search characters</label>
      <input
        id="character-search"
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search characters by name…"
        maxLength={100}
      />
      {searchInput && (
        <button
          type="button"
          className="search-clear"
          onClick={() => {
            setSearchInput('');
            onSearch('');
          }}
          disabled={isLoading}
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
      <button type="submit" className="search-submit" disabled={isLoading}>
        {isLoading ? 'SEARCHING…' : 'SEARCH'}
      </button>
    </form>

    <div className={`roster-grid${isLoading ? ' is-loading' : ''}`}>
      {characters.map((character) => (
        <CharacterThumbnail
          key={character.id}
          character={character}
          characterName={getCharacterName(character.name, character.id)}
          isSelectedCharacter={selectedCharacter?.id === character.id}
          setSelectedCharacter={setSelectedCharacter}
        />
      ))}
    </div>
    {characters.length === 0 && (
      <p className="search-empty">
        {searchQuery ? `No characters found for “${searchQuery}”.` : 'No character records found.'}
      </p>
    )}

    <div className="roster-controls">
      <span className="roster-hint">
        {isLoading ? 'LOADING RECORDS…' : searchQuery ? `RESULTS FOR “${searchQuery}”` : 'SELECT A RECORD TO VIEW DETAILS'}
      </span>
      <div className="pagination" aria-label="Character pages">
        <button
          type="button"
          className="page-arrow"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Previous page"
        >
          <Image src="/left.png" alt="" width={14} height={14} />
        </button>
        <span className="page-number is-active" aria-current="page">
          {String(currentPage).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="page-arrow"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          aria-label="Next page"
        >
          <Image src="/left.png" alt="" width={14} height={14} className="rotate-180" />
        </button>
      </div>
    </div>
  </section>
);

export default CharacterSelection;
