import CharacterThumbnail from "./CharacterThumbnail"

const CharacterSelection = ({ characters, setSelectedCharacter }: { characters: Array<any>; setSelectedCharacter: (index: number) => void }) => {
    return (
        <div className='py-12'>
            <div className='container mx-auto flex flex-wrap justify-center px-4'>
                {characters.slice(0, 30).map((character: any) => (
                    <CharacterThumbnail setSelectedCharacter={setSelectedCharacter} key={character.id} character={character} />
                ))}
            </div>
        </div>
    )
}

export default CharacterSelection
