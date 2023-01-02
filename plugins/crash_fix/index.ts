
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";

console.log('[plugin:CrashFixJs] allocated');
for (const key in MinecraftPacketIds) {
    // const packetId = MinecraftPacketIds[key as MinecraftPacketIds];
    events.packetBefore(key).on((packet) => {
        console.log(packet.getString());
    });
}

