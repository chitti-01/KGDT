const withSerwist = require('@serwist/next').default({
    swSrc: 'src/app/sw.ts',
    swDest: 'public/sw.js',
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === 'development',
    manifestTransforms: [
        async (manifestEntries) => {
            const manifest = manifestEntries.map((m) => {
                m.url = m.url.replace(/\\/g, '/');
                return m;
            });
            return { manifest, warnings: [] };
        },
    ],
})

const nextConfig = {
    reactStrictMode: true,
    turbopack: {},
}

module.exports = withSerwist(nextConfig)
