import {Bitmap} from "./bitmap";

declare var saveAs: any;

// File Object
let file: File;
let bmp: Bitmap;
let canvas: any = document.getElementById("canvas1");
let modal: HTMLElement = document.getElementById("myModal");
let properties: [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
let histogram_r: any = document.getElementById("histogram_r");
let histogram_g: any = document.getElementById("histogram_g");
let histogram_b: any = document.getElementById("histogram_b");
let histogram_avg: any = document.getElementById("histogram_avg");

function handleFileSelect(evt: any) {
    file = evt.target.files[0];
    bmp = new Bitmap(file);
    bmp.read((response: Bitmap) => {
      document.getElementById("options").style.display = "block";
      bmp = response;
      properties = [
        document.getElementById("width"),
        document.getElementById("height"),
        document.getElementById("bitsDepth"),
        document.getElementById("size")
      ];
      bmp.drawProperties(properties);
      bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
      bmp.drawOnCanvas(canvas);

    });
}

// EventListene when file input is changed
document.getElementById("file").addEventListener("change", handleFileSelect, false);
// BUTTONS FUNCTIONS

// Negative
document.getElementById("negative").addEventListener("click", () => {
  bmp.negative();
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});
// Rotate 90 CW
document.getElementById("rotate90CW").addEventListener("click", () => {
  bmp.rotate90CW();
  bmp.drawOnCanvas(canvas);
});
// Rotate 180
document.getElementById("rotate180").addEventListener("click", () => {
  bmp.rotate180();
  bmp.drawOnCanvas(canvas);
});
// Rotate 270 CW
document.getElementById("rotate270CW").addEventListener("click", () => {
  bmp.rotate270CW();
  bmp.drawOnCanvas(canvas);
});
// Rotate 90 CCW
document.getElementById("rotate90CCW").addEventListener("click", () => {
  bmp.rotate90CCW();
  bmp.drawOnCanvas(canvas);
});
// Rotate 270 CCW
document.getElementById("rotate270CCW").addEventListener("click", () => {
  bmp.rotate270CCW();
  bmp.drawOnCanvas(canvas);
});
// Horizontal Flip
document.getElementById("horizontalFlip").addEventListener("click", () => {
  bmp.horizontalFlip();
  bmp.drawOnCanvas(canvas);
});
// Vertical Flip
document.getElementById("verticalFlip").addEventListener("click", () => {
  bmp.verticalFlip();
  bmp.drawOnCanvas(canvas);
});
// Brightness
document.getElementById("brightnessBtn").addEventListener("click", () => {
  let value: number = + (<HTMLInputElement>document.getElementById("brightness")).value;
  bmp.brightness(value);
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});
// contrast
document.getElementById("contrastBtn").addEventListener("click", () => {
  let value: number = + (<HTMLInputElement>document.getElementById("contrast")).value;
  bmp.contrast(value);
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});
// equalization
document.getElementById("equalization").addEventListener("click", () => {
  bmp.equalization();
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// umbralization
document.getElementById("umbralization").addEventListener("click" , () => {
  let minValue: number = + (<HTMLInputElement>document.getElementById("minValueUmbral")).value;
  let maxValue: number = + (<HTMLInputElement>document.getElementById("maxValueUmbral")).value;

  bmp.umbralization(minValue, maxValue);
  bmp.drawHistogram(histogram_r , histogram_g , histogram_b , histogram_avg);
  bmp.drawOnCanvas(canvas);

});
document.getElementById("save").addEventListener("click", () => {
  bmp.saveFile((file: Blob) => {
    saveAs(file, "image.bmp");
  });
});
// open modal
document.getElementById("openModal").addEventListener("click", () => {
  modal.style.display = "block";
  /*span to close*/
  document.getElementsByClassName("close")[0].addEventListener("click", () => {
    modal.style.display = "none";
    (<HTMLInputElement>document.getElementById("inputRange")).value = "1";
    (<HTMLCanvasElement>document.getElementById("zoomedCanvas")).height = 0;
    (<HTMLCanvasElement>document.getElementById("zoomedCanvas")).width = 0;
  });
  /*click outside modal to close*/
  window.addEventListener("click", () => {
    if (event.target === modal) {
        (<HTMLInputElement>document.getElementById("inputRange")).value = "1";
        modal.style.display = "none";
        (<HTMLCanvasElement>document.getElementById("zoomedCanvas")).height = 0;
        (<HTMLCanvasElement>document.getElementById("zoomedCanvas")).width = 0;
    }
  });
  /* show original canvas*/
  bmp.drawOnCanvas(<HTMLCanvasElement>document.getElementById("originalCanvas"));

  document.getElementById("inputRange").addEventListener("change", () => {
    let input: number = +(<HTMLInputElement>document.getElementById("inputRange")).value;
    // zoom image
    bmp.drawOnCanvas(<HTMLCanvasElement>document.getElementById("originalCanvas"));
    if ((<HTMLInputElement> document.getElementsByName("algorithm")[0]).checked) {
      bmp.drawOnCanvasWithZoom(<HTMLCanvasElement>document.getElementById("zoomedCanvas"), input, "neighbor");
    } else {
      bmp.drawOnCanvasWithZoom(<HTMLCanvasElement>document.getElementById("zoomedCanvas"), input, "interpolation");
    }
  });
});
// scale
document.getElementById("scaleBtn").addEventListener("click", () => {
  let scaleWidth: number = + (<HTMLInputElement>document.getElementById("scaleWidth")).value;
  let scaleHeight: number = + (<HTMLInputElement>document.getElementById("scaleHeight")).value;
  if ((<HTMLInputElement> document.getElementsByName("algorithm")[0]).checked) {
    // neighbor algorithm
    bmp.scale(scaleWidth, scaleHeight, "neighbor");
    bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
    bmp.drawOnCanvas(canvas);
  } else {
    // interpolation algorithm
    bmp.scale(scaleWidth, scaleHeight, "interpolation");
    bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
    bmp.drawOnCanvas(canvas);
  }
});
// rotate
document.getElementById("rotateBtn").addEventListener("click", () => {
  let rotateAngle: number = + (<HTMLInputElement>document.getElementById("rotateAngle")).value;

  // interpolation algorithm
  bmp.rotate((rotateAngle * Math.PI) / 180);
  bmp.drawOnCanvas(canvas);
});

// box blurring
document.getElementById("boxBlur").addEventListener("click", () => {
  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;

  bmp.kernel(input, input);
  bmp.blur("box");
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// gauss blurring
document.getElementById("gaussBlur").addEventListener("click", () => {
  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;

  bmp.kernel(input, input);
  bmp.blur("gauss");
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// prewitt edge
document.getElementById("prewittEdge").addEventListener("click", () => {
  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;

  bmp.kernel(3, 3);
  bmp.edge("prewitt");
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// sobel edge
document.getElementById("sobelEdge").addEventListener("click", () => {
  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;

  bmp.kernel(3, 3);
  bmp.edge("sobel");
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// outline
document.getElementById("l1").addEventListener("click", () => {
  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;

  bmp.kernel(3, 3);
  bmp.outline(false);
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// outline with identity
document.getElementById("l2").addEventListener("click", () => {
  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;

  bmp.kernel(3, 3);
  bmp.outline(true);
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// custom filter
document.getElementById("customFilter").addEventListener("click", () => {

  let input: number = +(<HTMLInputElement>document.getElementById("inputKernel")).value;
  let matrix: HTMLElement = <HTMLElement>document.querySelector("#kernelMatrix");
  matrix.innerHTML = "";
  for (let y: number = 0; y < input; y++) {
    let row: string = "";
    for (let x: number = 0; x < input; x++) {
      row += "<th><input type='number' id='matrix" + (y * input + x) + "' value=1></th>";
    }
    let tr: HTMLElement = document.createElement("tr");
    tr.innerHTML = row;
    matrix.appendChild(tr);
  }
  document.getElementById("custom").style.display = "block";
  // close
  document.getElementsByClassName("close")[1].addEventListener("click", () => {
    document.getElementById("custom").style.display = "none";
  });

  // apply filter
  document.getElementById("btnCustom").addEventListener("click", () => {
    let custom: number[] = new Array<number>(input * input);
    for (let y: number = 0; y < input; y++) {
      for (let x: number = 0; x < input; x++) {
        custom[y * input + x] = +(<HTMLInputElement>document.getElementById("matrix" + (y * input + x))).value;
      }
    }
    document.getElementById("custom").style.display = "none";
    bmp.kernel(input, input, custom);
    bmp.customFilter();
    bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
    bmp.drawOnCanvas(canvas);
  });
});

// undo
document.getElementById("undo").addEventListener("click", () => {
  if (bmp.undo()) {
    bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
    bmp.drawOnCanvas(canvas, true);
  }
});

// redo
document.getElementById("redo").addEventListener("click", () => {
  if (bmp.redo()) {
    bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
    bmp.drawOnCanvas(canvas, true);
  }
});
