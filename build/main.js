define(["require", "exports", "./bitmap"], function (require, exports, bitmap_1) {
    "use strict";
    // File Object
    var file;
    var bmp;
    var canvas = document.getElementById("canvas1");
    var modal = document.getElementById("myModal");
    var properties;
    var histogram_r = document.getElementById("histogram_r");
    var histogram_g = document.getElementById("histogram_g");
    var histogram_b = document.getElementById("histogram_b");
    var histogram_avg = document.getElementById("histogram_avg");
    function handleFileSelect(evt) {
        file = evt.target.files[0];
        bmp = new bitmap_1.Bitmap(file);
        bmp.read(function (response) {
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
    document.getElementById("negative").addEventListener("click", function () {
        bmp.negative();
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 90 CW
    document.getElementById("rotate90CW").addEventListener("click", function () {
        bmp.rotate90CW();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 180
    document.getElementById("rotate180").addEventListener("click", function () {
        bmp.rotate180();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 270 CW
    document.getElementById("rotate270CW").addEventListener("click", function () {
        bmp.rotate270CW();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 90 CCW
    document.getElementById("rotate90CCW").addEventListener("click", function () {
        bmp.rotate90CCW();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 270 CCW
    document.getElementById("rotate270CCW").addEventListener("click", function () {
        bmp.rotate270CCW();
        bmp.drawOnCanvas(canvas);
    });
    // Horizontal Flip
    document.getElementById("horizontalFlip").addEventListener("click", function () {
        bmp.horizontalFlip();
        bmp.drawOnCanvas(canvas);
    });
    // Vertical Flip
    document.getElementById("verticalFlip").addEventListener("click", function () {
        bmp.verticalFlip();
        bmp.drawOnCanvas(canvas);
    });
    // Brightness
    document.getElementById("brightnessBtn").addEventListener("click", function () {
        var value = +document.getElementById("brightness").value;
        bmp.brightness(value);
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // contrast
    document.getElementById("contrastBtn").addEventListener("click", function () {
        var value = +document.getElementById("contrast").value;
        bmp.contrast(value);
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // equalization
    document.getElementById("equalization").addEventListener("click", function () {
        bmp.equalization();
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // umbralization
    document.getElementById("umbralization").addEventListener("click", function () {
        var minValue = +document.getElementById("minValueUmbral").value;
        var maxValue = +document.getElementById("maxValueUmbral").value;
        bmp.umbralization(minValue, maxValue);
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("save").addEventListener("click", function () {
        bmp.saveFile(function (file) {
            saveAs(file, "image.bmp");
        });
    });
    // open modal
    document.getElementById("openModal").addEventListener("click", function () {
        modal.style.display = "block";
        /*span to close*/
        document.getElementsByClassName("close")[0].addEventListener("click", function () {
            modal.style.display = "none";
            document.getElementById("inputRange").value = "1";
            document.getElementById("zoomedCanvas").height = 0;
            document.getElementById("zoomedCanvas").width = 0;
        });
        /*click outside modal to close*/
        window.addEventListener("click", function () {
            if (event.target === modal) {
                document.getElementById("inputRange").value = "1";
                modal.style.display = "none";
                document.getElementById("zoomedCanvas").height = 0;
                document.getElementById("zoomedCanvas").width = 0;
            }
        });
        /* show original canvas*/
        bmp.drawOnCanvas(document.getElementById("originalCanvas"));
        document.getElementById("inputRange").addEventListener("change", function () {
            var input = +document.getElementById("inputRange").value;
            // zoom image
            bmp.drawOnCanvas(document.getElementById("originalCanvas"));
            if (document.getElementsByName("algorithm")[0].checked) {
                bmp.drawOnCanvasWithZoom(document.getElementById("zoomedCanvas"), input, "neighbor");
            }
            else {
                bmp.drawOnCanvasWithZoom(document.getElementById("zoomedCanvas"), input, "interpolation");
            }
        });
    });
    // scale
    document.getElementById("scaleBtn").addEventListener("click", function () {
        var scaleWidth = +document.getElementById("scaleWidth").value;
        var scaleHeight = +document.getElementById("scaleHeight").value;
        if (document.getElementsByName("algorithm")[0].checked) {
            // neighbor algorithm
            bmp.scale(scaleWidth, scaleHeight, "neighbor");
            bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
            bmp.drawOnCanvas(canvas);
        }
        else {
            // interpolation algorithm
            bmp.scale(scaleWidth, scaleHeight, "interpolation");
            bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
            bmp.drawOnCanvas(canvas);
        }
    });
    // rotate
    document.getElementById("rotateBtn").addEventListener("click", function () {
        var rotateAngle = +document.getElementById("rotateAngle").value;
        // interpolation algorithm
        bmp.rotate((rotateAngle * Math.PI) / 180);
        bmp.drawOnCanvas(canvas);
    });
    // box blurring
    document.getElementById("boxBlur").addEventListener("click", function () {
        var input = +document.getElementById("inputKernel").value;
        bmp.kernel(input, input);
        bmp.blur("box");
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // gauss blurring
    document.getElementById("gaussBlur").addEventListener("click", function () {
        var input = +document.getElementById("inputKernel").value;
        bmp.kernel(input, input);
        bmp.blur("gauss");
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // prewitt edge
    document.getElementById("prewittEdge").addEventListener("click", function () {
        var input = +document.getElementById("inputKernel").value;
        bmp.kernel(3, 3);
        bmp.edge("prewitt");
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // sobel edge
    document.getElementById("sobelEdge").addEventListener("click", function () {
        var input = +document.getElementById("inputKernel").value;
        bmp.kernel(3, 3);
        bmp.edge("sobel");
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // outline
    document.getElementById("l1").addEventListener("click", function () {
        var input = +document.getElementById("inputKernel").value;
        bmp.kernel(3, 3);
        bmp.outline();
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // custom filter
    document.getElementById("customFilter").addEventListener("click", function () {
        var input = +document.getElementById("inputKernel").value;
        var matrix = document.querySelector("#kernelMatrix");
        matrix.innerHTML = "";
        for (var y = 0; y < input; y++) {
            var row = "";
            for (var x = 0; x < input; x++) {
                row += "<th><input type='number' id='matrix" + (y * input + x) + "' value=1></th>";
            }
            var tr = document.createElement("tr");
            tr.innerHTML = row;
            matrix.appendChild(tr);
        }
        document.getElementById("custom").style.display = "block";
        // close
        document.getElementsByClassName("close")[1].addEventListener("click", function () {
            document.getElementById("custom").style.display = "none";
        });
        // apply filter
        document.getElementById("btnCustom").addEventListener("click", function () {
            var custom = new Array(input * input);
            for (var y = 0; y < input; y++) {
                for (var x = 0; x < input; x++) {
                    custom[y * input + x] = +document.getElementById("matrix" + (y * input + x)).value;
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
    document.getElementById("undo").addEventListener("click", function () {
        if (bmp.undo()) {
            bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
            bmp.drawOnCanvas(canvas, true);
        }
    });
    // redo
    document.getElementById("redo").addEventListener("click", function () {
        if (bmp.redo()) {
            bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
            bmp.drawOnCanvas(canvas, true);
        }
    });
});
