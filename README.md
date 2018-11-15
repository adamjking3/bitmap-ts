# bitmap-ts

A typescript library for loading, transforming, and filtering BMP images, directly from the browser.
This is a port from RequireJS to NPM (https://github.com/testica/bitmap-ts).

# Installation

```$ npx install bitmap-ts```

OR

```$ yarn add bitmap-ts```

# Example Usage

```
import { Bitmap } from 'bitmap-ts';

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file: File = event.target.files![0];
    const bmp = new Bitmap(file);

    bmp.read((response: Bitmap) => {
      this.imageData = response.currentData();
    });

    const image = new Image();

    image.onload = () => {
      this.imageHeight = image.height;
      this.imageWidth = image.width;
    };

    image.src = URL.createObjectURL(file);
}
```

----
**Credits: Leonardo Testa & Carlos Abreu**
