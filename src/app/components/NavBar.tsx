import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-gray-900 p-4 flex justify-between">
      <ul className="flex justify-evenly text-2xl font-bold">
        <li><Link href="/"><span className="mr-2">Home</span></Link></li>
        <li><Link href="/history"><span className="mr-2">History</span></Link></li>
        <li><Link href="/repair"><span className="mr-2">Repair</span></Link></li>
        <li><Link href="/extra"><span className="mr-2">Extra</span></Link></li>
      </ul>
      <ul className="flex justify-evenly text-2xl font-bold">
        <li><Link href="/api/auth/signin"><span className="mr-2">Sign In</span></Link></li>
        <li><Link href="/api/auth/signout"><span className="mr-2">Sign Out</span></Link></li>
      </ul>
    </nav>
  )
}