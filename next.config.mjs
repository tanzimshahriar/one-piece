/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'hlryizauzapedkefdviw.supabase.co' },
      { protocol: 'https', hostname: 'images.api-onepiece.com' },
      { protocol: 'https', hostname: 'static.wikia.nocookie.net' },
    ],
  },
  experimental: {
    // Several upstream datasets are large; keep build-time static generation
    // from hammering the free APIs with too many concurrent workers.
    cpus: 4,
  },
};

export default nextConfig;
