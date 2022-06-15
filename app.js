const { ForceFtpCleaning } = require('./src/core');
const { promise } = require('fastq');
const { uniq } = require('lodash');

let controller = new ForceFtpCleaning({
    // closeEachJob: true
});

controller.setClientOptions({
    ftp: {
        verbose: false
    }
});

function pattern(array){
    let res = []

    for(let indice of array){
        if(typeof indice === "string"){
            let s = indice.split('-');
            for(let e of s){
                if(
                    typeof e === "string" &&
                    e.endsWith('x', 4) ||
                    e.endsWith('x', 5) ||
                    e.endsWith('x', 3) &&
                    e.match('.')
                )   res.push(indice)
            }
        }
    }

    return res;
}

(async function(){
    var listDir = {}, listFiles = new Array;
    let queue = promise(controller.deleteFile, 10);

    await controller.connectClient();
    await controller.listAllDir(['public_html', 'wp-content', 'uploads']).then(async e => {
        e = e.filter(i => parseInt(i) > 2020 && parseInt(i) < 2022);

        for(let indice of e){
            let get = await controller.listAllDir(['public_html', 'wp-content', 'uploads', indice]);
            
            get = get.filter(i => parseInt(i) > 0 && parseInt(i) < 13);

            listDir[indice] = get; 
        }
    })


    for(let indice in listDir){
        console.log('capturando arquivos do ano: ' + indice);
        for(let e of listDir[indice]){
            console.log('comecei no mes: ' + e + '/' + indice);
            let file = await controller.listAllFiles(['public_html', 'wp-content', 'uploads', indice, e]);

            file = pattern(file);

            for(let i of file){
                listFiles.push(controller.resolve('public_html', 'wp-content', 'uploads', indice, e) + i);
            }

            console.log('terminei no mes: ' + e + '/' + indice);
        }
    }
    
    listFiles = uniq(listFiles);

    console.log('ao todo são ' + listFiles.length + ' arquivos a serem excluidos');

    for(let i of listFiles){
        await controller.deleteFile(i);
        // queue.push(i)
    }
})();