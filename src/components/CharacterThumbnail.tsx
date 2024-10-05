import Image from 'next/image'
const CharacterThumbnail = ({ characters, character, isSelectedCharacter, setSelectedCharacter }: { characters: Array<any>; character: any; isSelectedCharacter: boolean; setSelectedCharacter: (index: number) => void }) => {
    return (
        <div className='p-1 md:p-1.5 lg:p-2'>
            <button className={`block w-full group rounded-lg h-full ${isSelectedCharacter ? 'border-2 lg:border-4 border-indigo-500' : ''}`} key={character.id} onClick={() => setSelectedCharacter(characters[character.id - 1])}>
                <div className='flex rounded-lg overflow-hidden w-full h-full'>
                    <Image className='flex-1 group-hover:scale-125 object-cover duration-300' src={`/characters/${character.id}.png`} alt={character.name} width={100} height={100} />
                </div>
            </button>
        </div>
    )
}

export default CharacterThumbnail
