import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import zlib, { createGunzip, createGzip } from 'zlib';
import readline from 'readline';
import { __dirname, __fileName } from './pathHelper.js';
import { pipeline } from 'stream';


const username = process.argv[2].replace('--username=', '');
// console.log(`Welcome to the File Manager, ${username}!\n`);

// const filesDirectory = path.join(__dirname, 'files');

const printCurrentDirectory = () => {
    console.log(`You are currently in ${process.cwd()}`);
}

const handleError = (error) => {
    console.error('Operation failed');
    console.error(error);
}

const fileManagerContents = () => {
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
    console.log('Folders:');
    directories.map(directory => console.log(`- ${directory}`));
    console.log('Files:');
    files.map(file => console.log(`- ${file}`));

};

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
        } else {
            console.log(`File ${fileName} created successfully!`);
        }
    });
}

const renameFile = (oldPath, newPath) => {
    fs.rename(oldPath, newPath, err => {
        err ? handleError(err) :  console.log(`File renamed successfully to ${newPath}`)
    });
}

const copyFile = (sourceFile, destinationFile) => {
    const readStream = fs.createReadStream(sourceFile);
    const writeStream = fs.createWriteStream(destinationFile);

    readStream.on('error', handleError);
    writeStream.on('error', handleError);

    readStream.pipe(writeStream);
    readStream.on('end', () => {
        console.log(`File copied successfully to ${destinationFile}`);
        fs.unlink(sourceFile, err => {
            err && handleError(err);
        })
    });
}

const moveFile = (sourceFile, movedFile) => {
    copyFile(sourceFile, movedFile);
}

const deleteFile = (filePath) => {
    fs.unlink(filePath, err => {
        err ? handleError(err) : console.log(`File ${filePath} deleted successfully`);
    });
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

const calculateHash = () => {
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
}

const decompressFile = (source, destination) => {
    const gunzip = createGunzip();
    const inputStream = fs.createReadStream(source);
    const outputStream = fs.createWriteStream(destination);
    inputStream.pipe(gunzip).pipe(outputStream);
}

const main = () => {
    const readLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    readLine.setPrompt('Enter command: ');
    readLine.prompt();

    readLine.on('line', (input) => {
        const [command, ...args] = input.trim().split(' ');
        switch (command) {
            case 'up':
                const upperDirectory = path.join(__dirname, '../');
                console.log(`You are in ${upperDirectory} now`);
                break
            case 'cd':
                args.length !==1 && console.log('Invalid input');
                break;


            case 'ls':
                fileManagerContents();
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
        printCurrentDirectory();
        readLine.prompt();
    });
    readLine.on('close', () => {
        console.log(`Thank you for using File Manager, ${username} goodbye!`);
        process.exit(0);
    })
}

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDirectory();
main();

// const fileManager = {
//     getOSInfo:() => {
//         console.log('Operating System Information:');
//         console.log(`  Type: ${os.type()}`);
//         console.log(`  Platform: ${os.platform()}`);
//         console.log(`  Release: ${os.release()}`);
//         console.log(`  Architecture: ${os.arch()}`);
//         console.log(`  Total Memory: ${os.totalmem()} bytes`);
//         console.log(`  Free Memory: ${os.freemem()} bytes\n`);
//     },

//     // file operations
//     copyFile:(source, destination) => {
//         fs.copyFileSync(source, destination);
//         console.log(`✅ File copied successfully from ${source} to ${destination}`);
//     },

//     moveFile:(source, destination) => {
//         fs.renameSync(source, destination);
//         console.log(`\n✅ File moved successfully from ${source} to ${destination}`);
//     },

//     deleteFile:(filePath) => {
//         fs.unlinkSync(filePath);
//         console.log(`\n✅ File ${filePath} deleted successfully`);
//     },

//     renameFile:(oldPath, newPath) => {
//         fs.renameSync(oldPath, newPath);
//         console.log(`\n✅ File renamed successfully from ${oldPath} to ${newPath}`);
//     },

//     // Hash
//     calculateHash:(filePath, algorithm = 'sha256') => {
//         const hash = crypto.createHash(algorithm);
//         const fileData = fs.readFileSync(filePath);
//         hash.update(fileData);
//         console.log(`\n✅ Hash (${algorithm}) of ${filePath}: ${hash.digest('hex')}`);
//     },

//     // Compress and decompress
//     compressFile: (source, destination) => {
//         const gzip = createGzip();
//         const inputStream = fs.createReadStream(source);
//         const outputStream = fs.createWriteStream(destination);

//         pipeline(inputStream, gzip, outputStream, (err) => {
//         if (err) {
//             console.error('An error occurred:', err);
//             process.exitCode = 1;
//         } else {
//             console.log(`✅ File successfully compressed to ${destination} file`);
//             fileManager.decompressFile(destination, 'decompressed.txt');
//         }
//         });
        
//     },

//     decompressFile: (source, destination) => {
//         try {
//             const buffer = fs.readFileSync(source);
//             const decompressedBuffer = zlib.unzipSync(buffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
//             const outputPath = path.join(filesDirectory, destination);
//             fs.writeFileSync(outputPath, decompressedBuffer);
//             console.log(`✅ File decompressed successfully to ${outputPath}`);
//         } catch (err) {
//             console.error('An error occurred:', err);
//             process.exitCode = 1;
//         };
//     }
// };


// fileManager.getOSInfo();
// fileManager.copyFile(path.join(filesDirectory, 'source.txt'), path.join(filesDirectory, 'destination.txt'));
// fileManager.moveFile(path.join(filesDirectory, 'source.txt'), path.join(filesDirectory, 'moved.txt'));
// fileManager.deleteFile(path.join(filesDirectory, 'delete.txt'));
// fileManager.renameFile(path.join(filesDirectory, 'oldName.txt'), path.join(filesDirectory, 'newName.txt'));
// fileManager.calculateHash(path.join(filesDirectory, 'file.txt'));
// fileManager.compressFile(path.join(filesDirectory, 'file.txt'), path.join(filesDirectory, 'compressed.gz'));

