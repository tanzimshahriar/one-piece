'use client';

import Image from 'next/image';
import CharacterThumbnail from './CharacterThumbnail';

export const CHARS_PER_PAGE = 10;

type Character = {
  id: number;
  name: string;
};

type CharacterSelectionProps = {
  characters: Character[];
  setSelectedCharacter: (character: Character) => void;
  selectedCharacter: Character;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const CharacterSelection = ({
  characters,
  setSelectedCharacter,
  selectedCharacter,
  currentPage,
  setCurrentPage,
}: CharacterSelectionProps) => {
  const pageCount = Math.ceil(characters.length / CHARS_PER_PAGE);
  const pageCharacters = characters.slice(
    (currentPage - 1) * CHARS_PER_PAGE,
    currentPage * CHARS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount || page === currentPage) return;
    setCurrentPage(page);
    const firstCharacter = characters[(page - 1) * CHARS_PER_PAGE];
    if (firstCharacter) setSelectedCharacter(firstCharacter);
  };

  return (
    <section className="character-index" aria-label="Browse character records">
      <div className="index-heading">
        <div>
          <div className="eyebrow"><span>02</span> / THE ROSTER</div>
          <h3>Known figures <span>({characters.length})</span></h3>
        </div>
        <span className="page-indicator">
          PAGE <strong>{String(currentPage).padStart(2, '0')}</strong> / {String(pageCount).padStart(2, '0')}
        </span>
      </div>

      <div className="roster-grid">
        {pageCharacters.map((character) => (
          <CharacterThumbnail
            key={character.id}
            character={character}
            isSelectedCharacter={selectedCharacter.id === character.id}
            setSelectedCharacter={setSelectedCharacter}
          />
        ))}
      </div>

      <div className="roster-controls">
        <span className="roster-hint">SELECT A RECORD TO VIEW DETAILS</span>
        <div className="pagination" aria-label="Character pages">
          <button
            type="button"
            className="page-arrow"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <Image src="/left.png" alt="" width={14} height={14} />
          </button>
          {Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1;
            return (
              <button
                type="button"
                key={page}
                onClick={() => handlePageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`page-number${currentPage === page ? ' is-active' : ''}`}
              >
                {String(page).padStart(2, '0')}
              </button>
            );
          })}
          <button
            type="button"
            className="page-arrow"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            aria-label="Next page"
          >
            <Image src="/left.png" alt="" width={14} height={14} className="rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CharacterSelection;
