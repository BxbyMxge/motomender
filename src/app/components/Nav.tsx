// Navbar.tsx
"use client";
import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react';



import { AcmeLogo } from '../AcmeLogo'; // Adjust the path to your logo component


interface NavbarProps {
  // Add any necessary props here (e.g., activeLink)
}

const MyNavbar: React.FC<NavbarProps> = ({ /* props */ }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {data: session, status} = useSession();


  // Define your navigation links and their corresponding paths
  const navLinks = [
    {label: 'Home', path: '/'},
    // Add more links as needed
  ];

  if (session && status === 'authenticated') {
    navLinks.push({label: 'History', path: '/history'});
    navLinks.push({label: 'Repair', path: '/maintain'});
  }


  console.log(router);




  return (
      <Navbar>
        <NavbarBrand>
          <AcmeLogo/> {/* Replace with your actual logo component */}
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
        <NavbarContent className="sm:flex md:flex lg:flex xl:flex" justify="center">

          {navLinks.map((link) => (
              <Link color="foreground"
                    key={link.path}
                    href={link.path}

              >
                <NavbarItem isActive={pathname === link.path}>
                  {link.label}
                </NavbarItem>
              </Link>
          ))}
        </NavbarContent>


        <NavbarContent justify="end">
          <NavbarItem className="sm:flex md:flex lg:flex xl:flex">
            {session && status === 'authenticated' ? (
                <Link href="/api/auth/signout">Sign Out</Link>
            ) : (
                <Link href="/api/auth/signin">Login</Link>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
  );
};

export default MyNavbar;
