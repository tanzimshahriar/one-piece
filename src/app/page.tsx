import CharactersContainer from '@/components/CharactersContainer';
import { characters } from '../../characters';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {

  return (
    <main className="bg-gradient-to-bl from-violet-900 to-pink-900 flex flex-col min-h-screen">
      <nav className="container mx-auto flex justify-between items-center px-4">
        <Image alt='one-piece logo' src="/logo.png" width={150} height={100} />
        <div className="hidden lg:block text-3xl uppercase font-bold text-white">--Choose your hero--</div>
        <Link target="_blank" href="https://github.com/tanzimshahriar/one-piece" className='bg-white rounded-full p-1 overflow-hidden'>
          <Image alt='source-code' className='bg-white' src="/github.png" width={30} height={30} />
        </Link>
      </nav>
      <div className='container px-4 mx-auto relative font-inter flex flex-col flex-1'>
        <CharactersContainer characters={characters} />
      </div>
      {/* <Image className='absolute grayscale-[70%] -z-10 w-full h-full object-cover' alt="background" src="/characters/zoro.png" width={1000} height={1000} /> */}
      {/* <div className='absolute -z-10 bg-gradient-to-t from-black to-violet-900 opacity-60 w-full h-full object-cover'></div> */}
      
    </main>
  );
}
