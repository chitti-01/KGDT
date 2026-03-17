const withSerwist = require('@serwist/next').default({
    swSrc: 'src/app/sw.ts',
    swDest: 'public/sw.js',
    reloadOnOnline: true,
})

const nextConfig = {
    reactStrictMode: true,
}

module.exports = withSerwist(nextConfig)
