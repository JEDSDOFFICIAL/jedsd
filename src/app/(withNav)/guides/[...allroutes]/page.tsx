"use client";
import { usePathname ,useRouter} from 'next/navigation';
import React from 'react'
import { data } from '../data'; // Adjust the import path as necessary

const Allroute = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [path, setPath] = React.useState<string | null>(null);
  React.useEffect(() => {
    const currentPath = pathname.split('/').pop() || 'home';
    const guide = data.find(item => item.title === currentPath);
    if (!guide) {
      router.push('/'); // Redirect to 404 if no match found
      return;
    }
    setPath(currentPath);
  }, [pathname]);
  return (
    <div className='w-full overflow-x-hidden scroll-smooth'>
    <div className='flex flex-col items-center justify-center min-h-screen py-4 w-full bg-gradient-to-r from-blue-900/50 to-teal-100'>
      {data.map((item: any, index: number) => (
        item.title === path ? (
          <div key={index}>
            {item.content}
          </div>
        ) : null
      ))}
    </div>
      </div>
  )
}

export default Allroute
