import Image from 'next/image'
const CharacterThumbnail = ({ characters, character, setSelectedCharacter }: { characters: Array<any>; character: any; setSelectedCharacter: (index: number) => void }) => {
    return (
        <div className='p-2 md:p-3 lg:p-3 xl:p-3'>
            <button className="block w-full group h-full border-4 border-black" key={character.id} onClick={() => setSelectedCharacter(characters[character.id - 1])}>
                <div className='flex w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 overflow-hidden'>
                    <Image className='flex-1 group-hover:scale-125 object-cover duration-300' src={`/characters/${character.id}.png`} alt={character.name} width={100} height={100} />
                </div>
            </button>
        </div>
    )
}

export default CharacterThumbnail
