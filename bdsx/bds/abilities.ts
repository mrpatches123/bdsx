import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, float32_t, int32_t } from "../nativetype";
import type { CommandPermissionLevel } from "./command";
import type { PlayerPermission } from "./player";

export class Abilities extends NativeClass {
    protected _setAbility(abilityIndex:AbilitiesIndex, value:boolean):void {
        abstract();
    }
    getCommandPermissionLevel():CommandPermissionLevel {
        abstract();
    }
    getPlayerPermissionLevel():PlayerPermission {
        abstract();
    }
    setCommandPermissionLevel(commandPermissionLevel:CommandPermissionLevel):void {
        abstract();
    }
    setPlayerPermissionLevel(playerPermissionLevel:PlayerPermission):void {
        abstract();
    }
    getAbility(abilityIndex:AbilitiesIndex):Ability {
        abstract();
    }
    setAbility(abilityIndex:AbilitiesIndex, value:boolean|number):void {
        switch (typeof value) {
        case "boolean":
            this._setAbility(abilityIndex, value);
            break;
        case "number":
            this.getAbility(abilityIndex).setFloat(value);
            break;
        }
    }
}

export enum AbilitiesIndex {
    Build,
    Mine,
    DoorsAndSwitches,
    OpenContainers,
    AttackPlayers,
    AttackMobs,
    OperatorCommands,
    Teleport,
    ExposedAbilityCount,
    Flying,
    MayFly,
    Instabuild,
    Lightning,
    FlySpeed,
    WalkSpeed,
    Muted,
    WorldBuilder,
    NoClip,
}

export class Ability extends NativeClass {
    type:Ability.Type;
    value:Ability.Value;
    options:Ability.Options;

    getBool():boolean {
        abstract();
    }
    getFloat():number {
        abstract();
    }
    setBool(value:boolean):void {
        abstract();
    }
    setFloat(value:number):void {
        this.type = Ability.Type.Float;
        this.setFloat32(value, 0x04);
    }

    getValue():boolean|number|undefined {
        switch (this.type) {
        case Ability.Type.Unset:
            return undefined;
        case Ability.Type.Bool:
            return this.getBool();
        case Ability.Type.Float:
            return this.getFloat();
        }
    }
    setValue(value:boolean|number):void {
        switch (typeof value) {
        case "boolean":
            this.setBool(value);
            break;
        case "number":
            this.setFloat(value);
            break;
        }
    }
}

export namespace Ability {
    export enum Type {
        Unset,
        Bool,
        Float,
    }

    export enum Options {
        None,
        NoSave,
        CommandExposed = 2,
        PermissionsInterfaceExposed = 4,
        WorldbuilderOverrides = 8,

        NoSaveCommandExposed = 3,
        NoSavePermissionsInterfaceExposed = 5,
        CommandExposedPermissionsInterfaceExposed = 6,
        NoSaveCommandExposedPermissionsInterfaceExposed = 7,
        NoSaveWorldbuilderOverrides = 9,
        CommandExposedWorldbuilderOverrides = 10,
        NoSaveCommandExposedWorldbuilderOverrides = 11,
        PermissionsInterfaceExposedWorldbuilderOverrides = 12,
        NoSavePermissionsInterfaceExposedWorldbuilderOverrides = 13,
        CommandExposedPermissionsInterfaceExposedWorldbuilderOverrides = 14,
        All = 15,
    }

    @nativeClass(0x04)
    export class Value extends NativeClass {
        @nativeField(bool_t, 0x00)
        boolVal:bool_t;
        @nativeField(float32_t, 0x00)
        floatVal:float32_t;
    }
}
