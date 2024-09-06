import CharactersContainer from '@/components/CharactersContainer';
import Image from 'next/image';
import { characters } from '../../characters';

export default async function Home() {

  return (
    <main className='min-h-screen relative font-inter'>
      <Image className='absolute grayscale-[70%] -z-10 w-full h-full object-cover' alt="background" src="/characters/zoro.png" width={1000} height={1000} />
      <div className='absolute -z-10 bg-gradient-to-t from-black to-violet-900 opacity-60 w-full h-full object-cover'></div>
      <div className="container mx-auto flex lg:justify-center py-8 px-4">
        <div className="bg-black text-2xl md:text-3xl lg:text-4xl xl:text-5xl uppercase font-black text-white p-2"><span className="text-red-500">O</span>ne Piece Characters</div>
      </div>

      <CharactersContainer characters={characters} />
    </main>
  );
}
