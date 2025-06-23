module.exports = {
    content: [
        // ...existing content config
        'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
        './node_modules/flowbite/**/*.js'
    ],
    plugins: [
        // ...existing plugins
        require('flowbite/plugin')
    ],
}