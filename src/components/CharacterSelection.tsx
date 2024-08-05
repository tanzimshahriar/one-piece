'use client'

import CharacterThumbnail from "./CharacterThumbnail"
import Image from "next/image"

export const CHARS_PER_PAGE = 30

const CharacterSelection = ({ characters, setSelectedCharacter, currentPage, setCurrentPage }: { characters: Array<any>; setSelectedCharacter: (index: number) => void; currentPage: number; setCurrentPage: (i: number) => void }) => {
    return (
        <div className='py-12'>
            <div className="flex justify-center pb-4">
                <div className="bg-black text-xl md:text-2xl lg:text-3xl uppercase font-black text-white p-2"><span className="text-red-500">S</span>elect a character</div>
            </div>
            <div className='container mx-auto flex flex-wrap justify-center px-4'>
                {characters.slice((currentPage - 1) * CHARS_PER_PAGE, CHARS_PER_PAGE * currentPage).map((character: any) => (
                    <CharacterThumbnail setSelectedCharacter={setSelectedCharacter} key={character.id} character={character} />
                ))}
            </div>
            <div className="flex gap-2 flex-wrap px-4 justify-center">
                <button disabled={currentPage == 1} className="flex shadow-lg justify-center  items-center text-white text-xs w-10 h-10 bg-indigo-600 hover:bg-indigo-500 duration-300 rounded-md">
                    <Image src="/left.png" className="invert" alt="left icon" width={12} height={12} />
                </button>
                {
                    Array(CHARS_PER_PAGE).fill(null).map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`${currentPage === i + 1 ? 'bg-indigo-100 shadow-lg text-black' : ''} text-white w-10 h-10 bg-indigo-600 hover:bg-indigo-500 duration-300 rounded-md`}>
                            {i + 1}
                        </button>
                    ))
                }
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage == CHARS_PER_PAGE} className="flex shadow-lg justify-center items-center text-white text-xs w-10 h-10 bg-indigo-600 hover:bg-indigo-500 duration-300 rounded-md">
                    <Image src="/left.png" className="rotate-180 invert" alt="left icon" width={12} height={12} />
                </button>
            </div>
        </div>
    )
}

export default CharacterSelection
