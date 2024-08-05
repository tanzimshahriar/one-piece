import Image from 'next/image';
const CharacterThumbnail = ({ character, setSelectedCharacter }: { character: any; setSelectedCharacter: (index: number) => void }) => {
    return (
        <div className='p-2 md:p-3 lg:p-3 xl:p-3'>
            <button className="block w-full h-full" key={character.id} onClick={() => setSelectedCharacter(character.id)}>
                <div className='flex w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20'>
                    <Image className='flex-1 object-cover' src={`/characters/${character.id}.png`} alt={character.name} width={100} height={100} />
                </div>
            </button>
        </div>
    )
}

export default CharacterThumbnail
