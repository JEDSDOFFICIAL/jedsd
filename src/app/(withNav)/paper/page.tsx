'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ResearchPaper } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function PaperPage() {
  const [papers, setPapers] = useState({ papers: [] as ResearchPaper[], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  useEffect(() => {
    router.push(`/paper?page=${page}${title && `&titles=${encodeURIComponent(title)}`}${keywords && `&keywords=${encodeURIComponent(keywords)}`}`);
  }, [title, keywords, page]);

  useEffect(() => {
    // ✅ Read from URL search params only on client
    const titleParam = searchParams.get('titles') || '';
    const keywordsParam = searchParams.get('keywords') || '';

    setTitle(titleParam);
    setKeywords(keywordsParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        console.log('Fetching papers with params:', { title, keywords, page });
        setLoading(true);
        const response = await axios.get(`/api/paper?status=PUBLISH&page=${page}${title && `&title=${title}`}${keywords && `&keywords=${keywords}`}`);

        console.log('Papers fetched successfully:', response.data);
        setPapers(response.data || []);
      } catch (error) {
        console.error('Error fetching papers:', error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [title, keywords, page]);

  return (
    <div className='w-full flex justify-start lg:pt-36 md:pt-40 pt-36 gap-4 items-center flex-col bg-gray-200 min-h-screen h-fit'>
 
      <div className='w-full h-[calc(100vh-10rem)] flex justify-center items-center'>
        <div className='w-1/4 bg-gray-600 h-full md:flex hidden justify-start items-center flex-col gap-4 p-4 shadow-md rounded-md'>
          <p className='text-4xl font-bold text-white'>Filters</p>
          <div className='flex flex-col gap-4 p-4'>
            <div className='flex justify-center items-center gap-2'>

            <Input
              type='text'
              placeholder='Search by title'
              className='p-2 rounded-md border border-gray-300 bg-white text-black'
              />
              <Button
                variant='outline'
                onClick={() => {
                  setPage(1);
                  setTitle((document.querySelector('input[placeholder="Search by title"]') as HTMLInputElement | null)?.value || '');
                }}
              >
                <Search className='mr-2' />
                Search
              </Button>
              </div>
            <div className='flex justify-center items-center gap-2'>
            <Input
              type='text'
              placeholder='Search by keywords'
              className='p-2 rounded-md border border-gray-300 bg-white text-black '
            />
              <Button
                variant='outline'
                onClick={() => {

                  setPage(1);
                  setKeywords((document.querySelector('input[placeholder="Search by keywords"]') as HTMLInputElement | null)?.value || '');
                }}
              >
              <Search className='mr-2' />
                Search
              </Button>
            </div>
            </div>
          </div>
          {
          loading ? (
            <div className='flex justify-center items-center w-full h-full'>
              <p className='text-gray-600'>Loading papers...</p>
            </div>
          ) : (
               <div className='w-3/4 h-full flex flex-col gap-6 justify-between items-center p-4 bg-white shadow-md rounded-md overflow-y-auto scrollbar-hide'>
          <p className='text-5xl font-bold text-gray-800'>Research Paper</p>

          {papers ? (
            <div className='w-full max-w-4xl grid gap-4'>
              {papers.papers.map((paper, idx) => (
                <Card key={idx} className='bg-white p-4 rounded-md shadow'>
                  <CardHeader className='text-2xl text-blue-600 font-semibold'>
                    <Link href={`/paper/${paper.id}`} className='hover:underline'>
                      {paper.title}
                    </Link>
                  </CardHeader>
                  <CardContent className='text-gray-600'>
                    Abstract: {paper.abstract.length > 250 ? paper.abstract.slice(0, 250) + '...' : paper.abstract}
                  </CardContent>
                  <CardContent className='text-gray-600'>{paper.status}</CardContent>
                  <CardFooter className='text-lg text-gray-500'>
                    Keywords: {Array.isArray(paper.keywords) ? paper.keywords.join(', ') : paper.keywords}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className='text-gray-600'>No papers found.</p>
          )}

          <div className='button-group flex w-full h-auto items-center justify-center gap-10'>
            <Button variant='outline' disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button variant='outline'disabled = {page === papers.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
           
          )
          }
     
      </div>
     
    </div>
  );
}
import { Suspense } from 'react'
 
 
export default function Searchbar() {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <PaperPage />
    </Suspense>
  )
}

