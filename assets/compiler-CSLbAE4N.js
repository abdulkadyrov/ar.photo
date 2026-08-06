import{i as e,n as t,t as n}from"./rolldown-runtime-Dd_uD5pT.js";import{t as r}from"./__vite-browser-external-5eBdwsFd.js";var i=1e-7,a=1e-4,o=class{constructor(e,t){this.backend=e,this.dataMover=t,this.data=new WeakMap,this.dataIdsCount=0}get(e){return this.data.has(e)||this.dataMover.moveData(this.backend,e),this.data.get(e)}set(e,t){this.dataIdsCount++,this.data.set(e,t)}has(e){return this.data.has(e)}delete(e){return this.dataIdsCount--,this.data.delete(e)}numDataIds(){return this.dataIdsCount}},s=class{refCount(e){return c(`refCount`)}incRef(e){return c(`incRef`)}timerAvailable(){return!0}time(e){return c(`time`)}read(e){return c(`read`)}readSync(e){return c(`readSync`)}readToGPU(e,t){return c(`readToGPU`)}numDataIds(){return c(`numDataIds`)}disposeData(e,t){return c(`disposeData`)}write(e,t,n){return c(`write`)}move(e,t,n,r,i){return c(`move`)}createTensorFromGPUData(e,t,n){return c(`createTensorFromGPUData`)}memory(){return c(`memory`)}floatPrecision(){return c(`floatPrecision`)}epsilon(){return this.floatPrecision()===32?i:a}dispose(){return c(`dispose`)}};function c(e){throw Error(`'${e}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}function l(e){let t=e.length,n=0;for(;t>0;)n=Math.random()*t|0,t--,f(e,t,n)}function u(e,t,n){return Math.max(e,Math.min(t,n))}function d(e){return e%2==0?e:e+1}function f(e,t,n){let r=e[t];e[t]=e[n],e[n]=r}function p(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n];return t}function m(e,t){if(!e)throw Error(typeof t==`string`?t:t())}function h(e,t,n=``){m(v(e,t),()=>n+` Shapes ${e} and ${t} must match`)}function g(e){m(e!=null,()=>`The input to the tensor constructor must be a non-null value.`)}function _(e){if(e.length===0)return 1;let t=e[0];for(let n=1;n<e.length;n++)t*=e[n];return t}function v(e,t){if(e===t)return!0;if(e==null||t==null||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function y(e){return e%1==0}function b(e){let t=Math.ceil(Math.sqrt(e));return[t,Math.ceil(e/t)]}function x(e,t){return t<=e.length?e:e+` `.repeat(t-e.length)}function S(e,t=e=>0,n,r){return new Promise((i,a)=>{let o=0,s=()=>{if(e()){i();return}o++;let c=t(o);if(n!=null&&o>=n){a();return}r==null?setTimeout(s,c):r(s,c)};s()})}function C(e,t){let n=1,r=-1;for(let t=0;t<e.length;++t)if(e[t]>=0)n*=e[t];else if(e[t]===-1){if(r!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${r} and dim ${t}`);r=t}else if(e[t]<0)throw Error(`Shapes can not be < 0. Found ${e[t]} at dim ${t}`);if(r===-1){if(t>0&&t!==n)throw Error(`Size(${t}) must match the product of shape ${e}`);return e}if(n===0)throw Error(`Cannot infer the missing size in [${e}] when there are 0 elements`);if(t%n!==0)throw Error(`The implicit shape can't be a fractional number. Got ${t} / ${n}`);let i=e.slice();return i[r]=t/n,i}function w(e,t){let n=t.length;return e=e==null?t.map((e,t)=>t):[].concat(e),m(e.every(e=>e>=-n&&e<n),()=>`All values in axis param must be in range [-${n}, ${n}) but got axis ${e}`),m(e.every(e=>y(e)),()=>`All values in axis param must be integers but got axis ${e}`),e.map(e=>e<0?n+e:e)}function T(e,t){let n=[],r=[],i=t!=null&&Array.isArray(t)&&t.length===0,a=t==null||i?null:w(t,e).sort(),o=0;for(let t=0;t<e.length;++t){if(a!=null){if(a[o]===t&&e[t]!==1)throw Error(`Can't squeeze axis ${t} since its dim '${e[t]}' is not 1`);(a[o]==null||a[o]>t)&&e[t]===1&&(n.push(e[t]),r.push(t)),a[o]<=t&&o++}e[t]!==1&&(n.push(e[t]),r.push(t))}return{newShape:n,keptDims:r}}function E(e,t){return D(e,t)}function D(e,t){let n=null;if(e==null||e===`float32`)n=new Float32Array(t);else if(e===`int32`)n=new Int32Array(t);else if(e===`bool`)n=new Uint8Array(t);else if(e===`string`)n=Array(t);else throw Error(`Unknown data type ${e}`);return n}function ee(e,t){for(let n=0;n<e.length;n++){let r=e[n];if(isNaN(r)||!isFinite(r))throw Error(`A tensor of type ${t} being uploaded contains ${r}.`)}}function te(e){return e===`bool`||e===`complex64`||e===`float32`||e===`int32`||e===`string`}function ne(e,t){return!(t===`complex64`||t===`float32`&&e!==`complex64`||t===`int32`&&e!==`float32`&&e!==`complex64`||t===`bool`&&e===`bool`)}function re(e){if(e===`float32`||e===`int32`)return 4;if(e===`complex64`)return 8;if(e===`bool`)return 1;throw Error(`Unknown dtype ${e}`)}function ie(e){if(e==null)return 0;let t=0;return e.forEach(e=>t+=e.length),t}function ae(e){return typeof e==`string`||e instanceof String}function oe(e){return typeof e==`boolean`}function se(e){return typeof e==`number`}function ce(e){return Array.isArray(e)?ce(e[0]):e instanceof Float32Array?`float32`:e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray?`int32`:se(e)?`float32`:ae(e)?`string`:oe(e)?`bool`:`float32`}function le(e){return!!(e&&e.constructor&&e.call&&e.apply)}function ue(e,t){for(let n=t;n<e;++n)if(e%n===0)return n;return e}function O(e){let t=e.length;if(t<2)return[];let n=Array(t-1);n[t-2]=e[t-1];for(let r=t-3;r>=0;--r)n[r]=n[r+1]*e[r+1];return n}function de(e,t,n,r=!1){let i=[];if(t.length===1){let a=t[0]*(r?2:1);for(let t=0;t<a;t++)i[t]=n[e+t]}else{let a=t[0],o=t.slice(1),s=o.reduce((e,t)=>e*t)*(r?2:1);for(let t=0;t<a;t++)i[t]=de(e+t*s,o,n,r)}return i}function fe(e,t,n=!1){if(e.length===0)return t[0];let r=e.reduce((e,t)=>e*t)*(n?2:1);if(r===0)return[];if(r!==t.length)throw Error(`[${e}] does not match the input size ${t.length}${n?` for a complex tensor`:``}.`);return de(0,e,t,n)}function pe(e,t){if(Array.isArray(e))return e;if(t===`float32`)return e instanceof Float32Array?e:new Float32Array(e);if(t===`int32`)return e instanceof Int32Array?e:new Int32Array(e);if(t===`bool`||t===`string`)return Uint8Array.from(new Int32Array(e));throw Error(`Unknown dtype ${t}`)}function me(e,t){let n=he(e,t);for(let e=0;e<n.length;e++)n[e]=1;return n}function he(e,t){if(t==null||t===`float32`||t===`complex64`)return new Float32Array(e);if(t===`int32`)return new Int32Array(e);if(t===`bool`)return new Uint8Array(e);throw Error(`Unknown data type ${t}`)}function ge(e,t){let n=e.reduce((e,t)=>e*t,1);if(t==null||t===`float32`)return fe(e,new Float32Array(n));if(t===`int32`)return fe(e,new Int32Array(n));if(t===`bool`)return fe(e,new Uint8Array(n));throw Error(`Unknown data type ${t}`)}function _e(e){e.forEach(t=>{m(Number.isInteger(t)&&t>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${e}].`)})}function ve(e,t,n){if(t===0)return 0;if(t===1)return e[0];let r=e[e.length-1];for(let t=0;t<e.length-1;++t)r+=n[t]*e[t];return r}function ye(e,t,n){if(t===0)return[];if(t===1)return[e];let r=Array(t);for(let t=0;t<r.length-1;++t)r[t]=Math.floor(e/n[t]),e-=r[t]*n[t];return r[r.length-1]=e,r}function be(e){return e&&e.then&&typeof e.then==`function`}var xe=`tfjsflags`,Se=class{constructor(e){this.global=e,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=Ce,this.populateURLFlags()}setPlatform(e,t){this.platform!=null&&(k().getBool(`IS_TEST`)||k().getBool(`PROD`)||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${e}.`)),this.platformName=e,this.platform=t}registerFlag(e,t,n){if(this.flagRegistry[e]={evaluationFn:t,setHook:n},this.urlFlags[e]!=null){let t=this.urlFlags[e];k().getBool(`IS_TEST`)||k().getBool(`PROD`)||console.warn(`Setting feature override from URL ${e}: ${t}.`),this.set(e,t)}}async getAsync(e){return e in this.flags||(this.flags[e]=await this.evaluateFlag(e)),this.flags[e]}get(e){if(e in this.flags)return this.flags[e];let t=this.evaluateFlag(e);if(be(t))throw Error(`Flag ${e} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[e]=t,this.flags[e]}getNumber(e){return this.get(e)}getBool(e){return this.get(e)}getString(e){return this.get(e)}getFlags(){return this.flags}get features(){return this.flags}set(e,t){if(this.flagRegistry[e]==null)throw Error(`Cannot set flag ${e} as it has not been registered.`);this.flags[e]=t,this.flagRegistry[e].setHook!=null&&this.flagRegistry[e].setHook(t)}evaluateFlag(e){if(this.flagRegistry[e]==null)throw Error(`Cannot evaluate flag '${e}': no evaluation function found.`);return this.flagRegistry[e].evaluationFn()}setFlags(e){this.flags=Object.assign({},e)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(this.global===void 0||this.global.location===void 0||this.global.location.search===void 0)return;let e=this.getQueryParams(this.global.location.search);xe in e&&e[xe].split(`,`).forEach(e=>{let[t,n]=e.split(`:`);this.urlFlags[t]=Te(t,n)})}};function Ce(e){let t={};return e.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(e,...n)=>(we(t,n[0],n[1]),n.join(`=`))),t}function we(e,t,n){e[decodeURIComponent(t)]=decodeURIComponent(n||``)}function Te(e,t){let n=t.toLowerCase();return n===`true`||n===`false`?n===`true`:`${+n}`===n?+n:t}function k(){return Ee}var Ee=null;function De(e){Ee=e}var Oe;function ke(){if(Oe==null){let e;if(typeof window<`u`)e=window;else if(typeof global<`u`)e=global;else if(typeof process<`u`)e=process;else if(typeof self<`u`)e=self;else throw Error(`Could not find a global object`);Oe=e}return Oe}function Ae(){let e=ke();return e._tfGlobals??=new Map,e._tfGlobals}function je(e,t){let n=Ae();if(n.has(e))return n.get(e);{let r=t();return n.set(e,r),n.get(e)}}var Me=`Acos`,Ne=`Acosh`,Pe=`AddN`,Fe=`ArgMax`,Ie=`ArgMin`,Le=`Asin`,Re=`Asinh`,ze=`Atan`,Be=`Atanh`,Ve=`Atan2`,He=`AvgPool`,Ue=`AvgPoolGrad`,We=`AvgPool3D`,Ge=`AvgPool3DGrad`,Ke=`BatchMatMul`,qe=`BatchToSpaceND`,Je=`Bincount`,Ye=`BitwiseAnd`,Xe=`BroadcastTo`,Ze=`BroadcastArgs`,Qe=`Cast`,$e=`Ceil`,et=`ClipByValue`,tt=`Complex`,nt=`ComplexAbs`,rt=`Concat`,it=`Conv2D`,at=`Conv2DBackpropFilter`,ot=`Conv2DBackpropInput`,st=`Conv3D`,ct=`Conv3DBackpropFilterV2`,lt=`Conv3DBackpropInputV2`,ut=`Cosh`,dt=`Cumprod`,ft=`Cumsum`,pt=`CropAndResize`,mt=`DenseBincount`,ht=`DepthToSpace`,gt=`DepthwiseConv2dNative`,_t=`DepthwiseConv2dNativeBackpropFilter`,vt=`DepthwiseConv2dNativeBackpropInput`,yt=`Diag`,bt=`Dilation2D`,xt=`Dilation2DBackpropInput`,St=`Dilation2DBackpropFilter`,Ct=`Draw`,wt=`RealDiv`,Tt=`Einsum`,Et=`EluGrad`,Dt=`Equal`,Ot=`ExpandDims`,kt=`Expm1`,At=`Fill`,jt=`FlipLeftRight`,Mt=`Floor`,Nt=`FloorDiv`,Pt=`FusedBatchNorm`,Ft=`GatherV2`,It=`GatherNd`,Lt=`Greater`,Rt=`GreaterEqual`,zt=`Identity`,Bt=`IFFT`,Vt=`Imag`,Ht=`IsFinite`,Ut=`IsInf`,Wt=`IsNan`,Gt=`LeakyRelu`,Kt=`Less`,qt=`LessEqual`,Jt=`LinSpace`,Yt=`Log1p`,Xt=`LogicalAnd`,Zt=`LogicalNot`,Qt=`LogicalOr`,$t=`LogSoftmax`,en=`LRNGrad`,tn=`Maximum`,nn=`MaxPool`,rn=`MaxPoolGrad`,an=`MaxPool3D`,on=`MaxPool3DGrad`,sn=`MaxPoolWithArgmax`,cn=`Mean`,ln=`Minimum`,un=`MirrorPad`,dn=`Multinomial`,fn=`Multiply`,pn=`NotEqual`,mn=`NonMaxSuppressionV3`,hn=`NonMaxSuppressionV4`,gn=`NonMaxSuppressionV5`,_n=`OnesLike`,vn=`OneHot`,yn=`Pack`,bn=`PadV2`,xn=`Prelu`,Sn=`Prod`,Cn=`RaggedGather`,wn=`RaggedRange`,Tn=`RaggedTensorToTensor`,En=`Range`,Dn=`Real`,On=`Reciprocal`,kn=`Relu`,An=`Reshape`,jn=`ResizeNearestNeighbor`,Mn=`ResizeNearestNeighborGrad`,Nn=`ResizeBilinear`,Pn=`ResizeBilinearGrad`,Fn=`Relu6`,In=`Reverse`,Ln=`Round`,Rn=`Rsqrt`,zn=`ScatterNd`,Bn=`TensorScatterUpdate`,Vn=`SearchSorted`,Hn=`Select`,Un=`Selu`,Wn=`Slice`,Gn=`Sinh`,Kn=`Sign`,qn=`Sigmoid`,Jn=`Softplus`,Yn=`Sqrt`,Xn=`SpaceToBatchND`,Zn=`SplitV`,Qn=`Softmax`,$n=`SparseFillEmptyRows`,er=`SparseReshape`,tr=`SparseSegmentMean`,nr=`SparseSegmentSum`,rr=`SparseToDense`,ir=`SquaredDifference`,ar=`Square`,or=`StaticRegexReplace`,sr=`StridedSlice`,cr=`StringNGrams`,lr=`StringSplit`,ur=`StringToHashBucketFast`,dr=`Tanh`,fr=`Tile`,pr=`TopK`,mr=`Transform`,hr=`Transpose`,gr=`Unique`,_r=`Unpack`,vr=`UnsortedSegmentSum`,yr=`ZerosLike`,br=`Step`,xr=`FromPixels`,Sr=`RotateWithOffset`,Cr=`_FusedMatMul`,wr=`FusedConv2D`,Tr=`FusedDepthwiseConv2D`;function Er(...e){k().getBool(`IS_TEST`)||k().getBool(`PROD`)||console.warn(...e)}function Dr(...e){k().getBool(`IS_TEST`)||k().getBool(`PROD`)||console.log(...e)}var Or=je(`kernelRegistry`,()=>new Map),kr=je(`gradRegistry`,()=>new Map);function Ar(e,t){let n=Fr(e,t);return Or.get(n)}function jr(e){return kr.get(e)}function Mr(e){let t=Or.entries(),n=[];for(;;){let{done:r,value:i}=t.next();if(r)break;let[a,o]=i,[s]=a.split(`_`);s===e&&n.push(o)}return n}function Nr(e){let{kernelName:t,backendName:n}=e,r=Fr(t,n);Or.has(r)&&Er(`The kernel '${t}' for backend '${n}' is already registered`),Or.set(r,e)}function Pr(e){let{kernelName:t}=e;kr.has(t)&&k().getBool(`DEBUG`)&&Er(`Overriding the gradient for '${t}'`),kr.set(t,e)}function Fr(e,t){return`${t}_${e}`}function Ir(e){return e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray}var Lr=e(n(((e,t)=>{t.exports=r;var n=null;try{n=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function r(e,t,n){this.low=e|0,this.high=t|0,this.unsigned=!!n}r.prototype.__isLong__,Object.defineProperty(r.prototype,"__isLong__",{value:!0});function i(e){return(e&&e.__isLong__)===!0}r.isLong=i;var a={},o={};function s(e,t){var n,r,i;return t?(e>>>=0,(i=0<=e&&e<256)&&(r=o[e],r)?r:(n=l(e,(e|0)<0?-1:0,!0),i&&(o[e]=n),n)):(e|=0,(i=-128<=e&&e<128)&&(r=a[e],r)?r:(n=l(e,e<0?-1:0,!1),i&&(a[e]=n),n))}r.fromInt=s;function c(e,t){if(isNaN(e))return t?b:y;if(t){if(e<0)return b;if(e>=g)return T}else{if(e<=-_)return E;if(e+1>=_)return w}return e<0?c(-e,t).neg():l(e%h|0,e/h|0,t)}r.fromNumber=c;function l(e,t,n){return new r(e,t,n)}r.fromBits=l;var u=Math.pow;function d(e,t,n){if(e.length===0)throw Error(`empty string`);if(e===`NaN`||e===`Infinity`||e===`+Infinity`||e===`-Infinity`)return y;if(typeof t==`number`?(n=t,t=!1):t=!!t,n||=10,n<2||36<n)throw RangeError(`radix`);var r;if((r=e.indexOf(`-`))>0)throw Error(`interior hyphen`);if(r===0)return d(e.substring(1),t,n).neg();for(var i=c(u(n,8)),a=y,o=0;o<e.length;o+=8){var s=Math.min(8,e.length-o),l=parseInt(e.substring(o,o+s),n);if(s<8){var f=c(u(n,s));a=a.mul(f).add(c(l))}else a=a.mul(i),a=a.add(c(l))}return a.unsigned=t,a}r.fromString=d;function f(e,t){return typeof e==`number`?c(e,t):typeof e==`string`?d(e,t):l(e.low,e.high,typeof t==`boolean`?t:e.unsigned)}r.fromValue=f;var p=65536,m=1<<24,h=p*p,g=h*h,_=g/2,v=s(m),y=s(0);r.ZERO=y;var b=s(0,!0);r.UZERO=b;var x=s(1);r.ONE=x;var S=s(1,!0);r.UONE=S;var C=s(-1);r.NEG_ONE=C;var w=l(-1,2147483647,!1);r.MAX_VALUE=w;var T=l(-1,-1,!0);r.MAX_UNSIGNED_VALUE=T;var E=l(0,-2147483648,!1);r.MIN_VALUE=E;var D=r.prototype;D.toInt=function(){return this.unsigned?this.low>>>0:this.low},D.toNumber=function(){return this.unsigned?(this.high>>>0)*h+(this.low>>>0):this.high*h+(this.low>>>0)},D.toString=function(e){if(e||=10,e<2||36<e)throw RangeError(`radix`);if(this.isZero())return`0`;if(this.isNegative())if(this.eq(E)){var t=c(e),n=this.div(t),r=n.mul(t).sub(this);return n.toString(e)+r.toInt().toString(e)}else return`-`+this.neg().toString(e);for(var i=c(u(e,6),this.unsigned),a=this,o=``;;){var s=a.div(i),l=(a.sub(s.mul(i)).toInt()>>>0).toString(e);if(a=s,a.isZero())return l+o;for(;l.length<6;)l=`0`+l;o=``+l+o}},D.getHighBits=function(){return this.high},D.getHighBitsUnsigned=function(){return this.high>>>0},D.getLowBits=function(){return this.low},D.getLowBitsUnsigned=function(){return this.low>>>0},D.getNumBitsAbs=function(){if(this.isNegative())return this.eq(E)?64:this.neg().getNumBitsAbs();for(var e=this.high==0?this.low:this.high,t=31;t>0&&!(e&1<<t);t--);return this.high==0?t+1:t+33},D.isZero=function(){return this.high===0&&this.low===0},D.eqz=D.isZero,D.isNegative=function(){return!this.unsigned&&this.high<0},D.isPositive=function(){return this.unsigned||this.high>=0},D.isOdd=function(){return(this.low&1)==1},D.isEven=function(){return!(this.low&1)},D.equals=function(e){return i(e)||(e=f(e)),this.unsigned!==e.unsigned&&this.high>>>31==1&&e.high>>>31==1?!1:this.high===e.high&&this.low===e.low},D.eq=D.equals,D.notEquals=function(e){return!this.eq(e)},D.neq=D.notEquals,D.ne=D.notEquals,D.lessThan=function(e){return this.comp(e)<0},D.lt=D.lessThan,D.lessThanOrEqual=function(e){return this.comp(e)<=0},D.lte=D.lessThanOrEqual,D.le=D.lessThanOrEqual,D.greaterThan=function(e){return this.comp(e)>0},D.gt=D.greaterThan,D.greaterThanOrEqual=function(e){return this.comp(e)>=0},D.gte=D.greaterThanOrEqual,D.ge=D.greaterThanOrEqual,D.compare=function(e){if(i(e)||(e=f(e)),this.eq(e))return 0;var t=this.isNegative(),n=e.isNegative();return t&&!n?-1:!t&&n?1:this.unsigned?e.high>>>0>this.high>>>0||e.high===this.high&&e.low>>>0>this.low>>>0?-1:1:this.sub(e).isNegative()?-1:1},D.comp=D.compare,D.negate=function(){return!this.unsigned&&this.eq(E)?E:this.not().add(x)},D.neg=D.negate,D.add=function(e){i(e)||(e=f(e));var t=this.high>>>16,n=this.high&65535,r=this.low>>>16,a=this.low&65535,o=e.high>>>16,s=e.high&65535,c=e.low>>>16,u=e.low&65535,d=0,p=0,m=0,h=0;return h+=a+u,m+=h>>>16,h&=65535,m+=r+c,p+=m>>>16,m&=65535,p+=n+s,d+=p>>>16,p&=65535,d+=t+o,d&=65535,l(m<<16|h,d<<16|p,this.unsigned)},D.subtract=function(e){return i(e)||(e=f(e)),this.add(e.neg())},D.sub=D.subtract,D.multiply=function(e){if(this.isZero())return y;if(i(e)||(e=f(e)),n)return l(n.mul(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned);if(e.isZero())return y;if(this.eq(E))return e.isOdd()?E:y;if(e.eq(E))return this.isOdd()?E:y;if(this.isNegative())return e.isNegative()?this.neg().mul(e.neg()):this.neg().mul(e).neg();if(e.isNegative())return this.mul(e.neg()).neg();if(this.lt(v)&&e.lt(v))return c(this.toNumber()*e.toNumber(),this.unsigned);var t=this.high>>>16,r=this.high&65535,a=this.low>>>16,o=this.low&65535,s=e.high>>>16,u=e.high&65535,d=e.low>>>16,p=e.low&65535,m=0,h=0,g=0,_=0;return _+=o*p,g+=_>>>16,_&=65535,g+=a*p,h+=g>>>16,g&=65535,g+=o*d,h+=g>>>16,g&=65535,h+=r*p,m+=h>>>16,h&=65535,h+=a*d,m+=h>>>16,h&=65535,h+=o*u,m+=h>>>16,h&=65535,m+=t*p+r*d+a*u+o*s,m&=65535,l(g<<16|_,m<<16|h,this.unsigned)},D.mul=D.multiply,D.divide=function(e){if(i(e)||(e=f(e)),e.isZero())throw Error(`division by zero`);if(n)return!this.unsigned&&this.high===-2147483648&&e.low===-1&&e.high===-1?this:l((this.unsigned?n.div_u:n.div_s)(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned);if(this.isZero())return this.unsigned?b:y;var t,r,a;if(this.unsigned){if(e.unsigned||(e=e.toUnsigned()),e.gt(this))return b;if(e.gt(this.shru(1)))return S;a=b}else{if(this.eq(E))return e.eq(x)||e.eq(C)?E:e.eq(E)?x:(t=this.shr(1).div(e).shl(1),t.eq(y)?e.isNegative()?x:C:(r=this.sub(e.mul(t)),a=t.add(r.div(e)),a));if(e.eq(E))return this.unsigned?b:y;if(this.isNegative())return e.isNegative()?this.neg().div(e.neg()):this.neg().div(e).neg();if(e.isNegative())return this.div(e.neg()).neg();a=y}for(r=this;r.gte(e);){t=Math.max(1,Math.floor(r.toNumber()/e.toNumber()));for(var o=Math.ceil(Math.log(t)/Math.LN2),s=o<=48?1:u(2,o-48),d=c(t),p=d.mul(e);p.isNegative()||p.gt(r);)t-=s,d=c(t,this.unsigned),p=d.mul(e);d.isZero()&&(d=x),a=a.add(d),r=r.sub(p)}return a},D.div=D.divide,D.modulo=function(e){return i(e)||(e=f(e)),n?l((this.unsigned?n.rem_u:n.rem_s)(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned):this.sub(this.div(e).mul(e))},D.mod=D.modulo,D.rem=D.modulo,D.not=function(){return l(~this.low,~this.high,this.unsigned)},D.and=function(e){return i(e)||(e=f(e)),l(this.low&e.low,this.high&e.high,this.unsigned)},D.or=function(e){return i(e)||(e=f(e)),l(this.low|e.low,this.high|e.high,this.unsigned)},D.xor=function(e){return i(e)||(e=f(e)),l(this.low^e.low,this.high^e.high,this.unsigned)},D.shiftLeft=function(e){return i(e)&&(e=e.toInt()),(e&=63)==0?this:e<32?l(this.low<<e,this.high<<e|this.low>>>32-e,this.unsigned):l(0,this.low<<e-32,this.unsigned)},D.shl=D.shiftLeft,D.shiftRight=function(e){return i(e)&&(e=e.toInt()),(e&=63)==0?this:e<32?l(this.low>>>e|this.high<<32-e,this.high>>e,this.unsigned):l(this.high>>e-32,this.high>=0?0:-1,this.unsigned)},D.shr=D.shiftRight,D.shiftRightUnsigned=function(e){if(i(e)&&(e=e.toInt()),e&=63,e===0)return this;var t=this.high;if(e<32){var n=this.low;return l(n>>>e|t<<32-e,t>>>e,this.unsigned)}return l(e===32?t:t>>>e-32,0,this.unsigned)},D.shru=D.shiftRightUnsigned,D.shr_u=D.shiftRightUnsigned,D.toSigned=function(){return this.unsigned?l(this.low,this.high,!1):this},D.toUnsigned=function(){return this.unsigned?this:l(this.low,this.high,!0)},D.toBytes=function(e){return e?this.toBytesLE():this.toBytesBE()},D.toBytesLE=function(){var e=this.high,t=this.low;return[t&255,t>>>8&255,t>>>16&255,t>>>24,e&255,e>>>8&255,e>>>16&255,e>>>24]},D.toBytesBE=function(){var e=this.high,t=this.low;return[e>>>24,e>>>16&255,e>>>8&255,e&255,t>>>24,t>>>16&255,t>>>8&255,t&255]},r.fromBytes=function(e,t,n){return n?r.fromBytesLE(e,t):r.fromBytesBE(e,t)},r.fromBytesLE=function(e,t){return new r(e[0]|e[1]<<8|e[2]<<16|e[3]<<24,e[4]|e[5]<<8|e[6]<<16|e[7]<<24,t)},r.fromBytesBE=function(e,t){return new r(e[4]<<24|e[5]<<16|e[6]<<8|e[7],e[0]<<24|e[1]<<16|e[2]<<8|e[3],t)}}))()),Rr=Lr.default||Lr;function zr(e){return Rr.fromString(e,!0,16)}var Br=zr(`c3a5c85c97cb3127`),Vr=zr(`b492b66fbe98f273`),Hr=zr(`9ae16a3b2f90404f`);function Ur(e){return e.xor(e.shru(47))}function Wr(e,t,n){let r=e.slice(t,t+n);return Rr.fromBytes(Array.from(r),!0,!0)}function Gr(e,t){return Wr(e,t,8)}function Kr(e,t){return Wr(e,t,4)}function qr(e,t){return t===0?e:e.shru(t).or(e.shl(64-t))}function Jr(e,t,n=zr(`9ddfea08eb382d69`)){let r=e.xor(t).mul(n);r=r.xor(r.shru(47));let i=t.xor(r).mul(n);return i=i.xor(i.shru(47)),i=i.mul(n),i}function Yr(e,t,n,r,i,a){i=i.add(e),a=qr(a.add(i).add(r),21);let o=i;return i=i.add(t),i=i.add(n),a=a.add(qr(i,44)),[i.add(r),a.add(o)]}function Xr(e,t,n,r){return Yr(Gr(e,t),Gr(e,t+8),Gr(e,t+16),Gr(e,t+24),n,r)}function Zr(e,t=e.length){if(t>=8){let n=Hr.add(t*2),r=Gr(e,0).add(Hr),i=Gr(e,t-8);return Jr(qr(i,37).mul(n).add(r),qr(r,25).add(i).mul(n),n)}if(t>=4){let n=Hr.add(t*2);return Jr(Kr(e,0).shl(3).add(t),Kr(e,t-4),n)}if(t>0){let n=e[0],r=e[t>>1],i=e[t-1],a=n+(r<<8),o=t+(i<<2);return Ur(Hr.mul(a).xor(Br.mul(o))).mul(Hr)}return Hr}function Qr(e,t=e.length){let n=Hr.add(t*2),r=Gr(e,0).mul(Vr),i=Gr(e,8),a=Gr(e,t-8).mul(n),o=Gr(e,t-16).mul(Hr);return Jr(qr(r.add(i),43).add(qr(a,30)).add(o),r.add(qr(i.add(Hr),18)).add(a),n)}function $r(e,t=e.length){let n=Hr.add(t*2),r=Gr(e,0).mul(Hr),i=Gr(e,8),a=Gr(e,t-8).mul(n),o=Gr(e,t-16).mul(Hr),s=qr(r.add(i),43).add(qr(a,30)).add(o),c=Jr(s,r.add(qr(i.add(Hr),18)).add(a),n),l=Gr(e,16).mul(n),u=Gr(e,24),d=s.add(Gr(e,t-32)).mul(n),f=c.add(Gr(e,t-24)).mul(n);return Jr(qr(l.add(u),43).add(qr(d,30)).add(f),l.add(qr(u.add(r),18)).add(d),n)}function ei(e,t=e.length){let n=Rr.fromNumber(81,!0);if(t<=32)return t<=16?Zr(e,t):Qr(e,t);if(t<=64)return $r(e,t);let r=n,i=n.mul(Vr).add(113),a=Ur(i.mul(Hr).add(113)).mul(Hr),o=[Rr.UZERO,Rr.UZERO],s=[Rr.UZERO,Rr.UZERO];r=r.mul(Hr).add(Gr(e,0));let c=0,l=(t-1>>6)*64,u=l+(t-1&63)-63;do r=qr(r.add(i).add(o[0]).add(Gr(e,c+8)),37).mul(Vr),i=qr(i.add(o[1]).add(Gr(e,c+48)),42).mul(Vr),r=r.xor(s[1]),i=i.add(o[0]).add(Gr(e,c+40)),a=qr(a.add(s[0]),33).mul(Vr),o=Xr(e,c,o[1].mul(Vr),r.add(s[0])),s=Xr(e,c+32,a.add(s[1]),i.add(Gr(e,c+16))),[a,r]=[r,a],c+=64;while(c!==l);let d=Vr.add(a.and(255).shl(1));return c=u,s[0]=s[0].add(t-1&63),o[0]=o[0].add(s[0]),s[0]=s[0].add(o[0]),r=qr(r.add(i).add(o[0]).add(Gr(e,c+8)),37).mul(d),i=qr(i.add(o[1]).add(Gr(e,c+48)),42).mul(d),r=r.xor(s[1].mul(9)),i=i.add(o[0].mul(9).add(Gr(e,c+40))),a=qr(a.add(s[0]),33).mul(d),o=Xr(e,c,o[1].mul(d),r.add(s[0])),s=Xr(e,c+32,a.add(s[1]),i.add(Gr(e,c+16))),[a,r]=[r,a],Jr(Jr(o[0],s[0],d).add(Ur(i).mul(Br)).add(a),Jr(o[1],s[1],d).add(r),d)}function ti(e,t){return t===`string`?ai(e):ri([e],t)}function ni(e,t){return e instanceof Float32Array&&t===`float32`||e instanceof Int32Array&&t===`int32`||e instanceof Uint8Array&&t===`bool`}function ri(e,t){if(t===`string`)throw Error(`Cannot convert a string[] to a TypedArray`);if(Array.isArray(e)&&(e=ci(e)),k().getBool(`DEBUG`)&&ee(e,t),ni(e,t))return e;if(t==null||t===`float32`||t===`complex64`)return new Float32Array(e);if(t===`int32`)return new Int32Array(e);if(t===`bool`){let t=new Uint8Array(e.length);for(let n=0;n<t.length;++n)Math.round(e[n])!==0&&(t[n]=1);return t}throw Error(`Unknown data type ${t}`)}function ii(){return k().platform.now()}function ai(e,t=`utf-8`){return t||=`utf-8`,k().platform.encode(e,t)}function oi(e,t=`utf-8`){return t||=`utf-8`,k().platform.decode(e,t)}function si(e){return k().platform.isTypedArray==null?Ir(e):k().platform.isTypedArray(e)}function ci(e,t=[],n=!1){if(t??=[],typeof e==`boolean`||typeof e==`number`||typeof e==`string`||be(e)||e==null||si(e)&&n)t.push(e);else if(Array.isArray(e)||si(e))for(let r=0;r<e.length;++r)ci(e[r],t,n);else{let r=-1;for(let t of Object.keys(e))/^([1-9]+[0-9]*|0)$/.test(t)&&(r=Math.max(r,Number(t)));for(let i=0;i<=r;i++)ci(e[i],t,n)}return t}var li=class{constructor(e,t){this.backendTimer=e,this.logger=t,t??(this.logger=new di)}profileKernel(e,t,n){let r,i=()=>{r=n()},a,o=ii();if(this.backendTimer.timerAvailable())a=this.backendTimer.time(i);else{i();for(let e of r)e.dataSync();a=Promise.resolve({kernelMs:ii()-o})}if(k().getBool(`CHECK_COMPUTATION_FOR_ERRORS`))for(let t=0;t<r.length;t++){let n=r[t];n.data().then(t=>{ui(t,n.dtype,e)})}return{kernelName:e,outputs:r,inputs:t,timeMs:a.then(e=>e.kernelMs),extraInfo:a.then(e=>e.getExtraProfileInfo==null?``:e.getExtraProfileInfo())}}logKernelProfile(e){let{kernelName:t,outputs:n,timeMs:r,inputs:i,extraInfo:a}=e;n.forEach(e=>{Promise.all([e.data(),r,a]).then(n=>{this.logger.logKernelProfile(t,e,n[0],n[1],i,n[2])})})}};function ui(e,t,n){if(t!==`float32`)return!1;for(let t=0;t<e.length;t++){let r=e[t];if(isNaN(r)||!isFinite(r))return console.warn(`Found ${r} in the result of '${n}'`),!0}return!1}var di=class{logKernelProfile(e,t,n,r,i,a){let o=typeof r==`number`?x(`${r}ms`,9):r.error,s=x(e,25),c=t.rank,l=t.size,u=x(t.shape.toString(),14),d=``;for(let e in i){let n=i[e];if(n!=null){let r=n.shape||t.shape,i=r.length;d+=`${e}: ${i}D ${i>0?r:``} `}}console.log(`%c${s}\t%c${o}\t%c${c}D ${u}\t%c${l}\t%c${d}\t%c${a}`,`font-weight:bold`,`color:red`,`color:blue`,`color: orange`,`color: green`,`color: steelblue`)}};function fi(e,t,n){let r={},i={};for(let e=0;e<t.length;e++)r[t[e].id]=!0;for(let n=0;n<e.length;n++){let a=e[n],o=a.inputs;for(let e in o){let n=o[e],s=!1;for(let e=0;e<t.length;e++)if(r[n.id]){a.outputs.forEach(e=>r[e.id]=!0),s=!0,i[a.id]=!0;break}if(s)break}}let a={};a[n.id]=!0;let o={};for(let t=e.length-1;t>=0;t--){let n=e[t],r=n.inputs;for(let e=0;e<n.outputs.length;e++)if(a[n.outputs[e].id]){for(let e in r)a[r[e].id]=!0,o[n.id]=!0;break}}let s=[];for(let t=0;t<e.length;t++){let n=e[t];if(i[n.id]&&o[n.id]){let e={};for(let t in n.inputs){let i=n.inputs[t];r[i.id]&&(e[t]=i)}let t=Object.assign({},n);t.inputs=e,t.outputs=n.outputs,s.push(t)}}return s}function pi(e,t,n,r){for(let i=t.length-1;i>=0;i--){let a=t[i],o=[];if(a.outputs.forEach(t=>{let n=e[t.id];n==null?o.push(null):o.push(n)}),a.gradient==null)throw Error(`Cannot compute gradient: gradient function not found for ${a.kernelName}.`);let s=a.gradient(o);for(let t in a.inputs){if(!(t in s))throw Error(`Cannot backprop through input ${t}. Available gradients found: ${Object.keys(s)}.`);let i=n(()=>s[t]());if(i.dtype!==`float32`)throw Error(`Error in gradient for op ${a.kernelName}. The gradient of input ${t} must have 'float32' dtype, but has '${i.dtype}'`);let o=a.inputs[t];if(!v(i.shape,o.shape))throw Error(`Error in gradient for op ${a.kernelName}. The gradient of input '${t}' has shape '${i.shape}', which does not match the shape of the input '${o.shape}'`);if(e[o.id]==null)e[o.id]=i;else{let t=e[o.id];e[o.id]=r(t,i),t.dispose()}}}}var mi=20,hi=3,gi=7;function _i(e,t,n,r){let i=O(t),a=vi(e,t,n,i),o=t.length,s=xi(e,t,n,i,a),c=[`Tensor`];return r&&(c.push(`  dtype: ${n}`),c.push(`  rank: ${o}`),c.push(`  shape: [${t}]`),c.push(`  values:`)),c.push(s.map(e=>`    `+e).join(`
`)),c.join(`
`)}function vi(e,t,n,r){let i=_(t),a=r[r.length-1],o=Array(a).fill(0),s=t.length,c=n===`complex64`?Si(e):e;if(s>1)for(let e=0;e<i/a;e++){let t=e*a;for(let e=0;e<a;e++)o[e]=Math.max(o[e],yi(c[t+e],0,n).length)}return o}function yi(e,t,n){let r;return r=Array.isArray(e)?`${parseFloat(e[0].toFixed(gi))} + ${parseFloat(e[1].toFixed(gi))}j`:ae(e)?`'${e}'`:n===`bool`?bi(e):parseFloat(e.toFixed(gi)).toString(),x(r,t)}function bi(e){return e===0?`false`:`true`}function xi(e,t,n,r,i,a=!0){let o=n===`complex64`?2:1,s=t[0],c=t.length;if(c===0)return n===`complex64`?[yi(Si(e)[0],0,n)]:n===`bool`?[bi(e[0])]:[e[0].toString()];if(c===1){if(s>mi){let t=hi*o,r=Array.from(e.slice(0,t)),a=Array.from(e.slice((s-hi)*o,s*o));return n===`complex64`&&(r=Si(r),a=Si(a)),[`[`+r.map((e,t)=>yi(e,i[t],n)).join(`, `)+`, ..., `+a.map((e,t)=>yi(e,i[s-hi+t],n)).join(`, `)+`]`]}return[`[`+(n===`complex64`?Si(e):Array.from(e)).map((e,t)=>yi(e,i[t],n)).join(`, `)+`]`]}let l=t.slice(1),u=r.slice(1),d=r[0]*o,f=[];if(s>mi){for(let t=0;t<hi;t++){let r=t*d,a=r+d;f.push(...xi(e.slice(r,a),l,n,u,i,!1))}f.push(`...`);for(let t=s-hi;t<s;t++){let r=t*d,a=r+d;f.push(...xi(e.slice(r,a),l,n,u,i,t===s-1))}}else for(let t=0;t<s;t++){let r=t*d,a=r+d;f.push(...xi(e.slice(r,a),l,n,u,i,t===s-1))}let p=c===2?`,`:``;f[0]=`[`+(s>0?f[0]+p:``);for(let e=1;e<f.length-1;e++)f[e]=` `+f[e]+p;let m=`,
`;for(let e=2;e<c;e++)m+=`
`;return f[f.length-1]=` `+f[f.length-1]+`]`+(a?``:m),f}function Si(e){let t=[];for(let n=0;n<e.length;n+=2)t.push([e[n],e[n+1]]);return t}var Ci=class{constructor(e,t,n){if(this.dtype=t,this.shape=e.slice(),this.size=_(e),n!=null){let e=n.length;m(e===this.size,()=>`Length of values '${e}' does not match the size inferred by the shape '${this.size}'.`)}if(t===`complex64`)throw Error(`complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).`);this.values=n||D(t,this.size),this.strides=O(e)}set(e,...t){t.length===0&&(t=[0]),m(t.length===this.rank,()=>`The number of provided coordinates (${t.length}) must match the rank (${this.rank})`);let n=this.locToIndex(t);this.values[n]=e}get(...e){e.length===0&&(e=[0]);let t=0;for(let n of e){if(n<0||n>=this.shape[t]){let t=`Requested out of range element at ${e}.   Buffer shape=${this.shape}`;throw Error(t)}t++}let n=e[e.length-1];for(let t=0;t<e.length-1;++t)n+=this.strides[t]*e[t];return this.values[n]}locToIndex(e){if(this.rank===0)return 0;if(this.rank===1)return e[0];let t=e[e.length-1];for(let n=0;n<e.length-1;++n)t+=this.strides[n]*e[n];return t}indexToLoc(e){if(this.rank===0)return[];if(this.rank===1)return[e];let t=Array(this.shape.length);for(let n=0;n<t.length-1;++n)t[n]=Math.floor(e/this.strides[n]),e-=t[n]*this.strides[n];return t[t.length-1]=e,t}get rank(){return this.shape.length}toTensor(){return wi().makeTensor(this.values,this.shape,this.dtype)}},wi=null,Ti=null;function Ei(e){wi=e}function Di(e){Ti=e}var Oi=class{constructor(e,t,n,r){this.kept=!1,this.isDisposedInternal=!1,this.shape=e.slice(),this.dtype=t||`float32`,this.size=_(e),this.strides=O(e),this.dataId=n,this.id=r,this.rankType=this.rank<5?this.rank.toString():`higher`}get rank(){return this.shape.length}async buffer(){let e=await this.data();return Ti.buffer(this.shape,this.dtype,e)}bufferSync(){return Ti.buffer(this.shape,this.dtype,this.dataSync())}async array(){let e=await this.data();return fe(this.shape,e,this.dtype===`complex64`)}arraySync(){return fe(this.shape,this.dataSync(),this.dtype===`complex64`)}async data(){this.throwIfDisposed();let e=wi().read(this.dataId);if(this.dtype===`string`){let t=await e;try{return t.map(e=>oi(e))}catch{throw Error(`Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().`)}}return e}dataToGPU(e){return this.throwIfDisposed(),wi().readToGPU(this.dataId,e)}dataSync(){this.throwIfDisposed();let e=wi().readSync(this.dataId);if(this.dtype===`string`)try{return e.map(e=>oi(e))}catch{throw Error(`Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().`)}return e}async bytes(){this.throwIfDisposed();let e=await wi().read(this.dataId);return this.dtype===`string`?e:new Uint8Array(e.buffer)}dispose(){this.isDisposed||(this.kerasMask&&this.kerasMask.dispose(),wi().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw Error(`Tensor is disposed.`)}print(e=!1){return Ti.print(this,e)}clone(){return this.throwIfDisposed(),Ti.clone(this)}toString(e=!1){return _i(this.dataSync(),this.shape,this.dtype,e)}cast(e){return this.throwIfDisposed(),Ti.cast(this,e)}variable(e=!0,t,n){return this.throwIfDisposed(),wi().makeVariable(this,e,t,n)}};Object.defineProperty(Oi,Symbol.hasInstance,{value:e=>!!e&&e.data!=null&&e.dataSync!=null&&e.throwIfDisposed!=null});function A(){return je(`Tensor`,()=>Oi)}A();var ki=class extends Oi{constructor(e,t,n,r){super(e.shape,e.dtype,e.dataId,r),this.trainable=t,this.name=n}assign(e){if(e.dtype!==this.dtype)throw Error(`dtype of the new value (${e.dtype}) and previous value (${this.dtype}) must match`);if(!v(e.shape,this.shape))throw Error(`shape of the new value (${e.shape}) and previous value (${this.shape}) must match`);wi().disposeTensor(this),this.dataId=e.dataId,wi().incRef(this,null)}dispose(){wi().disposeVariable(this),this.isDisposedInternal=!0}};Object.defineProperty(ki,Symbol.hasInstance,{value:e=>e instanceof Oi&&e.assign!=null&&e.assign instanceof Function});var Ai;(function(e){e.R0=`R0`,e.R1=`R1`,e.R2=`R2`,e.R3=`R3`,e.R4=`R4`,e.R5=`R5`,e.R6=`R6`})(Ai||={});var ji;(function(e){e.float32=`float32`,e.int32=`int32`,e.bool=`int32`,e.complex64=`complex64`})(ji||={});var Mi;(function(e){e.float32=`float32`,e.int32=`int32`,e.bool=`bool`,e.complex64=`complex64`})(Mi||={});var Ni;(function(e){e.float32=`float32`,e.int32=`float32`,e.bool=`float32`,e.complex64=`complex64`})(Ni||={});var Pi;(function(e){e.float32=`complex64`,e.int32=`complex64`,e.bool=`complex64`,e.complex64=`complex64`})(Pi||={});var Fi={float32:Ni,int32:ji,bool:Mi,complex64:Pi};function Ii(e,t){if(e===`string`||t===`string`){if(e===`string`&&t===`string`)return`string`;throw Error(`Can not upcast ${e} with ${t}`)}return Fi[e][t]}function Li(e){return Ii(e,`int32`)}function Ri(e){return typeof e==`object`&&!!e&&`texture`in e&&e.texture instanceof WebGLTexture}function zi(e){return typeof GPUBuffer<`u`&&typeof e==`object`&&!!e&&`buffer`in e&&e.buffer instanceof GPUBuffer}function Bi(e,t){if(e.dtype===t.dtype)return[e,t];let n=Ii(e.dtype,t.dtype);return[e.cast(n),t.cast(n)]}function Vi(e,t){return t.some(t=>t.id===e.id)}function Hi(e){let t=[];return Ui(e,t,new Set),t}function Ui(e,t,n){if(e==null)return;if(e instanceof Oi){t.push(e);return}if(!Wi(e))return;let r=e;for(let e in r){let i=r[e];n.has(i)||(n.add(i),Ui(i,t,n))}}function Wi(e){return Array.isArray(e)||typeof e==`object`}function Gi(e){return e.kernelName!=null}var Ki=class{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(e=>e.name)))}}}dispose(){for(let e in this.registeredVariables)this.registeredVariables[e].dispose()}},qi=class e{constructor(e){this.ENV=e,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new Ki}async ready(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;let e=this.getSortedBackends();for(let t=0;t<e.length;t++){let n=e[t];if(await this.initializeBackend(n).success){await this.setBackend(n);return}}throw Error(`Could not initialize any backends, all backend initializations failed.`)}get backend(){if(this.pendingBackendInit!=null)throw Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){let{name:e,asyncInit:t}=this.initializeBackendsAndReturnBest();if(t)throw Error(`The highest priority backend '${e}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(e)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(e){if(!(e in this.registry))if(e in this.registryFactory){let{asyncInit:t}=this.initializeBackend(e);if(t)return null}else return null;return this.registry[e]}findBackendFactory(e){return e in this.registryFactory?this.registryFactory[e].factory:null}registerBackend(e,t,n=1){return e in this.registryFactory?(Er(`${e} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[e]={factory:t,priority:n},!0)}async setBackend(e){if(this.registryFactory[e]==null)throw Error(`Backend name '${e}' not found in registry`);if(this.backendName=e,this.registry[e]==null){this.backendInstance=null;let{success:t,asyncInit:n}=this.initializeBackend(e);if(!(n?await t:t))return!1}return this.backendInstance=this.registry[e],this.setupRegisteredKernels(),this.profiler=new li(this.backendInstance),!0}setupRegisteredKernels(){Mr(this.backendName).forEach(e=>{e.setupFunc!=null&&e.setupFunc(this.backendInstance)})}disposeRegisteredKernels(e){Mr(e).forEach(t=>{t.disposeFunc!=null&&t.disposeFunc(this.registry[e])})}initializeBackend(e){let t=this.registryFactory[e];if(t==null)throw Error(`Cannot initialize backend ${e}, no registration found.`);try{let n=t.factory();if(n&&!(n instanceof s)&&typeof n.then==`function`){let t=++this.pendingBackendInitId,r=n.then(n=>t<this.pendingBackendInitId?!1:(this.registry[e]=n,this.pendingBackendInit=null,!0)).catch(n=>t<this.pendingBackendInitId?!1:(this.pendingBackendInit=null,Er(`Initialization of backend ${e} failed`),Er(n.stack||n.message),!1));return this.pendingBackendInit=r,{success:r,asyncInit:!0}}return this.registry[e]=n,{success:!0,asyncInit:!1}}catch(t){return Er(`Initialization of backend ${e} failed`),Er(t.stack||t.message),{success:!1,asyncInit:!1}}}removeBackend(e){if(!(e in this.registryFactory))throw Error(`${e} backend not found in registry`);this.backendName===e&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,e in this.registry&&(this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e]),delete this.registryFactory[e],this.backendName===e&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw Error(`No backend found in registry.`);return Object.keys(this.registryFactory).sort((e,t)=>this.registryFactory[t].priority-this.registryFactory[e].priority)}initializeBackendsAndReturnBest(){let e=this.getSortedBackends();for(let t=0;t<e.length;t++){let n=e[t],{success:r,asyncInit:i}=this.initializeBackend(n);if(i||r)return{name:n,asyncInit:i}}throw Error(`Could not initialize any backends, all backend initializations failed.`)}moveData(e,t){let n=this.state.tensorInfo.get(t),r=n.backend,i=this.readSync(t),a=r.refCount(t);r.disposeData(t,!0),n.backend=e,e.move(t,i,n.shape,n.dtype,a),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(e,t){let n=null;if(t==null){if(typeof e!=`function`)throw Error(`Please provide a function to tidy()`);t=e}else{if(typeof e!=`string`&&!(e instanceof String))throw Error(`When calling with two arguments, the first argument to tidy() must be a string`);if(typeof t!=`function`)throw Error(`When calling with two arguments, the 2nd argument to tidy() must be a function`);n=e}let r;return this.scopedRun(()=>this.startScope(n),()=>this.endScope(r),()=>(r=t(),r instanceof Promise&&console.error(`Cannot return a Promise inside of tidy.`),r))}scopedRun(e,t,n){e();try{let e=n();return t(),e}catch(e){throw t(),e}}nextTensorId(){return e.nextTensorId++}nextVariableId(){return e.nextVariableId++}clone(e){let t=j.runKernel(zt,{x:e}),n={x:e};return this.addTapeNode(this.state.activeScope.name,n,[t],e=>({x:()=>{let t={x:e};return j.runKernel(Qe,t,{dtype:`float32`})}}),[],{}),t}runKernel(e,t,n){if(this.backendName??this.backend,Ar(e,this.backendName)==null)throw Error(`Kernel '${e}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:e,inputs:t,attrs:n})}shouldCheckForMemLeaks(){return this.ENV.getBool(`IS_TEST`)}checkKernelForMemLeak(e,t,n){let r=this.backend.numDataIds(),i=0;n.forEach(e=>{i+=e.dtype===`complex64`?3:1});let a=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],o=r-t-i-a;if(o>0)throw Error(`Backend '${this.backendName}' has an internal memory leak (${o} data ids) after running '${e}'`)}runKernelFunc(e){let t,n=[],r=this.isTapeOn(),i=this.state.numBytes,a=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let o;this.backendName??this.backend;let s,c=Gi(e)?e.kernelName:this.state.activeScope==null?``:this.state.activeScope.name;if(Gi(e)){let{kernelName:t,inputs:i,attrs:a}=e;this.backendName??this.backend;let c=Ar(t,this.backendName);m(c!=null,()=>`Cannot find registered kernel '${t}' for backend '${this.backendName}'`),o=()=>{let e=this.backend.numDataIds();s=c.kernelFunc({inputs:i,attrs:a,backend:this.backend});let o=Array.isArray(s)?s:[s];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(t,e,o);let l=o.map(e=>e.rank==null?this.makeTensorFromTensorInfo(e):e);if(r){let e=this.getTensorsForGradient(t,i,l);n=this.saveTensorsForBackwardMode(e)}return l}}else{let{forwardFunc:t}=e,i=e=>{r&&(n=e.map(e=>this.keep(this.clone(e))))};o=()=>{let e=this.backend.numDataIds();s=this.tidy(()=>t(this.backend,i));let n=Array.isArray(s)?s:[s];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(c,e,n),n}}let{inputs:l,attrs:u}=e,d=Gi(e)?null:e.backwardsFunc,f;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool(`DEBUG`)&&!this.state.profiling?t=o():(f=this.profiler.profileKernel(c,l,()=>o()),this.ENV.getBool(`DEBUG`)&&this.profiler.logKernelProfile(f),t=f.outputs)}),r&&this.addTapeNode(c,l,t,d,n,u),this.state.profiling&&this.state.activeProfile.kernels.push({name:c,bytesAdded:this.state.numBytes-i,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-a,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(l).map(e=>l[e]==null?null:l[e].shape),outputShapes:t.map(e=>e.shape),kernelTimeMs:f.timeMs,extraInfo:f.extraInfo}),Array.isArray(s)?t:t[0]}saveTensorsForBackwardMode(e){return e.map(e=>this.keep(this.clone(e)))}getTensorsForGradient(e,t,n){let r=jr(e);if(r!=null){let e=r.inputsToSave||[],i=r.outputsToSave||[],a;r.saveAllInputs?(m(Array.isArray(t),()=>`saveAllInputs is true, expected inputs to be an array.`),a=Object.keys(t).map(e=>t[e])):a=e.map(e=>t[e]);let o=n.filter((e,t)=>i[t]);return a.concat(o)}return[]}makeTensor(e,t,n,r){if(e==null)throw Error(`Values passed to engine.makeTensor() are null`);n||=`float32`,r||=this.backend;let i=e;n===`string`&&ae(e[0])&&(i=e.map(e=>ai(e)));let a=r.write(i,t,n),o=new Oi(t,n,a,this.nextTensorId());if(this.trackTensor(o,r),n===`string`){let e=this.state.tensorInfo.get(a),t=ie(i);this.state.numBytes+=t-e.bytes,e.bytes=t}return o}makeTensorFromDataId(e,t,n,r){n||=`float32`;let i={dataId:e,shape:t,dtype:n};return this.makeTensorFromTensorInfo(i,r)}makeTensorFromTensorInfo(e,t){let{dataId:n,shape:r,dtype:i}=e,a=new Oi(r,i,n,this.nextTensorId());return this.trackTensor(a,t),a}makeVariable(e,t=!0,n,r){n||=this.nextVariableId().toString(),r!=null&&r!==e.dtype&&(e=e.cast(r));let i=new ki(e,t,n,this.nextTensorId());if(this.state.registeredVariables[i.name]!=null)throw Error(`Variable with name ${i.name} was already registered`);return this.state.registeredVariables[i.name]=i,this.incRef(i,this.backend),i}trackTensor(e,t){this.state.numTensors++,e.dtype===`string`&&this.state.numStringTensors++;let n=0;e.dtype!==`complex64`&&e.dtype!==`string`&&(n=e.size*re(e.dtype)),this.state.numBytes+=n,this.state.tensorInfo.has(e.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(e.dataId,{backend:t||this.backend,dtype:e.dtype,shape:e.shape,bytes:n})),e instanceof ki||this.track(e)}incRef(e,t){this.trackTensor(e,t),this.backend.incRef(e.dataId)}removeDataId(e,t){this.state.tensorInfo.has(e)&&this.state.tensorInfo.get(e).backend===t&&(this.state.tensorInfo.delete(e),this.state.numDataBuffers--)}disposeTensor(e){if(!this.state.tensorInfo.has(e.dataId))return;let t=this.state.tensorInfo.get(e.dataId);if(this.state.numTensors--,e.dtype===`string`&&(this.state.numStringTensors--,this.state.numBytes-=t.bytes),e.dtype!==`complex64`&&e.dtype!==`string`){let t=e.size*re(e.dtype);this.state.numBytes-=t}t.backend.disposeData(e.dataId)&&this.removeDataId(e.dataId,t.backend)}disposeVariables(){for(let e in this.state.registeredVariables){let t=this.state.registeredVariables[e];this.disposeVariable(t)}}disposeVariable(e){this.disposeTensor(e),this.state.registeredVariables[e.name]!=null&&delete this.state.registeredVariables[e.name]}memory(){let e=this.backend.memory();return e.numTensors=this.state.numTensors,e.numDataBuffers=this.state.numDataBuffers,e.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(e.unreliable=!0,e.reasons??=[],e.reasons.push(`Memory usage by string tensors is approximate (2 bytes per character)`)),e}async profile(e){this.state.profiling=!0;let t=this.state.numBytes,n=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=await e(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(e=>e.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-t,this.state.activeProfile.newTensors=this.state.numTensors-n;for(let e of this.state.activeProfile.kernels)e.kernelTimeMs=await e.kernelTimeMs,e.extraInfo=await e.extraInfo;return this.state.activeProfile}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(e,t,n,r,i,a){let o={id:this.state.nextTapeNodeId++,kernelName:e,inputs:t,outputs:n,saved:i},s=jr(e);s!=null&&(r=s.gradFunc),r!=null&&(o.gradient=e=>(e=e.map((e,t)=>{if(e==null){let e=n[t],r=he(e.size,e.dtype);return this.makeTensor(r,e.shape,e.dtype)}return e}),r(e.length>1?e:e[0],i,a))),this.state.activeTape.push(o)}keep(e){return e.kept=!0,e}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(e){let t={track:[],name:`unnamed scope`,id:this.state.nextScopeId++};e&&(t.name=e),this.state.scopeStack.push(t),this.state.activeScope=t}endScope(e){let t=Hi(e),n=new Set(t.map(e=>e.id));for(let e=0;e<this.state.activeScope.track.length;e++){let t=this.state.activeScope.track[e];!t.kept&&!n.has(t.id)&&t.dispose()}let r=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],t.forEach(e=>{!e.kept&&e.scopeId===r.id&&this.track(e)})}gradients(e,t,n,r=!1){if(m(t.length>0,()=>`gradients() received an empty list of xs.`),n!=null&&n.dtype!==`float32`)throw Error(`dy must have 'float32' dtype, but has '${n.dtype}'`);let i=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy(`forward`,e));m(i instanceof Oi,()=>`The result y returned by f() must be a tensor.`);let a=fi(this.state.activeTape,t,i);if(!r&&a.length===0&&t.length>0)throw Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.`);return this.tidy(`backward`,()=>{let e={};e[i.id]=n??Ji(i.shape),pi(e,a,e=>this.tidy(e),Xi);let r=t.map(t=>e[t.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(e=>{for(let t of e.saved)t.dispose()}),this.state.activeTape=null),{value:i,grads:r}})}customGrad(e){return m(le(e),()=>`The f passed in customGrad(f) must be a function.`),(...t)=>{m(t.every(e=>e instanceof Oi),()=>`The args passed in customGrad(f)(x1, x2,...) must all be tensors`);let n,r={};return t.forEach((e,t)=>{r[t]=e}),this.runKernelFunc({forwardFunc:(r,i)=>(n=e(...t,i),m(n.value instanceof Oi,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),m(le(n.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),n.value),backwardsFunc:(e,r)=>{let i=n.gradFunc(e,r),a=Array.isArray(i)?i:[i];m(a.length===t.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),m(a.every(e=>e instanceof Oi),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");let o={};return a.forEach((e,t)=>{o[t]=()=>e}),o},inputs:r})}}readSync(e){return this.state.tensorInfo.get(e).backend.readSync(e)}read(e){return this.state.tensorInfo.get(e).backend.read(e)}readToGPU(e,t){return this.state.tensorInfo.get(e).backend.readToGPU(e,t)}async time(e){let t=ii(),n=await this.backend.time(e);return n.wallMs=ii()-t,n}track(e){return this.state.activeScope!=null&&(e.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(e)),e}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new Ki;for(let e in this.registry)this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}};qi.nextTensorId=0,qi.nextVariableId=0;function Ji(e){let t=me(_(e),`float32`);return j.makeTensor(t,e,`float32`)}function Yi(){let e=ke();return e._tfengine??=new qi(new Se(e)),De(e._tfengine.ENV),Ei(()=>e._tfengine),e._tfengine}var j=Yi();function Xi(e,t){let n={a:e,b:t};return j.runKernel(`Add`,n)}function Zi(){return typeof navigator<`u`&&navigator!=null}var Qi;function $i(e){if(Qi!==void 0)return Qi;if(e||Zi()){if(e||=navigator,e.product===`ReactNative`)return!0;let t=e.userAgent||e.vendor||(typeof window<`u`?window.opera:``);if(!t){let t=e;return t.userAgentData&&t.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))}return!1}function ea(){return typeof window<`u`&&window.document!=null||typeof WorkerGlobalScope<`u`}var ta=k();ta.registerFlag(`DEBUG`,()=>!1,e=>{e&&console.warn(`Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.`)}),ta.registerFlag(`IS_BROWSER`,()=>ea()),ta.registerFlag(`IS_NODE`,()=>typeof process<`u`&&process.versions!==void 0&&process.versions.node!==void 0),ta.registerFlag(`IS_CHROME`,()=>typeof navigator<`u`&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor)),ta.registerFlag(`IS_SAFARI`,()=>typeof navigator<`u`&&navigator!=null&&navigator.userAgent!=null&&/Safari/.test(navigator.userAgent)&&/Apple/.test(navigator.vendor)),ta.registerFlag(`PROD`,()=>!1),ta.registerFlag(`TENSORLIKE_CHECK_SHAPE_CONSISTENCY`,()=>ta.getBool(`DEBUG`)),ta.registerFlag(`DEPRECATION_WARNINGS_ENABLED`,()=>!0),ta.registerFlag(`IS_TEST`,()=>!1),ta.registerFlag(`CHECK_COMPUTATION_FOR_ERRORS`,()=>ta.getBool(`DEBUG`)),ta.registerFlag(`WRAP_TO_IMAGEBITMAP`,()=>!1),ta.registerFlag(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`,()=>!1),ta.registerFlag(`USE_SETTIMEOUTCUSTOM`,()=>!1);function na(e,t){let n=e;if(si(e))return t===`string`?[]:[e.length];if(Ri(e)){let t=e.channels||`RGBA`;return[e.height,e.width*t.length]}if(zi(e))return[e.buffer.size/(t==null?4:re(t))];if(!Array.isArray(e))return[];let r=[];for(;Array.isArray(n)||si(n)&&t!==`string`;)r.push(n.length),n=n[0];return Array.isArray(e)&&k().getBool(`TENSORLIKE_CHECK_SHAPE_CONSISTENCY`)&&ra(e,r,[]),r}function ra(e,t,n){if(n||=[],!Array.isArray(e)&&!si(e)){m(t.length===0,()=>`Element arr[${n.join(`][`)}] is a primitive, but should be an array/TypedArray of ${t[0]} elements`);return}m(t.length>0,()=>`Element arr[${n.join(`][`)}] should be a primitive, but is an array of ${e.length} elements`),m(e.length===t[0],()=>`Element arr[${n.join(`][`)}] should have ${t[0]} elements, but has ${e.length} elements`);let r=t.slice(1);for(let t=0;t<e.length;++t)ra(e[t],r,n.concat(t))}function ia(e,t,n,r){if(e!==`string_or_numeric`){if(e==null)throw Error(`Expected dtype cannot be null.`);if(e!==`numeric`&&e!==t||e===`numeric`&&t===`string`)throw Error(`Argument '${n}' passed to '${r}' must be ${e} tensor, but got ${t} tensor`)}}function M(e,t,n,r=`numeric`){if(e instanceof A())return ia(r,e.dtype,t,n),e;let i=ce(e);if(i!==`string`&&[`bool`,`int32`,`float32`].indexOf(r)>=0&&(i=r),ia(r,i,t,n),e==null||!si(e)&&!Array.isArray(e)&&typeof e!=`number`&&typeof e!=`boolean`&&typeof e!=`string`){let r=e==null?`null`:e.constructor.name;throw Error(`Argument '${t}' passed to '${n}' must be a Tensor or TensorLike, but got '${r}'`)}let a=na(e,i);!si(e)&&!Array.isArray(e)&&(e=[e]);let o=i===`string`?ci(e,[],!0):ri(e,i);return j.makeTensor(o,a,i)}function aa(e,t,n,r=`numeric`){if(!Array.isArray(e))throw Error(`Argument ${t} passed to ${n} must be a \`Tensor[]\` or \`TensorLike[]\``);return e.map((e,i)=>M(e,`${t}[${i}]`,n,r))}var oa=`__op`;function N(e){let t=Object.keys(e);if(t.length!==1)throw Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${t.length} keys.`);let n=t[0],r=e[n];n.endsWith(`_`)&&(n=n.substring(0,n.length-1)),n+=oa;let i=(...e)=>{j.startScope(n);try{let t=r(...e);return be(t)&&console.error(`Cannot return a Promise inside of tidy.`),j.endScope(t),t}catch(e){throw j.endScope(null),e}};return Object.defineProperty(i,"name",{value:n,configurable:!0}),i}function sa(e,t){let n=M(e,`real`,`complex`),r=M(t,`imag`,`complex`);h(n.shape,r.shape,`real and imag shapes, ${n.shape} and ${r.shape}, must match in call to tf.complex().`);let i={real:n,imag:r};return j.runKernel(tt,i)}var ca=N({complex_:sa});function la(e,t,n,r){if(r==null)r=ce(e);else if(r===`complex64`)throw Error(`Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).`);if(zi(e)||Ri(e)){if(r!==`float32`&&r!==`int32`)throw Error(`Creating tensor from GPU data only supports 'float32'|'int32' dtype, while the dtype is ${r}.`);return j.backend.createTensorFromGPUData(e,t||n,r)}if(!si(e)&&!Array.isArray(e)&&typeof e!=`number`&&typeof e!=`boolean`&&typeof e!=`string`)throw Error(`values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray`);if(t!=null){_e(t);let e=_(t),r=_(n);m(e===r,()=>`Based on the provided shape, [${t}], the tensor should have ${e} values but has ${r}`);for(let e=0;e<n.length;++e){let r=n[e],i=e!==n.length-1||r!==_(t.slice(e));m(n[e]===t[e]||!i,()=>`Error creating a new Tensor. Inferred shape (${n}) does not match the provided shape (${t}). `)}}return!si(e)&&!Array.isArray(e)&&(e=[e]),t||=n,e=r===`string`?ci(e,[],!0):ri(e,r),j.makeTensor(e,t,r)}function ua(e,t,n){return la(e,t,na(e,n),n)}var da=class e{static join(t){return new e(t).slice()}constructor(e){if(this.shards=[],this.previousShardIndex=0,e==null||(e instanceof Array||(e=[e]),e=e.map(e=>si(e)?e.buffer:e),e.length===0))return;this.bufferUniformSize=e[0].byteLength;let t=0;for(let n=0;n<e.length;n++){let r=e[n];n!==e.length-1&&r.byteLength!==this.bufferUniformSize&&(this.bufferUniformSize=void 0);let i=t+r.byteLength;this.shards.push({buffer:r,start:t,end:i}),t=i}this.shards.length===0&&(this.byteLength=0),this.byteLength=this.shards[this.shards.length-1].end}slice(e=0,t=this.byteLength){if(this.shards.length===0||(e=isNaN(Number(e))?0:e,t=isNaN(Number(t))?0:t,e=Math.max(0,e),t=Math.min(this.byteLength,t),t<=e))return new ArrayBuffer(0);let n=this.findShardForByte(e);if(n===-1)throw Error(`Could not find start shard for byte ${e}`);let r=t-e,i=new ArrayBuffer(r),a=new Uint8Array(i),o=0;for(let r=n;r<this.shards.length;r++){let n=this.shards[r],i=e+o-n.start,s=o,c=Math.min(t,n.end)-n.start,l=new Uint8Array(n.buffer,i,c-i);if(a.set(l,s),o+=l.length,t<n.end)break}return i}findShardForByte(e){if(this.shards.length===0||e<0||e>=this.byteLength)return-1;if(this.bufferUniformSize!=null)return this.previousShardIndex=Math.floor(e/this.bufferUniformSize),this.previousShardIndex;function t(t){return e<t.start?-1:+(e>=t.end)}if(t(this.shards[this.previousShardIndex])===0)return this.previousShardIndex;let n=fa(this.shards,t);return n===-1?-1:(this.previousShardIndex=n,this.previousShardIndex)}};function fa(e,t){let n=0,r=e.length;for(;n<=r;){let i=Math.floor((r-n)/2)+n,a=t(e[i]);if(a===0)return i;a<0?r=i:n=i+1}return-1}function pa(){return j}function ma(){return j.memory()}function P(e,t){return j.tidy(e,t)}function F(e){Hi(e).forEach(e=>e.dispose())}function ha(e){return j.keep(e)}function ga(e,t,n=1){return j.registerBackend(e,t,n)}function _a(){return j.backend}var va=4;async function ya(e,t){let n=[],r=[],i=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);for(let a=0;a<i.length;++a){let o=i[a],s=Array.isArray(e)?e[a].tensor:e[o];if(s.dtype!==`float32`&&s.dtype!==`int32`&&s.dtype!==`bool`&&s.dtype!==`string`&&s.dtype!==`complex64`)throw Error(`Unsupported dtype in weight '${o}': ${s.dtype}`);let c={name:o,shape:s.shape,dtype:s.dtype};if(s.dtype===`string`){let e=new Promise(async e=>{let t=await s.bytes(),n=t.reduce((e,t)=>e+t.length,0)+va*t.length,r=new Uint8Array(n),i=0;for(let e=0;e<t.length;e++){let n=t[e],a=new Uint8Array(new Uint32Array([n.length]).buffer);r.set(a,i),i+=va,r.set(n,i),i+=n.length}e(r)});r.push(e)}else r.push(s.data());t!=null&&(c.group=t),n.push(c)}return{data:ba(await Promise.all(r)),specs:n}}function ba(e){if(e===null)throw Error(`Invalid input value: ${JSON.stringify(e)}`);let t=0,n=[];e.forEach(e=>{if(t+=e.byteLength,n.push(e.byteLength===e.buffer.byteLength?e:new e.constructor(e)),!(e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array))throw Error(`Unsupported TypedArray subtype: ${e.constructor.name}`)});let r=new Uint8Array(t),i=0;return n.forEach(e=>{r.set(new Uint8Array(e.buffer),i),i+=e.byteLength}),r.buffer}var xa=typeof Buffer<`u`&&(typeof Blob>`u`||typeof atob>`u`||typeof btoa>`u`);function Sa(e){return xa?Buffer.byteLength(e,`utf8`):new Blob([e]).size}function Ca(e){if(xa)return Buffer.from(e).toString(`base64`);let t=new Uint8Array(e),n=``;for(let e=0,r=t.length;e<r;e++)n+=String.fromCharCode(t[e]);return btoa(n)}function wa(e){if(xa){let t=Buffer.from(e,`base64`);return t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength)}let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;++e)n.set([t.charCodeAt(e)],e);return n.buffer}function Ta(e){return da.join(e)}function Ea(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`Expected JSON model topology, received ArrayBuffer.`);return{dateSaved:new Date,modelTopologyType:`JSON`,modelTopologyBytes:e.modelTopology==null?0:Sa(JSON.stringify(e.modelTopology)),weightSpecsBytes:e.weightSpecs==null?0:Sa(JSON.stringify(e.weightSpecs)),weightDataBytes:e.weightData==null?0:new da(e.weightData).byteLength}}var Da=class e{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return e.instance??=new e,e.instance}static registerSaveRouter(t){e.getInstance().saveRouters.push(t)}static registerLoadRouter(t){e.getInstance().loadRouters.push(t)}static getSaveHandlers(t){return e.getHandlers(t,`save`)}static getLoadHandlers(t,n){return e.getHandlers(t,`load`,n)}static getHandlers(t,n,r){let i=[];return(n===`load`?e.getInstance().loadRouters:e.getInstance().saveRouters).forEach(e=>{let n=e(t,r);n!==null&&i.push(n)}),i}},Oa=e=>Da.getSaveHandlers(e),ka=`tensorflowjs`,Aa=1,ja=`models_store`,Ma=`model_info_store`;function Na(){if(!k().getBool(`IS_BROWSER`))throw Error(`Failed to obtain IndexedDB factory because the current environmentis not a web browser.`);let e=typeof window>`u`?self:window,t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB||e.shimIndexedDB;if(t==null)throw Error(`The current browser does not appear to support IndexedDB.`);return t}function Pa(e){let t=e.result;t.createObjectStore(ja,{keyPath:`modelPath`}),t.createObjectStore(Ma,{keyPath:`modelPath`})}var Fa=class{constructor(e){if(this.indexedDB=Na(),e==null||!e)throw Error(`For IndexedDB, modelPath must not be null, undefined or empty.`);this.modelPath=e}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserLocalStorage.save() does not support saving model topology in binary formats yet.`);return this.databaseAction(this.modelPath,e)}async load(){return this.databaseAction(this.modelPath)}databaseAction(e,t){return new Promise((e,n)=>{let r=this.indexedDB.open(ka,Aa);r.onupgradeneeded=()=>Pa(r),r.onsuccess=()=>{let i=r.result;if(t==null){let t=i.transaction(ja,`readonly`),r=t.objectStore(ja).get(this.modelPath);r.onsuccess=()=>{if(r.result==null)return i.close(),n(Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));e(r.result.modelArtifacts)},r.onerror=e=>(i.close(),n(r.error)),t.oncomplete=()=>i.close()}else{t.weightData=da.join(t.weightData);let r=Ea(t),a=i.transaction(Ma,`readwrite`),o=a.objectStore(Ma),s;try{s=o.put({modelPath:this.modelPath,modelArtifactsInfo:r})}catch(e){return n(e)}let c;s.onsuccess=()=>{c=i.transaction(ja,`readwrite`);let s=c.objectStore(ja),l;try{l=s.put({modelPath:this.modelPath,modelArtifacts:t,modelArtifactsInfo:r})}catch(e){return n(e)}l.onsuccess=()=>e({modelArtifactsInfo:r}),l.onerror=e=>{o=a.objectStore(Ma);let t=o.delete(this.modelPath);t.onsuccess=()=>(i.close(),n(l.error)),t.onerror=e=>(i.close(),n(l.error))}},s.onerror=e=>(i.close(),n(s.error)),a.oncomplete=()=>{c==null?i.close():c.oncomplete=()=>i.close()}}},r.onerror=e=>n(r.error)})}};Fa.URL_SCHEME=`indexeddb://`;var Ia=e=>k().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(Fa.URL_SCHEME)?La(e.slice(Fa.URL_SCHEME.length)):null;Da.registerSaveRouter(Ia),Da.registerLoadRouter(Ia);function La(e){return new Fa(e)}function Ra(e){return e.startsWith(Fa.URL_SCHEME)?e.slice(Fa.URL_SCHEME.length):e}var za=class{constructor(){this.indexedDB=Na()}async listModels(){return new Promise((e,t)=>{let n=this.indexedDB.open(ka,Aa);n.onupgradeneeded=()=>Pa(n),n.onsuccess=()=>{let r=n.result,i=r.transaction(Ma,`readonly`),a=i.objectStore(Ma).getAll();a.onsuccess=()=>{let t={};for(let e of a.result)t[e.modelPath]=e.modelArtifactsInfo;e(t)},a.onerror=e=>(r.close(),t(a.error)),i.oncomplete=()=>r.close()},n.onerror=e=>t(n.error)})}async removeModel(e){return e=Ra(e),new Promise((t,n)=>{let r=this.indexedDB.open(ka,Aa);r.onupgradeneeded=()=>Pa(r),r.onsuccess=()=>{let i=r.result,a=i.transaction(Ma,`readwrite`),o=a.objectStore(Ma),s=o.get(e),c;s.onsuccess=()=>{if(s.result==null)return i.close(),n(Error(`Cannot find model with path '${e}' in IndexedDB.`));{let r=o.delete(e),a=()=>{c=i.transaction(ja,`readwrite`);let r=c.objectStore(ja).delete(e);r.onsuccess=()=>t(s.result.modelArtifactsInfo),r.onerror=e=>n(s.error)};r.onsuccess=a,r.onerror=e=>(a(),i.close(),n(s.error))}},s.onerror=e=>(i.close(),n(s.error)),a.oncomplete=()=>{c==null?i.close():c.oncomplete=()=>i.close()}},r.onerror=e=>n(r.error)})}},Ba=`/`,Va=`tensorflowjs_models`,Ha=`info`,Ua=`model_topology`,Wa=`weight_specs`,Ga=`weight_data`,Ka=`model_metadata`;function qa(e){return{info:[Va,e,Ha].join(Ba),topology:[Va,e,Ua].join(Ba),weightSpecs:[Va,e,Wa].join(Ba),weightData:[Va,e,Ga].join(Ba),modelMetadata:[Va,e,Ka].join(Ba)}}function Ja(e){for(let t of Object.values(e))window.localStorage.removeItem(t)}function Ya(e){let t=e.split(Ba);if(t.length<3)throw Error(`Invalid key format: ${e}`);return t.slice(1,t.length-1).join(Ba)}function Xa(e){return e.startsWith(Za.URL_SCHEME)?e.slice(Za.URL_SCHEME.length):e}var Za=class{constructor(e){if(!k().getBool(`IS_BROWSER`)||typeof window>`u`||window.localStorage===void 0)throw Error(`The current environment does not support local storage.`);if(this.LS=window.localStorage,e==null||!e)throw Error(`For local storage, modelPath must not be null, undefined or empty.`);this.modelPath=e,this.keys=qa(this.modelPath)}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserLocalStorage.save() does not support saving model topology in binary formats yet.`);{let t=JSON.stringify(e.modelTopology),n=JSON.stringify(e.weightSpecs),r=Ea(e),i=da.join(e.weightData);try{this.LS.setItem(this.keys.info,JSON.stringify(r)),this.LS.setItem(this.keys.topology,t),this.LS.setItem(this.keys.weightSpecs,n),this.LS.setItem(this.keys.weightData,Ca(i));let a={format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,signature:e.signature==null?void 0:e.signature,userDefinedMetadata:e.userDefinedMetadata==null?void 0:e.userDefinedMetadata,modelInitializer:e.modelInitializer==null?void 0:e.modelInitializer,initializerSignature:e.initializerSignature==null?void 0:e.initializerSignature,trainingConfig:e.trainingConfig==null?void 0:e.trainingConfig};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(a)),{modelArtifactsInfo:r}}catch{throw Ja(this.keys),Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${r.modelTopologyBytes}, weightSpecsBytes=${r.weightSpecsBytes}, weightDataBytes=${r.weightDataBytes}.`)}}}async load(){let e=JSON.parse(this.LS.getItem(this.keys.info));if(e==null)throw Error(`In local storage, there is no model with name '${this.modelPath}'`);if(e.modelTopologyType!==`JSON`)throw Error(`BrowserLocalStorage does not support loading non-JSON model topology yet.`);let t={},n=JSON.parse(this.LS.getItem(this.keys.topology));if(n==null)throw Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);t.modelTopology=n;let r=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(r==null)throw Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);t.weightSpecs=r;let i=this.LS.getItem(this.keys.modelMetadata);if(i!=null){let e=JSON.parse(i);t.format=e.format,t.generatedBy=e.generatedBy,t.convertedBy=e.convertedBy,e.signature!=null&&(t.signature=e.signature),e.userDefinedMetadata!=null&&(t.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(t.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(t.initializerSignature=e.initializerSignature),e.trainingConfig!=null&&(t.trainingConfig=e.trainingConfig)}let a=this.LS.getItem(this.keys.weightData);if(a==null)throw Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return t.weightData=wa(a),t}};Za.URL_SCHEME=`localstorage://`;var Qa=e=>k().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(Za.URL_SCHEME)?$a(e.slice(Za.URL_SCHEME.length)):null;Da.registerSaveRouter(Qa),Da.registerLoadRouter(Qa);function $a(e){return new Za(e)}var eo=class{constructor(){m(k().getBool(`IS_BROWSER`),()=>`Current environment is not a web browser`),m(typeof window>`u`||window.localStorage!==void 0,()=>`Current browser does not appear to support localStorage`),this.LS=window.localStorage}async listModels(){let e={};for(let t=0;t<this.LS.length;++t){let n=this.LS.key(t);if(n.startsWith(`tensorflowjs_models/`)&&n.endsWith(`/info`)){let t=Ya(n);e[t]=JSON.parse(this.LS.getItem(n))}}return e}async removeModel(e){e=Xa(e);let t=qa(e);if(this.LS.getItem(t.info)==null)throw Error(`Cannot find model at path '${e}'`);let n=JSON.parse(this.LS.getItem(t.info));return Ja(t),n}},to=`://`,no=class e{constructor(){this.managers={}}static getInstance(){return e.instance??=new e,e.instance}static registerManager(t,n){m(t!=null,()=>`scheme must not be undefined or null.`),t.endsWith(to)&&(t=t.slice(0,t.indexOf(to))),m(t.length>0,()=>`scheme must not be an empty string.`);let r=e.getInstance();m(r.managers[t]==null,()=>`A model store manager is already registered for scheme '${t}'.`),r.managers[t]=n}static getManager(t){let n=e.getInstance().managers[t];if(n==null)throw Error(`Cannot find model manager for scheme '${t}'`);return n}static getSchemes(){return Object.keys(e.getInstance().managers)}},ro=class{constructor(){this.messageName=`setTimeoutCustom`,this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(e,t){return fetch(e,t)}now(){return performance.now()}encode(e,t){if(t!==`utf-8`&&t!==`utf8`)throw Error(`Browser's encoder only supports utf-8, but got ${t}`);return this.textEncoder??=new TextEncoder,this.textEncoder.encode(e)}decode(e,t){return new TextDecoder(t).decode(e)}setTimeoutCustom(e,t){if(typeof window>`u`||!k().getBool(`USE_SETTIMEOUTCUSTOM`)){setTimeout(e,t);return}this.functionRefs.push(e),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},`*`)},t),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener(`message`,e=>{if(e.source===window&&e.data.name===this.messageName){e.stopPropagation();let t=this.functionRefs[e.data.index];t(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}isTypedArray(e){return Ir(e)}};if(k().get(`IS_BROWSER`)){k().setPlatform(`browser`,new ro);try{no.registerManager(Za.URL_SCHEME,new eo)}catch{}try{no.registerManager(Fa.URL_SCHEME,new za)}catch{}}var io={importFetch:()=>r()},ao,oo=class{constructor(){this.util=r(),this.textEncoder=new this.util.TextEncoder}fetch(e,t){return k().global.fetch==null?(ao??=io.importFetch(),ao(e,t)):k().global.fetch(e,t)}now(){let e=process.hrtime();return e[0]*1e3+e[1]/1e6}encode(e,t){if(t!==`utf-8`&&t!==`utf8`)throw Error(`Node built-in encoder only supports utf-8, but got ${t}`);return this.textEncoder.encode(e)}decode(e,t){return e.length===0?``:new this.util.TextDecoder(t).decode(e)}isTypedArray(e){return this.util.types.isFloat32Array(e)||this.util.types.isInt32Array(e)||this.util.types.isUint8Array(e)||this.util.types.isUint8ClampedArray(e)}};k().get(`IS_NODE`)&&!k().get(`IS_BROWSER`)&&k().setPlatform(`node`,new oo);function I(e,t=`float32`,n){return t||=`float32`,_e(e),new Ci(e,t,n)}function so(e,t){let n=M(e,`x`,`cast`);if(!te(t))throw Error(`Failed to cast to unknown dtype ${t}`);if(t===`string`&&n.dtype!==`string`||t!==`string`&&n.dtype===`string`)throw Error(`Only strings can be casted to strings`);let r={x:n},i={dtype:t};return j.runKernel(Qe,r,i)}var L=N({cast_:so});function co(e){let t={x:M(e,`x`,`clone`,`string_or_numeric`)};return j.runKernel(zt,t)}var lo=N({clone_:co});function uo(e,t=!1){console.log(e.toString(t))}Yi(),Di({buffer:I,cast:L,clone:lo,print:uo});function fo(e,t){let n=M(e,`a`,`add`),r=M(t,`b`,`add`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(`Add`,i)}var R=N({add_:fo});function po(e,t){let n=M(e,`a`,`floorDiv`),r=M(t,`b`,`floorDiv`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(Nt,i)}var mo=N({floorDiv_:po});function ho(e,t){let n=M(e,`a`,`div`),r=M(t,`b`,`div`);if([n,r]=Bi(n,r),n.dtype===`int32`&&r.dtype===`int32`)return mo(n,r);let i={a:n,b:r};return j.runKernel(wt,i,{})}var z=N({div_:ho});function go(e,t){let n=M(e,`a`,`mul`),r=M(t,`b`,`mul`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(fn,i)}var B=N({mul_:go});function _o(e){let t=M(e,`x`,`abs`);if(t.dtype===`complex64`){let e={x:t};return j.runKernel(nt,e)}{let e={x:t};return j.runKernel(`Abs`,e)}}var vo=N({abs_:_o});function yo(e){let t={x:M(e,`x`,`acos`)};return j.runKernel(Me,t)}var bo=N({acos_:yo});function xo(e){let t={x:M(e,`x`,`acosh`)};return j.runKernel(Ne,t)}var So=N({acosh_:xo});function Co(e,t=null,n=!1){let r={x:M(e,`x`,`all`,`bool`)},i={axis:t,keepDims:n};return j.runKernel(`All`,r,i)}var wo=N({all_:Co});function To(e,t=null,n=!1){let r={x:M(e,`x`,`any`,`bool`)},i={axis:t,keepDims:n};return j.runKernel(`Any`,r,i)}var Eo=N({any_:To});function Do(e,t=0){let n={x:M(e,`x`,`argMax`)},r={axis:t};return j.runKernel(Fe,n,r)}var Oo=N({argMax_:Do});function ko(e,t=0){let n={x:M(e,`x`,`argMin`)},r={axis:t};return j.runKernel(Ie,n,r)}var Ao=N({argMin_:ko});function jo(e){let t={x:M(e,`x`,`asin`)};return j.runKernel(Le,t)}var Mo=N({asin_:jo});function No(e){let t={x:M(e,`x`,`asinh`)};return j.runKernel(Re,t)}var Po=N({asinh_:No});function Fo(e){let t={x:M(e,`x`,`atan`)};return j.runKernel(ze,t)}var Io=N({atan_:Fo});function Lo(e,t){let n=M(e,`a`,`atan2`),r=M(t,`b`,`atan2`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(Ve,i)}var Ro=N({atan2_:Lo});function zo(e){let t={x:M(e,`x`,`atanh`)};return j.runKernel(Be,t)}var Bo=N({atanh_:zo});function Vo(e,t,n,r,i=`NHWC`,a){let o=e[3];return Wo(e,[...t,o],n,a,r,null,null,is(i))}function Ho(e,t,n,r,i,a,o=`channelsLast`){let[s,c]=Yo(t),l;if(o===`channelsLast`)l=[s,c,e[3],e[3]];else if(o===`channelsFirst`)l=[s,c,e[1],e[1]];else throw Error(`Unknown dataFormat ${o}`);return Wo(e,l,n,r,i,a,!1,o)}function Uo(e,t,n,r,i,a,o=`NDHWC`){let[s,c,l]=Xo(t),u,d;if(o===`NDHWC`)d=`channelsLast`,u=[s,c,l,e[4],e[4]];else if(o===`NCDHW`)d=`channelsFirst`,u=[s,c,l,e[1],e[1]];else throw Error(`Unknown dataFormat ${o}`);return Go(e,u,n,r,i,!1,d,a)}function Wo(e,t,n,r,i,a,o=!1,s=`channelsLast`){let[c,l,u,d]=[-1,-1,-1,-1];if(s===`channelsLast`)[c,l,u,d]=e;else if(s===`channelsFirst`)[c,d,l,u]=e;else throw Error(`Unknown dataFormat ${s}`);let[f,p,,m]=t,[h,g]=Yo(n),[_,v]=Yo(r),y=Zo(f,_),b=Zo(p,v),{padInfo:x,outHeight:S,outWidth:C}=Qo(i,l,u,h,g,y,b,a,s),w=o?m*d:m,T;return s===`channelsFirst`?T=[c,w,S,C]:s===`channelsLast`&&(T=[c,S,C,w]),{batchSize:c,dataFormat:s,inHeight:l,inWidth:u,inChannels:d,outHeight:S,outWidth:C,outChannels:w,padInfo:x,strideHeight:h,strideWidth:g,filterHeight:f,filterWidth:p,effectiveFilterHeight:y,effectiveFilterWidth:b,dilationHeight:_,dilationWidth:v,inShape:e,outShape:T,filterShape:t}}function Go(e,t,n,r,i,a=!1,o=`channelsLast`,s){let[c,l,u,d,f]=[-1,-1,-1,-1,-1];if(o===`channelsLast`)[c,l,u,d,f]=e;else if(o===`channelsFirst`)[c,f,l,u,d]=e;else throw Error(`Unknown dataFormat ${o}`);let[p,m,h,,g]=t,[_,v,y]=Xo(n),[b,x,S]=Xo(r),C=Zo(p,b),w=Zo(m,x),T=Zo(h,S),{padInfo:E,outDepth:D,outHeight:ee,outWidth:te}=$o(i,l,u,d,_,v,y,C,w,T,s),ne=a?g*f:g,re;return o===`channelsFirst`?re=[c,ne,D,ee,te]:o===`channelsLast`&&(re=[c,D,ee,te,ne]),{batchSize:c,dataFormat:o,inDepth:l,inHeight:u,inWidth:d,inChannels:f,outDepth:D,outHeight:ee,outWidth:te,outChannels:ne,padInfo:E,strideDepth:_,strideHeight:v,strideWidth:y,filterDepth:p,filterHeight:m,filterWidth:h,effectiveFilterDepth:C,effectiveFilterHeight:w,effectiveFilterWidth:T,dilationDepth:b,dilationHeight:x,dilationWidth:S,inShape:e,outShape:re,filterShape:t}}function Ko(e,t,n,r,i){r??=Jo(e,t,n);let a=e[0],o=e[1];return[es((a-t+2*r)/n+1,i),es((o-t+2*r)/n+1,i)]}function qo(e,t,n,r,i,a){i??=Jo(e,t[0],r[0]);let o=[0,0,0,n];for(let n=0;n<3;n++)e[n]+2*i>=t[n]&&(o[n]=es((e[n]-t[n]+2*i)/r[n]+1,a));return o}function Jo(e,t,n,r=1){let i=Zo(t,r);return Math.floor((e[0]*(n-1)-n+i)/2)}function Yo(e){return typeof e==`number`?[e,e,e]:e.length===2?[e[0],e[1],1]:e}function Xo(e){return typeof e==`number`?[e,e,e]:e}function Zo(e,t){return t<=1?e:e+(e-1)*(t-1)}function Qo(e,t,n,r,i,a,o,s,c){let l,u,d;if(typeof e==`number`){l={top:e,bottom:e,left:e,right:e,type:e===0?`VALID`:`NUMBER`};let i=Ko([t,n],a,r,e,s);u=i[0],d=i[1]}else if(e===`same`){u=Math.ceil(t/r),d=Math.ceil(n/i);let e=Math.max(0,(u-1)*r+a-t),s=Math.max(0,(d-1)*i+o-n),c=Math.floor(e/2),f=e-c,p=Math.floor(s/2);l={top:c,bottom:f,left:p,right:s-p,type:`SAME`}}else if(e===`valid`)l={top:0,bottom:0,left:0,right:0,type:`VALID`},u=Math.ceil((t-a+1)/r),d=Math.ceil((n-o+1)/i);else if(typeof e==`object`){let f=c===`channelsLast`?e[1][0]:e[2][0],p=c===`channelsLast`?e[1][1]:e[2][1],m=c===`channelsLast`?e[2][0]:e[3][0],h=c===`channelsLast`?e[2][1]:e[3][1];l={top:f,bottom:p,left:m,right:h,type:f===0&&p===0&&m===0&&h===0?`VALID`:`EXPLICIT`},u=es((t-a+f+p)/r+1,s),d=es((n-o+m+h)/i+1,s)}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:l,outHeight:u,outWidth:d}}function $o(e,t,n,r,i,a,o,s,c,l,u){let d,f,p,m;if(e===`valid`&&(e=0),typeof e==`number`){d={top:e,bottom:e,left:e,right:e,front:e,back:e,type:e===0?`VALID`:`NUMBER`};let h=qo([t,n,r,1],[s,c,l],1,[i,a,o],e,u);f=h[0],p=h[1],m=h[2]}else if(e===`same`){f=Math.ceil(t/i),p=Math.ceil(n/a),m=Math.ceil(r/o);let e=(f-1)*i+s-t,u=(p-1)*a+c-n,h=(m-1)*o+l-r,g=Math.floor(e/2),_=e-g,v=Math.floor(u/2),y=u-v,b=Math.floor(h/2);d={top:v,bottom:y,left:b,right:h-b,front:g,back:_,type:`SAME`}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:d,outDepth:f,outHeight:p,outWidth:m}}function es(e,t){if(!t)return Math.trunc(e);switch(t){case`round`:return Math.round(e);case`ceil`:return Math.ceil(e);case`floor`:return Math.floor(e);default:throw Error(`Unknown roundingMode ${t}`)}}function ts(e){let[t,n,r]=Yo(e);return t===1&&n===1&&r===1}function ns(e,t){return ts(e)||ts(t)}function rs(e){return Yo(e).every(e=>e>0)}function is(e){if(e===`NHWC`)return`channelsLast`;if(e===`NCHW`)return`channelsFirst`;throw Error(`Unknown dataFormat ${e}`)}function as(e,t,n){if(n!=null){if(typeof t==`string`)throw Error(`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);if(typeof t==`number`)m(y(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);else if(typeof t==`object`)t.forEach(t=>{t.forEach(t=>{m(y(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`)})});else throw Error(`Error in ${e}: Unknown padding parameter: ${t}`)}}function os(e,t){let n={x:M(e,`x`,`reshape`,`string_or_numeric`)},r={shape:t};return j.runKernel(An,n,r)}var V=N({reshape_:os});function ss(e,t,n,r,i){let a=M(e,`x`,`avgPool`,`float32`);m(ns(n,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${n} and dilations '1'`);let o=a,s=!1;a.rank===3&&(s=!0,o=V(a,[1,a.shape[0],a.shape[1],a.shape[2]])),m(o.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${o.rank}.`),as(`avgPool`,r,i);let c={x:o},l={filterSize:t,strides:n,pad:r,dimRoundingMode:i},u=j.runKernel(He,c,l);return u=L(u,a.dtype),s?V(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var cs=N({avgPool_:ss});function ls(e,t,n,r,i,a=`NDHWC`){let o=M(e,`x`,`avgPool3d`,`float32`),s=o,c=!1;o.rank===4&&(c=!0,s=V(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),m(s.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${s.rank}.`),m(a===`NDHWC`,()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),m(typeof n==`number`&&n>0||Array.isArray(n)&&n[0]>0&&n[1]>0&&n[2]>0,()=>`Error in avgPool3d: Stride must be > 0, but got '${n}'`),as(`avgPool3d`,r,i);let l={x:s},u={filterSize:t,strides:n,pad:r,dimRoundingMode:i,dataFormat:a},d=j.runKernel(We,l,u);return d=L(d,s.dtype),c?V(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}var us=N({avgPool3d_:ls});function ds(e,t=0){m(e.length>=1,()=>`Pass at least one tensor to concat`);let n=aa(e,`tensors`,`concat`,`string_or_numeric`);if(n[0].dtype===`complex64`&&n.forEach(e=>{if(e.dtype!==`complex64`)throw Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${e.dtype}. `)}),n.length===1)return lo(n[0]);let r=n,i={axis:t};return j.runKernel(rt,r,i)}var fs=N({concat_:ds});function ps(e,t,n=!1,r=!1){let i=M(e,`a`,`matMul`),a=M(t,`b`,`matMul`);[i,a]=Bi(i,a);let o={a:i,b:a},s={transposeA:n,transposeB:r};return j.runKernel(Ke,o,s)}var ms=N({matMul_:ps});function hs(e){let t={x:M(e,`x`,`sigmoid`,`float32`)};return j.runKernel(qn,t)}var gs=N({sigmoid_:hs});function _s(e,t,n){let r=M(e,`x`,`slice`,`string_or_numeric`);if(r.rank===0)throw Error(`Slicing scalar is not possible`);let i={x:r},a={begin:t,size:n};return j.runKernel(Wn,i,a)}var vs=N({slice_:_s});function ys(e){let t={x:M(e,`x`,`tanh`,`float32`)};return j.runKernel(dr,t)}var bs=N({tanh_:ys});function xs(e,t,n){let r=M(e,`x`,`batchToSpaceND`),i=t.reduce((e,t)=>e*t);m(r.rank>=1+t.length,()=>`input rank is ${r.rank} but should be > than blockShape.length ${t.length}`),m(n.length===t.length,()=>`crops.length is ${n.length} but should be equal to blockShape.length  ${t.length}`),m(r.shape[0]%i===0,()=>`input tensor batch is ${r.shape[0]} but is not divisible by the product of the elements of blockShape ${t.join(` * `)} === ${i}`);let a={x:r},o={blockShape:t,crops:n};return j.runKernel(qe,a,o)}var Ss=N({batchToSpaceND_:xs});function Cs(e){let t;return t=e.rank===0||e.rank===1?V(e,[1,1,1,e.size]):e.rank===2?V(e,[1,1,e.shape[0],e.shape[1]]):e.rank===3?V(e,[1,e.shape[0],e.shape[1],e.shape[2]]):e,t}function ws(e,t,n,r,i,a){a??=.001;let o=M(e,`x`,`batchNorm`),s=M(t,`mean`,`batchNorm`),c=M(n,`variance`,`batchNorm`),l;i!=null&&(l=M(i,`scale`,`batchNorm`));let u;r!=null&&(u=M(r,`offset`,`batchNorm`)),m(s.rank===c.rank,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),m(u==null||s.rank===u.rank,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),m(l==null||s.rank===l.rank,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`);let d={x:Cs(o),scale:l,offset:u,mean:s,variance:c},f={varianceEpsilon:a};return V(j.runKernel(Pt,d,f),o.shape)}var Ts=N({batchNorm_:ws});function Es(e,t,n,r,i,a){let o=M(e,`x`,`batchNorm`),s=M(t,`mean`,`batchNorm`),c=M(n,`variance`,`batchNorm`),l;i!=null&&(l=M(i,`scale`,`batchNorm`));let u;return r!=null&&(u=M(r,`offset`,`batchNorm`)),m(o.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${o.rank}.`),m(s.rank===2||s.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${s.rank}.`),m(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${c.rank}.`),l!=null&&m(l.rank===2||l.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${l.rank}.`),u!=null&&m(u.rank===2||u.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${u.rank}.`),Ts(o,s,c,u,l,a)}var Ds=N({batchNorm2d_:Es});function Os(e,t,n,r,i,a){let o=M(e,`x`,`batchNorm`),s=M(t,`mean`,`batchNorm`),c=M(n,`variance`,`batchNorm`),l;i!=null&&(l=M(i,`scale`,`batchNorm`));let u;return r!=null&&(u=M(r,`offset`,`batchNorm`)),m(o.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${o.rank}.`),m(s.rank===3||s.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${s.rank}.`),m(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${c.rank}.`),l!=null&&m(l.rank===3||l.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${l.rank}.`),u!=null&&m(u.rank===3||u.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${u.rank}.`),Ts(o,s,c,u,l,a)}var ks=N({batchNorm3d_:Os});function As(e,t,n,r,i,a){let o=M(e,`x`,`batchNorm`),s=M(t,`mean`,`batchNorm`),c=M(n,`variance`,`batchNorm`),l;i!=null&&(l=M(i,`scale`,`batchNorm`));let u;return r!=null&&(u=M(r,`offset`,`batchNorm`)),m(o.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${o.rank}.`),m(s.rank===4||s.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${s.rank}.`),m(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${c.rank}.`),l!=null&&m(l.rank===4||l.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${l.rank}.`),u!=null&&m(u.rank===4||u.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${u.rank}.`),Ts(o,s,c,u,l,a)}var js=N({batchNorm4d_:As});function Ms(e,t,n){let r=M(e,`x`,`bincount`),i=M(t,`weights`,`bincount`);m(r.dtype===`int32`,()=>`Error in bincount: input dtype must be int32, but got ${r.dtype}`),m(n>=0,()=>`size must be non-negative, but got ${n}.`),m(i.size===r.size||i.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${r.shape}, weights shape: ${i.shape}.`);let a={x:r,weights:i},o={size:n};return j.runKernel(Je,a,o)}var Ns=N({bincount_:Ms});function Ps(e,t){let n=M(e,`broadcastTo`,`x`),r=n.shape;if(_e(t),t.length<n.rank)throw Error(`broadcastTo(): shape.length=${t.length} < input.rank=${n.rank}.`);if(t.length>n.rank){let e=n.shape.slice();for(;e.length<t.length;)e.unshift(1);n=V(n,e)}let i=n.shape,a=Array.from(t);for(let e=t.length-1;e>=0;e--)if(i[e]===t[e])a[e]=1;else if(n.shape[e]!==1)throw Error(`broadcastTo(): [${r}] cannot be broadcast to [${t}].`);if(a.map((e,t)=>e>1?t:-1).filter(e=>e>=0).length===0)return lo(n);let o={x:n},s={reps:a};return j.runKernel(fr,o,s)}var Fs=N({broadcastTo_:Ps});function Is(e){let t={x:M(e,`x`,`ceil`,`float32`)};return j.runKernel($e,t)}var Ls=N({ceil_:Is});function Rs(e,t,n){_e(e),n||=ce(t);let r={shape:e,value:t,dtype:n};return j.runKernel(At,{},r)}function zs(e,t,n){let r=M(e,`x`,`clipByValue`);if(m(t<=n,()=>`Error in clip: min (${t}) must be less than or equal to max (${n}).`),t===n)return Rs(r.shape,t,r.dtype);let i={x:r},a={clipValueMin:t,clipValueMax:n};return j.runKernel(et,i,a)}var Bs=N({clipByValue_:zs});function Vs(e){return fs(e,0)}var Hs=N({concat1d_:Vs});function Us(e,t){return fs(e,t)}var Ws=N({concat2d_:Us});function Gs(e,t){return fs(e,t)}var Ks=N({concat3d_:Gs});function qs(e,t){return fs(e,t)}var Js=N({concat4d_:qs});function Ys(e,t,n,r,i=`NHWC`,a=[1,1],o){let s=M(e,`x`,`conv2d`,`float32`),c=M(t,`filter`,`conv2d`,`float32`),l=s,u=!1;s.rank===3&&(u=!0,l=V(s,[1,s.shape[0],s.shape[1],s.shape[2]])),m(l.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${l.rank}.`),m(c.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${c.rank}.`),as(`conv2d`,r,o);let d=i===`NHWC`?l.shape[3]:l.shape[1];m(d===c.shape[2],()=>`Error in conv2d: depth of input (${d}) must match input depth for filter ${c.shape[2]}.`),m(ns(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),m(rs(a),()=>`Error in conv2D: Dilated rates should be larger than 0.`),m(rs(n),()=>`Error in conv2D: Strides should be larger than 0.`);let f={x:l,filter:c},p={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o},h=j.runKernel(it,f,p);return u?V(h,[h.shape[1],h.shape[2],h.shape[3]]):h}var Xs=N({conv2d_:Ys});function Zs(e,t,n,r,i=`NWC`,a=1,o){let s=M(e,`x`,`conv1d`),c=M(t,`filter`,`conv1d`),l=s,u=!1;s.rank===2&&(u=!0,l=V(s,[1,s.shape[0],s.shape[1]])),m(l.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${l.rank}.`),m(c.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${c.rank}.`),as(`conv1d`,r,o),m(l.shape[2]===c.shape[1],()=>`Error in conv1d: depth of input (${l.shape[2]}) must match input depth for filter ${c.shape[1]}.`),m(ns(n,a),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${n} and dilation '${a}'`),m(rs(a),()=>`Error in conv1D: Dilated rates should be larger than 0.`),m(rs(n),()=>`Error in conv1D: Stride should be larger than 0.`),m(i===`NWC`,()=>`Error in conv1d: got dataFormat of ${i} but only NWC is currently supported.`);let d=V(c,[1,c.shape[0],c.shape[1],c.shape[2]]),f=Xs(V(l,[l.shape[0],1,l.shape[1],l.shape[2]]),d,[1,n],r,`NHWC`,[1,a],o);return u?V(f,[f.shape[2],f.shape[3]]):V(f,[f.shape[0],f.shape[2],f.shape[3]])}var Qs=N({conv1d_:Zs});function $s(e,t,n,r,i,a=`NHWC`,o){m(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let s=e,c=t,l=!1;t.rank===3&&(l=!0,c=V(t,[1,t.shape[0],t.shape[1],t.shape[2]]),s=[1,e[0],e[1],e[2]]),m(s.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${s.length}.`),m(c.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${c.rank}`),m(n.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${n.rank}`);let u=a===`NHWC`?s[3]:s[1],d=a===`NHWC`?c.shape[3]:c.shape[1];m(u===n.shape[2],()=>`Error in conv2dDerInput: depth of input (${u}) must match input depth for filter ${n.shape[2]}.`),m(d===n.shape[3],()=>`Error in conv2dDerInput: depth of output (${d}) must match output depth for filter ${n.shape[3]}.`),as(`conv2dDerInput`,i,o);let f={dy:c,filter:n},p={strides:r,pad:i,dataFormat:a,dimRoundingMode:o,inputShape:s},h=j.runKernel(ot,f,p);return l?V(h,[h.shape[1],h.shape[2],h.shape[3]]):h}var ec=N({conv2DBackpropInput_:$s});function tc(e,t,n,r,i,a){return ec(n,M(e,`x`,`conv2dTranspose`),M(t,`filter`,`conv2dTranspose`),r,i,`NHWC`,a)}var nc=N({conv2dTranspose_:tc});function rc(e,t,n,r,i=`NDHWC`,a=[1,1,1]){let o=M(e,`x`,`conv3d`),s=M(t,`filter`,`conv3d`),c=o,l=!1;o.rank===4&&(l=!0,c=V(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),m(c.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${c.rank}.`),m(s.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${s.rank}.`),m(c.shape[4]===s.shape[3],()=>`Error in conv3d: depth of input (${c.shape[4]}) must match input depth for filter ${s.shape[3]}.`),m(ns(n,a),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),m(i===`NDHWC`,()=>`Error in conv3d: got dataFormat of ${i} but only NDHWC is currently supported.`),m(rs(a),()=>`Error in conv3D: Dilated rates should be larger than 0.`),m(rs(n),()=>`Error in conv3D: Strides should be larger than 0.`);let u={x:c,filter:s},d={strides:n,pad:r,dataFormat:i,dilations:a},f=j.runKernel(st,u,d);return l?V(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var ic=N({conv3d_:rc});function ac(e,t,n,r,i){m(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let a=e,o=t,s=!1;t.rank===4&&(s=!0,o=V(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]]),a=[1,e[0],e[1],e[2],e[3]]);let c=a[4],l=o.shape[4];m(a.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${a.length}.`),m(o.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${o.rank}`),m(n.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${n.rank}`),m(c===n.shape[3],()=>`Error in conv3dDerInput: depth of input (${c}) must match input depth for filter ${n.shape[3]}.`),m(l===n.shape[4],()=>`Error in conv3dDerInput: depth of output (${l}) must match output depth for filter ${n.shape[4]}.`);let u={dy:o,filter:n},d={pad:i,strides:r,inputShape:a},f=j.runKernel(lt,u,d);return s?V(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var oc=N({conv3DBackpropInput_:ac});function sc(e,t,n,r,i){return oc(n,M(e,`x`,`conv3dTranspose`),M(t,`filter`,`conv3dTranspose`),r,i)}var cc=N({conv3dTranspose_:sc});function lc(e){let t={x:M(e,`x`,`cos`,`float32`)};return j.runKernel(`Cos`,t)}var uc=N({cos_:lc});function dc(e){let t={x:M(e,`x`,`cosh`,`float32`)};return j.runKernel(ut,t)}var fc=N({cosh_:dc});function pc(e,t=0,n=!1,r=!1){let i={x:M(e,`x`,`cumprod`)},a={axis:t,exclusive:n,reverse:r};return j.runKernel(dt,i,a)}var mc=N({cumprod_:pc});function hc(e,t=0,n=!1,r=!1){let i={x:M(e,`x`,`cumsum`)},a={axis:t,exclusive:n,reverse:r};return j.runKernel(ft,i,a)}var gc=N({cumsum_:hc});function _c(e,t,n,r=!1){let i=M(e,`x`,`denseBincount`),a=M(t,`weights`,`denseBincount`);m(i.dtype===`int32`,()=>`Error in denseBincount: input dtype must be int32, but got ${i.dtype}`),m(i.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${i.rank}.`),m(n>=0,()=>`size must be non-negative, but got ${n}.`),m(a.size===i.size||a.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${i.shape}, weights shape: ${a.shape}.`);let o={x:i,weights:a},s={size:n,binaryOutput:r};return j.runKernel(mt,o,s)}var vc=N({denseBincount_:_c});function yc(e,t,n=`NHWC`){let r=M(e,`x`,`depthToSpace`,`float32`),i=n===`NHWC`?r.shape[1]:r.shape[2],a=n===`NHWC`?r.shape[2]:r.shape[3],o=n===`NHWC`?r.shape[3]:r.shape[1];m(t>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${t}`),m(i*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${i} and ${t}  for depthToSpace with input shape
    ${r.shape}`),m(a*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${a} and ${t} for depthToSpace with input shape
        ${r.shape}`),m(o%(t*t)===0,()=>`Dimension size must be evenly divisible by ${t*t} but is ${o} for depthToSpace with input shape ${r.shape}`);let s={x:r},c={blockSize:t,dataFormat:n};return j.runKernel(ht,s,c)}var bc=N({depthToSpace_:yc});function xc(e,t,n,r,i=`NHWC`,a=[1,1],o){let s=M(e,`x`,`depthwiseConv2d`,`float32`),c=M(t,`filter`,`depthwiseConv2d`,`float32`),l=s,u=!1;s.rank===3&&(u=!0,l=V(s,[1,s.shape[0],s.shape[1],s.shape[2]])),m(l.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${l.rank}.`),m(c.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${c.rank}.`);let d=i===`NHWC`?l.shape[3]:l.shape[1];m(d===c.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${d}) must match the inChannels dimension in filter ${c.shape[2]}.`),as(`depthwiseConv2d`,r,o);let f={x:l,filter:c},p={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o},h=j.runKernel(gt,f,p);return u?V(h,[h.shape[1],h.shape[2],h.shape[3]]):h}var Sc=N({depthwiseConv2d_:xc});function Cc(e,t,n,r,i=[1,1],a=`NHWC`){let o=M(e,`x`,`dilation2d`),s=M(t,`filter`,`dilation2d`);m(o.rank===3||o.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${o.rank}.`),m(s.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${s.rank}.`),m(a===`NHWC`,()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${a}`);let c=o,l=!1;o.rank===3&&(c=V(o,[1,o.shape[0],o.shape[1],o.shape[2]]),l=!0),m(c.shape[3]===s.shape[2],()=>`Error in dilation2d:  input and filter must have the same depth: ${c.shape[3]} vs ${s.shape[2]}`);let u={x:c,filter:s},d={strides:n,pad:r,dilations:i},f=j.runKernel(bt,u,d);return l?V(f,[f.shape[1],f.shape[2],f.shape[3]]):f}var wc=N({dilation2d_:Cc});function Tc(e,t){let n=e.length,r=[];for(let i=0;i<n;i++){let a=n-1-i,o=e[a]||1;(t[t.length-1-i]||1)>1&&o===1&&r.unshift(a)}return r}function Ec(e,t){let n=[];for(let r=0;r<t.length;r++){let i=e[e.length-r-1],a=t.length-r-1,o=t[a];(i==null||i===1&&o>1)&&n.unshift(a)}return n}function H(e,t){let n=Math.max(e.length,t.length),r=Array(n);for(let i=0;i<n;i++){let a=e[e.length-i-1];a??=1;let o=t[t.length-i-1];if(o??=1,a===1)r[n-i-1]=o;else if(o===1)r[n-i-1]=a;else if(a!==o){let n=`Operands could not be broadcast together with shapes ${e} and ${t}.`;throw Error(n)}else r[n-i-1]=a}return r}function Dc(e,t){let n=M(e,`a`,`equal`,`string_or_numeric`),r=M(t,`b`,`equal`,`string_or_numeric`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(Dt,i)}var Oc=N({equal_:Dc});function kc(e,t,n){let r=M(t,`a`,`where`),i=M(n,`b`,`where`),a=M(e,`condition`,`where`,`bool`),o=H(H(a.shape,r.shape),i.shape),s={condition:Fs(a,o),t:Fs(r,o),e:Fs(i,o)};return j.runKernel(Hn,s)}var Ac=N({where_:kc});function jc(e){let t={x:M(e,`x`,`zerosLike`)};return j.runKernel(yr,t)}var Mc=N({zerosLike_:jc});function Nc(e,t){let n=M(e,`a`,`div`),r=M(t,`b`,`div`);[n,r]=Bi(n,r);let i=z(n,r),a=Mc(i);return Ac(Oc(r,a),a,i)}var Pc=N({divNoNan_:Nc});function Fc(e,t){let n=M(e,`t1`,`dot`),r=M(t,`t2`,`dot`);m((n.rank===1||n.rank===2)&&(r.rank===1||r.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${n.rank} and ${r.rank}.`);let i=n.rank===1?n.size:n.shape[1],a=r.rank===1?r.size:r.shape[0];if(m(i===a,()=>`Error in dot: inner dimensions of inputs must match, but got ${i} and ${a}.`),n.rank===1&&r.rank===1)return V(ms(V(n,[1,-1]),V(r,[-1,1])),[]);if(n.rank===1&&r.rank===2){let e=ms(V(n,[1,-1]),V(r,[r.shape[0],r.shape[1]]));return V(e,[e.size])}if(n.rank===2&&r.rank===1){let e=ms(n,V(r,[-1,1]));return V(e,[e.size])}return ms(n,V(r,[r.shape[0],r.shape[1]]))}var Ic=N({dot_:Fc});function Lc(e,...t){let n=t.map((e,t)=>M(e,`tensors${t}`,`einsum`)),r={equation:e};return j.runKernel(Tt,n,r)}var Rc=N({einsum_:Lc});function zc(e){let t={x:M(e,`x`,`elu`,`float32`)};return j.runKernel(`Elu`,t)}var Bc=N({elu_:zc});function Vc(e){let t=M(e,`x`,`erf`);m(t.dtype===`int32`||t.dtype===`float32`,()=>"Input dtype must be `int32` or `float32`."),t.dtype===`int32`&&(t=L(t,`float32`));let n={x:t};return j.runKernel(`Erf`,n)}var Hc=N({erf_:Vc});function Uc(e,t){for(let n=0;n<e.length;++n)if(e[e.length-n-1]!==t-1-n)return!1;return!0}function Wc(e,t,n){let r=e.length+t.length,i=[],a=0,o=0;for(let s=0;s<r;s++)n.indexOf(s)===-1?i.push(e[a++]):i.push(t[o++]);return i}function Gc(e,t){let n=[],r=e.length;for(let i=0;i<r;i++)t.indexOf(i)===-1&&n.push(e[i]);return[n,t.map(t=>e[t])]}function Kc(e,t){return Wc(e,t.map(e=>1),t)}function qc(e,t,n){m(Uc(t,n),()=>`${e} supports only inner-most axes for now. Got axes ${t} and rank-${n} input.`)}function Jc(e,t){if(Uc(e,t))return null;let n=[];for(let r=0;r<t;++r)e.indexOf(r)===-1&&n.push(r);return e.forEach(e=>n.push(e)),n}function Yc(e){return e.map((e,t)=>[t,e]).sort((e,t)=>e[1]-t[1]).map(e=>e[0])}function Xc(e,t){let n=[];for(let r=t-e;r<t;++r)n.push(r);return n}function Zc(e,t=null,n=!1){let r={x:M(e,`x`,`max`)},i={reductionIndices:t,keepDims:n};return j.runKernel(`Max`,r,i)}var Qc=N({max_:Zc});function $c(e,t=null,n=!1){let r={x:M(e,`x`,`min`)},i={axis:t,keepDims:n};return j.runKernel(`Min`,r,i)}var el=N({min_:$c});function tl(e,t){let n=M(e,`base`,`pow`),r=M(t,`exp`,`pow`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(`Pow`,i)}var nl=N({pow_:tl});function rl(e,t){if((si(e)&&t!==`string`||Array.isArray(e))&&t!==`complex64`)throw Error(`Error creating a new Scalar: value must be a primitive (number|boolean|string)`);if(t===`string`&&si(e)&&!(e instanceof Uint8Array))throw Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return la(e,[],[],t)}function il(e){let t={x:M(e,`x`,`sqrt`,`float32`)};return j.runKernel(Yn,t)}var al=N({sqrt_:il});function ol(e){let t=M(e,`x`,`square`);return j.runKernel(`Square`,{x:t},{})}var sl=N({square_:ol});function cl(e,t=null,n=!1){let r=M(e,`x`,`sum`);r.dtype===`bool`&&(r=L(r,`int32`));let i={x:r},a={axis:t,keepDims:n};return j.runKernel(`Sum`,i,a)}var U=N({sum_:cl});function ll(e,t=`euclidean`,n=null,r=!1){e=M(e,`x`,`norm`);let i=ul(e,t,n),a=i.shape;if(r){let t=w(n,e.shape);a=Kc(i.shape,t)}return V(i,a)}function ul(e,t,n=null){if(e.rank===0)return vo(e);if(e.rank!==1&&n===null)return ul(V(e,[-1]),t,n);if(e.rank===1||typeof n==`number`||Array.isArray(n)&&n.length===1){if(t===1)return U(vo(e),n);if(t===1/0)return Qc(vo(e),n);if(t===-1/0)return el(vo(e),n);if(t===`euclidean`||t===2)return al(U(nl(vo(e),rl(2,`int32`)),n));throw Error(`Error in norm: invalid ord value: ${t}`)}if(Array.isArray(n)&&n.length===2){if(t===1)return Qc(U(vo(e),n[0]),n[1]-1);if(t===1/0)return Qc(U(vo(e),n[1]),n[0]);if(t===-1/0)return el(U(vo(e),n[1]),n[0]);if(t===`fro`||t===`euclidean`)return al(U(sl(e),n));throw Error(`Error in norm: invalid ord value: ${t}`)}throw Error(`Error in norm: invalid axis: ${n}`)}var dl=N({norm_:ll});function fl(e,t=null,n=!1){return dl(e,`euclidean`,t,n)}var pl=N({euclideanNorm_:fl});function ml(e){let t={x:M(e,`x`,`exp`)};return j.runKernel(`Exp`,t)}var hl=N({exp_:ml});function gl(e,t=0){let n=M(e,`x`,`expandDims`,`string_or_numeric`);m(t<=n.rank,()=>`Axis must be <= rank of the tensor`);let r={input:n},i={dim:t};return j.runKernel(Ot,r,i)}var _l=N({expandDims_:gl});function vl(e){let t={x:M(e,`x`,`expm1`)};return j.runKernel(kt,t)}var yl=N({expm1_:vl});function bl(e,t){let n=M(e,`x`,`tile`,`string_or_numeric`);m(n.rank===t.length,()=>`Error in transpose: rank of input ${n.rank} must match length of reps ${t}.`);let r={x:n},i={reps:t};return j.runKernel(fr,r,i)}var xl=N({tile_:bl});function Sl(e,t,n,r=`float32`){t??=e;let i=I([e,t],r),a=e<=t?e:t;for(let e=0;e<a;++e)i.set(1,e,e);let o=V(i.toTensor(),[e,t]);if(n==null)return o;if(n.length===1)return xl(_l(o,0),[n[0],1,1]);if(n.length===2)return xl(_l(_l(o,0),0),[n[0],n[1],1,1]);if(n.length===3)return xl(_l(_l(_l(o,0),0),0),[n[0],n[1],n[2],1,1]);throw Error(`eye() currently supports only 1D and 2D batchShapes, but received ${n.length}D.`)}var Cl=N({eye_:Sl});function wl(e){let t={x:M(e,`x`,`floor`,`float32`)};return j.runKernel(Mt,t)}var Tl=N({floor_:wl});function El(e,t,n=0,r=0){let i={x:M(e,`x`,`gather`),indices:M(t,`indices`,`gather`,`int32`)},a={axis:n,batchDims:r};return j.runKernel(Ft,i,a)}var Dl=N({gather_:El});function Ol(e,t){let n=M(e,`a`,`greater`,`string_or_numeric`),r=M(t,`b`,`greater`,`string_or_numeric`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(Lt,i)}var kl=N({greater_:Ol});function Al(e,t){let n=M(e,`a`,`greaterEqual`,`string_or_numeric`),r=M(t,`b`,`greaterEqual`,`string_or_numeric`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(Rt,i)}var jl=N({greaterEqual_:Al});function Ml(e){let t={input:M(e,`input`,`imag`)};return j.runKernel(Vt,t)}var Nl=N({imag_:Ml});function Pl(e){let t={x:M(e,`x`,`isFinite`)};return j.runKernel(Ht,t)}var Fl=N({isFinite_:Pl});function Il(e){let t={x:M(e,`x`,`isInf`)};return j.runKernel(Ut,t)}var Ll=N({isInf_:Il});function Rl(e){let t={x:M(e,`x`,`isNaN`)};return j.runKernel(Wt,t)}var zl=N({isNaN_:Rl});function Bl(e,t=.2){let n={x:M(e,`x`,`leakyRelu`)},r={alpha:t};return j.runKernel(Gt,n,r)}var Vl=N({leakyRelu_:Bl});function Hl(e,t){let n=M(e,`a`,`less`,`string_or_numeric`),r=M(t,`b`,`less`,`string_or_numeric`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(Kt,i)}var Ul=N({less_:Hl});function Wl(e,t){let n=M(e,`a`,`lessEqual`,`string_or_numeric`),r=M(t,`b`,`lessEqual`,`string_or_numeric`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(qt,i)}var Gl=N({lessEqual_:Wl});function Kl(e,t=5,n=1,r=1,i=.5){let a=M(e,`x`,`localResponseNormalization`);m(a.rank===4||a.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${a.rank}.`),m(y(t),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${t}.`);let o=a,s=!1;a.rank===3&&(s=!0,o=V(a,[1,a.shape[0],a.shape[1],a.shape[2]]));let c={x:o},l={depthRadius:t,bias:n,alpha:r,beta:i},u=j.runKernel(`LRN`,c,l);return s?V(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var ql=N({localResponseNormalization_:Kl});function Jl(e){let t={x:M(e,`x`,`log`,`float32`)};return j.runKernel(`Log`,t)}var Yl=N({log_:Jl});function Xl(e){let t={x:M(e,`x`,`log1p`)};return j.runKernel(Yt,t)}var Zl=N({log1p_:Xl});function Ql(e,t){m(le(e),()=>`The f passed in variableGrads(f) must be a function`),m(t==null||Array.isArray(t)&&t.every(e=>e instanceof ki),()=>`The varList passed in variableGrads(f, varList) must be an array of variables`);let n=t!=null;if(!n){t=[];for(let e in j.registeredVariables)t.push(j.registeredVariables[e])}let r=n?t.filter(e=>!e.trainable):null,i=t.length;t=t.filter(e=>e.trainable),m(t.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${i} variables is trainable.`);let{value:a,grads:o}=j.gradients(e,t,null,!0);m(o.some(e=>e!=null),()=>`Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize().`),m(a.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${a.rank} tensor`);let s={};return t.forEach((e,t)=>{o[t]!=null&&(s[e.name]=o[t])}),r?.forEach(e=>s[e.name]=null),{value:a,grads:s}}function $l(e){return j.customGrad(e)}function eu(e){let t={x:M(e,`x`,`neg`)};return j.runKernel(`Neg`,t)}var tu=N({neg_:eu});function nu(e){let t={x:M(e,`x`,`softplus`)};return j.runKernel(Jn,t)}var ru=N({softplus_:nu});function iu(e){let t=M(e,`x`,`logSigmoid`);return $l(e=>({value:tu(ru(tu(e))),gradFunc:t=>B(t,gs(tu(e)))}))(t)}var au=N({logSigmoid_:iu});function ou(e,t){let n=M(e,`a`,`sub`),r=M(t,`b`,`sub`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(`Sub`,i)}var W=N({sub_:ou});function su(e,t=-1){let n=M(e,`logits`,`logSoftmax`);if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and axis was ${t}`);return $l((e,n)=>{let r=W(e,Qc(e,t,!0)),i=W(L(r,`float32`),Yl(U(hl(r),t,!0)));return n([i]),{value:i,gradFunc:(e,n)=>{let[r]=n,i=hl(r);return W(e,B(U(e,t,!0),i))}}})(n)}var cu=N({logSoftmax_:su});function lu(e,t=null,n=!1){let r=M(e,`x`,`logSumExp`),i=w(t,r.shape),a=Qc(r,i,!0),o=Yl(U(hl(W(r,a)),i)),s=R(V(a,o.shape),o);return n?V(s,Kc(s.shape,i)):s}var uu=N({logSumExp_:lu});function du(e,t){let n=M(e,`a`,`logicalAnd`,`bool`),r=M(t,`b`,`logicalAnd`,`bool`);H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(Xt,i)}var fu=N({logicalAnd_:du});function pu(e){let t={x:M(e,`x`,`logicalNot`,`bool`)};return j.runKernel(Zt,t)}var mu=N({logicalNot_:pu});function hu(e,t){let n=M(e,`a`,`logicalOr`,`bool`),r=M(t,`b`,`logicalOr`,`bool`);H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(Qt,i)}var gu=N({logicalOr_:hu});function _u(e,t){let n=M(e,`a`,`logicalXor`,`bool`),r=M(t,`b`,`logicalXor`,`bool`);return H(n.shape,r.shape),fu(gu(e,t),mu(fu(e,t)))}var vu=N({logicalXor_:_u});function yu(e,t,n,r,i){let a=M(e,`x`,`maxPool`),o=a,s=!1;a.rank===3&&(s=!0,o=V(a,[1,a.shape[0],a.shape[1],a.shape[2]])),m(o.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${o.rank}.`),m(ns(n,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${n} and dilations '1'`),as(`maxPool`,r,i);let c={x:o},l={filterSize:t,strides:n,pad:r,dimRoundingMode:i},u=j.runKernel(nn,c,l);return s?V(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var bu=N({maxPool_:yu});function xu(e,t=[1,1,1],n,r,i,a=`NDHWC`){let o=M(e,`x`,`maxPool3d`),s=o,c=!1;o.rank===4&&(c=!0,s=V(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),m(s.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${s.rank}.`),m(a===`NDHWC`,()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),as(`maxPool3d`,r,i);let l={x:s},u={filterSize:t,strides:n,pad:r,dimRoundingMode:i,dataFormat:a},d=j.runKernel(an,l,u);return c?V(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}var Su=N({maxPool3d_:xu});function Cu(e,t){let n=M(e,`a`,`maximum`),r=M(t,`b`,`maximum`);[n,r]=Bi(n,r),n.dtype===`bool`&&(n=L(n,`int32`),r=L(r,`int32`)),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(tn,i)}var wu=N({maximum_:Cu});function Tu(e,t=null,n=!1){let r={x:M(e,`x`,`mean`)},i={axis:t,keepDims:n};return j.runKernel(cn,r,i)}var Eu=N({mean_:Tu});function Du(e,t=`float32`){if(_e(e),t===`complex64`)return ca(Du(e,`float32`),Du(e,`float32`));let n=he(_(e),t);return j.makeTensor(n,e,t)}function Ou(e,t=`float32`){if(_e(e),t===`complex64`)return ca(Ou(e,`float32`),Du(e,`float32`));let n=me(_(e),t);return j.makeTensor(n,e,t)}function ku(e,t){let n=M(e,`a`,`minimum`),r=M(t,`b`,`minimum`);[n,r]=Bi(n,r),n.dtype===`bool`&&(n=L(n,`int32`),r=L(r,`int32`)),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(ln,i)}var Au=N({minimum_:ku});function ju(e,t,n){m(n===`reflect`||n===`symmetric`,()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${n}.`);let r=M(e,`x`,`mirrorPad`);if(r.rank===0)throw Error(`mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad`);m(t.length===r.rank,()=>`Padding doesn't match input. Must be ${r.rank}. Got ${t.length}.`);let i=+(n===`reflect`);for(let e=0;e<r.rank;e++)m(t[e].length===2,()=>`Invalid number of paddings. Must be length of 2 each.`),m(t[e][0]>=0&&t[e][0]<=r.shape[e]-i&&t[e][1]>=0&&t[e][1]<=r.shape[e]-i,()=>`Padding in dimension ${e} cannot be greater than or equal to ${r.shape[e]-i} or less than 0 for input of shape ${r.shape}`);let a={paddings:t,mode:n},o={x:r};return j.runKernel(un,o,a)}var Mu=N({mirrorPad_:ju});function Nu(e,t){let n=M(e,`a`,`mod`),r=M(t,`b`,`mod`);[n,r]=Bi(n,r);let i={a:n,b:r};return j.runKernel(`Mod`,i)}var Pu=N({mod_:Nu});function Fu(e,t=null,n=!1){e=M(e,`x`,`moments`);let r=w(t,e.shape),i=Eu(e,r,n),a=i.shape;return n||(a=Kc(i.shape,r)),{mean:i,variance:Eu(sl(W(L(e,`float32`),V(i,a))),r,n)}}var Iu=N({moments_:Fu});function Lu(e,t){let n=M(e,`a`,`notEqual`,`string_or_numeric`),r=M(t,`b`,`notEqual`,`string_or_numeric`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(pn,i)}var Ru=N({notEqual_:Lu});function zu(e,t,n=1,r=0,i=`int32`){if(t<2)throw Error(`Error in oneHot: depth must be >=2, but it is ${t}`);let a={indices:M(e,`indices`,`oneHot`,`int32`)},o={dtype:i,depth:t,onValue:n,offValue:r};return j.runKernel(vn,a,o)}var Bu=N({oneHot_:zu});function Vu(e){let t={x:M(e,`x`,`onesLike`)};return j.runKernel(_n,t)}var Hu=N({onesLike_:Vu});function Uu(e,t,n=0){let r=M(e,`x`,`pad`);if(r.rank===0)throw Error(`pad(scalar) is not defined. Pass non-scalar to pad`);let i={paddings:t,constantValue:n},a={x:r};return j.runKernel(bn,a,i)}var Wu=N({pad_:Uu});function Gu(e,t,n){let r=M(e,`x`,`spaceToBatchND`);m(r.rank>=1+t.length,()=>`input rank ${r.rank} should be > than [blockShape] ${t.length}`),m(n.length===t.length,()=>`paddings.shape[0] ${n.length} must be equal to [blockShape] ${t.length}`),m(r.shape.reduce((e,r,i)=>i>0&&i<=t.length?e&&(r+n[i-1][0]+n[i-1][1])%t[i-1]===0:e,!0),()=>`input spatial dimensions ${r.shape.slice(1)} with paddings ${n.toString()} must be divisible by blockShapes ${t.toString()}`);let i={x:r},a={blockShape:t,paddings:n};return j.runKernel(Xn,i,a)}var Ku=N({spaceToBatchND_:Gu});function qu(e,t,n,r,i,a,o){i??=[1,1],a??=1,r===0&&(r=`valid`);let s=M(e,`x`,`maxPool`),c=s,l=!1;s.rank===3&&(l=!0,c=V(s,[1,s.shape[0],s.shape[1],s.shape[2]])),m(ns(a,i),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${a} and dilations '${i}'`);let u=Ho(c.shape,t,a,i,r),d=[u.dilationHeight,u.dilationWidth],f;f=r===`same`?Yu([u.filterHeight,u.filterWidth],d):[[0,0],[0,0]];let p=d[0]===1&&d[1]===1,[h,g]=Ju([u.inHeight,u.inWidth],d,f),_=p?r:`valid`,v=p?c:Ku(c,d,h),y=(n===`avg`?()=>cs(v,t,a,_,o):()=>bu(v,t,a,_,o))(),b=p?y:Ss(y,d,g);return l?V(b,[b.shape[1],b.shape[2],b.shape[3]]):b}function Ju(e,t,n){let r=n.map(e=>e[0]),i=n.map(e=>e[1]),a=e.concat(r,i),o=t.map((e,t)=>(e-a[t]%e)%e),s=i.map((e,t)=>e+o[t]);return[t.map((e,t)=>[r[t],s[t]]),t.map((e,t)=>[0,o[t]])]}function Yu(e,t){let n=e.map((e,n)=>e+(e-1)*(t[n]-1)).map(e=>e-1),r=n.map(e=>Math.floor(e/2)),i=n.map((e,t)=>e-r[t]);return n.map((e,t)=>[r[t],i[t]])}var Xu=N({pool_:qu});function Zu(e,t){let n={x:M(e,`x`,`prelu`),alpha:M(t,`alpha`,`prelu`)};return j.runKernel(xn,n)}var Qu=N({prelu_:Zu});function $u(e,t=null,n=!1){let r=M(e,`x`,`prod`);r.dtype===`bool`&&(r=L(r,`int32`));let i={x:r},a={axis:t,keepDims:n};return j.runKernel(Sn,i,a)}var ed=N({prod_:$u}),td=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=o();t.next=function(){var e=2091639*t.s0+t.c*23283064365386963e-26;return t.s0=t.s1,t.s1=t.s2,t.s2=e-(t.c=e|0)},t.c=1,t.s0=n(` `),t.s1=n(` `),t.s2=n(` `),t.s0-=n(e),t.s0<0&&(t.s0+=1),t.s1-=n(e),t.s1<0&&(t.s1+=1),t.s2-=n(e),t.s2<0&&(t.s2+=1),n=null}function i(e,t){return t.c=e.c,t.s0=e.s0,t.s1=e.s1,t.s2=e.s2,t}function a(e,t){var n=new r(e),a=t&&t.state,o=n.next;return o.int32=function(){return n.next()*4294967296|0},o.double=function(){return o()+(o()*2097152|0)*11102230246251565e-32},o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}function o(){var e=4022871197;return function(t){t=String(t);for(var n=0;n<t.length;n++){e+=t.charCodeAt(n);var r=.02519603282416938*e;e=r>>>0,r-=e,r*=e,e=r>>>0,r-=e,e+=r*4294967296}return(e>>>0)*23283064365386963e-26}}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.alea=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),nd=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.x=0,t.y=0,t.z=0,t.w=0,t.next=function(){var e=t.x^t.x<<11;return t.x=t.y,t.y=t.z,t.z=t.w,t.w^=t.w>>>19^e^e>>>8},e===(e|0)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=n.charCodeAt(r)|0,t.next()}function i(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xor128=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),rd=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.next=function(){var e=t.x^t.x>>>2;return t.x=t.y,t.y=t.z,t.z=t.w,t.w=t.v,(t.d=t.d+362437|0)+(t.v=t.v^t.v<<4^(e^e<<1))|0},t.x=0,t.y=0,t.z=0,t.w=0,t.v=0,e===(e|0)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=n.charCodeAt(r)|0,r==n.length&&(t.d=t.x<<10^t.x>>>4),t.next()}function i(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t.v=e.v,t.d=e.d,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xorwow=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),id=n(((e,t)=>{(function(e,t,n){function r(e){var t=this;t.next=function(){var e=t.x,n=t.i,r=e[n],i;return r^=r>>>7,i=r^r<<24,r=e[n+1&7],i^=r^r>>>10,r=e[n+3&7],i^=r^r>>>3,r=e[n+4&7],i^=r^r<<7,r=e[n+7&7],r^=r<<13,i^=r^r<<9,e[n]=i,t.i=n+1&7,i};function n(e,t){var n,r=[];if(t===(t|0))r[0]=t;else for(t=``+t,n=0;n<t.length;++n)r[n&7]=r[n&7]<<15^t.charCodeAt(n)+r[n+1&7]<<13;for(;r.length<8;)r.push(0);for(n=0;n<8&&r[n]===0;++n);for(n==8?r[7]=-1:r[n],e.x=r,e.i=0,n=256;n>0;--n)e.next()}n(t,e)}function i(e,t){return t.x=e.x.slice(),t.i=e.i,t}function a(e,t){e??=+new Date;var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(a.x&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xorshift7=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),ad=n(((e,t)=>{(function(e,t,n){function r(e){var t=this;t.next=function(){var e=t.w,n=t.X,r=t.i,i,a;return t.w=e=e+1640531527|0,a=n[r+34&127],i=n[r=r+1&127],a^=a<<13,i^=i<<17,a^=a>>>15,i^=i>>>12,a=n[r]=a^i,t.i=r,a+(e^e>>>16)|0};function n(e,t){var n,r,i,a,o,s=[],c=128;for(t===(t|0)?(r=t,t=null):(t+=`\0`,r=0,c=Math.max(c,t.length)),i=0,a=-32;a<c;++a)t&&(r^=t.charCodeAt((a+32)%t.length)),a===0&&(o=r),r^=r<<10,r^=r>>>15,r^=r<<4,r^=r>>>13,a>=0&&(o=o+1640531527|0,n=s[a&127]^=r+o,i=n==0?i+1:0);for(i>=128&&(s[(t&&t.length||0)&127]=-1),i=127,a=512;a>0;--a)r=s[i+34&127],n=s[i=i+1&127],r^=r<<13,n^=n<<17,r^=r>>>15,n^=n>>>12,s[i]=r^n;e.w=o,e.X=s,e.i=i}n(t,e)}function i(e,t){return t.i=e.i,t.w=e.w,t.X=e.X.slice(),t}function a(e,t){e??=+new Date;var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(a.X&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xor4096=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),od=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.next=function(){var e=t.b,n=t.c,r=t.d,i=t.a;return e=e<<25^e>>>7^n,n=n-r|0,r=r<<24^r>>>8^i,i=i-e|0,t.b=e=e<<20^e>>>12^n,t.c=n=n-r|0,t.d=r<<16^n>>>16^i,t.a=i-e|0},t.a=0,t.b=0,t.c=-1640531527,t.d=1367130551,e===Math.floor(e)?(t.a=e/4294967296|0,t.b=e|0):n+=e;for(var r=0;r<n.length+20;r++)t.b^=n.charCodeAt(r)|0,t.next()}function i(e,t){return t.a=e.a,t.b=e.b,t.c=e.c,t.d=e.d,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.tychei=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),sd=n(((e,t)=>{(function(e,n,i){var a=256,o=6,s=52,c=`random`,l=i.pow(a,o),u=i.pow(2,s),d=u*2,f=a-1,p;function m(e,t,r){var s=[];t=t==1?{entropy:!0}:t||{};var f=v(_(t.entropy?[e,b(n)]:e??y(),3),s),p=new h(s),m=function(){for(var e=p.g(o),t=l,n=0;e<u;)e=(e+n)*a,t*=a,n=p.g(1);for(;e>=d;)e/=2,t/=2,n>>>=1;return(e+n)/t};return m.int32=function(){return p.g(4)|0},m.quick=function(){return p.g(4)/4294967296},m.double=m,v(b(p.S),n),(t.pass||r||function(e,t,n,r){return r&&(r.S&&g(r,p),e.state=function(){return g(p,{})}),n?(i[c]=e,t):e})(m,f,`global`in t?t.global:this==i,t.state)}function h(e){var t,n=e.length,r=this,i=0,o=r.i=r.j=0,s=r.S=[];for(n||(e=[n++]);i<a;)s[i]=i++;for(i=0;i<a;i++)s[i]=s[o=f&o+e[i%n]+(t=s[i])],s[o]=t;(r.g=function(e){for(var t,n=0,i=r.i,o=r.j,s=r.S;e--;)t=s[i=f&i+1],n=n*a+s[f&(s[i]=s[o=f&o+t])+(s[o]=t)];return r.i=i,r.j=o,n})(a)}function g(e,t){return t.i=e.i,t.j=e.j,t.S=e.S.slice(),t}function _(e,t){var n=[],r=typeof e,i;if(t&&r==`object`)for(i in e)try{n.push(_(e[i],t-1))}catch{}return n.length?n:r==`string`?e:e+`\0`}function v(e,t){for(var n=e+``,r,i=0;i<n.length;)t[f&i]=f&(r^=t[f&i]*19)+n.charCodeAt(i++);return b(t)}function y(){try{var t;return p&&(t=p.randomBytes)?t=t(a):(t=new Uint8Array(a),(e.crypto||e.msCrypto).getRandomValues(t)),b(t)}catch{var r=e.navigator,i=r&&r.plugins;return[+new Date,e,i,e.screen,b(n)]}}function b(e){return String.fromCharCode.apply(0,e)}if(v(i.random(),n),typeof t==`object`&&t.exports){t.exports=m;try{p=r()}catch{}}else typeof define==`function`&&define.amd?define(function(){return m}):i[`seed`+c]=m})(typeof self<`u`?self:e,[],Math)})),cd=e(n(((e,t)=>{var n=td(),r=nd(),i=rd(),a=id(),o=ad(),s=od(),c=sd();c.alea=n,c.xor128=r,c.xorwow=i,c.xorshift7=a,c.xor4096=o,c.tychei=s,t.exports=c}))()),ld=class{constructor(e,t,n,r,i){this.mean=e,this.stdDev=t,this.dtype=n,this.nextVal=NaN,this.truncated=r,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);let a=i||Math.random();this.random=cd.alea(a.toString())}nextValue(){if(!isNaN(this.nextVal)){let e=this.nextVal;return this.nextVal=NaN,e}let e,t,n=!1;for(;!n;){let r,i,a;do r=2*this.random()-1,i=2*this.random()-1,a=r*r+i*i;while(a>=1||a===0);let o=Math.sqrt(-2*Math.log(a)/a);e=this.mean+this.stdDev*r*o,t=this.mean+this.stdDev*i*o,(!this.truncated||this.isValidTruncated(e))&&(n=!0)}return(!this.truncated||this.isValidTruncated(t))&&(this.nextVal=this.convertValue(t)),this.convertValue(e)}convertValue(e){return this.dtype==null||this.dtype===`float32`?e:Math.round(e)}isValidTruncated(e){return e<=this.upper&&e>=this.lower}},ud=class{constructor(e=0,t=1,n,r){if(this.canReturnFloat=()=>this.dtype==null||this.dtype===`float32`,this.min=e,this.range=t-e,this.dtype=n,r??=Math.random(),typeof r==`number`&&(r=r.toString()),!this.canReturnFloat()&&this.range<=1)throw Error(`The difference between ${e} - ${t} <= 1 and dtype is not float`);this.random=cd.alea(r)}convertValue(e){return this.canReturnFloat()?e:Math.round(e)}nextValue(){return this.convertValue(this.min+this.range*this.random())}};function dd(e,t=0,n=1,r,i){if(_e(e),r!=null&&r===`bool`)throw Error(`Unsupported data type ${r}`);let a=new ld(t,n,r,!1,i),o=I(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var fd=N({randomNormal_:dd});function pd(e,t=0,n=1,r=`float32`,i){_e(e);let a=I(e,r),o=new ud(t,n,null,i);for(let e=0;e<a.values.length;e++)a.values[e]=o.nextValue();return a.toTensor()}var md=N({randomUniform_:pd});function hd(e,t,n=1,r=`float32`){if(n===0)throw Error(`Cannot have a step of zero`);let i={start:e,stop:t,step:n,dtype:r};return j.runKernel(En,{},i)}function gd(e){let t={input:M(e,`input`,`real`)};return j.runKernel(Dn,t)}var _d=N({real_:gd});function vd(e){let t={x:M(e,`x`,`reciprocal`)};return j.runKernel(On,t)}var yd=N({reciprocal_:vd});function bd(e){let t={x:M(e,`x`,`relu`)};return j.runKernel(kn,t)}var xd=N({relu_:bd});function Sd(e){let t={x:M(e,`x`,`relu6`)};return j.runKernel(Fn,t)}var Cd=N({relu6_:Sd});function wd(e,t){let n={x:M(e,`x`,`reverse`)},r={dims:t};return j.runKernel(In,n,r)}var Td=N({reverse_:wd});function Ed(e){let t={x:M(e,`x`,`round`)};return j.runKernel(Ln,t)}var Dd=N({round_:Ed});function Od(e){let t={x:M(e,`x`,`rsqrt`,`float32`)};return j.runKernel(Rn,t)}var kd=N({rsqrt_:Od});function Ad(e){let t={x:M(e,`x`,`selu`)};return j.runKernel(Un,t)}var jd=N({selu_:Ad});function Md(e,t,n,r,i,a=[1,1],o=`NHWC`){let s=M(e,`x`,`separableConv2d`),c=M(t,`depthwiseFilter`,`separableConv2d`),l=M(n,`pointwiseFilter`,`separableConv2d`),u=s,d=!1;if(s.rank===3&&(d=!0,u=V(s,[1,s.shape[0],s.shape[1],s.shape[2]])),o===`NCHW`)throw Error(`separableConv2d currently does not support dataFormat NCHW; only NHWC is supported`);m(u.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${u.rank}.`),m(c.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${c.rank}.`),m(l.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${c.rank}.`),m(l.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${l.shape[0]}.`),m(l.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${l.shape[1]}.`);let f=c.shape[2],p=c.shape[3];m(l.shape[2]===f*p,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${f*p}, but got ${l.shape[2]}.`);let h=Xs(Sc(u,c,r,i,o,a),l,1,`valid`,o);return d?V(h,[h.shape[1],h.shape[2],h.shape[3]]):h}var Nd=N({separableConv2d_:Md});function Pd(e){let t={x:M(e,`x`,`sign`)};return j.runKernel(Kn,t)}var Fd=N({sign_:Pd});function Id(e){let t={x:M(e,`x`,`sin`,`float32`)};return j.runKernel(`Sin`,t)}var Ld=N({sin_:Id});function Rd(e){let t={x:M(e,`x`,`sinh`)};return j.runKernel(Gn,t)}var zd=N({sinh_:Rd});function Bd(e,t,n){let r=M(e,`x`,`slice1d`);return m(r.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${r.rank} tensor`),vs(r,[t],[n])}var Vd=N({slice1d_:Bd});function Hd(e,t,n){let r=M(e,`x`,`slice2d`);return m(r.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${r.rank} tensor`),vs(r,t,n)}var Ud=N({slice2d_:Hd});function Wd(e,t,n){let r=M(e,`x`,`slice3d`);return m(r.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${r.rank} tensor`),vs(r,t,n)}var Gd=N({slice3d_:Wd});function Kd(e,t,n){let r=M(e,`x`,`slice4d`);return m(r.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${r.rank} tensor`),vs(r,t,n)}var qd=N({slice4d_:Kd});function Jd(e,t=-1){let n=M(e,`logits`,`softmax`,`float32`);if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and dim was ${t}`);let r={logits:n},i={dim:t};return j.runKernel(Qn,r,i)}var Yd=N({softmax_:Jd});function Xd(e){m(e.dtype===`complex64`,()=>`The dtype for tf.spectral.fft() must be complex64 but got ${e.dtype}.`);let t={input:e};return j.runKernel(`FFT`,t)}var Zd=N({fft_:Xd});function Qd(e){m(e.dtype===`complex64`,()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${e.dtype}.`);let t={input:e};return j.runKernel(Bt,t)}var $d=N({ifft_:Qd});function ef(e){let t=e.shape[e.shape.length-1],n=e.size/t,r;if(t<=2)r=$d(V(e,[n,t]));else{let i=[n,2*(t-1)],a=V(_d(e),[n,t]),o=V(Nl(e),[n,t]),s=Td(vs(a,[0,1],[n,t-2]),1),c=B(Td(vs(o,[0,1],[n,t-2]),1),rl(-1));r=$d(V(ca(fs([a,s],1),fs([o,c],1)),[i[0],i[1]]))}if(r=_d(r),e.rank===3&&e.shape[0]!==0){let t=r,n=e.shape[0];r=V(r,[n,r.shape[0]/n,r.shape[1]]),t.dispose()}return r}var tf=N({irfft_:ef});function nf(e,t,n=0){let r={x:M(e,`x`,`split`)},i={numOrSizeSplits:t,axis:n};return j.runKernel(Zn,r,i)}var rf=N({split_:nf});function af(e,t){m(e.dtype===`float32`,()=>`The dtype for rfft() must be real value but got ${e.dtype}`);let n=e.shape[e.shape.length-1],r=e.size/n,i;if(t!=null&&t<n){let r=e.shape.map(e=>0),a=e.shape.map(e=>e);a[e.shape.length-1]=t,i=vs(e,r,a),n=t}else if(t!=null&&t>n){let r=e.shape.map(e=>e);r[e.shape.length-1]=t-n,i=fs([e,Du(r)],e.shape.length-1),n=t}else i=e;let a=Mc(i),o=Zd(V(ca(i,a),[r,n])),s=Math.floor(n/2)+1,c=_d(o),l=Nl(o),u=rf(c,[s,n-s],c.shape.length-1),d=rf(l,[s,n-s],l.shape.length-1),f=i.shape.slice();return f[i.shape.length-1]=s,V(ca(u[0],d[0]),f)}var of=N({rfft_:af});function sf(e,t){let n=M(e,`a`,`squaredDifference`),r=M(t,`b`,`squaredDifference`);[n,r]=Bi(n,r),H(n.shape,r.shape);let i={a:n,b:r};return j.runKernel(ir,i,{})}var cf=N({squaredDifference_:sf});function lf(e,t){let n=M(e,`x`,`squeeze`,`string_or_numeric`);return V(n,T(n.shape,t).newShape)}var uf=N({squeeze_:lf});function df(e,t=0){let n=aa(e,`tensors`,`stack`,`string_or_numeric`);m(n.length>=1,()=>`Pass at least one tensor to tf.stack`),n.length>0&&m(t<=n[0].rank,()=>`Axis must be <= rank of the tensor`);let r=n,i={axis:t};return j.runKernel(yn,r,i)}var ff=N({stack_:df});function pf(e,t=0){let n={x:M(e,`x`,`step`)},r={alpha:t};return j.runKernel(br,n,r)}var mf=N({step_:pf});function hf(e,t,n,r,i=0,a=0,o=0,s=0,c=0){let l={x:M(e,`x`,`stridedSlice`,`string_or_numeric`)},u={begin:t,end:n,strides:r,beginMask:i,endMask:a,ellipsisMask:o,newAxisMask:s,shrinkAxisMask:c};return j.runKernel(sr,l,u)}var gf=N({stridedSlice_:hf});function _f(e){let t={x:M(e,`x`,`tan`,`float32`)};return j.runKernel(`Tan`,t)}var vf=N({tan_:_f});function yf(e,t){g(e);let n=na(e,t);if(n.length!==1)throw Error(`tensor1d() requires values to be a flat/TypedArray`);return la(e,null,n,t)}function bf(e,t,n){if(g(e),t!=null&&t.length!==2)throw Error(`tensor2d() requires shape to have two numbers`);let r=na(e,n);if(r.length!==2&&r.length!==1)throw Error(`tensor2d() requires values to be number[][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return la(e,t,r,n)}function xf(e,t,n){let r=t.rank>1?t.shape[t.rank-1]:1,i=t.rank>1?t.rank-1:1,a=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${n.shape}, indices.shape: ${t.shape}, shape: ${e}, sliceDim: ${r}, and batchDim: ${i}.`;if(n.rank<i)throw Error(a+` update.rank < ${i}. `);if(e.length<r+(n.rank-i))throw Error(a+` Output shape length < ${r+(n.rank-i)}`);if(n.rank!==i+e.length-r)throw Error(a+` update.rank != ${i+e.length-r}`);for(let e=0;e<i;++e)if(n.shape[e]!==t.shape[e])throw Error(a+` updates.shape[${e}] (${n.shape[e]}) != indices.shape[${e}] (${t.shape[e]}).`);for(let t=0;t<n.rank-i;++t)if(n.shape[t+i]!==e[t+r])throw Error(a+` updates.shape[${t+i}] (${n.shape[t+i]}) != shape[${t+i}] (${e[t+i]})`)}function Sf(e,t,n){if(t.rank<1)throw Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${t.rank}.`);if(e.rank<1)throw Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${e.rank}.`);if(t.dtype!==`int32`)throw Error(`The dtype of 'indices' should be int32, but got dtype: ${t.dtype}`);if(n.length<1)throw Error(`Output rank must be greater or equal to 1, but got shape: ${n}`);if(n.length===0){if(t.size===0)throw Error(`Indices specified for empty output. indices shape: ${t.shape}`);if(e.size===0)throw Error(`Updates specified for empty output. updates shape: ${e.shape}`)}xf(n,t,e)}function Cf(e,t,n){let r=t.shape.length,i=r>1?t.shape[r-1]:1,a=n.length,o=1;for(let e=i;e<a;++e)o*=n[e];let s=i<1?1:i,c=_(t.shape)/s,l=[...O(n.slice(0,i)),1],u=_(n);return{sliceRank:i,numUpdates:c,sliceSize:o,strides:l,outputSize:u}}function wf(e,t=1,n=!0){let r=M(e,`x`,`topk`);if(r.rank===0)throw Error(`topk() expects the input to be of rank 1 or higher`);let i=r.shape[r.shape.length-1];if(t<0)throw Error(`'k' passed to topk() must be >= 0 but got ${t}`);if(t>i)throw Error(`'k' passed to topk() must be <= the last dimension (${i}) but got ${t}`);let a={x:r},o={k:t,sorted:n},[s,c]=j.runKernel(pr,a,o);return{values:s,indices:c}}var Tf=N({topk_:wf});function Ef(e,t=0,n=1,r,i){if(_e(e),r!=null&&r===`bool`)throw Error(`Unsupported data type $ { dtype }`);let a=new ld(t,n,r,!0,i),o=I(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var Df=N({truncatedNormal_:Ef});function Of(e,t=0){let n=M(e,`x`,`unique`,`string_or_numeric`);m(n.rank>0,()=>`The input tensor must be at least 1D`);let r={x:n},i={axis:t},[a,o]=j.runKernel(gr,r,i);return{values:a,indices:o}}var kf=N({unique_:Of});function Af(e,t,n){let r=M(e,`x`,`unsortedSegmentSum`),i=M(t,`segmentIds`,`unsortedSegmentSum`,`int32`);m(y(n),()=>`numSegments must be of dtype int`);let a={x:r,segmentIds:i},o={numSegments:n};return j.runKernel(vr,a,o)}var jf=N({unsortedSegmentSum_:Af});function Mf(e,t=0){let n=M(e,`x`,`unstack`,`string_or_numeric`);m(t>=-n.shape.length&&t<n.shape.length,()=>`Axis = ${t} is not in [-${n.shape.length}, ${n.shape.length})`);let r={value:n},i={axis:t};return j.runKernel(_r,r,i)}var Nf=N({unstack_:Mf});function Pf(e,t=!0,n,r){return j.makeVariable(e,t,n,r)}function Ff(e,t){let n=[];for(let e=0;e<t.length;e++)t[e]&&n.push(e);let r=I(e,`int32`),i=I([n.length,e.length],`int32`);for(let t=0;t<n.length;t++){let a=r.indexToLoc(n[t]),o=t*e.length;i.values.set(a,o)}return i.toTensor()}function If(e,t,n){let r=M(e,`x`,`transpose`);if(t??=r.shape.map((e,t)=>t).reverse(),m(r.rank===t.length,()=>`Error in transpose: rank of input ${r.rank} must match length of perm ${t}.`),t.forEach(e=>{m(e>=0&&e<r.rank,()=>`All entries in 'perm' must be between 0 and ${r.rank-1} but got ${t}`)}),r.rank<=1)return r.clone();let i={x:r},a={perm:t};return r.dtype===`complex64`?P(()=>{let e=_d(r),t=Nl(r);return e=j.runKernel(hr,{x:e},a),t=j.runKernel(hr,{x:t},a),n&&(t=tu(t)),ca(e,t)}):j.runKernel(hr,i,a)}var Lf=N({transpose_:If});function Rf(e,t){if(t==null)return e.shape.slice();if(v(e.shape,t))return t;if(e.shape.length===t.length){let n=[];for(let r=0;r<e.shape.length;r++)t[r]==null&&e.shape[r]!=null?n.push(e.shape[r]):n.push(t[r]);return n}return t}function zf(e,t,n,r){let i=M(e,`x`,`dropout`);if(m(i.dtype===`float32`,()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${i.dtype} tensor instead.`),m(t>=0&&t<1,()=>`rate must be a float in the range [0, 1), but got ${t}.`),t===0)return e instanceof Oi?i.clone():i;let a=Rf(i,n),o=1-t;return B(i,z(Tl(R(md(a,0,1,`float32`,r),o)),o))}var Bf=N({dropout_:zf});function Vf(e,t,n,r,i,a=`NHWC`,o){let s=e;e.rank===3&&(s=V(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=V(t,[1,t.shape[0],t.shape[1],t.shape[2]])),m(s.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${s.shape}.`),m(c.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${c.shape}.`),m(n.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${n}.`);let l=a===`NHWC`?s.shape[3]:s.shape[1],u=a===`NHWC`?c.shape[3]:c.shape[1];m(l===n[2],()=>`Error in conv2dDerFilter: depth of input ${l}) must match input depth in filter (${n[2]}.`),m(u===n[3],()=>`Error in conv2dDerFilter: depth of dy (${u}) must match output depth for filter (${n[3]}).`),as(`conv2dDerFilter`,i,o);let d={x:s,dy:c},f={strides:r,pad:i,dataFormat:a,dimRoundingMode:o,filterShape:n};return j.runKernel(at,d,f)}var Hf=N({conv2DBackpropFilter_:Vf});function Uf(e,t,n){if(n==null||n===`linear`)return e;if(n===`relu`)return B(e,mf(t));throw Error(`Cannot compute gradient for fused activation ${n}.`)}function Wf(e,t){let n=t,r=Ec(e.shape,t.shape);return r.length>0&&(n=U(n,r)),V(n,e.shape)}function Gf(e,t,n,r){if(t===`linear`)return e;if(t===`relu`)return xd(e);if(t===`elu`)return Bc(e);if(t===`relu6`)return Cd(e);if(t===`prelu`)return Qu(e,n);if(t===`leakyrelu`)return Vl(e,r);if(t===`sigmoid`)return gs(e);throw Error(`Unknown fused activation ${t}.`)}var Kf=(e,t)=>!(e>0)||t===`linear`;function qf({x:e,filter:t,strides:n,pad:r,dataFormat:i=`NHWC`,dilations:a=[1,1],dimRoundingMode:o,bias:s,activation:c=`linear`,preluActivationWeights:l,leakyreluAlpha:u}){if(c||=`linear`,Kf(j.state.gradientDepth,c)===!1){m(i===`NHWC`,()=>`Error in fused conv2d: got dataFormat of ${i} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let d=Xs(e,t,n,r,i,a,o);return s!=null&&(d=R(d,s)),Gf(d,c,l,u)}let d=M(e,`x`,`conv2d`,`float32`),f=M(t,`filter`,`conv2d`,`float32`),p=d,h=!1;d.rank===3&&(h=!0,p=V(d,[1,d.shape[0],d.shape[1],d.shape[2]])),m(p.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${p.rank}.`),m(f.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${f.rank}.`),as(`fused conv2d`,r,o);let g=i===`NHWC`?p.shape[3]:p.shape[1];m(f.shape[2]===g,()=>`Error in conv2d: depth of input (${g}) must match input depth for filter ${f.shape[2]}.`),m(ns(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`);let _=Wo(p.shape,f.shape,n,a,r,o),v;s!=null&&(v=M(s,`bias`,`fused conv2d`),[v]=Bi(v,d),i===`NHWC`?H(_.outShape,v.shape):(m(v.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${v.shape.length}.`),m(v.shape.length===0||v.shape[0]===_.outChannels||v.shape[0]===1,()=>`Error in fused conv2d: bias shape (${v.shape}) is not compatible with the number of output channels (${_.outChannels})`)));let y;if(l!=null){let e=l.shape;if(m(e.length<=1||e.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${e.length}.`),e.length===1)m(e[0]===1||e[0]===_.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${e}) is not compatible with the number of output channels (${_.outChannels}).`);else if(e.length===3)try{H(e,_.outShape)}catch{let t=`Error in fused conv2d: PReLU activation weights (${e}) is not compatible with the output shape of the conv2d (${_.outShape}).`;throw Error(t)}y=M(l,`prelu weights`,`fused conv2d`)}let b=(e,t)=>{m(i===`NHWC`,()=>`Error in gradient of fused conv2D: got dataFormat of ${i} but only NHWC is currently supported.`);let[o,s,l,u]=t,d=Uf(e,l,c);m(ts(a),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${a}'`);let f=[ec(s.shape,d,o,n,r),Hf(s,d,o.shape,n,r)];if(u!=null){let e=Wf(u,d);f.push(e)}return f},x={x:p,filter:f,bias:v,preluActivationWeights:y},S={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o,activation:c,leakyreluAlpha:u};return s==null?$l((e,t,n)=>{let r=j.runKernel(wr,x,S);return n([t,e,r]),h&&(r=V(r,[r.shape[1],r.shape[2],r.shape[3]])),{value:r,gradFunc:b}})(p,f):$l((e,t,n,r)=>{let i=j.runKernel(wr,x,S);return r([t,e,i,n]),h&&(i=V(i,[i.shape[1],i.shape[2],i.shape[3]])),{value:i,gradFunc:b}})(p,f,v)}var Jf=N({fusedConv2d_:qf});function Yf(e,t,n,r,i,a=[1,1],o){let s=e;e.rank===3&&(s=V(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=V(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let l={x:s,dy:c},u={strides:r,pad:i,dimRoundingMode:o,dilations:a,filterShape:n};return j.runKernel(_t,l,u)}var Xf=N({depthwiseConv2dNativeBackpropFilter_:Yf});function Zf(e,t,n,r,i,a=[1,1],o){let s=t,c=!1;t.rank===3&&(c=!0,s=V(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let l={dy:s,filter:n},u={strides:r,pad:i,dimRoundingMode:o,dilations:a,inputShape:e},d=j.runKernel(vt,l,u);return c?V(d,[d.shape[1],d.shape[2],d.shape[3]]):d}var Qf=N({depthwiseConv2dNativeBackpropInput_:Zf});function $f({a:e,b:t,transposeA:n=!1,transposeB:r=!1,bias:i,activation:a=`linear`,preluActivationWeights:o,leakyreluAlpha:s=.2}){if(Kf(j.state.gradientDepth,a)===!1){let c=ms(e,t,n,r);return i!=null&&(c=R(c,i)),Gf(c,a,o,s)}let c=M(e,`a`,`fused matMul`),l=M(t,`b`,`fused matMul`);[c,l]=Bi(c,l);let u=n?c.shape[c.rank-2]:c.shape[c.rank-1],d=r?l.shape[l.rank-1]:l.shape[l.rank-2],f=n?c.shape[c.rank-1]:c.shape[c.rank-2],p=r?l.shape[l.rank-2]:l.shape[l.rank-1],h=c.shape.slice(0,-2),g=l.shape.slice(0,-2),v=_(h),y=_(g);m(u===d,()=>`Error in fused matMul: inner shapes (${u}) and (${d}) of Tensors with shapes ${c.shape} and ${l.shape} and transposeA=${n} and transposeB=${r} must match.`);let b=H(c.shape.slice(0,-2),l.shape.slice(0,-2)).concat([f,p]),x=n?V(c,[v,u,f]):V(c,[v,f,u]),S=r?V(l,[y,p,d]):V(l,[y,d,p]),C;i!=null&&(C=M(i,`bias`,`fused matMul`),[C]=Bi(C,c),H(b,C.shape));let w;o!=null&&(w=M(o,`prelu weights`,`fused matMul`));let T=(e,t)=>{let[o,s,c,l]=t,u=Uf(V(e,c.shape),c,a),d,f;if(!n&&!r?(d=ms(u,s,!1,!0),f=ms(o,u,!0,!1)):!n&&r?(d=ms(u,s,!1,!1),f=ms(u,o,!0,!1)):n&&!r?(d=ms(s,u,!1,!0),f=ms(o,u,!1,!1)):(d=ms(s,u,!0,!0),f=ms(u,o,!0,!0)),i!=null){let e=Wf(l,u);return[d,f,e]}return[d,f]},E={a:x,b:S,bias:C,preluActivationWeights:w},D={transposeA:n,transposeB:r,activation:a,leakyreluAlpha:s};return i==null?$l((e,t,n)=>{let r=j.runKernel(Cr,E,D);return n([e,t,r]),{value:V(r,b),gradFunc:T}})(x,S):$l((e,t,n,r)=>{let i=j.runKernel(Cr,E,D);return r([e,t,i,n]),{value:V(i,b),gradFunc:T}})(x,S,C)}var ep=N({fusedMatMul_:$f});function tp(e,t,n,r,i=`bilinear`,a=0){let o=M(e,`image`,`cropAndResize`),s=M(t,`boxes`,`cropAndResize`,`float32`),c=M(n,`boxInd`,`cropAndResize`,`int32`),l=s.shape[0];m(o.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${o.rank}.`),m(s.rank===2&&s.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${l},4] but had shape ${s.shape}.`),m(c.rank===1&&c.shape[0]===l,()=>`Error in cropAndResize: boxInd must be have size [${l}] but had shape ${s.shape}.`),m(r.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${r.length}.`),m(r[0]>=1&&r[1]>=1,()=>`cropSize must be atleast [1,1], but was ${r}`),m(i===`bilinear`||i===`nearest`,()=>`method must be bilinear or nearest, but was ${i}`);let u={image:o,boxes:s,boxInd:c},d={method:i,extrapolationValue:a,cropSize:r};return j.runKernel(pt,u,d)}var np=N({cropAndResize_:tp});function rp(e){let t=M(e,`image`,`flipLeftRight`,`float32`);m(t.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${t.rank}.`);let n={image:t};return j.runKernel(jt,n,{})}var ip=N({flipLeftRight_:rp});function ap(e){let t=M(e,`image`,`grayscaleToRGB`),n=t.rank-1,r=t.shape[n];m(t.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${t.rank}.`),m(r===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${r}.`);let i=Array(t.rank);return i.fill(1,0,n),i[n]=3,xl(t,i)}var op=N({grayscaleToRGB_:ap});function sp(e){let t=M(e,`image`,`RGBToGrayscale`),n=t.rank-1,r=t.shape[n];m(t.rank>=2,()=>`Error in RGBToGrayscale: images must be at least rank 2, but got rank ${t.rank}.`),m(r===3,()=>`Error in RGBToGrayscale: last dimension of an RGB image should be size 3, but got size ${r}.`);let i=t.dtype,a=L(t,`float32`),o=yf([.2989,.587,.114]),s;switch(t.rank){case 2:s=Rc(`ij,j->i`,a,o);break;case 3:s=Rc(`ijk,k->ij`,a,o);break;case 4:s=Rc(`ijkl,l->ijk`,a,o);break;case 5:s=Rc(`ijklm,m->ijkl`,a,o);break;case 6:s=Rc(`ijklmn,n->ijklm`,a,o);break;default:throw Error(`Not a valid tensor rank.`)}return s=_l(s,-1),L(s,i)}var cp=N({rgbToGrayscale_:sp});function lp(e,t,n=0,r=.5){let i=M(e,`image`,`rotateWithOffset`,`float32`);m(i.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${i.rank}.`);let a={image:i},o={radians:t,fillValue:n,center:r};return j.runKernel(Sr,a,o)}var up=N({rotateWithOffset_:lp});function dp(e,t,n,r,i,a){r??=.5,i??=-1/0,a??=0;let o=e.shape[0];return n=Math.min(n,o),m(0<=r&&r<=1,()=>`iouThreshold must be in [0, 1], but was '${r}'`),m(e.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${e.rank}'`),m(e.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${e.shape[1]}`),m(t.rank===1,()=>`scores must be a 1D tensor`),m(t.shape[0]===o,()=>`scores has incompatible shape with boxes. Expected ${o}, but was ${t.shape[0]}`),m(0<=a&&a<=1,()=>`softNmsSigma must be in [0, 1], but was '${a}'`),{maxOutputSize:n,iouThreshold:r,scoreThreshold:i,softNmsSigma:a}}function fp(e,t,n,r=.5,i=-1/0){let a=M(e,`boxes`,`nonMaxSuppression`,`float32`),o=M(t,`scores`,`nonMaxSuppression`,`float32`),s=dp(a,o,n,r,i);n=s.maxOutputSize,r=s.iouThreshold,i=s.scoreThreshold;let c={maxOutputSize:n,iouThreshold:r,scoreThreshold:i};return j.runKernel(mn,{boxes:a,scores:o},c)}var pp=N({nonMaxSuppression_:fp});function mp(e,t,n){let r=hp(e,t,n),i=r<0?-(r+1):r;e.splice(i,0,t)}function hp(e,t,n){return _p(e,t,n||gp)}function gp(e,t){return e>t?1:e<t?-1:0}function _p(e,t,n){let r=0,i=e.length,a=0,o=!1;for(;r<i;){a=r+(i-r>>>1);let s=n(t,e[a]);s>0?r=a+1:(i=a,o=!s)}return o?r:-r-1}function vp(e,t,n,r,i){return xp(e,t,n,r,i,0)}function yp(e,t,n,r,i,a){return xp(e,t,n,r,i,0,!1,a,!0)}function bp(e,t,n,r,i,a){return xp(e,t,n,r,i,a,!0)}function xp(e,t,n,r,i,a,o=!1,s=!1,c=!1){let l=[];for(let e=0;e<t.length;e++)t[e]>i&&l.push({score:t[e],boxIndex:e,suppressBeginIndex:0});l.sort(wp);let u=a>0?-.5/a:0,d=[],f=[];for(;d.length<n&&l.length>0;){let t=l.pop(),{score:n,boxIndex:a,suppressBeginIndex:o}=t;if(n<i)break;let s=!1;for(let n=d.length-1;n>=o;--n){let o=Sp(e,a,d[n]);if(o>=r){s=!0;break}if(t.score*=Cp(r,u,o),t.score<=i)break}t.suppressBeginIndex=d.length,s||(t.score===n?(d.push(a),f.push(t.score)):t.score>i&&mp(l,t,wp))}let p=d.length,m=n-p;s&&m>0&&(d.push(...Array(m).fill(0)),f.push(...Array(m).fill(0)));let h={selectedIndices:d};return o&&(h.selectedScores=f),c&&(h.validOutputs=p),h}function Sp(e,t,n){let r=e.subarray(t*4,t*4+4),i=e.subarray(n*4,n*4+4),a=Math.min(r[0],r[2]),o=Math.min(r[1],r[3]),s=Math.max(r[0],r[2]),c=Math.max(r[1],r[3]),l=Math.min(i[0],i[2]),u=Math.min(i[1],i[3]),d=Math.max(i[0],i[2]),f=Math.max(i[1],i[3]),p=(s-a)*(c-o),m=(d-l)*(f-u);if(p<=0||m<=0)return 0;let h=Math.max(a,l),g=Math.max(o,u),_=Math.min(s,d),v=Math.min(c,f),y=Math.max(_-h,0)*Math.max(v-g,0);return y/(p+m-y)}function Cp(e,t,n){let r=Math.exp(t*n*n);return n<=e?r:0}function wp(e,t){return e.score-t.score||e.score===t.score&&t.boxIndex-e.boxIndex}async function Tp(e,t,n,r=.5,i=-1/0){let a=M(e,`boxes`,`nonMaxSuppressionAsync`),o=M(t,`scores`,`nonMaxSuppressionAsync`),s=dp(a,o,n,r,i);n=s.maxOutputSize,r=s.iouThreshold,i=s.scoreThreshold;let c=await Promise.all([a.data(),o.data()]),l=c[0],u=c[1],{selectedIndices:d}=vp(l,u,n,r,i);return a!==e&&a.dispose(),o!==t&&o.dispose(),yf(d,`int32`)}var Ep=Tp;function Dp(e,t,n,r=.5,i=-1/0,a=0){let o=M(e,`boxes`,`nonMaxSuppression`),s=M(t,`scores`,`nonMaxSuppression`),c=dp(o,s,n,r,i,a);n=c.maxOutputSize,r=c.iouThreshold,i=c.scoreThreshold,a=c.softNmsSigma;let l={boxes:o,scores:s},u={maxOutputSize:n,iouThreshold:r,scoreThreshold:i,softNmsSigma:a},d=j.runKernel(gn,l,u);return{selectedIndices:d[0],selectedScores:d[1]}}var Op=N({nonMaxSuppressionWithScore_:Dp});async function kp(e,t,n,r=.5,i=-1/0,a=0){let o=M(e,`boxes`,`nonMaxSuppressionAsync`),s=M(t,`scores`,`nonMaxSuppressionAsync`),c=dp(o,s,n,r,i,a);n=c.maxOutputSize,r=c.iouThreshold,i=c.scoreThreshold,a=c.softNmsSigma;let l=await Promise.all([o.data(),s.data()]),u=l[0],d=l[1],{selectedIndices:f,selectedScores:p}=bp(u,d,n,r,i,a);return o!==e&&o.dispose(),s!==t&&s.dispose(),{selectedIndices:yf(f,`int32`),selectedScores:yf(p)}}var Ap=kp;function jp(e,t,n,r=.5,i=-1/0,a=!1){let o=M(e,`boxes`,`nonMaxSuppression`),s=M(t,`scores`,`nonMaxSuppression`),c=dp(o,s,n,r,i,null),l=c.maxOutputSize,u=c.iouThreshold,d=c.scoreThreshold,f={boxes:o,scores:s},p={maxOutputSize:l,iouThreshold:u,scoreThreshold:d,padToMaxOutputSize:a},m=j.runKernel(hn,f,p);return{selectedIndices:m[0],validOutputs:m[1]}}var Mp=N({nonMaxSuppressionPadded_:jp});async function Np(e,t,n,r=.5,i=-1/0,a=!1){let o=M(e,`boxes`,`nonMaxSuppressionAsync`),s=M(t,`scores`,`nonMaxSuppressionAsync`),c=dp(o,s,n,r,i,null),l=c.maxOutputSize,u=c.iouThreshold,d=c.scoreThreshold,[f,p]=await Promise.all([o.data(),s.data()]),{selectedIndices:m,validOutputs:h}=yp(f,p,l,u,d,a);return o!==e&&o.dispose(),s!==t&&s.dispose(),{selectedIndices:yf(m,`int32`),validOutputs:rl(h,`int32`)}}var Pp=Np;function Fp(e,t,n=!1,r=!1){let i=M(e,`images`,`resizeBilinear`);m(i.rank===3||i.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${i.rank}.`),m(t.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${t}.`),m(r===!1||n===!1,()=>`Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.`);let a=i,o=!1;i.rank===3&&(o=!0,a=V(i,[1,i.shape[0],i.shape[1],i.shape[2]]));let[]=t,s={images:a},c={alignCorners:n,halfPixelCenters:r,size:t},l=j.runKernel(Nn,s,c);return o?V(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var Ip=N({resizeBilinear_:Fp});function Lp(e,t,n=!1,r=!1){let i=M(e,`images`,`resizeNearestNeighbor`);m(i.rank===3||i.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${i.rank}.`),m(t.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${t}.`),m(i.dtype===`float32`||i.dtype===`int32`,()=>"`images` must have `int32` or `float32` as dtype"),m(r===!1||n===!1,()=>`Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.`);let a=i,o=!1;i.rank===3&&(o=!0,a=V(i,[1,i.shape[0],i.shape[1],i.shape[2]]));let[]=t,s={images:a},c={alignCorners:n,halfPixelCenters:r,size:t},l=j.runKernel(jn,s,c);return o?V(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var Rp=N({resizeNearestNeighbor_:Lp});function zp(e,t=`binary`,n=!1,r=.5){let i=M(e,`image`,`threshold`),a=i.shape[0]*i.shape[1],o=B(yf([r]),255),s,c,l,u;if(m(i.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${i.rank}.`),m(i.shape[2]===3||i.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${i.shape[2]}.`),m(i.dtype===`int32`||i.dtype===`float32`,()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${i.dtype}.`),m(t===`otsu`||t===`binary`,()=>`Method must be binary or otsu, but was ${t}`),i.shape[2]===3){[s,c,l]=rf(i,[1,1,1],-1);let e=B(s,.2989),t=B(c,.587),n=B(l,.114);u=R(R(e,t),n)}else u=e;return t===`otsu`&&(o=Bp(Ns(L(Dd(u),`int32`),ua([]),256),a)),L(B(n?Gl(u,o):kl(u,o),255),`int32`)}function Bp(e,t){let n=yf([-1]),r=yf([0]),i=yf([0]),a,o,s,c,l,u;for(let d=0;d<e.size-1;d++){a=vs(e,0,d+1),o=vs(e,d+1),l=z(U(a),t),u=z(U(o),t),s=z(U(B(a,hd(0,a.size))),U(a));let f=Rs(o.shape,a.size),p=R(hd(0,o.size),f);c=z(U(B(o,p)),U(o));let m=W(s,c),h=W(s,c);i=B(B(B(l,u),m),h);let g=kl(i,r);r=Ac(g,i,r),n=Ac(g,yf([d]),n)}return n}var Vp=N({threshold_:zp});function Hp(e,t,n=`nearest`,r=`constant`,i=0,a){let o=M(e,`image`,`transform`,`float32`),s=M(t,`transforms`,`transform`,`float32`);m(o.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${o.rank}.`),m(s.rank===2&&(s.shape[0]===o.shape[0]||s.shape[0]===1)&&s.shape[1]===8,()=>`Error in transform: Input transform should be batch x 8 or 1 x 8`),m(a==null||a.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${a}.`);let c={image:o,transforms:s},l={interpolation:n,fillMode:r,fillValue:i,outputShape:a};return j.runKernel(mr,c,l)}var Up=N({transform_:Hp});function Wp(e,t,n){let r=M(e,`a`,`bandPart`);m(r.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${r.rank}.`);let i=r.shape,[a,o]=r.shape.slice(-2),s,c;typeof t==`number`?(m(t%1==0,()=>`bandPart(): numLower must be an integer, got ${t}.`),m(t<=a,()=>`bandPart(): numLower (${t}) must not be greater than the number of rows (${a}).`),s=M(t<0?a:t,`numLower`,`bandPart`)):(m(t.dtype===`int32`,()=>`bandPart(): numLower's dtype must be an int32.`),s=Ac(Ul(t,0),a,Au(t,a))),typeof n==`number`?(m(n%1==0,()=>`bandPart(): numUpper must be an integer, got ${n}.`),m(n<=o,()=>`bandPart(): numUpper (${n}) must not be greater than the number of columns (${o}).`),c=M(n<0?o:n,`numUpper`,`bandPart`)):(m(n.dtype===`int32`,()=>`bandPart(): numUpper's dtype must be an int32.`),c=Ac(Ul(n,0),o,Au(n,o)));let l=W(V(hd(0,a,1,`int32`),[-1,1]),hd(0,o,1,`int32`)),u=fu(Gl(l,s),jl(l,tu(c))),d=Du([a,o],r.dtype);return V(ff(Nf(V(r,[-1,a,o])).map(e=>Ac(u,e,d))),i)}var Gp=N({bandPart_:Wp});function Kp(e){let t;if(Array.isArray(e)){t=!1,m(e!=null&&e.length>0,()=>`Gram-Schmidt process: input must not be null, undefined, or empty`);let n=e[0].shape[0];for(let t=1;t<e.length;++t)m(e[t].shape[0]===n,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${e[t].shape[0]} vs. ${n})`)}else t=!0,e=rf(e,e.shape[0],0).map(e=>uf(e,[0]));m(e.length<=e[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${e.length}) exceeds number of dimensions (${e[0].shape[0]}).`);let n=[],r=e;for(let t=0;t<e.length;++t)n.push(j.tidy(()=>{let e=r[t];if(t>0)for(let r=0;r<t;++r){let t=B(U(B(n[r],e)),n[r]);e=W(e,t)}return z(e,dl(e,`euclidean`))}));return t?ff(n,0):n}var qp=N({gramSchmidt_:Kp});function Jp(e,t=!1){if(m(e.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${e.rank}`),e.rank===2)return Yp(e,t);{let n=Nf(V(e,[e.shape.slice(0,e.shape.length-2).reduce((e,t)=>e*t),e.shape[e.shape.length-2],e.shape[e.shape.length-1]]),0),r=[],i=[];return n.forEach(e=>{let[n,a]=Yp(e,t);r.push(n),i.push(a)}),[V(ff(r,0),e.shape),V(ff(i,0),e.shape)]}}function Yp(e,t=!1){return j.tidy(()=>{m(e.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${e.shape.length}D Tensor.`);let n=e.shape[0],r=e.shape[1],i=Cl(n),a=lo(e),o=bf([[1]],[1,1]),s=lo(o),c=n>=r?r:n;for(let e=0;e<c;++e){let t=a,c=s,l=i;[s,a,i]=j.tidy(()=>{let t=vs(a,[e,e],[n-e,1]),c=dl(t),l=vs(a,[e,e],[1,1]),u=Ac(kl(l,0),bf([[-1]]),bf([[1]])),d=W(l,B(u,c)),f=z(t,d);s=f.shape[0]===1?lo(o):fs([o,vs(f,[1,0],[f.shape[0]-1,f.shape[1]])],0);let p=tu(z(ms(u,d),c)),m=vs(a,[e,0],[n-e,r]),h=B(p,s),g=Lf(s);if(e===0)a=W(m,ms(h,ms(g,m)));else{let t=W(m,ms(h,ms(g,m)));a=fs([vs(a,[0,0],[e,r]),t],0)}let _=Lf(h),v=vs(i,[0,e],[n,i.shape[1]-e]);if(e===0)i=W(v,ms(ms(v,s),_));else{let t=W(v,ms(ms(v,s),_));i=fs([vs(i,[0,0],[n,e]),t],1)}return[s,a,i]}),F([t,c,l])}return!t&&n>r&&(i=vs(i,[0,0],[n,r]),a=vs(a,[0,0],[r,r])),[i,a]})}var Xp=N({qr_:Jp}),Zp={flipLeftRight:ip,grayscaleToRGB:op,resizeNearestNeighbor:Rp,resizeBilinear:Ip,rgbToGrayscale:cp,rotateWithOffset:up,cropAndResize:np,nonMaxSuppression:pp,nonMaxSuppressionAsync:Ep,nonMaxSuppressionWithScore:Op,nonMaxSuppressionWithScoreAsync:Ap,nonMaxSuppressionPadded:Mp,nonMaxSuppressionPaddedAsync:Pp,threshold:Vp,transform:Up},Qp={bandPart:Gp,gramSchmidt:qp,qr:Xp},$p=new Map,em=new Map,tm=class{getClassName(){return this.constructor.className}static fromConfig(e,t){return new e(t)}},nm=class e{constructor(){this.classNameMap={}}static getMap(){return e.instance??=new e,e.instance}static register(t){e.getMap().classNameMap[t.className]=[t,t.fromConfig]}};function G(e,t,n){m(e.className!=null,()=>`Class being registered does not have the static className property defined.`),m(typeof e.className==`string`,()=>`className is required to be a string, but got type `+typeof e.className),m(e.className.length>0,()=>`Class being registered has an empty-string as its className, which is disallowed.`),t===void 0&&(t=`Custom`),n===void 0&&(n=e.className);let r=n,i=t+`>`+r;return nm.register(e),$p.set(i,e),em.set(e,i),e}var rm=class extends tm{minimize(e,t=!1,n){let{value:r,grads:i}=this.computeGradients(e,n);if(n!=null){let e=n.map(e=>({name:e.name,tensor:i[e.name]}));this.applyGradients(e)}else this.applyGradients(i);return F(i),t?r:(r.dispose(),null)}get iterations(){return this.iterations_??=0,this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(e,t){return Ql(e,t)}dispose(){this.iterations_!=null&&F(this.iterations_)}async saveIterations(){return this.iterations_??=0,{name:`iter`,tensor:rl(this.iterations_,`int32`)}}async getWeights(){throw Error(`getWeights() is not implemented for this optimizer yet.`)}async setWeights(e){throw Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)}async extractIterations(e){return this.iterations_=(await e[0].tensor.data())[0],e.slice(1)}};Object.defineProperty(rm,Symbol.hasInstance,{value:e=>e.minimize!=null&&e.computeGradients!=null&&e.applyGradients!=null});var im=class extends rm{static get className(){return`Adadelta`}constructor(e,t,n=null){super(),this.learningRate=e,this.rho=t,this.epsilon=n,this.accumulatedGrads=[],this.accumulatedUpdates=[],n??(this.epsilon=j.backend.epsilon())}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=j.registeredVariables[t];this.accumulatedGrads[n]??(this.accumulatedGrads[n]={originalName:`${t}/accum_grad`,variable:P(()=>Mc(r).variable(!1))}),this.accumulatedUpdates[n]??(this.accumulatedUpdates[n]={originalName:`${t}/accum_var`,variable:P(()=>Mc(r).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedGrads[n].variable,o=this.accumulatedUpdates[n].variable;P(()=>{let e=R(B(a,this.rho),B(sl(i),1-this.rho)),t=B(z(al(R(o,this.epsilon)),al(R(a,this.epsilon))),i),n=R(B(o,this.rho),B(sl(t),1-this.rho));a.assign(e),o.assign(n);let s=R(B(t,-this.learningRate),r);r.assign(s)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(F(this.accumulatedGrads.map(e=>e.variable)),F(this.accumulatedUpdates.map(e=>e.variable)))}async getWeights(){let e=[...this.accumulatedGrads,...this.accumulatedUpdates];return[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);let t=e.length/2;this.accumulatedGrads=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedUpdates=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.rho,t.epsilon)}},am=class extends rm{static get className(){return`Adagrad`}constructor(e,t=.1){super(),this.learningRate=e,this.initialAccumulatorValue=t,this.accumulatedGrads=[]}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=j.registeredVariables[t];this.accumulatedGrads[n]??(this.accumulatedGrads[n]={originalName:`${t}/accumulator`,variable:P(()=>Rs(r.shape,this.initialAccumulatorValue).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedGrads[n].variable;P(()=>{let e=R(a,sl(i));a.assign(e);let t=R(B(z(i,al(R(e,j.backend.epsilon()))),-this.learningRate),r);r.assign(t)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&F(this.accumulatedGrads.map(e=>e.variable))}async getWeights(){return[await this.saveIterations()].concat(this.accumulatedGrads.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),this.accumulatedGrads=e.map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(e,t){return new e(t.learningRate,t.initialAccumulatorValue)}},om=class extends rm{static get className(){return`Adam`}constructor(e,t,n,r=null){super(),this.learningRate=e,this.beta1=t,this.beta2=n,this.epsilon=r,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],P(()=>{this.accBeta1=rl(t).variable(),this.accBeta2=rl(n).variable()}),r??(this.epsilon=j.backend.epsilon())}applyGradients(e){let t=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);P(()=>{let n=W(1,this.accBeta1),r=W(1,this.accBeta2);t.forEach((t,i)=>{let a=j.registeredVariables[t];this.accumulatedFirstMoment[i]??(this.accumulatedFirstMoment[i]={originalName:`${t}/m`,variable:P(()=>Mc(a).variable(!1))}),this.accumulatedSecondMoment[i]??(this.accumulatedSecondMoment[i]={originalName:`${t}/v`,variable:P(()=>Mc(a).variable(!1))});let o=Array.isArray(e)?e[i].tensor:e[t];if(o==null)return;let s=this.accumulatedFirstMoment[i].variable,c=this.accumulatedSecondMoment[i].variable,l=R(B(s,this.beta1),B(o,1-this.beta1)),u=R(B(c,this.beta2),B(sl(o),1-this.beta2)),d=z(l,n),f=z(u,r);s.assign(l),c.assign(u);let p=R(B(z(d,R(al(f),this.epsilon)),-this.learningRate),a);a.assign(p)}),this.accBeta1.assign(B(this.accBeta1,this.beta1)),this.accBeta2.assign(B(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&F(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedSecondMoment!=null&&F(this.accumulatedSecondMoment.map(e=>e.variable))}async getWeights(){let e=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),P(()=>{this.accBeta1.assign(nl(this.beta1,this.iterations_+1)),this.accBeta2.assign(nl(this.beta2,this.iterations_+1))});let t=e.length/2;this.accumulatedFirstMoment=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedSecondMoment=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon)}},sm=class extends rm{static get className(){return`Adamax`}constructor(e,t,n,r=null,i=0){super(),this.learningRate=e,this.beta1=t,this.beta2=n,this.epsilon=r,this.decay=i,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],P(()=>{this.iteration=rl(0).variable(),this.accBeta1=rl(t).variable()}),r??(this.epsilon=j.backend.epsilon())}applyGradients(e){let t=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);P(()=>{let n=W(1,this.accBeta1),r=z(-this.learningRate,R(B(this.iteration,this.decay),1));t.forEach((t,i)=>{let a=j.registeredVariables[t];this.accumulatedFirstMoment[i]??(this.accumulatedFirstMoment[i]={originalName:`${t}/m`,variable:Mc(a).variable(!1)}),this.accumulatedWeightedInfNorm[i]??(this.accumulatedWeightedInfNorm[i]={originalName:`${t}/v`,variable:Mc(a).variable(!1)});let o=Array.isArray(e)?e[i].tensor:e[t];if(o==null)return;let s=this.accumulatedFirstMoment[i].variable,c=this.accumulatedWeightedInfNorm[i].variable,l=R(B(s,this.beta1),B(o,1-this.beta1)),u=wu(B(c,this.beta2),vo(o));s.assign(l),c.assign(u);let d=R(B(z(r,n),z(l,R(u,this.epsilon))),a);a.assign(d)}),this.iteration.assign(R(this.iteration,1)),this.accBeta1.assign(B(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&F(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedWeightedInfNorm!=null&&F(this.accumulatedWeightedInfNorm.map(e=>e.variable))}async getWeights(){throw Error(`getWeights() is not implemented for Adamax yet.`)}async setWeights(e){throw Error(`setWeights() is not implemented for Adamax yet.`)}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon,t.decay)}},cm=class extends rm{static get className(){return`SGD`}constructor(e){super(),this.learningRate=e,this.setLearningRate(e)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=Array.isArray(e)?e[n].tensor:e[t];if(r==null)return;let i=j.registeredVariables[t];P(()=>{let e=R(B(this.c,r),i);i.assign(e)})}),this.incrementIterations()}setLearningRate(e){this.learningRate=e,this.c!=null&&this.c.dispose(),this.c=ha(rl(-e))}dispose(){this.c.dispose()}async getWeights(){return[await this.saveIterations()]}async setWeights(e){if(e=await this.extractIterations(e),e.length!==0)throw Error(`SGD optimizer does not have settable weights.`)}getConfig(){return{learningRate:this.learningRate}}static fromConfig(e,t){return new e(t.learningRate)}},lm=class extends cm{static get className(){return`Momentum`}constructor(e,t,n=!1){super(e),this.learningRate=e,this.momentum=t,this.useNesterov=n,this.accumulations=[],this.m=rl(this.momentum)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=j.registeredVariables[t];this.accumulations[n]??(this.accumulations[n]={originalName:`${t}/momentum`,variable:P(()=>Mc(r).variable(!1))});let i=this.accumulations[n].variable,a=Array.isArray(e)?e[n].tensor:e[t];a!=null&&P(()=>{let e,t=R(B(this.m,i),a);e=this.useNesterov?R(B(this.c,R(a,B(t,this.m))),r):R(B(this.c,t),r),i.assign(t),r.assign(e)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&F(this.accumulations.map(e=>e.variable))}setMomentum(e){this.momentum=e}async getWeights(){return[await this.saveIterations()].concat(this.accumulations.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),this.accumulations=e.map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(e,t){return new e(t.learningRate,t.momentum,t.useNesterov)}},um=class extends rm{static get className(){return`RMSProp`}constructor(e,t=.9,n=0,r=null,i=!1){if(super(),this.learningRate=e,this.decay=t,this.momentum=n,this.epsilon=r,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=i,r??(this.epsilon=j.backend.epsilon()),e==null)throw Error(`learningRate for RMSPropOptimizer must be defined.`)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=j.registeredVariables[t];this.accumulatedMeanSquares[n]??(this.accumulatedMeanSquares[n]={originalName:`${t}/rms`,variable:P(()=>Mc(r).variable(!1))}),this.accumulatedMoments[n]??(this.accumulatedMoments[n]={originalName:`${t}/momentum`,variable:P(()=>Mc(r).variable(!1))}),this.accumulatedMeanGrads[n]==null&&this.centered&&(this.accumulatedMeanGrads[n]={originalName:`${t}/mg`,variable:P(()=>Mc(r).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedMeanSquares[n].variable,o=this.accumulatedMoments[n].variable;P(()=>{let e=R(B(a,this.decay),B(sl(i),1-this.decay));if(this.centered){let t=this.accumulatedMeanGrads[n].variable,s=R(B(t,this.decay),B(i,1-this.decay)),c=z(B(i,this.learningRate),al(W(e,R(sl(s),this.epsilon)))),l=R(B(o,this.momentum),c);a.assign(e),t.assign(s),o.assign(l);let u=W(r,l);r.assign(u)}else{let e=R(B(a,this.decay),B(sl(i),1-this.decay)),t=R(B(o,this.momentum),z(B(i,this.learningRate),al(R(e,this.epsilon))));a.assign(e),o.assign(t);let n=W(r,t);r.assign(n)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&F(this.accumulatedMeanSquares.map(e=>e.variable)),this.accumulatedMeanGrads!=null&&this.centered&&F(this.accumulatedMeanGrads.map(e=>e.variable)),this.accumulatedMoments!=null&&F(this.accumulatedMoments.map(e=>e.variable))}async getWeights(){let e=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&e.push(...this.accumulatedMeanGrads),[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);let t=this.centered?e.length/3:e.length/2;this.accumulatedMeanSquares=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedMoments=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.centered&&(this.accumulatedMeanGrads=e.slice(t*2,t*3).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})))}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(e,t){return new e(t.learningRate,t.decay,t.momentum,t.epsilon,t.centered)}},dm=[im,am,om,sm,lm,um,cm];function fm(){for(let e of dm)G(e)}function pm(e,t){let n=e.shape.length,r=t.shape.length;if(n<1)throw Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${n}.`);if(r<1)throw Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${r}.`);if(t.dtype!==`int32`)throw Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${t.dtype}.`);if(t.shape[r-1]>n)throw Error(`index innermost dimension length must be <= tensor rank; saw: ${t.shape[r-1]} vs. ${n}`);if(_(e.shape)===0)throw Error(`Requested more than 0 entries, but input is empty. Input shape: ${e.shape}.`);let i=t.shape,a=i[i.length-1],o=1;for(let e=0;e<i.length-1;++e)o*=i[e];let s=e.shape,c=i.slice();c.pop();let l=1;for(let e=a;e<n;++e)l*=s[e],c.push(s[e]);let u=[...O(e.shape).map(e=>e/l),1].slice(0,a);return[c,o,l,u]}var mm=t({assertParamsValid:()=>_m,computeFlatOffset:()=>Am,computeOutShape:()=>ym,getNormalizedAxes:()=>Cm,isSliceContinous:()=>km,maskToAxes:()=>vm,parseSliceParams:()=>jm,sliceInfo:()=>Mm,startForAxis:()=>Dm,startIndicesWithElidedDims:()=>wm,stopForAxis:()=>Om,stopIndicesWithElidedDims:()=>Tm,stridesForAxis:()=>Em,stridesWithElidedDims:()=>bm}),hm=-2,gm=-1;function _m(e,t,n){let r=e.shape.length;m(r===t.length,()=>`Error in slice${r}D: Length of begin ${t} must match the rank of the array (${r}).`),m(r===n.length,()=>`Error in slice${r}D: Length of size ${n} must match the rank of the array (${r}).`);for(let i=0;i<r;++i)m(t[i]+n[i]<=e.shape[i],()=>`Error in slice${r}D: begin[${i}] + size[${i}] (${t[i]+n[i]}) would overflow input.shape[${i}] (${e.shape[i]})`)}function vm(e){let t=[],n=0;for(;e>0;)e&1&&t.push(n),e/=2,n++;return t}function ym(e,t,n){let r=[];for(let i=0;i<e.length;i++)r[i]=Math.ceil((t[i]-e[i])/n[i]);return r}function bm(e,t,n,r){let i=[...e];for(let e=i.length;e<r.length;e++)i.push(1);for(let e=0;e<n;e++)e===0?i[t]=1:(i.splice(t,0,1),i.pop());return i}function xm(e,t,n){return n<=e?n:n-(t-1)}function Sm(e,t){let n=[];for(let r=0;r<e;r++)n.push(t+r);return n}function Cm(e,t,n,r,i,a,o,s,c){let l=e.length,u=Array(l),d=Array(l),f=Array(l);if(t.length&&n>0){let c=t[0],l=n+1;u=wm(o,c,l,r,e),d=Tm(s,c,l,i,e),f=bm(a,c,l,e)}else for(let t=0;t<l;t++)u[t]=Dm(o,r,a,e,t,c),d[t]=Om(s,i,a,e,t,c),f[t]=Em(a,t,c);return{begin:u,end:d,strides:f}}function wm(e,t,n,r,i){let a=[...i],o=Sm(n,t);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=0;else{let o=xm(t,n,i),s=r[o];e&1<<o&&(s=0),a[i]=s}return a}function Tm(e,t,n,r,i){let a=[...i],o=Sm(n,t);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=2**53-1;else{let o=xm(t,n,i),s=r[o];e&1<<o&&(s=2**53-1),a[i]=s}for(let e=0;e<a.length;e++){let t=i[e];a[e]<0&&(a[e]+=t),a[e]=u(0,a[e],i[e])}return a}function Em(e,t,n){let r=e[t];return(n&1<<t||r==null)&&(r=1),r}function Dm(e,t,n,r,i,a){let o=t[i],s=n[i]||1;(e&1<<i||a&1<<i||o==null)&&(o=s>0?-(2**53-1):2**53-1);let c=r[i];return o<0&&(o+=c),o=u(0,o,c-1),o}function Om(e,t,n,r,i,a){let o=t[i],s=n[i]||1;(e&1<<i||a&1<<i||o==null)&&(o=s>0?2**53-1:-(2**53-1));let c=r[i];return o<0&&(o+=c),o=s>0?u(0,o,c):u(-1,o,c-1),o}function km(e,t,n){let r=n.length;for(let e=0;e<n.length;e++)if(n[e]>1){r=e;break}for(let i=r+1;i<n.length;i++)if(t[i]>0||n[i]!==e[i])return!1;return!0}function Am(e,t){let n=e.length>0?e[e.length-1]:1;for(let r=0;r<e.length-1;r++)n+=e[r]*t[r];return n}function jm(e,t,n){let r,i=e.shape.length;r=typeof t==`number`?[t,...Array(i-1).fill(0)]:t.length<i?t.concat(Array(i-t.length).fill(0)):t.slice(),r.forEach(e=>{m(e!==-1,()=>`slice() does not support negative begin indexing.`)});let a;return a=n==null?Array(i).fill(-1):typeof n==`number`?[n,...Array(i-1).fill(-1)]:n.length<i?n.concat(Array(i-n.length).fill(-1)):n,a=a.map((t,n)=>t>=0?t:(m(t===-1,()=>`Negative size values should be exactly -1 but got ${t} for the slice() size at index ${n}.`),e.shape[n]-r[n])),[r,a]}function Mm(e,t,n,r,i,a,o,s,c){let l;if(r==null?(l=Array(t.length),l.fill(1)):l=r,o!=null&&o&o-1)throw Error(`Multiple ellipses in slice is not allowed.`);let u=!1,d={dims:l.length,numAddAxisAfterEllipsis:0,begin:t.slice(),end:n.slice(),strides:l.slice(),beginMask:i,endMask:a,ellipsisMask:o,newAxisMask:s,shrinkAxisMask:c};for(let e=0;e<d.dims;e++)u&&1<<e&s&&d.numAddAxisAfterEllipsis++,1<<e&o&&(u=!0);u||(d.ellipsisMask|=1<<d.dims,d.dims++);let f={dims:e.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};Nm(d,f);let p=!0,m=!0,h=!0,g=[],_=[];for(let t=0;t<e.length;++t){if(f.strides[t]===0)throw Error(`strides[${t}] must be non-zero`);let n=!!(f.shrinkAxisMask&1<<t),r=e[t];if(r===-1){g.push(n?1:-1);continue}let i=[f.beginMask&1<<t,f.endMask&1<<t],a=[f.strides[t]>0?0:-1,f.strides[t]>0?r:r-1];if(n&&f.strides[t]<=0)throw Error(`only stride 1 allowed on non-range indexing.`);h&&=f.strides[t]===1;let o=!!(f.beginMask&1<<t&&f.endMask&1<<t);if(f.beginValid&&f.endValid){if(n){let e=f.begin[t]<0?r+f.begin[t]:f.begin[t];if(f.begin[t]=e,f.end[t]=f.begin[t]+1,e<0||e>=r)throw Error(`slice index ${f.begin[t]} of dimension ${t} out of bounds.`)}else f.begin[t]=Pm(f.begin[t],0,f.strides[t],r,i,a),f.end[t]=Pm(f.end[t],1,f.strides[t],r,i,a);let e=f.strides[t]===1&&f.begin[t]===0&&f.end[t]===r;p&&=e,m&&=t===0&&f.strides[t]===1||e}else p=p&&f.strides[t]===1&&o,m&&=t===0&&f.strides[t]===1||o;let s,c=!1;if(f.beginValid&&f.endValid?(s=f.end[t]-f.begin[t],c=!0):n?(s=1,c=!0):o&&r>=0&&(s=f.strides[t]<0?-r:r,c=!0),c){let e;e=s===0||s<0!=f.strides[t]<0?0:Math.trunc(s/f.strides[t])+(s%f.strides[t]===0?0:1),g.push(e)}else g.push(-1)}for(let e=0;e<f.finalShapeGatherIndices.length;++e){let t=f.finalShapeGatherIndices[e];t>=0?_.push(g[t]):t===hm&&_.push(1)}return{finalShapeSparse:_.filter((e,t)=>f.finalShapeGatherIndices[t]!==hm),finalShape:_,isIdentity:p,sliceDim0:m,isSimpleSlice:h,begin:f.begin,end:f.end,strides:f.strides}}function Nm(e,t){t.beginMask=0,t.endMask=0,t.shrinkAxisMask=0;let n=0;t.beginValid=e.begin!=null,t.endValid=e.end!=null,t.begin=Array(t.dims),t.end=Array(t.dims),t.strides=Array(t.dims),t.finalShapeGatherIndices=[],t.finalShapeGatherIndicesSparse=[],t.inputShapeGatherIndicesSparse=Array(t.dims);for(let r=0;r<e.dims;r++)if(1<<r&e.ellipsisMask){let i=Math.min(t.dims-(e.dims-r)+1+e.numAddAxisAfterEllipsis,t.dims);for(;n<i;n++)t.begin[n]=0,t.end[n]=0,t.strides[n]=1,t.beginMask|=1<<n,t.endMask|=1<<n,t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(-1),t.inputShapeGatherIndicesSparse[n]=r}else if(1<<r&e.newAxisMask)t.finalShapeGatherIndices.push(hm),t.finalShapeGatherIndicesSparse.push(-1);else{if(n===t.begin.length)throw Error(`Index out of range using input dim ${n}; input has only ${t.dims} dims, ${t.begin.length}.`);e.begin!=null&&(t.begin[n]=e.begin[r]),e.end!=null&&(t.end[n]=e.end[r]),t.strides[n]=e.strides[r],e.beginMask&1<<r&&(t.beginMask|=1<<n),e.endMask&1<<r&&(t.endMask|=1<<n),e.shrinkAxisMask&1<<r?(t.finalShapeGatherIndices.push(gm),t.finalShapeGatherIndicesSparse.push(-1),t.shrinkAxisMask|=1<<n):(t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(r)),t.inputShapeGatherIndicesSparse[n]=r,n++}}function Pm(e,t,n,r,i,a){if(i[t])return n>0?a[t]:a[t+1&1];{let t=e<0?r+e:e;return t<a[0]?a[0]:t>a[1]?a[1]:t}}var Fm=class{static sgd(e){return new cm(e)}static momentum(e,t,n=!1){return new lm(e,t,n)}static rmsprop(e,t=.9,n=0,r=null,i=!1){return new um(e,t,n,r,i)}static adam(e=.001,t=.9,n=.999,r=null){return new om(e,t,n,r)}static adadelta(e=.001,t=.95,n=null){return new im(e,t,n)}static adamax(e=.002,t=.9,n=.999,r=null,i=0){return new sm(e,t,n,r,i)}static adagrad(e,t=.1){return new am(e,t)}},Im=typeof requestAnimationFrame<`u`?requestAnimationFrame:typeof setImmediate<`u`?setImmediate:e=>e();function Lm(){return new Promise(e=>Im(()=>e()))}function Rm(e,t){let n=e[0].length;e.forEach((e,t)=>{m(e.length===n,()=>`Error in concat${n}D: rank of tensors[${t}] must be the same as the rank of the rest (${n})`)}),m(t>=0&&t<n,()=>`Error in concat${n}D: axis must be between 0 and ${n-1}.`);let r=e[0];e.forEach((e,i)=>{for(let a=0;a<n;a++)m(a===t||e[a]===r[a],()=>`Error in concat${n}D: Shape of tensors[${i}] (${e}) does not match the shape of the rest (${r}) along the non-concatenated axis ${i}.`)})}function zm(e,t){let n=e[0].slice();for(let r=1;r<e.length;r++)n[t]+=e[r][t];return n}var Bm;(function(e){e[e.FIRST_DIM_SIZE=0]=`FIRST_DIM_SIZE`,e[e.VALUE_ROWIDS=1]=`VALUE_ROWIDS`,e[e.ROW_LENGTHS=2]=`ROW_LENGTHS`,e[e.ROW_SPLITS=3]=`ROW_SPLITS`,e[e.ROW_LIMITS=4]=`ROW_LIMITS`,e[e.ROW_STARTS=5]=`ROW_STARTS`})(Bm||={});function Vm(e,t,n){let r=[];if(n==null&&t==null)return r;if(t==null)for(;r.length<e+n.length;)r.push(-1);else r=t.slice();if(n==null)return r;if(e+n.length!==r.length)throw Error(`rt input.shape and shape=${t} are incompatible: rt input.rank = ${e+n.length}, but shape.rank = ${r.length}`);for(let i=1;i<n.length;++i){let a=n[i],o=r[r.length-n.length+i],s=r[o];if(a>=0)if(s>=0){if(s!==a)throw Error(`rt input.shape and shape=${t} are incompatible: rt input.shape[${i+e}] = ${a} but shape[${i+e}] = ${s}`)}else r[o]=a}return r}function Hm(e){let t={FIRST_DIM_SIZE:Bm.FIRST_DIM_SIZE,VALUE_ROWIDS:Bm.VALUE_ROWIDS,ROW_LENGTHS:Bm.ROW_LENGTHS,ROW_SPLITS:Bm.ROW_SPLITS,ROW_LIMITS:Bm.ROW_LIMITS,ROW_STARTS:Bm.ROW_STARTS},n=[];for(let r of e)if(r in t)n.push(t[r]);else break;return n}function Um(e){return e.length===0?0:e[0]===Bm.FIRST_DIM_SIZE?e.length-1:e.length}function Wm(e,t){if(e==null||t==null)return;let n=e.length,r=t.length;if(n>=r)throw Error(`defaultValue.shape=${e} and ragged tensor flatValues.shape=${t}, are incompatible: defaultValue.rank = ${n} must be less than ragged tensor input flatValues.rank = ${r})`);for(let i=0;i<Math.min(n,r-1);++i){let n=e[i],r=t[i+1];if(n>=0&&r>=0&&n!==1&&n!==r)throw Error(`defaultValue.shape=${e}, and ragged tensor input flatValues.shape=${t} are incompatible: defaultValue.shape[${i-e.length}] = ${n} but ragged tensor input.flatValues.shape[${i-e.length}] = ${r}`)}}function Gm(e){return e<=30?e:ue(e,Math.floor(Math.sqrt(e)))}function Km(e,t,n){return[n*(typeof e==`number`?e:e[0]),t*(typeof e==`number`?e:e[1])]}function qm(e,t,n,r=!0){let i=[];if(r)i=i.concat(t.slice(0)),i.push(e[0]/n),i=i.concat(e.slice(1));else{i=i.concat(e[0]);let n=t.length;for(let r=0;r<n;++r)i=i.concat([e[r+1]/t[r],t[r]]);i=i.concat(e.slice(n+1))}return i}function Jm(e,t,n=!0){let r=[];if(n){r.push(t);for(let n=t+1;n<e;++n)n<=2*t?(r.push(n),r.push(n-(t+1))):r.push(n)}else{let n=[],i=[];for(let r=1;r<e;++r)r>=t*2+1||r%2==1?i.push(r):n.push(r);r.push(...n),r.push(0),r.push(...i)}return r}function Ym(e,t,n,r=!0){let i=[];r?i.push(e[0]/n):i.push(e[0]*n);for(let n=1;n<e.length;++n)n<=t.length?r?i.push(t[n-1]*e[n]):i.push(e[n]/t[n-1]):i.push(e[n]);return i}function Xm(e,t){let n=[0];for(let r=0;r<t;++r)n.push(e[r][0]);return n}function Zm(e,t,n){let r=e.slice(0,1);for(let i=0;i<n;++i)r.push(e[i+1]-t[i][0]-t[i][1]);return r}var Qm=1.7580993408473768,$m=1.0507009873554805,eh=.3275911,th=.254829592,nh=-.284496736,rh=1.421413741,ih=-1.453152027,ah=1.061405429;function oh(e,t){if(e.length!==t.length)throw Error(`Cannot merge real and imag arrays of different lengths. real:${e.length}, imag: ${t.length}.`);let n=new Float32Array(e.length*2);for(let r=0;r<n.length;r+=2)n[r]=e[r/2],n[r+1]=t[r/2];return n}function sh(e){let t=new Float32Array(e.length/2),n=new Float32Array(e.length/2);for(let r=0;r<e.length;r+=2)t[r/2]=e[r],n[r/2]=e[r+1];return{real:t,imag:n}}function ch(e){let t=Math.ceil(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let t=0;t<e.length;t+=4)n[Math.floor(t/4)]=e[t],r[Math.floor(t/4)]=e[t+1];return{real:n,imag:r}}function lh(e){let t=Math.floor(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let t=2;t<e.length;t+=4)n[Math.floor(t/4)]=e[t],r[Math.floor(t/4)]=e[t+1];return{real:n,imag:r}}function uh(e,t){return{real:e[t*2],imag:e[t*2+1]}}function dh(e,t,n,r){e[r*2]=t,e[r*2+1]=n}function fh(e,t){let n=new Float32Array(e/2),r=new Float32Array(e/2);for(let i=0;i<Math.ceil(e/2);i++){let a=(t?2:-2)*Math.PI*(i/e);n[i]=Math.cos(a),r[i]=Math.sin(a)}return{real:n,imag:r}}function ph(e,t,n){let r=(n?2:-2)*Math.PI*(e/t);return{real:Math.cos(r),imag:Math.sin(r)}}var mh=`->`,hh=/->/g,gh=`,`,_h=`...`;function vh(e,t){e=e.replace(/\s/g,``);let n=(e.length-e.replace(hh,``).length)/2;if(n<1)throw Error(`Equations without an arrow are not supported.`);if(n>1)throw Error(`Equation must contain exactly one arrow ("${mh}").`);let[r,i]=e.split(mh);m(r.indexOf(_h)===-1,()=>`The ellipsis notation ("${_h}") is not supported yet.`);let a=r.split(gh),o=a.length;if(t!==o)throw Error(`Expected ${o} input tensors, received ${t}`);if(o>2)throw Error(`Support for more than 2 input tensors is not implemented yet.`);let s=[];for(let e=0;e<i.length;++e){let t=i[e];if(!a.some(e=>e.indexOf(t)!==-1))throw Error(`Output subscripts contain the label ${t} not present in the input subscripts.`);s.indexOf(t)===-1&&s.push(t)}for(let e=0;e<r.length;++e){let t=r[e];s.indexOf(t)===-1&&t!==gh&&s.push(t)}let c=Array(a.length);for(let e=0;e<o;++e){if(new Set(a[e].split(``)).size!==a[e].length)throw Error(`Found duplicate axes in input component ${a[e]}. Support for duplicate axes in input is not implemented yet.`);c[e]=[];for(let t=0;t<a[e].length;++t)c[e].push(s.indexOf(a[e][t]))}let l=s.length,u=i.length,d=[];for(let e=u;e<l;++e)d.push(e);return{allDims:s,summedDims:d,idDims:c}}function yh(e,t){let n=Array(e);n.fill(-1);for(let e=0;e<t.length;++e)n[t[e]]=e;let r=[];for(let t=0;t<e;++t)n[t]===-1&&r.push(t);return n=n.filter(e=>e!==-1),{permutationIndices:n,expandDims:r}}function bh(e,t,n){let r=Array(e);for(let e=0;e<n.length;++e){let i=n[e].shape;for(let n=0;n<t[e].length;++n)r[t[e][n]]===void 0?r[t[e][n]]=i[n]:m(r[t[e][n]]===i[n],()=>`Expected dimension ${r[t[e][n]]} at axis ${n} of input shaped ${JSON.stringify(i)}, but got dimension ${i[n]}`)}}function xh(e,t){let n=e,r=[],i=0;e.length===0&&n.push(-1),i=e.length+1;for(let e=0;e<i;++e)r.push([]);let a=[];for(let e=0;e<n.length;++e){let i=n[e],o=Ch(t,i);for(let t of o)a.indexOf(t)===-1&&(r[e].push(t),a.push(t))}return{path:n,steps:r}}function Sh(e){return e.every((e,t)=>e===t)}function Ch(e,t){let n=[];for(let r=0;r<e.length;++r)(e[r].length===0||e[r].indexOf(t)!==-1||t===-1)&&n.push(r);return n}function wh(e,t,n=0){let r=[];if(typeof t==`number`)m(e.shape[n]%t===0,()=>`Number of splits must evenly divide the axis.`),r=Array(t).fill(e.shape[n]/t);else{m(t.reduce((e,t)=>(t===-1&&(e+=1),e),0)<=1,()=>`There should be only one negative value in split array.`);let i=t.indexOf(-1);if(i!==-1){let r=t.reduce((e,t)=>t>0?e+t:e);t[i]=e.shape[n]-r}m(e.shape[n]===t.reduce((e,t)=>e+t),()=>`The sum of sizes must match the size of the axis dimension.`),r=t}return r}function Th(e){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${e}`}function Eh(e,t){return`indices(${e}, 0) is invalid: ${t} < 0`}function Dh(e,t,n){return`indices(${e}, 0) is invalid: ${t} >= ${n}`}function Oh(e,t){return`only one output dimension may be -1, not both ${e} and ${t}`}function kh(e,t){return`size ${e} must be non-negative, not ${t}`}function Ah(){return`reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero`}function jh(e,t){return`Input to reshape is a SparseTensor with ${_(e)}
  dense values, but the requested shape requires a multiple of ${_(t)}. inputShape=${e} outputShape= ${t}`}function Mh(e,t){return`Input to reshape is a tensor with ${_(e)} dense values, but the requested shape has ${_(t)}. inputShape=${e} outputShape=${t}`}function Nh(){return`segment ids must be >= 0`}function Ph(){return`segment ids are not increasing`}function Fh(e,t){return`Segment id ${e} out of range [0, ${t}), possibly because segmentIds input is not sorted.`}function Ih(e,t,n){return`Bad: indices[${e}] == ${t} out of range [0, ${n})`}var Lh=t({collectGatherOpShapeInfo:()=>Bh,computeOutShape:()=>zh,segOpComputeOptimalWindowSize:()=>Rh});function Rh(e,t){let n=!1,r;for(e<=30?(r=e,n=!0):r=ue(e,Math.floor(Math.sqrt(e)));!n;)r>t||r===e?n=!0:r=ue(e,r+1);return r}function zh(e,t,n){let r=[],i=e.length;for(let a=0;a<i;a++)a===t?r.push(n):r.push(e[a]);return r}function Bh(e,t,n,r){let i=t.shape.length,a=e.shape.length;if(r!==0&&(r<-i||r>i))throw Error(`Expect batchDims in the range of [-${i}, ${i}], but got ${r}`);if(r<0&&(r+=i),r>a)throw Error(`batchDims (${r}) must be less than rank(x) (
    ${a}).`);if(n<r)throw Error(`batchDims (${r}) must be less than or equal to axis (${n}).`);for(let n=0;n<r;++n)if(e.shape[n]!==t.shape[n])throw Error(`x.shape[${n}]: ${e.shape[n]} should be equal to indices.shape[${n}]: ${t.shape[n]}.`);let o=e.shape[n],s=[],c=1,l=1,u=1;for(let t=0;t<r;++t)s.push(e.shape[t]),c*=e.shape[t];for(let t=r;t<n;t++)s.push(e.shape[t]),l*=e.shape[t];for(let e=r;e<i;e++)s.push(t.shape[e]);for(let t=n+1;t<a;t++)s.push(e.shape[t]),u*=e.shape[t];return{batchSize:c,sliceSize:u,outerSize:l,dimSize:o,outputShape:s}}var Vh=t({ERF_A1:()=>th,ERF_A2:()=>nh,ERF_A3:()=>rh,ERF_A4:()=>ih,ERF_A5:()=>ah,ERF_P:()=>eh,PARALLELIZE_THRESHOLD:()=>30,RowPartitionType:()=>Bm,SELU_SCALE:()=>$m,SELU_SCALEALPHA:()=>Qm,applyActivation:()=>Gf,assertAndGetBroadcastShape:()=>H,assertAxesAreInnerMostDims:()=>qc,assertParamsConsistent:()=>Rm,assignToTypedArray:()=>dh,axesAreInnerMostDims:()=>Uc,calculateShapes:()=>Cf,checkEinsumDimSizes:()=>bh,checkPadOnDimRoundingMode:()=>as,combineLocations:()=>Wc,combineRaggedTensorToTensorShapes:()=>Vm,complexWithEvenIndex:()=>ch,complexWithOddIndex:()=>lh,computeConv2DInfo:()=>Wo,computeConv3DInfo:()=>Go,computeDefaultPad:()=>Jo,computeDilation2DInfo:()=>Vo,computeOptimalWindowSize:()=>Gm,computeOutAndReduceShapes:()=>Gc,computeOutShape:()=>zm,computePool2DInfo:()=>Ho,computePool3DInfo:()=>Uo,convertConv2DDataFormat:()=>is,decodeEinsumEquation:()=>vh,eitherStridesOrDilationsAreOne:()=>ns,expandShapeToKeepDim:()=>Kc,exponent:()=>ph,exponents:()=>fh,fromStringArrayToUint8:()=>Uh,fromUint8ToStringArray:()=>Hh,getAxesPermutation:()=>Jc,getBroadcastDims:()=>Tc,getComplexWithIndex:()=>uh,getEinsumComputePath:()=>xh,getEinsumPermutation:()=>yh,getFusedBiasGradient:()=>Wf,getFusedDyActivation:()=>Uf,getImageCenter:()=>Km,getInnerMostAxes:()=>Xc,getPermuted:()=>Jm,getRaggedRank:()=>Um,getReductionAxes:()=>Ec,getReshaped:()=>qm,getReshapedPermuted:()=>Ym,getRowPartitionTypesHelper:()=>Hm,getSliceBeginCoords:()=>Xm,getSliceSize:()=>Zm,getSparseFillEmptyRowsIndicesDenseShapeMismatch:()=>Th,getSparseFillEmptyRowsNegativeIndexErrorMessage:()=>Eh,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:()=>Dh,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:()=>Ah,getSparseReshapeInputOutputMismatchErrorMessage:()=>Mh,getSparseReshapeInputOutputMultipleErrorMessage:()=>jh,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:()=>Oh,getSparseReshapeNegativeOutputDimErrorMessage:()=>kh,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:()=>Ih,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:()=>Nh,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:()=>Ph,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:()=>Fh,getUndoAxesPermutation:()=>Yc,isIdentityPermutation:()=>Sh,log:()=>Dr,mergeRealAndImagArrays:()=>oh,prepareAndValidate:()=>pm,prepareSplitSize:()=>wh,segment_util:()=>Lh,shouldFuse:()=>Kf,slice_util:()=>mm,splitRealAndImagArrays:()=>sh,stridesOrDilationsArePositive:()=>rs,tupleValuesAreOne:()=>ts,upcastType:()=>Ii,validateDefaultValueShape:()=>Wm,validateInput:()=>Sf,validateUpdateShape:()=>xf,warn:()=>Er});function Hh(e){try{return e.map(e=>oi(e))}catch(e){throw Error(`Failed to decode encoded string bytes into utf-8, error: ${e}`)}}function Uh(e){return e.map(e=>ai(e))}fm();var Wh={kernelName:`Abs`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,mf(L(n,`float32`),-1))}}},Gh={kernelName:Me,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>{let t=sl(L(n,`float32`));return tu(z(e,al(W(rl(1),t))))}}}},Kh={kernelName:Ne,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,al(W(sl(L(n,`float32`)),1)))}}},qh={kernelName:`Add`,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=e,r=Ec(n.shape,i);return r.length>0&&(t=U(t,r)),V(t,n.shape)},b:()=>{let t=e,n=Ec(r.shape,i);return n.length>0&&(t=U(t,n)),V(t,r.shape)}}}},Jh={kernelName:Pe,saveAllInputs:!0,gradFunc:(e,t)=>{let n={};return t.forEach((t,r)=>{n[r]=()=>e.clone()}),n}},Yh={kernelName:Fe,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>Mc(n)}}},Xh={kernelName:Ie,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>Mc(n)}}},Zh={kernelName:Le,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,al(W(rl(1),sl(L(n,`float32`)))))}}},Qh={kernelName:Re,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,al(R(rl(1),sl(L(n,`float32`)))))}}},$h={kernelName:Ve,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=R(sl(n),sl(r)),a=B(e,z(r,t)),o=Ec(n.shape,i);return o.length>0&&(a=U(a,o)),V(a,n.shape)},b:()=>{let t=R(sl(n),sl(r)),a=tu(B(e,z(n,t))),o=Ec(r.shape,i);return o.length>0&&(a=U(a,o)),V(a,r.shape)}}}},eg={kernelName:ze,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,R(sl(L(n,`float32`)),1))}}},tg={kernelName:Be,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,W(rl(1),sl(L(n,`float32`))))}}};function ng(e,t,n,r,i,a){let o=M(e,`dy`,`avgPool3dGrad`),s=M(t,`input`,`avgPool3dGrad`),c=o,l=s,u=!1;s.rank===4&&(u=!0,c=V(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]]),l=V(s,[1,s.shape[0],s.shape[1],s.shape[2],s.shape[3]])),m(c.rank===5,()=>`Error in avgPool3dGrad: dy must be rank 5 but got rank ${c.rank}.`),m(l.rank===5,()=>`Error in avgPool3dGrad: input must be rank 5 but got rank ${l.rank}.`),as(`avgPool3dGrad`,i,a);let d={dy:c,input:l},f={filterSize:n,strides:r,pad:i,dimRoundingMode:a},p=j.runKernel(Ge,d,f);return u?V(p,[p.shape[1],p.shape[2],p.shape[3],p.shape[4]]):p}var rg=N({avgPool3dGrad_:ng}),ig={kernelName:We,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{filterSize:i,strides:a,pad:o,dimRoundingMode:s}=n;return{x:()=>rg(e,r,i,a,o,s)}}};function ag(e,t,n,r,i){let a=M(e,`dy`,`avgPoolGrad`),o=M(t,`input`,`avgPoolGrad`);m(o.rank===a.rank,()=>`Rank of input (${o.rank}) does not match rank of dy (${a.rank})`);let s=o,c=a,l=!1;o.rank===3&&(l=!0,s=V(o,[1,o.shape[0],o.shape[1],o.shape[2]]),c=V(a,[1,a.shape[0],a.shape[1],a.shape[2]])),m(c.rank===4,()=>`Error in avgPoolGrad: dy must be rank 4 but got rank ${c.rank}.`),m(s.rank===4,()=>`Error in avgPoolGrad: input must be rank 4 but got rank ${s.rank}.`);let u={dy:c,input:s},d={filterSize:n,strides:r,pad:i},f=j.runKernel(Ue,u,d);return l?V(f,[f.shape[1],f.shape[2],f.shape[3]]):f}var og=N({avgPoolGrad_:ag}),sg={kernelName:He,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{filterSize:i,strides:a,pad:o}=n;return{x:()=>og(e,r,i,a,o)}}},cg={kernelName:Ke,inputsToSave:[`a`,`b`],gradFunc:(e,t,n)=>{let[r,i]=t,{transposeA:a,transposeB:o}=n;return!a&&!o?{a:()=>ms(e,i,!1,!0),b:()=>ms(r,e,!0,!1)}:!a&&o?{a:()=>ms(e,i,!1,!1),b:()=>ms(e,r,!0,!1)}:a&&!o?{a:()=>ms(i,e,!1,!0),b:()=>ms(r,e,!1,!1)}:{a:()=>ms(i,e,!0,!0),b:()=>ms(e,r,!0,!0)}}},lg={kernelName:qe,gradFunc:(e,t,n)=>{let{blockShape:r,crops:i}=n;return{x:()=>Ku(e,r,i)}}},ug={kernelName:Xe,gradFunc:(e,t,n)=>{let r=n,i=r.inputShape,a=r.shape,o=Array.from(a);for(let e=i.length-1;e>=0;e--)if(i[e]===a[e])o[e]=1;else if(i[e]!==1)throw Error(`broadcastTo(): [${i}] cannot be broadcast to [${a}].`);let s=[];for(let e=0;e<o.length;e++)o[e]>1&&s.push(e);return{x:()=>U(e,s,!0)}}},dg={kernelName:Qe,gradFunc:e=>({x:()=>e.clone()})},fg={kernelName:$e,gradFunc:e=>({x:()=>Mc(e)})},pg={kernelName:et,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{clipValueMin:i,clipValueMax:a}=n;return{x:()=>Ac(fu(jl(r,i),Gl(r,a)),e,Mc(e))}}},mg={kernelName:nt,inputsToSave:[`x`],gradFunc:Wh.gradFunc},hg={kernelName:rt,saveAllInputs:!0,gradFunc:(e,t,n)=>{let r=t.map(e=>e.shape),{axis:i}=n,a=w(i,t[0].shape)[0];return rf(e,r.map(e=>e[a]),a).map(e=>()=>e)}},gg={kernelName:it,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let[r,i]=t,{dilations:a,strides:o,pad:s,dataFormat:c}=n;return m(ts(a),()=>`Error in gradient of conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${a}'`),{x:()=>ec(r.shape,e,i,o,s,c),filter:()=>Hf(r,e,i.shape,o,s,c)}}},_g={kernelName:ot,inputsToSave:[`dy`,`filter`],gradFunc:(e,t,n)=>{let[r,i]=t,{strides:a,pad:o,dataFormat:s,dimRoundingMode:c}=n;return{dy:()=>Xs(e,i,a,o,s,1,c),filter:()=>Hf(e,r,i.shape,a,o,s,c)}}};function vg(e,t,n,r,i){let a=e;e.rank===4&&(a=V(e,[1,e.shape[0],e.shape[1],e.shape[2],e.shape[3]]));let o=t;o.rank===4&&(o=V(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]])),m(a.rank===5,()=>`Error in conv3dDerFilter: input must be rank 5, but got shape ${a.shape}.`),m(o.rank===5,()=>`Error in conv3dDerFilter: dy must be rank 5, but got shape ${o.shape}.`),m(n.length===5,()=>`Error in conv3dDerFilter: filterShape must be length 5, but got ${n}.`),m(a.shape[4]===n[3],()=>`Error in conv3dDerFilter: depth of input ${a.shape[4]}) must match input depth in filter (${n[3]}.`),m(o.shape[4]===n[4],()=>`Error in conv3dDerFilter: depth of dy (${o.shape[4]}) must match output depth for filter (${n[4]}).`);let s={x:a,dy:o},c={strides:r,pad:i,filterShape:n};return j.runKernel(ct,s,c)}var yg=N({conv3DBackpropFilter_:vg}),bg={kernelName:st,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let{dilations:r,strides:i,pad:a}=n;m(ts(r),()=>`Error in gradient of conv3D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${r}'`);let[o,s]=t;return{x:()=>oc(o.shape,e,s,i,a),filter:()=>yg(o,e,s.shape,i,a)}}},xg={kernelName:`Cos`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(tu(Ld(L(n,`float32`))),e)}}},Sg={kernelName:ut,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(zd(L(n,`float32`)),e)}}},Cg={kernelName:ft,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{axis:i,exclusive:a,reverse:o}=n;return{x:()=>{let t=Jc([i],r.rank),n=gc(e,i,a,!o);return t!=null&&(n=Lf(n,t)),n}}}},wg={kernelName:gt,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let{dilations:r,strides:i,pad:a,dimRoundingMode:o}=n,s=r??[1,1];m(ts(s),()=>`Error in gradient of depthwiseConv2dNative: dilation rates greater than 1 are not yet supported. Got dilations '${s}'`);let[c,l]=t;return m(c.rank===4,()=>`Error in gradient of depthwiseConv2dNative: input must be rank 4, but got rank ${c.rank}.`),m(l.rank===4,()=>`Error in gradient of depthwiseConv2dNative: filter must be rank 4, but got rank ${l.rank}.`),m(c.shape[3]===l.shape[2],()=>`Error in gradient of depthwiseConv2d: number of input channels (${c.shape[3]}) must match the inChannels dimension in filter ${l.shape[2]}.`),m(ns(i,s),()=>`Error in gradient of depthwiseConv2d: Either strides or dilations must be  1. Got strides ${i} and dilations '${s}'.`),as(`depthwiseConv2d`,a,o),{x:()=>Qf(c.shape,e,l,i,a,s,o),filter:()=>Xf(c,e,l.shape,i,a,s,o)}}},Tg={kernelName:bt,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let[r,i]=t,a={x:r,filter:i,dy:e},o={x:r,filter:i,dy:e};return{x:()=>j.runKernel(xt,a,n),filter:()=>j.runKernel(St,o,n)}}},Eg={kernelName:`Elu`,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t,r={dy:e,y:n};return{x:()=>j.runKernel(Et,r)}}},Dg={kernelName:`Erf`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t,r=B(hl(tu(sl(n))),2/Math.sqrt(Math.PI));return{x:()=>B(e,r)}}},Og={kernelName:`Exp`,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,n)}}},kg={kernelName:Ot,inputsToSave:[`input`],gradFunc:(e,t)=>{let[n]=t;return{input:()=>V(e,n.shape)}}},Ag={kernelName:kt,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,hl(n))}}},jg={kernelName:Mt,gradFunc:e=>({x:()=>Mc(e)})},Mg={kernelName:Nt,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=z(e,L(r,`float32`)),a=Ec(n.shape,i);return a.length>0?V(U(t,a),n.shape):t},b:()=>{let t=B(e,L(n,`float32`)),a=Ec(r.shape,i);a.length>0&&(t=V(U(t,a),r.shape));let o=sl(r);return tu(z(t,L(o,`float32`)))}}}},Ng={kernelName:Pt,inputsToSave:[`x`,`mean`,`variance`,`scale`],gradFunc:(e,t,n)=>{let{varianceEpsilon:r}=n,[i,a,o,s]=t,c=s??rl(1),l=Ec(a.shape,i.shape),u=[];if(a.rank===1){for(let e=0;e<i.shape.length-1;++e)u.push(i.shape[e]);u.push(1)}let d=W(i,a),f=B(e,c),p=kd(R(o,rl(r))),m=B(B(B(p,p),p),rl(-.5));return{x:()=>a.rank===1?V(B(B(e,xl(V(p,[1,1,1,a.shape[0]]),u)),c),i.shape):V(B(B(e,p),c),i.shape),mean:()=>{let e=B(B(p,rl(-1)),f);return a.rank===1&&(e=U(e,l)),V(e,a.shape)},variance:()=>{let e=B(B(m,d),f);return a.rank===1&&(e=U(e,l)),V(e,a.shape)},scale:()=>{let t=B(e,B(d,p));return a.rank===1&&(t=U(t,l)),V(t,a.shape)},offset:()=>{let t=e;return a.rank===1&&(t=U(t,l)),V(t,a.shape)}}}},Pg={kernelName:Ft,inputsToSave:[`x`,`indices`],gradFunc:(e,t,n)=>{let[r,i]=t,{axis:a,batchDims:o}=n,s=w(a,r.shape)[0],c=(e,t,n)=>()=>{let r=e.shape,i=t.size,o=r.slice(0,s),c=o.length,l=r.slice(a,r.length).slice(1),u=l.length,d=Fg(0,c),f=Fg(c+1,c+1+u),p=V(n,Ig([o,[i],l])),m=V(t,[i]),h=Ig([[c],d,f]),g=jf(Lf(p,h),m,e.shape[s]),_=Yc(h);return g=Lf(g,_),g};if(o===1){let t=r.shape[0],n=r.split(t,0);return{x:()=>ff(n.map((t,n)=>c(t,i.slice(n,1),e.slice(n,1))())).reshape(r.shape),indices:()=>i}}return{x:c(r,i,e),indices:()=>i}}};function Fg(e,t){let n=[];for(let r=e;r<t;++r)n.push(r);return n}function Ig(e){let t=[];for(let n=0;n<e.length;++n)for(let r=0;r<e[n].length;++r)t.push(e[n][r]);return t}var Lg={kernelName:Rt,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t;return{a:()=>Mc(n),b:()=>Mc(r)}}},Rg={kernelName:zt,gradFunc:e=>({x:()=>L(e,`float32`)})},zg={kernelName:Ht,gradFunc:e=>({x:()=>Mc(e)})},Bg={kernelName:Ut,gradFunc:e=>({x:()=>Mc(e)})},Vg={kernelName:Wt,gradFunc:e=>({x:()=>Mc(e)})},Hg={kernelName:Gt,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{alpha:i}=n,a=kl(r,0);return{x:()=>Ac(a,e,B(e,i))}}},Ug={kernelName:Yt,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,R(n,1))}}},Wg={kernelName:`Log`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,L(n,`float32`))}}},Gg={kernelName:$t,inputsToSave:[],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r]=t,{axis:i}=n;return{logits:()=>{let t=hl(r);return W(e,B(U(e,i,!0),t))}}}};function Kg(e,t,n,r=5,i=1,a=1,o=.5){let s={x:e,y:t,dy:n},c={depthRadius:r,bias:i,alpha:a,beta:o};return j.runKernel(en,s,c)}var qg=N({localResponseNormalizationBackprop_:Kg}),Jg={kernelName:`LRN`,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r,i]=t,{depthRadius:a,bias:o,alpha:s,beta:c}=n;return{x:()=>qg(r,i,e,a,o,s,c)}}};function Yg(e,t,n,r){return t.rank<n.rank&&(t=V(t,Kc(t.shape,r))),e.rank<n.rank&&(e=V(e,Kc(e.shape,r))),{x:()=>B(e,L(Oc(n,t),e.dtype))}}var Xg={kernelName:`Max`,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let{reductionIndices:r}=n,i=t[0],a=t[1],o=Yg(e,a,i,w(r,i.shape));return{x:()=>o.x()}}},Zg={kernelName:tn,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t;return{a:()=>B(e,L(jl(n,r),`float32`)),b:()=>B(e,L(Ul(n,r),`float32`))}}};function Qg(e,t,n,r,i,a,o){let s=M(e,`dy`,`maxPool3dGrad`),c=M(t,`input`,`maxPool3dGrad`),l=M(n,`output`,`maxPool3dGrad`),u=s,d=c,f=l,p=!1;c.rank===4&&(p=!0,u=V(s,[1,s.shape[0],s.shape[1],s.shape[2],s.shape[3]]),d=V(c,[1,c.shape[0],c.shape[1],c.shape[2],c.shape[3]]),f=V(l,[1,l.shape[0],l.shape[1],l.shape[2],l.shape[3]])),m(u.rank===5,()=>`Error in maxPool3dGrad: dy must be rank 5 but got rank ${u.rank}.`),m(d.rank===5,()=>`Error in maxPool3dGrad: input must be rank 5 but got rank ${d.rank}.`),m(f.rank===5,()=>`Error in maxPool3dGrad: output must be rank 5 but got rank ${f.rank}.`),as(`maxPool3dGrad`,a,o);let h={dy:u,input:d,output:f},g={filterSize:r,strides:i,pad:a,dimRoundingMode:o},_=j.runKernel(on,h,g);return p?V(_,[_.shape[1],_.shape[2],_.shape[3],_.shape[4]]):_}var $g=N({maxPool3dGrad_:Qg}),e_={kernelName:an,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r,i]=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=n;return{x:()=>$g(e,r,i,a,o,s,c)}}};function t_(e,t,n,r,i,a,o){let s=M(e,`dy`,`maxPoolGrad`),c=M(t,`input`,`maxPoolGrad`),l=M(n,`output`,`maxPoolGrad`);m(c.rank===s.rank,()=>`Rank of input (${c.rank}) does not match rank of dy (${s.rank})`),m(s.rank===4,()=>`Error in maxPoolGrad: dy must be rank 4 but got rank ${s.rank}.`),m(c.rank===4,()=>`Error in maxPoolGrad: input must be rank 4 but got rank ${c.rank}.`),as(`maxPoolGrad`,a,o);let u={dy:s,input:c,output:l},d={filterSize:r,strides:i,pad:a,dimRoundingMode:o};return j.runKernel(rn,u,d)}var n_=N({maxPoolGrad_:t_}),r_={kernelName:nn,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r,i]=t,{filterSize:a,strides:o,pad:s}=n;return{x:()=>n_(e,r,i,a,o,s)}}},i_={kernelName:cn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{axis:i}=n,a=w(i,r.shape),o=Gc(r.shape,a)[1],s=_(o);return{x:()=>{let t=r.shape.slice();return a.forEach(e=>{t[e]=1}),z(B(V(e,t),Ou(r.shape,`float32`)),s)}}}},a_={kernelName:`Min`,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let{axis:r}=n,[i,a]=t,o=Yg(e,a,i,w(r,i.shape));return{x:()=>o.x()}}},o_={kernelName:ln,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t;return{a:()=>B(e,L(Gl(n,r),`float32`)),b:()=>B(e,L(kl(n,r),`float32`))}}},s_={kernelName:un,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let r=t[0],{paddings:i}=n,a=i.map(e=>e[0]);return{x:()=>vs(e,a,r.shape)}}},c_={kernelName:`Mod`,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=Ec(n.shape,i);return t.length>0?V(U(e,t),n.shape):e},b:()=>{let t=B(e,tu(Tl(z(n,r)))),a=Ec(r.shape,i);return a.length>0?V(U(t,a),r.shape):t}}}},l_={kernelName:fn,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=B(e,L(r,`float32`)),a=Ec(n.shape,i);return a.length>0?V(U(t,a),n.shape):t},b:()=>{let t=B(e,L(n,`float32`)),a=Ec(r.shape,i);return a.length>0?V(U(t,a),r.shape):t}}}},u_={kernelName:`Neg`,gradFunc:e=>({x:()=>tu(e)})},d_={kernelName:vn,inputsToSave:[`indices`],gradFunc:(e,t)=>{let n=t[0];return{indices:()=>Du(n.shape,`float32`)}}},f_={kernelName:_n,gradFunc:e=>({x:()=>Mc(e)})},p_={kernelName:yn,saveAllInputs:!0,gradFunc:(e,t,n)=>{let{axis:r}=n;return Nf(e,r).map(e=>()=>e)}},m_={kernelName:bn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let r=t[0],{paddings:i}=n,a=i.map(e=>e[0]);return{x:()=>vs(e,a,r.shape)}}},h_={kernelName:`Pow`,inputsToSave:[`a`,`b`],outputsToSave:[!0],gradFunc:(e,t)=>{let[n,r,i]=t,a=n,o=r,s=H(a.shape,o.shape);return{a:()=>{let t=L(o,`float32`),n=B(e,B(t,nl(a,W(t,rl(1))))),r=Ec(a.shape,s);return r.length>0&&(n=U(n,r)),V(n,a.shape)},b:()=>{let t=Ac(kl(a,0),Yl(a),Mc(a)),n=B(e,B(i,t)),r=Ec(o.shape,s);return r.length>0&&(n=U(n,r)),V(n,o.shape)}}}},g_={kernelName:xn,inputsToSave:[`x`,`alpha`],gradFunc:(e,t)=>{let[n,r]=t,i=kl(n,0);return{x:()=>Ac(i,e,B(e,r)),alpha:()=>{let t=Ac(i,Mc(e),B(e,n)),a=Ec(r.shape,e.shape);return a.length>0&&(t=U(t,a)),V(t,r.shape)}}}};function __(e,t,n){let r=e.shape.slice();return r[n]=1,B(V(t,r),B(mc(e,n,!0,!1),mc(e,n,!0,!0)))}function v_(e,t,n){let r=e.shape.length,i=r-n.length,a=Jc(n,r),o=e;a!=null&&(o=Lf(e,a));let s=o.shape.slice(),c=s.splice(r-n.length,n.length).reduce((e,t)=>e*t,1);s.push(c);let l=__(o.reshape(s),t,i);if(l=l.reshape(o.shape),a!=null){let e=Yc(a);l=Lf(l,e)}return l}var y_={kernelName:Sn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{axis:i}=n,a=[];return a=i==null?r.shape.map((e,t)=>t):typeof i==`number`?[i]:i,{x:()=>v_(r,e,a)}}},b_={kernelName:wt,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=z(e,L(r,`float32`)),a=Ec(n.shape,i);return a.length>0?V(U(t,a),n.shape):t},b:()=>{let t=B(e,L(n,`float32`)),a=Ec(r.shape,i);a.length>0&&(t=V(U(t,a),r.shape));let o=sl(r);return tu(z(t,L(o,`float32`)))}}}},x_={kernelName:On,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,tu(sl(n)))}}},S_={kernelName:Fn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t,r=B(Gl(n,6),mf(n));return{x:()=>B(e,L(r,`float32`))}}},C_={kernelName:kn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,L(mf(n),`float32`))}}},w_={kernelName:An,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,n.shape)}}},T_={kernelName:Nn,inputsToSave:[`images`],gradFunc:(e,t,n)=>{let[r]=t,i={dy:e,images:r};return{images:()=>j.runKernel(Pn,i,n)}}},E_={kernelName:jn,inputsToSave:[`images`],gradFunc:(e,t,n)=>{let[r]=t,i={dy:e,images:r};return{images:()=>j.runKernel(Mn,i,n)}}},D_={kernelName:In,gradFunc:(e,t,n)=>{let{dims:r}=n,i=w(r,e.shape);return{x:()=>Td(e,i)}}},O_={kernelName:Ln,gradFunc:e=>({x:()=>Mc(e)})},k_={kernelName:Rn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>tu(z(e,B(nl(n,1.5),2)))}}},A_={kernelName:Hn,inputsToSave:[`condition`],gradFunc:(e,t)=>{let[n]=t;return{condition:()=>L(Mc(n),`float32`),t:()=>B(e,L(n,e.dtype)),e:()=>B(e,L(mu(n),e.dtype))}}},j_={kernelName:Un,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>{let t=kl(n,rl(0)),r=rl(Qm);return Ac(t,B(e,rl($m)),B(B(e,r),hl(L(n,`float32`))))}}}},M_={kernelName:qn,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,B(n,W(rl(1),n)))}}},N_={kernelName:Kn,gradFunc:e=>({x:()=>Mc(e)})},P_={kernelName:`Sin`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(uc(L(n,`float32`)),e)}}},F_={kernelName:Gn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(fc(L(n,`float32`)),e)}}},I_={kernelName:Wn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{begin:i,size:a}=n,o=r.shape,[s,c]=jm(r,i,a),l=[];for(let t=0;t<e.rank;t++)l.push([s[t],o[t]-s[t]-c[t]]);return{x:()=>Wu(e,l)}}},L_={kernelName:Qn,outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r]=t,{dim:i}=n,a=B(e,r);return{logits:()=>W(a,B(U(a,[i],!0),r))}}},R_={kernelName:Jn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,gs(n))}}},z_={kernelName:Xn,gradFunc:(e,t,n)=>{let{blockShape:r,paddings:i}=n;return{x:()=>Ss(e,r,i)}}},B_={kernelName:Zn,gradFunc:(e,t,n)=>{let{axis:r}=n;return{x:()=>fs(e,r)}}},V_={kernelName:Yn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,B(al(L(n,`float32`)),2))}}},H_={kernelName:ar,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,B(L(n,`float32`),2))}}},U_={kernelName:ir,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=rl(2);return{a:()=>B(e,B(i,W(n,r))),b:()=>B(e,B(i,W(r,n)))}}},W_={kernelName:br,gradFunc:e=>({x:()=>Mc(e)})},G_={kernelName:`Sub`,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=H(n.shape,r.shape);return{a:()=>{let t=e,r=Ec(n.shape,i);return r.length>0&&(t=U(t,r)),V(t,n.shape)},b:()=>{let t=e,n=Ec(r.shape,i);return n.length>0&&(t=U(t,n)),V(tu(t),r.shape)}}}},K_={kernelName:`Sum`,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,i=r.shape.slice(),{axis:a}=n;w(a,r.shape).forEach(e=>{i[e]=1});let o=B(V(e,i),Ou(r.shape,`float32`));return{x:()=>o}}},q_={kernelName:`Tan`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>z(e,sl(uc(n)))}}},J_={kernelName:dr,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(W(rl(1),sl(n)),e)}}},Y_={kernelName:fr,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{reps:i}=n;return{x:()=>{let t=Mc(r);if(r.rank===1)for(let n=0;n<i[0];++n)t=R(t,vs(e,[n*r.shape[0]],[r.shape[0]]));else if(r.rank===2)for(let n=0;n<i[0];++n)for(let a=0;a<i[1];++a)t=R(t,vs(e,[n*r.shape[0],a*r.shape[1]],[r.shape[0],r.shape[1]]));else if(r.rank===3)for(let n=0;n<i[0];++n)for(let a=0;a<i[1];++a)for(let o=0;o<i[2];++o)t=R(t,vs(e,[n*r.shape[0],a*r.shape[1],o*r.shape[2]],[r.shape[0],r.shape[1],r.shape[2]]));else if(r.rank===4)for(let n=0;n<i[0];++n)for(let a=0;a<i[1];++a)for(let o=0;o<i[2];++o)for(let s=0;s<i[3];++s)t=R(t,vs(e,[n*r.shape[0],a*r.shape[1],o*r.shape[2],s*r.shape[3]],[r.shape[0],r.shape[1],r.shape[2],r.shape[3]]));else throw Error(`Gradient for tile operation is not implemented for rank-${r.rank} tensors yet.`);return t}}}},X_={kernelName:hr,gradFunc:(e,t,n)=>{let{perm:r}=n,i=Yc(r);return{x:()=>Lf(e,i)}}},Z_={kernelName:_r,gradFunc:(e,t,n)=>{let{axis:r}=n;return{value:()=>ff(e,r)}}},Q_={kernelName:vr,inputsToSave:[`segmentIds`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>$_(e,n)}}};function $_(e,t){let n=Dl(e,wu(t,Mc(t))),r=jl(t,rl(0,`int32`)),i=n.rank-r.rank;for(let e=0;e<i;++e)r=_l(r,e+1);r=fu(r,Ou(n.shape,`bool`));let a=Mc(n);return Ac(r,n,a)}var ev=[Wh,Gh,Kh,qh,Jh,Yh,Xh,Zh,Qh,$h,eg,tg,ig,sg,cg,lg,ug,dg,fg,pg,mg,hg,_g,gg,bg,xg,Sg,Cg,wg,Tg,b_,Eg,Dg,Og,kg,Ag,Mg,jg,Ng,Pg,Lg,Rg,zg,Bg,Vg,Hg,Ug,Wg,Gg,Jg,Xg,Xg,Zg,e_,r_,i_,a_,o_,s_,c_,l_,u_,d_,f_,p_,m_,m_,h_,g_,y_,x_,S_,C_,w_,T_,E_,D_,O_,k_,A_,j_,M_,N_,P_,F_,I_,L_,R_,z_,z_,B_,B_,V_,U_,H_,W_,G_,K_,q_,J_,Y_,X_,Z_,Q_,{kernelName:yr,gradFunc:e=>({x:()=>Mc(e)})}];for(let e of ev)Pr(e);A().prototype.abs=function(){return this.throwIfDisposed(),vo(this)},A().prototype.acos=function(){return this.throwIfDisposed(),bo(this)},A().prototype.acosh=function(){return this.throwIfDisposed(),So(this)},A().prototype.add=function(e){return this.throwIfDisposed(),R(this,e)},A().prototype.all=function(e,t){return this.throwIfDisposed(),wo(this,e,t)},A().prototype.any=function(e,t){return this.throwIfDisposed(),Eo(this,e,t)},A().prototype.argMax=function(e){return this.throwIfDisposed(),Oo(this,e)},A().prototype.argMin=function(e){return this.throwIfDisposed(),Ao(this,e)},A().prototype.asScalar=function(){return this.throwIfDisposed(),m(this.size===1,()=>`The array must have only 1 element.`),V(this,[])},A().prototype.asType=function(e){return this.throwIfDisposed(),L(this,e)},A().prototype.as1D=function(){return this.throwIfDisposed(),V(this,[this.size])},A().prototype.as2D=function(e,t){return this.throwIfDisposed(),V(this,[e,t])},A().prototype.as3D=function(e,t,n){return this.throwIfDisposed(),V(this,[e,t,n])},A().prototype.as4D=function(e,t,n,r){return this.throwIfDisposed(),V(this,[e,t,n,r])},A().prototype.as5D=function(e,t,n,r,i){return this.throwIfDisposed(),V(this,[e,t,n,r,i])},A().prototype.asin=function(){return this.throwIfDisposed(),Mo(this)},A().prototype.asinh=function(){return this.throwIfDisposed(),Po(this)},A().prototype.atan=function(){return this.throwIfDisposed(),Io(this)},A().prototype.atan2=function(e){return this.throwIfDisposed(),Ro(this,e)},A().prototype.atanh=function(){return this.throwIfDisposed(),Bo(this)},A().prototype.avgPool=function(e,t,n,r){return this.throwIfDisposed(),cs(this,e,t,n,r)},A().prototype.batchToSpaceND=function(e,t){return this.throwIfDisposed(),Ss(this,e,t)},A().prototype.batchNorm=function(e,t,n,r,i){return this.throwIfDisposed(),Ts(this,e,t,n,r,i)},A().prototype.broadcastTo=function(e){return this.throwIfDisposed(),Fs(this,e)},A().prototype.cast=function(e){return this.throwIfDisposed(),L(this,e)},A().prototype.ceil=function(){return this.throwIfDisposed(),Ls(this)},A().prototype.clipByValue=function(e,t){return this.throwIfDisposed(),Bs(this,e,t)},A().prototype.concat=function(e,t){return this.throwIfDisposed(),e instanceof Oi&&(e=[e]),fs([this,...e],t)},A().prototype.conv1d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Qs(this,e,t,n,r,i,a)},A().prototype.conv2dTranspose=function(e,t,n,r,i){return this.throwIfDisposed(),nc(this,e,t,n,r,i)},A().prototype.conv2d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Xs(this,e,t,n,r,i,a)},A().prototype.cos=function(){return this.throwIfDisposed(),uc(this)},A().prototype.cosh=function(){return this.throwIfDisposed(),fc(this)},A().prototype.cumprod=function(e,t,n){return this.throwIfDisposed(),mc(this,e,t,n)},A().prototype.cumsum=function(e,t,n){return this.throwIfDisposed(),gc(this,e,t,n)},A().prototype.depthToSpace=function(e,t){return this.throwIfDisposed(),bc(this,e,t)},A().prototype.depthwiseConv2d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Sc(this,e,t,n,r,i,a)},A().prototype.dilation2d=function(e,t,n,r,i){return this.throwIfDisposed(),wc(this,e,t,n,r,i)},A().prototype.divNoNan=function(e){return this.throwIfDisposed(),Pc(this,e)},A().prototype.div=function(e){return this.throwIfDisposed(),z(this,e)},A().prototype.dot=function(e){return this.throwIfDisposed(),Ic(this,e)},A().prototype.elu=function(){return this.throwIfDisposed(),Bc(this)},A().prototype.equal=function(e){return this.throwIfDisposed(),Oc(this,e)},A().prototype.erf=function(){return this.throwIfDisposed(),Hc(this)},A().prototype.euclideanNorm=function(e,t){return this.throwIfDisposed(),pl(this,e,t)},A().prototype.exp=function(){return this.throwIfDisposed(),hl(this)},A().prototype.expandDims=function(e){return this.throwIfDisposed(),_l(this,e)},A().prototype.expm1=function(){return this.throwIfDisposed(),yl(this)},A().prototype.fft=function(){return this.throwIfDisposed(),Zd(this)},A().prototype.flatten=function(){return this.throwIfDisposed(),V(this,[this.size])},A().prototype.floor=function(){return this.throwIfDisposed(),Tl(this)},A().prototype.floorDiv=function(e){return this.throwIfDisposed(),mo(this,e)},A().prototype.gather=function(e,t,n){return this.throwIfDisposed(),Dl(this,e,t,n)},A().prototype.greaterEqual=function(e){return this.throwIfDisposed(),jl(this,e)},A().prototype.greater=function(e){return this.throwIfDisposed(),kl(this,e)},A().prototype.ifft=function(){return this.throwIfDisposed(),$d(this)},A().prototype.irfft=function(){return this.throwIfDisposed(),tf(this)},A().prototype.isFinite=function(){return this.throwIfDisposed(),Fl(this)},A().prototype.isInf=function(){return this.throwIfDisposed(),Ll(this)},A().prototype.isNaN=function(){return this.throwIfDisposed(),zl(this)},A().prototype.leakyRelu=function(e){return this.throwIfDisposed(),Vl(this,e)},A().prototype.lessEqual=function(e){return this.throwIfDisposed(),Gl(this,e)},A().prototype.less=function(e){return this.throwIfDisposed(),Ul(this,e)},A().prototype.localResponseNormalization=function(e,t,n,r){return this.throwIfDisposed(),ql(this,e,t,n,r)},A().prototype.logSigmoid=function(){return this.throwIfDisposed(),au(this)},A().prototype.logSoftmax=function(e){return this.throwIfDisposed(),cu(this,e)},A().prototype.logSumExp=function(e,t){return this.throwIfDisposed(),uu(this,e,t)},A().prototype.log=function(){return this.throwIfDisposed(),Yl(this)},A().prototype.log1p=function(){return this.throwIfDisposed(),Zl(this)},A().prototype.logicalAnd=function(e){return this.throwIfDisposed(),fu(this,e)},A().prototype.logicalNot=function(){return this.throwIfDisposed(),mu(this)},A().prototype.logicalOr=function(e){return this.throwIfDisposed(),gu(this,e)},A().prototype.logicalXor=function(e){return this.throwIfDisposed(),vu(this,e)},A().prototype.matMul=function(e,t,n){return this.throwIfDisposed(),ms(this,e,t,n)},A().prototype.maxPool=function(e,t,n,r){return this.throwIfDisposed(),bu(this,e,t,n,r)},A().prototype.max=function(e,t){return this.throwIfDisposed(),Qc(this,e,t)},A().prototype.maximum=function(e){return this.throwIfDisposed(),wu(this,e)},A().prototype.mean=function(e,t){return this.throwIfDisposed(),Eu(this,e,t)},A().prototype.min=function(e,t){return this.throwIfDisposed(),el(this,e,t)},A().prototype.minimum=function(e){return this.throwIfDisposed(),Au(this,e)},A().prototype.mirrorPad=function(e,t){return this.throwIfDisposed(),Mu(this,e,t)},A().prototype.mod=function(e){return this.throwIfDisposed(),Pu(this,e)},A().prototype.mul=function(e){return this.throwIfDisposed(),B(this,e)},A().prototype.neg=function(){return this.throwIfDisposed(),tu(this)},A().prototype.norm=function(e,t,n){return this.throwIfDisposed(),dl(this,e,t,n)},A().prototype.notEqual=function(e){return this.throwIfDisposed(),Ru(this,e)},A().prototype.oneHot=function(e,t=1,n=0){return this.throwIfDisposed(),Bu(this,e,t,n)},A().prototype.onesLike=function(){return this.throwIfDisposed(),Hu(this)},A().prototype.pad=function(e,t){return this.throwIfDisposed(),Wu(this,e,t)},A().prototype.pool=function(e,t,n,r,i,a){return this.throwIfDisposed(),Xu(this,e,t,n,r,i,a)},A().prototype.pow=function(e){return this.throwIfDisposed(),nl(this,e)},A().prototype.prelu=function(e){return this.throwIfDisposed(),Qu(this,e)},A().prototype.prod=function(e,t){return this.throwIfDisposed(),ed(this,e,t)},A().prototype.reciprocal=function(){return this.throwIfDisposed(),yd(this)},A().prototype.relu=function(){return this.throwIfDisposed(),xd(this)},A().prototype.relu6=function(){return this.throwIfDisposed(),Cd(this)},A().prototype.reshapeAs=function(e){return this.throwIfDisposed(),V(this,e.shape)},A().prototype.reshape=function(e){return this.throwIfDisposed(),V(this,e)},A().prototype.resizeBilinear=function(e,t,n){return this.throwIfDisposed(),Ip(this,e,t,n)},A().prototype.resizeNearestNeighbor=function(e,t,n){return this.throwIfDisposed(),Rp(this,e,t,n)},A().prototype.reverse=function(e){return this.throwIfDisposed(),Td(this,e)},A().prototype.rfft=function(){return this.throwIfDisposed(),of(this)},A().prototype.round=function(){return this.throwIfDisposed(),Dd(this)},A().prototype.rsqrt=function(){return this.throwIfDisposed(),kd(this)},A().prototype.selu=function(){return this.throwIfDisposed(),jd(this)},A().prototype.separableConv2d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Nd(this,e,t,n,r,i,a)},A().prototype.sigmoid=function(){return this.throwIfDisposed(),gs(this)},A().prototype.sign=function(){return this.throwIfDisposed(),Fd(this)},A().prototype.sin=function(){return this.throwIfDisposed(),Ld(this)},A().prototype.sinh=function(){return this.throwIfDisposed(),zd(this)},A().prototype.slice=function(e,t){return this.throwIfDisposed(),vs(this,e,t)},A().prototype.softmax=function(e){return this.throwIfDisposed(),Yd(this,e)},A().prototype.softplus=function(){return this.throwIfDisposed(),ru(this)},A().prototype.spaceToBatchND=function(e,t){return this.throwIfDisposed(),Ku(this,e,t)},A().prototype.split=function(e,t){return this.throwIfDisposed(),rf(this,e,t)},A().prototype.sqrt=function(){return this.throwIfDisposed(),al(this)},A().prototype.square=function(){return this.throwIfDisposed(),sl(this)},A().prototype.squaredDifference=function(e){return this.throwIfDisposed(),cf(this,e)},A().prototype.squeeze=function(e){return this.throwIfDisposed(),uf(this,e)},A().prototype.stack=function(e,t){return this.throwIfDisposed(),ff(e instanceof Oi?[this,e]:[this,...e],t)},A().prototype.step=function(e){return this.throwIfDisposed(),mf(this,e)},A().prototype.stridedSlice=function(e,t,n,r,i,a,o,s){return this.throwIfDisposed(),gf(this,e,t,n,r,i,a,o,s)},A().prototype.sub=function(e){return this.throwIfDisposed(),W(this,e)},A().prototype.sum=function(e,t){return this.throwIfDisposed(),U(this,e,t)},A().prototype.tan=function(){return this.throwIfDisposed(),vf(this)},A().prototype.tanh=function(){return this.throwIfDisposed(),bs(this)},A().prototype.tile=function(e){return this.throwIfDisposed(),xl(this,e)},A().prototype.toBool=function(){return this.throwIfDisposed(),L(this,`bool`)},A().prototype.toFloat=function(){return this.throwIfDisposed(),L(this,`float32`)},A().prototype.toInt=function(){return this.throwIfDisposed(),L(this,`int32`)},A().prototype.topk=function(e,t){return this.throwIfDisposed(),Tf(this,e,t)},A().prototype.transpose=function(e){return this.throwIfDisposed(),Lf(this,e)},A().prototype.unique=function(e){return this.throwIfDisposed(),kf(this,e)},A().prototype.unsortedSegmentSum=function(e,t){return this.throwIfDisposed(),jf(this,e,t)},A().prototype.unstack=function(e){return this.throwIfDisposed(),Nf(this,e)},A().prototype.where=function(e,t){return this.throwIfDisposed(),Ac(e,this,t)},A().prototype.zerosLike=function(){return this.throwIfDisposed(),Mc(this)};var tv=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},nv=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},K=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},q=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},rv=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},iv=class{constructor(e){this.maxEntries=e||100,this.cache=new Map}get(e){let t;return this.cache.has(e)&&(t=this.cache.get(e),this.cache.delete(e),this.cache.set(e,t)),t}put(e,t){if(this.cache.has(e))this.cache.delete(e);else if(this.cache.size>=this.maxEntries){let e=this.cache.keys().next().value;this.cache.delete(e)}this.cache.set(e,t)}getMaxEntries(){return this.maxEntries}setMaxEntries(e){if(e<0)throw Error(`The maxEntries of LRU caches must be at least 0, but got ${e}.`);if(this.maxEntries>e)for(let t=0;t<this.maxEntries-e;t++){let e=this.cache.keys().next().value;this.cache.delete(e)}this.maxEntries=e}};function av(e,t){if(Array.isArray(e)){let n=[];for(let r=0;r<t;r++)n=n.concat(e);return n}{let n=Array(t);return n.fill(e),n}}function ov(e,t){if(!e)throw new rv(t)}function sv(e,t){let n=0;for(let r of e)r===t&&n++;return n}function cv(e){return e.length===1?e[0]:e}function lv(e){return Array.isArray(e)?e:[e]}function uv(e){let t=e.replace(/(.)([A-Z][a-z0-9]+)/g,`$1_$2`).replace(/([a-z])([A-Z])/g,`$1_$2`).toLowerCase();return t[0]===`_`?`private`+t:t}function dv(e){return e.length<=1||e.indexOf(`_`)===-1?e:e.replace(/[_]+(\w|$)/g,(e,t)=>t.toUpperCase())}var fv={};function pv(e){if(e==null)return null;let t={};return t.className=e.getClassName(),t.config=e.getConfig(),t}function mv(e){if(!(typeof e!=`object`||!e))if(Array.isArray(e))e.forEach(e=>mv(e));else{let t=Object.keys(e);for(let n of t){let t=e[n];typeof t==`object`&&t&&(!Array.isArray(t)&&t.type===`ndarray`&&typeof t.value==`number`?e[n]=t.value:mv(t))}}}function hv(e,t={},n={},r=`object`,i=!1){if(typeof e==`string`){let i=e,a;if(i in n)a=n[i];else if(i in fv)a=fv[i];else if(a=t[i],a==null)throw new K(`Unknown ${r}: ${e}. This may be due to one of the following reasons:\n1. The ${r} is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.\n2. The custom ${r} is defined in JavaScript, but is not registered properly with tf.serialization.registerClass().`);return a}{let a=e;if(a.className==null||a.config==null)throw new K(`${r}: Improper config format: ${JSON.stringify(a)}.\n'className' and 'config' must set.`);let o=a.className,s,c;if(o in n?[s,c]=n[o]:o in fv?[s,c]=fv.className:o in t&&([s,c]=t[o]),s==null)throw new K(`Unknown ${r}: ${o}. This may be due to one of the following reasons:\n1. The ${r} is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.\n2. The custom ${r} is defined in JavaScript, but is not registered properly with tf.serialization.registerClass().`);if(c!=null){let e={};for(let t of Object.keys(fv))e[t]=fv[t];for(let t of Object.keys(n))e[t]=n[t];let t=a.config;t.customObjects=e;let r=Object.assign({},fv);for(let e of Object.keys(n))fv[e]=n[e];mv(a.config);let o=c(s,a.config,n,i);return fv=Object.assign({},r),o}{let e=Object.assign({},fv);for(let e of Object.keys(n))fv[e]=n[e];let t=new s(a.config);return fv=Object.assign({},e),t}}}function gv(e,t){return e<t?-1:+(e>t)}function _v(e,t){return-1*gv(e,t)}function vv(e){if(e==null)return e;let t=[];for(let n of e)t.indexOf(n)===-1&&t.push(n);return t}function yv(e){if(e==null)throw new K(`Invalid value in obj: ${JSON.stringify(e)}`);for(let t in e)if(e.hasOwnProperty(t))return!1;return!0}function bv(e,t,n){if(n!=null&&e.indexOf(n)<0)throw new K(`${n} is not a valid ${t}.  Valid values are ${e} or null/undefined.`)}function xv(e,t,n=0,r=1/0){return ov(n>=0),ov(r>=n),Array.isArray(e)&&e.length>=n&&e.length<=r&&e.every(e=>typeof e===t)}function Sv(e,t){Array.isArray(e)?(m(e.length>0,()=>`${t} is unexpectedly an empty array.`),e.forEach((e,n)=>Sv(e,`element ${n+1} of ${t}`))):m(Number.isInteger(e)&&e>0,()=>`Expected ${t} to be a positive integer, but got ${Cv(e)}.`)}function Cv(e){return e===null?`null`:Array.isArray(e)?`[`+e.map(e=>Cv(e)).join(`,`)+`]`:typeof e==`string`?`"${e}"`:`${e}`}function wv(e,t,n){let r=n==null?ii():n(),i;return(...a)=>{let o=n==null?ii():n();return o-r<t?i:(r=o,i=e(...a),i)}}function Tv(e){return e===`relu`?`relu`:e===`linear`?`linear`:e===`elu`?`elu`:null}var Ev=0;function Dv(){return Ev++}var Ov={};function kv(e=``){return e in Ov||(Ov[e]=0),Ov[e]+=1,e+Ov[e].toString()}var Av=[`channelsFirst`,`channelsLast`],jv=[`nearest`,`bilinear`],Mv=[`valid`,`same`,`causal`],Nv=[`max`,`avg`],Pv=[`sum`,`mul`,`concat`,`ave`],Fv=new Map;function Iv(e){bv(Av,`DataFormat`,e)}function Lv(e){bv(jv,`InterpolationFormat`,e)}function Rv(e){bv(Mv,`PaddingMode`,e)}function zv(e){bv(Nv,`PoolMode`,e)}var Bv=[],Vv=`/`;function Hv(e,t){Bv.push(e);try{let e=t();return Bv.pop(),e}catch(e){throw Bv.pop(),e}}function Uv(){return Bv.length===0?``:Bv.join(Vv)+Vv}function Wv(e){if(!qv(e))throw Error(`Not a valid tensor name: '`+e+`'`);return Uv()+e}function Gv(e){if(!qv(e))throw Error(`Not a valid tensor name: '`+e+`'`);Fv.has(e)||Fv.set(e,0);let t=Fv.get(e);if(Fv.set(e,Fv.get(e)+1),t>0){let n=`${e}_${t}`;return Fv.set(n,1),n}return e}var Kv=new RegExp(/^[A-Za-z0-9][-A-Za-z0-9\._\/]*$/);function qv(e){return!!e.match(Kv)}function Jv(e){return e===parseInt(e.toString(),10)}function Yv(e,t,n){t??=0,n??=e.length;let r=1;for(let i=t;i<n;++i)r*=e[i];return r}function Xv(e){if(e.length===0)return NaN;let t=1/0;for(let n=0;n<e.length;n++){let r=e[n];r<t&&(t=r)}return t}function Zv(e){if(e.length===0)return NaN;let t=-1/0;for(let n=0;n<e.length;n++){let r=e[n];r>t&&(t=r)}return t}function Qv(e,t){if(t<e)throw new K(`end (${t}) < begin (${e}) is forbidden.`);let n=[];for(let r=e;r<t;++r)n.push(r);return n}var $v;function ey(){return $v??=_a().epsilon(),$v}function ty(){return`channelsLast`}function ny(e,t){return L(e,t)}function ry(e,t=-1){let n=e.shape.slice();return t<0&&(t=n.length+t+1),n.splice(t,0,1),V(e,n)}function iy(e,t){return P(()=>{if(e.shape.length!==2)throw new K(`repeat() expects a rank-2 tensor, but received a rank-${e.shape.length} tensor.`);return fy(ry(e,1),[1,t,1])})}function ay(e){return V(e,[Yv(e.shape)])}function oy(e){if(e.rank<=1)throw new K(`batchFlatten requires a minimum rank of 2. Got rank: ${e.rank}.`);return V(e,[e.shape[0],Yv(e.shape,1)])}function sy(e,t,n){return P(()=>{switch(e.rank){case 1:return Vd(e,t,n);case 2:return Ud(e,[t,0],[n,e.shape[1]]);case 3:return Gd(e,[t,0,0],[n,e.shape[1],e.shape[2]]);case 4:return qd(e,[t,0,0,0],[n,e.shape[1],e.shape[2],e.shape[3]]);case 5:return vs(e,[t,0,0,0,0],[n,e.shape[1],e.shape[2],e.shape[3],e.shape[4]]);case 6:return vs(e,[t,0,0,0,0,0],[n,e.shape[1],e.shape[2],e.shape[3],e.shape[4],e.shape[5]]);default:throw new K(`sliceAlongFirstAxis() received an unsupported tensor rank: ${e.rank}`)}})}function cy(e,t,n){return P(()=>{switch(e.rank){case 1:return Vd(e,t,n);case 2:return Ud(e,[0,t],[e.shape[0],n]);case 3:return Gd(e,[0,0,t],[e.shape[0],e.shape[1],n]);case 4:return qd(e,[0,0,0,t],[e.shape[0],e.shape[1],e.shape[2],n]);default:throw new K(`sliceAlongLastAxis() received an unsupported tensor rank: ${e.rank}`)}})}function ly(e,t,n,r){return P(()=>{switch(e.rank){case 1:return Vd(e,t,n);case 2:switch(r){case 1:return sy(e,t,n);case 2:return cy(e,t,n);default:throw new K(`The axis is not within the rank of the tensor ${r}`)}case 3:switch(r){case 1:return sy(e,t,n);case 2:return Gd(e,[0,t,0],[e.shape[0],n,e.shape[2]]);case 3:return cy(e,t,n);default:throw new K(`The axis is not within the rank of the tensor ${r}`)}case 4:switch(r){case 1:return sy(e,t,n);case 2:return qd(e,[0,t,0,0],[e.shape[0],n,e.shape[2],e.shape[3]]);case 3:return qd(e,[0,0,t,0],[e.shape[0],e.shape[1],n,e.shape[3]]);case 4:return cy(e,t,n);default:throw new K(`The axis is not within the rank of the tensor ${r}`)}default:throw new K(`sliceAlongLastAxis() received an unsupported tensor rank: ${e.rank}`)}})}function uy(e,t=-1){let n;return t<0&&(n=e[0].rank,t=n===0?0:n),t===e[0].rank&&(t=-1),fs(e,t)}function dy(e,t){switch(e.rank){case 1:return Hs([e,t]);case 2:return Ws([e,t],0);case 3:return Ks([e,t],0);case 4:return Js([e,t],0);default:throw new K(`concatAlongFirstAxis() received an unsupported tensor rank: ${e.rank}`)}}function fy(e,t){if(Array.isArray(t)||(t=[t]),e.rank!==t.length)throw new K(`The length of input n (${t.length}) does not match the number of dimensions in input x (${e.rank})`);return xl(e,t)}function py(e,t=0,n=1,r,i){return fd(e,t,n,r,i)}function my(e,t,n,r){if(e.rank<2||t.rank<2)throw new q(`dot requires both inputs to be rank >= 2 but got x shape = ${e.shape} and y shape = ${t.shape}`);if(t.rank>=3&&e.shape.slice(-1)[0]!==t.shape.slice(-2)[0])throw new q(`If rank y >= 3, then the second last dim of y must equal the last dim of x but got x shape = ${e.shape} and  y shape = ${t.shape}`);if(e.rank===2&&t.rank===2)return ep({a:e,b:t,transposeA:!1,transposeB:!1,bias:r?_y(e.rank,r,ty()):null,activation:n});{let i=e.shape.slice(),a=i.pop();e=V(e,[-1,a]);let o=t.shape.slice(),s=o.pop(),c=o.pop(),l=[...o,s],u=Array.from({length:t.rank},(e,n)=>n===0?t.rank-2:n<=t.rank-2?n-1:n);t=V(Lf(t,u),[c,-1]);let d=[...i,...l];return V(ep({a:e,b:t,transposeA:!1,transposeB:!1,bias:r?_y(e.rank,r,ty()):null,activation:n}),d)}}function hy(e,t,n){return P(()=>(t=Array.isArray(t)?yf(t,`int32`):L(t,`int32`),Dl(e,t,n)))}function gy(e){return B(e,e)}function _y(e,t,n){let r=t.shape;if(t.rank!==1&&t.rank!==e)throw new K(`Unexpected bias dimensions: ${t.rank}; expected it to be 1 or ${e}`);if(e===5){if(n===`channelsFirst`)return r.length===1?V(t,[1,r[0],1,1,1]):V(t,[1,r[3],r[0],r[1],r[2]]);if(n===`channelsLast`)return r.length===1?V(t,[1,1,1,1,r[0]]):V(t,[1].concat(r))}else if(e===4){if(n===`channelsFirst`)return r.length===1?V(t,[1,r[0],1,1]):V(t,[1,r[2],r[0],r[1]]);if(n===`channelsLast`)return r.length===1?V(t,[1,1,1,r[0]]):V(t,[1].concat(r))}else if(e===3){if(n===`channelsFirst`)return r.length===1?V(t,[1,r[0],1]):V(t,[1,r[1],r[0]]);if(n===`channelsLast`)return r.length===1?V(t,[1,1,r[0]]):V(t,[1].concat(r))}else if(e<3)return t;throw new K(`Unsupported input rank by biasAdd: ${t.rank}`)}function vy(e,t,n){return P(()=>(n??=ty(),Iv(n),R(e,_y(e.rank,t,n))))}function yy(e,t=1){if(t!==1)throw new q(`Support for alpha values other than 1 (${t}) is not implemented yet.`);return Bc(e)}function by(e){return P(()=>z(e,R(vo(e),1)))}function xy(e,t,n,r){return P(()=>Bf(e,t,n,r))}function Sy(e){return P(()=>Bs(R(.5,B(.2,e)),0,1))}function Cy(e,t,n=!1){return n?e():t()}var wy=[`fanIn`,`fanOut`,`fanAvg`],Ty=[`normal`,`uniform`,`truncatedNormal`];function Ey(e){bv(wy,`FanMode`,e)}function Dy(e){bv(Ty,`Distribution`,e)}var Oy=class extends tm{fromConfigUsesCustomObjects(){return!1}getConfig(){return{}}},ky=class extends Oy{apply(e,t){return Du(e,t)}};ky.className=`Zeros`,G(ky);var Ay=class extends Oy{apply(e,t){return Ou(e,t)}};Ay.className=`Ones`,G(Ay);var jy=class extends Oy{constructor(e){if(super(),typeof e!=`object`)throw new K(`Expected argument of type ConstantConfig but got ${e}`);if(e.value===void 0)throw new K(`config must have value set but got ${e}`);this.value=e.value}apply(e,t){return P(()=>B(rl(this.value),Ou(e,t)))}getConfig(){return{value:this.value}}};jy.className=`Constant`,G(jy);var My=class extends Oy{constructor(e){super(),this.DEFAULT_MINVAL=-.05,this.DEFAULT_MAXVAL=.05,this.minval=e.minval||this.DEFAULT_MINVAL,this.maxval=e.maxval||this.DEFAULT_MAXVAL,this.seed=e.seed}apply(e,t){return md(e,this.minval,this.maxval,t,this.seed)}getConfig(){return{minval:this.minval,maxval:this.maxval,seed:this.seed}}};My.className=`RandomUniform`,G(My);var Ny=class extends Oy{constructor(e){super(),this.DEFAULT_MEAN=0,this.DEFAULT_STDDEV=.05,this.mean=e.mean||this.DEFAULT_MEAN,this.stddev=e.stddev||this.DEFAULT_STDDEV,this.seed=e.seed}apply(e,t){if(t||=`float32`,t!==`float32`&&t!==`int32`)throw new q(`randomNormal does not support dType ${t}.`);return py(e,this.mean,this.stddev,t,this.seed)}getConfig(){return{mean:this.mean,stddev:this.stddev,seed:this.seed}}};Ny.className=`RandomNormal`,G(Ny);var Py=class extends Oy{constructor(e){super(),this.DEFAULT_MEAN=0,this.DEFAULT_STDDEV=.05,this.mean=e.mean||this.DEFAULT_MEAN,this.stddev=e.stddev||this.DEFAULT_STDDEV,this.seed=e.seed}apply(e,t){if(t||=`float32`,t!==`float32`&&t!==`int32`)throw new q(`truncatedNormal does not support dType ${t}.`);return Df(e,this.mean,this.stddev,t,this.seed)}getConfig(){return{mean:this.mean,stddev:this.stddev,seed:this.seed}}};Py.className=`TruncatedNormal`,G(Py);var Fy=class extends Oy{constructor(e){super(),this.gain=e.gain==null?1:e.gain}apply(e,t){return P(()=>{if(e.length!==2||e[0]!==e[1])throw new K(`Identity matrix initializer can only be used for 2D square matrices.`);return B(this.gain,Cl(e[0]))})}getConfig(){return{gain:this.gain}}};Fy.className=`Identity`,G(Fy);function Iy(e,t=`channelsLast`){let n,r;if(Iv(t),e.length===2)n=e[0],r=e[1];else if([3,4,5].indexOf(e.length)!==-1){if(t===`channelsFirst`){let t=Yv(e,2);n=e[1]*t,r=e[0]*t}else if(t===`channelsLast`){let t=Yv(e,0,e.length-2);n=e[e.length-2]*t,r=e[e.length-1]*t}}else{let t=Yv(e);n=Math.sqrt(t),r=Math.sqrt(t)}return[n,r]}var Ly=class extends Oy{constructor(e){if(super(),e.scale<0)throw new K(`scale must be a positive float. Got: ${e.scale}`);this.scale=e.scale==null?1:e.scale,this.mode=e.mode==null?`fanIn`:e.mode,Ey(this.mode),this.distribution=e.distribution==null?`normal`:e.distribution,Dy(this.distribution),this.seed=e.seed}apply(e,t){let n=Iy(e),r=n[0],i=n[1],a=this.scale;if(this.mode===`fanIn`?a/=Math.max(1,r):this.mode===`fanOut`?a/=Math.max(1,i):a/=Math.max(1,(r+i)/2),this.distribution===`normal`){let n=Math.sqrt(a);if(t||=`float32`,t!==`float32`&&t!==`int32`)throw new q(`${this.getClassName()} does not support dType ${t}.`);return Df(e,0,n,t,this.seed)}{let n=Math.sqrt(3*a);return md(e,-n,n,t,this.seed)}}getConfig(){return{scale:this.scale,mode:this.mode,distribution:this.distribution,seed:this.seed}}};Ly.className=`VarianceScaling`,G(Ly);var Ry=class extends Ly{constructor(e){super({scale:1,mode:`fanAvg`,distribution:`uniform`,seed:e==null?null:e.seed})}getClassName(){return Ly.className}};Ry.className=`GlorotUniform`,G(Ry);var zy=class extends Ly{constructor(e){super({scale:1,mode:`fanAvg`,distribution:`normal`,seed:e==null?null:e.seed})}getClassName(){return Ly.className}};zy.className=`GlorotNormal`,G(zy);var By=class extends Ly{constructor(e){super({scale:2,mode:`fanIn`,distribution:`normal`,seed:e==null?null:e.seed})}getClassName(){return Ly.className}};By.className=`HeNormal`,G(By);var Vy=class extends Ly{constructor(e){super({scale:2,mode:`fanIn`,distribution:`uniform`,seed:e==null?null:e.seed})}getClassName(){return Ly.className}};Vy.className=`HeUniform`,G(Vy);var Hy=class extends Ly{constructor(e){super({scale:1,mode:`fanIn`,distribution:`normal`,seed:e==null?null:e.seed})}getClassName(){return Ly.className}};Hy.className=`LeCunNormal`,G(Hy);var Uy=class extends Ly{constructor(e){super({scale:1,mode:`fanIn`,distribution:`uniform`,seed:e==null?null:e.seed})}getClassName(){return Ly.className}};Uy.className=`LeCunUniform`,G(Uy);var Wy=class extends Oy{constructor(e){super(),this.DEFAULT_GAIN=1,this.ELEMENTS_WARN_SLOW=2e3,this.gain=e.gain==null?this.DEFAULT_GAIN:e.gain,this.seed=e.seed}apply(e,t){return P(()=>{if(e.length<2)throw new q(`Shape must be at least 2D.`);if(t!==`int32`&&t!==`float32`&&t!==void 0)throw TypeError(`Unsupported data type ${t}.`);t=t;let n=_(e.slice(0,-1)),r=e[e.length-1],i=n*r;i>this.ELEMENTS_WARN_SLOW&&console.warn(`Orthogonal initializer is being called on a matrix with more than ${this.ELEMENTS_WARN_SLOW} (${i}) elements: Slowness may result.`);let a=py([Math.max(r,n),Math.min(r,n)],0,1,t,this.seed),o=Qp.qr(a,!1),s=o[0],c=o[1].flatten().stridedSlice([0],[Math.min(r,n)*Math.min(r,n)],[Math.min(r,n)+1]);return s=B(s,c.sign()),n<r&&(s=s.transpose()),B(rl(this.gain),s.reshape(e))})}getConfig(){return{gain:this.gain,seed:this.seed}}};Wy.className=`Orthogonal`,G(Wy);var Gy={constant:`Constant`,glorotNormal:`GlorotNormal`,glorotUniform:`GlorotUniform`,heNormal:`HeNormal`,heUniform:`HeUniform`,identity:`Identity`,leCunNormal:`LeCunNormal`,leCunUniform:`LeCunUniform`,ones:`Ones`,orthogonal:`Orthogonal`,randomNormal:`RandomNormal`,randomUniform:`RandomUniform`,truncatedNormal:`TruncatedNormal`,varianceScaling:`VarianceScaling`,zeros:`Zeros`};function Ky(e,t={}){return hv(e,nm.getMap().classNameMap,t,`initializer`)}function qy(e){return pv(e)}function Jy(e){if(typeof e==`string`){let t=e in Gy?Gy[e]:e;if(t===`GlorotNormal`)return new zy;if(t===`GlorotUniform`)return new Ry;if(t===`HeNormal`)return new By;if(t===`HeUniform`)return new Vy;if(t===`LeCunNormal`)return new Hy;if(t===`LeCunUniform`)return new Uy;{let e={};return e.className=t,e.config={},Ky(e)}}return e instanceof Oy?e:Ky(e)}function Yy(e){return Array.isArray(e)&&Array.isArray(e[0])}function Xy(e){return e.length===0?[]:Array.isArray(e[0])?e:[e]}function J(e){let t;if(Array.isArray(e)){if(e.length!==1)throw new K(`Expected Tensor length to be 1; got ${e.length}`);t=e[0]}else t=e;return t}function Zy(e){if(Array.isArray(e)&&Array.isArray(e[0])){if(e.length===1)return e=e,e[0];throw new K(`Expected exactly 1 Shape; got ${e.length}`)}return e}function Qy(e){let t=0;for(let n of e)n.shape.length===0?t+=1:t+=n.shape.reduce((e,t)=>e*t);return t}var $y=`Variable`,eb=class{constructor(e,t=`float32`,n=$y,r=!0,i=null){this.dtype=t??`float32`,this.shape=e.shape,this.id=Dv(),n??=$y,this.originalName=Wv(n),this.name=Gv(this.originalName),this.trainable_=r,this.constraint=i,this.val=Pf(e,this.trainable_,this.name,this.dtype)}read(){return this.assertNotDisposed(),this.val}write(e){return this.assertNotDisposed(),tb(this.val,e),this.val.id!==e.id&&(this.val.assign(e),this.constraint!=null&&this.val.assign(this.constraint.apply(this.val))),this}dispose(){this.assertNotDisposed(),this.val.dispose()}assertNotDisposed(){if(this.val.isDisposed)throw Error(`LayersVariable ${this.name} is already disposed.`)}get trainable(){return this.trainable_}set trainable(e){this.trainable_=e,this.val.trainable=e}};function tb(e,t){if(e.shape.toString()!==t.shape.toString())throw Error(`Shape mismatch: `+JSON.stringify(e.shape)+` vs. `+JSON.stringify(t.shape))}function nb(e){return e.map(e=>e.read())}function rb(e){e.forEach(e=>{e[0].write(e[1])})}var ib=class{constructor(e){this.dtype=e.dtype,this.shape=e.shape,this.ndim=e.shape==null?e.ndim:e.shape.length,this.maxNDim=e.maxNDim,this.minNDim=e.minNDim,this.axes=e.axes||{}}},ab=class{constructor(e,t,n,r,i,a,o){this.dtype=e,this.shape=t,this.sourceLayer=n,this.inputs=r,this.callArgs=i,this.outputTensorIndex=o,this.id=Dv(),a!=null&&(this.originalName=Wv(a),this.name=Gv(this.originalName)),this.rank=t.length}},ob=0,sb=class{constructor(e,t){this.callArgs=t,this.id=ob++,this.outboundLayer=e.outboundLayer,this.inboundLayers=e.inboundLayers,this.nodeIndices=e.nodeIndices,this.tensorIndices=e.tensorIndices,this.inputTensors=e.inputTensors,this.outputTensors=e.outputTensors,this.inputMasks=e.inputMasks,this.outputMasks=e.outputMasks,this.inputShapes=e.inputShapes,this.outputShapes=e.outputShapes;for(let t of e.inboundLayers)t?.outboundNodes.push(this);e.outboundLayer.inboundNodes.push(this)}getConfig(){let e=[];for(let t of this.inboundLayers)t==null?e.push(null):e.push(t.name);return{outboundLayer:this.outboundLayer?this.outboundLayer.name:null,inboundLayers:e,nodeIndices:this.nodeIndices,tensorIndices:this.tensorIndices}}},cb=0,Y=class extends tm{constructor(e={}){super(),this._callHook=null,this._addedWeightNames=[],this._stateful=!1,this.id=cb++,this.activityRegularizer=null,this.inputSpec=null,this.supportsMasking=!1,this._trainableWeights=[],this._nonTrainableWeights=[],this._losses=[],this._updates=[],this._built=!1,this.inboundNodes=[],this.outboundNodes=[];let t=e.name;if(!t){let e=this.getClassName();t=uv(e)+`_`+kv(e)}if(this.name=t,this.trainable_=e.trainable==null||e.trainable,e.inputShape!=null||e.batchInputShape!=null){let t;if(e.batchInputShape!=null)t=e.batchInputShape;else if(e.inputShape!=null){let n=null;e.batchSize!=null&&(n=e.batchSize),t=[n].concat(e.inputShape)}this.batchInputShape=t;let n=e.dtype;n??=e.inputDType,n??=`float32`,this.dtype=n}this.initialWeights=e.weights==null?null:e.weights,this._refCount=null,this.fastWeightInitDuringBuild=!1}static nodeKey(e,t){return e.name+`_ib-`+t.toString()}getNodeAtIndex(e,t){if(this.inboundNodes.length===0)throw new nv(`The layer has never been called and thus has no defined ${t}.`);if(this.inboundNodes.length<=e)throw new K(`Asked to get ${t} at node ${e}, but the layer has only ${this.inboundNodes.length} inbound nodes.`);return this.inboundNodes[e]}getInputAt(e){return cv(this.getNodeAtIndex(e,`input`).inputTensors)}getOutputAt(e){return cv(this.getNodeAtIndex(e,`output`).outputTensors)}get input(){if(this.inboundNodes.length>1)throw new tv(`Layer ${this.name} has multiple inbound nodes, hence the notion of "layer input" is ill-defined. Use \`getInputAt(nodeIndex)\` instead.`);if(this.inboundNodes.length===0)throw new tv(`Layer ${this.name} is not connected, no input to return.`);return cv(this.getNodeAtIndex(0,`input`).inputTensors)}get output(){if(this.inboundNodes.length===0)throw new tv(`Layer ${this.name} has no inbound nodes.`);if(this.inboundNodes.length>1)throw new tv(`Layer ${this.name} has multiple inbound nodes, hence the notion of "layer output" is ill-defined. Use \`getOutputAt(nodeIndex)\` instead.`);return cv(this.getNodeAtIndex(0,`output`).outputTensors)}get losses(){return this._losses}calculateLosses(){return this.losses.map(e=>e())}get updates(){return this._updates}get built(){return this._built}set built(e){this._built=e}get trainable(){return this.trainable_}set trainable(e){this._trainableWeights.forEach(t=>t.trainable=e),this.trainable_=e}get trainableWeights(){return this.trainable_?this._trainableWeights.filter(e=>e.trainable):[]}set trainableWeights(e){this._trainableWeights=e}get nonTrainableWeights(){return this.trainable?this._trainableWeights.filter(e=>!e.trainable).concat(this._nonTrainableWeights):this._trainableWeights.concat(this._nonTrainableWeights)}set nonTrainableWeights(e){this._nonTrainableWeights=e}get weights(){return this.trainableWeights.concat(this.nonTrainableWeights)}get stateful(){return this._stateful}resetStates(){if(!this.stateful)throw Error(`Cannot call the resetStates() method of a non-stateful Layer object.`)}assertInputCompatibility(e){let t=lv(e);if(this.inputSpec==null||this.inputSpec.length===0)return;let n=lv(this.inputSpec);if(t.length!==n.length)throw new K(`Layer ${this.name} expects ${n.length} inputs, but it received ${t.length} input tensors. Input received: ${e}`);for(let e=0;e<t.length;e++){let r=t[e],i=n[e];if(i==null)continue;let a=r.rank;if(i.ndim!=null&&a!==i.ndim)throw new K(`Input ${e} is incompatible with layer ${this.name}: expected ndim=${i.ndim}, found ndim=${a}`);if(i.maxNDim!=null&&a>i.maxNDim)throw new K(`Input ${e} is incompatible with layer ${this.name}: expected max_ndim=${i.maxNDim}, found ndim=${a}`);if(i.minNDim!=null&&a<i.minNDim)throw new K(`Input ${e} is incompatible with layer ${this.name}: expected min_ndim=${i.minNDim}, found ndim=${a}.`);if(i.dtype!=null&&r.dtype!==i.dtype)throw new K(`Input ${e} is incompatible with layer ${this.name} : expected dtype=${i.dtype}, found dtype=${r.dtype}.`);if(i.axes){let t=r.shape;for(let n in i.axes){let r=Number(n),a=i.axes[n],o=r>=0?t[r]:t[t.length+r];if(a!=null&&[a,null].indexOf(o)===-1)throw new K(`Input ${e} is incompatible with layer ${this.name}: expected axis ${r} of input shape to have value ${a} but got shape ${t}.`)}}if(i.shape!=null)for(let t=0;t<i.shape.length;++t){let n=i.shape[t],a=r.shape[t];if(n!=null&&a!=null&&n!==a)throw new K(`Input ${e} is incompatible with layer ${this.name}: expected shape=${i.shape}, found shape=${r.shape}.`)}}}call(e,t){return e}invokeCallHook(e,t){this._callHook!=null&&this._callHook(e,t)}setCallHook(e){this._callHook=e}clearCallHook(){this._callHook=null}apply(e,t){t||={},this.assertNotDisposed();let n=lv(e),r=fb(e),i=pb(e);if(r===i)throw new K(`Arguments to apply() must be all SymbolicTensors or all Tensors`);return Hv(this.name,()=>{if(!this.built){this.assertInputCompatibility(e);let t=[];for(let n of lv(e))t.push(n.shape);this.build(cv(t)),this.built=!0,this.initialWeights&&this.setWeights(this.initialWeights),this._refCount===null&&i&&(this._refCount=1)}if(this.assertInputCompatibility(e),i){let r=this.call(e,t);this.supportsMasking&&this.setMaskMetadata(e,r);let i=lv(r),a=[];for(let e of i)n.indexOf(e)!==-1&&(e=e.clone()),a.push(e);if(r=cv(a),this.activityRegularizer!=null)throw new q(`Layer invocation in the presence of activity regularizer(s) is not supported yet.`);return r}{let n=lb(e),r=this.computeOutputShape(n),i,a=ub(e);if(this.warnOnIncompatibleInputShape(Array.isArray(e)?n[0]:n),i=r!=null&&r.length>0&&Array.isArray(r[0])?r.map((n,r)=>new ab(a,n,this,lv(e),t,this.name,r)):new ab(a,r,this,lv(e),t,this.name),this.addInboundNode(e,i,null,null,n,r,t),this._refCount++,this.activityRegularizer!=null)throw new q(`Layer invocation in the presence of activity regularizer(s) is not supported yet.`);return i}})}warnOnIncompatibleInputShape(e){if(this.batchInputShape!=null)if(e.length!==this.batchInputShape.length)console.warn(`The rank of the input tensor provided (shape: ${JSON.stringify(e)}) does not match that of the batchInputShape (${JSON.stringify(this.batchInputShape)}) of the layer ${this.name}`);else{let t=!1;this.batchInputShape.forEach((n,r)=>{n!=null&&e[r]!=null&&e[r]!==n&&(t=!0)}),t&&console.warn(`The shape of the input tensor (${JSON.stringify(e)}) does not match the expectation of layer ${this.name}: ${JSON.stringify(this.batchInputShape)}`)}}get outputShape(){if(this.inboundNodes==null||this.inboundNodes.length===0)throw new tv(`The layer ${this.name} has never been called and thus has no defined output shape.`);let e=[];for(let t of this.inboundNodes){let n=JSON.stringify(t.outputShapes);e.indexOf(n)===-1&&e.push(n)}if(e.length===1){let e=this.inboundNodes[0].outputShapes;return Array.isArray(e)&&Array.isArray(e[0])&&e.length===1?e[0]:e}throw new tv(`The layer ${this.name} has multiple inbound nodes with different output shapes. Hence the notion of "output shape" is ill-defined for the layer.`)}countParams(){if(!this.built)throw new nv(`You tried to call countParams() on ${this.name}, but the layer is not built yet. Build it first by calling build(batchInputShape).`);return Qy(this.weights)}build(e){this.built=!0}getWeights(e=!1){return nb(e?this.trainableWeights:this.weights)}setWeights(e){P(()=>{let t=this.weights;if(t.length!==e.length)throw new K(`You called setWeights(weights) on layer "${this.name}" with a weight list of length ${e.length}, but the layer was expecting ${t.length} weights. Provided weights: ${e}...`);if(t.length===0)return;let n=[],r=nb(t);for(let i=0;i<r.length;++i){let a=r[i],o=t[i],s=e[i];if(!v(a.shape,s.shape))throw new K(`Layer weight shape ${a.shape} not compatible with provided weight shape ${s.shape}`);n.push([o,s])}rb(n)})}addWeight(e,t,n,r,i,a,o,s){if(this._addedWeightNames.indexOf(e)!==-1)throw new K(`Duplicate weight name ${e} for layer ${this.name}`);this._addedWeightNames.push(e),n??=`float32`,this.fastWeightInitDuringBuild&&(r=s==null?Jy(`zeros`):s());let c=r.apply(t,n),l=new eb(c,n,e,a,o);return c.dispose(),i!=null&&this.addLoss(()=>i.apply(l.read())),a??=!0,a?this._trainableWeights.push(l):this._nonTrainableWeights.push(l),l}setFastWeightInitDuringBuild(e){this.fastWeightInitDuringBuild=e}addLoss(e){e==null||Array.isArray(e)&&e.length===0||(e=lv(e),this._losses!==void 0&&this._losses!==null&&this.losses.push(...e))}computeOutputShape(e){return e}computeMask(e,t){if(!this.supportsMasking){if(t!=null)if(Array.isArray(t))t.forEach(e=>{if(e!=null)throw TypeError(`Layer ${this.name} does not support masking, but was passed an inputMask.`)});else throw TypeError(`Layer ${this.name} does not support masking, but was passed an inputMask.`);return null}return t}setMaskMetadata(e,t,n){if(!this.supportsMasking)return;let r=this.computeMask(e,n),i=lv(t),a=lv(r);if(i.length!==a.length)throw Error(`${this.name} outputs ${i.length} tensors but ${i.length} masks for those tensors`);for(let e=0;e<i.length;e++)i[e].kerasMask=a[e]}addInboundNode(e,t,n,r,i,a,o=null){let s=lv(e);t=lv(t),n=lv(n),r=lv(r),i=Xy(i),a=Xy(a);let c=[],l=[],u=[];for(let e of s)c.push(e.sourceLayer),l.push(e.nodeIndex),u.push(e.tensorIndex);new sb({outboundLayer:this,inboundLayers:c,nodeIndices:l,tensorIndices:u,inputTensors:s,outputTensors:t,inputMasks:n,outputMasks:r,inputShapes:i,outputShapes:a},o);for(let e=0;e<t.length;e++)t[e].sourceLayer=this,t[e].nodeIndex=this.inboundNodes.length-1,t[e].tensorIndex=e}getConfig(){let e={name:this.name,trainable:this.trainable};return this.batchInputShape!=null&&(e.batchInputShape=this.batchInputShape),this.dtype!=null&&(e.dtype=this.dtype),e}disposeWeights(){return this.weights.forEach(e=>e.dispose()),this.weights.length}assertNotDisposed(){if(this._refCount===0)throw Error(`Layer '${this.name}' is already disposed.`)}dispose(){if(!this.built)throw Error(`Cannot dispose Layer ${this.name} because it has not been built yet.`);if(this._refCount===null)throw Error(`Cannot dispose Layer ${this.name} because it has not been used yet.`);this.assertNotDisposed();let e=0;return--this._refCount===0&&(e=this.disposeWeights()),{refCountAfterDispose:this._refCount,numDisposedVariables:e}}};function lb(e){e=lv(e);let t=[];for(let n of e)t.push(n.shape);return cv(t)}function ub(e){return`float32`}function db(e,t,n){if((t==null||n!=null&&n>0)&&(t=e.sourceLayer,n=e.nodeIndex),t.inboundNodes.length===0)return[e];{let e=t.inboundNodes[n];if(e.inboundLayers.length===0)return e.inputTensors;{let t=[];for(let n=0;n<e.inboundLayers.length;n++){let r=e.inputTensors[n],i=e.inboundLayers[n],a=e.nodeIndices[n],o=db(r,i,a);for(let e of o)t.indexOf(e)===-1&&t.push(e)}return t}}}function fb(e){let t=!0;for(let n of lv(e))if(!(n instanceof ab)){t=!1;break}return t}function pb(e){let t=!0;for(let n of lv(e))if(n instanceof ab){t=!1;break}return t}var mb=class extends Y{constructor(e){if(super({dtype:e.dtype,name:e.name==null?kv(`input`).toString():e.name}),e.batchSize??=null,e.sparse??=!1,this.trainable=!1,this.built=!0,this.sparse=e.sparse,e.inputShape!=null&&e.batchInputShape!=null)throw new K(`Only provide the inputShape OR batchInputShape argument to inputLayer, not both at the same time.`);let t=e.batchInputShape;if(t==null){if(e.inputShape==null)throw new K("An InputLayer should be passed either a `batchInputShape` or an `inputShape`.");t=[e.batchSize].concat(e.inputShape)}else if(e.batchSize!=null)throw new K(`Cannot specify batchSize if batchInputShape is specified when creating an InputLayer.`);let n=e.dtype||`float32`;this.batchInputShape=t,this.dtype=n,this.inputSpec=[{shape:t}];let r=new ab(this.dtype,this.batchInputShape,this,[],{},this.name);r.nodeIndex=0,r.tensorIndex=0,new sb({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:[r],outputTensors:[r],inputMasks:[null],outputMasks:[null],inputShapes:[t],outputShapes:[t]})}apply(e,t){throw new K(`Cannot pass any input to an InputLayer's apply() method. InputLayer name: ${this.name}`)}dispose(){return{refCountAfterDispose:this._refCount,numDisposedVariables:0}}getConfig(){return{batchInputShape:this.batchInputShape,dtype:this.dtype,sparse:this.sparse,name:this.name}}};mb.className=`InputLayer`,G(mb);function hb(e){if(e.batchShape==null&&e.shape==null)throw Error("Please provide to Input either a `shape` or a `batchShape` argument. Note that `shape` does not include the batch dimension.");if(e.batchShape!=null&&e.shape!=null)throw new K("Please provide either a `shape` or `batchShape` argument to Input, but not both.");let t=e.batchShape;e.shape!=null&&t==null&&(t=[null].concat(e.shape));let n=e.dtype;return n??=`float32`,new mb({batchInputShape:t,name:e.name,dtype:n,sparse:e.sparse}).inboundNodes[0].outputTensors[0]}function gb(e,t){if(e.dtype==null||e.dtype===t.dtype)return t;try{return L(t,e.dtype)}catch{throw new K(`The dtype of the feed (${t.dtype}) can not be cast to the dtype of the key '${e.name}' (${e.dtype}).`)}}var _b=class e{constructor(t){if(this.id2Value={},this.id2Mask={},this.name2Id={},t instanceof e)for(let e in t.id2Value)this.id2Value[e]=t.id2Value[e],e in t.id2Mask&&(this.id2Mask[e]=t.id2Mask[e]);else{if(t==null)return;for(let e of t)this.add(e.key,e.value)}}add(e,t,n){if(this.id2Value[e.id]==null)this.id2Value[e.id]=gb(e,t),this.name2Id[e.name]=e.id,n!=null&&(this.id2Mask[e.id]=n);else throw new K(`Duplicate key: name=${e.name}, id=${e.id}`);return this}addFeed(e){this.add(e.key,e.value)}hasKey(e){return this.id2Value[e.id]!=null}names(){return Object.keys(this.name2Id)}getValue(e){if(e instanceof ab){if(this.id2Value[e.id]==null)throw new K(`Nonexistent key: ${e.name}`);return this.id2Value[e.id]}{let t=this.name2Id[e];if(t==null)throw new K(`Feed dict has no SymbolicTensor name: ${e}`);return this.id2Value[t]}}getMask(e){if(e instanceof ab){if(this.id2Value[e.id]==null)throw new K(`Nonexistent key: ${e.name}`);return this.id2Mask[e.id]}{let t=this.name2Id[e];if(t==null)throw new K(`Feed dict has no SymbolicTensor name: ${e}`);return this.id2Mask[t]}}disposeMasks(){this.id2Mask!=null&&F(this.id2Mask)}},vb=new iv,yb=new iv;function bb(e){vb?.setMaxEntries(e),yb?.setMaxEntries(e)}function xb(e,t,n,r){let i=n!=null&&n.training,a=Array.isArray(e),o=a?e:[e],s=o.map(e=>e.name),c=[],l=t.names();for(let e of s)l.indexOf(e)===-1?c.push(null):c.push(t.getValue(e));r!=null&&(r.maxNumTensors=-1/0,r.minNumTensors=1/0);let u=s.join(`,`)+`|`+t.names().sort().join(`,`),d=vb.get(u),f;if(d==null){let e=Sb(o,t);d=e.sorted,f=e.recipientCounts,vb.put(u,d),yb.put(u,f)}f={},i||Object.assign(f,yb.get(u));let p=new _b(t);for(let e=0;e<d.length;++e){if(r!=null){let e=ma().numTensors;e>r.maxNumTensors&&(r.maxNumTensors=e),e<r.minNumTensors&&(r.minNumTensors=e)}let a=d[e],o=a.sourceLayer;if(o instanceof mb)continue;let l=[],u=[],m=[],h=!1;for(let e of a.inputs){let n=p.getValue(e),r=p.getMask(e);l.push(n),u.push(r),r!=null&&(h=!0),i||(f[e.name]--,f[e.name]===0&&!t.hasKey(e)&&s.indexOf(e.name)===-1&&!n.isDisposed&&e.sourceLayer.stateful!==!0&&m.push(n))}h&&(n||={},n.mask=u[0]);let g=lv(o.apply(l,n)),_=null;o.supportsMasking&&(_=o.computeMask(l,u));let v=Tb(a),y=Array.isArray(v)?v:[v];for(let e=0;e<y.length;++e){p.hasKey(y[e])||p.add(y[e],g[e],Array.isArray(_)?_[0]:_);let t=s.indexOf(y[e].name);t!==-1&&(c[t]=g[e])}i||F(m)}return p.disposeMasks(),a?c:c[0]}function Sb(e,t){m(e!=null&&e.length>0,()=>`Expected at least one fetch, got none`);let n=[],r={};if(e.length===1){let i=wb(e[0],t);n=i.sorted,r=i.recipientMap}else{let i=new Set;for(let a of e){let{sorted:e,recipientMap:o}=wb(a,t);for(let t of e)i.has(t.name)||(n.push(t),i.add(t.name));for(let e in o)r[e]??(r[e]=new Set),o[e].forEach(t=>r[e].add(t))}}return{sorted:n,recipientCounts:Cb(r)}}function Cb(e){let t={};for(let n in e)t[n]=e[n].size;return t}function wb(e,t){let n=new Set,r=[],i={};for(let e of t.names())n.add(e);let a=[],o=[];for(a.push(e);a.length>0;){let e=a[a.length-1];if(n.has(e.name)){a.pop();continue}let t=o[o.length-1]===a.length-1;if(e.inputs.length===0||t)a.pop(),r.push(e),n.add(e.name),t&&o.pop();else{o.push(a.length-1);for(let t of e.inputs)i[t.name]??(i[t.name]=new Set),i[t.name].add(e.name),!n.has(t.name)&&a.push(t)}}return{sorted:r,recipientMap:i}}function Tb(e){let t;if(e.sourceLayer.inboundNodes.length===1)t=e.sourceLayer.output;else{let n=null;for(let t=0;t<e.sourceLayer.inboundNodes.length;++t)for(let r of e.sourceLayer.inboundNodes[t].outputTensors)if(r.id===e.id){n=t;break}t=e.sourceLayer.getOutputAt(n)}return t}k().registerFlag(`TOPOLOGICAL_SORT_CACHE_MAX_ENTRIES`,()=>100,bb);function Eb(e,t){return P(()=>al(U(B(e,e),t,!0)))}var Db=class extends tm{getConfig(){return{}}},Ob=class extends Db{constructor(e){super(),this.defaultMaxValue=2,this.defaultAxis=0,this.maxValue=e.maxValue==null?this.defaultMaxValue:e.maxValue,this.axis=e.axis==null?this.defaultAxis:e.axis}apply(e){return P(()=>{let t=Eb(e,this.axis);return B(e,z(Bs(t,0,this.maxValue),R(ey(),t)))})}getConfig(){return{maxValue:this.maxValue,axis:this.axis}}};Ob.className=`MaxNorm`,G(Ob);var kb=class extends Db{constructor(e){super(),this.defaultAxis=0,this.axis=e.axis==null?this.defaultAxis:e.axis}apply(e){return P(()=>z(e,R(ey(),Eb(e,this.axis))))}getConfig(){return{axis:this.axis}}};kb.className=`UnitNorm`,G(kb);var Ab=class extends Db{apply(e){return xd(e)}};Ab.className=`NonNeg`,G(Ab);var jb=class extends Db{constructor(e){super(),this.defaultMinValue=0,this.defaultMaxValue=1,this.defaultRate=1,this.defaultAxis=0,this.minValue=e.minValue==null?this.defaultMinValue:e.minValue,this.maxValue=e.maxValue==null?this.defaultMaxValue:e.maxValue,this.rate=e.rate==null?this.defaultRate:e.rate,this.axis=e.axis==null?this.defaultAxis:e.axis}apply(e){return P(()=>{let t=Eb(e,this.axis);return B(e,z(R(B(this.rate,Bs(t,this.minValue,this.maxValue)),B(1-this.rate,t)),R(ey(),t)))})}getConfig(){return{minValue:this.minValue,maxValue:this.maxValue,rate:this.rate,axis:this.axis}}};jb.className=`MinMaxNorm`,G(jb);var Mb={maxNorm:`MaxNorm`,minMaxNorm:`MinMaxNorm`,nonNeg:`NonNeg`,unitNorm:`UnitNorm`};function Nb(e){return pv(e)}function Pb(e,t={}){return hv(e,nm.getMap().classNameMap,t,`constraint`)}function Fb(e){return e==null?null:typeof e==`string`?Pb({className:e in Mb?Mb[e]:e,config:{}}):e instanceof Db?e:Pb(e)}async function Ib(e){if(e==null)return;let t=[],n=[],r=[];for(let i in e){let a=e[i];if(typeof a!=`number`){let e=a;t.push(e.data()),n.push(i),r.push(e)}}if(t.length>0){let i=await Promise.all(t);for(let t=0;t<i.length;++t)e[n[t]]=i[t][0];F(r)}}function Lb(e){if(e!=null)for(let t in e){let n=e[t];typeof n!=`number`&&n.dispose()}}var Rb;(function(e){e[e.SILENT=0]=`SILENT`,e[e.VERBOSE=1]=`VERBOSE`})(Rb||={});var zb=class{constructor(){this.validationData=null}setParams(e){this.params=e}async onEpochBegin(e,t){}async onEpochEnd(e,t){}async onBatchBegin(e,t){}async onBatchEnd(e,t){}async onTrainBegin(e){}async onTrainEnd(e){}setModel(e){}},Bb=class{constructor(e,t=10){e??=[],this.callbacks=e,this.queueLength=t}append(e){this.callbacks.push(e)}setParams(e){for(let t of this.callbacks)t.setParams(e)}setModel(e){for(let t of this.callbacks)t.setModel(e)}async onEpochBegin(e,t){t??={};for(let n of this.callbacks)await n.onEpochBegin(e,t)}async onEpochEnd(e,t){t??={};for(let n of this.callbacks)await n.onEpochEnd(e,t)}async onBatchBegin(e,t){t??={};for(let n of this.callbacks)await n.onBatchBegin(e,t)}async onBatchEnd(e,t){t??={};for(let n of this.callbacks)await n.onBatchEnd(e,t)}async onTrainBegin(e){e??={};for(let t of this.callbacks)await t.onTrainBegin(e)}async onTrainEnd(e){e??={};for(let t of this.callbacks)await t.onTrainEnd(e)}},Vb=class extends zb{constructor(){super()}async onEpochBegin(e){this.seen=0,this.totals={}}async onBatchEnd(e,t){t??={};let n=t.size==null?0:t.size;this.seen+=n;for(let e in t){let r=t[e];if(typeof r==`number`)this.totals.hasOwnProperty(e)||(this.totals[e]=0),this.totals[e]=this.totals[e]+r*n;else{let t;e in this.totals?t=this.totals[e]:this.totals[e]=0;let i=P(()=>R(this.totals[e],B(r,n)));this.totals[e]=i,t?.dispose()}}}async onEpochEnd(e,t){if(t!=null)for(let e of this.params.metrics)this.totals[e]!=null&&(typeof this.totals[e]==`number`?t[e]=this.totals[e]/this.seen:P(()=>{let n=B(z(1,this.seen),this.totals[e]);t[e]=n,this.totals[e].dispose(),ha(t[e])}))}},Hb=class extends zb{async onTrainBegin(e){this.epoch=[],this.history={}}async onEpochEnd(e,t){t??={},this.epoch.push(e);for(let e in t)this.history[e]??(this.history[e]=[]),this.history[e].push(t[e])}async syncData(){let e=[],t=[],n=[];for(let r in this.history){let i=this.history[r];for(let a=0;a<i.length;++a)if(typeof i[a]!=`number`){let o=i[a];e.push(o.data()),t.push(r),n.push(a)}}let r=await Promise.all(e);for(let e=0;e<r.length;++e)this.history[t[e]][n[e]].dispose(),this.history[t[e]][n[e]]=r[e][0]}},Ub=class extends zb{constructor(e,t){if(super(),this.currentEpoch=0,this.nowFunc=e.nowFunc,this.nextFrameFunc=e.nextFrameFunc||Lm,this.yieldEvery=t||`auto`,this.yieldEvery===`auto`&&(this.yieldEvery=125),this.yieldEvery===`never`&&e.onYield!=null)throw Error("yieldEvery is `never` but you provided an `onYield` callback. Either change `yieldEvery` or remove the callback");se(this.yieldEvery)&&(this.maybeWait=wv(this.maybeWait.bind(this),this.yieldEvery,this.nowFunc)),this.trainBegin=e.onTrainBegin,this.trainEnd=e.onTrainEnd,this.epochBegin=e.onEpochBegin,this.epochEnd=e.onEpochEnd,this.batchBegin=e.onBatchBegin,this.batchEnd=e.onBatchEnd,this.yield=e.onYield}async maybeWait(e,t,n){let r=[];this.yield!=null&&(await Ib(n),r.push(this.yield(e,t,n))),r.push(this.nextFrameFunc()),await Promise.all(r)}async onEpochBegin(e,t){this.currentEpoch=e,this.epochBegin!=null&&(await Ib(t),await this.epochBegin(e,t))}async onEpochEnd(e,t){let n=[];this.epochEnd!=null&&(await Ib(t),n.push(this.epochEnd(e,t))),this.yieldEvery===`epoch`&&n.push(this.nextFrameFunc()),await Promise.all(n)}async onBatchBegin(e,t){this.batchBegin!=null&&(await Ib(t),await this.batchBegin(e,t))}async onBatchEnd(e,t){let n=[];this.batchEnd!=null&&(await Ib(t),n.push(this.batchEnd(e,t))),this.yieldEvery===`batch`?n.push(this.nextFrameFunc()):se(this.yieldEvery)&&n.push(this.maybeWait(this.currentEpoch,e,t)),await Promise.all(n)}async onTrainBegin(e){this.trainBegin!=null&&(await Ib(e),await this.trainBegin(e))}async onTrainEnd(e){this.trainEnd!=null&&(await Ib(e),await this.trainEnd(e))}};function Wb(e,t){return e??={},e instanceof zb?[e]:Array.isArray(e)&&e[0]instanceof zb?e:lv(e).map(e=>new Ub(e,t))}var Gb=class e{constructor(){}static registerCallbackConstructor(t,n){m(t>=0&&Number.isInteger(t),()=>`Verbosity level is expected to be an integer >= 0, but got ${t}`),e.checkForDuplicate(n),e.constructors[t]??(e.constructors[t]=[]),e.constructors[t].push(n)}static checkForDuplicate(t){for(let n in e.constructors)e.constructors[+n].forEach(e=>{if(e===t)throw new K(`Duplicate callback constructor.`)})}static clear(){e.constructors={}}static createCallbacks(t){let n=[];for(let r in e.constructors){let i=+r;t>=i&&n.push(...e.constructors[i])}return n.map(e=>new e)}};Gb.constructors={};function Kb(e,t,n,r,i,a,o,s,c){let l=new Hb,u=[new Vb,...Gb.createCallbacks(t)];e!=null&&u.push(...e),u.push(l);let d=new Bb(u);return d.setParams({epochs:n,initialEpoch:r,samples:i,steps:a,batchSize:o,verbose:t,doValidation:s,metrics:c}),{callbackList:d,history:l}}function qb(e,t={},n=!1){return hv(e,nm.getMap().classNameMap,t,`layer`,n)}function Jb(e,t){return P(()=>{e.dtype!==`float32`&&(e=L(e,`float32`));let n=U(gy(e),t,!0),r=al(wu(n,Rs(n.shape,ey())));return z(e,r)})}function Yb(e,t){return P(()=>Eu(gy(W(t,e)),-1))}function Xb(e,t){return P(()=>Eu(vo(W(t,e)),-1))}function Zb(e,t){return P(()=>B(100,Eu(vo(z(W(e,t),Bs(vo(e),ey(),Number.MAX_VALUE))),-1)))}function Qb(e,t){return P(()=>Eu(gy(W(Yl(R(1,Bs(t,ey(),Number.MAX_VALUE))),Yl(R(1,Bs(e,ey(),Number.MAX_VALUE))))),-1))}function $b(e,t){return P(()=>Eu(gy(wu(0,W(1,B(e,t)))),-1))}function ex(e,t){return P(()=>Eu(wu(0,W(1,B(e,t))),-1))}function tx(e,t){return P(()=>{let n=U(B(e,t),-1);return wu(0,R(1,W(Qc(B(W(1,e),t),-1),n)))})}function nx(e,t){return P(()=>{let n=Math.log(2),r=W(t,e);return Eu(W(R(r,ru(B(-2,r))),n),-1)})}function rx(e,t,n=!1){return P(()=>{if(n)t=Yd(t);else{let e=U(t,t.shape.length-1,!0);t=z(t,e)}return t=Bs(t,ey(),1-ey()),tu(U(B(L(e,`float32`),Yl(t)),t.shape.length-1))})}function ix(e,t,n=!1){return P(()=>{let r=L(Tl(ay(e)),`int32`);t=Bs(t,ey(),1-ey());let i=t.shape;return rx(V(Bu(r,i[i.length-1]),i),t,n)})}function ax(e,t){if(!v(e.shape,t.shape))throw new K(`logits and labels must have the same shape, but got shapes ${JSON.stringify(e.shape)} and ${JSON.stringify(t.shape)}`);return P(()=>{let n=xd(t),r=tu(vo(t));return R(W(n,B(t,e)),Zl(hl(r)))})}function ox(e,t){return P(()=>{let n;return n=Bs(t,ey(),1-ey()),n=Yl(z(n,W(1,n))),Eu(ax(e,n),-1)})}function sx(e,t){return P(()=>U(B(e,Yl(z(Bs(e,ey(),1),Bs(t,ey(),1)))),-1))}function cx(e,t){return P(()=>Eu(W(t,B(e,Yl(R(ey(),t)))),-1))}function lx(e,t){return P(()=>tu(U(B(Jb(e,-1),Jb(t,-1)),-1)))}var ux={meanSquaredError:Yb,meanAbsoluteError:Xb,meanAbsolutePercentageError:Zb,meanSquaredLogarithmicError:Qb,squaredHinge:$b,hinge:ex,categoricalHinge:tx,logcosh:nx,categoricalCrossentropy:rx,sparseCategoricalCrossentropy:ix,binaryCrossentropy:ox,kullbackLeiblerDivergence:sx,poisson:cx,cosineProximity:lx};function dx(e){if(typeof e==`string`){if(e in ux)return ux[e];let t=`Unknown loss ${e}`;throw e.toLowerCase().includes(`softmaxcrossentropy`)&&(t=`Unknown loss ${e}. Use "categoricalCrossentropy" as the string name for tf.losses.softmaxCrossEntropy`),new K(t)}return e}function fx(e,t){return P(()=>Eu(Oc(e,ny(kl(t,B(.5,Hu(t))),e.dtype)),-1))}function px(e,t){return P(()=>ny(Oc(Oo(e,-1),Oo(t,-1)),`float32`))}function mx(e,t){return P(()=>L(U(fu(Oc(e,1),Oc(t,1))),`float32`))}function hx(e,t){return P(()=>L(U(fu(Oc(e,0),Oc(t,1))),`float32`))}function gx(e,t){return P(()=>{let n=mx(e,t),r=R(n,hx(e,t));return L(Ac(kl(r,0),z(n,r),0),`float32`)})}function _x(e,t){return ox(e,t)}function vx(e,t){return e.rank===t.rank&&(e=uf(e,[e.rank-1])),t=Oo(t,-1),t.dtype!==e.dtype&&(t=L(t,e.dtype)),L(Oc(e,t),`float32`)}var yx=Yb,bx=Yb,xx=Xb,Sx=Xb,Cx=Zb,wx=Zb,Tx=rx,Ex=lx,Dx=ix,Ox={binaryAccuracy:fx,categoricalAccuracy:px,precision:gx,categoricalCrossentropy:Tx,sparseCategoricalCrossentropy:Dx,mse:yx,MSE:bx,mae:xx,MAE:Sx,mape:Cx,MAPE:wx,cosine:Ex};function kx(e){if(typeof e==`string`&&e in Ox)return Ox[e];if(typeof e!=`string`&&e!=null)return e;throw new K(`Unknown metric ${e}`)}function Ax(e){if(ov(e!==null,`Unknown LossOrMetricFn ${e}`),typeof e==`string`)return e;{let t;for(let n of Object.keys(ux))if(ux[n]===e){t=n;break}if(t!==void 0)return t;for(let n of Object.keys(Ox))if(Ox[n]===e){t=n;break}return t===void 0?e.name:t}}function jx(e){let t={Adagrad:()=>Fm.adagrad(.01),Adadelta:()=>Fm.adadelta(1,.95,ey()),Adam:()=>Fm.adam(.001,.9,.999,ey()),Adamax:()=>Fm.adamax(.002,.9,.999,ey(),0),RMSProp:()=>Fm.rmsprop(.001,.9,0,ey()),SGD:()=>Fm.sgd(.01)};if(t.adagrad=t.Adagrad,t.adadelta=t.Adadelta,t.adam=t.Adam,t.adamax=t.Adamax,t.rmsprop=t.RMSProp,t.sgd=t.SGD,e in t)return t[e]();throw new K(`Unknown Optimizer ${e}`)}var Mx=1048576;function Nx(e,t,n=!1){if(typeof e!=`object`||!e||Object.getPrototypeOf(e)!==Object.prototype||!Px(e))throw Error(`User-defined metadata is expected to be a JSON object, but is not.`);if(n){let n=JSON.stringify(e);n.length>1048576&&console.warn(`User-defined metadata of model "${t}" is too large in size (length=${n.length} when serialized). It is not recommended to store such large objects in user-defined metadata. Please make sure its serialized length is <= ${Mx}.`)}}function Px(e){if(e===null)return!0;if(typeof e==`object`)if(Object.getPrototypeOf(e)===Object.prototype){let t=Object.keys(e);for(let n of t)if(typeof n!=`string`||!Px(e[n]))return!1;return!0}else if(Array.isArray(e)){for(let t of e)if(!Px(t))return!1;return!0}else return!1;{let t=typeof e;return t===`string`||t===`number`||t===`boolean`}}function Fx(e,t,n,r=console.log){let i=Lx(e),a=[`Layer (type)`,`Input Shape`,`Output shape`,`Param #`];i?(t||=90,n||=[.32,.61,.89,1]):(t||=115,n||=[.24,.48,.7,.8,1]),n[n.length-1]<=1&&(n=n.map(e=>Math.floor(t*e)));let o;if(!i){a.push(`Receives inputs`),o=[];for(let t in e.nodesByDepth)o.push(...e.nodesByDepth[t])}r(`_`.repeat(t)),Rx(a,n,r),r(`=`.repeat(t));let s=e.layers;for(let e=0;e<s.length;++e)i?zx(s[e],n,r):Bx(s[e],n,o,r),r((e===s.length-1?`=`:`_`).repeat(t));e.checkTrainableWeightsConsistency();let c=Ix(e),l=Qy(e.nonTrainableWeights);r(`Total params: ${c+l}`),r(`Trainable params: ${c}`),r(`Non-trainable params: ${l}`),r(`_`.repeat(t))}function Ix(e){let t;return t=e.collectedTrainableWeights==null?Qy(e.trainableWeights):Qy(e.collectedTrainableWeights),t}function Lx(e){let t=!0,n=[],r=[];for(let t in e.nodesByDepth)n.push(e.nodesByDepth[t]);for(let e of n){if(e.length>1||e.length===1&&e[0].inboundLayers.length>1){t=!1;break}r.push(...e)}if(t)for(let n of e.layers){let e=!1;for(let i of n.inboundNodes)if(r.indexOf(i)!==-1)if(e){t=!1;break}else e=!0;if(!t)break}return t}function Rx(e,t,n=console.log){let r=``;for(let n=0;n<e.length;++n)n>0&&(r=r.slice(0,r.length-1)+` `),r+=e[n],r=r.slice(0,t[n]),r+=` `.repeat(t[n]-r.length);n(r)}function zx(e,t,n){let r,i;try{i=e.inboundNodes.map(e=>JSON.stringify(e.inputShapes)).join(`,`)}catch{i=`multiple`}try{r=JSON.stringify(e.outputShape)}catch{r=`multiple`}Rx([`${e.name} (${e.getClassName()})`,i,r,e.countParams().toString()],t,n)}function Bx(e,t,n,r){let i,a;try{a=e.inboundNodes.map(e=>JSON.stringify(e.inputShapes)).join(`,`)}catch{a=`multiple`}try{i=JSON.stringify(e.outputShape)}catch{i=`multiple`}let o=[];for(let t of e.inboundNodes)if(!(n!=null&&n.length>0&&n.indexOf(t)===-1))for(let e=0;e<t.inboundLayers.length;++e){let n=t.inboundLayers[e].name,r=t.nodeIndices[e],i=t.tensorIndices[e];o.push(`${n}[${r}][${i}]`)}let s=e.name,c=e.getClassName(),l=o.length===0?``:o[0];Rx([`${s} (${c})`,a,i,e.countParams().toString(),l],t,r);for(let e=1;e<o.length;++e)Rx([``,``,``,``,o[e]],t,r)}function Vx(e,t,n){return(e===`inboundNodes`||e===`outputLayers`||e===`inputLayers`)&&t===0&&typeof n==`string`}function Hx(e,t){if(e===null)return null;if(typeof e==`string`)return dv(e);if(typeof e==`number`||typeof e==`boolean`)return e;if(e instanceof Array){let n=[],r=e.length;for(let i=0;i<r;++i){let r=e[i];Vx(t,i,r)?n.push(r):n.push(Hx(r,t))}return n}{let t={};for(let n of Object.keys(e)){let r=e[n];if(n===`name`&&typeof r==`string`)t[n]=r;else{let e=dv(n);t[e]=Hx(r,e)}}return t}}function Ux(e,t){if(e==null)return null;if(typeof e==`string`)return uv(e);if(typeof e==`number`||typeof e==`boolean`)return e;if(e instanceof Array){let n=[],r=e.length;for(let i=0;i<r;++i){let r=e[i];Vx(t,i,r)?n.push(r):n.push(Ux(r,t))}return n}{let t={};for(let n of Object.keys(e)){let r=e[n],i=uv(n);t[i]=(n===`name`||n===`className`)&&typeof r==`string`?r:Ux(r,n)}return t}}var Wx=`4.22.0`,Gx=e=>{let t=Object.keys(e);if(t.length===0)return!1;let n=t[0].split(`/`);return!isNaN(parseInt(n[n.length-1],10))},Kx=class e extends Y{constructor(t){if(super({}),this.containerNodes=new Set,this.name=t.name,this.name==null){let e=this.getClassName().toLowerCase();this.name=kv(e)}if(this.supportsMasking=!1,this.trainable_=!0,this.inputs=Array.isArray(t.inputs)?t.inputs.slice():[t.inputs],this.outputs=Array.isArray(t.outputs)?t.outputs.slice():[t.outputs],vv(this.inputs).length!==this.inputs.length)throw new K(`The list of inputs passed to the model is redundant. All inputs should only appear once. Found: ${this.inputs.map(e=>e.name)}`);vv(this.outputs).length!==this.outputs.length&&console.warn(`The list of outputs passed to the model is redundant. All outputs should only appear once. Found: ${this.outputs.map(e=>e.name)}`),this.inputLayers=[],this.inputLayersNodeIndices=[],this.inputLayersTensorIndices=[],this.outputLayers=[],this.outputLayersNodeIndices=[],this.outputLayersTensorIndices=[],this.layers=[],this.internalContainerRefs=[];for(let e of this.outputs){let t=e.sourceLayer,n=e.nodeIndex,r=e.tensorIndex;this.outputLayers.push(t),this.outputLayersNodeIndices.push(n),this.outputLayersTensorIndices.push(r)}for(let e of this.inputs){let t=e.sourceLayer,n=e.nodeIndex,r=e.tensorIndex;ov(n===0,`input layer has >1 nodes`),ov(r===0,`input layer has >1 tensors`),this.inputLayers.push(t),this.inputLayersNodeIndices.push(n),this.inputLayersTensorIndices.push(r)}this.inputNames=[],this.outputNames=[],this.feedInputShapes=[],this.feedInputNames=[],this.feedOutputNames=[];for(let e=0;e<this.inputLayers.length;e++){let n=this.inputLayers[e];if(!(n instanceof mb))throw TypeError(`Input layers to a LayersModel must be InputLayer objects. Received inputs: ${t.inputs}. Input ${e} (0-based) originates from layer type ${n.getClassName()}.`);this.inputNames.push(n.name),this.feedInputShapes.push(n.batchInputShape),this.feedInputNames.push(n.name)}for(let e of this.outputLayers)this.outputNames.push(e.name);this.internalInputShapes=this.inputs.map(e=>e.shape),this.internalOutputShapes=this.outputs.map(e=>e.shape);let n={},r={},i={},a={},o={},s=[],c=(t,n,r,i,a,l)=>{(i==null||a==null||l==null)&&(i=t.sourceLayer,a=t.nodeIndex,l=t.tensorIndex);let u=i.inboundNodes[a];if(r.indexOf(u)!==-1)throw new nv(`The tensor ${t.name} at layer "${i.name}" is part of a cycle.`);if(n.indexOf(u)!==-1)return;this.containerNodes.add(e.nodeKey(i,a)),i.id in o||(o[i.id]=Object.keys(o).length),r.indexOf(u)===-1&&r.push(u);let d=u.inboundLayers.length;for(let e=0;e<d;e++){let t=u.inputTensors[e],i=u.inboundLayers[e],a=u.nodeIndices[e],o=u.tensorIndices[e];c(t,n,r,i,a,o)}for(n.push(u);r.indexOf(u)>=0;)r.splice(r.indexOf(u),1);s.push(u)},l=[],u=[];for(let e of this.outputs)c(e,l,u);let d=s.slice().reverse();for(let e of d){r[e.id]=e,e.id in n||(n[e.id]=0);let t=n[e.id],o=i[e.outboundLayer.id]==null?0:i[e.outboundLayer.id];t=Math.max(t,o),i[e.outboundLayer.id]=t,a[e.outboundLayer.id]=e.outboundLayer,n[e.id]=t;for(let i=0;i<e.inboundLayers.length;i++){let a=e.inboundLayers[i],o=e.nodeIndices[i],s=a.inboundNodes[o],c=n[s.id]==null?0:n[s.id];n[s.id]=Math.max(t+1,c),r[s.id]=s}}let f={};for(let e in n){let t=n[e];t in f||(f[t]=[]),f[t].push(r[e])}let p={};for(let e in i){let t=i[e];t in p||(p[t]=[]),p[t].push(a[e])}let m=Object.keys(p).map(e=>parseInt(e,10)).sort(_v);this.layers=[];for(let t of m){let n=p[t];n.sort((e,t)=>{let n=o[e.id],r=o[t.id];return n<r?-1:+(n>r)});for(let t of n)t instanceof e&&this.internalContainerRefs.push(t),this.layers.push(t)}this.layersByDepth=p,m=Object.keys(f).map(e=>parseInt(e,10)).sort(_v);let h=this.inputs.slice(),g=[];for(let e of m)for(let t of f[e]){let e=t.outboundLayer;if(e!=null){for(let n of t.inputTensors)if(h.indexOf(n)===-1)throw new nv(`Graph disconnected: cannot obtain value for tensor ${n} at layer "${e.name}". The following previous layers were accessed without issue: ${g}`);for(let e of t.outputTensors)h.push(e);g.push(e.name)}}this.nodesByDepth=f;let _=this.layers.map(e=>e.name);for(let e of _){let t=_.filter(t=>t===e).length;if(t!==1)throw new nv(`The name "${e}" is used ${t} times in the model. All layer names should be unique. Layer names: `+JSON.stringify(_))}this.outboundNodes=[],this.inboundNodes=[],new sb({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:this.inputs,outputTensors:this.outputs,inputMasks:this.inputs.map(e=>null),outputMasks:this.outputs.map(e=>null),inputShapes:this.inputs.map(e=>e.shape),outputShapes:this.outputs.map(e=>e.shape)}),this.built=!0,this._refCount=1}assertNotDisposed(){if(this._refCount===0)throw Error(`Container '${this.name}' is already disposed.`)}dispose(){this.assertNotDisposed();let e={refCountAfterDispose:null,numDisposedVariables:0};if(--this._refCount===0){for(let t of this.layers)e.numDisposedVariables+=t.dispose().numDisposedVariables;for(let t of this.internalContainerRefs)e.numDisposedVariables+=t.dispose().numDisposedVariables}return e.refCountAfterDispose=this._refCount,e}get trainable(){return this.trainable_}set trainable(e){this.layers.forEach(t=>{t._trainableWeights.forEach(t=>t.trainable=e)}),this.trainable_=e}get trainableWeights(){if(this._trainableWeights.length>0)throw new K(`Container instance unexpectedly contains _trainableWeights.The trainable weights of a Container are a union of the trainable weights of its consituent Layers. Its own _trainableWeights must remain an empty Array.`);if(!this.trainable)return[];let e=[];for(let t of this.layers)e=e.concat(t.trainableWeights);return e}get nonTrainableWeights(){let e=[];for(let t of this.layers)e.push(...t.nonTrainableWeights);if(!this.trainable){let t=[];for(let e of this.layers)t.push(...e.trainableWeights);return t.concat(e)}return e}get weights(){return this.trainableWeights.concat(this.nonTrainableWeights)}loadWeights(e,t=!0){let n={},r=0,i=Gx(e);i&&this.parseWeights(e);for(let e of this.layers)for(let[t,a]of e.weights.entries()){let e=i?`${a.name.split(`/`).slice(0,-1).join(`/`)+`/`}${t}`:a.originalName;if(n[e]!=null)throw new K(`Duplicate weight name: ${e}`);n[e]=a,r++}let a=[];for(let r in e){let i=r;if(n[r]==null){let e=r.split(`/`);i=e.slice(0,-2).concat([e[e.length-1]]).join(`/`)}if(n[i]!=null)a.push([n[i],e[r]]);else if(t)throw new K(`Provided weight data has no target variable: ${r}`);delete n[i]}if(t){let e=[];for(let t in n)e.push(t);if(e.length>0)throw new K(`${e.length} of ${r} weights are not set: ${e}`)}rb(a)}parseWeights(e){for(let t in Object.keys(e)){let n=t.split(`/`),r=[`vars`,`layer_checkpoint_dependencies`],i=n.map(e=>e.startsWith(`_`)?e.slice(1):e).filter(e=>!r.includes(e)).join(`/`);i!==t&&(e[i]=e[t],delete e[t])}}updatedConfig(){let e=this.getConfig(),t={};return t.className=this.getClassName(),t.config=e,t.kerasVersion=`tfjs-layers ${Wx}`,t.backend=`TensorFlow.js`,t}toJSON(e,t=!0){let n=Ux(this.updatedConfig());return t?JSON.stringify(n):n}call(e,t){return P(()=>{e=lv(e);let n=new _b;for(let t=0;t<this.inputs.length;++t)n.add(this.inputs[t],e[t]);return xb(this.outputs,n,t)})}computeMask(e,t){return P(()=>{e=lv(e);let n;return n=t==null?av(null,e.length):lv(t),this.runInternalGraph(e,n)[1]})}computeOutputShape(e){let t=Xy(e);if(t.length!==this.inputLayers.length)throw new K(`Invalid inputShape argument ${e}: model has ${this.inputLayers.length} tensor inputs.`);let n={};for(let e=0;e<t.length;e++){let r=this.inputLayers[e],i=t[e],a=r.name+`_0_0`;n[a]=i}let r=Object.keys(this.nodesByDepth).map(e=>parseInt(e,10)).sort(_v);if(r.length>1)for(let e of r){let t=this.nodesByDepth[e];for(let e of t){let t=e.outboundLayer;if(this.inputLayers.map(e=>e.id).indexOf(t.id)!==-1)continue;let r=[];for(let t=0;t<e.inboundLayers.length;t++){let i=e.inboundLayers[t],a=e.nodeIndices[t],o=e.tensorIndices[t],s=n[`${i.name}_${a}_${o}`];r.push(s)}let i=Xy(t.computeOutputShape(cv(r))),a=t.inboundNodes.indexOf(e);for(let e=0;e<i.length;e++){let r=`${t.name}_${a}_${e}`;n[r]=i[e]}}}let i=[],a=[];for(let e=0;e<this.outputLayers.length;e++){let t=this.outputLayers[e],n=this.outputLayersNodeIndices[e],r=this.outputLayersTensorIndices[e],i=`${t.name}_${n}_${r}`;a.push(i)}for(let e=0;e<a.length;e++){let t=a[e];ov(t in n),i.push(n[t])}return cv(i)}runInternalGraph(e,t){t??=av(null,e.length);let n={};for(let r=0;r<this.inputs.length;++r){let i=this.inputs[r],a=e[r],o=t[r];n[i.id]=[a,o]}let r=Object.keys(this.nodesByDepth).map(e=>parseInt(e,10)).sort(_v);for(let e of r){let t=this.nodesByDepth[e];for(let e of t){let t=e.outboundLayer,r=e.inputTensors,i=e.outputTensors,a=[];for(let e of r)e.id in n&&a.push(n[e.id]);if(a.length===r.length){let r={},o,s,c,l;if(e.callArgs!=null&&(r=e.callArgs),a.length===1){let[e,n]=a[0];r.mask??(r.mask=n),c=lv(t.call(e,r)),l=lv(t.computeMask(e,n)),o=[e],s=[n]}else o=a.map(e=>e[0]),s=a.map(e=>e[1]),r.mask??(r.mask=s),c=lv(t.call(o,r)),l=lv(t.computeMask(o,s));if(t.activityRegularizer)throw new q(`LayersModel invocation with concrete Tensor value(s) in the presence of activity regularizer(s) is not supported yet.`);for(let e=0;e<i.length;++e){let t=i[e],r=c[e],a=l[e];n[t.id]=[r,a]}}}}let i=[],a=[],o=[];for(let e of this.outputs){ov(e.id in n,`Could not compute output ${e.name} : ${e.id}`);let[t,r]=n[e.id];o.push(t.shape),i.push(t),a.push(r)}return[i,a,o]}buildNodeConversionMap(t){let n={},r;for(let t of this.layers){r=+(t instanceof e);for(let i=0;i<t.inboundNodes.length;i++){let a=e.nodeKey(t,i);this.containerNodes.has(a)&&(n[a]=r,r+=1)}}return n}getLayer(e,t){if(t!=null)return this.findLayer(t);if(e==null)throw new K(`Provide either a layer name or layer index`);if(typeof e==`number`)return this.findLayer(e);for(let t of this.layers)if(t.name===e)return t;throw new K(`No such layer: ${e}`)}findLayer(e){if(this.layers.length<=e)throw new K(`Was asked to retrieve layer at index ${e}, but model only has ${this.layers.length} layer(s).`);return this.layers[e]}calculateLosses(){return P(()=>{let t=[];for(let n of this.layers)for(let r=0;r<n.inboundNodes.length;++r){let i=e.nodeKey(n,r);this.containerNodes.has(i)&&t.push(...n.calculateLosses())}return t})}getConfig(){let t={name:this.name},n=this.buildNodeConversionMap(this.layers),r=[];for(let t of this.layers){let i=t.getClassName(),a=t.getConfig(),o=[];for(let r=0;r<t.inboundNodes.length;r++){let i=t.inboundNodes[r],a=e.nodeKey(t,r),s={};if(this.containerNodes.has(a)){if(i.callArgs)try{JSON.stringify(i.callArgs),s=i.callArgs}catch{console.warn(`Layer ${t.name} was passed non-serializable keyword arguments: ${i.callArgs}. They will not be included in the serialized model (and thus will be missing at deserialization time).`),s={}}if(i.inboundLayers.length>0){let t=[];for(let r=0;r<i.inboundLayers.length;r++){let a=i.inboundLayers[r],o=i.nodeIndices[r],c=i.tensorIndices[r],l=n[e.nodeKey(a,o)];l??=0,t.push([a.name,l,c,s])}o.push(t)}}}let s={};s.name=t.name,s.className=i,s.config=a,s.inboundNodes=o,r.push(s)}t.layers=r;let i=[];for(let t=0;t<this.inputLayers.length;t++){let r=this.inputLayers[t],a=this.inputLayersNodeIndices[t],o=e.nodeKey(r,a);if(!this.containerNodes.has(o))continue;let s=n[o];s??=0;let c=this.inputLayersTensorIndices[t];i.push([r.name,s,c])}t.inputLayers=i;let a=[];for(let t=0;t<this.outputLayers.length;t++){let r=this.outputLayers[t],i=this.outputLayersNodeIndices[t],o=e.nodeKey(r,i);if(!this.containerNodes.has(o))continue;let s=n[o];s??=0;let c=this.outputLayersTensorIndices[t];a.push([r.name,s,c])}return t.outputLayers=a,t}static fromConfig(e,t,n={},r=!1){let i={},a={};function o(e,t){e.name in a?a[e.name].push(t):a[e.name]=[t]}function s(e,t){let n=[],r;for(let a of t){let s=a[0],c=a[1],l=a[2];if(r=a[3]==null?{}:a[3],!(s in i)){o(e,t);return}let u=i[s];if(u.inboundNodes.length<=c){o(e,t);return}let d=u.inboundNodes[c];n.push(d.outputTensors[l])}n.length>0&&e.apply(cv(n),r)}function c(e){let n=e.name,a=qb(e,t.customObjects==null?{}:t.customObjects);a.setFastWeightInitDuringBuild(r),i[n]=a,e.inboundNodes.forEach(e=>{if(!(e instanceof Array))throw new K(`Corrupted configuration, expected array for nodeData: ${e}`);o(a,e)})}let l=t.name,u=t.layers;for(let e of u)c(e);for(;!yv(a);)for(let e of u){let t=i[e.name];if(t.name in a){let e=a[t.name];delete a[t.name];for(let n of e)s(t,n)}}let d=[],f=[],p=t.inputLayers;for(let e of p){let t=e[0],n=e[1],r=e[2];ov(t in i);let a=i[t].inboundNodes[n].outputTensors;d.push(a[r])}let m=t.outputLayers;for(let e of m){let t=e[0],n=e[1],r=e[2];ov(t in i);let a=i[t].inboundNodes[n].outputTensors;f.push(a[r])}return new e({inputs:d,outputs:f,name:l})}get stateful(){if(this._stateful)throw new K(`Container instance unexpectedly has _stateful = true. The statefulness of a Container is determined by the Layers it contains. Its _stateful property must remain the default false.`);for(let e of this.layers)if(e.stateful)return!0;return!1}resetStates(){P(()=>{this.layers.forEach(e=>{e.stateful&&e.resetStates()})})}};function qx(e,t,n){let r=t.length;if(e==null||Array.isArray(e)&&e.length===0)return t.map(e=>null);if(r===1)return Array.isArray(e)&&e.length===1?e:typeof e==`object`&&t[0]in e?[e[t[0]]]:[e];if(Array.isArray(e)){if(e.length!==r)throw Error(`Provided ${n} is an array of ${e.length} element(s), but the model has ${r} outputs. Make sure a set of weights is provided for each model output.`);return e}if(typeof e==`object`&&Object.keys(e).length>0&&typeof e[Object.keys(e)[0]]==`object`){let n=[];return t.forEach(t=>{t in e?n.push(e[t]):n.push(null)}),n}throw Error(`The model has multiple (${r}) outputs, so ${n} must be either an array with ${r} elements or an object with ${t} keys. Provided ${n} not understood: ${JSON.stringify(e)}`)}function Jx(e,t){return qx(e,t,`classWeight`)}async function Yx(e,t,n,r){if(t!=null||r!=null)throw Error(`Support sampleWeight is not implemented yet`);if(n!=null){let t=P(()=>{if(e.shape.length===1)return lo(e);if(e.shape.length===2){if(e.shape[1]>1)return Oo(e,1);if(e.shape[1]===1)return V(e,[e.shape[0]]);throw Error(`Encountered unexpected last-dimension size (${e.shape[1]}) during handling of class weights. The size is expected to be >= 1.`)}throw Error(`Unexpected rank of target (y) tensor (${e.rank}) during handling of class weights. The rank is expected to be 1 or 2.`)}),r=Array.from(await t.data());F(t);let i=[];return r.forEach(e=>{if(n[e]==null)throw Error(`classWeight must contain all classes in the training data. The class ${e} exists in the data but not in classWeight`);i.push(n[e])}),yf(i,`float32`)}return null}function Xx(e,t){return B(e,t)}var Zx=32;function Qx(e,t){let n,r,i=t;n=i.xs,r=i.ys,m(n!=null&&r!=null,()=>`A Dataset iterator for fitDataset() is expected to generate objects of the form \`{xs: xVal, ys: yVal}\`, where the two values may be \`tf.Tensor\`, an array of Tensors, or a map of string to Tensor.  The provided Dataset instead generates ${t}`);let a=$x(`input`,e.inputNames,n),o=$x(`output`,e.outputNames,r),s=a[0].shape[0];m(a.length===e.inputs.length,()=>`LayersModel has ${e.inputs.length} inputs, but the dataset provides ${a.length} inputs.  (Expected input keys: ${JSON.stringify(e.inputNames)})`),m(o.length===e.outputs.length,()=>`LayersModel has ${e.outputs.length} outputs, but the dataset provides ${o.length} outputs.  (Expected output keys: ${JSON.stringify(e.outputNames)})`);for(let t=0;t<a.length;t++)m(a[t].shape[0]===s,()=>`Batch size mismatch: input ${e.inputNames[t]} has ${a[t].shape[0]}; expected  ${s} based on input ${e.inputNames[0]}.`);for(let t=0;t<o.length;t++)m(o[t].shape[0]===s,()=>`Batch size mismatch: output ${e.outputNames[t]} has ${o[t].shape[0]}; expected  ${s} based on input ${e.inputNames[0]}.`);return{xs:a,ys:o}}function $x(e,t,n){if(n instanceof Oi)return[n];if(Array.isArray(n))return m(n.length===t.length,()=>`Received an array of ${n.length} Tensors, but expected ${t.length} to match the ${e} keys ${t}.`),n;{let r=[];for(let i of t){if(n[i]==null)throw new K(`The feature data generated by the dataset lacks the required ${e} key '${i}'.`);r.push(n[i])}return r}}function eS(e){if(e.length===3)throw new q(`Validation with sample weights is not implemented yet.`);return{xs:e[0],ys:e[1]}}async function tS(e,t,n){let r=n.batchesPerEpoch!=null;if(m(e.optimizer!=null,()=>`You must compile a model before training/testing. Use LayersModel.compile(modelCompileConfig).`),m(n!=null,()=>`For fitDataset(), the 2nd argument (config) is required, but it is not provided in this call.`),m(n.epochs!=null&&n.epochs>0&&Number.isInteger(n.epochs),()=>`For fitDataset(), config.epochs is expected to be a positive integer, but got ${n.epochs}`),m(!r||n.batchesPerEpoch>0&&Number.isInteger(n.batchesPerEpoch),()=>`For fitDataset(), config.batchesPerEpoch is expected to be a positive integer if specified, but got ${n.batchesPerEpoch}`),m(n.validationSplit==null,()=>"`validationSplit` is not supported by `fitDataset()`. Use validationData instead."),e.isTraining)throw Error(`Cannot start training because another fit() call is ongoing.`);e.isTraining=!0;try{let i=n.validationData!=null,a,o;if(i)if(rS(n.validationData))m(n.validationBatches==null||n.validationBatches>0&&Number.isInteger(n.validationBatches),()=>`For fitDataset() with dataset-based validation, config.validationBatches is expected not to be provided, or to be a positive integer, but got ${n.validationBatches}`);else{let e=eS(n.validationData);a=e.xs,o=e.ys}let s=e.makeTrainFunction(),c=e.getDedupedMetricsNames(),l;l=i?c.slice().concat(c.map(e=>`val_`+e)):c.slice();let{callbackList:u,history:d}=Kb(Wb(n.callbacks,n.yieldEvery),n.verbose==null?1:n.verbose,n.epochs,null,null,nS(t,n),null,i,l);u.setModel(e),e.history=d,await u.onTrainBegin(),e.stopTraining_=!1;let f=n.initialEpoch==null?0:n.initialEpoch,p=await t.iterator();for(;f<n.epochs;){let l={};await u.onEpochBegin(f);let d=0,m=0;for(r||(p=await t.iterator());!r||d<n.batchesPerEpoch;){let t=await p.next();if(r&&t.done){console.warn(`You provided \`batchesPerEpoch\` as ${n.batchesPerEpoch}, but your dataset iterator ran out of data after ${d} batches; interrupting training. Make sure that your dataset can generate at least \`batchesPerEpoch * epochs\` batches (in this case, ${n.batchesPerEpoch*n.epochs} batches). You may need to use the repeat() function when building your dataset.`);break}if(t.value!=null){let{xs:r,ys:i}=Qx(e,t.value),a={};a.batch=m,a.size=r[0].shape[0],await u.onBatchBegin(m,a);let o=[];if(n.classWeight!=null){let t=Jx(n.classWeight,e.outputNames);for(let e=0;e<t.length;++e)o.push(await Yx(i[e],null,t[e]))}let l=r.concat(i).concat(o),f=s(l);F(l);for(let e=0;e<c.length;++e){let t=c[e],n=f[e];a[t]=n,ha(n)}await u.onBatchEnd(m,a),Lb(a),m++,d++}if(r?d>=n.batchesPerEpoch:t.done){if(i){let t;t=rS(n.validationData)?lv(await e.evaluateDataset(n.validationData,{batches:n.validationBatches})):lv(e.evaluate(a,o,{batchSize:n.validationBatchSize==null?Zx:n.validationBatchSize,verbose:0}));for(let n=0;n<e.metricsNames.length;++n)l[`val_${e.metricsNames[n]}`]=t[n]}break}if(e.stopTraining_)break}if(await u.onEpochEnd(f,l),f++,e.stopTraining_)break}return await u.onTrainEnd(),await e.history.syncData(),e.history}finally{e.isTraining=!1}}function nS(e,t){let n=null;return t.batchesPerEpoch==null?Number.isFinite(e.size)&&(n=e.size):n=t.batchesPerEpoch,n}function rS(e){return typeof e.iterator==`function`}function iS(e){return typeof e.next==`function`}async function aS(e,t,n){n||={};let r=n.batches!=null,i=e.testFunction,a=[];if(n.verbose>0)throw new q(`Verbose mode is not implemented yet.`);m(!r||n.batches>0&&Number.isInteger(n.batches),()=>`Test loop expects \`batches\` to be a positive integer, but received ${JSON.stringify(n.batches)}`);let o=iS(t)?t:await t.iterator(),s=0,c=0;for(;!r||c<n.batches;){let t=await o.next();if(a=P(()=>{if(t.value){let{xs:n,ys:r}=Qx(e,t.value),o=n.concat(r),l=P(()=>i(o));if(F(o),c===0)for(let e=0;e<l.length;++e)a.push(rl(0));let u=o[0].shape[0];for(let e=0;e<l.length;++e){let t=l[e],n=a[e];a[e]=P(()=>R(a[e],B(u,t))),c>0&&F(n)}F(l),s+=u,++c}return a}),t.done){r&&console.warn(`Your dataset iterator ran out of data during evaluateDataset(). Interrupting evalution. Make sure that your dataset can generate at least \`batches\` batches (in this case, ${n.batches} batches). You may need to use the repeat() function when building your dataset.`);break}}for(let e=0;e<a.length;++e){let t=a[e];a[e]=z(a[e],s),F(t)}return cv(a)}function oS(e){m(e>0&&Number.isInteger(e),()=>`batchSize is required to be a positive integer, but got ${e}`)}function sS(e,t,n){return e==null?[null]:Array.isArray(e)?e.map(e=>sy(e,t,n-t)):sy(e,t,n-t)}function cS(e,t){return P(()=>e==null?null:Array.isArray(e)?e.map(e=>cS(e,t)):hy(e,t.dtype===`int32`?t:L(t,`int32`)))}function lS(e,t){let n=[],r=0,i=null;for(;r<e;)i=r+t,i>=e&&(i=e),n.push([r,i]),r=i;return n}function uS(e){let t=[];e instanceof Oi&&(e=[e]);for(let n=0;n<e.length;++n){let r=e[n];if(r.rank===1)t.push(ry(r,1));else if(r.rank===0)throw Error(`Expected tensor to be at least 1D, but received a 0D tensor (scalar).`);else t.push(r)}return t}function dS(e,t){if(e==null)return;let n=[];if(t instanceof Oi)n.push(t.id);else if(Array.isArray(t))t.forEach(e=>n.push(e.id));else if(t!=null)for(let e in t){let r=t[e];n.push(r.id)}let r=[];if(e instanceof Oi)n.indexOf(e.id)===-1&&r.push(e);else if(Array.isArray(e))e.forEach(e=>{n.indexOf(e.id)===-1&&r.push(e)});else if(e!=null)for(let t in e){let i=e[t];n.indexOf(i.id)===-1&&r.push(i)}r.forEach(e=>{e.isDisposed||e.dispose()})}function fS(e){return e instanceof Oi}function pS(e){return Array.isArray(e)}function mS(e){return!fS(e)&&!pS(e)}function hS(e,t,n,r=!0,i=``){if(t==null||t.length===0){if(e!=null){let t=!1;if(pS(e)&&e.length>0)t=!0;else if(mS(e)){for(let n in e)if(e.hasOwnProperty(n)){t=!0;break}}else t=!0;if(t)throw new K(`Error when checking model ${i} expected no data, but got ${e}`)}return[]}if(e==null)return t.map(e=>null);let a;if(mS(e)){e=e,a=[];for(let n of t){if(e[n]==null)throw new K(`No data provided for "${n}". Need data for each key in: ${t}`);a.push(e[n])}}else if(pS(e)){if(e=e,e.length!==t.length)throw new K(`Error when checking model ${i}: the Array of Tensors that you are passing to your model is not the size the model expected. Expected to see ${t.length} Tensor(s), but instead got the following list of Tensor(s): ${e}`);a=e}else{if(e=e,t.length>1)throw new K(`The model ${i} expects ${t.length} Tensor(s), but only received one Tensor. Found: Tensor with shape ${e.shape}`);a=[e]}if(a=uS(a),n!=null)for(let e=0;e<t.length;++e){if(n[e]==null)continue;let o=a[e];if(o.shape.length!==n[e].length)throw new K(`Error when checking ${i}: expected ${t[e]} to have ${n[e].length} dimension(s). but got array with shape ${o.shape}`);for(let t=0;t<n[e].length;++t){if(t===0&&!r)continue;let a=o.shape[t],s=n[e][t];if(s!=null&&s>=0&&a!==s)throw new K(`${i} expected a batch of elements where each example has shape [${n[e].slice(1,n[e].length)}] (i.e.,tensor shape [*,${n[e].slice(1,n[e].length)}]) but the ${i} received an input with ${o.shape[0]} examples, each with shape [${o.shape.slice(1,o.shape.length)}] (tensor shape [${o.shape}])`)}}return a}function gS(e,t,n){let r=vv(e.map(e=>e.shape[0]));r.sort();let i=vv(t.map(e=>e.shape[0]));if(i.sort(),r.length>1)throw new K(`All input Tensors (x) should have the same number of samples. Got array shapes: ${JSON.stringify(e.map(e=>e.shape))}`);if(i.length>1)throw new K(`All target Tensors (y) should have the same number of samples. Got array shapes: ${JSON.stringify(t.map(e=>e.shape))}`);if(r.length>0&&i.length>0&&!v(r,i))throw new K(`Input Tensors should have the same number of samples as target Tensors. Found ${r[0]} input sample(s) and ${i[0]} target sample(s).`)}function _S(e,t,n){let r=[Yb,ox,rx];for(let i=0;i<e.length;++i){let a=e[i],o=t[i],s=n[i];if(o!=null){if(o===rx&&a.shape[a.shape.length-1]===1)throw new K(`You are passing a target array of shape ${a.shape} while using a loss 'categorical_crossentropy'. 'categorical_crossentropy'expects targets to be binary matrices (1s and 0s) of shape [samples, classes].`);if(r.indexOf(o)!==-1){let e=a.shape.slice(1),t=s.slice(1);for(let n=0;n<e.length;++n){let r=e[n],i=t[n];if(i!=null&&r!==i)throw new K(`A target Tensor with shape ${a.shape} was passed for an output of shape ${s}, while using a loss function that expects targets to have the same shape as the output.`)}}}}}function vS(e,t,n,r=!0,i=``){let a;if(Array.isArray(e)){if(e.length!==t.length)throw new K(`Error when checking model ${i}: the Array of Tensors that you are passing to your model is not the size the the model expected. Expected to see ${t.length} Tensor(s), but instead got ${e.length} Tensors(s).`);a=e}else{if(t.length>1)throw new K(`The model expects ${t.length} ${i} Tensors, but only received one Tensor. Found: array with shape ${JSON.stringify(e.shape)}.`);a=[e]}if(n!=null)for(let e=0;e<t.length;++e){if(n[e]==null)continue;let o=a[e];if(o.shape.length!==n[e].length)throw new K(`Error when checking ${i}: expected ${t[e]} to have ${n[e].length} dimension(s), but got array with shape ${JSON.stringify(o.shape)}`);for(let a=0;a<n[e].length;++a){if(a===0&&!r)continue;let s=o.shape[a],c=n[e][a];if(c!=null&&c!==s)throw new K(`Error when checking ${i}: expected ${t[e]} to have shape ${JSON.stringify(n[e])} but got array with shape ${JSON.stringify(o.shape)}.`)}}}function yS(e,t){if(e==null||Array.isArray(e)&&e.length===0)return t.map(e=>[]);let n;if(typeof e==`string`||typeof e==`function`)n=[e];else if(Array.isArray(e)||typeof e==`object`)n=e;else throw TypeError(`Type of metrics argument not understood. Expected an string,function, Array, or Object, found: ${e}`);if(Array.isArray(n))return t.map(e=>n);{let e=[];for(let r of t){let t=n.hasOwnProperty(r)?n[r]:[];Array.isArray(t)||(t=[t]),e.push(t)}return e}}var bS=`layers-model`,xS=class extends Kx{constructor(e){super(e),this.isTraining=!1}summary(e,t,n=console.log){if(!this.built)throw new K(`This model has never been called, thus its weights have not been created yet. So no summary can be displayed. Build the model first (e.g., by calling it on some test data).`);Fx(this,e,t,n)}compile(e){if(e.loss??=[],this.loss=e.loss,typeof e.optimizer==`string`)this.optimizer_=jx(e.optimizer),this.isOptimizerOwned=!0;else{if(!(e.optimizer instanceof rm))throw new K(`User-defined optimizer must be an instance of tf.Optimizer.`);this.optimizer_=e.optimizer,this.isOptimizerOwned=!1}let t=[];if(!Array.isArray(e.loss)&&typeof e.loss!=`string`&&typeof e.loss!=`function`){e.loss=e.loss;for(let t in e.loss)if(this.outputNames.indexOf(t)===-1)throw new K(`Unknown entry in loss dictionary: "${t}". Only expected the following keys: ${this.outputNames}`);for(let n of this.outputNames)e.loss[n]??console.warn(`Output "${n}" is missing from loss dictionary. We assume this was done on purpose, and we will not be expecting data to be passed to ${n} during training`),t.push(dx(e.loss[n]))}else if(Array.isArray(e.loss)){if(e.loss.length!==this.outputs.length)throw new K(`When passing an Array as loss, it should have one entry per model output. The model has ${this.outputs.length} output(s), but you passed loss=${e.loss}.`);t=e.loss.map(e=>dx(e))}else{let n=dx(e.loss);this.outputs.forEach(e=>{t.push(n)})}this.lossFunctions=t,this.feedOutputNames=[],this.feedOutputShapes=[],this.feedLossFns=[];for(let e=0;e<this.outputs.length;++e){let t=this.internalOutputShapes[e],n=this.outputNames[e];this.feedOutputNames.push(n),this.feedOutputShapes.push(t),this.feedLossFns.push(this.lossFunctions[e])}let n=[];this.metrics=e.metrics,this.metricsNames=[`loss`],this.metricsTensors=[],Hv(`loss`,()=>{for(let e=0;e<this.outputs.length;++e){if(n.indexOf(e)!==-1)continue;let t=this.lossFunctions[e];this.outputs.length>1&&(this.metricsTensors.push([t,e]),this.metricsNames.push(this.outputNames[e]+`_loss`))}});let r=yS(e.metrics,this.outputNames),i=(e,t,n)=>{this.outputNames.length>1&&(t=this.outputNames[e]+`_`+t),this.metricsNames.push(t),this.metricsTensors.push([n,e])};Hv(`metric`,()=>{for(let e=0;e<this.outputs.length;++e)n.indexOf(e)===-1&&(t=>{let n,r,a;for(let o of t){if(typeof o==`string`&&[`accuracy`,`acc`,`crossentropy`,`ce`].indexOf(o)!==-1){let t=this.internalOutputShapes[e];t[t.length-1]===1||this.lossFunctions[e]===ox?[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(r=_x):r=fx:this.lossFunctions[e]===ix?[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(r=Dx):r=vx:[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(r=Tx):r=px;let i;[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(i=`ce`):i=`acc`,a=r,n=``+i}else a=kx(o),n=``+Ax(o);let t;Hv(n,()=>{t=a}),i(e,n,t)}})(r[e])}),this.collectedTrainableWeights=this.trainableWeights}checkTrainableWeightsConsistency(){this.collectedTrainableWeights!=null&&this.trainableWeights.length!==this.collectedTrainableWeights.length&&console.warn("Discrepancy between trainableweights and collected trainable weights. Did you set `model.trainable` without calling `model.compile()` afterwards?")}evaluate(e,t,n={}){let r=n.batchSize==null?32:n.batchSize;oS(r);let i=this.standardizeUserDataXY(e,t,!0,r);try{let e=i[0].concat(i[1]);this.makeTestFunction();let t=this.testFunction;return cv(this.testLoop(t,e,r,n.verbose,n.steps))}finally{dS(i[0],e),dS(i[1],t)}}async evaluateDataset(e,t){return this.makeTestFunction(),aS(this,e,t)}checkNumSamples(e,t,n,r=`steps`){let i;if(n!=null){if(i=null,t!=null)throw new K(`If ${r} is set, batchSize must be null or undefined.Got batchSize = ${t}`)}else if(e!=null)i=Array.isArray(e)?e[0].shape[0]:e.shape[0];else throw new K(`Either the input data should have a defined shape, or ${r} shoud be specified.`);return i}execute(e,t){if(Array.isArray(t)&&t.length===0)throw new K("`outputs` is an empty Array, which is not allowed.");let n=Array.isArray(t),r=n?t:[t],i=this.retrieveSymbolicTensors(r),a=new _b;if(e instanceof Oi&&(e=[e]),Array.isArray(e)){if(e.length!==this.inputs.length)throw new K(`The number of inputs provided (${e.length}) does not match the number of inputs of this model (${this.inputs.length}).`);for(let t=0;t<this.inputs.length;++t)a.add(this.inputs[t],e[t])}else for(let t of this.inputs){let n=e[t.name];if(n==null)throw new K(`No value is provided for the model's input ${t.name}`);a.add(t,n)}let o=xb(i,a);return n?o:o[0]}retrieveSymbolicTensors(e){let t=av(null,e.length),n=e.length;for(let r of this.layers){let i=Array.isArray(r.output)?r.output:[r.output],a=i.map(e=>e.name);for(let r=0;r<e.length;++r){let o=a.indexOf(e[r]);if(o!==-1&&(t[r]=i[o],n--),n===0)break}if(n===0)break}if(n>0){let n=[];throw t.forEach((t,r)=>{t??n.push(e[r])}),new K(`Cannot find SymbolicTensors for output name(s): ${JSON.stringify(n)}`)}return t}predictLoop(e,t=32,n=!1){return P(()=>{let r=this.checkNumSamples(e);if(n)throw new q(`Verbose predictLoop() is not implemented yet.`);let i=lS(r,t),a=this.outputs.map(e=>[]);for(let t=0;t<i.length;++t)P(()=>{let n=i[t][0],r=i[t][1],a=sS(e,n,r),o=[];if(Array.isArray(a))for(let e=0;e<a.length;++e)o.push({key:this.inputs[e],value:a[e]});else o.push({key:this.inputs[0],value:a});let s=new _b(o);return xb(this.outputs,s)}).forEach((e,t)=>a[t].push(e));return cv(a.map(e=>fs(e,0)))})}predict(e,t={}){let n=uS(e);vS(n,this.inputNames,this.feedInputShapes,!1);try{let e=t.batchSize==null?32:t.batchSize;return oS(e),this.predictLoop(n,e)}finally{dS(n,e)}}predictOnBatch(e){vS(e,this.inputNames,this.feedInputShapes,!0);let t=(Array.isArray(e)?e[0]:e).shape[0];return this.predictLoop(e,t)}standardizeUserDataXY(e,t,n=!0,r){if(this.optimizer_==null)throw new nv(`You must compile a model before training/testing. Use LayersModel.compile(modelCompileArgs).`);let i=[];for(let e=0;e<this.feedOutputShapes.length;++e){let t=this.feedOutputShapes[e];this.feedLossFns[e]===ix?i.push(t.slice(0,t.length-1).concat([1])):i.push(t)}if(e=hS(e,this.feedInputNames,this.feedInputShapes,!1,`input`),t=hS(t,this.feedOutputNames,i,!1,`target`),gS(e,t,null),_S(t,this.feedLossFns,this.feedOutputShapes),this.stateful&&r!=null&&r>0&&e[0].shape[0]%r!==0)throw new K(`In a stateful network, you should only pass inputs with a number of samples that is divisible by the batch size ${r}. Found: ${e[0].shape[0]} sample(s).`);return[e,t]}async standardizeUserData(e,t,n,r,i=!0,a){let[o,s]=this.standardizeUserDataXY(e,t,i,a);if(n!=null)throw Error(`sample weight is not supported yet.`);let c=null;if(r!=null){let e=Jx(r,this.outputNames);c=[];for(let t=0;t<e.length;++t)c.push(await Yx(s[t],null,e[t]))}return[o,s,c]}testLoop(e,t,n,r=0,i){return P(()=>{let a=this.checkNumSamples(t,n,i,`steps`),o=[];if(r>0)throw new q(`Verbose mode is not implemented yet.`);if(i!=null)throw new q(`steps mode in testLoop() is not implemented yet`);{let r=lS(a,n),i=yf(Qv(0,a));for(let n=0;n<r.length;++n){let a=r[n][0],s=r[n][1],c=e(cS(t,sy(i,a,s-a)));if(n===0)for(let e=0;e<c.length;++e)o.push(rl(0));for(let e=0;e<c.length;++e){let t=c[e];o[e]=R(o[e],B(s-a,t))}}for(let e=0;e<o.length;++e)o[e]=z(o[e],a)}return o})}getDedupedMetricsNames(){let e=this.metricsNames,t=[];for(let n=0;n<e.length;++n){let r=e[n],i=r;if(sv(e,r)>1){let t=sv(e.slice(0,n),r);i+=`_${t}`}t.push(i)}return t}makeTrainFunction(){return e=>{let t=[],n=e.slice(0,this.inputs.length),r=e.slice(this.inputs.length,this.inputs.length+this.outputs.length),i=e.slice(this.inputs.length+this.outputs.length,this.inputs.length+this.outputs.length*2),a=[],o=()=>{let e=[];for(let t=0;t<this.inputs.length;++t)e.push({key:this.inputs[t],value:n[t]});let o=new _b(e),s=xb(this.outputs,o,{training:!0}),c;for(let e=0;e<this.lossFunctions.length;++e){let n=this.lossFunctions[e],a=n(r[e],s[e]);i[e]!=null&&(a=Xx(a,i[e]));let o=Eu(a);t.push(o),c=e===0?a:R(c,a)}for(let e=0;e<this.metricsTensors.length;++e){let n;if(this.outputs.length>1&&e<this.outputs.length)n=t[e];else{let t=this.metricsTensors[e][0],i=this.metricsTensors[e][1];n=Eu(t(r[i],s[i]))}ha(n),a.push(n)}return c=Eu(c),this.calculateLosses().forEach(e=>{c=R(c,e)}),c},s=this.collectedTrainableWeights.map(e=>e.read());return[this.optimizer_.minimize(o,!0,s)].concat(a)}}makeTestFunction(){this.testFunction=e=>P(()=>{let t=[],n,r=e.slice(0,this.inputs.length),i=e.slice(this.inputs.length,this.inputs.length+this.outputs.length),a=[];for(let e=0;e<this.inputs.length;++e)a.push({key:this.inputs[e],value:r[e]});let o=new _b(a),s=xb(this.outputs,o);for(let e=0;e<this.lossFunctions.length;++e){let r=this.lossFunctions[e],a=Eu(r(i[e],s[e]));n=e===0?a:R(n,a),t.push(n)}for(let e=0;e<this.metricsTensors.length;++e){let n=this.metricsTensors[e][0],r=this.metricsTensors[e][1],a=Eu(n(i[r],s[r]));t.push(a)}return t})}async fit(e,t,n={}){if(this.isTraining)throw Error(`Cannot start training because another fit() call is ongoing.`);this.isTraining=!0;let r,i,a,o,s,c,l,u,d;try{let f=n.batchSize==null?32:n.batchSize;oS(f);let p=await this.standardizeUserData(e,t,n.sampleWeight,n.classWeight,!1,f);r=p[0],i=p[1],d=p[2];let m=!1,h;if(n.validationData!=null&&n.validationData.length>0){if(m=!0,n.validationData.length===2)s=n.validationData[0],c=n.validationData[1];else if(n.validationData.length===3)throw new q(`validationData including sample weights is not supported yet.`);else throw new K(`When passing validation data, it must contain 2 (valX, valY) or 3 (valX, valY, valSampleWeight) items; ${n.validationData} is invalid.`);let e=await this.standardizeUserData(s,c,null,null,!0,f);l=e[0],u=e[1],h=l.concat(u)}else if(n.validationSplit!=null&&n.validationSplit>0&&n.validationSplit<1){m=!0;let e=Math.floor(r[0].shape[0]*(1-n.validationSplit)),t=r[0].shape[0];l=sS(r,e,t),a=r,r=sS(r,0,e),u=sS(i,e,t),o=i,i=sS(i,0,e),h=l.concat(u)}else n.validationSteps!=null&&(m=!0);let g=r.concat(i).concat(d);this.checkTrainableWeightsConsistency();let _=this.makeTrainFunction(),v=this.getDedupedMetricsNames(),y,b;m?(this.makeTestFunction(),y=this.testFunction,b=v.slice().concat(v.map(e=>`val_`+e))):(y=null,h=[],b=v.slice());let x=Wb(n.callbacks,n.yieldEvery);return await this.fitLoop(_,g,v,f,n.epochs,n.verbose,x,y,h,n.shuffle,b,n.initialEpoch,null,null)}finally{this.isTraining=!1,dS(r,e),dS(i,t),dS(a,e),dS(o,t),dS(l,s),dS(u,c),d!=null&&F(d)}}async fitLoop(e,t,n,r,i,a,o,s,c,u,d,f,p,m){r??=32,i??=1,u??=!0,f??=0;let h=!1;if(s!=null&&c!=null&&(h=!0),m!=null&&(h=!0,p==null))throw new K("Can only use `validationSteps` when doing step-wise training, i.e., `stepsPerEpoch` must be set.");let g=this.checkNumSamples(t,r,p,`steps_per_epoch`),_;g!=null&&(_=Qv(0,g)),a??=1;let{callbackList:v,history:y}=Kb(o,a,i,f,g,p,r,h,d);v.setModel(this),this.history=y,await v.onTrainBegin(),this.stopTraining_=!1;for(let a=f;a<i;++a){await v.onEpochBegin(a);let i={};if(p!=null)throw new q(`stepsPerEpoch mode is not implemented yet.`);{if(u===`batch`)throw new q(`batch shuffling is not implemneted yet`);u&&l(_);let a=yf(_),o=lS(g,r);for(let l=0;l<o.length;++l){let u={};if(await v.onBatchBegin(l,u),P(()=>{let d=o[l][0],f=o[l][1],p=sy(a,d,f-d);u.batch=l,u.size=f-d;let m=e(cS(t,p));for(let e=0;e<n.length;++e){let t=n[e],r=m[e];u[t]=r,ha(r)}if(l===o.length-1&&h){let e=this.testLoop(s,c,r);for(let t=0;t<n.length;++t){let r=n[t],a=e[t];ha(a),i[`val_`+r]=a}}}),await v.onBatchEnd(l,u),Lb(u),this.stopTraining_)break}a.dispose()}if(await v.onEpochEnd(a,i),this.stopTraining_)break}return await v.onTrainEnd(),await this.history.syncData(),this.history}async fitDataset(e,t){return tS(this,e,t)}async trainOnBatch(e,t){let n=await this.standardizeUserData(e,t),r=n[0],i=n[1],a=this.makeTrainFunction()(r.concat(i)),o=[];for(let e of a){let t=await e.data();o.push(t[0])}return F(a),dS(n[0],e),dS(n[1],t),cv(o)}getNamedWeights(e){let t=[],n=e!=null&&e.trainableOnly,r=n?this.trainableWeights:this.weights,i=this.getWeights(n);for(let e=0;e<r.length;++e)n&&!r[e].trainable||t.push({name:r[e].originalName,tensor:i[e]});return t}set stopTraining(e){this.stopTraining_=e}get stopTraining(){return this.stopTraining_}get optimizer(){return this.optimizer_}set optimizer(e){this.optimizer_!==e&&(this.optimizer_=e,this.isOptimizerOwned=!1)}dispose(){let e=super.dispose();if(e.refCountAfterDispose===0&&this.optimizer!=null&&this.isOptimizerOwned){let t=ma().numTensors;this.optimizer_.dispose(),e.numDisposedVariables+=t-ma().numTensors}return e}getLossIdentifiers(){let e;if(typeof this.loss==`string`)e=uv(this.loss);else if(Array.isArray(this.loss)){for(let e of this.loss)if(typeof e!=`string`)throw Error(`Serialization of non-string loss is not supported.`);e=this.loss.map(e=>uv(e))}else{let t=Object.keys(this.loss);e={};let n=this.loss;for(let r of t)if(typeof n[r]==`string`)e[r]=uv(n[r]);else throw Error(`Serialization of non-string loss is not supported.`)}return e}getMetricIdentifiers(){if(typeof this.metrics==`string`||typeof this.metrics==`function`)return[uv(Ax(this.metrics))];if(Array.isArray(this.metrics))return this.metrics.map(e=>uv(Ax(e)));{let e={};for(let t in this.metrics)e[t]=uv(Ax(this.metrics[t]));return e}}getTrainingConfig(){return{loss:this.getLossIdentifiers(),metrics:this.getMetricIdentifiers(),optimizer_config:{class_name:this.optimizer.getClassName(),config:this.optimizer.getConfig()}}}loadTrainingConfig(e){if(e.weighted_metrics!=null)throw Error(`Loading weight_metrics is not supported yet.`);if(e.loss_weights!=null)throw Error(`Loading loss_weights is not supported yet.`);if(e.sample_weight_mode!=null)throw Error(`Loading sample_weight_mode is not supported yet.`);let t=qb(Hx(e.optimizer_config)),n;if(typeof e.loss==`string`)n=dv(e.loss);else if(Array.isArray(e.loss))n=e.loss.map(e=>dv(e));else if(e.loss!=null){n={};for(let t in e.loss)n[t]=dv(e.loss[t])}let r;if(Array.isArray(e.metrics))r=e.metrics.map(e=>dv(e));else if(e.metrics!=null){r={};for(let t in e.metrics)r[t]=dv(e.metrics[t])}this.compile({loss:n,metrics:r,optimizer:t})}async save(e,t){if(typeof e==`string`){let t=Oa(e);if(t.length===0)throw new K(`Cannot find any save handlers for URL '${e}'`);if(t.length>1)throw new K(`Found more than one (${t.length}) save handlers for URL '${e}'`);e=t[0]}if(e.save==null)throw new K("LayersModel.save() cannot proceed because the IOHandler provided does not have the `save` attribute defined.");let n=await ya(this.getNamedWeights(t)),r={modelTopology:this.toJSON(null,!1),format:bS,generatedBy:`TensorFlow.js tfjs-layers v${Wx}`,convertedBy:null};if(t!=null&&t.includeOptimizer&&this.optimizer!=null){r.trainingConfig=this.getTrainingConfig();let{data:e,specs:t}=await ya(await this.optimizer.getWeights(),`optimizer`);n.specs.push(...t),n.data=Ta([n.data,e])}return this.userDefinedMetadata!=null&&(Nx(this.userDefinedMetadata,this.name,!0),r.userDefinedMetadata=this.userDefinedMetadata),r.weightData=n.data,r.weightSpecs=n.specs,e.save(r)}setUserDefinedMetadata(e){Nx(e,this.name),this.userDefinedMetadata=e}getUserDefinedMetadata(){return this.userDefinedMetadata}};xS.className=`Model`,G(xS);var SS=class extends xS{};SS.className=`Functional`,G(SS);var CS=class e extends xS{constructor(e){if(super({inputs:[],outputs:[]}),e||={},this.trainable=!0,this.built=!1,this.name=e.name==null?kv(`sequential_`):e.name,e.layers!=null)for(let t of e.layers)this.add(t)}checkShape(e){if(e.inboundNodes[0].outputTensors[0].shape.some(e=>e<0))throw new K(`Negative dimension size caused by adding layer ${e.name} with input shape [${e.inboundNodes[0].inputTensors[0].shape}]`)}add(t){let n=t instanceof e||t instanceof xS,r;if(n){if(r=t,r.outputs.length!==1)throw new K(`All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.`);if(r.inputs.length!==1)throw new K(`All layers in a Sequential model should have a single input tensor. For multi-input layers, use the functional API.`)}if(this.outputs.length===0){if(t.inboundNodes.length===0){if(t.batchInputShape==null)throw new K("The first layer in a Sequential model must get an `inputShape` or `batchInputShape` argument.");let e=hb({batchShape:t.batchInputShape,dtype:t.dtype,name:t.name+`_input`});t.apply(e)}if(n)this.outputs=r.outputs,this.inputs=r.inputs;else{if(t.inboundNodes.length!==1)throw new K(`A layer added to a Sequential model must not already be connected somewhere else. LayersModel received layer ${t.name} which has ${t.inboundNodes.length} pre-existing inbound connections.`);if(t.inboundNodes[0].outputTensors.length!==1)throw new K(`All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.`);this.checkShape(t),this.outputs=[t.inboundNodes[0].outputTensors[0]],this.inputs=db(this.outputs[0])}this.inboundNodes=[],new sb({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:this.inputs,outputTensors:this.outputs,inputMasks:av(null,this.inputs.length),outputMasks:[null],inputShapes:this.inputs.map(e=>e.shape),outputShapes:this.outputs[0].shape})}else{let e=t.apply(this.outputs[0]);if(Array.isArray(e))throw TypeError(`All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.`);this.checkShape(t),this.outputs=[e],this.inboundNodes[0].outputTensors=this.outputs,this.inboundNodes[0].outputShapes=[this.outputs[0].shape]}this.layers.push(t),this.built=!1}pop(){if(this.layers.length===0)throw TypeError(`There are no layers in the model.`);if(this.layers.pop(),this.layers.length===0)this.outputs=[],this.inboundNodes=[],this.outboundNodes=[];else{let e=this.layers.length-1;this.layers[e].outboundNodes=[],this.outputs=[this.layers[e].output],this.inboundNodes[0].outputTensors=this.outputs,this.inboundNodes[0].outputShapes=[this.outputs[0].shape]}}call(e,t){return this.model??this.build(),this.model.call(e,t)}build(e){if(Zy(e),this.inputs.length===0||this.outputs.length===0)throw TypeError(`Sequential model cannot be built: model is empty. Add some layers first.`);this.model=new xS({inputs:this.inputs,outputs:this.outputs[0],name:this.name+`_model`}),this.model.trainable=this.trainable,this.supportsMasking=this.model.supportsMasking,this.inputLayers=this.model.inputLayers,this.inputLayersNodeIndices=this.model.inputLayersNodeIndices,this.inputLayersTensorIndices=this.model.inputLayersTensorIndices,this.outputLayers=this.model.outputLayers,this.outputLayersNodeIndices=this.model.outputLayersNodeIndices,this.outputLayersTensorIndices=this.model.outputLayersTensorIndices,this.nodesByDepth=this.model.nodesByDepth,this.containerNodes=this.model.containerNodes,this.outputNames=this.model.outputNames,this.inputNames=this.model.inputNames,this.built=!0}countParams(){return this.built||this.build(),super.countParams()}summary(e,t,n=console.log){this.built||this.build(),super.summary(e,t,n)}setWeights(e){this.model??this.build(),this.model.setWeights(e)}evaluate(e,t,n={}){if(!this.built)throw new nv(`The model needs to be compiled before being used.`);return this.model.evaluate(e,t,n)}async evaluateDataset(e,t){if(!this.built)throw new nv(`The model needs to be compiled before being used.`);return this.model.evaluateDataset(e,t)}predict(e,t={}){return this.model??this.build(),this.model.predict(e,t)}predictOnBatch(e){return this.model??this.build(),this.model.predictOnBatch(e)}compile(e){this.build(),this.model.compile(e),this.optimizer_=this.model.optimizer,this.isOptimizerOwned=this.model.isOptimizerOwned,this.loss=this.model.loss,this.metrics=this.model.metrics,this.metricsTensors=this.model.metricsTensors,this.metricsNames=this.model.metricsNames}get optimizer(){return this.model==null?void 0:this.model.optimizer}set optimizer(e){this.model.optimizer=e}async fit(e,t,n={}){if(!this.built)throw new nv(`The model needs to be compiled before being used.`);return this.model.fit(e,t,n)}async fitDataset(e,t){if(!this.built)throw new nv(`The model needs to be compiled before being used.`);return this.model.fitDataset(e,t)}async trainOnBatch(e,t){return this.model.trainOnBatch(e,t)}static fromConfig(t,n,r={},i=!1){let a,o={};if(n instanceof Array){if(n[0].className==null||n[0].className===`Merge`)throw new K(`Legacy serialization format not supported yet.`);a=n}else m(n.layers!=null,()=>`When the config data for a Sequential model is not an Array, it must be an Object that contains the 'layers' field.`),a=n.layers,delete n.layers,o=n;let s=new t(o);if(!(s instanceof e))throw new q(`Sequential.fromConfig called on non-Sequential input: ${s}`);for(let e of a){let t=qb(e,void 0,i);i&&t.setFastWeightInitDuringBuild(!0),s.add(t)}return s}set stopTraining(e){if(this.model==null)throw new K(`Cannot set the stopTraining property of a sequential model before it is compiled.`);this.model.stopTraining=e}get stopTraining(){if(this.model==null)throw new K(`Cannot get the stopTraining property of a sequential model before it is compiled.`);return this.model.stopTraining}getConfig(){let e=[];for(let t of this.layers){let n={};n.className=t.getClassName(),n.config=t.getConfig(),e.push(n)}return{name:this.name,layers:e}}};CS.className=`Sequential`,G(CS);var wS=class extends tm{getConfig(){return{}}},TS=class extends wS{apply(e,t=1){return yy(e,t)}};TS.className=`elu`,G(TS);var ES=class extends wS{apply(e){return jd(e)}};ES.className=`selu`,G(ES);var DS=class extends wS{apply(e){return xd(e)}};DS.className=`relu`,G(DS);var OS=class extends wS{apply(e){return P(()=>Au(6,xd(e)))}};OS.className=`relu6`,G(OS);var kS=class extends wS{apply(e){return e}};kS.className=`linear`,G(kS);var AS=class extends wS{apply(e){return gs(e)}};AS.className=`sigmoid`,G(AS);var jS=class extends wS{apply(e){return Sy(e)}};jS.className=`hardSigmoid`,G(jS);var MS=class extends wS{apply(e){return ru(e)}};MS.className=`softplus`,G(MS);var NS=class extends wS{apply(e){return by(e)}};NS.className=`softsign`,G(NS);var PS=class extends wS{apply(e){return bs(e)}};PS.className=`tanh`,G(PS);var FS=class extends wS{apply(e,t=-1){return Yd(e,t)}};FS.className=`softmax`,G(FS);var IS=class extends wS{apply(e,t=-1){return cu(e,t)}};IS.className=`logSoftmax`,G(IS);var LS=class extends wS{apply(e){return P(()=>P(()=>B(e,B(.5,R(1,Hc(z(e,Math.sqrt(2))))))))}};LS.className=`gelu`,G(LS);var RS=class extends wS{apply(e){return P(()=>B(.5,B(e,R(1,bs(B(al(z(2,Math.PI)),R(e,B(.044715,nl(e,3)))))))))}};RS.className=`gelu_new`,G(RS);var zS=class extends wS{apply(e){return P(()=>B(e,bs(ru(e))))}};zS.className=`mish`,G(zS);var BS=class extends wS{apply(e,t=1){return P(()=>B(gs(B(e,t)),e))}};BS.className=`swish`,G(BS);function VS(e){return e.getClassName()}function HS(e,t={}){return hv(e,nm.getMap().classNameMap,t,`activation`)}function US(e){if(e==null){let e={};return e.className=`linear`,e.config={},HS(e)}if(typeof e==`string`){let t={};return t.className=e,t.config={},HS(t)}return e instanceof wS?e:HS(e)}function WS(e){if(e!=null&&typeof e!=`object`)throw Error(`Argument to L1L2 regularizer's constructor is expected to be an object, but received: ${e}`)}var GS=class extends tm{},KS=class extends GS{constructor(e){super(),WS(e),this.l1=e==null||e.l1==null?.01:e.l1,this.l2=e==null||e.l2==null?.01:e.l2,this.hasL1=this.l1!==0,this.hasL2=this.l2!==0}apply(e){return P(()=>{let t=Du([1]);return this.hasL1&&(t=R(t,U(B(this.l1,vo(e))))),this.hasL2&&(t=R(t,U(B(this.l2,gy(e))))),V(t,[])})}getConfig(){return{l1:this.l1,l2:this.l2}}static fromConfig(e,t){return new e({l1:t.l1,l2:t.l2})}};KS.className=`L1L2`,G(KS);var qS={l1l2:`L1L2`};function JS(e){return pv(e)}function YS(e,t={}){return hv(e,nm.getMap().classNameMap,t,`regularizer`)}function XS(e){return e==null?null:typeof e==`string`?YS({className:e in qS?qS[e]:e,config:{}}):e instanceof GS?e:YS(e)}var ZS=class extends Y{constructor(e){super(e??{}),this.supportsMasking=!0,e!=null&&(this.maxValue=e.maxValue)}call(e,t){e=J(e);let n=xd(e);return this.maxValue!=null&&(n=Bs(n,0,this.maxValue)),n}computeOutputShape(e){return e}getConfig(){let e={maxValue:this.maxValue},t=super.getConfig();return Object.assign(e,t),e}};ZS.className=`ReLU`,G(ZS);var QS=class extends Y{constructor(e){super(e??{}),this.DEFAULT_ALPHA=.3,e??={},this.alpha=e.alpha==null?this.DEFAULT_ALPHA:e.alpha}call(e,t){return Vl(J(e),this.alpha)}computeOutputShape(e){return e}getConfig(){let e={alpha:this.alpha},t=super.getConfig();return Object.assign(e,t),e}};QS.className=`LeakyReLU`,G(QS);var $S=class extends Y{constructor(e){if(super(e??{}),this.DEFAULT_ALPHA_INITIALIZER=`zeros`,e??={},this.supportsMasking=!0,this.alphaInitializer=Jy(e.alphaInitializer||this.DEFAULT_ALPHA_INITIALIZER),this.alphaRegularizer=XS(e.alphaRegularizer),this.alphaConstraint=Fb(e.alphaConstraint),e.sharedAxes==null)this.sharedAxes=null;else if(Array.isArray(e.sharedAxes))this.sharedAxes=e.sharedAxes;else if(typeof e.sharedAxes==`number`)this.sharedAxes=[e.sharedAxes];else throw new K(`Expected sharedAxes to be a number or an array of numbers, but got ${e.sharedAxes}`)}build(e){e=Zy(e);let t=e.slice(1);if(this.sharedAxes!=null)for(let e of this.sharedAxes)t[e-1]=1;this.alpha=this.addWeight(`alpha`,t,`float32`,this.alphaInitializer,this.alphaRegularizer,!0,this.alphaConstraint);let n={};if(this.sharedAxes!=null)for(let t=1;t<e.length;++t)n[t]=e[t];this.inputSpec=[new ib({ndim:e.length,axes:n})],this.built=!0}call(e,t){return e=J(e),Qu(e,this.alpha.read())}getConfig(){let e={alphaInitializer:qy(this.alphaInitializer),alphaRegularizer:JS(this.alphaRegularizer),alphaConstraint:Nb(this.alphaConstraint),sharedAxes:this.sharedAxes},t=super.getConfig();return Object.assign(e,t),e}};$S.className=`PReLU`,G($S);var eC=class extends Y{constructor(e){if(super(e??{}),this.DEFAULT_ALPHA=1,e??={},e.alpha!=null&&e.alpha!==this.DEFAULT_ALPHA)throw new q(`Non-default alpha value (${e.alpha}) is not supported by the ELU layer yet.`);this.alpha=e.alpha==null?this.DEFAULT_ALPHA:e.alpha}call(e,t){return Bc(J(e))}computeOutputShape(e){return e}getConfig(){let e={alpha:this.alpha},t=super.getConfig();return Object.assign(e,t),e}};eC.className=`ELU`,G(eC);var tC=class extends Y{constructor(e){super(e??{}),this.DEFAULT_THETA=1,e??={},this.theta=e.theta==null?this.DEFAULT_THETA:e.theta}call(e,t){let n=J(e);return B(n,L(kl(n,this.theta),`float32`))}computeOutputShape(e){return e}getConfig(){let e={theta:this.theta},t=super.getConfig();return Object.assign(e,t),e}};tC.className=`ThresholdedReLU`,G(tC);var nC=class extends Y{constructor(e){super(e??{}),this.DEFAULT_AXIS=1,e??={},this.softmax=new FS().apply,this.axis=e.axis==null?this.DEFAULT_AXIS:e.axis}call(e,t){return P(()=>{let n=J(e),r=t.mask;if(r!=null){let e=B(W(Ou(n.shape),L(r,n.dtype)),rl(-1e9));n=R(n,e)}return this.axis instanceof Array?this.axis.length>1?hl(W(n,uu(n,this.axis,!0))):this.softmax(n,this.axis[0]):this.softmax(n,this.axis)})}computeOutputShape(e){return e}getConfig(){let e={axis:this.axis},t=super.getConfig();return Object.assign(e,t),e}};nC.className=`Softmax`,G(nC);function rC(e,t,n){if(typeof e==`number`)return av(e,t);if(e.length!==t)throw new K(`The ${n} argument must be an integer or tuple of ${t} integers. Received: ${e.length} elements.`);for(let r=0;r<t;++r){let i=e[r];if(!Jv(i))throw new K(`The ${n} argument must be an integer or tuple of ${t} integers. Received: ${JSON.stringify(e)} including a non-integer number ${i}`)}return e}function iC(e,t,n,r,i=1){if(e==null)return e;let a=t+(t-1)*(i-1),o;return o=n===`same`?e:e-a+1,Math.floor((o+r-1)/r)}function aC(e,t,n,r){if(e==null)return null;if(r===`valid`)e=e*t+Zv([n-t,0]);else if(r===`same`)e*=t;else throw new K(`Unsupport padding mode: ${r}.`);return e}function oC(e,t){return P(()=>(Iv(t),t===`channelsFirst`?Lf(e,[0,2,3,1]):e))}function sC(e,t){return P(()=>(Iv(t),t===`channelsFirst`?Lf(e,[0,2,3,4,1]):e))}function cC(e,t,n,r=1,i=`valid`,a,o=1){return P(()=>{if(a??=ty(),Iv(a),e.shape.length!==3)throw new K(`The input of a conv1dWithBias operation should be 3, but is ${e.shape.length} instead.`);if(t.shape.length!==3)throw new K(`The kernel for a conv1dWithBias operation should be 3, but is ${t.shape.length} instead`);if(n!=null&&n.shape.length!==1)throw new K(`The bias for a conv1dWithBias operation should be 1, but is ${n.shape.length} instead`);if(a===`channelsFirst`&&(e=Lf(e,[0,2,1])),i===`causal`)throw new q(`The support for CAUSAL padding mode in conv1dWithBias is not implemented yet.`);let s=Qs(e,t,r,i===`same`?`same`:`valid`,`NWC`,o);return n!=null&&(s=vy(s,n)),s})}function lC(e,t,n,r=[1,1],i=`valid`,a,o,s=null){return P(()=>{if(a??=ty(),Iv(a),e.rank!==3&&e.rank!==4)throw new K(`conv2dWithBiasActivation expects input to be of rank 3 or 4, but received ${e.rank}.`);if(t.rank!==3&&t.rank!==4)throw new K(`conv2dWithBiasActivation expects kernel to be of rank 3 or 4, but received ${e.rank}.`);let c=oC(e,a);if(i===`causal`)throw new q(`The support for CAUSAL padding mode in conv1dWithBias is not implemented yet.`);return c=Jf({x:c,filter:t,strides:r,pad:i===`same`?`same`:`valid`,dilations:o,dataFormat:`NHWC`,bias:n,activation:s}),a===`channelsFirst`&&(c=Lf(c,[0,3,1,2])),c})}function uC(e,t,n,r=[1,1,1],i=`valid`,a,o){return P(()=>{if(a??=ty(),Iv(a),e.rank!==4&&e.rank!==5)throw new K(`conv3dWithBias expects input to be of rank 4 or 5, but received ${e.rank}.`);if(t.rank!==4&&t.rank!==5)throw new K(`conv3dWithBias expects kernel to be of rank 4 or 5, but received ${e.rank}.`);let s=sC(e,a);if(i===`causal`)throw new q(`The support for CAUSAL padding mode in conv3dWithBias is not implemented yet.`);return s=ic(s,t,r,i===`same`?`same`:`valid`,`NDHWC`,o),n!=null&&(s=vy(s,n)),a===`channelsFirst`&&(s=Lf(s,[0,4,1,2,3])),s})}var dC=class e extends Y{constructor(t,n){if(super(n),this.bias=null,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,e.verifyArgs(n),this.rank=t,Sv(this.rank,`rank`),this.rank!==1&&this.rank!==2&&this.rank!==3)throw new q(`Convolution layer for rank other than 1, 2, or 3 (${this.rank}) is not implemented yet.`);if(this.kernelSize=rC(n.kernelSize,t,`kernelSize`),this.strides=rC(n.strides==null?1:n.strides,t,`strides`),this.padding=n.padding==null?`valid`:n.padding,Rv(this.padding),this.dataFormat=n.dataFormat==null?`channelsLast`:n.dataFormat,Iv(this.dataFormat),this.activation=US(n.activation),this.useBias=n.useBias==null||n.useBias,this.biasInitializer=Jy(n.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.biasConstraint=Fb(n.biasConstraint),this.biasRegularizer=XS(n.biasRegularizer),this.activityRegularizer=XS(n.activityRegularizer),this.dilationRate=rC(n.dilationRate==null?1:n.dilationRate,t,`dilationRate`),this.rank===1&&Array.isArray(this.dilationRate)&&this.dilationRate.length!==1)throw new K(`dilationRate must be a number or an array of a single number for 1D convolution, but received ${JSON.stringify(this.dilationRate)}`);if(this.rank===2){if(typeof this.dilationRate==`number`)this.dilationRate=[this.dilationRate,this.dilationRate];else if(this.dilationRate.length!==2)throw new K(`dilationRate must be a number or array of two numbers for 2D convolution, but received ${JSON.stringify(this.dilationRate)}`)}else if(this.rank===3){if(typeof this.dilationRate==`number`)this.dilationRate=[this.dilationRate,this.dilationRate,this.dilationRate];else if(this.dilationRate.length!==3)throw new K(`dilationRate must be a number or array of three numbers for 3D convolution, but received ${JSON.stringify(this.dilationRate)}`)}}static verifyArgs(e){if(ov(`kernelSize`in e,`required key 'kernelSize' not in config`),typeof e.kernelSize!=`number`&&!xv(e.kernelSize,`number`,1,3))throw new K(`BaseConv expects config.kernelSize to be number or number[] with length 1, 2, or 3, but received ${JSON.stringify(e.kernelSize)}.`)}getConfig(){let e={kernelSize:this.kernelSize,strides:this.strides,padding:this.padding,dataFormat:this.dataFormat,dilationRate:this.dilationRate,activation:VS(this.activation),useBias:this.useBias,biasInitializer:qy(this.biasInitializer),biasRegularizer:JS(this.biasRegularizer),activityRegularizer:JS(this.activityRegularizer),biasConstraint:Nb(this.biasConstraint)},t=super.getConfig();return Object.assign(e,t),e}},fC=class e extends dC{constructor(t,n){super(t,n),this.kernel=null,e.verifyArgs(n),this.filters=n.filters,Sv(this.filters,`filters`),this.kernelInitializer=Jy(n.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.kernelConstraint=Fb(n.kernelConstraint),this.kernelRegularizer=XS(n.kernelRegularizer)}build(e){e=Zy(e);let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null)throw new K(`The channel dimension of the input should be defined. Found ${e[t]}`);let n=e[t],r=this.kernelSize.concat([n,this.filters]);this.kernel=this.addWeight(`kernel`,r,null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.filters],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[{ndim:this.rank+2,axes:{[t]:n}}],this.built=!0}call(e,t){return P(()=>{e=J(e);let t,n=this.bias==null?null:this.bias.read(),r=Tv(this.activation.getClassName());if(r!=null&&this.rank===2)t=lC(e,this.kernel.read(),n,this.strides,this.padding,this.dataFormat,this.dilationRate,r);else{if(this.rank===1)t=cC(e,this.kernel.read(),n,this.strides[0],this.padding,this.dataFormat,this.dilationRate[0]);else if(this.rank===2)t=lC(e,this.kernel.read(),n,this.strides,this.padding,this.dataFormat,this.dilationRate);else if(this.rank===3)t=uC(e,this.kernel.read(),n,this.strides,this.padding,this.dataFormat,this.dilationRate);else throw new q(`convolutions greater than 3D are not implemented yet.`);this.activation!=null&&(t=this.activation.apply(t))}return t})}computeOutputShape(e){e=Zy(e);let t=[],n=this.dataFormat===`channelsLast`?e.slice(1,e.length-1):e.slice(2);for(let e=0;e<n.length;++e){let r=iC(n[e],this.kernelSize[e],this.padding,this.strides[e],typeof this.dilationRate==`number`?this.dilationRate:this.dilationRate[e]);t.push(r)}let r=[e[0]];return this.dataFormat===`channelsLast`?(r=r.concat(t),r.push(this.filters)):(r.push(this.filters),r=r.concat(t)),r}getConfig(){let e={filters:this.filters,kernelInitializer:qy(this.kernelInitializer),kernelRegularizer:JS(this.kernelRegularizer),kernelConstraint:Nb(this.kernelConstraint)},t=super.getConfig();return Object.assign(e,t),e}static verifyArgs(e){if(!(`filters`in e)||typeof e.filters!=`number`||e.filters<1)throw new K(`Convolution layer expected config.filters to be a 'number' > 0 but got ${JSON.stringify(e.filters)}`)}},pC=class e extends fC{constructor(t){super(2,t),e.verifyArgs(t)}getConfig(){let e=super.getConfig();return delete e.rank,e}static verifyArgs(e){if(typeof e.kernelSize!=`number`&&!xv(e.kernelSize,`number`,1,2))throw new K(`Conv2D expects config.kernelSize to be number or number[] with length 1 or 2, but received ${JSON.stringify(e.kernelSize)}.`)}};pC.className=`Conv2D`,G(pC);var mC=class e extends fC{constructor(t){super(3,t),e.verifyArgs(t)}getConfig(){let e=super.getConfig();return delete e.rank,e}static verifyArgs(e){if(typeof e.kernelSize!=`number`&&!(Array.isArray(e.kernelSize)&&(e.kernelSize.length===1||e.kernelSize.length===3)))throw new K(`Conv3D expects config.kernelSize to be number or [number, number, number], but received ${JSON.stringify(e.kernelSize)}.`)}};mC.className=`Conv3D`,G(mC);var hC=class extends pC{constructor(e){if(super(e),this.inputSpec=[new ib({ndim:4})],this.padding!==`same`&&this.padding!==`valid`)throw new K(`Conv2DTranspose currently supports only padding modes 'same' and 'valid', but received padding mode ${this.padding}`)}build(e){if(e=Zy(e),e.length!==4)throw new K(`Input should have rank 4; Received input shape: `+JSON.stringify(e));let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null)throw new K("The channel dimension of the inputs should be defined. Found `None`.");let n=e[t],r=this.kernelSize.concat([this.filters,n]);this.kernel=this.addWeight(`kernel`,r,`float32`,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.filters],`float32`,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[new ib({ndim:4,axes:{[t]:n}})],this.built=!0}call(e,t){return P(()=>{let t=J(e);if(t.shape.length!==4)throw new K(`Conv2DTranspose.call() expects input tensor to be rank-4, but received a tensor of rank-${t.shape.length}`);let n=t.shape,r=n[0],i,a;this.dataFormat===`channelsFirst`?(i=2,a=3):(i=1,a=2);let o=n[i],s=n[a],c=this.kernelSize[0],l=this.kernelSize[1],u=this.strides[0],d=this.strides[1],f=[r,aC(o,u,c,this.padding),aC(s,d,l,this.padding),this.filters];this.dataFormat!==`channelsLast`&&(t=Lf(t,[0,2,3,1]));let p=nc(t,this.kernel.read(),f,this.strides,this.padding);return this.dataFormat!==`channelsLast`&&(p=Lf(p,[0,3,1,2])),this.bias!=null&&(p=vy(p,this.bias.read(),this.dataFormat)),this.activation!=null&&(p=this.activation.apply(p)),p})}computeOutputShape(e){e=Zy(e);let t=e.slice(),n,r,i;this.dataFormat===`channelsFirst`?(n=1,r=2,i=3):(n=3,r=1,i=2);let a=this.kernelSize[0],o=this.kernelSize[1],s=this.strides[0],c=this.strides[1];return t[n]=this.filters,t[r]=aC(t[r],s,a,this.padding),t[i]=aC(t[i],c,o,this.padding),t}getConfig(){let e=super.getConfig();return delete e.dilationRate,e}};hC.className=`Conv2DTranspose`,G(hC);var gC=class extends mC{constructor(e){if(super(e),this.inputSpec=[new ib({ndim:5})],this.padding!==`same`&&this.padding!==`valid`)throw new K(`Conv3DTranspose currently supports only padding modes 'same' and 'valid', but received padding mode ${this.padding}`)}build(e){if(e=Zy(e),e.length!==5)throw new K(`Input should have rank 5; Received input shape: `+JSON.stringify(e));let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null)throw new K("The channel dimension of the inputs should be defined. Found `None`.");let n=e[t],r=this.kernelSize.concat([this.filters,n]);this.kernel=this.addWeight(`kernel`,r,`float32`,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.filters],`float32`,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[new ib({ndim:5,axes:{[t]:n}})],this.built=!0}call(e,t){return P(()=>{let t=J(e);if(t.shape.length!==5)throw new K(`Conv3DTranspose.call() expects input tensor to be rank-4, but received a tensor of rank-${t.shape.length}`);let n=t.shape,r=n[0],i,a,o;this.dataFormat===`channelsFirst`?(o=2,i=3,a=4):(o=1,i=2,a=3);let s=n[o],c=n[i],l=n[a],u=this.kernelSize[0],d=this.kernelSize[1],f=this.kernelSize[2],p=this.strides[0],m=this.strides[1],h=this.strides[2],g=[r,aC(s,p,u,this.padding),aC(c,m,d,this.padding),aC(l,h,f,this.padding),this.filters];this.dataFormat!==`channelsLast`&&(t=Lf(t,[0,2,3,4,1]));let _=cc(t,this.kernel.read(),g,this.strides,this.padding);return this.dataFormat!==`channelsLast`&&(_=Lf(_,[0,4,1,2,3])),this.bias!==null&&(_=vy(_,this.bias.read(),this.dataFormat)),this.activation!==null&&(_=this.activation.apply(_)),_})}computeOutputShape(e){e=Zy(e);let t=e.slice(),n,r,i,a;this.dataFormat===`channelsFirst`?(n=1,r=2,i=3,a=4):(n=4,r=1,i=2,a=3);let o=this.kernelSize[0],s=this.kernelSize[1],c=this.kernelSize[2],l=this.strides[0],u=this.strides[1],d=this.strides[2];return t[n]=this.filters,t[r]=aC(t[r],l,o,this.padding),t[i]=aC(t[i],u,s,this.padding),t[a]=aC(t[a],d,c,this.padding),t}getConfig(){let e=super.getConfig();return delete e.dilationRate,e}};gC.className=`Conv3DTranspose`,G(gC);var _C=class extends fC{constructor(e,t){if(super(e,t),this.DEFAULT_DEPTHWISE_INITIALIZER=`glorotUniform`,this.DEFAULT_POINTWISE_INITIALIZER=`glorotUniform`,this.depthwiseKernel=null,this.pointwiseKernel=null,t.filters==null)throw new K("The `filters` configuration field is required by SeparableConv, but is unspecified.");if(t.kernelInitializer!=null||t.kernelRegularizer!=null||t.kernelConstraint!=null)throw new K(`Fields kernelInitializer, kernelRegularizer and kernelConstraint are invalid for SeparableConv2D. Use depthwiseInitializer, depthwiseRegularizer, depthwiseConstraint, pointwiseInitializer, pointwiseRegularizer and pointwiseConstraint instead.`);if(t.padding!=null&&t.padding!==`same`&&t.padding!==`valid`)throw new K(`SeparableConv${this.rank}D supports only padding modes: 'same' and 'valid', but received ${JSON.stringify(t.padding)}`);this.depthMultiplier=t.depthMultiplier==null?1:t.depthMultiplier,this.depthwiseInitializer=Jy(t.depthwiseInitializer||this.DEFAULT_DEPTHWISE_INITIALIZER),this.depthwiseRegularizer=XS(t.depthwiseRegularizer),this.depthwiseConstraint=Fb(t.depthwiseConstraint),this.pointwiseInitializer=Jy(t.depthwiseInitializer||this.DEFAULT_POINTWISE_INITIALIZER),this.pointwiseRegularizer=XS(t.pointwiseRegularizer),this.pointwiseConstraint=Fb(t.pointwiseConstraint)}build(e){if(e=Zy(e),e.length<this.rank+2)throw new K(`Inputs to SeparableConv${this.rank}D should have rank ${this.rank+2}, but received input shape: ${JSON.stringify(e)}`);let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null||e[t]<0)throw new K(`The channel dimension of the inputs should be defined, but found ${JSON.stringify(e[t])}`);let n=e[t],r=this.kernelSize.concat([n,this.depthMultiplier]),i=[];for(let e=0;e<this.rank;++e)i.push(1);i.push(n*this.depthMultiplier,this.filters),this.depthwiseKernel=this.addWeight(`depthwise_kernel`,r,`float32`,this.depthwiseInitializer,this.depthwiseRegularizer,!0,this.depthwiseConstraint),this.pointwiseKernel=this.addWeight(`pointwise_kernel`,i,`float32`,this.pointwiseInitializer,this.pointwiseRegularizer,!0,this.pointwiseConstraint),this.bias=this.useBias?this.addWeight(`bias`,[this.filters],`float32`,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.inputSpec=[new ib({ndim:this.rank+2,axes:{[t]:n}})],this.built=!0}call(e,t){return P(()=>{e=J(e);let t;if(this.rank===1)throw new q(`1D separable convolution is not implemented yet.`);return this.rank===2&&(this.dataFormat===`channelsFirst`&&(e=Lf(e,[0,2,3,1])),t=Nd(e,this.depthwiseKernel.read(),this.pointwiseKernel.read(),this.strides,this.padding,this.dilationRate,`NHWC`)),this.useBias&&(t=vy(t,this.bias.read(),this.dataFormat)),this.activation!=null&&(t=this.activation.apply(t)),this.dataFormat===`channelsFirst`&&(t=Lf(t,[0,3,1,2])),t})}getConfig(){let e=super.getConfig();return delete e.rank,delete e.kernelInitializer,delete e.kernelRegularizer,delete e.kernelConstraint,e.depthwiseInitializer=qy(this.depthwiseInitializer),e.pointwiseInitializer=qy(this.pointwiseInitializer),e.depthwiseRegularizer=JS(this.depthwiseRegularizer),e.pointwiseRegularizer=JS(this.pointwiseRegularizer),e.depthwiseConstraint=Nb(this.depthwiseConstraint),e.pointwiseConstraint=Nb(this.pointwiseConstraint),e}};_C.className=`SeparableConv`;var vC=class extends _C{constructor(e){super(2,e)}};vC.className=`SeparableConv2D`,G(vC);var yC=class e extends fC{constructor(t){super(1,t),e.verifyArgs(t),this.inputSpec=[{ndim:3}]}getConfig(){let e=super.getConfig();return delete e.rank,delete e.dataFormat,e}static verifyArgs(e){if(typeof e.kernelSize!=`number`&&!xv(e.kernelSize,`number`,1,1))throw new K(`Conv1D expects config.kernelSize to be number or number[] with length 1, but received ${JSON.stringify(e.kernelSize)}.`)}};yC.className=`Conv1D`,G(yC);var bC=class extends Y{constructor(e){super(e),this.cropping=typeof e.cropping==`number`?[[e.cropping,e.cropping],[e.cropping,e.cropping]]:typeof e.cropping[0]==`number`?[[e.cropping[0],e.cropping[0]],[e.cropping[1],e.cropping[1]]]:e.cropping,this.dataFormat=e.dataFormat===void 0?`channelsLast`:e.dataFormat,this.inputSpec=[{ndim:4}]}computeOutputShape(e){return this.dataFormat===`channelsFirst`?[e[0],e[1],e[2]-this.cropping[0][0]-this.cropping[0][1],e[3]-this.cropping[1][0]-this.cropping[1][1]]:[e[0],e[1]-this.cropping[0][0]-this.cropping[0][1],e[2]-this.cropping[1][0]-this.cropping[1][1],e[3]]}call(e,t){return P(()=>(e=J(e),this.dataFormat===`channelsLast`?ly(ly(e,this.cropping[0][0],e.shape[1]-this.cropping[0][0]-this.cropping[0][1],2),this.cropping[1][0],e.shape[2]-this.cropping[1][1]-this.cropping[1][0],3):ly(ly(e,this.cropping[0][0],e.shape[2]-this.cropping[0][0]-this.cropping[0][1],3),this.cropping[1][0],e.shape[3]-this.cropping[1][1]-this.cropping[1][0],4)))}getConfig(){let e={cropping:this.cropping,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}};bC.className=`Cropping2D`,G(bC);var xC=class extends Y{constructor(e){super(e),this.DEFAULT_SIZE=[2,2],this.inputSpec=[{ndim:4}],this.size=e.size==null?this.DEFAULT_SIZE:e.size,this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Iv(this.dataFormat),this.interpolation=e.interpolation==null?`nearest`:e.interpolation,Lv(this.interpolation)}computeOutputShape(e){if(this.dataFormat===`channelsFirst`){let t=e[2]==null?null:this.size[0]*e[2],n=e[3]==null?null:this.size[1]*e[3];return[e[0],e[1],t,n]}{let t=e[1]==null?null:this.size[0]*e[1],n=e[2]==null?null:this.size[1]*e[2];return[e[0],t,n,e[3]]}}call(e,t){return P(()=>{let t=J(e),n=t.shape;if(this.dataFormat===`channelsFirst`){t=Lf(t,[0,2,3,1]);let e=this.size[0]*n[2],r=this.size[1]*n[3];return Lf(this.interpolation===`nearest`?Zp.resizeNearestNeighbor(t,[e,r]):Zp.resizeBilinear(t,[e,r]),[0,3,1,2])}{let e=this.size[0]*n[1],r=this.size[1]*n[2];return this.interpolation===`nearest`?Zp.resizeNearestNeighbor(t,[e,r]):Zp.resizeBilinear(t,[e,r])}})}getConfig(){let e={size:this.size,dataFormat:this.dataFormat,interpolation:this.interpolation},t=super.getConfig();return Object.assign(e,t),e}};xC.className=`UpSampling2D`,G(xC);function SC(e,t,n=[1,1],r=`valid`,i,a){return P(()=>{i??=ty(),Iv(i);let o=oC(e,i);if(e.rank!==4)throw new K(`Input for depthwiseConv2d is required to be 4-D, but is instead ${e.rank}-D`);if(t.rank!==4)throw new K(`depthwiseKernel is required to be 4-D, but is instead ${t.rank}-D`);return o=Sc(o,t,n,r===`same`?`same`:`valid`,`NHWC`,a),i===`channelsFirst`&&(o=Lf(o,[0,3,1,2])),o})}var CC=class extends dC{constructor(e){super(2,e),this.depthwiseKernel=null,this.depthMultiplier=e.depthMultiplier==null?1:e.depthMultiplier,this.depthwiseInitializer=Jy(e.depthwiseInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.depthwiseConstraint=Fb(e.depthwiseConstraint),this.depthwiseRegularizer=XS(e.depthwiseRegularizer)}build(e){if(e=Zy(e),e.length<4)throw new K(`Inputs to DepthwiseConv2D should have rank 4. Received input shape: ${JSON.stringify(e)}.`);let t=this.dataFormat===`channelsFirst`?1:3;if(e[t]==null||e[t]<0)throw new K(`The channel dimension of the inputs to DepthwiseConv2D should be defined, but is not (${e[t]}).`);let n=e[t],r=[this.kernelSize[0],this.kernelSize[1],n,this.depthMultiplier];this.depthwiseKernel=this.addWeight(`depthwise_kernel`,r,null,this.depthwiseInitializer,this.depthwiseRegularizer,!0,this.depthwiseConstraint),this.bias=this.useBias?this.addWeight(`bias`,[n*this.depthMultiplier],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.built=!0}call(e,t){return P(()=>{e=J(e);let t=SC(e,this.depthwiseKernel.read(),this.strides,this.padding,this.dataFormat,null);return this.useBias&&(t=vy(t,this.bias.read(),this.dataFormat)),this.activation!=null&&(t=this.activation.apply(t)),t})}computeOutputShape(e){e=Zy(e);let t=this.dataFormat===`channelsFirst`?e[2]:e[1],n=this.dataFormat===`channelsFirst`?e[3]:e[2],r=this.dataFormat===`channelsFirst`?e[1]*this.depthMultiplier:e[3]*this.depthMultiplier,i=iC(t,this.kernelSize[0],this.padding,this.strides[0]),a=iC(n,this.kernelSize[1],this.padding,this.strides[1]);return this.dataFormat===`channelsFirst`?[e[0],r,i,a]:[e[0],i,a,r]}getConfig(){let e=super.getConfig();return e.depthMultiplier=this.depthMultiplier,e.depthwiseInitializer=qy(this.depthwiseInitializer),e.depthwiseRegularizer=JS(this.depthwiseRegularizer),e.depthwiseConstraint=Nb(this.depthwiseRegularizer),e}};CC.className=`DepthwiseConv2D`,G(CC);function wC(e,t,n,r){if(Array.isArray(e)){if(t!=null||n!=null)throw new K(`When inputs is an array, neither initialState or constants should be provided`);r!=null&&(n=e.slice(e.length-r,e.length),e=e.slice(0,e.length-r)),e.length>1&&(t=e.slice(1,e.length)),e=e[0]}function i(e){return e==null||Array.isArray(e)?e:[e]}return t=i(t),n=i(n),{inputs:e,initialState:t,constants:n}}function TC(e,t,n,r=!1,i,a,o=!1,s=!1){return P(()=>{let c=t.shape.length;if(c<3)throw new K(`Input should be at least 3D, but is ${c}D.`);let l=[1,0].concat(Qv(2,c));if(t=Lf(t,l),a!=null)throw new q(`The rnn() functoin of the deeplearn.js backend does not support constants yet.`);o&&console.warn(`Backend rnn(): the unroll = true option is not applicable to the imperative deeplearn.js backend.`),i!=null&&(i=L(L(i,`bool`),`float32`),i.rank===c-1&&(i=_l(i,-1)),i=Lf(i,l)),r&&(t=Td(t,0),i!=null&&(i=Td(i,0)));let u=[],d,f=n,p=t.shape[0],m=Nf(t),h;i!=null&&(h=Nf(i));for(let t=0;t<p;++t){let n=m[t],r=P(()=>e(n,f));if(i==null)d=r[0],f=r[1];else{let e=P(()=>{let e=h[t],n=W(Hu(e),e);return{output:R(B(r[0],e),B(f[0],n)),newStates:f.map((t,i)=>R(B(r[1][i],e),B(t,n)))}});d=e.output,f=e.newStates}s&&u.push(d)}let g;return s&&(g=ff(u,1)),[d,g,f]})}var EC=class e extends Y{constructor(e){super(e);let t;if(e.cell==null)throw new K(`cell property is missing for the constructor of RNN.`);if(t=Array.isArray(e.cell)?new PC({cells:e.cell}):e.cell,t.stateSize==null)throw new K("The RNN cell should have an attribute `stateSize` (tuple of integers, one integer per RNN state).");this.cell=t,this.returnSequences=e.returnSequences!=null&&e.returnSequences,this.returnState=e.returnState!=null&&e.returnState,this.goBackwards=e.goBackwards!=null&&e.goBackwards,this._stateful=e.stateful!=null&&e.stateful,this.unroll=e.unroll!=null&&e.unroll,this.supportsMasking=!0,this.inputSpec=[new ib({ndim:3})],this.stateSpec=null,this.states_=null,this.numConstants=null,this.keptStates=[]}getStates(){return this.states_==null?Qv(0,Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1).map(e=>null):this.states_}setStates(e){this.states_=e}computeOutputShape(e){Yy(e)&&(e=e[0]),e=e;let t=this.cell.stateSize;Array.isArray(t)||(t=[t]);let n=t[0],r;if(r=this.returnSequences?[e[0],e[1],n]:[e[0],n],this.returnState){let n=[];for(let r of t)n.push([e[0],r]);return[r].concat(n)}return r}computeMask(e,t){return P(()=>{Array.isArray(t)&&(t=t[0]);let e=this.returnSequences?t:null;if(this.returnState){let t=this.states.map(e=>null);return[e].concat(t)}return e})}get states(){if(this.states_==null){let e=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1,t=[];for(let n=0;n<e;++n)t.push(null);return t}return this.states_}set states(e){this.states_=e}build(e){if(this.numConstants!=null)throw new q(`Constants support is not implemented in RNN yet.`);Yy(e)&&(e=e[0]),e=e;let t=this.stateful?e[0]:null,n=e.slice(2);this.inputSpec[0]=new ib({shape:[t,null,...n]});let r=[e[0]].concat(e.slice(2));this.cell.build(r);let i;if(i=Array.isArray(this.cell.stateSize)?this.cell.stateSize:[this.cell.stateSize],this.stateSpec!=null){if(!v(this.stateSpec.map(e=>e.shape[e.shape.length-1]),i))throw new K(`An initialState was passed that is not compatible with cell.stateSize. Received stateSpec=${this.stateSpec}; However cell.stateSize is ${this.cell.stateSize}`)}else this.stateSpec=i.map(e=>new ib({shape:[null,e]}));this.stateful&&this.resetStates()}resetStates(e,t=!1){P(()=>{if(!this.stateful)throw new tv(`Cannot call resetStates() on an RNN Layer that is not stateful.`);let n=this.inputSpec[0].shape[0];if(n==null)throw new K("If an RNN is stateful, it needs to know its batch size. Specify the batch size of your input tensors: \n- If using a Sequential model, specify the batch size by passing a `batchInputShape` option to your first layer.\n- If using the functional API, specify the batch size by passing a `batchShape` option to your Input layer.");if(this.states_==null)this.states_=Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(e=>Du([n,e])):[Du([n,this.cell.stateSize])];else if(e==null)F(this.states_),this.keptStates!=null&&(F(this.keptStates),this.keptStates=[]),Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(e=>Du([n,e])):this.states_[0]=Du([n,this.cell.stateSize]);else{if(Array.isArray(e)||(e=[e]),e.length!==this.states_.length)throw new K(`Layer ${this.name} expects ${this.states_.length} state(s), but it received ${e.length} state value(s). Input received: ${e}`);t===!0?this.keptStates.push(this.states_.slice()):F(this.states_);for(let t=0;t<this.states_.length;++t){let r=e[t],i=[n,Array.isArray(this.cell.stateSize)?this.cell.stateSize[t]:this.cell.stateSize];if(!v(r.shape,i))throw new K(`State ${t} is incompatible with layer ${this.name}: expected shape=${i}, received shape=${r.shape}`);this.states_[t]=r}}this.states_=this.states_.map(e=>ha(e.clone()))})}apply(e,t){let n=t==null?null:t.initialState,r=t==null?null:t.constants;t??={};let i=wC(e,n,r,this.numConstants);e=i.inputs,n=i.initialState,r=i.constants;let a=[],o=[];if(n!=null){t.initialState=n,a=a.concat(n),this.stateSpec=[];for(let e of n)this.stateSpec.push(new ib({shape:e.shape}));o=o.concat(this.stateSpec)}if(r!=null&&(t.constants=r,a=a.concat(r),this.numConstants=r.length),a[0]instanceof ab){let n=[e].concat(a),r=this.inputSpec.concat(o),i=this.inputSpec;this.inputSpec=r;let s=super.apply(n,t);return this.inputSpec=i,s}return super.apply(e,t)}call(e,t){return P(()=>{let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;e=J(e),i??=this.stateful?this.states_:this.getInitialState(e);let a=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1;if(i.length!==a)throw new K(`RNN Layer has ${a} state(s) but was passed ${i.length} initial state(s).`);this.unroll&&console.warn(`Ignoring unroll = true for RNN layer, due to imperative backend.`);let o={training:r},s=TC((e,t)=>{let n=this.cell.call([e].concat(t),o);return[n[0],n.slice(1)]},e,i,this.goBackwards,n,null,this.unroll,this.returnSequences),c=s[0],l=s[1],u=s[2];this.stateful&&this.resetStates(u,r);let d=this.returnSequences?l:c;return this.returnState?[d].concat(u):d})}getInitialState(e){return P(()=>{let t=Du(e.shape);return t=U(t,[1,2]),t=ry(t),Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(e=>e>1?fy(t,[1,e]):t):this.cell.stateSize>1?[fy(t,[1,this.cell.stateSize])]:[t]})}get trainableWeights(){return this.trainable?this.cell.trainableWeights:[]}get nonTrainableWeights(){return this.trainable?this.cell.nonTrainableWeights:this.cell.weights}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.cell!=null&&this.cell.setFastWeightInitDuringBuild(e)}getConfig(){let t=super.getConfig(),n={returnSequences:this.returnSequences,returnState:this.returnState,goBackwards:this.goBackwards,stateful:this.stateful,unroll:this.unroll};this.numConstants!=null&&(n.numConstants=this.numConstants);let r=this.cell.getConfig();return this.getClassName()===e.className&&(n.cell={className:this.cell.getClassName(),config:r}),Object.assign(Object.assign(Object.assign({},r),t),n)}static fromConfig(e,t,n={}){let r=t.cell,i=qb(r,n);return new e(Object.assign(t,{cell:i}))}};EC.className=`RNN`,G(EC);var DC=class extends Y{},OC=class extends DC{constructor(e){super(e),this.DEFAULT_ACTIVATION=`tanh`,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_RECURRENT_INITIALIZER=`orthogonal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,this.units=e.units,Sv(this.units,`units`),this.activation=US(e.activation==null?this.DEFAULT_ACTIVATION:e.activation),this.useBias=e.useBias==null||e.useBias,this.kernelInitializer=Jy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Jy(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Jy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelRegularizer=XS(e.kernelRegularizer),this.recurrentRegularizer=XS(e.recurrentRegularizer),this.biasRegularizer=XS(e.biasRegularizer),this.kernelConstraint=Fb(e.kernelConstraint),this.recurrentConstraint=Fb(e.recurrentConstraint),this.biasConstraint=Fb(e.biasConstraint),this.dropout=Xv([1,Zv([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Xv([1,Zv([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.stateSize=this.units,this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){e=Zy(e),this.kernel=this.addWeight(`kernel`,[e[e.length-1],this.units],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight(`recurrent_kernel`,[this.units,this.units],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.bias=this.useBias?this.addWeight(`bias`,[this.units],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.built=!0}call(e,t){return P(()=>{if(e=e,e.length!==2)throw new K(`SimpleRNNCell expects 2 input Tensors, got ${e.length}.`);let n=e[1];e=e[0];let r=t.training!=null&&t.training;0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=FC({ones:()=>Hu(e),rate:this.dropout,training:r,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=FC({ones:()=>Hu(n),rate:this.recurrentDropout,training:r,dropoutFunc:this.dropoutFunc}));let i,a=this.dropoutMask,o=this.recurrentDropoutMask;i=my(a==null?e:B(e,a),this.kernel.read()),this.bias!=null&&(i=vy(i,this.bias.read())),o!=null&&(n=B(n,o));let s=R(i,my(n,this.recurrentKernel.read()));return this.activation!=null&&(s=this.activation.apply(s)),[s,s]})}getConfig(){let e=super.getConfig(),t={units:this.units,activation:VS(this.activation),useBias:this.useBias,kernelInitializer:qy(this.kernelInitializer),recurrentInitializer:qy(this.recurrentInitializer),biasInitializer:qy(this.biasInitializer),kernelRegularizer:JS(this.kernelRegularizer),recurrentRegularizer:JS(this.recurrentRegularizer),biasRegularizer:JS(this.biasRegularizer),activityRegularizer:JS(this.activityRegularizer),kernelConstraint:Nb(this.kernelConstraint),recurrentConstraint:Nb(this.recurrentConstraint),biasConstraint:Nb(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout};return Object.assign(Object.assign({},e),t)}};OC.className=`SimpleRNNCell`,G(OC);var kC=class extends EC{constructor(e){e.cell=new OC(e),super(e)}call(e,t){return P(()=>{this.cell.dropoutMask!=null&&(F(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(F(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}static fromConfig(e,t){return new e(t)}};kC.className=`SimpleRNN`,G(kC);var AC=class extends DC{constructor(e){if(super(e),this.DEFAULT_ACTIVATION=`tanh`,this.DEFAULT_RECURRENT_ACTIVATION=`hardSigmoid`,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_RECURRENT_INITIALIZER=`orthogonal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,e.resetAfter)throw new K(`GRUCell does not support reset_after parameter set to true.`);this.units=e.units,Sv(this.units,`units`),this.activation=US(e.activation===void 0?this.DEFAULT_ACTIVATION:e.activation),this.recurrentActivation=US(e.recurrentActivation===void 0?this.DEFAULT_RECURRENT_ACTIVATION:e.recurrentActivation),this.useBias=e.useBias==null||e.useBias,this.kernelInitializer=Jy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Jy(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Jy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelRegularizer=XS(e.kernelRegularizer),this.recurrentRegularizer=XS(e.recurrentRegularizer),this.biasRegularizer=XS(e.biasRegularizer),this.kernelConstraint=Fb(e.kernelConstraint),this.recurrentConstraint=Fb(e.recurrentConstraint),this.biasConstraint=Fb(e.biasConstraint),this.dropout=Xv([1,Zv([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Xv([1,Zv([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.implementation=e.implementation,this.stateSize=this.units,this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){e=Zy(e);let t=e[e.length-1];this.kernel=this.addWeight(`kernel`,[t,this.units*3],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight(`recurrent_kernel`,[this.units,this.units*3],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.bias=this.useBias?this.addWeight(`bias`,[this.units*3],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.built=!0}call(e,t){return P(()=>{if(e=e,e.length!==2)throw new K(`GRUCell expects 2 input Tensors (inputs, h, c), got ${e.length}.`);let n=t.training!=null&&t.training,r=e[1];e=e[0],0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=FC({ones:()=>Hu(e),rate:this.dropout,training:n,count:3,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=FC({ones:()=>Hu(r),rate:this.recurrentDropout,training:n,count:3,dropoutFunc:this.dropoutFunc}));let i=this.dropoutMask,a=this.recurrentDropoutMask,o,s,c;0<this.dropout&&this.dropout<1&&(e=B(e,i[0]));let l=my(e,this.kernel.read());this.useBias&&(l=vy(l,this.bias.read())),0<this.recurrentDropout&&this.recurrentDropout<1&&(r=B(r,a[0]));let u=this.recurrentKernel.read(),[d,f]=rf(u,[2*this.units,this.units],u.rank-1),p=my(r,d),[m,h,g]=rf(l,3,l.rank-1),[_,v]=rf(p,2,p.rank-1);o=this.recurrentActivation.apply(R(m,_)),s=this.recurrentActivation.apply(R(h,v));let y=my(B(s,r),f);c=this.activation.apply(R(g,y));let b=R(B(o,r),B(R(1,tu(o)),c));return[b,b]})}getConfig(){let e=super.getConfig(),t={units:this.units,activation:VS(this.activation),recurrentActivation:VS(this.recurrentActivation),useBias:this.useBias,kernelInitializer:qy(this.kernelInitializer),recurrentInitializer:qy(this.recurrentInitializer),biasInitializer:qy(this.biasInitializer),kernelRegularizer:JS(this.kernelRegularizer),recurrentRegularizer:JS(this.recurrentRegularizer),biasRegularizer:JS(this.biasRegularizer),activityRegularizer:JS(this.activityRegularizer),kernelConstraint:Nb(this.kernelConstraint),recurrentConstraint:Nb(this.recurrentConstraint),biasConstraint:Nb(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout,implementation:this.implementation,resetAfter:!1};return Object.assign(Object.assign({},e),t)}};AC.className=`GRUCell`,G(AC);var jC=class extends EC{constructor(e){e.implementation===0&&console.warn("`implementation=0` has been deprecated, and now defaults to `implementation=1`. Please update your layer call."),e.cell=new AC(e),super(e)}call(e,t){return P(()=>{this.cell.dropoutMask!=null&&(F(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(F(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}static fromConfig(e,t){return t.implmentation===0&&(t.implementation=1),new e(t)}};jC.className=`GRU`,G(jC);var MC=class extends DC{constructor(e){super(e),this.DEFAULT_ACTIVATION=`tanh`,this.DEFAULT_RECURRENT_ACTIVATION=`hardSigmoid`,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_RECURRENT_INITIALIZER=`orthogonal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,this.units=e.units,Sv(this.units,`units`),this.activation=US(e.activation===void 0?this.DEFAULT_ACTIVATION:e.activation),this.recurrentActivation=US(e.recurrentActivation===void 0?this.DEFAULT_RECURRENT_ACTIVATION:e.recurrentActivation),this.useBias=e.useBias==null||e.useBias,this.kernelInitializer=Jy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Jy(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Jy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.unitForgetBias=e.unitForgetBias,this.kernelRegularizer=XS(e.kernelRegularizer),this.recurrentRegularizer=XS(e.recurrentRegularizer),this.biasRegularizer=XS(e.biasRegularizer),this.kernelConstraint=Fb(e.kernelConstraint),this.recurrentConstraint=Fb(e.recurrentConstraint),this.biasConstraint=Fb(e.biasConstraint),this.dropout=Xv([1,Zv([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Xv([1,Zv([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.implementation=e.implementation,this.stateSize=[this.units,this.units],this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){var t;e=Zy(e);let n=e[e.length-1];this.kernel=this.addWeight(`kernel`,[n,this.units*4],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight(`recurrent_kernel`,[this.units,this.units*4],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint);let r;if(this.useBias){if(this.unitForgetBias){let e=this.biasInitializer,n=this.units;r=new(t=class extends Oy{apply(t,r){let i=e.apply([n]),a=new Ay().apply([n]),o=e.apply([n*2]);return dy(dy(i,a),o)}},t.className=`CustomInit`,t)}else r=this.biasInitializer;this.bias=this.addWeight(`bias`,[this.units*4],null,r,this.biasRegularizer,!0,this.biasConstraint)}else this.bias=null;this.built=!0}call(e,t){return P(()=>{let n=t.training!=null&&t.training;if(e=e,e.length!==3)throw new K(`LSTMCell expects 3 input Tensors (inputs, h, c), got ${e.length}.`);let r=e[1],i=e[2];e=e[0],0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=FC({ones:()=>Hu(e),rate:this.dropout,training:n,count:4,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=FC({ones:()=>Hu(r),rate:this.recurrentDropout,training:n,count:4,dropoutFunc:this.dropoutFunc}));let a=this.dropoutMask,o=this.recurrentDropoutMask,s,c,l,u;0<this.dropout&&this.dropout<1&&(e=B(e,a[0]));let d=my(e,this.kernel.read());0<this.recurrentDropout&&this.recurrentDropout<1&&(r=B(r,o[0])),d=R(d,my(r,this.recurrentKernel.read())),this.useBias&&(d=vy(d,this.bias.read()));let[f,p,m,h]=rf(d,4,d.rank-1);s=this.recurrentActivation.apply(f),c=this.recurrentActivation.apply(p),l=R(B(c,i),B(s,this.activation.apply(m))),u=this.recurrentActivation.apply(h);let g=B(u,this.activation.apply(l));return[g,g,l]})}getConfig(){let e=super.getConfig(),t={units:this.units,activation:VS(this.activation),recurrentActivation:VS(this.recurrentActivation),useBias:this.useBias,kernelInitializer:qy(this.kernelInitializer),recurrentInitializer:qy(this.recurrentInitializer),biasInitializer:qy(this.biasInitializer),unitForgetBias:this.unitForgetBias,kernelRegularizer:JS(this.kernelRegularizer),recurrentRegularizer:JS(this.recurrentRegularizer),biasRegularizer:JS(this.biasRegularizer),activityRegularizer:JS(this.activityRegularizer),kernelConstraint:Nb(this.kernelConstraint),recurrentConstraint:Nb(this.recurrentConstraint),biasConstraint:Nb(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout,implementation:this.implementation};return Object.assign(Object.assign({},e),t)}};MC.className=`LSTMCell`,G(MC);var NC=class extends EC{constructor(e){e.implementation===0&&console.warn("`implementation=0` has been deprecated, and now defaults to `implementation=1`. Please update your layer call."),e.cell=new MC(e),super(e)}call(e,t){return P(()=>{this.cell.dropoutMask!=null&&(F(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(F(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}static fromConfig(e,t){return t.implmentation===0&&(t.implementation=1),new e(t)}};NC.className=`LSTM`,G(NC);var PC=class extends DC{constructor(e){super(e),this.cells=e.cells}get stateSize(){let e=[];for(let t of this.cells.slice().reverse())Array.isArray(t.stateSize)?e.push(...t.stateSize):e.push(t.stateSize);return e}call(e,t){return P(()=>{e=e;let n=e.slice(1),r=[];for(let e of this.cells.slice().reverse())Array.isArray(e.stateSize)?r.push(n.splice(0,e.stateSize.length)):r.push(n.splice(0,1));r.reverse();let i=[],a;for(let o=0;o<this.cells.length;++o){let s=this.cells[o];n=r[o],a=o===0?[e[0]].concat(n):[a[0]].concat(n),a=s.call(a,t),i.push(a.slice(1))}n=[];for(let e of i.slice().reverse())n.push(...e);return[a[0]].concat(n)})}build(e){Yy(e)&&(e=e[0]),e=e;let t;this.cells.forEach((n,r)=>{Hv(`RNNCell_${r}`,()=>{n.build(e),t=Array.isArray(n.stateSize)?n.stateSize[0]:n.stateSize,e=[e[0],t]})}),this.built=!0}getConfig(){let e=super.getConfig(),t={cells:this.cells.map(e=>({className:e.getClassName(),config:e.getConfig()}))};return Object.assign(Object.assign({},e),t)}static fromConfig(e,t,n={}){let r=[];for(let e of t.cells)r.push(qb(e,n));return new e({cells:r})}get trainableWeights(){if(!this.trainable)return[];let e=[];for(let t of this.cells)e.push(...t.trainableWeights);return e}get nonTrainableWeights(){let e=[];for(let t of this.cells)e.push(...t.nonTrainableWeights);if(!this.trainable){let t=[];for(let e of this.cells)t.push(...e.trainableWeights);return t.concat(e)}return e}getWeights(){let e=[];for(let t of this.cells)e.push(...t.weights);return nb(e)}setWeights(e){let t=[];for(let n of this.cells){let r=n.weights.length,i=e.splice(r);for(let e=0;e<n.weights.length;++e)t.push([n.weights[e],i[e]])}rb(t)}};PC.className=`StackedRNNCells`,G(PC);function FC(e){let{ones:t,rate:n,training:r=!1,count:i=1,dropoutFunc:a}=e,o=()=>a==null?xy(t(),n):a(t(),n),s=()=>Cy(o,t,r);return!i||i<=1?ha(s().clone()):Array(i).fill(void 0).map(s).map(e=>ha(e.clone()))}var IC=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols==`function`)for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(n[r[i]]=e[r[i]]);return n},LC=class extends EC{constructor(e){if(e.unroll)throw new q(`Unrolling is not possible with convolutional RNNs.`);if(Array.isArray(e.cell))throw new q(`It is not possible at the moment to stack convolutional cells.`);super(e),this.inputSpec=[new ib({ndim:5})]}call(e,t){return P(()=>{if(this.cell.dropoutMask!=null&&(F(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(F(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null),t&&t.constants)throw new K(`ConvRNN2D cell does not support constants`);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}computeOutputShape(e){let t=this.computeSingleOutputShape(e);return this.returnSequences||(t=[t[0],...t.slice(2)]),this.returnState&&(t=[t,...[,,].fill([e[0],...t.slice(-3)])]),t}getInitialState(e){return P(()=>{let{stateSize:t}=this.cell,n=e.shape,r=this.computeSingleOutputShape(n),i=Du([r[0],...r.slice(2)]);return Array.isArray(t)?Array(t.length).fill(i):[i]})}resetStates(e,t=!1){P(()=>{if(!this.stateful)throw new tv(`Cannot call resetStates() on an RNN Layer that is not stateful.`);let n=this.inputSpec[0].shape,r=this.computeSingleOutputShape(n),i=[r[0],...r.slice(2)];if(n[0]==null)throw new K("If an RNN is stateful, it needs to know its batch size. Specify the batch size of your input tensors: \n- If using a Sequential model, specify the batch size by passing a `batchInputShape` option to your first layer.\n- If using the functional API, specify the batch size by passing a `batchShape` option to your Input layer.");if(this.getStates()==null)this.states_=Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(()=>Du(i)):[Du(i)];else if(e==null)F(this.states_),this.keptStates!=null&&(F(this.keptStates),this.keptStates=[]),Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(()=>Du(i)):this.states_[0]=Du(i);else{if(Array.isArray(e)||(e=[e]),e.length!==this.states_.length)throw new K(`Layer ${this.name} expects ${this.states_.length} state(s), but it received ${e.length} state value(s). Input received: ${e}`);t?this.keptStates.push(this.states_.slice()):F(this.states_);for(let t=0;t<this.states_.length;++t){let n=e[t],r=i;if(!v(n.shape,r))throw new K(`State ${t} is incompatible with layer ${this.name}: expected shape=${r}, received shape=${n.shape}`);this.states_[t]=n}}this.states_=this.states_.map(e=>ha(e.clone()))})}computeSingleOutputShape(e){let{dataFormat:t,filters:n,kernelSize:r,padding:i,strides:a,dilationRate:o}=this.cell,s=t===`channelsFirst`,c=e[s?3:2],l=e[s?4:3],u=iC(c,r[0],i,a[0],o[0]),d=iC(l,r[1],i,a[1],o[1]);return[...e.slice(0,2),...s?[n,u,d]:[u,d,n]]}};LC.className=`ConvRNN2D`;var RC=class extends MC{constructor(e){let{filters:t,kernelSize:n,strides:r,padding:i,dataFormat:a,dilationRate:o}=e;super(Object.assign(Object.assign({},e),{units:t})),this.filters=t,Sv(this.filters,`filters`),this.kernelSize=rC(n,2,`kernelSize`),this.kernelSize.forEach(e=>Sv(e,`kernelSize`)),this.strides=rC(r||1,2,`strides`),this.strides.forEach(e=>Sv(e,`strides`)),this.padding=i||`valid`,Rv(this.padding),this.dataFormat=a||`channelsLast`,Iv(this.dataFormat),this.dilationRate=rC(o||1,2,`dilationRate`),this.dilationRate.forEach(e=>Sv(e,`dilationRate`))}build(e){var t;e=Zy(e);let n=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[n]==null)throw new K(`The channel dimension of the input should be defined. Found ${e[n]}`);let r=e[n],i=this.kernelSize.concat([r,this.filters*4]);this.kernel=this.addWeight(`kernel`,i,null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint);let a=this.kernelSize.concat([this.filters,this.filters*4]);if(this.recurrentKernel=this.addWeight(`recurrent_kernel`,a,null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.useBias){let e;if(this.unitForgetBias){let n=this.biasInitializer,r=this.filters;e=new(t=class extends Oy{apply(e,t){return uy([n.apply([r]),Ou([r]),n.apply([r*2])])}},t.className=`CustomInit`,t)}else e=this.biasInitializer;this.bias=this.addWeight(`bias`,[this.filters*4],null,e,this.biasRegularizer,!0,this.biasConstraint)}this.built=!0}call(e,t){return P(()=>{if(e.length!==3)throw new K(`ConvLSTM2DCell expects 3 input Tensors (inputs, h, c), got ${e.length}.`);let n=t.training||!1,r=e[0],i=e[1],a=e[2];0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=FC({ones:()=>Hu(r),rate:this.dropout,training:n,count:4,dropoutFunc:this.dropoutFunc}));let o=this.dropoutMask,s=(e,t,n)=>!t||!t[n]?e:B(t[n],e),c=s(r,o,0),l=s(r,o,1),u=s(r,o,2),d=s(r,o,3);0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=FC({ones:()=>Hu(i),rate:this.recurrentDropout,training:n,count:4,dropoutFunc:this.dropoutFunc}));let f=this.recurrentDropoutMask,p=s(i,f,0),m=s(i,f,1),h=s(i,f,2),g=s(i,f,3),[_,v,y,b]=rf(this.kernel.read(),4,3),[x,S,C,w]=this.useBias?rf(this.bias.read(),4):[null,null,null,null];c=this.inputConv(c,_,x,this.padding),l=this.inputConv(l,v,S,this.padding),u=this.inputConv(u,y,C,this.padding),d=this.inputConv(d,b,w,this.padding);let[T,E,D,ee]=rf(this.recurrentKernel.read(),4,3);p=this.recurrentConv(p,T),m=this.recurrentConv(m,E),h=this.recurrentConv(h,D),g=this.recurrentConv(g,ee);let te=this.recurrentActivation.apply(R(c,p)),ne=R(B(this.recurrentActivation.apply(R(l,m)),a),B(te,this.activation.apply(R(u,h)))),re=B(this.recurrentActivation.apply(R(d,g)),this.activation.apply(ne));return[re,re,ne]})}getConfig(){let e=super.getConfig(),{units:t}=e,n=IC(e,[`units`]),r={filters:this.filters,kernelSize:this.kernelSize,padding:this.padding,dataFormat:this.dataFormat,dilationRate:this.dilationRate,strides:this.strides};return Object.assign(Object.assign({},n),r)}inputConv(e,t,n,r){let i=Xs(e,t,this.strides,r||`valid`,this.dataFormat===`channelsFirst`?`NCHW`:`NHWC`,this.dilationRate);return n?vy(i,n,this.dataFormat):i}recurrentConv(e,t){return Xs(e,t,1,`same`,this.dataFormat===`channelsFirst`?`NCHW`:`NHWC`)}};RC.className=`ConvLSTM2DCell`,G(RC);var zC=class extends LC{constructor(e){let t=new RC(e);super(Object.assign(Object.assign({},e),{cell:t}))}static fromConfig(e,t){return new e(t)}};zC.className=`ConvLSTM2D`,G(zC);var BC=class extends Y{constructor(e){super(e),this.rate=Math.max(Math.min(e.rate,1),0),this.noiseShape=e.noiseShape,this.seed=e.seed,this.supportsMasking=!0}getNoiseShape(e){if(this.noiseShape==null)return this.noiseShape;let t=e.shape,n=[];for(let e=0;e<this.noiseShape.length;++e)n.push(this.noiseShape[e]==null?t[e]:this.noiseShape[e]);return n}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);if(0<this.rate&&this.rate<1){let e=t.training!=null&&t.training,r=this.getNoiseShape(n);return Cy(()=>xy(n,this.rate,r,this.seed),()=>n,e)}return e})}getConfig(){let e={rate:this.rate,noiseShape:this.noiseShape,seed:this.seed},t=super.getConfig();return Object.assign(e,t),e}dispose(){return super.dispose()}};BC.className=`Dropout`,G(BC);var VC=class extends BC{constructor(e){super(e),this.inputSpec=[{ndim:3}]}getNoiseShape(e){let t=e.shape;return[t[0],1,t[2]]}};VC.className=`SpatialDropout1D`,G(VC);var HC=class extends Y{constructor(e){if(super(e),this.activation=null,this.useBias=!0,this.kernel=null,this.bias=null,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,e.batchInputShape==null&&e.inputShape==null&&e.inputDim!=null){let t=null;e.batchSize!=null&&(t=e.batchSize),this.batchInputShape=[t,e.inputDim]}this.units=e.units,Sv(this.units,`units`),this.activation=US(e.activation),e.useBias!=null&&(this.useBias=e.useBias),this.kernelInitializer=Jy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.biasInitializer=Jy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelConstraint=Fb(e.kernelConstraint),this.biasConstraint=Fb(e.biasConstraint),this.kernelRegularizer=XS(e.kernelRegularizer),this.biasRegularizer=XS(e.biasRegularizer),this.activityRegularizer=XS(e.activityRegularizer),this.supportsMasking=!0,this.inputSpec=[{minNDim:2}]}build(e){e=Zy(e);let t=e[e.length-1];this.kernel??(this.kernel=this.addWeight(`kernel`,[t,this.units],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.units],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint))),this.inputSpec=[{minNDim:2,axes:{[-1]:t}}],this.built=!0}computeOutputShape(e){e=Zy(e);let t=e.slice();return t[t.length-1]=this.units,t}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e),r=Tv(this.activation.getClassName()),i;return r==null?(i=my(n,this.kernel.read()),this.bias!=null&&(i=vy(i,this.bias.read())),this.activation!=null&&(i=this.activation.apply(i))):i=my(n,this.kernel.read(),r,this.bias?this.bias.read():null),i})}getConfig(){let e={units:this.units,activation:VS(this.activation),useBias:this.useBias,kernelInitializer:qy(this.kernelInitializer),biasInitializer:qy(this.biasInitializer),kernelRegularizer:JS(this.kernelRegularizer),biasRegularizer:JS(this.biasRegularizer),activityRegularizer:JS(this.activityRegularizer),kernelConstraint:Nb(this.kernelConstraint),biasConstraint:Nb(this.biasConstraint)},t=super.getConfig();return Object.assign(e,t),e}};HC.className=`Dense`,G(HC);var UC=class extends Y{constructor(e){e||={},super(e),this.inputSpec=[{minNDim:3}],this.dataFormat=e.dataFormat}computeOutputShape(e){e=Zy(e);for(let t of e.slice(1))if(t==null)throw new K(`The shape of the input to "Flatten" is not fully defined (got ${e.slice(1)}). Make sure to pass a complete "input_shape" or "batch_input_shape" argument to the first layer in your model.`);return[e[0],Yv(e,1)]}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);if(this.dataFormat===`channelsFirst`&&n.rank>1){let e=[0];for(let t=2;t<n.rank;++t)e.push(t);e.push(1),n=Lf(n,e)}return oy(n)})}getConfig(){let e={};this.dataFormat!=null&&(e.dataFormat=this.dataFormat);let t=super.getConfig();return Object.assign(e,t),e}};UC.className=`Flatten`,G(UC);var WC=class extends Y{constructor(e){super(e),this.supportsMasking=!0,this.activation=US(e.activation)}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);return this.activation.apply(n)})}getConfig(){let e={activation:VS(this.activation)},t=super.getConfig();return Object.assign(e,t),e}};WC.className=`Activation`,G(WC);var GC=class extends Y{constructor(e){super(e),this.n=e.n,this.inputSpec=[{ndim:2}]}computeOutputShape(e){return[e[0],this.n,e[1]]}call(e,t){return P(()=>(e=J(e),iy(e,this.n)))}getConfig(){let e={n:this.n},t=super.getConfig();return Object.assign(e,t),e}};GC.className=`RepeatVector`,G(GC);var KC=class extends Y{constructor(e){super(e),this.targetShape=e.targetShape;for(let e=0;e<this.targetShape.length;++e)this.isUnknown(this.targetShape[e])&&(this.targetShape[e]=null)}isUnknown(e){return e<0||e==null}fixUnknownDimension(e,t){let n=`Total size of new array must be unchanged.`,r=t.slice(),i=1,a=null;for(let e=0;e<r.length;++e){let t=r[e];if(this.isUnknown(t))if(a===null)a=e;else throw new K(`Can only specifiy one unknown dimension.`);else i*=t}let o=Yv(e);if(a!==null){if(i===0||o%i!==0)throw new K(n);r[a]=o/i}else if(o!==i)throw new K(n);return r}computeOutputShape(e){let t=!1;for(let n=0;n<e.length;++n)if(this.isUnknown(e[n])){t=!0;break}return t?e.slice(0,1).concat(this.targetShape):e.slice(0,1).concat(this.fixUnknownDimension(e.slice(1),this.targetShape))}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e),r=n.shape;return V(n,r.slice(0,1).concat(this.fixUnknownDimension(r.slice(1),this.targetShape)))})}getConfig(){let e={targetShape:this.targetShape},t=super.getConfig();return Object.assign(e,t),e}};KC.className=`Reshape`,G(KC);var qC=class extends Y{constructor(e){if(super(e),e.dims==null)throw Error("Required configuration field `dims` is missing during Permute constructor call.");if(!Array.isArray(e.dims))throw Error(`Permute constructor requires \`dims\` to be an Array, but received ${e.dims} instead.`);let t=Qv(1,e.dims.length+1);if(!v(e.dims.slice().sort(),t))throw Error("Invalid permutation `dims`: "+JSON.stringify(e.dims)+" `dims` must contain consecutive integers starting from 1.");this.dims=e.dims,this.dimsIncludingBatch=[0].concat(this.dims),this.inputSpec=[new ib({ndim:this.dims.length+1})]}computeOutputShape(e){e=Zy(e);let t=e.slice();return this.dims.forEach((n,r)=>{t[r+1]=e[n]}),t}call(e,t){return Lf(J(e),this.dimsIncludingBatch)}getConfig(){let e={dims:this.dims},t=super.getConfig();return Object.assign(e,t),e}};qC.className=`Permute`,G(qC);var JC=class extends Y{constructor(e){super(e??{}),this.supportsMasking=!0,this.maskValue=e==null||e.maskValue==null?0:e.maskValue}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={maskValue:this.maskValue};return Object.assign(t,e),t}computeMask(e,t){return Eo(Ru(J(e),this.maskValue),-1)}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);return B(n,L(Eo(Ru(n,this.maskValue),-1,!0),n.dtype))})}};JC.className=`Masking`,G(JC);var YC=class extends Y{constructor(e){if(super(e),this.embeddings=null,this.DEFAULT_EMBEDDINGS_INITIALIZER=`randomUniform`,e.batchInputShape==null&&e.inputShape==null){let t=null;e.batchSize!=null&&(t=e.batchSize),this.batchInputShape=e.inputLength==null?[t,null]:[t].concat(lv(e.inputLength))}this.inputDim=e.inputDim,Sv(this.inputDim,`inputDim`),this.outputDim=e.outputDim,Sv(this.outputDim,`outputDim`),this.embeddingsInitializer=Jy(e.embeddingsInitializer||this.DEFAULT_EMBEDDINGS_INITIALIZER),this.embeddingsRegularizer=XS(e.embeddingsRegularizer),this.activityRegularizer=XS(e.activityRegularizer),this.embeddingsConstraint=Fb(e.embeddingsConstraint),this.maskZero=e.maskZero,this.supportsMasking=e.maskZero,this.inputLength=e.inputLength}build(e){this.embeddings=this.addWeight(`embeddings`,[this.inputDim,this.outputDim],this.dtype,this.embeddingsInitializer,this.embeddingsRegularizer,!0,this.embeddingsConstraint),this.built=!0}warnOnIncompatibleInputShape(e){}computeMask(e,t){return P(()=>this.maskZero?(e=J(e),Ru(e,Mc(e))):null)}computeOutputShape(e){if(e=Zy(e),this.inputLength==null)return[...e,this.outputDim];let t=lv(this.inputLength);if(t.length!==e.length-1)throw new K(`"inputLength" is ${this.inputLength}, but received input shape has shape ${e}`);{let n=0;for(let r=0;r<t.length;++r){let i=t[r],a=e[r+1];if(i!=null&&a!=null&&i!==a)throw new K(`"inputLength" is ${this.inputLength}, but received input shape has shape ${e}`);i??(t[n]=a),n++}}return[e[0],...t,this.outputDim]}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);return n.dtype!==`int32`&&(n=ny(n,`int32`)),V(hy(this.embeddings.read(),V(n,[n.size])),Zy(this.computeOutputShape(n.shape)))})}getConfig(){let e={inputDim:this.inputDim,outputDim:this.outputDim,embeddingsInitializer:qy(this.embeddingsInitializer),embeddingsRegularizer:JS(this.embeddingsRegularizer),activityRegularizer:JS(this.activityRegularizer),embeddingsConstraint:Nb(this.embeddingsConstraint),maskZero:this.maskZero,inputLength:this.inputLength},t=super.getConfig();return Object.assign(e,t),e}};YC.className=`Embedding`,G(YC);var XC=class extends Y{constructor(e){super(e||{}),this.supportsMasking=!0}mergeFunction(e){throw new q}computeElementwiseOpOutputShape(e,t){if(e==null||t==null)return null;if(e.length<t.length)return this.computeElementwiseOpOutputShape(t,e);if(t.length===0)return e;let n=e.slice(0,e.length-t.length);for(let r=0;r<t.length;++r){let i=e[e.length-t.length+r],a=t[r];if(i==null||a==null||i<0||a<0)n.push(null);else if(i===1)n.push(a);else if(a===1)n.push(i);else{if(i!==a)throw new K(`Operands could not be broadcast together with shapes `+JSON.stringify(e)+` `+JSON.stringify(t));n.push(i)}}return n}build(e){if(Array.isArray(e)&&!Array.isArray(e[0])&&(e=[Zy(e)]),e=e,e.length<2)throw new K(`A merge layer should be called on an Array of at least 2 inputs. Got ${e.length} input(s).`);let t=[];for(let n of e)n!=null&&n[0]!==null&&t.push(n[0]);if(t=vv(t),t.length>1)throw new K(`Can not merge tensors with different batch sizes. Got tensors with shapes: ${JSON.stringify(e)}.`);let n=e[0]==null?null:e[0].slice(1);for(let t=1;t<e.length;++t){let r=e[t]==null?null:e[t].slice(1);n=this.computeElementwiseOpOutputShape(n,r)}let r=e.map(e=>e.length);this.reshapeRequired=e.indexOf(null)!==-1||vv(r).length!==1}call(e,t){return P(()=>{if(e=e,this.reshapeRequired){let t=[],n=e.map(e=>e.rank);if(n.indexOf(null)===-1){let r=Zv(n);for(let n of e){let e=n.rank;for(let t=0;t<r-e;++t)n=ry(n,1);t.push(n)}return this.mergeFunction(t)}{let n=!1;for(let r of e){let e=r.rank;if(e==null){let e=r.shape,i=e[0],a=e.slice(1).concat([i]),o=V(r,[i].concat(Yv(e.slice(1))));o=Lf(o,[1,0]),o=V(o,a),t.push(o),n=!0}else if(e>1){let i=Qv(1,e).concat([0]);t.push(Lf(r,i)),n=!0}else t.push(r)}let r=this.mergeFunction(t),i=r.rank;if(n){if(i==null){let e=r.shape,t=e[e.length-1],n=[t].concat(e.slice(0,e.length-1));r=V(Lf(V(r,[-1,t]),[1,0]),n)}else if(i>1){let e=[i-1].concat(Qv(0,i-1));r=Lf(r,e)}}return r}}return this.mergeFunction(e)})}computeOutputShape(e){e=e;let t;t=e[0]==null?null:e[0].slice(1);for(let n=1;n<e.length;++n){let r=e[n]==null?null:e[n].slice(1);t=this.computeElementwiseOpOutputShape(t,r)}let n=[];for(let t of e)t!=null&&t[0]!==null&&n.push(t[0]);return n=vv(n),t=n.length===1?n.concat(t):[null].concat(t),t}computeMask(e,t){return P(()=>{if(t==null)return null;if(!Array.isArray(t))throw new K("`mask` should be an Array");if(!Array.isArray(e))throw new K("`inputs` should be an Array");if(t.length!==e.length)throw new K(`The Array 'inputs' and 'mask' are expected to have the same length, but have different lengths (${e.length} vs ${t.length})`);if(t.every(e=>e==null))return null;t=t.map(e=>e==null?e:_l(e,0));let n=t[0];for(let e=1;e<t.length-1;++e)n=fu(n,t[e]);return n})}},ZC=class extends XC{constructor(e){super(e)}mergeFunction(e){return P(()=>{let t=e[0].clone();for(let n=1;n<e.length;++n)t=R(t,e[n]);return t})}};ZC.className=`Add`,G(ZC);var QC=class extends XC{constructor(e){super(e)}mergeFunction(e){return P(()=>{let t=e[0].clone();for(let n=1;n<e.length;++n)t=B(t,e[n]);return t})}};QC.className=`Multiply`,G(QC);var $C=class extends XC{constructor(e){super(e)}mergeFunction(e){return P(()=>{let t=e[0].clone();for(let n=1;n<e.length;++n)t=R(t,e[n]);return B(1/e.length,t)})}};$C.className=`Average`,G($C);var ew=class extends XC{constructor(e){super(e)}mergeFunction(e){return P(()=>{let t=e[0];for(let n=1;n<e.length;++n)t=wu(t,e[n]);return t})}};ew.className=`Maximum`,G(ew);var tw=class extends XC{constructor(e){super(e)}mergeFunction(e){return P(()=>{let t=e[0];for(let n=1;n<e.length;++n)t=Au(t,e[n]);return t})}};tw.className=`Minimum`,G(tw);var nw=class extends XC{constructor(e){super(e),this.DEFAULT_AXIS=-1,e??={},this.axis=e.axis==null?this.DEFAULT_AXIS:e.axis,this.supportsMasking=!0,this.reshapeRequired=!1}build(e){if(!(Array.isArray(e)&&Array.isArray(e[0]))||e.length===1)throw new K("A `Concatenate` layer should be called on a list of at least 2 inputs");e=e;let t=!0;for(let n of e)if(n!=null){t=!1;break}if(t)return;let n=[];for(let t=0;t<e.length;++t){let r=e[t].slice();r.splice(this.axis,1);let i=!1;for(let e of n)if(v(e,r)){i=!0;break}i||n.push(r)}if(n.length>1)throw new K("A `Concatenate` layer requires inputs with matching shapes except for the concat axis. Got input shapes: "+JSON.stringify(e))}mergeFunction(e){return P(()=>uy(e,this.axis))}computeOutputShape(e){if(!(Array.isArray(e)&&Array.isArray(e[0])))throw new K("A `Concatenate` layer should be called on a list of inputs.");let t=e,n=t[0].slice(),r=this.axis<0?n.length+this.axis:this.axis;for(let e of t.slice(1)){if(n[r]==null||e[r]==null){n[r]=null;break}n[r]+=e[r]}return n}computeMask(e,t){if(t==null)return null;if(!Array.isArray(t))throw new K("`mask` should be an array for Concatenate");if(!Array.isArray(e))throw new K("`inputs` should be an array for Concatenate");if(t.length!==e.length)throw new K(`Mismatch in the length of mask (${t.length}) and the legnth of inputs (${e.length})`);return P(()=>{let n=!0;if(t.forEach(e=>{if(e!=null){n=!1;return}}),n)return null;let r=[];for(let n=0;n<e.length;++n)t[n]==null?r.push(L(Hu(e[n]),`bool`)):t[n].rank<e[n].rank?r.push(_l(t[n],-1)):r.push(t[n]);return wo(fs(r,this.axis),-1,!1)})}getConfig(){let e={axis:this.axis},t=super.getConfig();return Object.assign(e,t),e}};nw.className=`Concatenate`,G(nw);function rw(e,t){for(;e<0;)e+=t;return e}function iw(e,t,n){if(e.shape.length>3||t.shape.length>3)throw new q(`batchDot is not implemented for tensors of 4D or higher rank yet`);if(m(e.shape.length>=2,()=>`batchDot requires the rank of x to be >= 2, but got ${e.shape.length}`),m(e.shape.length>=2,()=>`batchDot requires the rank of y to be >= 2, but got ${t.shape.length}`),typeof n==`number`&&(n=[n,n]),e.dtype===`complex64`||t.dtype===`complex64`)throw new q(`batchDot is not implemented for complex64-type Tensors yet.`);let r=e.shape.length,i=t.shape.length;n??=[r-1,i-2];let a=n;return P(()=>{let n;if(r>i){n=r-i;let e=[];for(let t=0;t<n;++t)e.push(1);t=V(t,t.shape.concat(e))}else if(i>r){n=i-r;let t=[];for(let e=0;e<n;++e)t.push(1);e=V(e,e.shape.concat(t))}else n=0;let o;if(e.shape.length===2&&t.shape.length===2)o=a[0]===a[1]?U(B(e,t),a[0]):U(B(Lf(e,[1,0]),t),a[1]);else{let n=a[0]!==e.shape.length-1,r=a[1]===t.shape.length-1;o=ms(e,t,n,r)}if(n>0){let e;e=r>i?r+i-3:r-1;let t=[];for(let r=e;r<e+n;++r)t.push(r);o=uf(o,t)}return o.shape.length===1&&(o=_l(o,1)),o})}var aw=class extends XC{constructor(e){super(e),this.axes=e.axes,this.normalize=e.normalize!=null&&e.normalize,this.supportsMasking=!0,this.reshapeRequired=!1}build(e){m(Array.isArray(e)&&e.length===2&&Array.isArray(e[0])&&Array.isArray(e[1]),()=>"A `Dot` layer should be called on a list of exactly 2 inputs.");let t=e[0],n=e[1];if(t.length>3||n.length>3)throw new q(`Dot layer does not support tensors of 4D or higher rank yet.`);let r=this.interpretAxes(t,n);if(t[r[0]]!==n[r[1]])throw new K(`Dimension incompatibility: ${t[r[0]]} !== ${n[r[1]]}`)}mergeFunction(e){if(e.length!==2)throw new K(`A \`Dot\` layer must be called on exactly 2 inputs, but received ${e.length} input(s).`);let t=e[0],n=e[1],r;return r=Array.isArray(this.axes)?this.axes.map((t,n)=>rw(t,e[n].shape.length)):[rw(this.axes,t.shape.length),rw(this.axes,n.shape.length)],this.normalize&&(t=Jb(t,r[0]),n=Jb(n,r[1])),iw(t,n,r)}interpretAxes(e,t){let n;return n=Array.isArray(this.axes)?this.axes:[rw(this.axes,e.length),rw(this.axes,t.length)],n}computeOutputShape(e){m(Array.isArray(e)&&e.length===2&&Array.isArray(e[0])&&Array.isArray(e[1]),()=>"A `Dot` layer should be called on a list of exactly 2 inputs.");let t=e[0].slice(),n=e[1].slice();if(t.length>3||n.length>3)throw new q(`Dot layer does not support tensors of 4D or higher rank yet.`);let r=this.interpretAxes(t,n);t.splice(r[0],1),n.splice(r[1],1),n.splice(0,1);let i=t.concat(n);return i.length===1&&i.push(1),i}computeMask(e,t){return null}getConfig(){let e={axes:this.axes,normalize:this.normalize},t=super.getConfig();return Object.assign(e,t),e}};aw.className=`Dot`,G(aw);var ow=class extends Y{constructor(e){super(e),this.supportsMasking=!0,this.stddev=e.stddev}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={stddev:this.stddev};return Object.assign(t,e),t}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);return Cy(()=>R(py(n.shape,0,this.stddev),n),()=>n,t.training||!1)})}};ow.className=`GaussianNoise`,G(ow);var sw=class extends Y{constructor(e){super(e),this.supportsMasking=!0,this.rate=e.rate}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={rate:this.rate};return Object.assign(t,e),t}call(e,t){return P(()=>{this.invokeCallHook(e,t);let n=J(e);return this.rate>0&&this.rate<1?Cy(()=>{let e=Math.sqrt(this.rate/(1-this.rate));return B(n,py(n.shape,1,e))},()=>n,t.training||!1):n})}};sw.className=`GaussianDropout`,G(sw);var cw=class extends Y{constructor(e){super(e),this.supportsMasking=!0,this.rate=e.rate,this.noiseShape=e.noiseShape}_getNoiseShape(e){return this.noiseShape||J(e).shape}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={rate:this.rate};return Object.assign(t,e),t}call(e,t){return P(()=>{if(this.rate<1&&this.rate>0){let n=this._getNoiseShape(e);return Cy(()=>{let t=J(e),r=-1.7580993408473766,i=jl(md(n),this.rate);i=ny(i,`float32`);let a=((1-this.rate)*(1+this.rate*r**2))**-.5,o=-a*r*this.rate;return R(B(R(B(t,i),B(R(i,-1),r)),a),o)},()=>J(e),t.training||!1)}return e})}};cw.className=`AlphaDropout`,G(cw);function lw(e,t,n,r,i,a=.001){let o;if(e.rank===2)o=Ds(e,t,n,r,i,a);else if(e.rank===3)o=ks(e,t,n,r,i,a);else if(e.rank===4)o=js(e,t,n,r,i,a);else throw new q(`batchNormalization is not implemented for array of rank ${e.rank} yet`);return o}function uw(e,t,n,r,i=.001){return P(()=>{let a=Iu(e,r),o=a.mean,s=a.variance;return[lw(e,o,s,n,t,i),o,s]})}function dw(e,t,n,r,i=.001){return P(()=>{let a=Iu(e,r),o=a.mean,s=a.variance,c=[];for(let t of Qv(0,e.rank))r.indexOf(t)===-1?c.push(e.shape[t]):c.push(1);let l=V(o,c),u=V(s,c),d=t==null?null:V(t,c);return[lw(e,l,u,n==null?null:V(n,c),d,i),o,s]})}function fw(e,t,n,r,i=.001){return v(r.slice().sort(),Qv(0,e.rank-1))?uw(e,t,n,r,i):dw(e,t,n,r,i)}var pw=class extends Y{constructor(e){e??={},super(e),this.supportsMasking=!0,this.axis=e.axis==null?-1:e.axis,this.momentum=e.momentum==null?.99:e.momentum,this.epsilon=e.epsilon==null?.001:e.epsilon,this.center=e.center==null||e.center,this.scale=e.scale==null||e.scale,this.betaInitializer=Jy(e.betaInitializer||`zeros`),this.gammaInitializer=Jy(e.gammaInitializer||`ones`),this.movingMeanInitializer=Jy(e.movingMeanInitializer||`zeros`),this.movingVarianceInitializer=Jy(e.movingVarianceInitializer||`ones`),this.betaConstraint=Fb(e.betaConstraint),this.gammaConstraint=Fb(e.gammaConstraint),this.betaRegularizer=XS(e.betaRegularizer),this.gammaRegularizer=XS(e.gammaRegularizer)}build(e){e=Zy(e);let t=this.axis>=0?this.axis:this.axis+e.length,n=e[t];if(n==null)throw new K(`Axis ${t} of input tensor should have a defined dimension but the layer received an input with shape ${JSON.stringify(e)}.`);this.inputSpec=[new ib({ndim:e.length,axes:{[t]:n}})];let r=[n];this.scale&&(this.gamma=this.addWeight(`gamma`,r,null,this.gammaInitializer,this.gammaRegularizer,!0,this.gammaConstraint)),this.center&&(this.beta=this.addWeight(`beta`,r,null,this.betaInitializer,this.betaRegularizer,!0,this.betaConstraint)),this.movingMean=this.addWeight(`moving_mean`,r,null,this.movingMeanInitializer,null,!1),this.movingVariance=this.addWeight(`moving_variance`,r,null,this.movingVarianceInitializer,null,!1),this.built=!0}call(e,t){return P(()=>{let n=t.training!=null&&t.training,r=J(e),i=r.shape,a=i.length,o=Qv(0,a),s=this.axis>=0?this.axis:this.axis+a;o.splice(s,1);let c=av(1,a);c[s]=i[s];let l=o.slice();l.sort();let u=!v(l,Qv(0,a).slice(0,a-1)),d=()=>{if(u){let e=V(this.movingMean.read(),c),t=V(this.movingVariance.read(),c),n=this.center?V(this.beta.read(),c):null,i=this.scale?V(this.gamma.read(),c):null;return lw(r,e,t,n,i,this.epsilon)}return lw(r,this.movingMean.read(),this.movingVariance.read(),this.beta==null?null:this.beta.read(),this.gamma==null?null:this.gamma.read(),this.epsilon)};if(!n)return d();let[f,p,m]=fw(r,this.gamma.read(),this.beta.read(),o,this.epsilon),h=(e,t,n)=>{P(()=>{let r=1-n,i=e.read(),a=B(W(i,t),r);e.write(W(i,a))})};return h(this.movingMean,p,this.momentum),h(this.movingVariance,m,this.momentum),f})}getConfig(){let e={axis:this.axis,momentum:this.momentum,epsilon:this.epsilon,center:this.center,scale:this.scale,betaInitializer:qy(this.betaInitializer),gammaInitializer:qy(this.gammaInitializer),movingMeanInitializer:qy(this.movingMeanInitializer),movingVarianceInitializer:qy(this.movingVarianceInitializer),betaRegularizer:JS(this.betaRegularizer),gammaRegularizer:JS(this.gammaRegularizer),betaConstraint:Nb(this.betaConstraint),gammaConstraint:Nb(this.gammaConstraint)},t=super.getConfig();return Object.assign(e,t),e}};pw.className=`BatchNormalization`,G(pw);var mw=class extends Y{constructor(e){if(e??={},super(e),this.axis=e.axis==null?-1:e.axis,typeof this.axis==`number`){if(!Number.isInteger(this.axis))throw Error(`Expected axis to be an integer, but received ${this.axis}`)}else if(Array.isArray(this.axis)){for(let e of this.axis)if(!Number.isInteger(e))throw Error(`Expected axis to be an array of integers, but received ${JSON.stringify(this.axis)}`)}else throw Error(`Expected axis to be an integer or an array of integers, but received ${JSON.stringify(this.axis)}`);this.epsilon=e.epsilon==null?.001:e.epsilon,this.center=e.center==null||e.center,this.scale=e.scale==null||e.scale,this.betaInitializer=Jy(e.betaInitializer||`zeros`),this.gammaInitializer=Jy(e.gammaInitializer||`ones`),this.betaRegularizer=XS(e.betaRegularizer),this.gammaRegularizer=XS(e.gammaRegularizer),this.supportsMasking=!0}build(e){e=Zy(e);let t=e.length;typeof this.axis==`number`&&(this.axis=[this.axis]);for(let e=0;e<this.axis.length;++e)this.axis[e]<0&&(this.axis[e]+=t);for(let e of this.axis)if(e<0||e>=t)throw Error(`Invalid axis: ${e}`);if(this.axis.length!==vv(this.axis).length)throw Error(`Found duplicate axes in: ${this.axis}`);let n=this.axis.map(t=>e[t]);this.gamma=this.scale?this.addWeight(`gamma`,n,`float32`,this.gammaInitializer,this.gammaRegularizer,!0):null,this.beta=this.center?this.addWeight(`beta`,n,`float32`,this.betaInitializer,this.betaRegularizer,!0):null,this.built=!0}call(e,t){let n=J(e),r=n.shape,i=r.length;return P(()=>{let{mean:e,variance:t}=Iu(n,this.axis,!0),a=av(1,i);for(let e of this.axis)a[e]=r[e];let o=e=>e!=null&&e.shape.length!==i?V(e,a):e,s=this.scale?o(this.gamma.read()):null,c=this.center?o(this.beta.read()):null,l=[],u=[];for(let e=0;e<i;++e)this.axis.indexOf(e)===-1?(l.push(1),u.push(r[e])):(l.push(r[e]),u.push(1));return e=xl(e,l),t=xl(t,l),s!=null&&(s=xl(s,u)),c!=null&&(c=xl(c,u)),lw(n,e,t,c,s,this.epsilon)})}getConfig(){let e={axis:this.axis,epsilon:this.epsilon,center:this.center,scale:this.scale,betaInitializer:qy(this.betaInitializer),gammaInitializer:qy(this.gammaInitializer),betaRegularizer:JS(this.betaRegularizer),gammaRegularizer:JS(this.gammaRegularizer)},t=super.getConfig();return Object.assign(e,t),e}};mw.className=`LayerNormalization`,G(mw);function hw(e,t,n){return P(()=>{if(e.rank!==4)throw new K(`temporalPadding expects input tensor to be 4-D, but received a ${e.rank}-D tensor.`);if(t??=[[1,1],[1,1]],t.length!==2||t[0].length!==2||t[1].length!==2)throw new K("spatial2dPadding expects `padding` to be an Array of two Arrays, each of which is an Array of two integers.");if(n??=ty(),n!==`channelsLast`&&n!==`channelsFirst`)throw new K(`Unknown data format: ${n}. Supported data formats are 'channelsLast' and 'channelsFirst.`);let r;return r=n===`channelsFirst`?[[0,0],[0,0],t[0],t[1]]:[[0,0],t[0],t[1],[0,0]],Wu(e,r)})}var gw=class extends Y{constructor(e){if(e??={},super(e),this.dataFormat=e.dataFormat==null?ty():e.dataFormat,e.padding==null)this.padding=[[1,1],[1,1]];else if(typeof e.padding==`number`)this.padding=[[e.padding,e.padding],[e.padding,e.padding]];else{if(e.padding=e.padding,e.padding.length!==2)throw new K(`ZeroPadding2D expects padding to be a length-2 array, but received a length-${e.padding.length} array.`);let t,n;if(typeof e.padding[0]==`number`)t=[e.padding[0],e.padding[0]],n=[e.padding[1],e.padding[1]];else{if(e.padding=e.padding,e.padding[0].length!==2)throw new K(`ZeroPadding2D expects height padding to be a length-2 array, but received a length-${e.padding[0].length} array.`);if(t=e.padding[0],e.padding[1].length!==2)throw new K(`ZeroPadding2D expects width padding to be a length-2 array, but received a length-${e.padding[1].length} array.`);n=e.padding[1]}this.padding=[t,n]}this.inputSpec=[new ib({ndim:4})]}computeOutputShape(e){e=Zy(e);let t,n;return this.dataFormat===`channelsFirst`?(t=e[2]!=null&&e[2]>=0?e[2]+this.padding[0][0]+this.padding[0][1]:null,n=e[3]!=null&&e[3]>=0?e[3]+this.padding[1][0]+this.padding[1][1]:null,[e[0],e[1],t,n]):(t=e[1]!=null&&e[1]>=0?e[1]+this.padding[0][0]+this.padding[0][1]:null,n=e[2]!=null&&e[2]>=0?e[2]+this.padding[1][0]+this.padding[1][1]:null,[e[0],t,n,e[3]])}call(e,t){return P(()=>hw(J(e),this.padding,this.dataFormat))}getConfig(){let e={padding:this.padding,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}};gw.className=`ZeroPadding2D`,G(gw);function _w(e,t,n,r,i,a){return P(()=>{Iv(i),zv(a),Rv(r),n??=[1,1],r??=`valid`,i??=ty(),a??=`max`,e=oC(e,i);let o,s=r===`same`?`same`:`valid`;return o=a===`max`?bu(e,t,n,s):cs(e,t,n,s),i===`channelsFirst`&&(o=Lf(o,[0,3,1,2])),o})}function vw(e,t,n,r,i,a){return P(()=>{Iv(i),zv(a),Rv(r),n??=[1,1,1],r??=`valid`,i??=ty(),a??=`max`,e=sC(e,i);let o,s=r===`same`?`same`:`valid`;return o=a===`max`?Su(e,t,n,s):us(e,t,n,s),i===`channelsFirst`&&(o=Lf(o,[0,4,1,2,3])),o})}var yw=class extends Y{constructor(e){if(e.poolSize??=2,super(e),typeof e.poolSize==`number`)this.poolSize=[e.poolSize];else if(Array.isArray(e.poolSize)&&e.poolSize.length===1&&typeof e.poolSize[0]==`number`)this.poolSize=e.poolSize;else throw new K(`poolSize for 1D convolutional layer must be a number or an Array of a single number, but received ${JSON.stringify(e.poolSize)}`);if(Sv(this.poolSize,`poolSize`),e.strides==null)this.strides=this.poolSize;else if(typeof e.strides==`number`)this.strides=[e.strides];else if(Array.isArray(e.strides)&&e.strides.length===1&&typeof e.strides[0]==`number`)this.strides=e.strides;else throw new K(`strides for 1D convolutional layer must be a number or an Array of a single number, but received ${JSON.stringify(e.strides)}`);Sv(this.strides,`strides`),this.padding=e.padding==null?`valid`:e.padding,Rv(this.padding),this.inputSpec=[new ib({ndim:3})]}computeOutputShape(e){e=Zy(e);let t=iC(e[1],this.poolSize[0],this.padding,this.strides[0]);return[e[0],t,e[2]]}call(e,t){return P(()=>(this.invokeCallHook(e,t),e=ry(J(e),2),uf(this.poolingFunction(J(e),[this.poolSize[0],1],[this.strides[0],1],this.padding,`channelsLast`),[2])))}getConfig(){let e={poolSize:this.poolSize,padding:this.padding,strides:this.strides},t=super.getConfig();return Object.assign(e,t),e}},bw=class extends yw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Iv(i),Rv(r),_w(e,t,n,r,i,`max`)}};bw.className=`MaxPooling1D`,G(bw);var xw=class extends yw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Iv(i),Rv(r),_w(e,t,n,r,i,`avg`)}};xw.className=`AveragePooling1D`,G(xw);var Sw=class extends Y{constructor(e){if(e.poolSize??=[2,2],super(e),this.poolSize=Array.isArray(e.poolSize)?e.poolSize:[e.poolSize,e.poolSize],e.strides==null)this.strides=this.poolSize;else if(Array.isArray(e.strides)){if(e.strides.length!==2)throw new K(`If the strides property of a 2D pooling layer is an Array, it is expected to have a length of 2, but received length ${e.strides.length}.`);this.strides=e.strides}else this.strides=[e.strides,e.strides];Sv(this.poolSize,`poolSize`),Sv(this.strides,`strides`),this.padding=e.padding==null?`valid`:e.padding,this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Iv(this.dataFormat),Rv(this.padding),this.inputSpec=[new ib({ndim:4})]}computeOutputShape(e){e=Zy(e);let t=this.dataFormat===`channelsFirst`?e[2]:e[1],n=this.dataFormat===`channelsFirst`?e[3]:e[2];return t=iC(t,this.poolSize[0],this.padding,this.strides[0]),n=iC(n,this.poolSize[1],this.padding,this.strides[1]),this.dataFormat===`channelsFirst`?[e[0],e[1],t,n]:[e[0],t,n,e[3]]}call(e,t){return P(()=>(this.invokeCallHook(e,t),this.poolingFunction(J(e),this.poolSize,this.strides,this.padding,this.dataFormat)))}getConfig(){let e={poolSize:this.poolSize,padding:this.padding,strides:this.strides,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}},Cw=class extends Sw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Iv(i),Rv(r),_w(e,t,n,r,i,`max`)}};Cw.className=`MaxPooling2D`,G(Cw);var ww=class extends Sw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Iv(i),Rv(r),_w(e,t,n,r,i,`avg`)}};ww.className=`AveragePooling2D`,G(ww);var Tw=class extends Y{constructor(e){if(e.poolSize??=[2,2,2],super(e),this.poolSize=Array.isArray(e.poolSize)?e.poolSize:[e.poolSize,e.poolSize,e.poolSize],e.strides==null)this.strides=this.poolSize;else if(Array.isArray(e.strides)){if(e.strides.length!==3)throw new K(`If the strides property of a 3D pooling layer is an Array, it is expected to have a length of 3, but received length ${e.strides.length}.`);this.strides=e.strides}else this.strides=[e.strides,e.strides,e.strides];Sv(this.poolSize,`poolSize`),Sv(this.strides,`strides`),this.padding=e.padding==null?`valid`:e.padding,this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Iv(this.dataFormat),Rv(this.padding),this.inputSpec=[new ib({ndim:5})]}computeOutputShape(e){e=Zy(e);let t=this.dataFormat===`channelsFirst`?e[2]:e[1],n=this.dataFormat===`channelsFirst`?e[3]:e[2],r=this.dataFormat===`channelsFirst`?e[4]:e[3];return t=iC(t,this.poolSize[0],this.padding,this.strides[0]),n=iC(n,this.poolSize[1],this.padding,this.strides[1]),r=iC(r,this.poolSize[2],this.padding,this.strides[2]),this.dataFormat===`channelsFirst`?[e[0],e[1],t,n,r]:[e[0],t,n,r,e[4]]}call(e,t){return P(()=>(this.invokeCallHook(e,t),this.poolingFunction(J(e),this.poolSize,this.strides,this.padding,this.dataFormat)))}getConfig(){let e={poolSize:this.poolSize,padding:this.padding,strides:this.strides,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}},Ew=class extends Tw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Iv(i),Rv(r),vw(e,t,n,r,i,`max`)}};Ew.className=`MaxPooling3D`,G(Ew);var Dw=class extends Tw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Iv(i),Rv(r),vw(e,t,n,r,i,`avg`)}};Dw.className=`AveragePooling3D`,G(Dw);var Ow=class extends Y{constructor(e){super(e),this.inputSpec=[new ib({ndim:3})]}computeOutputShape(e){return[e[0],e[2]]}call(e,t){throw new q}},kw=class extends Ow{constructor(e){super(e||{})}call(e,t){return P(()=>Eu(J(e),1))}};kw.className=`GlobalAveragePooling1D`,G(kw);var Aw=class extends Ow{constructor(e){super(e||{})}call(e,t){return P(()=>Qc(J(e),1))}};Aw.className=`GlobalMaxPooling1D`,G(Aw);var jw=class extends Y{constructor(e){super(e),this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Iv(this.dataFormat),this.inputSpec=[new ib({ndim:4})]}computeOutputShape(e){return e=e,this.dataFormat===`channelsLast`?[e[0],e[3]]:[e[0],e[1]]}call(e,t){throw new q}getConfig(){let e={dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}},Mw=class extends jw{call(e,t){return P(()=>{let t=J(e);return this.dataFormat===`channelsLast`?Eu(t,[1,2]):Eu(t,[2,3])})}};Mw.className=`GlobalAveragePooling2D`,G(Mw);var Nw=class extends jw{call(e,t){return P(()=>{let t=J(e);return this.dataFormat===`channelsLast`?Qc(t,[1,2]):Qc(t,[2,3])})}};Nw.className=`GlobalMaxPooling2D`,G(Nw);var Pw=class extends Y{constructor(e){super(e),this.layer=e.layer}build(e){this.built=!0}get trainable(){return this.layer!=null&&this.layer.trainable}set trainable(e){this.layer!=null&&(this.layer.trainable=e)}get trainableWeights(){return this.layer.trainableWeights}get nonTrainableWeights(){return this.layer.nonTrainableWeights}get updates(){return this.layer._updates}get losses(){return this.layer.losses}getWeights(){return this.layer.getWeights()}setWeights(e){this.layer.setWeights(e)}getConfig(){let e={layer:{className:this.layer.getClassName(),config:this.layer.getConfig()}},t=super.getConfig();return Object.assign(e,t),e}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.layer!=null&&this.layer.setFastWeightInitDuringBuild(e)}static fromConfig(e,t,n={}){let r=t.layer,i=qb(r,n);delete t.layer;let a={layer:i};return Object.assign(a,t),new e(a)}},Fw=class extends Pw{constructor(e){super(e),this.supportsMasking=!0}build(e){if(e=Zy(e),e.length<3)throw new K(`TimeDistributed layer expects an input shape >= 3D, but received input shape ${JSON.stringify(e)}`);this.inputSpec=[{shape:e}];let t=[e[0]].concat(e.slice(2));this.layer.built||(this.layer.build(t),this.layer.built=!0),super.build(e)}computeOutputShape(e){e=Zy(e);let t=[e[0]].concat(e.slice(2)),n=this.layer.computeOutputShape(t),r=e[1];return[n[0],r].concat(n.slice(1))}call(e,t){return P(()=>(e=J(e),TC((e,n)=>[J(this.layer.call(e,t)),[]],e,[],!1,null,null,!1,!0)[1]))}};Fw.className=`TimeDistributed`,G(Fw);function Iw(e){bv(Pv,`BidirectionalMergeMode`,e)}var Lw=`concat`,Rw=class extends Pw{constructor(e){super(e);let t=e.layer.getConfig(),n={};n.className=e.layer.getClassName(),n.config=t,this.forwardLayer=qb(n),t.goBackwards=t.goBackwards!==!0;let r={};if(r.className=e.layer.getClassName(),r.config=t,this.backwardLayer=qb(r),this.forwardLayer.name=`forward_`+this.forwardLayer.name,this.backwardLayer.name=`backward_`+this.backwardLayer.name,this.mergeMode=e.mergeMode===void 0?Lw:e.mergeMode,Iw(this.mergeMode),e.weights)throw new q(`weights support is not implemented for Bidirectional layer yet.`);this._stateful=e.layer.stateful,this.returnSequences=e.layer.returnSequences,this.returnState=e.layer.returnState,this.supportsMasking=!0,this._trainable=!0,this.inputSpec=e.layer.inputSpec,this.numConstants=null}get trainable(){return this._trainable}set trainable(e){this._trainable=e,this.forwardLayer!=null&&(this.forwardLayer.trainable=e),this.backwardLayer!=null&&(this.backwardLayer.trainable=e)}getWeights(){return this.forwardLayer.getWeights().concat(this.backwardLayer.getWeights())}setWeights(e){let t=e.length,n=Math.floor(t/2);this.forwardLayer.setWeights(e.slice(0,n)),this.backwardLayer.setWeights(e.slice(n))}computeOutputShape(e){let t=this.forwardLayer.computeOutputShape(e);Array.isArray(t)&&Array.isArray(t[0])||(t=[t]),t=t;let n,r,i;return this.returnState&&(i=t.slice(1)),n=t[0],n=n,this.mergeMode===`concat`?(n[n.length-1]*=2,r=[n]):r=this.mergeMode==null?[n,n.slice()]:[n],this.returnState?this.mergeMode==null?r.concat(i).concat(i.slice()):[n].concat(i,i.slice()):cv(r)}apply(e,t){let n=t==null?null:t.initialState,r=t==null?null:t.constants;t??={};let i=wC(e,n,r,this.numConstants);if(e=i.inputs,n=i.initialState,r=i.constants,Array.isArray(e)&&(n=e.slice(1),e=e[0]),(n==null||n.length===0)&&r==null)return super.apply(e,t);let a=[],o=[];if(n!=null){let e=n.length;if(e%2>0)throw new K("When passing `initialState` to a Bidrectional RNN, the state should be an Array containing the states of the underlying RNNs.");t.initialState=n,a.push(...n);let r=n.map(e=>new ib({shape:e.shape}));this.forwardLayer.stateSpec=r.slice(0,e/2),this.backwardLayer.stateSpec=r.slice(e/2),o.push(...r)}if(r!=null)throw new q(`Support for constants in Bidirectional layers is not implemented yet.`);let s=a[0]instanceof ab;for(let e of a)if(e instanceof ab!==s)throw new K(`The initial state of a Bidirectional layer cannot be specified as a mix of symbolic and non-symbolic tensors`);if(s){let n=[e].concat(a),r=this.inputSpec.concat(o),i=this.inputSpec;this.inputSpec=r;let s=super.apply(n,t);return this.inputSpec=i,s}return super.apply(e,t)}call(e,t){return P(()=>{let n=t.initialState,r,i;if(n==null)r=this.forwardLayer.call(e,t),i=this.backwardLayer.call(e,t);else{let a=n.slice(0,n.length/2),o=n.slice(n.length/2);r=this.forwardLayer.call(e,Object.assign(t,{initialState:a})),i=this.backwardLayer.call(e,Object.assign(t,{initialState:o}))}let a;this.returnState&&(Array.isArray(r)&&(a=r.slice(1).concat(i.slice(1))),r=r[0],i=i[0]),this.returnSequences&&(i=Td(i,1));let o;return this.mergeMode===`concat`?o=uy([r,i]):this.mergeMode===`sum`?o=R(r,i):this.mergeMode===`ave`?o=B(.5,R(r,i)):this.mergeMode===`mul`?o=B(r,i):this.mergeMode??(o=[r,i]),this.returnState?this.mergeMode==null?o.concat(a):[o].concat(a):o})}resetStates(e){this.forwardLayer.resetStates(),this.backwardLayer.resetStates()}build(e){Hv(this.forwardLayer.name,()=>{this.forwardLayer.build(e)}),Hv(this.backwardLayer.name,()=>{this.backwardLayer.build(e)}),this.built=!0}computeMask(e,t){Array.isArray(t)&&(t=t[0]);let n;if(n=this.returnSequences?this.mergeMode==null?[t,t]:t:this.mergeMode==null?[null,null]:null,this.returnState){let e=this.forwardLayer.states.map(e=>null);return Array.isArray(n)?n.concat(e).concat(e):[n].concat(e,e)}return n}get trainableWeights(){return this.forwardLayer.trainableWeights.concat(this.backwardLayer.trainableWeights)}get nonTrainableWeights(){return this.forwardLayer.nonTrainableWeights.concat(this.backwardLayer.nonTrainableWeights)}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.forwardLayer!=null&&this.forwardLayer.setFastWeightInitDuringBuild(e),this.backwardLayer!=null&&this.backwardLayer.setFastWeightInitDuringBuild(e)}getConfig(){let e={mergeMode:this.mergeMode},t=super.getConfig();return Object.assign(e,t),e}static fromConfig(e,t){let n=qb(t.layer);if(delete t.layer,t.numConstants!=null)throw new q(`Deserialization of a Bidirectional layer with numConstants present is not supported yet.`);let r=t;return r.layer=n,new e(r)}};Rw.className=`Bidirectional`,G(Rw);var zw=class extends Y{constructor(e){super(e),this.scale=e.scale,this.offset=e.offset?e.offset:0}getConfig(){let e={scale:this.scale,offset:this.offset},t=super.getConfig();return Object.assign(e,t),e}call(e,t){return P(()=>(e=J(e),e.dtype!==`float32`&&(e=ny(e,`float32`)),R(B(e,this.scale),this.offset)))}};zw.className=`Rescaling`,G(zw);var{resizeBilinear:Bw,cropAndResize:Vw}=Zp,Hw=class extends Y{constructor(e){super(e),this.height=e.height,this.width=e.width}centerCrop(e,t,n,r,i,a,o,s){return P(()=>{let c,l=!1,u=[t/a,n/o,(r+t)/a,(i+n)/o],d=[];e.rank===3?(l=!0,c=ff([e])):c=e;for(let e=0;e<c.shape[0];e++)d.push(u);let f=ua(d,[d.length,4]),p=hd(0,d.length,1,`int32`),m=Vw(c,f,p,[r,i],`nearest`);return ny(l?J(Nf(m)):m,s)})}upsize(e,t,n,r){return P(()=>ny(Bw(e,[t,n]),r))}call(e,t){return P(()=>{let t=J(e),n=t.dtype,r=t.shape,i=r[r.length-3],a=r[r.length-2],o=0;i!==this.height&&(o=Math.floor((i-this.height)/2));let s=0;return a!==this.width&&(s=Math.floor((a-this.width)/2),s===0&&(s=1)),o>=0&&s>=0?this.centerCrop(t,o,s,this.height,this.width,i,a,n):this.upsize(e,this.height,this.width,n)})}getConfig(){let e={height:this.height,width:this.width},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){e=Zy(e);let t=e.length-3,n=e.length-2;return e[t]=this.height,e[n]=this.width,e}};Hw.className=`CenterCrop`,G(Hw);function Uw(e,t,n,r){let i=J(e);if(i.dtype!==`int32`&&(i=ny(i,`int32`)),t===`int`)return i;let a=i.shape;if(i.rank===0&&(i=_l(i,-1)),t===`oneHot`&&i.shape[i.shape.length-1]!==1&&(i=_l(i,-1)),i.rank>2)throw new K(`When outputMode is not int, maximum output rank is 2 Received outputMode ${t} and input shape ${a} which would result in output rank ${i.rank}.`);let o=[`multiHot`,`oneHot`].includes(t),s=i,c;if(c=r!==void 0&&t===`count`?vc(s,r,n,o):vc(s,[],n,o),t!==`tfIdf`)return c;if(r)return B(c,r);throw new K(`When outputMode is 'tfIdf', weights must be provided.`)}var Ww=class extends Y{constructor(e){super(e),this.numTokens=e.numTokens,this.outputMode=e.outputMode?e.outputMode:`multiHot`}getConfig(){let e={numTokens:this.numTokens,outputMode:this.outputMode},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){return e=Zy(e),e==null?[this.numTokens]:this.outputMode===`oneHot`&&e[e.length-1]!==1?(e.push(this.numTokens),e):(e[e.length-1]=this.numTokens,e)}call(e,t){return P(()=>{e=J(e),e.dtype!==`int32`&&(e=ny(e,`int32`));let n;if(t.countWeights!==void 0){if(this.outputMode!==`count`)throw new K(`countWeights is not used when outputMode !== count.
              Received countWeights=${t.countWeights}`);n=J(t.countWeights)}let r=Qc(e),i=el(e),a=kl(this.numTokens,r).bufferSync().get(0),o=jl(i,0).bufferSync().get(0);if(!(a&&o))throw new K(`Input values must be between 0 < values <= numTokens with numTokens=${this.numTokens}`);return Uw(e,this.outputMode,this.numTokens,n)})}};Ww.className=`CategoryEncoding`,G(Ww);var Gw=new Set([`bilinear`,`nearest`]),Kw=class extends Y{constructor(e){if(super(e),this.height=e.height,this.width=e.width,e.interpolation)if(Gw.has(e.interpolation))this.interpolation=e.interpolation;else throw new K(`Invalid interpolation parameter: ${e.interpolation} is not implemented`);else this.interpolation=`bilinear`;this.cropToAspectRatio=!!e.cropToAspectRatio}computeOutputShape(e){e=Zy(e);let t=e[2];return[this.height,this.width,t]}getConfig(){let e={height:this.height,width:this.width,interpolation:this.interpolation,cropToAspectRatio:this.cropToAspectRatio},t=super.getConfig();return Object.assign(e,t),e}call(e,t){return P(()=>{let t=[this.height,this.width];if(this.interpolation===`bilinear`)return Zp.resizeBilinear(e,t,!this.cropToAspectRatio);if(this.interpolation===`nearest`)return Zp.resizeNearestNeighbor(e,t,!this.cropToAspectRatio);throw Error(`Interpolation is ${this.interpolation} but only ${[...Gw]} are supported`)})}};Kw.className=`Resizing`,G(Kw);var qw=class{constructor(e){this.seed=e}next(){if(this.seed!==void 0)return this.seed++}};qw.className=`RandomSeed`;var Jw=class extends Y{constructor(e){super(e),this.randomGenerator=new qw(e.seed)}getConfig(){let e={seed:this.randomGenerator.seed},t=super.getConfig();return Object.assign(e,t),e}};Jw.className=`BaseRandomLayer`;var Yw=new Set([`bilinear`,`nearest`]),Xw=class extends Jw{constructor(e){super(e);let{factor:t,interpolation:n=`bilinear`}=e;if(this.factor=t,Array.isArray(this.factor)&&this.factor.length===2)this.widthLower=this.factor[0],this.widthUpper=this.factor[1];else if(!Array.isArray(this.factor)&&this.factor>0)this.widthLower=-this.factor,this.widthUpper=this.factor;else throw new K(`Invalid factor: ${this.factor}. Must be positive number or tuple of 2 numbers`);if(this.widthLower<-1||this.widthUpper<-1)throw new K(`factor must have values larger than -1. Got: ${this.factor}`);if(this.widthUpper<this.widthLower)throw new K(`factor cannot have upper bound less than lower bound.
        Got upper bound: ${this.widthUpper}.
        Got lower bound: ${this.widthLower}
      `);if(n)if(Yw.has(n))this.interpolation=n;else throw new K(`Invalid interpolation parameter: ${n} is not implemented`)}getConfig(){let e={factor:this.factor,interpolation:this.interpolation},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){e=Zy(e);let t=e[2];return[this.imgHeight,-1,t]}call(e,t){return P(()=>{let t=J(e);this.imgHeight=t.shape[t.shape.length-3];let n=t.shape[t.shape.length-2];this.widthFactor=md([1],1+this.widthLower,1+this.widthUpper,`float32`,this.randomGenerator.next());let r=this.widthFactor.dataSync()[0]*n;r=Math.round(r);let i=[this.imgHeight,r];switch(this.interpolation){case`bilinear`:return Zp.resizeBilinear(e,i);case`nearest`:return Zp.resizeNearestNeighbor(e,i);default:throw Error(`Interpolation is ${this.interpolation}
          but only ${[...Yw]} are supported`)}})}};Xw.className=`RandomWidth`,G(Xw),k().registerFlag(`KEEP_INTERMEDIATE_TENSORS`,()=>!1,e=>{e&&console.warn(`Keep intermediate tensors is ON. This will print the values of all intermediate tensors during model inference. Not all models support this mode. For details, check e2e/benchmarks/ model_config.js. This significantly impacts performance.`)});var Zw;(function(e){e[e.DT_INVALID=0]=`DT_INVALID`,e[e.DT_FLOAT=1]=`DT_FLOAT`,e[e.DT_DOUBLE=2]=`DT_DOUBLE`,e[e.DT_INT32=3]=`DT_INT32`,e[e.DT_UINT8=4]=`DT_UINT8`,e[e.DT_INT16=5]=`DT_INT16`,e[e.DT_INT8=6]=`DT_INT8`,e[e.DT_STRING=7]=`DT_STRING`,e[e.DT_COMPLEX64=8]=`DT_COMPLEX64`,e[e.DT_INT64=9]=`DT_INT64`,e[e.DT_BOOL=10]=`DT_BOOL`,e[e.DT_QINT8=11]=`DT_QINT8`,e[e.DT_QUINT8=12]=`DT_QUINT8`,e[e.DT_QINT32=13]=`DT_QINT32`,e[e.DT_BFLOAT16=14]=`DT_BFLOAT16`,e[e.DT_QINT16=15]=`DT_QINT16`,e[e.DT_QUINT16=16]=`DT_QUINT16`,e[e.DT_UINT16=17]=`DT_UINT16`,e[e.DT_COMPLEX128=18]=`DT_COMPLEX128`,e[e.DT_HALF=19]=`DT_HALF`,e[e.DT_RESOURCE=20]=`DT_RESOURCE`,e[e.DT_VARIANT=21]=`DT_VARIANT`,e[e.DT_UINT32=22]=`DT_UINT32`,e[e.DT_UINT64=23]=`DT_UINT64`,e[e.DT_FLOAT_REF=101]=`DT_FLOAT_REF`,e[e.DT_DOUBLE_REF=102]=`DT_DOUBLE_REF`,e[e.DT_INT32_REF=103]=`DT_INT32_REF`,e[e.DT_UINT8_REF=104]=`DT_UINT8_REF`,e[e.DT_INT16_REF=105]=`DT_INT16_REF`,e[e.DT_INT8_REF=106]=`DT_INT8_REF`,e[e.DT_STRING_REF=107]=`DT_STRING_REF`,e[e.DT_COMPLEX64_REF=108]=`DT_COMPLEX64_REF`,e[e.DT_INT64_REF=109]=`DT_INT64_REF`,e[e.DT_BOOL_REF=110]=`DT_BOOL_REF`,e[e.DT_QINT8_REF=111]=`DT_QINT8_REF`,e[e.DT_QUINT8_REF=112]=`DT_QUINT8_REF`,e[e.DT_QINT32_REF=113]=`DT_QINT32_REF`,e[e.DT_BFLOAT16_REF=114]=`DT_BFLOAT16_REF`,e[e.DT_QINT16_REF=115]=`DT_QINT16_REF`,e[e.DT_QUINT16_REF=116]=`DT_QUINT16_REF`,e[e.DT_UINT16_REF=117]=`DT_UINT16_REF`,e[e.DT_COMPLEX128_REF=118]=`DT_COMPLEX128_REF`,e[e.DT_HALF_REF=119]=`DT_HALF_REF`,e[e.DT_RESOURCE_REF=120]=`DT_RESOURCE_REF`,e[e.DT_VARIANT_REF=121]=`DT_VARIANT_REF`,e[e.DT_UINT32_REF=122]=`DT_UINT32_REF`,e[e.DT_UINT64_REF=123]=`DT_UINT64_REF`})(Zw||={});var Qw;(function(e){(function(e){e[e.LEGACY=0]=`LEGACY`,e[e.V1=1]=`V1`,e[e.V2=2]=`V2`})(e.CheckpointFormatVersion||={})})(Qw||={});function $w(e,t){return eT(e,t)}function eT(e,t,n=new Map,r=new Set){if(e==null)return null;if(typeof Blob==`function`&&e instanceof Blob)return e.slice();if(r.has(e))throw Error(`Circular references are not supported.`);if(n.has(e))return n.get(e);let i=t(e);if(i.recurse&&i.value!==null)throw Error(`A deep map function may not return both a value and recurse=true.`);if(!i.recurse)return n.set(e,i.value),i.value;if(iT(e)){let i=Array.isArray(e)?[]:{};r.add(e);for(let a in e){let o=e[a];i[a]=eT(o,t,n,r)}return r.delete(e),e.__proto__&&(i.__proto__=e.__proto__),i}throw Error(`Can't recurse into non-iterable type: ${e}`)}function tT(e,t=rT){return nT(e,t)}function nT(e,t,n=new Set){let r=e[0];if(n.has(r))throw Error(`Circular references are not supported.`);let i=t(e);if(i.recurse&&i.value!==null)throw Error(`A deep zip function may not return both a value and recurse=true.`);if(!i.recurse)return i.value;if(iT(r)){let i=Array.isArray(r)?[]:{};n.add(r);for(let a in r)i[a]=nT(e.map(e=>e[a]),t,n);return n.delete(r),i}throw Error(`Can't recurse into non-iterable type: ${r}`)}function rT(e){return e===null?null:iT(e[0])?{value:null,recurse:!0}:{value:e,recurse:!1}}function iT(e){let t=!1;if(k().get(`IS_BROWSER`))t=e instanceof TextDecoder;else{let{StringDecoder:n}=r();t=e instanceof n}return e!=null&&!ArrayBuffer.isView(e)&&(Array.isArray(e)||typeof e==`object`&&!(e instanceof Oi)&&!(e instanceof Promise)&&!t)}function aT(e){return e==null||oT(e)||Array.isArray(e)||typeof e==`object`&&e instanceof Oi||si(e)}function oT(e){return e===null||typeof e!=`object`&&typeof e!=`function`}function sT(e){return $w(e,cT)}function cT(e){return e instanceof Oi?{value:e.clone(),recurse:!1}:iT(e)?{value:null,recurse:!0}:{value:e,recurse:!1}}var lT=class{constructor(e){if(this.capacity=e,this.begin=0,this.end=0,e==null)throw RangeError(`Can't create a ring buffer of unknown capacity.`);if(e<1)throw RangeError(`Can't create ring buffer of capacity < 1.`);this.data=Array(e),this.doubledCapacity=2*e}wrap(e){for(;e<0;)e+=this.doubledCapacity;return e%this.doubledCapacity}get(e){if(e<0)throw RangeError(`Can't get item at a negative index.`);return this.data[e%this.capacity]}set(e,t){if(e<0)throw RangeError(`Can't set item at a negative index.`);this.data[e%this.capacity]=t}length(){let e=this.end-this.begin;return e<0&&(e=this.doubledCapacity+e),e}isFull(){return this.length()===this.capacity}isEmpty(){return this.length()===0}push(e){if(this.isFull())throw RangeError(`Ring buffer is full.`);this.set(this.end,e),this.end=this.wrap(this.end+1)}pushAll(e){for(let t of e)this.push(t)}pop(){if(this.isEmpty())throw RangeError(`Ring buffer is empty.`);this.end=this.wrap(this.end-1);let e=this.get(this.end);return this.set(this.end,void 0),e}unshift(e){if(this.isFull())throw RangeError(`Ring buffer is full.`);this.begin=this.wrap(this.begin-1),this.set(this.begin,e)}shift(){if(this.isEmpty())throw RangeError(`Ring buffer is empty.`);let e=this.get(this.begin);return this.set(this.begin,void 0),this.begin=this.wrap(this.begin+1),e}shuffleExcise(e){if(this.isEmpty())throw RangeError(`Ring buffer is empty.`);let t=this.wrap(this.begin+e),n=this.get(t);return this.set(t,this.pop()),n}},uT=class e extends lT{constructor(){super(e.INITIAL_CAPACITY)}isFull(){return!1}push(e){super.isFull()&&this.expand(),super.push(e)}unshift(e){super.isFull()&&this.expand(),super.unshift(e)}expand(){let e=this.capacity*2,t=Array(e),n=this.length();for(let e=0;e<n;e++)t[e]=this.get(this.wrap(this.begin+e));this.data=t,this.capacity=e,this.doubledCapacity=2*this.capacity,this.begin=0,this.end=n}};uT.INITIAL_CAPACITY=32;function dT(e){return new hT(e)}function fT(e){return new gT(e)}function pT(e,t){return new DT(e,t)}var mT=class{async toArray(){let e=[],t=await this.next();for(;!t.done;)e.push(t.value),t=await this.next();return e}async toArrayForTest(){let e=this.prefetch(100),t=[],n=await e.next();for(;!n.done;)t.push(n.value),n=await e.next();return t}async resolveFully(){let e=await this.next();for(;!e.done;)e=await this.next()}async resolveWhile(e){let t=await this.next(),n=e(t.value);for(;!t.done&&n;)t=await this.next(),n=e(t.value)}handleErrors(e){return new CT(this,e)}filter(e){return new xT(this,e)}map(e){return new ST(this,e)}mapAsync(e){return new wT(this,e)}serialMapAsync(e){return new wT(this,e).serial()}flatmap(e){return new ET(this,e)}async forEachAsync(e){return this.map(e).resolveFully()}async serialForEach(e){return this.serialMapAsync(e).resolveWhile(e=>e===!0)}rowMajorBatch(e,t=!0){return new bT(this,e,t)}columnMajorBatch(e,t=!0,n=rT){return this.rowMajorBatch(e,t).map(e=>tT(e,n))}concatenate(e,t){return new DT(dT([this,e]),t)}take(e){return e<0||e==null?this:new yT(this,e)}skip(e){return e<0||e==null?this:new vT(this,e)}prefetch(e){return new kT(this,e)}shuffle(e,t){return new AT(this,e,t)}serial(){return new _T(this)}},hT=class extends mT{constructor(e){super(),this.items=e,this.trav=0}summary(){return`Array of ${this.items.length} items`}async next(){if(this.trav>=this.items.length)return{value:null,done:!0};let e=this.items[this.trav];return this.trav++,{value:sT(e),done:!1}}},gT=class extends mT{constructor(e){super(),this.nextFn=e}summary(){return`Function call`}async next(){try{return this.nextFn()}catch(e){throw e.message=`Error thrown while iterating through a dataset: ${e.message}`,e}}},_T=class extends mT{constructor(e){super(),this.upstream=e,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> Serial`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){return this.upstream.next()}},vT=class extends mT{constructor(e,t){super(),this.upstream=e,this.maxCount=t,this.count=0,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> Skip`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;this.count++<this.maxCount;){let e=await this.upstream.next();if(e.done)return e;F(e.value)}return this.upstream.next()}},yT=class extends mT{constructor(e,t){super(),this.upstream=e,this.maxCount=t,this.count=0}summary(){return`${this.upstream.summary()} -> Take`}async next(){return this.count++>=this.maxCount?{value:null,done:!0}:this.upstream.next()}},bT=class extends mT{constructor(e,t,n=!0){super(),this.upstream=e,this.batchSize=t,this.enableSmallLastBatch=n,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> RowMajorBatch`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){let e=[];for(;e.length<this.batchSize;){let t=await this.upstream.next();if(t.done)return this.enableSmallLastBatch&&e.length>0?{value:e,done:!1}:{value:null,done:!0};e.push(t.value)}return{value:e,done:!1}}},xT=class extends mT{constructor(e,t){super(),this.upstream=e,this.predicate=t,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> Filter`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;;){let e=await this.upstream.next();if(e.done||this.predicate(e.value))return e;F(e.value)}}},ST=class extends mT{constructor(e,t){super(),this.upstream=e,this.transform=t}summary(){return`${this.upstream.summary()} -> Map`}async next(){let e=await this.upstream.next();if(e.done)return{value:null,done:!0};let t=Hi(e.value),n=this.transform(e.value),r=Hi(n);for(let e of t)Vi(e,r)||e.dispose();return{value:n,done:!1}}},CT=class extends mT{constructor(e,t){super(),this.upstream=e,this.handler=t,this.count=0,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> handleErrors`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;;)try{return await this.upstream.next()}catch(e){if(!this.handler(e))return{value:null,done:!0}}}},wT=class extends mT{constructor(e,t){super(),this.upstream=e,this.transform=t}summary(){return`${this.upstream.summary()} -> AsyncMap`}async next(){let e=await this.upstream.next();if(e.done)return{value:null,done:!0};let t=Hi(e.value),n=await this.transform(e.value),r=Hi(n);for(let e of t)Vi(e,r)||e.dispose();return{value:n,done:!1}}},TT=class extends mT{constructor(){super(),this.outputQueue=new uT,this.lastRead=Promise.resolve({value:null,done:!1})}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;this.outputQueue.length()===0;)if(!await this.pump())return{value:null,done:!0};return{value:this.outputQueue.shift(),done:!1}}},ET=class extends TT{constructor(e,t){super(),this.upstream=e,this.transform=t}summary(){return`${this.upstream.summary()} -> Flatmap`}async pump(){let e=await this.upstream.next();if(e.done)return!1;let t=Hi(e.value),n=this.transform(e.value),r=Hi(n);this.outputQueue.pushAll(n);for(let e of t)Vi(e,r)||e.dispose();return!0}},DT=class extends mT{constructor(e,t){super(),this.baseErrorHandler=t,this.lastRead=null,this.iterator=null,this.moreIterators=e}summary(){return`TODO: fill in upstream of chained summaries -> Chained`}async next(){return this.lastRead=this.readFromChain(this.lastRead),this.lastRead}async readFromChain(e){if(await e,this.iterator==null){let e=await this.moreIterators.next();if(e.done)return{value:null,done:!0};this.iterator=e.value,this.baseErrorHandler!=null&&(this.iterator=this.iterator.handleErrors(this.baseErrorHandler))}let t=await this.iterator.next();return t.done?(this.iterator=null,this.readFromChain(e)):t}},OT;(function(e){e[e.FAIL=0]=`FAIL`,e[e.SHORTEST=1]=`SHORTEST`,e[e.LONGEST=2]=`LONGEST`})(OT||={});var kT=class extends mT{constructor(e,t){super(),this.upstream=e,this.bufferSize=t,this.buffer=new lT(t)}summary(){return`${this.upstream.summary()} -> Prefetch`}refill(){for(;!this.buffer.isFull();){let e=this.upstream.next();this.buffer.push(e)}}next(){return this.refill(),this.buffer.shift()}},AT=class extends kT{constructor(e,t,n){super(e,t),this.upstream=e,this.windowSize=t,this.upstreamExhausted=!1,this.random=cd.alea(n||ii().toString()),this.lastRead=Promise.resolve({value:null,done:!1})}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}randomInt(e){return Math.floor(this.random()*e)}chooseIndex(){return this.randomInt(this.buffer.length())}async serialNext(){for(this.upstreamExhausted||this.refill();!this.buffer.isEmpty();){let e=this.chooseIndex(),t=await this.buffer.shuffleExcise(e);if(t.done)this.upstreamExhausted=!0;else return this.refill(),t}return{value:null,done:!0}}},jT=class{constructor(){this.size=null}batch(e,t=!0){let n=this;m(e>0,()=>`batchSize needs to be positive, but it is
      ${e}`);let r;return r=this.size===1/0||this.size==null?this.size:t?Math.ceil(this.size/e):Math.floor(this.size/e),MT(async()=>(await n.iterator()).columnMajorBatch(e,t,NT),r)}concatenate(e){let t=this,n;return n=this.size===1/0||e.size===1/0?1/0:this.size!=null&&e.size!=null?this.size+e.size:null,MT(async()=>(await t.iterator()).concatenate(await e.iterator()),n)}filter(e){let t=this,n;return n=this.size===1/0?1/0:null,MT(async()=>(await t.iterator()).filter(t=>P(()=>e(t))),n)}async forEachAsync(e){return(await this.iterator()).forEachAsync(e)}map(e){let t=this;return MT(async()=>(await t.iterator()).map(t=>P(()=>e(t))),this.size)}mapAsync(e){let t=this;return MT(async()=>(await t.iterator()).mapAsync(e),this.size)}prefetch(e){if(e==null)throw RangeError("`Dataset.prefetch()` requires bufferSize to be specified.");let t=this;return MT(async()=>(await t.iterator()).prefetch(e),this.size)}repeat(e){let t=this,n;return n=this.size!=null&&e>0?this.size*e:e===0?0:this.size!=null&&(e===void 0||e<0)?1/0:null,MT(async()=>pT(fT(async()=>({value:await t.iterator(),done:!1})).take(e)),n)}skip(e){let t=this,n;return n=this.size!=null&&e>=0&&this.size>=e?this.size-e:this.size!=null&&(this.size<e||e===void 0||e<0)?0:null,MT(async()=>(await t.iterator()).skip(e),n)}shuffle(e,t,n=!0){if(e==null||e<0)throw this.size==null?RangeError("`Dataset.shuffle()` requires bufferSize to be specified."):RangeError(`\`Dataset.shuffle()\` requires bufferSize to be specified.  If your data fits in main memory (for regular JS objects), and/or GPU memory (for \`tf.Tensor\`s), consider setting bufferSize to the dataset size (${this.size} elements)`);let r=this,i=cd.alea(t||ii().toString());return MT(async()=>{let t=i.int32();return n&&(t+=i.int32()),(await r.iterator()).shuffle(e,t.toString())},this.size)}take(e){let t=this,n;return n=this.size!=null&&this.size>e?e:this.size!=null&&this.size<=e?this.size:null,MT(async()=>(await t.iterator()).take(e),n)}async toArray(){if(this.size===1/0)throw Error(`Can not convert infinite data stream to array.`);return(await this.iterator()).toArray()}async toArrayForTest(){if(this.size===1/0)throw Error(`Can not convert infinite data stream to array.`);return(await this.iterator()).toArrayForTest()}};jT.MAX_BUFFER_SIZE=1e4;function MT(e,t=null){return new class extends jT{constructor(){super(...arguments),this.size=t}async iterator(){return e()}}}function NT(e){if(e===null)return null;let t=e[0];return aT(t)?{value:PT(e),recurse:!1}:{value:null,recurse:!0}}function PT(e){if(e.length===0)throw Error(`Can't make a batch of zero elements.`);return e[0]instanceof Oi?ff(e):ua(e)}function X(e,t){Array.isArray(e)||(e=[e]),e.forEach(e=>{e!=null&&m(e.dtype!==`complex64`,()=>`${t} does not support complex64 tensors in the CPU backend.`)})}var FT=Ff,IT=class e extends s{nextDataId(){return e.nextDataId++}constructor(){super(),this.blockSize=48,this.firstUse=!0,this.data=new o(this,pa())}write(e,t,n){this.firstUse&&(this.firstUse=!1,k().get(`IS_NODE`)&&Er(`
============================
Hi, looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, visit https://github.com/tensorflow/tfjs-node for more details. 
============================`));let r={id:this.nextDataId()};return this.data.set(r,{values:e,dtype:n,refCount:1}),r}makeTensorInfo(e,t,n){let r;if(t===`string`&&n!=null&&n.length>0&&ae(n[0])){let i=n.map(e=>ai(e));r=this.write(i,e,t)}else r=this.write(n,e,t);return{dataId:r,shape:e,dtype:t}}refCount(e){return this.data.has(e)?this.data.get(e).refCount:0}incRef(e){let t=this.data.get(e);t.refCount++}decRef(e){if(this.data.has(e)){let t=this.data.get(e);t.refCount--}}move(e,t,n,r,i){this.data.set(e,{values:t,dtype:r,refCount:i})}numDataIds(){return this.data.numDataIds()}async read(e){return this.readSync(e)}readSync(e){let{dtype:t,complexTensorInfos:n}=this.data.get(e);return t===`complex64`?oh(this.readSync(n.real.dataId),this.readSync(n.imag.dataId)):pe(this.data.get(e).values,t)}bufferSync(e){let t=this.readSync(e.dataId);if(e.dtype===`string`)try{let n=t.map(e=>oi(e));return I(e.shape,e.dtype,n)}catch{throw Error(`Failed to decode encoded string bytes into utf-8`)}return I(e.shape,e.dtype,t)}makeOutput(e,t,n){return pa().makeTensorFromTensorInfo(this.makeTensorInfo(t,n,e),this)}disposeData(e,t=!1){if(this.data.has(e)){if(this.data.get(e).refCount--,!t&&this.data.get(e).refCount>0)return!1;let{complexTensorInfos:n}=this.data.get(e);n!=null&&(this.disposeData(n.real.dataId,!0),this.disposeData(n.imag.dataId,!0)),this.data.delete(e)}return!0}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}async time(e){let t=ii();return e(),{kernelMs:ii()-t}}memory(){return{unreliable:!0,reasons:[`The reported memory is an upper bound. Due to automatic garbage collection, the true allocated memory may be less.`]}}where(e){X([e],`where`);let t=this.readSync(e.dataId);return FT(e.shape,t)}dispose(){}floatPrecision(){return 32}epsilon(){return super.epsilon()}};IT.nextDataId=0;function LT(e){let t=new Float32Array(e.length);for(let n=0;n<e.length;++n)t[n]=Math.abs(e[n]);return t}var RT={kernelName:`Abs`,backendName:`cpu`,kernelFunc:e=>{let{x:t}=e.inputs,n=e.backend;X(t,`abs`);let r=new Float32Array(_(t.shape)),i=n.data.get(t.dataId).values;return r=LT(i),n.makeOutput(r,t.shape,t.dtype)}};function zT(e){return(t,n,r,i,a)=>{let o=H(t,n),s=o.length,c=O(o),l=E(a,_(o)),u=t.length,d=n.length,f=O(t),p=O(n),m=Tc(t,o),h=Tc(n,o);if(m.length+h.length===0)for(let t=0;t<l.length;++t)l[t]=e(r[t%r.length],i[t%i.length]);else for(let t=0;t<l.length;++t){let n=ye(t,s,c),a=n.slice(-u);m.forEach(e=>a[e]=0);let o=ve(a,u,f),g=n.slice(-d);h.forEach(e=>g[e]=0);let _=ve(g,d,p);l[t]=e(r[o],i[_])}return[l,o]}}function BT(e){let{inputs:t,backend:n}=e,{real:r,imag:i}=t,a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,s=n.makeTensorInfo(r.shape,`complex64`),c=n.data.get(s.dataId);return c.complexTensorInfos={real:n.makeTensorInfo(r.shape,`float32`,a),imag:n.makeTensorInfo(i.shape,`float32`,o)},s}var VT={kernelName:tt,backendName:`cpu`,kernelFunc:BT};function HT(e,t,n=`float32`){if(n===`complex64`)return BT({inputs:{real:HT(e,t,`float32`),imag:HT(e,t,`float32`)},backend:e});let r=he(_(t),n);return e.makeTensorInfo(t,n,r)}function UT(e){let{inputs:t,backend:n}=e,{x:r}=t;return n.incRef(r.dataId),{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}var WT={kernelName:zt,backendName:`cpu`,kernelFunc:UT};function GT(e){let{inputs:t,backend:n}=e,{input:r}=t,i=n.data.get(r.dataId).complexTensorInfos.real,a=n.data.get(i.dataId).values;return n.makeTensorInfo(i.shape,i.dtype,a)}var KT={kernelName:Dn,backendName:`cpu`,kernelFunc:GT};function qT(e,t,n,r){if(r===`int32`)return[t,`int32`,Int32Array.from(e)];if(r===`bool`){let r=ri([0],n),[i,a]=zT((e,t)=>e===t?0:1)(t,[],e,r,`bool`);return[a,`bool`,i]}throw Error(`Error in Cast: failed to cast ${n} to ${r}`)}function JT(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dtype:a}=r;if(a===`complex64`){if(i.dtype===`complex64`)return UT({inputs:{x:i},backend:n});let e=HT(n,i.shape,i.dtype),t=JT({inputs:{x:i},backend:n,attrs:{dtype:`float32`}}),r=BT({inputs:{real:t,imag:e},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),r}if(i.dtype===`complex64`){let e=GT({inputs:{input:i},backend:n}),t=JT({inputs:{x:e},backend:n,attrs:{dtype:a}});return n.disposeIntermediateTensorInfo(e),t}if(!ne(i.dtype,a)){let e=UT({inputs:{x:i},backend:n});return{dataId:e.dataId,shape:e.shape,dtype:a}}let o=n.data.get(i.dataId).values,[s,c,l]=qT(o,i.shape,i.dtype,a);return n.makeTensorInfo(s,c,l)}var YT={kernelName:Qe,backendName:`cpu`,kernelFunc:JT};function XT(e,t,n,r){return n==null?({inputs:n,backend:i})=>{let{a,b:o}=n,s=i;X([a,o],e);let c=s.data.get(a.dataId).values,l=s.data.get(o.dataId).values,u=a.dtype===`string`?Hh(c):c,d=a.dtype===`string`?Hh(l):l,f=r||a.dtype,[p,m]=t(a.shape,o.shape,u,d,f);return s.makeTensorInfo(m,f,p)}:({inputs:e,backend:i})=>{let{a,b:o}=e,s=i;if(a.dtype===`complex64`||o.dtype===`complex64`){let e=JT({inputs:{x:a},backend:s,attrs:{dtype:`complex64`}}),t=s.data.get(e.dataId),r=t.complexTensorInfos.real,i=t.complexTensorInfos.imag,c=s.data.get(r.dataId).values,l=s.data.get(i.dataId).values,u=JT({inputs:{x:o},backend:s,attrs:{dtype:`complex64`}}),d=s.data.get(u.dataId),f=d.complexTensorInfos.real,p=d.complexTensorInfos.imag,m=s.data.get(f.dataId).values,h=s.data.get(p.dataId).values,[g,_,v]=n(a.shape,o.shape,c,l,m,h),y=s.makeTensorInfo(v,`float32`,g),b=s.makeTensorInfo(v,`float32`,_),x=BT({inputs:{real:y,imag:b},backend:s});return s.disposeIntermediateTensorInfo(e),s.disposeIntermediateTensorInfo(u),s.disposeIntermediateTensorInfo(y),s.disposeIntermediateTensorInfo(b),x}{let e=s.data.get(a.dataId).values,n=s.data.get(o.dataId).values,i=r||a.dtype,[c,l]=t(a.shape,o.shape,e,n,i);return s.makeTensorInfo(l,i,c)}}}function ZT(e){return(t,n,r,i,a,o)=>{let s=H(t,n),c=_(s),l=s.length,u=O(s),d=E(`float32`,c),f=E(`float32`,c),p=Tc(t,s),m=Tc(n,s),h=oh(r,i),g=oh(a,o),v=t.length,y=O(t),b=n.length,x=O(n);if(p.length+m.length===0)for(let t=0;t<d.length;t++){let n=t%h.length,r=t%g.length,i=e(h[n*2],h[n*2+1],g[r*2],g[r*2+1]);d[t]=i.real,f[t]=i.imag}else for(let t=0;t<d.length;t++){let n=ye(t,l,u),r=n.slice(-v);p.forEach(e=>r[e]=0);let i=ve(r,v,y),a=n.slice(-b);m.forEach(e=>a[e]=0);let o=ve(a,b,x),s=e(h[i*2],h[i*2+1],g[o*2],g[o*2+1]);d[t]=s.real,f[t]=s.imag}return[d,f,s]}}var QT=zT(((e,t)=>e+t)),$T=XT(`Add`,QT,ZT(((e,t,n,r)=>({real:e+n,imag:t+r})))),eE={kernelName:`Add`,backendName:`cpu`,kernelFunc:$T};function tE(e,t,n,r,i){let a=_(r),o=he(i,n);for(let n=0;n<e.length;n++){let r=e[n];if(r<0)throw Error(`Input x must be non-negative!`);r>=i||(a>0?o[r]+=t[n]:o[r]+=1)}return o}function nE(e,t,n,r=!1){let i=e.shape[0],a=e.shape[1],o=I([i,n],t.dtype);for(let s=0;s<i;s++)for(let i=0;i<a;i++){let a=e.get(s,i);if(a<0)throw Error(`Input x must be non-negative!`);a>=n||(r?o.set(1,s,a):t.size>0?o.set(o.get(s,a)+t.get(s,i),s,a):o.set(o.get(s,a)+1,s,a))}return o}var rE=zT(((e,t)=>e&t)),iE={kernelName:Ye,backendName:`cpu`,kernelFunc:XT(Ye,rE)};function aE(e){return(t,n,r)=>{let i=D(n,t.length);for(let n=0;n<t.length;++n)i[n]=e(t[n],r);return i}}function oE(e,t,n){return sE(e,aE(t),n)}function sE(e,t,n){return({inputs:r,attrs:i,backend:a})=>{let{x:o}=r;X(o,e);let s=a,c=s.data.get(o.dataId).values,l;if(o.dtype===`string`){if(!Array.isArray(c))throw Error(`String tensor's value was not an instance of Array`);l=Hh(c)}else l=c;let u=n||o.dtype,d=t(l,u,i);return s.makeTensorInfo(o.shape,u,d)}}var cE=aE(e=>Math.ceil(e)),lE={kernelName:$e,backendName:`cpu`,kernelFunc:sE($e,cE)};function uE(e,t,n,r){let i=D(n,_(t));if(r&&n!==`string`){let t=0;e.forEach(e=>{let n=_(e.shape);i.set(e.vals,t),t+=n})}else{let r=0;e.forEach(e=>{let a=n===`string`?Hh(e.vals):e.vals,o=0;for(let n=0;n<e.shape[0];++n){let s=n*t[1]+r;for(let t=0;t<e.shape[1];++t)i[s+t]=a[o++]}r+=e.shape[1]})}return i}var dE=zT((e,t)=>+(e===t)),fE=XT(Dt,dE,null,`bool`),pE={kernelName:Dt,backendName:`cpu`,kernelFunc:fE},mE=aE(e=>Math.exp(e)),hE=sE(`Exp`,mE,`float32`),gE={kernelName:`Exp`,backendName:`cpu`,kernelFunc:hE},_E=aE(e=>Math.expm1(e)),vE={kernelName:kt,backendName:`cpu`,kernelFunc:sE(kt,_E)},yE=aE(e=>Math.floor(e)),bE={kernelName:Mt,backendName:`cpu`,kernelFunc:sE(Mt,yE)},xE=zT((e,t)=>Math.floor(e/t)),SE={kernelName:Nt,backendName:`cpu`,kernelFunc:XT(Nt,xE,null,`int32`)};function CE(e,t,n,r,i,a,o,s,c){let l=I([r,a],n);for(let n=0;n<r;n++){let r=[],u=0;for(let t=0;t<i;t++){let a=e[n*i+t];u+=a*o[t],r.push(a)}if(u<0||u>=c/a)throw Error(`Invalid indices: ${r} does not index into ${s}`);for(let e=0;e<a;e++)l.values[n*a+e]=t.get(...t.indexToLoc(u*a+e))}return l}function wE(e,t,n){let r=I(n,e.dtype);for(let n=0;n<r.size;++n){let i=r.indexToLoc(n).slice(),a=i[0],o=i[2],s=t.locToIndex([a,o]);i[2]=t.values[s];let c=e.locToIndex(i);0<=c&&c<e.values.length&&(r.values[n]=e.values[c])}return r}var TE=zT((e,t)=>+(e>t)),EE={kernelName:Lt,backendName:`cpu`,kernelFunc:XT(Lt,TE,null,`bool`)},DE=zT((e,t)=>+(e>=t)),OE={kernelName:Rt,backendName:`cpu`,kernelFunc:XT(Rt,DE,null,`bool`)},kE=zT((e,t)=>+(e<t)),AE={kernelName:Kt,backendName:`cpu`,kernelFunc:XT(Kt,kE,null,`bool`)},jE=zT((e,t)=>+(e<=t)),ME={kernelName:qt,backendName:`cpu`,kernelFunc:XT(qt,jE,null,`bool`)};function NE(e,t,n){let r=(t-e)/(n-1),i=he(n,`float32`);i[0]=e;for(let e=1;e<i.length;e++)i[e]=i[e-1]+r;return i}var PE=aE(e=>Math.log(e)),FE={kernelName:`Log`,backendName:`cpu`,kernelFunc:sE(`Log`,PE)};function IE(e,t,n,r){let i=E(r,_(n));for(let n=0;n<i.length;++n){let r=n*t,a=e[r];for(let n=0;n<t;++n){let t=e[r+n];(Number.isNaN(t)||t>a)&&(a=t)}i[n]=a}return i}var LE=zT(((e,t)=>Math.max(e,t))),RE={kernelName:tn,backendName:`cpu`,kernelFunc:XT(tn,LE)},zE=zT(((e,t)=>Math.min(e,t))),BE={kernelName:ln,backendName:`cpu`,kernelFunc:XT(ln,zE)},VE=zT(((e,t)=>e*t)),HE=XT(fn,VE,ZT(((e,t,n,r)=>({real:e*n-t*r,imag:e*r+t*n})))),UE={kernelName:fn,backendName:`cpu`,kernelFunc:HE};function WE(e,t,n){return VE([],t,ti(-1,n),e,n)}function GE(e){let{inputs:t,backend:n}=e,{x:r}=t;X(r,`neg`);let i=n.data.get(r.dataId).values,[a,o]=WE(i,r.shape,r.dtype);return n.makeTensorInfo(o,r.dtype,a)}var KE={kernelName:`Neg`,backendName:`cpu`,kernelFunc:GE},qE=zT(((e,t)=>e===t?0:1)),JE={kernelName:pn,backendName:`cpu`,kernelFunc:XT(pn,qE,null,`bool`)};function YE(e,t,n,r,i){let a=t.length,o=_(t),s=O(t),c=O(i),l=E(n,_(i));for(let t=0;t<o;++t){let n=ye(t,a,s),i=Array(n.length);for(let e=0;e<i.length;e++)i[e]=n[r[e]];let o=ve(i,a,c);l[o]=e[t]}return l}function XE(e){let{inputs:t,attrs:n,backend:r}=e,{x:i}=t,{perm:a}=n;X(i,`transpose`);let o=i.shape.length,s=Array(o);for(let e=0;e<s.length;e++)s[e]=i.shape[a[e]];let c=r.data.get(i.dataId).values,l=YE(c,i.shape,i.dtype,a,s);return{dataId:r.write(l,s,i.dtype),shape:s,dtype:i.dtype}}var ZE={kernelName:hr,backendName:`cpu`,kernelFunc:XE};function QE(e,t,n,r){let[i,a]=Gc(e,r),o=Ii(t,`int32`),s=he(_(i),o),c=_(a);for(let e=0;e<s.length;++e){let t=e*c,r=1;for(let e=0;e<c;++e)r*=n[t+e];s[e]=r}return{outVals:s,outShape:i,outDtype:o}}function $E(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`prod`);let s=i.shape.length,c=w(a,i.shape),l=Jc(c,s),u=c,d=i,f=[];l!=null&&(d=XE({inputs:{x:i},backend:n,attrs:{perm:l}}),f.push(d),u=Xc(u.length,s));let p=n.data.get(d.dataId).values,{outVals:m,outShape:h,outDtype:g}=QE(d.shape,d.dtype,p,u),_=h;return o&&(_=Kc(h,c)),f.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(_,g,m)}var eD={kernelName:Sn,backendName:`cpu`,kernelFunc:$E};function tD(e,t,n){e.forEach((e,r)=>{if(e<0||e>=n){let i=ye(r,t.length,O(t)).join(`,`);throw Error(`indices[${i}] = ${e} is not in [0, ${n})`)}})}function nD(e,t){for(let n=0;n<e.length;++n){let r=e[n],i=n===e.length-1?t:e[n+1].length;if(r.length===0)throw Error(`Ragged splits may not be empty`);if(r[0]<0)throw Error(`Ragged splits must be non-negative`);if(r[r.length-1]>i)throw Error(`Ragged splits must not point past values`);for(let e=1;e<r.length;++e)if(r[e-1]>r[e])throw Error(`Ragged splits must be sorted in ascending order`)}}function rD(e,t,n,r){let i=[],a=0,o=t.length-1+n.length,s=Array(o).fill(null).map(()=>[0]);nD(n,r);let c=1;for(let e=0;e<t.length-1;++e){c*=t[e];let n=t[e+1];for(let t=1;t<c+1;++t)s[e].push(t*n)}for(let r=0;r<e.length;++r){let o=e[r],c=e[r]+1;for(let e=0;e<n.length;++e){let r=n[e],i=e+t.length-1;if(i>=0){let e=s[i],t=e[e.length-1]-r[o];for(let e=o;e<c;++e)s[i].push(r[e+1]+t)}o=r[o],c=r[c]}c!==o&&(i.push([o,c]),a+=c-o)}return{outSplits:s,valueSlices:i,numValues:a}}function iD(e){let t=[];for(let n=0;n<e.length;++n){let r=e[n].length,i=D(`int32`,r);t.push(i),e[n].forEach((e,t)=>i[t]=e)}return t}function aD(e,t){let n=e.slice(0,t);for(;n.length<t;)n.push(1);for(let r=t;r<e.length;r++)n[t-1]*=e[r];return n}function oD(e,t,n,r,i,a){let o=aD(t,2)[1],s=aD(a,2)[1],c=0;for(let t of n)for(let n=t[0];n<t[1];++n){for(let t=0;t<r;++t)i[c*s+t]=e[n*o+t];++c}}function sD(e,t,n,r,i){let a=t.slice();a[0]=i;let o=D(n,_(a)),s=e.length;return oD(e,t,r,s===0?0:s/t[0],o,a),[o,a]}function cD(e,t,n,r,i,a,o,s){if(e.length===0)throw Error(`paramsNestedSplits must be non empty`);if(t[0].length===0)throw Error(`Split tensors must not be scalars`);if(tD(a,o,t[0][0]-1),r.length===0)throw Error(`params.rank must be nonzero`);let c=r[0],{outSplits:l,valueSlices:u,numValues:d}=rD(a,o,e,c),f=iD(l),p=sD(n,r,i,u,d);return[f,p[0],p[1]]}var lD=2147483647;function uD(e,t,n,r,i,a,o){if(t.length>1)throw Error(`starts must be a scalar or vector`);if(i.length>1)throw Error(`limits must be a scalar or vector`);if(o.length>1)throw Error(`deltas must be a scalar or vector`);let s=t.length===0,c=i.length===0,l=o.length===0,u=[];s||u.push(t[0]),c||u.push(i[0]),l||u.push(o[0]);for(let e=1;e<u.length;++e)if(u[e]!==u[e-1])throw Error(`starts, limits, and deltas must have the same shape`);let d=u.length===0?1:u[0],f=D(`int32`,d+1);f[0]=0;for(let t=0;t<d;++t){let n=s?e[0]:e[t],i=c?r[0]:r[t],o=l?a[0]:a[t];if(o===0)throw Error(`Requires delta != 0`);let u;if(o>0&&i<n||o<0&&i>n)u=0;else if(u=Math.ceil(Math.abs((i-n)/o)),u>lD)throw Error(`Requires ((limit - start) / delta) <= ${lD}`);f[t+1]=f[t]+u}let p=f[d],m=D(n,p),h=0;for(let t=0;t<d;++t){let n=f[t+1]-f[t],r=s?e[0]:e[t],i=l?a[0]:a[t];for(let e=0;e<n;++e)m[h++]=r,r+=i}return[f,m]}var dD=Bm,fD=class e{constructor(e,t,n,r,i,a,o,s,c,l){this.shape=e,this.shapeShape=t,this.values=n,this.valuesShape=r,this.valuesDType=i,this.defaultValue=a,this.defaultValueShape=o,this.rowPartitionValues=s,this.rowPartitionValuesShapes=c,this.rowPartitionTypes=Hm(l),this.raggedRank=Um(this.rowPartitionTypes)}getRowPartitionTypeByDimension(e){return this.rowPartitionTypes[0]===dD.FIRST_DIM_SIZE?this.rowPartitionTypes[e+1]:this.rowPartitionTypes[e]}getRowPartitionTensor(e){return this.rowPartitionTypes[0]===dD.FIRST_DIM_SIZE?this.rowPartitionValues[e+1]:this.rowPartitionValues[e]}getMaxWidth(t){let n=this.getRowPartitionTensor(t-1);switch(this.getRowPartitionTypeByDimension(t-1)){case dD.VALUE_ROWIDS:return e.getMaxWidthValueRowID(n);case dD.ROW_SPLITS:return e.getMaxWidthRowSplit(n);default:throw Error(`Cannot handle partition type ${dD[this.getRowPartitionTypeByDimension(t-1)]}`)}}static getMaxWidthRowSplit(e){let t=e.length;if(t===0||t===1)return 0;let n=0;for(let r=0;r<t-1;++r){let t=e[r+1]-e[r];t>n&&(n=t)}return n}static getMaxWidthValueRowID(e){let t=e.length;if(t===0)return 0;let n=0,r=e[0],i=0;for(let a=1;a<t;++a){let t=e[a];t!==r&&(r=t,i=Math.max(a-n,i),n=a)}return Math.max(t-n,i)}tensorShapeFromTensor(e,t,n=!0){if(t.length===0){if(e[0]===-1)return[];throw Error(`The only valid scalar shape tensor is the fully unknown shape specified as -1.`)}return mD(e,n)}calculateOutputSize(e){let t=this.valuesShape,n=this.defaultValueShape;Wm(n,t);let r=this.tensorShapeFromTensor(this.shape,this.shapeShape),i=Vm(this.raggedRank,r,t);i[0]<0&&(i[0]=e);for(let e=1;e<=this.raggedRank;++e)i[e]<0&&(i[e]=this.getMaxWidth(e));return i}calculateFirstParentOutputIndex(e,t,n){let r=Math.min(e,n),i=[],a=0;for(let e=0;e<r;++e,a+=t)i.push(a);for(let t=r;t<e;++t)i.push(-1);return m(i.length===e,()=>`Final length of result must be equal to firstDimension.`),i}calculateOutputIndexRowSplit(e,t,n,r){let i=e.length,a=[];for(let o=0;o<i-1;++o){let i=e[o+1]-e[o],s=Math.min(r,i),c=t[o];c===-1&&(s=0);for(let e=0;e<s;++e)a.push(c),c+=n;for(let e=0;e<i-s;++e)a.push(-1)}if(i>0&&a.length!==e[i-1])throw Error(`Invalid row split size.`);return a}calculateOutputIndexValueRowID(e,t,n,r){let i=e.length,a=[];if(i===0)return[];let o=0,s=e[0];if(s>=t.length)throw Error(`Got currentValueRowId=${s}, which is not less than ${t.length}`);let c=t[s];a.push(c);for(let l=1;l<i;++l){let i=e[l];if(i===s)c>=0&&(++o,o<r?c+=n:c=-1);else{if(o=0,s=i,i>=t.length)throw Error(`Got nextValueRowId=${i} which is not less than ${t.length}`);c=t[i]}a.push(c)}if(a.length!==e.length)throw Error(`Invalid row ids.`);return a}calculateOutputIndex(e,t,n,r){let i=this.getRowPartitionTensor(e),a=this.getRowPartitionTypeByDimension(e);switch(a){case dD.VALUE_ROWIDS:return this.calculateOutputIndexValueRowID(i,t,n,r);case dD.ROW_SPLITS:if(i.length-1>t.length)throw Error(`Row partition size is greater than output size: ${i.length-1} > ${t.length}`);return this.calculateOutputIndexRowSplit(i,t,n,r);default:throw Error(`Unsupported partition type: ${dD[a]}`)}}getFirstDimensionSize(){let e=this.rowPartitionValues[0];if(this.rowPartitionTypes.length===0)throw Error(`No row_partition_types given.`);let t=this.rowPartitionTypes[0];switch(t){case dD.FIRST_DIM_SIZE:return e[0];case dD.VALUE_ROWIDS:throw Error(`Cannot handle VALUE_ROWIDS in first dimension.`);case dD.ROW_SPLITS:return this.rowPartitionValuesShapes[0][0]-1;default:throw Error(`Cannot handle type ${dD[t]}`)}}compute(){if(this.rowPartitionValues[0].length<=0)throw Error(`Invalid first partition input. Tensor requires at least one element.`);let e=this.getFirstDimensionSize(),t=this.calculateOutputSize(e),n=Array(this.raggedRank+1);n[n.length-1]=1;for(let e=n.length-2;e>=0;--e)n[e]=n[e+1]*t[e+1];let r=mD(t,!1),i=D(this.valuesDType,_(r));if(n[0]*t[0]>0){let a=this.calculateFirstParentOutputIndex(e,n[0],t[0]);for(let e=1;e<=this.raggedRank;++e)a=this.calculateOutputIndex(e-1,a,n[e],t[e]);this.setOutput(this.raggedRank,a,i,r)}return[r,i]}setOutput(e,t,n,r){if(n.length===0)return;let i=this.values,a=n,o=r.slice();o=o.slice(e+1);let s=_(o),c=t.length,l=this.defaultValue;if(l.length!==s&&l.length!==1){let e=this.defaultValueShape;P(()=>{l=Fs(V(l,e),o).dataSync()})}let u=0,d=0,f=0;for(let e=0;e<=c;++e){let r=e<c?t[e]:-1;if(r===f){++f;continue}if(d<f){let e=i.subarray(u*s);pD(a.subarray(d*s),e,(f-d)*s)}if(e>=c){let e=n.length;r=Math.floor(e/s)}if(r>f)if(this.defaultValue.length===1)a.subarray(f*s,r*s).fill(this.defaultValue[0]),f=r;else for(;r>f;)pD(a.slice(f*s),l,s),++f;r<0?(u=e+1,d=f):(u=e,d=f,f=d+1)}}};function pD(e,t,n){for(let r=0;r<n;r++)e[r]=t[r]}function mD(e,t){let n=[];for(let r of e){if(r<0){if(!t)throw Error(`Dimension ${r} must be >= 0`);if(r<-1)throw Error(`Dimension ${r} must be >= -1`);r=-1}n.push(r)}return n}function hD(e,t,n,r,i,a,o,s,c,l){return new fD(e,t,n,r,i,a,o,s,c,l).compute()}function gD(e,t,n,r){if(e===t||e<t&&n<0||t<e&&n>1)return he(0,r);let i=he(Math.abs(Math.ceil((t-e)/n)),r);t<e&&n===1&&(n=-1),i[0]=e;for(let e=1;e<i.length;e++)i[e]=i[e-1]+n;return i}var _D=aE(e=>1/Math.sqrt(e)),vD={kernelName:Rn,backendName:`cpu`,kernelFunc:sE(Rn,_D)};function yD(e,t,n,r,i,a,o,s,c,l){let u=[r/i,i],d=e.values,f=t.values;if(r===0)return I(n,t.dtype);let p=c instanceof Ci?c:I(u,t.dtype);typeof c==`string`||typeof c==`number`?p.values.fill(c):typeof c==`boolean`&&p.values.fill(+c);for(let e=0;e<a;e++){let a=[],c=0;for(let t=0;t<o;t++){let n=d[e*o+t];a.push(n),c+=n*s[t]}if(c<0||c>=r/i)throw Error(`Invalid indices: ${a} does not index into ${n}`);for(let n=0;n<i;n++)l?p.values[c*i+n]+=f[e*i+n]:p.values[c*i+n]=t.rank===0?f[0]:f[e*i+n]}return p}var bD=aE(e=>1/(1+Math.exp(-e))),xD=oE(qn,e=>1/(1+Math.exp(-e))),SD={kernelName:qn,backendName:`cpu`,kernelFunc:xD};function CD(e,t,n,r,i){let a=km(r,t,n),o=_(n),s=O(r);if(a){let n=Am(t,s);return i===`string`?e.slice(n,n+o):e.subarray(n,n+o)}let c=I(r,i,i===`string`?Hh(e):e),l=I(n,i);for(let e=0;e<l.size;++e){let n=l.indexToLoc(e),r=n.map((e,n)=>e+t[n]);l.set(c.get(...r),...n)}return i===`string`?Uh(l.values):l.values}function wD(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,size:o}=r;X(i,`slice`);let[s,c]=jm(i,a,o);_m(i,s,c);let l=n.data.get(i.dataId).values,u=CD(l,s,c,i.shape,i.dtype);return n.makeTensorInfo(c,i.dtype,u)}var TD={kernelName:Wn,backendName:`cpu`,kernelFunc:wD};function ED(e,t,n,r,i,a,o){let s=t[0],c=a[0],l=Array(c),u=Array(s),d=t[1];if(c===0){if(s!==0)throw Error(Th(s));let e=D(n,0),t=D(i,0);return[e,[0,d],t,l,u]}let f=!0,p=0,m=Array(c).fill(0);for(let t=0;t<s;++t){let n=e[t*d];if(n<0)throw Error(Eh(t,n));if(n>=c)throw Error(Dh(t,n,c));++m[n],f&&=n>=p,p=n}let h=!0;for(let e=0;e<c;++e){let t=m[e]===0;l[e]=t,h&&=!t,m[e]=Math.max(m[e],1),e>0&&(m[e]+=m[e-1])}if(h&&f){let t=e,n=r;for(let e=0;e<s;++e)u[e]=e;return[t,[s,d],n,l,u]}{let t=m[c-1],a=D(n,t*d),f=D(i,t),p=Array(c).fill(0);for(let t=0;t<s;++t){let n=e[t*d],i=p[n],o=(n===0?0:m[n-1])+i;p[n]++;for(let n=0;n<d;++n)a[o*d+n]=e[t*d+n];f[o]=r[t],u[t]=o}for(let e=0;e<c;++e)if(p[e]===0){let t=e===0?0:m[e-1];a[t*d+0]=e;for(let e=1;e<d;++e)a[t*d+e]=0;f[t]=o}return[a,[t,d],f,l,u]}}function DD(e,t,n,r,i){let a=_(r),o=t[0],s=i.length,c=[],l=1,u=-1;for(let e=0;e<s;++e){let t=i[e];if(t===-1){if(u!==-1)throw Error(Oh(u,e));u=e,c.push(1)}else{if(t<0)throw Error(kh(e,t));l*=t,c.push(t)}}if(u!==-1){if(l<=0)throw Error(Ah());let e=Math.trunc(a/l);if(l*e!==a)throw Error(jh(r,c));c[u]=e}if(_(c)!==a)throw Error(Mh(r,c));let d=r.length,f=[];if(d>0){f[d-1]=1;for(let e=d-2;e>=0;--e)f[e]=f[e+1]*r[e+1]}let p=[];if(s>0){p[s-1]=1;for(let e=s-2;e>=0;--e)p[e]=p[e+1]*c[e+1]}let m=D(n,o*s);for(let t=0;t<o;++t){let n=0;for(let r=0;r<d;++r)n+=e[t*d+r]*f[r];for(let e=0;e<s;++e)m[t*s+e]=Math.trunc(n/p[e]),n%=p[e]}return[m,[o,s],c]}function OD(e,t,n,r,i,a=!1,o=0){let s=r.length,c=[t[0],e.length/t[0]],l=c[1],u=s>0?i[s-1]+1:0;if(u<0)throw Error(Nh());let d=t.slice();d[0]=u;let f=D(n,d.reduce((e,t)=>e*t,1));if(s===0)return u>0&&f.fill(o),[f,d];if(u<=0)throw Error(Nh());let p=0,m=1,h=0,g=i[p];for(;;){let t=0;if(m<s){if(t=i[m],g===t){++m;continue}if(g>=t)throw Error(Ph())}if(g<0||g>=u)throw Error(Fh(g,u));g>h&&f.fill(o,h*l,g*l);for(let t=p;t<m;++t){let n=r[t];if(n<0||n>=c[0])throw Error(Ih(t,r[t],c[0]));for(let t=0;t<l;t++)f[g*l+t]+=e[n*l+t]}if(a)for(let e=0;e<l;e++)f[g*l+e]/=m-p;if(p=m,++m,h=g+1,g=t,m>s)break}return h<u&&f.fill(o,h*l,u*l),[f,d]}var kD=aE(e=>Math.sqrt(e)),AD={kernelName:Yn,backendName:`cpu`,kernelFunc:oE(Yn,e=>Math.sqrt(e))},jD=zT(((e,t)=>{let n=e-t;return n*n})),MD={kernelName:ir,backendName:`cpu`,kernelFunc:XT(ir,jD)},ND=aE((e,t)=>{let{pattern:n,replaceGlobal:r,rewrite:i}=t;return e.replace(new RegExp(n,r?`g`:``),i)}),PD={kernelName:or,backendName:`cpu`,kernelFunc:sE(or,ND)};function FD(e,t,n,r){let i=I(e,t.dtype);for(let e=0;e<i.size;e++){let a=i.indexToLoc(e),o=Array(a.length);for(let e=0;e<o.length;e++)o[e]=a[e]*n[e]+r[e];i.set(t.get(...o),...a)}return i}var ID=class{constructor(e,t,n,r,i,a){this.separator=ai(e),this.nGramWidths=t,this.leftPad=ai(n),this.rightPad=ai(r),this.padWidth=i,this.preserveShort=a}getPadWidth(e){return Math.min(this.padWidth<0?e-1:this.padWidth,e-1)}getNumNGrams(e,t){let n=this.getPadWidth(t);return Math.max(0,e+2*n-t+1)}createNGrams(e,t,n,r,i,a){for(let o=0;o<i;++o){let s=this.getPadWidth(a),c=Math.max(0,s-o),l=Math.max(0,s-(i-(o+1))),u=a-(c+l),d=t+(c>0?0:o-s),f=0;f+=c*this.leftPad.length;for(let t=0;t<u;++t)f+=e[d+t].length;f+=l*this.rightPad.length;let p=c+l+u-1;f+=p*this.separator.length,n[r+o]=new Uint8Array(f);let m=n[r+o],h=0,g=e=>e.forEach(e=>m[h++]=e);for(let e=0;e<c;++e)g(this.leftPad),g(this.separator);for(let t=0;t<u-1;++t)g(e[d+t]),g(this.separator);if(u>0){g(e[d+u-1]);for(let e=0;e<l;++e)g(this.separator),g(this.rightPad)}else{for(let e=0;e<l-1;++e)g(this.rightPad),g(this.separator);g(this.rightPad)}}}compute(e,t){let n=e.length,r=t.length;if(r>0){let e=t[0];if(e!==0)throw Error(`First split value must be 0, got ${e}`);for(let i=1;i<r;++i){let r=t[i]>=e;if(r&&=t[i]<=n,!r)throw Error(`Invalid split value ${t[i]}, must be in [${e}, ${n}]`);e=t[i]}if(e!==n)throw Error(`Last split value must be data size. Expected ${n}, got ${e}`)}let i=r-1,a=D(`int32`,r);if(n===0||r===0){let e=Array(n);for(let e=0;e<=i;++e)a[e]=0;return[e,a]}a[0]=0;for(let e=1;e<=i;++e){let n=t[e]-t[e-1],r=0;this.nGramWidths.forEach(e=>{r+=this.getNumNGrams(n,e)}),this.preserveShort&&n>0&&r===0&&(r=1),a[e]=a[e-1]+r}let o=Array(a[i]);for(let n=0;n<i;++n){let r=t[n],i=a[n];if(this.nGramWidths.forEach(a=>{let s=t[n+1]-t[n],c=this.getNumNGrams(s,a);this.createNGrams(e,r,o,i,c,a),i+=c}),this.preserveShort&&i===a[n]){let a=t[n+1]-t[n];if(a===0)continue;let s=a+2*this.padWidth;this.createNGrams(e,r,o,i,1,s)}}return[o,a]}};function LD(e,t,n,r,i,a,o,s){return new ID(n,r,i,a,o,s).compute(e,t)}function RD(e,t,n,r){if(!e.length)return;if(t.length===0){for(let t=0;t<e.length;++t)r.push(e.subarray(t,t+1));return}if(t.length===1){let i=t[0],a=e.indexOf(i);for(;a!==-1;){let t=e.subarray(0,a);(!n||t.length!==0)&&r.push(t),e=e.subarray(a+1),a=e.indexOf(i)}(!n||e.length!==0)&&r.push(e);return}let i=0;for(let a=0;a<e.length+1;a++)if(a===e.length||t.indexOf(e[a])!==-1){let t=e.subarray(i,a);(!n||t.length!==0)&&r.push(t),i=a+1}}function zD(e,t,n){let r=e.length,i=[],a=0,o=0,s=Array(r);for(let c=0;c<r;++c){let r=i.length;RD(e[c],t,n,i);let l=i.length-r;s[c]=l,a+=l,o=Math.max(o,l)}let c=D(`int32`,a*2),l=Array(a),u=[r,o],d=0;for(let e=0;e<r;++e)for(let t=0;t<s[e];++t)c[d*2]=e,c[d*2+1]=t,l[d]=i[d],++d;return[c,l,u]}function BD(e,t){let n=D(`int32`,e.length);for(let r=0;r<e.length;++r)n[r]=ei(e[r]).modulo(t).getLowBitsUnsigned();return n}var VD=zT(((e,t)=>e-t)),HD=XT(`Sub`,VD,ZT(((e,t,n,r)=>({real:e-n,imag:t-r})))),UD={kernelName:`Sub`,backendName:`cpu`,kernelFunc:HD};function WD(e,t){let n=Array(e.rank);for(let r=0;r<n.length;r++)n[r]=e.shape[r]*t[r];let r=I(n,e.dtype);for(let t=0;t<r.values.length;++t){let n=r.indexToLoc(t),i=Array(e.rank);for(let t=0;t<i.length;t++)i[t]=n[t]%e.shape[t];let a=e.locToIndex(i);r.values[t]=e.values[a]}return r}var GD=(e,t)=>{let n=t.value-e.value;return n===0?e.index-t.index:n};function KD(e,t,n=0,r=e.length-1){for(;r>n;){if(r-n>600){let i=r-n+1,a=t-n+1,o=Math.log(i),s=.5*Math.exp(2*o/3),c=.5*Math.sqrt(o*s*(i-s)/i)*Math.sign(a-i/2);KD(e,t,Math.max(n,Math.floor(t-a*s/i+c)),Math.min(r,Math.floor(t+(i-a)*s/i+c)))}let i=e[t],a=n,o=r;for(f(e,n,t),GD(e[r],i)>0&&f(e,n,r);a<o;){for(f(e,a,o),a++,o--;GD(e[a],i)<0;)a+=1;for(;GD(e[o],i)>0;)--o}GD(e[n],i)===0?f(e,n,o):(o+=1,f(e,o,r)),o<=t&&(n=o+1),t<=o&&(r=o-1)}}function qD(e,t,n,r,i){let a=t[t.length-1],[o,s]=[e.length/a,a],c=E(n,o*r),l=E(`int32`,o*r);for(let t=0;t<o;t++){let n=t*s,a=e.subarray(n,n+s),o=Array(a.length);a.forEach((e,t)=>o[t]={value:e,index:t}),r<o.length&&(KD(o,r),o=o.slice(0,r)),i&&o.sort(GD);let u=t*r,d=c.subarray(u,u+r),f=l.subarray(u,u+r);for(let e=0;e<r;e++)d[e]=o[e].value,f[e]=o[e].index}let u=t.slice();return u[u.length-1]=r,[I(u,n,c),I(u,`int32`,l)]}function JD(e,t,n,r){let i=w(t,n)[0],a=[1,n[0],1];for(let e=0;e<i;e++)a[0]*=n[e];a[1]=n[i];for(let e=i+1;e<n.length;e++)a[2]*=n[e];let o=new Map,s=new Int32Array(n[i]),c=new Ci(a,r,e),l=[],u=a[0]===1&&a[2]===1;for(let t=0;t<n[i];t++){let n;if(u)n=e[t].toString();else{let e=[];for(let n=0;n<a[0];n++)for(let r=0;r<a[2];r++)e.push(c.get(n,t,r));n=e.join(`,`)}let r=o.get(n);if(r!=null)s[t]=r;else{let e=o.size;o.set(n,e),s[t]=e,l.push(t)}}let d=a.slice();d[1]=o.size;let f=new Ci(d,r);l.forEach((e,t)=>{for(let n=0;n<a[0];n++)for(let r=0;r<a[2];r++)f.set(c.get(n,e,r),n,t,r)});let p=n.slice();return p[i]=d[1],{outputValues:f.values,outputShape:p,indices:s}}var YD=t({addImpl:()=>QT,bincountImpl:()=>tE,bincountReduceImpl:()=>nE,bitwiseAndImpl:()=>rE,castImpl:()=>qT,ceilImpl:()=>cE,concatImpl:()=>uE,equalImpl:()=>dE,expImpl:()=>mE,expm1Impl:()=>_E,floorDivImpl:()=>xE,floorImpl:()=>yE,gatherNdImpl:()=>CE,gatherV2Impl:()=>wE,greaterEqualImpl:()=>DE,greaterImpl:()=>TE,lessEqualImpl:()=>jE,lessImpl:()=>kE,linSpaceImpl:()=>NE,logImpl:()=>PE,maxImpl:()=>IE,maximumImpl:()=>LE,minimumImpl:()=>zE,multiplyImpl:()=>VE,negImpl:()=>WE,notEqualImpl:()=>qE,prodImpl:()=>QE,raggedGatherImpl:()=>cD,raggedRangeImpl:()=>uD,raggedTensorToTensorImpl:()=>hD,rangeImpl:()=>gD,rsqrtImpl:()=>_D,scatterImpl:()=>yD,sigmoidImpl:()=>bD,simpleAbsImpl:()=>LT,sliceImpl:()=>CD,sparseFillEmptyRowsImpl:()=>ED,sparseReshapeImpl:()=>DD,sparseSegmentReductionImpl:()=>OD,sqrtImpl:()=>kD,squaredDifferenceImpl:()=>jD,staticRegexReplaceImpl:()=>ND,stridedSliceImpl:()=>FD,stringNGramsImpl:()=>LD,stringSplitImpl:()=>zD,stringToHashBucketFastImpl:()=>BD,subImpl:()=>VD,tileImpl:()=>WD,topKImpl:()=>qD,transposeImpl:()=>YE,uniqueImpl:()=>JD});ga(`cpu`,()=>new IT,1);var XD=oE(`Elu`,e=>e>=0?e:Math.exp(e)-1),ZD={kernelName:`Elu`,backendName:`cpu`,kernelFunc:XD};function QD(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{alpha:a}=r;X([i],`leakyRelu`);let o=_(i.shape),s=n.data.get(i.dataId).values,c=E(`float32`,o);for(let e=0;e<s.length;e++)c[e]=s[e]<0?a*s[e]:s[e];return n.makeTensorInfo(i.shape,`float32`,c)}var $D={kernelName:Gt,backendName:`cpu`,kernelFunc:QD},eO=zT((e,t)=>e<0?t*e:e);function tO(e){let{inputs:t,backend:n}=e,{x:r,alpha:i}=t;X([r,i],`prelu`);let a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,[s,c]=eO(r.shape,i.shape,a,o,`float32`);return n.makeTensorInfo(c,`float32`,s)}var nO={kernelName:xn,backendName:`cpu`,kernelFunc:tO},rO=oE(kn,e=>Math.max(0,e)),iO={kernelName:kn,backendName:`cpu`,kernelFunc:rO},aO=oE(Fn,e=>Math.min(Math.max(0,e),6)),oO={kernelName:Fn,backendName:`cpu`,kernelFunc:aO};function sO(e,t,n,r,i){if(n===`linear`)return UT({inputs:{x:t},backend:e});if(n===`relu`)return rO({inputs:{x:t},backend:e});if(n===`elu`)return XD({inputs:{x:t},backend:e});if(n===`relu6`)return aO({inputs:{x:t},backend:e});if(n===`prelu`)return tO({inputs:{x:t,alpha:r},backend:e});if(n===`leakyrelu`)return QD({inputs:{x:t},backend:e,attrs:{alpha:i}});if(n===`sigmoid`)return xD({inputs:{x:t},backend:e});throw Error(`Activation ${n} has not been implemented for the CPU backend.`)}function cO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{shape:a}=r,o=_(i.shape),s=C(a,o),c=_(s);m(o===c,()=>`The new shape (${s}) has ${c} elements and the old shape (${i.shape}) has ${o} elements. The new shape and old shape must have the same number of elements.`),n.incRef(i.dataId);let l=n.data.get(i.dataId);if(l.complexTensorInfos!=null){let e=l.complexTensorInfos.real,t=l.complexTensorInfos.imag;e.shape=s,t.shape=s}return{dataId:i.dataId,shape:s,dtype:i.dtype}}var lO={kernelName:An,backendName:`cpu`,kernelFunc:cO};function uO(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a}=t,{transposeA:o,transposeB:s}=r;X([i,a],`matMul`);let c=i.shape.length,l=a.shape.length,u=o?i.shape[c-2]:i.shape[c-1],d=s?a.shape[l-1]:a.shape[l-2],f=o?i.shape[c-1]:i.shape[c-2],p=s?a.shape[l-2]:a.shape[l-1],h=i.shape.slice(0,-2),g=a.shape.slice(0,-2),v=_(h),y=_(g),b=H(i.shape.slice(0,-2),a.shape.slice(0,-2)).concat([f,p]);m(u===d,()=>`Error in matMul: inner shapes (${u}) and (${d}) of Tensors with shapes ${i.shape} and ${a.shape} and transposeA=${o} and transposeB=${s} must match.`);let x=o?[v,u,f]:[v,f,u],S=s?[y,p,d]:[y,d,p],C=cO({inputs:{x:i},backend:n,attrs:{shape:x}}),w=cO({inputs:{x:a},backend:n,attrs:{shape:S}}),T=o?C.shape[1]:C.shape[2],E=o?C.shape[2]:C.shape[1],D=s?w.shape[1]:w.shape[2],ee=Math.max(v,y),te=n.data.get(C.dataId).values,ne=n.data.get(w.dataId).values,re=O(C.shape),ie=O(w.shape),[ae,oe,se]=o?[re[0],1,re[1]]:[re[0],re[1],1],[ce,le,ue]=s?[1,ie[1],ie[0]]:[ie[1],1,ie[0]],de=E*D,fe=I([ee,E,D],C.dtype),pe=fe.values,me=n.blockSize;for(let e=0;e<ee;e++){let t=e%v,n=e%y;for(let r=0;r<E;r+=me){let i=Math.min(r+me,E);for(let a=0;a<D;a+=me){let o=Math.min(a+me,D);for(let s=0;s<T;s+=me){let c=Math.min(s+me,T);for(let l=r;l<i;l++)for(let r=a;r<o;r++){let i=0;for(let e=s;e<c;e++){let a=te[t*ae+l*oe+e*se],o=ne[e*ce+r*le+n*ue];i+=a*o}pe[e*de+(l*D+r)]+=i}}}}}return n.disposeIntermediateTensorInfo(C),n.disposeIntermediateTensorInfo(w),n.makeTensorInfo(b,fe.dtype,fe.values)}var dO={kernelName:Ke,backendName:`cpu`,kernelFunc:uO};function fO(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a,bias:o,preluActivationWeights:s}=t,{transposeA:c,transposeB:l,activation:u,leakyreluAlpha:d}=r,f,p,m,h=[];f=uO({inputs:{a:i,b:a},attrs:{transposeA:c,transposeB:l},backend:n}),o&&(p=$T({inputs:{a:f,b:o},backend:n}),h.push(f),f=p),u&&(m=sO(n,f,u,s,d),h.push(f),f=m);for(let e of h)n.disposeIntermediateTensorInfo(e);return f}var pO={kernelName:Cr,backendName:`cpu`,kernelFunc:fO},mO={kernelName:Me,backendName:`cpu`,kernelFunc:oE(Me,e=>Math.acos(e))},hO={kernelName:Ne,backendName:`cpu`,kernelFunc:oE(Ne,e=>Math.acosh(e))};function gO(e){let{inputs:t,backend:n}=e,r=t;X(t,`addN`);let i=r.map(e=>n.data.get(e.dataId).values),a=I(r[0].shape,r[0].dtype),o=a.values;for(let e=0;e<r.length;e++){let t=i[e];for(let e=0;e<o.length;e++)o[e]+=t[e]}return n.makeTensorInfo(a.shape,a.dtype,a.values)}var _O={kernelName:Pe,backendName:`cpu`,kernelFunc:gO};function vO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`all`);let s=w(a,i.shape),c=s,l=Jc(c,i.shape.length),u=i;l!=null&&(u=XE({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Xc(c.length,i.shape.length)),qc(`all`,c,u.shape.length);let[d,f]=Gc(u.shape,c),p=_(f),m=he(_(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];n&&=r}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=Kc(d,s),t=cO({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var yO={kernelName:`All`,backendName:`cpu`,kernelFunc:vO};function bO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`any`);let s=w(a,i.shape),c=s,l=Jc(c,i.shape.length),u=i;l!=null&&(u=XE({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Xc(c.length,i.shape.length)),qc(`any`,c,u.shape.length);let[d,f]=Gc(u.shape,c),p=_(f),m=he(_(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];n||=r}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=Kc(d,s),t=cO({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var xO={kernelName:`Any`,backendName:`cpu`,kernelFunc:bO};function SO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r;X(i,`argMax`);let o=w(a,i.shape),s=Jc(o,i.shape.length),c=i,l=[];s!=null&&(c=XE({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Xc(o.length,c.shape.length)),o=[o[0]],qc(`argMax`,o,c.shape.length);let[u,d]=Gc(c.shape,o),f=he(_(u),`int32`),p=_(d),m=n.data.get(c.dataId).values;for(let e=0;e<f.length;++e){let t=e*p,n=m[t],r=0;for(let e=0;e<p;++e){let i=m[t+e];i>n&&(n=i,r=e)}f[e]=r}return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(u,`int32`,f)}var CO={kernelName:Fe,backendName:`cpu`,kernelFunc:SO};function wO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r;X(i,`argMin`);let o=w(a,i.shape),s=Jc(o,i.shape.length),c=i,l=[];s!=null&&(c=XE({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Xc(o.length,c.shape.length)),o=[o[0]],qc(`argMin`,o,c.shape.length);let[u,d]=Gc(c.shape,o),f=he(_(u),`int32`),p=_(d),m=n.data.get(c.dataId).values;for(let e=0;e<f.length;++e){let t=e*p,n=m[t],r=0;for(let e=0;e<p;++e){let i=m[t+e];i<n&&(n=i,r=e)}f[e]=r}return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(u,`int32`,f)}var TO={kernelName:Ie,backendName:`cpu`,kernelFunc:wO},EO={kernelName:Le,backendName:`cpu`,kernelFunc:oE(Le,e=>Math.asin(e))},DO={kernelName:Re,backendName:`cpu`,kernelFunc:oE(Re,e=>Math.asinh(e))},OO={kernelName:ze,backendName:`cpu`,kernelFunc:oE(ze,e=>Math.atan(e))},kO={kernelName:Ve,backendName:`cpu`,kernelFunc:XT(Ve,zT((e,t)=>Math.atan2(e,t)))},AO={kernelName:Be,backendName:`cpu`,kernelFunc:oE(Be,e=>Math.atanh(e))};function jO(e,t,n,r,i,a){let o=i.strideHeight,s=i.strideWidth,c=i.dilationHeight,l=i.dilationWidth,u=i.effectiveFilterHeight,d=i.effectiveFilterWidth,f=i.padInfo.top,p=i.padInfo.left,m=a===`max`?-1/0:1/0,h=I(i.outShape,n),g=h.values,_=i.outShape[1]*i.outShape[2]*i.outShape[3],v=i.outShape[2]*i.outShape[3],y=i.outShape[3];for(let t=0;t<i.batchSize;++t){let n=t*_,h=t*r[0];for(let t=0;t<i.inChannels;++t)for(let _=0;_<i.outHeight;++_){let b=_*o-f,x=Math.max(0,b),S=Math.min(i.inHeight,u+b),C=n+_*v;for(let n=0;n<i.outWidth;++n){let o=n*s-p,u=Math.max(0,o),f=Math.min(i.inWidth,d+o),_=m,v=0,b=0;for(let n=x;n<S;n+=c){let i=h+n*r[1];for(let n=u;n<f;n+=l){let o=e[i+n*r[2]+t];a===`max`&&o>_?_=o:a===`avg`&&(v+=o,b++)}if(isNaN(_))break}let w=C+n*y+t;g[w]=a===`avg`?v/b:_}}}return h}function MO(e,t,n,r,i=!1,a=!1){let o=I(r.outShape,`int32`),s=r.strideHeight,c=r.strideWidth,l=r.dilationHeight,u=r.dilationWidth,d=r.effectiveFilterHeight,f=r.effectiveFilterWidth,p=r.padInfo.top,m=r.padInfo.left,h=I(t,n,e);for(let e=0;e<r.batchSize;++e)for(let t=0;t<r.inChannels;++t)for(let n=0;n<r.outHeight;++n){let g=n*s-p,_=g;for(;_<0;)_+=l;let v=Math.min(r.inHeight,d+g);for(let s=0;s<r.outWidth;++s){let d=s*c-m,p=d;for(;p<0;)p+=u;let y=Math.min(r.inWidth,f+d),b=-1/0,x=-1;for(let n=_;n<v;n+=l){let o=n-g;for(let s=p;s<y;s+=u){let c=s-d,l=h.get(e,n,s,t);l>b&&(b=l,x=i?a?((e*r.inHeight+n)*r.inWidth+s)*r.inChannels+t:(n*r.inWidth+s)*r.inChannels+t:o*f+c)}}o.set(x,e,n,s,t)}}return o}function NO(e,t,n,r,i,a){let o=i.strideDepth,s=i.strideHeight,c=i.strideWidth,l=i.dilationDepth,u=i.dilationHeight,d=i.dilationWidth,f=i.effectiveFilterDepth,p=i.effectiveFilterHeight,m=i.effectiveFilterWidth,h=i.padInfo.front,g=i.padInfo.top,_=i.padInfo.left,v=a===`max`?-1/0:1/0,y=I(i.outShape,n),b=y.values,x=i.outShape[1]*i.outShape[2]*i.outShape[3]*i.outShape[4],S=i.outShape[2]*i.outShape[3]*i.outShape[4],C=i.outShape[3]*i.outShape[4],w=i.outShape[4];for(let t=0;t<i.batchSize;++t){let n=t*x,y=t*r[0];for(let t=0;t<i.inChannels;++t)for(let x=0;x<i.outDepth;++x){let T=x*o-h,E=T;for(;E<0;)E+=l;let D=Math.min(i.inDepth,f+T),ee=n+x*S;for(let n=0;n<i.outHeight;++n){let o=n*s-g,f=o;for(;f<0;)f+=u;let h=Math.min(i.inHeight,p+o),x=ee+n*C;for(let n=0;n<i.outWidth;++n){let o=n*c-_,s=o;for(;s<0;)s+=d;let p=Math.min(i.inWidth,m+o),g=x+n*w,S=v,C=0,T=0;for(let n=E;n<D;n+=l){let i=y+n*r[1];for(let n=f;n<h;n+=u){let o=i+n*r[2];for(let n=s;n<p;n+=d){let i=e[o+n*r[3]+t];if(a===`max`&&i>S?S=i:a===`avg`&&(C+=i,T++),isNaN(S))break}if(isNaN(S))break}if(isNaN(S))break}let ee=g+t;b[ee]=a===`avg`?C/Math.max(T,1):S}}}}return y}function PO(e,t){let n=I(t.outShape,`int32`),r=t.strideDepth,i=t.strideHeight,a=t.strideWidth,o=t.dilationDepth,s=t.dilationHeight,c=t.dilationWidth,l=t.effectiveFilterDepth,u=t.effectiveFilterHeight,d=t.effectiveFilterWidth,f=t.padInfo.front,p=t.padInfo.top,m=t.padInfo.left;for(let h=0;h<t.batchSize;++h)for(let g=0;g<t.inChannels;++g)for(let _=0;_<t.outDepth;++_){let v=_*r-f,y=v;for(;y<0;)y+=o;let b=Math.min(t.inDepth,l+v);for(let r=0;r<t.outHeight;++r){let l=r*i-p,f=l;for(;f<0;)f+=s;let x=Math.min(t.inHeight,u+l);for(let i=0;i<t.outWidth;++i){let p=i*a-m,S=p;for(;S<0;)S+=c;let C=Math.min(t.inWidth,d+p),w=-1/0,T=-1;for(let t=y;t<b;t+=o){let n=t-v;for(let r=f;r<x;r+=s){let i=r-l;for(let a=S;a<C;a+=c){let o=a-p,s=e.get(h,t,r,a,g);s>=w&&(w=s,T=n*u*d+i*u+o)}}}n.set(T,h,_,r,i,g)}}}return n}function FO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;X(i,`avgPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;m(ns(o,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Ho(i.shape,a,o,1,s,c),u;if(l.filterWidth===1&&l.filterHeight===1&&v(l.inShape,l.outShape))u=UT({inputs:{x:i},backend:n});else{let e=n.data.get(i.dataId).values,t=O(i.shape),r=jO(e,i.shape,i.dtype,t,l,`avg`);u=n.makeTensorInfo(l.outShape,i.dtype,r.values)}return u}var IO={kernelName:He,backendName:`cpu`,kernelFunc:FO};function LO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r;X(i,`avgPool3d`);let u=Uo(i.shape,a,o,1,s,c,l),d=n.data.get(i.dataId).values,f=NO(d,i.shape,i.dtype,O(i.shape),u,`avg`);return n.makeTensorInfo(f.shape,`float32`,f.values)}var RO={kernelName:We,backendName:`cpu`,kernelFunc:LO};function zO(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,{filterSize:o,strides:s,pad:c,dimRoundingMode:l}=r;X([i,a],`avgPool3DGrad`);let u=Uo(a.shape,o,s,1,c,l),d=u.strideDepth,f=u.strideHeight,p=u.strideWidth,m=u.filterDepth,h=u.filterHeight,g=u.filterWidth,_=u.dilationDepth,v=u.dilationHeight,y=u.dilationWidth,b=u.effectiveFilterDepth,x=u.effectiveFilterHeight,S=u.effectiveFilterWidth,C=b-1-u.padInfo.front,w=S-1-u.padInfo.left,T=x-1-u.padInfo.top,E=I(a.shape,`float32`),D=1/(m*h*g),ee=n.bufferSync(i);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inDepth;++n)for(let r=0;r<u.inHeight;++r)for(let i=0;i<u.inWidth;++i){let a=n-C,o=r-T,s=i-w,c=0;for(let n=0;n<b;n+=_){let r=(a+n)/d;if(!(r<0||r>=u.outDepth||Math.floor(r)!==r))for(let n=0;n<x;n+=v){let i=(o+n)/f;if(!(i<0||i>=u.outHeight||Math.floor(i)!==i))for(let n=0;n<S;n+=y){let a=(s+n)/p;if(a<0||a>=u.outWidth||Math.floor(a)!==a)continue;let o=ee.get(e,r,i,a,t);c+=o}}}E.set(c*D,e,n,r,i,t)}return n.makeTensorInfo(E.shape,E.dtype,E.values)}var BO={kernelName:Ge,backendName:`cpu`,kernelFunc:zO};function VO(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a;X([i,a],`avgPoolGrad`);let{filterSize:s,strides:c,pad:l}=r,u=Ho(o.shape,s,c,1,l),d=u.strideHeight,f=u.strideWidth,p=u.filterHeight,m=u.filterWidth,h=u.dilationHeight,g=u.dilationWidth,_=u.effectiveFilterHeight,v=u.effectiveFilterWidth,y=v-1-u.padInfo.left,b=_-1-u.padInfo.top,x=I(o.shape,`float32`),S=1/(p*m),C=n.data.get(i.dataId).values,w=I(i.shape,`float32`,C);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inHeight;++n)for(let r=0;r<u.inWidth;++r){let i=n-b,a=r-y,o=0;for(let n=0;n<_;n+=h){let r=(i+n)/d;if(!(r<0||r>=u.outHeight||Math.floor(r)!==r))for(let n=0;n<v;n+=g){let i=(a+n)/f;if(i<0||i>=u.outWidth||Math.floor(i)!==i)continue;let s=w.get(e,r,i,t);o+=s}}x.set(o*S,e,n,r,t)}return n.makeTensorInfo(x.shape,x.dtype,x.values)}var HO={kernelName:Ue,backendName:`cpu`,kernelFunc:VO};function UO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,scale:a,offset:o,mean:s,variance:c}=t;m(s.shape.length===c.shape.length,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),m(o==null||s.shape.length===o.shape.length,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),m(a==null||s.shape.length===a.shape.length,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`),X([i,s,c,a,o],`batchNorm`);let{varianceEpsilon:l}=r;l??=.001;let u=n.data.get(i.dataId).values,d=n.data.get(s.dataId).values,f=n.data.get(c.dataId).values,p=a?n.data.get(a.dataId).values:new Float32Array([1]),h=o?n.data.get(o.dataId).values:new Float32Array([0]),g=new Float32Array(u.length),_=h.length,v=p.length,y=f.length,b=d.length,x=0,S=0,C=0,w=0;for(let e=0;e<u.length;++e)g[e]=h[x++]+(u[e]-d[S++])*p[C++]/Math.sqrt(f[w++]+l),x>=_&&(x=0),S>=b&&(S=0),C>=v&&(C=0),w>=y&&(w=0);return n.makeTensorInfo(i.shape,i.dtype,g)}var WO={kernelName:Pt,backendName:`cpu`,kernelFunc:UO};function GO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,crops:o}=r;X([i],`batchToSpaceND`);let s=a.reduce((e,t)=>e*t),c=qm(i.shape,a,s),l=Jm(c.length,a.length),u=Ym(i.shape,a,s),d=Xm(o,a.length),f=Zm(u,o,a.length),p=cO({inputs:{x:i},backend:n,attrs:{shape:c}}),m=XE({inputs:{x:p},backend:n,attrs:{perm:l}}),h=cO({inputs:{x:m},backend:n,attrs:{shape:u}}),g=wD({inputs:{x:h},backend:n,attrs:{begin:d,size:f}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),g}var KO={kernelName:qe,backendName:`cpu`,kernelFunc:GO};function qO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o}=r,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,l=tE(s,c,a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,l)}var JO={kernelName:Je,backendName:`cpu`,kernelFunc:qO};function YO(e){let{inputs:t,backend:n}=e,{s0:r,s1:i}=t,a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,s=H(Array.from(a),Array.from(o));return n.makeTensorInfo([s.length],`int32`,Int32Array.from(s))}var XO={kernelName:Ze,backendName:`cpu`,kernelFunc:YO},ZO={kernelName:et,backendName:`cpu`,kernelFunc:oE(et,(e,t)=>{let n=t;return e>n.clipValueMax?n.clipValueMax:e<n.clipValueMin?n.clipValueMin:e})},QO={kernelName:nt,backendName:`cpu`,kernelFunc:e=>{let{x:t}=e.inputs,n=e.backend,r=new Float32Array(_(t.shape)),i=n.data.get(t.dataId),a=i.complexTensorInfos.real,o=i.complexTensorInfos.imag,s=n.data.get(a.dataId).values,c=n.data.get(o.dataId).values;for(let e=0;e<s.length;e++){let t=s[e],n=c[e];r[e]=Math.hypot(t,n)}return n.makeOutput(r,t.shape,`float32`)}};function $O(e){let{inputs:t,backend:n}=e,{input:r}=t,i=n.data.get(r.dataId).complexTensorInfos.imag,a=n.data.get(i.dataId).values;return n.makeTensorInfo(i.shape,i.dtype,a)}var ek={kernelName:Vt,backendName:`cpu`,kernelFunc:$O};function tk(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r,a=w(i,t[0].shape)[0];Rm(t.map(e=>e.shape),a);let o=zm(t.map(e=>e.shape),a);if(_(o)===0)return n.makeTensorInfo(o,t[0].dtype,[]);let s=t.filter(e=>_(e.shape)>0);if(s.length===1)return UT({inputs:{x:s[0]},backend:n});if(s[0].dtype===`complex64`){let e=s.map(e=>GT({inputs:{input:e},backend:n})),t=s.map(e=>$O({inputs:{input:e},backend:n})),r=tk({inputs:e,backend:n,attrs:{axis:a}}),i=tk({inputs:t,backend:n,attrs:{axis:a}}),o=BT({inputs:{real:r,imag:i},backend:n});return e.forEach(e=>n.disposeIntermediateTensorInfo(e)),t.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.disposeIntermediateTensorInfo(r),n.disposeIntermediateTensorInfo(i),o}let c=s.map(e=>{let t=[-1,_(e.shape.slice(a))];return cO({inputs:{x:e},backend:n,attrs:{shape:t}})}),l=c.map(e=>({vals:n.data.get(e.dataId).values,shape:e.shape}));o=zm(c.map(e=>e.shape),1);let u=c[0].shape[0]===1,d=uE(l,o,t[0].dtype,u),f=zm(s.map(e=>e.shape),a),p=n.makeTensorInfo(f,t[0].dtype,d);return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var nk={kernelName:rt,backendName:`cpu`,kernelFunc:tk};function rk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dataFormat:c,dilations:l,dimRoundingMode:u}=r;X([i,a],`conv2d`);let d=is(c),f=Wo(i.shape,a.shape,o,l,s,u,!1,d),p=f.filterHeight,m=f.filterWidth,h=f.dilationHeight,g=f.dilationWidth,_=f.padInfo.left,v=f.padInfo.top,y=f.dataFormat===`channelsLast`,b=new Ci(f.outShape,i.dtype),x=O(i.shape),S=O(a.shape),C=x[0],w=y?x[1]:x[2],T=y?x[2]:1,E=y?1:x[1],D=b.strides[0],ee=y?b.strides[1]:b.strides[2],te=y?b.strides[2]:1,ne=y?1:b.strides[1],re=n.data.get(i.dataId).values,ie=n.data.get(a.dataId).values,ae=b.values;for(let e=0;e<f.batchSize;++e){let t=e*C,n=e*D;for(let e=0;e<f.outHeight;++e){let r=n+e*ee,i=e*f.strideHeight-v;for(let e=0;e<p;++e){let n=i+e*h;if(n<0||n>=f.inHeight)continue;let a=e*S[0],o=t+n*w;for(let e=0;e<f.outWidth;++e){let t=r+e*te,n=e*f.strideWidth-_;for(let e=0;e<m;++e){let r=n+e*g;if(r<0||r>=f.inWidth)continue;let i=a+e*S[1],s=o+r*T,c=i;for(let e=0;e<f.inChannels;++e){let n=re[s+e*E];for(let e=0;e<f.outChannels;++e)ae[t+e*ne]+=n*ie[c+e];c+=f.outChannels}}}}}}return n.makeTensorInfo(b.shape,b.dtype,ae)}var ik={kernelName:it,backendName:`cpu`,kernelFunc:rk};function ak(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,dataFormat:c,dimRoundingMode:l,filterShape:u}=r;X([i,a],`conv2dBackpropFilter`);let d=is(c),f=Wo(i.shape,u,o,1,s,l,!1,d),{strideHeight:p,strideWidth:m,filterHeight:h,filterWidth:g}=f,_=f.dataFormat===`channelsLast`,v=new Ci(f.filterShape,`float32`),y=f.padInfo.left,b=f.padInfo.top,x=n.data.get(i.dataId).values,S=n.data.get(a.dataId).values,C=new Ci(i.shape,i.dtype,x),w=new Ci(a.shape,a.dtype,S);for(let e=0;e<h;++e){let t=Math.max(0,Math.ceil((b-e)/p)),n=Math.min(f.outHeight,(f.inHeight+b-e)/p);for(let r=0;r<g;++r){let i=Math.max(0,Math.ceil((y-r)/m)),a=Math.min(f.outWidth,(f.inWidth+y-r)/m);for(let o=0;o<f.inChannels;++o)for(let s=0;s<f.outChannels;++s){let c=0;for(let l=0;l<f.batchSize;++l)for(let u=t;u<n;++u){let t=e+u*p-b;for(let e=i;e<a;++e){let n=r+e*m-y;c+=_?C.get(l,t,n,o)*w.get(l,u,e,s):C.get(l,o,t,n)*w.get(l,s,u,e)}}v.set(c,e,r,o,s)}}}return n.makeTensorInfo(v.shape,v.dtype,v.values)}var ok={kernelName:at,backendName:`cpu`,kernelFunc:ak};function sk(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{inputShape:o,strides:s,pad:c,dataFormat:l,dimRoundingMode:u}=r;X([i,a],`conv2dBackpropInput`);let d=O(a.shape),f=O(i.shape),p=is(l),m=Wo(o,a.shape,s,1,c,u,!1,p),h=new Ci(m.inShape,`float32`),g=h.values,_=n.data.get(i.dataId).values,v=n.data.get(a.dataId).values,[y,b,x]=d,{batchSize:S,filterHeight:C,filterWidth:w,inChannels:T,inHeight:E,inWidth:D,outChannels:ee,outHeight:te,outWidth:ne,strideHeight:re,strideWidth:ie}=m;p=m.dataFormat;let ae=C-1-m.padInfo.top,oe=w-1-m.padInfo.left,se=p===`channelsLast`,ce=h.strides[0],le=se?h.strides[1]:h.strides[2],ue=se?h.strides[2]:1,de=se?1:h.strides[1],fe=f[0],pe=se?f[1]:f[2],me=se?f[2]:1,he=se?1:f[1];for(let e=0;e<S;++e)for(let t=0;t<T;++t)for(let n=0;n<E;++n){let r=n-ae,i=Math.max(0,Math.ceil(r/re)),a=Math.min(te,(C+r)/re);for(let o=0;o<D;++o){let s=o-oe,c=Math.max(0,Math.ceil(s/ie)),l=Math.min(ne,(w+s)/ie),u=0;for(let n=i;n<a;++n){let i=n*re-r;for(let r=c;r<l;++r){let a=r*ie-s,o=fe*e+pe*n+me*r,c=y*(C-1-i)+b*(w-1-a)+x*t;for(let e=0;e<ee;++e){let t=_[o+he*e],n=v[c+e];u+=t*n}}}let d=ce*e+le*n+ue*o+de*t;g[d]=u}}return n.makeTensorInfo(h.shape,h.dtype,h.values)}var ck={kernelName:ot,backendName:`cpu`,kernelFunc:sk};function lk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r;X([i,a],`conv3d`);let l=Go(i.shape,a.shape,o,c,s),{filterDepth:u,filterHeight:d,filterWidth:f,dilationDepth:p,dilationHeight:m,dilationWidth:h,padInfo:g}=l,_=g.front,v=g.left,y=g.top,b=new Ci(l.outShape,i.dtype),x=n.data.get(i.dataId).values,S=n.data.get(a.dataId).values,C=b.values,w=O(i.shape),T=O(a.shape);for(let e=0;e<l.batchSize;++e){let t=e*w[0],n=e*b.strides[0];for(let e=0;e<l.outDepth;++e){let r=n+e*b.strides[1],i=e*l.strideDepth-_;for(let e=0;e<u;++e){let n=i+e*p;if(n<0||n>=l.inDepth)continue;let a=e*T[0],o=t+n*w[1];for(let e=0;e<l.outHeight;++e){let t=r+e*b.strides[2],n=e*l.strideHeight-y;for(let e=0;e<d;++e){let r=n+e*m;if(r<0||r>=l.inHeight)continue;let i=a+e*T[1],s=o+r*w[2];for(let e=0;e<l.outWidth;++e){let n=t+e*l.outChannels,r=e*l.strideWidth-v;for(let e=0;e<f;++e){let t=r+e*h;if(t<0||t>=l.inWidth)continue;let a=i+e*T[2],o=s+t*l.inChannels,c=a;for(let e=0;e<l.inChannels;++e){let t=x[o+e];for(let e=0;e<l.outChannels;++e)C[n+e]+=t*S[c+e];c+=l.outChannels}}}}}}}}return n.makeTensorInfo(b.shape,b.dtype,b.values)}var uk={kernelName:st,backendName:`cpu`,kernelFunc:lk};function dk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,filterShape:c}=r;X([i,a],`conv3dBackpropFilterV2`);let l=O(i.shape),u=O(a.shape),d=Go(i.shape,c,o,1,s),f=d.strideDepth,p=d.strideHeight,m=d.strideWidth,h=d.filterDepth,g=d.filterHeight,_=d.filterWidth,v=new Ci(d.filterShape,`float32`),y=v.values,[b,x,S,C]=v.strides,w=n.data.get(a.dataId).values,[T,E,D,ee]=u,te=n.data.get(i.dataId).values,[ne,re,ie,ae]=l,oe=d.padInfo.front,se=d.padInfo.left,ce=d.padInfo.top;for(let e=0;e<h;++e){let t=Math.max(0,Math.ceil((oe-e)/f)),n=Math.min(d.outDepth,(d.inDepth+oe-e)/f),r=e*b;for(let i=0;i<g;++i){let a=Math.max(0,Math.ceil((ce-i)/p)),o=Math.min(d.outHeight,(d.inHeight+ce-i)/p),s=i*x+r;for(let r=0;r<_;++r){let c=Math.max(0,Math.ceil((se-r)/m)),l=Math.min(d.outWidth,(d.inWidth+se-r)/m),u=r*S+s;for(let s=0;s<d.inChannels;++s){let h=s*C+u;for(let u=0;u<d.outChannels;++u){let g=0;for(let h=0;h<d.batchSize;++h){let d=h*ne,_=h*T;for(let h=t;h<n;++h){let t=(e+h*f-oe)*re+d,n=h*E+_;for(let e=a;e<o;++e){let a=(i+e*p-ce)*ie+t,o=e*D+n;for(let e=c;e<l;++e){let t=(r+e*m-se)*ae+a,n=e*ee+o;g+=te[t+s]*w[n+u]}}}}y[h+u]=g}}}}}return n.makeTensorInfo(v.shape,v.dtype,v.values)}var fk={kernelName:ct,backendName:`cpu`,kernelFunc:dk};function pk(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{pad:o,strides:s,inputShape:c}=r;X([i],`conv3dBackpropInputV2`);let l=O(i.shape),u=O(a.shape),d=Go(c,a.shape,s,1,o),f=new Ci(d.inShape,`float32`),p=f.values,[m,h,g,_]=f.strides,v=n.data.get(i.dataId).values,[y,b,x,S]=l,C=n.data.get(a.dataId).values,[w,T,E,D]=u,{batchSize:ee,filterDepth:te,filterHeight:ne,filterWidth:re,inChannels:ie,inDepth:ae,inHeight:oe,inWidth:se,outChannels:ce,outDepth:le,outHeight:ue,outWidth:de,strideDepth:fe,strideHeight:pe,strideWidth:me}=d,he=te-1-d.padInfo.front,ge=ne-1-d.padInfo.top,_e=re-1-d.padInfo.left;for(let e=0;e<ee;++e)for(let t=0;t<ie;++t)for(let n=0;n<ae;++n){let r=n-he,i=Math.max(0,Math.ceil(r/fe)),a=Math.min(le,(te+r)/fe);for(let o=0;o<oe;++o){let s=o-ge,c=Math.max(0,Math.ceil(s/pe)),l=Math.min(ue,(ne+s)/pe);for(let u=0;u<se;++u){let d=u-_e,f=Math.max(0,Math.ceil(d/me)),ee=Math.min(de,(re+d)/me),ie=0;for(let n=i;n<a;++n){let i=n*fe-r;for(let r=c;r<l;++r){let a=r*pe-s;for(let o=f;o<ee;++o){let s=o*me-d,c=y*e+b*n+x*r+S*o,l=w*(te-1-i)+T*(ne-1-a)+E*(re-1-s)+D*t;for(let e=0;e<ce;++e){let t=v[c+e],n=C[l+e];ie+=t*n}}}}p[m*e+h*n+g*o+_*u+t]=ie}}}return n.makeTensorInfo(f.shape,f.dtype,f.values)}var mk={kernelName:lt,backendName:`cpu`,kernelFunc:pk},hk={kernelName:`Cos`,backendName:`cpu`,kernelFunc:oE(`Cos`,e=>Math.cos(e))},gk={kernelName:ut,backendName:`cpu`,kernelFunc:oE(ut,e=>Math.cosh(e))};function _k(e){let{inputs:t,backend:n,attrs:r}=e,{image:i,boxes:a,boxInd:o}=t,{cropSize:s,method:c,extrapolationValue:l}=r,[u,d,f,p]=i.shape,m=a.shape[0],[h,g]=s,_=I([m,h,g,p],`float32`),v=n.data.get(a.dataId).values,y=n.data.get(o.dataId).values,b=n.data.get(i.dataId).values,x=O(i.shape),S=O(_.shape);for(let e=0;e<m;e++){let t=e*4,n=v[t],r=v[t+1],i=v[t+2],a=v[t+3],o=y[e];if(o>=u)continue;let s=h>1?(i-n)*(d-1)/(h-1):0,m=g>1?(a-r)*(f-1)/(g-1):0;for(let t=0;t<h;t++){let u=h>1?n*(d-1)+t*s:.5*(n+i)*(d-1);if(u<0||u>d-1){for(let n=0;n<g;n++)for(let r=0;r<p;r++){let i=r+n*S[2]+t*S[1]+e*S[0];_.values[i]=l}continue}if(c===`bilinear`){let n=Math.floor(u),i=Math.ceil(u),s=u-n;for(let c=0;c<g;c++){let u=g>1?r*(f-1)+c*m:.5*(r+a)*(f-1);if(u<0||u>f-1){for(let n=0;n<p;n++){let r=n+c*S[2]+t*S[1]+e*S[0];_.values[r]=l}continue}let d=Math.floor(u),h=Math.ceil(u),v=u-d;for(let r=0;r<p;r++){let a=r+d*x[2]+n*x[1]+o*x[0],l=b[a];a=r+h*x[2]+n*x[1]+o*x[0];let u=b[a];a=r+d*x[2]+i*x[1]+o*x[0];let f=b[a];a=r+h*x[2]+i*x[1]+o*x[0];let p=b[a],m=l+(u-l)*v,g=f+(p-f)*v;a=r+c*S[2]+t*S[1]+e*S[0],_.values[a]=m+(g-m)*s}}}else for(let n=0;n<g;++n){let i=g>1?r*(f-1)+n*m:.5*(r+a)*(f-1);if(i<0||i>f-1){for(let r=0;r<p;r++){let i=r+n*S[2]+t*S[1]+e*S[0];_.values[i]=l}continue}let s=Math.round(i),c=Math.round(u);for(let r=0;r<p;r++){let i=r+s*x[2]+c*x[1]+o*x[0],a=r+n*S[2]+t*S[1]+e*S[0];_.values[a]=b[i]}}}}return n.makeTensorInfo(_.shape,_.dtype,_.values)}var vk={kernelName:pt,backendName:`cpu`,kernelFunc:_k};function yk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;X(i,`cumprod`);let c=Jc([a],i.shape.length),l=i;c!=null&&(l=XE({inputs:{x:i},backend:n,attrs:{perm:c}}));let u=Xc(1,i.shape.length)[0];if(u!==l.shape.length-1)throw Error(`backend.cumprod in CPU expects an inner-most axis=${l.shape.length-1} but got axis=${u}`);let d=Ii(l.dtype,`int32`),f=me(_(l.shape),d),p=n.data.get(l.dataId).values,m=l.shape[l.shape.length-1],h=s?(e,t)=>e+m-t-1:(e,t)=>e+t;for(let e=0;e<p.length;e+=m)for(let t=0;t<m;t++){let n=h(e,t);if(t===0)f[n]=o?1:p[n];else{let r=h(e,t-1);f[n]=o?p[r]*f[r]:p[n]*f[r]}}let g=n.makeTensorInfo(l.shape,d,f);if(c!=null){let e=Yc(c),t=XE({inputs:{x:g},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(g),n.disposeIntermediateTensorInfo(l),t}return g}var bk={kernelName:dt,backendName:`cpu`,kernelFunc:yk};function xk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;X(i,`cumsum`);let c=Jc([a],i.shape.length),l=i;c!=null&&(l=XE({inputs:{x:i},backend:n,attrs:{perm:c}}));let u=Xc(1,i.shape.length)[0];if(u!==l.shape.length-1)throw Error(`backend.cumsum in CPU expects an inner-most axis=${l.shape.length-1} but got axis=${u}`);let d=Ii(l.dtype,`int32`),f=he(_(l.shape),d),p=n.data.get(l.dataId).values,m=l.shape[l.shape.length-1],h=s?(e,t)=>e+m-t-1:(e,t)=>e+t;for(let e=0;e<p.length;e+=m)for(let t=0;t<m;t++){let n=h(e,t);if(t===0)f[n]=o?0:p[n];else{let r=h(e,t-1);f[n]=o?p[r]+f[r]:p[n]+f[r]}}let g=n.makeTensorInfo(l.shape,d,f);if(c!=null){let e=Yc(c),t=XE({inputs:{x:g},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(g),n.disposeIntermediateTensorInfo(l),t}return g}var Sk={kernelName:ft,backendName:`cpu`,kernelFunc:xk};function Ck(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o,binaryOutput:s}=r;if(i.shape.length===1){let e=n.data.get(i.dataId).values,t=n.data.get(a.dataId).values,r=tE(e,t,a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,r)}if(i.shape.length===2){let e=nE(n.bufferSync(i),n.bufferSync(a),o,s);return n.makeTensorInfo(e.shape,a.dtype,e.values)}throw Error(`Error in denseBincount: input must be at most rank 2, but got rank${i.shape.length}.`)}var wk={kernelName:mt,backendName:`cpu`,kernelFunc:Ck};function Tk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockSize:a,dataFormat:o}=r;m(o===`NHWC`,()=>`Only NHWC dataFormat supported on CPU for depthToSpace. Got ${o}`);let s=i.shape[0],c=i.shape[1],l=i.shape[2],u=i.shape[3],d=c*a,f=l*a,p=u/(a*a),h=n.data.get(i.dataId).values,g=new Float32Array(s*d*f*p),_=0;for(let e=0;e<s;++e)for(let t=0;t<d;++t){let n=Math.floor(t/a),r=t%a;for(let t=0;t<f;++t){let i=Math.floor(t/a),o=t%a,s=(r*a+o)*p;for(let t=0;t<p;++t){let r=t+s+u*(i+l*(n+c*e));g[_++]=h[r]}}}return n.makeTensorInfo([s,d,f,p],i.dtype,g)}var Ek={kernelName:ht,backendName:`cpu`,kernelFunc:Tk};function Dk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c,dimRoundingMode:l}=r;X([i,a],`depthwiseConv2DNative`);let u=O(i.shape),d=O(a.shape),f=c;f??=[1,1],m(ns(o,f),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${o} and dilations '${f}'`);let p=Wo(i.shape,a.shape,o,f,s,l,!0),{filterHeight:h,filterWidth:g,dilationHeight:_,dilationWidth:v,padInfo:y}=p,b=y.left,x=y.top,S=p.outChannels/p.inChannels,C=new Ci(p.outShape,i.dtype),w=n.data.get(i.dataId).values,T=n.data.get(a.dataId).values,E=C.values;for(let e=0;e<p.batchSize;++e){let t=e*u[0],n=e*C.strides[0];for(let e=0;e<p.outHeight;++e){let r=n+e*C.strides[1],i=e*p.strideHeight-x;for(let e=0;e<h;++e){let n=i+e*_;if(n<0||n>=p.inHeight)continue;let a=e*d[0],o=t+n*u[1];for(let e=0;e<p.outWidth;++e){let t=r+e*C.strides[2],n=e*p.strideWidth-b;for(let e=0;e<g;++e){let r=n+e*v;if(r<0||r>=p.inWidth)continue;let i=a+e*d[1],s=o+r*p.inChannels,c=t,l=i;for(let e=0;e<p.inChannels;++e){let t=w[s+e];for(let e=0;e<S;++e)E[c+e]+=t*T[l+e];c+=S,l+=S}}}}}}return n.makeTensorInfo(C.shape,C.dtype,C.values)}var Ok={kernelName:gt,backendName:`cpu`,kernelFunc:Dk};function kk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,filterShape:u}=r;X([i,a],`depthwiseConv2dNativeBackpropFilter`);let d=Wo(i.shape,u,o,s,c,l,!0),{strideHeight:f,strideWidth:p,filterHeight:m,filterWidth:h}=d,g=new Ci(d.filterShape,`float32`),_=d.padInfo.left,v=d.padInfo.top,y=d.outChannels/d.inChannels,b=n.data.get(i.dataId).values,x=new Ci(i.shape,i.dtype,b),S=n.data.get(a.dataId).values,C=new Ci(a.shape,a.dtype,S);for(let e=0;e<m;++e){let t=Math.max(0,Math.ceil((v-e)/f)),n=Math.min(d.outHeight,(d.inHeight+v-e)/f);for(let r=0;r<h;++r){let i=Math.max(0,Math.ceil((_-r)/p)),a=Math.min(d.outWidth,(d.inWidth+_-r)/p);for(let o=0;o<d.outChannels;++o){let s=Math.trunc(o/y),c=o%y,l=0;for(let c=0;c<d.batchSize;++c)for(let u=t;u<n;++u){let t=e+u*f-v;for(let e=i;e<a;++e){let n=r+e*p-_;l+=x.get(c,t,n,s)*C.get(c,u,e,o)}}g.set(l,e,r,s,c)}}}return n.makeTensorInfo(g.shape,g.dtype,g.values)}var Ak={kernelName:_t,backendName:`cpu`,kernelFunc:kk};function jk(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,inputShape:u}=r;X([i,a],`depthwiseConv2DNativeBackpropInput`);let d=O(i.shape),f=O(a.shape),p=Wo(u,a.shape,o,s,c,l,!0),m=new Ci(p.inShape,`float32`),h=m.values,[g,_,v]=m.strides,y=n.data.get(i.dataId).values,[b,x,S]=d,C=n.data.get(a.dataId).values,[w,T,E]=f,{batchSize:D,filterHeight:ee,filterWidth:te,inChannels:ne,inHeight:re,inWidth:ie,outChannels:ae,outHeight:oe,outWidth:se,strideHeight:ce,strideWidth:le}=p,ue=ee-1-p.padInfo.top,de=te-1-p.padInfo.left,fe=ae/ne;for(let e=0;e<D;++e)for(let t=0;t<ne;++t)for(let n=0;n<re;++n){let r=n-ue,i=Math.max(0,Math.ceil(r/ce)),a=Math.min(oe,(ee+r)/ce);for(let o=0;o<ie;++o){let s=o-de,c=Math.max(0,Math.ceil(s/le)),l=Math.min(se,(te+s)/le),u=0;for(let n=i;n<a;++n){let i=n*ce-r;for(let r=c;r<l;++r){let a=r*le-s,o=b*e+x*n+S*r,c=w*(ee-1-i)+T*(te-1-a)+E*t;for(let e=0;e<fe;++e){let n=y[o+(t*fe+e)],r=C[c+e];u+=n*r}}}h[g*e+_*n+v*o+t]=u}}return n.makeTensorInfo(m.shape,m.dtype,m.values)}var Mk={kernelName:vt,backendName:`cpu`,kernelFunc:jk};function Nk(e){let{inputs:t,backend:n}=e,{x:r}=t,i=_(r.shape),a=n.data.get(r.dataId).values,o=I([i,i],r.dtype),s=o.values;for(let e=0;e<a.length;e++)s[e*i+e]=a[e];let c=[...r.shape,...r.shape];return n.makeTensorInfo(c,o.dtype,o.values)}var Pk={kernelName:yt,backendName:`cpu`,kernelFunc:Nk},Fk={kernelName:bt,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i}=e,{strides:a,pad:o,dilations:s}=n,c=t,l=c.data.get(r.dataId).values,u=r.shape.length,d=c.data.get(i.dataId).values,f=i.shape.length,{batchSize:p,inHeight:m,inWidth:h,inChannels:g,outHeight:v,outWidth:y,padInfo:b,strideHeight:x,strideWidth:S,filterHeight:C,filterWidth:w,dilationHeight:T,dilationWidth:E,outShape:ee}=Vo(r.shape,i.shape,a,o,`NHWC`,s),te=_(ee),ne=ee.length,re=D(r.dtype,te);for(let e=0;e<p;++e)for(let t=0;t<v;++t){let n=t*x-b.top;for(let a=0;a<y;++a){let o=a*S-b.left;for(let s=0;s<g;++s){let c=-(2**53-1);for(let t=0;t<C;++t){let a=n+t*T;if(a>=0&&a<m)for(let n=0;n<w;++n){let p=o+n*E;if(p>=0&&p<h){let o=ve([e,a,p,s],u,O(r.shape)),m=ve([t,n,s],f,O(i.shape)),h=l[o]+d[m];h>c&&(c=h)}}}let p=ve([e,t,a,s],ne,O(ee));re[p]=c}}}return{dataId:c.write(ri(re,r.dtype),ee,r.dtype),shape:ee,dtype:r.dtype}}},Ik={kernelName:St,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i,dy:a}=e,{strides:o,pad:s,dilations:c}=n,l=t,u=fe(r.shape,l.data.get(r.dataId).values),d=fe(i.shape,l.data.get(i.dataId).values),{batchSize:f,inHeight:p,inWidth:h,inChannels:g,outHeight:_,outWidth:v,padInfo:y,strideHeight:b,strideWidth:x,filterHeight:S,filterWidth:C,dilationHeight:w,dilationWidth:T,outShape:E}=Vo(r.shape,i.shape,o,s,`NHWC`,c);m(a.rank===E.length,()=>`Error in ${St}, dy must have the same rank as output ${E.length}, but got ${a.rank}`);let D=fe(E,l.data.get(a.dataId).values),ee=ge(i.shape,i.dtype);for(let e=0;e<f;++e)for(let t=0;t<_;++t){let n=t*b-y.top;for(let r=0;r<v;++r){let i=r*x-y.left;for(let a=0;a<g;++a){let o=-(2**53-1),s=0,c=0;for(let t=0;t<S;++t){let r=n+t*w;if(r>=0&&r<p)for(let n=0;n<C;++n){let l=i+n*T;if(l>=0&&l<h){let i=u[e][r][l][a]+d[t][n][a];i>o&&(o=i,s=t,c=n)}}}ee[s][c][a]+=D[e][t][r][a]}}}return{dataId:l.write(ri(ee,r.dtype),i.shape,i.dtype),shape:i.shape,dtype:i.dtype}}},Lk={kernelName:xt,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i,dy:a}=e,{strides:o,pad:s,dilations:c}=n,l=t,u=fe(r.shape,l.data.get(r.dataId).values),d=fe(i.shape,l.data.get(i.dataId).values),{batchSize:f,inHeight:p,inWidth:h,inChannels:g,outHeight:_,outWidth:v,padInfo:y,strideHeight:b,strideWidth:x,filterHeight:S,filterWidth:C,dilationHeight:w,dilationWidth:T,outShape:E}=Vo(r.shape,i.shape,o,s,`NHWC`,c);m(a.rank===E.length,()=>`Error in ${xt}, dy must have the same rank as output ${E.length}, but got ${a.rank}`);let D=fe(E,l.data.get(a.dataId).values),ee=ge(r.shape,r.dtype);for(let e=0;e<f;++e)for(let t=0;t<_;++t){let n=t*b-y.top;for(let r=0;r<v;++r){let i=r*x-y.left;for(let a=0;a<g;++a){let o=-(2**53-1),s=n<0?0:n,c=i<0?0:i;for(let t=0;t<S;++t){let r=n+t*w;if(r>=0&&r<p)for(let n=0;n<C;++n){let l=i+n*T;if(l>=0&&l<h){let i=u[e][r][l][a]+d[t][n][a];i>o&&(o=i,s=r,c=l)}}}ee[e][s][c][a]+=D[e][t][r][a]}}}return{dataId:l.write(ri(ee,r.dtype),r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};function Rk(e){let{inputs:t,backend:n,attrs:r}=e,{image:i}=t,{canvas:a,options:o}=r,{contextOptions:s,imageOptions:c}=o||{},l=c?.alpha||1,u=s?.contextType||`2d`;if(u!==`2d`)throw Error(`Context type ${s.contextType} is not supported by the CPU backend.`);let d=a.getContext(u,s?.contextAttributes||{});if(d==null)throw Error(`Could not get the context with ${u} type.`);let[f,p]=i.shape.slice(0,2),m=i.shape.length===2?1:i.shape[2],h=n.data.get(i.dataId).values,g=i.dtype===`float32`?255:1,_=new Uint8ClampedArray(p*f*4);for(let e=0;e<f*p;++e){let t=[0,0,0,255*l];for(let n=0;n<m;n++){let r=h[e*m+n];if(i.dtype===`float32`){if(r<0||r>1)throw Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${r}.`)}else if(i.dtype===`int32`&&(r<0||r>255))throw Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${r}.`);m===1?(t[0]=r*g,t[1]=r*g,t[2]=r*g):t[n]=r*g}let n=e*4;_[n+0]=Math.round(t[0]),_[n+1]=Math.round(t[1]),_[n+2]=Math.round(t[2]),_[n+3]=Math.round(t[3])}a.width=p,a.height=f;let v=new ImageData(_,p,f);return d.putImageData(v,0,0),i}var zk={kernelName:Ct,backendName:`cpu`,kernelFunc:Rk};function Bk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`sum`);let s;s=i.dtype===`bool`?JT({inputs:{x:i},backend:n,attrs:{dtype:`int32`}}):UT({inputs:{x:i},backend:n});let c=s.shape.length,l=w(a,s.shape),u=Jc(l,c),d=l,f=s;u!=null&&(f=XE({inputs:{x:s},backend:n,attrs:{perm:u}}),d=Xc(d.length,c)),qc(`sum`,d,f.shape.length);let[p,m]=Gc(f.shape,d),h=HT(n,p,Ii(f.dtype,`int32`)),g=_(m),v=n.data.get(h.dataId).values,y=n.data.get(f.dataId).values;for(let e=0;e<v.length;++e){let t=e*g,n=0;for(let e=0;e<g;++e)n+=y[t+e];v[e]=n}if(o){let e=Kc(h.shape,l),t=h;h=cO({inputs:{x:h},backend:n,attrs:{shape:e}}),n.disposeIntermediateTensorInfo(t)}return n.disposeIntermediateTensorInfo(s),u!=null&&n.disposeIntermediateTensorInfo(f),h}var Vk={kernelName:`Sum`,backendName:`cpu`,kernelFunc:Bk};function Hk(e){let{inputs:t,backend:n,attrs:r}=e,{equation:i}=r,a=t,{allDims:o,summedDims:s,idDims:c}=vh(i,a.length);bh(o.length,c,a);let{path:l,steps:u}=xh(s,c),d=u.length,f=null,p=o.length,m=[];for(let e=0;e<d;++e){for(let t of u[e]){let{permutationIndices:e,expandDims:r}=yh(p,c[t]),i;Sh(e)?i=a[t]:(i=XE({inputs:{x:a[t]},backend:n,attrs:{perm:e}}),m.push(i));let o=i.shape.slice();for(let e=0;e<r.length;++e)o.splice(r[e],0,1);v(i.shape,o)||(i=cO({inputs:{x:i},backend:n,attrs:{shape:o}}),m.push(i)),f===null?f=i:(f=HE({inputs:{a:i,b:f},backend:n}),m.push(f))}e<d-1&&(l[e]>=0&&(f=Bk({inputs:{x:f},backend:n,attrs:{axis:l[e]-(o.length-p),keepDims:!1}}),m.push(f)),p--)}for(let e of m)e!==f&&n.disposeIntermediateTensorInfo(e);return f}var Uk={kernelName:Tt,backendName:`cpu`,kernelFunc:Hk};function Wk(e){let{inputs:t,backend:n}=e,{dy:r,y:i}=t;X([r,i],`eluGrad`);let a=new Float32Array(_(i.shape)),o=n.data.get(i.dataId).values,s=n.data.get(r.dataId).values;for(let e=0;e<o.length;++e){let t=o[e];t>=0?a[e]=s[e]:a[e]=s[e]*(t+1)}return n.makeTensorInfo(i.shape,`float32`,a)}var Gk={kernelName:Et,backendName:`cpu`,kernelFunc:Wk},Kk=eh,qk=th,Jk=nh,Yk=rh,Xk=ih,Zk=ah,Qk={kernelName:`Erf`,backendName:`cpu`,kernelFunc:oE(`Erf`,e=>{let t=Math.sign(e),n=Math.abs(e),r=1/(1+Kk*n);return t*(1-((((Zk*r+Xk)*r+Yk)*r+Jk)*r+qk)*r*Math.exp(-n*n))})};function $k(e){let{inputs:t,backend:n,attrs:r}=e,{input:i}=t,{dim:a}=r,o=i.shape.length,s=i.shape.slice(),c=a;return a<0&&(m(-(o+1)<=a,()=>`Axis must be in the interval [${-(o+1)}, ${o}]`),c=o+a+1),s.splice(c,0,1),cO({inputs:{x:i},backend:n,attrs:{shape:s}})}var eA={kernelName:Ot,backendName:`cpu`,kernelFunc:$k},tA=XT(wt,zT((e,t)=>e/t)),nA={kernelName:wt,backendName:`cpu`,kernelFunc:tA};function rA(e,t,n){let r=e.shape,i=r[0],a=r[1],o=n.data.get(e.dataId),s=o.complexTensorInfos.real,c=o.complexTensorInfos.imag,l=[i,a],u=_(l),d=E(`float32`,u),f=E(`float32`,u);for(let e=0;e<i;e++){let r=wD({inputs:{x:s},backend:n,attrs:{begin:[e,0],size:[1,a]}}),i=wD({inputs:{x:c},backend:n,attrs:{begin:[e,0],size:[1,a]}}),o=BT({inputs:{real:r,imag:i},backend:n}),{real:l,imag:u}=iA(o,t,n),p=oh(l,u);for(let t=0;t<a;t++){let n=uh(p,t);d[e*a+t]=n.real,f[e*a+t]=n.imag}n.disposeIntermediateTensorInfo(r),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(o)}let p=n.makeTensorInfo(l,`float32`,d),m=n.makeTensorInfo(l,`float32`,f),h=BT({inputs:{real:p,imag:m},backend:n});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),h}function iA(e,t,n){let r=_(e.shape),i=n.data.get(e.dataId),a=n.data.get(i.complexTensorInfos.real.dataId).values,o=n.data.get(i.complexTensorInfos.imag.dataId).values;if(aA(r)){let i=oA(a,o,r,t,n),s=[e.shape[0],e.shape[1]];if(t){let e=n.makeTensorInfo(s,`float32`,i.real),t=n.makeTensorInfo(s,`float32`,i.imag),a=n.makeTensorInfo([],`float32`,ti(r,`float32`)),o=UT({inputs:{x:a},backend:n}),c=nA.kernelFunc({inputs:{a:e,b:a},backend:n}),l=nA.kernelFunc({inputs:{a:t,b:o},backend:n}),u=n.data.get(c.dataId).values,d=n.data.get(l.dataId).values;return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(a),n.disposeIntermediateTensorInfo(o),n.disposeIntermediateTensorInfo(c),n.disposeIntermediateTensorInfo(l),{real:u,imag:d}}return i}return sh(sA(oh(a,o),r,t))}function aA(e){return!(e&e-1)}function oA(e,t,n,r,i){if(n===1)return{real:e,imag:t};let a=oh(e,t),o=n/2,s=ch(a),c=s.real,l=s.imag,u=[c.length],d=i.makeTensorInfo(u,`float32`,c),f=i.makeTensorInfo(u,`float32`,l),p=BT({inputs:{real:d,imag:f},backend:i}),m=lh(a),h=m.real,g=m.imag,_=[h.length],v=i.makeTensorInfo(_,`float32`,h),y=i.makeTensorInfo(_,`float32`,g),b=BT({inputs:{real:v,imag:y},backend:i}),x=oA(c,l,o,r,i),S=x.real,C=x.imag,w=[S.length],T=i.makeTensorInfo(w,`float32`,S),E=i.makeTensorInfo(w,`float32`,C),D=BT({inputs:{real:T,imag:E},backend:i}),ee=oA(h,g,o,r,i),te=ee.real,ne=ee.imag,re=[te.length],ie=i.makeTensorInfo(re,`float32`,te),ae=i.makeTensorInfo(re,`float32`,ne),oe=BT({inputs:{real:ie,imag:ae},backend:i}),se=fh(n,r),ce=[se.real.length],le=i.makeTensorInfo(ce,`float32`,se.real),ue=i.makeTensorInfo(ce,`float32`,se.imag),O=BT({inputs:{real:le,imag:ue},backend:i}),de=HE({inputs:{a:O,b:oe},backend:i}),fe=$T({inputs:{a:D,b:de},backend:i}),pe=HD({inputs:{a:D,b:de},backend:i}),me=GT({inputs:{input:fe},backend:i}),he=GT({inputs:{input:pe},backend:i}),ge=$O({inputs:{input:fe},backend:i}),_e=$O({inputs:{input:pe},backend:i}),ve=tk({inputs:[me,he],backend:i,attrs:{axis:0}}),ye=tk({inputs:[ge,_e],backend:i,attrs:{axis:0}}),be=i.data.get(ve.dataId).values,xe=i.data.get(ye.dataId).values;return i.disposeIntermediateTensorInfo(d),i.disposeIntermediateTensorInfo(f),i.disposeIntermediateTensorInfo(p),i.disposeIntermediateTensorInfo(v),i.disposeIntermediateTensorInfo(y),i.disposeIntermediateTensorInfo(b),i.disposeIntermediateTensorInfo(T),i.disposeIntermediateTensorInfo(E),i.disposeIntermediateTensorInfo(D),i.disposeIntermediateTensorInfo(ie),i.disposeIntermediateTensorInfo(ae),i.disposeIntermediateTensorInfo(oe),i.disposeIntermediateTensorInfo(le),i.disposeIntermediateTensorInfo(ue),i.disposeIntermediateTensorInfo(O),i.disposeIntermediateTensorInfo(de),i.disposeIntermediateTensorInfo(fe),i.disposeIntermediateTensorInfo(pe),i.disposeIntermediateTensorInfo(me),i.disposeIntermediateTensorInfo(ge),i.disposeIntermediateTensorInfo(he),i.disposeIntermediateTensorInfo(_e),i.disposeIntermediateTensorInfo(ve),i.disposeIntermediateTensorInfo(ye),{real:be,imag:xe}}function sA(e,t,n){let r=new Float32Array(t*2);for(let i=0;i<t;i++){let a=0,o=0;for(let r=0;r<t;r++){let s=ph(i*r,t,n),c=uh(e,r);a+=c.real*s.real-c.imag*s.imag,o+=c.real*s.imag+c.imag*s.real}n&&(a/=t,o/=t),dh(r,a,o,i)}return r}function cA(e){let{inputs:t,backend:n}=e,{input:r}=t,i=_(r.shape),a=r.shape[r.shape.length-1],o=i/a,s=cO({inputs:{x:r},backend:n,attrs:{shape:[o,a]}}),c=rA(s,!1,n),l=cO({inputs:{x:c},backend:n,attrs:{shape:r.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(c),l}var lA={kernelName:`FFT`,backendName:`cpu`,kernelFunc:cA};function uA(e){let{backend:t,attrs:n}=e,{shape:r,value:i,dtype:a}=n,o=a||ce(i),s=D(o,_(r));return fA(s,i,o),t.makeTensorInfo(r,o,s)}var dA={kernelName:At,backendName:`cpu`,kernelFunc:uA};function fA(e,t,n){e.fill(t)}var pA={kernelName:jt,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,i=n,a=E(r.dtype,_(r.shape)),[o,s,c,l]=r.shape,u=i.data.get(r.dataId).values;for(let e=0;e<o;e++){let t=e*c*s*l;for(let e=0;e<s;e++){let n=c*l*e;for(let e=0;e<c;e++){let r=e*l;for(let i=0;i<l;i++){let o=Math.round(c-e-1),s=t+n+r+i,d=u[s];if(o>=0&&o<c){let e=o*l;d=u[t+n+e+i]}a[s]=d}}}}return{dataId:i.write(a,r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};function mA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=rk({inputs:{x:i,filter:a},backend:n,attrs:{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f}});if(o){let e=h;if(u===`NCHW`&&o.shape.length===1&&o.shape[0]!==1){let e=cO({inputs:{x:o},backend:n,attrs:{shape:[o.shape[0],1,1]}});h=$T({inputs:{a:h,b:e},backend:n}),n.disposeIntermediateTensorInfo(e)}else h=$T({inputs:{a:h,b:o},backend:n});n.disposeIntermediateTensorInfo(e)}if(p){let e=h;if(u===`NCHW`&&p===`prelu`&&s.shape.length===1&&s.shape[0]!==1){let e=cO({inputs:{x:s},backend:n,attrs:{shape:[s.shape[0],1,1]}});h=sO(n,h,p,e,m),n.disposeIntermediateTensorInfo(e)}else h=sO(n,h,p,s,m);n.disposeIntermediateTensorInfo(e)}return h}var hA={kernelName:wr,backendName:`cpu`,kernelFunc:mA};function gA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=Dk({inputs:{x:i,filter:a},backend:n,attrs:{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f}});if(o){let e=h;h=$T({inputs:{a:h,b:o},backend:n}),n.disposeIntermediateTensorInfo(e)}if(p){let e=h;h=sO(n,h,p,s,m),n.disposeIntermediateTensorInfo(e)}return h}var _A={kernelName:Tr,backendName:`cpu`,kernelFunc:gA};function vA(e){let{inputs:t,backend:n}=e,{params:r,indices:i}=t,a=_(r.shape),o=i.shape,s=o[o.length-1],[c,l,u,d]=pm(r,i);if(l===0)return n.makeTensorInfo(c,r.dtype,[]);let f=n.data.get(i.dataId).values,p=CE(f,n.bufferSync(r),r.dtype,l,s,u,d,r.shape,a);return n.makeTensorInfo(c,r.dtype,p.values)}var yA={kernelName:It,backendName:`cpu`,kernelFunc:vA};function bA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,indices:a}=t,{axis:o,batchDims:s}=r;X([i,a],`gatherV2`);let c=w(o,i.shape)[0],l=n.data.get(a.dataId).values,u=i.shape[c];for(let e=0;e<l.length;++e){let t=l[e];m(t<=u-1&&t>=0,()=>`GatherV2: the index value ${t} is not in [0, ${u-1}]`)}let d=s;s??(d=0);let f=_(a.shape),p=Bh(i,a,c,d),h=cO({inputs:{x:i},backend:n,attrs:{shape:[p.batchSize,p.outerSize,p.dimSize,p.sliceSize]}}),g=cO({inputs:{x:a},backend:n,attrs:{shape:[p.batchSize,f/p.batchSize]}}),v=[p.batchSize,p.outerSize,f/p.batchSize,p.sliceSize],y=n.bufferSync(g),b=wE(n.bufferSync(h),y,v);return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),n.makeTensorInfo(p.outputShape,b.dtype,b.values)}var xA={kernelName:Ft,backendName:`cpu`,kernelFunc:bA};function SA(e){let{inputs:t,backend:n}=e,{input:r}=t,i=_(r.shape),a=r.shape[r.shape.length-1],o=i/a,s=cO({inputs:{x:r},backend:n,attrs:{shape:[o,a]}}),c=rA(s,!0,n),l=cO({inputs:{x:c},backend:n,attrs:{shape:r.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(c),l}var CA={kernelName:Bt,backendName:`cpu`,kernelFunc:SA},wA={kernelName:Ht,backendName:`cpu`,kernelFunc:oE(Ht,e=>+!!Number.isFinite(e),`bool`)},TA={kernelName:Ut,backendName:`cpu`,kernelFunc:oE(Ut,e=>+(Math.abs(e)===1/0),`bool`)},EA={kernelName:Wt,backendName:`cpu`,kernelFunc:oE(Wt,e=>+!!Number.isNaN(e),`bool`)};function DA(e){let{backend:t,attrs:n}=e,{start:r,stop:i,num:a}=n,o=NE(r,i,a);return t.makeTensorInfo([o.length],`float32`,o)}var OA={kernelName:Jt,backendName:`cpu`,kernelFunc:DA},kA={kernelName:Yt,backendName:`cpu`,kernelFunc:oE(Yt,e=>Math.log1p(e))},AA={kernelName:Xt,backendName:`cpu`,kernelFunc:XT(Xt,zT((e,t)=>e&&t),null,`bool`)},jA={kernelName:Zt,backendName:`cpu`,kernelFunc:oE(Zt,e=>+!e,`bool`)},MA={kernelName:Qt,backendName:`cpu`,kernelFunc:XT(Qt,zT((e,t)=>e||t),null,`bool`)};function NA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{depthRadius:a,bias:o,alpha:s,beta:c}=r;X(i,`LRN`);let l=i.shape[3],u=l-1,d=n.data.get(i.dataId).values,f=_(i.shape),p=new Float32Array(f);function m(e){let t=e%l,n=e-t+Math.max(0,t-a),r=e-t+Math.min(t+a,u),i=0;for(;n<=r;n++){let e=d[n];i+=e*e}return i}for(let e=0;e<f;e++){let t=m(e),n=d[e]*(o+s*t)**+-c;p[e]=n}return n.makeTensorInfo(i.shape,i.dtype,p)}var PA={kernelName:`LRN`,backendName:`cpu`,kernelFunc:NA};function FA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,y:a,dy:o}=t,{depthRadius:s,bias:c,alpha:l,beta:u}=r;X(o,`LRNGrad`);let d=_(o.shape),f=o.shape[3],p=n.data.get(o.dataId).values,m=n.data.get(i.dataId).values,h=n.data.get(a.dataId).values,g=new Float32Array(d),v=d;for(let e=0;e<v;e++){let t=e%f,n=e-t+Math.max(0,t-s),r=e-t+Math.min(f,t+s+1),i=0;for(let e=n;e<r;e++)i+=m[e]**2;i=l*i+c;for(let t=n;t<r;t++){let n=-2*l*u*m[t]*h[e]/i;e===t&&(n+=i**+-u),n*=p[e],g[t]+=n}}return n.makeTensorInfo(o.shape,i.dtype,g)}var IA={kernelName:en,backendName:`cpu`,kernelFunc:FA};function LA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reductionIndices:a,keepDims:o}=r,s=n,c=i.shape,l=c.length,u=w(a,c),d=u,f=Jc(d,l),p=s.data.get(i.dataId).values;if(f!=null){let e=Array(l);for(let t=0;t<e.length;t++)e[t]=c[f[t]];p=YE(p,c,i.dtype,f,e),d=Xc(d.length,l),c=e}X(i,`max`),qc(`max`,d,l);let[m,h]=Gc(c,d),g=_(h),v=IE(p,g,m,i.dtype),y=s.write(v,m,i.dtype),b=m;return o&&(b=Kc(m,u)),{dataId:y,shape:b,dtype:i.dtype}}var RA={kernelName:`Max`,backendName:`cpu`,kernelFunc:LA};function zA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;X(i,`maxPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;m(ns(o,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Ho(i.shape,a,o,1,s,c),u;if(l.filterWidth===1&&l.filterHeight===1&&v(l.inShape,l.outShape))u=UT({inputs:{x:i},backend:n});else{let e=n.data.get(i.dataId).values,t=O(i.shape),r=jO(e,i.shape,i.dtype,t,l,`max`);u=n.makeTensorInfo(l.outShape,i.dtype,r.values)}return u}var BA={kernelName:nn,backendName:`cpu`,kernelFunc:zA};function VA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r;X(i,`maxPool3d`);let u=Uo(i.shape,a,o,1,s,c,l),d=n.data.get(i.dataId).values,f=NO(d,i.shape,i.dtype,O(i.shape),u,`max`);return n.makeTensorInfo(f.shape,`float32`,f.values)}var HA={kernelName:an,backendName:`cpu`,kernelFunc:VA};function UA(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,{filterSize:o,strides:s,pad:c,dimRoundingMode:l}=r;X([i,a],`maxPool3DGrad`);let u=Uo(a.shape,o,s,1,c,l),d=PO(n.bufferSync(a),u),f=u.strideDepth,p=u.strideHeight,m=u.strideWidth,h=u.dilationDepth,g=u.dilationHeight,_=u.dilationWidth,v=u.effectiveFilterDepth,y=u.effectiveFilterHeight,b=u.effectiveFilterWidth,x=v-1-u.padInfo.front,S=b-1-u.padInfo.left,C=y-1-u.padInfo.top,w=I(a.shape,`float32`),T=n.bufferSync(i);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inDepth;++n)for(let r=0;r<u.inHeight;++r)for(let i=0;i<u.inWidth;++i){let a=n-x,o=r-C,s=i-S,c=0;for(let n=0;n<v;n+=h){let r=(a+n)/f;if(!(r<0||r>=u.outDepth||Math.floor(r)!==r))for(let i=0;i<y;i+=g){let a=(o+i)/p;if(!(a<0||a>=u.outHeight||Math.floor(a)!==a))for(let o=0;o<b;o+=_){let l=(s+o)/m;if(l<0||l>=u.outWidth||Math.floor(l)!==l)continue;let f=+(v*y*b-1-d.get(e,r,a,l,t)===n*y*b+i*b+o);if(f===0)continue;let p=T.get(e,r,a,l,t);c+=p*f}}}w.set(c,e,n,r,i,t)}return n.makeTensorInfo(w.shape,w.dtype,w.values)}var WA={kernelName:on,backendName:`cpu`,kernelFunc:UA};function GA(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a,output:o}=t,s=a;X([a,o],`maxPoolGrad`);let{filterSize:c,strides:l,pad:u,dimRoundingMode:d}=r,f=Ho(s.shape,c,l,1,u,d),p=n.data.get(s.dataId).values,m=I(f.outShape,s.dtype,MO(p,s.shape,s.dtype,f).values),h=f.strideHeight,g=f.strideWidth,_=f.dilationHeight,v=f.dilationWidth,y=f.effectiveFilterHeight,b=f.effectiveFilterWidth,x=b-1-f.padInfo.left,S=y-1-f.padInfo.top,C=I(s.shape,`float32`),w=n.data.get(i.dataId).values,T=I(i.shape,`float32`,w);for(let e=0;e<f.batchSize;++e)for(let t=0;t<f.inChannels;++t)for(let n=0;n<f.inHeight;++n)for(let r=0;r<f.inWidth;++r){let i=n-S,a=r-x,o=0;for(let n=0;n<y;n+=_){let r=(i+n)/h;if(!(r<0||r>=f.outHeight||Math.floor(r)!==r))for(let i=0;i<b;i+=v){let s=(a+i)/g;if(s<0||s>=f.outWidth||Math.floor(s)!==s)continue;let c=+(y*b-1-m.get(e,r,s,t)===n*b+i);if(c===0)continue;let l=T.get(e,r,s,t);o+=l*c}}C.set(o,e,n,r,t)}return n.makeTensorInfo(C.shape,C.dtype,C.values)}var KA={kernelName:rn,backendName:`cpu`,kernelFunc:GA};function qA(e,t,n,r,i){let a=jO(e,t,n,O(t),i,`max`),o=MO(e,t,n,i,!0,r);return[a.values,o.values]}var JA={kernelName:sn,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{filterSize:i,strides:a,pad:o,includeBatchInIndex:s}=t,c=n;X(r,`MaxPoolWithArgmax`);let l=c.data.get(r.dataId).values,u=Ho(r.shape,i,a,[1,1],o),[d,f]=qA(l,r.shape,r.dtype,s,u),p=c.write(d,u.outShape,r.dtype),m=c.write(f,u.outShape,r.dtype);return[{dataId:p,shape:u.outShape,dtype:r.dtype},{dataId:m,shape:u.outShape,dtype:`int32`}]}};function YA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=w(a,i.shape),c=Gc(i.shape,s)[1],l=_(c),u=[],d=n.makeTensorInfo([],`float32`,new Float32Array([l]));u.push(d);let f=JT({inputs:{x:i},backend:n,attrs:{dtype:`float32`}});u.push(f);let p=tA({inputs:{a:f,b:d},backend:n});u.push(p);let m=Bk({inputs:{x:p},backend:n,attrs:{axis:a,keepDims:o}});return u.forEach(e=>n.disposeIntermediateTensorInfo(e)),m}var XA={kernelName:cn,backendName:`cpu`,kernelFunc:YA};function ZA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`min`);let s=w(a,i.shape),c=s,l=Jc(c,i.shape.length),u=i;l!=null&&(u=XE({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Xc(c.length,i.shape.length)),qc(`min`,c,u.shape.length);let[d,f]=Gc(u.shape,c),p=_(f),m=he(_(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];(Number.isNaN(r)||r<n)&&(n=r)}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=Kc(d,s),t=cO({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var QA={kernelName:`Min`,backendName:`cpu`,kernelFunc:ZA};function $A(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,mode:o}=r;X(i,`mirrorPad`);let s=a.map((e,t)=>e[0]+i.shape[t]+e[1]),c=a.map(e=>e[0]),l=a.map((e,t)=>e[0]+i.shape[t]),u=o===`reflect`?0:1,d=n.data.get(i.dataId).values,f=i.shape.length,p=O(i.shape),m=_(s),h=s.length,g=O(s),v=E(i.dtype,m);for(let e=0;e<m;e++){let t=ye(e,h,g);for(let e=0;e<h;e++)t[e]<c[e]?t[e]=c[e]*2-t[e]-u:t[e]>=l[e]&&(t[e]=(l[e]-1)*2-t[e]+u);t=t.map((e,t)=>e-c[t]);let n=ve(t,f,p);v[e]=d[n]}return{dataId:n.write(v,s,i.dtype),shape:s,dtype:i.dtype}}var ej={kernelName:un,backendName:`cpu`,kernelFunc:$A},tj={kernelName:`Mod`,backendName:`cpu`,kernelFunc:XT(`Mod`,zT(((e,t)=>{let n=e%t;return e<0&&t<0||e>=0&&t>=0?n:(n+t)%t})))};function nj(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{dim:a}=r,o=i.shape.length,s=a;if(s===-1&&(s=o-1),s!==o-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${o} and dim was ${s}`);let c=w([s],i.shape),l=LA({inputs:{x:i},backend:n,attrs:{reductionIndices:c,keepDims:!1}}),u=Kc(l.shape,c),d=cO({inputs:{x:l},backend:n,attrs:{shape:u}}),f=HD({inputs:{a:i,b:d},backend:n}),p=hE({inputs:{x:f},backend:n}),m=Bk({inputs:{x:p},backend:n,attrs:{axis:c,keepDims:!1}}),h=cO({inputs:{x:m},backend:n,attrs:{shape:u}}),g=tA({inputs:{a:p,b:h},backend:n});return n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),g}var rj={kernelName:Qn,backendName:`cpu`,kernelFunc:nj};function ij(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{numSamples:a,seed:o,normalized:s}=r;X(i,`multinomial`);let c=s?i:nj({inputs:{logits:i},backend:n,attrs:{dim:-1}}),l=c.shape[0],u=c.shape[1],d=n.data.get(c.dataId).values,f=[l,a],p=he(_(f),`int32`);for(let e=0;e<l;++e){let t=e*u,n=new Float32Array(u-1);n[0]=d[t];for(let e=1;e<n.length;++e)n[e]=n[e-1]+d[t+e];let r=cd.alea(o.toString()),i=e*a;for(let e=0;e<a;++e){let t=r();p[i+e]=n.length;for(let r=0;r<n.length;r++)if(t<n[r]){p[i+e]=r;break}}}return s||n.disposeIntermediateTensorInfo(c),n.makeTensorInfo(f,`int32`,p)}var aj={kernelName:dn,backendName:`cpu`,kernelFunc:ij},oj=vp;function sj(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=r;X(i,`NonMaxSuppression`);let l=n.data.get(i.dataId).values,u=n.data.get(a.dataId).values,{selectedIndices:d}=oj(l,u,o,s,c);return n.makeTensorInfo([d.length],`int32`,new Int32Array(d))}var cj={kernelName:mn,backendName:`cpu`,kernelFunc:sj},lj=yp;function uj(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,padToMaxOutputSize:l}=r;X(i,`NonMaxSuppressionPadded`);let u=n.data.get(i.dataId).values,d=n.data.get(a.dataId).values,{selectedIndices:f,validOutputs:p}=lj(u,d,o,s,c,l);return[n.makeTensorInfo([f.length],`int32`,new Int32Array(f)),n.makeTensorInfo([],`int32`,new Int32Array([p]))]}var dj={kernelName:hn,backendName:`cpu`,kernelFunc:uj},fj=bp;function pj(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=r;X(i,`NonMaxSuppressionWithScore`);let u=n.data.get(i.dataId).values,d=n.data.get(a.dataId).values,{selectedIndices:f,selectedScores:p}=fj(u,d,o,s,c,l);return[n.makeTensorInfo([f.length],`int32`,new Int32Array(f)),n.makeTensorInfo([p.length],`float32`,new Float32Array(p))]}var mj={kernelName:gn,backendName:`cpu`,kernelFunc:pj};function hj(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i}=t,{dtype:a,depth:o,onValue:s,offValue:c}=r;X(i,`oneHot`);let l=_(i.shape),u=new Float32Array(l*o);u.fill(c);let d=n.data.get(i.dataId).values;for(let e=0;e<l;++e)d[e]>=0&&d[e]<o&&(u[e*o+d[e]]=s);return n.makeTensorInfo([...i.shape,o],a,u)}var gj={kernelName:vn,backendName:`cpu`,kernelFunc:hj};function _j(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`zerosLike is not supported for string tensors`);if(r.dtype===`complex64`){let e=GT({inputs:{input:r},backend:n}),t=_j({inputs:{x:e},backend:n}),i=$O({inputs:{input:r},backend:n}),a=_j({inputs:{x:i},backend:n}),o=BT({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return uA({backend:n,attrs:{shape:r.shape,value:0,dtype:r.dtype}})}var vj={kernelName:yr,backendName:`cpu`,kernelFunc:_j};function yj(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`onesLike is not supported for string tensors`);if(r.dtype===`complex64`){let e=GT({inputs:{input:r},backend:n}),t=yj({inputs:{x:e},backend:n}),i=$O({inputs:{input:r},backend:n}),a=_j({inputs:{x:i},backend:n}),o=BT({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return uA({backend:n,attrs:{shape:r.shape,value:1,dtype:r.dtype}})}var bj={kernelName:_n,backendName:`cpu`,kernelFunc:yj};function xj(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r;if(t.length===1)return $k({inputs:{input:t[0]},backend:n,attrs:{dim:i}});let a=t[0].shape,o=t[0].dtype;t.forEach(e=>{h(a,e.shape,`All tensors passed to stack must have matching shapes`),m(o===e.dtype,()=>`All tensors passed to stack must have matching dtypes`)});let s=[],c=tk({inputs:t.map(e=>{let t=$k({inputs:{input:e},backend:n,attrs:{dim:i}});return s.push(t),t}),backend:n,attrs:{axis:i}});return s.forEach(e=>n.disposeIntermediateTensorInfo(e)),c}var Sj={kernelName:yn,backendName:`cpu`,kernelFunc:xj};function Cj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,constantValue:o}=r;X(i,`pad`);let s=a.map((e,t)=>e[0]+i.shape[t]+e[1]),c=a.map(e=>e[0]),l=n.data.get(i.dataId).values,u=_(i.shape),d=i.shape.length,f=O(i.shape),p=_(s),m=s.length,h=O(s),g=E(i.dtype,p);o!==0&&g.fill(o);for(let e=0;e<u;e++){let t=ve(ye(e,d,f).map((e,t)=>e+c[t]),m,h);g[t]=l[e]}return{dataId:n.write(g,s,i.dtype),shape:s,dtype:i.dtype}}var wj={kernelName:bn,backendName:`cpu`,kernelFunc:Cj},Tj={kernelName:`Pow`,backendName:`cpu`,kernelFunc:XT(`Pow`,zT((e,t)=>e**+t))};function Ej(e){let{inputs:t,backend:n,attrs:r}=e,{paramsNestedSplits:i,paramsDenseValues:a,indices:o}=t,{outputRaggedRank:s}=r,c=i.map(e=>n.data.get(e.dataId).values),l=i.map(e=>e.shape),u=n.data.get(a.dataId).values,d=n.data.get(o.dataId).values,[f,p,m]=cD(c,l,u,a.shape,a.dtype,d,o.shape,s),h=f.map(e=>n.makeTensorInfo([e.length],`int32`,e)),g=n.makeTensorInfo(m,a.dtype,p);return h.concat([g])}var Dj={kernelName:Cn,backendName:`cpu`,kernelFunc:Ej};function Oj(e){let{inputs:t,backend:n}=e,{starts:r,limits:i,deltas:a}=t,o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=uD(o,r.shape,r.dtype,s,i.shape,c,a.shape);return[n.makeTensorInfo([l.length],`int32`,l),n.makeTensorInfo([u.length],r.dtype,u)]}var kj={kernelName:wn,backendName:`cpu`,kernelFunc:Oj};function Aj(e){let{inputs:t,backend:n,attrs:r}=e,{shape:i,values:a,defaultValue:o,rowPartitionTensors:s}=t,{rowPartitionTypes:c}=r,l=n.data.get(i.dataId).values,u=n.data.get(a.dataId).values,d=n.data.get(o.dataId).values,f=s.map(e=>n.data.get(e.dataId).values),p=s.map(e=>e.shape),[m,h]=hD(l,i.shape,u,a.shape,a.dtype,d,o.shape,f,p,c);return n.makeTensorInfo(m,a.dtype,h)}var jj={kernelName:Tn,backendName:`cpu`,kernelFunc:Aj};function Mj(e){let{backend:t,attrs:n}=e,{start:r,stop:i,dtype:a,step:o}=n,s=gD(r,i,o,a);return t.makeTensorInfo([s.length],a,s)}var Nj={kernelName:En,backendName:`cpu`,kernelFunc:Mj},Pj={kernelName:On,backendName:`cpu`,kernelFunc:oE(On,e=>1/e)};function Fj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r;X(i,`resizeBilinear`);let c=O(i.shape),[l,u]=s,[d,f,p,m]=i.shape,h=n.data.get(i.dataId).values,g=new Float32Array(_([d,l,u,m])),v=[a&&l>1?f-1:f,a&&u>1?p-1:p],y=[a&&l>1?l-1:l,a&&u>1?u-1:u],b=0,x=v[0]/y[0],S=v[1]/y[1];for(let e=0;e<d;e++)for(let t=0;t<l;t++){let n;n=o?x*(t+.5)-.5:x*t;let r=Math.max(0,Math.floor(n)),i=n-r,a=Math.min(f-1,Math.ceil(n)),s=e*c[0]+r*c[1],l=e*c[0]+a*c[1];for(let e=0;e<u;e++){let t;t=o?S*(e+.5)-.5:S*e;let n=Math.max(0,Math.floor(t)),r=t-n,a=Math.min(p-1,Math.ceil(t)),u=s+n*c[2],d=l+n*c[2],f=s+a*c[2],_=l+a*c[2];for(let e=0;e<m;e++){let t=h[u+e],n=h[d+e],a=h[f+e],o=h[_+e],s=t+(a-t)*r,c=s+(n+(o-n)*r-s)*i;g[b++]=c}}}return n.makeTensorInfo([d,l,u,m],`float32`,g)}var Ij={kernelName:Nn,backendName:`cpu`,kernelFunc:Fj};function Lj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r;X([a,i],`resizeBilinearGrad`);let s=O(i.shape),[c,l,u,d]=i.shape,[,f,p]=a.shape,m=new Float32Array(c*l*u*d),h=[o&&f>1?l-1:l,o&&p>1?u-1:u],g=[o&&f>1?f-1:f,o&&p>1?p-1:p],_=h[0]/g[0],v=h[1]/g[1],y=n.data.get(a.dataId).values,b=0;for(let e=0;e<c;e++){let t=e*s[0];for(let e=0;e<f;e++){let n=e*_,r=Math.floor(n),i=Math.min(Math.ceil(n),l-1),a=t+r*s[1],o=t+i*s[1],c=n-r,f=1-c;for(let e=0;e<p;e++){let t=e*v,n=Math.floor(t),r=Math.min(Math.ceil(t),u-1),i=t-n,l=1-i,p=a+n*s[2],h=a+r*s[2],g=o+n*s[2],_=o+r*s[2],x=f*l,S=f*i,C=c*l,w=c*i;for(let e=0;e<d;e++){let t=y[b++];m[p+e]+=t*x,m[h+e]+=t*S,m[g+e]+=t*C,m[_+e]+=t*w}}}}return n.makeTensorInfo([c,u,l,d],`float32`,m)}var Rj={kernelName:Pn,backendName:`cpu`,kernelFunc:Lj};function zj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r;X(i,`resizeNearestNeighbor`);let c=O(i.shape),[l,u]=s,[d,f,p,m]=i.shape,h=n.data.get(i.dataId).values,g=new Float32Array(d*l*u*m),_=[a&&l>1?f-1:f,a&&u>1?p-1:p],v=[a&&l>1?l-1:l,a&&u>1?u-1:u],y=_[0]/v[0],b=_[1]/v[1],x=0;for(let e=0;e<d;e++){let t=e*c[0];for(let e=0;e<l;e++){let n=o?y*(e+.5):y*e,r=Math.min(f-1,a?Math.round(n):Math.floor(n));o&&(r=Math.max(0,r));let i=t+r*c[1];for(let e=0;e<u;e++){let t=o?b*(e+.5):b*e,n=Math.min(p-1,a?Math.round(t):Math.floor(t));o&&(n=Math.max(0,n));let r=i+n*c[2];for(let e=0;e<m;e++){let t=h[r+e];g[x++]=t}}}}return n.makeTensorInfo([d,l,u,m],i.dtype,g)}var Bj={kernelName:jn,backendName:`cpu`,kernelFunc:zj};function Vj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r;X([a,i],`resizeNearestNeighborGrad`);let s=O(i.shape),c=O(a.shape),[l,u,d,f]=i.shape,[,p,m]=a.shape,h=new Float32Array(l*u*d*f),g=n.data.get(a.dataId).values,_=[o&&p>1?u-1:u,o&&m>1?d-1:d],v=[o&&p>1?p-1:p,o&&m>1?m-1:m],y=_[0]/v[0],b=_[1]/v[1],x=1/y,S=1/b,C=Math.ceil(x)*2+2,w=Math.ceil(S)*2+2;for(let e=0;e<l;e++){let t=e*s[0];for(let e=0;e<u;e++){let n=t+e*s[1],r=Math.floor(e*x),i=Math.floor(r-C/2);for(let r=0;r<d;r++){let a=n+r*s[2],l=Math.floor(r*S),_=Math.floor(l-w/2);for(let n=0;n<f;n++){let s=0;for(let a=0;a<C;a++){let l=a+i;if(l<0||l>=p)continue;let f=t+l*c[1],h=l*y,v=Math.min(u-1,o?Math.round(h):Math.floor(h));if(e===v)for(let e=0;e<w;e++){let t=e+_;if(t<0||t>=m)continue;let i=f+t*c[2],a=t*b,l=Math.min(d-1,o?Math.round(a):Math.floor(a));r===l&&(s+=g[i+n])}}h[a+n]=s}}}}return n.makeTensorInfo(i.shape,i.dtype,h)}var Hj={kernelName:Mn,backendName:`cpu`,kernelFunc:Vj};function Uj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dims:a}=r;X(i,`reverse`);let o=i.shape.length,s=w(a,i.shape);if(o===0)return UT({inputs:{x:i},backend:n});let c=new Ci(i.shape,i.dtype),l=n.bufferSync(i);for(let e=0;e<c.size;e++){let t=c.indexToLoc(e),n=t.slice();s.forEach(e=>n[e]=i.shape[e]-1-n[e]),c.set(l.get(...n),...t)}return n.makeTensorInfo(c.shape,c.dtype,c.values)}var Wj={kernelName:In,backendName:`cpu`,kernelFunc:Uj},Gj={kernelName:Sr,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,{radians:i,fillValue:a,center:o}=t,s=n,c=E(r.dtype,_(r.shape)),[l,u,d,f]=r.shape,[p,m]=Km(o,u,d),h=Math.sin(i),g=Math.cos(i),v=s.data.get(r.dataId).values;for(let e=0;e<l;e++){let t=e*d*u*f;for(let e=0;e<u;e++){let n=d*f*e;for(let r=0;r<d;r++){let i=r*f;for(let o=0;o<f;o++){let s=[l,e,r,o],_=s[2],y=s[1],b=(_-p)*g-(y-m)*h,x=(_-p)*h+(y-m)*g;b=Math.round(b+p),x=Math.round(x+m);let S=a;if(typeof a!=`number`&&(S=o===3?255:a[o]),b>=0&&b<d&&x>=0&&x<u){let e=d*f*x,n=b*f;S=v[t+e+n+o]}let C=t+n+i+o;c[C]=S}}}}return{dataId:s.write(c,r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}},Kj={kernelName:Ln,backendName:`cpu`,kernelFunc:oE(Ln,e=>{let t=Math.floor(e);return e-t<.5?Math.floor(e):e-t>.5?Math.ceil(e):t%2==0?t:t+1})};function qj(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i,updates:a}=t,{shape:o}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=Cf(a,i,o),f=yD(n.bufferSync(i),n.bufferSync(a),o,d,l,c,s,u,0,!0);return n.makeTensorInfo(o,f.dtype,f.values)}var Jj={kernelName:zn,backendName:`cpu`,kernelFunc:qj};function Yj(e,t){let n=0,r=e.length,i=0;for(;n<r;)i=Math.floor((n+r)/2),e[i]<t?n=i+1:r=i;return r}function Xj(e,t){let n=0,r=e.length,i=0;for(;n<r;)i=Math.floor((n+r)/2),e[i]<=t?n=i+1:r=i;return r}function Zj(e,t,n,r,i,a){let o=D(`int32`,n*i);for(let s=0;s<n;++s){let n=e.slice(s*r,(s+1)*r),c=s*i;for(let e=0;e<i;++e)o[c+e]=a===`left`?Yj(n,t[e+c]):Xj(n,t[e+c])}return o}function Qj(e){let{inputs:t,backend:n,attrs:r}=e,{sortedSequence:i,values:a}=t,{side:o}=r,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,l=Zj(s,c,i.shape[0],i.shape[1],a.shape[1],o);return n.makeTensorInfo(a.shape,`int32`,l)}var $j={kernelName:Vn,backendName:`cpu`,kernelFunc:Qj};function eM(e){let{inputs:t,backend:n}=e,{condition:r,t:i,e:a}=t;X([r,i,a],`select`);let o=r.shape.length,s=n.data.get(r.dataId).values,c=n.data.get(i.dataId).values,l=n.data.get(a.dataId).values,u=Ii(i.dtype,a.dtype),d=he(_(i.shape),u),f=0,p=o===0||o>1||i.shape.length===1?1:_(i.shape.slice(1));for(let e=0;e<s.length;e++)for(let t=0;t<p;t++)s[e]===1?d[f++]=c[e]:d[f++]=l[e];return n.makeTensorInfo(i.shape,u,d)}var tM={kernelName:Hn,backendName:`cpu`,kernelFunc:eM},nM=Qm,rM=$m,iM={kernelName:Un,backendName:`cpu`,kernelFunc:oE(Un,e=>e>=0?rM*e:nM*(Math.exp(e)-1))},aM={kernelName:Kn,backendName:`cpu`,kernelFunc:oE(Kn,e=>e<0?-1:+(e>0))},oM={kernelName:`Sin`,backendName:`cpu`,kernelFunc:oE(`Sin`,e=>Math.sin(e))},sM={kernelName:Gn,backendName:`cpu`,kernelFunc:oE(Gn,e=>Math.sinh(e))},cM=Math.log(1.1920928955078125e-7)+2,lM={kernelName:Jn,backendName:`cpu`,kernelFunc:oE(Jn,e=>{let t=e>-cM,n=e<cM,r=Math.exp(e),i;return i=n?r:t?e:Math.log(1+r),i})};function uM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,paddings:o}=r;X([i],`spaceToBatchND`);let s=_(a),c=[[0,0]];c.push(...o);for(let e=1+a.length;e<i.shape.length;++e)c.push([0,0]);let l=wj.kernelFunc({inputs:{x:i},backend:n,attrs:{paddings:c,constantValue:0}}),u=qm(l.shape,a,s,!1),d=Jm(u.length,a.length,!1),f=Ym(l.shape,a,s,!1),p=cO({inputs:{x:l},backend:n,attrs:{shape:u}}),m=XE({inputs:{x:p},backend:n,attrs:{perm:d}}),h=cO({inputs:{x:m},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),h}var dM={kernelName:Xn,backendName:`cpu`,kernelFunc:uM};function fM(e){let{inputs:t,backend:n}=e,{indices:r,values:i,denseShape:a,defaultValue:o}=t;if(a.shape.length!==1)throw Error(`Dense shape must be a vector, saw:
        ${a.shape}`);if(r.shape.length!==2)throw Error(`Indices must be a matrix, saw:
        ${r.shape}`);if(i.shape.length!==1)throw Error(`Values must be a vector, saw:
        ${i.shape}`);if(o.shape.length!==0)throw Error(`Default value must be a scalar, saw:
        ${o.shape}`);let s=n.data.get(r.dataId).values,c=n.data.get(i.dataId).values,l=n.data.get(a.dataId).values,u=n.data.get(o.dataId).values[0],[d,f,p,m,h]=ED(s,r.shape,r.dtype,c,i.dtype,l,u);return[n.makeTensorInfo(f,r.dtype,d),n.makeTensorInfo([f[0]],i.dtype,p),n.makeTensorInfo([m.length],`bool`,new Uint8Array(m.map(e=>Number(e)))),n.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}var pM={kernelName:$n,backendName:`cpu`,kernelFunc:fM};function mM(e){let{inputs:t,backend:n}=e,{inputIndices:r,inputShape:i,newShape:a}=t;if(r.shape.length!==2)throw Error(`Input indices should be a matrix but received shape
        ${r.shape}`);if(i.shape.length!==1)throw Error(`Input shape should be a vector but received shape
        ${i.shape}`);if(a.shape.length!==1)throw Error(`Target shape should be a vector but received shape ${a.shape}`);let o=Array.from(n.data.get(i.dataId).values),s=n.data.get(r.dataId).values,c=Array.from(n.data.get(a.dataId).values),[l,u,d]=DD(s,r.shape,r.dtype,o,c);return[n.makeTensorInfo(u,r.dtype,l),n.makeTensorInfo([d.length],a.dtype,new Int32Array(d))]}var hM={kernelName:er,backendName:`cpu`,kernelFunc:mM};function gM(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
          ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
          ${a.shape}`);if(i.shape[0]!==a.shape[0])throw Error(`segmentIds and indices should have same size.`);let o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=OD(o,r.shape,r.dtype,s,c,!0);return n.makeTensorInfo(u,r.dtype,l)}var _M={kernelName:tr,backendName:`cpu`,kernelFunc:gM};function vM(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
         ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
         ${a.shape}`);if(i.shape[0]!==a.shape[0])throw Error(`segmentIds and indices should have same size.`);let o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=OD(o,r.shape,r.dtype,s,c);return n.makeTensorInfo(u,r.dtype,l)}var yM={kernelName:nr,backendName:`cpu`,kernelFunc:vM};function bM(e){let{inputs:t,backend:n,attrs:r}=e,{sparseIndices:i,sparseValues:a,defaultValue:o}=t,{outputShape:s}=r,{sliceRank:c,numUpdates:l,sliceSize:u,strides:d,outputSize:f}=Cf(a,i,s),p=n.bufferSync(i),m;switch(a.dtype){case`bool`:m=yD(p,n.bufferSync(a),s,f,u,l,c,d,!!n.data.get(o.dataId).values[0],!1);break;case`float32`:{let e=n.bufferSync(a),t=n.data.get(o.dataId).values[0];m=yD(p,e,s,f,u,l,c,d,t,!1);break}case`int32`:{let e=n.bufferSync(a),t=n.data.get(o.dataId).values[0];m=yD(p,e,s,f,u,l,c,d,t,!1);break}case`string`:m=yD(p,n.bufferSync(a),s,f,u,l,c,d,oi(n.data.get(o.dataId).values[0]),!1);break;default:throw Error(`Unsupported type ${a.dtype}`)}return n.makeTensorInfo(s,m.dtype,m.values)}var xM={kernelName:rr,backendName:`cpu`,kernelFunc:bM};function SM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{numOrSizeSplits:a,axis:o}=r,s=w(o,i.shape)[0],c=wh(i,a,s),l=Array(i.shape.length).fill(0),u=i.shape.slice();return c.map(e=>{let t=[...u];t[s]=e;let r=wD({inputs:{x:i},backend:n,attrs:{begin:l,size:t}});return l[s]+=e,r})}var CM={kernelName:Zn,backendName:`cpu`,kernelFunc:SM},wM={kernelName:ar,backendName:`cpu`,kernelFunc:({inputs:e,backend:t})=>{let{x:n}=e,r=t;X(n,`square`);let i=r.data.get(n.dataId).values,a=new Float32Array(i.length);for(let e=0;e<i.length;++e){let t=i[e];a[e]=t*t}return{dataId:r.write(a,n.shape,n.dtype),shape:n.shape,dtype:n.dtype}}},TM={kernelName:br,backendName:`cpu`,kernelFunc:oE(br,(e,t)=>isNaN(e)?NaN:e>0?1:t.alpha)};function EM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,end:o,strides:s,beginMask:c,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:f}=r;X(i,`stridedSlice`);let{finalShapeSparse:p,finalShape:h,isIdentity:g,sliceDim0:_,isSimpleSlice:v,begin:y,end:b,strides:x}=Mm(i.shape,a,o,s,c,l,u,d,f),S;if(g)S=cO({inputs:{x:i},backend:n,attrs:{shape:h}});else if(_||v){m(i.shape.length>=1,()=>`Input must have rank at least 1, got: ${i.shape.length}`);let e=ym(y,b,x),t=wD({inputs:{x:i},backend:n,attrs:{begin:y,size:e}});S=cO({inputs:{x:t},backend:n,attrs:{shape:h}}),n.disposeIntermediateTensorInfo(t)}else{let e=FD(p,n.bufferSync(i),x,y);S=n.makeTensorInfo(h,e.dtype,e.values)}return S}var DM={kernelName:sr,backendName:`cpu`,kernelFunc:EM};function OM(e){let{inputs:t,backend:n,attrs:r}=e,{separator:i,nGramWidths:a,leftPad:o,rightPad:s,padWidth:c,preserveShortSequences:l}=r,{data:u,dataSplits:d}=t,f=n.data.get(u.dataId).values,p=n.data.get(d.dataId).values,[m,h]=LD(f,p,i,a,o,s,c,l);return[n.makeTensorInfo([m.length],`string`,m),n.makeTensorInfo(d.shape,`int32`,h)]}var kM={kernelName:cr,backendName:`cpu`,kernelFunc:OM};function AM(e){let{inputs:t,backend:n,attrs:r}=e,{skipEmpty:i}=r,{input:a,delimiter:o}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(a.shape.length!==1)throw Error(`Input must be a vector, got shape: ${a.shape}`);if(o.shape.length!==0)throw Error(`Delimiter must be a scalar, got shape: ${o.shape}`);let s=n.data.get(a.dataId).values,c=n.data.get(o.dataId).values[0],[l,u,d]=zD(s,c,i),f=u.length;return[n.makeTensorInfo([f,2],`int32`,l),n.makeTensorInfo([f],`string`,u),n.makeTensorInfo([2],`int32`,new Int32Array(d))]}var jM={kernelName:lr,backendName:`cpu`,kernelFunc:AM};function MM(e){let{inputs:t,backend:n,attrs:r}=e,{numBuckets:i}=r,{input:a}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(i<=0)throw Error(`Number of buckets must be at least 1`);let o=n.data.get(a.dataId).values,s=BD(o,i);return n.makeTensorInfo(a.shape,`int32`,s)}var NM={kernelName:ur,backendName:`cpu`,kernelFunc:MM},PM={kernelName:`Tan`,backendName:`cpu`,kernelFunc:oE(`Tan`,e=>Math.tan(e))},FM={kernelName:dr,backendName:`cpu`,kernelFunc:oE(dr,e=>Math.tanh(e))};function IM(e){let{inputs:t,backend:n}=e,{tensor:r,indices:i,updates:a}=t,{sliceRank:o,numUpdates:s,sliceSize:c,strides:l,outputSize:u}=Cf(a,i,r.shape),d=n.bufferSync(i),f=n.bufferSync(a),p=n.bufferSync(r),m=yD(d,f,r.shape,u,c,s,o,l,p,!1);return n.makeTensorInfo(r.shape,m.dtype,m.values)}var LM={kernelName:Bn,backendName:`cpu`,kernelFunc:IM};function RM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reps:a}=r;X(i,`tile`);let o=WD(n.bufferSync(i),a);return n.makeTensorInfo(o.shape,o.dtype,o.values)}var zM={kernelName:fr,backendName:`cpu`,kernelFunc:RM};function BM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{k:a,sorted:o}=r;X(i,`topk`);let s=n.data.get(i.dataId).values,[c,l]=qD(s,i.shape,i.dtype,a,o);return[n.makeTensorInfo(c.shape,c.dtype,c.values),n.makeTensorInfo(l.shape,l.dtype,l.values)]}var VM={kernelName:pr,backendName:`cpu`,kernelFunc:BM};function HM(e){let{inputs:t,attrs:n,backend:r}=e,{image:i,transforms:a}=t,{interpolation:o,fillMode:s,fillValue:c,outputShape:l}=n,[u,d,f,p]=i.shape,[m,h]=l??[d,f],g=[u,m,h,p],v=O(i.shape),y=v[0],b=v[1],x=v[2],S=O(g),C=S[0],w=S[1],T=S[2],D=E(i.dtype,_(g));D.fill(c);let ee=r.data.get(i.dataId).values,te=r.data.get(a.dataId).values;for(let e=0;e<u;++e){let t=a.shape[0]===1?te:te.subarray(e*8,e*8+8);for(let n=0;n<m;++n)for(let r=0;r<h;++r)for(let i=0;i<p;++i){let a,l=t[6]*r+t[7]*n+1;if(l===0)continue;let u=(t[0]*r+t[1]*n+t[2])/l,p=(t[3]*r+t[4]*n+t[5])/l,m=WM(u,f,s),h=WM(p,d,s);switch(o){case`nearest`:a=XM(ee,d,f,y,b,x,e,h,m,i,c);break;case`bilinear`:a=ZM(ee,d,f,y,b,x,e,h,m,i,c);break;default:throw Error(`Error in Transform: Expect 'nearest' or 'bilinear', but got ${o}`)}let g=e*C+n*w+r*T+i;D[g]=a}return r.makeTensorInfo(g,i.dtype,D)}return{dataId:r.write(D,g,i.dtype),shape:i.shape,dtype:i.dtype}}var UM={kernelName:mr,backendName:`cpu`,kernelFunc:HM};function WM(e,t,n){switch(n){case`reflect`:return GM(e,t);case`wrap`:return KM(e,t);case`nearest`:return JM(e,t);default:return qM(e,t)}}function GM(e,t){let n=e;if(n<0)if(t<=1)n=0;else{let e=2*t;n<e&&(n=e*Math.trunc(-n/e)+n),n=n<-t?n+e:-n-1}else if(n>t-1)if(t<=1)n=0;else{let e=2*t;n-=e*Math.trunc(n/e),n>=t&&(n=e-n-1)}return u(0,n,t-1)}function KM(e,t){let n=e;if(n<0)if(t<=1)n=0;else{let e=t-1;n+=t*(Math.trunc(-n/e)+1)}else if(n>t-1)if(t<=1)n=0;else{let e=t-1;n-=t*Math.trunc(n/e)}return u(0,n,t-1)}function qM(e,t){return e}function JM(e,t){return u(0,e,t-1)}function YM(e,t,n,r,i,a,o,s,c,l,u){let d=o*r+s*i+c*a+l;return 0<=s&&s<t&&0<=c&&c<n?e[d]:u}function XM(e,t,n,r,i,a,o,s,c,l,u){return YM(e,t,n,r,i,a,o,Math.round(s),Math.round(c),l,u)}function ZM(e,t,n,r,i,a,o,s,c,l,u){let d=Math.floor(s),f=Math.floor(c),p=d+1,m=f+1,h=(m-c)*YM(e,t,n,r,i,a,o,d,f,l,u)+(c-f)*YM(e,t,n,r,i,a,o,d,m,l,u),g=(m-c)*YM(e,t,n,r,i,a,o,p,f,l,u)+(c-f)*YM(e,t,n,r,i,a,o,p,m,l,u);return(p-s)*h+(s-d)*g}function QM(e){let{inputs:t,attrs:n,backend:r}=e,{axis:i}=n,{x:a}=t;X(a,`unique`);let o=r.data.get(a.dataId).values,{outputValues:s,outputShape:c,indices:l}=JD(o,i,a.shape,a.dtype);return[r.makeTensorInfo(c,a.dtype,s),r.makeTensorInfo([l.length],`int32`,l)]}var $M={kernelName:gr,backendName:`cpu`,kernelFunc:QM};function eN(e){let{inputs:t,backend:n,attrs:r}=e,{value:i}=t,{axis:a}=r;a<0&&(a+=i.shape.length);let o=i.shape.length,s=i.shape[a],c=Array(o-1),l=0;for(let e=0;e<o;e++)e!==a&&(c[l++]=i.shape[e]);let u=Array(o).fill(0),d=i.shape.slice();d[a]=1;let f=Array(s);for(let e=0;e<f.length;e++){u[a]=e;let t=wD({inputs:{x:i},backend:n,attrs:{begin:u,size:d}});f[e]=cO({inputs:{x:t},backend:n,attrs:{shape:c}}),n.disposeIntermediateTensorInfo(t)}return f}var tN={kernelName:_r,backendName:`cpu`,kernelFunc:eN};function nN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,segmentIds:a}=t,{numSegments:o}=r;X(i,`unsortedSegmentSum`);let s=i.shape.length,c=a.shape.length,l=[],u=[],d=s-c,f=a;for(let e=0;e<d;++e){let t=$k({inputs:{input:f},backend:n,attrs:{dim:e+1}});f=t,u.push(t)}for(let e=0;e<o;++e){let t=ti(e,`int32`),r=n.makeTensorInfo([],`int32`,t),a=fE({inputs:{a:r,b:f},backend:n}),o=JT({inputs:{x:a},backend:n,attrs:{dtype:`float32`}}),s=HE({inputs:{a:o,b:i},backend:n}),c=Bk({inputs:{x:s},backend:n,attrs:{axis:0,keepDims:!1}});l.push(c),u.push(r),u.push(a),u.push(o),u.push(s),u.push(c)}let p=xj({inputs:l,backend:n,attrs:{axis:0}});return u.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var rN=[pO,RT,mO,hO,eE,_O,yO,xO,CO,TO,EO,DO,OO,kO,AO,IO,RO,BO,HO,dO,WO,KO,JO,iE,XO,YT,lE,ZO,VT,QO,nk,ik,ok,ck,uk,fk,mk,hk,gk,vk,bk,Sk,wk,Ek,Ok,Ak,Mk,Pk,Fk,Ik,Lk,zk,Uk,ZD,Gk,pE,Qk,gE,eA,vE,lA,dA,pA,bE,SE,hA,_A,yA,xA,EE,OE,WT,CA,ek,wA,TA,EA,$D,AE,ME,OA,FE,kA,AA,jA,MA,PA,IA,RA,RE,BA,HA,WA,KA,JA,XA,QA,BE,ej,tj,aj,UE,KE,cj,dj,mj,JE,gj,bj,Sj,wj,Tj,nO,eD,Dj,kj,jj,Nj,KT,nA,Pj,iO,oO,lO,Ij,Rj,Bj,Hj,Wj,Gj,Kj,vD,Jj,$j,tM,iM,SD,aM,oM,sM,TD,rj,lM,dM,pM,hM,_M,yM,xM,CM,AD,wM,MD,PD,TM,DM,kM,jM,NM,UD,Vk,PM,FM,LM,zM,VM,UM,ZE,$M,tN,{kernelName:vr,backendName:`cpu`,kernelFunc:nN},vj];for(let e of rN)Nr(e);var iN={},aN={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function oN(e,t){iN[e]=t}function sN(e,t){if(!(e in iN)||t!=null){let n=lN(e,t);if(n!==null)iN[e]=n;else return console.log(`Could not get context for WebGL version`,e),null}let n=iN[e];return n==null||n.isContextLost()?(delete iN[e],sN(e)):(n.disable(n.DEPTH_TEST),n.disable(n.STENCIL_TEST),n.disable(n.BLEND),n.disable(n.DITHER),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SAMPLE_COVERAGE),n.enable(n.SCISSOR_TEST),n.enable(n.CULL_FACE),n.cullFace(n.BACK),iN[e])}function cN(e){if(!k().getBool(`IS_SAFARI`)&&typeof OffscreenCanvas<`u`&&e===2)return new OffscreenCanvas(300,150);if(typeof document<`u`)return document.createElement(`canvas`);throw Error(`Cannot create a canvas in this context`)}function lN(e,t){if(e!==1&&e!==2)throw Error(`Cannot get WebGL rendering context, WebGL is disabled.`);let n=t??cN(e);return n.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),delete iN[e]},!1),k().getBool(`SOFTWARE_WEBGL_ENABLED`)&&(aN.failIfMajorPerformanceCaveat=!1),e===1?n.getContext(`webgl`,aN)||n.getContext(`experimental-webgl`,aN):n.getContext(`webgl2`,aN)}var uN;(function(e){e[e.DENSE=0]=`DENSE`,e[e.SHARED_BATCH=1]=`SHARED_BATCH`})(uN||={});var dN;(function(e){e[e.RENDER=0]=`RENDER`,e[e.UPLOAD=1]=`UPLOAD`,e[e.PIXELS=2]=`PIXELS`,e[e.DOWNLOAD=3]=`DOWNLOAD`})(dN||={});var fN;(function(e){e[e.UNPACKED_FLOAT16=0]=`UNPACKED_FLOAT16`,e[e.UNPACKED_FLOAT32=1]=`UNPACKED_FLOAT32`,e[e.PACKED_4X1_UNSIGNED_BYTE=2]=`PACKED_4X1_UNSIGNED_BYTE`,e[e.PACKED_2X2_FLOAT32=3]=`PACKED_2X2_FLOAT32`,e[e.PACKED_2X2_FLOAT16=4]=`PACKED_2X2_FLOAT16`})(fN||={});function pN(e,t){return[t,e]}function mN(e,t){return e*t}function hN(e){let t=_(e);return b(Math.ceil(t/4))}function gN(e,t){return[Math.max(1,Math.ceil(t/2)),Math.max(1,Math.ceil(e/2))]}function _N(e,t){let[n,r]=gN(e,t);return n*r*4}function vN(e,t){let n=e,r,i,a,o,s,c,l,u,d,f;return k().getNumber(`WEBGL_VERSION`)===2?(r=n.R32F,i=n.R16F,a=n.RGBA16F,o=n.RGBA32F,s=n.RED,l=4,u=1,d=n.HALF_FLOAT,f=n.FLOAT,c=n.RGBA8):(r=e.RGBA,i=e.RGBA,a=e.RGBA,o=n.RGBA,s=e.RGBA,l=4,u=4,d=t==null?null:t.HALF_FLOAT_OES,f=e.FLOAT,c=e.RGBA),{internalFormatFloat:r,internalFormatHalfFloat:i,internalFormatPackedHalfFloat:a,internalFormatPackedFloat:o,textureFormatFloat:s,downloadTextureFormat:c,downloadUnpackNumChannels:l,defaultNumChannels:u,textureTypeHalfFloat:d,textureTypeFloat:f}}function Z(e,t){let n=t();return k().getBool(`DEBUG`)&&yN(e),n}function yN(e){let t=e.getError();if(t!==e.NO_ERROR)throw Error(`WebGL Error: `+CN(e,t))}var bN=5.96e-8,xN=65504;function SN(e){return!!(k().getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)||e===0||bN<Math.abs(e)&&Math.abs(e)<xN)}function CN(e,t){switch(t){case e.NO_ERROR:return`NO_ERROR`;case e.INVALID_ENUM:return`INVALID_ENUM`;case e.INVALID_VALUE:return`INVALID_VALUE`;case e.INVALID_OPERATION:return`INVALID_OPERATION`;case e.INVALID_FRAMEBUFFER_OPERATION:return`INVALID_FRAMEBUFFER_OPERATION`;case e.OUT_OF_MEMORY:return`OUT_OF_MEMORY`;case e.CONTEXT_LOST_WEBGL:return`CONTEXT_LOST_WEBGL`;default:return`Unknown error code ${t}`}}function wN(e,t){return KN(e,()=>e.getExtension(t),`Extension "`+t+`" not supported on this browser.`)}function TN(e,t){let n=KN(e,()=>e.createShader(e.VERTEX_SHADER),`Unable to create vertex WebGLShader.`);if(Z(e,()=>e.shaderSource(n,t)),Z(e,()=>e.compileShader(n)),e.getShaderParameter(n,e.COMPILE_STATUS)===!1)throw console.log(e.getShaderInfoLog(n)),Error(`Failed to compile vertex shader.`);return n}function EN(e,t){let n=KN(e,()=>e.createShader(e.FRAGMENT_SHADER),`Unable to create fragment WebGLShader.`);if(Z(e,()=>e.shaderSource(n,t)),Z(e,()=>e.compileShader(n)),k().get(`ENGINE_COMPILE_ONLY`))return n;if(e.getShaderParameter(n,e.COMPILE_STATUS)===!1)throw ON(t,e.getShaderInfoLog(n)),Error(`Failed to compile fragment shader.`);return n}var DN=/ERROR: [0-9]+:([0-9]+):/g;function ON(e,t){let n=DN.exec(t);if(n==null){console.log(`Couldn't parse line number in error: ${t}`),console.log(e);return}let r=+n[1],i=e.split(`
`),a=i.length.toString().length+2,o=i.map((e,t)=>x((t+1).toString(),a)+e),s=0;for(let e=0;e<o.length;e++)s=Math.max(o[e].length,s);let c=o.slice(0,r-1),l=o.slice(r-1,r),u=o.slice(r);console.log(c.join(`
`)),console.log(t.split(`
`)[0]),console.log(`%c ${x(l[0],s)}`,`border:1px solid red; background-color:#e3d2d2; color:#a61717`),console.log(u.join(`
`))}function kN(e){return KN(e,()=>e.createProgram(),`Unable to create WebGLProgram.`)}function AN(e,t){if(Z(e,()=>e.linkProgram(t)),!k().get(`ENGINE_COMPILE_ONLY`)&&e.getProgramParameter(t,e.LINK_STATUS)===!1)throw console.log(e.getProgramInfoLog(t)),Error(`Failed to link vertex and fragment shaders.`)}function jN(e,t){if(Z(e,()=>e.validateProgram(t)),e.getProgramParameter(t,e.VALIDATE_STATUS)===!1)throw console.log(e.getProgramInfoLog(t)),Error(`Shader program validation failed.`)}function MN(e,t){let n=KN(e,()=>e.createBuffer(),`Unable to create WebGLBuffer`);return Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,n)),Z(e,()=>e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW)),n}function NN(e,t){let n=KN(e,()=>e.createBuffer(),`Unable to create WebGLBuffer`);return Z(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n)),Z(e,()=>e.bufferData(e.ELEMENT_ARRAY_BUFFER,t,e.STATIC_DRAW)),n}function PN(e){return KN(e,()=>e.createTexture(),`Unable to create WebGLTexture.`)}function FN(e,t){let n=k().getNumber(`WEBGL_MAX_TEXTURE_SIZE`);if(e<=0||t<=0){let n=`[${e}x${t}]`;throw Error(`Requested texture size `+n+` is invalid.`)}if(e>n||t>n){let r=`[${e}x${t}]`,i=`[${n}x${n}]`;throw Error(`Requested texture size `+r+` greater than WebGL maximum on this browser / GPU `+i+`.`)}}function IN(e){return KN(e,()=>e.createFramebuffer(),`Unable to create WebGLFramebuffer.`)}function LN(e,t,n,r,i,a,o){let s=e.getAttribLocation(t,n);return s!==-1&&(Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,r)),Z(e,()=>e.vertexAttribPointer(s,i,e.FLOAT,!1,a,o)),Z(e,()=>e.enableVertexAttribArray(s)),!0)}function RN(e,t,n){qN(e,n),Z(e,()=>e.activeTexture(e.TEXTURE0+n)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,t))}function zN(e,t,n){return KN(e,()=>e.getUniformLocation(t,n),`uniform "`+n+`" not present in program.`)}function BN(e,t,n){return e.getUniformLocation(t,n)}function VN(e,t,n,r){Z(e,()=>RN(e,t,r)),Z(e,()=>e.uniform1i(n,r))}function HN(e,t,n){Z(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,n)),Z(e,()=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0))}function UN(e,t){Z(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,t)),Z(e,()=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,null,0))}function WN(e){let t=e.checkFramebufferStatus(e.FRAMEBUFFER);if(t!==e.FRAMEBUFFER_COMPLETE)throw Error(`Error binding framebuffer: `+GN(e,t))}function GN(e,t){switch(t){case e.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return`FRAMEBUFFER_INCOMPLETE_ATTACHMENT`;case e.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return`FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT`;case e.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return`FRAMEBUFFER_INCOMPLETE_DIMENSIONS`;case e.FRAMEBUFFER_UNSUPPORTED:return`FRAMEBUFFER_UNSUPPORTED`;default:return`unknown error ${t}`}}function KN(e,t,n){let r=Z(e,()=>t());if(r==null)throw Error(n);return r}function qN(e,t){let n=e.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,r=t+e.TEXTURE0;if(r<e.TEXTURE0||r>n){let e=`[gl.TEXTURE0, gl.TEXTURE${n}]`;throw Error(`textureUnit must be in ${e}.`)}}function JN(e,t=2){return _(e.slice(0,e.length-t))}function YN(e){if(e.length===0)throw Error(`Cannot get rows and columns of an empty shape array.`);return[e.length>1?e[e.length-2]:1,e[e.length-1]]}function XN(e){let t=[1,1,1];return e.length===0||e.length===1&&e[0]===1||(t=[JN(e),...YN(e)]),t}function ZN(e,t=!1){let n=k().getNumber(`WEBGL_MAX_TEXTURE_SIZE`),r=k().getNumber(`WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE`);r===1/0&&k().getBool(`WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE`)&&(r=n/2),t&&(n*=2,r*=2,e=e.map((t,n)=>n>=e.length-2?d(e[n]):e[n]),e.length===1&&(e=[2,e[0]])),e.length!==2&&(e=T(e).newShape);let i=_(e),a=null;e.length<=1&&i<=n?a=[1,i]:e.length===2&&e[0]<=n&&e[1]<=n?a=e:e.length===3&&e[0]*e[1]<=n&&e[2]<=n?a=[e[0]*e[1],e[2]]:e.length===3&&e[0]<=n&&e[1]*e[2]<=n?a=[e[0],e[1]*e[2]]:e.length===4&&e[0]*e[1]*e[2]<=n&&e[3]<=n?a=[e[0]*e[1]*e[2],e[3]]:e.length===4&&e[0]<=n&&e[1]*e[2]*e[3]<=n&&(a=[e[0],e[1]*e[2]*e[3]]);let o=a!=null&&Math.max(...a)>r&&Math.min(...a)<=(t?2:1)&&Math.min(...a)>0;if(a==null||o)if(t){let t=JN(e),n=2,r=2;e.length&&([n,r]=YN(e)),i=n/2*t*(r/2),a=b(i).map(e=>e*2)}else a=b(i);return a}function QN(e){return e%2==0}function $N(e,t){if(e=e.slice(-2),t=t.slice(-2),v(e,t)||!e.length||!t.length||e[0]===0||e[1]===0||t[0]===0||t[1]===0)return!0;if(e.length!==t.length){let n=e[e.length-1],r=t[t.length-1];if(n===r||QN(n)&&QN(r)&&(e[0]===1||t[0]===1))return!0}return e[1]===t[1]&&QN(e[0])&&QN(t[0])}var eP,tP;function nP(e){if(eP==null){let t=sN(e);eP=t.getParameter(t.MAX_TEXTURE_SIZE)}return eP}function rP(e){if(tP==null){let t=sN(e);tP=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,tP)}function iP(e){if(e===0)return 0;let t,n=sN(e);return t=aP(n,`EXT_disjoint_timer_query_webgl2`)&&e===2?2:+!!aP(n,`EXT_disjoint_timer_query`),t}function aP(e,t){return e.getExtension(t)!=null}function oP(e){try{if(sN(e)!=null)return!0}catch(e){return console.log(`Error when getting WebGL context: `,e),!1}return!1}function sP(e){if(e===0)return!1;let t=sN(e);if(e===1){if(!aP(t,`OES_texture_float`))return!1}else if(!aP(t,`EXT_color_buffer_float`))return!1;return lP(t)}function cP(e){if(e===0)return!1;let t=sN(e);if(e===1){if(!aP(t,`OES_texture_float`)||!aP(t,`WEBGL_color_buffer_float`))return!1}else{if(aP(t,`EXT_color_buffer_float`))return lP(t);let e=`EXT_color_buffer_half_float`;return aP(t,e)?uP(t,t.getExtension(e)):!1}return lP(t)}function lP(e){let t=vN(e),n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,t.internalFormatFloat,1,1,0,t.textureFormatFloat,t.textureTypeFloat,null);let r=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0);let i=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.deleteTexture(n),e.deleteFramebuffer(r),i}function uP(e,t){let n=vN(e,t),r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,n.internalFormatHalfFloat,1,1,0,n.textureFormatFloat,n.textureTypeHalfFloat,null);let i=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0);let a=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.deleteTexture(r),e.deleteFramebuffer(i),a}function dP(e){return e===2&&sN(e).fenceSync!=null}function fP(e,t){Array.isArray(e)||(e=[e]),e.forEach(e=>{e!=null&&m(e.dtype!==`complex64`,()=>`${t} does not support complex64 tensors in the WebGL backend.`)})}var Q=k();Q.registerFlag(`HAS_WEBGL`,()=>Q.getNumber(`WEBGL_VERSION`)>0),Q.registerFlag(`WEBGL_VERSION`,()=>oP(2)?2:+!!oP(1)),Q.registerFlag(`WEBGL_CHECK_NUMERICAL_PROBLEMS`,()=>!1),Q.registerFlag(`WEBGL_BUFFER_SUPPORTED`,()=>Q.get(`WEBGL_VERSION`)===2),Q.registerFlag(`WEBGL_CPU_FORWARD`,()=>!0),Q.registerFlag(`WEBGL_FORCE_F16_TEXTURES`,()=>!1),Q.registerFlag(`WEBGL_PACK`,()=>Q.getBool(`HAS_WEBGL`)),Q.registerFlag(`WEBGL_PACK_NORMALIZATION`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_CLIP`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_DEPTHWISECONV`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_BINARY_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_UNARY_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_ARRAY_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_IMAGE_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_REDUCE`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_LAZILY_UNPACK`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_CONV_IM2COL`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_CONV2DTRANSPOSE`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_MAX_TEXTURE_SIZE`,()=>nP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_MAX_TEXTURES_IN_SHADER`,()=>rP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`,()=>{let e=Q.getNumber(`WEBGL_VERSION`);return e===0?0:iP(e)}),Q.registerFlag(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`,()=>Q.getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)>0&&!$i()),Q.registerFlag(`WEBGL_RENDER_FLOAT32_CAPABLE`,()=>sP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_RENDER_FLOAT32_ENABLED`,()=>!Q.getBool(`WEBGL_FORCE_F16_TEXTURES`)&&Q.getBool(`WEBGL_RENDER_FLOAT32_CAPABLE`)),Q.registerFlag(`WEBGL_DOWNLOAD_FLOAT_ENABLED`,()=>cP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_FENCE_API_ENABLED`,()=>dP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_SIZE_UPLOAD_UNIFORM`,()=>Q.getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)?4:0),Q.registerFlag(`WEBGL_DELETE_TEXTURE_THRESHOLD`,()=>-1,e=>{if(typeof e!=`number`)throw Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be a number but got ${e}.`);if(e<0&&e!==-1)throw Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be -1 (indicating never delete) or at least 0, but got ${e}.`)}),Q.registerFlag(`WEBGL_FLUSH_THRESHOLD`,()=>$i()?1:-1,e=>{if(typeof e!=`number`)throw Error(`WEBGL_FLUSH_THRESHOLD must be a number but got ${e}.`);if(e<0&&e!==-1)throw Error(`WEBGL_FLUSH_THRESHOLD must be -1 (indicating never manual flush) or at least 0, but got ${e}.`)}),Q.registerFlag(`CPU_HANDOFF_SIZE_THRESHOLD`,()=>128),Q.registerFlag(`WEBGL_USE_SHAPES_UNIFORMS`,()=>!1),Q.registerFlag(`TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD`,()=>1e5),Q.registerFlag(`TOPK_K_CPU_HANDOFF_THRESHOLD`,()=>128),Q.registerFlag(`WEBGL_EXP_CONV`,()=>!1),Q.registerFlag(`SOFTWARE_WEBGL_ENABLED`,()=>Q.getBool(`IS_TEST`)),Q.registerFlag(`WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE`,()=>1/0),Q.registerFlag(`WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE`,()=>!1),Q.registerFlag(`WEBGL2_ISNAN_CUSTOM`,()=>!1),Q.registerFlag(`ENGINE_COMPILE_ONLY`,()=>!1);function pP(){let e,t,n,r,i,a,o,s,c,l;return k().getNumber(`WEBGL_VERSION`)===2?(e=`#version 300 es`,t=`in`,n=`out`,r=`in`,i=`texture`,a=`outputColor`,o=`out vec4 outputColor;`,s=k().getBool(`WEBGL2_ISNAN_CUSTOM`)?`
      bool isnan_custom(float val) {
        uint floatToUint = floatBitsToUint(val);
        return (floatToUint & 0x7fffffffu) > 0x7f800000u;
      }

      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan_custom(val.x),
          isnan_custom(val.y), isnan_custom(val.z), isnan_custom(val.w));
      }

      #define isnan(value) isnan_custom(value)
    `:``,c=``,l=`
      #define round(value) newRound(value)
      int newRound(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 newRound(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `):(e=``,t=`attribute`,n=`varying`,r=`varying`,i=`texture2D`,a=`gl_FragColor`,o=``,s=`
      #define isnan(value) isnan_custom(value)
      bool isnan_custom(float val) {
        return (val > 0. || val < 1. || val == 0.) ? false : true;
      }
      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan(val.x), isnan(val.y), isnan(val.z), isnan(val.w));
      }
    `,c=`
      uniform float INFINITY;

      bool isinf(float val) {
        return abs(val) == INFINITY;
      }
      bvec4 isinf(vec4 val) {
        return equal(abs(val), vec4(INFINITY));
      }
    `,l=`
      int round(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 round(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `),{version:e,attribute:t,varyingVs:n,varyingFs:r,texture2D:i,output:a,defineOutput:o,defineSpecialNaN:s,defineSpecialInf:c,defineRound:l}}function mP(e,t,n=`index`){let r=O(t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / ${t}`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * ${t}`:`index -= ${e[i]} * ${t}`};`).join(``)}function hP(e,t,n=`index`){let r=O(t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / outShapeStrides[${i}]`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * outShapeStrides[${i}]`:`index -= ${e[i]} * outShapeStrides[${i}]`};`).join(``)}function gP(e,t){let n=e.length,r=e.map(e=>`${t}[${e}]`),i=Array(n-1);i[n-2]=r[n-1];for(let e=n-3;e>=0;--e)i[e]=`(${i[e+1]} * ${r[e+1]})`;return i}function _P(e,t,n=`index`){let r=gP(e.map((e,t)=>t),t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / ${r[i]}`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * ${r[i]}`:`index -= ${e[i]} * ${r[i]}`};`).join(``)}function vP(e){let t=O(e).map(e=>e.toString());return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * ${t[0]} + coords.y * ${t[1]} + coords.z;
  }
`}function yP(){return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * outShapeStrides[0] + coords.y * outShapeStrides[1] + coords.z;
  }
`}var bP=`
  const float FLOAT_MAX = 1.70141184e38;
  const float FLOAT_MIN = 1.17549435e-38;

  lowp vec4 encode_float(highp float v) {
    if (isnan(v)) {
      return vec4(255, 255, 255, 255);
    }

    highp float av = abs(v);

    if(av < FLOAT_MIN) {
      return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
      return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
      return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    highp float e = floor(log2(av));
    highp float m = exp2(fract(log2(av))) - 1.0;

    c[2] = floor(128.0 * m);
    m -= c[2] / 128.0;
    c[1] = floor(32768.0 * m);
    m -= c[1] / 32768.0;
    c[0] = floor(8388608.0 * m);

    highp float ebias = e + 127.0;
    c[3] = floor(ebias / 2.0);
    ebias -= c[3] * 2.0;
    c[2] += floor(ebias) * 128.0;

    c[3] += 128.0 * step(0.0, -v);

    return c / 255.0;
  }
`,{getBroadcastDims:xP}=Vh;function SP(e,t,n){let r=[];if(e.forEach(e=>{let t=_(e.shapeInfo.logicalShape);if(e.shapeInfo.isUniform?r.push(`uniform float ${e.name}${t>1?`[${t}]`:``};`):(r.push(`uniform sampler2D ${e.name};`),r.push(`uniform int offset${e.name};`)),n.enableShapeUniforms){let{uniformShape:t}=uF(n.packedInputs,e.shapeInfo.logicalShape,e.shapeInfo.texShape);switch(t.length){case 1:r.push(`uniform int ${e.name}Shape;`);break;case 2:r.push(`uniform ivec2 ${e.name}Shape;`);break;case 3:r.push(`uniform ivec3 ${e.name}Shape;`);break;case 4:r.push(`uniform ivec4 ${e.name}Shape;`)}r.push(`uniform ivec2 ${e.name}TexShape;`)}}),n.enableShapeUniforms){switch(t.logicalShape.length){case 1:r.push(`uniform int outShape;`);break;case 2:r.push(`uniform ivec2 outShape;`),r.push(`uniform int outShapeStrides;`);break;case 3:r.push(`uniform ivec3 outShape;`),r.push(`uniform ivec2 outShapeStrides;`);break;case 4:r.push(`uniform ivec4 outShape;`),r.push(`uniform ivec3 outShapeStrides;`)}r.push(`uniform ivec2 outTexShape;`)}n.customUniforms&&n.customUniforms.forEach(e=>{r.push(`uniform ${e.type} ${e.name}${e.arrayIndex?`[${e.arrayIndex}]`:``};`)});let i=r.join(`
`),a=e.map(e=>TP(e,t,n.packedInputs,n.enableShapeUniforms)).join(`
`),o=t.texShape,s=pP(),c=OP(s),l,u,d=jP(s);return t.isPacked?(l=EP(t.logicalShape,o,n.enableShapeUniforms),u=AP(s)):(l=DP(t.logicalShape,o,n.enableShapeUniforms),u=kP(s)),n.packedInputs&&(d+=FP),[d,c,u,i,l,a,n.userCode].join(`
`)}function CP(e,t=!1){let n=e.shapeInfo.logicalShape;switch(n.length){case 0:return YP(e,t);case 1:return ZP(e,t);case 2:return $P(e,t);case 3:return tF(e,t);case 4:return rF(e,t);case 5:return iF(e);case 6:return aF(e);default:throw Error(`${n.length}-D input sampling is not yet supported`)}}function wP(e,t){switch(e.shapeInfo.logicalShape.length){case 0:return JP(e);case 1:return XP(e,t);case 2:return QP(e,t);case 3:return eF(e,t);default:return nF(e,t)}}function TP(e,t,n=!1,r){let i=``;i+=n?wP(e,r):CP(e,r);let a=e.shapeInfo.logicalShape,o=t.logicalShape;return a.length<=o.length&&(i+=n?sF(e,t):cF(e,t)),i}function EP(e,t,n){switch(e.length){case 0:return IP();case 1:return LP(e,t,n);case 2:return GP(e,t,n);case 3:return zP(e,t,n);default:return VP(e,t,n)}}function DP(e,t,n){switch(e.length){case 0:return IP();case 1:return RP(e,t,n);case 2:return KP(e,t,n);case 3:return BP(e,t,n);case 4:return HP(e,t,n);case 5:return UP(e,t);case 6:return WP(e,t);default:throw Error(`${e.length}-D output sampling is not yet supported`)}}function OP(e){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return ${e.texture2D}(textureSampler, uv).r;
    }
  `}function kP(e){return`
    void setOutput(float val) {
      ${e.output} = vec4(val, 0, 0, 0);
    }
  `}function AP(e){return`
    void setOutput(vec4 val) {
      ${e.output} = val;
    }
  `}function jP(e){return`${e.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${e.varyingFs} vec2 resultUV;
    ${e.defineOutput}
    const vec2 halfCR = vec2(0.5, 0.5);

    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    uniform float NAN;
    ${e.defineSpecialNaN}
    ${e.defineSpecialInf}
    ${e.defineRound}

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }

    //Based on the work of Dave Hoskins
    //https://www.shadertoy.com/view/4djSRW
    #define HASHSCALE1 443.8975
    float random(float seed){
      vec2 p = resultUV * seed;
      vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
      p3 += dot(p3, p3.yzx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    ${MP}
    ${NP}
    ${PP}
  `}var MP=`
vec2 uvFromFlat(int texNumR, int texNumC, int index) {
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
  int texelIndex = index / 2;
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,NP=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,PP=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,FP=`
  float getChannel(vec4 frag, vec2 innerDims) {
    vec2 modCoord = mod(innerDims, 2.);
    return modCoord.x == 0. ?
      (modCoord.y == 0. ? frag.r : frag.g) :
      (modCoord.y == 0. ? frag.b : frag.a);
  }
  float getChannel(vec4 frag, int dim) {
    float modCoord = mod(float(dim), 2.);
    return modCoord == 0. ? frag.r : frag.g;
  }
`;function IP(){return`
    int getOutputCoords() {
      return 0;
    }
  `}function LP(e,t,n){let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];return r[0]===1?n?`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ceil(float(outTexShape[1]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ${r[1]}.0);
      }
    `:r[1]===1?n?`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ceil(float(outTexShape[0]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ${r[0]}.0);
      }
    `:n?`
    int getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      return 2 * (resTexRC.x * packedTexShape[1] + resTexRC.y);
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));
      return 2 * (resTexRC.x * ${r[1]} + resTexRC.y);
    }
  `}function RP(e,t,n){return t[0]===1?n?`
      int getOutputCoords() {
        return int(resultUV.x * float(outTexShape[1]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.x * ${t[1]}.0);
      }
    `:t[1]===1?n?`
      int getOutputCoords() {
        return int(resultUV.y * float(outTexShape[0]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.y * ${t[0]}.0);
      }
    `:n?`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      return resTexRC.x * outTexShape[1] + resTexRC.y;
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      return resTexRC.x * ${t[1]} + resTexRC.y;
    }
  `}function zP(e,t,n){if(n)return`
    ivec3 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec3(b, r, c);
    }
  `;let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)],i=Math.ceil(e[2]/2),a=i*Math.ceil(e[1]/2);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));
      int index = resTexRC.x * ${r[1]} + resTexRC.y;

      int b = index / ${a};
      index -= b * ${a};

      int r = 2 * (index / ${i});
      int c = imod(index, ${i}) * 2;

      return ivec3(b, r, c);
    }
  `}function BP(e,t,n){if(n)return`
  ivec3 getOutputCoords() {
    ivec2 resTexRC = ivec2(resultUV.yx *
                           vec2(outTexShape[0], outTexShape[1]));
    int index = resTexRC.x * outTexShape[1] + resTexRC.y;
    ${hP([`r`,`c`,`d`],e)}
    return ivec3(r, c, d);
  }
`;let r=mP([`r`,`c`,`d`],e);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${r}
      return ivec3(r, c, d);
    }
  `}function VP(e,t,n){if(n)return`
    ivec4 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int texelsInLogicalRow = int(ceil(float(outShape[3]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatchN = texelsInBatch * outShape[1];

      int b2 = index / texelsInBatchN;
      index -= b2 * texelsInBatchN;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec4(b2, b, r, c);
    }
  `;let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)],i=Math.ceil(e[e.length-1]/2),a=i*Math.ceil(e[e.length-2]/2),o=a,s=``,c=`b, r, c`;for(let t=2;t<e.length-1;t++)o*=e[e.length-t-1],s=`
      int b${t} = index / ${o};
      index -= b${t} * ${o};
    `+s,c=`b${t}, `+c;return`
    ivec${e.length} getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));
      int index = resTexRC.x * ${r[1]} + resTexRC.y;

      ${s}

      int b = index / ${a};
      index -= b * ${a};

      int r = 2 * (index / ${i});
      int c = imod(index, ${i}) * 2;

      return ivec${e.length}(${c});
    }
  `}function HP(e,t,n){if(n)return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      ${hP([`r`,`c`,`d`,`d2`],e)}
      return ivec4(r, c, d, d2);
    }
  `;let r=mP([`r`,`c`,`d`,`d2`],e);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${r}
      return ivec4(r, c, d, d2);
    }
  `}function UP(e,t){let n=mP([`r`,`c`,`d`,`d2`,`d3`],e);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(${t[0]},
                             ${t[1]}));

      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${n}

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `}function WP(e,t){let n=mP([`r`,`c`,`d`,`d2`,`d3`,`d4`],e);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${n}

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `}function GP(e,t,n){let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];if(v(e,t))return n?`
      ivec2 getOutputCoords() {
        ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
        return 2 * ivec2(resultUV.yx * vec2(packedTexShape[0], packedTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return 2 * ivec2(resultUV.yx * vec2(${r[0]}, ${r[1]}));
      }
    `;let i=Math.ceil(e[1]/2);return n?`
    ivec2 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));

      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;
      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${r[0]}, ${r[1]}));

      int index = resTexRC.x * ${r[1]} + resTexRC.y;
      int r = 2 * (index / ${i});
      int c = imod(index, ${i}) * 2;

      return ivec2(r, c);
    }
  `}function KP(e,t,n){return v(e,t)?n?`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(outTexShape[0], outTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(${t[0]}, ${t[1]}));
      }
    `:e[1]===1?n?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(index, 0);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${t[0]}, ${t[1]}));
        int index = resTexRC.x * ${t[1]} + resTexRC.y;
        return ivec2(index, 0);
      }
    `:e[0]===1?n?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(0, index);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${t[0]}, ${t[1]}));
        int index = resTexRC.x * ${t[1]} + resTexRC.y;
        return ivec2(0, index);
      }
    `:n?`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      int r = index / outShape[1];
      int c = index - r * outShape[1];
      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      int r = index / ${e[1]};
      int c = index - r * ${e[1]};
      return ivec2(r, c);
    }
  `}function qP(e){return`offset${e}`}function JP(e){let t=e.name;return`
    vec4 ${`get`+t.charAt(0).toUpperCase()+t.slice(1)}() {
      return ${pP().texture2D}(${t}, halfCR);
    }
  `}function YP(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`float ${r}() {return ${n};}`;let[i,a]=e.shapeInfo.texShape;if(i===1&&a===1)return`
      float ${r}() {
        return sampleTexture(${n}, halfCR);
      }
    `;let o=qP(n);if(t)return`
    float ${r}() {
      vec2 uv = uvFromFlat(${n}TexShape[0], ${n}TexShape[1], ${o});
      return sampleTexture(${n}, uv);
    }
  `;let[s,c]=e.shapeInfo.texShape;return`
    float ${r}() {
      vec2 uv = uvFromFlat(${s}, ${c}, ${o});
      return sampleTexture(${n}, uv);
    }
  `}function XP(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=e.shapeInfo.texShape,a=pP();if(t)return`
    vec4 ${r}(int index) {
      ivec2 packedTexShape = ivec2(ceil(float(${n}TexShape[0]) / 2.0), ceil(float(${n}TexShape[1]) / 2.0));
      vec2 uv = packedUVfrom1D(
        packedTexShape[0], packedTexShape[1], index);
      return ${a.texture2D}(${n}, uv);
    }
  `;let o=[Math.ceil(i[0]/2),Math.ceil(i[1]/2)];return`
    vec4 ${r}(int index) {
      vec2 uv = packedUVfrom1D(
        ${o[0]}, ${o[1]}, index);
      return ${a.texture2D}(${n}, uv);
    }
  `}function ZP(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`
      float ${r}(int index) {
        ${oF(e)}
      }
    `;let i=e.shapeInfo.texShape,a=i[0],o=i[1];if(o===1&&a===1)return`
      float ${r}(int index) {
        return sampleTexture(${n}, halfCR);
      }
    `;let s=qP(n);return o===1?t?`
      float ${r}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${s}) + 0.5) / float(${n}TexShape[0]));
        return sampleTexture(${n}, uv);
      }
    `:`
      float ${r}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${s}) + 0.5) / ${a}.0);
        return sampleTexture(${n}, uv);
      }
    `:a===1?t?`
      float ${r}(int index) {
        vec2 uv = vec2((float(index + ${s}) + 0.5) / float(${n}TexShape[1]), 0.5);
        return sampleTexture(${n}, uv);
      }
    `:`
      float ${r}(int index) {
        vec2 uv = vec2((float(index + ${s}) + 0.5) / ${o}.0, 0.5);
        return sampleTexture(${n}, uv);
      }
    `:t?`
    float ${r}(int index) {
      vec2 uv = uvFromFlat(${n}TexShape[0], ${n}TexShape[1], index + ${s});
      return sampleTexture(${n}, uv);
    }
  `:`
    float ${r}(int index) {
      vec2 uv = uvFromFlat(${a}, ${o}, index + ${s});
      return sampleTexture(${n}, uv);
    }
  `}function QP(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape,o=a[0],s=a[1],c=pP();if(a!=null&&v(n,a))return t?`
      vec4 ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);

        return ${c.texture2D}(${r}, uv);
      }
    `:`
      vec4 ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${s}.0, ${o}.0);

        return ${c.texture2D}(${r}, uv);
      }
    `;if(t)return`
    vec4 ${i}(int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${r}TexShape[0]) / 2.0), ceil(float(${r}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${r}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom2D(valuesPerRow, packedTexShape[0], packedTexShape[1], row, col);
      return ${c.texture2D}(${r}, uv);
    }
  `;let l=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];return`
    vec4 ${i}(int row, int col) {
      vec2 uv = packedUVfrom2D(${Math.ceil(n[1]/2)}, ${l[0]}, ${l[1]}, row, col);
      return ${c.texture2D}(${r}, uv);
    }
  `}function $P(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape;if(a!=null&&v(n,a)){if(t)return`
      float ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `;let e=a[0];return`
    float ${i}(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(${a[1]}.0, ${e}.0);
      return sampleTexture(${r}, uv);
    }
  `}let{newShape:o,keptDims:s}=T(n),c=o;if(c.length<n.length)return`
      ${CP(dF(e,c),t)}
      float ${i}(int row, int col) {
        return ${i}(${fF([`row`,`col`],s)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(${n[1]}, 1)));
        ${oF(e)}
      }
    `;let l=a[0],u=a[1],d=qP(r);return u===1?t?`
      float ${i}(int row, int col) {
        float index = dot(vec3(row, col, ${d}), vec3(${r}Shape[1], 1, 1));
        vec2 uv = vec2(0.5, (index + 0.5) / float(${r}TexShape[0]));
        return sampleTexture(${r}, uv);
      }
    `:`
    float ${i}(int row, int col) {
      float index = dot(vec3(row, col, ${d}), vec3(${n[1]}, 1, 1));
      vec2 uv = vec2(0.5, (index + 0.5) / ${l}.0);
      return sampleTexture(${r}, uv);
    }
  `:l===1?t?`
      float ${i}(int row, int col) {
        float index = dot(vec3(row, col, ${d}), vec3(${r}Shape[1], 1, 1));
        vec2 uv = vec2((index + 0.5) / float(${r}TexShape[1]), 0.5);
        return sampleTexture(${r}, uv);
      }
    `:`
    float ${i}(int row, int col) {
      float index = dot(vec3(row, col, ${d}), vec3(${n[1]}, 1, 1));
      vec2 uv = vec2((index + 0.5) / ${u}.0, 0.5);
      return sampleTexture(${r}, uv);
    }
  `:t?`
      float ${i}(int row, int col) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${r}Shape[1] + col + ${d};
        vec2 uv = uvFromFlat(${r}TexShape[0], ${r}TexShape[1], index);
        return sampleTexture(${r}, uv);
      }
    `:`
  float ${i}(int row, int col) {
    // Explicitly use integer operations as dot() only works on floats.
    int index = row * ${n[1]} + col + ${d};
    vec2 uv = uvFromFlat(${l}, ${u}, index);
    return sampleTexture(${r}, uv);
  }
`}function eF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape,o=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];if(n[0]===1)return`
        ${wP(dF(e,n.slice(1)),t)}
        vec4 ${i}(int b, int row, int col) {
          return ${i}(${fF([`b`,`row`,`col`],[1,2])});
        }
      `;let s=pP();if(t)return`
    vec4 ${i}(int b, int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${r}TexShape[0]) / 2.0), ceil(float(${r}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${r}Shape[2]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${r}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom3D(
        packedTexShape[0], packedTexShape[1], texelsInBatch, valuesPerRow, b, row, col);
      return ${s.texture2D}(${r}, uv);
    }
  `;let c=o[0],l=o[1],u=Math.ceil(n[2]/2);return`
    vec4 ${i}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${c}, ${l}, ${u*Math.ceil(n[1]/2)}, ${u}, b, row, col);
      return ${s.texture2D}(${r}, uv);
    }
  `}function tF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=n[1]*n[2],o=n[2],{newShape:s,keptDims:c}=T(n),l=s;if(l.length<n.length)return`
        ${CP(dF(e,l),t)}
        float ${i}(int row, int col, int depth) {
          return ${i}(${fF([`row`,`col`,`depth`],c)});
        }
      `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(${a}, ${o}, 1)));
        ${oF(e)}
      }
    `;let u=e.shapeInfo.texShape,d=u[0],f=u[1],p=e.shapeInfo.flatOffset;if(f===a&&p==null)return t?`
      float ${i}(int row, int col, int depth) {
        int stride1 = ${r}Shape[2];
        float texR = float(row);
        float texC = dot(vec2(col, depth), vec2(stride1, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
        float ${i}(int row, int col, int depth) {
          float texR = float(row);
          float texC = dot(vec2(col, depth), vec2(${o}, 1));
          vec2 uv = (vec2(texC, texR) + halfCR) /
                     vec2(${f}.0, ${d}.0);
          return sampleTexture(${r}, uv);
        }
      `;if(f===o&&p==null)return t?`
      float ${i}(int row, int col, int depth) {
        float texR = dot(vec2(row, col), vec2(${r}Shape[1], 1));
        float texC = float(depth);
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
    float ${i}(int row, int col, int depth) {
      float texR = dot(vec2(row, col), vec2(${n[1]}, 1));
      float texC = float(depth);
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${f}.0, ${d}.0);
      return sampleTexture(${r}, uv);
    }
  `;let m=qP(r);return t?`
    float ${i}(int row, int col, int depth) {
      // Explicitly use integer operations as dot() only works on floats.
      int stride0 = ${r}Shape[1] * ${r}Shape[2];
      int stride1 = ${r}Shape[2];
      int index = row * stride0 + col * stride1 + depth + ${m};
      vec2 uv = uvFromFlat(${r}TexShape[0], ${r}TexShape[1], index);
      return sampleTexture(${r}, uv);
    }
    `:`
      float ${i}(int row, int col, int depth) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${a} + col * ${o} + depth + ${m};
        vec2 uv = uvFromFlat(${d}, ${f}, index);
        return sampleTexture(${r}, uv);
      }
  `}function nF(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=pP();if(t)return`
    vec4 ${r}(int b2, int b, int row, int col) {
      int valuesPerRow = int(ceil(float(${n}Shape[3]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${n}Shape[2]) / 2.0));
      int index = b * texelsInBatch + (row / 2) * valuesPerRow + (col / 2);
      texelsInBatch *= ${n}Shape[1];
      index = b2 * texelsInBatch + index;
      ivec2 packedTexShape = ivec2(ceil(float(${n}TexShape[0]) / 2.0), ceil(float(${n}TexShape[1]) / 2.0));
      int texR = index / packedTexShape[1];
      int texC = index - texR * packedTexShape[1];
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(packedTexShape[1], packedTexShape[0]); return ${i.texture2D}(${n}, uv);
    }
  `;let a=e.shapeInfo.logicalShape,o=a.length,s=e.shapeInfo.texShape,c=[Math.ceil(s[0]/2),Math.ceil(s[1]/2)],l=c[0],u=c[1],d=Math.ceil(a[o-1]/2),f=d*Math.ceil(a[o-2]/2),p=`int b, int row, int col`,m=`b * ${f} + (row / 2) * ${d} + (col / 2)`;for(let e=2;e<o-1;e++)p=`int b${e}, `+p,f*=a[o-e-1],m=`b${e} * ${f} + `+m;return`
    vec4 ${r}(${p}) {
      int index = ${m};
      int texR = index / ${u};
      int texC = index - texR * ${u};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${u}, ${l});
      return ${i.texture2D}(${n}, uv);
    }
  `}function rF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=n[3],o=n[2]*a,s=n[1]*o,{newShape:c,keptDims:l}=T(n);if(c.length<n.length)return`
      ${CP(dF(e,c),t)}
      float ${i}(int row, int col, int depth, int depth2) {
        return ${i}(${fF([`row`,`col`,`depth`,`depth2`],l)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(${s}, ${o}, ${a}, 1)));
        ${oF(e)}
      }
    `;let u=e.shapeInfo.flatOffset,d=e.shapeInfo.texShape,f=d[0],p=d[1],m=`int stride2 = ${r}Shape[3];`,h=`int stride1 = ${r}Shape[2] * stride2;`,g=`int stride0 = ${r}Shape[1] * stride1;`;if(p===s&&u==null)return t?`
      float ${i}(int row, int col, int depth, int depth2) {
        ${m}
        ${h}
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(stride1, stride2, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
      float ${i}(int row, int col, int depth, int depth2) {
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(${o}, ${a}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${p}.0, ${f}.0);
        return sampleTexture(${r}, uv);
      }
    `;if(p===a&&u==null)return t?`
      float ${i}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${r}Shape[1] * ${r}Shape[2], ${r}Shape[2], 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `:`
      float ${i}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${n[1]*n[2]}, ${n[2]}, 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${p}.0, ${f}.0);
        return sampleTexture(${r}, uv);
      }
    `;let _=qP(r);return t?`
    float ${i}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      ${m}
      ${h}
      ${g}
      int index = row * stride0 + col * stride1 +
          depth * stride2 + depth2;
      vec2 uv = uvFromFlat(${r}TexShape[0], ${r}TexShape[1], index + ${_});
      return sampleTexture(${r}, uv);
    }
  `:`
    float ${i}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${s} + col * ${o} +
          depth * ${a} + depth2;
      vec2 uv = uvFromFlat(${f}, ${p}, index + ${_});
      return sampleTexture(${r}, uv);
    }
  `}function iF(e){let t=e.shapeInfo.logicalShape,n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=t[4],a=t[3]*i,o=t[2]*a,s=t[1]*o,{newShape:c,keptDims:l}=T(t);if(c.length<t.length)return`
      ${CP(dF(e,c))}
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        return ${r}(${fF([`row`,`col`,`depth`,`depth2`,`depth3`],l)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(${s}, ${o}, ${a}, ${i})) +
          depth3;
        ${oF(e)}
      }
    `;let u=e.shapeInfo.flatOffset,d=e.shapeInfo.texShape,f=d[0],p=d[1];return p===s&&u==null?`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
                         vec4(${o}, ${a}, ${i}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${p}.0, ${f}.0);
        return sampleTexture(${n}, uv);
      }
    `:p===i&&u==null?`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        float texR = dot(
          vec4(row, col, depth, depth2),
          vec4(${t[1]*t[2]*t[3]},
               ${t[2]*t[3]}, ${t[3]}, 1));
        int texC = depth3;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${p}.0, ${f}.0);
        return sampleTexture(${n}, uv);
      }
    `:`
    float ${r}(int row, int col, int depth, int depth2, int depth3) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${s} + col * ${o} + depth * ${a} +
          depth2 * ${i} + depth3 + ${qP(n)};
      vec2 uv = uvFromFlat(${f}, ${p}, index);
      return sampleTexture(${n}, uv);
    }
  `}function aF(e){let t=e.shapeInfo.logicalShape,n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),{newShape:i,keptDims:a}=T(t);if(i.length<t.length)return`
      ${CP(dF(e,i))}
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return ${r}(${fF([`row`,`col`,`depth`,`depth2`,`depth3`,`depth4`],a)});
      }
    `;let o=t[5],s=t[4]*o,c=t[3]*s,l=t[2]*c,u=t[1]*l;if(e.shapeInfo.isUniform)return`
      float ${r}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
        int index = round(dot(
          vec4(row, col, depth, depth2),
          vec4(${u}, ${l}, ${c}, ${s})) +
          dot(
            vec2(depth3, depth4),
            vec2(${o}, 1)));
        ${oF(e)}
      }
    `;let d=e.shapeInfo.flatOffset,f=e.shapeInfo.texShape,p=f[0],m=f[1];return m===u&&d==null?`
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
          vec4(${l}, ${c}, ${s}, ${o})) +
               float(depth4);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${m}.0, ${p}.0);
        return sampleTexture(${n}, uv);
      }
    `:m===o&&d==null?`
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        float texR = dot(vec4(row, col, depth, depth2),
          vec4(${t[1]*t[2]*t[3]*t[4]},
               ${t[2]*t[3]*t[4]},
               ${t[3]*t[4]},
               ${t[4]})) + float(depth3);
        int texC = depth4;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${m}.0, ${p}.0);
        return sampleTexture(${n}, uv);
      }
    `:`
    float ${r}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${u} + col * ${l} + depth * ${c} +
          depth2 * ${s} + depth3 * ${o} + depth4 + ${qP(n)};
      vec2 uv = uvFromFlat(${p}, ${m}, index);
      return sampleTexture(${n}, uv);
    }
  `}function oF(e){let t=e.name,n=_(e.shapeInfo.logicalShape);return n<2?`return ${t};`:`
    for (int i = 0; i < ${n}; i++) {
      if (i == index) {
        return ${t}[i];
      }
    }
  `}function sF(e,t){let n=e.name,r=n.charAt(0).toUpperCase()+n.slice(1),i=`get`+r+`AtOutCoords`,a=e.shapeInfo.logicalShape.length,o=t.logicalShape.length,s=xP(e.shapeInfo.logicalShape,t.logicalShape),c=lF(o),l=o-a,u,d=[`x`,`y`,`z`,`w`,`u`,`v`];u=a===0?``:o<2&&s.length>=1?`coords = 0;`:s.map(e=>`coords.${d[e+l]} = 0;`).join(`
`);let f=``;f=o<2&&a>0?`coords`:e.shapeInfo.logicalShape.map((e,t)=>`coords.${d[t+l]}`).join(`, `);let p=`return outputValue;`,m=_(e.shapeInfo.logicalShape)===1,h=_(t.logicalShape)===1;if(a===1&&!m&&!h)p=`
      return vec4(outputValue.xy, outputValue.xy);
    `;else if(m&&!h)p=o===1?`
        return vec4(outputValue.x, outputValue.x, 0., 0.);
      `:`
        return vec4(outputValue.x);
      `;else if(s.length){let e=a-2,t=a-1;s.indexOf(e)>-1&&s.indexOf(t)>-1?p=`return vec4(outputValue.x);`:s.indexOf(e)>-1?p=`return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);`:s.indexOf(t)>-1&&(p=`return vec4(outputValue.xx, outputValue.zz);`)}return`
    vec4 ${i}() {
      ${c} coords = getOutputCoords();
      ${u}
      vec4 outputValue = get${r}(${f});
      ${p}
    }
  `}function cF(e,t){let n=e.name,r=n.charAt(0).toUpperCase()+n.slice(1),i=`get`+r+`AtOutCoords`,a=t.texShape,o=e.shapeInfo.texShape,s=e.shapeInfo.logicalShape.length,c=t.logicalShape.length;if(!e.shapeInfo.isUniform&&s===c&&e.shapeInfo.flatOffset==null&&v(o,a))return`
      float ${i}() {
        return sampleTexture(${n}, resultUV);
      }
    `;let l=lF(c),u=xP(e.shapeInfo.logicalShape,t.logicalShape),d=c-s,f,p=[`x`,`y`,`z`,`w`,`u`,`v`];f=s===0?``:c<2&&u.length>=1?`coords = 0;`:u.map(e=>`coords.${p[e+d]} = 0;`).join(`
`);let m=``;return m=c<2&&s>0?`coords`:e.shapeInfo.logicalShape.map((e,t)=>`coords.${p[t+d]}`).join(`, `),`
    float ${i}() {
      ${l} coords = getOutputCoords();
      ${f}
      return get${r}(${m});
    }
  `}function lF(e){if(e<=1)return`int`;if(e===2)return`ivec2`;if(e===3)return`ivec3`;if(e===4)return`ivec4`;if(e===5)return`ivec5`;if(e===6)return`ivec6`;throw Error(`GPU for rank ${e} is not yet supported`)}function uF(e,t,n){let{newShape:r,keptDims:i}=T(t),a=t.length,o=e&&a===3&&t[0]===1,s=o?t.slice(1):r,c=!e&&a>1&&!v(t,n)&&r.length<a||o;return{useSqueezeShape:c,uniformShape:c?s:t,keptDims:i}}function dF(e,t){let n=JSON.parse(JSON.stringify(e));return n.shapeInfo.logicalShape=t,n}function fF(e,t){return t.map(t=>e[t]).join(`, `)}function pF(e,t,n,r){let i=n.map((e,n)=>{let r={logicalShape:e.shape,texShape:e.isUniform?null:e.texData.texShape,isUniform:e.isUniform,isPacked:!e.isUniform&&e.texData.isPacked,flatOffset:null};return e.texData!=null&&e.texData.slice!=null&&e.texData.slice.flatOffset>0&&(r.flatOffset=e.texData.slice.flatOffset),{name:t.variableNames[n],shapeInfo:r}}),a=i.map(e=>e.shapeInfo),o={logicalShape:r.shape,texShape:r.texData.texShape,isUniform:!1,isPacked:r.texData.isPacked,flatOffset:null},s=SP(i,o,t),c=EN(e.gl,s),l=e.createProgram(c);return k().get(`ENGINE_COMPILE_ONLY`)?{program:t,fragmentShader:c,source:s,webGLProgram:l,inShapeInfos:a,outShapeInfo:o,variablesLocations:null,customUniformLocations:null,infLoc:null,nanLoc:null,outShapeLocation:null,outShapeStridesLocation:null,outTexShapeLocation:null}:(e.buildVao(l),Object.assign({program:t,fragmentShader:c,source:s,webGLProgram:l,inShapeInfos:a,outShapeInfo:o},mF(e,t,l)))}function mF(e,t,n){let r=[],i=[],a,o,s,c=null,l=null;l=e.getUniformLocation(n,`NAN`,!1),k().getNumber(`WEBGL_VERSION`)===1&&(c=e.getUniformLocation(n,`INFINITY`,!1));for(let i of t.variableNames){let a={name:i,uniform:e.getUniformLocation(n,i,!1),offset:e.getUniformLocation(n,`offset${i}`,!1)};t.enableShapeUniforms&&(a.shape=e.getUniformLocation(n,`${i}Shape`,!1),a.texShape=e.getUniformLocation(n,`${i}TexShape`,!1)),r.push(a)}if(t.enableShapeUniforms&&(a=e.getUniformLocation(n,`outShape`,!1),s=e.getUniformLocation(n,`outShapeStrides`,!1),o=e.getUniformLocation(n,`outTexShape`,!1)),t.customUniforms)for(let r of t.customUniforms)i.push(e.getUniformLocation(n,r.name,!1));return{variablesLocations:r,customUniformLocations:i,infLoc:c,nanLoc:l,outShapeLocation:a,outShapeStridesLocation:s,outTexShapeLocation:o}}function hF(e,t){if(e.length!==t.length)throw Error(`Binary was compiled with ${e.length} inputs, but was executed with ${t.length} inputs`);e.forEach((e,n)=>{let r=e.logicalShape,i=t[n],a=i.shape;if(!v(r,a))throw Error(`Binary was compiled with different shapes than the current args. Shapes ${r} and ${a} must match`);if(e.isUniform&&i.isUniform)return;let o=e.texShape,s=i.isUniform?null:i.texData.texShape;if(!v(o,s))throw Error(`Binary was compiled with different texture shapes than the current args. Shape ${o} and ${s} must match`)})}function gF(e,t,n,r,i){t.program.enableShapeUniforms||(hF(t.inShapeInfos,n),hF([t.outShapeInfo],[r]));let a=r.texData.texture,o=r.texData.texShape;r.texData.isPacked?e.setOutputPackedMatrixTexture(a.texture,o[0],o[1]):e.setOutputMatrixTexture(a.texture,o[0],o[1]),e.setProgram(t.webGLProgram),e.bindVertexArray(t.webGLProgram.vao),k().getNumber(`WEBGL_VERSION`)===1&&t.infLoc!==null&&e.gl.uniform1f(t.infLoc,1/0),t.nanLoc!==null&&e.gl.uniform1f(t.nanLoc,NaN);for(let r=0;r<n.length;++r){let i=n[r],{uniform:a,offset:o,shape:s,texShape:c}=t.variablesLocations[r];if(s){let{uniformShape:n}=uF(t.program.packedInputs,i.shape,i.texData.texShape);switch(n.length){case 1:e.gl.uniform1iv(s,new Int32Array(n));break;case 2:e.gl.uniform2iv(s,new Int32Array(n));break;case 3:e.gl.uniform3iv(s,new Int32Array(n));break;case 4:e.gl.uniform4iv(s,new Int32Array(n))}}if(c&&e.gl.uniform2i(c,i.texData.texShape[0],i.texData.texShape[1]),a!=null){if(i.isUniform){if(_(i.shape)<2)e.gl.uniform1f(a,i.uniformValues[0]);else{let t=i.uniformValues;t instanceof Float32Array||(t=new Float32Array(t)),e.gl.uniform1fv(a,t)}continue}i.texData.slice!=null&&o!=null&&e.gl.uniform1i(o,i.texData.slice.flatOffset),e.setInputMatrixTexture(i.texData.texture.texture,a,r)}}let s=t.outShapeLocation;if(s)switch(r.shape.length){case 1:e.gl.uniform1iv(s,new Int32Array(r.shape));break;case 2:e.gl.uniform2iv(s,new Int32Array(r.shape));break;case 3:e.gl.uniform3iv(s,new Int32Array(r.shape));break;case 4:e.gl.uniform4iv(s,new Int32Array(r.shape))}if(t.outShapeStridesLocation){let n=O(r.shape);switch(r.shape.length){case 2:e.gl.uniform1iv(t.outShapeStridesLocation,new Int32Array(n));break;case 3:e.gl.uniform2iv(t.outShapeStridesLocation,new Int32Array(n));break;case 4:e.gl.uniform3iv(t.outShapeStridesLocation,new Int32Array(n))}}if(t.outTexShapeLocation&&e.gl.uniform2i(t.outTexShapeLocation,r.texData.texShape[0],r.texData.texShape[1]),t.program.customUniforms&&i)for(let n=0;n<t.program.customUniforms.length;++n){let r=t.program.customUniforms[n],a=t.customUniformLocations[n],o=i[n];if(r.type===`float`)e.gl.uniform1fv(a,o);else if(r.type===`vec2`)e.gl.uniform2fv(a,o);else if(r.type===`vec3`)e.gl.uniform3fv(a,o);else if(r.type===`vec4`)e.gl.uniform4fv(a,o);else if(r.type===`int`)e.gl.uniform1iv(a,o);else if(r.type===`ivec2`)e.gl.uniform2iv(a,o);else if(r.type===`ivec3`)e.gl.uniform3iv(a,o);else if(r.type===`ivec4`)e.gl.uniform4iv(a,o);else throw Error(`uniform type ${r.type} is not supported yet.`)}e.executeProgram()}function _F(e,t,n){let r=``;t.concat(n).forEach(t=>{let i=t.texData!=null&&t.texData.slice!=null&&t.texData.slice.flatOffset>0;if(e.enableShapeUniforms&&!t.isUniform){let a=t.texData.texShape,{useSqueezeShape:o,uniformShape:s,keptDims:c}=uF(e.packedInputs,t.shape,a),l=``,u=``,d=``;if(s.length===1&&e.packedInputs){let e=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];l=`${e[0]>1}_${e[1]>1}`}else if(s.length===2&&!e.packedInputs)u=`${s[0]>1}_${s[1]>1}`;else if(s.length>2&&!e.packedInputs){let e=O(s);d=`${e[0]===a[1]}_${e[e.length-1]===a[1]}`}let f=t.shape.length,p=s.length===2&&v(t.shape,a),m=_(t.shape)===1,h=Tc(t.shape,n.shape),g=!e.packedInputs&&f===n.shape.length&&v(a,n.texData.texShape),y=e.packedInputs||s.length>2?``:`${a[0]>1}_${a[1]>1}`;r+=`${f}_${g}_${o?c:``}_${s.length}_${m}_${h}_${p}_${l}_${u}_${d}_${y}_${i}`}else{let e=t.isUniform?`uniform`:t.texData.texShape;r+=`${t.shape}_${e}_${i}`}});let i=e.userCode,a=e.constructor.name;return a+=`_`+r+`_`+i+`${k().getNumber(`WEBGL_VERSION`)}`,a}function vF(e){return k().getBool(`WEBGL_USE_SHAPES_UNIFORMS`)&&e<=4}var yF=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=uN.DENSE,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let t=pP();this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?hP([`r`,`c`,`d`],e):mP([`r`,`c`,`d`],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getA(rc.x, rc.y, rc.z);
        }

        ${t.output} = result;
      }
    `}},bF=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=uN.DENSE,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let t=pP();this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?hP([`r`,`c`,`d`],e):mP([`r`,`c`,`d`],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getChannel(getA(rc.x, rc.y, rc.z), vec2(rc.y, rc.z));
        }

        ${t.output} = result;
      }
    `}},xF=class{constructor(e){this.variableNames=[`A`],this.outTexUsage=dN.DOWNLOAD;let t=pP();this.outputShape=e,this.userCode=`
      ${bP}

      void main() {
        float x = getAAtOutCoords();
        ${t.output} = encode_float(x);
      }
    `}},SF=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=dN.DOWNLOAD;let t=pP();this.outputShape=e,this.userCode=`
      ${bP}

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        ${t.output} = encode_float(x);
      }
    `}},CF={R:0,G:1,B:2,A:3},wF=class{constructor(e,t=!1,n=`RGBA`){this.variableNames=[`A`],this.customUniforms=[{name:`texShape`,type:`ivec2`}];let r=pP();this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length);let i=`result`;t&&(i=`floor(result * 255. + 0.5)`);let a=``;for(let e=0;e<n.length;e++){let t=n[e];a+=`
          if(offset == ${e}) {
            result = values[${CF[t]}];
          }`}this.userCode=`
      ${this.enableShapeUniforms?yP():vP(e)}

      void main() {
        ivec3 coords = getOutputCoords();
        int flatIndex = getFlatIndex(coords);
        float result = 0.;
        int offset = imod(flatIndex, ${n.length});

        flatIndex = idiv(flatIndex, ${n.length}, 1.);

        int r = flatIndex / texShape[1];
        if (r < texShape[0]) {
          int c = imod(flatIndex, texShape[1]);
          vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
          vec4 values = ${r.texture2D}(A, uv);
          ${a}
        }
        ${r.output} = vec4(${i}, 0., 0., 0.);
      }
    `}},TF=class{constructor(e,t=!1){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let n=pP();this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length);let r=``,i=`result`;t&&(i=`floor(result * 255. + 0.5)`);for(let t=0;t<=1;t++)for(let i=0;i<=1;i++){let a=t*2+i;r+=`
          localCoords = coords;
          if(localCoords[2] + ${i} < ${this.enableShapeUniforms?`outShape[2]`:`${e[2]}`}) {
          localCoords[2] += ${i};
          if (localCoords[1] + ${t} < ${this.enableShapeUniforms?`outShape[1]`:`${e[1]}`}) {
            localCoords[1] += ${t};

            flatIndex = getFlatIndex(localCoords);
            offset = imod(flatIndex, 4);

            flatIndex = idiv(flatIndex, 4, 1.);

            int r = flatIndex / texShape[1];
            int c = imod(flatIndex, texShape[1]);
            vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
            values = ${n.texture2D}(A, uv);

            if (offset == 0) {
              result[${a}] = values[0];
            } else if (offset == 1) {
              result[${a}] = values[1];
            } else if (offset == 2) {
              result[${a}] = values[2];
            } else {
              result[${a}] = values[3];
            }
          }
        }
        `}this.userCode=`
        ${this.enableShapeUniforms?yP():vP(e)}

        void main() {
          ivec3 coords = getOutputCoords();

          vec4 result = vec4(0.);
          int flatIndex, r, c, offset;
          ivec3 localCoords;
          vec2 uv;
          vec4 values;

          ${r}

          ${n.output} = ${i};
        }
    `}};function EF(e){let t=pP();return TN(e,`${t.version}
    precision highp float;
    ${t.attribute} vec3 clipSpacePos;
    ${t.attribute} vec2 uv;
    ${t.varyingVs} vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`)}function DF(e){return MN(e,new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]))}function OF(e){return NN(e,new Uint16Array([0,1,2,2,1,3]))}function kF(e,t,n,r,i,a){FN(t,n);let o=PN(e),s=e.TEXTURE_2D;return Z(e,()=>e.bindTexture(s,o)),Z(e,()=>e.texParameteri(s,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE)),Z(e,()=>e.texParameteri(s,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)),Z(e,()=>e.texParameteri(s,e.TEXTURE_MIN_FILTER,e.NEAREST)),Z(e,()=>e.texParameteri(s,e.TEXTURE_MAG_FILTER,e.NEAREST)),k().getNumber(`WEBGL_VERSION`)===1?Z(e,()=>e.texImage2D(s,0,r,t,n,0,i,a,null)):Z(e,()=>e.texStorage2D(s,1,r,t,n)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,null)),{texture:o,texShape:[n,t]}}function AF(e){return e.internalFormatFloat}function jF(e,t,n,r){let[i,a]=pN(t,n);return kF(e,i,a,AF(r),r.textureFormatFloat,e.FLOAT)}function MF(e){return e.internalFormatHalfFloat}function NF(e,t,n,r){let[i,a]=pN(t,n);return kF(e,i,a,MF(r),r.textureFormatFloat,r.textureTypeHalfFloat)}function PF(e){return e.downloadTextureFormat}function FF(e,t,n,r){let[i,a]=pN(t,n);return kF(e,i,a,PF(r),e.RGBA,e.UNSIGNED_BYTE)}function IF(e){return e.internalFormatPackedFloat}function LF(e,t,n,r){let[i,a]=gN(t,n);return kF(e,i,a,IF(r),e.RGBA,e.FLOAT)}function RF(e){return e.internalFormatPackedHalfFloat}function zF(e,t,n,r){let[i,a]=gN(t,n);return kF(e,i,a,RF(r),e.RGBA,r.textureTypeHalfFloat)}function BF(e,t,n){return Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,n)),LN(e,t,`clipSpacePos`,n,3,20,0)&&LN(e,t,`uv`,n,2,20,12)}function VF(e,t,n,r,i,a){Z(e,()=>e.bindTexture(e.TEXTURE_2D,t));let o,s,c;i instanceof Uint8Array?(o=new Uint8Array(n*r*4),s=e.UNSIGNED_BYTE,c=e.RGBA):(o=new Float32Array(n*r*4),s=e.FLOAT,c=a.internalFormatPackedFloat),o.set(i),k().getNumber(`WEBGL_VERSION`)===2?Z(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,n,r,e.RGBA,s,o)):Z(e,()=>e.texImage2D(e.TEXTURE_2D,0,c,n,r,0,e.RGBA,s,o)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,null))}function HF(e,t,n){Z(e,()=>e.bindTexture(e.TEXTURE_2D,t)),n.data instanceof Uint8Array?k().getNumber(`WEBGL_VERSION`)===2?Z(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,e.RGBA,e.UNSIGNED_BYTE,n.data)):Z(e,()=>e.texImage2D(e.TEXTURE_2D,0,e.RGBA,n.width,n.height,0,e.RGBA,e.UNSIGNED_BYTE,n.data)):k().getNumber(`WEBGL_VERSION`)===2?Z(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,e.RGBA,e.UNSIGNED_BYTE,n)):Z(e,()=>e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,null))}function UF(e,t,n,r){let i=e.createBuffer();Z(e,()=>e.bindBuffer(e.PIXEL_PACK_BUFFER,i));let a=16*t*n;return Z(e,()=>e.bufferData(e.PIXEL_PACK_BUFFER,a,e.STREAM_READ)),Z(e,()=>e.readPixels(0,0,n,t,e.RGBA,e.FLOAT,0)),Z(e,()=>e.bindBuffer(e.PIXEL_PACK_BUFFER,null)),i}function WF(e,t,n){let r=e,i=new Float32Array(n);return r.bindBuffer(r.PIXEL_PACK_BUFFER,t),r.getBufferSubData(r.PIXEL_PACK_BUFFER,0,i),r.bindBuffer(r.PIXEL_PACK_BUFFER,null),i}function GF(e,t,n,r){let[i,a]=pN(t,n),o=new Uint8Array(mN(t*n,4));return Z(e,()=>e.readPixels(0,0,i,a,r.downloadTextureFormat,e.UNSIGNED_BYTE,o)),new Float32Array(o.buffer)}function KF(e,t,n,r,i,a,o,s){let c=e,l=new Float32Array(_N(a,o));return c.bindBuffer(c.PIXEL_PACK_BUFFER,t),c.getBufferSubData(c.PIXEL_PACK_BUFFER,0,l),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),l}function qF(e,t,n){let r=new Float32Array(t*n*4);return Z(e,()=>e.readPixels(0,0,n,t,e.RGBA,e.FLOAT,r)),r}var JF=class{constructor(e){this.outputTexture=null,this.program=null,this.disposed=!1,this.itemsToPoll=[];let t=k().getNumber(`WEBGL_VERSION`);if(e==null?this.gl=sN(t):(this.gl=e,oN(t,e)),e=this.gl,k().getNumber(`WEBGL_VERSION`)===2){let t=e;this.createVertexArray=()=>Z(t,()=>t.createVertexArray()),this.bindVertexArray=e=>Z(t,()=>t.bindVertexArray(e)),this.deleteVertexArray=e=>Z(t,()=>t.deleteVertexArray(e)),this.getVertexArray=()=>Z(t,()=>t.getParameter(t.VERTEX_ARRAY_BINDING))}else if(e!=null){let t=e.getExtension(`OES_vertex_array_object`);if(t==null)throw Error(`All WebGL1 implementations are expected to offer OES_vertex_array_object.`);this.createVertexArray=()=>Z(e,()=>t.createVertexArrayOES()),this.bindVertexArray=n=>Z(e,()=>t.bindVertexArrayOES(n)),this.deleteVertexArray=n=>Z(e,()=>t.deleteVertexArrayOES(n)),this.getVertexArray=()=>Z(e,()=>e.getParameter(t.VERTEX_ARRAY_BINDING_OES))}let n=`WEBGL_color_buffer_float`,r=`EXT_color_buffer_half_float`;if(this.parallelCompilationExtension=this.gl.getExtension(`KHR_parallel_shader_compile`),k().getNumber(`WEBGL_VERSION`)===1){let e=`OES_texture_half_float`;if(this.textureFloatExtension=wN(this.gl,`OES_texture_float`),aP(this.gl,e))this.textureHalfFloatExtension=wN(this.gl,e);else if(k().get(`WEBGL_FORCE_F16_TEXTURES`))throw Error(`GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.`);if(this.colorBufferFloatExtension=this.gl.getExtension(n),aP(this.gl,r))this.colorBufferHalfFloatExtension=wN(this.gl,r);else if(k().get(`WEBGL_FORCE_F16_TEXTURES`))throw Error(`GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.`)}else if(n=`EXT_color_buffer_float`,aP(this.gl,n))this.colorBufferFloatExtension=this.gl.getExtension(n);else if(aP(this.gl,r))this.colorBufferHalfFloatExtension=this.gl.getExtension(r);else throw Error(`GL context does not support color renderable floats`);this.vertexBuffer=DF(this.gl),this.indexBuffer=OF(this.gl),this.framebuffer=IN(this.gl),this.textureConfig=vN(this.gl,this.textureHalfFloatExtension)}get debug(){return k().getBool(`DEBUG`)}dispose(){if(this.disposed)return;this.program!=null&&console.warn(`Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing.`),this.outputTexture!=null&&console.warn(`Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.`);let e=this.gl;Z(e,()=>e.finish()),Z(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,null)),Z(e,()=>e.deleteFramebuffer(this.framebuffer)),Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,null)),Z(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)),Z(e,()=>e.deleteBuffer(this.indexBuffer)),this.disposed=!0}createFloat32MatrixTexture(e,t){return this.throwIfDisposed(),jF(this.gl,e,t,this.textureConfig)}createFloat16MatrixTexture(e,t){return this.throwIfDisposed(),NF(this.gl,e,t,this.textureConfig)}createUnsignedBytesMatrixTexture(e,t){return this.throwIfDisposed(),FF(this.gl,e,t,this.textureConfig)}uploadPixelDataToTexture(e,t){this.throwIfDisposed(),HF(this.gl,e,t)}uploadDenseMatrixToTexture(e,t,n,r){this.throwIfDisposed(),VF(this.gl,e,t,n,r,this.textureConfig)}createFloat16PackedMatrixTexture(e,t){return this.throwIfDisposed(),zF(this.gl,e,t,this.textureConfig)}createPackedMatrixTexture(e,t){return this.throwIfDisposed(),LF(this.gl,e,t,this.textureConfig)}deleteMatrixTexture(e){this.throwIfDisposed(),this.outputTexture===e&&(UN(this.gl,this.framebuffer),this.outputTexture=null),Z(this.gl,()=>this.gl.deleteTexture(e))}downloadByteEncodedFloatMatrixFromOutputTexture(e,t,n){return this.downloadMatrixDriver(e,()=>GF(this.gl,t,n,this.textureConfig))}downloadPackedMatrixFromBuffer(e,t,n,r,i,a){return KF(this.gl,e,t,n,r,i,a,this.textureConfig)}downloadFloat32MatrixFromBuffer(e,t){return WF(this.gl,e,t)}createBufferFromTexture(e,t,n){this.bindTextureToFrameBuffer(e);let r=UF(this.gl,t,n,this.textureConfig);return this.unbindTextureToFrameBuffer(),r}createAndWaitForFence(){let e=this.createFence(this.gl);return this.pollFence(e)}createFence(e){let t,n;if(k().getBool(`WEBGL_FENCE_API_ENABLED`)){let r=e,i=r.fenceSync(r.SYNC_GPU_COMMANDS_COMPLETE,0);e.flush(),n=()=>{let e=r.clientWaitSync(i,0,0);return e===r.ALREADY_SIGNALED||e===r.CONDITION_SATISFIED},t=i}else k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)>0?(t=this.beginQuery(),this.endQuery(),n=()=>this.isQueryAvailable(t,k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))):n=()=>!0;return{query:t,isFencePassed:n}}downloadMatrixFromPackedTexture(e,t,n){return this.downloadMatrixDriver(e,()=>qF(this.gl,t,n))}createProgram(e){this.throwIfDisposed();let t=this.gl;this.vertexShader??=EF(t);let n=kN(t);Z(t,()=>t.attachShader(n,this.vertexShader)),Z(t,()=>t.attachShader(n,e)),AN(t,n);let r=Object.assign(n,{vao:this.createVertexArray()});return this.debug&&jN(t,r),r}buildVao(e){this.setProgram(e),this.bindVertexArray(e.vao);let t=this.gl;Z(t,()=>t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.indexBuffer)),BF(t,e,this.vertexBuffer)}deleteProgram(e){this.throwIfDisposed(),e===this.program&&(this.program=null),e!=null&&(Z(this.gl,()=>this.gl.deleteProgram(e)),this.deleteVertexArray(e.vao))}setProgram(e){this.throwIfDisposed(),this.program=e,this.program!=null&&this.debug&&jN(this.gl,this.program),Z(this.gl,()=>this.gl.useProgram(e))}getUniformLocation(e,t,n=!0){return this.throwIfDisposed(),n?zN(this.gl,e,t):BN(this.gl,e,t)}getAttributeLocation(e,t){return this.throwIfDisposed(),Z(this.gl,()=>this.gl.getAttribLocation(e,t))}getUniformLocationNoThrow(e,t){return this.throwIfDisposed(),this.gl.getUniformLocation(e,t)}setInputMatrixTexture(e,t,n){this.throwIfDisposed(),this.throwIfNoProgram(),VN(this.gl,e,t,n)}setOutputMatrixTexture(e,t,n){this.setOutputMatrixTextureDriver(e,n,t)}setOutputPackedMatrixTexture(e,t,n){this.throwIfDisposed();let[r,i]=gN(t,n);this.setOutputMatrixTextureDriver(e,r,i)}setOutputMatrixWriteRegion(e,t,n,r){this.setOutputMatrixWriteRegionDriver(n,e,r,t)}setOutputPackedMatrixWriteRegion(e,t,n,r){throw Error(`setOutputPackedMatrixWriteRegion not implemented.`)}debugValidate(){this.program!=null&&jN(this.gl,this.program),WN(this.gl)}executeProgram(){this.throwIfDisposed(),this.throwIfNoProgram();let e=this.gl;if(this.debug){let e=this.getVertexArray();console.assert(e===this.program.vao,`VAO changed between setProgram and executeProgram!`),this.debugValidate()}Z(e,()=>e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0))}blockUntilAllProgramsCompleted(){this.throwIfDisposed(),Z(this.gl,()=>this.gl.finish())}getQueryTimerExtension(){return this.disjointQueryTimerExtension??=wN(this.gl,k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2?`EXT_disjoint_timer_query_webgl2`:`EXT_disjoint_timer_query`),this.disjointQueryTimerExtension}getQueryTimerExtensionWebGL2(){return this.getQueryTimerExtension()}getQueryTimerExtensionWebGL1(){return this.getQueryTimerExtension()}beginQuery(){if(k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2){let e=this.gl,t=this.getQueryTimerExtensionWebGL2(),n=e.createQuery();return e.beginQuery(t.TIME_ELAPSED_EXT,n),n}let e=this.getQueryTimerExtensionWebGL1(),t=e.createQueryEXT();return e.beginQueryEXT(e.TIME_ELAPSED_EXT,t),t}endQuery(){if(k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2){let e=this.gl,t=this.getQueryTimerExtensionWebGL2();e.endQuery(t.TIME_ELAPSED_EXT);return}let e=this.getQueryTimerExtensionWebGL1();e.endQueryEXT(e.TIME_ELAPSED_EXT)}async waitForQueryAndGetTime(e){return await S(()=>this.disposed||this.isQueryAvailable(e,k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))),this.getQueryTime(e,k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))}getQueryTime(e,t){if(t===0)return null;if(t===2){let t=this.gl;return t.getQueryParameter(e,t.QUERY_RESULT)/1e6}{let t=this.getQueryTimerExtensionWebGL1();return t.getQueryObjectEXT(e,t.QUERY_RESULT_EXT)/1e6}}isQueryAvailable(e,t){if(t===0)return!0;if(t===2){let t=this.gl,n=this.getQueryTimerExtensionWebGL2(),r=t.getQueryParameter(e,t.QUERY_RESULT_AVAILABLE);return this.disjoint??=this.gl.getParameter(n.GPU_DISJOINT_EXT),r&&!this.disjoint}{let t=this.getQueryTimerExtensionWebGL1(),n=t.getQueryObjectEXT(e,t.QUERY_RESULT_AVAILABLE_EXT);return this.disjoint??=this.gl.getParameter(t.GPU_DISJOINT_EXT),n&&!this.disjoint}}pollFence(e){return new Promise(t=>{this.addItemToPoll(()=>e.isFencePassed(),()=>t())})}pollItems(){let e=YF(this.itemsToPoll.map(e=>e.isDoneFn));for(let t=0;t<=e;++t){let{resolveFn:e}=this.itemsToPoll[t];e()}this.itemsToPoll=this.itemsToPoll.slice(e+1)}addItemToPoll(e,t){if(this.itemsToPoll.push({isDoneFn:e,resolveFn:t}),this.itemsToPoll.length>1)return;let n;`setTimeoutCustom`in k().platform&&(n=k().platform.setTimeoutCustom.bind(k().platform)),S(()=>(this.pollItems(),this.itemsToPoll.length===0),()=>0,null,n)}bindTextureToFrameBuffer(e){this.throwIfDisposed(),HN(this.gl,e,this.framebuffer),this.debug&&WN(this.gl)}unbindTextureToFrameBuffer(){this.outputTexture==null?UN(this.gl,this.framebuffer):(HN(this.gl,this.outputTexture,this.framebuffer),this.debug&&WN(this.gl))}downloadMatrixDriver(e,t){this.bindTextureToFrameBuffer(e);let n=t();return this.unbindTextureToFrameBuffer(),n}setOutputMatrixTextureDriver(e,t,n){this.throwIfDisposed();let r=this.gl;HN(r,e,this.framebuffer),this.debug&&WN(r),this.outputTexture=e,Z(r,()=>r.viewport(0,0,t,n)),Z(r,()=>r.scissor(0,0,t,n))}setOutputMatrixWriteRegionDriver(e,t,n,r){this.throwIfDisposed(),Z(this.gl,()=>this.gl.scissor(e,t,n,r))}throwIfDisposed(){if(this.disposed)throw Error(`Attempted to use disposed GPGPUContext.`)}throwIfNoProgram(){if(this.program==null)throw Error(`No GPU program is currently set.`)}};function YF(e){let t=0;for(;t<e.length&&e[t]();++t);return t-1}var{addImpl:XF,bincountImpl:ZF,bincountReduceImpl:QF,bitwiseAndImpl:$F,castImpl:eI,ceilImpl:tI,concatImpl:nI,equalImpl:rI,expImpl:iI,expm1Impl:aI,floorImpl:oI,gatherNdImpl:sI,gatherV2Impl:cI,greaterImpl:lI,greaterEqualImpl:uI,lessImpl:dI,lessEqualImpl:fI,linSpaceImpl:pI,logImpl:mI,maxImpl:hI,maximumImpl:gI,minimumImpl:_I,multiplyImpl:vI,negImpl:yI,notEqualImpl:bI,prodImpl:xI,raggedGatherImpl:SI,raggedRangeImpl:CI,raggedTensorToTensorImpl:wI,rangeImpl:TI,rsqrtImpl:EI,scatterImpl:DI,sigmoidImpl:OI,simpleAbsImpl:kI,sliceImpl:AI,sparseFillEmptyRowsImpl:jI,sparseReshapeImpl:MI,sparseSegmentReductionImpl:NI,sqrtImpl:PI,staticRegexReplaceImpl:FI,stridedSliceImpl:II,stringNGramsImpl:LI,stringSplitImpl:RI,stringToHashBucketFastImpl:zI,subImpl:BI,tileImpl:VI,topKImpl:HI,transposeImpl:UI,uniqueImpl:WI}=YD;function GI(e,t){return[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,t).map(t=>`${e}.${t}`)}function KI(e,t){return t===1?[e]:GI(e,t)}function qI(e,t){if(e===1)return`rc`;let n=``;for(let r=0;r<e;r++)n+=t[r],r<e-1&&(n+=`,`);return n}var JI=class{constructor(e){if(this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.enableShapeUniforms=vF(this.outputShape.length),this.rank===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{let e=KI(`rc`,this.rank),t=lF(this.rank),n=this.getOutOfBoundsCondition(e),r=this.getSetup(e),i=this.getOutput(e);this.userCode=`
        void main() {
          ${t} rc = getOutputCoords();

          if(${n}) {
            setOutput(vec4(0));
          } else {
            ${r}

            setOutput(vec4(${i}));
          }
        }
      `}}getSourceCoordsArr(e){let t=[];for(let n=0;n<=1;n++)for(let r=0;r<=1;r++){let i=`${n===0?`r`:`rp1`}, ${r===0?`c`:`cp1`}`;for(let t=2;t<this.rank;t++)i=`${e[e.length-1-t]},`+i;t.push(i)}return t}getOutOfBoundsCondition(e){if(this.rank===1)return`rc > ${this.enableShapeUniforms?`outShape`:this.outputShape[0]}`;let t=``;for(let n=this.rank-2;n<this.rank;n++)t+=`${e[n]} >= ${this.enableShapeUniforms?`outShape[${n}]`:this.outputShape[n]}`,n<this.rank-1&&(t+=`||`);return t}getSetup(e){if(this.rank===1)return``;let t=e.slice(-2),n=this.enableShapeUniforms?`outShape[${this.rank} - 1]`:this.outputShape[this.rank-1],r=this.enableShapeUniforms?`outShape[${this.rank} - 2]`:this.outputShape[this.rank-2];return`
      int r = ${t[0]};
      int c = ${t[1]};
      int rp1 = r + 1;
      int cp1 = c + 1;

      bool cEdge = cp1 >= ${n};
      bool rEdge = rp1 >= ${r};
    `}getOutput(e){let t=this.getSourceCoordsArr(e);return this.rank===1?`getA(rc), (rc + 1 >= ${this.enableShapeUniforms?`outShape`:this.outputShape[0]} ? 0. : getA(rc + 1)), 0, 0`:`getA(${t[0]}),
            cEdge ? 0. : getA(${t[1]}),
            rEdge ? 0. : getA(${t[2]}),
            rEdge || cEdge ? 0. : getA(${t[3]})`}},YI=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`inputShape`,type:`ivec3`}],this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length);let n=``;for(let e=0;e<4;e++){let t=`thisRC = rc;`;e%2==1&&(t+=`thisRC.z += 1;`),e>1&&(t+=`thisRC.y += 1;`),n+=`
        ${t}
        ${e>0?`if(thisRC.y < rows && thisRC.z < cols){`:``}
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${e}] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        ${e>0?`}`:``}
      `}this.userCode=`
      ${XI(t,this.enableShapeUniforms)}
      ${this.enableShapeUniforms?yP():vP(e)}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = ${this.enableShapeUniforms?`outShape[1]`:e[1]};
        int cols = ${this.enableShapeUniforms?`outShape[2]`:e[2]};

        ${n}

        setOutput(result);
      }
    `}};function XI(e,t){return`
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${t?_P([`r`,`c`,`d`],`inputShape`):mP([`r`,`c`,`d`],e)}
      return ivec3(r, c, d);
    }
  `}var ZI=class{constructor(e){this.gpgpu=e,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0,this.freeTextures={},this.usedTextures={},this.logEnabled=!1}acquireTexture(e,t,n){let r=nL(t,n),i=rL(e,r,n);i in this.freeTextures||(this.freeTextures[i]=[]),i in this.usedTextures||(this.usedTextures[i]=[]);let a=$I(e,r,this.gpgpu.gl,this.gpgpu.textureConfig,n);if(this.freeTextures[i].length>0){this.numFreeTextures--,this.numUsedTextures++,this._numBytesFree-=a,this.log();let e=this.freeTextures[i].pop();return this.usedTextures[i].push(e),e}let o;return r===fN.PACKED_2X2_FLOAT32?o=this.gpgpu.createPackedMatrixTexture(e[0],e[1]):r===fN.PACKED_2X2_FLOAT16?o=this.gpgpu.createFloat16PackedMatrixTexture(e[0],e[1]):r===fN.UNPACKED_FLOAT32?o=this.gpgpu.createFloat32MatrixTexture(e[0],e[1]):r===fN.UNPACKED_FLOAT16?o=this.gpgpu.createFloat16MatrixTexture(e[0],e[1]):r===fN.PACKED_4X1_UNSIGNED_BYTE&&(o=this.gpgpu.createUnsignedBytesMatrixTexture(e[0],e[1])),this.usedTextures[i].push(o),this.numUsedTextures++,this._numBytesAllocated+=a,this.log(),o}releaseTexture(e,t,n,r){if(this.freeTextures==null)return;let i=nL(n,r),a=rL(t,i,r);a in this.freeTextures||(this.freeTextures[a]=[]);let o=$I(t,i,this.gpgpu.gl,this.gpgpu.textureConfig,r),s=k().getNumber(`WEBGL_DELETE_TEXTURE_THRESHOLD`);s!==-1&&this._numBytesAllocated>s?(this.gpgpu.deleteMatrixTexture(e.texture),this._numBytesAllocated-=o):(this.freeTextures[a].push(e),this.numFreeTextures++,this._numBytesFree+=o),this.numUsedTextures--;let c=this.usedTextures[a],l=c&&c.indexOf(e);if(l==null||l<0)throw Error(`Cannot release a texture that was never provided by this texture manager`);c[l]=c[c.length-1],c.pop(),this.log()}log(){if(!this.logEnabled)return;let e=this.numFreeTextures+this.numUsedTextures;console.log(`Free/Used`,`${this.numFreeTextures} / ${this.numUsedTextures}`,`(${e})`);let t=this._numBytesFree/this._numBytesAllocated;console.log(`Bytes allocated: ${this._numBytesAllocated}`),console.log(`Bytes unused: ${this._numBytesFree} (${Math.round(100*t)}%)`)}get numBytesAllocated(){return this._numBytesAllocated}get numBytesFree(){return this._numBytesFree}getNumUsedTextures(){return this.numUsedTextures}getNumFreeTextures(){return this.numFreeTextures}dispose(){if(this.freeTextures!=null){for(let e in this.freeTextures)this.freeTextures[e].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});for(let e in this.usedTextures)this.usedTextures[e].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0}}};function QI(e,t){let n=e;if(t===n.R32F)return 4;if(t===n.R16F)return 2;if(t===n.RGBA32F||t===e.RGBA)return 16;if(t===n.RGBA16F)return 8;if(t===n.RGBA8)return 4;throw Error(`Unknown internal format ${t}`)}function $I(e,t,n,r,i){let a=eL(t,r),o;if(i){let[t,n]=gN(e[0],e[1]);o=t*n}else{let[t,n]=pN(e[0],e[1]);o=t*n}let s=QI(n,a);return o*s}function eL(e,t){switch(e){case fN.PACKED_2X2_FLOAT32:return IF(t);case fN.PACKED_2X2_FLOAT16:return RF(t);case fN.UNPACKED_FLOAT32:return AF(t);case fN.UNPACKED_FLOAT16:return MF(t);case fN.PACKED_4X1_UNSIGNED_BYTE:return PF(t);default:throw Error(`Unknown physical texture type ${e}`)}}function tL(e){return k().getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)?e?fN.PACKED_2X2_FLOAT32:fN.UNPACKED_FLOAT32:e?fN.PACKED_2X2_FLOAT16:fN.UNPACKED_FLOAT16}function nL(e,t){if(e===dN.UPLOAD)return fN.PACKED_2X2_FLOAT32;if(e===dN.RENDER||e==null)return tL(t);if(e===dN.DOWNLOAD||e===dN.PIXELS)return fN.PACKED_4X1_UNSIGNED_BYTE;throw Error(`Unknown logical texture type ${e}`)}function rL(e,t,n){return`${e[0]}_${e[1]}_${t}_${n}`}var iL=class{constructor(e,t){this.variableNames=[`A`],this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length),this.userCode=`
      float unaryOperation(float x) {
        ${t}
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `}},aL=`if (isnan(x)) return x;`,oL=`return x;`,sL=`return abs(x);`,cL=`return (x >= 0.0) ? x : (exp(x) - 1.0);`,lL=aL+`
  return (x < 0.0) ? 0.0 : x;
`,uL=aL+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,dL=`return x;`,fL=`return 1.0 / (1.0 + exp(-1.0 * x));`,pL=`return x;`,mL=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,hL=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,gL=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,_L=`return 1.0 / (1.0 + exp(-1.0 * x));`,vL=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length),this.userCode=`
      vec4 unaryOperation(vec4 x) {
        ${t}
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `}},yL=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length);let t=e.length,n=KI(`rc`,t),r=lF(t),i=qI(t,n),a=n.slice(-2),o=t<=1?`rc`:`vec2(${a.join(`,`)})`;this.userCode=`
      void main() {
        ${r} rc = getOutputCoords();
        vec4 packedInput = getA(${i});

        setOutput(getChannel(packedInput, ${o}));
      }
    `}},bL=Ff,xL=1e-7,SL=1e-4,CL={};function wL(e){return e in CL||(CL[e]={}),CL[e]}var TL=k().getNumber(`CPU_HANDOFF_SIZE_THRESHOLD`),EL=600;function DL(){return k().global.screen==null?1024:k().global.screen.height*k().global.screen.width*window.devicePixelRatio*EL/1024/1024}var OL=class e extends s{nextDataId(){return e.nextDataId++}constructor(e){if(super(),this.pendingRead=new WeakMap,this.pendingDisposal=new WeakSet,this.dataRefCount=new WeakMap,this.numBytesInGPU=0,this.uploadWaitMs=0,this.downloadWaitMs=0,this.lastGlFlushTime=0,this.warnedAboutMemory=!1,this.pendingDeletes=0,this.disposed=!1,!k().getBool(`HAS_WEBGL`))throw Error(`WebGL is not supported on this device`);let t;e==null?(t=new JF(sN(k().getNumber(`WEBGL_VERSION`))),this.binaryCache=wL(k().getNumber(`WEBGL_VERSION`)),this.gpgpuCreatedLocally=!0):(t=e instanceof JF?e:new JF(sN(k().getNumber(`WEBGL_VERSION`),e)),this.binaryCache={},this.gpgpuCreatedLocally=!1),this.gpgpu=t,this.canvas=this.gpgpu.gl.canvas,this.textureManager=new ZI(this.gpgpu),this.numMBBeforeWarning=DL(),this.texData=new o(this,pa())}numDataIds(){return this.texData.numDataIds()-this.pendingDeletes}writeTexture(e,t,n,r,i,a){let o=this.makeTensorInfo(t,n),s=this.texData.get(o.dataId);s.isPacked=!1,s.texture={texture:e,texShape:[r,i]},s.texShape=[r,i];let c=new wF(XN(t),!1,a),l=this.runWebGLProgram(c,[o],n,[[r,i]]);return l.shape=t,s.texture=null,this.disposeIntermediateTensorInfo(o),l.dataId}write(e,t,n){if((k().getBool(`WEBGL_CHECK_NUMERICAL_PROBLEMS`)||k().getBool(`DEBUG`))&&this.checkNumericalProblems(e),n===`complex64`&&e!=null)throw Error(`Cannot write to a complex64 dtype. Please use tf.complex(real, imag).`);let r={id:this.nextDataId()};return this.texData.set(r,{shape:t,dtype:n,values:e,usage:dN.UPLOAD,refCount:1}),r}refCount(e){return this.texData.has(e)?this.texData.get(e).refCount:0}incRef(e){let t=this.texData.get(e);t.refCount++}decRef(e){if(this.texData.has(e)){let t=this.texData.get(e);t.refCount--}}move(e,t,n,r,i){if(k().getBool(`DEBUG`)&&this.checkNumericalProblems(t),r===`complex64`)throw Error(`Cannot write to a complex64 dtype. Please use tf.complex(real, imag).`);this.texData.set(e,{shape:n,dtype:r,values:t,usage:dN.UPLOAD,refCount:i})}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}readSync(e){let{values:t,dtype:n,complexTensorInfos:r,slice:i,shape:a,isPacked:o}=this.texData.get(e);if(i!=null){let t;t=o?new vL(a,dL):new iL(a,dL);let r=this.runWebGLProgram(t,[{dataId:e,shape:a,dtype:n}],n),i=this.readSync(r.dataId);return this.disposeIntermediateTensorInfo(r),i}if(t!=null)return this.convertAndCacheOnCPU(e);if(n===`string`)return t;let s=this.activeTimers!=null,c;s&&(c=ii());let l;return l=n===`complex64`?oh(this.readSync(r.real.dataId),this.readSync(r.imag.dataId)):this.getValuesFromTexture(e),s&&(this.downloadWaitMs+=ii()-c),this.convertAndCacheOnCPU(e,l)}async read(e){if(this.pendingRead.has(e)){let t=this.pendingRead.get(e);return new Promise(e=>t.push(e))}let{values:t,shape:n,slice:r,dtype:i,complexTensorInfos:a,isPacked:o}=this.texData.get(e);if(r!=null){let t;t=o?new vL(n,dL):new iL(n,dL);let r=this.runWebGLProgram(t,[{dataId:e,shape:n,dtype:i}],i),a=this.read(r.dataId);return this.disposeIntermediateTensorInfo(r),a}if(t!=null)return this.convertAndCacheOnCPU(e);if(k().getBool(`DEBUG`)&&!k().getBool(`WEBGL_DOWNLOAD_FLOAT_ENABLED`)&&k().getNumber(`WEBGL_VERSION`)===2)throw Error(`tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.`);let s=null,c;if(i!==`complex64`&&k().get(`WEBGL_BUFFER_SUPPORTED`)){c=this.decode(e);let t=this.texData.get(c.dataId);s=this.gpgpu.createBufferFromTexture(t.texture.texture,...hN(n))}this.pendingRead.set(e,[]),i!==`complex64`&&await this.gpgpu.createAndWaitForFence();let l;if(i===`complex64`){let e=await Promise.all([this.read(a.real.dataId),this.read(a.imag.dataId)]),t=e[0],n=e[1];l=oh(t,n)}else if(s==null)l=this.getValuesFromTexture(e);else{let e=_(n);l=this.gpgpu.downloadFloat32MatrixFromBuffer(s,e)}if(c!=null&&this.disposeIntermediateTensorInfo(c),s!=null){let e=this.gpgpu.gl;Z(e,()=>e.deleteBuffer(s))}let u=this.convertAndCacheOnCPU(e,l),d=this.pendingRead.get(e);return this.pendingRead.delete(e),d.forEach(e=>e(u)),this.pendingDisposal.has(e)&&(this.pendingDisposal.delete(e),this.disposeData(e)&&pa().removeDataId(e,this),this.pendingDeletes--),u}readToGPU(e,t={}){let{values:n,shape:r,slice:i,dtype:a,isPacked:o,texture:s}=this.texData.get(e);if(a===`complex64`)throw Error(`Does not support reading texture for complex64 dtype.`);if(i!=null){let n;n=o?new vL(r,dL):new iL(r,dL);let i=this.runWebGLProgram(n,[{dataId:e,shape:r,dtype:a}],a),s=this.readToGPU(i,t);return this.disposeIntermediateTensorInfo(i),s}if(s==null)throw Error(n==null?`There is no data on GPU or CPU.`:`Data is not on GPU but on CPU.`);let c=this.decode(e,t.customTexShape),l=pa().makeTensorFromTensorInfo(c),u=this.texData.get(c.dataId);return Object.assign({tensorRef:l},u.texture)}bufferSync(e){let t=this.readSync(e.dataId);if(e.dtype===`string`)try{let n=t.map(e=>oi(e));return I(e.shape,e.dtype,n)}catch{throw Error(`Failed to decode encoded string bytes into utf-8`)}return I(e.shape,e.dtype,t)}checkNumericalProblems(e){if(e!=null)for(let t=0;t<e.length;t++){let n=e[t];if(!SN(n))throw k().getBool(`WEBGL_RENDER_FLOAT32_CAPABLE`)?Error(`The value ${n} cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'`):Error(`The value ${n} cannot be represented on this device.`)}}getValuesFromTexture(e){let{shape:t,dtype:n,isPacked:r}=this.texData.get(e),i=_(t);if(k().getBool(`WEBGL_DOWNLOAD_FLOAT_ENABLED`)){let n=this.decode(e),r=this.texData.get(n.dataId),a=this.gpgpu.downloadMatrixFromPackedTexture(r.texture.texture,...hN(t)).subarray(0,i);return this.disposeIntermediateTensorInfo(n),a}let a=k().getBool(`WEBGL_PACK`)&&r===!0,o=a?XN(t):t,s=a?new SF(o):new xF(o),c=this.runWebGLProgram(s,[{shape:o,dtype:n,dataId:e}],`float32`),l=this.texData.get(c.dataId),u=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(l.texture.texture,l.texShape[0],l.texShape[1]).subarray(0,i);return this.disposeIntermediateTensorInfo(c),u}timerAvailable(){return k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0}time(e){let t=this.activeTimers,n=[],r=!1;this.programTimersStack==null?(this.programTimersStack=n,r=!0):this.activeTimers.push(n),this.activeTimers=n,e();let i=ci(this.activeTimers.map(e=>e.query)).filter(e=>e!=null),a=ci(this.activeTimers.map(e=>e.name)).filter(e=>e!=null);this.activeTimers=t,r&&(this.programTimersStack=null);let o={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null};return(async()=>{if(k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0){let e=await Promise.all(i);o.kernelMs=p(e),o.getExtraProfileInfo=()=>e.map((e,t)=>({name:a[t],ms:e})).map(e=>`${e.name}: ${e.ms}`).join(`, `)}else o.kernelMs={error:`WebGL query timers are not supported in this environment.`};return this.uploadWaitMs=0,this.downloadWaitMs=0,o})()}memory(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU,numBytesInGPUAllocated:this.textureManager.numBytesAllocated,numBytesInGPUFree:this.textureManager.numBytesFree}}startTimer(){return k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0?this.gpgpu.beginQuery():{startMs:ii(),endMs:null}}endTimer(e){return k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0?(this.gpgpu.endQuery(),e):(e.endMs=ii(),e)}async getQueryTime(e){if(k().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0)return this.gpgpu.waitForQueryAndGetTime(e);let t=e;return t.endMs-t.startMs}disposeData(e,t=!1){if(this.pendingDisposal.has(e))return!1;if(!this.texData.has(e))return!0;if(t?this.texData.get(e).refCount=0:this.texData.get(e).refCount--,!t&&this.texData.get(e).refCount>0)return!1;if(this.pendingRead.has(e))return this.pendingDisposal.add(e),this.pendingDeletes++,!1;this.releaseGPUData(e);let{complexTensorInfos:n}=this.texData.get(e);return n!=null&&(this.disposeData(n.real.dataId,t),this.disposeData(n.imag.dataId,t)),this.texData.delete(e),!0}releaseGPUData(e){let{texture:t,dtype:n,texShape:r,usage:i,isPacked:a,slice:o}=this.texData.get(e),s=o&&o.origDataId||e,c=this.dataRefCount.get(s);c>1?this.dataRefCount.set(s,c-1):(this.dataRefCount.delete(s),t!=null&&(this.numBytesInGPU-=this.computeBytes(r,n),this.textureManager.releaseTexture(t,r,i,a)));let l=this.texData.get(e);l.texture=null,l.texShape=null,l.isPacked=!1,l.slice=null}getTexture(e){return this.uploadToGPU(e),this.texData.get(e).texture.texture}getDataInfo(e){return this.texData.get(e)}shouldExecuteOnCPU(e,t=TL){return k().getBool(`WEBGL_CPU_FORWARD`)&&e.every(e=>this.texData.get(e.dataId).texture==null&&_(e.shape)<t)}getGPGPUContext(){return this.gpgpu}where(e){Er(`tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead`);let t=e.dataSync();return bL(e.shape,t)}packedUnaryOp(e,t,n){let r=new vL(e.shape,t),i=this.compileAndRun(r,[e],n);return pa().makeTensorFromTensorInfo(i)}abs(e){if(this.shouldExecuteOnCPU([e])&&e.dtype!==`complex64`){let t=kI(this.texData.get(e.dataId).values);return this.makeOutput(e.shape,e.dtype,t)}if(k().getBool(`WEBGL_PACK_UNARY_OPERATIONS`))return this.packedUnaryOp(e,sL,e.dtype);let t=new iL(e.shape,sL),n=this.compileAndRun(t,[e]);return pa().makeTensorFromTensorInfo(n)}makeTensorInfo(e,t,n){let r;if(t===`string`&&n!=null&&n.length>0&&ae(n[0])){let i=n.map(e=>ai(e));r=this.write(i,e,t)}else r=this.write(n,e,t);return this.texData.get(r).usage=null,{dataId:r,shape:e,dtype:t}}makeOutput(e,t,n){return pa().makeTensorFromTensorInfo(this.makeTensorInfo(e,t,n),this)}unpackTensor(e){let t=new yL(e.shape);return this.runWebGLProgram(t,[e],e.dtype)}packTensor(e){let t=new JI(e.shape);return this.runWebGLProgram(t,[e],e.dtype,null,!0)}packedReshape(e,t){let n=[JN(e.shape),...YN(e.shape)],r={dtype:e.dtype,shape:n,dataId:e.dataId},i=new YI([JN(t),...YN(t)],n),a=[n],o=this.runWebGLProgram(i,[r],e.dtype,a,!0);return{dataId:o.dataId,shape:t,dtype:o.dtype}}decode(e,t){let{isPacked:n,shape:r,dtype:i}=this.texData.get(e);t!=null&&m(_(r)<=t[0]*t[1]*4,()=>`customTexShape is too small. Row * Column * 4 should be equal or larger than the size of the tensor data.`);let a=XN(r),o;o=n?new bF(a):new yF(a);let s=[t??hN(a)];return{dtype:i,shape:r,dataId:this.runWebGLProgram(o,[{shape:a,dtype:i,dataId:e}],i,s,!0,t).dataId}}runWebGLProgram(e,t,n,r,i=!1,a){let o=this.makeTensorInfo(e.outputShape,n),s=this.texData.get(o.dataId);if(e.packedOutput&&(s.isPacked=!0),e.outPackingScheme===uN.DENSE&&(s.texShape=(a??hN(e.outputShape)).map(e=>e*2)),e.outTexUsage!=null&&(s.usage=e.outTexUsage),_(o.shape)===0)return s.values=E(o.dtype,0),o;let c=[],l=t.map(t=>{if(t.dtype===`complex64`)throw Error(`GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.`);let n=this.texData.get(t.dataId);if(n.texture==null){if(!e.packedInputs&&_(t.shape)<=k().getNumber(`WEBGL_SIZE_UPLOAD_UNIFORM`))return{shape:t.shape,texData:null,isUniform:!0,uniformValues:n.values};e.packedInputs&&(n.isPacked=!0,n.shape=t.shape)}if(this.uploadToGPU(t.dataId),!!n.isPacked!=!!e.packedInputs)t=n.isPacked?this.unpackTensor(t):this.packTensor(t),c.push(t),n=this.texData.get(t.dataId);else if(n.isPacked&&!$N(n.shape,t.shape)){let e=t,r=t.shape;t.shape=n.shape,t=this.packedReshape(t,r),c.push(t),n=this.texData.get(t.dataId),e.shape=r}return{shape:t.shape,texData:n,isUniform:!1}});this.uploadToGPU(o.dataId);let u={shape:o.shape,texData:s,isUniform:!1},d=_F(e,l,u),f=this.getAndSaveBinary(d,()=>pF(this.gpgpu,e,l,u)),p=this.activeTimers!=null,m;p&&(m=this.startTimer()),k().get(`ENGINE_COMPILE_ONLY`)||gF(this.gpgpu,f,l,u,r),c.forEach(e=>this.disposeIntermediateTensorInfo(e)),p&&(m=this.endTimer(m),this.activeTimers.push({name:e.constructor.name,query:this.getQueryTime(m)}));let h=k().getNumber(`WEBGL_FLUSH_THRESHOLD`);if(h>0){let e=ii();e-this.lastGlFlushTime>h&&(this.gpgpu.gl.flush(),this.lastGlFlushTime=e)}if(!k().getBool(`WEBGL_LAZILY_UNPACK`)&&s.isPacked&&i===!1){let e=this.unpackTensor(o);return this.disposeIntermediateTensorInfo(o),e}return o}compileAndRun(e,t,n,r,i=!1){return n||=t[0].dtype,this.runWebGLProgram(e,t,n,r,i)}getAndSaveBinary(e,t){return e in this.binaryCache||(this.binaryCache[e]=t()),this.binaryCache[e]}getTextureManager(){return this.textureManager}dispose(){this.disposed||=(k().getBool(`IS_TEST`)||Object.keys(this.binaryCache).forEach(e=>{this.gpgpu.deleteProgram(this.binaryCache[e].webGLProgram),delete this.binaryCache[e]}),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement<`u`&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),!0)}floatPrecision(){return this.floatPrecisionValue??=P(()=>{if(!k().get(`WEBGL_RENDER_FLOAT32_ENABLED`)){let e=k().getBool(`DEBUG`);k().set(`DEBUG`,!1);let t=this.abs(rl(1e-8)).dataSync()[0];if(k().set(`DEBUG`,e),t>0)return 32}return 16}),this.floatPrecisionValue}epsilon(){return this.floatPrecision()===32?xL:SL}uploadToGPU(e){let t=this.texData.get(e),{shape:n,dtype:r,values:i,texture:a,usage:o,isPacked:s}=t;if(a!=null)return;let c=this.activeTimers!=null,l;c&&(l=ii());let u=t.texShape;if(u??(u=ZN(n,s),t.texShape=u),i!=null){let e=XN(n),a,o=u[1],d=u[0],f=i instanceof Uint8Array||i instanceof Uint8ClampedArray;(s||!f)&&([o,d]=gN(u[0],u[1])),a=s?new TF(e,f):new wF(e,f);let p=f?[d,o]:u,m=this.makeTensorInfo(p,r),h=this.texData.get(m.dataId);h.usage=f?dN.PIXELS:dN.UPLOAD,h.texShape=p,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(m.dataId),o,d,i);let g=[[d,o]],_=this.runWebGLProgram(a,[m],r,g,!0),v=this.texData.get(_.dataId);t.texShape=v.texShape,t.isPacked=v.isPacked,t.usage=v.usage,k().get(`ENGINE_COMPILE_ONLY`)?this.disposeData(_.dataId):(t.texture=v.texture,t.values=null,this.texData.delete(_.dataId)),this.disposeIntermediateTensorInfo(m),c&&(this.uploadWaitMs+=ii()-l)}else t.texture=this.acquireTexture(u,o,r,s)}convertAndCacheOnCPU(e,t){let n=this.texData.get(e),{dtype:r}=n;return t!=null&&(n.values=kL(t,r)),n.values}acquireTexture(e,t,n,r){if(this.numBytesInGPU+=this.computeBytes(e,n),!this.warnedAboutMemory&&this.numBytesInGPU>this.numMBBeforeWarning*1024*1024){let e=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn(`High memory usage in GPU: ${e} MB, most likely due to a memory leak`)}return this.textureManager.acquireTexture(e,t,r)}computeBytes(e,t){return e[0]*e[1]*re(t)}checkCompileCompletion(){for(let[,e]of Object.entries(this.binaryCache))this.checkCompletion_(e)}async checkCompileCompletionAsync(){let e=[];if(this.gpgpu.parallelCompilationExtension){for(let[,t]of Object.entries(this.binaryCache))e.push(this.checkCompletionAsync_(t));return Promise.all(e)}for(let[,t]of Object.entries(this.binaryCache)){let n=new Promise(e=>{try{this.checkCompletion_(t),e(!0)}catch(e){throw e}});e.push(n)}return Promise.all(e)}async checkCompletionAsync_(e){return this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.parallelCompilationExtension.COMPLETION_STATUS_KHR)?this.checkCompletion_(e):(await Lm(),this.checkCompletionAsync_(e))}checkCompletion_(e){if(this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.gl.LINK_STATUS)===!1)throw console.log(this.gpgpu.gl.getProgramInfoLog(e.webGLProgram)),this.gpgpu.gl.getShaderParameter(e.fragmentShader,this.gpgpu.gl.COMPILE_STATUS)===!1?(ON(e.source,this.gpgpu.gl.getShaderInfoLog(e.fragmentShader)),Error(`Failed to compile fragment shader.`)):Error(`Failed to link vertex and fragment shaders.`);return!0}getUniformLocations(){for(let e of Object.values(this.binaryCache)){this.gpgpu.buildVao(e.webGLProgram);let{variablesLocations:t,customUniformLocations:n,infLoc:r,nanLoc:i,outShapeLocation:a,outShapeStridesLocation:o,outTexShapeLocation:s}=mF(this.gpgpu,e.program,e.webGLProgram);e.variablesLocations=t,e.customUniformLocations=n,e.infLoc=r,e.nanLoc=i,e.outShapeLocation=a,e.outShapeStridesLocation=o,e.outTexShapeLocation=s}}createTensorFromGPUData(e,t,n){e.channels=e.channels||`RGBA`;let{texture:r,height:i,width:a,channels:o}=e,s=pa().backend;if(!s.gpgpu.gl.isTexture(r))throw Error(`The texture is invalid. Also, please make sure the texture and the TFJS WebGL backend are using the same canvas. If you want to use your own custom canvas, you have to create and use the custom TFJS WebGL backend created from the canvas through 'new tf.MathBackendWebGL(customCanvas)'.`);let c=s.writeTexture(r,t,n,i,a,o);return pa().makeTensorFromDataId(c,t,n,s)}};OL.nextDataId=0;function kL(e,t){if(t===`float32`||t===`complex64`)return e;if(t===`int32`||t===`bool`){let n=t===`int32`?new Int32Array(e.length):new Uint8Array(e.length);for(let t=0;t<n.length;++t)n[t]=Math.round(e[t]);return n}throw Error(`Unknown dtype ${t}`)}ea()&&ga(`webgl`,()=>new OL,2);var AL=`
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`,jL=class{constructor(e,t,n){this.variableNames=[`A`,`B`],this.outputShape=H(t,n),this.enableShapeUniforms=vF(this.outputShape.length),this.userCode=`
      float binaryOperation(float a, float b) {
        ${e}
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `}},ML=`
  result.r = isNaN.r ? NAN : result.r;
  result.g = isNaN.g ? NAN : result.g;
  result.b = isNaN.b ? NAN : result.b;
  result.a = isNaN.a ? NAN : result.a;
`,NL=class{constructor(e,t,n,r=!1){this.variableNames=[`A`,`B`],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=H(t,n);let i=this.outputShape.length;this.enableShapeUniforms=vF(i);let a=``;if(r)if(i===0||_(this.outputShape)===1)a=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(a=`
          ${lF(i)} coords = getOutputCoords();
        `,i===1)this.enableShapeUniforms?a+=`
            result.y = (coords + 1) >= outShape ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `:a+=`
            result.y = (coords + 1) >= ${this.outputShape[0]} ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{let e=KI(`coords`,i);this.enableShapeUniforms?a+=`
            bool nextRowOutOfBounds =
              (${e[i-2]} + 1) >= outShape[${i} - 2];
            bool nextColOutOfBounds =
              (${e[i-1]} + 1) >= outShape[${i} - 1];
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `:a+=`
            bool nextRowOutOfBounds =
              (${e[i-2]} + 1) >= ${this.outputShape[i-2]};
            bool nextColOutOfBounds =
              (${e[i-1]} + 1) >= ${this.outputShape[i-1]};
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `}this.userCode=`
      vec4 binaryOperation(vec4 a, vec4 b) {
        ${e}
      }

      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();

        vec4 result = binaryOperation(a, b);
        ${a}

        setOutput(result);
      }
    `}};function PL(e){let{inputs:t,backend:n}=e,{x:r}=t;return n.incRef(r.dataId),{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}var FL={kernelName:zt,backendName:`webgl`,kernelFunc:PL};function IL(e){let{inputs:t,backend:n}=e,{real:r,imag:i}=t,a=n.makeTensorInfo(r.shape,`complex64`),o=n.texData.get(a.dataId);return o.complexTensorInfos={real:PL({inputs:{x:r},backend:n}),imag:PL({inputs:{x:i},backend:n})},a}var LL={kernelName:tt,backendName:`webgl`,kernelFunc:IL},RL=`return (a < 0.) ? b * a : a;`,zL=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function BL(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{alpha:a}=r,o=n.makeTensorInfo([],`float32`,ti(a,`float32`)),s=k().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new NL(zL,i.shape,o.shape):new jL(RL,i.shape,o.shape),c=n.runWebGLProgram(s,[i,o],`float32`);return n.disposeIntermediateTensorInfo(o),c}var VL={kernelName:Gt,backendName:`webgl`,kernelFunc:BL},HL=`return (a < 0.) ? b * a : a;`,UL=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function WL(e){let{inputs:t,backend:n}=e,{x:r,alpha:i}=t,a=k().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new NL(UL,r.shape,i.shape):new jL(HL,r.shape,i.shape);return n.runWebGLProgram(a,[r,i],`float32`)}var GL={kernelName:xn,backendName:`webgl`,kernelFunc:WL},KL=`if (isnan(x)) return x;`;function qL({opSnippet:e,packedOpSnippet:t,cpuKernelImpl:n,dtype:r}){return({inputs:i,backend:a})=>{let{x:o}=i,s=a,c=r||o.dtype;if(s.shouldExecuteOnCPU([o])&&n!=null){let e=n(s.texData.get(o.dataId).values,c);return s.makeTensorInfo(o.shape,c,e)}let l=k().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)&&t!=null,u;return u=l?new vL(o.shape,t):new iL(o.shape,e),s.runWebGLProgram(u,[o],c)}}function JL({opSnippet:e,packedOpSnippet:t,checkOutOfBounds:n=!1,supportsComplex:r=!1,cpuKernelImpl:i,dtype:a}){return({inputs:o,backend:s})=>{let{a:c,b:l}=o,u=s;if(r&&c.dtype===`complex64`){let t=u.texData.get(c.dataId),n=u.texData.get(l.dataId),[r,i]=[[t.complexTensorInfos.real,n.complexTensorInfos.real],[t.complexTensorInfos.imag,n.complexTensorInfos.imag]].map(t=>{let[n,r]=t,i={dataId:n.dataId,dtype:n.dtype,shape:c.shape},a={dataId:r.dataId,dtype:r.dtype,shape:l.shape},o=new jL(e,c.shape,l.shape);return u.runWebGLProgram(o,[i,a],Ii(n.dtype,r.dtype))}),a=IL({inputs:{real:r,imag:i},backend:u});return u.disposeIntermediateTensorInfo(r),u.disposeIntermediateTensorInfo(i),a}let d=a||Ii(c.dtype,l.dtype);if((c.dtype===`string`||l.dtype===`string`||u.shouldExecuteOnCPU([c,l]))&&i!=null){let e=u.texData.get(c.dataId).values,t=u.texData.get(l.dataId).values,n=c.dtype===`string`?Hh(e):e,r=c.dtype===`string`?Hh(t):t,[a,o]=i(c.shape,l.shape,n,r,d),s=u.makeTensorInfo(o,d),f=u.texData.get(s.dataId);return f.values=a,s}let f=k().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)&&t!=null,p;return p=f?new NL(t,c.shape,l.shape,n):new jL(e,c.shape,l.shape),u.runWebGLProgram(p,[c,l],d)}}function YL(e,t=!1){if(e===`linear`)return t?pL:oL;if(e===`relu`)return t?hL:lL;if(e===`elu`)return t?mL:cL;if(e===`relu6`)return t?gL:uL;if(e===`prelu`)return t?UL:HL;if(e===`leakyrelu`)return t?zL:RL;if(e===`sigmoid`)return t?_L:fL;throw Error(`Activation ${e} has not been implemented for the WebGL backend.`)}var XL=class{constructor(e,t,n,r=!1,i=!1,a=!1,o=null,s=!1,c=!1){this.variableNames=[`matrixA`,`matrixB`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=n,this.enableShapeUniforms=vF(this.outputShape.length);let l=r?e[1]:e[2],u=Math.ceil(l/2),d=r?`i * 2, rc.y`:`rc.y, i * 2`,f=i?`rc.z, i * 2`:`i * 2, rc.z`,p=r?[`a.xxyy`,`a.zzww`]:[`a.xxzz`,`a.yyww`],m=i?[`b.xzxz`,`b.ywyw`]:[`b.xyxy`,`b.zwzw`],h=``,g=``;o&&(h=s?`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${o}
        }`:c?`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${o}
        }`:`vec4 activation(vec4 x) {
          ${o}
        }`,g=`result = activation(result);`);let _=a?`result += getBiasAtOutCoords();`:``;a&&this.variableNames.push(`bias`),s&&this.variableNames.push(`preluActivationWeights`),c&&this.variableNames.push(`leakyreluAlpha`);let v=`rc.x`,y=`rc.x`;e[0]<t[0]?v=`imod(rc.x, ${e[0]})`:t[0]<e[0]&&(y=`imod(rc.x, ${t[0]})`),this.userCode=`
      ${h}
      // Don't use uniform for sharedDimensionPacked for performance.
      const float sharedDimension = ${u}.0;

      vec4 dot2x2ARowBCol(ivec3 rc) {
        vec4 result = vec4(0);
        int batchA = ${v};
        int batchB = ${y};
        for (int i = 0; i < ${u}; i++) {
          vec4 a = getMatrixA(batchA, ${d});
          vec4 b = getMatrixB(batchB, ${f});

          // These swizzled products need to be separately added.
          // See: https://github.com/tensorflow/tfjs/issues/1735
          result += (${p[0]} * ${m[0]});
          result += (${p[1]} * ${m[1]});
        }
        return result;
      }

      void main() {
        ivec3 rc = getOutputCoords();
        vec4 result = dot2x2ARowBCol(rc);

        ${_}

        ${g}

        setOutput(result);
      }
    `}},ZL={REAL:`return areal * breal - aimag * bimag;`,IMAG:`return areal * bimag + aimag * breal;`},QL=class{constructor(e,t,n){this.variableNames=[`AReal`,`AImag`,`BReal`,`BImag`],this.outputShape=H(t,n),this.userCode=`
      float binaryOpComplex(
          float areal, float aimag, float breal, float bimag) {
        ${e}
      }

      void main() {
        float areal = getARealAtOutCoords();
        float aimag = getAImagAtOutCoords();
        float breal = getBRealAtOutCoords();
        float bimag = getBImagAtOutCoords();
        setOutput(binaryOpComplex(areal, aimag, breal, bimag));
      }
    `}},$L=`return a * b;`;function eR(e){let{inputs:t,backend:n}=e,{a:r,b:i}=t,a=Ii(r.dtype,i.dtype);if(r.dtype===`complex64`){let e=n.texData.get(r.dataId),t=n.texData.get(i.dataId),a=new QL(ZL.REAL,r.shape,i.shape),o=new QL(ZL.IMAG,r.shape,i.shape),s=[{dataId:e.complexTensorInfos.real.dataId,dtype:e.complexTensorInfos.real.dtype,shape:r.shape},{dataId:e.complexTensorInfos.imag.dataId,dtype:e.complexTensorInfos.imag.dtype,shape:r.shape},{dataId:t.complexTensorInfos.real.dataId,dtype:t.complexTensorInfos.real.dtype,shape:i.shape},{dataId:t.complexTensorInfos.imag.dataId,dtype:t.complexTensorInfos.imag.dtype,shape:i.shape}],c=n.runWebGLProgram(a,s,`float32`),l=n.runWebGLProgram(o,s,`float32`),u=IL({inputs:{real:c,imag:l},backend:n});return n.disposeIntermediateTensorInfo(c),n.disposeIntermediateTensorInfo(l),u}if(n.shouldExecuteOnCPU([r,i])){let e=n.texData.get(r.dataId),t=n.texData.get(i.dataId),[o,s]=vI(r.shape,i.shape,e.values,t.values,a),c=n.makeTensorInfo(s,a),l=n.texData.get(c.dataId);return l.values=o,c}let o;return o=k().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new NL($L,r.shape,i.shape):new jL($L,r.shape,i.shape),n.runWebGLProgram(o,[r,i],a)}var tR={kernelName:fn,backendName:`webgl`,kernelFunc:eR};function nR(e,t,n){let r=[JN(e.shape),...YN(e.shape)],i={dtype:e.dtype,shape:r,dataId:e.dataId},a=new YI([JN(t),...YN(t)],r),o=[r],s=n.runWebGLProgram(a,[i],e.dtype,o,!0);return{dataId:s.dataId,shape:t,dtype:s.dtype}}function $(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{shape:a}=r,o=n,s=_(i.shape),c=C(a,s),l=_(c);m(s===l,()=>`The new shape (${c}) has ${l} elements and the old shape (${i.shape}) has ${s} elements. The new shape and old shape must have the same number of elements.`);let u=o.texData.get(i.dataId);return u.isPacked&&!$N(i.shape,c)&&!(u.texture!==null&&$N(u.shape,c))?nR(i,c,o):(o.incRef(i.dataId),{dataId:i.dataId,shape:c,dtype:i.dtype})}var rR={kernelName:An,backendName:`webgl`,kernelFunc:$},iR=class{constructor(e,t){this.variableNames=[`x`];let{windowSize:n,batchSize:r,inSize:i,outSize:a}=e;this.outputShape=[r,a];let o=Math.floor(n/4)*4,s=n%4,c=`sumValue += dot(values, ones);`;if(t!=null){let e=1/t;c=`sumValue += dot(values * ${y(e)?e.toPrecision(2):e}, ones);`}let l=``;i%n>0&&(l=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return 0.0;
        }
      `),this.userCode=`
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${l}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${n};

        float sumValue = 0.0;

        for (int i = 0; i < ${o}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${c}
        }

        int inIdx = inOffset + ${o};
        if (${s===1}) {
          vec4 values = vec4(getValue(batch, inIdx), 0.0, 0.0, 0.0);

          ${c}
        } else if (${s===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1), 0.0, 0.0);

          ${c}
        } else if (${s===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2), 0.0);

          ${c}
        }
        setOutput(sumValue);
      }
    `}},aR=class{constructor(e,t){this.variableNames=[`x`];let{windowSize:n,batchSize:r,inSize:i,outSize:a}=e;this.outputShape=[r,a];let o=`0.0`,s=``;t===`prod`?o=`1.0`:t===`min`?(o=`1.0 / 1e-20`,s=`min`):t===`max`&&(o=`-1.0 / 1e-20`,s=`max`);let c=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`sum`?c=`sumValue`:t===`prod`?c=`prodValue`:t===`all`?c=`allValue`:t===`any`&&(c=`anyValue`);let l=Math.floor(n/4)*4,u=n%4,d=`
      if (${t===`sum`}) {
        sumValue += dot(values, ones);
      } else if (${t===`prod`}) {
        vec2 tmp = vec2(values[0], values[1]) * vec2(values[2], values[3]);
        prodValue *= tmp[0] * tmp[1];
      } else {
        minMaxValue = ${s}(values, minMaxValue);
        if (${t===`min`} || ${t===`max`}) {
          minMaxValue = ${s}(values, minMaxValue);
          bvec4 isNaN = isnan(values);
          if (isNaN.r || isNaN.g || isNaN.b || isNaN.a) {
            minMaxValue = vec4(NAN);
          }
        }
      }
    `,f=`vec4`;t===`all`?(o=`1.0`,d=`
        bool reducedAllValue = all(values);
        float floatedReducedAllValue = float(reducedAllValue);
        allValue = float(allValue >= 1.0 && floatedReducedAllValue >= 1.0);
      `,f=`bvec4`):t===`any`&&(o=`0.0`,d=`
        bool reducedAnyValue = any(values);
        float floatedReducedAnyValue = float(reducedAnyValue);
        anyValue = float(anyValue >= 1.0 || floatedReducedAnyValue >= 1.0);
      `,f=`bvec4`);let p=``;i%n>0&&(p=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return initializationValue;
        }
      `),this.userCode=`
      const float initializationValue = ${o};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${p}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${n};

        vec4 minMaxValue = vec4(${o});
        float prodValue = 1.0;
        float sumValue = 0.0;
        float allValue = 1.0;
        float anyValue = 0.0;

        for (int i = 0; i < ${l}; i += 4) {
          int inIdx = inOffset + i;
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${d}
        }

        int inIdx = inOffset + ${l};
        if (${u===1}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          ${d}
        } else if (${u===2}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          ${d}
        } else if (${u===3}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          ${d}
        }
        setOutput(${c});
      }
    `}};function oR(e){let t=[];for(;t.length===0||t[t.length-1].outSize!==1;){let n=t.length?t[t.length-1].outSize:e[1],r=Gm(n);t.push({inSize:n,windowSize:r,outSize:Math.ceil(n/r)})}return t}function sR(e,t,n,r){let i=oR(e.shape),a=e;for(let o=0;o<i.length;o++){let{inSize:s,windowSize:c,outSize:l}=i[o],u,d;u=n===`mean`?o===0?new iR({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l},s):new iR({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l}):new aR({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l},n),d=a,a=r.runWebGLProgram(u,[a],t),d.dataId!==e.dataId&&r.disposeIntermediateTensorInfo(d)}return a}var cR=class{constructor(e,t){this.variableNames=[`A`];let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[t[r]];this.outputShape=n,this.rank=n.length;let r=lF(this.rank),i=lR(t);this.userCode=`
    void main() {
      ${r} resRC = getOutputCoords();
      setOutput(getA(${i}));
    }
    `}};function lR(e){let t=e.length;if(t>6)throw Error(`Transpose for rank ${t} is not yet supported`);let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`,`resRC.u`,`resRC.v`],r=Array(t);for(let t=0;t<e.length;t++)r[e[t]]=n[t];return r.join()}var uR=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0;let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[t[r]];if(this.outputShape=n,this.rank=n.length,this.rank>6)throw Error(`Packed transpose for rank ${this.rank} is not yet supported.`);let r=lF(this.rank),i=GI(`rc`,this.rank),a=Array(this.rank);for(let e=0;e<t.length;e++)a[t[e]]=i[e];let o=`vec2(${a.slice(-2).join()})`,s=`++${i[this.rank-1]} < ${n[this.rank-1]}`,c=`getChannel(getA(${a.join()}), ${o})`;this.userCode=`
    void main() {
      ${r} rc = getOutputCoords();
      vec4 result = vec4(0.);
      result[0] = ${c};
      if(${s}) {
        result[1] = ${c};
      }
      --${i[this.rank-1]};
      if(++${i[this.rank-2]} < ${n[this.rank-2]}) {
        result[2] = ${c};
        if(${s}) {
          result[3] = ${c};
        }
      }
      setOutput(result);
    }
    `}};function dR(e,t,n){let r=k().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new uR(e.shape,t):new cR(e.shape,t);return n.runWebGLProgram(r,[e],e.dtype)}function fR(e,t,n,r){let i=t,a=e.shape.length,o=w(i,e.shape),s=o,c=Jc(s,a),l=c!=null,u=e;l&&(u=dR(e,c,r),s=Xc(s.length,a)),qc(`sum`,s,a);let[d,f]=Gc(u.shape,s),p=d;n&&(p=Kc(d,o));let m=_(f),h=_(e.shape)/m,g=$({inputs:{x:u},attrs:{shape:[h,m]},backend:r}),v=sR(g,Li(e.dtype),`sum`,r),y=$({inputs:{x:v},attrs:{shape:p},backend:r});return r.disposeIntermediateTensorInfo(g),r.disposeIntermediateTensorInfo(v),l&&r.disposeIntermediateTensorInfo(u),y}function pR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;return fR(i,a,o,n)}var mR={kernelName:`Sum`,backendName:`webgl`,kernelFunc:pR};function hR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{perm:a}=r,o=n,s=i.shape.length,c=Array(s);for(let e=0;e<c.length;e++)c[e]=i.shape[a[e]];let l;if(o.shouldExecuteOnCPU([i])){let e=o.texData.get(i.dataId).values,t=UI(e,i.shape,i.dtype,a,c);l=o.makeTensorInfo(c,i.dtype);let n=o.texData.get(l.dataId);n.values=t}else l=dR(i,a,o);return l}var gR={kernelName:hr,backendName:`webgl`,kernelFunc:hR};function _R({a:e,b:t,transposeA:n,transposeB:r,backend:i,bias:a=null,preluActivationWeights:o=null,leakyreluAlpha:s=0,activation:c=null}){let l=e.shape.length,u=t.shape.length,d=n?e.shape[l-2]:e.shape[l-1],f=r?t.shape[u-1]:t.shape[u-2],p=n?e.shape[l-1]:e.shape[l-2],h=r?t.shape[u-2]:t.shape[u-1],g=e.shape.slice(0,-2),v=t.shape.slice(0,-2),y=_(g),b=_(v),x=H(e.shape.slice(0,-2),t.shape.slice(0,-2)).concat([p,h]);m(d===f,()=>`Error in matMul: inner shapes (${d}) and (${f}) of Tensors with shapes ${e.shape} and ${t.shape} and transposeA=${n} and transposeB=${r} must match.`);let S=n?[y,d,p]:[y,p,d],C=r?[b,h,f]:[b,f,h],w=$({inputs:{x:e},backend:i,attrs:{shape:S}}),T=$({inputs:{x:t},backend:i,attrs:{shape:C}}),E=[w,T],D=Math.max(y,b),ee=n?w.shape[1]:w.shape[2],te=a!=null,ne=o!=null,re=c===`leakyrelu`,ie=c==null?null:YL(c,!0),ae=te||ne||re||ie!=null,oe;if((p===1||h===1)&&ee>1e3&&ae===!1){let e=w,t=T;n&&(e=hR({inputs:{x:w},backend:i,attrs:{perm:[0,2,1]}}),E.push(e)),r&&(t=hR({inputs:{x:T},backend:i,attrs:{perm:[0,2,1]}}),E.push(t));let a=h!==1,o=h===1,s=e;a&&(s=$({inputs:{x:e},backend:i,attrs:{shape:[D,ee,1]}}),E.push(s));let c=h===1?2:1,l=t;o&&(l=$({inputs:{x:t},backend:i,attrs:{shape:[D,1,ee]}}),E.push(l));let u=eR({inputs:{a:s,b:l},backend:i});oe=pR({inputs:{x:u},backend:i,attrs:{axis:c,keepDims:!0}}),E.push(u)}else{let c=Ii(e.dtype,t.dtype),l=new XL(S,C,[D,p,h],n,r,te,ie,ne,re),u=[w,T];if(a!=null&&u.push(a),ne&&u.push(o),re){let e=i.makeTensorInfo([],`float32`,ti(s,`float32`));u.push(e),E.push(e)}oe=i.runWebGLProgram(l,u,c)}let se=$({inputs:{x:oe},backend:i,attrs:{shape:x}});E.push(oe);for(let e of E)i.disposeIntermediateTensorInfo(e);return se}function vR(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a,bias:o,preluActivationWeights:s}=t,{transposeA:c,transposeB:l,activation:u,leakyreluAlpha:d}=r;return _R({a:i,b:a,transposeA:c,transposeB:l,backend:n,bias:o,preluActivationWeights:s,leakyreluAlpha:d,activation:u})}var yR={kernelName:Cr,backendName:`webgl`,kernelFunc:vR},bR=`return abs(x);`;function xR(e){let{inputs:t,backend:n}=e,{x:r}=t;if(n.shouldExecuteOnCPU([r])&&r.dtype!==`complex64`){let e=kI(n.texData.get(r.dataId).values);return n.makeTensorInfo(r.shape,r.dtype,e)}let i;return i=k().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)?new vL(r.shape,bR):new iL(r.shape,bR),n.runWebGLProgram(i,[r],r.dtype)}var SR={kernelName:`Abs`,backendName:`webgl`,kernelFunc:xR},CR={kernelName:Me,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`})},wR={kernelName:Ne,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  if (x < 1.0) return NAN;
return log(x + sqrt(x * x - 1.0));`})},TR=`return a + b;`,ER={kernelName:`Add`,backendName:`webgl`,kernelFunc:JL({opSnippet:TR,packedOpSnippet:TR,supportsComplex:!0,cpuKernelImpl:XF})},DR=class{constructor(e,t){this.outputShape=[],this.outputShape=e,this.variableNames=t.map((e,t)=>`T${t}`);let n=[];this.variableNames.forEach(e=>{n.push(`float v${e} = get${e}AtOutCoords();`)});let r=this.variableNames.map(e=>`v${e}`).join(` + `);this.userCode=`
      void main() {
        ${n.join(`
        `)}

        float result = ${r};
        setOutput(result);
      }
    `}},OR=class{constructor(e,t){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.variableNames=t.map((e,t)=>`T${t}`);let n=[];this.variableNames.forEach(e=>{n.push(`vec4 v${e} = get${e}AtOutCoords();`)});let r=this.variableNames.map(e=>`v${e}`).join(` + `);this.userCode=`
      void main() {
        ${n.join(`
        `)}

        vec4 result = ${r};
        setOutput(result);
      }
    `}};function kR(e){let{inputs:t,backend:n}=e,r=t;if(r.length===1)return PL({inputs:{x:r[0]},backend:n});if(r.length>k().getNumber(`WEBGL_MAX_TEXTURES_IN_SHADER`)){let e=Math.floor(r.length/2);return kR({inputs:[kR({inputs:r.slice(0,e),backend:n}),kR({inputs:r.slice(e),backend:n})],backend:n})}let i=r.map(e=>e.dtype).reduce((e,t)=>Ii(e,t)),a=r.map(e=>e.shape),o=k().getBool(`WEBGL_PACK`)?new OR(r[0].shape,a):new DR(r[0].shape,a);return n.runWebGLProgram(o,r,i)}var AR={kernelName:Pe,backendName:`webgl`,kernelFunc:kR};function jR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=w(a,i.shape),l=c,u=Jc(l,s),d=i;u!=null&&(d=hR({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Xc(l.length,s)),qc(`all`,l,s);let[f,p]=Gc(d.shape,l),m=_(p),h=$({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=sR(h,h.dtype,`all`,n),v;if(o){let e=Kc(f,c);v=$({inputs:{x:g},backend:n,attrs:{shape:e}})}else v=$({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),v}var MR={kernelName:`All`,backendName:`webgl`,kernelFunc:jR};function NR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=w(a,i.shape),l=c,u=Jc(l,s),d=i;u!=null&&(d=hR({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Xc(l.length,s)),qc(`any`,l,s);let[f,p]=Gc(d.shape,l),m=_(p),h=$({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=sR(h,h.dtype,`any`,n),v;if(o){let e=Kc(f,c);v=$({inputs:{x:g},backend:n,attrs:{shape:e}})}else v=$({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),v}var PR={kernelName:`Any`,backendName:`webgl`,kernelFunc:NR},FR=class{constructor(e,t,n){this.variableNames=[`A`];let{windowSize:r,batchSize:i,outSize:a}=e;n||this.variableNames.push(`bestIndicesA`),this.outputShape=[i,a];let o=t===`max`?`>`:`<`,s=n?`inOffset + i;`:`round(getBestIndicesA(batch, inOffset + i));`;this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${r};

        int bestIndex = inOffset;
        float bestValue = getA(batch, bestIndex);

        for (int i = 0; i < ${r}; i++) {
          int inIdx = ${s};
          float candidate = getA(batch, inIdx);
          if (candidate ${o} bestValue) {
            bestValue = candidate;
            bestIndex = inIdx;
          }
        }
        setOutput(float(bestIndex));
      }
    `}},IR=class{constructor(e,t,n,r){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,m(e.length>2,()=>`Packed arg${n.charAt(0).toUpperCase()+n.slice(1)} supports only inputs with rank above 2.`);let i=e[e.length-1],a=Math.ceil(i/t);this.outputShape=e.slice(0,-1),a>1&&this.outputShape.push(a),r||this.variableNames.push(`bestIndicesA`);let o=this.outputShape,s=o.length,c=lF(s),l=KI(`coords`,s),u,d;if(a===1){d=s+1;let e=lF(d);u=`
        ${e} sourceLocR = ${e}(${l.join()}, 0);
        ++${l[s-1]};
        ${e} sourceLocG = ${e}(${l.join()}, 0);
        ++${l[s-2]};
        ${e} sourceLocA = ${e}(${l.join()}, 0);
        --${l[s-1]};
        ${e} sourceLocB = ${e}(${l.join()}, 0);
        --${l[s-2]};`}else d=s,u=`
        ${c} sourceLocR = coords;
        ++${l[s-1]};
        ${c} sourceLocG = coords;
        ++${l[s-2]};
        ${c} sourceLocA = coords;
        --${l[s-1]};
        ${c} sourceLocB = coords;
        --${l[s-2]};`;let f=[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,d),p=`.`+f[d-1],h=f.map(e=>`int `+e),g=KI(`sourceLocR`,d-1).concat(`inIdx.r`),_=KI(`sourceLocG`,d-1).concat(`inIdx.g`),v=KI(`sourceLocB`,d-1).concat(`inIdx.b`),y=KI(`sourceLocA`,d-1).concat(`inIdx.a`),b=n===`max`?`greaterThan`:`lessThan`,x=r?``:`
          inIdx = round(vec4(getBestIndicesAChannel(${g.join()}),
                             getBestIndicesAChannel(${_.join()}),
                             getBestIndicesAChannel(${v.join()}),
                             getBestIndicesAChannel(${y.join()})));`,S=`vec4(
            getAChannel(${g.join()}),
            hasNextCol ? getAChannel(${_.join()}) : 0.,
            hasNextRow ? getAChannel(${v.join()}) : 0.,
            hasNextRow && hasNextCol ? getAChannel(${y.join()}) : 0.)`,C=r?``:`
      float getBestIndicesAChannel(${h.join()}) {
        return getChannel(getBestIndicesA(${f.join()}),
                                          vec2(${f.slice(-2).join()}));
      }`;this.userCode=`
      float getAChannel(${h.join()}) {
        return getChannel(getA(${f.join()}),
                               vec2(${f.slice(-2).join()}));
      }
      ${C}
      void main() {
        ${c} coords = getOutputCoords();
        bool hasNextCol = ${l[s-1]} < ${o[s-1]-1};
        bool hasNextRow = ${l[s-2]} < ${o[s-2]-1};
        ${u}
        ivec4 srcIdx = ivec4(sourceLocR${p}, sourceLocG${p},
          sourceLocB${p}, sourceLocA${p}) * ${t};
        ivec4 inIdx = srcIdx;
        vec4 bestIndex = vec4(inIdx);
        vec4 bestValue = ${S};

        for (int i = 0; i < ${t}; i++) {
          inIdx = srcIdx;
          ${x}
          vec4 candidate = ${S};
          bvec4 nan = isnan(candidate);
          bvec4 replace = bvec4(
            vec4(${b}(candidate, bestValue)) * (vec4(1.0) - vec4(nan)));

          bestValue = vec4(replace.x  ? candidate.x : bestValue.x,
                           replace.y  ? candidate.y : bestValue.y,
                           replace.z  ? candidate.z : bestValue.z,
                           replace.w  ? candidate.w : bestValue.w);
          bestIndex = mix(bestIndex, vec4(inIdx), vec4(replace));
          srcIdx++;
        }
        setOutput(bestIndex);
      }
    `}};function LR(e,t,n,r=null){let i=t.shape[0],a=t.shape[1];r!=null&&(i=r.shape[0],a=r.shape[1]);let o=Gm(a),s=new FR({windowSize:o,inSize:a,batchSize:i,outSize:Math.ceil(a/o)},n,r==null),c=[t];r!=null&&c.push(r);let l=e.runWebGLProgram(s,c,`int32`);if(l.shape[1]===1)return l;let u=LR(e,t,n,l);return e.disposeIntermediateTensorInfo(l),u}function RR(e,t,n,r=null){let i=r==null?t.shape:r.shape,a=i[i.length-1],o=new IR(i,Gm(a),n,r==null),s=r==null?[t]:[t,r],c=e.runWebGLProgram(o,s,`int32`);if(c.shape.length===t.shape.length){let r=RR(e,t,n,c);return e.disposeIntermediateTensorInfo(c),r}return c}function zR(e,t,n,r){let i=[n];if(qc(`arg`+r.charAt(0).toUpperCase()+r.slice(1),i,t.shape.length),!k().getBool(`WEBGL_PACK_REDUCE`)||t.shape.length<=2){let n=[],a=e.texData.get(t.dataId),o=a!==null&&a.isPacked,s=t;o&&(s=e.unpackTensor(t),n.push(s));let[c,l]=Gc(s.shape,i),u=_(l),d=$({inputs:{x:s},backend:e,attrs:{shape:[-1,u]}});n.push(d);let f=LR(e,d,r);n.push(f);let p=$({inputs:{x:f},backend:e,attrs:{shape:c}});return n.forEach(t=>e.disposeIntermediateTensorInfo(t)),p}return RR(e,t,r)}function BR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r,o=w(a,i.shape),s=Jc(o,i.shape.length),c=i,l=[];s!=null&&(c=hR({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Xc(o.length,c.shape.length)),qc(`argMax`,[o[0]],c.shape.length);let u=zR(n,c,o[0],`max`);return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),u}var VR={kernelName:Fe,backendName:`webgl`,kernelFunc:BR};function HR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r,o=w(a,i.shape),s=Jc(o,i.shape.length),c=i,l=[];s!=null&&(c=hR({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Xc(o.length,c.shape.length)),qc(`argMin`,[o[0]],c.shape.length);let u=zR(n,c,o[0],`min`);return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),u}var UR={kernelName:Ie,backendName:`webgl`,kernelFunc:HR},WR={kernelName:Le,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`})},GR={kernelName:Re,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`return log(x + sqrt(x * x + 1.0));`})},KR={kernelName:ze,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  return atan(x);
`})},qR={kernelName:Ve,backendName:`webgl`,kernelFunc:JL({opSnippet:AL+`
  return atan(a, b);
`,packedOpSnippet:`
  vec4 result = atan(a, b);
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+ML+`
  return result;
`})},JR={kernelName:Be,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
return (log(1.0 + x) - log(1.0 - x)) / 2.0;`})},YR=class{constructor(e,t,n,r=!1,i=!1){if(this.variableNames=[`x`],t===`avg`&&n)throw Error(`Cannot compute positions for average pool.`);let a=e.filterWidth,o=e.strideHeight,s=e.strideWidth,c=e.dilationHeight,l=e.dilationWidth,u=e.effectiveFilterHeight,d=e.effectiveFilterWidth,f=e.padInfo.top,p=e.padInfo.left;this.outputShape=e.outShape;let m=t===`avg`,h=`((batch  * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + d`,g=`(xR * ${e.inWidth} + xC) * ${e.inChannels} + d`,_=`0.0`;if(m||(_=`-1.0 / 1e-20`),n){this.userCode=`
        const ivec2 strides = ivec2(${o}, ${s});
        const ivec2 pads = ivec2(${f}, ${p});

        void main() {
          ivec4 coords = getOutputCoords();
          int batch = coords[0];
          int d = coords[3];

          ivec2 xRCCorner = coords.yz * strides - pads;
          int xRCorner = xRCCorner.x;
          int xCCorner = xRCCorner.y;

          // max/min x(?, ?, d) to get y(yR, yC, d).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;
          float avgValue = 0.0;

          for (int wR = 0; wR < ${u};
              wR += ${c}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${d};
                wC += ${l}) {
              int xC = xCCorner + wC;

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float value = getX(batch, xR, xC, d);

              // If a min / max value has already been found, use it. If not,
              // use the current value.
              float currMinMaxValue = mix(
                  value, minMaxValue, minMaxValueFound);
              if (value >= currMinMaxValue) {
                minMaxValue = value;
                minMaxValueFound = 1.0;
                minMaxPosition = ${r?i?h:g:`wR * ${d} + wC`};
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}let v=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`avg`&&(v=`avgValue / max(count, 1.0)`);let y=Math.floor(a/4)*4,b=a%4,x=`
      if (${m}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = max(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec2 strides = ivec2(${o}, ${s});
      const ivec2 pads = ivec2(${f}, ${p});
      const float initializationValue = ${_};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xR, int xC, int d) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xR, xC, d);
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d = coords[3];

        ivec2 xRCCorner = coords.yz * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // max/min x(?, ?, d) to get y(yR, yC, d).
        // ? = to be determined
        vec4 minMaxValue = vec4(${_});
        float avgValue = 0.0;
        count = 0.0;

        for (int wR = 0; wR < ${u};
            wR += ${c}) {
          int xR = xRCorner + wR;

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${y}; wC += 4) {
            int xC = xCCorner + wC * ${l};

            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              getValue(batch, xR, xC + 2 * ${l}, d),
              getValue(batch, xR, xC + 3 * ${l}, d)
            );

            ${x}
          }

          int xC = xCCorner + ${y};
          if (${b===1}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              initializationValue,
              initializationValue,
              initializationValue
            );

            ${x}
          } else if (${b===2}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              initializationValue,
              initializationValue
            );

            ${x}
          } else if (${b===3}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              getValue(batch, xR, xC + 2 * ${l}, d),
              initializationValue
            );

            ${x}
          }
        }
        setOutput(${v});
      }
    `}},XR=class{constructor(e,t,n,r=!1,i=!1){if(this.variableNames=[`x`],t===`avg`&&n)throw Error(`Cannot compute positions for average pool.`);let a=e.filterWidth,o=e.strideDepth,s=e.strideHeight,c=e.strideWidth,l=e.dilationDepth,u=e.dilationHeight,d=e.dilationWidth,f=e.effectiveFilterDepth,p=e.effectiveFilterHeight,m=e.effectiveFilterWidth,h=e.padInfo.front,g=e.padInfo.top,_=e.padInfo.left;this.outputShape=e.outShape;let v=t===`avg`,y=`0.0`;if(v||(y=`-1.0 / 1e-20`),n){this.userCode=`
        const ivec3 strides =
            ivec3(${o}, ${s}, ${c});
        const ivec3 pads = ivec3(${h}, ${g}, ${_});

        void main() {
          ivec5 coords = getOutputCoords();
          int batch = coords.x;
          int ch = coords.u;

          ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
          int xDCorner = xCorner.x;
          int xRCorner = xCorner.y;
          int xCCorner = xCorner.z;

          // max/min x(?, ?, ?, ch) to get y(yD, yR, yC, ch).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;

          for (int wD = 0; wD < ${f};
              wD += ${l}) {
            int xD = xDCorner + wD;

            if (xD < 0 || xD >= ${e.inDepth}) {
              continue;
            }

            for (int wR = 0; wR < ${p};
                wR += ${u}) {
              int xR = xRCorner + wR;

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int wC = 0; wC < ${m};
                  wC += ${d}) {
                int xC = xCCorner + wC;

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float value = getX(batch, xD, xR, xC, ch);

                // If a min / max value has already been found, use it. If not,
                // use the current value.
                float currMinMaxValue = mix(
                    value, minMaxValue, minMaxValueFound);
                if (value >= currMinMaxValue) {
                  minMaxValue = value;
                  minMaxValueFound = 1.0;
                  minMaxPosition = ${r?i?`(((batch * ${e.inDepth} + xD) * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`((xD * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`wD * ${p} * ${m} +
                      wR * ${m} + wC`};
                }
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}let b=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`avg`&&(b=`avgValue / max(count, 1.0)`);let x=Math.floor(a/4)*4,S=a%4,C=`
      if (${v}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = max(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec3 strides =
        ivec3(${o}, ${s}, ${c});
      const ivec3 pads = ivec3(${h}, ${g}, ${_});
      const float initializationValue = ${y};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xD, int xR, int xC, int ch) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xD, xR, xC, ch);
      }

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xDCorner = xCorner.x;
        int xRCorner = xCorner.y;
        int xCCorner = xCorner.z;

        // max/min x(?, ?, ?, d) to get y(yD, yR, yC, ch).
        // ? = to be determined
        vec4 minMaxValue = vec4(${y});
        float avgValue = 0.0;
        count = 0.0;

        for (int wD = 0; wD < ${f};
            wD += ${l}) {
          int xD = xDCorner + wD;

          if (xD < 0 || xD >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${p};
            wR += ${u}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${x}; wC += 4) {
              int xC = xCCorner + wC * ${d};

              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                getValue(batch, xD, xR, xC + 2 * ${d}, ch),
                getValue(batch, xD, xR, xC + 3 * ${d}, ch)
              );

              ${C}
            }

            int xC = xCCorner + ${x};
            if (${S===1}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                initializationValue,
                initializationValue,
                initializationValue
              );

              ${C}
            } else if (${S===2}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                initializationValue,
                initializationValue
              );

              ${C}
            } else if (${S===3}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${d}, ch),
                getValue(batch, xD, xR, xC + 2 * ${d}, ch),
                initializationValue
              );

              ${C}
            }
          }
        }
        setOutput(${b});
      }
    `}};function ZR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;fP(i,`avgPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;m(ns(o,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Ho(i.shape,a,o,1,s,c);if(l.filterWidth===1&&l.filterHeight===1&&v(l.inShape,l.outShape))return PL({inputs:{x:i},backend:n});let u=new YR(l,`avg`,!1);return n.runWebGLProgram(u,[i],`float32`)}var QR={kernelName:He,backendName:`webgl`,kernelFunc:ZR};function $R(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r,u=new XR(Uo(i.shape,a,o,[1,1,1],s,c,l),`avg`,!1);return n.runWebGLProgram(u,[i],`float32`)}var ez={kernelName:We,backendName:`webgl`,kernelFunc:$R},tz=class{constructor(e){this.variableNames=[`dy`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=e.dilationHeight,o=e.dilationWidth,s=e.effectiveFilterHeight,c=e.effectiveFilterWidth,l=s-1-e.padInfo.top,u=c-1-e.padInfo.left,d=1/(t*n);this.userCode=`
      const ivec2 pads = ivec2(${l}, ${u});
      const float avgMultiplier = float(${d});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${s};
            wR += ${a}) {
          float dyR = float(dyRCorner + wR) / ${r}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${c};
            wC+= ${o}) {
            float dyC = float(dyCCorner + wC) / ${i}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);

            dotProd += dyValue * avgMultiplier;
          }
        }
        setOutput(dotProd);
      }
    `}},nz=class{constructor(e){this.variableNames=[`dy`],this.outputShape=e.inShape;let t=e.filterDepth,n=e.filterHeight,r=e.filterWidth,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=e.dilationDepth,c=e.dilationHeight,l=e.dilationWidth,u=e.effectiveFilterDepth,d=e.effectiveFilterHeight,f=e.effectiveFilterWidth,p=u-1-e.padInfo.front,m=d-1-e.padInfo.top,h=f-1-e.padInfo.left,g=1/(t*n*r);this.userCode=`
      const ivec3 pads = ivec3(${p}, ${m}, ${h});
      const float avgMultiplier = float(${g});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, d) with pos mask(:, :, :, ch) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${u};
            wD += ${s}) {
          float dyD = float(dyDCorner + wD) / ${i}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${d};
              wR += ${c}) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${f};
                wC += ${l}) {
              float dyC = float(dyCCorner + wC) / ${o}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);

              dotProd += dyValue * avgMultiplier;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function rz(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a,{filterSize:s,strides:c,pad:l,dimRoundingMode:u}=r,d=new nz(Uo(o.shape,s,c,[1,1,1],l,u));return n.runWebGLProgram(d,[i],o.dtype)}var iz={kernelName:Ge,backendName:`webgl`,kernelFunc:rz};function az(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a;fP([i,a],`avgPoolGrad`);let{filterSize:s,strides:c,pad:l}=r,u=new tz(Ho(o.shape,s,c,1,l));return n.runWebGLProgram(u,[i],o.dtype)}var oz={kernelName:Ue,backendName:`webgl`,kernelFunc:az};function sz(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a}=t,{transposeA:o,transposeB:s}=r;return _R({a:i,b:a,transposeA:o,transposeB:s,backend:n})}var cz={kernelName:Ke,backendName:`webgl`,kernelFunc:sz},lz=class{constructor(e,t,n,r,i,a){this.outputShape=[],this.variableNames=[`x`,`mean`,`variance`],H(e,t),H(e,n);let o=`0.0`;r!=null&&(H(e,r),this.variableNames.push(`offset`),o=`getOffsetAtOutCoords()`);let s=`1.0`;i!=null&&(H(e,i),this.variableNames.push(`scale`),s=`getScaleAtOutCoords()`),this.outputShape=e,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = ${o};
        float scale = ${s};
        float inv = scale * inversesqrt(variance + float(${a}));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `}},uz=class{constructor(e,t,n,r,i,a){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=[`x`,`mean`,`variance`],H(e,t),H(e,n);let o=`vec4(0.0)`;r!=null&&(H(e,r),this.variableNames.push(`offset`),o=`getOffsetAtOutCoords()`);let s=`vec4(1.0)`;i!=null&&(H(e,i),this.variableNames.push(`scale`),s=`getScaleAtOutCoords()`),this.outputShape=e,this.userCode=`
      void main() {
        vec4 offset = ${o};
        vec4 scale = ${s};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${a}));

        setOutput((x - mean) * inv + offset);
      }
    `}},dz={kernelName:Pt,backendName:`webgl`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,mean:i,variance:a,offset:o,scale:s}=e;m(i.shape.length===a.shape.length,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),m(o==null||i.shape.length===o.shape.length,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),m(s==null||i.shape.length===s.shape.length,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`);let{varianceEpsilon:c}=n;c??=.001;let l=[r,i,a],u=null;o!=null&&(u=o.shape,l.push(o));let d=null;s!=null&&(d=s.shape,l.push(s));let f=k().getBool(`WEBGL_PACK_NORMALIZATION`)?new uz(r.shape,i.shape,a.shape,u,d,c):new lz(r.shape,i.shape,a.shape,u,d,c);return t.runWebGLProgram(f,l,l[0].dtype)}},fz=class{constructor(e){this.variableNames=[`source`],this.outputShape=e,this.rank=e.length;let t=lF(this.rank);this.customUniforms=[{name:`start`,arrayIndex:this.rank,type:`int`}];let n=mz(this.rank),r;r=`
        ${t} sourceLoc;
        ${t} coords = getOutputCoords();
        ${e.map((e,t)=>`sourceLoc.${pz[t]} = start[${t}] + coords.${pz[t]};`).join(`
`)}
      `,this.userCode=`
      void main() {
        ${r}
        setOutput(getSource(${n}));
      }
    `}},pz=[`x`,`y`,`z`,`w`,`u`,`v`];function mz(e){if(e===1)return`sourceLoc`;if(e<=6)return pz.slice(0,e).map(e=>`sourceLoc.`+e).join(`,`);throw Error(`Slicing for rank ${e} is not yet supported`)}var hz=class{constructor(e){this.variableNames=[`source`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.customUniforms=[{name:`start`,arrayIndex:this.rank,type:`int`}];let t=lF(this.rank),n=KI(`coords`,this.rank),r=KI(`sourceLoc`,this.rank),i=this.rank===1?`sourceLoc`:`vec2(${r.slice(-2).join()})`,a=`getChannel(getSource(${r.join()}), ${i})`,o=`
      result.x = ${a};
      if (++${n[this.rank-1]} < ${e[this.rank-1]}) {
        ++${r[this.rank-1]};
        result.y = ${a};
        --${r[this.rank-1]};
      }
    `,s=this.rank===1?``:`
      --${n[this.rank-1]};
      if (++${n[this.rank-2]} < ${e[this.rank-2]}) {
        ++${r[this.rank-2]};
        result.z = ${a};
        if (++${n[this.rank-1]} < ${e[this.rank-1]}) {
          ++${r[this.rank-1]};
          result.w = ${a};
        }
      }
    `,c=this.rank<=4?`sourceLoc = coords +
            ${t}(${e.map((e,t)=>`start[${t}]`).join()});`:e.map((e,t)=>`${r[t]} = ${n[t]} + start[${t}];`).join(`
`);this.userCode=`
      void main() {
        ${t} coords = getOutputCoords();
        ${t} sourceLoc;
        ${c}
        vec4 result = vec4(0.);
        ${o}
        ${s}
        setOutput(result);
      }
    `}};function gz(e,t,n,r){let i=r.texData.get(e.dataId),a=r.makeTensorInfo(n,e.dtype),o=r.texData.get(a.dataId);Object.assign(o,i),o.refCount=1,o.shape=n,o.dtype=e.dtype;let s=Am(t,O(e.shape));i.slice&&(s+=i.slice.flatOffset),o.slice={flatOffset:s,origDataId:i.slice&&i.slice.origDataId||e.dataId};let c=r.dataRefCount.get(o.slice.origDataId)||1;return r.dataRefCount.set(o.slice.origDataId,c+1),a}function _z(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,size:o}=r,[s,c]=jm(i,a,o);if(_m(i,s,c),_(c)===0)return n.makeTensorInfo(c,i.dtype,[]);if(n.shouldExecuteOnCPU([i])||i.dtype===`string`){let e=AI(n.texData.get(i.dataId).values,s,c,i.shape,i.dtype);return n.makeTensorInfo(c,i.dtype,e)}let{isPacked:l}=n.texData.get(i.dataId),u=km(i.shape,s,c);if(l||!u){let e=k().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new hz(c):new fz(c),t=[s];return n.runWebGLProgram(e,[i],i.dtype,t)}return n.uploadToGPU(i.dataId),gz(i,s,c,n)}var vz={kernelName:Wn,backendName:`webgl`,kernelFunc:_z},yz={kernelName:qe,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,crops:o}=r;m(i.shape.length<=4,()=>`batchToSpaceND for rank > 4 with a WebGL backend not implemented yet`);let s=a.reduce((e,t)=>e*t),c=qm(i.shape,a,s),l=Jm(c.length,a.length),u=Ym(i.shape,a,s),d=Xm(o,a.length),f=Zm(u,o,a.length),p=[],h=$({inputs:{x:i},backend:n,attrs:{shape:c}}),g=hR({inputs:{x:h},backend:n,attrs:{perm:l}}),_=$({inputs:{x:g},backend:n,attrs:{shape:u}}),v=_z({inputs:{x:_},backend:n,attrs:{begin:d,size:f}});return p.push(h),p.push(g),p.push(_),p.forEach(e=>n.disposeIntermediateTensorInfo(e)),v}};function bz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o}=r,s=ZF(n.readSync(i.dataId),n.readSync(a.dataId),a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,s)}var xz={kernelName:Je,backendName:`webgl`,kernelFunc:bz},Sz=`
  int r = int(a.r) & int(b.r);
  int g = int(a.g) & int(b.g);
  int rb = int(a.b) & int(b.b);
  int ra = int(a.a) & int(b.a);
  return vec4(r, g, rb, ra);
`,Cz=`
  return float(int(a.r) & int(b.r));
`;function wz(e){let{inputs:t,backend:n}=e,{a:r,b:i}=t,a=k().getBool(`WEBGL_PACK_BINARY_OPERATIONS`),o=k().getNumber(`WEBGL_VERSION`);if(n.shouldExecuteOnCPU([r,i])||o===1){let e=n.texData.get(r.dataId).values,t=n.texData.get(i.dataId).values,[a,o]=$F(r.shape,i.shape,e,t,r.dtype),s=n.makeTensorInfo(o,r.dtype),c=n.texData.get(s.dataId);return c.values=a,s}let s;return s=a?new NL(Sz,r.shape,i.shape,!1):new jL(Cz,r.shape,i.shape),n.runWebGLProgram(s,[r,i],r.dtype)}var Tz={kernelName:Ye,backendName:`webgl`,kernelFunc:wz};function Ez(e){let{inputs:t,backend:n}=e,{s0:r,s1:i}=t,a=n.readSync(r.dataId),o=n.readSync(i.dataId),s=H(Array.from(a),Array.from(o));return n.makeTensorInfo([s.length],`int32`,Int32Array.from(s))}var Dz={kernelName:Ze,backendName:`webgl`,kernelFunc:Ez},Oz=JL({opSnippet:`return float(a != b);`,cpuKernelImpl:bI,dtype:`bool`}),kz={kernelName:pn,backendName:`webgl`,kernelFunc:Oz};function Az(e){let{inputs:t,backend:n}=e,{input:r}=t;return PL({inputs:{x:n.texData.get(r.dataId).complexTensorInfos.real},backend:n})}var jz={kernelName:Dn,backendName:`webgl`,kernelFunc:Az},Mz=`return float(int(x));`;function Nz(e,t){let n=new iL(e.shape,Mz),r=t.runWebGLProgram(n,[e],`int32`);return{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}function Pz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dtype:a}=r;if(a===`complex64`){if(i.dtype===`complex64`)return PL({inputs:{x:i},backend:n});let e=Du(i.shape),t=Pz({inputs:{x:i},backend:n,attrs:{dtype:`float32`}}),r=IL({inputs:{real:t,imag:e},backend:n});return e.dispose(),n.disposeIntermediateTensorInfo(t),r}if(i.dtype===`complex64`){let e=Az({inputs:{input:i},backend:n}),t=Pz({inputs:{x:e},backend:n,attrs:{dtype:a}});return n.disposeIntermediateTensorInfo(e),t}if(!ne(i.dtype,a)){let e=PL({inputs:{x:i},backend:n});return{dataId:e.dataId,shape:e.shape,dtype:a}}if(n.shouldExecuteOnCPU([i])){let e=n.texData.get(i.dataId).values,[t,r,o]=eI(e,i.shape,i.dtype,a);return n.makeTensorInfo(t,r,o)}if(a===`int32`)return Nz(i,n);if(a===`bool`){let e=n.makeTensorInfo([],`bool`,E(`bool`,1)),t=Oz({inputs:{a:i,b:e},backend:n});return n.disposeIntermediateTensorInfo(e),t}throw Error(`Error in Cast: failed to cast ${i.dtype} to ${a}`)}var Fz={kernelName:Qe,backendName:`webgl`,kernelFunc:Pz},Iz=`return ceil(x);`,Lz={kernelName:$e,backendName:`webgl`,kernelFunc:qL({opSnippet:Iz,packedOpSnippet:Iz,cpuKernelImpl:tI})},Rz=class{constructor(e){this.variableNames=[`A`],this.customUniforms=[{name:`minVal`,type:`float`},{name:`maxVal`,type:`float`}],this.outputShape=e,this.userCode=`

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}},zz=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`minVal`,type:`float`},{name:`maxVal`,type:`float`}],this.outputShape=e,this.userCode=`
      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}};function Bz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{clipValueMin:a,clipValueMax:o}=r,s;s=k().getBool(`WEBGL_PACK_CLIP`)?new zz(i.shape):new Rz(i.shape);let c=[[a],[o]];return n.runWebGLProgram(s,[i],i.dtype,c)}var Vz={kernelName:et,backendName:`webgl`,kernelFunc:Bz},Hz=class{constructor(e){this.variableNames=[`real`,`imag`],this.outputShape=e,this.userCode=`
      void main() {
        float re = abs(getRealAtOutCoords());
        float im = abs(getImagAtOutCoords());
        float mx = max(re, im);

        // sadly the length function in glsl is not underflow-safe
        // (at least not on Intel GPUs). So the safe solution is
        // to ensure underflow-safety in all cases.
        setOutput(
          mx == 0.0 ? 0.0 : mx * length(vec2(1, min(re, im)/mx))
        );
      }
    `}};function Uz(e,t){return{dataId:t.dataId,dtype:t.dtype,shape:e.shape}}function Wz(e){let{inputs:t,backend:n}=e,{x:r}=t,i=n.texData.get(r.dataId),a=new Hz(r.shape),o=[Uz(r,i.complexTensorInfos.real),Uz(r,i.complexTensorInfos.imag)];return n.runWebGLProgram(a,o,o[0].dtype)}var Gz={kernelName:nt,backendName:`webgl`,kernelFunc:Wz},Kz=class{constructor(e){this.outputShape=[],this.outputShape=zm(e,1),this.variableNames=e.map((e,t)=>`T${t}`);let t=Array(e.length-1);t[0]=e[0][1];for(let n=1;n<t.length;n++)t[n]=t[n-1]+e[n][1];let n=[`if (yC < ${t[0]}) setOutput(getT0(yR, yC));`];for(let e=1;e<t.length;e++){let r=t[e-1];n.push(`else if (yC < ${t[e]}) setOutput(getT${e}(yR, yC-${r}));`)}let r=t.length,i=t[t.length-1];n.push(`else setOutput(getT${r}(yR, yC-${i}));`),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        ${n.join(`
        `)}
      }
    `}},qz=class{constructor(e,t){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=zm(e,t);let n=this.outputShape,r=n.length,i=lF(r),a=KI(`coords`,r),o=[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,r);this.variableNames=e.map((e,t)=>`T${t}`);let s=Array(e.length-1);s[0]=e[0][t];for(let n=1;n<s.length;n++)s[n]=s[n-1]+e[n][t];let c=o[t],l=o.slice(-2),u=o.join(),d=`if (${c} < ${s[0]}) {
        return getChannel(
            getT0(${u}), vec2(${l.join()}));
        }`;for(let e=1;e<s.length;e++){let t=s[e-1];d+=`
        if (${c} < ${s[e]}  && ${c} >= ${s[e-1]}) {
          return getChannel(
            getT${e}(${Jz(o,c,t)}),
            vec2(${Jz(l,c,t)}));
        }`}let f=s.length,p=s[s.length-1];d+=`
        return getChannel(
          getT${f}(${Jz(o,c,p)}),
          vec2(${Jz(l,c,p)}));`,this.userCode=`
      float getValue(${o.map(e=>`int `+e)}) {
        ${d}
      }

      void main() {
        ${i} coords = getOutputCoords();
        vec4 result = vec4(getValue(${a}), 0., 0., 0.);

        ${a[r-1]} = ${a[r-1]} + 1;
        if (${a[r-1]} < ${n[r-1]}) {
          result.g = getValue(${a});
        }

        ${a[r-2]} = ${a[r-2]} + 1;
        if (${a[r-2]} < ${n[r-2]}) {
          result.a = getValue(${a});
        }

        ${a[r-1]} = ${a[r-1]} - 1;
        if (${a[r-2]} < ${n[r-2]} &&
            ${a[r-1]} < ${n[r-1]}) {
          result.b = getValue(${a});
        }
        setOutput(result);
      }
    `}};function Jz(e,t,n){let r=e.indexOf(t);return e.map((e,t)=>t===r?`${e} - ${n}`:e).join()}function Yz(e){let{inputs:t,backend:n}=e,{input:r}=t;return PL({inputs:{x:n.texData.get(r.dataId).complexTensorInfos.imag},backend:n})}var Xz={kernelName:Vt,backendName:`webgl`,kernelFunc:Yz};function Zz(e,t,n){let r=e[0].dtype;if(r===`complex64`){let r=e.map(e=>Az({inputs:{input:e},backend:n})),i=e.map(e=>Yz({inputs:{input:e},backend:n})),a=Zz(r,t,n),o=Zz(i,t,n),s=IL({inputs:{real:a,imag:o},backend:n});return r.forEach(e=>n.disposeIntermediateTensorInfo(e)),i.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.disposeIntermediateTensorInfo(a),n.disposeIntermediateTensorInfo(o),s}let i=n.shouldExecuteOnCPU(e);if(r===`string`&&(i=!0),i){let i=e.map(e=>{let r=[-1,_(e.shape.slice(t))];return $({inputs:{x:e},backend:n,attrs:{shape:r}})}),a=nI(i.map(e=>({vals:n.readSync(e.dataId),shape:e.shape})),zm(i.map(e=>e.shape),1),r,i[0].shape[0]===1),o=zm(e.map(e=>e.shape),t),s=n.makeTensorInfo(o,r,a);return i.forEach(e=>n.disposeIntermediateTensorInfo(e)),s}let a=e.filter(e=>_(e.shape)>0),o=k().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)&&a[0].shape.length>1;if(a.length===1){let t=o?new iL(e[0].shape,dL):new vL(e[0].shape,dL);return n.runWebGLProgram(t,e,r)}let s=k().getNumber(`WEBGL_MAX_TEXTURES_IN_SHADER`);if(a.length>s){let e=[];for(let r=0;r<a.length;r+=s){let i=a.slice(r,r+s);e.push(Zz(i,t,n))}let r=Zz(e,t,n);for(let t of e)n.disposeIntermediateTensorInfo(t);return r}if(o){let e=new qz(a.map(e=>e.shape),t);return n.runWebGLProgram(e,a,r)}let{tensors2D:c,outShape:l}=Qz(a,t,n),u=new Kz(c.map(e=>e.shape)),d=n.runWebGLProgram(u,c,r);c.forEach(e=>n.disposeIntermediateTensorInfo(e));let f=$({inputs:{x:d},attrs:{shape:l},backend:n});return n.disposeIntermediateTensorInfo(d),f}function Qz(e,t,n){let r=zm(e.map(e=>e.shape),t);return{tensors2D:e.map(e=>$({inputs:{x:e},attrs:{shape:[-1,_(e.shape.slice(t))]},backend:n})),outShape:r}}function $z(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r,a=w(i,t[0].shape)[0];Rm(t.map(e=>e.shape),a);let o=zm(t.map(e=>e.shape),a);if(_(o)===0)return n.makeTensorInfo(o,t[0].dtype,[]);let s=t.filter(e=>_(e.shape)>0);return s.length===1?PL({inputs:{x:s[0]},backend:n}):Zz(s,a,n)}var eB={kernelName:rt,backendName:`webgl`,kernelFunc:$z},tB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let a=e.padInfo.top,o=e.padInfo.left,s=e.strideHeight,c=e.strideWidth,l=e.dilationHeight,u=e.dilationWidth,d=e.filterHeight,f=e.filterWidth,p=Math.floor(e.inChannels/4)*4,m=e.inChannels%4,h=e.dataFormat===`channelsLast`,g=h?1:2,_=h?2:3,v=h?3:1,y=``,b=``;n&&(y=r?`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${n}
        }`:i?`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${n}
        }`:`
          float activation(float x) {
            ${n}
          }
        `,b=`result = activation(result);`);let x=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
      ${y}

      const ivec2 strides = ivec2(${s}, ${c});
      const ivec2 pads = ivec2(${a}, ${o});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d2 = coords[${v}];

        ivec2 xRCCorner =
            ivec2(coords[${g}], coords[${_}]) * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${d}; wR++) {
          int xR = xRCorner + wR * ${l};

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${f}; wC++) {
            int xC = xCCorner + wC * ${u};

            if (xC < 0 || xC >= ${e.inWidth}) {
              continue;
            }

            for (int d1 = 0; d1 < ${p}; d1 += 4) {
              vec4 wValues = vec4(
                getW(wR, wC, d1, d2),
                getW(wR, wC, d1 + 1, d2),
                getW(wR, wC, d1 + 2, d2),
                getW(wR, wC, d1 + 3, d2)
              );

              if (${h}) {
                vec4 xValues = vec4(
                  getX(batch, xR, xC, d1),
                  getX(batch, xR, xC, d1 + 1),
                  getX(batch, xR, xC, d1 + 2),
                  getX(batch, xR, xC, d1 + 3)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec4 xValues = vec4(
                  getX(batch, d1, xR, xC),
                  getX(batch, d1 + 1, xR, xC),
                  getX(batch, d1 + 2, xR, xC),
                  getX(batch, d1 + 3, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }
            }

            if (${m===1}) {

              if (${h}) {
                dotProd +=
                    getX(batch, xR, xC, ${p}) *
                    getW(wR, wC, ${p}, d2);
              } else {
                dotProd +=
                    getX(batch, ${p}, xR, xC) *
                    getW(wR, wC, ${p}, d2);
              }

            } else if (${m===2}) {
              vec2 wValues = vec2(
                getW(wR, wC, ${p}, d2),
                getW(wR, wC, ${p} + 1, d2)
              );

              if (${h}) {
                vec2 xValues = vec2(
                  getX(batch, xR, xC, ${p}),
                  getX(batch, xR, xC, ${p} + 1)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec2 xValues = vec2(
                  getX(batch, ${p}, xR, xC),
                  getX(batch, ${p} + 1, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            } else if (${m===3}) {
              vec3 wValues = vec3(
                getW(wR, wC, ${p}, d2),
                getW(wR, wC, ${p} + 1, d2),
                getW(wR, wC, ${p} + 2, d2)
              );

              if (${h}) {
                vec3 xValues = vec3(
                  getX(batch, xR, xC, ${p}),
                  getX(batch, xR, xC, ${p} + 1),
                  getX(batch, xR, xC, ${p} + 2)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec3 xValues = vec3(
                  getX(batch, ${p}, xR, xC),
                  getX(batch, ${p} + 1, xR, xC),
                  getX(batch, ${p} + 2, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            }
          }
        }

        float result = dotProd;
        ${x}
        ${b}
        setOutput(result);
      }
    `}},nB=class{constructor(e){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let t=e.padInfo.front,n=e.padInfo.top,r=e.padInfo.left,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=e.dilationDepth,c=e.dilationHeight,l=e.dilationWidth,u=e.filterDepth,d=e.filterHeight,f=e.filterWidth,p=Math.floor(e.inChannels/4)*4,m=e.inChannels%4;this.userCode=`
      const ivec3 strides = ivec3(${i}, ${a}, ${o});
      const ivec3 pads = ivec3(${t}, ${n}, ${r});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d2 = coords.u;

        ivec3 xFRCCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xFCorner = xFRCCorner.x;
        int xRCorner = xFRCCorner.y;
        int xCCorner = xFRCCorner.z;

        // Convolve x(?, ?, ?, d1) with w(:, :, :, d1, d2) to get
        // y(yF, yR, yC, d2). ? = to be determined. : = across all
        // values in that axis.
        float dotProd = 0.0;
        for (int wF = 0; wF < ${u}; wF++) {
          int xF = xFCorner + wF * ${s};

          if (xF < 0 || xF >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${d}; wR++) {
            int xR = xRCorner + wR * ${c};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${f}; wC++) {
              int xC = xCCorner + wC * ${l};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              for (int d1 = 0; d1 < ${p}; d1 += 4) {
                vec4 xValues = vec4(
                  getX(batch, xF, xR, xC, d1),
                  getX(batch, xF, xR, xC, d1 + 1),
                  getX(batch, xF, xR, xC, d1 + 2),
                  getX(batch, xF, xR, xC, d1 + 3)
                );
                vec4 wValues = vec4(
                  getW(wF, wR, wC, d1, d2),
                  getW(wF, wR, wC, d1 + 1, d2),
                  getW(wF, wR, wC, d1 + 2, d2),
                  getW(wF, wR, wC, d1 + 3, d2)
                );

                dotProd += dot(xValues, wValues);
              }

              if (${m===1}) {
                dotProd +=
                  getX(batch, xF, xR, xC, ${p}) *
                  getW(wF, wR, wC, ${p}, d2);
              } else if (${m===2}) {
                vec2 xValues = vec2(
                  getX(batch, xF, xR, xC, ${p}),
                  getX(batch, xF, xR, xC, ${p} + 1)
                );
                vec2 wValues = vec2(
                  getW(wF, wR, wC, ${p}, d2),
                  getW(wF, wR, wC, ${p} + 1, d2)
                );
                dotProd += dot(xValues, wValues);
              } else if (${m===3}) {
                vec3 xValues = vec3(
                  getX(batch, xF, xR, xC, ${p}),
                  getX(batch, xF, xR, xC, ${p} + 1),
                  getX(batch, xF, xR, xC, ${p} + 2)
                );
                vec3 wValues = vec3(
                  getW(wF, wR, wC, ${p}, d2),
                  getW(wF, wR, wC, ${p} + 1, d2),
                  getW(wF, wR, wC, ${p} + 2, d2)
                );
                dotProd += dot(xValues, wValues);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}},rB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=vF(this.outputShape.length);let a=e.padInfo.left,o=e.strideWidth,s=e.dilationWidth,c=e.filterHeight,l=e.filterWidth,u=l,f=`
       int xR; int xC; int xCOffset;
       vec4 wTexel; vec4 previous; vec4 final;`;for(let e=0;e<l;e++)f+=`
           vec4 xTexelC${e*2};
           int xTexelC${e*2}Ready;
           vec4 xTexelC${e*2+1};
           int xTexelC${e*2+1}Ready;
           vec4 xC${e};`;f+=`
     for (int r = 0; r < ${c}; r++) {
      for (int d1 = 0; d1 < ${e.inChannels}; d1 += 2) {
       `;for(let e=0;e<l;e++)f+=`
           xTexelC${e*2} = vec4(0.0);
           xTexelC${e*2}Ready = 0;
           xTexelC${e*2+1} = vec4(0.0);
           xTexelC${e*2+1}Ready = 0;
           xC${e} = vec4(0.0);`;f+=`
         xR = xRCorner + r * dilations[0];
         if (xR >=0 && xR < inDims[0]) {
       `;for(let t=0;t<(u+1)/2;t++){let n=t*2;if(f+=`
           xC = xCCorner + ${n*s};
           `,o===1){if(n<l&&(a%2==1?(f+=`
                 xCOffset = xC + 1;
                 if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xCOffset, d1);

                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }
               `,f+=s===1&&n>0?`
                 xC${n} = vec4(xTexelC${n-2}.zw, xTexelC${n}.xy);
                 `:`
                   xCOffset = xC + 1 - 2;

                   if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       previous.zw = vec2(0.0);
                     }

                     xC${n} = vec4(previous.zw, xTexelC${n}.xy);
                   } else {
                     xC${n} = vec4(0.0, 0.0, xTexelC${n}.xy);
                   }
                   `):f+=`
                 if (xC >= 0 && xC < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 xC${n} = xTexelC${n};
                 `,n+1<l)){let e=a%2==0?d(s):s;s%2==0&&a%2==1||s%2!=0&&a%2!=1?(f+=`
                   xCOffset = xC + imod(pads[1], 2) + ${e};

                   if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n+1}Ready == 0) {
                     xTexelC${n+1} = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       xTexelC${n+1}.zw = vec2(0.0);
                     }
                     xTexelC${n+1}Ready = 1;
                   }
                   `,f+=s>1?`
                     xCOffset -= 2;
                     if (xCOffset >= 0 && xCOffset < inDims[1]) {
                      previous = getX(batch, xR, xCOffset, d1);
                      xC${n+1} = vec4(previous.zw, xTexelC${n+1}.xy);
                     } else {
                      xC${n+1} = vec4(0.0, 0.0, xTexelC${n+1}.xy);
                     }
                     `:`
                     xC${n+1} = vec4(xTexelC${n}.zw, xTexelC${n+1}.xy);
                     `):f+=e===1?`
                     xC${n+1} = xTexelC${n};
                     `:`
                     xCOffset = xC + ${e};

                     if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n+1}Ready == 0) {
                       xTexelC${n+1} = getX(batch, xR, xCOffset, d1);
                       if (xCOffset + 1 >= inDims[1]) {
                         xTexelC${n+1}.zw = vec2(0.0);
                       }
                       xTexelC${n+1}Ready = 1;
                     }

                     xC${n+1} = xTexelC${n+1};
                     `}}else n<l&&(a%2==1?(f+=`
                 xCOffset = xC + 1 - strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xCOffset, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${n+1}Ready == 0) {
                   xTexelC${n+1} = getX(batch, xR, xC + 1, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xC + 2 >= inDims[1]) {
                     xTexelC${n+1}.zw = vec2(0.0);
                   }
                   xTexelC${n+1}Ready = 1;
                 }

                 xC${n} = vec4(xTexelC${n}.zw, xTexelC${n+1}.zw);
               `,n+1<l&&(f+=`
                   final = vec4(0.0);
                   xCOffset = xC + 1 + strides[1];
                   if(xCOffset >= 0 && xCOffset < inDims[1]) {
                     final = getX(batch, xR, xCOffset, d1);
                   }
                   xC${n+1} = vec4(xTexelC${n+1}.xy, final.xy);
                 `)):(f+=`
                 if(xC >= 0 && xC < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 xCOffset = xC + strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${n+1}Ready == 0) {
                   xTexelC${n+1} = getX(batch, xR, xCOffset, d1);
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${n+1}.zw = vec2(0.);
                   }
                   xTexelC${n+1}Ready = 1;
                 }

                 xC${n} = vec4(
                   xTexelC${n}.xy, xTexelC${n+1}.xy);
               `,n+1<l&&(f+=`
                   xC${n+1} = vec4(xTexelC${n}.zw, xTexelC${n+1}.zw);
                 `)));n<l&&(f+=`
             wTexel = getW(r, ${n}, d1, d2);
             dotProd += xC${n}.xxzz * vec4(wTexel.xy, wTexel.xy);
             if(d1 + 1 < ${e.inChannels}) {
               dotProd += xC${n}.yyww * vec4(wTexel.zw, wTexel.zw);
             }
           `,n+1<l&&(f+=`
               wTexel = getW(r, ${n+1}, d1, d2);
               dotProd += xC${n+1}.xxzz * vec4(wTexel.xy, wTexel.xy);
               if(d1 + 1 < ${e.inChannels}) {
                 dotProd += xC${n+1}.yyww * vec4(wTexel.zw, wTexel.zw);
               }
             `))}f+=`
     }
   `,f+=`
     }
   `,f+=`
     }
   `;let p=``,m=``;n&&(p=r?`vec4 activation(vec4 a) {
           vec4 b = getPreluActivationWeightsAtOutCoords();
           ${n}
         }`:i?`vec4 activation(vec4 a) {
           vec4 b = getLeakyreluAlphaAtOutCoords();
           ${n}
         }`:`vec4 activation(vec4 x) {
           ${n}
         }`,m=`result = activation(result);`);let h=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
       ${p}

       void main() {
         ivec4 coords = getOutputCoords();
         int batch = coords.x;
         ivec2 xRCCorner = coords.yz * strides - pads;
         int d2 = coords.w;
         int xRCorner = xRCCorner.x;
         int xCCorner = xRCCorner.y;

         //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
         vec4 dotProd = vec4(0.000000000000001);

         ${f}

         vec4 result = dotProd - vec4(0.000000000000001);
         ${h}
         ${m}
         setOutput(result);
       }
     `}},iB=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`inputShape`,type:`ivec4`},{name:`pad`,type:`ivec2`},{name:`stride`,type:`ivec2`},{name:`dilation`,type:`ivec2`},{name:`inChannels`,type:`int`},{name:`itemsPerBlockRow`,type:`int`},{name:`outWidth`,type:`int`}],this.outputShape=e,this.enableShapeUniforms=vF(this.outputShape.length);let{dataFormat:n}=t,r=pP(),i=n===`channelsLast`,a=i?1:2,o=i?2:3,s=this.enableShapeUniforms?`if(blockIndex < outShape[2] && pos < outShape[1]) {`:`if(blockIndex < ${e[2]} && pos < ${e[1]}) {`,c=``;for(let e=0;e<=1;e++)for(let t=0;t<=1;t++)c+=`
          blockIndex = rc.z + ${t};
          pos = rc.y + ${e};

          ${s}
            offsetY = int(blockIndex / outWidth) * stride[0] - pad[0];
            d0 = offsetY + dilation[0] * (pos / itemsPerBlockRow);

            if(d0 < inputShape[${a}] && d0 >= 0) {
              // Use custom imod instead mod. On Intel GPU, mod may generate
              // unexpected value.
              // https://github.com/tensorflow/tfjs/issues/5447
              offsetX = imod(blockIndex, outWidth) * stride[1] - pad[1];
              d1 = offsetX + dilation[1] * (imod(pos, itemsPerBlockRow) /
                  inChannels);

              if(d1 < inputShape[${o}] && d1 >= 0) {

                ch = imod(pos, inChannels);

                if (${i}) {
                  innerDims = vec2(d1, ch);
                  result[${e*2+t}] = getChannel(
                    getA(rc.x, d0, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                } else {
                  innerDims = vec2(d0, d1);
                  result[${e*2+t}] = getChannel(
                    getA(rc.x, ch, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                }
              }
            }
          }
        `;this.userCode=`
      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0);

        int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
        vec2 innerDims;

        ${c}

        ${r.output} = result;
      }
    `}};function aB(e,t){let n=e.length;return n>=3?t?[...e.slice(0,-3),e[n-3]*e[n-2],e[n-1]]:[...e.slice(0,-3),e[n-3],e[n-2]*e[n-1]]:!t&&n===1&&e[0]>1?[e[0],1]:null}function oB({x:e,filter:t,convInfo:n,backend:r,bias:i=null,preluActivationWeights:a=null,leakyreluAlpha:o=0,activation:s=null}){let c=e.shape,l=r.texData.get(e.dataId),u=n.inChannels,d=c[0]*c[1]*c[2],f=n.outChannels,p=n.dataFormat===`channelsLast`,h,g=[];if(a!=null){let e=aB(a.shape,p);e!=null&&(a=$({inputs:{x:a},backend:r,attrs:{shape:e}}),g.push(a))}if(i!=null){let e=aB(i.shape,p);e!=null&&(i=$({inputs:{x:i},backend:r,attrs:{shape:e}}),g.push(i))}if(!((d===1||f===1)&&u>1e3)&&l.isPacked&&p&&l.texture!=null&&c[2]%2!=0&&v(l.shape.slice(-3),c.slice(-3))){let u=c[0]*c[1]*(c[2]+1),d={dataId:e.dataId,shape:[1,u,n.inChannels],dtype:e.dtype},f=l.shape;l.shape=l.shape.slice(),l.shape[l.shape.length-2]++,m($N(l.shape,d.shape),()=>`packed reshape ${l.shape} to ${d.shape} isn't free`);let p=$({inputs:{x:t},backend:r,attrs:{shape:[1,n.inChannels,n.outChannels]}});g.push(p);let _=_R({a:d,b:p,backend:r,transposeA:!1,transposeB:!1,bias:i,activation:s,preluActivationWeights:a,leakyreluAlpha:o}),v=r.texData.get(_.dataId);m(v.isPacked,()=>`batchMatMul result is expected to be packed`),l.shape=f,v.shape=n.outShape,h=PL({inputs:{x:_},backend:r}),h.shape=n.outShape,g.push(_)}else{let c=n.outHeight*n.outWidth,l=$({inputs:{x:e},backend:r,attrs:{shape:p?[n.batchSize,c,n.inChannels]:[n.batchSize,n.inChannels,c]}}),u=$({inputs:{x:t},backend:r,attrs:{shape:[1,n.inChannels,n.outChannels]}}),d=_R({a:p?l:u,b:p?u:l,transposeA:!p,transposeB:!1,backend:r,bias:i,activation:s,preluActivationWeights:a,leakyreluAlpha:o});h=$({inputs:{x:d},backend:r,attrs:{shape:n.outShape}}),g.push(l),g.push(u),g.push(d)}for(let e of g)r.disposeIntermediateTensorInfo(e);return h}function sB({x:e,filter:t,convInfo:n,backend:r,bias:i=null,preluActivationWeights:a=null,leakyreluAlpha:o=0,activation:s=null}){let{filterWidth:c,filterHeight:l,inChannels:u,outWidth:d,outHeight:f,dataFormat:p}=n,m=p===`channelsLast`,h=c*l*u,g=f*d,v=[n.batchSize,h,g],y=[];if(a!=null){let e=aB(a.shape,m);e!=null&&(a=$({inputs:{x:a},backend:r,attrs:{shape:e}}),y.push(a))}if(i!=null){let e=aB(i.shape,m);e!=null&&(i=$({inputs:{x:i},backend:r,attrs:{shape:e}}),y.push(i))}let b=$({inputs:{x:t},backend:r,attrs:{shape:[1,h,_(t.shape)/h]}});y.push(b);let x=new iB(v,n),S=[e.shape,[n.padInfo.top,n.padInfo.left],[n.strideHeight,n.strideWidth],[n.dilationHeight,n.dilationWidth],[n.inChannels],[n.filterWidth*n.inChannels],[n.outWidth]],C=r.runWebGLProgram(x,[e],`float32`,S),w=$({inputs:{x:C},backend:r,attrs:{shape:v}});y.push(C),y.push(w);let T=i!=null,E=a!=null,D=s===`leakyrelu`,ee=s?YL(s,!0):null,te=new XL(m?w.shape:b.shape,m?b.shape:w.shape,m?[n.batchSize,g,n.outChannels]:[n.batchSize,n.outChannels,g],!0,!1,T,ee,E,D),ne=m?[w,b]:[b,w];if(i&&ne.push(i),E&&ne.push(a),D){let e=r.makeTensorInfo([],`float32`,ti(o,`float32`));ne.push(e),y.push(e)}let re=r.runWebGLProgram(te,ne,`float32`),ie=$({inputs:{x:re},backend:r,attrs:{shape:n.outShape}});y.push(re);for(let e of y)r.disposeIntermediateTensorInfo(e);return ie}function cB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dataFormat:c,dilations:l,dimRoundingMode:u}=r,d=is(c),f=Wo(i.shape,a.shape,o,l,s,u,!1,d),p;if(f.filterHeight===1&&f.filterWidth===1&&f.dilationHeight===1&&f.dilationWidth===1&&f.strideHeight===1&&f.strideWidth===1&&(f.padInfo.type===`SAME`||f.padInfo.type===`VALID`))p=oB({x:i,filter:a,convInfo:f,backend:n});else if(f.strideWidth<=2&&d===`channelsLast`&&k().getBool(`WEBGL_EXP_CONV`)){let e=new rB(f),t=[[f.padInfo.top,f.padInfo.left],[f.strideHeight,f.strideWidth],[f.dilationHeight,f.dilationWidth],[f.inHeight,f.inWidth]];p=n.runWebGLProgram(e,[i,a],`float32`,t)}else if(k().getBool(`WEBGL_CONV_IM2COL`))p=sB({x:i,filter:a,convInfo:f,backend:n});else{let e=new tB(f);p=n.runWebGLProgram(e,[i,a],`float32`)}let m=$({inputs:{x:p},backend:n,attrs:{shape:f.outShape}});return n.disposeIntermediateTensorInfo(p),m}var lB={kernelName:it,backendName:`webgl`,kernelFunc:cB},uB=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideHeight,n=e.strideWidth,r=e.padInfo.top,i=e.padInfo.left,a=e.dataFormat===`channelsLast`;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int d2 = coords.w;

        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${r};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${n} - ${i};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              ${a?`float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);`:`float dyValue = getDy(b, d2, yR, yC);
              float xValue = getX(b, d1, xR, xC);
              dotProd += (xValue * dyValue);`}
            }
          }
        }
        setOutput(dotProd);
      }
    `}},dB=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=e.dataFormat===`channelsLast`,o=t-1-e.padInfo.top,s=n-1-e.padInfo.left,c=a?1:2,l=a?2:3,u=a?3:1;this.userCode=`
      const ivec2 pads = ivec2(${o}, ${s});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[${u}];

        ivec2 dyCorner = ivec2(coords[${c}], coords[${l}]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${r}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${n}; wC++) {
            float dyC = float(dyCCorner + wC) / ${i}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${n} - 1 - wC;

            for (int d2 = 0; d2 < ${e.outChannels}; d2++) {

              if (${a}) {
                float xValue = getDy(batch, idyR, idyC, d2);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              } else {
                float xValue = getDy(batch, d2, idyR, idyC);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `}},fB=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideDepth,n=e.strideHeight,r=e.strideWidth,i=e.padInfo.front,a=e.padInfo.top,o=e.padInfo.left;this.userCode=`
      void main() {
        ivec5 coords = getOutputCoords();
        int wF = coords.x;
        int wR = coords.y;
        int wC = coords.z;
        int d1 = coords.w;
        int d2 = coords.u;

        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yF = 0; yF < ${e.outDepth}; yF++) {
            int xF = wF + yF * ${t} - ${i};

            if (xF < 0 || xF >= ${e.inDepth}) {
              continue;
            }

            for (int yR = 0; yR < ${e.outHeight}; yR++) {
              int xR = wR + yR * ${n} - ${a};

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int yC = 0; yC < ${e.outWidth}; yC++) {
                int xC = wC + yC * ${r} - ${o};

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float dyValue = getDy(b, yF, yR, yC, d2);
                float xValue = getX(b, xF, xR, xC, d1);
                dotProd += (xValue * dyValue);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}},pB=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterDepth,n=e.filterHeight,r=e.filterWidth,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=t-1-e.padInfo.front,c=n-1-e.padInfo.top,l=r-1-e.padInfo.left;this.userCode=`
      const ivec3 pads = ivec3(${s}, ${c}, ${l});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.u;


        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyFCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        float dotProd = 0.0;
        for (int wF = 0; wF < ${t}; wF++) {
          float dyF = float(dyFCorner + wF) / ${i}.0;

          if (dyF < 0.0 || dyF >= ${e.outDepth}.0 || fract(dyF) > 0.0) {
            continue;
          }
          int idyF = int(dyF);

          int wFPerm = ${t} - 1 - wF;

          for (int wR = 0; wR < ${n}; wR++) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
              fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            int wRPerm = ${n} - 1 - wR;

            for (int wC = 0; wC < ${r}; wC++) {
              float dyC = float(dyCCorner + wC) / ${o}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              int wCPerm = ${r} - 1 - wC;

              for (int d2 = 0; d2 < ${e.outChannels}; d2++) {
                float xValue = getDy(batch, idyF, idyR, idyC, d2);
                float wValue = getW(wFPerm, wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function mB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,dataFormat:c,dimRoundingMode:l,filterShape:u}=r,d=is(c),f=new uB(Wo(i.shape,u,o,1,s,l,!1,d));return n.runWebGLProgram(f,[i,a],`float32`)}var hB={kernelName:at,backendName:`webgl`,kernelFunc:mB},gB=class{constructor(e){this.variableNames=[`dy`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`strides`,type:`vec2`}],this.outputShape=e.inShape,this.enableShapeUniforms=vF(this.outputShape.length);let t=e.filterHeight,n=e.filterWidth,r=t-1-e.padInfo.top,i=n-1-e.padInfo.left;this.userCode=`
      const ivec2 pads = ivec2(${r}, ${i});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];

        ivec2 dyCorner = ivec2(coords[1], coords[2]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        vec4 result = vec4(0.);
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / strides[0];
          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);
          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${n}; wC++) {
            int wCPerm = ${n} - 1 - wC;

            float dyC = float(dyCCorner + wC) / strides[1];
            bool idyCVal = (dyC >= 0.0) && (dyC < ${e.outWidth}.0)
              && (fract(dyC) == 0.0);
            int idyC = int(dyC);

            float dyC2 = float(dyCCorner + wC + 1) / strides[1];
            bool idyCVal2 = (dyC2 >= 0.0) && (dyC2 < ${e.outWidth}.0)
              && (fract(dyC2) == 0.0);
            int idyC2 = int(dyC2);

            if (idyCVal && idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec4 dySample2 = (idyC / 2 == idyC2 / 2) ?
                  dySample : getDy(batch, idyR, idyC2, d2);

                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));

                dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample2.xy : dySample2.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC2, d2);
                vec2 dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            }
          }
        }
        setOutput(result);
      }
    `}};function _B(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{inputShape:o,strides:s,pad:c,dataFormat:l,dimRoundingMode:u}=r,d=is(l),f=Wo(o,a.shape,s,1,c,u,!1,d);if(k().getBool(`WEBGL_PACK_CONV2DTRANSPOSE`)&&d===`channelsLast`){let e=[[f.strideHeight,f.strideWidth]],t=new gB(f);return n.runWebGLProgram(t,[i,a],`float32`,e)}{let e=new dB(f);return n.runWebGLProgram(e,[i,a],`float32`)}}var vB={kernelName:ot,backendName:`webgl`,kernelFunc:_B};function yB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r,l=new nB(Go(i.shape,a.shape,o,c,s));return n.runWebGLProgram(l,[i,a],`float32`)}var bB={kernelName:st,backendName:`webgl`,kernelFunc:yB};function xB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,filterShape:c}=r,l=new fB(Go(i.shape,c,o,1,s));return n.runWebGLProgram(l,[i,a],`float32`)}var SB={kernelName:ct,backendName:`webgl`,kernelFunc:xB};function CB(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{pad:o,strides:s,inputShape:c}=r,l=new pB(Go(c,a.shape,s,1,o));return n.runWebGLProgram(l,[i,a],`float32`)}var wB={kernelName:lt,backendName:`webgl`,kernelFunc:CB},TB={kernelName:`Cos`,backendName:`webgl`,kernelFunc:qL({opSnippet:KL+`
  return cos(x);
`,packedOpSnippet:`
  vec4 result = cos(x);
  bvec4 isNaN = isnan(x);
  ${ML}
  return result;
`})},EB={kernelName:ut,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`})},DB=class{constructor(e,t,n,r,i){this.variableNames=[`Image`,`Boxes`,`BoxInd`],this.outputShape=[];let[a,o,s,c]=e,[l]=t,[u,d]=n;this.outputShape=[l,u,d,c];let f=+(r===`bilinear`),[p,m]=[`${o-1}.0`,`${s-1}.0`],[h,g,_]=u>1?[`${(o-1)/(u-1)}`,`(y2-y1) * height_ratio`,`y1*${p} + float(y)*(height_scale)`]:[`0.0`,`0.0`,`0.5 * (y1+y2) * ${p}`],[v,y,b]=d>1?[`${(s-1)/(d-1)}`,`(x2-x1) * width_ratio`,`x1*${m} + float(x)*(width_scale)`]:[`0.0`,`0.0`,`0.5 * (x1+x2) * ${m}`];this.userCode=`
      const float height_ratio = float(${h});
      const float width_ratio = float(${v});
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int y = coords[1];
        int x = coords[2];
        int d = coords[3];

        // get box vals
        float y1 = getBoxes(b,0);
        float x1 = getBoxes(b,1);
        float y2 = getBoxes(b,2);
        float x2 = getBoxes(b,3);

        // get image in batch index
        int bInd = round(getBoxInd(b));
        if(bInd < 0 || bInd >= ${a}) {
          return;
        }

        float height_scale = ${g};
        float width_scale = ${y};

        float in_y = ${_};
        if( in_y < 0.0 || in_y > ${p} ) {
          setOutput(float(${i}));
          return;
        }
        float in_x = ${b};
        if( in_x < 0.0 || in_x > ${m} ) {
          setOutput(float(${i}));
          return;
        }

        vec2 sourceFracIndexCR = vec2(in_x,in_y);
        if(${f} == 1) {
          // Compute the four integer indices.
          ivec2 sourceFloorCR = ivec2(sourceFracIndexCR);
          ivec2 sourceCeilCR = ivec2(ceil(sourceFracIndexCR));

          float topLeft = getImage(b, sourceFloorCR.y, sourceFloorCR.x, d);
          float bottomLeft = getImage(b, sourceCeilCR.y, sourceFloorCR.x, d);
          float topRight = getImage(b, sourceFloorCR.y, sourceCeilCR.x, d);
          float bottomRight = getImage(b, sourceCeilCR.y, sourceCeilCR.x, d);

          vec2 fracCR = sourceFracIndexCR - vec2(sourceFloorCR);

          float top = topLeft + (topRight - topLeft) * fracCR.x;
          float bottom = bottomLeft + (bottomRight - bottomLeft) * fracCR.x;
          float newValue = top + (bottom - top) * fracCR.y;
          setOutput(newValue);
        } else {
          // Compute the coordinators of nearest neighbor point.
          ivec2 sourceNearestCR = ivec2(floor(
            sourceFracIndexCR + vec2(0.5,0.5)));
          float newValue = getImage(b, sourceNearestCR.y, sourceNearestCR.x, d);
          setOutput(newValue);
        }
      }
    `}},OB={kernelName:pt,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{image:i,boxes:a,boxInd:o}=t,{cropSize:s,method:c,extrapolationValue:l}=r,u=new DB(i.shape,a.shape,s,c,l);return n.runWebGLProgram(u,[i,a,o],`float32`)}},kB;(function(e){e.Prod=`*`,e.Sum=`+`})(kB||={});var AB=class{constructor(e,t,n,r){this.op=e,this.outputShape=t,this.variableNames=[`x`],this.customUniforms=[{name:`index`,type:`float`}];let i=this.outputShape.length,a=this.op===kB.Prod?`1.0`:`0.0`,o=n?a:`getX(${jB(i,`coords`,this.op)})`,s=this.outputShape[this.outputShape.length-1],c=``,l=``;n?(c=r?`end != ${s-1}`:`end != 0`,l=r?`end + 1`:`end - 1`):(c=r?`end + pow2 < ${s}`:`end >= pow2`,l=r?`end + pow2`:`end - pow2`),this.userCode=`
      void main() {
        ${lF(i)} coords = getOutputCoords();
        int end = ${MB(i,`coords`,this.op)};
        float val = ${o};
        int pow2 = int(pow(2.0, index));
        if (${c}) {
          int idx = ${l};
          ${MB(i,`coords`,this.op)} = idx;
          val ${this.op}= getX(${jB(i,`coords`,this.op)});
        }
        setOutput(val);
      }
    `}};function jB(e,t,n){if(e===1)return`${t}`;if(e===2)return`${t}.x, ${t}.y`;if(e===3)return`${t}.x, ${t}.y, ${t}.z`;if(e===4)return`${t}.x, ${t}.y, ${t}.z, ${t}.w`;throw Error(`Cumulative ${n} for rank ${e} is not yet supported`)}function MB(e,t,n){if(e===1)return`${t}`;if(e===2)return`${t}.y`;if(e===3)return`${t}.z`;if(e===4)return`${t}.w`;throw Error(`Cumulative ${n} for rank ${e} is not yet supported`)}function NB(e,t,n,r,i,a){let o=t.shape.length,s=Jc([r],o),c=t;s!=null&&(c=hR({inputs:{x:t},backend:n,attrs:{perm:s}}));let l=Xc(1,o)[0];if(l!==o-1)throw Error(`WebGL cumprod shader expects an inner-most axis=${t.shape.length-1} but got axis=${r}`);let u=c.shape[l],d=PL({inputs:{x:c},backend:n});for(let t=0;t<=Math.ceil(Math.log2(u))-1;t++){let r=new AB(e,c.shape,!1,a),i=[[t]],o=d;d=n.runWebGLProgram(r,[d],d.dtype,i),n.disposeIntermediateTensorInfo(o)}if(i){let t=new AB(e,c.shape,i,a),r=d;d=n.runWebGLProgram(t,[d],d.dtype),n.disposeIntermediateTensorInfo(r)}if(s!=null){let e=Yc(s),t=hR({inputs:{x:d},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(c),t}return d}function PB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;return NB(kB.Prod,i,n,a,o,s)}var FB={kernelName:dt,backendName:`webgl`,kernelFunc:PB};function IB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;return NB(kB.Sum,i,n,a,o,s)}var LB={kernelName:ft,backendName:`webgl`,kernelFunc:IB};function RB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o,binaryOutput:s}=r;if(i.shape.length===1){let e=ZF(n.readSync(i.dataId),n.readSync(a.dataId),a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,e)}if(i.shape.length===2){let e=QF(n.bufferSync(i),n.bufferSync(a),o,s);return n.makeTensorInfo(e.shape,a.dtype,e.values)}throw Error(`Error in denseBincount: input must be at most rank 2, but got rank${i.shape.length}.`)}var zB={kernelName:mt,backendName:`webgl`,kernelFunc:RB},BB=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=[],this.outputShape=e,this.blockSize=t,this.dataFormat=n,this.userCode=`
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = ${this.getHeightCoordString()};
      int w = ${this.getWidthCoordString()};
      int d = ${this.getDepthCoordString()};

      int in_h = h / ${t};
      int offset_h = imod(h, ${t});
      int in_w = w / ${t};
      int offset_w = imod(w, ${t});
      int offset_d = (offset_h * ${t} + offset_w) *
        ${this.getOutputDepthSize()};
      int in_d = d + offset_d;

      float result = ${this.getInputSamplingString()};
      setOutput(result);
    }
  `}getHeightCoordString(){return this.dataFormat===`NHWC`?`coords[1]`:`coords[2]`}getWidthCoordString(){return this.dataFormat===`NHWC`?`coords[2]`:`coords[3]`}getDepthCoordString(){return this.dataFormat===`NHWC`?`coords[3]`:`coords[1]`}getOutputDepthSize(){return this.dataFormat===`NHWC`?this.outputShape[3]:this.outputShape[1]}getInputSamplingString(){return this.dataFormat===`NHWC`?`getX(b, in_h, in_w, in_d)`:`getX(b, in_d, in_h, in_w)`}};function VB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockSize:a,dataFormat:o}=r,s=i.shape[0],c=o===`NHWC`?i.shape[1]:i.shape[2],l=o===`NHWC`?i.shape[2]:i.shape[3],u=o===`NHWC`?i.shape[3]:i.shape[1],d=c*a,f=l*a,p=u/(a*a),m=new BB(o===`NHWC`?[s,d,f,p]:[s,p,d,f],a,o);return n.runWebGLProgram(m,[i],i.dtype)}var HB={kernelName:ht,backendName:`webgl`,kernelFunc:VB},UB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=vF(this.outputShape.length);let a=e.filterHeight,o=e.filterWidth,s=e.outChannels/e.inChannels,c=``,l=``;n&&(c=r?`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${n}
        }`:i?`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${n}
        }`:`
          float activation(float x) {
            ${n}
          }
        `,l=`result = activation(result);`);let u=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
      ${c}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${s};
        int q = d2 - d1 * ${s};

        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        // TO DO(dsmilkov): Flatten the two for loops and vec4 the operations.
        for (int wR = 0; wR < ${a}; wR++) {
          int xR = xRCorner + wR * dilations[0];

          if (xR < 0 || xR >= inDims[0]) {
            continue;
          }

          for (int wC = 0; wC < ${o}; wC++) {
            int xC = xCCorner + wC * dilations[1];

            if (xC < 0 || xC >= inDims[1]) {
              continue;
            }

            float xVal = getX(batch, xR, xC, d1);
            float wVal = getW(wR, wC, d1, q);
            dotProd += xVal * wVal;
          }
        }

        float result = dotProd;
        ${u}
        ${l}
        setOutput(result);
      }
    `}},WB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=vF(this.outputShape.length);let a=e.outChannels/e.inChannels,o=e.padInfo.left,s=e.strideWidth,c=e.dilationWidth,l=e.filterHeight,u=e.filterWidth,f=u,p=`
      int xR; int xC; int xCOffset;
      vec4 wTexel; vec4 previous; vec4 final;`;for(let e=0;e<u;e++)p+=`
          vec4 xTexelC${e*2};
          int xTexelC${e*2}Ready;
          vec4 xTexelC${e*2+1};
          int xTexelC${e*2+1}Ready;
          vec4 xC${e};`;p+=`
    for (int r = 0; r < ${l}; r++) {
      `;for(let e=0;e<u;e++)p+=`
          xTexelC${e*2} = vec4(0.0);
          xTexelC${e*2}Ready = 0;
          xTexelC${e*2+1} = vec4(0.0);
          xTexelC${e*2+1}Ready = 0;
          xC${e} = vec4(0.0);`;p+=`
        xR = xRCorner + r * dilations[0];
        if (xR >=0 && xR < inDims[0]) {
      `;for(let e=0;e<(f+1)/2;e++){let t=e*2;if(p+=`
          xC = xCCorner + ${t*c};
          `,s===1){if(t<u&&(o%2==1?(p+=`
                xCOffset = xC + 1;
                if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }
              `,p+=c===1&&t>0?`
                xC${t} = vec4(xTexelC${t-2}.zw, xTexelC${t}.xy);
                `:`
                  xCOffset = xC + 1 - 2;

                  if (xCOffset >= 0 && xCOffset < inDims[1]) {
                    previous = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      previous.zw = vec2(0.0);
                    }

                    xC${t} = vec4(previous.zw, xTexelC${t}.xy);
                  } else {
                    xC${t} = vec4(0.0, 0.0, xTexelC${t}.xy);
                  }
                  `):p+=`
                if (xC >= 0 && xC < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                xC${t} = xTexelC${t};
                `,t+1<u)){let e=o%2==0?d(c):c;c%2==0&&o%2==1||c%2!=0&&o%2!=1?(p+=`
                  xCOffset = xC + imod(pads[1], 2) + ${e};

                  if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t+1}Ready == 0) {
                    xTexelC${t+1} = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      xTexelC${t+1}.zw = vec2(0.0);
                    }
                    xTexelC${t+1}Ready = 1;
                  }
                  `,p+=c>1?`
                    xCOffset -= 2;
                    if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);
                     xC${t+1} = vec4(previous.zw, xTexelC${t+1}.xy);
                    } else {
                     xC${t+1} = vec4(0.0, 0.0, xTexelC${t+1}.xy);
                    }
                    `:`
                    xC${t+1} = vec4(xTexelC${t}.zw, xTexelC${t+1}.xy);
                    `):p+=e===1?`
                    xC${t+1} = xTexelC${t};
                    `:`
                    xCOffset = xC + ${e};

                    if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t+1}Ready == 0) {
                      xTexelC${t+1} = getX(batch, xR, xCOffset, d1);
                      if (xCOffset + 1 >= inDims[1]) {
                        xTexelC${t+1}.zw = vec2(0.0);
                      }
                      xTexelC${t+1}Ready = 1;
                    }

                    xC${t+1} = xTexelC${t+1};
                    `}}else t<u&&(o%2==1?(p+=`
                xCOffset = xC + 1 - strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xCOffset, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${t+1}Ready == 0) {
                  xTexelC${t+1} = getX(batch, xR, xC + 1, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xC + 2 >= inDims[1]) {
                    xTexelC${t+1}.zw = vec2(0.0);
                  }
                  xTexelC${t+1}Ready = 1;
                }

                xC${t} = vec4(xTexelC${t}.zw, xTexelC${t+1}.zw);
              `,t+1<u&&(p+=`
                  final = vec4(0.0);
                  xCOffset = xC + 1 + strides[1];
                  if(xCOffset >= 0 && xCOffset < inDims[1]) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xC${t+1} = vec4(xTexelC${t+1}.xy, final.xy);
                `)):(p+=`
                if(xC >= 0 && xC < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                xCOffset = xC + strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${t+1}Ready == 0) {
                  xTexelC${t+1} = getX(batch, xR, xCOffset, d1);
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${t+1}.zw = vec2(0.);
                  }
                  xTexelC${t+1}Ready = 1;
                }

                xC${t} = vec4(
                  xTexelC${t}.xy, xTexelC${t+1}.xy);
              `,t+1<u&&(p+=`
                  xC${t+1} = vec4(xTexelC${t}.zw, xTexelC${t+1}.zw);
                `)));t<u&&(p+=`
            wTexel = getW(r, ${t}, d1, q);
            dotProd += xC${t} * vec4(wTexel.xz, wTexel.xz);
          `,t+1<u&&(p+=`
              wTexel = getW(r, ${t+1}, d1, q);
              dotProd += xC${t+1} * vec4(wTexel.xz, wTexel.xz);
            `))}p+=`
    }
  `,p+=`
      }
    `;let m=``,h=``;n&&(m=r?`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${n}
        }`:i?`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${n}
        }`:`vec4 activation(vec4 x) {
          ${n}
        }`,h=`result = activation(result);`);let g=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
      ${m}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${a};
        int q = d2 - d1 * ${a};
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
        vec4 dotProd = vec4(0.000000000000001);

        ${p}

        vec4 result = dotProd - vec4(0.000000000000001);
        ${g}
        ${h}
        setOutput(result);
      }
    `}};function GB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c,dimRoundingMode:l}=r,u=c;u??=[1,1],m(ns(o,u),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${o} and dilations '${u}'`);let d=Wo(i.shape,a.shape,o,u,s,l,!0),f;f=k().getBool(`WEBGL_PACK_DEPTHWISECONV`)&&d.strideWidth<=2&&d.outChannels/d.inChannels===1?new WB(d):new UB(d);let p=[[d.padInfo.top,d.padInfo.left],[d.strideHeight,d.strideWidth],[d.dilationHeight,d.dilationWidth],[d.inHeight,d.inWidth]];return n.runWebGLProgram(f,[i,a],`float32`,p)}var KB={kernelName:gt,backendName:`webgl`,kernelFunc:GB},qB=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideHeight,n=e.strideWidth,r=e.padInfo.top,i=e.padInfo.left,a=e.outChannels/e.inChannels;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int dm = coords.w;
        int d2 = d1 * ${a} + dm;

        float dotProd = 0.0;

        // TO DO: Vec4 over the batch size
        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${r};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${n} - ${i};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);
            }
          }
        }
        setOutput(dotProd);
      }
    `}},JB=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=t-1-e.padInfo.top,o=n-1-e.padInfo.left,s=e.outChannels/e.inChannels;this.userCode=`
      const ivec2 pads = ivec2(${a}, ${o});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];
        ivec2 dyCorner = coords.yz - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        float dotProd = 0.0;

        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${r}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${n}; wC++) {
            float dyC = float(dyCCorner + wC) / ${i}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${n} - 1 - wC;

            // TO DO: Vec4 over the channelMul
            for (int dm = 0; dm < ${s}; dm++) {
              int d2 = d1 * ${s} + dm;
              float xValue = getDy(batch, idyR, idyC, d2);
              float wValue = getW(wRPerm, wCPerm, d1, dm);
              dotProd += xValue * wValue;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function YB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,filterShape:u}=r,d=new qB(Wo(i.shape,u,o,s,c,l,!0));return n.runWebGLProgram(d,[i,a],`float32`)}var XB={kernelName:_t,backendName:`webgl`,kernelFunc:YB};function ZB(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,inputShape:u}=r,d=new JB(Wo(u,a.shape,o,s,c,l,!0));return n.runWebGLProgram(d,[i,a],`float32`)}var QB={kernelName:vt,backendName:`webgl`,kernelFunc:ZB},$B=class{constructor(e){this.variableNames=[`X`],this.outputShape=[e,e],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `}};function eV(e){let{inputs:t,backend:n}=e,{x:r}=t,i=[...r.shape,...r.shape],a=_(r.shape),o=$({inputs:{x:r},backend:n,attrs:{shape:[a]}}),s=new $B(a),c=n.runWebGLProgram(s,[o],o.dtype),l=$({inputs:{x:c},backend:n,attrs:{shape:i}});return n.disposeIntermediateTensorInfo(o),n.disposeIntermediateTensorInfo(c),l}var tV={kernelName:yt,backendName:`webgl`,kernelFunc:eV},nV=class{constructor(e){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let{inHeight:t,inWidth:n,padInfo:r,strideHeight:i,strideWidth:a,filterHeight:o,filterWidth:s,dilationHeight:c,dilationWidth:l}=e,{top:u,left:d}=r;this.userCode=`
      const ivec2 strides = ivec2(${i}, ${a});
      const ivec2 pads = ivec2(${u}, ${d});
      const float neg_infinity = -3.4e38;

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.w;
        ivec2 outTopLeftCorner =
            coords.yz * strides - pads;
        int hBeg = outTopLeftCorner.x;
        int wBeg = outTopLeftCorner.y;

        float curVal = neg_infinity;
        for (int h = 0; h < ${o}; h++) {
          int hIn = hBeg + h * ${c};

          if (hIn >= 0 && hIn < ${t}) {
            for (int w = 0; w < ${s}; w++) {
              int wIn = wBeg + w * ${l};

              if (wIn >= 0 && wIn < ${n}) {
                float xVal = getX(batch, hIn, wIn, d1);
                float wVal = getW(h, w, d1);

                float val = xVal + wVal;
                if (val > curVal) {
                  curVal = val;
                }
              }
            }
          }
        }

        float result = curVal;
        setOutput(result);
      }
    `}};function rV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r,l=Vo(i.shape,a.shape,o,s,`NHWC`,c),u,d=new nV(l);u=n.runWebGLProgram(d,[i,a],`float32`);let f=$({inputs:{x:u},backend:n,attrs:{shape:l.outShape}});return n.disposeIntermediateTensorInfo(u),f}var iV={kernelName:bt,backendName:`webgl`,kernelFunc:rV};function aV(e){let{inputs:t,backend:n,attrs:r}=e,{equation:i}=r,a=t,{allDims:o,summedDims:s,idDims:c}=vh(i,a.length);bh(o.length,c,a);let{path:l,steps:u}=xh(s,c),d=u.length,f=null,p=o.length,m=[];for(let e=0;e<d;++e){for(let t of u[e]){let{permutationIndices:e,expandDims:r}=yh(p,c[t]),i;Sh(e)?i=a[t]:(i=hR({inputs:{x:a[t]},backend:n,attrs:{perm:e}}),m.push(i));let o=i.shape.slice();for(let e=0;e<r.length;++e)o.splice(r[e],0,1);v(i.shape,o)||(i=$({inputs:{x:i},backend:n,attrs:{shape:o}}),m.push(i)),f===null?f=i:(f=eR({inputs:{a:i,b:f},backend:n}),m.push(f))}e<d-1&&(l[e]>=0&&(f=pR({inputs:{x:f},backend:n,attrs:{axis:l[e]-(o.length-p),keepDims:!1}}),m.push(f)),p--)}for(let e of m)e!==f&&n.disposeIntermediateTensorInfo(e);return f}var oV={kernelName:Tt,backendName:`webgl`,kernelFunc:aV},sV={kernelName:`Elu`,backendName:`webgl`,kernelFunc:qL({opSnippet:`return (x >= 0.0) ? x : (exp(x) - 1.0);`,packedOpSnippet:`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`})},cV=`return (b >= 0.0) ? a : a * (b + 1.0);`,lV=`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,uV={kernelName:Et,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n}=e,{dy:r,y:i}=t,a=k().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new NL(lV,r.shape,i.shape):new jL(cV,r.shape,i.shape);return n.runWebGLProgram(a,[r,i],r.dtype)}},dV={kernelName:Dt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a == b);`,packedOpSnippet:`
  return vec4(equal(a, b));
`,dtype:`bool`,cpuKernelImpl:rI})},fV={kernelName:`Erf`,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = ${eh};
  float a1 = ${th};
  float a2 = ${nh};
  float a3 = ${rh};
  float a4 = ${ih};
  float a5 = ${ah};

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`})},pV=qL({opSnippet:KL+`
  return exp(x);
`,packedOpSnippet:`
  vec4 result = exp(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:iI,dtype:`float32`}),mV={kernelName:`Exp`,backendName:`webgl`,kernelFunc:pV};function hV(e){let{inputs:t,attrs:n,backend:r}=e,{dim:i}=n,{input:a}=t,o=a.shape.length,s=a.shape.slice(),c=i;return i<0&&(m(-(o+1)<=i,()=>`Axis must be in the interval [${-(o+1)}, ${o}]`),c=o+i+1),s.splice(c,0,1),$({inputs:{x:a},backend:r,attrs:{shape:s}})}var gV={kernelName:Ot,backendName:`webgl`,kernelFunc:hV},_V=`return exp(x) - 1.0;`,vV={kernelName:kt,backendName:`webgl`,kernelFunc:qL({opSnippet:_V,packedOpSnippet:_V,cpuKernelImpl:aI})},yV=class{constructor(e,t,n){this.variableNames=[`real`,`imag`];let r=t[1];this.outputShape=t;let i=n?`2.0 * ${Math.PI}`:`-2.0 * ${Math.PI}`,a=n?`${r}.0`:`1.0`,o;if(e===`real`)o=`return real * expR - imag * expI;`;else if(e===`imag`)o=`return real * expI + imag * expR;`;else throw Error(`FFT component must be either "real" or "imag", got ${e}.`);this.userCode=`
      const float exponentMultiplier = ${i};

      float unaryOpComplex(float real, float expR, float imag, float expI) {
        ${o}
      }

      float mulMatDFT(int batch, int index) {
        float indexRatio = float(index) / float(${r});
        float exponentMultiplierTimesIndexRatio =
            exponentMultiplier * indexRatio;

        float result = 0.0;

        for (int i = 0; i < ${r}; i++) {
          // x = (-2|2 * PI / N) * index * i;
          float x = exponentMultiplierTimesIndexRatio * float(i);
          float expR = cos(x);
          float expI = sin(x);
          float real = getReal(batch, i);
          float imag = getImag(batch, i);

          result +=
              unaryOpComplex(real, expR, imag, expI) / ${a};
        }

        return result;
      }

      void main() {
        ivec2 coords = getOutputCoords();
        setOutput(mulMatDFT(coords[0], coords[1]));
      }
    `}};function bV(e,t,n){let r=n.texData.get(e.dataId),i=_(e.shape),a=e.shape[e.shape.length-1],o=i/a,s=$({inputs:{x:e},backend:n,attrs:{shape:[o,a]}}),c=s.shape,l=new yV(`real`,c,t),u=new yV(`imag`,c,t),d=[{dataId:r.complexTensorInfos.real.dataId,dtype:r.complexTensorInfos.real.dtype,shape:c},{dataId:r.complexTensorInfos.imag.dataId,dtype:r.complexTensorInfos.imag.dtype,shape:c}],f=n.runWebGLProgram(l,d,`float32`),p=n.runWebGLProgram(u,d,`float32`),m=IL({inputs:{real:f,imag:p},backend:n});n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p);let h=$({inputs:{x:m},backend:n,attrs:{shape:e.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(m),h}function xV(e){let{inputs:t,backend:n}=e,{input:r}=t;return bV(r,!1,n)}var SV={kernelName:`FFT`,backendName:`webgl`,kernelFunc:xV},CV=class{constructor(e,t){this.outputShape=[],this.customUniforms=[{name:`value`,type:`float`}],this.variableNames=[`x`],this.outputShape=e,this.userCode=`
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}};function wV(e){let{backend:t,attrs:n}=e,{shape:r,value:i}=n,{dtype:a}=n;if(a||=ce(i),a===`string`){let e=D(a,_(r));return e.fill(i),t.makeTensorInfo(r,a,e)}{let e=new CV(r,i),n=[[i]];return t.runWebGLProgram(e,[],a,n)}}var TV={kernelName:At,backendName:`webgl`,kernelFunc:wV},EV=class{constructor(e){this.variableNames=[`Image`],this.outputShape=[];let t=e[2];this.outputShape=e,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];

          int coordX = ${t} - x - 1;
          float outputValue;
          if(coordX >= 0 && coordX < ${t}) {
            outputValue = getImage(coords[0], coords[1], coordX, coords[3]);
          } else {
            outputValue = getImage(coords[0], coords[1], coords[2], coords[3]);
          }
          setOutput(outputValue);
        }
    `}},DV={kernelName:jt,backendName:`webgl`,kernelFunc:({inputs:e,backend:t})=>{let{image:n}=e,r=t,i=new EV(n.shape);return r.runWebGLProgram(i,[n],n.dtype)}},OV=`return floor(x);`,kV={kernelName:Mt,backendName:`webgl`,kernelFunc:qL({opSnippet:OV,packedOpSnippet:OV,cpuKernelImpl:oI})},AV={kernelName:Nt,backendName:`webgl`,kernelFunc:JL({opSnippet:`
  float s = sign(a) * sign(b);
  int ia = round(a);
  int ib = round(b);
  if (ib != 0) {
    // Windows (D3D) wants guaranteed non-zero int division at compile-time.
    return float(idiv(ia, ib, s));
  } else {
    return NAN;
  }
`,packedOpSnippet:`
  ivec4 ia = round(a);
  ivec4 ib = round(b);
  bvec4 cond = notEqual(ib, ivec4(0));
  ivec4 result = ivec4(0);
  vec4 s = sign(a) * sign(b);

  // Windows (D3D) wants guaranteed non-zero int division at compile-time.
  if (cond[0]) {
    result[0] = idiv(ia[0], ib[0], s[0]);
  }
  if (cond[1]) {
    result[1] = idiv(ia[1], ib[1], s[1]);
  }
  if (cond[2]) {
    result[2] = idiv(ia[2], ib[2], s[2]);
  }
  if (cond[3]) {
    result[3] = idiv(ia[3], ib[3], s[3]);
  }
  return vec4(result);
`,dtype:`int32`})},jV=class{constructor(e){this.variableNames=[`A`];let t=pP(),[n,r]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${r}.0, ${n}.0);

        vec4 values = ${t.texture2D}(A, uv);
        float value;
        if (depth == 0) {
          value = values.r;
        } else if (depth == 1) {
          value = values.g;
        } else if (depth == 2) {
          value = values.b;
        } else if (depth == 3) {
          value = values.a;
        }

        setOutput(floor(value * 255.0 + 0.5));
      }
    `}},MV=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0;let t=pP(),[n,r]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];

        vec4 result = vec4(0.);

        for(int row=0; row<=1; row++) {
          for(int col=0; col<=1; col++) {
            texC = coords[1] + row;
            depth = coords[2] + col;

            vec2 uv = (vec2(texC, texR) + halfCR) /
                       vec2(${r}.0, ${n}.0);
            vec4 values = ${t.texture2D}(A, uv);
            float value;
            if (depth == 0) {
              value = values.r;
            } else if (depth == 1) {
              value = values.g;
            } else if (depth == 2) {
              value = values.b;
            } else if (depth == 3) {
              value = values.a;
            }

            result[row * 2 + col] = floor(value * 255.0 + 0.5);
          }
        }

        ${t.output} = result;
      }
    `}},NV={kernelName:xr,backendName:`webgl`,kernelFunc:IV},PV,FV=k().getBool(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`);function IV(e){let{inputs:t,backend:n,attrs:r}=e,{pixels:i}=t,{numChannels:a}=r,o=typeof HTMLVideoElement<`u`&&i instanceof HTMLVideoElement,s=typeof HTMLImageElement<`u`&&i instanceof HTMLImageElement,[c,l]=o?[i.videoWidth,i.videoHeight]:[i.width,i.height],u=[l,c],d=[l,c,a];if(s||o){let e=k().getBool(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`);(PV==null||e!==FV)&&(FV=e,PV=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:FV})),PV.canvas.width=c,PV.canvas.height=l,PV.drawImage(i,0,0,c,l),i=PV.canvas}let f=n.makeTensorInfo(u,`int32`);n.texData.get(f.dataId).usage=dN.PIXELS,n.gpgpu.uploadPixelDataToTexture(n.getTexture(f.dataId),i);let p=k().getBool(`WEBGL_PACK`)?new MV(d):new jV(d),m=n.runWebGLProgram(p,[f],`int32`);return n.disposeData(f.dataId),m}function LV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=is(u),g=Wo(i.shape,a.shape,c,d,l,f,!1,h),_,v=[],y=o!=null,b=s!=null,x=p===`leakyrelu`,S=()=>{let e=[i,a],t=(e,t)=>{if(t===`NCHW`&&e.shape.length===1&&e.shape[0]!==1){let t=$({inputs:{x:e},backend:n,attrs:{shape:[e.shape[0],1,1]}});return v.push(t),t}return e};if(y&&e.push(t(o,u)),b&&e.push(t(s,u)),x){let t=n.makeTensorInfo([],`float32`,ti(m,`float32`));e.push(t),v.push(t)}return e};if(g.filterHeight===1&&g.filterWidth===1&&g.dilationHeight===1&&g.dilationWidth===1&&g.strideHeight===1&&g.strideWidth===1&&(g.padInfo.type===`SAME`||g.padInfo.type===`VALID`))_=oB({x:i,filter:a,convInfo:g,backend:n,bias:o,activation:p,preluActivationWeights:s,leakyreluAlpha:m});else if(g.strideWidth<=2&&h===`channelsLast`&&k().getBool(`WEBGL_EXP_CONV`)){let e=new rB(g,y,p?YL(p,!0):null,b,x),t=[[g.padInfo.top,g.padInfo.left],[g.strideHeight,g.strideWidth],[g.dilationHeight,g.dilationWidth],[g.inHeight,g.inWidth]],r=S();_=n.runWebGLProgram(e,r,`float32`,t)}else if(k().getBool(`WEBGL_CONV_IM2COL`))_=sB({x:i,filter:a,convInfo:g,backend:n,bias:o,activation:p,preluActivationWeights:s,leakyreluAlpha:m});else{let e=new tB(g,y,p?YL(p,!1):null,b,x),t=S();_=n.runWebGLProgram(e,t,`float32`)}let C=$({inputs:{x:_},backend:n,attrs:{shape:g.outShape}});return v.push(_),v.forEach(e=>n.disposeIntermediateTensorInfo(e)),C}var RV={kernelName:wr,backendName:`webgl`,kernelFunc:LV};function zV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dilations:u,dimRoundingMode:d,activation:f,leakyreluAlpha:p}=r,h=[],g=u;g??=[1,1],m(ns(c,g),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${c} and dilations '${g}'`);let _=Wo(i.shape,a.shape,c,g,l,d,!0),v=k().getBool(`WEBGL_PACK_DEPTHWISECONV`)&&_.strideWidth<=2&&_.outChannels/_.inChannels===1,y=f?YL(f,v):null,b=[i,a],x=o!=null,S=s!=null,C=f===`leakyrelu`;if(x&&b.push(o),S&&b.push(s),C){let e=n.makeTensorInfo([],`float32`,ti(p,`float32`));b.push(e),h.push(e)}let w;w=v?new WB(_,x,y,S,C):new UB(_,x,y,S,C);let T=[[_.padInfo.top,_.padInfo.left],[_.strideHeight,_.strideWidth],[_.dilationHeight,_.dilationWidth],[_.inHeight,_.inWidth]],E=n.runWebGLProgram(w,b,`float32`,T);return h.forEach(e=>n.disposeIntermediateTensorInfo(e)),E}var BV={kernelName:Tr,backendName:`webgl`,kernelFunc:zV},VV=class{constructor(e,t,n,r){this.sliceDim=e,this.strides=t,this.paramsShape=r,this.variableNames=[`x`,`indices`],this.outputShape=n;let i=lF(n.length),a=`
    int index;`;for(let e=0;e<this.sliceDim;e++)a+=`
          index = round(getIndices(coords[0], ${e}));
          out_of_bounds = out_of_bounds || index < 0;
          out_of_bounds = out_of_bounds || index >= ${this.paramsShape[e]};
          flattenIndex += index * ${this.strides[e]};`;this.userCode=`
         void main() {
          ${i} coords = getOutputCoords();
          int flattenIndex = 0;
          bool out_of_bounds = false;

          ${a}

          setOutput(out_of_bounds ? 0.0 : getX(flattenIndex, coords[1]));
        }
      `}};function HV(e){let{inputs:t,backend:n}=e,{params:r,indices:i}=t,a=i.shape,o=a[a.length-1],s=_(r.shape),[c,l,u,d]=pm(r,i),f=$({inputs:{x:i},backend:n,attrs:{shape:[l,o]}}),p=$({inputs:{x:r},backend:n,attrs:{shape:[_(r.shape)/u,u]}});if(n.shouldExecuteOnCPU([r,i])||r.dtype===`string`){let e=sI(n.readSync(i.dataId),n.bufferSync(r),r.dtype,l,o,u,d,r.shape,s);return n.makeTensorInfo(c,r.dtype,e.values)}let m=new VV(o,d,[l,u],r.shape),h=n.runWebGLProgram(m,[p,f],p.dtype),g=$({inputs:{x:h},backend:n,attrs:{shape:c}});return n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(h),g}var UV={kernelName:It,backendName:`webgl`,kernelFunc:HV},WV=class{constructor(e,t){this.variableNames=[`A`,`indices`],this.outputShape=t,this.rank=t.length;let n=lF(this.rank),r=GV(e,2);this.userCode=`
      void main() {
        ${n} resRC = getOutputCoords();
        int index = int(getIndices(resRC.x, resRC.z));
        float inBounds = (index >= 0) && (index < ${e[2]}) ? 1.0 : 0.0;
        setOutput(inBounds * getA(${r}));
      }
    `}};function GV(e,t){let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`],r=[];for(let t=0;t<e.length;t++)t===2?r.push(`index`):r.push(`${n[t]}`);return r.join()}function KV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,indices:a}=t,{axis:o,batchDims:s}=r,c=w(o,i.shape)[0];if(k().get(`DEBUG`)){let e=n.readSync(a.dataId),t=i.shape[c];for(let n=0;n<e.length;++n){let r=e[n];m(r<=t-1&&r>=0,()=>`GatherV2: the index value ${r} is not in [0, ${t-1}]`)}}let l=Bh(i,a,c,s),u=_(a.shape),d=[],f=$({inputs:{x:i},backend:n,attrs:{shape:[l.batchSize,l.outerSize,l.dimSize,l.sliceSize]}}),p=$({inputs:{x:a},backend:n,attrs:{shape:[l.batchSize,u/l.batchSize]}});d.push(f),d.push(p);let h=[l.batchSize,l.outerSize,u/l.batchSize,l.sliceSize];if(n.shouldExecuteOnCPU([i,a])||i.dtype===`string`){let e=n.bufferSync(p),t=cI(n.bufferSync(f),e,h);return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(l.outputShape,t.dtype,t.values)}let g=new WV(f.shape,h),v=n.runWebGLProgram(g,[f,p],f.dtype);d.push(v);let y=$({inputs:{x:v},backend:n,attrs:{shape:l.outputShape}});return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),y}var qV={kernelName:Ft,backendName:`webgl`,kernelFunc:KV},JV={kernelName:Lt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a > b);`,packedOpSnippet:`
  return vec4(greaterThan(a, b));
`,cpuKernelImpl:lI,dtype:`bool`})},YV={kernelName:Rt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a >= b);`,packedOpSnippet:`
  return vec4(greaterThanEqual(a, b));
`,dtype:`bool`,cpuKernelImpl:uI})};function XV(e){let{inputs:t,backend:n}=e,{input:r}=t;return bV(r,!0,n)}var ZV={kernelName:Bt,backendName:`webgl`,kernelFunc:XV},QV={kernelName:Ht,backendName:`webgl`,kernelFunc:qL({opSnippet:`return float(!isnan(x) && !isinf(x));`,dtype:`bool`})},$V={kernelName:Ut,backendName:`webgl`,kernelFunc:qL({opSnippet:`return float(isinf(x));`,dtype:`bool`})},eH={kernelName:Wt,backendName:`webgl`,kernelFunc:qL({opSnippet:`return float(isnan(x));`,dtype:`bool`})},tH={kernelName:Kt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a < b);`,packedOpSnippet:`
  return vec4(lessThan(a, b));
`,cpuKernelImpl:dI,dtype:`bool`})},nH={kernelName:qt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a <= b);`,packedOpSnippet:`
  return vec4(lessThanEqual(a, b));
`,cpuKernelImpl:fI,dtype:`bool`})};function rH(e){let{backend:t,attrs:n}=e,{start:r,stop:i,num:a}=n,o=pI(r,i,a);return t.makeTensorInfo([o.length],`float32`,o)}var iH={kernelName:Jt,backendName:`webgl`,kernelFunc:rH},aH={kernelName:`Log`,backendName:`webgl`,kernelFunc:qL({opSnippet:KL+`
  return x < 0.0 ? 0./0. : log(x);
`,packedOpSnippet:`
  vec4 result = log(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : (x.r < 0.0 ? 0./0. : result.r);
  result.g = isNaN.g ? x.g : (x.g < 0.0 ? 0./0. : result.g);
  result.b = isNaN.b ? x.b : (x.b < 0.0 ? 0./0. : result.b);
  result.a = isNaN.a ? x.a : (x.a < 0.0 ? 0./0. : result.a);
  return result;
`,cpuKernelImpl:mI})},oH={kernelName:Yt,backendName:`webgl`,kernelFunc:qL({opSnippet:KL+`
  return log(1.0 + x);
`})},sH={kernelName:Xt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a >= 1.0 && b >= 1.0);`,packedOpSnippet:`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,dtype:`bool`})},cH={kernelName:Zt,backendName:`webgl`,kernelFunc:qL({opSnippet:`return float(!(x >= 1.0));`})},lH={kernelName:Qt,backendName:`webgl`,kernelFunc:JL({opSnippet:`return float(a >= 1.0 || b >= 1.0);`,packedOpSnippet:`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,dtype:`bool`})},uH=class{constructor(e,t,n,r,i){this.variableNames=[`x`],this.outputShape=[];let a=t,o=e[3]-1;this.outputShape=e;let s,c=`float(${n}) + float(${r}) * sum`;s=i===.5?`inversesqrt(${c})`:i===1?`1.0/(${c})`:`exp(log(${c}) * float(-${i}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];
        int d = coords[3];
        float x = getX(b, r, c, d);
        float sum = 0.0;
        for (int j = -${a}; j <= ${a}; j++) {
          int idx = d + j;
          if (idx >= 0 && idx <=  ${o}) {
            float z = getX(b, r, c, idx);
            sum += z * z;
          }
        }
        float val = x * ${s};
        setOutput(val);
      }
    `}},dH=class{constructor(e,t,n,r,i){this.variableNames=[`x`],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;let a=t,o=e[3]-1;this.outputShape=e;let s,c=`float(${n}) + float(${r}) * sum`;s=i===.5?`inversesqrt(${c})`:i===1?`1.0/(${c})`:`exp(log(${c}) * float(-${i}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords.x;
        int r = coords.y;
        int c = coords.z;
        int d = coords.w;

        bool hasNextCol = d < ${this.outputShape[3]};
        bool hasNextRow = c < ${this.outputShape[2]};

        vec4 sum = vec4(0.);
        vec4 xFragAtOutputCoords = getX(b, r, c, d);

        vec4 xAtOutputCoords = vec4(
          getChannel(xFragAtOutputCoords, vec2(c, d)),
          hasNextCol ?
            getChannel(xFragAtOutputCoords, vec2(c, d + 1)) : 0.0,
          hasNextRow ?
            getChannel(xFragAtOutputCoords , vec2(c + 1, d)) : 0.0,
          (hasNextRow && hasNextCol) ?
            getChannel(xFragAtOutputCoords, vec2(c + 1, d + 1)) : 0.0
        );

        int firstChannel = d - ${a};
        vec2 cache = vec2(0.);
        if(firstChannel >= 0){
          vec4 firstChannelFrag = getX(b, r, c, firstChannel);
          cache.x = getChannel(firstChannelFrag, vec2(c, firstChannel));
            if(hasNextRow){
              cache.y = getChannel(firstChannelFrag, vec2(c + 1, firstChannel));
            }
        }

        ivec2 depth = ivec2(d, d + 1);
        for (int j = - ${a}; j <= ${a}; j++) {
          ivec2 idx = depth + j;
          bvec2 aboveLowerBound = greaterThanEqual(idx, ivec2(0));
          bvec2 belowUpperBound = lessThanEqual(idx, ivec2(${o}));

          bool depthInRange = aboveLowerBound.x && belowUpperBound.x;
          bool depthPlusOneInRange = aboveLowerBound.y && belowUpperBound.y;

          if(depthInRange || depthPlusOneInRange){
            vec4 z = vec4(0.);
            vec4 xFragAtCurrentDepth;
            z.xz = cache.xy;
            if(depthPlusOneInRange && hasNextCol){
              xFragAtCurrentDepth = idx.y != d ?
                getX(b, r, c, idx.y) : xFragAtOutputCoords;
              z.y = getChannel(xFragAtCurrentDepth, vec2(c, idx.y));
              if(hasNextRow){
                z.w = getChannel(xFragAtCurrentDepth, vec2(c + 1, idx.y));
              }
            }
            cache.xy = z.yw;
            sum += z * z;
          }
        }
        vec4 result = xAtOutputCoords * ${s};
        setOutput(result);
      }
    `}},fH={kernelName:`LRN`,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{depthRadius:a,bias:o,alpha:s,beta:c}=r,l=k().getBool(`WEBGL_PACK_NORMALIZATION`)?new dH(i.shape,a,o,s,c):new uH(i.shape,a,o,s,c);return n.runWebGLProgram(l,[i],i.dtype)}},pH=class{constructor(e,t,n,r,i){this.variableNames=[`inputImage`,`outputImage`,`dy`],this.outputShape=[],this.outputShape=e,this.depth=e[3],this.depthRadius=t,this.bias=n,this.alpha=r,this.beta=i,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];

        float result = 0.0;
        for (int d = 0; d < ${this.depth}; ++d) {
          int depthBegin = int(max(0.0, float(d - ${t})));
          int depthEnd = int(min(float(${this.depth}),
              float(d + ${t} + 1)));

          const int MIN_DEPTH_BEGIN = 0;
          const int MAX_DEPTH_END = ${this.depth};

          float norm = 0.0;
          for (int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k) {
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd) {
              norm += getInputImage(b, r, c, k) * getInputImage(b, r, c, k);
            }
            else {
              break;
            }
          }

          norm = float(${r}) * norm + float(${n});

          for(int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k){
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd){
              float dyi = -2.0 * float(${r})
                * float(${i})
                * getInputImage(b, r, c, k) * getOutputImage(b, r, c, d)
                / norm;
              if (k == d) {
                dyi += pow(norm, -1.0 * ${i});
              }
              if (k == coords[3]) {
                dyi *= getDy(b, r, c, d);
                result += dyi;
              }
            }
            else {
              break;
            }
          }
      }
      setOutput(result);
      }
    `}},mH={kernelName:en,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i,y:a,dy:o}=t,{depthRadius:s,bias:c,alpha:l,beta:u}=r,d=new pH(i.shape,s,c,l,u);return n.runWebGLProgram(d,[i,a,o],i.dtype)}};function hH(e,t,n,r){let i=_(t),a=_(e.shape)/i,o=$({inputs:{x:e},attrs:{shape:[a,i]},backend:r}),s=sR(o,e.dtype,`max`,r),c=$({inputs:{x:s},attrs:{shape:n},backend:r});return r.disposeIntermediateTensorInfo(o),r.disposeIntermediateTensorInfo(s),c}function gH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reductionIndices:a,keepDims:o}=r,s=i.shape.length,c=w(a,i.shape),l=c,u=Jc(l,s),d=u!=null,f=n.shouldExecuteOnCPU([i]),p=i;if(d){if(f){let e=n.texData.get(p.dataId).values,t=Array(s);for(let e=0;e<t.length;e++)t[e]=i.shape[u[e]];let r=UI(e,i.shape,i.dtype,u,t);p=n.makeTensorInfo(t,i.dtype);let a=n.texData.get(p.dataId);a.values=r}else p=dR(i,u,n);l=Xc(l.length,s)}qc(`max`,l,s);let[m,h]=Gc(p.shape,l),g=m;o&&(g=Kc(m,c));let v;if(f){let e=n.texData.get(p.dataId).values,t=hI(e,_(h),g,i.dtype);v=n.makeTensorInfo(g,i.dtype);let r=n.texData.get(v.dataId);r.values=t}else v=hH(p,h,g,n);return d&&n.disposeIntermediateTensorInfo(p),v}var _H={kernelName:`Max`,backendName:`webgl`,kernelFunc:gH},vH={kernelName:tn,backendName:`webgl`,kernelFunc:JL({opSnippet:AL+`
  return max(a, b);
`,packedOpSnippet:`
  vec4 result = vec4(max(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+ML+`
  return result;
`,cpuKernelImpl:gI})};function yH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;fP(i,`maxPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;m(ns(o,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Ho(i.shape,a,o,1,s,c);if(l.filterWidth===1&&l.filterHeight===1&&v(l.inShape,l.outShape))return PL({inputs:{x:i},backend:n});let u=new YR(l,`max`,!1);return n.runWebGLProgram(u,[i],i.dtype)}var bH={kernelName:nn,backendName:`webgl`,kernelFunc:yH};function xH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dataFormat:c,dimRoundingMode:l}=r,u=new XR(Uo(i.shape,a,o,[1,1,1],s,l,c),`max`,!1);return n.runWebGLProgram(u,[i],i.dtype)}var SH={kernelName:an,backendName:`webgl`,kernelFunc:xH},CH=class{constructor(e){this.variableNames=[`dy`,`maxPos`],this.outputShape=e.inShape;let t=e.strideHeight,n=e.strideWidth,r=e.dilationHeight,i=e.effectiveFilterHeight,a=e.effectiveFilterWidth,o=i-1-e.padInfo.top,s=a-1-e.padInfo.left,c=i*a-1;this.userCode=`
      const ivec2 pads = ivec2(${o}, ${s});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${i};
          wR += ${r}) {
          float dyR = float(dyRCorner + wR) / ${t}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${a}; wC++) {
            float dyC = float(dyCCorner + wC) / ${n}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);
            int maxPosValue = ${c} - int(getMaxPos(b, idyR, idyC, d));

            // Get the current value, check it against the value from the
            // position matrix.
            int curPosValue = wR * ${a} + wC;
            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

            dotProd += dyValue * mask;
          }
        }
        setOutput(dotProd);
      }
    `}},wH=class{constructor(e){this.variableNames=[`dy`,`maxPos`],this.outputShape=e.inShape;let t=e.strideDepth,n=e.strideHeight,r=e.strideWidth,i=e.dilationDepth,a=e.dilationHeight,o=e.dilationWidth,s=e.effectiveFilterDepth,c=e.effectiveFilterHeight,l=e.effectiveFilterWidth,u=s-1-e.padInfo.front,d=c-1-e.padInfo.top,f=l-1-e.padInfo.left,p=s*c*l-1;this.userCode=`
      const ivec3 pads = ivec3(${u}, ${d}, ${f});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, ch) with pos mask(:, :, :, d) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${s};
           wD += ${i}) {
          float dyD = float(dyDCorner + wD) / ${t}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${c};
              wR += ${a}) {
            float dyR = float(dyRCorner + wR) / ${n}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${l};
                wC += ${o}) {
              float dyC = float(dyCCorner + wC) / ${r}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);
              int maxPosValue = ${p} -
                  int(getMaxPos(batch, idyD, idyR, idyC, ch));

              // Get the current value, check it against the value from the
              // position matrix.
              int curPosValue =
                  wD * ${c} * ${l} +
                  wR * ${l} + wC;
              float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

              dotProd += dyValue * mask;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function TH(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a,{filterSize:s,strides:c,pad:l,dimRoundingMode:u}=r,d=Uo(o.shape,s,c,[1,1,1],l,u),f=new XR(d,`max`,!0),p=n.runWebGLProgram(f,[o],o.dtype),m=new wH(d),h=n.runWebGLProgram(m,[i,p],o.dtype);return n.disposeIntermediateTensorInfo(p),h}var EH={kernelName:on,backendName:`webgl`,kernelFunc:TH};function DH(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a,output:o}=t,s=a;fP([a,o],`maxPoolGrad`);let{filterSize:c,strides:l,pad:u,dimRoundingMode:d}=r,f=Ho(s.shape,c,l,1,u,d),p=new YR(f,`max`,!0),m=n.runWebGLProgram(p,[s],s.dtype),h=new CH(f),g=n.runWebGLProgram(h,[i,m],s.dtype);return n.disposeIntermediateTensorInfo(m),g}var OH={kernelName:rn,backendName:`webgl`,kernelFunc:DH};function kH(e,t,n,r){let i=new YR(n,`max`,!1),a=r.runWebGLProgram(i,[e],`float32`);return i=new YR(n,`max`,!0,!0,t),[a,r.runWebGLProgram(i,[e],`float32`)]}var AH={kernelName:sn,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{filterSize:i,strides:a,pad:o,includeBatchInIndex:s}=t,c=n;m(r.shape.length===4,()=>`Error in maxPool: input must be rank 4 but got rank ${r.shape.length}.`);let l=[1,1];m(ns(a,l),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${l}'`);let[u,d]=kH(r,s,Ho(r.shape,i,a,l,o),c);return[u,d]}};function jH(e,t,n,r){let i=_(t),a=_(e.shape)/i,o=$({inputs:{x:e},attrs:{shape:[a,i]},backend:r}),s=sR(o,`float32`,`mean`,r),c=$({inputs:{x:s},attrs:{shape:n},backend:r});return r.disposeIntermediateTensorInfo(o),r.disposeIntermediateTensorInfo(s),c}var MH={kernelName:cn,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{keepDims:i,axis:a}=t,o=n,s=r.shape.length,c=w(a,r.shape),l=c,u=Jc(l,s),d=u!=null,f=o.shouldExecuteOnCPU([r]),p=[],m=r;if(d){if(f){let e=o.texData.get(m.dataId).values,t=Array(s);for(let e=0;e<t.length;e++)t[e]=r.shape[u[e]];let n=UI(e,r.shape,r.dtype,u,t);m=o.makeTensorInfo(t,r.dtype);let i=o.texData.get(m.dataId);i.values=n}else m=dR(r,u,o);p.push(m),l=Xc(l.length,s)}qc(`sum`,l,s);let[h,g]=Gc(m.shape,l),_=h;i&&(_=Kc(h,c));let v=jH(m,g,_,o);for(let e of p)o.disposeIntermediateTensorInfo(e);return v}};function NH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=w(a,i.shape),l=c,u=Jc(l,s),d=i;u!=null&&(d=hR({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Xc(l.length,i.shape.length)),qc(`min`,l,s);let[f,p]=Gc(d.shape,l),m=_(p),h=$({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=sR(h,h.dtype,`min`,n),v;if(o){let e=Kc(f,c);v=$({inputs:{x:g},backend:n,attrs:{shape:e}})}else v=$({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),v}var PH={kernelName:`Min`,backendName:`webgl`,kernelFunc:NH},FH={kernelName:ln,backendName:`webgl`,kernelFunc:JL({opSnippet:AL+`
  return min(a, b);
`,packedOpSnippet:`
  vec4 result = vec4(min(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+ML+`
  return result;
`,cpuKernelImpl:_I})},IH=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=lF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=[`coords[0]`,`coords[1]`,`coords[2]`,`coords[3]`].slice(0,r),c=n===`reflect`?0:1;if(r===1){this.userCode=`
        int start = ${a};
        int end = ${o};

        void main() {
          int outC = getOutputCoords();
          if (outC < start) {
            outC = start * 2 - outC - ${c};
          } else if(outC >= end) {
            outC = (end - 1) * 2 - outC + ${c};
          }
          setOutput(getX(outC - start));
        }
      `;return}this.userCode=`
      ${i} start = ${i}(${a});
      ${i} end = ${i}(${o});

      void main() {
        ${i} outC = getOutputCoords();
        for (int i = 0; i < ${r}; i++) {
          if (outC[i] < start[i]) {
            outC[i] = start[i] * 2 - outC[i] - ${c};
          } else if(outC[i] >= end[i]) {
            outC[i] = (end[i] - 1) * 2 - outC[i] + ${c};
          }
        }
        ${i} coords = outC - start;
        setOutput(getX(${s}));
      }
    `}},LH=class{constructor(e,t,n){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=lF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=KI(`rc`,r),c=KI(`source`,r),l=`${s[r-1]} < ${this.outputShape[r-1]}`,u=r===1?`source`:`vec2(${c.slice(-2).join()})`,d=n===`reflect`?0:1,f=``;if(r===1){let e=`
        ${i} source = rc;
        if (source < start) {
          source = start * 2 - source - ${d};
        } else if (source >= end) {
          source = (end - 1) * 2 - source + ${d};
        }
        source -= start;
      `;f=`
        ${i} rc = outputLoc;
        ${e}
        result[0] = getChannel(getX(${c.join()}), ${u});
        ${s[r-1]} += 1;
        if(${l}) {
          ${e}
          result[1] = getChannel(getX(${c.join()}), ${u});
        }
      `}else{let e=`
        ${i} source = rc;
        ${i} lt = ${i}(lessThan(source, start));
        ${i} gte = ${i}(greaterThanEqual(source, end));
        ${i} orig = 1 - (lt + gte);
        source = orig * source +
                lt * (start * 2 - source - ${d}) +
                gte * ((end - 1) * 2 - source + ${d});
        source -= start;
      `;f=`
        ${i} rc = outputLoc;
        ${e}
        result[0] = getChannel(getX(${c.join()}), ${u});
        ${s[r-1]} += 1;
        if(${l}) {
          ${e}
          result[1] = getChannel(getX(${c.join()}), ${u});
        }
        rc = outputLoc;
        ${s[r-2]} += 1;
        if(${s[r-2]} < ${this.outputShape[r-2]}) {
          ${e}
          result[2] = getChannel(getX(${c.join()}), ${u});
          ${s[r-1]} += 1;
          if(${l}) {
            ${e}
            result[3] = getChannel(getX(${c.join()}), ${u});
          }
        }
      `}this.userCode=`
      const ${i} start = ${i}(${a});
      const ${i} end = ${i}(${o});

      void main() {
        ${i} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${f}
        setOutput(result);
      }
    `}},RH={kernelName:un,backendName:`webgl`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r}=e,{paddings:i,mode:a}=n,o=k().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new LH(r.shape,i,a):new IH(r.shape,i,a);return t.runWebGLProgram(o,[r],r.dtype)}},zH={kernelName:`Mod`,backendName:`webgl`,kernelFunc:JL({opSnippet:`if (b == 0.0) return NAN;
  return mod(a, b);`,packedOpSnippet:`
  vec4 result = mod(a, b);
  bvec4 isNaN = equal(b, vec4(0.0));
  `+ML+`
  return result;
`})},BH=class{constructor(e,t,n){this.variableNames=[`probs`],this.customUniforms=[{name:`seed`,type:`float`}],this.outputShape=[e,n],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];

        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < ${t-1}; i++) {
          cdf += getProbs(batch, i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }

        // If no other event happened, last event happened.
        setOutput(float(${t-1}));
      }
    `}},VH=JL({opSnippet:`
if (a == b) {
  return 1.0;
};
return a / b;`,packedOpSnippet:`
  // vec4 one = vec4(equal(a, b));
  // return one + (vec4(1.0) - one) * a / b;
  vec4 result = a / b;
  if(a.x == b.x) {
    result.x = 1.;
  }
  if(a.y == b.y) {
    result.y = 1.;
  }
  if(a.z == b.z) {
    result.z = 1.;
  }
  if(a.w == b.w) {
    result.w = 1.;
  }

  return result;
`,checkOutOfBounds:!0}),HH={kernelName:wt,backendName:`webgl`,kernelFunc:VH},UH=`return a - b;`,WH=JL({opSnippet:UH,packedOpSnippet:UH,supportsComplex:!0,cpuKernelImpl:BI}),GH={kernelName:`Sub`,backendName:`webgl`,kernelFunc:WH};function KH(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{dim:a}=r,o=w([a],i.shape),s=gH({inputs:{x:i},backend:n,attrs:{reductionIndices:o,keepDims:!1}}),c=Kc(s.shape,o),l=$({inputs:{x:s},backend:n,attrs:{shape:c}}),u=WH({inputs:{a:i,b:l},backend:n}),d=pV({inputs:{x:u},backend:n}),f=pR({inputs:{x:d},backend:n,attrs:{axis:o,keepDims:!1}}),p=$({inputs:{x:f},backend:n,attrs:{shape:c}}),m=VH({inputs:{a:d,b:p},backend:n});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(u),n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),m}var qH={kernelName:Qn,backendName:`webgl`,kernelFunc:KH};function JH(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{numSamples:a,seed:o,normalized:s}=r,c=s?i:KH({inputs:{logits:i},backend:n,attrs:{dim:i.shape.length-1}}),l=c.shape[0],u=c.shape[1],d=new BH(l,u,a),f=[[o]],p=n.runWebGLProgram(d,[c],`int32`,f);return s||n.disposeIntermediateTensorInfo(c),p}var YH={kernelName:dn,backendName:`webgl`,kernelFunc:JH},XH=aL+`
  return -x;
`,ZH=`
  vec4 result = -x;
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`;function QH(e){let{inputs:t,backend:n}=e,{x:r}=t;if(n.shouldExecuteOnCPU([r])){let[e,t]=yI(n.texData.get(r.dataId).values,r.shape,r.dtype);return n.makeTensorInfo(t,r.dtype,e)}let i;return i=k().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)?new vL(r.shape,ZH):new iL(r.shape,XH),n.runWebGLProgram(i,[r],r.dtype)}var $H={kernelName:`Neg`,backendName:`webgl`,kernelFunc:QH},eU=vp;function tU(e){Er(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=r,{selectedIndices:l}=eU(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c);return n.makeTensorInfo([l.length],`int32`,new Int32Array(l))}var nU={kernelName:mn,backendName:`webgl`,kernelFunc:tU},rU=yp;function iU(e){Er(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,padToMaxOutputSize:l}=r,{selectedIndices:u,validOutputs:d}=rU(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c,l);return[n.makeTensorInfo([u.length],`int32`,new Int32Array(u)),n.makeTensorInfo([],`int32`,new Int32Array([d]))]}var aU={kernelName:hn,backendName:`webgl`,kernelFunc:iU},oU=bp;function sU(e){Er(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=r,{selectedIndices:u,selectedScores:d}=oU(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c,l);return[n.makeTensorInfo([u.length],`int32`,new Int32Array(u)),n.makeTensorInfo([d.length],`float32`,new Float32Array(d))]}var cU={kernelName:gn,backendName:`webgl`,kernelFunc:sU},lU=class{constructor(e,t,n,r){this.variableNames=[`indices`],this.outputShape=[e,t],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(${r}), float(${n}),
                      float(index == coords.y)));
      }
    `}},uU={kernelName:vn,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{indices:i}=t,{dtype:a,depth:o,onValue:s,offValue:c}=r,l=_(i.shape),u=new lU(l,o,s,c),d=$({inputs:{x:i},backend:n,attrs:{shape:[l]}}),f=n.runWebGLProgram(u,[d],a);n.disposeIntermediateTensorInfo(d);let p=[...i.shape,o],m=$({inputs:{x:f},backend:n,attrs:{shape:p}});return n.disposeIntermediateTensorInfo(f),m}};function dU(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`complex64`){let e=Az({inputs:{input:r},backend:n}),t=dU({inputs:{x:e},backend:n}),i=Yz({inputs:{input:r},backend:n}),a=dU({inputs:{x:i},backend:n}),o=IL({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return wV({attrs:{shape:r.shape,dtype:r.dtype,value:r.dtype===`string`?``:0},backend:n})}var fU={kernelName:yr,backendName:`webgl`,kernelFunc:dU};function pU(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`onesLike is not supported under string dtype`);if(r.dtype===`complex64`){let e=Az({inputs:{input:r},backend:n}),t=pU({inputs:{x:e},backend:n}),i=Yz({inputs:{input:r},backend:n}),a=dU({inputs:{x:i},backend:n}),o=IL({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return wV({attrs:{shape:r.shape,dtype:r.dtype,value:1},backend:n})}var mU={kernelName:_n,backendName:`webgl`,kernelFunc:pU};function hU(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r;if(t.length===1)return hV({inputs:{input:t[0]},backend:n,attrs:{dim:i}});let a=t[0].shape,o=t[0].dtype;t.forEach(e=>{h(a,e.shape,`All tensors passed to stack must have matching shapes`),m(o===e.dtype,()=>`All tensors passed to stack must have matching dtypes`)});let s=[],c=$z({inputs:t.map(e=>{let t=hV({inputs:{input:e},backend:n,attrs:{dim:i}});return s.push(t),t}),backend:n,attrs:{axis:i}});return s.forEach(e=>n.disposeIntermediateTensorInfo(e)),c}var gU={kernelName:yn,backendName:`webgl`,kernelFunc:hU},_U=class{constructor(e,t,n){this.variableNames=[`x`],this.customUniforms=[{name:`value`,type:`float`}],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=lF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=[`coords[0]`,`coords[1]`,`coords[2]`,`coords[3]`].slice(0,r);if(r===1){this.userCode=`
        int start = ${a};
        int end = ${o};

        void main() {
          int outC = getOutputCoords();
          if (outC < start || outC >= end) {
            setOutput(value);
          } else {
            setOutput(getX(outC - start));
          }
        }
      `;return}this.userCode=`
      ${i} start = ${i}(${a});
      ${i} end = ${i}(${o});

      void main() {
        ${i} outC = getOutputCoords();
        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {
          setOutput(value);
        } else {
          ${i} coords = outC - start;
          setOutput(getX(${s}));
        }
      }
    `}},vU=class{constructor(e,t,n){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`value`,type:`float`}],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=lF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=KI(`rc`,r),c=KI(`source`,r),l=`${s[r-1]} < ${this.outputShape[r-1]}`,u=r===1?`source`:`vec2(${c.slice(-2).join()})`,d=[`${i} rc = outputLoc;`,`${s[r-1]} += 1;
       if(${l}) {
      `,r===1?``:`}
       rc = outputLoc;
       ${s[r-2]} += 1;
       if(${s[r-2]} < ${this.outputShape[r-2]}) {`,r===1?``:`  ${s[r-1]} += 1;
         if(${l}) {`],f=r===1?`rc < start || rc >= end`:`any(lessThan(rc, start)) || any(greaterThanEqual(rc, end))`,p=``;for(let e=0,t=r===1?2:4;e<t;e++)p+=`
        ${d[e]}
        if (${f}) {
          result[${e}] = float(value);
        } else {
          ${i} source = rc - start;
          result[${e}] = getChannel(getX(${c.join()}), ${u});
        }
      `;p+=r===1?`} `:`}}`,this.userCode=`
      const ${i} start = ${i}(${a});
      const ${i} end = ${i}(${o});

      void main() {
        ${i} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${p}
        setOutput(result);
      }
    `}},yU=e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,constantValue:o}=r;if(_(i.shape)===0)return wV({backend:n,attrs:{shape:a.map((e,t)=>e[0]+i.shape[t]+e[1]),value:o,dtype:i.dtype}});let s=k().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new vU(i.shape,a,o):new _U(i.shape,a,o),c=[[o]];return n.runWebGLProgram(s,[i],i.dtype,c)},bU={kernelName:bn,backendName:`webgl`,kernelFunc:yU},xU={kernelName:`Pow`,backendName:`webgl`,kernelFunc:JL({opSnippet:`
  if(a < 0.0 && floor(b) < b){
    return NAN;
  }
  if (b == 0.0) {
    return 1.0;
  }
  return (round(mod(b, 2.0)) != 1) ?
      pow(abs(a), b) : sign(a) * pow(abs(a), b);
`,packedOpSnippet:`
  // isModRound1 has 1 for components with round(mod(b, 2.0)) == 1, 0 otherwise.
  vec4 isModRound1 = vec4(equal(round(mod(b, 2.0)), ivec4(1)));
  vec4 multiplier = sign(a) * isModRound1 + (vec4(1.0) - isModRound1);
  vec4 result = multiplier * pow(abs(a), b);

  // Ensure that a^0 = 1, including 0^0 = 1 as this correspond to TF and JS
  bvec4 isExpZero = equal(b, vec4(0.0));
  result.r = isExpZero.r ? 1.0 : result.r;
  result.g = isExpZero.g ? 1.0 : result.g;
  result.b = isExpZero.b ? 1.0 : result.b;
  result.a = isExpZero.a ? 1.0 : result.a;

  bvec4 isNaN1 = lessThan(a, vec4(0.0));
  bvec4 isNaN2 = lessThan(floor(b), b);
  bvec4 isNaN = bvec4(isNaN1.x && isNaN2.x, isNaN1.y && isNaN2.y, isNaN1.z && isNaN2.z, isNaN1.w && isNaN2.w);
  `+ML+`
  return result;
`})};function SU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=[],l=w(a,i.shape),u=l,d=Jc(u,s),f=i;d!=null&&(f=hR({inputs:{x:i},backend:n,attrs:{perm:d}}),u=Xc(u.length,s),c.push(f)),qc(`prod`,u,s);let p;if(n.shouldExecuteOnCPU([f])){let e=n.texData.get(f.dataId).values,{outVals:t,outShape:r,outDtype:i}=xI(f.shape,f.dtype,e,u);p=n.makeTensorInfo(r,i,t)}else{let[e,t]=Gc(f.shape,u),r=_(t),a=$({inputs:{x:f},backend:n,attrs:{shape:[-1,r]}}),o=sR(a,Li(i.dtype),`prod`,n);p=$({inputs:{x:o},backend:n,attrs:{shape:e}}),c.push(a),c.push(o)}if(o){c.push(p);let e=Kc(p.shape,l);p=$({inputs:{x:p},backend:n,attrs:{shape:e}})}return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var CU={kernelName:Sn,backendName:`webgl`,kernelFunc:SU};function wU(e){let{inputs:t,backend:n,attrs:r}=e,{paramsNestedSplits:i,paramsDenseValues:a,indices:o}=t,{outputRaggedRank:s}=r,c=i.map(e=>n.readSync(e.dataId)),l=i.map(e=>e.shape),u=n.readSync(a.dataId),d=n.readSync(o.dataId),[f,p,m]=SI(c,l,u,a.shape,a.dtype,d,o.shape,s),h=f.map(e=>n.makeTensorInfo([e.length],`int32`,e)),g=n.makeTensorInfo(m,a.dtype,p);return h.concat([g])}var TU={kernelName:Cn,backendName:`webgl`,kernelFunc:wU};function EU(e){let{inputs:t,backend:n}=e,{starts:r,limits:i,deltas:a}=t,o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=CI(o,r.shape,r.dtype,s,i.shape,c,a.shape);return[n.makeTensorInfo([l.length],`int32`,l),n.makeTensorInfo([u.length],r.dtype,u)]}var DU={kernelName:wn,backendName:`webgl`,kernelFunc:EU};function OU(e){let{inputs:t,backend:n,attrs:r}=e,{shape:i,values:a,defaultValue:o,rowPartitionTensors:s}=t,{rowPartitionTypes:c}=r,l=n.readSync(i.dataId),u=n.readSync(a.dataId),d=n.readSync(o.dataId),f=s.map(e=>n.readSync(e.dataId)),p=s.map(e=>e.shape),[m,h]=wI(l,i.shape,u,a.shape,a.dtype,d,o.shape,f,p,c);return n.makeTensorInfo(m,a.dtype,h)}var kU={kernelName:Tn,backendName:`webgl`,kernelFunc:OU},AU=e=>{let{backend:t,attrs:n}=e,{start:r,stop:i,step:a,dtype:o}=n,s=TI(r,i,a,o);return t.makeTensorInfo([s.length],o,s)},jU={kernelName:En,backendName:`webgl`,kernelFunc:AU},MU={kernelName:On,backendName:`webgl`,kernelFunc:qL({opSnippet:`return 1.0 / x;`})},NU={kernelName:kn,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  return (x < 0.0) ? 0.0 : x;
`,packedOpSnippet:`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`})},PU={kernelName:Fn,backendName:`webgl`,kernelFunc:qL({opSnippet:aL+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,packedOpSnippet:`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`})},FU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d;d=i?`(vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC - vec2(0.5)`:`vec2(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${l[0]/u[0]},
          ${l[1]/u[1]});
      const vec2 inputShapeRC = vec2(${o}.0, ${s}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${d};

        // Compute the four integer indices.
        ivec2 sourceFloorRC = ivec2(max(sourceFracIndexRC, vec2(0.0)));
        ivec2 sourceCeilRC = ivec2(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);
        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);
        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);
        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);

        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);

        float top = topLeft + (topRight - topLeft) * fracRC.y;
        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;
        float newValue = top + (bottom - top) * fracRC.x;

        setOutput(newValue);
      }
    `}},IU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d;d=i?`(vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC - vec3(0.5)`:`vec3(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${l[0]/u[0]},
          ${l[1]/u[1]},
          ${l[1]/u[1]});
      const vec3 inputShapeRC = vec3(${o}.0, ${s}.0,
                                     ${s}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${d};

        // Compute the four integer indices.
        ivec3 sourceFloorRC = ivec3(max(sourceFracIndexRC, vec3(0.0)));
        ivec3 sourceCeilRC = ivec3(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${n-1};

        // In parallel, construct four corners for all four components in
        // packed 2x2 cell.
        vec4 topLeft = vec4(
          getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 bottomLeft = vec4(
          getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 topRight = vec4(
          getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec4 bottomRight = vec4(
          getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec3 fracRC = sourceFracIndexRC - vec3(sourceFloorRC);

        vec4 top = mix(topLeft, topRight, fracRC.yyzz);
        vec4 bottom = mix(bottomLeft, bottomRight, fracRC.yyzz);
        vec4 newValue = mix(top, bottom, fracRC.x);

        setOutput(newValue);
      }
    `}};function LU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r,[c,l]=s,u=k().getBool(`WEBGL_PACK_IMAGE_OPERATIONS`)?new IU(i.shape,c,l,a,o):new FU(i.shape,c,l,a,o);return n.runWebGLProgram(u,[i],`float32`)}var RU={kernelName:Nn,backendName:`webgl`,kernelFunc:LU},zU=class{constructor(e,t,n){this.variableNames=[`dy`],this.outputShape=[],this.outputShape=t;let[,r,i]=t,[,a,o]=e,s=[n&&a>1?r-1:r,n&&o>1?i-1:i],c=[n&&a>1?a-1:a,n&&o>1?o-1:o],l=s[0]/c[0],u=s[1]/c[1],d=1/l,f=1/u,p=Math.ceil(d)*2+2,m=Math.ceil(f)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${l});
        const float widthScale = float(${u});

        const float invHeightScale = float(${d});
        const float invWidthScale = float(${f});

        const int winHeight = int(${p});
        const int winWidth = int(${m});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(startRLerp - float(winHeight / 2));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(startCLerp - float(winWidth / 2));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${o}) {
              continue;
            }

            float dxR = float(dyR) * heightScale;
            int topDxRIndex = int(floor(dxR));
            int bottomDxRIndex = int(min(ceil(dxR), ${r-1}.0));
            float dxRLerp = dxR - float(topDxRIndex);
            float inverseDxRLerp = 1.0 - dxRLerp;

            float dxC = float(dyC) * widthScale;
            int leftDxCIndex = int(floor(dxC));
            int rightDxCIndex = int(min(ceil(dxC), ${i-1}.0));
            float dxCLerp = dxC - float(leftDxCIndex);
            float inverseDxCLerp = 1.0 - dxCLerp;

            if (r == topDxRIndex && c == leftDxCIndex) {
              // topLeft
              accumulator +=
                getDy(b, dyR, dyC, d) * inverseDxRLerp * inverseDxCLerp;
            }

            if (r == topDxRIndex && c == rightDxCIndex) {
              // topRight
              accumulator += getDy(b, dyR, dyC, d) * inverseDxRLerp * dxCLerp;
            }

            if (r == bottomDxRIndex && c == leftDxCIndex) {
              // bottomLeft
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * inverseDxCLerp;
            }

            if (r == bottomDxRIndex && c == rightDxCIndex) {
              // bottomRight
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * dxCLerp;
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}};function BU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r,s=new zU(a.shape,i.shape,o);return n.runWebGLProgram(s,[a],a.dtype)}var VU={kernelName:Pn,backendName:`webgl`,kernelFunc:BU},HU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d=r?`0.5`:`0.0`,f;f=i?`max((vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC, vec2(0.0))`:`vec2(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${l[0]/u[0]},
          ${l[1]/u[1]});
      const vec2 inputShapeRC = vec2(${o}.0, ${s}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${f};

        // Compute the coordinators of nearest neighbor point.
        ivec2 sourceNearestRC = ivec2(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${d})));
        float newValue = getA(b, sourceNearestRC.x, sourceNearestRC.y, d);

        setOutput(newValue);
      }
    `}},UU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d=r?`0.5`:`0.0`,f;f=i?`max((vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC, vec3(0.0))`:`vec3(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${l[0]/u[0]},
          ${l[1]/u[1]},
          ${l[1]/u[1]});
      const vec3 inputShapeRC = vec3(${o}.0, ${s}.0,
                                     ${s}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${f};

        // Compute the coordinators of nearest neighbor point.
        ivec3 sourceNearestRC = ivec3(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${d})));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${n-1};

        vec4 newValue = vec4(
          getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d),
          hasNextCol ? getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d + 1) : 0.0);

        setOutput(newValue);
      }
    `}};function WU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r,[c,l]=s,u=k().getBool(`WEBGL_PACK_IMAGE_OPERATIONS`)?new UU(i.shape,c,l,a,o):new HU(i.shape,c,l,a,o);return n.runWebGLProgram(u,[i],i.dtype)}var GU={kernelName:jn,backendName:`webgl`,kernelFunc:WU},KU=class{constructor(e,t,n){this.variableNames=[`dy`],this.outputShape=[],this.outputShape=t;let[,r,i]=t,[,a,o]=e,s=[n&&a>1?r-1:r,n&&o>1?i-1:i],c=[n&&a>1?a-1:a,n&&o>1?o-1:o],l=s[0]/c[0],u=s[1]/c[1],d=1/l,f=1/u,p=Math.ceil(d)*2+2,m=Math.ceil(f)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${l});
        const float widthScale = float(${u});

        const float invHeightScale = float(${d});
        const float invWidthScale = float(${f});

        const int winHeight = int(${p});
        const int winWidth = int(${m});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(floor(startRLerp - float(winHeight / 2)));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(floor(startCLerp - float(winWidth / 2)));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${o}) {
              continue;
            }

            float sourceFracRow =
              float(${s[0]}) *
                (float(dyR) / float(${c[0]}));

            float sourceFracCol =
                float(${s[1]}) *
                  (float(dyC) / float(${c[1]}));

            int sourceNearestRow = int(min(
                float(int(${r}) - 1),
                ${n} ? float(round(sourceFracRow)) :
                                  float(floor(sourceFracRow))));

            int sourceNearestCol = int(min(
                float(int(${i}) - 1),
                ${n} ? float(round(sourceFracCol)) :
                                  float(floor(sourceFracCol))));

            if (r == sourceNearestRow && c == sourceNearestCol) {
              accumulator += getDy(b, dyR, dyC, d);
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}};function qU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r,s=new KU(a.shape,i.shape,o);return n.runWebGLProgram(s,[a],a.dtype)}var JU={kernelName:Mn,backendName:`webgl`,kernelFunc:qU},YU=class{constructor(e,t){this.variableNames=[`x`];let n=e.length;if(n>4)throw Error(`WebGL backend: Reverse of rank-${n} tensor is not yet supported`);if(this.outputShape=e,n===1){this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(${e[0]} - coord - 1));
        }
      `;return}let r=n=>t.indexOf(n)!==-1&&e[n]!==1?`${e[n]} - coords[${n}] - 1`:`coords[${n}]`,i=e.map((e,t)=>r(t)).join(`,`),a=lF(n);this.userCode=`
      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${i}));
      }
    `}},XU=class{constructor(e,t){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0;let n=e.length;if(n>4)throw Error(`WebGL backend: Reverse of rank-${n} tensor is not yet supported`);this.outputShape=e;let r=KI(`rc`,n),i=`${r[n-1]} + 1 < ${this.outputShape[n-1]}`,a=`${r[n-2]} + 1 < ${this.outputShape[n-2]}`,o=lF(n);this.userCode=n===1?`
        void main(){
          int rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = getChannel(getX(${e[0]} - rc - 1),
            ${e[0]} - rc - 1);
          if(${i}){
              result.g = getChannel(getX(${e[0]} - (rc  + 1) - 1),
                ${e[0]} - (rc  + 1) - 1);
          }
          setOutput(result);
        }
      `:`
        void main() {
          ${o} rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = ${s(r.slice())};
          if(${i}){
            result.g = ${c(r.slice())};
          }
          if(${a}) {
            result.b = ${l(r.slice())};
            if(${i}) {
              result.a = ${u(r.slice())};
            }
          }
          setOutput(result);
        }
    `;function s(e){return d(e)}function c(e){return e[n-1]=`(`+e[n-1]+` + 1)`,d(e)}function l(e){return e[n-2]=`(`+e[n-2]+` + 1)`,d(e)}function u(e){return e[n-1]=`(`+e[n-1]+` + 1)`,e[n-2]=`(`+e[n-2]+` + 1)`,d(e)}function d(t){let n=e.map((e,n)=>f(n,t));return`getChannel(getX(${n.join(`,`)}), vec2(${n.slice(-2).join(`,`)}))`}function f(n,r){return t.indexOf(n)!==-1&&e[n]!==1?`${e[n]} - ${r[n]} - 1`:`${r[n]}`}}};function ZU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dims:a}=r,o=i.shape.length,s=w(a,i.shape);if(o===0)return PL({inputs:{x:i},backend:n});let c=k().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new XU(i.shape,s):new YU(i.shape,s);return n.runWebGLProgram(c,[i],i.dtype)}var QU={kernelName:In,backendName:`webgl`,kernelFunc:ZU},$U=class{constructor(e,t){this.variableNames=[`Image`],this.outputShape=[],this.customUniforms=[{name:`params`,type:`vec4`}];let n=e[1],r=e[2];this.outputShape=e;let i=``;i=typeof t==`number`?`float outputValue = ${t.toFixed(2)};`:`
        vec3 fill = vec3(${t.join(`,`)});
        float outputValue = fill[coords[3]];`,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];
          int y = coords[1];
          float coordXFloat = (float(x) - params[0]) * params[3] -
            (float(y) - params[1]) * params[2];
          float coordYFloat = (float(x) - params[0]) * params[2] +
            (float(y) - params[1]) * params[3];
          int coordX = int(round(coordXFloat + params[0]));
          int coordY = int(round(coordYFloat + params[1]));
          ${i}
          if(coordX >= 0 && coordX < ${r} && coordY >= 0 && coordY < ${n}) {
            outputValue = getImage(coords[0], coordY, coordX, coords[3]);
          }
          setOutput(outputValue);
        }
    `}},eW={kernelName:Sr,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,{radians:i,fillValue:a,center:o}=t,s=n,c=new $U(r.shape,a),[l,u]=Km(o,r.shape[1],r.shape[2]),d=[[l,u,Math.sin(i),Math.cos(i)]];return s.runWebGLProgram(c,[r],r.dtype,d)}},tW={kernelName:Ln,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  // OpenGL ES does not support round function.
  // The algorithm is based on banker's rounding.
  float base = floor(x);
  if ((x - base) < 0.5) {
    return floor(x);
  } else if ((x - base) > 0.5) {
    return ceil(x);
  } else {
    if (mod(base, 2.0) == 0.0) {
      return base;
    } else {
      return base + 1.0;
    }
  }
`})},nW={kernelName:Rn,backendName:`webgl`,kernelFunc:qL({opSnippet:`return inversesqrt(x);`,cpuKernelImpl:EI})},rW=class{constructor(e,t,n,r,i,a,o=!0,s=!1){this.variableNames=[`updates`,`indices`,`defaultValue`],this.outputShape=a;let c=lF(i.length),l=lF(a.length),u=``;n===1?u=`i`:n===2&&(u=`i, j`);let d=`getIndices(${u})`,f=``;r===1?f=`i`:r===2&&(f=`i, coords[1]`);let p=`getUpdates(${f})`,m=``;s&&(m=`coords[0], coords[1]`);let h=`getDefaultValue(${m})`,g=t>1?`strides[j]`:`strides`;this.userCode=`
        ${c} strides = ${c}(${i});

        void main() {
          ${l} coords = getOutputCoords();
          float sum = 0.0;
          bool found = false;
          for (int i = 0; i < ${e}; i++) {
            int flattenedIndex = 0;
            for (int j = 0; j < ${t}; j++) {
              int index = round(${d});
              flattenedIndex += index * ${g};
            }
            if (flattenedIndex == coords[0]) {
              sum += ${p};
              found = true;
            }
          }
          setOutput(mix(${h}, sum, float(found)));
        }
      `}},iW=class{constructor(e,t,n,r,i,a,o=!0,s=!1){this.variableNames=[`updates`,`indices`,`defaultValue`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=a;let c=lF(i.length),l=lF(a.length),u=``;n===1?u=`i`:n===2&&(u=`i, j`);let d=`getIndices(${u})`,f=``;r===1?f=`i`:r===2&&(f=`i, coords[1]`);let p=`getUpdates(${f})`,m=``;s&&(m=`coords[0], coords[1]`);let h=`getDefaultValue(${m})`,g=t>1?`strides[j]`:`strides`,_=t>1?`strides[j + 1]`:`strides`;this.userCode=`
        ${c} strides = ${c}(${i});

        void main() {
          ${l} coords = getOutputCoords();
          vec4 sum = vec4(0.);
          vec4 found = vec4(0.);
          for (int i = 0; i < ${e}; i+=2) {
            ivec2 flattenedIndex = ivec2(0);
            for (int j = 0; j < ${t}; j+=2) {
              ivec4 index = round(${d});
              flattenedIndex += index.xz * ${g};
              if (j + 1 < ${t}) {
                flattenedIndex += index.yw * ${_};
              }
            }
            if (flattenedIndex[0] == coords[0] || flattenedIndex[1] == coords[0] ||
                flattenedIndex[0] == coords[0] + 1 || flattenedIndex[1] == coords[0] + 1) {
              vec4 updVals = ${p};
              if (flattenedIndex[0] == coords[0]) {
                sum.xy += updVals.xy;
                found.xy = vec2(1.);
              } else if (flattenedIndex[0] == coords[0] + 1) {
                sum.zw += updVals.xy;
                found.zw = vec2(1.);
              }
              if (flattenedIndex[1] == coords[0]) {
                sum.xy += updVals.zw;
                found.xy = vec2(1.);
              } else if (flattenedIndex[1] == coords[0] + 1) {
                sum.zw += updVals.zw;
                found.zw = vec2(1.);
              }
            }
          }
          setOutput(mix(${h}, sum, found));
        }
      `}};function aW(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i,updates:a}=t,{shape:o}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=Cf(a,i,o),f=[d/l,l];if(d===0)return n.makeTensorInfo(o,i.dtype);let p=$({inputs:{x:i},backend:n,attrs:{shape:[c,s]}}),m=$({inputs:{x:a},backend:n,attrs:{shape:[c,l]}}),h=n.makeTensorInfo([],`float32`,new Float32Array([0])),g;g=k().getBool(`WEBGL_PACK`)?new iW(c,s,p.shape.length,m.shape.length,u,f):new rW(c,s,p.shape.length,m.shape.length,u,f);let _=n.runWebGLProgram(g,[m,p,h],m.dtype),v=$({inputs:{x:_},backend:n,attrs:{shape:o}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(_),n.disposeIntermediateTensorInfo(h),v}var oW={kernelName:zn,backendName:`webgl`,kernelFunc:aW},sW=class{constructor(e,t,n,r){this.variableNames=[`sortedSequence`,`values`],this.customUniforms=[{name:`numInputs`,type:`int`}],this.outputShape=[e,n];let i=`for (int i = 0; i < ${Math.ceil(Math.log2(t+1))}; ++i) { if (left >= right) break;`,a=k().getNumber(`WEBGL_VERSION`)===2?`while (left < right) {`:i,o=r===`left`?`<`:`<=`;this.userCode=`
       int findBound(int batch, float value) {
         int left = 0;
         int right = numInputs;
         int mid;
         ${a}
           mid = (left + right) / 2;
           if (getSortedSequence(batch, mid) ${o} value) {
             left = mid + 1;
           } else {
             right = mid;
           }
         }
         return right;
       }

       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int valueIndex = coords[1];

         float value = getValues(batch, valueIndex);

         setOutput(float(findBound(batch, value)));
       }
     `}};function cW(e){let{inputs:t,backend:n,attrs:r}=e,{sortedSequence:i,values:a}=t,{side:o}=r,s=new sW(i.shape[0],i.shape[1],a.shape[1],o),c=[[i.shape[1]]];return n.runWebGLProgram(s,[i,a],`int32`,c)}var lW={kernelName:Vn,backendName:`webgl`,kernelFunc:cW},uW=class{constructor(e,t,n){this.variableNames=[`c`,`a`,`b`],this.outputShape=t;let r,i;if(n>4)throw Error(`Where for rank ${n} is not yet supported`);if(n===1)i=`resRC`,r=`resRC`;else{let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`],a=[],o=[];for(let r=0;r<t.length;r++)o.push(`${n[r]}`),r<e&&a.push(`${n[r]}`);r=a.join(),i=o.join()}let a=lF(n);this.userCode=`
      void main() {
        ${a} resRC = getOutputCoords();
        float cVal = getC(${r});
        if (cVal >= 1.0) {
          setOutput(getA(${i}));
        } else {
          setOutput(getB(${i}));
        }
      }
    `}};function dW(e){let{inputs:t,backend:n}=e,{condition:r,t:i,e:a}=t,o=new uW(r.shape.length,i.shape,i.shape.length);return n.runWebGLProgram(o,[r,i,a],Ii(i.dtype,a.dtype))}var fW={kernelName:Hn,backendName:`webgl`,kernelFunc:dW},pW={kernelName:Un,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = ${Qm};
  float scale = ${$m};
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`})},mW={kernelName:qn,backendName:`webgl`,kernelFunc:qL({opSnippet:KL+`
  return 1.0 / (1.0 + exp(-1.0 * x));
`,packedOpSnippet:`
  vec4 result = 1.0 / (1.0 + exp(-1.0 * x));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:OI})},hW={kernelName:Kn,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`})},gW={kernelName:`Sin`,backendName:`webgl`,kernelFunc:qL({opSnippet:KL+`
  return sin(x);
`,packedOpSnippet:`
  vec4 result = sin(x);
  bvec4 isNaN = isnan(x);
  ${ML}
  return result;
`})},_W={kernelName:Gn,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`})},vW={kernelName:Jn,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  float epsilon = 1.1920928955078125e-7;
  float threshold = log(epsilon) + 2.0;

  bool too_large = x > -threshold;
  bool too_small = x < threshold;

  float result;
  float exp_x = exp(x);

  if (too_large){
    result = x;
  }
  else if (too_small){
    result = exp_x;
  }
  else{
    result = log(exp_x + 1.0);
  }
  return result;
`})},yW={kernelName:Xn,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,paddings:o}=r;m(i.shape.length<=4,()=>`spaceToBatchND for rank > 4 with a WebGL backend not implemented yet`);let s=a.reduce((e,t)=>e*t),c=[[0,0]];c.push(...o);for(let e=1+a.length;e<i.shape.length;++e)c.push([0,0]);let l=[],u=yU({inputs:{x:i},backend:n,attrs:{paddings:c,constantValue:0}}),d=qm(u.shape,a,s,!1),f=Jm(d.length,a.length,!1),p=Ym(u.shape,a,s,!1),h=$({inputs:{x:u},backend:n,attrs:{shape:d}}),g=hR({inputs:{x:h},backend:n,attrs:{perm:f}}),_=$({inputs:{x:g},backend:n,attrs:{shape:p}});return l.push(u),l.push(h),l.push(g),l.forEach(e=>n.disposeIntermediateTensorInfo(e)),_}};function bW(e){let{inputs:t,backend:n}=e,{indices:r,values:i,denseShape:a,defaultValue:o}=t;if(a.shape.length!==1)throw Error(`Dense shape must be a vector, saw:
         ${a.shape}`);if(r.shape.length!==2)throw Error(`Indices must be a matrix, saw:
         ${r.shape}`);if(i.shape.length!==1)throw Error(`Values must be a vector, saw:
         ${i.shape}`);if(o.shape.length!==0)throw Error(`Default value must be a scalar, saw:
        ${o.shape}`);let s=n.readSync(r.dataId),c=n.readSync(i.dataId),l=n.readSync(a.dataId),u=n.readSync(o.dataId)[0],[d,f,p,m,h]=jI(s,r.shape,r.dtype,c,i.dtype,l,u);return[n.makeTensorInfo(f,r.dtype,d),n.makeTensorInfo([f[0]],i.dtype,p),n.makeTensorInfo([m.length],`bool`,new Uint8Array(m.map(e=>Number(e)))),n.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}var xW={kernelName:$n,backendName:`webgl`,kernelFunc:bW};function SW(e){let{inputs:t,backend:n}=e,{inputIndices:r,inputShape:i,newShape:a}=t;if(r.shape.length!==2)throw Error(`Input indices should be a matrix but received shape ${r.shape}`);if(i.shape.length!==1)throw Error(`Input shape should be a vector but received shape ${i.shape}`);if(a.shape.length!==1)throw Error(`Target shape should be a vector but received shape ${a.shape}`);let o=Array.from(n.readSync(i.dataId)),s=n.readSync(r.dataId),c=Array.from(n.readSync(a.dataId)),[l,u,d]=MI(s,r.shape,r.dtype,o,c);return[n.makeTensorInfo(u,r.dtype,l),n.makeTensorInfo([d.length],a.dtype,new Int32Array(d))]}var CW={kernelName:er,backendName:`webgl`,kernelFunc:SW};function wW(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
              ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
              ${a.shape}`);let o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=NI(o,r.shape,r.dtype,s,c,!0);return n.makeTensorInfo(u,r.dtype,l)}var TW={kernelName:tr,backendName:`webgl`,kernelFunc:wW};function EW(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
             ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
             ${a.shape}`);let o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=NI(o,r.shape,r.dtype,s,c);return n.makeTensorInfo(u,r.dtype,l)}var DW={kernelName:nr,backendName:`webgl`,kernelFunc:EW};function OW(e){let{inputs:t,backend:n,attrs:r}=e,{sparseIndices:i,sparseValues:a,defaultValue:o}=t,{outputShape:s}=r,{sliceRank:c,numUpdates:l,sliceSize:u,strides:d,outputSize:f}=Cf(a,i,s);if(a.dtype===`string`){let e=DI(n.bufferSync(i),n.bufferSync(a),s,f,u,l,c,d,oi(n.readSync(o.dataId)[0]),!1);return n.makeTensorInfo(s,e.dtype,e.values)}let p=new rW(l,c,i.shape.length,a.shape.length,d,[f,1],!1),m=n.runWebGLProgram(p,[a,i,o],a.dtype),h=$({inputs:{x:m},backend:n,attrs:{shape:s}});return n.disposeIntermediateTensorInfo(m),h}var kW={kernelName:rr,backendName:`webgl`,kernelFunc:OW};function AW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{numOrSizeSplits:a,axis:o}=r,s=w(o,i.shape)[0],c=wh(i,a,s),l=i.shape.length,u=Array(l).fill(0),d=i.shape.slice();return c.map(e=>{let t=[...d];t[s]=e;let r=_z({inputs:{x:i},backend:n,attrs:{begin:u,size:t}});return u[s]+=e,r})}var jW={kernelName:Zn,backendName:`webgl`,kernelFunc:AW},MW=`return sqrt(x);`,NW={kernelName:Yn,backendName:`webgl`,kernelFunc:qL({opSnippet:MW,packedOpSnippet:MW,cpuKernelImpl:PI})},PW={kernelName:ar,backendName:`webgl`,kernelFunc:qL({opSnippet:`return x * x;`})},FW=`return (a - b) * (a - b);`,IW={kernelName:ir,backendName:`webgl`,kernelFunc:JL({opSnippet:FW,packedOpSnippet:FW})};function LW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;if(i.dtype!==`string`)throw Error(`Input must be of datatype string`);let a=FI(Hh(n.readSync(i.dataId)),`string`,r);return n.makeTensorInfo(i.shape,`string`,a)}var RW={kernelName:or,backendName:`webgl`,kernelFunc:LW};function zW({inputs:e,attrs:t,backend:n}){let{x:r}=e,i=aL+`
    return x > 0.0 ? 1.0 : float(${t.alpha});
  `,a=new iL(r.shape,i);return n.runWebGLProgram(a,[r],r.dtype)}var BW={kernelName:br,backendName:`webgl`,kernelFunc:zW},VW=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=n;let r=n.length,i=lF(n.length),a=lF(n.length),o=``;if(r===1)o=`coords * strides + begin`;else{let e=0;o=n.map((t,r)=>(e++,n.length===1?`coords * strides[${r}] + begin[${r}]`:`coords[${e-1}] * strides[${r}] + begin[${r}]`)).join(`,`)}this.userCode=`
      ${i} begin = ${i}(${e});
      ${i} strides = ${i}(${t});

      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${o}));
      }
    `}};function HW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,end:o,strides:s,beginMask:c,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:f}=r,{finalShapeSparse:p,finalShape:h,isIdentity:g,sliceDim0:_,isSimpleSlice:v,begin:y,end:b,strides:x}=Mm(i.shape,a,o,s,c,l,u,d,f),S;if(g)S=$({inputs:{x:i},backend:n,attrs:{shape:h}});else if(_||v){m(i.shape.length>=1,()=>`Input must have rank at least 1, got: ${i.shape.length}`);let e=ym(y,b,x),t=_z({inputs:{x:i},backend:n,attrs:{begin:y,size:e}});S=$({inputs:{x:t},backend:n,attrs:{shape:h}}),n.disposeIntermediateTensorInfo(t)}else if(n.shouldExecuteOnCPU([i])){let e=n.readSync(i.dataId),t=II(p,I(i.shape,i.dtype,e),x,y);S=n.makeTensorInfo(h,i.dtype,t.values)}else{let e=new VW(y,x,p);S=n.runWebGLProgram(e,[i],i.dtype)}let C=$({inputs:{x:S},backend:n,attrs:{shape:h}});return n.disposeIntermediateTensorInfo(S),C}var UW={kernelName:sr,backendName:`webgl`,kernelFunc:HW};function WW(e){let{inputs:t,backend:n,attrs:r}=e,{separator:i,nGramWidths:a,leftPad:o,rightPad:s,padWidth:c,preserveShortSequences:l}=r,{data:u,dataSplits:d}=t,[f,p]=LI(n.readSync(u.dataId),n.readSync(d.dataId),i,a,o,s,c,l);return[n.makeTensorInfo([f.length],`string`,f),n.makeTensorInfo(d.shape,`int32`,p)]}var GW={kernelName:cr,backendName:`webgl`,kernelFunc:WW};function KW(e){let{inputs:t,backend:n,attrs:r}=e,{skipEmpty:i}=r,{input:a,delimiter:o}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(a.shape.length!==1)throw Error(`Input must be a vector, got shape: ${a.shape}`);if(o.shape.length!==0)throw Error(`Delimiter must be a scalar, got shape: ${o.shape}`);let s=n.readSync(a.dataId),c=n.readSync(o.dataId)[0],[l,u,d]=RI(s,c,i),f=u.length;return[n.makeTensorInfo([f,2],`int32`,l),n.makeTensorInfo([f],`string`,u),n.makeTensorInfo([2],`int32`,new Int32Array(d))]}var qW={kernelName:lr,backendName:`webgl`,kernelFunc:KW};function JW(e){let{inputs:t,backend:n,attrs:r}=e,{numBuckets:i}=r,{input:a}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(i<=0)throw Error(`Number of buckets must be at least 1`);let o=zI(n.readSync(a.dataId),i);return n.makeTensorInfo(a.shape,`int32`,o)}var YW={kernelName:ur,backendName:`webgl`,kernelFunc:JW},XW={kernelName:`Tan`,backendName:`webgl`,kernelFunc:qL({opSnippet:`return tan(x);`})},ZW={kernelName:dr,backendName:`webgl`,kernelFunc:qL({opSnippet:`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`})};function QW(e){let{inputs:t,backend:n,attrs:r}=e,{tensor:i,indices:a,updates:o}=t,{}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=Cf(o,a,i.shape),f=[d/l,l];if(d===0)return n.makeTensorInfo(i.shape,a.dtype);let p=$({inputs:{x:a},backend:n,attrs:{shape:[c,s]}}),m=$({inputs:{x:o},backend:n,attrs:{shape:[c,l]}}),h=$({inputs:{x:i},backend:n,attrs:{shape:f}}),g=new rW(c,s,p.shape.length,m.shape.length,u,f,!1,!0),_=n.runWebGLProgram(g,[m,p,h],h.dtype),v=$({inputs:{x:_},backend:n,attrs:{shape:i.shape}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(_),v}var $W={kernelName:Bn,backendName:`webgl`,kernelFunc:QW},eG=class{constructor(e,t){this.variableNames=[`A`];let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[r]*t[r];this.outputShape=n,this.rank=n.length;let r=lF(this.rank),i=tG(e);this.userCode=`
      void main() {
        ${r} resRC = getOutputCoords();
        setOutput(getA(${i}));
      }
    `}};function tG(e){let t=e.length;if(t>5)throw Error(`Tile for rank ${t} is not yet supported`);if(t===1)return`imod(resRC, ${e[0]})`;let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`,`resRC.u`],r=[];for(let t=0;t<e.length;t++)r.push(`imod(${n[t]}, ${e[t]})`);return r.join()}function nG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reps:a}=r;if(i.dtype===`string`||i.shape.length>5){let e=n.readSync(i.dataId),t=i.dtype===`string`?e.map(e=>oi(e)):e,r=VI(I(i.shape,i.dtype,t),a);return n.makeTensorInfo(r.shape,r.dtype,r.values)}let o=new eG(i.shape,a);return n.runWebGLProgram(o,[i],i.dtype)}var rG={kernelName:fr,backendName:`webgl`,kernelFunc:nG},iG=class{constructor(e){this.variableNames=[`x`,`indices`],this.customUniforms=[{name:`n`,type:`int`},{name:`firstPass`,type:`int`},{name:`negativeInf`,type:`float`},{name:`dir`,type:`int`},{name:`inc`,type:`int`}],this.outputShape=e,this.userCode=`
       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // We compare elements pair-wise within a group of size 2 * inc.
         // The comparing rule for each group alternates between ascending
         // and descending. Within each group, we compare each pair at
         // positions i and i+inc. To decide whether an element at position i
         // is x0 or x1, we mod it by 2 * inc, if the result is smaller than
         // inc, it is in the first half of the group, we denote it as x0,
         // otherwise we denote it as x1.
         // For example, as shown in the Bitonic top K paper referenced above,
         // Figure5(a) shows that element[1] is in the
         // second half of the group when group size is 2, but it is in the
         // first half of the group when group size is 4.

         bool isFirstInPair = imod(elemIdx, 2 * inc) < inc;
         int i = isFirstInPair ? elemIdx : elemIdx - inc;

         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + inc : int(getIndices(batch, i + inc));
         float x0 = i0 < n ? getX(batch, i0) : negativeInf;
         float x1 = i1 < n ? getX(batch, i1) : negativeInf;

         // Denotes which direction indices are in (ascending or descending).
         bool reverse = imod(elemIdx, 2 * dir) >= dir;
         bool isGreater = x0 > x1 || (x0 == x1 && i1 > i0);
         if (reverse == isGreater) { // Elements in opposite order of direction
           int iTemp = i0;
           i0 = i1;
           i1 = iTemp;
         }
         if (isFirstInPair) {
            setOutput(float(i0));
         } else {
            setOutput(float(i1));
         }
       }
     `}},aG=class{constructor(e){this.variableNames=[`x`,`indices`],this.customUniforms=[{name:`n`,type:`int`},{name:`firstPass`,type:`int`},{name:`k`,type:`int`}],this.outputShape=e,this.userCode=`
    void main() {
         // Takes max of indices (0, k), (1, k + 1), (2, k + 2) ...
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // The output size is half of the previous size.
         // If the previous sequence is | | | | _ _ _ _  | | | |  _ _ _ _ (k=4),
         // we only need to output the indices at positions |, the indices at
         // positions _ can be thrown away, see Figure5(b) After Phase 2
         // (Merge phase) in the Bitonic Top K paper referenced above.
         // For example, the paper shows we only need to output the orange bars.
         // The output sequence should look like this | | | | | | | |.
         // Because the sequence is halved, to map the output index back
         // to the previous sequence to find the corresponding value,
         // we need to double the index. When we double the index,
         // we basically interpolate a position, so 2i looks like
         // | _ | _ | _ | _ | _ | _ | _. We move the | to the first k position
         // of each 2k positions by - elemIdx % k. E.g. for output at
         // index 4,5,6,7, we want to get the corresponding element at
         // original index 8,9,10,11, for output at index 8,9,10,11,
         // we want to get the corresponding element at original index
         // 16,17,18,19, so on and so forth.

         int i = elemIdx < k ? elemIdx : (elemIdx * 2 - imod(elemIdx, k));
         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + k : int(getIndices(batch, i + k));

         float x0 = getX(batch, i0);
         float x1 = i1 < n ? getX(batch, i1) : x0;

         setOutput(x0 >= x1 ? float(i0) : float(i1));
       }
     `}};function oG(e,t){t!==null&&e.disposeIntermediateTensorInfo(t)}function sG(e){let t=1;for(;t<e;)t*=2;return t}function cG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{k:a,sorted:o}=r,s=k().getNumber(`TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD`),c=k().getNumber(`TOPK_K_CPU_HANDOFF_THRESHOLD`),l=i.shape,u=l[l.length-1];if(n.shouldExecuteOnCPU([i])||u<s||a>c){let[e,t]=HI(n.readSync(i.dataId),l,i.dtype,a,o);return[n.makeTensorInfo(e.shape,e.dtype,e.values),n.makeTensorInfo(t.shape,t.dtype,t.values)]}if(a===0)return l[l.length-1]=0,[n.makeTensorInfo(l,i.dtype,[]),n.makeTensorInfo(l,`int32`,[])];if(u===1)return[i,wV({attrs:{shape:l,dtype:`int32`,value:0},backend:n})];let d=n.texData.get(i.dataId),f=d!==null&&d.isPacked,p=f?n.unpackTensor(i):i,m=_(l)/u,h=$({inputs:{x:p},attrs:{shape:[m,u]},backend:n});f&&oG(n,p);let g=sG(a),v=sG(u),y=null,b=()=>y===null?[h,h]:[h,y],x=(e,t,r)=>{let i=b(),a=new iG(r),o=[[u],[+(y===null)],[-1/0],[e],[t]],s=y;y=n.runWebGLProgram(a,i,`int32`,o),oG(n,s)};for(let e=1;e<g;e*=2){let t=e*2;for(let n=e;n>=1;n/=2)x(t,n,[m,v])}for(let e=v;e>g;e/=2){let t=b(),r=new aG([m,e/2]),i=[[u],[+(y===null)],[g]],a=y;y=n.runWebGLProgram(r,t,`int32`,i),oG(n,a);let o=g/2,s=o*2;for(let e=o;e>=1;e/=2)x(s,e,y.shape)}let S=y;y=_z({inputs:{x:y},backend:n,attrs:{begin:0,size:[m,a]}}),oG(n,S);let C=KV({inputs:{x:h,indices:y},backend:n,attrs:{axis:1,batchDims:1}});oG(n,h);let w=l.slice(0,-1);w.push(a),S=y,y=$({inputs:{x:y},attrs:{shape:w},backend:n}),oG(n,S);let T=C;return C=$({inputs:{x:C},attrs:{shape:w},backend:n}),oG(n,T),[C,y]}var lG={kernelName:pr,backendName:`webgl`,kernelFunc:cG},uG=class{constructor(e,t,n,r,i,a){this.variableNames=[`Image`,`Transforms`],this.outputShape=a;let o=n===`nearest`?1:2,s;switch(r){case`constant`:s=1;break;case`reflect`:s=2;break;case`wrap`:s=3;break;case`nearest`:s=4;break;default:s=1}this.userCode=`
            float mapCoord(float outCoord, float len) {
              float inCoord = outCoord;
              if(${s} == 2) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    if (inCoord < sz2) {
                      inCoord = sz2 * float(int(float(-inCoord / sz2))) +
                      inCoord;
                    }
                    inCoord = inCoord < -len ? inCoord + sz2 : -inCoord - 1.0;
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    inCoord -= sz2 * float(int(float(inCoord / sz2)));
                    if (inCoord >= len) {
                      inCoord = sz2 - inCoord - 1.0;
                    }
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${s} == 3) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord += len * (float(int(float(-inCoord / sz))) + 1.0);
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord -= len * float(int(float(inCoord / sz)));
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${s} == 4) {
                return clamp(outCoord, 0.0, len - 1.0);
              } else {
                return outCoord;
              }
            }

            float readWithFillValue(int batch, int coordY, int coordX,
              int channel) {
              float outputValue;
              if (0 <= coordY && coordY < ${e} && 0 <= coordX && coordX < ${t}) {
                  outputValue = getImage(batch, coordY, coordX, channel);
              } else {
                outputValue = float(${i});
              }
              return outputValue;
            }

            void main() {
              ivec4 coords = getOutputCoords();
              float outputValue;
              int batch = coords[0];
              int x = coords[2];
              int y = coords[1];
              int channel = coords[3];
              float xf = float(x);
              float yf = float(y);
              float a1 = getTransforms(batch, 0);
              float a2 = getTransforms(batch, 1);
              float a3 = getTransforms(batch, 2);
              float b1 = getTransforms(batch, 3);
              float b2 = getTransforms(batch, 4);
              float b3 = getTransforms(batch, 5);
              float c1 = getTransforms(batch, 6);
              float c2 = getTransforms(batch, 7);
              float projection = c1 * xf + c2 * yf + 1.0;
              if (projection == 0.0) {
                outputValue = float(${i});
              } else {
                float inX = (a1 * xf + a2 * yf + a3) / projection;
                float inY = (b1 * xf + b2 * yf + b3) / projection;
                float mapX = mapCoord(inX, float(${t}));
                float mapY = mapCoord(inY, float(${e}));

                if (${o} == 1) {
                  int coordY = int(round(mapY));
                  int coordX = int(round(mapX));
                  outputValue = readWithFillValue(batch, coordY, coordX,
                    channel);
                } else {
                  float yFloor = floor(mapY);
                  float xFloor = floor(mapX);
                  float yCeil = yFloor + 1.0;
                  float xCeil = xFloor + 1.0;
                  float valueYFloor = (xCeil - mapX) *
                  readWithFillValue(batch, int(yFloor), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yFloor), int(xCeil), channel);
                  float valueYCeil = (xCeil - mapX) *
                  readWithFillValue(batch, int(yCeil), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yCeil), int(xCeil), channel);
                  outputValue = (yCeil - mapY) * valueYFloor +
                  (mapY - yFloor) * valueYCeil;
                }
              }
              setOutput(outputValue);
            }
        `}};function dG(e){let{inputs:t,backend:n,attrs:r}=e,{image:i,transforms:a}=t,{interpolation:o,fillMode:s,fillValue:c,outputShape:l}=r,[u,d,f,p]=i.shape,[m,h]=l??[d,f],g=new uG(d,f,o,s,c,[u,m,h,p]);return n.runWebGLProgram(g,[i,a],`float32`)}var fG={kernelName:mr,backendName:`webgl`,kernelFunc:dG};function pG(e){let{inputs:t,attrs:n,backend:r}=e,{axis:i}=n,{x:a}=t;fP(a,`unique`),console.warn(`WARNING: `,`UI might be locked temporarily as data is being downloaded`);let{outputValues:o,outputShape:s,indices:c}=WI(r.readSync(a.dataId),i,a.shape,a.dtype);return[r.makeTensorInfo(s,a.dtype,o),r.makeTensorInfo([c.length],`int32`,c)]}var mG={kernelName:gr,backendName:`webgl`,kernelFunc:pG};function hG(e){let{inputs:t,backend:n,attrs:r}=e,{value:i}=t,{axis:a}=r;a<0&&(a+=i.shape.length);let o=i,s=o.shape.length,c=i.shape[a],l=Array(s-1),u=0;for(let e=0;e<s;e++)e!==a&&(l[u++]=o.shape[e]);let d=[],f=Array(s).fill(0),p=o.shape.slice();p[a]=1;let m=Array(c);for(let e=0;e<m.length;e++){f[a]=e;let t=_z({inputs:{x:o},backend:n,attrs:{begin:f,size:p}}),r=$({inputs:{x:t},backend:n,attrs:{shape:l}});m[e]=r,d.push(t)}return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),m}var gG={kernelName:_r,backendName:`webgl`,kernelFunc:hG},_G=class{constructor(e,t){this.variableNames=[`x`,`segmentIds`];let n=e.windowSize,r=e.batchSize,i=e.inSize,a=e.numSegments,o=a*Math.ceil(i/n);this.outputShape=[r,o];let s=Math.floor(n/4)*4,c=n%4,l=`
        sumValue += dot(values, segFilter);
    `,u=``;i%n>0&&(u=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return initializationValue;
        }
      `);let d=``;i%n>0&&(d=`
        if (inIdx < 0 || inIdx >= ${i}) {
          return -1.0;
        }
      `),this.userCode=`
      const float initializationValue = 0.0;

      float getValue(int batch, int inIdx) {
        ${u}
        return getX(batch, inIdx);
      }

      float getSegmentIdAtIndex(int inIdx) {
        ${d}
        return getSegmentIds(inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = int(floor(float(outIdx) / float(
          ${a})) * float(${n}));
        int currentSeg = int(mod(float(outIdx), float(${a})));

        float sumValue = 0.0;

        for (int i = 0; i < ${s}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 3)) == currentSeg ? 1 : 0
          );

          ${l}
        }

        int inIdx = inOffset + ${s};
        if (${c===1}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          int inIdxSeg = int(getSegmentIdAtIndex(inIdx));

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            0,
            0,
            0
          );

          ${l}
        } else if (${c===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
              0,
              0
          );

          ${l}
        } else if (${c===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            0
          );

          ${l}
        }
        setOutput(sumValue);
      }
    `}};function vG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,segmentIds:a}=t,{numSegments:o}=r,s=i.shape.length,c=[],l=0,u=Jc([l],s),d=i;u!=null&&(d=hR({inputs:{x:i},backend:n,attrs:{perm:u}}),c.push(d),l=Xc(1,s)[0]);let f=zh(d.shape,l,o),p=_([d.shape[l]]),m=$({inputs:{x:d},backend:n,attrs:{shape:[-1,p]}});c.push(m);let h=Li(i.dtype),g=(e,t,r,i,a)=>{let o=e.shape[0],s=e.shape[1],l=Rh(s,a),u=new _G({windowSize:l,inSize:s,batchSize:o,numSegments:a},t),d=n.compileAndRun(u,[e,r],i);if(c.push(d),d.shape[1]===a)return d;let f=AU({backend:n,attrs:{start:0,stop:a,step:1,dtype:`float32`}}),p=nG({inputs:{x:f},backend:n,attrs:{reps:[s/l]}});return c.push(f),c.push(p),g(d,t,p,i,a)},v=$({inputs:{x:g(m,`unsortedSegmentSum`,a,h,o)},backend:n,attrs:{shape:f}}),y=v;if(u!=null){c.push(v);let e=Yc(u);y=hR({inputs:{x:y},backend:n,attrs:{perm:e}})}return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),y}var yG=[yR,SR,CR,wR,ER,AR,MR,PR,VR,UR,WR,GR,KR,qR,JR,QR,ez,iz,oz,cz,dz,yz,xz,Tz,Dz,Fz,Lz,Vz,LL,Gz,eB,lB,hB,vB,bB,SB,wB,TB,EB,OB,FB,LB,zB,HB,KB,XB,QB,tV,iV,oV,sV,uV,dV,fV,mV,gV,vV,SV,TV,DV,kV,AV,NV,RV,BV,UV,qV,JV,YV,FL,ZV,Xz,QV,$V,eH,VL,tH,nH,iH,aH,oH,sH,cH,lH,fH,mH,_H,vH,bH,SH,EH,OH,AH,MH,PH,FH,RH,zH,YH,tR,$H,nU,aU,cU,kz,uU,mU,gU,bU,xU,GL,CU,TU,DU,kU,jU,jz,HH,MU,NU,PU,rR,RU,VU,GU,JU,QU,eW,tW,nW,oW,lW,fW,pW,mW,hW,gW,_W,vz,qH,vW,yW,xW,CW,TW,DW,kW,jW,NW,PW,IW,RW,BW,UW,GW,qW,YW,GH,mR,XW,ZW,$W,rG,lG,fG,gR,mG,gG,{kernelName:vr,backendName:`webgl`,kernelFunc:vG},fU];for(let e of yG)Nr(e);var bG=[{sigma:.55,points:[[-1,0],[-.5,-.866025],[.5,-.866025],[1,-0],[.5,.866025],[-.5,.866025]]},{sigma:.475,points:[[0,.930969],[-.806243,.465485],[-.806243,-.465485],[-0,-.930969],[.806243,-.465485],[.806243,.465485]]},{sigma:.4,points:[[.847306,-0],[.423653,.733789],[-.423653,.733789],[-.847306,0],[-.423653,-.733789],[.423653,-.733789]]},{sigma:.325,points:[[-0,-.741094],[.641806,-.370547],[.641806,.370547],[0,.741094],[-.641806,.370547],[-.641806,-.370547]]},{sigma:.25,points:[[-.595502,0],[-.297751,-.51572],[.297751,-.51572],[.595502,-0],[.297751,.51572],[-.297751,.51572]]},{sigma:.175,points:[[0,.362783],[-.314179,.181391],[-.314179,-.181391],[-0,-.362783],[.314179,-.181391],[.314179,.181391]]},{sigma:.1,points:[[0,0]]}],xG=[];for(let e=0;e<bG.length;e++){let t=bG[e].sigma;for(let n=0;n<bG[e].points.length;n++){let r=bG[e].points[n];xG.push([t,r[0],r[1]])}}var SG={};function CG(e){let t=e.shape[1],n=e.shape[0],r=`w`+t+`h`+n;return SG.hasOwnProperty(r)||(SG[r]=[{variableNames:[`p`],outputShape:[n,t],userCode:`
        void main() {
          ivec2 coords = getOutputCoords();

          float sum = getP(coords[0], coords[1]-2);
          sum += getP(coords[0], coords[1]-1) * 4.;
          sum += getP(coords[0], coords[1]) * 6.;
          sum += getP(coords[0], coords[1]+1) * 4.;
          sum += getP(coords[0], coords[1]+2);
          setOutput(sum);
        }
      `},{variableNames:[`p`],outputShape:[n,t],userCode:`
        void main() {
          ivec2 coords = getOutputCoords();

          float sum = getP(coords[0]-2, coords[1]);
          sum += getP(coords[0]-1, coords[1]) * 4.;
          sum += getP(coords[0], coords[1]) * 6.;
          sum += getP(coords[0]+1, coords[1]) * 4.;
          sum += getP(coords[0]+2, coords[1]);
          sum /= 256.;
          setOutput(sum);
        }
      `}]),SG[r]}var wG={kernelName:`BinomialFilter`,backendName:`webgl`,kernelFunc:e=>{let t=e.inputs.image,n=e.backend,[r,i]=CG(t),a=n.runWebGLProgram(r,[t],t.dtype),o=n.runWebGLProgram(i,[a],t.dtype);return n.disposeIntermediateTensorInfo(a),o}},TG=7,EG=9,DG=25/4,OG={};function kG(e){let t=e.shape[1],n=e.shape[0],r=`w`+t+`h`+n;return OG.hasOwnProperty(r)||(OG[r]={variableNames:[`image0`,`image1`,`image2`],outputShape:[n,t],userCode:`
        void main() {
          ivec2 coords = getOutputCoords();
    
          int y = coords[0];
          int x = coords[1];
    
          float value = getImage1(y, x);
    
          // Step 1: find local maxima/minima
          if (value * value < ${EG}.) {
            setOutput(0.);
            return;
          }
          if (y < ${TG} || y > ${n-1-TG}) {
            setOutput(0.);
            return;
          }
          if (x < ${TG} || x > ${t-1-TG}) {
            setOutput(0.);
            return;
          }
    
          bool isMax = true;
          bool isMin = true;
          for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
              float value0 = getImage0(y+dy, x+dx);
              float value1 = getImage1(y+dy, x+dx);
              float value2 = getImage2(y+dy, x+dx);
    
        if (value < value0 || value < value1 || value < value2) {
          isMax = false;
        }
        if (value > value0 || value > value1 || value > value2) {
          isMin = false;
        }
            }
          }
    
          if (!isMax && !isMin) {
            setOutput(0.);
            return;
          }
    
          // compute edge score and reject based on threshold
          float dxx = getImage1(y, x+1) + getImage1(y, x-1) - 2. * getImage1(y, x);
          float dyy = getImage1(y+1, x) + getImage1(y-1, x) - 2. * getImage1(y, x);
          float dxy = 0.25 * (getImage1(y-1,x-1) + getImage1(y+1,x+1) - getImage1(y-1,x+1) - getImage1(y+1,x-1));
    
          float det = (dxx * dyy) - (dxy * dxy);
    
          if (abs(det) < 0.0001) { // determinant undefined. no solution
            setOutput(0.);
            return;
          }
    
          float edgeScore = (dxx + dyy) * (dxx + dyy) / det;
    
          if (abs(edgeScore) >= ${DG} ) {
            setOutput(0.);
            return;
          }
          setOutput(getImage1(y,x));
        }
      `}),OG[r]}var AG={kernelName:`BuildExtremas`,backendName:`webgl`,kernelFunc:e=>{let{image0:t,image1:n,image2:r}=e.inputs,i=e.backend,a=kG(n);return t=pa().runKernel(`DownsampleBilinear`,{image:t}),r=pa().runKernel(`UpsampleBilinear`,{image:r,targetImage:n}),i.runWebGLProgram(a,[t,n,r],n.dtype)}},jG=36,MG={};function NG(e){let t=e.shape[0];return MG.hasOwnProperty(t)||(MG[t]={variableNames:[`histogram`],outputShape:[e.shape[0]],userCode:`
            void main() {
                int featureIndex = getOutputCoords();

                int maxIndex = 0;
                for (int i = 1; i < ${jG}; i++) {
                    if (getHistogram(featureIndex, i) > getHistogram(featureIndex, maxIndex)) {
                        maxIndex = i;
                    }
                }

                int prev = imod(maxIndex - 1 + ${jG}, ${jG});
                int next = imod(maxIndex + 1, ${jG});

                /**
                 * Fit a quatratic to 3 points. The system of equations is:
                 *
                 * y0 = A*x0^2 + B*x0 + C
                 * y1 = A*x1^2 + B*x1 + C
                 * y2 = A*x2^2 + B*x2 + C
                 *
                 * This system of equations is solved for A,B,C.
                 */
                float p10 = float(maxIndex - 1);
                float p11 = getHistogram(featureIndex, prev); 
                float p20 = float(maxIndex);
                float p21 = getHistogram(featureIndex, maxIndex); 
                float p30 = float(maxIndex + 1);
                float p31 = getHistogram(featureIndex, next); 

                float d1 = (p30-p20)*(p30-p10);
                float d2 = (p10-p20)*(p30-p10);
                float d3 = p10-p20;

                // If any of the denominators are zero then, just use maxIndex.
                    float fbin = float(maxIndex);
                if ( abs(d1) > 0.00001 && abs(d2) > 0.00001 && abs(d3) > 0.00001) {
                float a = p10*p10;
                float b = p20*p20;

                // Solve for the coefficients A,B,C
                float A = ((p31-p21)/d1)-((p11-p21)/d2);
                float B = ((p11-p21)+(A*(b-a)))/d3;
                float C = p11-(A*a)-(B*p10);
                fbin = -B / (2. * A);
                }

                float an = 2.0 *${Math.PI} * (fbin + 0.5) / ${jG}. - ${Math.PI};
                setOutput(an);
            }
            `}),MG[t]}var PG={kernelName:`ComputeExtremaAngles`,backendName:`webgl`,kernelFunc:e=>{let{histograms:t}=e.inputs,n=e.backend,r=NG(t);return n.runWebGLProgram(r,[t],t.dtype)}},FG=7,IG={};function LG(e,t){let n=`${e}|${t.shape[0]}`;if(!IG.hasOwnProperty(n)){let r=[];for(let t=1;t<e;t++)r.push(`image`+t);let i=`float getPixel(int octave, int y, int x) {`;for(let t=1;t<e;t++)i+=`
  if (octave == ${t}) {
	return getImage${t}(y, x);
  }
`;i+=`}`,IG[n]={variableNames:[...r,`extrema`,`angles`,`freakPoints`],outputShape:[t.shape[0],xG.length],userCode:`
  ${i}
  void main() {
	ivec2 coords = getOutputCoords();
	int featureIndex = coords[0];
	int freakIndex = coords[1];

	float freakSigma = getFreakPoints(freakIndex, 0);
	float freakX = getFreakPoints(freakIndex, 1);
	float freakY = getFreakPoints(freakIndex, 2);

	int octave = int(getExtrema(featureIndex, 1));
	float inputY = getExtrema(featureIndex, 2);
	float inputX = getExtrema(featureIndex, 3);
	float inputAngle = getAngles(featureIndex);
	float cos = ${FG}. * cos(inputAngle);
	float sin = ${FG}. * sin(inputAngle);

	float yp = inputY + freakX * sin + freakY * cos;
	float xp = inputX + freakX * cos + freakY * -sin;

	int x0 = int(floor(xp));
	int x1 = x0 + 1;
	int y0 = int(floor(yp));
	int y1 = y0 + 1;

	float f1 = getPixel(octave, y0, x0);
	float f2 = getPixel(octave, y0, x1);
	float f3 = getPixel(octave, y1, x0);
	float f4 = getPixel(octave, y1, x1);

	float x1f = float(x1);
	float y1f = float(y1);
	float x0f = float(x0);
	float y0f = float(y0);

	// ratio for interpolation between four neighbouring points
	float value = (x1f - xp) * (y1f - yp) * f1
		+ (xp - x0f) * (y1f - yp) * f2
		+ (x1f - xp) * (yp - y0f) * f3
		+ (xp - x0f) * (yp - y0f) * f4;

	setOutput(value);
  }
`}}return IG[n]}var RG={kernelName:`ComputeExtremaFreak`,backendName:`webgl`,kernelFunc:e=>{let{gaussianImagesT:t,prunedExtremas:n,prunedExtremasAngles:r,freakPointsT:i,pyramidImagesLength:a}=e.inputs,o=e.backend,s=LG(a,n);return o.runWebGLProgram(s,[...t,n,r,i],`float32`)}},zG=(xG.length-1)*xG.length/2,BG=Math.ceil(zG/8),VG={};function HG(e){let t=`${e.shape[0]}`;return VG.hasOwnProperty(t)||(VG[t]={variableNames:[`freak`,`p`],outputShape:[e.shape[0],BG],userCode:`
  void main() {
    ivec2 coords = getOutputCoords();
    int featureIndex = coords[0];
    int descIndex = coords[1] * 8;

    int sum = 0;
    for (int i = 0; i < 8; i++) {
      if (descIndex + i >= ${zG}) {
        continue;
      }

      int p1 = int(getP(descIndex + i, 0));
      int p2 = int(getP(descIndex + i, 1));

      float v1 = getFreak(featureIndex, p1);
      float v2 = getFreak(featureIndex, p2);

      if (v1 < v2 + 0.01) {
        sum += int(pow(2.0, float(7 - i)));
      }
    }
    setOutput(float(sum));
  }
`}),VG[t]}var UG={kernelName:`ComputeFreakDescriptors`,backendName:`webgl`,kernelFunc:e=>{let{extremaFreaks:t,positionT:n}=e.inputs,{backend:r}=e,i=HG(t);return r.runWebGLProgram(i,[t,n],`int32`)}},WG={};function GG(e,t){let n=`${e}|${t}`;if(!WG.hasOwnProperty(n)){let r=[],i=`float getPixel(int octave, int y, int x) {`;for(let t=1;t<e;t++)r.push(`image`+t),i+=`
				if (octave == ${t}) {
					return getImage${t}(y, x);
				}
			`;i+=`}`,WG[n]={variableNames:[...r,`extrema`],outputShape:[t,3,3],userCode:`
			${i}
		
			void main() {
				ivec3 coords = getOutputCoords();
				int featureIndex = coords[0];
				float score = getExtrema(featureIndex, 0);
				if (score == 0.0) {
					return;
				}
		
				int dy = coords[1]-1;
				int dx = coords[2]-1;
				int octave = int(getExtrema(featureIndex, 1));
				int y = int(getExtrema(featureIndex, 2));
				int x = int(getExtrema(featureIndex, 3));
				setOutput(getPixel(octave, y+dy, x+dx));
			}
			`}}return WG[n]}var KG={kernelName:`ComputeLocalization`,backendName:`webgl`,kernelFunc:e=>{let{prunedExtremasList:t,dogPyramidImagesT:n}=e.inputs,r=e.backend,i=GG(n.length,t.length),a=ua(t,[t.length,t[0].length],`int32`);return r.runWebGLProgram(i,[...n.slice(1),a],n[0].dtype)}},qG=.159154943091895,JG=36,YG={};function XG(e,t,n){let r=`${n}|${e.shape[0]}|${t.shape[0]}`;if(!YG.hasOwnProperty(r)){let i=[];for(let e=1;e<n;e++)i.push(`image`+e);let a=`float getPixel(int octave, int y, int x) {`;for(let e=1;e<n;e++)a+=`
            if (octave == ${e}) {
                return getImage${e}(y, x);
            }
            `;a+=`}`,YG[r]=[{variableNames:[...i,`extrema`,`radial`],outputShape:[e.shape[0],t.shape[0],2],userCode:`
                ${a}

                void main() {
                    ivec3 coords = getOutputCoords();
                    int featureIndex = coords[0];
                    int radialIndex = coords[1];
                    int propertyIndex = coords[2];

                    int radialY = int(getRadial(radialIndex, 0));
                    int radialX = int(getRadial(radialIndex, 1));
                    float radialW = getRadial(radialIndex, 2);

                    int octave = int(getExtrema(featureIndex, 1));
                    int y = int(getExtrema(featureIndex, 2));
                    int x = int(getExtrema(featureIndex, 3));

                    int xp = x + radialX;
                    int yp = y + radialY;

                    float dy = getPixel(octave, yp+1, xp) - getPixel(octave, yp-1, xp);
                    float dx = getPixel(octave, yp, xp+1) - getPixel(octave, yp, xp-1);

                    if (propertyIndex == 0) {
                    // be careful that atan(0, 0) gives 1.57 instead of 0 (different from js), but doesn't matter here, coz magnitude is 0
                    
                    float angle = atan(dy, dx) + ${Math.PI};
                    float fbin = angle * ${JG}. * ${qG};
                    setOutput(fbin);
                    return;
                    }

                    if (propertyIndex == 1) {
                        float mag = sqrt(dx * dx + dy * dy);
                        float magnitude = radialW * mag;
                        setOutput(magnitude);
                        return;
                    }
                }

                `},{variableNames:[`fbinMag`],outputShape:[e.shape[0],JG],userCode:`
            void main() {
                ivec2 coords = getOutputCoords();
                int featureIndex = coords[0];
                int binIndex = coords[1];

                float sum = 0.;
                for (int i = 0; i < ${t.shape[0]}; i++) {
                    float fbin = getFbinMag(featureIndex, i, 0);
                    int bin = int(floor(fbin - 0.5));
                    int b1 = imod(bin + ${JG}, ${JG});
                    int b2 = imod(bin + 1 + ${JG}, ${JG});

                    if (b1 == binIndex || b2 == binIndex) {
                        float magnitude = getFbinMag(featureIndex, i, 1);
                        float w2 = fbin - float(bin) - 0.5;
                        float w1 = w2 * -1. + 1.;

                        if (b1 == binIndex) {
                            sum += w1 * magnitude;
                        }
                        if (b2 == binIndex) {
                            sum += w2 * magnitude;
                        }
                    }
                }
                setOutput(sum);
            }
            `}]}return YG[r]}var ZG={kernelName:`ComputeOrientationHistograms`,backendName:`webgl`,kernelFunc:e=>{let{gaussianImagesT:t,prunedExtremasT:n,radialPropertiesT:r,pyramidImagesLength:i}=e.inputs,a=e.backend,[o,s]=XG(n,r,i),c=a.runWebGLProgram(o,[...t,n,r],r.dtype),l=a.runWebGLProgram(s,[c],r.dtype);return a.disposeIntermediateTensorInfo(c),l}},QG={};function $G(e){let t=e.shape[1],n=e.shape[0],r=`w`+t+`h`+n;return QG.hasOwnProperty(r)||(QG[r]={variableNames:[`p`],outputShape:[Math.floor(n/2),Math.floor(t/2)],userCode:`
            void main() {
                ivec2 coords = getOutputCoords();
                int y = coords[0] * 2;
                int x = coords[1] * 2;
        
                float sum = getP(y, x) * 0.25;
                sum += getP(y+1,x) * 0.25; 
                sum += getP(y, x+1) * 0.25; 
                sum += getP(y+1,x+1) * 0.25;
                setOutput(sum);
            }
            `}),QG[r]}var eK={kernelName:`DownsampleBilinear`,backendName:`webgl`,kernelFunc:e=>{let t=e.inputs.image,n=e.backend,r=$G(t);return n.runWebGLProgram(r,[t],t.dtype)}},tK={kernelName:`ExtremaReduction`,backendName:`webgl`,kernelFunc:e=>{let{extremasResultT:t}=e.inputs,n=e.backend,r=t.shape[0],i=t.shape[1],a={variableNames:[`extrema`],outputShape:[Math.floor(r/2),Math.floor(i/2)],userCode:`
		  void main() {
			ivec2 coords = getOutputCoords();
			int y = coords[0] * 2;
			int x = coords[1] * 2;
  
			float location = 0.0;
			float values = getExtrema(y, x);
  
			if (getExtrema(y+1, x) != 0.0) {
			  location = 1.0;
		  values = getExtrema(y+1, x);
			}
			else if (getExtrema(y, x+1) != 0.0) {
			  location = 2.0;
		  values = getExtrema(y, x+1);
			}
			else if (getExtrema(y+1, x+1) != 0.0) {
			  location = 3.0;
		  values = getExtrema(y+1, x+1);
			}
  
			if (values < 0.0) {
			  setOutput(location * -1000.0 + values);
			} else {
			  setOutput(location * 1000.0 + values);
			}
		  }
		`};return n.runWebGLProgram(a,[t],t.dtype)}},nK=36,rK=5,iK={};function aK(e){let t=`h${e.shape[0]}`;return iK.hasOwnProperty(t)||(iK[t]={variableNames:[`histogram`],outputShape:[e.shape[0],nK],userCode:`
            void main() {
                ivec2 coords = getOutputCoords();

                int featureIndex = coords[0];
                int binIndex = coords[1];

                int prevBin = imod(binIndex - 1 + ${nK}, ${nK});
                int nextBin = imod(binIndex + 1, ${nK});
                float result = 0.274068619061197 * getHistogram(featureIndex, prevBin) + 0.451862761877606 * getHistogram(featureIndex, binIndex) + 0.274068619061197 * getHistogram(featureIndex, nextBin);

                setOutput(result);
            }
            `}),iK[t]}var oK={kernelName:`SmoothHistograms`,backendName:`webgl`,kernelFunc:e=>{let{histograms:t}=e.inputs,n=e.backend,r=aK(t);for(let e=0;e<rK;e++){let i=t;t=n.runWebGLProgram(r,[t],t.dtype),e>0&&n.disposeIntermediateTensorInfo(i)}return t}},sK={};function cK(e,t){let n=t.shape[1],r=t.shape[0],i=`w`+n+`h`+r;return sK.hasOwnProperty(i)||(sK[i]={variableNames:[`p`],outputShape:[r,n],userCode:`
              void main() {
                ivec2 coords = getOutputCoords();
                int j = coords[0];
                int i = coords[1];
        
                float sj = 0.5 * float(j) - 0.25; 
                float si = 0.5 * float(i) - 0.25;
        
                float sj0 = floor(sj);
                float sj1 = ceil(sj);
                float si0 = floor(si);
                float si1 = ceil(si);
        
                int sj0I = int(sj0);
                int sj1I = int(sj1);
                int si0I = int(si0);
                int si1I = int(si1);
        
                float sum = 0.0;
                sum += getP(sj0I, si0I) * (si1 - si) * (sj1 - sj);
                sum += getP(sj1I, si0I) * (si1 - si) * (sj - sj0);
                sum += getP(sj0I, si1I) * (si - si0) * (sj1 - sj);
                sum += getP(sj1I, si1I) * (si - si0) * (sj - sj0);
                setOutput(sum);
              }
            `}),sK[i]}Nr(wG),Nr(AG),Nr(PG),Nr(RG),Nr(UG),Nr(KG),Nr(ZG),Nr(eK),Nr(tK),Nr(oK),Nr({kernelName:`UpsampleBilinear`,backendName:`webgl`,kernelFunc:e=>{let{image:t,targetImage:n}=e.inputs,r=e.backend,i=cK(t,n);return r.runWebGLProgram(i,[t],t.dtype)}});var lK=8,uK=5,dK=10,fK=5,pK=3,mK=1.5,hK=(xG.length-1)*xG.length/2,gK=class{constructor(e,t,n=!1){this.debugMode=n,this.width=e,this.height=t;let r=0;for(;e>=lK&&t>=lK&&(e/=2,t/=2,r++,r!==uK););this.numOctaves=r,this.tensorCaches={},this.kernelCaches={}}detectImageData(e){let t=new Uint8ClampedArray(4*e.length);for(let n=0;n<e.length;n++)t[4*n]=e[n],t[4*n+1]=e[n],t[4*n+2]=e[n],t[4*n+3]=255;let n=new ImageData(t,this.width,this.height);return this.detect(n)}detect(e){let t=null,n=[];for(let t=0;t<this.numOctaves;t++){let r,i;r=t===0?this._applyFilter(e):this._downsampleBilinear(n[t-1][n[t-1].length-1]),i=this._applyFilter(r),n.push([r,i])}let r=[];for(let e=0;e<this.numOctaves;e++){let t=this._differenceImageBinomial(n[e][0],n[e][1]);r.push(t)}let i=[];for(let e=1;e<this.numOctaves-1;e++){let t=this._buildExtremas(r[e-1],r[e],r[e+1]);i.push(t)}let a=this._applyPrune(i),o=this._computeLocalization(a,r),s=this._computeOrientationHistograms(o,n),c=this._smoothHistograms(s),l=this._computeExtremaAngles(c),u=this._computeExtremaFreak(n,o,l),d=this._computeFreakDescriptors(u),f=o.arraySync(),p=l.arraySync(),m=d.arraySync();this.debugMode&&(t={pyramidImages:n.map(e=>e.map(e=>e.arraySync())),dogPyramidImages:r.map(e=>e?e.arraySync():null),extremasResults:i.map(e=>e.arraySync()),extremaAngles:l.arraySync(),prunedExtremas:a,localizedExtremas:o.arraySync()}),n.forEach(e=>e.forEach(e=>e.dispose())),r.forEach(e=>e&&e.dispose()),i.forEach(e=>e.dispose()),o.dispose(),s.dispose(),c.dispose(),l.dispose(),u.dispose(),d.dispose();let h=[];for(let e=0;e<f.length;e++){if(f[e][0]==0)continue;let t=[];for(let n=0;n<m[e].length;n+=4){let r=m[e][n],i=m[e][n+1],a=m[e][n+2],o=m[e][n+3],s=r*16777216+i*65536+a*256+o;t.push(s)}let n=f[e][1],r=f[e][2],i=f[e][3]*2**n+2**(n-1)-.5,a=r*2**n+2**(n-1)-.5,o=2**n;h.push({maxima:f[e][0]>0,x:i,y:a,scale:o,angle:p[e],descriptors:t})}return{featurePoints:h,debugExtra:t}}_computeFreakDescriptors(e){if(!this.tensorCaches.computeFreakDescriptors){let t=[],n=[];for(let r=0;r<e.shape[1];r++)for(let i=r+1;i<e.shape[1];i++)t.push(r),n.push(i);let r=ua(t,[t.length]).cast(`int32`),i=ua(n,[n.length]).cast(`int32`);this.tensorCaches.computeFreakDescriptors={positionT:ha(ff([r,i],1))}}let{positionT:t}=this.tensorCaches.computeFreakDescriptors;return Math.ceil(hK/8),P(()=>pa().runKernel(`ComputeFreakDescriptors`,{extremaFreaks:e,positionT:t}))}_computeExtremaFreak(e,t,n){this.tensorCaches._computeExtremaFreak||P(()=>{let e=ua(xG);this.tensorCaches._computeExtremaFreak={freakPointsT:ha(e)}});let{freakPointsT:r}=this.tensorCaches._computeExtremaFreak,i=[];for(let t=1;t<e.length;t++)i.push(e[t][1]);return P(()=>pa().runKernel(`ComputeExtremaFreak`,{gaussianImagesT:i,prunedExtremas:t,prunedExtremasAngles:n,freakPointsT:r,pyramidImagesLength:e.length}))}_computeExtremaAngles(e){return P(()=>pa().runKernel(`ComputeExtremaAngles`,{histograms:e}))}_computeOrientationHistograms(e,t){let n=[];for(let e=1;e<t.length;e++)n.push(t[e][1]);this.tensorCaches.orientationHistograms||P(()=>{let e=pK*mK,t=Math.ceil(e),n=[];for(let r=-5;r<=t;r++)for(let i=-5;i<=t;i++){let t=i*i+r*r;if(t<=e*e){let e=t*-.05555555555555555,a=(720+e*(720+e*(360+e*(120+e*(30+e*(6+e))))))*.0013888888;n.push([r,i,a])}}this.tensorCaches.orientationHistograms={radialPropertiesT:ha(ua(n,[n.length,3]))}});let{radialPropertiesT:r}=this.tensorCaches.orientationHistograms;return P(()=>pa().runKernel(`ComputeOrientationHistograms`,{gaussianImagesT:n,prunedExtremasT:e,radialPropertiesT:r,pyramidImagesLength:t.length}))}_smoothHistograms(e){return P(()=>pa().runKernel(`SmoothHistograms`,{histograms:e}))}_computeLocalization(e,t){return P(()=>{let n=pa().runKernel(`ComputeLocalization`,{prunedExtremasList:e,dogPyramidImagesT:t}).arraySync(),r=[];for(let e=0;e<n.length;e++){r.push([]);for(let t=0;t<n[e].length;t++)r[e].push([])}let i=[];for(let t=0;t<e.length;t++)i[t]=[e[t][0],e[t][1],e[t][2],e[t][3]];for(let e=0;e<i.length;e++){if(i[e][0]===0)continue;let t=n[e],r=.5*(t[1][2]-t[1][0]),a=.5*(t[2][1]-t[0][1]),o=t[1][2]+t[1][0]-2*t[1][1],s=t[2][1]+t[0][1]-2*t[1][1],c=.25*(t[0][0]+t[2][2]-t[0][2]-t[2][0]),l=o*s-c*c,u=(s*-r+-c*-a)/l,d=(-c*-r+o*-a)/l,f=i[e][2]+d,p=i[e][3]+u;Math.abs(l)<1e-4||(i[e][2]=f,i[e][3]=p)}return ua(i,[i.length,i[0].length],`float32`)})}_applyPrune(e){let t=fK,n=[],r=[];for(let e=0;e<100;e++){r.push([]),n.push([]);for(let i=0;i<t;i++)r[e].push([0,0,0,0]),n[e].push(0)}P(()=>{for(let i=0;i<e.length;i++){let a=pa().runKernel(`ExtremaReduction`,{extremasResultT:e[i]}),o=i+1,s=a.arraySync(),c=a.shape[0],l=a.shape[1],u=l*2/dK,d=c*2/dK;for(let e=0;e<c;e++)for(let i=0;i<l;i++){let a=s[e][i];if(a==0)continue;let c=a%1e3,l=Math.floor(Math.abs(a)/1e3),f=i*2+ +(l===2||l===3),p=e*2+ +(l===1||l===3),m=Math.floor(f/u),h=Math.floor(p/d)*dK+m,g=Math.abs(c),_=t;for(;_>=1&&g>n[h][_-1];)--_;if(_<t){for(let e=4;e>=_+1;e--)n[h][e]=n[h][e-1],r[h][e][0]=r[h][e-1][0],r[h][e][1]=r[h][e-1][1],r[h][e][2]=r[h][e-1][2],r[h][e][3]=r[h][e-1][3];n[h][_]=g,r[h][_][0]=c,r[h][_][1]=o,r[h][_][2]=p,r[h][_][3]=f}}}});let i=[];for(let e=0;e<100;e++)for(let n=0;n<t;n++)i.push(r[e][n]);return i}_buildExtremas(e,t,n){return P(()=>pa().runKernel(`BuildExtremas`,{image0:e,image1:t,image2:n}))}_differenceImageBinomial(e,t){return P(()=>e.sub(t))}_applyFilter(e){return P(()=>pa().runKernel(`BinomialFilter`,{image:e}))}_downsampleBilinear(e){return P(()=>pa().runKernel(`DownsampleBilinear`,{image:e}))}_compileAndRun(e,t){let n=_a().compileAndRun(e,t);return pa().makeTensorFromDataId(n.dataId,n.shape,n.dtype)}_runWebGLProgram(e,t,n){let r=_a().runWebGLProgram(e,t,n);return pa().makeTensorFromDataId(r.dataId,r.shape,r.dtype)}},_K=({image:e,ratio:t})=>{let n=Math.round(e.width*t),r=Math.round(e.height*t),i=new Uint8Array(n*r);for(let a=0;a<n;a++){let o=Math.round(1*a/t),s=Math.round(1*(a+1)/t)-1;s>=e.width&&(s=e.width-1);for(let c=0;c<r;c++){let r=Math.round(1*c/t),l=Math.round(1*(c+1)/t)-1;l>=e.height&&(l=e.height-1);let u=0,d=0;for(let t=o;t<=s;t++)for(let n=r;n<=l;n++)u+=1*e.data[n*e.width+t],d+=1;i[c*n+a]=Math.floor(u/d)}}return{data:i,width:n,height:r}},vK=100,yK=e=>{let t=vK/Math.min(e.width,e.height),n=[],r=t;for(;;)if(n.push(r),r*=2**(1/3),r>=.95){r=1;break}n.push(r),n.reverse();let i=[];for(let t=0;t<n.length;t++)e.width*n[t],e.height*n[t],i.push(Object.assign(_K({image:e,ratio:n[t]}),{scale:n[t]}));return i},bK=e=>{let t=Math.min(e.width,e.height),n=[],r=[];n.push(256/t),n.push(128/t);for(let t=0;t<n.length;t++)r.push(Object.assign(_K({image:e,ratio:n[t]}),{scale:n[t]}));return r},xK=e=>{let{v1:t,v2:n}=e,r=0;for(let e=0;e<t.length;e++){let i=(t[e]^n[e])>>>0;r+=SK(i)}return r},SK=e=>{var t=e-(e>>1&1431655765);return t=(t>>2&858993459)+(t&858993459),t=(t>>4)+t&252645135,t=(t>>8)+t&16711935,t=(t>>16)+t&65535,t},CK=1234,wK=()=>({seed:CK,arrayShuffle(e){let{arr:t,sampleSize:n}=e;for(let e=0;e<n;e++){this.seed=(214013*this.seed+2531011)%(1<<31);let n=this.seed>>16&32767;n%=t.length;let r=t[e];t[e]=t[n],t[n]=r}},nextInt(e){this.seed=(214013*this.seed+2531011)%(1<<31);let t=this.seed>>16&32767;return t%=e,t}}),TK=16,EK=128,DK=8,OK=e=>{let{points:t,pointIndexes:n,randomizer:r}=e,i=[];for(let e=0;e<n.length;e++)i.push(e);let a=2**53-1,o=-1,s=[];for(let e=0;e<EK;e++){r.arrayShuffle({arr:i,sampleSize:DK});let c=0,l=[];for(let e=0;e<n.length;e++){let r=2**53-1;for(let a=0;a<DK;a++){let o=n[i[a]],s=xK({v1:t[n[e]].descriptors,v2:t[o].descriptors});s<r&&(l[e]=i[a],r=s)}c+=r}s.push(l),c<a&&(a=c,o=e)}return s[o]},kK=({points:e})=>{let t=[];for(let n=0;n<e.length;n++)t.push(n);return{rootNode:AK({points:e,pointIndexes:t,centerPointIndex:null,randomizer:wK()})}},AK=e=>{let{points:t,pointIndexes:n,centerPointIndex:r,randomizer:i}=e,a=!1;(n.length<=DK||n.length<=TK)&&(a=!0);let o={};if(!a){let e=OK({points:t,pointIndexes:n,randomizer:i});for(let t=0;t<e.length;t++)o[n[e[t]]]===void 0&&(o[n[e[t]]]=[]),o[n[e[t]]].push(n[t])}Object.keys(o).length===1&&(a=!0);let s={centerPointIndex:r};if(a){s.leaf=!0,s.pointIndexes=[];for(let e=0;e<n.length;e++)s.pointIndexes.push(n[e]);return s}return s.leaf=!1,s.children=[],Object.keys(o).forEach(e=>{s.children.push(AK({points:t,pointIndexes:o[e],centerPointIndex:e,randomizer:i}))}),s},jK=4294967295;function MK(e,t,n){var r=n/4294967296,i=n;e.setUint32(t,r),e.setUint32(t+4,i)}function NK(e,t,n){var r=Math.floor(n/4294967296),i=n;e.setUint32(t,r),e.setUint32(t+4,i)}function PK(e,t){var n=e.getInt32(t),r=e.getUint32(t+4);return n*4294967296+r}function FK(e,t){var n=e.getUint32(t),r=e.getUint32(t+4);return n*4294967296+r}var IK=(typeof process>`u`||(process==null?void 0:{})?.TEXT_ENCODING!==`never`)&&typeof TextEncoder<`u`&&typeof TextDecoder<`u`;function LK(e){for(var t=e.length,n=0,r=0;r<t;){var i=e.charCodeAt(r++);if(!(i&4294967168)){n++;continue}if(!(i&4294965248))n+=2;else{if(i>=55296&&i<=56319&&r<t){var a=e.charCodeAt(r);(a&64512)==56320&&(++r,i=((i&1023)<<10)+(a&1023)+65536)}i&4294901760?n+=4:n+=3}}return n}function RK(e,t,n){for(var r=e.length,i=n,a=0;a<r;){var o=e.charCodeAt(a++);if(!(o&4294967168)){t[i++]=o;continue}if(!(o&4294965248))t[i++]=o>>6&31|192;else{if(o>=55296&&o<=56319&&a<r){var s=e.charCodeAt(a);(s&64512)==56320&&(++a,o=((o&1023)<<10)+(s&1023)+65536)}o&4294901760?(t[i++]=o>>18&7|240,t[i++]=o>>12&63|128,t[i++]=o>>6&63|128):(t[i++]=o>>12&15|224,t[i++]=o>>6&63|128)}t[i++]=o&63|128}}var zK=IK?new TextEncoder:void 0,BK=IK?typeof process<`u`&&(process==null?void 0:{})?.TEXT_ENCODING!==`force`?200:0:jK;function VK(e,t,n){t.set(zK.encode(e),n)}function HK(e,t,n){zK.encodeInto(e,t.subarray(n))}var UK=zK?.encodeInto?HK:VK,WK=4096;function GK(e,t,n){for(var r=t,i=r+n,a=[],o=``;r<i;){var s=e[r++];if(!(s&128))a.push(s);else if((s&224)==192){var c=e[r++]&63;a.push((s&31)<<6|c)}else if((s&240)==224){var c=e[r++]&63,l=e[r++]&63;a.push((s&31)<<12|c<<6|l)}else if((s&248)==240){var c=e[r++]&63,l=e[r++]&63,u=e[r++]&63,d=(s&7)<<18|c<<12|l<<6|u;d>65535&&(d-=65536,a.push(d>>>10&1023|55296),d=56320|d&1023),a.push(d)}else a.push(s);a.length>=WK&&(o+=String.fromCharCode.apply(String,a),a.length=0)}return a.length>0&&(o+=String.fromCharCode.apply(String,a)),o}var KK=IK?new TextDecoder:null,qK=IK?typeof process<`u`&&(process==null?void 0:{})?.TEXT_DECODER!==`force`?200:0:jK;function JK(e,t,n){var r=e.subarray(t,t+n);return KK.decode(r)}var YK=function(){function e(e,t){this.type=e,this.data=t}return e}(),XK=(function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){if(typeof n!=`function`&&n!==null)throw TypeError(`Class extends value `+String(n)+` is not a constructor or null`);e(t,n);function r(){this.constructor=t}t.prototype=n===null?Object.create(n):(r.prototype=n.prototype,new r)}})(),ZK=function(e){XK(t,e);function t(n){var r=e.call(this,n)||this,i=Object.create(t.prototype);return Object.setPrototypeOf(r,i),Object.defineProperty(r,"name",{configurable:!0,enumerable:!1,value:t.name}),r}return t}(Error),QK=4294967295,$K=17179869183;function eq(e){var t=e.sec,n=e.nsec;if(t>=0&&n>=0&&t<=$K)if(n===0&&t<=QK){var r=new Uint8Array(4),i=new DataView(r.buffer);return i.setUint32(0,t),r}else{var a=t/4294967296,o=t&4294967295,r=new Uint8Array(8),i=new DataView(r.buffer);return i.setUint32(0,n<<2|a&3),i.setUint32(4,o),r}var r=new Uint8Array(12),i=new DataView(r.buffer);return i.setUint32(0,n),NK(i,4,t),r}function tq(e){var t=e.getTime(),n=Math.floor(t/1e3),r=(t-n*1e3)*1e6,i=Math.floor(r/1e9);return{sec:n+i,nsec:r-i*1e9}}function nq(e){return e instanceof Date?eq(tq(e)):null}function rq(e){var t=new DataView(e.buffer,e.byteOffset,e.byteLength);switch(e.byteLength){case 4:var n=t.getUint32(0),r=0;return{sec:n,nsec:r};case 8:var i=t.getUint32(0),a=t.getUint32(4),n=(i&3)*4294967296+a,r=i>>>2;return{sec:n,nsec:r};case 12:var n=PK(t,4),r=t.getUint32(0);return{sec:n,nsec:r};default:throw new ZK(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${e.length}`)}}function iq(e){var t=rq(e);return new Date(t.sec*1e3+t.nsec/1e6)}var aq={type:-1,encode:nq,decode:iq},oq=function(){function e(){this.builtInEncoders=[],this.builtInDecoders=[],this.encoders=[],this.decoders=[],this.register(aq)}return e.prototype.register=function(e){var t=e.type,n=e.encode,r=e.decode;if(t>=0)this.encoders[t]=n,this.decoders[t]=r;else{var i=1+t;this.builtInEncoders[i]=n,this.builtInDecoders[i]=r}},e.prototype.tryToEncode=function(e,t){for(var n=0;n<this.builtInEncoders.length;n++){var r=this.builtInEncoders[n];if(r!=null){var i=r(e,t);if(i!=null){var a=-1-n;return new YK(a,i)}}}for(var n=0;n<this.encoders.length;n++){var r=this.encoders[n];if(r!=null){var i=r(e,t);if(i!=null){var a=n;return new YK(a,i)}}}return e instanceof YK?e:null},e.prototype.decode=function(e,t,n){var r=t<0?this.builtInDecoders[-1-t]:this.decoders[t];return r?r(e,t,n):new YK(t,e)},e.defaultCodec=new e,e}();function sq(e){return e instanceof Uint8Array?e:ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):e instanceof ArrayBuffer?new Uint8Array(e):Uint8Array.from(e)}function cq(e){if(e instanceof ArrayBuffer)return new DataView(e);var t=sq(e);return new DataView(t.buffer,t.byteOffset,t.byteLength)}var lq=2048,uq=function(){function e(e,t,n,r,i,a,o,s){e===void 0&&(e=oq.defaultCodec),t===void 0&&(t=void 0),n===void 0&&(n=100),r===void 0&&(r=lq),i===void 0&&(i=!1),a===void 0&&(a=!1),o===void 0&&(o=!1),s===void 0&&(s=!1),this.extensionCodec=e,this.context=t,this.maxDepth=n,this.initialBufferSize=r,this.sortKeys=i,this.forceFloat32=a,this.ignoreUndefined=o,this.forceIntegerToFloat=s,this.pos=0,this.view=new DataView(new ArrayBuffer(this.initialBufferSize)),this.bytes=new Uint8Array(this.view.buffer)}return e.prototype.reinitializeState=function(){this.pos=0},e.prototype.encodeSharedRef=function(e){return this.reinitializeState(),this.doEncode(e,1),this.bytes.subarray(0,this.pos)},e.prototype.encode=function(e){return this.reinitializeState(),this.doEncode(e,1),this.bytes.slice(0,this.pos)},e.prototype.doEncode=function(e,t){if(t>this.maxDepth)throw Error(`Too deep objects in depth ${t}`);e==null?this.encodeNil():typeof e==`boolean`?this.encodeBoolean(e):typeof e==`number`?this.encodeNumber(e):typeof e==`string`?this.encodeString(e):this.encodeObject(e,t)},e.prototype.ensureBufferSizeToWrite=function(e){var t=this.pos+e;this.view.byteLength<t&&this.resizeBuffer(t*2)},e.prototype.resizeBuffer=function(e){var t=new ArrayBuffer(e),n=new Uint8Array(t),r=new DataView(t);n.set(this.bytes),this.view=r,this.bytes=n},e.prototype.encodeNil=function(){this.writeU8(192)},e.prototype.encodeBoolean=function(e){e===!1?this.writeU8(194):this.writeU8(195)},e.prototype.encodeNumber=function(e){Number.isSafeInteger(e)&&!this.forceIntegerToFloat?e>=0?e<128?this.writeU8(e):e<256?(this.writeU8(204),this.writeU8(e)):e<65536?(this.writeU8(205),this.writeU16(e)):e<4294967296?(this.writeU8(206),this.writeU32(e)):(this.writeU8(207),this.writeU64(e)):e>=-32?this.writeU8(224|e+32):e>=-128?(this.writeU8(208),this.writeI8(e)):e>=-32768?(this.writeU8(209),this.writeI16(e)):e>=-2147483648?(this.writeU8(210),this.writeI32(e)):(this.writeU8(211),this.writeI64(e)):this.forceFloat32?(this.writeU8(202),this.writeF32(e)):(this.writeU8(203),this.writeF64(e))},e.prototype.writeStringHeader=function(e){if(e<32)this.writeU8(160+e);else if(e<256)this.writeU8(217),this.writeU8(e);else if(e<65536)this.writeU8(218),this.writeU16(e);else if(e<4294967296)this.writeU8(219),this.writeU32(e);else throw Error(`Too long string: ${e} bytes in UTF-8`)},e.prototype.encodeString=function(e){var t=5;if(e.length>BK){var n=LK(e);this.ensureBufferSizeToWrite(t+n),this.writeStringHeader(n),UK(e,this.bytes,this.pos),this.pos+=n}else{var n=LK(e);this.ensureBufferSizeToWrite(t+n),this.writeStringHeader(n),RK(e,this.bytes,this.pos),this.pos+=n}},e.prototype.encodeObject=function(e,t){var n=this.extensionCodec.tryToEncode(e,this.context);if(n!=null)this.encodeExtension(n);else if(Array.isArray(e))this.encodeArray(e,t);else if(ArrayBuffer.isView(e))this.encodeBinary(e);else if(typeof e==`object`)this.encodeMap(e,t);else throw Error(`Unrecognized object: ${Object.prototype.toString.apply(e)}`)},e.prototype.encodeBinary=function(e){var t=e.byteLength;if(t<256)this.writeU8(196),this.writeU8(t);else if(t<65536)this.writeU8(197),this.writeU16(t);else if(t<4294967296)this.writeU8(198),this.writeU32(t);else throw Error(`Too large binary: ${t}`);var n=sq(e);this.writeU8a(n)},e.prototype.encodeArray=function(e,t){var n=e.length;if(n<16)this.writeU8(144+n);else if(n<65536)this.writeU8(220),this.writeU16(n);else if(n<4294967296)this.writeU8(221),this.writeU32(n);else throw Error(`Too large array: ${n}`);for(var r=0,i=e;r<i.length;r++){var a=i[r];this.doEncode(a,t+1)}},e.prototype.countWithoutUndefined=function(e,t){for(var n=0,r=0,i=t;r<i.length;r++)e[i[r]]!==void 0&&n++;return n},e.prototype.encodeMap=function(e,t){var n=Object.keys(e);this.sortKeys&&n.sort();var r=this.ignoreUndefined?this.countWithoutUndefined(e,n):n.length;if(r<16)this.writeU8(128+r);else if(r<65536)this.writeU8(222),this.writeU16(r);else if(r<4294967296)this.writeU8(223),this.writeU32(r);else throw Error(`Too large map object: ${r}`);for(var i=0,a=n;i<a.length;i++){var o=a[i],s=e[o];this.ignoreUndefined&&s===void 0||(this.encodeString(o),this.doEncode(s,t+1))}},e.prototype.encodeExtension=function(e){var t=e.data.length;if(t===1)this.writeU8(212);else if(t===2)this.writeU8(213);else if(t===4)this.writeU8(214);else if(t===8)this.writeU8(215);else if(t===16)this.writeU8(216);else if(t<256)this.writeU8(199),this.writeU8(t);else if(t<65536)this.writeU8(200),this.writeU16(t);else if(t<4294967296)this.writeU8(201),this.writeU32(t);else throw Error(`Too large extension object: ${t}`);this.writeI8(e.type),this.writeU8a(e.data)},e.prototype.writeU8=function(e){this.ensureBufferSizeToWrite(1),this.view.setUint8(this.pos,e),this.pos++},e.prototype.writeU8a=function(e){var t=e.length;this.ensureBufferSizeToWrite(t),this.bytes.set(e,this.pos),this.pos+=t},e.prototype.writeI8=function(e){this.ensureBufferSizeToWrite(1),this.view.setInt8(this.pos,e),this.pos++},e.prototype.writeU16=function(e){this.ensureBufferSizeToWrite(2),this.view.setUint16(this.pos,e),this.pos+=2},e.prototype.writeI16=function(e){this.ensureBufferSizeToWrite(2),this.view.setInt16(this.pos,e),this.pos+=2},e.prototype.writeU32=function(e){this.ensureBufferSizeToWrite(4),this.view.setUint32(this.pos,e),this.pos+=4},e.prototype.writeI32=function(e){this.ensureBufferSizeToWrite(4),this.view.setInt32(this.pos,e),this.pos+=4},e.prototype.writeF32=function(e){this.ensureBufferSizeToWrite(4),this.view.setFloat32(this.pos,e),this.pos+=4},e.prototype.writeF64=function(e){this.ensureBufferSizeToWrite(8),this.view.setFloat64(this.pos,e),this.pos+=8},e.prototype.writeU64=function(e){this.ensureBufferSizeToWrite(8),MK(this.view,this.pos,e),this.pos+=8},e.prototype.writeI64=function(e){this.ensureBufferSizeToWrite(8),NK(this.view,this.pos,e),this.pos+=8},e}(),dq={};function fq(e,t){return t===void 0&&(t=dq),new uq(t.extensionCodec,t.context,t.maxDepth,t.initialBufferSize,t.sortKeys,t.forceFloat32,t.ignoreUndefined,t.forceIntegerToFloat).encodeSharedRef(e)}function pq(e){return`${e<0?`-`:``}0x${Math.abs(e).toString(16).padStart(2,`0`)}`}var mq=16,hq=16,gq=function(){function e(e,t){e===void 0&&(e=mq),t===void 0&&(t=hq),this.maxKeyLength=e,this.maxLengthPerKey=t,this.hit=0,this.miss=0,this.caches=[];for(var n=0;n<this.maxKeyLength;n++)this.caches.push([])}return e.prototype.canBeCached=function(e){return e>0&&e<=this.maxKeyLength},e.prototype.find=function(e,t,n){var r=this.caches[n-1];FIND_CHUNK:for(var i=0,a=r;i<a.length;i++){for(var o=a[i],s=o.bytes,c=0;c<n;c++)if(s[c]!==e[t+c])continue FIND_CHUNK;return o.str}return null},e.prototype.store=function(e,t){var n=this.caches[e.length-1],r={bytes:e,str:t};n.length>=this.maxLengthPerKey?n[Math.random()*n.length|0]=r:n.push(r)},e.prototype.decode=function(e,t,n){var r=this.find(e,t,n);if(r!=null)return this.hit++,r;this.miss++;var i=GK(e,t,n),a=Uint8Array.prototype.slice.call(e,t,t+n);return this.store(a,i),i},e}(),_q=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},vq=function(e,t){var n={label:0,sent:function(){if(a[0]&1)throw a[1];return a[1]},trys:[],ops:[]},r,i,a,o;return o={next:s(0),throw:s(1),return:s(2)},typeof Symbol==`function`&&(o[Symbol.iterator]=function(){return this}),o;function s(e){return function(t){return c([e,t])}}function c(o){if(r)throw TypeError(`Generator is already executing.`);for(;n;)try{if(r=1,i&&(a=o[0]&2?i.return:o[0]?i.throw||((a=i.return)&&a.call(i),0):i.next)&&!(a=a.call(i,o[1])).done)return a;switch(i=0,a&&(o=[o[0]&2,a.value]),o[0]){case 0:case 1:a=o;break;case 4:return n.label++,{value:o[1],done:!1};case 5:n.label++,i=o[1],o=[0];continue;case 7:o=n.ops.pop(),n.trys.pop();continue;default:if(a=n.trys,!(a=a.length>0&&a[a.length-1])&&(o[0]===6||o[0]===2)){n=0;continue}if(o[0]===3&&(!a||o[1]>a[0]&&o[1]<a[3])){n.label=o[1];break}if(o[0]===6&&n.label<a[1]){n.label=a[1],a=o;break}if(a&&n.label<a[2]){n.label=a[2],n.ops.push(o);break}a[2]&&n.ops.pop(),n.trys.pop();continue}o=t.call(e,n)}catch(e){o=[6,e],i=0}finally{r=a=0}if(o[0]&5)throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}},yq=function(e){if(!Symbol.asyncIterator)throw TypeError(`Symbol.asyncIterator is not defined.`);var t=e[Symbol.asyncIterator],n;return t?t.call(e):(e=typeof __values==`function`?__values(e):e[Symbol.iterator](),n={},r(`next`),r(`throw`),r(`return`),n[Symbol.asyncIterator]=function(){return this},n);function r(t){n[t]=e[t]&&function(n){return new Promise(function(r,a){n=e[t](n),i(r,a,n.done,n.value)})}}function i(e,t,n,r){Promise.resolve(r).then(function(t){e({value:t,done:n})},t)}},bq=function(e){return this instanceof bq?(this.v=e,this):new bq(e)},xq=function(e,t,n){if(!Symbol.asyncIterator)throw TypeError(`Symbol.asyncIterator is not defined.`);var r=n.apply(e,t||[]),i,a=[];return i={},o(`next`),o(`throw`),o(`return`),i[Symbol.asyncIterator]=function(){return this},i;function o(e){r[e]&&(i[e]=function(t){return new Promise(function(n,r){a.push([e,t,n,r])>1||s(e,t)})})}function s(e,t){try{c(r[e](t))}catch(e){d(a[0][3],e)}}function c(e){e.value instanceof bq?Promise.resolve(e.value.v).then(l,u):d(a[0][2],e)}function l(e){s(`next`,e)}function u(e){s(`throw`,e)}function d(e,t){e(t),a.shift(),a.length&&s(a[0][0],a[0][1])}},Sq=function(e){var t=typeof e;return t===`string`||t===`number`},Cq=-1,wq=new DataView(new ArrayBuffer(0)),Tq=new Uint8Array(wq.buffer),Eq=(function(){try{wq.getInt8(0)}catch(e){return e.constructor}throw Error(`never reached`)})(),Dq=new Eq(`Insufficient data`),Oq=new gq,kq=function(){function e(e,t,n,r,i,a,o,s){e===void 0&&(e=oq.defaultCodec),t===void 0&&(t=void 0),n===void 0&&(n=jK),r===void 0&&(r=jK),i===void 0&&(i=jK),a===void 0&&(a=jK),o===void 0&&(o=jK),s===void 0&&(s=Oq),this.extensionCodec=e,this.context=t,this.maxStrLength=n,this.maxBinLength=r,this.maxArrayLength=i,this.maxMapLength=a,this.maxExtLength=o,this.keyDecoder=s,this.totalPos=0,this.pos=0,this.view=wq,this.bytes=Tq,this.headByte=Cq,this.stack=[]}return e.prototype.reinitializeState=function(){this.totalPos=0,this.headByte=Cq,this.stack.length=0},e.prototype.setBuffer=function(e){this.bytes=sq(e),this.view=cq(this.bytes),this.pos=0},e.prototype.appendBuffer=function(e){if(this.headByte===Cq&&!this.hasRemaining(1))this.setBuffer(e);else{var t=this.bytes.subarray(this.pos),n=sq(e),r=new Uint8Array(t.length+n.length);r.set(t),r.set(n,t.length),this.setBuffer(r)}},e.prototype.hasRemaining=function(e){return this.view.byteLength-this.pos>=e},e.prototype.createExtraByteError=function(e){var t=this,n=t.view,r=t.pos;return RangeError(`Extra ${n.byteLength-r} of ${n.byteLength} byte(s) found at buffer[${e}]`)},e.prototype.decode=function(e){this.reinitializeState(),this.setBuffer(e);var t=this.doDecodeSync();if(this.hasRemaining(1))throw this.createExtraByteError(this.pos);return t},e.prototype.decodeMulti=function(e){return vq(this,function(t){switch(t.label){case 0:this.reinitializeState(),this.setBuffer(e),t.label=1;case 1:return this.hasRemaining(1)?[4,this.doDecodeSync()]:[3,3];case 2:return t.sent(),[3,1];case 3:return[2]}})},e.prototype.decodeAsync=function(e){var t,n,r,i;return _q(this,void 0,void 0,function(){var a,o,s,c,l,u,d,f;return vq(this,function(p){switch(p.label){case 0:a=!1,p.label=1;case 1:p.trys.push([1,6,7,12]),t=yq(e),p.label=2;case 2:return[4,t.next()];case 3:if(n=p.sent(),n.done)return[3,5];if(s=n.value,a)throw this.createExtraByteError(this.totalPos);this.appendBuffer(s);try{o=this.doDecodeSync(),a=!0}catch(e){if(!(e instanceof Eq))throw e}this.totalPos+=this.pos,p.label=4;case 4:return[3,2];case 5:return[3,12];case 6:return c=p.sent(),r={error:c},[3,12];case 7:return p.trys.push([7,,10,11]),n&&!n.done&&(i=t.return)?[4,i.call(t)]:[3,9];case 8:p.sent(),p.label=9;case 9:return[3,11];case 10:if(r)throw r.error;return[7];case 11:return[7];case 12:if(a){if(this.hasRemaining(1))throw this.createExtraByteError(this.totalPos);return[2,o]}throw l=this,u=l.headByte,d=l.pos,f=l.totalPos,RangeError(`Insufficient data in parsing ${pq(u)} at ${f} (${d} in the current buffer)`)}})})},e.prototype.decodeArrayStream=function(e){return this.decodeMultiAsync(e,!0)},e.prototype.decodeStream=function(e){return this.decodeMultiAsync(e,!1)},e.prototype.decodeMultiAsync=function(e,t){return xq(this,arguments,function(){var n,r,i,a,o,s,c,l,u;return vq(this,function(d){switch(d.label){case 0:n=t,r=-1,d.label=1;case 1:d.trys.push([1,13,14,19]),i=yq(e),d.label=2;case 2:return[4,bq(i.next())];case 3:if(a=d.sent(),a.done)return[3,12];if(o=a.value,t&&r===0)throw this.createExtraByteError(this.totalPos);this.appendBuffer(o),n&&(r=this.readArraySize(),n=!1,this.complete()),d.label=4;case 4:d.trys.push([4,9,,10]),d.label=5;case 5:return[4,bq(this.doDecodeSync())];case 6:return[4,d.sent()];case 7:return d.sent(),--r===0?[3,8]:[3,5];case 8:return[3,10];case 9:if(s=d.sent(),!(s instanceof Eq))throw s;return[3,10];case 10:this.totalPos+=this.pos,d.label=11;case 11:return[3,2];case 12:return[3,19];case 13:return c=d.sent(),l={error:c},[3,19];case 14:return d.trys.push([14,,17,18]),a&&!a.done&&(u=i.return)?[4,bq(u.call(i))]:[3,16];case 15:d.sent(),d.label=16;case 16:return[3,18];case 17:if(l)throw l.error;return[7];case 18:return[7];case 19:return[2]}})})},e.prototype.doDecodeSync=function(){DECODE:for(;;){var e=this.readHeadByte(),t=void 0;if(e>=224)t=e-256;else if(e<192)if(e<128)t=e;else if(e<144){var n=e-128;if(n!==0){this.pushMapState(n),this.complete();continue DECODE}t={}}else if(e<160){var n=e-144;if(n!==0){this.pushArrayState(n),this.complete();continue DECODE}t=[]}else{var r=e-160;t=this.decodeUtf8String(r,0)}else if(e===192)t=null;else if(e===194)t=!1;else if(e===195)t=!0;else if(e===202)t=this.readF32();else if(e===203)t=this.readF64();else if(e===204)t=this.readU8();else if(e===205)t=this.readU16();else if(e===206)t=this.readU32();else if(e===207)t=this.readU64();else if(e===208)t=this.readI8();else if(e===209)t=this.readI16();else if(e===210)t=this.readI32();else if(e===211)t=this.readI64();else if(e===217){var r=this.lookU8();t=this.decodeUtf8String(r,1)}else if(e===218){var r=this.lookU16();t=this.decodeUtf8String(r,2)}else if(e===219){var r=this.lookU32();t=this.decodeUtf8String(r,4)}else if(e===220){var n=this.readU16();if(n!==0){this.pushArrayState(n),this.complete();continue DECODE}t=[]}else if(e===221){var n=this.readU32();if(n!==0){this.pushArrayState(n),this.complete();continue DECODE}t=[]}else if(e===222){var n=this.readU16();if(n!==0){this.pushMapState(n),this.complete();continue DECODE}t={}}else if(e===223){var n=this.readU32();if(n!==0){this.pushMapState(n),this.complete();continue DECODE}t={}}else if(e===196){var n=this.lookU8();t=this.decodeBinary(n,1)}else if(e===197){var n=this.lookU16();t=this.decodeBinary(n,2)}else if(e===198){var n=this.lookU32();t=this.decodeBinary(n,4)}else if(e===212)t=this.decodeExtension(1,0);else if(e===213)t=this.decodeExtension(2,0);else if(e===214)t=this.decodeExtension(4,0);else if(e===215)t=this.decodeExtension(8,0);else if(e===216)t=this.decodeExtension(16,0);else if(e===199){var n=this.lookU8();t=this.decodeExtension(n,1)}else if(e===200){var n=this.lookU16();t=this.decodeExtension(n,2)}else if(e===201){var n=this.lookU32();t=this.decodeExtension(n,4)}else throw new ZK(`Unrecognized type byte: ${pq(e)}`);this.complete();for(var i=this.stack;i.length>0;){var a=i[i.length-1];if(a.type===0)if(a.array[a.position]=t,a.position++,a.position===a.size)i.pop(),t=a.array;else continue DECODE;else if(a.type===1){if(!Sq(t))throw new ZK(`The type of key must be string or number but `+typeof t);if(t===`__proto__`)throw new ZK(`The key __proto__ is not allowed`);a.key=t,a.type=2;continue DECODE}else if(a.map[a.key]=t,a.readCount++,a.readCount===a.size)i.pop(),t=a.map;else{a.key=null,a.type=1;continue DECODE}}return t}},e.prototype.readHeadByte=function(){return this.headByte===Cq&&(this.headByte=this.readU8()),this.headByte},e.prototype.complete=function(){this.headByte=Cq},e.prototype.readArraySize=function(){var e=this.readHeadByte();switch(e){case 220:return this.readU16();case 221:return this.readU32();default:if(e<160)return e-144;throw new ZK(`Unrecognized array type byte: ${pq(e)}`)}},e.prototype.pushMapState=function(e){if(e>this.maxMapLength)throw new ZK(`Max length exceeded: map length (${e}) > maxMapLengthLength (${this.maxMapLength})`);this.stack.push({type:1,size:e,key:null,readCount:0,map:{}})},e.prototype.pushArrayState=function(e){if(e>this.maxArrayLength)throw new ZK(`Max length exceeded: array length (${e}) > maxArrayLength (${this.maxArrayLength})`);this.stack.push({type:0,size:e,array:Array(e),position:0})},e.prototype.decodeUtf8String=function(e,t){if(e>this.maxStrLength)throw new ZK(`Max length exceeded: UTF-8 byte length (${e}) > maxStrLength (${this.maxStrLength})`);if(this.bytes.byteLength<this.pos+t+e)throw Dq;var n=this.pos+t,r=this.stateIsMapKey()&&this.keyDecoder?.canBeCached(e)?this.keyDecoder.decode(this.bytes,n,e):e>qK?JK(this.bytes,n,e):GK(this.bytes,n,e);return this.pos+=t+e,r},e.prototype.stateIsMapKey=function(){return this.stack.length>0&&this.stack[this.stack.length-1].type===1},e.prototype.decodeBinary=function(e,t){if(e>this.maxBinLength)throw new ZK(`Max length exceeded: bin length (${e}) > maxBinLength (${this.maxBinLength})`);if(!this.hasRemaining(e+t))throw Dq;var n=this.pos+t,r=this.bytes.subarray(n,n+e);return this.pos+=t+e,r},e.prototype.decodeExtension=function(e,t){if(e>this.maxExtLength)throw new ZK(`Max length exceeded: ext length (${e}) > maxExtLength (${this.maxExtLength})`);var n=this.view.getInt8(this.pos+t),r=this.decodeBinary(e,t+1);return this.extensionCodec.decode(r,n,this.context)},e.prototype.lookU8=function(){return this.view.getUint8(this.pos)},e.prototype.lookU16=function(){return this.view.getUint16(this.pos)},e.prototype.lookU32=function(){return this.view.getUint32(this.pos)},e.prototype.readU8=function(){var e=this.view.getUint8(this.pos);return this.pos++,e},e.prototype.readI8=function(){var e=this.view.getInt8(this.pos);return this.pos++,e},e.prototype.readU16=function(){var e=this.view.getUint16(this.pos);return this.pos+=2,e},e.prototype.readI16=function(){var e=this.view.getInt16(this.pos);return this.pos+=2,e},e.prototype.readU32=function(){var e=this.view.getUint32(this.pos);return this.pos+=4,e},e.prototype.readI32=function(){var e=this.view.getInt32(this.pos);return this.pos+=4,e},e.prototype.readU64=function(){var e=FK(this.view,this.pos);return this.pos+=8,e},e.prototype.readI64=function(){var e=PK(this.view,this.pos);return this.pos+=8,e},e.prototype.readF32=function(){var e=this.view.getFloat32(this.pos);return this.pos+=4,e},e.prototype.readF64=function(){var e=this.view.getFloat64(this.pos);return this.pos+=8,e},e}(),Aq={};function jq(e,t){return t===void 0&&(t=Aq),new kq(t.extensionCodec,t.context,t.maxStrLength,t.maxBinLength,t.maxArrayLength,t.maxMapLength,t.maxExtLength).decode(e)}var Mq=2,Nq=class{constructor(){this.data=null}compileImageTargets(e,t){return new Promise(async(n,r)=>{let i=[];for(let t=0;t<e.length;t++){let n=e[t],r=this.createProcessCanvas(n).getContext(`2d`);r.drawImage(n,0,0,n.width,n.height);let a=r.getImageData(0,0,n.width,n.height),o=new Uint8Array(n.width*n.height);for(let e=0;e<o.length;e++){let t=e*4;o[e]=Math.floor((a.data[t]+a.data[t+1]+a.data[t+2])/3)}let s={data:o,height:n.height,width:n.width};i.push(s)}let a=50/i.length,o=0;this.data=[];for(let e=0;e<i.length;e++){let n=i[e],r=yK(n),s=a/r.length,c=await Pq(r,()=>{o+=s,t(o)});this.data.push({targetImage:n,imageList:r,matchingData:c})}for(let e=0;e<i.length;e++){let t=bK(i[e]);this.data[e].trackingImageList=t}let s=await this.compileTrack({progressCallback:t,targetImages:i,basePercent:50});for(let e=0;e<i.length;e++)this.data[e].trackingData=s[e];n(this.data)})}exportData(){let e=[];for(let t=0;t<this.data.length;t++)e.push({targetImage:{width:this.data[t].targetImage.width,height:this.data[t].targetImage.height},trackingData:this.data[t].trackingData,matchingData:this.data[t].matchingData});return fq({v:Mq,dataList:e})}importData(e){let t=jq(new Uint8Array(e));if(!t.v||t.v!==Mq)return console.error(`Your compiled .mind might be outdated. Please recompile`),[];let{dataList:n}=t;this.data=[];for(let e=0;e<n.length;e++)this.data.push({targetImage:n[e].targetImage,trackingData:n[e].trackingData,matchingData:n[e].matchingData});return this.data}createProcessCanvas(e){console.warn(`missing createProcessCanvas implementation`)}compileTrack({progressCallback:e,targetImages:t,basePercent:n}){console.warn(`missing compileTrack implementation`)}},Pq=async(e,t)=>{let n=[];for(let r=0;r<e.length;r++){let i=e[r],a=new gK(i.width,i.height);await Lm(),P(()=>{let e=ua(i.data,[i.data.length],`float32`).reshape([i.height,i.width]),{featurePoints:o}=a.detect(e),s=o.filter(e=>e.maxima),c=o.filter(e=>!e.maxima),l=kK({points:s}),u=kK({points:c});n.push({maximaPoints:s,minimaPoints:c,maximaPointsCluster:l,minimaPointsCluster:u,width:i.width,height:i.height,scale:i.scale}),t(r)})}return n},Fq="(function(){var e=class{constructor(e,t,n){this.cumsum=[];for(let e=0;e<n;e++){this.cumsum.push([]);for(let n=0;n<t;n++)this.cumsum[e].push(0)}this.cumsum[0][0]=e[0];for(let n=1;n<t;n++)this.cumsum[0][n]=this.cumsum[0][n-1]+e[n];for(let r=1;r<n;r++)this.cumsum[r][0]=this.cumsum[r-1][0]+e[r*t];for(let r=1;r<n;r++)for(let n=1;n<t;n++)this.cumsum[r][n]=e[r*t+n]+this.cumsum[r-1][n]+this.cumsum[r][n-1]-this.cumsum[r-1][n-1]}query(e,t,n,r){let i=this.cumsum[r][n];return t>0&&(i-=this.cumsum[t-1][n]),e>0&&(i-=this.cumsum[r][e-1]),e>0&&t>0&&(i+=this.cumsum[t-1][e-1]),i}};let t=.95,n=n=>{let{data:o,width:s,height:c,scale:l}=n,u=[s*c];for(let e=0;e<u.length;e++)u[e]=!1;let d=new Float32Array(o.length);for(let e=0;e<s;e++)d[e]=-1,d[s*(c-1)+e]=-1;for(let e=0;e<c;e++)d[e*s]=-1,d[e*s+s-1]=-1;for(let e=1;e<s-1;e++)for(let t=1;t<c-1;t++){let n=e+s*t,r=0,i=0;for(let e=-1;e<=1;e++)r+=o[n+s*e+1]-o[n+s*e-1],i+=o[n+s+e]-o[n-s+e];r/=768,i/=768,d[n]=Math.sqrt((r*r+i*i)/2)}let f=new Uint32Array(1e3);for(let e=0;e<1e3;e++)f[e]=0;let p=[-1,1,-s,s],m=0;for(let e=1;e<s-1;e++)for(let t=1;t<c-1;t++){let n=e+s*t,r=!0;for(let e=0;e<p.length;e++)if(d[n]<=d[n+p[e]]){r=!1;break}if(r){let e=Math.floor(d[n]*1e3);e>999&&(e=999),e<0&&(e=0),f[e]+=1,m+=1,u[n]=!0}}let h=.02*s*c,g=999,_=0;for(;g>=0&&(_+=f[g],!(_>h));)g--;for(let e=0;e<u.length;e++)u[e]&&d[e]*1e3<g&&(u[e]=!1);let v=[];for(let e=0;e<o.length;e++)v[e]=o[e]*o[e];let y=new e(o,s,c),b=new e(v,s,c),x=new Float32Array(o.length);for(let e=0;e<s;e++)for(let r=0;r<c;r++){let o=r*s+e;if(!u[o]){x[o]=1;continue}let c=i({image:n,cx:e,cy:r,sdThresh:5,imageDataCumsum:y,imageDataSqrCumsum:b});if(c===null){x[o]=1;continue}let l=-1;for(let i=-10;i<=10;i++){for(let o=-10;o<=10;o++){if(o*o+i*i<=4)continue;let s=a({image:n,cx:e+o,cy:r+i,vlen:c,tx:e,ty:r,imageDataCumsum:y,imageDataSqrCumsum:b});if(s!==null&&s>l&&(l=s,l>t))break}if(l>t)break}x[o]=l}return r({image:n,featureMap:x,templateSize:6,searchSize:2,occSize:16,maxSimThresh:.9,minSimThresh:.2,sdThresh:8,imageDataCumsum:y,imageDataSqrCumsum:b})},r=e=>{let{image:t,featureMap:n,templateSize:r,searchSize:o,occSize:s,maxSimThresh:c,minSimThresh:l,sdThresh:u,imageDataCumsum:d,imageDataSqrCumsum:f}=e,{data:p,width:m,height:h,scale:g}=t;s=Math.floor(Math.min(t.width,t.height)/10);let _=(r*2+1)*3,v=Math.floor(m/_),y=Math.floor(h/_),b=Math.floor(m/s)*Math.floor(h/s)+v*y,x=[],S=new Float32Array(p.length);for(let e=0;e<S.length;e++)S[e]=n[e];let C=0;for(;C<b;){let e=c,n=-1,p=-1;for(let t=0;t<h;t++)for(let r=0;r<m;r++)S[t*m+r]<e&&(e=S[t*m+r],n=r,p=t);if(n===-1)break;let g=i({image:t,cx:n,cy:p,sdThresh:0,imageDataCumsum:d,imageDataSqrCumsum:f});if(g===null){S[p*m+n]=1;continue}if(g/(r*2+1)<u){S[p*m+n]=1;continue}let _=1,v=-1;for(let r=-o;r<=o;r++){for(let i=-o;i<=o;i++){if(i*i+r*r>o*o||i===0&&r===0)continue;let s=a({image:t,vlen:g,cx:n+i,cy:p+r,tx:n,ty:p,imageDataCumsum:d,imageDataSqrCumsum:f});if(s!==null&&(s<_&&(_=s,_<l&&_<e)||s>v&&(v=s,v>.99)))break}if(_<l&&_<e||v>.99)break}if(_<l&&_<e||v>.99){S[p*m+n]=1;continue}x.push({x:n,y:p}),C+=1;for(let e=-s;e<=s;e++)for(let t=-s;t<=s;t++)p+e<0||p+e>=h||n+t<0||n+t>=m||(S[(p+e)*m+(n+t)]=1)}return x},i=({image:e,cx:t,cy:n,sdThresh:r,imageDataCumsum:i,imageDataSqrCumsum:a})=>{if(t-6<0||t+6>=e.width||n-6<0||n+6>=e.height)return null;let o=i.query(t-6,n-6,t+6,n+6);o/=169;let s=a.query(t-6,n-6,t+6,n+6);return s-=2*o*i.query(t-6,n-6,t+6,n+6),s+=169*o*o,s/169<r*r?null:(s=Math.sqrt(s),s)},a=e=>{let{image:t,cx:n,cy:r,vlen:i,tx:a,ty:o,imageDataCumsum:s,imageDataSqrCumsum:c}=e,{data:l,width:u,height:d}=t;if(n-6<0||n+6>=u||r-6<0||r+6>=d)return null;let f=s.query(n-6,r-6,n+6,r+6),p=c.query(n-6,r-6,n+6,r+6),m=0,h=(r-6)*u+(n-6),g=(o-6)*u+(a-6),_=u-13;for(let e=0;e<13;e++){for(let e=0;e<13;e++)m+=l[h]*l[g],h+=1,g+=1;h+=_,g+=_}let v=s.query(a-6,o-6,a+6,o+6);v/=169,m-=v*f;let y=p-f*f/169;return y==0?null:(y=Math.sqrt(y),1*m/(i*y))},o=(e,t)=>{let r=[];for(let i=0;i<e.length;i++){let a=e[i],o=n(a),s={data:a.data,scale:a.scale,width:a.width,height:a.height,points:o};r.push(s),t(i)}return r},s=({image:e,ratio:t})=>{let n=Math.round(e.width*t),r=Math.round(e.height*t),i=new Uint8Array(n*r);for(let a=0;a<n;a++){let o=Math.round(1*a/t),s=Math.round(1*(a+1)/t)-1;s>=e.width&&(s=e.width-1);for(let c=0;c<r;c++){let r=Math.round(1*c/t),l=Math.round(1*(c+1)/t)-1;l>=e.height&&(l=e.height-1);let u=0,d=0;for(let t=o;t<=s;t++)for(let n=r;n<=l;n++)u+=1*e.data[n*e.width+t],d+=1;i[c*n+a]=Math.floor(u/d)}}return{data:i,width:n,height:r}},c=e=>{let t=Math.min(e.width,e.height),n=[],r=[];n.push(256/t),n.push(128/t);for(let t=0;t<n.length;t++)r.push(Object.assign(s({image:e,ratio:n[t]}),{scale:n[t]}));return r};onmessage=e=>{let{data:t}=e;if(t.type===`compile`){let{targetImages:e}=t,n=100/e.length,r=0,i=[];for(let t=0;t<e.length;t++){let a=e[t],s=c(a),l=n/s.length,u=o(s,e=>{r+=l,postMessage({type:`progress`,percent:r})});i.push(u)}postMessage({type:`compileDone`,list:i})}}})();",Iq=typeof self<`u`&&self.Blob&&new Blob([`(self.URL || self.webkitURL).revokeObjectURL(self.location.href);`,Fq],{type:`text/javascript;charset=utf-8`});function Lq(e){let t;try{if(t=Iq&&(self.URL||self.webkitURL).createObjectURL(Iq),!t)throw``;let n=new Worker(t,{name:e?.name});return n.addEventListener(`error`,()=>{(self.URL||self.webkitURL).revokeObjectURL(t)}),n}catch{return new Worker(`data:text/javascript;charset=utf-8,`+encodeURIComponent(Fq),{name:e?.name})}}var Rq=class extends Nq{createProcessCanvas(e){let t=document.createElement(`canvas`);return t.width=e.width,t.height=e.height,t}compileTrack({progressCallback:e,targetImages:t,basePercent:n}){return new Promise((r,i)=>{let a=new Lq;a.onmessage=t=>{t.data.type===`progress`?e(n+t.data.percent*n/100):t.data.type===`compileDone`&&r(t.data.list)},a.postMessage({type:`compile`,targetImages:t})})}};export{Rq as Compiler};