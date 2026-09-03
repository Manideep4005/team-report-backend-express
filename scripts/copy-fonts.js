const fs = require("fs");
const path = require("path");

const source =
    path.join(
        __dirname,
        "..",
        "src",
        "utils",
        "fonts"
    );

const destination =
    path.join(
        __dirname,
        "..",
        "dist",
        "utils",
        "fonts"
    );


if (!fs.existsSync(source)) {

    throw new Error(
        `Font source directory not found: ${source}`
    );

}


fs.mkdirSync(
    destination,
    {
        recursive: true,
    }
);


const fontFiles =
    fs.readdirSync(source)
        .filter(
            file =>
                file.toLowerCase().endsWith(".ttf")
        );


if (fontFiles.length === 0) {

    throw new Error(
        `No TTF fonts found in: ${source}`
    );

}


for (
    const file of fontFiles
) {

    const sourceFile =
        path.join(
            source,
            file
        );


    const destinationFile =
        path.join(
            destination,
            file
        );


    fs.copyFileSync(
        sourceFile,
        destinationFile
    );


    console.log(
        `Copied font: ${file}`
    );

}


console.log(
    `Copied ${fontFiles.length} font files to ${destination}`
);