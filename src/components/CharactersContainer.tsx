'use client';

import Image from 'next/image';
import { useState } from 'react';
import CharacterSelection from './CharacterSelection';
import CharacterThumbnail from './CharacterThumbnail';
import {
  getActiveBounty,
  getCharacterExtra,
  getCharacterName,
  isCharacter,
  type Character,
} from '@/lib/characters';

type CharactersResponse = {
  characters: Character[];
  hasNextPage: boolean;
};

const CharactersContainer = ({
  initialCharacters,
  initialError,
  initialHasNextPage,
}: {
  initialCharacters: Character[];
  initialError: string | null;
  initialHasNextPage: boolean;
}) => {
  const [characters, setCharacters] = useState(initialCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState(initialCharacters[0] ?? null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadPage = async (page: number, query: string) => {
    if (page < 1 || isLoading || (page > currentPage && !hasNextPage)) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('q', query);
      const response = await fetch(`/api/characters?${params}`);
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : `Unable to load character records (HTTP ${response.status}).`;
        throw new Error(message);
      }

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('characters' in payload) ||
        !Array.isArray(payload.characters) ||
        !payload.characters.every(isCharacter) ||
        !('hasNextPage' in payload) ||
        typeof payload.hasNextPage !== 'boolean'
      ) {
        throw new Error('The character API returned data in an unexpected format.');
      }

      const result: CharactersResponse = {
        characters: payload.characters,
        hasNextPage: payload.hasNextPage,
      };
      if (result.characters.length === 0 && page > 1) {
        setHasNextPage(false);
        return;
      }

      setCharacters(result.characters);
      setSelectedCharacter(result.characters[0] ?? null);
      setCurrentPage(page);
      setHasNextPage(result.hasNextPage);
      setSearchQuery(query);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load character records. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => loadPage(page, searchQuery);
  const handleSearch = (query: string) => loadPage(1, query.trim());

  const characterName = selectedCharacter
    ? getCharacterName(selectedCharacter.name, selectedCharacter.id)
    : null;
  const bounty = selectedCharacter ? getActiveBounty(selectedCharacter) : null;
  const epithet = selectedCharacter ? getCharacterExtra(selectedCharacter, 'epithet') : undefined;
  const origin = selectedCharacter ? getCharacterExtra(selectedCharacter, 'origin') : undefined;
  const occupation = selectedCharacter ? getCharacterExtra(selectedCharacter, 'occupation') : undefined;

  return (
    <>
      {error && characters.length === 0 && (
        <section className="archive-error" role="alert">
          <strong>Character records are unavailable.</strong>
          <span>{error}</span>
        </section>
      )}

      {selectedCharacter && characterName && (
      <section className="featured-record" aria-label="Featured character">
        <div className="portrait-stage">
          <div className="portrait-topline">
            <span>RECORD / {selectedCharacter.id.slice(0, 8).toUpperCase()}</span>
            <span className="record-class">CLASSIFIED / OPEN</span>
          </div>
          <div className="portrait-watermark" aria-hidden="true">
            {characterName.slice(0, 1)}
          </div>
          {selectedCharacter.image_url && (
            <Image
              key={selectedCharacter.id}
              className="featured-portrait"
              src={selectedCharacter.image_url}
              alt={`Portrait of ${characterName}`}
              width={640}
              height={640}
              priority
              unoptimized
            />
          )}
          <div className="portrait-caption">
            <span>KNOWN FIGURE</span>
            <span>{selectedCharacter.status || 'STATUS UNKNOWN'}</span>
          </div>
        </div>

        <div className="record-details">
          <div className="record-kicker">
            <span className="kicker-line" />
            <span>{occupation || epithet || 'WANTED INDIVIDUAL'}</span>
            {selectedCharacter.status && (
              <span className="record-status">{selectedCharacter.status}</span>
            )}
          </div>
          <h2>{characterName}</h2>

          <div className="bounty-block">
            <span className="bounty-label">CURRENT BOUNTY</span>
            {bounty !== null ? (
              <div className="bounty-value">
                <Image src="/berry.png" alt="" width={20} height={20} />
                <span>{new Intl.NumberFormat('en-US').format(bounty)}</span>
                <span className="currency">BERRIES</span>
              </div>
            ) : (
              <div className="bounty-unlisted">NO ACTIVE BOUNTY LISTED</div>
            )}
          </div>

          {(epithet || origin) && (
            <p className="character-description">
              {epithet && <strong>{epithet}</strong>}
              {epithet && origin ? ' — ' : ''}
              {origin && `Origin: ${origin}.`}
            </p>
          )}

          <div className="record-meta">
            {selectedCharacter.age !== null && (
              <div className="meta-item">
                <span>AGE</span>
                <strong>{selectedCharacter.age}</strong>
              </div>
            )}
            {selectedCharacter.height !== null && (
              <div className="meta-item">
                <span>HEIGHT</span>
                <strong>{selectedCharacter.height} cm</strong>
              </div>
            )}
            {selectedCharacter.blood_type && selectedCharacter.blood_type !== 'Unknown' && (
              <div className="meta-item">
                <span>BLOOD TYPE</span>
                <strong>{selectedCharacter.blood_type}</strong>
              </div>
            )}
          </div>
          <div className="record-footnote">
            <span>WORLD GOVERNMENT INTELLIGENCE</span>
            <span>RESTRICTED ACCESS <span className="lock-mark">◈</span></span>
          </div>
        </div>
      </section>
      )}

      {!selectedCharacter && !initialError && (
        <section className="empty-archive" aria-live="polite">
          {isLoading ? 'Loading character records…' : 'No matching character records.'}
        </section>
      )}

      {error && (
        <div className="archive-inline-error" role="alert">
          Could not load that page: {error}
        </div>
      )}

      <CharacterSelection
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        characters={characters}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        selectedCharacter={selectedCharacter}
        setSelectedCharacter={setSelectedCharacter}
      />

      <div className="sr-only" aria-live="polite">
        {isLoading
          ? 'Loading character records'
          : `Showing ${characters.length} character records on page ${currentPage}`}
      </div>
    </>
  );
};

export default CharactersContainer;
