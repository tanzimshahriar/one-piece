import CharactersContainer from '@/components/CharactersContainer';
import { promises as fs } from 'fs';
import Image from 'next/image';

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/characters.json', 'utf8');
  const characters = JSON.parse(file);

  return (
    <main className='min-h-screen relative font-inter'>
      <Image className='absolute grayscale-[70%] -z-10 w-full h-full object-cover' alt="background" src="/characters/zoro.png" width={1000} height={1000} />
      <div className="container mx-auto flex lg:justify-center py-8 px-4">
        <div className="bg-black text-2xl md:text-3xl lg:text-4xl xl:text-5xl uppercase font-black text-white p-2"><span className="text-red-500">C</span>haracter</div>
      </div>

      <CharactersContainer characters={characters} />
    </main>
  );
}
