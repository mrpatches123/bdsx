import fs, { mkdirSync, rmdirSync } from 'fs';
import callerCallsite from "caller-callsite";
import pather from 'path';
import JSZip from 'jszip';
function isFolder(pathString) {
	return fs.lstatSync(pathString).isDirectory();
}
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
		const absolutePathString = absolutePath;
		relitivePath = relitivePath.replaceAll(replace, split).split(split);
		absolutePath = absolutePath.replaceAll(replace, split).split(split);
		const numberOfBacks = relitivePath.filter(file => file === '..').length;
		// console.log(JSON.stringify({ relitivePath, absolutePath, numberOfBacks }, null, 4));
		// if (!numberOfBacks) {
		// 	return [...absolutePath, ...relitivePath.filter(file => file !== '.')].join(split);
		// }

		return [...((!numberOfBacks && isFolder(absolutePathString)) ? absolutePath : absolutePath.slice(0, -(numberOfBacks + 1))), ...relitivePath.filter(file => file !== '..' && file !== '.')].join(split);
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

let skiped = false;
const apiPath = 'C:/Users/mrpat/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/patchy-api';
let skips = ['./patchy-api-docs', './.git', './.github', './.vscode', './bridge', './node_modules']
	.map(skip => path.resolveRelativeFromAbsolute(skip, apiPath));
console.log(skips);
function copyRecursiveSync(src, dest) {
	let exists = fs.existsSync(src);
	let stats = exists && fs.statSync(src);
	let isDirectory = exists && stats.isDirectory();

	if (isDirectory) {
		fs.mkdirSync(dest);
		fs.readdirSync(src).forEach((childItemName) => {
			if (!skiped) {
				const skipIndex = skips.indexOf(`${src}/${childItemName}`);
				console.log(skipIndex, childItemName, pather.join(src, childItemName));
				if (skipIndex > -1) {
					skips = skips.filter((s, i) => i !== skipIndex);
					if (!skips.length) skiped = true;
					return;
				}
			}
			copyRecursiveSync(pather.join(src, childItemName),
				pather.join(dest, childItemName));
		});
	} else {
		fs.copyFileSync(src, dest);
	}
};

const packsFolder = path.parseRelitiveFromFunction('../bedrock_server/development_behavior_packs');
const serverFolder = path.parseRelitiveFromFunction('../bedrock_server');
const addonFolder = path.parseRelitiveFromFunction('../addons');
try { fs.rmSync(`${packsFolder}/patchy-api`, { recursive: true, force: true }); } catch (error) { console.log(error); };

// function zipDirrectory(source, destination, fileName, skips = []) {
// 	const zip = new JSZip();
// 	if (!isFolder(source)) throw new Error(`source: ${source}, is not a folder,`);
// 	/**
// 	 * @param {String} pathString 
// 	 * @param {JSZip} folder 
// 	 */
// 	let skiped = false;
// 	console.log(source);
// 	skips = skips.map(skip => path.resolveRelativeFromAbsolute(skip, source));
// 	// console.log(JSON.stringify(skips, null, 4));
// 	function searchfolder(pathString, folder) {
// 		// console.log(pathString,);
// 		fs.readdirSync(pathString).forEach(name => {
// 			const pathFileFolder = `${pathString}/${name}`;

// 			if (!skiped) {
// 				const skipIndex = skips.indexOf(pathFileFolder);
// 				// console.log(skipIndex, name);
// 				if (skipIndex > -1) {
// 					skips = skips.filter((s, i) => i !== skipIndex);
// 					if (!skips.length) skiped = true;
// 					return;
// 				}
// 			}
// 			if (isFolder(pathFileFolder)) return searchfolder(pathFileFolder, folder.folder(name));
// 			folder.file(name, fs.readFileSync(`${pathString}/${name}`).toString());
// 		});
// 	};
// 	searchfolder(source, zip);
// 	zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
// 		.pipe(fs.createWriteStream(`${destination}/${fileName}`))
// 		.on('finish', () => console.log(`${fileName} written.`));
// }
// zipDirrectory(apiPath, addonFolder, 'patchy-api.mcpack', ['patchy-api-docs', '.git', '.github', '.vscode', 'bridge', 'node_modules']);

const { header: { uuid, version } } = JSON.parse(fs.readFileSync(`${apiPath}/manifest.json`));

fs.writeFileSync(`${serverFolder}/worlds/Bedrock level/world_behavior_packs.json`, JSON.stringify([
	{
		pack_id: uuid,
		version
	}
], null, 4));
const leveldat = fs.readFileSync(path.parseRelitiveFromFunction('./level.dat'));
const leveldatold = fs.readFileSync(path.parseRelitiveFromFunction('./level.dat_old'));
fs.writeFileSync(`${serverFolder}/worlds/Bedrock level/level.dat`, leveldat);
fs.writeFileSync(`${serverFolder}/worlds/Bedrock level/level.dat_old`, leveldatold);
try {
	fs.mkdirSync(`${serverFolder}/config/${uuid}`);
} catch (error) {

}

