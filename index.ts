#!/usr/bin/env node

import meow from "meow";
import path from "path";
import fs from "fs";
import fse from 'fs-extra';
import { exec } from "child_process";

const cli = meow(`
Usage
	$ sysbot-update <GitHub author>@<GitHub repo name>:<branch name>

Examples
  	$ sysbot-update Fehniix@SysBot.ACNHOrders:release
`, {
	importMeta: import.meta
});

const baseURL: string = 'https://github.com';

let username: string 			= 'Fehniix';
let repo: string 				= 'SysBot.ACNHOrders';
let branch: string | undefined 	= undefined;

if (cli.input.length < 1)
	console.log('No repository provided, using default Fehniix@SysBot.ACNHOrders:release');
else {
	const debranchedURL: string = cli.input[0].split(':')[0];
	username	= debranchedURL.split('@')[0];
	repo 		= debranchedURL.split('@')[1];
	branch 		= cli.input[0].split(':')[1];
}

const basePath = process.cwd();

if (!fs.existsSync(path.join(basePath, 'SysBot.ACNHOrders.csproj')) || !fs.existsSync(path.join(basePath, 'SysBot.ACNHOrders.sln'))) {
	console.log(`SysBot.ACNHOrders.csproj or SysBot.ACNHOrders.sln could not be found. Please run this command from within the project's root folder.`);
	process.exit(-1);
}

const tmpPath = path.join(basePath, 'tmp');
const repoPath = path.join(tmpPath, repo);

if (fs.existsSync(tmpPath))
	fs.rmSync(tmpPath, { recursive: true });

fs.mkdirSync(tmpPath);

await asyncExec(`cd ./tmp && git clone ${branch !== undefined ? `-b ${branch}` : ''} ${baseURL}/${username}/${repo}.git`).catch(error => {
	console.log(`There was an error while fetching the latest version of SysBot.ACNHOrders: ${error}`);
	process.exit(-1)
});

console.log(`Cloned ${cli.input[0]}...`);
console.log(`Building project...`);

await asyncExec(`cd ${repoPath} && dotnet publish --configuration release --framework net5.0 --runtime linux-x64`);

console.log('Project built.');

fse.copySync(path.join(repoPath, 'bin', 'Release', 'net5.0'), './test');

console.log('Cleaning tmp folder...');
fs.rmSync(tmpPath, { recursive: true, force: true });
console.log('Cleaned.');
console.log('Updated successfully.');

async function asyncExec(command: string): Promise<void> {
	return new Promise((resolve, reject) => {
		exec(command, error => {
			if (error)
				return reject(error);
			resolve();
		});
	});
}