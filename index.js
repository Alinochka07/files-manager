import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { createGunzip, createGzip } from 'zlib';
import readline from 'readline';


const username = process.argv[2].replace('--username=', '');

const printCurrentDirectory = () => {
    console.log(`You are currently in ${process.cwd()}`);
}

const handleError = (error) => {
    console.error('Operation failed');
    console.error(error);
}

const listDirectoryContents = () => {
    const files = fs.readdirSync(process.cwd()).sort();
    const directories = [];
    const fileList = [];

    files.map(file => {
        const filePath = path.join(process.cwd(), file);
        const stats = fs.statSync(filePath);
        if(stats.isDirectory()) {
            directories.push(file);
        } else {
            fileList.push(file);
        }
    });
    directories.sort();
    fileList.sort();

    console.log('(index) |           Name           |      Type      ');
    console.log('----------------------------------------------------');

    directories.forEach((dir, index) => {
        console.log(`${centerAlign(index.toString(), 8)}|${centerAlign(dir, 25)} |${centerAlign("'directory'", 15)}|`);
    });

    fileList.forEach((file, index) => {
        console.log(`${centerAlign((directories.length + index).toString(), 8)}|${centerAlign(file, 25)} |${centerAlign("'file'", 15)}|`);
    });
};
function centerAlign(text, width) {
    const padding = width - text.length;
    const paddingLeft = Math.floor(padding / 2);
    const paddingRight = padding - paddingLeft;
    return text.padStart(paddingLeft + text.length).padEnd(paddingRight + paddingLeft + text.length);
}

const readFileContent = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        console.log(data);
    } catch (error) {
        handleError(error);
    }
}

const createNewFile = (fileName) => {
    fs.writeFileSync(fileName, '', err => {
        if (err) {
            handleError(err);
        }
    });
    console.log(`File ${fileName} created successfully!`);
}

const renameFile = (oldPath, newPath) => {
    fs.rename(oldPath, newPath, err => {
        if (err) {
            handleError(err);
        }
    });
    console.log(`File renamed successfully to ${newPath}`);
}

const copyFile = (sourceFile, destinationFile) => {
    const readStream = fs.createReadStream(sourceFile);
    const writeStream = fs.createWriteStream(destinationFile);

    readStream.on('error', (error) => {
        handleError(error);
        console.error(`Error reading file ${sourceFile}`);
    });

    writeStream.on('error', (error) => {
        console.error(`Error writing to file ${destinationFile}: ${error}`);
        fs.unlink(destinationFile, (unlinkError) => {
            if (unlinkError) {
                console.error(`Error removing partially copied file ${destinationFile}: ${unlinkError}`);
            }
            handleError();
        });
    });

    writeStream.on('finish', () => {
        console.log(`File copied successfully from ${sourceFile} to ${destinationFile}`);
    });
    readStream.pipe(writeStream);
}

const moveFile = async (sourceFile, movedFile) => {
    try {
        await copyFile(sourceFile, movedFile);
        await fs.promises.unlink(sourceFile);
        console.log(`File moved successfully from ${sourceFile} to ${movedFile}`);
    } catch (error) {
        console.error(`Error moving file ${sourceFile} to ${movedFile}: ${error}`);
        try {
            await fs.promises.unlink(movedFile);
            console.log(`Partially moved file ${movedFile} removed.`);
        } catch (unlinkError) {
            console.error(`Error removing partially moved file ${movedFile}: ${unlinkError}`);
        }
        handleError();
    }
}

const deleteFile = (filePath) => {
    fs.unlink(filePath, err => {
        err && handleError(err);
    });
    console.log(`File ${filePath} deleted successfully`);
}

const getEOL = () => {
    console.log(`End-Of-Line character: ${os.EOL}`);
}

const getCPUInfo = () => {
    console.log(`Total CPUs: ${os.cpus().length}`);
    os.cpus().map((cpu, index) => {
        console.log(`CPU ${index + 1}: Model ${cpu.model}, Speed ${cpu.speed}GHz`);
    });
}

const getHomeDirectory = () => {
    console.log(`Home Directory: ${os.homedir()}`);
}

const getCurrentUsername = () => {
    console.log(`Current Username: ${os.userInfo().username}`)
}

