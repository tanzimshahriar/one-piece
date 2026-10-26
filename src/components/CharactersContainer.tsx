'use client';

import Image from 'next/image';
import { useState } from 'react';
import CharacterSelection from './CharacterSelection';

type Character = {
  id: number;
  name: string;
  description?: string;
  bounty?: string;
  age?: string;
  job?: string;
  status?: string;
  fruit?: {
    name: string;
    description?: string;
  };
};

const CharactersContainer = ({ characters }: { characters: Character[] }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [currentPage, setCurrentPage] = useState(1);

  if (!selectedCharacter) {
    return (
      <section className="empty-archive" aria-live="polite">
        No character records are available yet.
      </section>
    );
  }

  return (
    <>
      <section className="featured-record" aria-label="Featured character">
        <div className="portrait-stage">
          <div className="portrait-topline">
            <span>RECORD NO. {String(selectedCharacter.id).padStart(3, '0')}</span>
            <span className="record-class">CLASSIFIED / OPEN</span>
          </div>
          <div className="portrait-watermark" aria-hidden="true">
            {String(selectedCharacter.id).padStart(2, '0')}
          </div>
          <Image
            key={selectedCharacter.id}
            className="featured-portrait"
            src={`/characters/${selectedCharacter.id}.png`}
            alt={`Portrait of ${selectedCharacter.name}`}
            width={640}
            height={640}
            priority
          />
          <div className="portrait-caption">
            <span>KNOWN FIGURE</span>
            <span>— {String(selectedCharacter.id).padStart(3, '0')}</span>
          </div>
        </div>

        <div className="record-details">
          <div className="record-kicker">
            <span className="kicker-line" />
            <span>{selectedCharacter.job || 'WANTED INDIVIDUAL'}</span>
            {selectedCharacter.status && <span className="record-status">{selectedCharacter.status}</span>}
          </div>
          <h2>{selectedCharacter.name}</h2>

          {selectedCharacter.bounty && (
            <div className="bounty-block">
              <span className="bounty-label">CURRENT BOUNTY</span>
              <div className="bounty-value">
                <Image src="/berry.png" alt="" width={20} height={20} />
                <span>{selectedCharacter.bounty}</span>
                <span className="currency">BERRIES</span>
              </div>
            </div>
          )}

          {selectedCharacter.description && (
            <p className="character-description">{selectedCharacter.description}</p>
          )}

          <div className="record-meta">
            {selectedCharacter.age && (
              <div className="meta-item">
                <span>AGE</span>
                <strong>{selectedCharacter.age}</strong>
              </div>
            )}
            {selectedCharacter.fruit && (
              <div className="meta-item">
                <span>DEVIL FRUIT</span>
                <strong>{selectedCharacter.fruit.name}</strong>
              </div>
            )}
          </div>

          {selectedCharacter.fruit?.description && (
            <p className="fruit-description">{selectedCharacter.fruit.description}</p>
          )}
          <div className="record-footnote">
            <span>WORLD GOVERNMENT INTELLIGENCE</span>
            <span>RESTRICTED ACCESS <span className="lock-mark">◈</span></span>
          </div>
        </div>
      </section>

      <CharacterSelection
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedCharacter={selectedCharacter}
        setSelectedCharacter={setSelectedCharacter}
        characters={characters}
      />
    </>
  );
};

export default CharactersContainer;
