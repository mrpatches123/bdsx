import { procHacker } from "./bds/proc";
import { bin } from "./bin";
import { capi } from "./capi";
import { StaticPointer, VoidPointer } from "./core";
import { AbstractClass, nativeClass, NativeClass, nativeField } from "./nativeclass";
import { bin128_t, bin64_t, float32_t, uint16_t, uint32_t, uint64_as_float_t, uint8_t } from "./nativetype";
import { Wrapper } from "./pointer";

export namespace mce {
    export const UUID = bin128_t.extends({
        v1(uuid:UUID):uint32_t {
            return uuid.charCodeAt(0) | (uuid.charCodeAt(1)<<16);
        },
        v2(uuid:UUID):uint16_t {
            return uuid.charCodeAt(2);
        },
        v3(uuid:UUID):uint16_t {
            return uuid.charCodeAt(3);
        },
        v4(uuid:UUID):bin64_t {
            return uuid.substr(4);
        },
        generate():UUID {
            return generateUUID().value;
        },
        toString(uuid:UUID) {
            const hex = bin.reversedHex(uuid);
            const u4 = hex.substr(0, 4);
            const u5 = hex.substr(4, 12);

            const u1 = hex.substr(16, 8);
            const u2 = hex.substr(24, 4);
            const u3 = hex.substr(28, 4);
            return `${u1}-${u2}-${u3}-${u4}-${u5}`;
        },
    }, 'UUID');
    export type UUID = string;
    export const UUIDWrapper = Wrapper.make(mce.UUID);

    @nativeClass()
    export class Color extends NativeClass {
        @nativeField(float32_t)
        r:float32_t;
        @nativeField(float32_t)
        g:float32_t;
        @nativeField(float32_t)
        b:float32_t;
        @nativeField(float32_t)
        a:float32_t;
    }

    // I don't think there are any circumstances you would need to construct or destruct this
    // You would construct a SerializedSkin instance instead.
    @nativeClass()
    export class Blob extends AbstractClass {
        @nativeField(VoidPointer)
        deleter:VoidPointer;
        @nativeField(StaticPointer)
        bytes:StaticPointer;
        @nativeField(uint64_as_float_t)
        size:uint64_as_float_t;

        toArray():number[] {
            const bytes = [];
            for (let i = 0; i < this.size; i++) {
                bytes.push(this.bytes.getUint8(i));
            }
            return bytes;
        }

        setFromArray(bytes:number[]):void {
            capi.free(this.bytes);
            this.size = bytes.length;
            this.bytes = capi.malloc(this.size);
            for (let i = 0; i < this.size; i++) {
                this.bytes.setUint8(bytes[i], i);
            }
        }
    }

    export enum ImageFormat {
        Unknown,
        RGB8Unorm,
        RGBA8Unorm,
    }

    export enum ImageUsage {
        Unknown,
        sRGB,
        Data,
    }

    @nativeClass()
    export class Image extends NativeClass {
        @nativeField(uint32_t)
        imageFormat:ImageFormat;
        @nativeField(uint32_t)
        width:uint32_t;
        @nativeField(uint32_t)
        height:uint32_t;
        @nativeField(uint8_t)
        usage:ImageUsage;
        @nativeField(mce.Blob, 0x10)
        blob:mce.Blob;
    }
}

const generateUUID = procHacker.js("Crypto::Random::generateUUID", mce.UUIDWrapper, {structureReturn: true});
