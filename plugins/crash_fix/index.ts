
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";

console.log('[plugin:CrashFixJs] allocated');
for (const number of Object.values(MinecraftPacketIds)) {
    if (typeof number !== 'number') continue;
    events.packetBefore(number).on((packet) => {
        console.log(packet.getString());
    });
}

