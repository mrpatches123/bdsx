"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dllraw = void 0;
const core_1 = require("./core");
var dllraw;
(function (dllraw) {
    dllraw.bedrock_server = core_1.pdb.getList(core_1.pdb.coreCachePath, {}, [
        '??$_Allocate@$0BA@U_Default_allocate_traits@std@@$0A@@std@@YAPEAX_K@Z',
        '??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ',
        '?_Tidy_deallocate@?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAAXXZ',
    ]);
    let kernel32;
    (function (kernel32) {
        kernel32.module = core_1.cgate.GetModuleHandleW('kernel32.dll');
        kernel32.GetCurrentThreadId = core_1.cgate.GetProcAddress(kernel32.module, 'GetCurrentThreadId');
        kernel32.Sleep = core_1.cgate.GetProcAddress(kernel32.module, 'Sleep');
    })(kernel32 = dllraw.kernel32 || (dllraw.kernel32 = {}));
    let vcruntime140;
    (function (vcruntime140) {
        vcruntime140.module = core_1.cgate.GetModuleHandleW('vcruntime140.dll');
        vcruntime140.memcpy = core_1.cgate.GetProcAddress(vcruntime140.module, 'memcpy');
    })(vcruntime140 = dllraw.vcruntime140 || (dllraw.vcruntime140 = {}));
    let ucrtbase;
    (function (ucrtbase) {
        ucrtbase.module = core_1.cgate.GetModuleHandleW('ucrtbase.dll');
        ucrtbase.malloc = core_1.cgate.GetProcAddress(ucrtbase.module, 'malloc');
    })(ucrtbase = dllraw.ucrtbase || (dllraw.ucrtbase = {}));
})(dllraw = exports.dllraw || (exports.dllraw = {}));
//# sourceMappingURL=dllraw.js.map