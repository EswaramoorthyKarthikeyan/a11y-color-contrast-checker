// Usage

```


try {
    @prop: element
    @prop: contrast Criteria

    const contrastChecker = new ColorContrastChecker($0, {
    fontSize: "23.994px",
    fontWeight: 700,
    contrastThreshold: 4.5,
});
contrastChecker.init();
} catch (error) {
console.error("Error initializing ColorContrastChecker:", error.message);
}
```

// "build:es5": "babel src --out-dir lib --presets=@babel/preset-env",
// "build:es6": "babel src --out-dir dist/es6",
// "build:iife": "webpack --config webpack.config.js",
// "build": "npm run build:es5 && npm run build:es6 && npm run build:iife",
