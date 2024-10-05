'use client'

import Image from 'next/image';
import { useState } from "react";
import CharacterSelection from './CharacterSelection';

const CharactersContainer = ({ characters }: { characters: Array<any> }) => {
    const [selectedCharacter, setSelectedCharacter] = useState(characters[0])
    const [currentPage, setCurrentPage] = useState(1)

    return (
        <>
            <div className="flex-1 py-8 text-white font-light text-xs md:text-sm lg:text-base">
                <div className="container mx-auto lg:flex gap-8 px-4">
                    <div className="w-[250px] md:w-[400px] lg:w-[500px] xl:w-[700px]">
                        <Image className="bg-black bg-opacity-30 lg:flex-1 object-cover border-8 border-black rounded-2xl image-skew aspect-square" width={500} height={500} alt={selectedCharacter?.name} src={`/characters/${selectedCharacter?.id}.png`} />
                    </div>
                    <div>
                        <div className="flex font-bold md:text-3xl lg:text-4xl xl:text-5xl pt-8 pb-4 sm:pb-5 xl:pb-6 underline">
                            <div>{selectedCharacter?.name}</div>
                        </div>
                        {selectedCharacter &&
                            <div>
                                {selectedCharacter.bounty &&
                                    <div className="flex items-center gap-1 text-xs md:text-xl font-bold pb-4">
                                        <div className="pt-1.5">WANTED DEAD OR ALIVE FOR </div>
                                        <Image alt="Berry" className="rotate-12 invert" src="/berry.png" width={15} height={12} />
                                        <div className="pt-1.5">{selectedCharacter.bounty}</div>
                                    </div>
                                }
                                {
                                    <div className="border-black py-1">
                                        {selectedCharacter.description && <div>{selectedCharacter.description}</div>}

                                        {selectedCharacter.fruit &&
                                            <div>
                                                <div className="pt-4 font-bold">Owner of {selectedCharacter.fruit.name}</div>
                                                {selectedCharacter.fruit.description && <p className="pt-1 font-inter">{selectedCharacter.fruit.description}</p>}
                                            </div>}
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
            <CharacterSelection currentPage={currentPage} setCurrentPage={setCurrentPage} selectedCharacter={selectedCharacter} setSelectedCharacter={setSelectedCharacter} characters={characters} />
        </>
    )
}

export default CharactersContainer
