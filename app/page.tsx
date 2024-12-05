import BeatMaker from '../components/BeatMaker'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <h1 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Beat-Tastic
      </h1>
      <BeatMaker />
    </main>
  )
}

