// Usage for IIFE

```
    try {
        const container = document.querySelector("#container");
        const getChecker = new colorContrast.ColorContrastChecker(container);
        getChecker.init();
    } catch (error) {
        console.error("Error initializing ColorContrastChecker:", error.message);
    }
```
