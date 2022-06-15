require('dotenv').config();
const ftp = require("basic-ftp");

let {
    HOST,
    USER,
    PASS
} = process.env;

class ForceFtpCleaning {
    #client = new ftp.Client();
    #options = {};

    constructor(options = {}){
        this.#options = options;
    };
    
    setClientOptions(options){
        let keys = Object.keys(options);

        for(let indice of keys){
            Object.assign(this.#client[indice], options[indice]);
        }

        return this.#client
    }

    closeClient(){
        this.#client.close();
    }

    async connectClient(){
        try{
            await this.#client.access({
                host: HOST,
                user: USER,
                password: PASS
            });

            return this.#client;
        }catch(e){
            this.#client.close();
            return new Error(e.message);
        }
    }

    async listAllDir(dir = false){
        try{
            return await this.#list(dir, 2);
        }catch(e){
            return [];
        }
    }

    async listAllFiles(dir = false){
        try{
            return await this.#list(dir, 1);
        }catch(e){
            return [];
        }
    }

    async deleteFile(dir){
        try{
            console.log('deleting file in path: ' + dir);
            await this.#client.remove(dir);
        }catch(e){
            console.log('error delete: ' + dir)
        }
    }

    async #list(path = null, type = 1){
        let resolve = path && typeof path === "string" ? path :
                        path && typeof path === "object" ? this.resolve(...path) : undefined;
        let list = await this.#client.list(resolve);
        let onlyDir = new Array;
        
        for(let indice of list){
            if(indice.type === type){
                onlyDir.push(indice.name);
            }
        };

        if(this.#options.closeEachJob === true) this.closeClient();
        return onlyDir;
    }

    resolve(){
        let list = [].slice.call(arguments, 0), res = [], response = [];

        for(let indice of list){
            if(indice && typeof indice === "string"){
                if(indice.indexOf('../') !== -1){
                    if(res.length < 1)
                        res.push(indice);
                    else
                        res.pop();
                }

                if(indice.indexOf('../') === -1) res.push(indice);
            }
        }

        for(let i = 0; i < res.length; i++){
            if(i === 0) response.push('/');
            response.push(res[i]);
            response.push('/');
        }

        return response.join('');
    }
}

exports.ForceFtpCleaning = ForceFtpCleaning;