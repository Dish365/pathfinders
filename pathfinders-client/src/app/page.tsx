import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-900 sm:text-5xl md:text-6xl">
            Discover Your Motivational Gifts
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Take our assessment to understand your gifts from Romans 12:6-8 and find your path in ministry, career, and life purpose.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link 
              href="/login" 
              className="rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}