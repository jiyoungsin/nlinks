import { exit } from "process";
const { UrlChecker } = require("broken-link-checker");

export function cli(args){

    if(args[2] == undefined){
        console.log("Steps on how this cli works");
        console.log("You should run like this 'nlinks <filename or link>'");
        exit();
    }

    const fs = require('fs');
    const readline = require('readline');

    async function processLineByLine() {
        const fileStream = fs.createReadStream(args[2]);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let i = 1;
        for await (const line of rl) {
            var myArray = line.replace(/<(.|\n)*?>/g, "");
            //console.log(`${myArray}` );

            const siteChecker = new UrlChecker(
                { 
                    excludeInternalLinks: false,
                    excludeExternalLinks: false, 
                    filterLevel: 0,
                    acceptedSchemes: ["http", "https"]
                },
                {
                    "error": (error) => {
                        console.error(error);
                    },
                    "link": (result) => {
                    
                        let msg = "";
                        if(result.http.response) {
                            switch(result.http.response.statusCode) {
                                case 200:
                                    msg = "GOOD";
                                    break;
                                case 400:
                                case 404:
                                    msg = "BAD";
                                    break;
                                default:
                                    msg = "UNKNOWN";
                            }
                           
                            console.log(`${i++} = ${msg} == ${result.http.response.statusCode} => ${result.url.original}`);
                        }
                        
                    },
                    "end": () => {
                        //console.log("COMPLETED!");
                    }
                }
            );
            siteChecker.enqueue(myArray);
        }
    }

    processLineByLine();

}