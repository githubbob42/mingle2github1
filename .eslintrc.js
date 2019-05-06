module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "plugins": ["jasmine"],
    "env": {
        "browser": true,
        "jasmine": true,
        "amd": true,
        "es6": true
    },
    "extends": "react-app",
    "rules": {
        "import/no-amd": "off",
        "import/no-webpack-loader-syntax": "off",
        "jsx-a11y/href-no-hash": [0, "Link"],
        "jsx-a11y/anchor-is-valid": [0],
        "no-mixed-operators": "off",
        "no-restricted-globals": "off",
        "strict": "off",
        "linebreak-style": 0
    }
};
