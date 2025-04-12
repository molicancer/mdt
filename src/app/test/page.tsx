import Image from 'next/image';

const TestPage = () => {
  return (
    <div className='p-4 rounded-2xl bg-zinc-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
      <Image src="/test.png" alt="test" width={200} height={200} />
    </div>
  );
};

export default TestPage;