fs.writeFileSync(`${serverFolder}/config/${uuid}/permissions.json`, `{
	"allowed_modules": [
	  	"@minecraft/server-gametest",
	  	"@minecraft/server",
	  	"@minecraft/server-ui",
	  	"@minecraft/server-admin",
	  	"@minecraft/server-net"
	]
}`);
fs.writeFileSync(`${serverFolder}/server.properties`, `server-name=Dedicated Server
# Used as the server name
# Allowed values: Any string without semicolon symbol.

gamemode=survival
# Sets the game mode for new players.
# Allowed values: "survival", "creative", or "adventure"

force-gamemode=false
# force-gamemode=false (or force-gamemode  is not defined in the server.properties)
# prevents the server from sending to the client gamemode values other
# than the gamemode value saved by the server during world creation
# even if those values are set in server.properties after world creation.
# 
# force-gamemode=true forces the server to send to the client gamemode values
# other than the gamemode value saved by the server during world creation
# if those values are set in server.properties after world creation.

difficulty=easy
# Sets the difficulty of the world.
# Allowed values: "peaceful", "easy", "normal", or "hard"

allow-cheats=true
# If true then cheats like commands can be used.
# Allowed values: "true" or "false"

max-players=30
# The maximum number of players that can play on the server.
# Allowed values: Any positive integer

online-mode=true
# If true then all connected players must be authenticated to Xbox Live.
# Clients connecting to remote (non-LAN) servers will always require Xbox Live authentication regardless of this setting.
# If the server accepts connections from the Internet, then it's highly recommended to enable online-mode.
# Allowed values: "true" or "false"

allow-list=false
# If true then all connected players must be listed in the separate allowlist.json file.
# Allowed values: "true" or "false"

server-port=19132
# Which IPv4 port the server should listen to.
# Allowed values: Integers in the range [1, 65535]

server-portv6=19133
# Which IPv6 port the server should listen to.
# Allowed values: Integers in the range [1, 65535]

enable-lan-visibility=true
# Listen and respond to clients that are looking for servers on the LAN. This will cause the server
# to bind to the default ports (19132, 19133) even when server-port andserver-portv6
# have non-default values. Consider turning this off if LAN discovery is not desirable, or when
# running multiple servers on the same host may lead to port conflicts.
# Allowed values: "true" or "false"

view-distance=32
# The maximum allowed view distance in number of chunks.
# Allowed values: Positive integer equal to 5 or greater.

tick-distance=4
# The world will be ticked this many chunks away from any player.
# Allowed values: Integers in the range [4, 12]

player-idle-timeout=30
# After a player has idled for this many minutes they will be kicked. If set to 0 then players can idle indefinitely.
# Allowed values: Any non-negative integer.

max-threads=8
# Maximum number of threads the server will try to use. If set to 0 or removed then it will use as many as possible.
# Allowed values: Any positive integer.

level-name=Bedrock level
# Allowed values: Any string without semicolon symbol or symbols illegal for file name

level-seed=
# Use to randomize the world
# Allowed values: Any string

default-player-permission-level=member
# Permission level for new players joining for the first time.
# Allowed values: "visitor", "member", "operator"

texturepack-required=true
# Force clients to use texture packs in the current world
# Allowed values: "true" or "false"

content-log-file-enabled=true
# Enables logging content errors to a file
# Allowed values: "true" or "false"

compression-threshold=1
# Determines the smallest size of raw network payload to compress
# Allowed values: 0-65535

compression-algorithm=zlib
# Determines the compression algorithm to use for networking
# Allowed values: "zlib", "snappy"

server-authoritative-movement=server-auth
# Allowed values: "client-auth", "server-auth", "server-auth-with-rewind"
# Enables server authoritative movement. If "server-auth", the server will replay local user input on
# the server and send down corrections when the client's position doesn't match the server's.
# If "server-auth-with-rewind" is enabled and the server sends a correction, the clients will be instructed
# to rewind time back to the correction time, apply the correction, then replay all the player's inputs since then. This results in smoother and more frequent corrections.
# Corrections will only happen if correct-player-movement is set to true.

player-movement-score-threshold=20
# The number of incongruent time intervals needed before abnormal behavior is reported.
# Disabled by server-authoritative-movement.

player-movement-action-direction-threshold=0.85
# The amount that the player's attack direction and look direction can differ.
# Allowed values: Any value in the range of [0, 1] where 1 means that the
# direction of the players view and the direction the player is attacking
# must match exactly and a value of 0 means that the two directions can
# differ by up to and including 90 degrees.

player-movement-distance-threshold=0.3
# The difference between server and client positions that needs to be exceeded before abnormal behavior is detected.
# Disabled by server-authoritative-movement.

player-movement-duration-threshold-in-ms=500
# The duration of time the server and client positions can be out of sync (as defined by player-movement-distance-threshold)
# before the abnormal movement score is incremented. This value is defined in milliseconds.
# Disabled by server-authoritative-movement.

correct-player-movement=false
# If true, the client position will get corrected to the server position if the movement score exceeds the threshold.


server-authoritative-block-breaking=false
# If true, the server will compute block mining operations in sync with the client so it can verify that the client should be able to break blocks when it thinks it can.

chat-restriction=None
# Allowed values: "None", "Dropped", "Disabled"
# This represents the level of restriction applied to the chat for each player that joins the server.
# "None" is the default and represents regular free chat.
# "Dropped" means the chat messages are dropped and never sent to any client. Players receive a message to let them know the feature is disabled.
# "Disabled" means that unless the player is an operator, the chat UI does not even appear. No information is displayed to the player.

disable-player-interaction=false
# If true, the server will inform clients that they should ignore other players when interacting with the world. This is not server authoritative.

client-side-chunk-generation-enabled=true
# If true, the server will inform clients that they have the ability to generate visual level chunks outside of player interaction distances.
`);
copyRecursiveSync(apiPath, `${packsFolder}/patchy-api`);
console.log('setup packs');