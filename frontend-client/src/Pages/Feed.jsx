import React, { useEffect, useState } from 'react';
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/storiesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and posts list */}
      <div className='flex flex-col gap-6'>
        <StoriesBar />
        {feeds.map(post => <PostCard key={post._id} post={post} />)}
      </div>

      {/* Right sidebar */}
      <div className='max-xl:hidden sticky top-0 flex flex-col gap-4'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md shadow flex flex-col gap-2'>
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-[300px] h-[200px] rounded-md' alt='Sponsored' />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>
            Supercharge your marketing with a powerful, easy-to-use platform built for results.
          </p>
        </div>
        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
