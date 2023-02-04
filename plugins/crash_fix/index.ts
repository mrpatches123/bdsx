
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";
import { CANCEL } from 'bdsx/common';
const excudedPackets: number[] = [
    MinecraftPacketIds.PlayerAuthInput,
    MinecraftPacketIds.ClientCacheBlobStatus
];
const freezeSkinPatch = 'ewogICAiZ2VvbWV0cnkiIDogewogICAgICAiZGVmYXVsdCIgOiAiZ2VvbWV0cnkuaHVtYW5vaWQuY3VzdG9tIgogICB9Cn0=';
console.log('[plugin:CrashFixJs] allocated');
// for (const number of Object.values(MinecraftPacketIds)) {
//     if (typeof number !== 'number') continue;
//     if (excudedPackets.includes(number)) continue;
//     events.packetBefore(number).on((packet, networkIdentifier, packetId) => {
//         console.log(packetId, MinecraftPacketIds[packetId], JSON.stringify(packet));
//     });
// }

events.packetBefore(MinecraftPacketIds.PlayerSkin).on((packet, networkIdentifier, packetId) => {
    return CANCEL;
});
