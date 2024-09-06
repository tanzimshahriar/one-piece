'use client'

import Image from 'next/image';
import { useState } from "react";
import CharacterSelection from './CharacterSelection';

const CharactersContainer = ({ characters }: { characters: Array<any> }) => {
    const [selectedCharacter, setSelectedCharacter] = useState(characters[0])
    const [currentPage, setCurrentPage] = useState(1)
    
    return (
        <div>
            <div className="py-8 bg-gradient-to-br from-orange-300 via-red-500 to-red-900 font-one-piece text-shadow-sm shadow-black text-3xl border-y-[20px] border-black">
                <div className="container mx-auto lg:flex gap-8 text-yellow-200 px-4">
                    <Image className="lg:flex-1 object-cover border-8 border-black aspect-square" width={500} height={500} alt={selectedCharacter?.name} src={`/characters/${selectedCharacter?.id}.png`} />
                    <div className="lg:flex-1 xl:flex-[2]">
                        <div className="flex font-bold text-yellow-200 md:text-3xl lg:text-4xl xl:text-5xl py-8 pb-12 underline">
                            <div>{selectedCharacter?.name}</div>
                        </div>
                        {selectedCharacter &&
                            <div>
                                {
                                        <div className="border-black text-yellow-200 py-1">
                                            {selectedCharacter.bounty &&
                                                <div className="flex items-center gap-1 py-4 px-4">
                                                    <div className="pt-1.5">Wanted: </div>
                                                    <Image alt="Berry" className="rotate-12" src="/berry.png" width={15} height={12} />
                                                    <div className="pt-1.5">{selectedCharacter.bounty}</div>
                                                </div>}
                                            {selectedCharacter.job && selectedCharacter.crew?.name && <div className="px-4 py-4">{`${selectedCharacter.job} of ${selectedCharacter.crew.name}`}</div>}
                                            {selectedCharacter.fruit &&
                                                <div className="py-4 px-4 space-y-3">
                                                    <div className="flex gap-6">
                                                        <div className="pt-1.5">{selectedCharacter.fruit.name}</div>
                                                        {selectedCharacter.fruit.filename && <div>
                                                            <Image src={selectedCharacter.fruit.filename} alt={selectedCharacter.fruit} width={40} height={40} />
                                                        </div>}
                                                    </div>
                                                    {selectedCharacter.fruit.description && <p className="text-base font-inter">{selectedCharacter.fruit.description}</p>}
                                                </div>}
                                        </div>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
            <CharacterSelection currentPage={currentPage} setCurrentPage={setCurrentPage} setSelectedCharacter={setSelectedCharacter} characters={characters} />
        </div>
    )
}

export default CharactersContainer
