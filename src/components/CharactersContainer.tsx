'use client'

import Image from 'next/image';
import { useState } from "react";
import CharacterSelection from './CharacterSelection';

const CharactersContainer = ({ characters }: { characters: Array<any> }) => {
    const [selectedCharacter, setSelectedCharacter] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    let characterData = characters.filter(c => c.id == selectedCharacter).map((d: any) => {
        const newData: any = {
            id: d.id,
            name: '',
            fruitImage: d.fruit?.filename,
            features: [],
            fruitDesc: d.fruit?.description
        }
        if (d.bounty) {
            newData.features.push(
                {
                    bounty: d.bounty
                }
            )
        }
        if (d.job) {
            newData.features.push(
                {
                    jobDescription: `${d.job} of ${d.crew.name}`
                }
            )
        }
        if (d.fruit) {
            newData.features.push(
                {
                    fruit: d.fruit.name,
                }
            )
        }

        if (d.job === "Captain" && d.crew.is_yonko) {
            newData.name = d.name + ' - (Yonko)'
        } else {
            newData.name = d.name
        }

        return newData
    })[0]
    return (
        <div>
            <div className="py-8 bg-gradient-to-r from-orange-400 via-red-700 to-red-900 font-one-piece text-shadow-sm shadow-black text-3xl border-y-[20px] border-black">
                <div className="container mx-auto lg:flex gap-8 text-yellow-200 px-4">
                    <Image className="lg:flex-1 object-cover border-8 border-black aspect-square" width={500} height={500} alt={characterData.name} src={`/characters/${characterData.id}.png`} />
                    <div className="lg:flex-1 xl:flex-[2]">
                        <div className="flex font-bold text-yellow-200 md:text-4xl lg:text-5xl xl:text-6xl py-8 pb-12">
                            <div>{characterData.name}</div>
                        </div>
                        {characterData.features && characterData.features.length > 0 &&
                            <div className="border-4 border-black">
                                {
                                    characterData.features.map((feature: any, i: number) => (
                                        <div key={i} className={`${i !== characterData.features.length - 1 ? 'border-b-4' : ''} border-black text-yellow-200 py-1`}>
                                            {feature.bounty &&
                                                <div className="flex items-center gap-1 py-4 px-4">
                                                    <div className="pt-1.5">Wanted: </div>
                                                    <Image alt="Berry" className="rotate-12" src="/berry.png" width={15} height={12} />
                                                    <div className="pt-1.5">{feature.bounty}</div>
                                                </div>}
                                            {feature.jobDescription && <div className="px-4 py-4">{feature.jobDescription}</div>}
                                            {feature.fruit &&
                                                <div className="py-4 px-4 space-y-3">
                                                    <div className="flex gap-6">
                                                        <div className="pt-1.5">{feature.fruit}</div>
                                                        {characterData.fruitImage && <div>
                                                            <Image src={characterData.fruitImage} alt={feature.fruit} width={40} height={40} />
                                                        </div>}
                                                    </div>
                                                    {characterData.fruitDesc && <p className="text-base font-inter">{characterData.fruitDesc}</p>}
                                                </div>}
                                        </div>
                                    ))
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
