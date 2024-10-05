'use client'

import CharacterThumbnail from "./CharacterThumbnail"
import Image from "next/image"

export const CHARS_PER_PAGE = 10

const CharacterSelection = ({ characters, setSelectedCharacter, selectedCharacter, currentPage, setCurrentPage }: { characters: Array<any>; selectedCharacter: any; setSelectedCharacter: (index: number) => void; currentPage: number; setCurrentPage: (i: number) => void }) => {
    const handlePageChange = (index: number) => {
        setSelectedCharacter(characters[((index - 1) * CHARS_PER_PAGE)])
        setCurrentPage(index)
    }

    return (
        <>
        <div className="my-4 md:my-8 lg:my-12 bg-slate-900 rounded-xl">
            <div className='grid grid-cols-10 justify-center px-4'>
                {characters.slice((currentPage - 1) * CHARS_PER_PAGE, CHARS_PER_PAGE * currentPage).map((character: any) => (
                    <CharacterThumbnail characters={characters} isSelectedCharacter={selectedCharacter.id == character.id} setSelectedCharacter={setSelectedCharacter} key={character.id} character={character} />
                ))}
            </div>
            
        </div>
        <div className="flex gap-2 flex-wrap pb-4 justify-center text-xs font-bold">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage == 1} className="flex shadow-lg justify-center items-center text-white text-xs w-6 h-6 lg:w-10 lg:h-10 bg-indigo-600 hover:bg-indigo-500 duration-300 rounded-full border-2 border-black">
                    <Image src="/left.png" className="invert" alt="left icon" width={12} height={12} />
                </button>
                {
                    Array((Math.floor(characters.length / CHARS_PER_PAGE) + (characters.length % CHARS_PER_PAGE === 0 ? 0 : 1))).fill(null).map((_, i) => (
                        <button key={i} onClick={() => handlePageChange(i + 1)} className={`${currentPage === i + 1 ? 'bg-indigo-100 shadow-lg text-black' : ''} text-white w-6 h-6 lg:w-10 lg:h-10 bg-indigo-600 hover:bg-indigo-500 duration-300 rounded-full border-2 border-black`}>
                            {i + 1}
                        </button>
                    ))
                }
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage == CHARS_PER_PAGE} className="flex shadow-lg justify-center items-center text-white text-xs w-6 h-6 lg:w-10 lg:h-10 bg-indigo-600 hover:bg-indigo-500 duration-300 rounded-full border-2 border-black">
                    <Image src="/left.png" className="rotate-180 invert" alt="left icon" width={12} height={12} />
                </button>
            </div>
        </>
    )
}

export default CharacterSelection
