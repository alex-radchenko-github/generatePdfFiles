const { PDFDocument, rgb } = require('pdf-lib')
const fontkit = require('@pdf-lib/fontkit');
const inquirer = require('inquirer');
const fs = require("fs");
const readlineSync = require('readline-sync');
var faker = require('faker');

var fullName = ''


async function modifyPdf(fullName) {

    // read the template file
    const pdfDoc = await PDFDocument.load(fs.readFileSync('./src/basePDF/base2.pdf'))

    // read font file
    const fontData = fs.readFileSync('./src/fonts/calligraph_[allfont.ru].ttf');

    // register Fontkit to connect an external font
    pdfDoc.registerFontkit(fontkit);

    // initialize the font
    const font = await pdfDoc.embedFont(fontData)

    // take the first page
    const firstPage = pdfDoc.getPages()[0]

    // determine the width and height of the first page
    const { width, height } = firstPage.getSize()

    // insert text on the first page
    firstPage.drawText(fullName, {
        x: (width/2)-(fullName.length*49),
        y: height / 2 - 300,
        size: 300,
        font: font,
        color: rgb(0, 0, 0),
    })

    // write a new PDF file with text
    fs.writeFileSync(`./temp/${fullName}.pdf`, await pdfDoc.save())

}

function menu(){
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'Choose your action',
                name: 'actions',
                choices: [
                    'Create certificates from list',
                    'Create one certificate',
                    'Delete all certificates',
                    'Exit',
                    'Create certificates from randome names'
                ],
            },
        ])
        .then(async (answers) => {
            console.info('Action is ' + answers.actions);
            switch(answers.actions) {
                case 'Create certificates from list':
                    var listNname = readlineSync.question('Specify sheet name for certificates: ');

                    var namesListFromFile = fs.readFileSync(`./src/lists/${listNname}`,'utf8');
                    namesListFromFile = namesListFromFile.split('\n');

                    for (const i in namesListFromFile) {
                        await modifyPdf(namesListFromFile[i]);

                    }
                    return menu();

                case 'Create one certificate':
                    var name = readlineSync.question('Name in the certificates: ');
                    fullName = name;
                    await modifyPdf(fullName);
                    return menu();

                case 'Delete all certificates':
                    let list  = fs.readdirSync('./temp');
                    for (const file in list) {
                        fs.unlinkSync(`./temp/${list[file]}`);
                    }
                    return menu();
                case 'Exit':
                    break;

                case 'Create certificates from randome names':
                    var count = readlineSync.question('Count of Cert: ');
                    for (let i = 0; i < +count ; i++) {
                        await modifyPdf(faker.name.findName());
                    }
                    return menu();

                default:
                    console.error('Invalid Option!')
                    break;
            }
        })
        .catch(err => {
            console.error(err);
        });
}
menu()