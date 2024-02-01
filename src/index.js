import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import zlib, { createGzip } from 'zlib';
import { __dirname, __fileName } from './pathHelper.js';
import { pipeline } from 'stream';


const username = process.argv[2].replace('--username=', '');
console.log(`Welcome to the File Manager, ${username}!\n`);

const filesDirectory = path.join(__dirname, 'files');

const fileManager = {
    getOSInfo:() => {
        console.log('Operating System Information:');
        console.log(`  Type: ${os.type()}`);
        console.log(`  Platform: ${os.platform()}`);
        console.log(`  Release: ${os.release()}`);
        console.log(`  Architecture: ${os.arch()}`);
        console.log(`  Total Memory: ${os.totalmem()} bytes`);
        console.log(`  Free Memory: ${os.freemem()} bytes\n`);
    },

    // file operations
    copyFile:(source, destination) => {
        fs.copyFileSync(source, destination);
        console.log(`✅ File copied successfully from ${source} to ${destination}`);
    },

    moveFile:(source, destination) => {
        fs.renameSync(source, destination);
        console.log(`\n✅ File moved successfully from ${source} to ${destination}`);
    },

    deleteFile:(filePath) => {
        fs.unlinkSync(filePath);
        console.log(`\n✅ File ${filePath} deleted successfully`);
    },

    renameFile:(oldPath, newPath) => {
        fs.renameSync(oldPath, newPath);
        console.log(`\n✅ File renamed successfully from ${oldPath} to ${newPath}`);
    },

    // Hash
    calculateHash:(filePath, algorithm = 'sha256') => {
        const hash = crypto.createHash(algorithm);
        const fileData = fs.readFileSync(filePath);
        hash.update(fileData);
        console.log(`\n✅ Hash (${algorithm}) of ${filePath}: ${hash.digest('hex')}`);
    },

    // Compress and decompress
    compressFile: (source, destination) => {
        const gzip = createGzip();
        const inputStream = fs.createReadStream(source);
        const outputStream = fs.createWriteStream(destination);

        pipeline(inputStream, gzip, outputStream, (err) => {
        if (err) {
            console.error('An error occurred:', err);
            process.exitCode = 1;
        } else {
            console.log(`✅ File successfully compressed to ${destination} file`);
            fileManager.decompressFile(destination, 'decompressed.txt');
        }
        });
        
    },

    decompressFile: (source, destination) => {
        try {
            const buffer = fs.readFileSync(source);
            const decompressedBuffer = zlib.unzipSync(buffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
            const outputPath = path.join(filesDirectory, destination);
            fs.writeFileSync(outputPath, decompressedBuffer);
            console.log(`✅ File decompressed successfully to ${outputPath}`);
        } catch (err) {
            console.error('An error occurred:', err);
            process.exitCode = 1;
        };
    }
};


fileManager.getOSInfo();
fileManager.copyFile(path.join(filesDirectory, 'source.txt'), path.join(filesDirectory, 'destination.txt'));
fileManager.moveFile(path.join(filesDirectory, 'source.txt'), path.join(filesDirectory, 'moved.txt'));
fileManager.deleteFile(path.join(filesDirectory, 'delete.txt'));
fileManager.renameFile(path.join(filesDirectory, 'oldName.txt'), path.join(filesDirectory, 'newName.txt'));
fileManager.calculateHash(path.join(filesDirectory, 'file.txt'));
fileManager.compressFile(path.join(filesDirectory, 'file.txt'), path.join(filesDirectory, 'compressed.gz'));

