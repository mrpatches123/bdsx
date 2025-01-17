import { CommandParameterType } from "../commandparam";
import { abstract, VectorXY, VectorXYZ, VectorXZ } from "../common";
import { nativeClass, nativeField, NativeStruct } from "../nativeclass";
import { bin64_t, bool_t, float32_t, int32_t, NativeType, uint16_t, uint8_t } from "../nativetype";
import { procHacker } from "../prochacker";
import { proc } from "./symbols";

export enum Facing {
    Down,
    Up,
    North,
    South,
    West,
    East,

    Max,
}

export namespace Facing {
    export const convertYRotationToFacingDirection: (yRotation: number) => number = procHacker.js(
        "?convertYRotationToFacingDirection@Facing@@SAEM@Z",
        uint8_t,
        null,
        float32_t,
    );
}

@nativeClass()
export class BlockPos extends NativeStruct {
    static readonly MIN = proc["?MIN@BlockPos@@2V1@B"].as(BlockPos);
    static readonly MAX = proc["?MAX@BlockPos@@2V1@B"].as(BlockPos);
    static readonly ZERO = proc["?ZERO@BlockPos@@2V1@B"].as(BlockPos);
    static readonly ONE = proc["?ONE@BlockPos@@2V1@B"].as(BlockPos);

    @nativeField(int32_t)
    x: int32_t;
    @nativeField(int32_t)
    y: int32_t;
    @nativeField(int32_t)
    z: int32_t;

    set(pos: VectorXYZ): void {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }

    equal(pos: BlockPos | Vec3): boolean {
        return this.x === pos.x && this.y === pos.y && this.z === pos.z;
    }

