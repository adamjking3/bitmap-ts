class RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor() {
    this.r = this.g = this.b = this.a = 0;
  }
}

export class Bitmap {

  private _bitmap;
  private _file;

  constructor(file: File) {
    this._bitmap = {};
    this._file = file;
  }

  public read(callback: any) {
    let reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      let arrayBuffer: ArrayBuffer = reader.result;
      this.decodeHeader(arrayBuffer);
      this.decodeHeaderInfo(arrayBuffer);
      this.decodePalette(arrayBuffer);
      this.decodeImageData(arrayBuffer);
      console.log(this._bitmap);

      callback(this);
    };
    reader.readAsArrayBuffer(this._file);
  }

  private decodeHeader(buffer: ArrayBuffer) {
      let header: DataView;
      // Header (14 bytes)
      header = new DataView(buffer, 0, 14);
      this._bitmap.header = {};
      this._bitmap.header.type = header.getUint16(0, true);
      if (this._bitmap.header.type.toString("16") !== "4d42") {
        throw("Invalid type, should be BMP");
      }
      this._bitmap.header.size = header.getUint32(2, true);
      this._bitmap.header.reserved1 = header.getUint16(6, true);
      this._bitmap.header.reserved2 = header.getUint16(8, true);
      this._bitmap.header.offset = header.getUint32(10, true);
  }

  private decodeHeaderInfo(buffer: ArrayBuffer) {
      let infoHeader: DataView;
      // Header (40 bytes)
      infoHeader = new DataView(buffer, 14, 40);
      this._bitmap.infoHeader = {};
      this._bitmap.infoHeader.size = infoHeader.getUint32(0, true);
      this._bitmap.infoHeader.width = infoHeader.getUint32(4, true);
      this._bitmap.infoHeader.height = infoHeader.getUint32(8, true);
      this._bitmap.infoHeader.planes = infoHeader.getUint16(12, true);
      this._bitmap.infoHeader.bitsPerPixel = infoHeader.getUint16(14, true);
      this._bitmap.infoHeader.compression = infoHeader.getUint32(16, true);
      this._bitmap.infoHeader.imageSize = infoHeader.getUint32(20, true);
      this._bitmap.infoHeader.horizontalRes = infoHeader.getUint32(24, true);
      this._bitmap.infoHeader.verticalRes = infoHeader.getUint32(28, true);
      this._bitmap.infoHeader.numberColors = infoHeader.getUint32(32, true);
      this._bitmap.infoHeader.importantColors = infoHeader.getUint32(36, true);
  }

  private decodePalette(buffer: ArrayBuffer) {
      let colors: number = 0;
      // Check if has palette
      if (this._bitmap.infoHeader.bitsPerPixel <= 8) {
        // has palette
        if ((colors = this._bitmap.infoHeader.numberColors) === 0) {
          colors = Math.pow(2, this._bitmap.infoHeader.bitsPerPixel);
          this._bitmap.infoHeader.numberColors = colors;
        }
        // PALETTE STORAGE
        let palette: DataView = new DataView(buffer, this._bitmap.infoHeader.size + 14, colors * 4);
        let offset: number = 0;
        this._bitmap.palette = [];
        for (let i = 0; i < colors; i++) {
          let color: RGBA = new RGBA();
          color.b = palette.getUint8(offset++);
          color.g = palette.getUint8(offset++);
          color.r = palette.getUint8(offset++);
          color.a = palette.getUint8(offset++);
          this._bitmap.palette.push(color);
        }
      }
  }

  private decodeImageData(buffer: ArrayBuffer) {
      // Pixel storage
      this._bitmap.rowSize = Math.floor((this._bitmap.infoHeader.bitsPerPixel * this._bitmap.infoHeader.width + 31) / 32) * 4;
      this._bitmap.pixelArraySize = this._bitmap.rowSize * Math.abs(this._bitmap.infoHeader.height);
      this._bitmap.pixels = new Uint8Array(buffer, this._bitmap.header.offset);
      let data;
      switch (this._bitmap.infoHeader.bitsPerPixel) {
        case 1:
          data = this.decodeBit1();
          break;
        case 2:
          data = this.decodeBit2();
          break;
        case 4:
          data = this.decodeBit4();
          break;
        case 8:
          data = this.decodeBit8();
          break;
        case 16:
          // no tested
          data = this.decodeBit16();
          break;
        case 24:
          data = this.decodeBit24();
          break;
        default:
          throw("Not supported");
      }

      this._bitmap.current = {};
      this._bitmap.defaultData = this._bitmap.current.data = data;
      this._bitmap.current.width = this._bitmap.infoHeader.width;
      this._bitmap.current.height = this._bitmap.infoHeader.height;
  }

  private decodeBit1(): Uint8ClampedArray {
      let width: number = this._bitmap.infoHeader.width;
      let height: number = this._bitmap.infoHeader.height;
      let bmpdata: any = this._bitmap.pixels;
      let data: any = new Uint8ClampedArray(width * height * 4);
      let palette: RGBA[] = this._bitmap.palette;
      let pos: number = 0;
      let xlen: number = Math.ceil(width / 8);
      let mode: number = xlen % 4;
      for (let y: number = height - 1; y >= 0; y--) {
        for (let x: number = 0; x < xlen; x++) {
          let b: number = bmpdata[pos++];
          let location: number = y * width * 4 + x * 8 * 4;
          for (let i: number = 0; i < 8; i++) {
            if (x * 8 + i < width) {
              let rgb: RGBA = palette[((b >> (7 - i)) & 0x1)];
              data[location + i * 4] = rgb.r;
              data[location + i * 4 + 1] = rgb.g;
              data[location + i * 4 + 2] = rgb.b;
              data[location + i * 4 + 3] = 0xFF;
            } else {
              break;
            }
          }
        }

        if (mode !== 0) {
          pos += (4 - mode);
        }
      }

      return data;

  }

  private decodeBit2(): Uint8ClampedArray {
      let width: number = this._bitmap.infoHeader.width;
      let height: number = this._bitmap.infoHeader.height;
      let bmpdata = this._bitmap.pixels;
      let data: any = new Uint8ClampedArray(width * height * 4);
      let palette: RGBA[] = this._bitmap.palette;
      let pos = 0;
      let xlen: number = Math.ceil(width / 4);
      let mode: number = xlen % 4;
      for (let y: number = height - 1; y >= 0; y--) {
        for (let x: number = 0; x < xlen; x++) {
          let b: number = bmpdata[pos++];
          let location: number = y * width * 4 + x * 4 * 4;
          for (let i: number = 0; i < 4; i++) {
            if (x * 4 + i < width) {
              let rgb: RGBA = palette[((b >> (3 - i)) & 0x2)];
              data[location + i * 4] = rgb.r;
              data[location + i * 4 + 1] = rgb.g;
              data[location + i * 4 + 2] = rgb.b;
              data[location + i * 4 + 3] = 0xFF;
            } else {
              break;
            }
          }
        }

        if (mode !== 0) {
          pos += (4 - mode);
        }
      }

      return data;
  }

  private decodeBit4(): Uint8ClampedArray {
      let width: number = this._bitmap.infoHeader.width;
      let height: number = this._bitmap.infoHeader.height;
      let bmpdata = this._bitmap.pixels;
      let data: any = new Uint8ClampedArray(width * height * 4);
      let palette: RGBA[] = this._bitmap.palette;
      let pos: number = 0;
      let xlen: number = Math.ceil(width / 2);
      let mode: number = xlen % 4;
      for (let y: number = height - 1; y >= 0; y--) {
       for (let x: number = 0; x < xlen; x++) {
         let b: number = bmpdata[pos++];
         let location: number = y * width * 4 + x * 2 * 4;

         // Split 8 bits
         // extract left 4-bits
         let before: number = b >> 4;
         // extract right 4-bits
         let after: number = b & 0x0F;

         let rgb: RGBA = palette[before];
         data[location] = rgb.r;
         data[location + 1] = rgb.g;
         data[location + 2] = rgb.b;
         data[location + 3] = 0xFF;

         if (x * 2 + 1 >= width) break;

         rgb = palette[after];
         data[location + 4] = rgb.r;
         data[location + 4 + 1] = rgb.g;
         data[location + 4 + 2] = rgb.b;
         data[location + 4 + 3] = 0xFF;
       }

       if (mode !== 0) {
         pos += (4 - mode);
       }
      }

      return data;
  }

  private decodeBit8(): Uint8ClampedArray {

      let width: number = this._bitmap.infoHeader.width;
      let height: number = this._bitmap.infoHeader.height;
      let bmpdata = this._bitmap.pixels;
      let data: any = new Uint8ClampedArray(width * height * 4);
      let pos: number = 0;
      let palette: RGBA[] = this._bitmap.palette;
      let mode: number = width % 4;
      for (let y: number = height - 1; y >= 0; y--) {
        for (let x: number = 0; x < width; x++) {
          let b: number = bmpdata[pos++];
          let location: number = y * width * 4 + x * 4;
          if (b < palette.length) {
            let rgb: RGBA = palette[b];
            data[location] = rgb.r;
            data[location + 1] = rgb.g;
            data[location + 2] = rgb.b;
            data[location + 3] = 0xFF;
          } else {
            data[location] = 0xFF;
            data[location + 1] = 0xFF;
            data[location + 2] = 0xFF;
            data[location + 3] = 0xFF;
          }
        }
        if (mode !== 0) {
          pos += (4 - mode);
        }
      }

      return data;
  }

  private decodeBit16(): Uint8ClampedArray {
    let width: number = this._bitmap.infoHeader.width;
    let height: number = this._bitmap.infoHeader.height;
    let bmpdata = this._bitmap.pixels;
    let data: any = new Uint8ClampedArray(width * height * 4);
    let pos: number = 0;
    let palette: RGBA[] = this._bitmap.palette;
    let mode: number = width % 4;
    for (let y: number = height - 1; y >= 0; y--) {
      for (let x: number = 0; x < width; x++) {
        let b: number = (bmpdata[pos++] << 8) | bmpdata[pos++];
        let location: number = y * width * 4 + x * 4;
        if (b < palette.length) {
          let rgb: RGBA = palette[b];
          data[location] = rgb.r;
          data[location + 1] = rgb.g;
          data[location + 2] = rgb.b;
          data[location + 3] = 0xFF;
        } else {
          data[location] = 0xFF;
          data[location + 1] = 0xFF;
          data[location + 2] = 0xFF;
          data[location + 3] = 0xFF;
        }
      }
      if (mode !== 0) {
        pos += (4 - mode);
      }
    }

    return data;
  }

  private decodeBit24(): Uint8ClampedArray {
      let width: number = this._bitmap.infoHeader.width;
      let height: number = this._bitmap.infoHeader.height;
      let bmpdata = this._bitmap.pixels;
      let data: any = new Uint8ClampedArray(width * height * 4);
      let pos: number = 0;
      for (let y: number = height - 1; y >= 0; y--) {
          for (let x: number = 0; x < width; x++) {
            let color: RGBA = new RGBA();
            color.b = bmpdata[pos++];
            color.g = bmpdata[pos++];
            color.r = bmpdata[pos++];
            let location = y * width * 4 + x * 4;
            data[location] = color.r;
            data[location + 1] = color.g;
            data[location + 2] = color.b;
            data[location + 3] = 0xFF;
          }
          pos += (width % 4);
        }
      return data;
  }

  public currentData(): Uint8ClampedArray {
    if ( this.checkCurrentData() ) {
      return this._bitmap.current.data;
    } else {
      throw("Not current data");
    }
  }

  public checkCurrentData(): boolean {
    return this._bitmap.current.data ? true : false;
  }

  public negative() {

    for (let i: number = 0; i < (this._bitmap.current.data.length / 4); i++) {
      let pos = i * 4;
      this._bitmap.current.data[pos] = 255 - this._bitmap.current.data[pos];
      this._bitmap.current.data[pos + 1] = 255 - this._bitmap.current.data[pos + 1];
      this._bitmap.current.data[pos + 2] = 255 - this._bitmap.current.data[pos + 2];
    }
  }

  public rotate90CW() {
    let data: Uint8ClampedArray = this.currentData();
    let width: number = this._bitmap.current.width;
    let height: number = this._bitmap.current.height;
    let dataRotated: Uint8ClampedArray = new Uint8ClampedArray(data.length);
    let i: number = 0;
    for (let x = 0; x < width ; x++) {
      for (let y = height - 1; y >= 0; y--) {
        let pos: number = width * y * 4 + (x * 4);
        dataRotated[i] = data[pos];
        dataRotated[i + 1] = data[pos + 1];
        dataRotated[i + 2] = data[pos + 2];
        dataRotated[i + 3] = data[pos + 3];
        i = i + 4;
      }
    }
    this._bitmap.current.width = height;
    this._bitmap.current.height = width;
    this._bitmap.current.data = dataRotated;
  }

  public rotate180() {
    this.rotate90CW();
    this.rotate90CW();
  }

  public rotate270CW() {
    this.rotate90CW();
    this.rotate90CW();
    this.rotate90CW();
  }

  public rotate90CCW() {
    let data: Uint8ClampedArray = this.currentData();
    let width: number = this._bitmap.current.width;
    let height: number = this._bitmap.current.height;
    let dataRotated: Uint8ClampedArray = new Uint8ClampedArray(data.length);
    let i: number = 0;
    for (let x = width - 1 ; x >= 0 ; x--) {
      for (let y = 0; y < height; y++) {
        let pos: number = width * y * 4 + (x * 4);
        dataRotated[i] = data[pos];
        dataRotated[i + 1] = data[pos + 1];
        dataRotated[i + 2] = data[pos + 2];
        dataRotated[i + 3] = data[pos + 3];
        i = i + 4;
      }
    }
    this._bitmap.current.width = height;
    this._bitmap.current.height = width;
    this._bitmap.current.data = dataRotated;
  }

  public rotate270CCW() {
    this.rotate90CCW();
    this.rotate90CCW();
    this.rotate90CCW();
  }

  public verticalFlip() {
    let data: Uint8ClampedArray = this.currentData();
    let width: number = this._bitmap.current.width;
    let height: number = this._bitmap.current.height;
    let dataFliped: Uint8ClampedArray = new Uint8ClampedArray(data.length);
    let i: number = 0;
    for (let x = height - 1 ; x >= 0 ; x--) {
      for (let y = 0; y < width; y++) {
        let pos: number = width * x * 4 + (y * 4);
        dataFliped[i] = data[pos];
        dataFliped[i + 1] = data[pos + 1];
        dataFliped[i + 2] = data[pos + 2];
        dataFliped[i + 3] = data[pos + 3];
        i = i + 4;
      }
    }
    this._bitmap.current.data = dataFliped;
  }

  public horizontalFlip() {
    let data: Uint8ClampedArray = this.currentData();
    let width: number = this._bitmap.current.width;
    let height: number = this._bitmap.current.height;
    let dataFliped: Uint8ClampedArray = new Uint8ClampedArray(data.length);
    let i: number = 0;
    for (let x: number = 0; x < height ; x++) {
      for (let y: number = width - 1; y >= 0; y--) {
        let pos: number = width * x * 4 + (y * 4);
        dataFliped[i] = data[pos];
        dataFliped[i + 1] = data[pos + 1];
        dataFliped[i + 2] = data[pos + 2];
        dataFliped[i + 3] = data[pos + 3];
        i = i + 4;
      }
    }
    this._bitmap.current.data = dataFliped;
  }

  public drawOnCanvas(canvas: HTMLCanvasElement) {
      /* scale and center image*/
      let width: number = this._bitmap.current.width;
      let height: number = this._bitmap.current.height;
      canvas.style.display = "none";
      let w: number = canvas.width;
      let h: number = canvas.height;
      canvas.height = height;
      canvas.width = width;
      let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
      let imageData: ImageData = ctx.createImageData(width, height);
      imageData.data.set(this._bitmap.current.data);
      ctx.putImageData(imageData, 0, 0);
      let imageObject: any = new Image();
      imageObject.onload = () => {
        let ratio: number = width / height;
        let windowRatio: number = w / h;
        let scale: number = w / width;
        if (windowRatio > ratio) {
          scale = h / height;
        }
        canvas.height = h;
        canvas.width = w;
        ctx.clearRect(0, 0, width, height);
        ctx.scale(scale, scale);
        ctx.drawImage(imageObject, 0, 0);
        canvas.style.display = "block";
      };
      imageObject.src = canvas.toDataURL();
  }


}