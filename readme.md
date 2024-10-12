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