const getCPUArchitecture = () => {
    console.log(`CPU Architecture: ${os.arch()}`);
}

const calculateHash = (filePath) => {
    const hash = crypto.createHash('sha256');
    const input = fs.createReadStream(filePath);
    input.on('data', chunk => {
        hash.update(chunk);
    });
    input.on('end', () => {
        console.log(`Hash of ${filePath}: ${hash.digest('hex')}`)
    });
    input.on('error', handleError);
}

const compressFile = (source, destination) => {
    const gzip = createGzip();
    const inputStream = fs.createReadStream(source);
    const outputStream = fs.createWriteStream(destination + '.gz');
    inputStream.pipe(gzip).pipe(outputStream);
    console.log(`File compressed successfully ${destination}.gz`);
}

const decompressFile = (source, destination) => {
    const gunzip = createGunzip();
    const inputStream = fs.createReadStream(source);
    const outputStream = fs.createWriteStream(destination);
    inputStream.pipe(gunzip).pipe(outputStream);
    console.log(`File decompressed successfully. Check: ${destination}`)
}

const main = () => {
    const readLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    readLine.setPrompt('\nEnter command: ');
    readLine.prompt();

    readLine.on('line', (input) => {
        if (input.trim() === '.exit') {
            closeProgram();
        } else {
            const [command, ...args] = input.trim().split(' ');
            switch (command) {
                case 'up':
                    const currentDir = process.cwd();
                    const parentDir = path.dirname(currentDir);
    
                    parentDir === currentDir && console.log('Already at the root directory');
                    process.chdir(parentDir);
                    console.log(`Moved up to directory: ${parentDir}`);
                    break
                case 'cd':
                    if (args.length !== 1) {
                        console.log('Invalid input');
                        break;
                    }
                    const newDir = args[0];
                    const targetDir = path.resolve(process.cwd(), newDir);
                
                    fs.stat(targetDir, (err, stats) => {
                        if (err) {
                            console.error('Operation failed');
                            console.error(err);
                        }
                
                        if (!stats.isDirectory()) {
                            console.log(`${newDir} is not a directory`);
                        } else {
                            process.chdir(targetDir);
                            console.log(`Changed directory to ${targetDir}`);
                            printCurrentDirectory();
                        }
                        readLine.prompt();
                    });
                    return;
                case 'ls':
                    listDirectoryContents();
                    break;
                case 'cat':
                    readFileContent(args[0]);
                    break;
                case 'add':
                    createNewFile(args[0]);
                    break;
                case 'rn':
                    renameFile(args[0], args[1]);
                    break;
                case 'cp':
                    copyFile(args[0], args[1]);
                    break;
                case 'mv':
                    moveFile(args[0], args[1]);
                    break;
                case 'rm':
                    deleteFile(args[0]);
                    break;
                case 'os':
                    switch (args[0]) {
                        case '--EOL':
                            getEOL();
                            break;
                        case '--cpus':
                            getCPUInfo();
                            break;
                        case '--homedir':
                            getHomeDirectory();
                            break;
                        case '--username':
                            getCurrentUsername();
                            break;
                        case '--architecture':
                            getCPUArchitecture();
                            break;
                        default:
                            console.log('Invalid input');
                    }
                    break;
                case 'hash':
                    calculateHash(args[0], args[1]);
                    break;
                case 'compress':
                    compressFile(args[0], args[1]);
                    break;
                case 'decompress':
                    decompressFile(args[0], args[1]);
                    break;
                default:
                    console.log('Invalid input');
            }
        }
        printCurrentDirectory();
        readLine.prompt();
    });
    const closeProgram = () => {
        console.log('Closing program...');
        readLine.close();
    };
    process.on('SIGINT', () => {
        closeProgram();
    });
    readLine.on('close', () => {
        console.log(`Thank you for using File Manager, ${username}, goodbye!`);
        process.exit(0);
    });
    readLine.on('error', (err) => {
        console.error('An error occurred:');
        console.error(err);
        readLine.setPrompt('\nEnter command: ');
        readLine.prompt();
    });
}

console.log(`Welcome to the File Manager, ${username}!`);
main();

