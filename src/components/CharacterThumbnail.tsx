import Image from 'next/image';
import type { Character } from '@/lib/characters';

const CharacterThumbnail = ({
  character,
  characterName,
  isSelectedCharacter,
  setSelectedCharacter,
}: {
  character: Character;
  characterName: string;
  isSelectedCharacter: boolean;
  setSelectedCharacter: (character: Character) => void;
}) => (
  <button
    type="button"
    className={`roster-card${isSelectedCharacter ? ' is-selected' : ''}`}
    onClick={() => setSelectedCharacter(character)}
    aria-pressed={isSelectedCharacter}
    aria-label={`View ${characterName}`}
  >
    <span className="roster-image-wrap">
      {character.image_url ? (
        <Image
          className="roster-image"
          src={character.image_url}
          alt=""
          width={120}
          height={120}
          unoptimized
        />
      ) : (
        <span className="roster-image-fallback" aria-hidden="true">
          {characterName.slice(0, 1)}
        </span>
      )}
    </span>
    <span className="roster-card-caption">
      <span className="roster-number">{character.id.slice(0, 6).toUpperCase()}</span>
      <span className="roster-name">{characterName}</span>
    </span>
  </button>
);

export default CharacterThumbnail;