    abs(): BlockPos {
        return BlockPos.create(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    inc(pos: BlockPos): BlockPos;
    inc(pos: Vec3): BlockPos;
    inc(x: number, y: number, z: number): BlockPos;
    inc(a: number | Vec3 | BlockPos, b: number = 0, c: number = 0): BlockPos {
        if (typeof a === "number") {
            return BlockPos.create(this.x + (a | 0), this.y + (b | 0), this.z + (c | 0));
        } else {
            return this.inc(a.x, a.y, a.z);
        }
    }

    dec(pos: BlockPos): BlockPos;
    dec(pos: Vec3): BlockPos;
    dec(x: number, y: number, z: number): BlockPos;
    dec(a: number | Vec3 | BlockPos, b: number = 0, c: number = 0): BlockPos {
        if (typeof a === "number") {
            return this.inc(-a, -b, -c);
        } else {
            return this.inc(-a.x, -a.y, -a.z);
        }
    }

    multiply(times: number): BlockPos {
        return BlockPos.create((this.x * times) | 0, this.y * times, (this.z * times) | 0);
    }

    divide(times: number): BlockPos {
        return BlockPos.create((this.x / times) | 0, (this.y / times) | 0, (this.z / times) | 0);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize(): BlockPos {
        const len = this.lengthSquared();
        if (len > 0) {
            return this.divide(Math.sqrt(len));
        }
        return BlockPos.create(0, 0, 0);
    }

    getSide(side: Facing, step: number = 1): BlockPos {
        switch (side) {
            case Facing.Down:
                return this.dec(0, step, 0);
            case Facing.Up:
                return this.inc(0, step, 0);
            case Facing.North:
                return this.dec(0, 0, step);
            case Facing.South:
                return this.inc(0, 0, step);
            case Facing.West:
                return this.dec(step, 0, 0);
            case Facing.East:
                return this.inc(step, 0, 0);
            default:
                return this;
        }
    }

    relative(facing: Facing, steps: number): BlockPos {
        abstract();
    }

    static create(pos: Vec3): BlockPos;
    static create(pos: BlockPos): BlockPos;
    static create(pos: VectorXYZ): BlockPos;
    static create(x: number, y: number, z: number): BlockPos;
    static create(a: number | VectorXYZ, b: number = 0, c: number = 0): BlockPos {
        if (typeof a === "number") {
            const v = new BlockPos(true);
            v.x = Math.floor(a);
            v.y = Math.floor(b);
            v.z = Math.floor(c);
            return v;
        } else {
            return BlockPos.create(a.x, a.y, a.z);
        }
    }

    toJSON(): VectorXYZ {
        return { x: this.x, y: this.y, z: this.z };
    }
}

BlockPos.prototype.relative = procHacker.js("?relative@BlockPos@@QEBA?AV1@EH@Z", BlockPos, { this: BlockPos, structureReturn: true }, uint8_t, int32_t);

@nativeClass()
export class ChunkPos extends NativeStruct {
    @nativeField(int32_t)
    x: int32_t;
    @nativeField(int32_t)
    z: int32_t;

    set(pos: ChunkPos | VectorXZ): void {
        this.x = pos.x;
        this.z = pos.z;
    }

    static create(x: number, z: number): ChunkPos;
    static create(pos: BlockPos): ChunkPos;
    static create(pos: VectorXZ): ChunkPos;
    static create(a: number | VectorXZ, b?: number): ChunkPos {
        const v = new ChunkPos(true);
        if (typeof a === "number") {
            v.x = a;
            v.z = b!;
        } else {
            v.x = a.x >> 4;
            v.z = a.z >> 4;
        }
        return v;
    }

    toJSON(): VectorXZ {
        return { x: this.x, z: this.z };
    }
}

@nativeClass()
export class ChunkBlockPos extends NativeStruct {
    @nativeField(uint8_t)
    x: uint8_t;
    @nativeField(uint16_t)
    y: uint16_t;
    @nativeField(uint8_t)
    z: uint8_t;

    set(pos: ChunkBlockPos | VectorXYZ): void {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }

    static create(x: number, y: number, z: number): ChunkBlockPos;
    static create(pos: BlockPos): ChunkBlockPos;
    static create(pos: VectorXYZ): ChunkBlockPos;
    static create(a: number | VectorXYZ, b?: number, c?: number): ChunkBlockPos {
        const v = new ChunkBlockPos(true);
        if (typeof a === "number") {
            v.x = a;
            v.y = b!;
            v.z = c!;
        } else {
            v.x = a.x & 0xf;
            v.y = a.y;
            v.z = a.z & 0xf;
        }
        return v;
    }

    toJSON(): VectorXYZ {
        return { x: this.x, y: this.y, z: this.z };
    }
}

@nativeClass()
export class Vec2 extends NativeStruct {
    @nativeField(float32_t)
    x: float32_t;
    @nativeField(float32_t)
    y: float32_t;

    set(pos: Vec2 | VectorXY): void {
        this.x = pos.x;
        this.y = pos.y;
    }

    static create(pos: VectorXY): Vec2;
    static create(x: number | VectorXY, y?: number): Vec2 {
        const v = new Vec2(true);
        if (typeof x === "number") {
            v.x = x;
            v.y = y!;
        } else {
            v.x = x.x;
            v.y = x.y;
        }
        return v;
    }

    toJSON(): VectorXY {
        return { x: this.x, y: this.y };
    }
}

@nativeClass()
export class Vec3 extends NativeStruct {
    static readonly MIN = proc["?MIN@Vec3@@2V1@B"].as(Vec3);
    static readonly MAX = proc["?MAX@Vec3@@2V1@B"].as(Vec3);
    static readonly ZERO = proc["?ZERO@Vec3@@2V1@B"].as(Vec3);
    static readonly HALF = proc["?HALF@Vec3@@2V1@B"].as(Vec3);
    static readonly ONE = proc["?ONE@Vec3@@2V1@B"].as(Vec3);
    static readonly TWO = proc["?TWO@Vec3@@2V1@B"].as(Vec3);

    static readonly UNIT_X = proc["?UNIT_X@Vec3@@2V1@B"].as(Vec3);
    static readonly NEG_UNIT_X = proc["?NEG_UNIT_X@Vec3@@2V1@B"].as(Vec3);
    static readonly UNIT_Y = proc["?UNIT_Y@Vec3@@2V1@B"].as(Vec3);
    static readonly NEG_UNIT_Y = proc["?NEG_UNIT_Y@Vec3@@2V1@B"].as(Vec3);
    static readonly UNIT_Z = proc["?UNIT_Z@Vec3@@2V1@B"].as(Vec3);
    static readonly NEG_UNIT_Z = proc["?NEG_UNIT_Z@Vec3@@2V1@B"].as(Vec3);

    @nativeField(float32_t)
    x: float32_t;
    @nativeField(float32_t)
    y: float32_t;
    @nativeField(float32_t)
    z: float32_t;

    set(pos: Vec3 | BlockPos | VectorXYZ): void {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }

    distance(pos: Vec3 | BlockPos | VectorXYZ): number {
        return Math.sqrt(this.distanceSq(pos));
    }

    distanceSq(pos: Vec3 | BlockPos | VectorXYZ): number {
        const xdist = this.x - pos.x;
        const ydist = this.y - pos.y;
        const zdist = this.z - pos.z;
        return xdist * xdist + ydist * ydist + zdist * zdist;
    }

    equal(pos: Vec3 | BlockPos): boolean {
        return this.x === pos.x && this.y === pos.y && this.z === pos.z;
    }

    floor(): Vec3 {
        return Vec3.create(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }

    ceil(): Vec3 {
        return Vec3.create(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
    }

    round(): Vec3 {
        return Vec3.create(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }

    abs(): Vec3 {
        return Vec3.create(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    inc(pos: BlockPos): Vec3;
    inc(pos: Vec3): Vec3;
    inc(x: number, y: number, z: number): Vec3;
    inc(a: number | Vec3 | BlockPos, b: number = 0, c: number = 0): Vec3 {
        if (typeof a === "number") {
            return Vec3.create(this.x + a, this.y + b, this.z + c);
        } else {
            return this.inc(a.x, a.y, a.z);
        }
    }

    dec(pos: BlockPos): Vec3;
    dec(pos: Vec3): Vec3;
    dec(x: number, y: number, z: number): Vec3;
    dec(a: number | Vec3 | BlockPos, b: number = 0, c: number = 0): Vec3 {
        if (typeof a === "number") {
            return this.inc(-a, -b, -c);
        } else {
            return this.inc(-a.x, -a.y, -a.z);
        }
    }

    multiply(times: number): Vec3 {
        return Vec3.create(this.x * times, this.y * times, this.z * times);
    }

    divide(times: number): Vec3 {
        return Vec3.create(this.x / times, this.y / times, this.z / times);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize(): Vec3 {
        const len = this.lengthSquared();
        if (len > 0) {
            return this.divide(Math.sqrt(len));
        }
        return Vec3.create(0, 0, 0);
    }

    getSide(side: Facing, step: number = 1): Vec3 {
        switch (side) {
            case Facing.Down:
                return this.dec(0, step, 0);
            case Facing.Up:
                return this.inc(0, step, 0);
            case Facing.North:
                return this.dec(0, 0, step);
            case Facing.South:
                return this.inc(0, 0, step);
            case Facing.West:
                return this.dec(step, 0, 0);
            case Facing.East:
                return this.inc(step, 0, 0);
            default:
                return this;
        }
    }

    static create(pos: Vec3): Vec3;
    static create(pos: BlockPos): Vec3;
    static create(pos: VectorXYZ): Vec3;
    static create(x: number, y: number, z: number): Vec3;
    static create(a: number | VectorXYZ, b?: number, c?: number): Vec3 {
        const v = new Vec3(true);
        if (typeof a === "number") {
            v.x = a;
            v.y = b!;
            v.z = c!;
        } else {
            v.x = a.x;
            v.y = a.y;
            v.z = a.z;
        }
        return v;
    }

    toJSON(): VectorXYZ {
        return { x: this.x, y: this.y, z: this.z };
    }

    static directionFromRotation(rotation: Vec2): Vec3 {
        abstract();
    }

    static rotationFromDirection(direction: Vec3): Vec2 {
        abstract();
    }
}

Vec3.directionFromRotation = procHacker.js("?directionFromRotation@Vec3@@SA?AV1@AEBVVec2@@@Z", Vec3, { structureReturn: true }, Vec2);
Vec3.rotationFromDirection = procHacker.js("?rotationFromDirection@Vec3@@SA?AVVec2@@AEBV1@@Z", Vec2, { structureReturn: true }, Vec3);

@nativeClass()
export class RelativeFloat extends NativeStruct {
    static readonly [CommandParameterType.symbol]: true;
    static readonly [NativeType.registerDirect] = true;
    @nativeField(float32_t)
    value: float32_t;
    @nativeField(bool_t)
    is_relative: bool_t;

    @nativeField(bin64_t, 0)
    bin_value: bin64_t;

    set(pos: RelativeFloat | { value: number; is_relative: boolean }): void {
        this.value = pos.value;
        this.is_relative = pos.is_relative;
    }

    static create(value: number, is_relative: boolean): RelativeFloat {
        const v = new RelativeFloat(true);
        v.value = value;
        v.is_relative = is_relative;
        return v;
    }
}
