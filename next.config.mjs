/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'images.api-onepiece.com'
        }]
    }
};

export default nextConfig;
