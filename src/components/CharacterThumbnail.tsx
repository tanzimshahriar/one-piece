import Image from 'next/image';

type Character = {
  id: number;
  name: string;
};

const CharacterThumbnail = ({
  character,
  isSelectedCharacter,
  setSelectedCharacter,
}: {
  character: Character;
  isSelectedCharacter: boolean;
  setSelectedCharacter: (character: Character) => void;
}) => (
  <button
    type="button"
    className={`roster-card${isSelectedCharacter ? ' is-selected' : ''}`}
    onClick={() => setSelectedCharacter(character)}
    aria-pressed={isSelectedCharacter}
    aria-label={`View ${character.name}`}
  >
    <span className="roster-image-wrap">
      <Image
        className="roster-image"
        src={`/characters/${character.id}.png`}
        alt=""
        width={120}
        height={120}
      />
    </span>
    <span className="roster-card-caption">
      <span className="roster-number">{String(character.id).padStart(2, '0')}</span>
      <span className="roster-name">{character.name}</span>
    </span>
  </button>
);

export default CharacterThumbnail;
