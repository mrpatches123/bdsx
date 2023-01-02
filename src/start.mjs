import fs, { mkdirSync, rmdirSync } from 'fs';
import callerCallsite from "caller-callsite";
import pather from 'path';
import JSZip from 'jszip';
function copyRecursiveSync(src, dest) {
	let exists = fs.existsSync(src);
	let stats = exists && fs.statSync(src);
	let isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
		fs.mkdirSync(dest);
		fs.readdirSync(src).forEach(function (childItemName) {
			copyRecursiveSync(pather.join(src, childItemName),
				pather.join(dest, childItemName));
		});
	} else {
		fs.copyFileSync(src, dest);
	}
};

const path = {
	/**
	 * @method resolveRelativeFromAbsolute resolves a relative path from an absolute path
	 * @param {String} relitivePath relative path
	 * @param {String} absolutePath absolute path
	 * @param {String} split default?= '/', the path of the filePath to be split wth 
	 * @param {RegExp} replace default?= /[\/|\\]/g, the regex or string to replace the filePath's splits with 
	 * @returns {String} resolved absolutePath 
	 */
	resolveRelativeFromAbsolute(relitivePath, absolutePath, split = '/', replace = /[\/|\\]/g) {
		relitivePath = relitivePath.replaceAll(replace, split).split(split);
		absolutePath = absolutePath.replaceAll(replace, split).split(split);
		const numberOfBacks = relitivePath.filter(file => file === '..').length;
		// console.log(JSON.stringify({ relitivePath, absolutePath, numberOfBacks }, null, 4));
		if (!numberOfBacks) {
			return [...absolutePath, ...relitivePath.filter(file => file !== '.')].join(split);
		}
		return [...absolutePath.slice(0, -(numberOfBacks + 1)), ...relitivePath.filter(file => file !== '..' && file !== '.')].join(split);
	},
	/**
	 * @method parseRelitiveFromFunction
	 * @param {String} relitivePath 
	 * @param {Number} depth 
	 * @returns {String} resolved absolutePath 
	 */
	parseRelitiveFromFunction(relitivePath, depth = 1) {

		const absolutePath = callerCallsite().getFileName().replaceAll('\\', '/').replaceAll('file:///', '');
		return this.resolveRelativeFromAbsolute(relitivePath, absolutePath);
	}
};
// const packsFolder = path.parseRelitiveFromFunction('../bedrock_server/development_behavior_packs');
const addonFolder = path.parseRelitiveFromFunction('../addons');
// try { fs.rmSync(`${packsFolder}/patchy-api`, { recursive: true, force: true }); } catch (error) { console.log(error); };
const apiPath = 'C:/Users/mrpat/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/patchy-api';
function isFolder(pathString) {
	return fs.lstatSync(pathString).isDirectory();
}
function zipDirrectory(source, destination, fileName, skips = []) {
	const zip = new JSZip();
	if (!isFolder(source)) throw new Error(`source: ${source}, is not a folder,`);
	/**
	 * @param {String} pathString 
	 * @param {JSZip} folder 
	 */
	let skiped = false;
	console.log(source);
	skips = skips.map(skip => path.resolveRelativeFromAbsolute(skip, source));
	// console.log(JSON.stringify(skips, null, 4));
	function searchfolder(pathString, folder) {
		// console.log(pathString,);
		fs.readdirSync(pathString).forEach(name => {
			const pathFileFolder = `${pathString}/${name}`;

			if (!skiped) {
				const skipIndex = skips.indexOf(pathFileFolder);
				// console.log(skipIndex, name);
				if (skipIndex > -1) {
					skips = skips.filter((s, i) => i !== skipIndex);
					if (!skips.length) skiped = true;
					return;
				}
			}
			if (isFolder(pathFileFolder)) return searchfolder(pathFileFolder, folder.folder(name));
			folder.file(name, fs.readFileSync(`${pathString}/${name}`).toString());
		});
	};
	searchfolder(source, zip);
	zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
		.pipe(fs.createWriteStream(`${destination}/${fileName}`))
		.on('finish', () => console.log(`${fileName} written.`));
}
zipDirrectory(apiPath, addonFolder, 'patchy-api.mcpack', ['patchy-api-docs', '.git', '.github', '.vscode', 'bridge', 'node_modules']);
console.log('setup packs');
// const { header: { uuid, version } } = JSON.parse(fs.readFileSync(`${apiPath}/manifest.json`));

// fs.writeFileSync(`${serverFolder}/worlds/Bedrock level/world_behavior_packs.json`, JSON.stringify([
// 	{
// 		uuid,
// 		version
// 	}
// ], null, 4));
// const leveldat = fs.readFileSync(path.parseRelitiveFromFunction('./level.dat'));
// const leveldatold = fs.readFileSync(path.parseRelitiveFromFunction('./level.dat_old'));
// fs.writeFileSync(`${serverFolder}/worlds/Bedrock level/level.dat`, leveldat);
// fs.writeFileSync(`${serverFolder}/worlds/Bedrock level/level.dat_old`, leveldatold);
// copyRecursiveSync(apiPath, `${packsFolder}/patchy-api`);