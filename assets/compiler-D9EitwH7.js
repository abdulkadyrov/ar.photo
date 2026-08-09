import{i as e,n as t,t as n}from"./rolldown-runtime-Dd_uD5pT.js";import{n as r,r as i}from"./dist.es5_esm-DnZjEmj7.js";import{t as a}from"./__vite-browser-external-5eBdwsFd.js";var o=1e-7,s=1e-4,c=class{constructor(e,t){this.backend=e,this.dataMover=t,this.data=new WeakMap,this.dataIdsCount=0}get(e){return this.data.has(e)||this.dataMover.moveData(this.backend,e),this.data.get(e)}set(e,t){this.dataIdsCount++,this.data.set(e,t)}has(e){return this.data.has(e)}delete(e){return this.dataIdsCount--,this.data.delete(e)}numDataIds(){return this.dataIdsCount}},l=class{refCount(e){return u(`refCount`)}incRef(e){return u(`incRef`)}timerAvailable(){return!0}time(e){return u(`time`)}read(e){return u(`read`)}readSync(e){return u(`readSync`)}readToGPU(e,t){return u(`readToGPU`)}numDataIds(){return u(`numDataIds`)}disposeData(e,t){return u(`disposeData`)}write(e,t,n){return u(`write`)}move(e,t,n,r,i){return u(`move`)}createTensorFromGPUData(e,t,n){return u(`createTensorFromGPUData`)}memory(){return u(`memory`)}floatPrecision(){return u(`floatPrecision`)}epsilon(){return this.floatPrecision()===32?o:s}dispose(){return u(`dispose`)}};function u(e){throw Error(`'${e}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}function d(e){let t=e.length,n=0;for(;t>0;)n=Math.random()*t|0,t--,m(e,t,n)}function f(e,t,n){return Math.max(e,Math.min(t,n))}function p(e){return e%2==0?e:e+1}function m(e,t,n){let r=e[t];e[t]=e[n],e[n]=r}function h(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n];return t}function g(e,t){if(!e)throw Error(typeof t==`string`?t:t())}function _(e,t,n=``){g(b(e,t),()=>n+` Shapes ${e} and ${t} must match`)}function v(e){g(e!=null,()=>`The input to the tensor constructor must be a non-null value.`)}function y(e){if(e.length===0)return 1;let t=e[0];for(let n=1;n<e.length;n++)t*=e[n];return t}function b(e,t){if(e===t)return!0;if(e==null||t==null||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function x(e){return e%1==0}function S(e){let t=Math.ceil(Math.sqrt(e));return[t,Math.ceil(e/t)]}function C(e,t){return t<=e.length?e:e+` `.repeat(t-e.length)}function w(e,t=e=>0,n,r){return new Promise((i,a)=>{let o=0,s=()=>{if(e()){i();return}o++;let c=t(o);if(n!=null&&o>=n){a();return}r==null?setTimeout(s,c):r(s,c)};s()})}function T(e,t){let n=1,r=-1;for(let t=0;t<e.length;++t)if(e[t]>=0)n*=e[t];else if(e[t]===-1){if(r!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${r} and dim ${t}`);r=t}else if(e[t]<0)throw Error(`Shapes can not be < 0. Found ${e[t]} at dim ${t}`);if(r===-1){if(t>0&&t!==n)throw Error(`Size(${t}) must match the product of shape ${e}`);return e}if(n===0)throw Error(`Cannot infer the missing size in [${e}] when there are 0 elements`);if(t%n!==0)throw Error(`The implicit shape can't be a fractional number. Got ${t} / ${n}`);let i=e.slice();return i[r]=t/n,i}function E(e,t){let n=t.length;return e=e==null?t.map((e,t)=>t):[].concat(e),g(e.every(e=>e>=-n&&e<n),()=>`All values in axis param must be in range [-${n}, ${n}) but got axis ${e}`),g(e.every(e=>x(e)),()=>`All values in axis param must be integers but got axis ${e}`),e.map(e=>e<0?n+e:e)}function D(e,t){let n=[],r=[],i=t!=null&&Array.isArray(t)&&t.length===0,a=t==null||i?null:E(t,e).sort(),o=0;for(let t=0;t<e.length;++t){if(a!=null){if(a[o]===t&&e[t]!==1)throw Error(`Can't squeeze axis ${t} since its dim '${e[t]}' is not 1`);(a[o]==null||a[o]>t)&&e[t]===1&&(n.push(e[t]),r.push(t)),a[o]<=t&&o++}e[t]!==1&&(n.push(e[t]),r.push(t))}return{newShape:n,keptDims:r}}function O(e,t){return k(e,t)}function k(e,t){let n=null;if(e==null||e===`float32`)n=new Float32Array(t);else if(e===`int32`)n=new Int32Array(t);else if(e===`bool`)n=new Uint8Array(t);else if(e===`string`)n=Array(t);else throw Error(`Unknown data type ${e}`);return n}function ee(e,t){for(let n=0;n<e.length;n++){let r=e[n];if(isNaN(r)||!isFinite(r))throw Error(`A tensor of type ${t} being uploaded contains ${r}.`)}}function te(e){return e===`bool`||e===`complex64`||e===`float32`||e===`int32`||e===`string`}function ne(e,t){return!(t===`complex64`||t===`float32`&&e!==`complex64`||t===`int32`&&e!==`float32`&&e!==`complex64`||t===`bool`&&e===`bool`)}function re(e){if(e===`float32`||e===`int32`)return 4;if(e===`complex64`)return 8;if(e===`bool`)return 1;throw Error(`Unknown dtype ${e}`)}function ie(e){if(e==null)return 0;let t=0;return e.forEach(e=>t+=e.length),t}function ae(e){return typeof e==`string`||e instanceof String}function oe(e){return typeof e==`boolean`}function se(e){return typeof e==`number`}function ce(e){return Array.isArray(e)?ce(e[0]):e instanceof Float32Array?`float32`:e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray?`int32`:se(e)?`float32`:ae(e)?`string`:oe(e)?`bool`:`float32`}function le(e){return!!(e&&e.constructor&&e.call&&e.apply)}function ue(e,t){for(let n=t;n<e;++n)if(e%n===0)return n;return e}function A(e){let t=e.length;if(t<2)return[];let n=Array(t-1);n[t-2]=e[t-1];for(let r=t-3;r>=0;--r)n[r]=n[r+1]*e[r+1];return n}function de(e,t,n,r=!1){let i=[];if(t.length===1){let a=t[0]*(r?2:1);for(let t=0;t<a;t++)i[t]=n[e+t]}else{let a=t[0],o=t.slice(1),s=o.reduce((e,t)=>e*t)*(r?2:1);for(let t=0;t<a;t++)i[t]=de(e+t*s,o,n,r)}return i}function fe(e,t,n=!1){if(e.length===0)return t[0];let r=e.reduce((e,t)=>e*t)*(n?2:1);if(r===0)return[];if(r!==t.length)throw Error(`[${e}] does not match the input size ${t.length}${n?` for a complex tensor`:``}.`);return de(0,e,t,n)}function pe(e,t){if(Array.isArray(e))return e;if(t===`float32`)return e instanceof Float32Array?e:new Float32Array(e);if(t===`int32`)return e instanceof Int32Array?e:new Int32Array(e);if(t===`bool`||t===`string`)return Uint8Array.from(new Int32Array(e));throw Error(`Unknown dtype ${t}`)}function me(e,t){let n=he(e,t);for(let e=0;e<n.length;e++)n[e]=1;return n}function he(e,t){if(t==null||t===`float32`||t===`complex64`)return new Float32Array(e);if(t===`int32`)return new Int32Array(e);if(t===`bool`)return new Uint8Array(e);throw Error(`Unknown data type ${t}`)}function ge(e,t){let n=e.reduce((e,t)=>e*t,1);if(t==null||t===`float32`)return fe(e,new Float32Array(n));if(t===`int32`)return fe(e,new Int32Array(n));if(t===`bool`)return fe(e,new Uint8Array(n));throw Error(`Unknown data type ${t}`)}function _e(e){e.forEach(t=>{g(Number.isInteger(t)&&t>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${e}].`)})}function ve(e,t,n){if(t===0)return 0;if(t===1)return e[0];let r=e[e.length-1];for(let t=0;t<e.length-1;++t)r+=n[t]*e[t];return r}function ye(e,t,n){if(t===0)return[];if(t===1)return[e];let r=Array(t);for(let t=0;t<r.length-1;++t)r[t]=Math.floor(e/n[t]),e-=r[t]*n[t];return r[r.length-1]=e,r}function be(e){return e&&e.then&&typeof e.then==`function`}var xe=`tfjsflags`,Se=class{constructor(e){this.global=e,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=Ce,this.populateURLFlags()}setPlatform(e,t){this.platform!=null&&(j().getBool(`IS_TEST`)||j().getBool(`PROD`)||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${e}.`)),this.platformName=e,this.platform=t}registerFlag(e,t,n){if(this.flagRegistry[e]={evaluationFn:t,setHook:n},this.urlFlags[e]!=null){let t=this.urlFlags[e];j().getBool(`IS_TEST`)||j().getBool(`PROD`)||console.warn(`Setting feature override from URL ${e}: ${t}.`),this.set(e,t)}}async getAsync(e){return e in this.flags||(this.flags[e]=await this.evaluateFlag(e)),this.flags[e]}get(e){if(e in this.flags)return this.flags[e];let t=this.evaluateFlag(e);if(be(t))throw Error(`Flag ${e} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[e]=t,this.flags[e]}getNumber(e){return this.get(e)}getBool(e){return this.get(e)}getString(e){return this.get(e)}getFlags(){return this.flags}get features(){return this.flags}set(e,t){if(this.flagRegistry[e]==null)throw Error(`Cannot set flag ${e} as it has not been registered.`);this.flags[e]=t,this.flagRegistry[e].setHook!=null&&this.flagRegistry[e].setHook(t)}evaluateFlag(e){if(this.flagRegistry[e]==null)throw Error(`Cannot evaluate flag '${e}': no evaluation function found.`);return this.flagRegistry[e].evaluationFn()}setFlags(e){this.flags=Object.assign({},e)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(this.global===void 0||this.global.location===void 0||this.global.location.search===void 0)return;let e=this.getQueryParams(this.global.location.search);xe in e&&e[xe].split(`,`).forEach(e=>{let[t,n]=e.split(`:`);this.urlFlags[t]=Te(t,n)})}};function Ce(e){let t={};return e.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(e,...n)=>(we(t,n[0],n[1]),n.join(`=`))),t}function we(e,t,n){e[decodeURIComponent(t)]=decodeURIComponent(n||``)}function Te(e,t){let n=t.toLowerCase();return n===`true`||n===`false`?n===`true`:`${+n}`===n?+n:t}function j(){return Ee}var Ee=null;function De(e){Ee=e}var Oe;function ke(){if(Oe==null){let e;if(typeof window<`u`)e=window;else if(typeof global<`u`)e=global;else if(typeof process<`u`)e=process;else if(typeof self<`u`)e=self;else throw Error(`Could not find a global object`);Oe=e}return Oe}function Ae(){let e=ke();return e._tfGlobals??=new Map,e._tfGlobals}function je(e,t){let n=Ae();if(n.has(e))return n.get(e);{let r=t();return n.set(e,r),n.get(e)}}var Me=`Acos`,Ne=`Acosh`,Pe=`AddN`,Fe=`ArgMax`,Ie=`ArgMin`,Le=`Asin`,Re=`Asinh`,ze=`Atan`,Be=`Atanh`,Ve=`Atan2`,He=`AvgPool`,Ue=`AvgPoolGrad`,We=`AvgPool3D`,Ge=`AvgPool3DGrad`,Ke=`BatchMatMul`,qe=`BatchToSpaceND`,Je=`Bincount`,Ye=`BitwiseAnd`,Xe=`BroadcastTo`,Ze=`BroadcastArgs`,Qe=`Cast`,$e=`Ceil`,et=`ClipByValue`,tt=`Complex`,nt=`ComplexAbs`,rt=`Concat`,it=`Conv2D`,at=`Conv2DBackpropFilter`,ot=`Conv2DBackpropInput`,st=`Conv3D`,ct=`Conv3DBackpropFilterV2`,lt=`Conv3DBackpropInputV2`,ut=`Cosh`,dt=`Cumprod`,ft=`Cumsum`,pt=`CropAndResize`,mt=`DenseBincount`,ht=`DepthToSpace`,gt=`DepthwiseConv2dNative`,_t=`DepthwiseConv2dNativeBackpropFilter`,vt=`DepthwiseConv2dNativeBackpropInput`,yt=`Diag`,bt=`Dilation2D`,xt=`Dilation2DBackpropInput`,St=`Dilation2DBackpropFilter`,Ct=`Draw`,wt=`RealDiv`,Tt=`Einsum`,Et=`EluGrad`,Dt=`Equal`,Ot=`ExpandDims`,kt=`Expm1`,At=`Fill`,jt=`FlipLeftRight`,Mt=`Floor`,Nt=`FloorDiv`,Pt=`FusedBatchNorm`,Ft=`GatherV2`,It=`GatherNd`,Lt=`Greater`,Rt=`GreaterEqual`,zt=`Identity`,Bt=`IFFT`,Vt=`Imag`,Ht=`IsFinite`,Ut=`IsInf`,Wt=`IsNan`,Gt=`LeakyRelu`,Kt=`Less`,qt=`LessEqual`,Jt=`LinSpace`,Yt=`Log1p`,Xt=`LogicalAnd`,Zt=`LogicalNot`,Qt=`LogicalOr`,$t=`LogSoftmax`,en=`LRNGrad`,tn=`Maximum`,nn=`MaxPool`,rn=`MaxPoolGrad`,an=`MaxPool3D`,on=`MaxPool3DGrad`,sn=`MaxPoolWithArgmax`,cn=`Mean`,ln=`Minimum`,un=`MirrorPad`,dn=`Multinomial`,fn=`Multiply`,pn=`NotEqual`,mn=`NonMaxSuppressionV3`,hn=`NonMaxSuppressionV4`,gn=`NonMaxSuppressionV5`,_n=`OnesLike`,vn=`OneHot`,yn=`Pack`,bn=`PadV2`,xn=`Prelu`,Sn=`Prod`,Cn=`RaggedGather`,wn=`RaggedRange`,Tn=`RaggedTensorToTensor`,En=`Range`,Dn=`Real`,On=`Reciprocal`,kn=`Relu`,An=`Reshape`,jn=`ResizeNearestNeighbor`,Mn=`ResizeNearestNeighborGrad`,Nn=`ResizeBilinear`,Pn=`ResizeBilinearGrad`,Fn=`Relu6`,In=`Reverse`,Ln=`Round`,Rn=`Rsqrt`,zn=`ScatterNd`,Bn=`TensorScatterUpdate`,Vn=`SearchSorted`,Hn=`Select`,Un=`Selu`,Wn=`Slice`,Gn=`Sinh`,Kn=`Sign`,qn=`Sigmoid`,Jn=`Softplus`,Yn=`Sqrt`,Xn=`SpaceToBatchND`,Zn=`SplitV`,Qn=`Softmax`,$n=`SparseFillEmptyRows`,er=`SparseReshape`,tr=`SparseSegmentMean`,nr=`SparseSegmentSum`,rr=`SparseToDense`,ir=`SquaredDifference`,ar=`Square`,or=`StaticRegexReplace`,sr=`StridedSlice`,cr=`StringNGrams`,lr=`StringSplit`,ur=`StringToHashBucketFast`,dr=`Tanh`,fr=`Tile`,pr=`TopK`,mr=`Transform`,hr=`Transpose`,gr=`Unique`,_r=`Unpack`,vr=`UnsortedSegmentSum`,yr=`ZerosLike`,br=`Step`,xr=`FromPixels`,Sr=`RotateWithOffset`,Cr=`_FusedMatMul`,wr=`FusedConv2D`,Tr=`FusedDepthwiseConv2D`;function Er(...e){j().getBool(`IS_TEST`)||j().getBool(`PROD`)||console.warn(...e)}function Dr(...e){j().getBool(`IS_TEST`)||j().getBool(`PROD`)||console.log(...e)}var Or=je(`kernelRegistry`,()=>new Map),kr=je(`gradRegistry`,()=>new Map);function Ar(e,t){let n=Fr(e,t);return Or.get(n)}function jr(e){return kr.get(e)}function Mr(e){let t=Or.entries(),n=[];for(;;){let{done:r,value:i}=t.next();if(r)break;let[a,o]=i,[s]=a.split(`_`);s===e&&n.push(o)}return n}function Nr(e){let{kernelName:t,backendName:n}=e,r=Fr(t,n);Or.has(r)&&Er(`The kernel '${t}' for backend '${n}' is already registered`),Or.set(r,e)}function Pr(e){let{kernelName:t}=e;kr.has(t)&&j().getBool(`DEBUG`)&&Er(`Overriding the gradient for '${t}'`),kr.set(t,e)}function Fr(e,t){return`${t}_${e}`}function Ir(e){return e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray}var Lr=e(n(((e,t)=>{t.exports=r;var n=null;try{n=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function r(e,t,n){this.low=e|0,this.high=t|0,this.unsigned=!!n}r.prototype.__isLong__,Object.defineProperty(r.prototype,"__isLong__",{value:!0});function i(e){return(e&&e.__isLong__)===!0}r.isLong=i;var a={},o={};function s(e,t){var n,r,i;return t?(e>>>=0,(i=0<=e&&e<256)&&(r=o[e],r)?r:(n=l(e,(e|0)<0?-1:0,!0),i&&(o[e]=n),n)):(e|=0,(i=-128<=e&&e<128)&&(r=a[e],r)?r:(n=l(e,e<0?-1:0,!1),i&&(a[e]=n),n))}r.fromInt=s;function c(e,t){if(isNaN(e))return t?b:y;if(t){if(e<0)return b;if(e>=g)return T}else{if(e<=-_)return E;if(e+1>=_)return w}return e<0?c(-e,t).neg():l(e%h|0,e/h|0,t)}r.fromNumber=c;function l(e,t,n){return new r(e,t,n)}r.fromBits=l;var u=Math.pow;function d(e,t,n){if(e.length===0)throw Error(`empty string`);if(e===`NaN`||e===`Infinity`||e===`+Infinity`||e===`-Infinity`)return y;if(typeof t==`number`?(n=t,t=!1):t=!!t,n||=10,n<2||36<n)throw RangeError(`radix`);var r;if((r=e.indexOf(`-`))>0)throw Error(`interior hyphen`);if(r===0)return d(e.substring(1),t,n).neg();for(var i=c(u(n,8)),a=y,o=0;o<e.length;o+=8){var s=Math.min(8,e.length-o),l=parseInt(e.substring(o,o+s),n);if(s<8){var f=c(u(n,s));a=a.mul(f).add(c(l))}else a=a.mul(i),a=a.add(c(l))}return a.unsigned=t,a}r.fromString=d;function f(e,t){return typeof e==`number`?c(e,t):typeof e==`string`?d(e,t):l(e.low,e.high,typeof t==`boolean`?t:e.unsigned)}r.fromValue=f;var p=65536,m=1<<24,h=p*p,g=h*h,_=g/2,v=s(m),y=s(0);r.ZERO=y;var b=s(0,!0);r.UZERO=b;var x=s(1);r.ONE=x;var S=s(1,!0);r.UONE=S;var C=s(-1);r.NEG_ONE=C;var w=l(-1,2147483647,!1);r.MAX_VALUE=w;var T=l(-1,-1,!0);r.MAX_UNSIGNED_VALUE=T;var E=l(0,-2147483648,!1);r.MIN_VALUE=E;var D=r.prototype;D.toInt=function(){return this.unsigned?this.low>>>0:this.low},D.toNumber=function(){return this.unsigned?(this.high>>>0)*h+(this.low>>>0):this.high*h+(this.low>>>0)},D.toString=function(e){if(e||=10,e<2||36<e)throw RangeError(`radix`);if(this.isZero())return`0`;if(this.isNegative())if(this.eq(E)){var t=c(e),n=this.div(t),r=n.mul(t).sub(this);return n.toString(e)+r.toInt().toString(e)}else return`-`+this.neg().toString(e);for(var i=c(u(e,6),this.unsigned),a=this,o=``;;){var s=a.div(i),l=(a.sub(s.mul(i)).toInt()>>>0).toString(e);if(a=s,a.isZero())return l+o;for(;l.length<6;)l=`0`+l;o=``+l+o}},D.getHighBits=function(){return this.high},D.getHighBitsUnsigned=function(){return this.high>>>0},D.getLowBits=function(){return this.low},D.getLowBitsUnsigned=function(){return this.low>>>0},D.getNumBitsAbs=function(){if(this.isNegative())return this.eq(E)?64:this.neg().getNumBitsAbs();for(var e=this.high==0?this.low:this.high,t=31;t>0&&!(e&1<<t);t--);return this.high==0?t+1:t+33},D.isZero=function(){return this.high===0&&this.low===0},D.eqz=D.isZero,D.isNegative=function(){return!this.unsigned&&this.high<0},D.isPositive=function(){return this.unsigned||this.high>=0},D.isOdd=function(){return(this.low&1)==1},D.isEven=function(){return!(this.low&1)},D.equals=function(e){return i(e)||(e=f(e)),this.unsigned!==e.unsigned&&this.high>>>31==1&&e.high>>>31==1?!1:this.high===e.high&&this.low===e.low},D.eq=D.equals,D.notEquals=function(e){return!this.eq(e)},D.neq=D.notEquals,D.ne=D.notEquals,D.lessThan=function(e){return this.comp(e)<0},D.lt=D.lessThan,D.lessThanOrEqual=function(e){return this.comp(e)<=0},D.lte=D.lessThanOrEqual,D.le=D.lessThanOrEqual,D.greaterThan=function(e){return this.comp(e)>0},D.gt=D.greaterThan,D.greaterThanOrEqual=function(e){return this.comp(e)>=0},D.gte=D.greaterThanOrEqual,D.ge=D.greaterThanOrEqual,D.compare=function(e){if(i(e)||(e=f(e)),this.eq(e))return 0;var t=this.isNegative(),n=e.isNegative();return t&&!n?-1:!t&&n?1:this.unsigned?e.high>>>0>this.high>>>0||e.high===this.high&&e.low>>>0>this.low>>>0?-1:1:this.sub(e).isNegative()?-1:1},D.comp=D.compare,D.negate=function(){return!this.unsigned&&this.eq(E)?E:this.not().add(x)},D.neg=D.negate,D.add=function(e){i(e)||(e=f(e));var t=this.high>>>16,n=this.high&65535,r=this.low>>>16,a=this.low&65535,o=e.high>>>16,s=e.high&65535,c=e.low>>>16,u=e.low&65535,d=0,p=0,m=0,h=0;return h+=a+u,m+=h>>>16,h&=65535,m+=r+c,p+=m>>>16,m&=65535,p+=n+s,d+=p>>>16,p&=65535,d+=t+o,d&=65535,l(m<<16|h,d<<16|p,this.unsigned)},D.subtract=function(e){return i(e)||(e=f(e)),this.add(e.neg())},D.sub=D.subtract,D.multiply=function(e){if(this.isZero())return y;if(i(e)||(e=f(e)),n)return l(n.mul(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned);if(e.isZero())return y;if(this.eq(E))return e.isOdd()?E:y;if(e.eq(E))return this.isOdd()?E:y;if(this.isNegative())return e.isNegative()?this.neg().mul(e.neg()):this.neg().mul(e).neg();if(e.isNegative())return this.mul(e.neg()).neg();if(this.lt(v)&&e.lt(v))return c(this.toNumber()*e.toNumber(),this.unsigned);var t=this.high>>>16,r=this.high&65535,a=this.low>>>16,o=this.low&65535,s=e.high>>>16,u=e.high&65535,d=e.low>>>16,p=e.low&65535,m=0,h=0,g=0,_=0;return _+=o*p,g+=_>>>16,_&=65535,g+=a*p,h+=g>>>16,g&=65535,g+=o*d,h+=g>>>16,g&=65535,h+=r*p,m+=h>>>16,h&=65535,h+=a*d,m+=h>>>16,h&=65535,h+=o*u,m+=h>>>16,h&=65535,m+=t*p+r*d+a*u+o*s,m&=65535,l(g<<16|_,m<<16|h,this.unsigned)},D.mul=D.multiply,D.divide=function(e){if(i(e)||(e=f(e)),e.isZero())throw Error(`division by zero`);if(n)return!this.unsigned&&this.high===-2147483648&&e.low===-1&&e.high===-1?this:l((this.unsigned?n.div_u:n.div_s)(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned);if(this.isZero())return this.unsigned?b:y;var t,r,a;if(this.unsigned){if(e.unsigned||(e=e.toUnsigned()),e.gt(this))return b;if(e.gt(this.shru(1)))return S;a=b}else{if(this.eq(E))return e.eq(x)||e.eq(C)?E:e.eq(E)?x:(t=this.shr(1).div(e).shl(1),t.eq(y)?e.isNegative()?x:C:(r=this.sub(e.mul(t)),a=t.add(r.div(e)),a));if(e.eq(E))return this.unsigned?b:y;if(this.isNegative())return e.isNegative()?this.neg().div(e.neg()):this.neg().div(e).neg();if(e.isNegative())return this.div(e.neg()).neg();a=y}for(r=this;r.gte(e);){t=Math.max(1,Math.floor(r.toNumber()/e.toNumber()));for(var o=Math.ceil(Math.log(t)/Math.LN2),s=o<=48?1:u(2,o-48),d=c(t),p=d.mul(e);p.isNegative()||p.gt(r);)t-=s,d=c(t,this.unsigned),p=d.mul(e);d.isZero()&&(d=x),a=a.add(d),r=r.sub(p)}return a},D.div=D.divide,D.modulo=function(e){return i(e)||(e=f(e)),n?l((this.unsigned?n.rem_u:n.rem_s)(this.low,this.high,e.low,e.high),n.get_high(),this.unsigned):this.sub(this.div(e).mul(e))},D.mod=D.modulo,D.rem=D.modulo,D.not=function(){return l(~this.low,~this.high,this.unsigned)},D.and=function(e){return i(e)||(e=f(e)),l(this.low&e.low,this.high&e.high,this.unsigned)},D.or=function(e){return i(e)||(e=f(e)),l(this.low|e.low,this.high|e.high,this.unsigned)},D.xor=function(e){return i(e)||(e=f(e)),l(this.low^e.low,this.high^e.high,this.unsigned)},D.shiftLeft=function(e){return i(e)&&(e=e.toInt()),(e&=63)==0?this:e<32?l(this.low<<e,this.high<<e|this.low>>>32-e,this.unsigned):l(0,this.low<<e-32,this.unsigned)},D.shl=D.shiftLeft,D.shiftRight=function(e){return i(e)&&(e=e.toInt()),(e&=63)==0?this:e<32?l(this.low>>>e|this.high<<32-e,this.high>>e,this.unsigned):l(this.high>>e-32,this.high>=0?0:-1,this.unsigned)},D.shr=D.shiftRight,D.shiftRightUnsigned=function(e){if(i(e)&&(e=e.toInt()),e&=63,e===0)return this;var t=this.high;if(e<32){var n=this.low;return l(n>>>e|t<<32-e,t>>>e,this.unsigned)}return l(e===32?t:t>>>e-32,0,this.unsigned)},D.shru=D.shiftRightUnsigned,D.shr_u=D.shiftRightUnsigned,D.toSigned=function(){return this.unsigned?l(this.low,this.high,!1):this},D.toUnsigned=function(){return this.unsigned?this:l(this.low,this.high,!0)},D.toBytes=function(e){return e?this.toBytesLE():this.toBytesBE()},D.toBytesLE=function(){var e=this.high,t=this.low;return[t&255,t>>>8&255,t>>>16&255,t>>>24,e&255,e>>>8&255,e>>>16&255,e>>>24]},D.toBytesBE=function(){var e=this.high,t=this.low;return[e>>>24,e>>>16&255,e>>>8&255,e&255,t>>>24,t>>>16&255,t>>>8&255,t&255]},r.fromBytes=function(e,t,n){return n?r.fromBytesLE(e,t):r.fromBytesBE(e,t)},r.fromBytesLE=function(e,t){return new r(e[0]|e[1]<<8|e[2]<<16|e[3]<<24,e[4]|e[5]<<8|e[6]<<16|e[7]<<24,t)},r.fromBytesBE=function(e,t){return new r(e[4]<<24|e[5]<<16|e[6]<<8|e[7],e[0]<<24|e[1]<<16|e[2]<<8|e[3],t)}}))()),Rr=Lr.default||Lr;function zr(e){return Rr.fromString(e,!0,16)}var Br=zr(`c3a5c85c97cb3127`),Vr=zr(`b492b66fbe98f273`),Hr=zr(`9ae16a3b2f90404f`);function Ur(e){return e.xor(e.shru(47))}function Wr(e,t,n){let r=e.slice(t,t+n);return Rr.fromBytes(Array.from(r),!0,!0)}function Gr(e,t){return Wr(e,t,8)}function Kr(e,t){return Wr(e,t,4)}function qr(e,t){return t===0?e:e.shru(t).or(e.shl(64-t))}function Jr(e,t,n=zr(`9ddfea08eb382d69`)){let r=e.xor(t).mul(n);r=r.xor(r.shru(47));let i=t.xor(r).mul(n);return i=i.xor(i.shru(47)),i=i.mul(n),i}function Yr(e,t,n,r,i,a){i=i.add(e),a=qr(a.add(i).add(r),21);let o=i;return i=i.add(t),i=i.add(n),a=a.add(qr(i,44)),[i.add(r),a.add(o)]}function Xr(e,t,n,r){return Yr(Gr(e,t),Gr(e,t+8),Gr(e,t+16),Gr(e,t+24),n,r)}function Zr(e,t=e.length){if(t>=8){let n=Hr.add(t*2),r=Gr(e,0).add(Hr),i=Gr(e,t-8);return Jr(qr(i,37).mul(n).add(r),qr(r,25).add(i).mul(n),n)}if(t>=4){let n=Hr.add(t*2);return Jr(Kr(e,0).shl(3).add(t),Kr(e,t-4),n)}if(t>0){let n=e[0],r=e[t>>1],i=e[t-1],a=n+(r<<8),o=t+(i<<2);return Ur(Hr.mul(a).xor(Br.mul(o))).mul(Hr)}return Hr}function Qr(e,t=e.length){let n=Hr.add(t*2),r=Gr(e,0).mul(Vr),i=Gr(e,8),a=Gr(e,t-8).mul(n),o=Gr(e,t-16).mul(Hr);return Jr(qr(r.add(i),43).add(qr(a,30)).add(o),r.add(qr(i.add(Hr),18)).add(a),n)}function $r(e,t=e.length){let n=Hr.add(t*2),r=Gr(e,0).mul(Hr),i=Gr(e,8),a=Gr(e,t-8).mul(n),o=Gr(e,t-16).mul(Hr),s=qr(r.add(i),43).add(qr(a,30)).add(o),c=Jr(s,r.add(qr(i.add(Hr),18)).add(a),n),l=Gr(e,16).mul(n),u=Gr(e,24),d=s.add(Gr(e,t-32)).mul(n),f=c.add(Gr(e,t-24)).mul(n);return Jr(qr(l.add(u),43).add(qr(d,30)).add(f),l.add(qr(u.add(r),18)).add(d),n)}function ei(e,t=e.length){let n=Rr.fromNumber(81,!0);if(t<=32)return t<=16?Zr(e,t):Qr(e,t);if(t<=64)return $r(e,t);let r=n,i=n.mul(Vr).add(113),a=Ur(i.mul(Hr).add(113)).mul(Hr),o=[Rr.UZERO,Rr.UZERO],s=[Rr.UZERO,Rr.UZERO];r=r.mul(Hr).add(Gr(e,0));let c=0,l=(t-1>>6)*64,u=l+(t-1&63)-63;do r=qr(r.add(i).add(o[0]).add(Gr(e,c+8)),37).mul(Vr),i=qr(i.add(o[1]).add(Gr(e,c+48)),42).mul(Vr),r=r.xor(s[1]),i=i.add(o[0]).add(Gr(e,c+40)),a=qr(a.add(s[0]),33).mul(Vr),o=Xr(e,c,o[1].mul(Vr),r.add(s[0])),s=Xr(e,c+32,a.add(s[1]),i.add(Gr(e,c+16))),[a,r]=[r,a],c+=64;while(c!==l);let d=Vr.add(a.and(255).shl(1));return c=u,s[0]=s[0].add(t-1&63),o[0]=o[0].add(s[0]),s[0]=s[0].add(o[0]),r=qr(r.add(i).add(o[0]).add(Gr(e,c+8)),37).mul(d),i=qr(i.add(o[1]).add(Gr(e,c+48)),42).mul(d),r=r.xor(s[1].mul(9)),i=i.add(o[0].mul(9).add(Gr(e,c+40))),a=qr(a.add(s[0]),33).mul(d),o=Xr(e,c,o[1].mul(d),r.add(s[0])),s=Xr(e,c+32,a.add(s[1]),i.add(Gr(e,c+16))),[a,r]=[r,a],Jr(Jr(o[0],s[0],d).add(Ur(i).mul(Br)).add(a),Jr(o[1],s[1],d).add(r),d)}function ti(e,t){return t===`string`?ai(e):ri([e],t)}function ni(e,t){return e instanceof Float32Array&&t===`float32`||e instanceof Int32Array&&t===`int32`||e instanceof Uint8Array&&t===`bool`}function ri(e,t){if(t===`string`)throw Error(`Cannot convert a string[] to a TypedArray`);if(Array.isArray(e)&&(e=ci(e)),j().getBool(`DEBUG`)&&ee(e,t),ni(e,t))return e;if(t==null||t===`float32`||t===`complex64`)return new Float32Array(e);if(t===`int32`)return new Int32Array(e);if(t===`bool`){let t=new Uint8Array(e.length);for(let n=0;n<t.length;++n)Math.round(e[n])!==0&&(t[n]=1);return t}throw Error(`Unknown data type ${t}`)}function ii(){return j().platform.now()}function ai(e,t=`utf-8`){return t||=`utf-8`,j().platform.encode(e,t)}function oi(e,t=`utf-8`){return t||=`utf-8`,j().platform.decode(e,t)}function si(e){return j().platform.isTypedArray==null?Ir(e):j().platform.isTypedArray(e)}function ci(e,t=[],n=!1){if(t??=[],typeof e==`boolean`||typeof e==`number`||typeof e==`string`||be(e)||e==null||si(e)&&n)t.push(e);else if(Array.isArray(e)||si(e))for(let r=0;r<e.length;++r)ci(e[r],t,n);else{let r=-1;for(let t of Object.keys(e))/^([1-9]+[0-9]*|0)$/.test(t)&&(r=Math.max(r,Number(t)));for(let i=0;i<=r;i++)ci(e[i],t,n)}return t}var li=class{constructor(e,t){this.backendTimer=e,this.logger=t,t??(this.logger=new di)}profileKernel(e,t,n){let r,i=()=>{r=n()},a,o=ii();if(this.backendTimer.timerAvailable())a=this.backendTimer.time(i);else{i();for(let e of r)e.dataSync();a=Promise.resolve({kernelMs:ii()-o})}if(j().getBool(`CHECK_COMPUTATION_FOR_ERRORS`))for(let t=0;t<r.length;t++){let n=r[t];n.data().then(t=>{ui(t,n.dtype,e)})}return{kernelName:e,outputs:r,inputs:t,timeMs:a.then(e=>e.kernelMs),extraInfo:a.then(e=>e.getExtraProfileInfo==null?``:e.getExtraProfileInfo())}}logKernelProfile(e){let{kernelName:t,outputs:n,timeMs:r,inputs:i,extraInfo:a}=e;n.forEach(e=>{Promise.all([e.data(),r,a]).then(n=>{this.logger.logKernelProfile(t,e,n[0],n[1],i,n[2])})})}};function ui(e,t,n){if(t!==`float32`)return!1;for(let t=0;t<e.length;t++){let r=e[t];if(isNaN(r)||!isFinite(r))return console.warn(`Found ${r} in the result of '${n}'`),!0}return!1}var di=class{logKernelProfile(e,t,n,r,i,a){let o=typeof r==`number`?C(`${r}ms`,9):r.error,s=C(e,25),c=t.rank,l=t.size,u=C(t.shape.toString(),14),d=``;for(let e in i){let n=i[e];if(n!=null){let r=n.shape||t.shape,i=r.length;d+=`${e}: ${i}D ${i>0?r:``} `}}console.log(`%c${s}\t%c${o}\t%c${c}D ${u}\t%c${l}\t%c${d}\t%c${a}`,`font-weight:bold`,`color:red`,`color:blue`,`color: orange`,`color: green`,`color: steelblue`)}};function fi(e,t,n){let r={},i={};for(let e=0;e<t.length;e++)r[t[e].id]=!0;for(let n=0;n<e.length;n++){let a=e[n],o=a.inputs;for(let e in o){let n=o[e],s=!1;for(let e=0;e<t.length;e++)if(r[n.id]){a.outputs.forEach(e=>r[e.id]=!0),s=!0,i[a.id]=!0;break}if(s)break}}let a={};a[n.id]=!0;let o={};for(let t=e.length-1;t>=0;t--){let n=e[t],r=n.inputs;for(let e=0;e<n.outputs.length;e++)if(a[n.outputs[e].id]){for(let e in r)a[r[e].id]=!0,o[n.id]=!0;break}}let s=[];for(let t=0;t<e.length;t++){let n=e[t];if(i[n.id]&&o[n.id]){let e={};for(let t in n.inputs){let i=n.inputs[t];r[i.id]&&(e[t]=i)}let t=Object.assign({},n);t.inputs=e,t.outputs=n.outputs,s.push(t)}}return s}function pi(e,t,n,r){for(let i=t.length-1;i>=0;i--){let a=t[i],o=[];if(a.outputs.forEach(t=>{let n=e[t.id];n==null?o.push(null):o.push(n)}),a.gradient==null)throw Error(`Cannot compute gradient: gradient function not found for ${a.kernelName}.`);let s=a.gradient(o);for(let t in a.inputs){if(!(t in s))throw Error(`Cannot backprop through input ${t}. Available gradients found: ${Object.keys(s)}.`);let i=n(()=>s[t]());if(i.dtype!==`float32`)throw Error(`Error in gradient for op ${a.kernelName}. The gradient of input ${t} must have 'float32' dtype, but has '${i.dtype}'`);let o=a.inputs[t];if(!b(i.shape,o.shape))throw Error(`Error in gradient for op ${a.kernelName}. The gradient of input '${t}' has shape '${i.shape}', which does not match the shape of the input '${o.shape}'`);if(e[o.id]==null)e[o.id]=i;else{let t=e[o.id];e[o.id]=r(t,i),t.dispose()}}}}var mi=20,hi=3,gi=7;function _i(e,t,n,r){let i=A(t),a=vi(e,t,n,i),o=t.length,s=xi(e,t,n,i,a),c=[`Tensor`];return r&&(c.push(`  dtype: ${n}`),c.push(`  rank: ${o}`),c.push(`  shape: [${t}]`),c.push(`  values:`)),c.push(s.map(e=>`    `+e).join(`
`)),c.join(`
`)}function vi(e,t,n,r){let i=y(t),a=r[r.length-1],o=Array(a).fill(0),s=t.length,c=n===`complex64`?Si(e):e;if(s>1)for(let e=0;e<i/a;e++){let t=e*a;for(let e=0;e<a;e++)o[e]=Math.max(o[e],yi(c[t+e],0,n).length)}return o}function yi(e,t,n){let r;return r=Array.isArray(e)?`${parseFloat(e[0].toFixed(gi))} + ${parseFloat(e[1].toFixed(gi))}j`:ae(e)?`'${e}'`:n===`bool`?bi(e):parseFloat(e.toFixed(gi)).toString(),C(r,t)}function bi(e){return e===0?`false`:`true`}function xi(e,t,n,r,i,a=!0){let o=n===`complex64`?2:1,s=t[0],c=t.length;if(c===0)return n===`complex64`?[yi(Si(e)[0],0,n)]:n===`bool`?[bi(e[0])]:[e[0].toString()];if(c===1){if(s>mi){let t=hi*o,r=Array.from(e.slice(0,t)),a=Array.from(e.slice((s-hi)*o,s*o));return n===`complex64`&&(r=Si(r),a=Si(a)),[`[`+r.map((e,t)=>yi(e,i[t],n)).join(`, `)+`, ..., `+a.map((e,t)=>yi(e,i[s-hi+t],n)).join(`, `)+`]`]}return[`[`+(n===`complex64`?Si(e):Array.from(e)).map((e,t)=>yi(e,i[t],n)).join(`, `)+`]`]}let l=t.slice(1),u=r.slice(1),d=r[0]*o,f=[];if(s>mi){for(let t=0;t<hi;t++){let r=t*d,a=r+d;f.push(...xi(e.slice(r,a),l,n,u,i,!1))}f.push(`...`);for(let t=s-hi;t<s;t++){let r=t*d,a=r+d;f.push(...xi(e.slice(r,a),l,n,u,i,t===s-1))}}else for(let t=0;t<s;t++){let r=t*d,a=r+d;f.push(...xi(e.slice(r,a),l,n,u,i,t===s-1))}let p=c===2?`,`:``;f[0]=`[`+(s>0?f[0]+p:``);for(let e=1;e<f.length-1;e++)f[e]=` `+f[e]+p;let m=`,
`;for(let e=2;e<c;e++)m+=`
`;return f[f.length-1]=` `+f[f.length-1]+`]`+(a?``:m),f}function Si(e){let t=[];for(let n=0;n<e.length;n+=2)t.push([e[n],e[n+1]]);return t}var Ci=class{constructor(e,t,n){if(this.dtype=t,this.shape=e.slice(),this.size=y(e),n!=null){let e=n.length;g(e===this.size,()=>`Length of values '${e}' does not match the size inferred by the shape '${this.size}'.`)}if(t===`complex64`)throw Error(`complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).`);this.values=n||k(t,this.size),this.strides=A(e)}set(e,...t){t.length===0&&(t=[0]),g(t.length===this.rank,()=>`The number of provided coordinates (${t.length}) must match the rank (${this.rank})`);let n=this.locToIndex(t);this.values[n]=e}get(...e){e.length===0&&(e=[0]);let t=0;for(let n of e){if(n<0||n>=this.shape[t]){let t=`Requested out of range element at ${e}.   Buffer shape=${this.shape}`;throw Error(t)}t++}let n=e[e.length-1];for(let t=0;t<e.length-1;++t)n+=this.strides[t]*e[t];return this.values[n]}locToIndex(e){if(this.rank===0)return 0;if(this.rank===1)return e[0];let t=e[e.length-1];for(let n=0;n<e.length-1;++n)t+=this.strides[n]*e[n];return t}indexToLoc(e){if(this.rank===0)return[];if(this.rank===1)return[e];let t=Array(this.shape.length);for(let n=0;n<t.length-1;++n)t[n]=Math.floor(e/this.strides[n]),e-=t[n]*this.strides[n];return t[t.length-1]=e,t}get rank(){return this.shape.length}toTensor(){return wi().makeTensor(this.values,this.shape,this.dtype)}},wi=null,Ti=null;function Ei(e){wi=e}function Di(e){Ti=e}var Oi=class{constructor(e,t,n,r){this.kept=!1,this.isDisposedInternal=!1,this.shape=e.slice(),this.dtype=t||`float32`,this.size=y(e),this.strides=A(e),this.dataId=n,this.id=r,this.rankType=this.rank<5?this.rank.toString():`higher`}get rank(){return this.shape.length}async buffer(){let e=await this.data();return Ti.buffer(this.shape,this.dtype,e)}bufferSync(){return Ti.buffer(this.shape,this.dtype,this.dataSync())}async array(){let e=await this.data();return fe(this.shape,e,this.dtype===`complex64`)}arraySync(){return fe(this.shape,this.dataSync(),this.dtype===`complex64`)}async data(){this.throwIfDisposed();let e=wi().read(this.dataId);if(this.dtype===`string`){let t=await e;try{return t.map(e=>oi(e))}catch{throw Error(`Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().`)}}return e}dataToGPU(e){return this.throwIfDisposed(),wi().readToGPU(this.dataId,e)}dataSync(){this.throwIfDisposed();let e=wi().readSync(this.dataId);if(this.dtype===`string`)try{return e.map(e=>oi(e))}catch{throw Error(`Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().`)}return e}async bytes(){this.throwIfDisposed();let e=await wi().read(this.dataId);return this.dtype===`string`?e:new Uint8Array(e.buffer)}dispose(){this.isDisposed||(this.kerasMask&&this.kerasMask.dispose(),wi().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw Error(`Tensor is disposed.`)}print(e=!1){return Ti.print(this,e)}clone(){return this.throwIfDisposed(),Ti.clone(this)}toString(e=!1){return _i(this.dataSync(),this.shape,this.dtype,e)}cast(e){return this.throwIfDisposed(),Ti.cast(this,e)}variable(e=!0,t,n){return this.throwIfDisposed(),wi().makeVariable(this,e,t,n)}};Object.defineProperty(Oi,Symbol.hasInstance,{value:e=>!!e&&e.data!=null&&e.dataSync!=null&&e.throwIfDisposed!=null});function M(){return je(`Tensor`,()=>Oi)}M();var ki=class extends Oi{constructor(e,t,n,r){super(e.shape,e.dtype,e.dataId,r),this.trainable=t,this.name=n}assign(e){if(e.dtype!==this.dtype)throw Error(`dtype of the new value (${e.dtype}) and previous value (${this.dtype}) must match`);if(!b(e.shape,this.shape))throw Error(`shape of the new value (${e.shape}) and previous value (${this.shape}) must match`);wi().disposeTensor(this),this.dataId=e.dataId,wi().incRef(this,null)}dispose(){wi().disposeVariable(this),this.isDisposedInternal=!0}};Object.defineProperty(ki,Symbol.hasInstance,{value:e=>e instanceof Oi&&e.assign!=null&&e.assign instanceof Function});var Ai;(function(e){e.R0=`R0`,e.R1=`R1`,e.R2=`R2`,e.R3=`R3`,e.R4=`R4`,e.R5=`R5`,e.R6=`R6`})(Ai||={});var ji;(function(e){e.float32=`float32`,e.int32=`int32`,e.bool=`int32`,e.complex64=`complex64`})(ji||={});var Mi;(function(e){e.float32=`float32`,e.int32=`int32`,e.bool=`bool`,e.complex64=`complex64`})(Mi||={});var Ni;(function(e){e.float32=`float32`,e.int32=`float32`,e.bool=`float32`,e.complex64=`complex64`})(Ni||={});var Pi;(function(e){e.float32=`complex64`,e.int32=`complex64`,e.bool=`complex64`,e.complex64=`complex64`})(Pi||={});var Fi={float32:Ni,int32:ji,bool:Mi,complex64:Pi};function Ii(e,t){if(e===`string`||t===`string`){if(e===`string`&&t===`string`)return`string`;throw Error(`Can not upcast ${e} with ${t}`)}return Fi[e][t]}function Li(e){return Ii(e,`int32`)}function Ri(e){return typeof e==`object`&&!!e&&`texture`in e&&e.texture instanceof WebGLTexture}function zi(e){return typeof GPUBuffer<`u`&&typeof e==`object`&&!!e&&`buffer`in e&&e.buffer instanceof GPUBuffer}function Bi(e,t){if(e.dtype===t.dtype)return[e,t];let n=Ii(e.dtype,t.dtype);return[e.cast(n),t.cast(n)]}function Vi(e,t){return t.some(t=>t.id===e.id)}function Hi(e){let t=[];return Ui(e,t,new Set),t}function Ui(e,t,n){if(e==null)return;if(e instanceof Oi){t.push(e);return}if(!Wi(e))return;let r=e;for(let e in r){let i=r[e];n.has(i)||(n.add(i),Ui(i,t,n))}}function Wi(e){return Array.isArray(e)||typeof e==`object`}function Gi(e){return e.kernelName!=null}var Ki=class{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(e=>e.name)))}}}dispose(){for(let e in this.registeredVariables)this.registeredVariables[e].dispose()}},qi=class e{constructor(e){this.ENV=e,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new Ki}async ready(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;let e=this.getSortedBackends();for(let t=0;t<e.length;t++){let n=e[t];if(await this.initializeBackend(n).success){await this.setBackend(n);return}}throw Error(`Could not initialize any backends, all backend initializations failed.`)}get backend(){if(this.pendingBackendInit!=null)throw Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){let{name:e,asyncInit:t}=this.initializeBackendsAndReturnBest();if(t)throw Error(`The highest priority backend '${e}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(e)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(e){if(!(e in this.registry))if(e in this.registryFactory){let{asyncInit:t}=this.initializeBackend(e);if(t)return null}else return null;return this.registry[e]}findBackendFactory(e){return e in this.registryFactory?this.registryFactory[e].factory:null}registerBackend(e,t,n=1){return e in this.registryFactory?(Er(`${e} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[e]={factory:t,priority:n},!0)}async setBackend(e){if(this.registryFactory[e]==null)throw Error(`Backend name '${e}' not found in registry`);if(this.backendName=e,this.registry[e]==null){this.backendInstance=null;let{success:t,asyncInit:n}=this.initializeBackend(e);if(!(n?await t:t))return!1}return this.backendInstance=this.registry[e],this.setupRegisteredKernels(),this.profiler=new li(this.backendInstance),!0}setupRegisteredKernels(){Mr(this.backendName).forEach(e=>{e.setupFunc!=null&&e.setupFunc(this.backendInstance)})}disposeRegisteredKernels(e){Mr(e).forEach(t=>{t.disposeFunc!=null&&t.disposeFunc(this.registry[e])})}initializeBackend(e){let t=this.registryFactory[e];if(t==null)throw Error(`Cannot initialize backend ${e}, no registration found.`);try{let n=t.factory();if(n&&!(n instanceof l)&&typeof n.then==`function`){let t=++this.pendingBackendInitId,r=n.then(n=>t<this.pendingBackendInitId?!1:(this.registry[e]=n,this.pendingBackendInit=null,!0)).catch(n=>t<this.pendingBackendInitId?!1:(this.pendingBackendInit=null,Er(`Initialization of backend ${e} failed`),Er(n.stack||n.message),!1));return this.pendingBackendInit=r,{success:r,asyncInit:!0}}return this.registry[e]=n,{success:!0,asyncInit:!1}}catch(t){return Er(`Initialization of backend ${e} failed`),Er(t.stack||t.message),{success:!1,asyncInit:!1}}}removeBackend(e){if(!(e in this.registryFactory))throw Error(`${e} backend not found in registry`);this.backendName===e&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,e in this.registry&&(this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e]),delete this.registryFactory[e],this.backendName===e&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw Error(`No backend found in registry.`);return Object.keys(this.registryFactory).sort((e,t)=>this.registryFactory[t].priority-this.registryFactory[e].priority)}initializeBackendsAndReturnBest(){let e=this.getSortedBackends();for(let t=0;t<e.length;t++){let n=e[t],{success:r,asyncInit:i}=this.initializeBackend(n);if(i||r)return{name:n,asyncInit:i}}throw Error(`Could not initialize any backends, all backend initializations failed.`)}moveData(e,t){let n=this.state.tensorInfo.get(t),r=n.backend,i=this.readSync(t),a=r.refCount(t);r.disposeData(t,!0),n.backend=e,e.move(t,i,n.shape,n.dtype,a),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(e,t){let n=null;if(t==null){if(typeof e!=`function`)throw Error(`Please provide a function to tidy()`);t=e}else{if(typeof e!=`string`&&!(e instanceof String))throw Error(`When calling with two arguments, the first argument to tidy() must be a string`);if(typeof t!=`function`)throw Error(`When calling with two arguments, the 2nd argument to tidy() must be a function`);n=e}let r;return this.scopedRun(()=>this.startScope(n),()=>this.endScope(r),()=>(r=t(),r instanceof Promise&&console.error(`Cannot return a Promise inside of tidy.`),r))}scopedRun(e,t,n){e();try{let e=n();return t(),e}catch(e){throw t(),e}}nextTensorId(){return e.nextTensorId++}nextVariableId(){return e.nextVariableId++}clone(e){let t=N.runKernel(zt,{x:e}),n={x:e};return this.addTapeNode(this.state.activeScope.name,n,[t],e=>({x:()=>{let t={x:e};return N.runKernel(Qe,t,{dtype:`float32`})}}),[],{}),t}runKernel(e,t,n){if(this.backendName??this.backend,Ar(e,this.backendName)==null)throw Error(`Kernel '${e}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:e,inputs:t,attrs:n})}shouldCheckForMemLeaks(){return this.ENV.getBool(`IS_TEST`)}checkKernelForMemLeak(e,t,n){let r=this.backend.numDataIds(),i=0;n.forEach(e=>{i+=e.dtype===`complex64`?3:1});let a=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],o=r-t-i-a;if(o>0)throw Error(`Backend '${this.backendName}' has an internal memory leak (${o} data ids) after running '${e}'`)}runKernelFunc(e){let t,n=[],r=this.isTapeOn(),i=this.state.numBytes,a=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let o;this.backendName??this.backend;let s,c=Gi(e)?e.kernelName:this.state.activeScope==null?``:this.state.activeScope.name;if(Gi(e)){let{kernelName:t,inputs:i,attrs:a}=e;this.backendName??this.backend;let c=Ar(t,this.backendName);g(c!=null,()=>`Cannot find registered kernel '${t}' for backend '${this.backendName}'`),o=()=>{let e=this.backend.numDataIds();s=c.kernelFunc({inputs:i,attrs:a,backend:this.backend});let o=Array.isArray(s)?s:[s];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(t,e,o);let l=o.map(e=>e.rank==null?this.makeTensorFromTensorInfo(e):e);if(r){let e=this.getTensorsForGradient(t,i,l);n=this.saveTensorsForBackwardMode(e)}return l}}else{let{forwardFunc:t}=e,i=e=>{r&&(n=e.map(e=>this.keep(this.clone(e))))};o=()=>{let e=this.backend.numDataIds();s=this.tidy(()=>t(this.backend,i));let n=Array.isArray(s)?s:[s];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(c,e,n),n}}let{inputs:l,attrs:u}=e,d=Gi(e)?null:e.backwardsFunc,f;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool(`DEBUG`)&&!this.state.profiling?t=o():(f=this.profiler.profileKernel(c,l,()=>o()),this.ENV.getBool(`DEBUG`)&&this.profiler.logKernelProfile(f),t=f.outputs)}),r&&this.addTapeNode(c,l,t,d,n,u),this.state.profiling&&this.state.activeProfile.kernels.push({name:c,bytesAdded:this.state.numBytes-i,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-a,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(l).map(e=>l[e]==null?null:l[e].shape),outputShapes:t.map(e=>e.shape),kernelTimeMs:f.timeMs,extraInfo:f.extraInfo}),Array.isArray(s)?t:t[0]}saveTensorsForBackwardMode(e){return e.map(e=>this.keep(this.clone(e)))}getTensorsForGradient(e,t,n){let r=jr(e);if(r!=null){let e=r.inputsToSave||[],i=r.outputsToSave||[],a;r.saveAllInputs?(g(Array.isArray(t),()=>`saveAllInputs is true, expected inputs to be an array.`),a=Object.keys(t).map(e=>t[e])):a=e.map(e=>t[e]);let o=n.filter((e,t)=>i[t]);return a.concat(o)}return[]}makeTensor(e,t,n,r){if(e==null)throw Error(`Values passed to engine.makeTensor() are null`);n||=`float32`,r||=this.backend;let i=e;n===`string`&&ae(e[0])&&(i=e.map(e=>ai(e)));let a=r.write(i,t,n),o=new Oi(t,n,a,this.nextTensorId());if(this.trackTensor(o,r),n===`string`){let e=this.state.tensorInfo.get(a),t=ie(i);this.state.numBytes+=t-e.bytes,e.bytes=t}return o}makeTensorFromDataId(e,t,n,r){n||=`float32`;let i={dataId:e,shape:t,dtype:n};return this.makeTensorFromTensorInfo(i,r)}makeTensorFromTensorInfo(e,t){let{dataId:n,shape:r,dtype:i}=e,a=new Oi(r,i,n,this.nextTensorId());return this.trackTensor(a,t),a}makeVariable(e,t=!0,n,r){n||=this.nextVariableId().toString(),r!=null&&r!==e.dtype&&(e=e.cast(r));let i=new ki(e,t,n,this.nextTensorId());if(this.state.registeredVariables[i.name]!=null)throw Error(`Variable with name ${i.name} was already registered`);return this.state.registeredVariables[i.name]=i,this.incRef(i,this.backend),i}trackTensor(e,t){this.state.numTensors++,e.dtype===`string`&&this.state.numStringTensors++;let n=0;e.dtype!==`complex64`&&e.dtype!==`string`&&(n=e.size*re(e.dtype)),this.state.numBytes+=n,this.state.tensorInfo.has(e.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(e.dataId,{backend:t||this.backend,dtype:e.dtype,shape:e.shape,bytes:n})),e instanceof ki||this.track(e)}incRef(e,t){this.trackTensor(e,t),this.backend.incRef(e.dataId)}removeDataId(e,t){this.state.tensorInfo.has(e)&&this.state.tensorInfo.get(e).backend===t&&(this.state.tensorInfo.delete(e),this.state.numDataBuffers--)}disposeTensor(e){if(!this.state.tensorInfo.has(e.dataId))return;let t=this.state.tensorInfo.get(e.dataId);if(this.state.numTensors--,e.dtype===`string`&&(this.state.numStringTensors--,this.state.numBytes-=t.bytes),e.dtype!==`complex64`&&e.dtype!==`string`){let t=e.size*re(e.dtype);this.state.numBytes-=t}t.backend.disposeData(e.dataId)&&this.removeDataId(e.dataId,t.backend)}disposeVariables(){for(let e in this.state.registeredVariables){let t=this.state.registeredVariables[e];this.disposeVariable(t)}}disposeVariable(e){this.disposeTensor(e),this.state.registeredVariables[e.name]!=null&&delete this.state.registeredVariables[e.name]}memory(){let e=this.backend.memory();return e.numTensors=this.state.numTensors,e.numDataBuffers=this.state.numDataBuffers,e.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(e.unreliable=!0,e.reasons??=[],e.reasons.push(`Memory usage by string tensors is approximate (2 bytes per character)`)),e}async profile(e){this.state.profiling=!0;let t=this.state.numBytes,n=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=await e(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(e=>e.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-t,this.state.activeProfile.newTensors=this.state.numTensors-n;for(let e of this.state.activeProfile.kernels)e.kernelTimeMs=await e.kernelTimeMs,e.extraInfo=await e.extraInfo;return this.state.activeProfile}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(e,t,n,r,i,a){let o={id:this.state.nextTapeNodeId++,kernelName:e,inputs:t,outputs:n,saved:i},s=jr(e);s!=null&&(r=s.gradFunc),r!=null&&(o.gradient=e=>(e=e.map((e,t)=>{if(e==null){let e=n[t],r=he(e.size,e.dtype);return this.makeTensor(r,e.shape,e.dtype)}return e}),r(e.length>1?e:e[0],i,a))),this.state.activeTape.push(o)}keep(e){return e.kept=!0,e}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(e){let t={track:[],name:`unnamed scope`,id:this.state.nextScopeId++};e&&(t.name=e),this.state.scopeStack.push(t),this.state.activeScope=t}endScope(e){let t=Hi(e),n=new Set(t.map(e=>e.id));for(let e=0;e<this.state.activeScope.track.length;e++){let t=this.state.activeScope.track[e];!t.kept&&!n.has(t.id)&&t.dispose()}let r=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],t.forEach(e=>{!e.kept&&e.scopeId===r.id&&this.track(e)})}gradients(e,t,n,r=!1){if(g(t.length>0,()=>`gradients() received an empty list of xs.`),n!=null&&n.dtype!==`float32`)throw Error(`dy must have 'float32' dtype, but has '${n.dtype}'`);let i=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy(`forward`,e));g(i instanceof Oi,()=>`The result y returned by f() must be a tensor.`);let a=fi(this.state.activeTape,t,i);if(!r&&a.length===0&&t.length>0)throw Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.`);return this.tidy(`backward`,()=>{let e={};e[i.id]=n??Ji(i.shape),pi(e,a,e=>this.tidy(e),Xi);let r=t.map(t=>e[t.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(e=>{for(let t of e.saved)t.dispose()}),this.state.activeTape=null),{value:i,grads:r}})}customGrad(e){return g(le(e),()=>`The f passed in customGrad(f) must be a function.`),(...t)=>{g(t.every(e=>e instanceof Oi),()=>`The args passed in customGrad(f)(x1, x2,...) must all be tensors`);let n,r={};return t.forEach((e,t)=>{r[t]=e}),this.runKernelFunc({forwardFunc:(r,i)=>(n=e(...t,i),g(n.value instanceof Oi,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),g(le(n.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),n.value),backwardsFunc:(e,r)=>{let i=n.gradFunc(e,r),a=Array.isArray(i)?i:[i];g(a.length===t.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),g(a.every(e=>e instanceof Oi),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");let o={};return a.forEach((e,t)=>{o[t]=()=>e}),o},inputs:r})}}readSync(e){return this.state.tensorInfo.get(e).backend.readSync(e)}read(e){return this.state.tensorInfo.get(e).backend.read(e)}readToGPU(e,t){return this.state.tensorInfo.get(e).backend.readToGPU(e,t)}async time(e){let t=ii(),n=await this.backend.time(e);return n.wallMs=ii()-t,n}track(e){return this.state.activeScope!=null&&(e.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(e)),e}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new Ki;for(let e in this.registry)this.disposeRegisteredKernels(e),this.registry[e].dispose(),delete this.registry[e];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}};qi.nextTensorId=0,qi.nextVariableId=0;function Ji(e){let t=me(y(e),`float32`);return N.makeTensor(t,e,`float32`)}function Yi(){let e=ke();return e._tfengine??=new qi(new Se(e)),De(e._tfengine.ENV),Ei(()=>e._tfengine),e._tfengine}var N=Yi();function Xi(e,t){let n={a:e,b:t};return N.runKernel(`Add`,n)}function Zi(){return typeof navigator<`u`&&navigator!=null}var Qi;function $i(e){if(Qi!==void 0)return Qi;if(e||Zi()){if(e||=navigator,e.product===`ReactNative`)return!0;let t=e.userAgent||e.vendor||(typeof window<`u`?window.opera:``);if(!t){let t=e;return t.userAgentData&&t.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))}return!1}function ea(){return typeof window<`u`&&window.document!=null||typeof WorkerGlobalScope<`u`}var ta=j();ta.registerFlag(`DEBUG`,()=>!1,e=>{e&&console.warn(`Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.`)}),ta.registerFlag(`IS_BROWSER`,()=>ea()),ta.registerFlag(`IS_NODE`,()=>typeof process<`u`&&process.versions!==void 0&&process.versions.node!==void 0),ta.registerFlag(`IS_CHROME`,()=>typeof navigator<`u`&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor)),ta.registerFlag(`IS_SAFARI`,()=>typeof navigator<`u`&&navigator!=null&&navigator.userAgent!=null&&/Safari/.test(navigator.userAgent)&&/Apple/.test(navigator.vendor)),ta.registerFlag(`PROD`,()=>!1),ta.registerFlag(`TENSORLIKE_CHECK_SHAPE_CONSISTENCY`,()=>ta.getBool(`DEBUG`)),ta.registerFlag(`DEPRECATION_WARNINGS_ENABLED`,()=>!0),ta.registerFlag(`IS_TEST`,()=>!1),ta.registerFlag(`CHECK_COMPUTATION_FOR_ERRORS`,()=>ta.getBool(`DEBUG`)),ta.registerFlag(`WRAP_TO_IMAGEBITMAP`,()=>!1),ta.registerFlag(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`,()=>!1),ta.registerFlag(`USE_SETTIMEOUTCUSTOM`,()=>!1);function na(e,t){let n=e;if(si(e))return t===`string`?[]:[e.length];if(Ri(e)){let t=e.channels||`RGBA`;return[e.height,e.width*t.length]}if(zi(e))return[e.buffer.size/(t==null?4:re(t))];if(!Array.isArray(e))return[];let r=[];for(;Array.isArray(n)||si(n)&&t!==`string`;)r.push(n.length),n=n[0];return Array.isArray(e)&&j().getBool(`TENSORLIKE_CHECK_SHAPE_CONSISTENCY`)&&ra(e,r,[]),r}function ra(e,t,n){if(n||=[],!Array.isArray(e)&&!si(e)){g(t.length===0,()=>`Element arr[${n.join(`][`)}] is a primitive, but should be an array/TypedArray of ${t[0]} elements`);return}g(t.length>0,()=>`Element arr[${n.join(`][`)}] should be a primitive, but is an array of ${e.length} elements`),g(e.length===t[0],()=>`Element arr[${n.join(`][`)}] should have ${t[0]} elements, but has ${e.length} elements`);let r=t.slice(1);for(let t=0;t<e.length;++t)ra(e[t],r,n.concat(t))}function ia(e,t,n,r){if(e!==`string_or_numeric`){if(e==null)throw Error(`Expected dtype cannot be null.`);if(e!==`numeric`&&e!==t||e===`numeric`&&t===`string`)throw Error(`Argument '${n}' passed to '${r}' must be ${e} tensor, but got ${t} tensor`)}}function P(e,t,n,r=`numeric`){if(e instanceof M())return ia(r,e.dtype,t,n),e;let i=ce(e);if(i!==`string`&&[`bool`,`int32`,`float32`].indexOf(r)>=0&&(i=r),ia(r,i,t,n),e==null||!si(e)&&!Array.isArray(e)&&typeof e!=`number`&&typeof e!=`boolean`&&typeof e!=`string`){let r=e==null?`null`:e.constructor.name;throw Error(`Argument '${t}' passed to '${n}' must be a Tensor or TensorLike, but got '${r}'`)}let a=na(e,i);!si(e)&&!Array.isArray(e)&&(e=[e]);let o=i===`string`?ci(e,[],!0):ri(e,i);return N.makeTensor(o,a,i)}function aa(e,t,n,r=`numeric`){if(!Array.isArray(e))throw Error(`Argument ${t} passed to ${n} must be a \`Tensor[]\` or \`TensorLike[]\``);return e.map((e,i)=>P(e,`${t}[${i}]`,n,r))}var oa=`__op`;function F(e){let t=Object.keys(e);if(t.length!==1)throw Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${t.length} keys.`);let n=t[0],r=e[n];n.endsWith(`_`)&&(n=n.substring(0,n.length-1)),n+=oa;let i=(...e)=>{N.startScope(n);try{let t=r(...e);return be(t)&&console.error(`Cannot return a Promise inside of tidy.`),N.endScope(t),t}catch(e){throw N.endScope(null),e}};return Object.defineProperty(i,"name",{value:n,configurable:!0}),i}function sa(e,t){let n=P(e,`real`,`complex`),r=P(t,`imag`,`complex`);_(n.shape,r.shape,`real and imag shapes, ${n.shape} and ${r.shape}, must match in call to tf.complex().`);let i={real:n,imag:r};return N.runKernel(tt,i)}var ca=F({complex_:sa});function la(e,t,n,r){if(r==null)r=ce(e);else if(r===`complex64`)throw Error(`Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).`);if(zi(e)||Ri(e)){if(r!==`float32`&&r!==`int32`)throw Error(`Creating tensor from GPU data only supports 'float32'|'int32' dtype, while the dtype is ${r}.`);return N.backend.createTensorFromGPUData(e,t||n,r)}if(!si(e)&&!Array.isArray(e)&&typeof e!=`number`&&typeof e!=`boolean`&&typeof e!=`string`)throw Error(`values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray`);if(t!=null){_e(t);let e=y(t),r=y(n);g(e===r,()=>`Based on the provided shape, [${t}], the tensor should have ${e} values but has ${r}`);for(let e=0;e<n.length;++e){let r=n[e],i=e!==n.length-1||r!==y(t.slice(e));g(n[e]===t[e]||!i,()=>`Error creating a new Tensor. Inferred shape (${n}) does not match the provided shape (${t}). `)}}return!si(e)&&!Array.isArray(e)&&(e=[e]),t||=n,e=r===`string`?ci(e,[],!0):ri(e,r),N.makeTensor(e,t,r)}function ua(e,t,n){return la(e,t,na(e,n),n)}var da=class e{static join(t){return new e(t).slice()}constructor(e){if(this.shards=[],this.previousShardIndex=0,e==null||(e instanceof Array||(e=[e]),e=e.map(e=>si(e)?e.buffer:e),e.length===0))return;this.bufferUniformSize=e[0].byteLength;let t=0;for(let n=0;n<e.length;n++){let r=e[n];n!==e.length-1&&r.byteLength!==this.bufferUniformSize&&(this.bufferUniformSize=void 0);let i=t+r.byteLength;this.shards.push({buffer:r,start:t,end:i}),t=i}this.shards.length===0&&(this.byteLength=0),this.byteLength=this.shards[this.shards.length-1].end}slice(e=0,t=this.byteLength){if(this.shards.length===0||(e=isNaN(Number(e))?0:e,t=isNaN(Number(t))?0:t,e=Math.max(0,e),t=Math.min(this.byteLength,t),t<=e))return new ArrayBuffer(0);let n=this.findShardForByte(e);if(n===-1)throw Error(`Could not find start shard for byte ${e}`);let r=t-e,i=new ArrayBuffer(r),a=new Uint8Array(i),o=0;for(let r=n;r<this.shards.length;r++){let n=this.shards[r],i=e+o-n.start,s=o,c=Math.min(t,n.end)-n.start,l=new Uint8Array(n.buffer,i,c-i);if(a.set(l,s),o+=l.length,t<n.end)break}return i}findShardForByte(e){if(this.shards.length===0||e<0||e>=this.byteLength)return-1;if(this.bufferUniformSize!=null)return this.previousShardIndex=Math.floor(e/this.bufferUniformSize),this.previousShardIndex;function t(t){return e<t.start?-1:+(e>=t.end)}if(t(this.shards[this.previousShardIndex])===0)return this.previousShardIndex;let n=fa(this.shards,t);return n===-1?-1:(this.previousShardIndex=n,this.previousShardIndex)}};function fa(e,t){let n=0,r=e.length;for(;n<=r;){let i=Math.floor((r-n)/2)+n,a=t(e[i]);if(a===0)return i;a<0?r=i:n=i+1}return-1}function pa(){return N}function ma(){return N.memory()}function I(e,t){return N.tidy(e,t)}function L(e){Hi(e).forEach(e=>e.dispose())}function ha(e){return N.keep(e)}function ga(e,t,n=1){return N.registerBackend(e,t,n)}function _a(){return N.backend}var va=4;async function ya(e,t){let n=[],r=[],i=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);for(let a=0;a<i.length;++a){let o=i[a],s=Array.isArray(e)?e[a].tensor:e[o];if(s.dtype!==`float32`&&s.dtype!==`int32`&&s.dtype!==`bool`&&s.dtype!==`string`&&s.dtype!==`complex64`)throw Error(`Unsupported dtype in weight '${o}': ${s.dtype}`);let c={name:o,shape:s.shape,dtype:s.dtype};if(s.dtype===`string`){let e=new Promise(async e=>{let t=await s.bytes(),n=t.reduce((e,t)=>e+t.length,0)+va*t.length,r=new Uint8Array(n),i=0;for(let e=0;e<t.length;e++){let n=t[e],a=new Uint8Array(new Uint32Array([n.length]).buffer);r.set(a,i),i+=va,r.set(n,i),i+=n.length}e(r)});r.push(e)}else r.push(s.data());t!=null&&(c.group=t),n.push(c)}return{data:ba(await Promise.all(r)),specs:n}}function ba(e){if(e===null)throw Error(`Invalid input value: ${JSON.stringify(e)}`);let t=0,n=[];e.forEach(e=>{if(t+=e.byteLength,n.push(e.byteLength===e.buffer.byteLength?e:new e.constructor(e)),!(e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array))throw Error(`Unsupported TypedArray subtype: ${e.constructor.name}`)});let r=new Uint8Array(t),i=0;return n.forEach(e=>{r.set(new Uint8Array(e.buffer),i),i+=e.byteLength}),r.buffer}var xa=typeof Buffer<`u`&&(typeof Blob>`u`||typeof atob>`u`||typeof btoa>`u`);function Sa(e){return xa?Buffer.byteLength(e,`utf8`):new Blob([e]).size}function Ca(e){if(xa)return Buffer.from(e).toString(`base64`);let t=new Uint8Array(e),n=``;for(let e=0,r=t.length;e<r;e++)n+=String.fromCharCode(t[e]);return btoa(n)}function wa(e){if(xa){let t=Buffer.from(e,`base64`);return t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength)}let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;++e)n.set([t.charCodeAt(e)],e);return n.buffer}function Ta(e){return da.join(e)}function Ea(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`Expected JSON model topology, received ArrayBuffer.`);return{dateSaved:new Date,modelTopologyType:`JSON`,modelTopologyBytes:e.modelTopology==null?0:Sa(JSON.stringify(e.modelTopology)),weightSpecsBytes:e.weightSpecs==null?0:Sa(JSON.stringify(e.weightSpecs)),weightDataBytes:e.weightData==null?0:new da(e.weightData).byteLength}}var Da=class e{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return e.instance??=new e,e.instance}static registerSaveRouter(t){e.getInstance().saveRouters.push(t)}static registerLoadRouter(t){e.getInstance().loadRouters.push(t)}static getSaveHandlers(t){return e.getHandlers(t,`save`)}static getLoadHandlers(t,n){return e.getHandlers(t,`load`,n)}static getHandlers(t,n,r){let i=[];return(n===`load`?e.getInstance().loadRouters:e.getInstance().saveRouters).forEach(e=>{let n=e(t,r);n!==null&&i.push(n)}),i}},Oa=e=>Da.getSaveHandlers(e),ka=`tensorflowjs`,Aa=1,ja=`models_store`,Ma=`model_info_store`;function Na(){if(!j().getBool(`IS_BROWSER`))throw Error(`Failed to obtain IndexedDB factory because the current environmentis not a web browser.`);let e=typeof window>`u`?self:window,t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB||e.shimIndexedDB;if(t==null)throw Error(`The current browser does not appear to support IndexedDB.`);return t}function Pa(e){let t=e.result;t.createObjectStore(ja,{keyPath:`modelPath`}),t.createObjectStore(Ma,{keyPath:`modelPath`})}var Fa=class{constructor(e){if(this.indexedDB=Na(),e==null||!e)throw Error(`For IndexedDB, modelPath must not be null, undefined or empty.`);this.modelPath=e}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserLocalStorage.save() does not support saving model topology in binary formats yet.`);return this.databaseAction(this.modelPath,e)}async load(){return this.databaseAction(this.modelPath)}databaseAction(e,t){return new Promise((e,n)=>{let r=this.indexedDB.open(ka,Aa);r.onupgradeneeded=()=>Pa(r),r.onsuccess=()=>{let i=r.result;if(t==null){let t=i.transaction(ja,`readonly`),r=t.objectStore(ja).get(this.modelPath);r.onsuccess=()=>{if(r.result==null)return i.close(),n(Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));e(r.result.modelArtifacts)},r.onerror=e=>(i.close(),n(r.error)),t.oncomplete=()=>i.close()}else{t.weightData=da.join(t.weightData);let r=Ea(t),a=i.transaction(Ma,`readwrite`),o=a.objectStore(Ma),s;try{s=o.put({modelPath:this.modelPath,modelArtifactsInfo:r})}catch(e){return n(e)}let c;s.onsuccess=()=>{c=i.transaction(ja,`readwrite`);let s=c.objectStore(ja),l;try{l=s.put({modelPath:this.modelPath,modelArtifacts:t,modelArtifactsInfo:r})}catch(e){return n(e)}l.onsuccess=()=>e({modelArtifactsInfo:r}),l.onerror=e=>{o=a.objectStore(Ma);let t=o.delete(this.modelPath);t.onsuccess=()=>(i.close(),n(l.error)),t.onerror=e=>(i.close(),n(l.error))}},s.onerror=e=>(i.close(),n(s.error)),a.oncomplete=()=>{c==null?i.close():c.oncomplete=()=>i.close()}}},r.onerror=e=>n(r.error)})}};Fa.URL_SCHEME=`indexeddb://`;var Ia=e=>j().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(Fa.URL_SCHEME)?La(e.slice(Fa.URL_SCHEME.length)):null;Da.registerSaveRouter(Ia),Da.registerLoadRouter(Ia);function La(e){return new Fa(e)}function Ra(e){return e.startsWith(Fa.URL_SCHEME)?e.slice(Fa.URL_SCHEME.length):e}var za=class{constructor(){this.indexedDB=Na()}async listModels(){return new Promise((e,t)=>{let n=this.indexedDB.open(ka,Aa);n.onupgradeneeded=()=>Pa(n),n.onsuccess=()=>{let r=n.result,i=r.transaction(Ma,`readonly`),a=i.objectStore(Ma).getAll();a.onsuccess=()=>{let t={};for(let e of a.result)t[e.modelPath]=e.modelArtifactsInfo;e(t)},a.onerror=e=>(r.close(),t(a.error)),i.oncomplete=()=>r.close()},n.onerror=e=>t(n.error)})}async removeModel(e){return e=Ra(e),new Promise((t,n)=>{let r=this.indexedDB.open(ka,Aa);r.onupgradeneeded=()=>Pa(r),r.onsuccess=()=>{let i=r.result,a=i.transaction(Ma,`readwrite`),o=a.objectStore(Ma),s=o.get(e),c;s.onsuccess=()=>{if(s.result==null)return i.close(),n(Error(`Cannot find model with path '${e}' in IndexedDB.`));{let r=o.delete(e),a=()=>{c=i.transaction(ja,`readwrite`);let r=c.objectStore(ja).delete(e);r.onsuccess=()=>t(s.result.modelArtifactsInfo),r.onerror=e=>n(s.error)};r.onsuccess=a,r.onerror=e=>(a(),i.close(),n(s.error))}},s.onerror=e=>(i.close(),n(s.error)),a.oncomplete=()=>{c==null?i.close():c.oncomplete=()=>i.close()}},r.onerror=e=>n(r.error)})}},Ba=`/`,Va=`tensorflowjs_models`,Ha=`info`,Ua=`model_topology`,Wa=`weight_specs`,Ga=`weight_data`,Ka=`model_metadata`;function qa(e){return{info:[Va,e,Ha].join(Ba),topology:[Va,e,Ua].join(Ba),weightSpecs:[Va,e,Wa].join(Ba),weightData:[Va,e,Ga].join(Ba),modelMetadata:[Va,e,Ka].join(Ba)}}function Ja(e){for(let t of Object.values(e))window.localStorage.removeItem(t)}function Ya(e){let t=e.split(Ba);if(t.length<3)throw Error(`Invalid key format: ${e}`);return t.slice(1,t.length-1).join(Ba)}function Xa(e){return e.startsWith(Za.URL_SCHEME)?e.slice(Za.URL_SCHEME.length):e}var Za=class{constructor(e){if(!j().getBool(`IS_BROWSER`)||typeof window>`u`||window.localStorage===void 0)throw Error(`The current environment does not support local storage.`);if(this.LS=window.localStorage,e==null||!e)throw Error(`For local storage, modelPath must not be null, undefined or empty.`);this.modelPath=e,this.keys=qa(this.modelPath)}async save(e){if(e.modelTopology instanceof ArrayBuffer)throw Error(`BrowserLocalStorage.save() does not support saving model topology in binary formats yet.`);{let t=JSON.stringify(e.modelTopology),n=JSON.stringify(e.weightSpecs),r=Ea(e),i=da.join(e.weightData);try{this.LS.setItem(this.keys.info,JSON.stringify(r)),this.LS.setItem(this.keys.topology,t),this.LS.setItem(this.keys.weightSpecs,n),this.LS.setItem(this.keys.weightData,Ca(i));let a={format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,signature:e.signature==null?void 0:e.signature,userDefinedMetadata:e.userDefinedMetadata==null?void 0:e.userDefinedMetadata,modelInitializer:e.modelInitializer==null?void 0:e.modelInitializer,initializerSignature:e.initializerSignature==null?void 0:e.initializerSignature,trainingConfig:e.trainingConfig==null?void 0:e.trainingConfig};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(a)),{modelArtifactsInfo:r}}catch{throw Ja(this.keys),Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${r.modelTopologyBytes}, weightSpecsBytes=${r.weightSpecsBytes}, weightDataBytes=${r.weightDataBytes}.`)}}}async load(){let e=JSON.parse(this.LS.getItem(this.keys.info));if(e==null)throw Error(`In local storage, there is no model with name '${this.modelPath}'`);if(e.modelTopologyType!==`JSON`)throw Error(`BrowserLocalStorage does not support loading non-JSON model topology yet.`);let t={},n=JSON.parse(this.LS.getItem(this.keys.topology));if(n==null)throw Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);t.modelTopology=n;let r=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(r==null)throw Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);t.weightSpecs=r;let i=this.LS.getItem(this.keys.modelMetadata);if(i!=null){let e=JSON.parse(i);t.format=e.format,t.generatedBy=e.generatedBy,t.convertedBy=e.convertedBy,e.signature!=null&&(t.signature=e.signature),e.userDefinedMetadata!=null&&(t.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(t.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(t.initializerSignature=e.initializerSignature),e.trainingConfig!=null&&(t.trainingConfig=e.trainingConfig)}let a=this.LS.getItem(this.keys.weightData);if(a==null)throw Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return t.weightData=wa(a),t}};Za.URL_SCHEME=`localstorage://`;var Qa=e=>j().getBool(`IS_BROWSER`)&&!Array.isArray(e)&&e.startsWith(Za.URL_SCHEME)?$a(e.slice(Za.URL_SCHEME.length)):null;Da.registerSaveRouter(Qa),Da.registerLoadRouter(Qa);function $a(e){return new Za(e)}var eo=class{constructor(){g(j().getBool(`IS_BROWSER`),()=>`Current environment is not a web browser`),g(typeof window>`u`||window.localStorage!==void 0,()=>`Current browser does not appear to support localStorage`),this.LS=window.localStorage}async listModels(){let e={};for(let t=0;t<this.LS.length;++t){let n=this.LS.key(t);if(n.startsWith(`tensorflowjs_models/`)&&n.endsWith(`/info`)){let t=Ya(n);e[t]=JSON.parse(this.LS.getItem(n))}}return e}async removeModel(e){e=Xa(e);let t=qa(e);if(this.LS.getItem(t.info)==null)throw Error(`Cannot find model at path '${e}'`);let n=JSON.parse(this.LS.getItem(t.info));return Ja(t),n}},to=`://`,no=class e{constructor(){this.managers={}}static getInstance(){return e.instance??=new e,e.instance}static registerManager(t,n){g(t!=null,()=>`scheme must not be undefined or null.`),t.endsWith(to)&&(t=t.slice(0,t.indexOf(to))),g(t.length>0,()=>`scheme must not be an empty string.`);let r=e.getInstance();g(r.managers[t]==null,()=>`A model store manager is already registered for scheme '${t}'.`),r.managers[t]=n}static getManager(t){let n=e.getInstance().managers[t];if(n==null)throw Error(`Cannot find model manager for scheme '${t}'`);return n}static getSchemes(){return Object.keys(e.getInstance().managers)}},ro=class{constructor(){this.messageName=`setTimeoutCustom`,this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(e,t){return fetch(e,t)}now(){return performance.now()}encode(e,t){if(t!==`utf-8`&&t!==`utf8`)throw Error(`Browser's encoder only supports utf-8, but got ${t}`);return this.textEncoder??=new TextEncoder,this.textEncoder.encode(e)}decode(e,t){return new TextDecoder(t).decode(e)}setTimeoutCustom(e,t){if(typeof window>`u`||!j().getBool(`USE_SETTIMEOUTCUSTOM`)){setTimeout(e,t);return}this.functionRefs.push(e),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},`*`)},t),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener(`message`,e=>{if(e.source===window&&e.data.name===this.messageName){e.stopPropagation();let t=this.functionRefs[e.data.index];t(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}isTypedArray(e){return Ir(e)}};if(j().get(`IS_BROWSER`)){j().setPlatform(`browser`,new ro);try{no.registerManager(Za.URL_SCHEME,new eo)}catch{}try{no.registerManager(Fa.URL_SCHEME,new za)}catch{}}var io={importFetch:()=>a()},ao,oo=class{constructor(){this.util=a(),this.textEncoder=new this.util.TextEncoder}fetch(e,t){return j().global.fetch==null?(ao??=io.importFetch(),ao(e,t)):j().global.fetch(e,t)}now(){let e=process.hrtime();return e[0]*1e3+e[1]/1e6}encode(e,t){if(t!==`utf-8`&&t!==`utf8`)throw Error(`Node built-in encoder only supports utf-8, but got ${t}`);return this.textEncoder.encode(e)}decode(e,t){return e.length===0?``:new this.util.TextDecoder(t).decode(e)}isTypedArray(e){return this.util.types.isFloat32Array(e)||this.util.types.isInt32Array(e)||this.util.types.isUint8Array(e)||this.util.types.isUint8ClampedArray(e)}};j().get(`IS_NODE`)&&!j().get(`IS_BROWSER`)&&j().setPlatform(`node`,new oo);function so(e,t=`float32`,n){return t||=`float32`,_e(e),new Ci(e,t,n)}function co(e,t){let n=P(e,`x`,`cast`);if(!te(t))throw Error(`Failed to cast to unknown dtype ${t}`);if(t===`string`&&n.dtype!==`string`||t!==`string`&&n.dtype===`string`)throw Error(`Only strings can be casted to strings`);let r={x:n},i={dtype:t};return N.runKernel(Qe,r,i)}var R=F({cast_:co});function lo(e){let t={x:P(e,`x`,`clone`,`string_or_numeric`)};return N.runKernel(zt,t)}var uo=F({clone_:lo});function fo(e,t=!1){console.log(e.toString(t))}Yi(),Di({buffer:so,cast:R,clone:uo,print:fo});function po(e,t){let n=P(e,`a`,`add`),r=P(t,`b`,`add`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(`Add`,i)}var z=F({add_:po});function mo(e,t){let n=P(e,`a`,`floorDiv`),r=P(t,`b`,`floorDiv`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(Nt,i)}var ho=F({floorDiv_:mo});function go(e,t){let n=P(e,`a`,`div`),r=P(t,`b`,`div`);if([n,r]=Bi(n,r),n.dtype===`int32`&&r.dtype===`int32`)return ho(n,r);let i={a:n,b:r};return N.runKernel(wt,i,{})}var B=F({div_:go});function _o(e,t){let n=P(e,`a`,`mul`),r=P(t,`b`,`mul`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(fn,i)}var V=F({mul_:_o});function vo(e){let t=P(e,`x`,`abs`);if(t.dtype===`complex64`){let e={x:t};return N.runKernel(nt,e)}{let e={x:t};return N.runKernel(`Abs`,e)}}var yo=F({abs_:vo});function bo(e){let t={x:P(e,`x`,`acos`)};return N.runKernel(Me,t)}var xo=F({acos_:bo});function So(e){let t={x:P(e,`x`,`acosh`)};return N.runKernel(Ne,t)}var Co=F({acosh_:So});function wo(e,t=null,n=!1){let r={x:P(e,`x`,`all`,`bool`)},i={axis:t,keepDims:n};return N.runKernel(`All`,r,i)}var To=F({all_:wo});function Eo(e,t=null,n=!1){let r={x:P(e,`x`,`any`,`bool`)},i={axis:t,keepDims:n};return N.runKernel(`Any`,r,i)}var Do=F({any_:Eo});function Oo(e,t=0){let n={x:P(e,`x`,`argMax`)},r={axis:t};return N.runKernel(Fe,n,r)}var ko=F({argMax_:Oo});function Ao(e,t=0){let n={x:P(e,`x`,`argMin`)},r={axis:t};return N.runKernel(Ie,n,r)}var jo=F({argMin_:Ao});function Mo(e){let t={x:P(e,`x`,`asin`)};return N.runKernel(Le,t)}var No=F({asin_:Mo});function Po(e){let t={x:P(e,`x`,`asinh`)};return N.runKernel(Re,t)}var Fo=F({asinh_:Po});function Io(e){let t={x:P(e,`x`,`atan`)};return N.runKernel(ze,t)}var Lo=F({atan_:Io});function Ro(e,t){let n=P(e,`a`,`atan2`),r=P(t,`b`,`atan2`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(Ve,i)}var zo=F({atan2_:Ro});function Bo(e){let t={x:P(e,`x`,`atanh`)};return N.runKernel(Be,t)}var Vo=F({atanh_:Bo});function Ho(e,t,n,r,i=`NHWC`,a){let o=e[3];return Go(e,[...t,o],n,a,r,null,null,as(i))}function Uo(e,t,n,r,i,a,o=`channelsLast`){let[s,c]=Xo(t),l;if(o===`channelsLast`)l=[s,c,e[3],e[3]];else if(o===`channelsFirst`)l=[s,c,e[1],e[1]];else throw Error(`Unknown dataFormat ${o}`);return Go(e,l,n,r,i,a,!1,o)}function Wo(e,t,n,r,i,a,o=`NDHWC`){let[s,c,l]=Zo(t),u,d;if(o===`NDHWC`)d=`channelsLast`,u=[s,c,l,e[4],e[4]];else if(o===`NCDHW`)d=`channelsFirst`,u=[s,c,l,e[1],e[1]];else throw Error(`Unknown dataFormat ${o}`);return Ko(e,u,n,r,i,!1,d,a)}function Go(e,t,n,r,i,a,o=!1,s=`channelsLast`){let[c,l,u,d]=[-1,-1,-1,-1];if(s===`channelsLast`)[c,l,u,d]=e;else if(s===`channelsFirst`)[c,d,l,u]=e;else throw Error(`Unknown dataFormat ${s}`);let[f,p,,m]=t,[h,g]=Xo(n),[_,v]=Xo(r),y=Qo(f,_),b=Qo(p,v),{padInfo:x,outHeight:S,outWidth:C}=$o(i,l,u,h,g,y,b,a,s),w=o?m*d:m,T;return s===`channelsFirst`?T=[c,w,S,C]:s===`channelsLast`&&(T=[c,S,C,w]),{batchSize:c,dataFormat:s,inHeight:l,inWidth:u,inChannels:d,outHeight:S,outWidth:C,outChannels:w,padInfo:x,strideHeight:h,strideWidth:g,filterHeight:f,filterWidth:p,effectiveFilterHeight:y,effectiveFilterWidth:b,dilationHeight:_,dilationWidth:v,inShape:e,outShape:T,filterShape:t}}function Ko(e,t,n,r,i,a=!1,o=`channelsLast`,s){let[c,l,u,d,f]=[-1,-1,-1,-1,-1];if(o===`channelsLast`)[c,l,u,d,f]=e;else if(o===`channelsFirst`)[c,f,l,u,d]=e;else throw Error(`Unknown dataFormat ${o}`);let[p,m,h,,g]=t,[_,v,y]=Zo(n),[b,x,S]=Zo(r),C=Qo(p,b),w=Qo(m,x),T=Qo(h,S),{padInfo:E,outDepth:D,outHeight:O,outWidth:k}=es(i,l,u,d,_,v,y,C,w,T,s),ee=a?g*f:g,te;return o===`channelsFirst`?te=[c,ee,D,O,k]:o===`channelsLast`&&(te=[c,D,O,k,ee]),{batchSize:c,dataFormat:o,inDepth:l,inHeight:u,inWidth:d,inChannels:f,outDepth:D,outHeight:O,outWidth:k,outChannels:ee,padInfo:E,strideDepth:_,strideHeight:v,strideWidth:y,filterDepth:p,filterHeight:m,filterWidth:h,effectiveFilterDepth:C,effectiveFilterHeight:w,effectiveFilterWidth:T,dilationDepth:b,dilationHeight:x,dilationWidth:S,inShape:e,outShape:te,filterShape:t}}function qo(e,t,n,r,i){r??=Yo(e,t,n);let a=e[0],o=e[1];return[ts((a-t+2*r)/n+1,i),ts((o-t+2*r)/n+1,i)]}function Jo(e,t,n,r,i,a){i??=Yo(e,t[0],r[0]);let o=[0,0,0,n];for(let n=0;n<3;n++)e[n]+2*i>=t[n]&&(o[n]=ts((e[n]-t[n]+2*i)/r[n]+1,a));return o}function Yo(e,t,n,r=1){let i=Qo(t,r);return Math.floor((e[0]*(n-1)-n+i)/2)}function Xo(e){return typeof e==`number`?[e,e,e]:e.length===2?[e[0],e[1],1]:e}function Zo(e){return typeof e==`number`?[e,e,e]:e}function Qo(e,t){return t<=1?e:e+(e-1)*(t-1)}function $o(e,t,n,r,i,a,o,s,c){let l,u,d;if(typeof e==`number`){l={top:e,bottom:e,left:e,right:e,type:e===0?`VALID`:`NUMBER`};let i=qo([t,n],a,r,e,s);u=i[0],d=i[1]}else if(e===`same`){u=Math.ceil(t/r),d=Math.ceil(n/i);let e=Math.max(0,(u-1)*r+a-t),s=Math.max(0,(d-1)*i+o-n),c=Math.floor(e/2),f=e-c,p=Math.floor(s/2);l={top:c,bottom:f,left:p,right:s-p,type:`SAME`}}else if(e===`valid`)l={top:0,bottom:0,left:0,right:0,type:`VALID`},u=Math.ceil((t-a+1)/r),d=Math.ceil((n-o+1)/i);else if(typeof e==`object`){let f=c===`channelsLast`?e[1][0]:e[2][0],p=c===`channelsLast`?e[1][1]:e[2][1],m=c===`channelsLast`?e[2][0]:e[3][0],h=c===`channelsLast`?e[2][1]:e[3][1];l={top:f,bottom:p,left:m,right:h,type:f===0&&p===0&&m===0&&h===0?`VALID`:`EXPLICIT`},u=ts((t-a+f+p)/r+1,s),d=ts((n-o+m+h)/i+1,s)}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:l,outHeight:u,outWidth:d}}function es(e,t,n,r,i,a,o,s,c,l,u){let d,f,p,m;if(e===`valid`&&(e=0),typeof e==`number`){d={top:e,bottom:e,left:e,right:e,front:e,back:e,type:e===0?`VALID`:`NUMBER`};let h=Jo([t,n,r,1],[s,c,l],1,[i,a,o],e,u);f=h[0],p=h[1],m=h[2]}else if(e===`same`){f=Math.ceil(t/i),p=Math.ceil(n/a),m=Math.ceil(r/o);let e=(f-1)*i+s-t,u=(p-1)*a+c-n,h=(m-1)*o+l-r,g=Math.floor(e/2),_=e-g,v=Math.floor(u/2),y=u-v,b=Math.floor(h/2);d={top:v,bottom:y,left:b,right:h-b,front:g,back:_,type:`SAME`}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:d,outDepth:f,outHeight:p,outWidth:m}}function ts(e,t){if(!t)return Math.trunc(e);switch(t){case`round`:return Math.round(e);case`ceil`:return Math.ceil(e);case`floor`:return Math.floor(e);default:throw Error(`Unknown roundingMode ${t}`)}}function ns(e){let[t,n,r]=Xo(e);return t===1&&n===1&&r===1}function rs(e,t){return ns(e)||ns(t)}function is(e){return Xo(e).every(e=>e>0)}function as(e){if(e===`NHWC`)return`channelsLast`;if(e===`NCHW`)return`channelsFirst`;throw Error(`Unknown dataFormat ${e}`)}function os(e,t,n){if(n!=null){if(typeof t==`string`)throw Error(`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);if(typeof t==`number`)g(x(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);else if(typeof t==`object`)t.forEach(t=>{t.forEach(t=>{g(x(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`)})});else throw Error(`Error in ${e}: Unknown padding parameter: ${t}`)}}function ss(e,t){let n={x:P(e,`x`,`reshape`,`string_or_numeric`)},r={shape:t};return N.runKernel(An,n,r)}var H=F({reshape_:ss});function cs(e,t,n,r,i){let a=P(e,`x`,`avgPool`,`float32`);g(rs(n,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${n} and dilations '1'`);let o=a,s=!1;a.rank===3&&(s=!0,o=H(a,[1,a.shape[0],a.shape[1],a.shape[2]])),g(o.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${o.rank}.`),os(`avgPool`,r,i);let c={x:o},l={filterSize:t,strides:n,pad:r,dimRoundingMode:i},u=N.runKernel(He,c,l);return u=R(u,a.dtype),s?H(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var ls=F({avgPool_:cs});function us(e,t,n,r,i,a=`NDHWC`){let o=P(e,`x`,`avgPool3d`,`float32`),s=o,c=!1;o.rank===4&&(c=!0,s=H(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),g(s.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${s.rank}.`),g(a===`NDHWC`,()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),g(typeof n==`number`&&n>0||Array.isArray(n)&&n[0]>0&&n[1]>0&&n[2]>0,()=>`Error in avgPool3d: Stride must be > 0, but got '${n}'`),os(`avgPool3d`,r,i);let l={x:s},u={filterSize:t,strides:n,pad:r,dimRoundingMode:i,dataFormat:a},d=N.runKernel(We,l,u);return d=R(d,s.dtype),c?H(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}var ds=F({avgPool3d_:us});function fs(e,t=0){g(e.length>=1,()=>`Pass at least one tensor to concat`);let n=aa(e,`tensors`,`concat`,`string_or_numeric`);if(n[0].dtype===`complex64`&&n.forEach(e=>{if(e.dtype!==`complex64`)throw Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${e.dtype}. `)}),n.length===1)return uo(n[0]);let r=n,i={axis:t};return N.runKernel(rt,r,i)}var ps=F({concat_:fs});function ms(e,t,n=!1,r=!1){let i=P(e,`a`,`matMul`),a=P(t,`b`,`matMul`);[i,a]=Bi(i,a);let o={a:i,b:a},s={transposeA:n,transposeB:r};return N.runKernel(Ke,o,s)}var hs=F({matMul_:ms});function gs(e){let t={x:P(e,`x`,`sigmoid`,`float32`)};return N.runKernel(qn,t)}var _s=F({sigmoid_:gs});function vs(e,t,n){let r=P(e,`x`,`slice`,`string_or_numeric`);if(r.rank===0)throw Error(`Slicing scalar is not possible`);let i={x:r},a={begin:t,size:n};return N.runKernel(Wn,i,a)}var ys=F({slice_:vs});function bs(e){let t={x:P(e,`x`,`tanh`,`float32`)};return N.runKernel(dr,t)}var xs=F({tanh_:bs});function Ss(e,t,n){let r=P(e,`x`,`batchToSpaceND`),i=t.reduce((e,t)=>e*t);g(r.rank>=1+t.length,()=>`input rank is ${r.rank} but should be > than blockShape.length ${t.length}`),g(n.length===t.length,()=>`crops.length is ${n.length} but should be equal to blockShape.length  ${t.length}`),g(r.shape[0]%i===0,()=>`input tensor batch is ${r.shape[0]} but is not divisible by the product of the elements of blockShape ${t.join(` * `)} === ${i}`);let a={x:r},o={blockShape:t,crops:n};return N.runKernel(qe,a,o)}var Cs=F({batchToSpaceND_:Ss});function ws(e){let t;return t=e.rank===0||e.rank===1?H(e,[1,1,1,e.size]):e.rank===2?H(e,[1,1,e.shape[0],e.shape[1]]):e.rank===3?H(e,[1,e.shape[0],e.shape[1],e.shape[2]]):e,t}function Ts(e,t,n,r,i,a){a??=.001;let o=P(e,`x`,`batchNorm`),s=P(t,`mean`,`batchNorm`),c=P(n,`variance`,`batchNorm`),l;i!=null&&(l=P(i,`scale`,`batchNorm`));let u;r!=null&&(u=P(r,`offset`,`batchNorm`)),g(s.rank===c.rank,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),g(u==null||s.rank===u.rank,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),g(l==null||s.rank===l.rank,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`);let d={x:ws(o),scale:l,offset:u,mean:s,variance:c},f={varianceEpsilon:a};return H(N.runKernel(Pt,d,f),o.shape)}var Es=F({batchNorm_:Ts});function Ds(e,t,n,r,i,a){let o=P(e,`x`,`batchNorm`),s=P(t,`mean`,`batchNorm`),c=P(n,`variance`,`batchNorm`),l;i!=null&&(l=P(i,`scale`,`batchNorm`));let u;return r!=null&&(u=P(r,`offset`,`batchNorm`)),g(o.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${o.rank}.`),g(s.rank===2||s.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${s.rank}.`),g(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${c.rank}.`),l!=null&&g(l.rank===2||l.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${l.rank}.`),u!=null&&g(u.rank===2||u.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${u.rank}.`),Es(o,s,c,u,l,a)}var Os=F({batchNorm2d_:Ds});function ks(e,t,n,r,i,a){let o=P(e,`x`,`batchNorm`),s=P(t,`mean`,`batchNorm`),c=P(n,`variance`,`batchNorm`),l;i!=null&&(l=P(i,`scale`,`batchNorm`));let u;return r!=null&&(u=P(r,`offset`,`batchNorm`)),g(o.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${o.rank}.`),g(s.rank===3||s.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${s.rank}.`),g(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${c.rank}.`),l!=null&&g(l.rank===3||l.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${l.rank}.`),u!=null&&g(u.rank===3||u.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${u.rank}.`),Es(o,s,c,u,l,a)}var As=F({batchNorm3d_:ks});function js(e,t,n,r,i,a){let o=P(e,`x`,`batchNorm`),s=P(t,`mean`,`batchNorm`),c=P(n,`variance`,`batchNorm`),l;i!=null&&(l=P(i,`scale`,`batchNorm`));let u;return r!=null&&(u=P(r,`offset`,`batchNorm`)),g(o.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${o.rank}.`),g(s.rank===4||s.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${s.rank}.`),g(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${c.rank}.`),l!=null&&g(l.rank===4||l.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${l.rank}.`),u!=null&&g(u.rank===4||u.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${u.rank}.`),Es(o,s,c,u,l,a)}var Ms=F({batchNorm4d_:js});function Ns(e,t,n){let r=P(e,`x`,`bincount`),i=P(t,`weights`,`bincount`);g(r.dtype===`int32`,()=>`Error in bincount: input dtype must be int32, but got ${r.dtype}`),g(n>=0,()=>`size must be non-negative, but got ${n}.`),g(i.size===r.size||i.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${r.shape}, weights shape: ${i.shape}.`);let a={x:r,weights:i},o={size:n};return N.runKernel(Je,a,o)}var Ps=F({bincount_:Ns});function Fs(e,t){let n=P(e,`broadcastTo`,`x`),r=n.shape;if(_e(t),t.length<n.rank)throw Error(`broadcastTo(): shape.length=${t.length} < input.rank=${n.rank}.`);if(t.length>n.rank){let e=n.shape.slice();for(;e.length<t.length;)e.unshift(1);n=H(n,e)}let i=n.shape,a=Array.from(t);for(let e=t.length-1;e>=0;e--)if(i[e]===t[e])a[e]=1;else if(n.shape[e]!==1)throw Error(`broadcastTo(): [${r}] cannot be broadcast to [${t}].`);if(a.map((e,t)=>e>1?t:-1).filter(e=>e>=0).length===0)return uo(n);let o={x:n},s={reps:a};return N.runKernel(fr,o,s)}var Is=F({broadcastTo_:Fs});function Ls(e){let t={x:P(e,`x`,`ceil`,`float32`)};return N.runKernel($e,t)}var Rs=F({ceil_:Ls});function zs(e,t,n){_e(e),n||=ce(t);let r={shape:e,value:t,dtype:n};return N.runKernel(At,{},r)}function Bs(e,t,n){let r=P(e,`x`,`clipByValue`);if(g(t<=n,()=>`Error in clip: min (${t}) must be less than or equal to max (${n}).`),t===n)return zs(r.shape,t,r.dtype);let i={x:r},a={clipValueMin:t,clipValueMax:n};return N.runKernel(et,i,a)}var Vs=F({clipByValue_:Bs});function Hs(e){return ps(e,0)}var Us=F({concat1d_:Hs});function Ws(e,t){return ps(e,t)}var Gs=F({concat2d_:Ws});function Ks(e,t){return ps(e,t)}var qs=F({concat3d_:Ks});function Js(e,t){return ps(e,t)}var Ys=F({concat4d_:Js});function Xs(e,t,n,r,i=`NHWC`,a=[1,1],o){let s=P(e,`x`,`conv2d`,`float32`),c=P(t,`filter`,`conv2d`,`float32`),l=s,u=!1;s.rank===3&&(u=!0,l=H(s,[1,s.shape[0],s.shape[1],s.shape[2]])),g(l.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${l.rank}.`),g(c.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${c.rank}.`),os(`conv2d`,r,o);let d=i===`NHWC`?l.shape[3]:l.shape[1];g(d===c.shape[2],()=>`Error in conv2d: depth of input (${d}) must match input depth for filter ${c.shape[2]}.`),g(rs(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),g(is(a),()=>`Error in conv2D: Dilated rates should be larger than 0.`),g(is(n),()=>`Error in conv2D: Strides should be larger than 0.`);let f={x:l,filter:c},p={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o},m=N.runKernel(it,f,p);return u?H(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Zs=F({conv2d_:Xs});function Qs(e,t,n,r,i=`NWC`,a=1,o){let s=P(e,`x`,`conv1d`),c=P(t,`filter`,`conv1d`),l=s,u=!1;s.rank===2&&(u=!0,l=H(s,[1,s.shape[0],s.shape[1]])),g(l.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${l.rank}.`),g(c.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${c.rank}.`),os(`conv1d`,r,o),g(l.shape[2]===c.shape[1],()=>`Error in conv1d: depth of input (${l.shape[2]}) must match input depth for filter ${c.shape[1]}.`),g(rs(n,a),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${n} and dilation '${a}'`),g(is(a),()=>`Error in conv1D: Dilated rates should be larger than 0.`),g(is(n),()=>`Error in conv1D: Stride should be larger than 0.`),g(i===`NWC`,()=>`Error in conv1d: got dataFormat of ${i} but only NWC is currently supported.`);let d=H(c,[1,c.shape[0],c.shape[1],c.shape[2]]),f=Zs(H(l,[l.shape[0],1,l.shape[1],l.shape[2]]),d,[1,n],r,`NHWC`,[1,a],o);return u?H(f,[f.shape[2],f.shape[3]]):H(f,[f.shape[0],f.shape[2],f.shape[3]])}var $s=F({conv1d_:Qs});function ec(e,t,n,r,i,a=`NHWC`,o){g(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let s=e,c=t,l=!1;t.rank===3&&(l=!0,c=H(t,[1,t.shape[0],t.shape[1],t.shape[2]]),s=[1,e[0],e[1],e[2]]),g(s.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${s.length}.`),g(c.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${c.rank}`),g(n.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${n.rank}`);let u=a===`NHWC`?s[3]:s[1],d=a===`NHWC`?c.shape[3]:c.shape[1];g(u===n.shape[2],()=>`Error in conv2dDerInput: depth of input (${u}) must match input depth for filter ${n.shape[2]}.`),g(d===n.shape[3],()=>`Error in conv2dDerInput: depth of output (${d}) must match output depth for filter ${n.shape[3]}.`),os(`conv2dDerInput`,i,o);let f={dy:c,filter:n},p={strides:r,pad:i,dataFormat:a,dimRoundingMode:o,inputShape:s},m=N.runKernel(ot,f,p);return l?H(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var tc=F({conv2DBackpropInput_:ec});function nc(e,t,n,r,i,a){return tc(n,P(e,`x`,`conv2dTranspose`),P(t,`filter`,`conv2dTranspose`),r,i,`NHWC`,a)}var rc=F({conv2dTranspose_:nc});function ic(e,t,n,r,i=`NDHWC`,a=[1,1,1]){let o=P(e,`x`,`conv3d`),s=P(t,`filter`,`conv3d`),c=o,l=!1;o.rank===4&&(l=!0,c=H(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),g(c.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${c.rank}.`),g(s.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${s.rank}.`),g(c.shape[4]===s.shape[3],()=>`Error in conv3d: depth of input (${c.shape[4]}) must match input depth for filter ${s.shape[3]}.`),g(rs(n,a),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),g(i===`NDHWC`,()=>`Error in conv3d: got dataFormat of ${i} but only NDHWC is currently supported.`),g(is(a),()=>`Error in conv3D: Dilated rates should be larger than 0.`),g(is(n),()=>`Error in conv3D: Strides should be larger than 0.`);let u={x:c,filter:s},d={strides:n,pad:r,dataFormat:i,dilations:a},f=N.runKernel(st,u,d);return l?H(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var ac=F({conv3d_:ic});function oc(e,t,n,r,i){g(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let a=e,o=t,s=!1;t.rank===4&&(s=!0,o=H(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]]),a=[1,e[0],e[1],e[2],e[3]]);let c=a[4],l=o.shape[4];g(a.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${a.length}.`),g(o.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${o.rank}`),g(n.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${n.rank}`),g(c===n.shape[3],()=>`Error in conv3dDerInput: depth of input (${c}) must match input depth for filter ${n.shape[3]}.`),g(l===n.shape[4],()=>`Error in conv3dDerInput: depth of output (${l}) must match output depth for filter ${n.shape[4]}.`);let u={dy:o,filter:n},d={pad:i,strides:r,inputShape:a},f=N.runKernel(lt,u,d);return s?H(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var sc=F({conv3DBackpropInput_:oc});function cc(e,t,n,r,i){return sc(n,P(e,`x`,`conv3dTranspose`),P(t,`filter`,`conv3dTranspose`),r,i)}var lc=F({conv3dTranspose_:cc});function uc(e){let t={x:P(e,`x`,`cos`,`float32`)};return N.runKernel(`Cos`,t)}var dc=F({cos_:uc});function fc(e){let t={x:P(e,`x`,`cosh`,`float32`)};return N.runKernel(ut,t)}var pc=F({cosh_:fc});function mc(e,t=0,n=!1,r=!1){let i={x:P(e,`x`,`cumprod`)},a={axis:t,exclusive:n,reverse:r};return N.runKernel(dt,i,a)}var hc=F({cumprod_:mc});function gc(e,t=0,n=!1,r=!1){let i={x:P(e,`x`,`cumsum`)},a={axis:t,exclusive:n,reverse:r};return N.runKernel(ft,i,a)}var _c=F({cumsum_:gc});function vc(e,t,n,r=!1){let i=P(e,`x`,`denseBincount`),a=P(t,`weights`,`denseBincount`);g(i.dtype===`int32`,()=>`Error in denseBincount: input dtype must be int32, but got ${i.dtype}`),g(i.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${i.rank}.`),g(n>=0,()=>`size must be non-negative, but got ${n}.`),g(a.size===i.size||a.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${i.shape}, weights shape: ${a.shape}.`);let o={x:i,weights:a},s={size:n,binaryOutput:r};return N.runKernel(mt,o,s)}var yc=F({denseBincount_:vc});function bc(e,t,n=`NHWC`){let r=P(e,`x`,`depthToSpace`,`float32`),i=n===`NHWC`?r.shape[1]:r.shape[2],a=n===`NHWC`?r.shape[2]:r.shape[3],o=n===`NHWC`?r.shape[3]:r.shape[1];g(t>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${t}`),g(i*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${i} and ${t}  for depthToSpace with input shape
    ${r.shape}`),g(a*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${a} and ${t} for depthToSpace with input shape
        ${r.shape}`),g(o%(t*t)===0,()=>`Dimension size must be evenly divisible by ${t*t} but is ${o} for depthToSpace with input shape ${r.shape}`);let s={x:r},c={blockSize:t,dataFormat:n};return N.runKernel(ht,s,c)}var xc=F({depthToSpace_:bc});function Sc(e,t,n,r,i=`NHWC`,a=[1,1],o){let s=P(e,`x`,`depthwiseConv2d`,`float32`),c=P(t,`filter`,`depthwiseConv2d`,`float32`),l=s,u=!1;s.rank===3&&(u=!0,l=H(s,[1,s.shape[0],s.shape[1],s.shape[2]])),g(l.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${l.rank}.`),g(c.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${c.rank}.`);let d=i===`NHWC`?l.shape[3]:l.shape[1];g(d===c.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${d}) must match the inChannels dimension in filter ${c.shape[2]}.`),os(`depthwiseConv2d`,r,o);let f={x:l,filter:c},p={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o},m=N.runKernel(gt,f,p);return u?H(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Cc=F({depthwiseConv2d_:Sc});function wc(e,t,n,r,i=[1,1],a=`NHWC`){let o=P(e,`x`,`dilation2d`),s=P(t,`filter`,`dilation2d`);g(o.rank===3||o.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${o.rank}.`),g(s.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${s.rank}.`),g(a===`NHWC`,()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${a}`);let c=o,l=!1;o.rank===3&&(c=H(o,[1,o.shape[0],o.shape[1],o.shape[2]]),l=!0),g(c.shape[3]===s.shape[2],()=>`Error in dilation2d:  input and filter must have the same depth: ${c.shape[3]} vs ${s.shape[2]}`);let u={x:c,filter:s},d={strides:n,pad:r,dilations:i},f=N.runKernel(bt,u,d);return l?H(f,[f.shape[1],f.shape[2],f.shape[3]]):f}var Tc=F({dilation2d_:wc});function Ec(e,t){let n=e.length,r=[];for(let i=0;i<n;i++){let a=n-1-i,o=e[a]||1;(t[t.length-1-i]||1)>1&&o===1&&r.unshift(a)}return r}function Dc(e,t){let n=[];for(let r=0;r<t.length;r++){let i=e[e.length-r-1],a=t.length-r-1,o=t[a];(i==null||i===1&&o>1)&&n.unshift(a)}return n}function U(e,t){let n=Math.max(e.length,t.length),r=Array(n);for(let i=0;i<n;i++){let a=e[e.length-i-1];a??=1;let o=t[t.length-i-1];if(o??=1,a===1)r[n-i-1]=o;else if(o===1)r[n-i-1]=a;else if(a!==o){let n=`Operands could not be broadcast together with shapes ${e} and ${t}.`;throw Error(n)}else r[n-i-1]=a}return r}function Oc(e,t){let n=P(e,`a`,`equal`,`string_or_numeric`),r=P(t,`b`,`equal`,`string_or_numeric`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(Dt,i)}var kc=F({equal_:Oc});function Ac(e,t,n){let r=P(t,`a`,`where`),i=P(n,`b`,`where`),a=P(e,`condition`,`where`,`bool`),o=U(U(a.shape,r.shape),i.shape),s={condition:Is(a,o),t:Is(r,o),e:Is(i,o)};return N.runKernel(Hn,s)}var jc=F({where_:Ac});function Mc(e){let t={x:P(e,`x`,`zerosLike`)};return N.runKernel(yr,t)}var Nc=F({zerosLike_:Mc});function Pc(e,t){let n=P(e,`a`,`div`),r=P(t,`b`,`div`);[n,r]=Bi(n,r);let i=B(n,r),a=Nc(i);return jc(kc(r,a),a,i)}var Fc=F({divNoNan_:Pc});function Ic(e,t){let n=P(e,`t1`,`dot`),r=P(t,`t2`,`dot`);g((n.rank===1||n.rank===2)&&(r.rank===1||r.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${n.rank} and ${r.rank}.`);let i=n.rank===1?n.size:n.shape[1],a=r.rank===1?r.size:r.shape[0];if(g(i===a,()=>`Error in dot: inner dimensions of inputs must match, but got ${i} and ${a}.`),n.rank===1&&r.rank===1)return H(hs(H(n,[1,-1]),H(r,[-1,1])),[]);if(n.rank===1&&r.rank===2){let e=hs(H(n,[1,-1]),H(r,[r.shape[0],r.shape[1]]));return H(e,[e.size])}if(n.rank===2&&r.rank===1){let e=hs(n,H(r,[-1,1]));return H(e,[e.size])}return hs(n,H(r,[r.shape[0],r.shape[1]]))}var Lc=F({dot_:Ic});function Rc(e,...t){let n=t.map((e,t)=>P(e,`tensors${t}`,`einsum`)),r={equation:e};return N.runKernel(Tt,n,r)}var zc=F({einsum_:Rc});function Bc(e){let t={x:P(e,`x`,`elu`,`float32`)};return N.runKernel(`Elu`,t)}var Vc=F({elu_:Bc});function Hc(e){let t=P(e,`x`,`erf`);g(t.dtype===`int32`||t.dtype===`float32`,()=>"Input dtype must be `int32` or `float32`."),t.dtype===`int32`&&(t=R(t,`float32`));let n={x:t};return N.runKernel(`Erf`,n)}var Uc=F({erf_:Hc});function Wc(e,t){for(let n=0;n<e.length;++n)if(e[e.length-n-1]!==t-1-n)return!1;return!0}function Gc(e,t,n){let r=e.length+t.length,i=[],a=0,o=0;for(let s=0;s<r;s++)n.indexOf(s)===-1?i.push(e[a++]):i.push(t[o++]);return i}function Kc(e,t){let n=[],r=e.length;for(let i=0;i<r;i++)t.indexOf(i)===-1&&n.push(e[i]);return[n,t.map(t=>e[t])]}function qc(e,t){return Gc(e,t.map(e=>1),t)}function Jc(e,t,n){g(Wc(t,n),()=>`${e} supports only inner-most axes for now. Got axes ${t} and rank-${n} input.`)}function Yc(e,t){if(Wc(e,t))return null;let n=[];for(let r=0;r<t;++r)e.indexOf(r)===-1&&n.push(r);return e.forEach(e=>n.push(e)),n}function Xc(e){return e.map((e,t)=>[t,e]).sort((e,t)=>e[1]-t[1]).map(e=>e[0])}function Zc(e,t){let n=[];for(let r=t-e;r<t;++r)n.push(r);return n}function Qc(e,t=null,n=!1){let r={x:P(e,`x`,`max`)},i={reductionIndices:t,keepDims:n};return N.runKernel(`Max`,r,i)}var $c=F({max_:Qc});function el(e,t=null,n=!1){let r={x:P(e,`x`,`min`)},i={axis:t,keepDims:n};return N.runKernel(`Min`,r,i)}var tl=F({min_:el});function nl(e,t){let n=P(e,`base`,`pow`),r=P(t,`exp`,`pow`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(`Pow`,i)}var rl=F({pow_:nl});function il(e,t){if((si(e)&&t!==`string`||Array.isArray(e))&&t!==`complex64`)throw Error(`Error creating a new Scalar: value must be a primitive (number|boolean|string)`);if(t===`string`&&si(e)&&!(e instanceof Uint8Array))throw Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return la(e,[],[],t)}function al(e){let t={x:P(e,`x`,`sqrt`,`float32`)};return N.runKernel(Yn,t)}var ol=F({sqrt_:al});function sl(e){let t=P(e,`x`,`square`);return N.runKernel(`Square`,{x:t},{})}var cl=F({square_:sl});function ll(e,t=null,n=!1){let r=P(e,`x`,`sum`);r.dtype===`bool`&&(r=R(r,`int32`));let i={x:r},a={axis:t,keepDims:n};return N.runKernel(`Sum`,i,a)}var W=F({sum_:ll});function ul(e,t=`euclidean`,n=null,r=!1){e=P(e,`x`,`norm`);let i=dl(e,t,n),a=i.shape;if(r){let t=E(n,e.shape);a=qc(i.shape,t)}return H(i,a)}function dl(e,t,n=null){if(e.rank===0)return yo(e);if(e.rank!==1&&n===null)return dl(H(e,[-1]),t,n);if(e.rank===1||typeof n==`number`||Array.isArray(n)&&n.length===1){if(t===1)return W(yo(e),n);if(t===1/0)return $c(yo(e),n);if(t===-1/0)return tl(yo(e),n);if(t===`euclidean`||t===2)return ol(W(rl(yo(e),il(2,`int32`)),n));throw Error(`Error in norm: invalid ord value: ${t}`)}if(Array.isArray(n)&&n.length===2){if(t===1)return $c(W(yo(e),n[0]),n[1]-1);if(t===1/0)return $c(W(yo(e),n[1]),n[0]);if(t===-1/0)return tl(W(yo(e),n[1]),n[0]);if(t===`fro`||t===`euclidean`)return ol(W(cl(e),n));throw Error(`Error in norm: invalid ord value: ${t}`)}throw Error(`Error in norm: invalid axis: ${n}`)}var fl=F({norm_:ul});function pl(e,t=null,n=!1){return fl(e,`euclidean`,t,n)}var ml=F({euclideanNorm_:pl});function hl(e){let t={x:P(e,`x`,`exp`)};return N.runKernel(`Exp`,t)}var gl=F({exp_:hl});function _l(e,t=0){let n=P(e,`x`,`expandDims`,`string_or_numeric`);g(t<=n.rank,()=>`Axis must be <= rank of the tensor`);let r={input:n},i={dim:t};return N.runKernel(Ot,r,i)}var vl=F({expandDims_:_l});function yl(e){let t={x:P(e,`x`,`expm1`)};return N.runKernel(kt,t)}var bl=F({expm1_:yl});function xl(e,t){let n=P(e,`x`,`tile`,`string_or_numeric`);g(n.rank===t.length,()=>`Error in transpose: rank of input ${n.rank} must match length of reps ${t}.`);let r={x:n},i={reps:t};return N.runKernel(fr,r,i)}var Sl=F({tile_:xl});function Cl(e,t,n,r=`float32`){t??=e;let i=so([e,t],r),a=e<=t?e:t;for(let e=0;e<a;++e)i.set(1,e,e);let o=H(i.toTensor(),[e,t]);if(n==null)return o;if(n.length===1)return Sl(vl(o,0),[n[0],1,1]);if(n.length===2)return Sl(vl(vl(o,0),0),[n[0],n[1],1,1]);if(n.length===3)return Sl(vl(vl(vl(o,0),0),0),[n[0],n[1],n[2],1,1]);throw Error(`eye() currently supports only 1D and 2D batchShapes, but received ${n.length}D.`)}var wl=F({eye_:Cl});function Tl(e){let t={x:P(e,`x`,`floor`,`float32`)};return N.runKernel(Mt,t)}var El=F({floor_:Tl});function Dl(e,t,n=0,r=0){let i={x:P(e,`x`,`gather`),indices:P(t,`indices`,`gather`,`int32`)},a={axis:n,batchDims:r};return N.runKernel(Ft,i,a)}var Ol=F({gather_:Dl});function kl(e,t){let n=P(e,`a`,`greater`,`string_or_numeric`),r=P(t,`b`,`greater`,`string_or_numeric`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(Lt,i)}var Al=F({greater_:kl});function jl(e,t){let n=P(e,`a`,`greaterEqual`,`string_or_numeric`),r=P(t,`b`,`greaterEqual`,`string_or_numeric`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(Rt,i)}var Ml=F({greaterEqual_:jl});function Nl(e){let t={input:P(e,`input`,`imag`)};return N.runKernel(Vt,t)}var Pl=F({imag_:Nl});function Fl(e){let t={x:P(e,`x`,`isFinite`)};return N.runKernel(Ht,t)}var Il=F({isFinite_:Fl});function Ll(e){let t={x:P(e,`x`,`isInf`)};return N.runKernel(Ut,t)}var Rl=F({isInf_:Ll});function zl(e){let t={x:P(e,`x`,`isNaN`)};return N.runKernel(Wt,t)}var Bl=F({isNaN_:zl});function Vl(e,t=.2){let n={x:P(e,`x`,`leakyRelu`)},r={alpha:t};return N.runKernel(Gt,n,r)}var Hl=F({leakyRelu_:Vl});function Ul(e,t){let n=P(e,`a`,`less`,`string_or_numeric`),r=P(t,`b`,`less`,`string_or_numeric`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(Kt,i)}var Wl=F({less_:Ul});function Gl(e,t){let n=P(e,`a`,`lessEqual`,`string_or_numeric`),r=P(t,`b`,`lessEqual`,`string_or_numeric`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(qt,i)}var Kl=F({lessEqual_:Gl});function ql(e,t=5,n=1,r=1,i=.5){let a=P(e,`x`,`localResponseNormalization`);g(a.rank===4||a.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${a.rank}.`),g(x(t),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${t}.`);let o=a,s=!1;a.rank===3&&(s=!0,o=H(a,[1,a.shape[0],a.shape[1],a.shape[2]]));let c={x:o},l={depthRadius:t,bias:n,alpha:r,beta:i},u=N.runKernel(`LRN`,c,l);return s?H(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var Jl=F({localResponseNormalization_:ql});function Yl(e){let t={x:P(e,`x`,`log`,`float32`)};return N.runKernel(`Log`,t)}var Xl=F({log_:Yl});function Zl(e){let t={x:P(e,`x`,`log1p`)};return N.runKernel(Yt,t)}var Ql=F({log1p_:Zl});function $l(e,t){g(le(e),()=>`The f passed in variableGrads(f) must be a function`),g(t==null||Array.isArray(t)&&t.every(e=>e instanceof ki),()=>`The varList passed in variableGrads(f, varList) must be an array of variables`);let n=t!=null;if(!n){t=[];for(let e in N.registeredVariables)t.push(N.registeredVariables[e])}let r=n?t.filter(e=>!e.trainable):null,i=t.length;t=t.filter(e=>e.trainable),g(t.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${i} variables is trainable.`);let{value:a,grads:o}=N.gradients(e,t,null,!0);g(o.some(e=>e!=null),()=>`Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize().`),g(a.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${a.rank} tensor`);let s={};return t.forEach((e,t)=>{o[t]!=null&&(s[e.name]=o[t])}),r?.forEach(e=>s[e.name]=null),{value:a,grads:s}}function eu(e){return N.customGrad(e)}function tu(e){let t={x:P(e,`x`,`neg`)};return N.runKernel(`Neg`,t)}var nu=F({neg_:tu});function ru(e){let t={x:P(e,`x`,`softplus`)};return N.runKernel(Jn,t)}var iu=F({softplus_:ru});function au(e){let t=P(e,`x`,`logSigmoid`);return eu(e=>({value:nu(iu(nu(e))),gradFunc:t=>V(t,_s(nu(e)))}))(t)}var ou=F({logSigmoid_:au});function su(e,t){let n=P(e,`a`,`sub`),r=P(t,`b`,`sub`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(`Sub`,i)}var G=F({sub_:su});function cu(e,t=-1){let n=P(e,`logits`,`logSoftmax`);if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and axis was ${t}`);return eu((e,n)=>{let r=G(e,$c(e,t,!0)),i=G(R(r,`float32`),Xl(W(gl(r),t,!0)));return n([i]),{value:i,gradFunc:(e,n)=>{let[r]=n,i=gl(r);return G(e,V(W(e,t,!0),i))}}})(n)}var lu=F({logSoftmax_:cu});function uu(e,t=null,n=!1){let r=P(e,`x`,`logSumExp`),i=E(t,r.shape),a=$c(r,i,!0),o=Xl(W(gl(G(r,a)),i)),s=z(H(a,o.shape),o);return n?H(s,qc(s.shape,i)):s}var du=F({logSumExp_:uu});function fu(e,t){let n=P(e,`a`,`logicalAnd`,`bool`),r=P(t,`b`,`logicalAnd`,`bool`);U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(Xt,i)}var pu=F({logicalAnd_:fu});function mu(e){let t={x:P(e,`x`,`logicalNot`,`bool`)};return N.runKernel(Zt,t)}var hu=F({logicalNot_:mu});function gu(e,t){let n=P(e,`a`,`logicalOr`,`bool`),r=P(t,`b`,`logicalOr`,`bool`);U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(Qt,i)}var _u=F({logicalOr_:gu});function vu(e,t){let n=P(e,`a`,`logicalXor`,`bool`),r=P(t,`b`,`logicalXor`,`bool`);return U(n.shape,r.shape),pu(_u(e,t),hu(pu(e,t)))}var yu=F({logicalXor_:vu});function bu(e,t,n,r,i){let a=P(e,`x`,`maxPool`),o=a,s=!1;a.rank===3&&(s=!0,o=H(a,[1,a.shape[0],a.shape[1],a.shape[2]])),g(o.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${o.rank}.`),g(rs(n,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${n} and dilations '1'`),os(`maxPool`,r,i);let c={x:o},l={filterSize:t,strides:n,pad:r,dimRoundingMode:i},u=N.runKernel(nn,c,l);return s?H(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var xu=F({maxPool_:bu});function Su(e,t=[1,1,1],n,r,i,a=`NDHWC`){let o=P(e,`x`,`maxPool3d`),s=o,c=!1;o.rank===4&&(c=!0,s=H(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]])),g(s.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${s.rank}.`),g(a===`NDHWC`,()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${a}`),os(`maxPool3d`,r,i);let l={x:s},u={filterSize:t,strides:n,pad:r,dimRoundingMode:i,dataFormat:a},d=N.runKernel(an,l,u);return c?H(d,[d.shape[1],d.shape[2],d.shape[3],d.shape[4]]):d}var Cu=F({maxPool3d_:Su});function wu(e,t){let n=P(e,`a`,`maximum`),r=P(t,`b`,`maximum`);[n,r]=Bi(n,r),n.dtype===`bool`&&(n=R(n,`int32`),r=R(r,`int32`)),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(tn,i)}var Tu=F({maximum_:wu});function Eu(e,t=null,n=!1){let r={x:P(e,`x`,`mean`)},i={axis:t,keepDims:n};return N.runKernel(cn,r,i)}var Du=F({mean_:Eu});function Ou(e,t=`float32`){if(_e(e),t===`complex64`)return ca(Ou(e,`float32`),Ou(e,`float32`));let n=he(y(e),t);return N.makeTensor(n,e,t)}function ku(e,t=`float32`){if(_e(e),t===`complex64`)return ca(ku(e,`float32`),Ou(e,`float32`));let n=me(y(e),t);return N.makeTensor(n,e,t)}function Au(e,t){let n=P(e,`a`,`minimum`),r=P(t,`b`,`minimum`);[n,r]=Bi(n,r),n.dtype===`bool`&&(n=R(n,`int32`),r=R(r,`int32`)),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(ln,i)}var ju=F({minimum_:Au});function Mu(e,t,n){g(n===`reflect`||n===`symmetric`,()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${n}.`);let r=P(e,`x`,`mirrorPad`);if(r.rank===0)throw Error(`mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad`);g(t.length===r.rank,()=>`Padding doesn't match input. Must be ${r.rank}. Got ${t.length}.`);let i=+(n===`reflect`);for(let e=0;e<r.rank;e++)g(t[e].length===2,()=>`Invalid number of paddings. Must be length of 2 each.`),g(t[e][0]>=0&&t[e][0]<=r.shape[e]-i&&t[e][1]>=0&&t[e][1]<=r.shape[e]-i,()=>`Padding in dimension ${e} cannot be greater than or equal to ${r.shape[e]-i} or less than 0 for input of shape ${r.shape}`);let a={paddings:t,mode:n},o={x:r};return N.runKernel(un,o,a)}var Nu=F({mirrorPad_:Mu});function Pu(e,t){let n=P(e,`a`,`mod`),r=P(t,`b`,`mod`);[n,r]=Bi(n,r);let i={a:n,b:r};return N.runKernel(`Mod`,i)}var Fu=F({mod_:Pu});function Iu(e,t=null,n=!1){e=P(e,`x`,`moments`);let r=E(t,e.shape),i=Du(e,r,n),a=i.shape;return n||(a=qc(i.shape,r)),{mean:i,variance:Du(cl(G(R(e,`float32`),H(i,a))),r,n)}}var Lu=F({moments_:Iu});function Ru(e,t){let n=P(e,`a`,`notEqual`,`string_or_numeric`),r=P(t,`b`,`notEqual`,`string_or_numeric`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(pn,i)}var zu=F({notEqual_:Ru});function Bu(e,t,n=1,r=0,i=`int32`){if(t<2)throw Error(`Error in oneHot: depth must be >=2, but it is ${t}`);let a={indices:P(e,`indices`,`oneHot`,`int32`)},o={dtype:i,depth:t,onValue:n,offValue:r};return N.runKernel(vn,a,o)}var Vu=F({oneHot_:Bu});function Hu(e){let t={x:P(e,`x`,`onesLike`)};return N.runKernel(_n,t)}var Uu=F({onesLike_:Hu});function Wu(e,t,n=0){let r=P(e,`x`,`pad`);if(r.rank===0)throw Error(`pad(scalar) is not defined. Pass non-scalar to pad`);let i={paddings:t,constantValue:n},a={x:r};return N.runKernel(bn,a,i)}var Gu=F({pad_:Wu});function Ku(e,t,n){let r=P(e,`x`,`spaceToBatchND`);g(r.rank>=1+t.length,()=>`input rank ${r.rank} should be > than [blockShape] ${t.length}`),g(n.length===t.length,()=>`paddings.shape[0] ${n.length} must be equal to [blockShape] ${t.length}`),g(r.shape.reduce((e,r,i)=>i>0&&i<=t.length?e&&(r+n[i-1][0]+n[i-1][1])%t[i-1]===0:e,!0),()=>`input spatial dimensions ${r.shape.slice(1)} with paddings ${n.toString()} must be divisible by blockShapes ${t.toString()}`);let i={x:r},a={blockShape:t,paddings:n};return N.runKernel(Xn,i,a)}var qu=F({spaceToBatchND_:Ku});function Ju(e,t,n,r,i,a,o){i??=[1,1],a??=1,r===0&&(r=`valid`);let s=P(e,`x`,`maxPool`),c=s,l=!1;s.rank===3&&(l=!0,c=H(s,[1,s.shape[0],s.shape[1],s.shape[2]])),g(rs(a,i),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${a} and dilations '${i}'`);let u=Uo(c.shape,t,a,i,r),d=[u.dilationHeight,u.dilationWidth],f;f=r===`same`?Xu([u.filterHeight,u.filterWidth],d):[[0,0],[0,0]];let p=d[0]===1&&d[1]===1,[m,h]=Yu([u.inHeight,u.inWidth],d,f),_=p?r:`valid`,v=p?c:qu(c,d,m),y=(n===`avg`?()=>ls(v,t,a,_,o):()=>xu(v,t,a,_,o))(),b=p?y:Cs(y,d,h);return l?H(b,[b.shape[1],b.shape[2],b.shape[3]]):b}function Yu(e,t,n){let r=n.map(e=>e[0]),i=n.map(e=>e[1]),a=e.concat(r,i),o=t.map((e,t)=>(e-a[t]%e)%e),s=i.map((e,t)=>e+o[t]);return[t.map((e,t)=>[r[t],s[t]]),t.map((e,t)=>[0,o[t]])]}function Xu(e,t){let n=e.map((e,n)=>e+(e-1)*(t[n]-1)).map(e=>e-1),r=n.map(e=>Math.floor(e/2)),i=n.map((e,t)=>e-r[t]);return n.map((e,t)=>[r[t],i[t]])}var Zu=F({pool_:Ju});function Qu(e,t){let n={x:P(e,`x`,`prelu`),alpha:P(t,`alpha`,`prelu`)};return N.runKernel(xn,n)}var $u=F({prelu_:Qu});function ed(e,t=null,n=!1){let r=P(e,`x`,`prod`);r.dtype===`bool`&&(r=R(r,`int32`));let i={x:r},a={axis:t,keepDims:n};return N.runKernel(Sn,i,a)}var td=F({prod_:ed}),nd=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=o();t.next=function(){var e=2091639*t.s0+t.c*23283064365386963e-26;return t.s0=t.s1,t.s1=t.s2,t.s2=e-(t.c=e|0)},t.c=1,t.s0=n(` `),t.s1=n(` `),t.s2=n(` `),t.s0-=n(e),t.s0<0&&(t.s0+=1),t.s1-=n(e),t.s1<0&&(t.s1+=1),t.s2-=n(e),t.s2<0&&(t.s2+=1),n=null}function i(e,t){return t.c=e.c,t.s0=e.s0,t.s1=e.s1,t.s2=e.s2,t}function a(e,t){var n=new r(e),a=t&&t.state,o=n.next;return o.int32=function(){return n.next()*4294967296|0},o.double=function(){return o()+(o()*2097152|0)*11102230246251565e-32},o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}function o(){var e=4022871197;return function(t){t=String(t);for(var n=0;n<t.length;n++){e+=t.charCodeAt(n);var r=.02519603282416938*e;e=r>>>0,r-=e,r*=e,e=r>>>0,r-=e,e+=r*4294967296}return(e>>>0)*23283064365386963e-26}}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.alea=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),rd=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.x=0,t.y=0,t.z=0,t.w=0,t.next=function(){var e=t.x^t.x<<11;return t.x=t.y,t.y=t.z,t.z=t.w,t.w^=t.w>>>19^e^e>>>8},e===(e|0)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=n.charCodeAt(r)|0,t.next()}function i(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xor128=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),id=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.next=function(){var e=t.x^t.x>>>2;return t.x=t.y,t.y=t.z,t.z=t.w,t.w=t.v,(t.d=t.d+362437|0)+(t.v=t.v^t.v<<4^(e^e<<1))|0},t.x=0,t.y=0,t.z=0,t.w=0,t.v=0,e===(e|0)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=n.charCodeAt(r)|0,r==n.length&&(t.d=t.x<<10^t.x>>>4),t.next()}function i(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t.v=e.v,t.d=e.d,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xorwow=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),ad=n(((e,t)=>{(function(e,t,n){function r(e){var t=this;t.next=function(){var e=t.x,n=t.i,r=e[n],i;return r^=r>>>7,i=r^r<<24,r=e[n+1&7],i^=r^r>>>10,r=e[n+3&7],i^=r^r>>>3,r=e[n+4&7],i^=r^r<<7,r=e[n+7&7],r^=r<<13,i^=r^r<<9,e[n]=i,t.i=n+1&7,i};function n(e,t){var n,r=[];if(t===(t|0))r[0]=t;else for(t=``+t,n=0;n<t.length;++n)r[n&7]=r[n&7]<<15^t.charCodeAt(n)+r[n+1&7]<<13;for(;r.length<8;)r.push(0);for(n=0;n<8&&r[n]===0;++n);for(n==8?r[7]=-1:r[n],e.x=r,e.i=0,n=256;n>0;--n)e.next()}n(t,e)}function i(e,t){return t.x=e.x.slice(),t.i=e.i,t}function a(e,t){e??=+new Date;var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(a.x&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xorshift7=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),od=n(((e,t)=>{(function(e,t,n){function r(e){var t=this;t.next=function(){var e=t.w,n=t.X,r=t.i,i,a;return t.w=e=e+1640531527|0,a=n[r+34&127],i=n[r=r+1&127],a^=a<<13,i^=i<<17,a^=a>>>15,i^=i>>>12,a=n[r]=a^i,t.i=r,a+(e^e>>>16)|0};function n(e,t){var n,r,i,a,o,s=[],c=128;for(t===(t|0)?(r=t,t=null):(t+=`\0`,r=0,c=Math.max(c,t.length)),i=0,a=-32;a<c;++a)t&&(r^=t.charCodeAt((a+32)%t.length)),a===0&&(o=r),r^=r<<10,r^=r>>>15,r^=r<<4,r^=r>>>13,a>=0&&(o=o+1640531527|0,n=s[a&127]^=r+o,i=n==0?i+1:0);for(i>=128&&(s[(t&&t.length||0)&127]=-1),i=127,a=512;a>0;--a)r=s[i+34&127],n=s[i=i+1&127],r^=r<<13,n^=n<<17,r^=r>>>15,n^=n>>>12,s[i]=r^n;e.w=o,e.X=s,e.i=i}n(t,e)}function i(e,t){return t.i=e.i,t.w=e.w,t.X=e.X.slice(),t}function a(e,t){e??=+new Date;var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(a.X&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.xor4096=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),sd=n(((e,t)=>{(function(e,t,n){function r(e){var t=this,n=``;t.next=function(){var e=t.b,n=t.c,r=t.d,i=t.a;return e=e<<25^e>>>7^n,n=n-r|0,r=r<<24^r>>>8^i,i=i-e|0,t.b=e=e<<20^e>>>12^n,t.c=n=n-r|0,t.d=r<<16^n>>>16^i,t.a=i-e|0},t.a=0,t.b=0,t.c=-1640531527,t.d=1367130551,e===Math.floor(e)?(t.a=e/4294967296|0,t.b=e|0):n+=e;for(var r=0;r<n.length+20;r++)t.b^=n.charCodeAt(r)|0,t.next()}function i(e,t){return t.a=e.a,t.b=e.b,t.c=e.c,t.d=e.d,t}function a(e,t){var n=new r(e),a=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21);while(e===0);return e},o.int32=n.next,o.quick=o,a&&(typeof a==`object`&&i(a,n),o.state=function(){return i(n,{})}),o}t&&t.exports?t.exports=a:n&&n.amd?n(function(){return a}):this.tychei=a})(e,typeof t==`object`&&t,typeof define==`function`&&define)})),cd=n(((e,t)=>{(function(e,n,r){var i=256,o=6,s=52,c=`random`,l=r.pow(i,o),u=r.pow(2,s),d=u*2,f=i-1,p;function m(e,t,a){var s=[];t=t==1?{entropy:!0}:t||{};var f=v(_(t.entropy?[e,b(n)]:e??y(),3),s),p=new h(s),m=function(){for(var e=p.g(o),t=l,n=0;e<u;)e=(e+n)*i,t*=i,n=p.g(1);for(;e>=d;)e/=2,t/=2,n>>>=1;return(e+n)/t};return m.int32=function(){return p.g(4)|0},m.quick=function(){return p.g(4)/4294967296},m.double=m,v(b(p.S),n),(t.pass||a||function(e,t,n,i){return i&&(i.S&&g(i,p),e.state=function(){return g(p,{})}),n?(r[c]=e,t):e})(m,f,`global`in t?t.global:this==r,t.state)}function h(e){var t,n=e.length,r=this,a=0,o=r.i=r.j=0,s=r.S=[];for(n||(e=[n++]);a<i;)s[a]=a++;for(a=0;a<i;a++)s[a]=s[o=f&o+e[a%n]+(t=s[a])],s[o]=t;(r.g=function(e){for(var t,n=0,a=r.i,o=r.j,s=r.S;e--;)t=s[a=f&a+1],n=n*i+s[f&(s[a]=s[o=f&o+t])+(s[o]=t)];return r.i=a,r.j=o,n})(i)}function g(e,t){return t.i=e.i,t.j=e.j,t.S=e.S.slice(),t}function _(e,t){var n=[],r=typeof e,i;if(t&&r==`object`)for(i in e)try{n.push(_(e[i],t-1))}catch{}return n.length?n:r==`string`?e:e+`\0`}function v(e,t){for(var n=e+``,r,i=0;i<n.length;)t[f&i]=f&(r^=t[f&i]*19)+n.charCodeAt(i++);return b(t)}function y(){try{var t;return p&&(t=p.randomBytes)?t=t(i):(t=new Uint8Array(i),(e.crypto||e.msCrypto).getRandomValues(t)),b(t)}catch{var r=e.navigator,a=r&&r.plugins;return[+new Date,e,a,e.screen,b(n)]}}function b(e){return String.fromCharCode.apply(0,e)}if(v(r.random(),n),typeof t==`object`&&t.exports){t.exports=m;try{p=a()}catch{}}else typeof define==`function`&&define.amd?define(function(){return m}):r[`seed`+c]=m})(typeof self<`u`?self:e,[],Math)})),ld=e(n(((e,t)=>{var n=nd(),r=rd(),i=id(),a=ad(),o=od(),s=sd(),c=cd();c.alea=n,c.xor128=r,c.xorwow=i,c.xorshift7=a,c.xor4096=o,c.tychei=s,t.exports=c}))()),ud=class{constructor(e,t,n,r,i){this.mean=e,this.stdDev=t,this.dtype=n,this.nextVal=NaN,this.truncated=r,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);let a=i||Math.random();this.random=ld.alea(a.toString())}nextValue(){if(!isNaN(this.nextVal)){let e=this.nextVal;return this.nextVal=NaN,e}let e,t,n=!1;for(;!n;){let r,i,a;do r=2*this.random()-1,i=2*this.random()-1,a=r*r+i*i;while(a>=1||a===0);let o=Math.sqrt(-2*Math.log(a)/a);e=this.mean+this.stdDev*r*o,t=this.mean+this.stdDev*i*o,(!this.truncated||this.isValidTruncated(e))&&(n=!0)}return(!this.truncated||this.isValidTruncated(t))&&(this.nextVal=this.convertValue(t)),this.convertValue(e)}convertValue(e){return this.dtype==null||this.dtype===`float32`?e:Math.round(e)}isValidTruncated(e){return e<=this.upper&&e>=this.lower}},dd=class{constructor(e=0,t=1,n,r){if(this.canReturnFloat=()=>this.dtype==null||this.dtype===`float32`,this.min=e,this.range=t-e,this.dtype=n,r??=Math.random(),typeof r==`number`&&(r=r.toString()),!this.canReturnFloat()&&this.range<=1)throw Error(`The difference between ${e} - ${t} <= 1 and dtype is not float`);this.random=ld.alea(r)}convertValue(e){return this.canReturnFloat()?e:Math.round(e)}nextValue(){return this.convertValue(this.min+this.range*this.random())}};function fd(e,t=0,n=1,r,i){if(_e(e),r!=null&&r===`bool`)throw Error(`Unsupported data type ${r}`);let a=new ud(t,n,r,!1,i),o=so(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var pd=F({randomNormal_:fd});function md(e,t=0,n=1,r=`float32`,i){_e(e);let a=so(e,r),o=new dd(t,n,null,i);for(let e=0;e<a.values.length;e++)a.values[e]=o.nextValue();return a.toTensor()}var hd=F({randomUniform_:md});function gd(e,t,n=1,r=`float32`){if(n===0)throw Error(`Cannot have a step of zero`);let i={start:e,stop:t,step:n,dtype:r};return N.runKernel(En,{},i)}function _d(e){let t={input:P(e,`input`,`real`)};return N.runKernel(Dn,t)}var vd=F({real_:_d});function yd(e){let t={x:P(e,`x`,`reciprocal`)};return N.runKernel(On,t)}var bd=F({reciprocal_:yd});function xd(e){let t={x:P(e,`x`,`relu`)};return N.runKernel(kn,t)}var Sd=F({relu_:xd});function Cd(e){let t={x:P(e,`x`,`relu6`)};return N.runKernel(Fn,t)}var wd=F({relu6_:Cd});function Td(e,t){let n={x:P(e,`x`,`reverse`)},r={dims:t};return N.runKernel(In,n,r)}var Ed=F({reverse_:Td});function Dd(e){let t={x:P(e,`x`,`round`)};return N.runKernel(Ln,t)}var Od=F({round_:Dd});function kd(e){let t={x:P(e,`x`,`rsqrt`,`float32`)};return N.runKernel(Rn,t)}var Ad=F({rsqrt_:kd});function jd(e){let t={x:P(e,`x`,`selu`)};return N.runKernel(Un,t)}var Md=F({selu_:jd});function Nd(e,t,n,r,i,a=[1,1],o=`NHWC`){let s=P(e,`x`,`separableConv2d`),c=P(t,`depthwiseFilter`,`separableConv2d`),l=P(n,`pointwiseFilter`,`separableConv2d`),u=s,d=!1;if(s.rank===3&&(d=!0,u=H(s,[1,s.shape[0],s.shape[1],s.shape[2]])),o===`NCHW`)throw Error(`separableConv2d currently does not support dataFormat NCHW; only NHWC is supported`);g(u.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${u.rank}.`),g(c.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${c.rank}.`),g(l.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${c.rank}.`),g(l.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${l.shape[0]}.`),g(l.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${l.shape[1]}.`);let f=c.shape[2],p=c.shape[3];g(l.shape[2]===f*p,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${f*p}, but got ${l.shape[2]}.`);let m=Zs(Cc(u,c,r,i,o,a),l,1,`valid`,o);return d?H(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Pd=F({separableConv2d_:Nd});function Fd(e){let t={x:P(e,`x`,`sign`)};return N.runKernel(Kn,t)}var Id=F({sign_:Fd});function Ld(e){let t={x:P(e,`x`,`sin`,`float32`)};return N.runKernel(`Sin`,t)}var Rd=F({sin_:Ld});function zd(e){let t={x:P(e,`x`,`sinh`)};return N.runKernel(Gn,t)}var Bd=F({sinh_:zd});function Vd(e,t,n){let r=P(e,`x`,`slice1d`);return g(r.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${r.rank} tensor`),ys(r,[t],[n])}var Hd=F({slice1d_:Vd});function Ud(e,t,n){let r=P(e,`x`,`slice2d`);return g(r.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${r.rank} tensor`),ys(r,t,n)}var Wd=F({slice2d_:Ud});function Gd(e,t,n){let r=P(e,`x`,`slice3d`);return g(r.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${r.rank} tensor`),ys(r,t,n)}var Kd=F({slice3d_:Gd});function qd(e,t,n){let r=P(e,`x`,`slice4d`);return g(r.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${r.rank} tensor`),ys(r,t,n)}var Jd=F({slice4d_:qd});function Yd(e,t=-1){let n=P(e,`logits`,`softmax`,`float32`);if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and dim was ${t}`);let r={logits:n},i={dim:t};return N.runKernel(Qn,r,i)}var Xd=F({softmax_:Yd});function Zd(e){g(e.dtype===`complex64`,()=>`The dtype for tf.spectral.fft() must be complex64 but got ${e.dtype}.`);let t={input:e};return N.runKernel(`FFT`,t)}var Qd=F({fft_:Zd});function $d(e){g(e.dtype===`complex64`,()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${e.dtype}.`);let t={input:e};return N.runKernel(Bt,t)}var ef=F({ifft_:$d});function tf(e){let t=e.shape[e.shape.length-1],n=e.size/t,r;if(t<=2)r=ef(H(e,[n,t]));else{let i=[n,2*(t-1)],a=H(vd(e),[n,t]),o=H(Pl(e),[n,t]),s=Ed(ys(a,[0,1],[n,t-2]),1),c=V(Ed(ys(o,[0,1],[n,t-2]),1),il(-1));r=ef(H(ca(ps([a,s],1),ps([o,c],1)),[i[0],i[1]]))}if(r=vd(r),e.rank===3&&e.shape[0]!==0){let t=r,n=e.shape[0];r=H(r,[n,r.shape[0]/n,r.shape[1]]),t.dispose()}return r}var nf=F({irfft_:tf});function rf(e,t,n=0){let r={x:P(e,`x`,`split`)},i={numOrSizeSplits:t,axis:n};return N.runKernel(Zn,r,i)}var af=F({split_:rf});function of(e,t){g(e.dtype===`float32`,()=>`The dtype for rfft() must be real value but got ${e.dtype}`);let n=e.shape[e.shape.length-1],r=e.size/n,i;if(t!=null&&t<n){let r=e.shape.map(e=>0),a=e.shape.map(e=>e);a[e.shape.length-1]=t,i=ys(e,r,a),n=t}else if(t!=null&&t>n){let r=e.shape.map(e=>e);r[e.shape.length-1]=t-n,i=ps([e,Ou(r)],e.shape.length-1),n=t}else i=e;let a=Nc(i),o=Qd(H(ca(i,a),[r,n])),s=Math.floor(n/2)+1,c=vd(o),l=Pl(o),u=af(c,[s,n-s],c.shape.length-1),d=af(l,[s,n-s],l.shape.length-1),f=i.shape.slice();return f[i.shape.length-1]=s,H(ca(u[0],d[0]),f)}var sf=F({rfft_:of});function cf(e,t){let n=P(e,`a`,`squaredDifference`),r=P(t,`b`,`squaredDifference`);[n,r]=Bi(n,r),U(n.shape,r.shape);let i={a:n,b:r};return N.runKernel(ir,i,{})}var lf=F({squaredDifference_:cf});function uf(e,t){let n=P(e,`x`,`squeeze`,`string_or_numeric`);return H(n,D(n.shape,t).newShape)}var df=F({squeeze_:uf});function ff(e,t=0){let n=aa(e,`tensors`,`stack`,`string_or_numeric`);g(n.length>=1,()=>`Pass at least one tensor to tf.stack`),n.length>0&&g(t<=n[0].rank,()=>`Axis must be <= rank of the tensor`);let r=n,i={axis:t};return N.runKernel(yn,r,i)}var pf=F({stack_:ff});function mf(e,t=0){let n={x:P(e,`x`,`step`)},r={alpha:t};return N.runKernel(br,n,r)}var hf=F({step_:mf});function gf(e,t,n,r,i=0,a=0,o=0,s=0,c=0){let l={x:P(e,`x`,`stridedSlice`,`string_or_numeric`)},u={begin:t,end:n,strides:r,beginMask:i,endMask:a,ellipsisMask:o,newAxisMask:s,shrinkAxisMask:c};return N.runKernel(sr,l,u)}var _f=F({stridedSlice_:gf});function vf(e){let t={x:P(e,`x`,`tan`,`float32`)};return N.runKernel(`Tan`,t)}var yf=F({tan_:vf});function bf(e,t){v(e);let n=na(e,t);if(n.length!==1)throw Error(`tensor1d() requires values to be a flat/TypedArray`);return la(e,null,n,t)}function xf(e,t,n){if(v(e),t!=null&&t.length!==2)throw Error(`tensor2d() requires shape to have two numbers`);let r=na(e,n);if(r.length!==2&&r.length!==1)throw Error(`tensor2d() requires values to be number[][] or flat/TypedArray`);if(r.length===1&&t==null)throw Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return la(e,t,r,n)}function Sf(e,t,n){let r=t.rank>1?t.shape[t.rank-1]:1,i=t.rank>1?t.rank-1:1,a=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${n.shape}, indices.shape: ${t.shape}, shape: ${e}, sliceDim: ${r}, and batchDim: ${i}.`;if(n.rank<i)throw Error(a+` update.rank < ${i}. `);if(e.length<r+(n.rank-i))throw Error(a+` Output shape length < ${r+(n.rank-i)}`);if(n.rank!==i+e.length-r)throw Error(a+` update.rank != ${i+e.length-r}`);for(let e=0;e<i;++e)if(n.shape[e]!==t.shape[e])throw Error(a+` updates.shape[${e}] (${n.shape[e]}) != indices.shape[${e}] (${t.shape[e]}).`);for(let t=0;t<n.rank-i;++t)if(n.shape[t+i]!==e[t+r])throw Error(a+` updates.shape[${t+i}] (${n.shape[t+i]}) != shape[${t+i}] (${e[t+i]})`)}function Cf(e,t,n){if(t.rank<1)throw Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${t.rank}.`);if(e.rank<1)throw Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${e.rank}.`);if(t.dtype!==`int32`)throw Error(`The dtype of 'indices' should be int32, but got dtype: ${t.dtype}`);if(n.length<1)throw Error(`Output rank must be greater or equal to 1, but got shape: ${n}`);if(n.length===0){if(t.size===0)throw Error(`Indices specified for empty output. indices shape: ${t.shape}`);if(e.size===0)throw Error(`Updates specified for empty output. updates shape: ${e.shape}`)}Sf(n,t,e)}function wf(e,t,n){let r=t.shape.length,i=r>1?t.shape[r-1]:1,a=n.length,o=1;for(let e=i;e<a;++e)o*=n[e];let s=i<1?1:i,c=y(t.shape)/s,l=[...A(n.slice(0,i)),1],u=y(n);return{sliceRank:i,numUpdates:c,sliceSize:o,strides:l,outputSize:u}}function Tf(e,t=1,n=!0){let r=P(e,`x`,`topk`);if(r.rank===0)throw Error(`topk() expects the input to be of rank 1 or higher`);let i=r.shape[r.shape.length-1];if(t<0)throw Error(`'k' passed to topk() must be >= 0 but got ${t}`);if(t>i)throw Error(`'k' passed to topk() must be <= the last dimension (${i}) but got ${t}`);let a={x:r},o={k:t,sorted:n},[s,c]=N.runKernel(pr,a,o);return{values:s,indices:c}}var Ef=F({topk_:Tf});function Df(e,t=0,n=1,r,i){if(_e(e),r!=null&&r===`bool`)throw Error(`Unsupported data type $ { dtype }`);let a=new ud(t,n,r,!0,i),o=so(e,r);for(let e=0;e<o.values.length;e++)o.values[e]=a.nextValue();return o.toTensor()}var Of=F({truncatedNormal_:Df});function kf(e,t=0){let n=P(e,`x`,`unique`,`string_or_numeric`);g(n.rank>0,()=>`The input tensor must be at least 1D`);let r={x:n},i={axis:t},[a,o]=N.runKernel(gr,r,i);return{values:a,indices:o}}var Af=F({unique_:kf});function jf(e,t,n){let r=P(e,`x`,`unsortedSegmentSum`),i=P(t,`segmentIds`,`unsortedSegmentSum`,`int32`);g(x(n),()=>`numSegments must be of dtype int`);let a={x:r,segmentIds:i},o={numSegments:n};return N.runKernel(vr,a,o)}var Mf=F({unsortedSegmentSum_:jf});function Nf(e,t=0){let n=P(e,`x`,`unstack`,`string_or_numeric`);g(t>=-n.shape.length&&t<n.shape.length,()=>`Axis = ${t} is not in [-${n.shape.length}, ${n.shape.length})`);let r={value:n},i={axis:t};return N.runKernel(_r,r,i)}var Pf=F({unstack_:Nf});function Ff(e,t=!0,n,r){return N.makeVariable(e,t,n,r)}function If(e,t){let n=[];for(let e=0;e<t.length;e++)t[e]&&n.push(e);let r=so(e,`int32`),i=so([n.length,e.length],`int32`);for(let t=0;t<n.length;t++){let a=r.indexToLoc(n[t]),o=t*e.length;i.values.set(a,o)}return i.toTensor()}function Lf(e,t,n){let r=P(e,`x`,`transpose`);if(t??=r.shape.map((e,t)=>t).reverse(),g(r.rank===t.length,()=>`Error in transpose: rank of input ${r.rank} must match length of perm ${t}.`),t.forEach(e=>{g(e>=0&&e<r.rank,()=>`All entries in 'perm' must be between 0 and ${r.rank-1} but got ${t}`)}),r.rank<=1)return r.clone();let i={x:r},a={perm:t};return r.dtype===`complex64`?I(()=>{let e=vd(r),t=Pl(r);return e=N.runKernel(hr,{x:e},a),t=N.runKernel(hr,{x:t},a),n&&(t=nu(t)),ca(e,t)}):N.runKernel(hr,i,a)}var Rf=F({transpose_:Lf});function zf(e,t){if(t==null)return e.shape.slice();if(b(e.shape,t))return t;if(e.shape.length===t.length){let n=[];for(let r=0;r<e.shape.length;r++)t[r]==null&&e.shape[r]!=null?n.push(e.shape[r]):n.push(t[r]);return n}return t}function Bf(e,t,n,r){let i=P(e,`x`,`dropout`);if(g(i.dtype===`float32`,()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${i.dtype} tensor instead.`),g(t>=0&&t<1,()=>`rate must be a float in the range [0, 1), but got ${t}.`),t===0)return e instanceof Oi?i.clone():i;let a=zf(i,n),o=1-t;return V(i,B(El(z(hd(a,0,1,`float32`,r),o)),o))}var Vf=F({dropout_:Bf});function Hf(e,t,n,r,i,a=`NHWC`,o){let s=e;e.rank===3&&(s=H(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=H(t,[1,t.shape[0],t.shape[1],t.shape[2]])),g(s.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${s.shape}.`),g(c.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${c.shape}.`),g(n.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${n}.`);let l=a===`NHWC`?s.shape[3]:s.shape[1],u=a===`NHWC`?c.shape[3]:c.shape[1];g(l===n[2],()=>`Error in conv2dDerFilter: depth of input ${l}) must match input depth in filter (${n[2]}.`),g(u===n[3],()=>`Error in conv2dDerFilter: depth of dy (${u}) must match output depth for filter (${n[3]}).`),os(`conv2dDerFilter`,i,o);let d={x:s,dy:c},f={strides:r,pad:i,dataFormat:a,dimRoundingMode:o,filterShape:n};return N.runKernel(at,d,f)}var Uf=F({conv2DBackpropFilter_:Hf});function Wf(e,t,n){if(n==null||n===`linear`)return e;if(n===`relu`)return V(e,hf(t));throw Error(`Cannot compute gradient for fused activation ${n}.`)}function Gf(e,t){let n=t,r=Dc(e.shape,t.shape);return r.length>0&&(n=W(n,r)),H(n,e.shape)}function Kf(e,t,n,r){if(t===`linear`)return e;if(t===`relu`)return Sd(e);if(t===`elu`)return Vc(e);if(t===`relu6`)return wd(e);if(t===`prelu`)return $u(e,n);if(t===`leakyrelu`)return Hl(e,r);if(t===`sigmoid`)return _s(e);throw Error(`Unknown fused activation ${t}.`)}var qf=(e,t)=>!(e>0)||t===`linear`;function Jf({x:e,filter:t,strides:n,pad:r,dataFormat:i=`NHWC`,dilations:a=[1,1],dimRoundingMode:o,bias:s,activation:c=`linear`,preluActivationWeights:l,leakyreluAlpha:u}){if(c||=`linear`,qf(N.state.gradientDepth,c)===!1){g(i===`NHWC`,()=>`Error in fused conv2d: got dataFormat of ${i} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let d=Zs(e,t,n,r,i,a,o);return s!=null&&(d=z(d,s)),Kf(d,c,l,u)}let d=P(e,`x`,`conv2d`,`float32`),f=P(t,`filter`,`conv2d`,`float32`),p=d,m=!1;d.rank===3&&(m=!0,p=H(d,[1,d.shape[0],d.shape[1],d.shape[2]])),g(p.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${p.rank}.`),g(f.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${f.rank}.`),os(`fused conv2d`,r,o);let h=i===`NHWC`?p.shape[3]:p.shape[1];g(f.shape[2]===h,()=>`Error in conv2d: depth of input (${h}) must match input depth for filter ${f.shape[2]}.`),g(rs(n,a),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`);let _=Go(p.shape,f.shape,n,a,r,o),v;s!=null&&(v=P(s,`bias`,`fused conv2d`),[v]=Bi(v,d),i===`NHWC`?U(_.outShape,v.shape):(g(v.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${v.shape.length}.`),g(v.shape.length===0||v.shape[0]===_.outChannels||v.shape[0]===1,()=>`Error in fused conv2d: bias shape (${v.shape}) is not compatible with the number of output channels (${_.outChannels})`)));let y;if(l!=null){let e=l.shape;if(g(e.length<=1||e.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${e.length}.`),e.length===1)g(e[0]===1||e[0]===_.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${e}) is not compatible with the number of output channels (${_.outChannels}).`);else if(e.length===3)try{U(e,_.outShape)}catch{let t=`Error in fused conv2d: PReLU activation weights (${e}) is not compatible with the output shape of the conv2d (${_.outShape}).`;throw Error(t)}y=P(l,`prelu weights`,`fused conv2d`)}let b=(e,t)=>{g(i===`NHWC`,()=>`Error in gradient of fused conv2D: got dataFormat of ${i} but only NHWC is currently supported.`);let[o,s,l,u]=t,d=Wf(e,l,c);g(ns(a),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${a}'`);let f=[tc(s.shape,d,o,n,r),Uf(s,d,o.shape,n,r)];if(u!=null){let e=Gf(u,d);f.push(e)}return f},x={x:p,filter:f,bias:v,preluActivationWeights:y},S={strides:n,pad:r,dataFormat:i,dilations:a,dimRoundingMode:o,activation:c,leakyreluAlpha:u};return s==null?eu((e,t,n)=>{let r=N.runKernel(wr,x,S);return n([t,e,r]),m&&(r=H(r,[r.shape[1],r.shape[2],r.shape[3]])),{value:r,gradFunc:b}})(p,f):eu((e,t,n,r)=>{let i=N.runKernel(wr,x,S);return r([t,e,i,n]),m&&(i=H(i,[i.shape[1],i.shape[2],i.shape[3]])),{value:i,gradFunc:b}})(p,f,v)}var Yf=F({fusedConv2d_:Jf});function Xf(e,t,n,r,i,a=[1,1],o){let s=e;e.rank===3&&(s=H(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=H(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let l={x:s,dy:c},u={strides:r,pad:i,dimRoundingMode:o,dilations:a,filterShape:n};return N.runKernel(_t,l,u)}var Zf=F({depthwiseConv2dNativeBackpropFilter_:Xf});function Qf(e,t,n,r,i,a=[1,1],o){let s=t,c=!1;t.rank===3&&(c=!0,s=H(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let l={dy:s,filter:n},u={strides:r,pad:i,dimRoundingMode:o,dilations:a,inputShape:e},d=N.runKernel(vt,l,u);return c?H(d,[d.shape[1],d.shape[2],d.shape[3]]):d}var $f=F({depthwiseConv2dNativeBackpropInput_:Qf});function ep({a:e,b:t,transposeA:n=!1,transposeB:r=!1,bias:i,activation:a=`linear`,preluActivationWeights:o,leakyreluAlpha:s=.2}){if(qf(N.state.gradientDepth,a)===!1){let c=hs(e,t,n,r);return i!=null&&(c=z(c,i)),Kf(c,a,o,s)}let c=P(e,`a`,`fused matMul`),l=P(t,`b`,`fused matMul`);[c,l]=Bi(c,l);let u=n?c.shape[c.rank-2]:c.shape[c.rank-1],d=r?l.shape[l.rank-1]:l.shape[l.rank-2],f=n?c.shape[c.rank-1]:c.shape[c.rank-2],p=r?l.shape[l.rank-2]:l.shape[l.rank-1],m=c.shape.slice(0,-2),h=l.shape.slice(0,-2),_=y(m),v=y(h);g(u===d,()=>`Error in fused matMul: inner shapes (${u}) and (${d}) of Tensors with shapes ${c.shape} and ${l.shape} and transposeA=${n} and transposeB=${r} must match.`);let b=U(c.shape.slice(0,-2),l.shape.slice(0,-2)).concat([f,p]),x=n?H(c,[_,u,f]):H(c,[_,f,u]),S=r?H(l,[v,p,d]):H(l,[v,d,p]),C;i!=null&&(C=P(i,`bias`,`fused matMul`),[C]=Bi(C,c),U(b,C.shape));let w;o!=null&&(w=P(o,`prelu weights`,`fused matMul`));let T=(e,t)=>{let[o,s,c,l]=t,u=Wf(H(e,c.shape),c,a),d,f;if(!n&&!r?(d=hs(u,s,!1,!0),f=hs(o,u,!0,!1)):!n&&r?(d=hs(u,s,!1,!1),f=hs(u,o,!0,!1)):n&&!r?(d=hs(s,u,!1,!0),f=hs(o,u,!1,!1)):(d=hs(s,u,!0,!0),f=hs(u,o,!0,!0)),i!=null){let e=Gf(l,u);return[d,f,e]}return[d,f]},E={a:x,b:S,bias:C,preluActivationWeights:w},D={transposeA:n,transposeB:r,activation:a,leakyreluAlpha:s};return i==null?eu((e,t,n)=>{let r=N.runKernel(Cr,E,D);return n([e,t,r]),{value:H(r,b),gradFunc:T}})(x,S):eu((e,t,n,r)=>{let i=N.runKernel(Cr,E,D);return r([e,t,i,n]),{value:H(i,b),gradFunc:T}})(x,S,C)}var tp=F({fusedMatMul_:ep});function np(e,t,n,r,i=`bilinear`,a=0){let o=P(e,`image`,`cropAndResize`),s=P(t,`boxes`,`cropAndResize`,`float32`),c=P(n,`boxInd`,`cropAndResize`,`int32`),l=s.shape[0];g(o.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${o.rank}.`),g(s.rank===2&&s.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${l},4] but had shape ${s.shape}.`),g(c.rank===1&&c.shape[0]===l,()=>`Error in cropAndResize: boxInd must be have size [${l}] but had shape ${s.shape}.`),g(r.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${r.length}.`),g(r[0]>=1&&r[1]>=1,()=>`cropSize must be atleast [1,1], but was ${r}`),g(i===`bilinear`||i===`nearest`,()=>`method must be bilinear or nearest, but was ${i}`);let u={image:o,boxes:s,boxInd:c},d={method:i,extrapolationValue:a,cropSize:r};return N.runKernel(pt,u,d)}var rp=F({cropAndResize_:np});function ip(e){let t=P(e,`image`,`flipLeftRight`,`float32`);g(t.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${t.rank}.`);let n={image:t};return N.runKernel(jt,n,{})}var ap=F({flipLeftRight_:ip});function op(e){let t=P(e,`image`,`grayscaleToRGB`),n=t.rank-1,r=t.shape[n];g(t.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${t.rank}.`),g(r===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${r}.`);let i=Array(t.rank);return i.fill(1,0,n),i[n]=3,Sl(t,i)}var sp=F({grayscaleToRGB_:op});function cp(e){let t=P(e,`image`,`RGBToGrayscale`),n=t.rank-1,r=t.shape[n];g(t.rank>=2,()=>`Error in RGBToGrayscale: images must be at least rank 2, but got rank ${t.rank}.`),g(r===3,()=>`Error in RGBToGrayscale: last dimension of an RGB image should be size 3, but got size ${r}.`);let i=t.dtype,a=R(t,`float32`),o=bf([.2989,.587,.114]),s;switch(t.rank){case 2:s=zc(`ij,j->i`,a,o);break;case 3:s=zc(`ijk,k->ij`,a,o);break;case 4:s=zc(`ijkl,l->ijk`,a,o);break;case 5:s=zc(`ijklm,m->ijkl`,a,o);break;case 6:s=zc(`ijklmn,n->ijklm`,a,o);break;default:throw Error(`Not a valid tensor rank.`)}return s=vl(s,-1),R(s,i)}var lp=F({rgbToGrayscale_:cp});function up(e,t,n=0,r=.5){let i=P(e,`image`,`rotateWithOffset`,`float32`);g(i.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${i.rank}.`);let a={image:i},o={radians:t,fillValue:n,center:r};return N.runKernel(Sr,a,o)}var dp=F({rotateWithOffset_:up});function fp(e,t,n,r,i,a){r??=.5,i??=-1/0,a??=0;let o=e.shape[0];return n=Math.min(n,o),g(0<=r&&r<=1,()=>`iouThreshold must be in [0, 1], but was '${r}'`),g(e.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${e.rank}'`),g(e.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${e.shape[1]}`),g(t.rank===1,()=>`scores must be a 1D tensor`),g(t.shape[0]===o,()=>`scores has incompatible shape with boxes. Expected ${o}, but was ${t.shape[0]}`),g(0<=a&&a<=1,()=>`softNmsSigma must be in [0, 1], but was '${a}'`),{maxOutputSize:n,iouThreshold:r,scoreThreshold:i,softNmsSigma:a}}function pp(e,t,n,r=.5,i=-1/0){let a=P(e,`boxes`,`nonMaxSuppression`,`float32`),o=P(t,`scores`,`nonMaxSuppression`,`float32`),s=fp(a,o,n,r,i);n=s.maxOutputSize,r=s.iouThreshold,i=s.scoreThreshold;let c={maxOutputSize:n,iouThreshold:r,scoreThreshold:i};return N.runKernel(mn,{boxes:a,scores:o},c)}var mp=F({nonMaxSuppression_:pp});function hp(e,t,n){let r=gp(e,t,n),i=r<0?-(r+1):r;e.splice(i,0,t)}function gp(e,t,n){return vp(e,t,n||_p)}function _p(e,t){return e>t?1:e<t?-1:0}function vp(e,t,n){let r=0,i=e.length,a=0,o=!1;for(;r<i;){a=r+(i-r>>>1);let s=n(t,e[a]);s>0?r=a+1:(i=a,o=!s)}return o?r:-r-1}function yp(e,t,n,r,i){return Sp(e,t,n,r,i,0)}function bp(e,t,n,r,i,a){return Sp(e,t,n,r,i,0,!1,a,!0)}function xp(e,t,n,r,i,a){return Sp(e,t,n,r,i,a,!0)}function Sp(e,t,n,r,i,a,o=!1,s=!1,c=!1){let l=[];for(let e=0;e<t.length;e++)t[e]>i&&l.push({score:t[e],boxIndex:e,suppressBeginIndex:0});l.sort(Tp);let u=a>0?-.5/a:0,d=[],f=[];for(;d.length<n&&l.length>0;){let t=l.pop(),{score:n,boxIndex:a,suppressBeginIndex:o}=t;if(n<i)break;let s=!1;for(let n=d.length-1;n>=o;--n){let o=Cp(e,a,d[n]);if(o>=r){s=!0;break}if(t.score*=wp(r,u,o),t.score<=i)break}t.suppressBeginIndex=d.length,s||(t.score===n?(d.push(a),f.push(t.score)):t.score>i&&hp(l,t,Tp))}let p=d.length,m=n-p;s&&m>0&&(d.push(...Array(m).fill(0)),f.push(...Array(m).fill(0)));let h={selectedIndices:d};return o&&(h.selectedScores=f),c&&(h.validOutputs=p),h}function Cp(e,t,n){let r=e.subarray(t*4,t*4+4),i=e.subarray(n*4,n*4+4),a=Math.min(r[0],r[2]),o=Math.min(r[1],r[3]),s=Math.max(r[0],r[2]),c=Math.max(r[1],r[3]),l=Math.min(i[0],i[2]),u=Math.min(i[1],i[3]),d=Math.max(i[0],i[2]),f=Math.max(i[1],i[3]),p=(s-a)*(c-o),m=(d-l)*(f-u);if(p<=0||m<=0)return 0;let h=Math.max(a,l),g=Math.max(o,u),_=Math.min(s,d),v=Math.min(c,f),y=Math.max(_-h,0)*Math.max(v-g,0);return y/(p+m-y)}function wp(e,t,n){let r=Math.exp(t*n*n);return n<=e?r:0}function Tp(e,t){return e.score-t.score||e.score===t.score&&t.boxIndex-e.boxIndex}async function Ep(e,t,n,r=.5,i=-1/0){let a=P(e,`boxes`,`nonMaxSuppressionAsync`),o=P(t,`scores`,`nonMaxSuppressionAsync`),s=fp(a,o,n,r,i);n=s.maxOutputSize,r=s.iouThreshold,i=s.scoreThreshold;let c=await Promise.all([a.data(),o.data()]),l=c[0],u=c[1],{selectedIndices:d}=yp(l,u,n,r,i);return a!==e&&a.dispose(),o!==t&&o.dispose(),bf(d,`int32`)}var Dp=Ep;function Op(e,t,n,r=.5,i=-1/0,a=0){let o=P(e,`boxes`,`nonMaxSuppression`),s=P(t,`scores`,`nonMaxSuppression`),c=fp(o,s,n,r,i,a);n=c.maxOutputSize,r=c.iouThreshold,i=c.scoreThreshold,a=c.softNmsSigma;let l={boxes:o,scores:s},u={maxOutputSize:n,iouThreshold:r,scoreThreshold:i,softNmsSigma:a},d=N.runKernel(gn,l,u);return{selectedIndices:d[0],selectedScores:d[1]}}var kp=F({nonMaxSuppressionWithScore_:Op});async function Ap(e,t,n,r=.5,i=-1/0,a=0){let o=P(e,`boxes`,`nonMaxSuppressionAsync`),s=P(t,`scores`,`nonMaxSuppressionAsync`),c=fp(o,s,n,r,i,a);n=c.maxOutputSize,r=c.iouThreshold,i=c.scoreThreshold,a=c.softNmsSigma;let l=await Promise.all([o.data(),s.data()]),u=l[0],d=l[1],{selectedIndices:f,selectedScores:p}=xp(u,d,n,r,i,a);return o!==e&&o.dispose(),s!==t&&s.dispose(),{selectedIndices:bf(f,`int32`),selectedScores:bf(p)}}var jp=Ap;function Mp(e,t,n,r=.5,i=-1/0,a=!1){let o=P(e,`boxes`,`nonMaxSuppression`),s=P(t,`scores`,`nonMaxSuppression`),c=fp(o,s,n,r,i,null),l=c.maxOutputSize,u=c.iouThreshold,d=c.scoreThreshold,f={boxes:o,scores:s},p={maxOutputSize:l,iouThreshold:u,scoreThreshold:d,padToMaxOutputSize:a},m=N.runKernel(hn,f,p);return{selectedIndices:m[0],validOutputs:m[1]}}var Np=F({nonMaxSuppressionPadded_:Mp});async function Pp(e,t,n,r=.5,i=-1/0,a=!1){let o=P(e,`boxes`,`nonMaxSuppressionAsync`),s=P(t,`scores`,`nonMaxSuppressionAsync`),c=fp(o,s,n,r,i,null),l=c.maxOutputSize,u=c.iouThreshold,d=c.scoreThreshold,[f,p]=await Promise.all([o.data(),s.data()]),{selectedIndices:m,validOutputs:h}=bp(f,p,l,u,d,a);return o!==e&&o.dispose(),s!==t&&s.dispose(),{selectedIndices:bf(m,`int32`),validOutputs:il(h,`int32`)}}var Fp=Pp;function Ip(e,t,n=!1,r=!1){let i=P(e,`images`,`resizeBilinear`);g(i.rank===3||i.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${i.rank}.`),g(t.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${t}.`),g(r===!1||n===!1,()=>`Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.`);let a=i,o=!1;i.rank===3&&(o=!0,a=H(i,[1,i.shape[0],i.shape[1],i.shape[2]]));let[]=t,s={images:a},c={alignCorners:n,halfPixelCenters:r,size:t},l=N.runKernel(Nn,s,c);return o?H(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var Lp=F({resizeBilinear_:Ip});function Rp(e,t,n=!1,r=!1){let i=P(e,`images`,`resizeNearestNeighbor`);g(i.rank===3||i.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${i.rank}.`),g(t.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${t}.`),g(i.dtype===`float32`||i.dtype===`int32`,()=>"`images` must have `int32` or `float32` as dtype"),g(r===!1||n===!1,()=>`Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.`);let a=i,o=!1;i.rank===3&&(o=!0,a=H(i,[1,i.shape[0],i.shape[1],i.shape[2]]));let[]=t,s={images:a},c={alignCorners:n,halfPixelCenters:r,size:t},l=N.runKernel(jn,s,c);return o?H(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var zp=F({resizeNearestNeighbor_:Rp});function Bp(e,t=`binary`,n=!1,r=.5){let i=P(e,`image`,`threshold`),a=i.shape[0]*i.shape[1],o=V(bf([r]),255),s,c,l,u;if(g(i.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${i.rank}.`),g(i.shape[2]===3||i.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${i.shape[2]}.`),g(i.dtype===`int32`||i.dtype===`float32`,()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${i.dtype}.`),g(t===`otsu`||t===`binary`,()=>`Method must be binary or otsu, but was ${t}`),i.shape[2]===3){[s,c,l]=af(i,[1,1,1],-1);let e=V(s,.2989),t=V(c,.587),n=V(l,.114);u=z(z(e,t),n)}else u=e;return t===`otsu`&&(o=Vp(Ps(R(Od(u),`int32`),ua([]),256),a)),R(V(n?Kl(u,o):Al(u,o),255),`int32`)}function Vp(e,t){let n=bf([-1]),r=bf([0]),i=bf([0]),a,o,s,c,l,u;for(let d=0;d<e.size-1;d++){a=ys(e,0,d+1),o=ys(e,d+1),l=B(W(a),t),u=B(W(o),t),s=B(W(V(a,gd(0,a.size))),W(a));let f=zs(o.shape,a.size),p=z(gd(0,o.size),f);c=B(W(V(o,p)),W(o));let m=G(s,c),h=G(s,c);i=V(V(V(l,u),m),h);let g=Al(i,r);r=jc(g,i,r),n=jc(g,bf([d]),n)}return n}var Hp=F({threshold_:Bp});function Up(e,t,n=`nearest`,r=`constant`,i=0,a){let o=P(e,`image`,`transform`,`float32`),s=P(t,`transforms`,`transform`,`float32`);g(o.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${o.rank}.`),g(s.rank===2&&(s.shape[0]===o.shape[0]||s.shape[0]===1)&&s.shape[1]===8,()=>`Error in transform: Input transform should be batch x 8 or 1 x 8`),g(a==null||a.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${a}.`);let c={image:o,transforms:s},l={interpolation:n,fillMode:r,fillValue:i,outputShape:a};return N.runKernel(mr,c,l)}var Wp=F({transform_:Up});function Gp(e,t,n){let r=P(e,`a`,`bandPart`);g(r.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${r.rank}.`);let i=r.shape,[a,o]=r.shape.slice(-2),s,c;typeof t==`number`?(g(t%1==0,()=>`bandPart(): numLower must be an integer, got ${t}.`),g(t<=a,()=>`bandPart(): numLower (${t}) must not be greater than the number of rows (${a}).`),s=P(t<0?a:t,`numLower`,`bandPart`)):(g(t.dtype===`int32`,()=>`bandPart(): numLower's dtype must be an int32.`),s=jc(Wl(t,0),a,ju(t,a))),typeof n==`number`?(g(n%1==0,()=>`bandPart(): numUpper must be an integer, got ${n}.`),g(n<=o,()=>`bandPart(): numUpper (${n}) must not be greater than the number of columns (${o}).`),c=P(n<0?o:n,`numUpper`,`bandPart`)):(g(n.dtype===`int32`,()=>`bandPart(): numUpper's dtype must be an int32.`),c=jc(Wl(n,0),o,ju(n,o)));let l=G(H(gd(0,a,1,`int32`),[-1,1]),gd(0,o,1,`int32`)),u=pu(Kl(l,s),Ml(l,nu(c))),d=Ou([a,o],r.dtype);return H(pf(Pf(H(r,[-1,a,o])).map(e=>jc(u,e,d))),i)}var Kp=F({bandPart_:Gp});function qp(e){let t;if(Array.isArray(e)){t=!1,g(e!=null&&e.length>0,()=>`Gram-Schmidt process: input must not be null, undefined, or empty`);let n=e[0].shape[0];for(let t=1;t<e.length;++t)g(e[t].shape[0]===n,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${e[t].shape[0]} vs. ${n})`)}else t=!0,e=af(e,e.shape[0],0).map(e=>df(e,[0]));g(e.length<=e[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${e.length}) exceeds number of dimensions (${e[0].shape[0]}).`);let n=[],r=e;for(let t=0;t<e.length;++t)n.push(N.tidy(()=>{let e=r[t];if(t>0)for(let r=0;r<t;++r){let t=V(W(V(n[r],e)),n[r]);e=G(e,t)}return B(e,fl(e,`euclidean`))}));return t?pf(n,0):n}var Jp=F({gramSchmidt_:qp});function Yp(e,t=!1){if(g(e.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${e.rank}`),e.rank===2)return Xp(e,t);{let n=Pf(H(e,[e.shape.slice(0,e.shape.length-2).reduce((e,t)=>e*t),e.shape[e.shape.length-2],e.shape[e.shape.length-1]]),0),r=[],i=[];return n.forEach(e=>{let[n,a]=Xp(e,t);r.push(n),i.push(a)}),[H(pf(r,0),e.shape),H(pf(i,0),e.shape)]}}function Xp(e,t=!1){return N.tidy(()=>{g(e.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${e.shape.length}D Tensor.`);let n=e.shape[0],r=e.shape[1],i=wl(n),a=uo(e),o=xf([[1]],[1,1]),s=uo(o),c=n>=r?r:n;for(let e=0;e<c;++e){let t=a,c=s,l=i;[s,a,i]=N.tidy(()=>{let t=ys(a,[e,e],[n-e,1]),c=fl(t),l=ys(a,[e,e],[1,1]),u=jc(Al(l,0),xf([[-1]]),xf([[1]])),d=G(l,V(u,c)),f=B(t,d);s=f.shape[0]===1?uo(o):ps([o,ys(f,[1,0],[f.shape[0]-1,f.shape[1]])],0);let p=nu(B(hs(u,d),c)),m=ys(a,[e,0],[n-e,r]),h=V(p,s),g=Rf(s);if(e===0)a=G(m,hs(h,hs(g,m)));else{let t=G(m,hs(h,hs(g,m)));a=ps([ys(a,[0,0],[e,r]),t],0)}let _=Rf(h),v=ys(i,[0,e],[n,i.shape[1]-e]);if(e===0)i=G(v,hs(hs(v,s),_));else{let t=G(v,hs(hs(v,s),_));i=ps([ys(i,[0,0],[n,e]),t],1)}return[s,a,i]}),L([t,c,l])}return!t&&n>r&&(i=ys(i,[0,0],[n,r]),a=ys(a,[0,0],[r,r])),[i,a]})}var Zp=F({qr_:Yp}),Qp={flipLeftRight:ap,grayscaleToRGB:sp,resizeNearestNeighbor:zp,resizeBilinear:Lp,rgbToGrayscale:lp,rotateWithOffset:dp,cropAndResize:rp,nonMaxSuppression:mp,nonMaxSuppressionAsync:Dp,nonMaxSuppressionWithScore:kp,nonMaxSuppressionWithScoreAsync:jp,nonMaxSuppressionPadded:Np,nonMaxSuppressionPaddedAsync:Fp,threshold:Hp,transform:Wp},$p={bandPart:Kp,gramSchmidt:Jp,qr:Zp},em=new Map,tm=new Map,nm=class{getClassName(){return this.constructor.className}static fromConfig(e,t){return new e(t)}},rm=class e{constructor(){this.classNameMap={}}static getMap(){return e.instance??=new e,e.instance}static register(t){e.getMap().classNameMap[t.className]=[t,t.fromConfig]}};function K(e,t,n){g(e.className!=null,()=>`Class being registered does not have the static className property defined.`),g(typeof e.className==`string`,()=>`className is required to be a string, but got type `+typeof e.className),g(e.className.length>0,()=>`Class being registered has an empty-string as its className, which is disallowed.`),t===void 0&&(t=`Custom`),n===void 0&&(n=e.className);let r=n,i=t+`>`+r;return rm.register(e),em.set(i,e),tm.set(e,i),e}var im=class extends nm{minimize(e,t=!1,n){let{value:r,grads:i}=this.computeGradients(e,n);if(n!=null){let e=n.map(e=>({name:e.name,tensor:i[e.name]}));this.applyGradients(e)}else this.applyGradients(i);return L(i),t?r:(r.dispose(),null)}get iterations(){return this.iterations_??=0,this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(e,t){return $l(e,t)}dispose(){this.iterations_!=null&&L(this.iterations_)}async saveIterations(){return this.iterations_??=0,{name:`iter`,tensor:il(this.iterations_,`int32`)}}async getWeights(){throw Error(`getWeights() is not implemented for this optimizer yet.`)}async setWeights(e){throw Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)}async extractIterations(e){return this.iterations_=(await e[0].tensor.data())[0],e.slice(1)}};Object.defineProperty(im,Symbol.hasInstance,{value:e=>e.minimize!=null&&e.computeGradients!=null&&e.applyGradients!=null});var am=class extends im{static get className(){return`Adadelta`}constructor(e,t,n=null){super(),this.learningRate=e,this.rho=t,this.epsilon=n,this.accumulatedGrads=[],this.accumulatedUpdates=[],n??(this.epsilon=N.backend.epsilon())}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=N.registeredVariables[t];this.accumulatedGrads[n]??(this.accumulatedGrads[n]={originalName:`${t}/accum_grad`,variable:I(()=>Nc(r).variable(!1))}),this.accumulatedUpdates[n]??(this.accumulatedUpdates[n]={originalName:`${t}/accum_var`,variable:I(()=>Nc(r).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedGrads[n].variable,o=this.accumulatedUpdates[n].variable;I(()=>{let e=z(V(a,this.rho),V(cl(i),1-this.rho)),t=V(B(ol(z(o,this.epsilon)),ol(z(a,this.epsilon))),i),n=z(V(o,this.rho),V(cl(t),1-this.rho));a.assign(e),o.assign(n);let s=z(V(t,-this.learningRate),r);r.assign(s)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(L(this.accumulatedGrads.map(e=>e.variable)),L(this.accumulatedUpdates.map(e=>e.variable)))}async getWeights(){let e=[...this.accumulatedGrads,...this.accumulatedUpdates];return[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);let t=e.length/2;this.accumulatedGrads=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedUpdates=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.rho,t.epsilon)}},om=class extends im{static get className(){return`Adagrad`}constructor(e,t=.1){super(),this.learningRate=e,this.initialAccumulatorValue=t,this.accumulatedGrads=[]}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=N.registeredVariables[t];this.accumulatedGrads[n]??(this.accumulatedGrads[n]={originalName:`${t}/accumulator`,variable:I(()=>zs(r.shape,this.initialAccumulatorValue).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedGrads[n].variable;I(()=>{let e=z(a,cl(i));a.assign(e);let t=z(V(B(i,ol(z(e,N.backend.epsilon()))),-this.learningRate),r);r.assign(t)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&L(this.accumulatedGrads.map(e=>e.variable))}async getWeights(){return[await this.saveIterations()].concat(this.accumulatedGrads.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),this.accumulatedGrads=e.map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(e,t){return new e(t.learningRate,t.initialAccumulatorValue)}},sm=class extends im{static get className(){return`Adam`}constructor(e,t,n,r=null){super(),this.learningRate=e,this.beta1=t,this.beta2=n,this.epsilon=r,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],I(()=>{this.accBeta1=il(t).variable(),this.accBeta2=il(n).variable()}),r??(this.epsilon=N.backend.epsilon())}applyGradients(e){let t=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);I(()=>{let n=G(1,this.accBeta1),r=G(1,this.accBeta2);t.forEach((t,i)=>{let a=N.registeredVariables[t];this.accumulatedFirstMoment[i]??(this.accumulatedFirstMoment[i]={originalName:`${t}/m`,variable:I(()=>Nc(a).variable(!1))}),this.accumulatedSecondMoment[i]??(this.accumulatedSecondMoment[i]={originalName:`${t}/v`,variable:I(()=>Nc(a).variable(!1))});let o=Array.isArray(e)?e[i].tensor:e[t];if(o==null)return;let s=this.accumulatedFirstMoment[i].variable,c=this.accumulatedSecondMoment[i].variable,l=z(V(s,this.beta1),V(o,1-this.beta1)),u=z(V(c,this.beta2),V(cl(o),1-this.beta2)),d=B(l,n),f=B(u,r);s.assign(l),c.assign(u);let p=z(V(B(d,z(ol(f),this.epsilon)),-this.learningRate),a);a.assign(p)}),this.accBeta1.assign(V(this.accBeta1,this.beta1)),this.accBeta2.assign(V(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&L(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedSecondMoment!=null&&L(this.accumulatedSecondMoment.map(e=>e.variable))}async getWeights(){let e=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),I(()=>{this.accBeta1.assign(rl(this.beta1,this.iterations_+1)),this.accBeta2.assign(rl(this.beta2,this.iterations_+1))});let t=e.length/2;this.accumulatedFirstMoment=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedSecondMoment=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon)}},cm=class extends im{static get className(){return`Adamax`}constructor(e,t,n,r=null,i=0){super(),this.learningRate=e,this.beta1=t,this.beta2=n,this.epsilon=r,this.decay=i,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],I(()=>{this.iteration=il(0).variable(),this.accBeta1=il(t).variable()}),r??(this.epsilon=N.backend.epsilon())}applyGradients(e){let t=Array.isArray(e)?e.map(e=>e.name):Object.keys(e);I(()=>{let n=G(1,this.accBeta1),r=B(-this.learningRate,z(V(this.iteration,this.decay),1));t.forEach((t,i)=>{let a=N.registeredVariables[t];this.accumulatedFirstMoment[i]??(this.accumulatedFirstMoment[i]={originalName:`${t}/m`,variable:Nc(a).variable(!1)}),this.accumulatedWeightedInfNorm[i]??(this.accumulatedWeightedInfNorm[i]={originalName:`${t}/v`,variable:Nc(a).variable(!1)});let o=Array.isArray(e)?e[i].tensor:e[t];if(o==null)return;let s=this.accumulatedFirstMoment[i].variable,c=this.accumulatedWeightedInfNorm[i].variable,l=z(V(s,this.beta1),V(o,1-this.beta1)),u=Tu(V(c,this.beta2),yo(o));s.assign(l),c.assign(u);let d=z(V(B(r,n),B(l,z(u,this.epsilon))),a);a.assign(d)}),this.iteration.assign(z(this.iteration,1)),this.accBeta1.assign(V(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&L(this.accumulatedFirstMoment.map(e=>e.variable)),this.accumulatedWeightedInfNorm!=null&&L(this.accumulatedWeightedInfNorm.map(e=>e.variable))}async getWeights(){throw Error(`getWeights() is not implemented for Adamax yet.`)}async setWeights(e){throw Error(`setWeights() is not implemented for Adamax yet.`)}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(e,t){return new e(t.learningRate,t.beta1,t.beta2,t.epsilon,t.decay)}},lm=class extends im{static get className(){return`SGD`}constructor(e){super(),this.learningRate=e,this.setLearningRate(e)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=Array.isArray(e)?e[n].tensor:e[t];if(r==null)return;let i=N.registeredVariables[t];I(()=>{let e=z(V(this.c,r),i);i.assign(e)})}),this.incrementIterations()}setLearningRate(e){this.learningRate=e,this.c!=null&&this.c.dispose(),this.c=ha(il(-e))}dispose(){this.c.dispose()}async getWeights(){return[await this.saveIterations()]}async setWeights(e){if(e=await this.extractIterations(e),e.length!==0)throw Error(`SGD optimizer does not have settable weights.`)}getConfig(){return{learningRate:this.learningRate}}static fromConfig(e,t){return new e(t.learningRate)}},um=class extends lm{static get className(){return`Momentum`}constructor(e,t,n=!1){super(e),this.learningRate=e,this.momentum=t,this.useNesterov=n,this.accumulations=[],this.m=il(this.momentum)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=N.registeredVariables[t];this.accumulations[n]??(this.accumulations[n]={originalName:`${t}/momentum`,variable:I(()=>Nc(r).variable(!1))});let i=this.accumulations[n].variable,a=Array.isArray(e)?e[n].tensor:e[t];a!=null&&I(()=>{let e,t=z(V(this.m,i),a);e=this.useNesterov?z(V(this.c,z(a,V(t,this.m))),r):z(V(this.c,t),r),i.assign(t),r.assign(e)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&L(this.accumulations.map(e=>e.variable))}setMomentum(e){this.momentum=e}async getWeights(){return[await this.saveIterations()].concat(this.accumulations.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e),this.accumulations=e.map(e=>({originalName:e.name,variable:e.tensor.variable(!1)}))}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(e,t){return new e(t.learningRate,t.momentum,t.useNesterov)}},dm=class extends im{static get className(){return`RMSProp`}constructor(e,t=.9,n=0,r=null,i=!1){if(super(),this.learningRate=e,this.decay=t,this.momentum=n,this.epsilon=r,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=i,r??(this.epsilon=N.backend.epsilon()),e==null)throw Error(`learningRate for RMSPropOptimizer must be defined.`)}applyGradients(e){(Array.isArray(e)?e.map(e=>e.name):Object.keys(e)).forEach((t,n)=>{let r=N.registeredVariables[t];this.accumulatedMeanSquares[n]??(this.accumulatedMeanSquares[n]={originalName:`${t}/rms`,variable:I(()=>Nc(r).variable(!1))}),this.accumulatedMoments[n]??(this.accumulatedMoments[n]={originalName:`${t}/momentum`,variable:I(()=>Nc(r).variable(!1))}),this.accumulatedMeanGrads[n]==null&&this.centered&&(this.accumulatedMeanGrads[n]={originalName:`${t}/mg`,variable:I(()=>Nc(r).variable(!1))});let i=Array.isArray(e)?e[n].tensor:e[t];if(i==null)return;let a=this.accumulatedMeanSquares[n].variable,o=this.accumulatedMoments[n].variable;I(()=>{let e=z(V(a,this.decay),V(cl(i),1-this.decay));if(this.centered){let t=this.accumulatedMeanGrads[n].variable,s=z(V(t,this.decay),V(i,1-this.decay)),c=B(V(i,this.learningRate),ol(G(e,z(cl(s),this.epsilon)))),l=z(V(o,this.momentum),c);a.assign(e),t.assign(s),o.assign(l);let u=G(r,l);r.assign(u)}else{let e=z(V(a,this.decay),V(cl(i),1-this.decay)),t=z(V(o,this.momentum),B(V(i,this.learningRate),ol(z(e,this.epsilon))));a.assign(e),o.assign(t);let n=G(r,t);r.assign(n)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&L(this.accumulatedMeanSquares.map(e=>e.variable)),this.accumulatedMeanGrads!=null&&this.centered&&L(this.accumulatedMeanGrads.map(e=>e.variable)),this.accumulatedMoments!=null&&L(this.accumulatedMoments.map(e=>e.variable))}async getWeights(){let e=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&e.push(...this.accumulatedMeanGrads),[await this.saveIterations()].concat(e.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(e){e=await this.extractIterations(e);let t=this.centered?e.length/3:e.length/2;this.accumulatedMeanSquares=e.slice(0,t).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.accumulatedMoments=e.slice(t,t*2).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})),this.centered&&(this.accumulatedMeanGrads=e.slice(t*2,t*3).map(e=>({originalName:e.name,variable:e.tensor.variable(!1)})))}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(e,t){return new e(t.learningRate,t.decay,t.momentum,t.epsilon,t.centered)}},fm=[am,om,sm,cm,um,dm,lm];function pm(){for(let e of fm)K(e)}function mm(e,t){let n=e.shape.length,r=t.shape.length;if(n<1)throw Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${n}.`);if(r<1)throw Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${r}.`);if(t.dtype!==`int32`)throw Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${t.dtype}.`);if(t.shape[r-1]>n)throw Error(`index innermost dimension length must be <= tensor rank; saw: ${t.shape[r-1]} vs. ${n}`);if(y(e.shape)===0)throw Error(`Requested more than 0 entries, but input is empty. Input shape: ${e.shape}.`);let i=t.shape,a=i[i.length-1],o=1;for(let e=0;e<i.length-1;++e)o*=i[e];let s=e.shape,c=i.slice();c.pop();let l=1;for(let e=a;e<n;++e)l*=s[e],c.push(s[e]);let u=[...A(e.shape).map(e=>e/l),1].slice(0,a);return[c,o,l,u]}var hm=t({assertParamsValid:()=>vm,computeFlatOffset:()=>jm,computeOutShape:()=>bm,getNormalizedAxes:()=>wm,isSliceContinous:()=>Am,maskToAxes:()=>ym,parseSliceParams:()=>Mm,sliceInfo:()=>Nm,startForAxis:()=>Om,startIndicesWithElidedDims:()=>Tm,stopForAxis:()=>km,stopIndicesWithElidedDims:()=>Em,stridesForAxis:()=>Dm,stridesWithElidedDims:()=>xm}),gm=-2,_m=-1;function vm(e,t,n){let r=e.shape.length;g(r===t.length,()=>`Error in slice${r}D: Length of begin ${t} must match the rank of the array (${r}).`),g(r===n.length,()=>`Error in slice${r}D: Length of size ${n} must match the rank of the array (${r}).`);for(let i=0;i<r;++i)g(t[i]+n[i]<=e.shape[i],()=>`Error in slice${r}D: begin[${i}] + size[${i}] (${t[i]+n[i]}) would overflow input.shape[${i}] (${e.shape[i]})`)}function ym(e){let t=[],n=0;for(;e>0;)e&1&&t.push(n),e/=2,n++;return t}function bm(e,t,n){let r=[];for(let i=0;i<e.length;i++)r[i]=Math.ceil((t[i]-e[i])/n[i]);return r}function xm(e,t,n,r){let i=[...e];for(let e=i.length;e<r.length;e++)i.push(1);for(let e=0;e<n;e++)e===0?i[t]=1:(i.splice(t,0,1),i.pop());return i}function Sm(e,t,n){return n<=e?n:n-(t-1)}function Cm(e,t){let n=[];for(let r=0;r<e;r++)n.push(t+r);return n}function wm(e,t,n,r,i,a,o,s,c){let l=e.length,u=Array(l),d=Array(l),f=Array(l);if(t.length&&n>0){let c=t[0],l=n+1;u=Tm(o,c,l,r,e),d=Em(s,c,l,i,e),f=xm(a,c,l,e)}else for(let t=0;t<l;t++)u[t]=Om(o,r,a,e,t,c),d[t]=km(s,i,a,e,t,c),f[t]=Dm(a,t,c);return{begin:u,end:d,strides:f}}function Tm(e,t,n,r,i){let a=[...i],o=Cm(n,t);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=0;else{let o=Sm(t,n,i),s=r[o];e&1<<o&&(s=0),a[i]=s}return a}function Em(e,t,n,r,i){let a=[...i],o=Cm(n,t);for(let i=0;i<a.length;i++)if(o.indexOf(i)>-1)a[i]=2**53-1;else{let o=Sm(t,n,i),s=r[o];e&1<<o&&(s=2**53-1),a[i]=s}for(let e=0;e<a.length;e++){let t=i[e];a[e]<0&&(a[e]+=t),a[e]=f(0,a[e],i[e])}return a}function Dm(e,t,n){let r=e[t];return(n&1<<t||r==null)&&(r=1),r}function Om(e,t,n,r,i,a){let o=t[i],s=n[i]||1;(e&1<<i||a&1<<i||o==null)&&(o=s>0?-(2**53-1):2**53-1);let c=r[i];return o<0&&(o+=c),o=f(0,o,c-1),o}function km(e,t,n,r,i,a){let o=t[i],s=n[i]||1;(e&1<<i||a&1<<i||o==null)&&(o=s>0?2**53-1:-(2**53-1));let c=r[i];return o<0&&(o+=c),o=s>0?f(0,o,c):f(-1,o,c-1),o}function Am(e,t,n){let r=n.length;for(let e=0;e<n.length;e++)if(n[e]>1){r=e;break}for(let i=r+1;i<n.length;i++)if(t[i]>0||n[i]!==e[i])return!1;return!0}function jm(e,t){let n=e.length>0?e[e.length-1]:1;for(let r=0;r<e.length-1;r++)n+=e[r]*t[r];return n}function Mm(e,t,n){let r,i=e.shape.length;r=typeof t==`number`?[t,...Array(i-1).fill(0)]:t.length<i?t.concat(Array(i-t.length).fill(0)):t.slice(),r.forEach(e=>{g(e!==-1,()=>`slice() does not support negative begin indexing.`)});let a;return a=n==null?Array(i).fill(-1):typeof n==`number`?[n,...Array(i-1).fill(-1)]:n.length<i?n.concat(Array(i-n.length).fill(-1)):n,a=a.map((t,n)=>t>=0?t:(g(t===-1,()=>`Negative size values should be exactly -1 but got ${t} for the slice() size at index ${n}.`),e.shape[n]-r[n])),[r,a]}function Nm(e,t,n,r,i,a,o,s,c){let l;if(r==null?(l=Array(t.length),l.fill(1)):l=r,o!=null&&o&o-1)throw Error(`Multiple ellipses in slice is not allowed.`);let u=!1,d={dims:l.length,numAddAxisAfterEllipsis:0,begin:t.slice(),end:n.slice(),strides:l.slice(),beginMask:i,endMask:a,ellipsisMask:o,newAxisMask:s,shrinkAxisMask:c};for(let e=0;e<d.dims;e++)u&&1<<e&s&&d.numAddAxisAfterEllipsis++,1<<e&o&&(u=!0);u||(d.ellipsisMask|=1<<d.dims,d.dims++);let f={dims:e.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};Pm(d,f);let p=!0,m=!0,h=!0,g=[],_=[];for(let t=0;t<e.length;++t){if(f.strides[t]===0)throw Error(`strides[${t}] must be non-zero`);let n=!!(f.shrinkAxisMask&1<<t),r=e[t];if(r===-1){g.push(n?1:-1);continue}let i=[f.beginMask&1<<t,f.endMask&1<<t],a=[f.strides[t]>0?0:-1,f.strides[t]>0?r:r-1];if(n&&f.strides[t]<=0)throw Error(`only stride 1 allowed on non-range indexing.`);h&&=f.strides[t]===1;let o=!!(f.beginMask&1<<t&&f.endMask&1<<t);if(f.beginValid&&f.endValid){if(n){let e=f.begin[t]<0?r+f.begin[t]:f.begin[t];if(f.begin[t]=e,f.end[t]=f.begin[t]+1,e<0||e>=r)throw Error(`slice index ${f.begin[t]} of dimension ${t} out of bounds.`)}else f.begin[t]=Fm(f.begin[t],0,f.strides[t],r,i,a),f.end[t]=Fm(f.end[t],1,f.strides[t],r,i,a);let e=f.strides[t]===1&&f.begin[t]===0&&f.end[t]===r;p&&=e,m&&=t===0&&f.strides[t]===1||e}else p=p&&f.strides[t]===1&&o,m&&=t===0&&f.strides[t]===1||o;let s,c=!1;if(f.beginValid&&f.endValid?(s=f.end[t]-f.begin[t],c=!0):n?(s=1,c=!0):o&&r>=0&&(s=f.strides[t]<0?-r:r,c=!0),c){let e;e=s===0||s<0!=f.strides[t]<0?0:Math.trunc(s/f.strides[t])+(s%f.strides[t]===0?0:1),g.push(e)}else g.push(-1)}for(let e=0;e<f.finalShapeGatherIndices.length;++e){let t=f.finalShapeGatherIndices[e];t>=0?_.push(g[t]):t===gm&&_.push(1)}return{finalShapeSparse:_.filter((e,t)=>f.finalShapeGatherIndices[t]!==gm),finalShape:_,isIdentity:p,sliceDim0:m,isSimpleSlice:h,begin:f.begin,end:f.end,strides:f.strides}}function Pm(e,t){t.beginMask=0,t.endMask=0,t.shrinkAxisMask=0;let n=0;t.beginValid=e.begin!=null,t.endValid=e.end!=null,t.begin=Array(t.dims),t.end=Array(t.dims),t.strides=Array(t.dims),t.finalShapeGatherIndices=[],t.finalShapeGatherIndicesSparse=[],t.inputShapeGatherIndicesSparse=Array(t.dims);for(let r=0;r<e.dims;r++)if(1<<r&e.ellipsisMask){let i=Math.min(t.dims-(e.dims-r)+1+e.numAddAxisAfterEllipsis,t.dims);for(;n<i;n++)t.begin[n]=0,t.end[n]=0,t.strides[n]=1,t.beginMask|=1<<n,t.endMask|=1<<n,t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(-1),t.inputShapeGatherIndicesSparse[n]=r}else if(1<<r&e.newAxisMask)t.finalShapeGatherIndices.push(gm),t.finalShapeGatherIndicesSparse.push(-1);else{if(n===t.begin.length)throw Error(`Index out of range using input dim ${n}; input has only ${t.dims} dims, ${t.begin.length}.`);e.begin!=null&&(t.begin[n]=e.begin[r]),e.end!=null&&(t.end[n]=e.end[r]),t.strides[n]=e.strides[r],e.beginMask&1<<r&&(t.beginMask|=1<<n),e.endMask&1<<r&&(t.endMask|=1<<n),e.shrinkAxisMask&1<<r?(t.finalShapeGatherIndices.push(_m),t.finalShapeGatherIndicesSparse.push(-1),t.shrinkAxisMask|=1<<n):(t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(r)),t.inputShapeGatherIndicesSparse[n]=r,n++}}function Fm(e,t,n,r,i,a){if(i[t])return n>0?a[t]:a[t+1&1];{let t=e<0?r+e:e;return t<a[0]?a[0]:t>a[1]?a[1]:t}}var Im=class{static sgd(e){return new lm(e)}static momentum(e,t,n=!1){return new um(e,t,n)}static rmsprop(e,t=.9,n=0,r=null,i=!1){return new dm(e,t,n,r,i)}static adam(e=.001,t=.9,n=.999,r=null){return new sm(e,t,n,r)}static adadelta(e=.001,t=.95,n=null){return new am(e,t,n)}static adamax(e=.002,t=.9,n=.999,r=null,i=0){return new cm(e,t,n,r,i)}static adagrad(e,t=.1){return new om(e,t)}},Lm=typeof requestAnimationFrame<`u`?requestAnimationFrame:typeof setImmediate<`u`?setImmediate:e=>e();function Rm(){return new Promise(e=>Lm(()=>e()))}function zm(e,t){let n=e[0].length;e.forEach((e,t)=>{g(e.length===n,()=>`Error in concat${n}D: rank of tensors[${t}] must be the same as the rank of the rest (${n})`)}),g(t>=0&&t<n,()=>`Error in concat${n}D: axis must be between 0 and ${n-1}.`);let r=e[0];e.forEach((e,i)=>{for(let a=0;a<n;a++)g(a===t||e[a]===r[a],()=>`Error in concat${n}D: Shape of tensors[${i}] (${e}) does not match the shape of the rest (${r}) along the non-concatenated axis ${i}.`)})}function Bm(e,t){let n=e[0].slice();for(let r=1;r<e.length;r++)n[t]+=e[r][t];return n}var Vm;(function(e){e[e.FIRST_DIM_SIZE=0]=`FIRST_DIM_SIZE`,e[e.VALUE_ROWIDS=1]=`VALUE_ROWIDS`,e[e.ROW_LENGTHS=2]=`ROW_LENGTHS`,e[e.ROW_SPLITS=3]=`ROW_SPLITS`,e[e.ROW_LIMITS=4]=`ROW_LIMITS`,e[e.ROW_STARTS=5]=`ROW_STARTS`})(Vm||={});function Hm(e,t,n){let r=[];if(n==null&&t==null)return r;if(t==null)for(;r.length<e+n.length;)r.push(-1);else r=t.slice();if(n==null)return r;if(e+n.length!==r.length)throw Error(`rt input.shape and shape=${t} are incompatible: rt input.rank = ${e+n.length}, but shape.rank = ${r.length}`);for(let i=1;i<n.length;++i){let a=n[i],o=r[r.length-n.length+i],s=r[o];if(a>=0)if(s>=0){if(s!==a)throw Error(`rt input.shape and shape=${t} are incompatible: rt input.shape[${i+e}] = ${a} but shape[${i+e}] = ${s}`)}else r[o]=a}return r}function Um(e){let t={FIRST_DIM_SIZE:Vm.FIRST_DIM_SIZE,VALUE_ROWIDS:Vm.VALUE_ROWIDS,ROW_LENGTHS:Vm.ROW_LENGTHS,ROW_SPLITS:Vm.ROW_SPLITS,ROW_LIMITS:Vm.ROW_LIMITS,ROW_STARTS:Vm.ROW_STARTS},n=[];for(let r of e)if(r in t)n.push(t[r]);else break;return n}function Wm(e){return e.length===0?0:e[0]===Vm.FIRST_DIM_SIZE?e.length-1:e.length}function Gm(e,t){if(e==null||t==null)return;let n=e.length,r=t.length;if(n>=r)throw Error(`defaultValue.shape=${e} and ragged tensor flatValues.shape=${t}, are incompatible: defaultValue.rank = ${n} must be less than ragged tensor input flatValues.rank = ${r})`);for(let i=0;i<Math.min(n,r-1);++i){let n=e[i],r=t[i+1];if(n>=0&&r>=0&&n!==1&&n!==r)throw Error(`defaultValue.shape=${e}, and ragged tensor input flatValues.shape=${t} are incompatible: defaultValue.shape[${i-e.length}] = ${n} but ragged tensor input.flatValues.shape[${i-e.length}] = ${r}`)}}function Km(e){return e<=30?e:ue(e,Math.floor(Math.sqrt(e)))}function qm(e,t,n){return[n*(typeof e==`number`?e:e[0]),t*(typeof e==`number`?e:e[1])]}function Jm(e,t,n,r=!0){let i=[];if(r)i=i.concat(t.slice(0)),i.push(e[0]/n),i=i.concat(e.slice(1));else{i=i.concat(e[0]);let n=t.length;for(let r=0;r<n;++r)i=i.concat([e[r+1]/t[r],t[r]]);i=i.concat(e.slice(n+1))}return i}function Ym(e,t,n=!0){let r=[];if(n){r.push(t);for(let n=t+1;n<e;++n)n<=2*t?(r.push(n),r.push(n-(t+1))):r.push(n)}else{let n=[],i=[];for(let r=1;r<e;++r)r>=t*2+1||r%2==1?i.push(r):n.push(r);r.push(...n),r.push(0),r.push(...i)}return r}function Xm(e,t,n,r=!0){let i=[];r?i.push(e[0]/n):i.push(e[0]*n);for(let n=1;n<e.length;++n)n<=t.length?r?i.push(t[n-1]*e[n]):i.push(e[n]/t[n-1]):i.push(e[n]);return i}function Zm(e,t){let n=[0];for(let r=0;r<t;++r)n.push(e[r][0]);return n}function Qm(e,t,n){let r=e.slice(0,1);for(let i=0;i<n;++i)r.push(e[i+1]-t[i][0]-t[i][1]);return r}var $m=1.7580993408473768,eh=1.0507009873554805,th=.3275911,nh=.254829592,rh=-.284496736,ih=1.421413741,ah=-1.453152027,oh=1.061405429;function sh(e,t){if(e.length!==t.length)throw Error(`Cannot merge real and imag arrays of different lengths. real:${e.length}, imag: ${t.length}.`);let n=new Float32Array(e.length*2);for(let r=0;r<n.length;r+=2)n[r]=e[r/2],n[r+1]=t[r/2];return n}function ch(e){let t=new Float32Array(e.length/2),n=new Float32Array(e.length/2);for(let r=0;r<e.length;r+=2)t[r/2]=e[r],n[r/2]=e[r+1];return{real:t,imag:n}}function lh(e){let t=Math.ceil(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let t=0;t<e.length;t+=4)n[Math.floor(t/4)]=e[t],r[Math.floor(t/4)]=e[t+1];return{real:n,imag:r}}function uh(e){let t=Math.floor(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let t=2;t<e.length;t+=4)n[Math.floor(t/4)]=e[t],r[Math.floor(t/4)]=e[t+1];return{real:n,imag:r}}function dh(e,t){return{real:e[t*2],imag:e[t*2+1]}}function fh(e,t,n,r){e[r*2]=t,e[r*2+1]=n}function ph(e,t){let n=new Float32Array(e/2),r=new Float32Array(e/2);for(let i=0;i<Math.ceil(e/2);i++){let a=(t?2:-2)*Math.PI*(i/e);n[i]=Math.cos(a),r[i]=Math.sin(a)}return{real:n,imag:r}}function mh(e,t,n){let r=(n?2:-2)*Math.PI*(e/t);return{real:Math.cos(r),imag:Math.sin(r)}}var hh=`->`,gh=/->/g,_h=`,`,vh=`...`;function yh(e,t){e=e.replace(/\s/g,``);let n=(e.length-e.replace(gh,``).length)/2;if(n<1)throw Error(`Equations without an arrow are not supported.`);if(n>1)throw Error(`Equation must contain exactly one arrow ("${hh}").`);let[r,i]=e.split(hh);g(r.indexOf(vh)===-1,()=>`The ellipsis notation ("${vh}") is not supported yet.`);let a=r.split(_h),o=a.length;if(t!==o)throw Error(`Expected ${o} input tensors, received ${t}`);if(o>2)throw Error(`Support for more than 2 input tensors is not implemented yet.`);let s=[];for(let e=0;e<i.length;++e){let t=i[e];if(!a.some(e=>e.indexOf(t)!==-1))throw Error(`Output subscripts contain the label ${t} not present in the input subscripts.`);s.indexOf(t)===-1&&s.push(t)}for(let e=0;e<r.length;++e){let t=r[e];s.indexOf(t)===-1&&t!==_h&&s.push(t)}let c=Array(a.length);for(let e=0;e<o;++e){if(new Set(a[e].split(``)).size!==a[e].length)throw Error(`Found duplicate axes in input component ${a[e]}. Support for duplicate axes in input is not implemented yet.`);c[e]=[];for(let t=0;t<a[e].length;++t)c[e].push(s.indexOf(a[e][t]))}let l=s.length,u=i.length,d=[];for(let e=u;e<l;++e)d.push(e);return{allDims:s,summedDims:d,idDims:c}}function bh(e,t){let n=Array(e);n.fill(-1);for(let e=0;e<t.length;++e)n[t[e]]=e;let r=[];for(let t=0;t<e;++t)n[t]===-1&&r.push(t);return n=n.filter(e=>e!==-1),{permutationIndices:n,expandDims:r}}function xh(e,t,n){let r=Array(e);for(let e=0;e<n.length;++e){let i=n[e].shape;for(let n=0;n<t[e].length;++n)r[t[e][n]]===void 0?r[t[e][n]]=i[n]:g(r[t[e][n]]===i[n],()=>`Expected dimension ${r[t[e][n]]} at axis ${n} of input shaped ${JSON.stringify(i)}, but got dimension ${i[n]}`)}}function Sh(e,t){let n=e,r=[],i=0;e.length===0&&n.push(-1),i=e.length+1;for(let e=0;e<i;++e)r.push([]);let a=[];for(let e=0;e<n.length;++e){let i=n[e],o=wh(t,i);for(let t of o)a.indexOf(t)===-1&&(r[e].push(t),a.push(t))}return{path:n,steps:r}}function Ch(e){return e.every((e,t)=>e===t)}function wh(e,t){let n=[];for(let r=0;r<e.length;++r)(e[r].length===0||e[r].indexOf(t)!==-1||t===-1)&&n.push(r);return n}function Th(e,t,n=0){let r=[];if(typeof t==`number`)g(e.shape[n]%t===0,()=>`Number of splits must evenly divide the axis.`),r=Array(t).fill(e.shape[n]/t);else{g(t.reduce((e,t)=>(t===-1&&(e+=1),e),0)<=1,()=>`There should be only one negative value in split array.`);let i=t.indexOf(-1);if(i!==-1){let r=t.reduce((e,t)=>t>0?e+t:e);t[i]=e.shape[n]-r}g(e.shape[n]===t.reduce((e,t)=>e+t),()=>`The sum of sizes must match the size of the axis dimension.`),r=t}return r}function Eh(e){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${e}`}function Dh(e,t){return`indices(${e}, 0) is invalid: ${t} < 0`}function Oh(e,t,n){return`indices(${e}, 0) is invalid: ${t} >= ${n}`}function kh(e,t){return`only one output dimension may be -1, not both ${e} and ${t}`}function Ah(e,t){return`size ${e} must be non-negative, not ${t}`}function jh(){return`reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero`}function Mh(e,t){return`Input to reshape is a SparseTensor with ${y(e)}
  dense values, but the requested shape requires a multiple of ${y(t)}. inputShape=${e} outputShape= ${t}`}function Nh(e,t){return`Input to reshape is a tensor with ${y(e)} dense values, but the requested shape has ${y(t)}. inputShape=${e} outputShape=${t}`}function Ph(){return`segment ids must be >= 0`}function Fh(){return`segment ids are not increasing`}function Ih(e,t){return`Segment id ${e} out of range [0, ${t}), possibly because segmentIds input is not sorted.`}function Lh(e,t,n){return`Bad: indices[${e}] == ${t} out of range [0, ${n})`}var Rh=t({collectGatherOpShapeInfo:()=>Vh,computeOutShape:()=>Bh,segOpComputeOptimalWindowSize:()=>zh});function zh(e,t){let n=!1,r;for(e<=30?(r=e,n=!0):r=ue(e,Math.floor(Math.sqrt(e)));!n;)r>t||r===e?n=!0:r=ue(e,r+1);return r}function Bh(e,t,n){let r=[],i=e.length;for(let a=0;a<i;a++)a===t?r.push(n):r.push(e[a]);return r}function Vh(e,t,n,r){let i=t.shape.length,a=e.shape.length;if(r!==0&&(r<-i||r>i))throw Error(`Expect batchDims in the range of [-${i}, ${i}], but got ${r}`);if(r<0&&(r+=i),r>a)throw Error(`batchDims (${r}) must be less than rank(x) (
    ${a}).`);if(n<r)throw Error(`batchDims (${r}) must be less than or equal to axis (${n}).`);for(let n=0;n<r;++n)if(e.shape[n]!==t.shape[n])throw Error(`x.shape[${n}]: ${e.shape[n]} should be equal to indices.shape[${n}]: ${t.shape[n]}.`);let o=e.shape[n],s=[],c=1,l=1,u=1;for(let t=0;t<r;++t)s.push(e.shape[t]),c*=e.shape[t];for(let t=r;t<n;t++)s.push(e.shape[t]),l*=e.shape[t];for(let e=r;e<i;e++)s.push(t.shape[e]);for(let t=n+1;t<a;t++)s.push(e.shape[t]),u*=e.shape[t];return{batchSize:c,sliceSize:u,outerSize:l,dimSize:o,outputShape:s}}var Hh=t({ERF_A1:()=>nh,ERF_A2:()=>rh,ERF_A3:()=>ih,ERF_A4:()=>ah,ERF_A5:()=>oh,ERF_P:()=>th,PARALLELIZE_THRESHOLD:()=>30,RowPartitionType:()=>Vm,SELU_SCALE:()=>eh,SELU_SCALEALPHA:()=>$m,applyActivation:()=>Kf,assertAndGetBroadcastShape:()=>U,assertAxesAreInnerMostDims:()=>Jc,assertParamsConsistent:()=>zm,assignToTypedArray:()=>fh,axesAreInnerMostDims:()=>Wc,calculateShapes:()=>wf,checkEinsumDimSizes:()=>xh,checkPadOnDimRoundingMode:()=>os,combineLocations:()=>Gc,combineRaggedTensorToTensorShapes:()=>Hm,complexWithEvenIndex:()=>lh,complexWithOddIndex:()=>uh,computeConv2DInfo:()=>Go,computeConv3DInfo:()=>Ko,computeDefaultPad:()=>Yo,computeDilation2DInfo:()=>Ho,computeOptimalWindowSize:()=>Km,computeOutAndReduceShapes:()=>Kc,computeOutShape:()=>Bm,computePool2DInfo:()=>Uo,computePool3DInfo:()=>Wo,convertConv2DDataFormat:()=>as,decodeEinsumEquation:()=>yh,eitherStridesOrDilationsAreOne:()=>rs,expandShapeToKeepDim:()=>qc,exponent:()=>mh,exponents:()=>ph,fromStringArrayToUint8:()=>Wh,fromUint8ToStringArray:()=>Uh,getAxesPermutation:()=>Yc,getBroadcastDims:()=>Ec,getComplexWithIndex:()=>dh,getEinsumComputePath:()=>Sh,getEinsumPermutation:()=>bh,getFusedBiasGradient:()=>Gf,getFusedDyActivation:()=>Wf,getImageCenter:()=>qm,getInnerMostAxes:()=>Zc,getPermuted:()=>Ym,getRaggedRank:()=>Wm,getReductionAxes:()=>Dc,getReshaped:()=>Jm,getReshapedPermuted:()=>Xm,getRowPartitionTypesHelper:()=>Um,getSliceBeginCoords:()=>Zm,getSliceSize:()=>Qm,getSparseFillEmptyRowsIndicesDenseShapeMismatch:()=>Eh,getSparseFillEmptyRowsNegativeIndexErrorMessage:()=>Dh,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:()=>Oh,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:()=>jh,getSparseReshapeInputOutputMismatchErrorMessage:()=>Nh,getSparseReshapeInputOutputMultipleErrorMessage:()=>Mh,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:()=>kh,getSparseReshapeNegativeOutputDimErrorMessage:()=>Ah,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:()=>Lh,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:()=>Ph,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:()=>Fh,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:()=>Ih,getUndoAxesPermutation:()=>Xc,isIdentityPermutation:()=>Ch,log:()=>Dr,mergeRealAndImagArrays:()=>sh,prepareAndValidate:()=>mm,prepareSplitSize:()=>Th,segment_util:()=>Rh,shouldFuse:()=>qf,slice_util:()=>hm,splitRealAndImagArrays:()=>ch,stridesOrDilationsArePositive:()=>is,tupleValuesAreOne:()=>ns,upcastType:()=>Ii,validateDefaultValueShape:()=>Gm,validateInput:()=>Cf,validateUpdateShape:()=>Sf,warn:()=>Er});function Uh(e){try{return e.map(e=>oi(e))}catch(e){throw Error(`Failed to decode encoded string bytes into utf-8, error: ${e}`)}}function Wh(e){return e.map(e=>ai(e))}pm();var Gh={kernelName:`Abs`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,hf(R(n,`float32`),-1))}}},Kh={kernelName:Me,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>{let t=cl(R(n,`float32`));return nu(B(e,ol(G(il(1),t))))}}}},qh={kernelName:Ne,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,ol(G(cl(R(n,`float32`)),1)))}}},Jh={kernelName:`Add`,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=e,r=Dc(n.shape,i);return r.length>0&&(t=W(t,r)),H(t,n.shape)},b:()=>{let t=e,n=Dc(r.shape,i);return n.length>0&&(t=W(t,n)),H(t,r.shape)}}}},Yh={kernelName:Pe,saveAllInputs:!0,gradFunc:(e,t)=>{let n={};return t.forEach((t,r)=>{n[r]=()=>e.clone()}),n}},Xh={kernelName:Fe,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>Nc(n)}}},Zh={kernelName:Ie,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>Nc(n)}}},Qh={kernelName:Le,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,ol(G(il(1),cl(R(n,`float32`)))))}}},$h={kernelName:Re,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,ol(z(il(1),cl(R(n,`float32`)))))}}},eg={kernelName:Ve,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=z(cl(n),cl(r)),a=V(e,B(r,t)),o=Dc(n.shape,i);return o.length>0&&(a=W(a,o)),H(a,n.shape)},b:()=>{let t=z(cl(n),cl(r)),a=nu(V(e,B(n,t))),o=Dc(r.shape,i);return o.length>0&&(a=W(a,o)),H(a,r.shape)}}}},tg={kernelName:ze,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,z(cl(R(n,`float32`)),1))}}},ng={kernelName:Be,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,G(il(1),cl(R(n,`float32`))))}}};function rg(e,t,n,r,i,a){let o=P(e,`dy`,`avgPool3dGrad`),s=P(t,`input`,`avgPool3dGrad`),c=o,l=s,u=!1;s.rank===4&&(u=!0,c=H(o,[1,o.shape[0],o.shape[1],o.shape[2],o.shape[3]]),l=H(s,[1,s.shape[0],s.shape[1],s.shape[2],s.shape[3]])),g(c.rank===5,()=>`Error in avgPool3dGrad: dy must be rank 5 but got rank ${c.rank}.`),g(l.rank===5,()=>`Error in avgPool3dGrad: input must be rank 5 but got rank ${l.rank}.`),os(`avgPool3dGrad`,i,a);let d={dy:c,input:l},f={filterSize:n,strides:r,pad:i,dimRoundingMode:a},p=N.runKernel(Ge,d,f);return u?H(p,[p.shape[1],p.shape[2],p.shape[3],p.shape[4]]):p}var ig=F({avgPool3dGrad_:rg}),ag={kernelName:We,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{filterSize:i,strides:a,pad:o,dimRoundingMode:s}=n;return{x:()=>ig(e,r,i,a,o,s)}}};function og(e,t,n,r,i){let a=P(e,`dy`,`avgPoolGrad`),o=P(t,`input`,`avgPoolGrad`);g(o.rank===a.rank,()=>`Rank of input (${o.rank}) does not match rank of dy (${a.rank})`);let s=o,c=a,l=!1;o.rank===3&&(l=!0,s=H(o,[1,o.shape[0],o.shape[1],o.shape[2]]),c=H(a,[1,a.shape[0],a.shape[1],a.shape[2]])),g(c.rank===4,()=>`Error in avgPoolGrad: dy must be rank 4 but got rank ${c.rank}.`),g(s.rank===4,()=>`Error in avgPoolGrad: input must be rank 4 but got rank ${s.rank}.`);let u={dy:c,input:s},d={filterSize:n,strides:r,pad:i},f=N.runKernel(Ue,u,d);return l?H(f,[f.shape[1],f.shape[2],f.shape[3]]):f}var sg=F({avgPoolGrad_:og}),cg={kernelName:He,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{filterSize:i,strides:a,pad:o}=n;return{x:()=>sg(e,r,i,a,o)}}},lg={kernelName:Ke,inputsToSave:[`a`,`b`],gradFunc:(e,t,n)=>{let[r,i]=t,{transposeA:a,transposeB:o}=n;return!a&&!o?{a:()=>hs(e,i,!1,!0),b:()=>hs(r,e,!0,!1)}:!a&&o?{a:()=>hs(e,i,!1,!1),b:()=>hs(e,r,!0,!1)}:a&&!o?{a:()=>hs(i,e,!1,!0),b:()=>hs(r,e,!1,!1)}:{a:()=>hs(i,e,!0,!0),b:()=>hs(e,r,!0,!0)}}},ug={kernelName:qe,gradFunc:(e,t,n)=>{let{blockShape:r,crops:i}=n;return{x:()=>qu(e,r,i)}}},dg={kernelName:Xe,gradFunc:(e,t,n)=>{let r=n,i=r.inputShape,a=r.shape,o=Array.from(a);for(let e=i.length-1;e>=0;e--)if(i[e]===a[e])o[e]=1;else if(i[e]!==1)throw Error(`broadcastTo(): [${i}] cannot be broadcast to [${a}].`);let s=[];for(let e=0;e<o.length;e++)o[e]>1&&s.push(e);return{x:()=>W(e,s,!0)}}},fg={kernelName:Qe,gradFunc:e=>({x:()=>e.clone()})},pg={kernelName:$e,gradFunc:e=>({x:()=>Nc(e)})},mg={kernelName:et,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{clipValueMin:i,clipValueMax:a}=n;return{x:()=>jc(pu(Ml(r,i),Kl(r,a)),e,Nc(e))}}},hg={kernelName:nt,inputsToSave:[`x`],gradFunc:Gh.gradFunc},gg={kernelName:rt,saveAllInputs:!0,gradFunc:(e,t,n)=>{let r=t.map(e=>e.shape),{axis:i}=n,a=E(i,t[0].shape)[0];return af(e,r.map(e=>e[a]),a).map(e=>()=>e)}},_g={kernelName:it,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let[r,i]=t,{dilations:a,strides:o,pad:s,dataFormat:c}=n;return g(ns(a),()=>`Error in gradient of conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${a}'`),{x:()=>tc(r.shape,e,i,o,s,c),filter:()=>Uf(r,e,i.shape,o,s,c)}}},vg={kernelName:ot,inputsToSave:[`dy`,`filter`],gradFunc:(e,t,n)=>{let[r,i]=t,{strides:a,pad:o,dataFormat:s,dimRoundingMode:c}=n;return{dy:()=>Zs(e,i,a,o,s,1,c),filter:()=>Uf(e,r,i.shape,a,o,s,c)}}};function yg(e,t,n,r,i){let a=e;e.rank===4&&(a=H(e,[1,e.shape[0],e.shape[1],e.shape[2],e.shape[3]]));let o=t;o.rank===4&&(o=H(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]])),g(a.rank===5,()=>`Error in conv3dDerFilter: input must be rank 5, but got shape ${a.shape}.`),g(o.rank===5,()=>`Error in conv3dDerFilter: dy must be rank 5, but got shape ${o.shape}.`),g(n.length===5,()=>`Error in conv3dDerFilter: filterShape must be length 5, but got ${n}.`),g(a.shape[4]===n[3],()=>`Error in conv3dDerFilter: depth of input ${a.shape[4]}) must match input depth in filter (${n[3]}.`),g(o.shape[4]===n[4],()=>`Error in conv3dDerFilter: depth of dy (${o.shape[4]}) must match output depth for filter (${n[4]}).`);let s={x:a,dy:o},c={strides:r,pad:i,filterShape:n};return N.runKernel(ct,s,c)}var bg=F({conv3DBackpropFilter_:yg}),xg={kernelName:st,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let{dilations:r,strides:i,pad:a}=n;g(ns(r),()=>`Error in gradient of conv3D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${r}'`);let[o,s]=t;return{x:()=>sc(o.shape,e,s,i,a),filter:()=>bg(o,e,s.shape,i,a)}}},Sg={kernelName:`Cos`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(nu(Rd(R(n,`float32`))),e)}}},Cg={kernelName:ut,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(Bd(R(n,`float32`)),e)}}},wg={kernelName:ft,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{axis:i,exclusive:a,reverse:o}=n;return{x:()=>{let t=Yc([i],r.rank),n=_c(e,i,a,!o);return t!=null&&(n=Rf(n,t)),n}}}},Tg={kernelName:gt,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let{dilations:r,strides:i,pad:a,dimRoundingMode:o}=n,s=r??[1,1];g(ns(s),()=>`Error in gradient of depthwiseConv2dNative: dilation rates greater than 1 are not yet supported. Got dilations '${s}'`);let[c,l]=t;return g(c.rank===4,()=>`Error in gradient of depthwiseConv2dNative: input must be rank 4, but got rank ${c.rank}.`),g(l.rank===4,()=>`Error in gradient of depthwiseConv2dNative: filter must be rank 4, but got rank ${l.rank}.`),g(c.shape[3]===l.shape[2],()=>`Error in gradient of depthwiseConv2d: number of input channels (${c.shape[3]}) must match the inChannels dimension in filter ${l.shape[2]}.`),g(rs(i,s),()=>`Error in gradient of depthwiseConv2d: Either strides or dilations must be  1. Got strides ${i} and dilations '${s}'.`),os(`depthwiseConv2d`,a,o),{x:()=>$f(c.shape,e,l,i,a,s,o),filter:()=>Zf(c,e,l.shape,i,a,s,o)}}},Eg={kernelName:bt,inputsToSave:[`x`,`filter`],gradFunc:(e,t,n)=>{let[r,i]=t,a={x:r,filter:i,dy:e},o={x:r,filter:i,dy:e};return{x:()=>N.runKernel(xt,a,n),filter:()=>N.runKernel(St,o,n)}}},Dg={kernelName:`Elu`,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t,r={dy:e,y:n};return{x:()=>N.runKernel(Et,r)}}},Og={kernelName:`Erf`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t,r=V(gl(nu(cl(n))),2/Math.sqrt(Math.PI));return{x:()=>V(e,r)}}},kg={kernelName:`Exp`,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,n)}}},Ag={kernelName:Ot,inputsToSave:[`input`],gradFunc:(e,t)=>{let[n]=t;return{input:()=>H(e,n.shape)}}},jg={kernelName:kt,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,gl(n))}}},Mg={kernelName:Mt,gradFunc:e=>({x:()=>Nc(e)})},Ng={kernelName:Nt,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=B(e,R(r,`float32`)),a=Dc(n.shape,i);return a.length>0?H(W(t,a),n.shape):t},b:()=>{let t=V(e,R(n,`float32`)),a=Dc(r.shape,i);a.length>0&&(t=H(W(t,a),r.shape));let o=cl(r);return nu(B(t,R(o,`float32`)))}}}},Pg={kernelName:Pt,inputsToSave:[`x`,`mean`,`variance`,`scale`],gradFunc:(e,t,n)=>{let{varianceEpsilon:r}=n,[i,a,o,s]=t,c=s??il(1),l=Dc(a.shape,i.shape),u=[];if(a.rank===1){for(let e=0;e<i.shape.length-1;++e)u.push(i.shape[e]);u.push(1)}let d=G(i,a),f=V(e,c),p=Ad(z(o,il(r))),m=V(V(V(p,p),p),il(-.5));return{x:()=>a.rank===1?H(V(V(e,Sl(H(p,[1,1,1,a.shape[0]]),u)),c),i.shape):H(V(V(e,p),c),i.shape),mean:()=>{let e=V(V(p,il(-1)),f);return a.rank===1&&(e=W(e,l)),H(e,a.shape)},variance:()=>{let e=V(V(m,d),f);return a.rank===1&&(e=W(e,l)),H(e,a.shape)},scale:()=>{let t=V(e,V(d,p));return a.rank===1&&(t=W(t,l)),H(t,a.shape)},offset:()=>{let t=e;return a.rank===1&&(t=W(t,l)),H(t,a.shape)}}}},Fg={kernelName:Ft,inputsToSave:[`x`,`indices`],gradFunc:(e,t,n)=>{let[r,i]=t,{axis:a,batchDims:o}=n,s=E(a,r.shape)[0],c=(e,t,n)=>()=>{let r=e.shape,i=t.size,o=r.slice(0,s),c=o.length,l=r.slice(a,r.length).slice(1),u=l.length,d=Ig(0,c),f=Ig(c+1,c+1+u),p=H(n,Lg([o,[i],l])),m=H(t,[i]),h=Lg([[c],d,f]),g=Mf(Rf(p,h),m,e.shape[s]),_=Xc(h);return g=Rf(g,_),g};if(o===1){let t=r.shape[0],n=r.split(t,0);return{x:()=>pf(n.map((t,n)=>c(t,i.slice(n,1),e.slice(n,1))())).reshape(r.shape),indices:()=>i}}return{x:c(r,i,e),indices:()=>i}}};function Ig(e,t){let n=[];for(let r=e;r<t;++r)n.push(r);return n}function Lg(e){let t=[];for(let n=0;n<e.length;++n)for(let r=0;r<e[n].length;++r)t.push(e[n][r]);return t}var Rg={kernelName:Rt,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t;return{a:()=>Nc(n),b:()=>Nc(r)}}},zg={kernelName:zt,gradFunc:e=>({x:()=>R(e,`float32`)})},Bg={kernelName:Ht,gradFunc:e=>({x:()=>Nc(e)})},Vg={kernelName:Ut,gradFunc:e=>({x:()=>Nc(e)})},Hg={kernelName:Wt,gradFunc:e=>({x:()=>Nc(e)})},Ug={kernelName:Gt,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{alpha:i}=n,a=Al(r,0);return{x:()=>jc(a,e,V(e,i))}}},Wg={kernelName:Yt,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,z(n,1))}}},Gg={kernelName:`Log`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,R(n,`float32`))}}},Kg={kernelName:$t,inputsToSave:[],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r]=t,{axis:i}=n;return{logits:()=>{let t=gl(r);return G(e,V(W(e,i,!0),t))}}}};function qg(e,t,n,r=5,i=1,a=1,o=.5){let s={x:e,y:t,dy:n},c={depthRadius:r,bias:i,alpha:a,beta:o};return N.runKernel(en,s,c)}var Jg=F({localResponseNormalizationBackprop_:qg}),Yg={kernelName:`LRN`,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r,i]=t,{depthRadius:a,bias:o,alpha:s,beta:c}=n;return{x:()=>Jg(r,i,e,a,o,s,c)}}};function Xg(e,t,n,r){return t.rank<n.rank&&(t=H(t,qc(t.shape,r))),e.rank<n.rank&&(e=H(e,qc(e.shape,r))),{x:()=>V(e,R(kc(n,t),e.dtype))}}var Zg={kernelName:`Max`,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let{reductionIndices:r}=n,i=t[0],a=t[1],o=Xg(e,a,i,E(r,i.shape));return{x:()=>o.x()}}},Qg={kernelName:tn,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t;return{a:()=>V(e,R(Ml(n,r),`float32`)),b:()=>V(e,R(Wl(n,r),`float32`))}}};function $g(e,t,n,r,i,a,o){let s=P(e,`dy`,`maxPool3dGrad`),c=P(t,`input`,`maxPool3dGrad`),l=P(n,`output`,`maxPool3dGrad`),u=s,d=c,f=l,p=!1;c.rank===4&&(p=!0,u=H(s,[1,s.shape[0],s.shape[1],s.shape[2],s.shape[3]]),d=H(c,[1,c.shape[0],c.shape[1],c.shape[2],c.shape[3]]),f=H(l,[1,l.shape[0],l.shape[1],l.shape[2],l.shape[3]])),g(u.rank===5,()=>`Error in maxPool3dGrad: dy must be rank 5 but got rank ${u.rank}.`),g(d.rank===5,()=>`Error in maxPool3dGrad: input must be rank 5 but got rank ${d.rank}.`),g(f.rank===5,()=>`Error in maxPool3dGrad: output must be rank 5 but got rank ${f.rank}.`),os(`maxPool3dGrad`,a,o);let m={dy:u,input:d,output:f},h={filterSize:r,strides:i,pad:a,dimRoundingMode:o},_=N.runKernel(on,m,h);return p?H(_,[_.shape[1],_.shape[2],_.shape[3],_.shape[4]]):_}var e_=F({maxPool3dGrad_:$g}),t_={kernelName:an,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r,i]=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=n;return{x:()=>e_(e,r,i,a,o,s,c)}}};function n_(e,t,n,r,i,a,o){let s=P(e,`dy`,`maxPoolGrad`),c=P(t,`input`,`maxPoolGrad`),l=P(n,`output`,`maxPoolGrad`);g(c.rank===s.rank,()=>`Rank of input (${c.rank}) does not match rank of dy (${s.rank})`),g(s.rank===4,()=>`Error in maxPoolGrad: dy must be rank 4 but got rank ${s.rank}.`),g(c.rank===4,()=>`Error in maxPoolGrad: input must be rank 4 but got rank ${c.rank}.`),os(`maxPoolGrad`,a,o);let u={dy:s,input:c,output:l},d={filterSize:r,strides:i,pad:a,dimRoundingMode:o};return N.runKernel(rn,u,d)}var r_=F({maxPoolGrad_:n_}),i_={kernelName:nn,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r,i]=t,{filterSize:a,strides:o,pad:s}=n;return{x:()=>r_(e,r,i,a,o,s)}}},a_={kernelName:cn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{axis:i}=n,a=E(i,r.shape),o=Kc(r.shape,a)[1],s=y(o);return{x:()=>{let t=r.shape.slice();return a.forEach(e=>{t[e]=1}),B(V(H(e,t),ku(r.shape,`float32`)),s)}}}},o_={kernelName:`Min`,inputsToSave:[`x`],outputsToSave:[!0],gradFunc:(e,t,n)=>{let{axis:r}=n,[i,a]=t,o=Xg(e,a,i,E(r,i.shape));return{x:()=>o.x()}}},s_={kernelName:ln,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t;return{a:()=>V(e,R(Kl(n,r),`float32`)),b:()=>V(e,R(Al(n,r),`float32`))}}},c_={kernelName:un,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let r=t[0],{paddings:i}=n,a=i.map(e=>e[0]);return{x:()=>ys(e,a,r.shape)}}},l_={kernelName:`Mod`,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=Dc(n.shape,i);return t.length>0?H(W(e,t),n.shape):e},b:()=>{let t=V(e,nu(El(B(n,r)))),a=Dc(r.shape,i);return a.length>0?H(W(t,a),r.shape):t}}}},u_={kernelName:fn,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=V(e,R(r,`float32`)),a=Dc(n.shape,i);return a.length>0?H(W(t,a),n.shape):t},b:()=>{let t=V(e,R(n,`float32`)),a=Dc(r.shape,i);return a.length>0?H(W(t,a),r.shape):t}}}},d_={kernelName:`Neg`,gradFunc:e=>({x:()=>nu(e)})},f_={kernelName:vn,inputsToSave:[`indices`],gradFunc:(e,t)=>{let n=t[0];return{indices:()=>Ou(n.shape,`float32`)}}},p_={kernelName:_n,gradFunc:e=>({x:()=>Nc(e)})},m_={kernelName:yn,saveAllInputs:!0,gradFunc:(e,t,n)=>{let{axis:r}=n;return Pf(e,r).map(e=>()=>e)}},h_={kernelName:bn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let r=t[0],{paddings:i}=n,a=i.map(e=>e[0]);return{x:()=>ys(e,a,r.shape)}}},g_={kernelName:`Pow`,inputsToSave:[`a`,`b`],outputsToSave:[!0],gradFunc:(e,t)=>{let[n,r,i]=t,a=n,o=r,s=U(a.shape,o.shape);return{a:()=>{let t=R(o,`float32`),n=V(e,V(t,rl(a,G(t,il(1))))),r=Dc(a.shape,s);return r.length>0&&(n=W(n,r)),H(n,a.shape)},b:()=>{let t=jc(Al(a,0),Xl(a),Nc(a)),n=V(e,V(i,t)),r=Dc(o.shape,s);return r.length>0&&(n=W(n,r)),H(n,o.shape)}}}},__={kernelName:xn,inputsToSave:[`x`,`alpha`],gradFunc:(e,t)=>{let[n,r]=t,i=Al(n,0);return{x:()=>jc(i,e,V(e,r)),alpha:()=>{let t=jc(i,Nc(e),V(e,n)),a=Dc(r.shape,e.shape);return a.length>0&&(t=W(t,a)),H(t,r.shape)}}}};function v_(e,t,n){let r=e.shape.slice();return r[n]=1,V(H(t,r),V(hc(e,n,!0,!1),hc(e,n,!0,!0)))}function y_(e,t,n){let r=e.shape.length,i=r-n.length,a=Yc(n,r),o=e;a!=null&&(o=Rf(e,a));let s=o.shape.slice(),c=s.splice(r-n.length,n.length).reduce((e,t)=>e*t,1);s.push(c);let l=v_(o.reshape(s),t,i);if(l=l.reshape(o.shape),a!=null){let e=Xc(a);l=Rf(l,e)}return l}var b_={kernelName:Sn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{axis:i}=n,a=[];return a=i==null?r.shape.map((e,t)=>t):typeof i==`number`?[i]:i,{x:()=>y_(r,e,a)}}},x_={kernelName:wt,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=B(e,R(r,`float32`)),a=Dc(n.shape,i);return a.length>0?H(W(t,a),n.shape):t},b:()=>{let t=V(e,R(n,`float32`)),a=Dc(r.shape,i);a.length>0&&(t=H(W(t,a),r.shape));let o=cl(r);return nu(B(t,R(o,`float32`)))}}}},S_={kernelName:On,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,nu(cl(n)))}}},C_={kernelName:Fn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t,r=V(Kl(n,6),hf(n));return{x:()=>V(e,R(r,`float32`))}}},w_={kernelName:kn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,R(hf(n),`float32`))}}},T_={kernelName:An,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>H(e,n.shape)}}},E_={kernelName:Nn,inputsToSave:[`images`],gradFunc:(e,t,n)=>{let[r]=t,i={dy:e,images:r};return{images:()=>N.runKernel(Pn,i,n)}}},D_={kernelName:jn,inputsToSave:[`images`],gradFunc:(e,t,n)=>{let[r]=t,i={dy:e,images:r};return{images:()=>N.runKernel(Mn,i,n)}}},O_={kernelName:In,gradFunc:(e,t,n)=>{let{dims:r}=n,i=E(r,e.shape);return{x:()=>Ed(e,i)}}},k_={kernelName:Ln,gradFunc:e=>({x:()=>Nc(e)})},A_={kernelName:Rn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>nu(B(e,V(rl(n,1.5),2)))}}},j_={kernelName:Hn,inputsToSave:[`condition`],gradFunc:(e,t)=>{let[n]=t;return{condition:()=>R(Nc(n),`float32`),t:()=>V(e,R(n,e.dtype)),e:()=>V(e,R(hu(n),e.dtype))}}},M_={kernelName:Un,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>{let t=Al(n,il(0)),r=il($m);return jc(t,V(e,il(eh)),V(V(e,r),gl(R(n,`float32`))))}}}},N_={kernelName:qn,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,V(n,G(il(1),n)))}}},P_={kernelName:Kn,gradFunc:e=>({x:()=>Nc(e)})},F_={kernelName:`Sin`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(dc(R(n,`float32`)),e)}}},I_={kernelName:Gn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(pc(R(n,`float32`)),e)}}},L_={kernelName:Wn,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{begin:i,size:a}=n,o=r.shape,[s,c]=Mm(r,i,a),l=[];for(let t=0;t<e.rank;t++)l.push([s[t],o[t]-s[t]-c[t]]);return{x:()=>Gu(e,l)}}},R_={kernelName:Qn,outputsToSave:[!0],gradFunc:(e,t,n)=>{let[r]=t,{dim:i}=n,a=V(e,r);return{logits:()=>G(a,V(W(a,[i],!0),r))}}},z_={kernelName:Jn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,_s(n))}}},B_={kernelName:Xn,gradFunc:(e,t,n)=>{let{blockShape:r,paddings:i}=n;return{x:()=>Cs(e,r,i)}}},V_={kernelName:Zn,gradFunc:(e,t,n)=>{let{axis:r}=n;return{x:()=>ps(e,r)}}},H_={kernelName:Yn,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,V(ol(R(n,`float32`)),2))}}},U_={kernelName:ar,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(e,V(R(n,`float32`),2))}}},W_={kernelName:ir,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=il(2);return{a:()=>V(e,V(i,G(n,r))),b:()=>V(e,V(i,G(r,n)))}}},G_={kernelName:br,gradFunc:e=>({x:()=>Nc(e)})},K_={kernelName:`Sub`,inputsToSave:[`a`,`b`],gradFunc:(e,t)=>{let[n,r]=t,i=U(n.shape,r.shape);return{a:()=>{let t=e,r=Dc(n.shape,i);return r.length>0&&(t=W(t,r)),H(t,n.shape)},b:()=>{let t=e,n=Dc(r.shape,i);return n.length>0&&(t=W(t,n)),H(nu(t),r.shape)}}}},q_={kernelName:`Sum`,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,i=r.shape.slice(),{axis:a}=n;E(a,r.shape).forEach(e=>{i[e]=1});let o=V(H(e,i),ku(r.shape,`float32`));return{x:()=>o}}},J_={kernelName:`Tan`,inputsToSave:[`x`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>B(e,cl(dc(n)))}}},Y_={kernelName:dr,outputsToSave:[!0],gradFunc:(e,t)=>{let[n]=t;return{x:()=>V(G(il(1),cl(n)),e)}}},X_={kernelName:fr,inputsToSave:[`x`],gradFunc:(e,t,n)=>{let[r]=t,{reps:i}=n;return{x:()=>{let t=Nc(r);if(r.rank===1)for(let n=0;n<i[0];++n)t=z(t,ys(e,[n*r.shape[0]],[r.shape[0]]));else if(r.rank===2)for(let n=0;n<i[0];++n)for(let a=0;a<i[1];++a)t=z(t,ys(e,[n*r.shape[0],a*r.shape[1]],[r.shape[0],r.shape[1]]));else if(r.rank===3)for(let n=0;n<i[0];++n)for(let a=0;a<i[1];++a)for(let o=0;o<i[2];++o)t=z(t,ys(e,[n*r.shape[0],a*r.shape[1],o*r.shape[2]],[r.shape[0],r.shape[1],r.shape[2]]));else if(r.rank===4)for(let n=0;n<i[0];++n)for(let a=0;a<i[1];++a)for(let o=0;o<i[2];++o)for(let s=0;s<i[3];++s)t=z(t,ys(e,[n*r.shape[0],a*r.shape[1],o*r.shape[2],s*r.shape[3]],[r.shape[0],r.shape[1],r.shape[2],r.shape[3]]));else throw Error(`Gradient for tile operation is not implemented for rank-${r.rank} tensors yet.`);return t}}}},Z_={kernelName:hr,gradFunc:(e,t,n)=>{let{perm:r}=n,i=Xc(r);return{x:()=>Rf(e,i)}}},Q_={kernelName:_r,gradFunc:(e,t,n)=>{let{axis:r}=n;return{value:()=>pf(e,r)}}},$_={kernelName:vr,inputsToSave:[`segmentIds`],gradFunc:(e,t)=>{let[n]=t;return{x:()=>ev(e,n)}}};function ev(e,t){let n=Ol(e,Tu(t,Nc(t))),r=Ml(t,il(0,`int32`)),i=n.rank-r.rank;for(let e=0;e<i;++e)r=vl(r,e+1);r=pu(r,ku(n.shape,`bool`));let a=Nc(n);return jc(r,n,a)}var tv=[Gh,Kh,qh,Jh,Yh,Xh,Zh,Qh,$h,eg,tg,ng,ag,cg,lg,ug,dg,fg,pg,mg,hg,gg,vg,_g,xg,Sg,Cg,wg,Tg,Eg,x_,Dg,Og,kg,Ag,jg,Ng,Mg,Pg,Fg,Rg,zg,Bg,Vg,Hg,Ug,Wg,Gg,Kg,Yg,Zg,Zg,Qg,t_,i_,a_,o_,s_,c_,l_,u_,d_,f_,p_,m_,h_,h_,g_,__,b_,S_,C_,w_,T_,E_,D_,O_,k_,A_,j_,M_,N_,P_,F_,I_,L_,R_,z_,B_,B_,V_,V_,H_,W_,U_,G_,K_,q_,J_,Y_,X_,Z_,Q_,$_,{kernelName:yr,gradFunc:e=>({x:()=>Nc(e)})}];for(let e of tv)Pr(e);M().prototype.abs=function(){return this.throwIfDisposed(),yo(this)},M().prototype.acos=function(){return this.throwIfDisposed(),xo(this)},M().prototype.acosh=function(){return this.throwIfDisposed(),Co(this)},M().prototype.add=function(e){return this.throwIfDisposed(),z(this,e)},M().prototype.all=function(e,t){return this.throwIfDisposed(),To(this,e,t)},M().prototype.any=function(e,t){return this.throwIfDisposed(),Do(this,e,t)},M().prototype.argMax=function(e){return this.throwIfDisposed(),ko(this,e)},M().prototype.argMin=function(e){return this.throwIfDisposed(),jo(this,e)},M().prototype.asScalar=function(){return this.throwIfDisposed(),g(this.size===1,()=>`The array must have only 1 element.`),H(this,[])},M().prototype.asType=function(e){return this.throwIfDisposed(),R(this,e)},M().prototype.as1D=function(){return this.throwIfDisposed(),H(this,[this.size])},M().prototype.as2D=function(e,t){return this.throwIfDisposed(),H(this,[e,t])},M().prototype.as3D=function(e,t,n){return this.throwIfDisposed(),H(this,[e,t,n])},M().prototype.as4D=function(e,t,n,r){return this.throwIfDisposed(),H(this,[e,t,n,r])},M().prototype.as5D=function(e,t,n,r,i){return this.throwIfDisposed(),H(this,[e,t,n,r,i])},M().prototype.asin=function(){return this.throwIfDisposed(),No(this)},M().prototype.asinh=function(){return this.throwIfDisposed(),Fo(this)},M().prototype.atan=function(){return this.throwIfDisposed(),Lo(this)},M().prototype.atan2=function(e){return this.throwIfDisposed(),zo(this,e)},M().prototype.atanh=function(){return this.throwIfDisposed(),Vo(this)},M().prototype.avgPool=function(e,t,n,r){return this.throwIfDisposed(),ls(this,e,t,n,r)},M().prototype.batchToSpaceND=function(e,t){return this.throwIfDisposed(),Cs(this,e,t)},M().prototype.batchNorm=function(e,t,n,r,i){return this.throwIfDisposed(),Es(this,e,t,n,r,i)},M().prototype.broadcastTo=function(e){return this.throwIfDisposed(),Is(this,e)},M().prototype.cast=function(e){return this.throwIfDisposed(),R(this,e)},M().prototype.ceil=function(){return this.throwIfDisposed(),Rs(this)},M().prototype.clipByValue=function(e,t){return this.throwIfDisposed(),Vs(this,e,t)},M().prototype.concat=function(e,t){return this.throwIfDisposed(),e instanceof Oi&&(e=[e]),ps([this,...e],t)},M().prototype.conv1d=function(e,t,n,r,i,a){return this.throwIfDisposed(),$s(this,e,t,n,r,i,a)},M().prototype.conv2dTranspose=function(e,t,n,r,i){return this.throwIfDisposed(),rc(this,e,t,n,r,i)},M().prototype.conv2d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Zs(this,e,t,n,r,i,a)},M().prototype.cos=function(){return this.throwIfDisposed(),dc(this)},M().prototype.cosh=function(){return this.throwIfDisposed(),pc(this)},M().prototype.cumprod=function(e,t,n){return this.throwIfDisposed(),hc(this,e,t,n)},M().prototype.cumsum=function(e,t,n){return this.throwIfDisposed(),_c(this,e,t,n)},M().prototype.depthToSpace=function(e,t){return this.throwIfDisposed(),xc(this,e,t)},M().prototype.depthwiseConv2d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Cc(this,e,t,n,r,i,a)},M().prototype.dilation2d=function(e,t,n,r,i){return this.throwIfDisposed(),Tc(this,e,t,n,r,i)},M().prototype.divNoNan=function(e){return this.throwIfDisposed(),Fc(this,e)},M().prototype.div=function(e){return this.throwIfDisposed(),B(this,e)},M().prototype.dot=function(e){return this.throwIfDisposed(),Lc(this,e)},M().prototype.elu=function(){return this.throwIfDisposed(),Vc(this)},M().prototype.equal=function(e){return this.throwIfDisposed(),kc(this,e)},M().prototype.erf=function(){return this.throwIfDisposed(),Uc(this)},M().prototype.euclideanNorm=function(e,t){return this.throwIfDisposed(),ml(this,e,t)},M().prototype.exp=function(){return this.throwIfDisposed(),gl(this)},M().prototype.expandDims=function(e){return this.throwIfDisposed(),vl(this,e)},M().prototype.expm1=function(){return this.throwIfDisposed(),bl(this)},M().prototype.fft=function(){return this.throwIfDisposed(),Qd(this)},M().prototype.flatten=function(){return this.throwIfDisposed(),H(this,[this.size])},M().prototype.floor=function(){return this.throwIfDisposed(),El(this)},M().prototype.floorDiv=function(e){return this.throwIfDisposed(),ho(this,e)},M().prototype.gather=function(e,t,n){return this.throwIfDisposed(),Ol(this,e,t,n)},M().prototype.greaterEqual=function(e){return this.throwIfDisposed(),Ml(this,e)},M().prototype.greater=function(e){return this.throwIfDisposed(),Al(this,e)},M().prototype.ifft=function(){return this.throwIfDisposed(),ef(this)},M().prototype.irfft=function(){return this.throwIfDisposed(),nf(this)},M().prototype.isFinite=function(){return this.throwIfDisposed(),Il(this)},M().prototype.isInf=function(){return this.throwIfDisposed(),Rl(this)},M().prototype.isNaN=function(){return this.throwIfDisposed(),Bl(this)},M().prototype.leakyRelu=function(e){return this.throwIfDisposed(),Hl(this,e)},M().prototype.lessEqual=function(e){return this.throwIfDisposed(),Kl(this,e)},M().prototype.less=function(e){return this.throwIfDisposed(),Wl(this,e)},M().prototype.localResponseNormalization=function(e,t,n,r){return this.throwIfDisposed(),Jl(this,e,t,n,r)},M().prototype.logSigmoid=function(){return this.throwIfDisposed(),ou(this)},M().prototype.logSoftmax=function(e){return this.throwIfDisposed(),lu(this,e)},M().prototype.logSumExp=function(e,t){return this.throwIfDisposed(),du(this,e,t)},M().prototype.log=function(){return this.throwIfDisposed(),Xl(this)},M().prototype.log1p=function(){return this.throwIfDisposed(),Ql(this)},M().prototype.logicalAnd=function(e){return this.throwIfDisposed(),pu(this,e)},M().prototype.logicalNot=function(){return this.throwIfDisposed(),hu(this)},M().prototype.logicalOr=function(e){return this.throwIfDisposed(),_u(this,e)},M().prototype.logicalXor=function(e){return this.throwIfDisposed(),yu(this,e)},M().prototype.matMul=function(e,t,n){return this.throwIfDisposed(),hs(this,e,t,n)},M().prototype.maxPool=function(e,t,n,r){return this.throwIfDisposed(),xu(this,e,t,n,r)},M().prototype.max=function(e,t){return this.throwIfDisposed(),$c(this,e,t)},M().prototype.maximum=function(e){return this.throwIfDisposed(),Tu(this,e)},M().prototype.mean=function(e,t){return this.throwIfDisposed(),Du(this,e,t)},M().prototype.min=function(e,t){return this.throwIfDisposed(),tl(this,e,t)},M().prototype.minimum=function(e){return this.throwIfDisposed(),ju(this,e)},M().prototype.mirrorPad=function(e,t){return this.throwIfDisposed(),Nu(this,e,t)},M().prototype.mod=function(e){return this.throwIfDisposed(),Fu(this,e)},M().prototype.mul=function(e){return this.throwIfDisposed(),V(this,e)},M().prototype.neg=function(){return this.throwIfDisposed(),nu(this)},M().prototype.norm=function(e,t,n){return this.throwIfDisposed(),fl(this,e,t,n)},M().prototype.notEqual=function(e){return this.throwIfDisposed(),zu(this,e)},M().prototype.oneHot=function(e,t=1,n=0){return this.throwIfDisposed(),Vu(this,e,t,n)},M().prototype.onesLike=function(){return this.throwIfDisposed(),Uu(this)},M().prototype.pad=function(e,t){return this.throwIfDisposed(),Gu(this,e,t)},M().prototype.pool=function(e,t,n,r,i,a){return this.throwIfDisposed(),Zu(this,e,t,n,r,i,a)},M().prototype.pow=function(e){return this.throwIfDisposed(),rl(this,e)},M().prototype.prelu=function(e){return this.throwIfDisposed(),$u(this,e)},M().prototype.prod=function(e,t){return this.throwIfDisposed(),td(this,e,t)},M().prototype.reciprocal=function(){return this.throwIfDisposed(),bd(this)},M().prototype.relu=function(){return this.throwIfDisposed(),Sd(this)},M().prototype.relu6=function(){return this.throwIfDisposed(),wd(this)},M().prototype.reshapeAs=function(e){return this.throwIfDisposed(),H(this,e.shape)},M().prototype.reshape=function(e){return this.throwIfDisposed(),H(this,e)},M().prototype.resizeBilinear=function(e,t,n){return this.throwIfDisposed(),Lp(this,e,t,n)},M().prototype.resizeNearestNeighbor=function(e,t,n){return this.throwIfDisposed(),zp(this,e,t,n)},M().prototype.reverse=function(e){return this.throwIfDisposed(),Ed(this,e)},M().prototype.rfft=function(){return this.throwIfDisposed(),sf(this)},M().prototype.round=function(){return this.throwIfDisposed(),Od(this)},M().prototype.rsqrt=function(){return this.throwIfDisposed(),Ad(this)},M().prototype.selu=function(){return this.throwIfDisposed(),Md(this)},M().prototype.separableConv2d=function(e,t,n,r,i,a){return this.throwIfDisposed(),Pd(this,e,t,n,r,i,a)},M().prototype.sigmoid=function(){return this.throwIfDisposed(),_s(this)},M().prototype.sign=function(){return this.throwIfDisposed(),Id(this)},M().prototype.sin=function(){return this.throwIfDisposed(),Rd(this)},M().prototype.sinh=function(){return this.throwIfDisposed(),Bd(this)},M().prototype.slice=function(e,t){return this.throwIfDisposed(),ys(this,e,t)},M().prototype.softmax=function(e){return this.throwIfDisposed(),Xd(this,e)},M().prototype.softplus=function(){return this.throwIfDisposed(),iu(this)},M().prototype.spaceToBatchND=function(e,t){return this.throwIfDisposed(),qu(this,e,t)},M().prototype.split=function(e,t){return this.throwIfDisposed(),af(this,e,t)},M().prototype.sqrt=function(){return this.throwIfDisposed(),ol(this)},M().prototype.square=function(){return this.throwIfDisposed(),cl(this)},M().prototype.squaredDifference=function(e){return this.throwIfDisposed(),lf(this,e)},M().prototype.squeeze=function(e){return this.throwIfDisposed(),df(this,e)},M().prototype.stack=function(e,t){return this.throwIfDisposed(),pf(e instanceof Oi?[this,e]:[this,...e],t)},M().prototype.step=function(e){return this.throwIfDisposed(),hf(this,e)},M().prototype.stridedSlice=function(e,t,n,r,i,a,o,s){return this.throwIfDisposed(),_f(this,e,t,n,r,i,a,o,s)},M().prototype.sub=function(e){return this.throwIfDisposed(),G(this,e)},M().prototype.sum=function(e,t){return this.throwIfDisposed(),W(this,e,t)},M().prototype.tan=function(){return this.throwIfDisposed(),yf(this)},M().prototype.tanh=function(){return this.throwIfDisposed(),xs(this)},M().prototype.tile=function(e){return this.throwIfDisposed(),Sl(this,e)},M().prototype.toBool=function(){return this.throwIfDisposed(),R(this,`bool`)},M().prototype.toFloat=function(){return this.throwIfDisposed(),R(this,`float32`)},M().prototype.toInt=function(){return this.throwIfDisposed(),R(this,`int32`)},M().prototype.topk=function(e,t){return this.throwIfDisposed(),Ef(this,e,t)},M().prototype.transpose=function(e){return this.throwIfDisposed(),Rf(this,e)},M().prototype.unique=function(e){return this.throwIfDisposed(),Af(this,e)},M().prototype.unsortedSegmentSum=function(e,t){return this.throwIfDisposed(),Mf(this,e,t)},M().prototype.unstack=function(e){return this.throwIfDisposed(),Pf(this,e)},M().prototype.where=function(e,t){return this.throwIfDisposed(),jc(e,this,t)},M().prototype.zerosLike=function(){return this.throwIfDisposed(),Nc(this)};var nv=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},rv=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},q=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},J=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},iv=class e extends Error{constructor(t){super(t),Object.setPrototypeOf(this,e.prototype)}},av=class{constructor(e){this.maxEntries=e||100,this.cache=new Map}get(e){let t;return this.cache.has(e)&&(t=this.cache.get(e),this.cache.delete(e),this.cache.set(e,t)),t}put(e,t){if(this.cache.has(e))this.cache.delete(e);else if(this.cache.size>=this.maxEntries){let e=this.cache.keys().next().value;this.cache.delete(e)}this.cache.set(e,t)}getMaxEntries(){return this.maxEntries}setMaxEntries(e){if(e<0)throw Error(`The maxEntries of LRU caches must be at least 0, but got ${e}.`);if(this.maxEntries>e)for(let t=0;t<this.maxEntries-e;t++){let e=this.cache.keys().next().value;this.cache.delete(e)}this.maxEntries=e}};function ov(e,t){if(Array.isArray(e)){let n=[];for(let r=0;r<t;r++)n=n.concat(e);return n}{let n=Array(t);return n.fill(e),n}}function sv(e,t){if(!e)throw new iv(t)}function cv(e,t){let n=0;for(let r of e)r===t&&n++;return n}function lv(e){return e.length===1?e[0]:e}function uv(e){return Array.isArray(e)?e:[e]}function dv(e){let t=e.replace(/(.)([A-Z][a-z0-9]+)/g,`$1_$2`).replace(/([a-z])([A-Z])/g,`$1_$2`).toLowerCase();return t[0]===`_`?`private`+t:t}function fv(e){return e.length<=1||e.indexOf(`_`)===-1?e:e.replace(/[_]+(\w|$)/g,(e,t)=>t.toUpperCase())}var pv={};function mv(e){if(e==null)return null;let t={};return t.className=e.getClassName(),t.config=e.getConfig(),t}function hv(e){if(!(typeof e!=`object`||!e))if(Array.isArray(e))e.forEach(e=>hv(e));else{let t=Object.keys(e);for(let n of t){let t=e[n];typeof t==`object`&&t&&(!Array.isArray(t)&&t.type===`ndarray`&&typeof t.value==`number`?e[n]=t.value:hv(t))}}}function gv(e,t={},n={},r=`object`,i=!1){if(typeof e==`string`){let i=e,a;if(i in n)a=n[i];else if(i in pv)a=pv[i];else if(a=t[i],a==null)throw new q(`Unknown ${r}: ${e}. This may be due to one of the following reasons:\n1. The ${r} is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.\n2. The custom ${r} is defined in JavaScript, but is not registered properly with tf.serialization.registerClass().`);return a}{let a=e;if(a.className==null||a.config==null)throw new q(`${r}: Improper config format: ${JSON.stringify(a)}.\n'className' and 'config' must set.`);let o=a.className,s,c;if(o in n?[s,c]=n[o]:o in pv?[s,c]=pv.className:o in t&&([s,c]=t[o]),s==null)throw new q(`Unknown ${r}: ${o}. This may be due to one of the following reasons:\n1. The ${r} is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.\n2. The custom ${r} is defined in JavaScript, but is not registered properly with tf.serialization.registerClass().`);if(c!=null){let e={};for(let t of Object.keys(pv))e[t]=pv[t];for(let t of Object.keys(n))e[t]=n[t];let t=a.config;t.customObjects=e;let r=Object.assign({},pv);for(let e of Object.keys(n))pv[e]=n[e];hv(a.config);let o=c(s,a.config,n,i);return pv=Object.assign({},r),o}{let e=Object.assign({},pv);for(let e of Object.keys(n))pv[e]=n[e];let t=new s(a.config);return pv=Object.assign({},e),t}}}function _v(e,t){return e<t?-1:+(e>t)}function vv(e,t){return-1*_v(e,t)}function yv(e){if(e==null)return e;let t=[];for(let n of e)t.indexOf(n)===-1&&t.push(n);return t}function bv(e){if(e==null)throw new q(`Invalid value in obj: ${JSON.stringify(e)}`);for(let t in e)if(e.hasOwnProperty(t))return!1;return!0}function xv(e,t,n){if(n!=null&&e.indexOf(n)<0)throw new q(`${n} is not a valid ${t}.  Valid values are ${e} or null/undefined.`)}function Sv(e,t,n=0,r=1/0){return sv(n>=0),sv(r>=n),Array.isArray(e)&&e.length>=n&&e.length<=r&&e.every(e=>typeof e===t)}function Cv(e,t){Array.isArray(e)?(g(e.length>0,()=>`${t} is unexpectedly an empty array.`),e.forEach((e,n)=>Cv(e,`element ${n+1} of ${t}`))):g(Number.isInteger(e)&&e>0,()=>`Expected ${t} to be a positive integer, but got ${wv(e)}.`)}function wv(e){return e===null?`null`:Array.isArray(e)?`[`+e.map(e=>wv(e)).join(`,`)+`]`:typeof e==`string`?`"${e}"`:`${e}`}function Tv(e,t,n){let r=n==null?ii():n(),i;return(...a)=>{let o=n==null?ii():n();return o-r<t?i:(r=o,i=e(...a),i)}}function Ev(e){return e===`relu`?`relu`:e===`linear`?`linear`:e===`elu`?`elu`:null}var Dv=0;function Ov(){return Dv++}var kv={};function Av(e=``){return e in kv||(kv[e]=0),kv[e]+=1,e+kv[e].toString()}var jv=[`channelsFirst`,`channelsLast`],Mv=[`nearest`,`bilinear`],Nv=[`valid`,`same`,`causal`],Pv=[`max`,`avg`],Fv=[`sum`,`mul`,`concat`,`ave`],Iv=new Map;function Lv(e){xv(jv,`DataFormat`,e)}function Rv(e){xv(Mv,`InterpolationFormat`,e)}function zv(e){xv(Nv,`PaddingMode`,e)}function Bv(e){xv(Pv,`PoolMode`,e)}var Vv=[],Hv=`/`;function Uv(e,t){Vv.push(e);try{let e=t();return Vv.pop(),e}catch(e){throw Vv.pop(),e}}function Wv(){return Vv.length===0?``:Vv.join(Hv)+Hv}function Gv(e){if(!Jv(e))throw Error(`Not a valid tensor name: '`+e+`'`);return Wv()+e}function Kv(e){if(!Jv(e))throw Error(`Not a valid tensor name: '`+e+`'`);Iv.has(e)||Iv.set(e,0);let t=Iv.get(e);if(Iv.set(e,Iv.get(e)+1),t>0){let n=`${e}_${t}`;return Iv.set(n,1),n}return e}var qv=new RegExp(/^[A-Za-z0-9][-A-Za-z0-9\._\/]*$/);function Jv(e){return!!e.match(qv)}function Yv(e){return e===parseInt(e.toString(),10)}function Xv(e,t,n){t??=0,n??=e.length;let r=1;for(let i=t;i<n;++i)r*=e[i];return r}function Zv(e){if(e.length===0)return NaN;let t=1/0;for(let n=0;n<e.length;n++){let r=e[n];r<t&&(t=r)}return t}function Qv(e){if(e.length===0)return NaN;let t=-1/0;for(let n=0;n<e.length;n++){let r=e[n];r>t&&(t=r)}return t}function $v(e,t){if(t<e)throw new q(`end (${t}) < begin (${e}) is forbidden.`);let n=[];for(let r=e;r<t;++r)n.push(r);return n}var ey;function ty(){return ey??=_a().epsilon(),ey}function ny(){return`channelsLast`}function ry(e,t){return R(e,t)}function iy(e,t=-1){let n=e.shape.slice();return t<0&&(t=n.length+t+1),n.splice(t,0,1),H(e,n)}function ay(e,t){return I(()=>{if(e.shape.length!==2)throw new q(`repeat() expects a rank-2 tensor, but received a rank-${e.shape.length} tensor.`);return py(iy(e,1),[1,t,1])})}function oy(e){return H(e,[Xv(e.shape)])}function sy(e){if(e.rank<=1)throw new q(`batchFlatten requires a minimum rank of 2. Got rank: ${e.rank}.`);return H(e,[e.shape[0],Xv(e.shape,1)])}function cy(e,t,n){return I(()=>{switch(e.rank){case 1:return Hd(e,t,n);case 2:return Wd(e,[t,0],[n,e.shape[1]]);case 3:return Kd(e,[t,0,0],[n,e.shape[1],e.shape[2]]);case 4:return Jd(e,[t,0,0,0],[n,e.shape[1],e.shape[2],e.shape[3]]);case 5:return ys(e,[t,0,0,0,0],[n,e.shape[1],e.shape[2],e.shape[3],e.shape[4]]);case 6:return ys(e,[t,0,0,0,0,0],[n,e.shape[1],e.shape[2],e.shape[3],e.shape[4],e.shape[5]]);default:throw new q(`sliceAlongFirstAxis() received an unsupported tensor rank: ${e.rank}`)}})}function ly(e,t,n){return I(()=>{switch(e.rank){case 1:return Hd(e,t,n);case 2:return Wd(e,[0,t],[e.shape[0],n]);case 3:return Kd(e,[0,0,t],[e.shape[0],e.shape[1],n]);case 4:return Jd(e,[0,0,0,t],[e.shape[0],e.shape[1],e.shape[2],n]);default:throw new q(`sliceAlongLastAxis() received an unsupported tensor rank: ${e.rank}`)}})}function uy(e,t,n,r){return I(()=>{switch(e.rank){case 1:return Hd(e,t,n);case 2:switch(r){case 1:return cy(e,t,n);case 2:return ly(e,t,n);default:throw new q(`The axis is not within the rank of the tensor ${r}`)}case 3:switch(r){case 1:return cy(e,t,n);case 2:return Kd(e,[0,t,0],[e.shape[0],n,e.shape[2]]);case 3:return ly(e,t,n);default:throw new q(`The axis is not within the rank of the tensor ${r}`)}case 4:switch(r){case 1:return cy(e,t,n);case 2:return Jd(e,[0,t,0,0],[e.shape[0],n,e.shape[2],e.shape[3]]);case 3:return Jd(e,[0,0,t,0],[e.shape[0],e.shape[1],n,e.shape[3]]);case 4:return ly(e,t,n);default:throw new q(`The axis is not within the rank of the tensor ${r}`)}default:throw new q(`sliceAlongLastAxis() received an unsupported tensor rank: ${e.rank}`)}})}function dy(e,t=-1){let n;return t<0&&(n=e[0].rank,t=n===0?0:n),t===e[0].rank&&(t=-1),ps(e,t)}function fy(e,t){switch(e.rank){case 1:return Us([e,t]);case 2:return Gs([e,t],0);case 3:return qs([e,t],0);case 4:return Ys([e,t],0);default:throw new q(`concatAlongFirstAxis() received an unsupported tensor rank: ${e.rank}`)}}function py(e,t){if(Array.isArray(t)||(t=[t]),e.rank!==t.length)throw new q(`The length of input n (${t.length}) does not match the number of dimensions in input x (${e.rank})`);return Sl(e,t)}function my(e,t=0,n=1,r,i){return pd(e,t,n,r,i)}function hy(e,t,n,r){if(e.rank<2||t.rank<2)throw new J(`dot requires both inputs to be rank >= 2 but got x shape = ${e.shape} and y shape = ${t.shape}`);if(t.rank>=3&&e.shape.slice(-1)[0]!==t.shape.slice(-2)[0])throw new J(`If rank y >= 3, then the second last dim of y must equal the last dim of x but got x shape = ${e.shape} and  y shape = ${t.shape}`);if(e.rank===2&&t.rank===2)return tp({a:e,b:t,transposeA:!1,transposeB:!1,bias:r?vy(e.rank,r,ny()):null,activation:n});{let i=e.shape.slice(),a=i.pop();e=H(e,[-1,a]);let o=t.shape.slice(),s=o.pop(),c=o.pop(),l=[...o,s],u=Array.from({length:t.rank},(e,n)=>n===0?t.rank-2:n<=t.rank-2?n-1:n);t=H(Rf(t,u),[c,-1]);let d=[...i,...l];return H(tp({a:e,b:t,transposeA:!1,transposeB:!1,bias:r?vy(e.rank,r,ny()):null,activation:n}),d)}}function gy(e,t,n){return I(()=>(t=Array.isArray(t)?bf(t,`int32`):R(t,`int32`),Ol(e,t,n)))}function _y(e){return V(e,e)}function vy(e,t,n){let r=t.shape;if(t.rank!==1&&t.rank!==e)throw new q(`Unexpected bias dimensions: ${t.rank}; expected it to be 1 or ${e}`);if(e===5){if(n===`channelsFirst`)return r.length===1?H(t,[1,r[0],1,1,1]):H(t,[1,r[3],r[0],r[1],r[2]]);if(n===`channelsLast`)return r.length===1?H(t,[1,1,1,1,r[0]]):H(t,[1].concat(r))}else if(e===4){if(n===`channelsFirst`)return r.length===1?H(t,[1,r[0],1,1]):H(t,[1,r[2],r[0],r[1]]);if(n===`channelsLast`)return r.length===1?H(t,[1,1,1,r[0]]):H(t,[1].concat(r))}else if(e===3){if(n===`channelsFirst`)return r.length===1?H(t,[1,r[0],1]):H(t,[1,r[1],r[0]]);if(n===`channelsLast`)return r.length===1?H(t,[1,1,r[0]]):H(t,[1].concat(r))}else if(e<3)return t;throw new q(`Unsupported input rank by biasAdd: ${t.rank}`)}function yy(e,t,n){return I(()=>(n??=ny(),Lv(n),z(e,vy(e.rank,t,n))))}function by(e,t=1){if(t!==1)throw new J(`Support for alpha values other than 1 (${t}) is not implemented yet.`);return Vc(e)}function xy(e){return I(()=>B(e,z(yo(e),1)))}function Sy(e,t,n,r){return I(()=>Vf(e,t,n,r))}function Cy(e){return I(()=>Vs(z(.5,V(.2,e)),0,1))}function wy(e,t,n=!1){return n?e():t()}var Ty=[`fanIn`,`fanOut`,`fanAvg`],Ey=[`normal`,`uniform`,`truncatedNormal`];function Dy(e){xv(Ty,`FanMode`,e)}function Oy(e){xv(Ey,`Distribution`,e)}var ky=class extends nm{fromConfigUsesCustomObjects(){return!1}getConfig(){return{}}},Ay=class extends ky{apply(e,t){return Ou(e,t)}};Ay.className=`Zeros`,K(Ay);var jy=class extends ky{apply(e,t){return ku(e,t)}};jy.className=`Ones`,K(jy);var My=class extends ky{constructor(e){if(super(),typeof e!=`object`)throw new q(`Expected argument of type ConstantConfig but got ${e}`);if(e.value===void 0)throw new q(`config must have value set but got ${e}`);this.value=e.value}apply(e,t){return I(()=>V(il(this.value),ku(e,t)))}getConfig(){return{value:this.value}}};My.className=`Constant`,K(My);var Ny=class extends ky{constructor(e){super(),this.DEFAULT_MINVAL=-.05,this.DEFAULT_MAXVAL=.05,this.minval=e.minval||this.DEFAULT_MINVAL,this.maxval=e.maxval||this.DEFAULT_MAXVAL,this.seed=e.seed}apply(e,t){return hd(e,this.minval,this.maxval,t,this.seed)}getConfig(){return{minval:this.minval,maxval:this.maxval,seed:this.seed}}};Ny.className=`RandomUniform`,K(Ny);var Py=class extends ky{constructor(e){super(),this.DEFAULT_MEAN=0,this.DEFAULT_STDDEV=.05,this.mean=e.mean||this.DEFAULT_MEAN,this.stddev=e.stddev||this.DEFAULT_STDDEV,this.seed=e.seed}apply(e,t){if(t||=`float32`,t!==`float32`&&t!==`int32`)throw new J(`randomNormal does not support dType ${t}.`);return my(e,this.mean,this.stddev,t,this.seed)}getConfig(){return{mean:this.mean,stddev:this.stddev,seed:this.seed}}};Py.className=`RandomNormal`,K(Py);var Fy=class extends ky{constructor(e){super(),this.DEFAULT_MEAN=0,this.DEFAULT_STDDEV=.05,this.mean=e.mean||this.DEFAULT_MEAN,this.stddev=e.stddev||this.DEFAULT_STDDEV,this.seed=e.seed}apply(e,t){if(t||=`float32`,t!==`float32`&&t!==`int32`)throw new J(`truncatedNormal does not support dType ${t}.`);return Of(e,this.mean,this.stddev,t,this.seed)}getConfig(){return{mean:this.mean,stddev:this.stddev,seed:this.seed}}};Fy.className=`TruncatedNormal`,K(Fy);var Iy=class extends ky{constructor(e){super(),this.gain=e.gain==null?1:e.gain}apply(e,t){return I(()=>{if(e.length!==2||e[0]!==e[1])throw new q(`Identity matrix initializer can only be used for 2D square matrices.`);return V(this.gain,wl(e[0]))})}getConfig(){return{gain:this.gain}}};Iy.className=`Identity`,K(Iy);function Ly(e,t=`channelsLast`){let n,r;if(Lv(t),e.length===2)n=e[0],r=e[1];else if([3,4,5].indexOf(e.length)!==-1){if(t===`channelsFirst`){let t=Xv(e,2);n=e[1]*t,r=e[0]*t}else if(t===`channelsLast`){let t=Xv(e,0,e.length-2);n=e[e.length-2]*t,r=e[e.length-1]*t}}else{let t=Xv(e);n=Math.sqrt(t),r=Math.sqrt(t)}return[n,r]}var Ry=class extends ky{constructor(e){if(super(),e.scale<0)throw new q(`scale must be a positive float. Got: ${e.scale}`);this.scale=e.scale==null?1:e.scale,this.mode=e.mode==null?`fanIn`:e.mode,Dy(this.mode),this.distribution=e.distribution==null?`normal`:e.distribution,Oy(this.distribution),this.seed=e.seed}apply(e,t){let n=Ly(e),r=n[0],i=n[1],a=this.scale;if(this.mode===`fanIn`?a/=Math.max(1,r):this.mode===`fanOut`?a/=Math.max(1,i):a/=Math.max(1,(r+i)/2),this.distribution===`normal`){let n=Math.sqrt(a);if(t||=`float32`,t!==`float32`&&t!==`int32`)throw new J(`${this.getClassName()} does not support dType ${t}.`);return Of(e,0,n,t,this.seed)}{let n=Math.sqrt(3*a);return hd(e,-n,n,t,this.seed)}}getConfig(){return{scale:this.scale,mode:this.mode,distribution:this.distribution,seed:this.seed}}};Ry.className=`VarianceScaling`,K(Ry);var zy=class extends Ry{constructor(e){super({scale:1,mode:`fanAvg`,distribution:`uniform`,seed:e==null?null:e.seed})}getClassName(){return Ry.className}};zy.className=`GlorotUniform`,K(zy);var By=class extends Ry{constructor(e){super({scale:1,mode:`fanAvg`,distribution:`normal`,seed:e==null?null:e.seed})}getClassName(){return Ry.className}};By.className=`GlorotNormal`,K(By);var Vy=class extends Ry{constructor(e){super({scale:2,mode:`fanIn`,distribution:`normal`,seed:e==null?null:e.seed})}getClassName(){return Ry.className}};Vy.className=`HeNormal`,K(Vy);var Hy=class extends Ry{constructor(e){super({scale:2,mode:`fanIn`,distribution:`uniform`,seed:e==null?null:e.seed})}getClassName(){return Ry.className}};Hy.className=`HeUniform`,K(Hy);var Uy=class extends Ry{constructor(e){super({scale:1,mode:`fanIn`,distribution:`normal`,seed:e==null?null:e.seed})}getClassName(){return Ry.className}};Uy.className=`LeCunNormal`,K(Uy);var Wy=class extends Ry{constructor(e){super({scale:1,mode:`fanIn`,distribution:`uniform`,seed:e==null?null:e.seed})}getClassName(){return Ry.className}};Wy.className=`LeCunUniform`,K(Wy);var Gy=class extends ky{constructor(e){super(),this.DEFAULT_GAIN=1,this.ELEMENTS_WARN_SLOW=2e3,this.gain=e.gain==null?this.DEFAULT_GAIN:e.gain,this.seed=e.seed}apply(e,t){return I(()=>{if(e.length<2)throw new J(`Shape must be at least 2D.`);if(t!==`int32`&&t!==`float32`&&t!==void 0)throw TypeError(`Unsupported data type ${t}.`);t=t;let n=y(e.slice(0,-1)),r=e[e.length-1],i=n*r;i>this.ELEMENTS_WARN_SLOW&&console.warn(`Orthogonal initializer is being called on a matrix with more than ${this.ELEMENTS_WARN_SLOW} (${i}) elements: Slowness may result.`);let a=my([Math.max(r,n),Math.min(r,n)],0,1,t,this.seed),o=$p.qr(a,!1),s=o[0],c=o[1].flatten().stridedSlice([0],[Math.min(r,n)*Math.min(r,n)],[Math.min(r,n)+1]);return s=V(s,c.sign()),n<r&&(s=s.transpose()),V(il(this.gain),s.reshape(e))})}getConfig(){return{gain:this.gain,seed:this.seed}}};Gy.className=`Orthogonal`,K(Gy);var Ky={constant:`Constant`,glorotNormal:`GlorotNormal`,glorotUniform:`GlorotUniform`,heNormal:`HeNormal`,heUniform:`HeUniform`,identity:`Identity`,leCunNormal:`LeCunNormal`,leCunUniform:`LeCunUniform`,ones:`Ones`,orthogonal:`Orthogonal`,randomNormal:`RandomNormal`,randomUniform:`RandomUniform`,truncatedNormal:`TruncatedNormal`,varianceScaling:`VarianceScaling`,zeros:`Zeros`};function qy(e,t={}){return gv(e,rm.getMap().classNameMap,t,`initializer`)}function Jy(e){return mv(e)}function Yy(e){if(typeof e==`string`){let t=e in Ky?Ky[e]:e;if(t===`GlorotNormal`)return new By;if(t===`GlorotUniform`)return new zy;if(t===`HeNormal`)return new Vy;if(t===`HeUniform`)return new Hy;if(t===`LeCunNormal`)return new Uy;if(t===`LeCunUniform`)return new Wy;{let e={};return e.className=t,e.config={},qy(e)}}return e instanceof ky?e:qy(e)}function Xy(e){return Array.isArray(e)&&Array.isArray(e[0])}function Zy(e){return e.length===0?[]:Array.isArray(e[0])?e:[e]}function Y(e){let t;if(Array.isArray(e)){if(e.length!==1)throw new q(`Expected Tensor length to be 1; got ${e.length}`);t=e[0]}else t=e;return t}function Qy(e){if(Array.isArray(e)&&Array.isArray(e[0])){if(e.length===1)return e=e,e[0];throw new q(`Expected exactly 1 Shape; got ${e.length}`)}return e}function $y(e){let t=0;for(let n of e)n.shape.length===0?t+=1:t+=n.shape.reduce((e,t)=>e*t);return t}var eb=`Variable`,tb=class{constructor(e,t=`float32`,n=eb,r=!0,i=null){this.dtype=t??`float32`,this.shape=e.shape,this.id=Ov(),n??=eb,this.originalName=Gv(n),this.name=Kv(this.originalName),this.trainable_=r,this.constraint=i,this.val=Ff(e,this.trainable_,this.name,this.dtype)}read(){return this.assertNotDisposed(),this.val}write(e){return this.assertNotDisposed(),nb(this.val,e),this.val.id!==e.id&&(this.val.assign(e),this.constraint!=null&&this.val.assign(this.constraint.apply(this.val))),this}dispose(){this.assertNotDisposed(),this.val.dispose()}assertNotDisposed(){if(this.val.isDisposed)throw Error(`LayersVariable ${this.name} is already disposed.`)}get trainable(){return this.trainable_}set trainable(e){this.trainable_=e,this.val.trainable=e}};function nb(e,t){if(e.shape.toString()!==t.shape.toString())throw Error(`Shape mismatch: `+JSON.stringify(e.shape)+` vs. `+JSON.stringify(t.shape))}function rb(e){return e.map(e=>e.read())}function ib(e){e.forEach(e=>{e[0].write(e[1])})}var ab=class{constructor(e){this.dtype=e.dtype,this.shape=e.shape,this.ndim=e.shape==null?e.ndim:e.shape.length,this.maxNDim=e.maxNDim,this.minNDim=e.minNDim,this.axes=e.axes||{}}},ob=class{constructor(e,t,n,r,i,a,o){this.dtype=e,this.shape=t,this.sourceLayer=n,this.inputs=r,this.callArgs=i,this.outputTensorIndex=o,this.id=Ov(),a!=null&&(this.originalName=Gv(a),this.name=Kv(this.originalName)),this.rank=t.length}},sb=0,cb=class{constructor(e,t){this.callArgs=t,this.id=sb++,this.outboundLayer=e.outboundLayer,this.inboundLayers=e.inboundLayers,this.nodeIndices=e.nodeIndices,this.tensorIndices=e.tensorIndices,this.inputTensors=e.inputTensors,this.outputTensors=e.outputTensors,this.inputMasks=e.inputMasks,this.outputMasks=e.outputMasks,this.inputShapes=e.inputShapes,this.outputShapes=e.outputShapes;for(let t of e.inboundLayers)t?.outboundNodes.push(this);e.outboundLayer.inboundNodes.push(this)}getConfig(){let e=[];for(let t of this.inboundLayers)t==null?e.push(null):e.push(t.name);return{outboundLayer:this.outboundLayer?this.outboundLayer.name:null,inboundLayers:e,nodeIndices:this.nodeIndices,tensorIndices:this.tensorIndices}}},lb=0,ub=class extends nm{constructor(e={}){super(),this._callHook=null,this._addedWeightNames=[],this._stateful=!1,this.id=lb++,this.activityRegularizer=null,this.inputSpec=null,this.supportsMasking=!1,this._trainableWeights=[],this._nonTrainableWeights=[],this._losses=[],this._updates=[],this._built=!1,this.inboundNodes=[],this.outboundNodes=[];let t=e.name;if(!t){let e=this.getClassName();t=dv(e)+`_`+Av(e)}if(this.name=t,this.trainable_=e.trainable==null||e.trainable,e.inputShape!=null||e.batchInputShape!=null){let t;if(e.batchInputShape!=null)t=e.batchInputShape;else if(e.inputShape!=null){let n=null;e.batchSize!=null&&(n=e.batchSize),t=[n].concat(e.inputShape)}this.batchInputShape=t;let n=e.dtype;n??=e.inputDType,n??=`float32`,this.dtype=n}this.initialWeights=e.weights==null?null:e.weights,this._refCount=null,this.fastWeightInitDuringBuild=!1}static nodeKey(e,t){return e.name+`_ib-`+t.toString()}getNodeAtIndex(e,t){if(this.inboundNodes.length===0)throw new rv(`The layer has never been called and thus has no defined ${t}.`);if(this.inboundNodes.length<=e)throw new q(`Asked to get ${t} at node ${e}, but the layer has only ${this.inboundNodes.length} inbound nodes.`);return this.inboundNodes[e]}getInputAt(e){return lv(this.getNodeAtIndex(e,`input`).inputTensors)}getOutputAt(e){return lv(this.getNodeAtIndex(e,`output`).outputTensors)}get input(){if(this.inboundNodes.length>1)throw new nv(`Layer ${this.name} has multiple inbound nodes, hence the notion of "layer input" is ill-defined. Use \`getInputAt(nodeIndex)\` instead.`);if(this.inboundNodes.length===0)throw new nv(`Layer ${this.name} is not connected, no input to return.`);return lv(this.getNodeAtIndex(0,`input`).inputTensors)}get output(){if(this.inboundNodes.length===0)throw new nv(`Layer ${this.name} has no inbound nodes.`);if(this.inboundNodes.length>1)throw new nv(`Layer ${this.name} has multiple inbound nodes, hence the notion of "layer output" is ill-defined. Use \`getOutputAt(nodeIndex)\` instead.`);return lv(this.getNodeAtIndex(0,`output`).outputTensors)}get losses(){return this._losses}calculateLosses(){return this.losses.map(e=>e())}get updates(){return this._updates}get built(){return this._built}set built(e){this._built=e}get trainable(){return this.trainable_}set trainable(e){this._trainableWeights.forEach(t=>t.trainable=e),this.trainable_=e}get trainableWeights(){return this.trainable_?this._trainableWeights.filter(e=>e.trainable):[]}set trainableWeights(e){this._trainableWeights=e}get nonTrainableWeights(){return this.trainable?this._trainableWeights.filter(e=>!e.trainable).concat(this._nonTrainableWeights):this._trainableWeights.concat(this._nonTrainableWeights)}set nonTrainableWeights(e){this._nonTrainableWeights=e}get weights(){return this.trainableWeights.concat(this.nonTrainableWeights)}get stateful(){return this._stateful}resetStates(){if(!this.stateful)throw Error(`Cannot call the resetStates() method of a non-stateful Layer object.`)}assertInputCompatibility(e){let t=uv(e);if(this.inputSpec==null||this.inputSpec.length===0)return;let n=uv(this.inputSpec);if(t.length!==n.length)throw new q(`Layer ${this.name} expects ${n.length} inputs, but it received ${t.length} input tensors. Input received: ${e}`);for(let e=0;e<t.length;e++){let r=t[e],i=n[e];if(i==null)continue;let a=r.rank;if(i.ndim!=null&&a!==i.ndim)throw new q(`Input ${e} is incompatible with layer ${this.name}: expected ndim=${i.ndim}, found ndim=${a}`);if(i.maxNDim!=null&&a>i.maxNDim)throw new q(`Input ${e} is incompatible with layer ${this.name}: expected max_ndim=${i.maxNDim}, found ndim=${a}`);if(i.minNDim!=null&&a<i.minNDim)throw new q(`Input ${e} is incompatible with layer ${this.name}: expected min_ndim=${i.minNDim}, found ndim=${a}.`);if(i.dtype!=null&&r.dtype!==i.dtype)throw new q(`Input ${e} is incompatible with layer ${this.name} : expected dtype=${i.dtype}, found dtype=${r.dtype}.`);if(i.axes){let t=r.shape;for(let n in i.axes){let r=Number(n),a=i.axes[n],o=r>=0?t[r]:t[t.length+r];if(a!=null&&[a,null].indexOf(o)===-1)throw new q(`Input ${e} is incompatible with layer ${this.name}: expected axis ${r} of input shape to have value ${a} but got shape ${t}.`)}}if(i.shape!=null)for(let t=0;t<i.shape.length;++t){let n=i.shape[t],a=r.shape[t];if(n!=null&&a!=null&&n!==a)throw new q(`Input ${e} is incompatible with layer ${this.name}: expected shape=${i.shape}, found shape=${r.shape}.`)}}}call(e,t){return e}invokeCallHook(e,t){this._callHook!=null&&this._callHook(e,t)}setCallHook(e){this._callHook=e}clearCallHook(){this._callHook=null}apply(e,t){t||={},this.assertNotDisposed();let n=uv(e),r=mb(e),i=hb(e);if(r===i)throw new q(`Arguments to apply() must be all SymbolicTensors or all Tensors`);return Uv(this.name,()=>{if(!this.built){this.assertInputCompatibility(e);let t=[];for(let n of uv(e))t.push(n.shape);this.build(lv(t)),this.built=!0,this.initialWeights&&this.setWeights(this.initialWeights),this._refCount===null&&i&&(this._refCount=1)}if(this.assertInputCompatibility(e),i){let r=this.call(e,t);this.supportsMasking&&this.setMaskMetadata(e,r);let i=uv(r),a=[];for(let e of i)n.indexOf(e)!==-1&&(e=e.clone()),a.push(e);if(r=lv(a),this.activityRegularizer!=null)throw new J(`Layer invocation in the presence of activity regularizer(s) is not supported yet.`);return r}{let n=db(e),r=this.computeOutputShape(n),i,a=fb(e);if(this.warnOnIncompatibleInputShape(Array.isArray(e)?n[0]:n),i=r!=null&&r.length>0&&Array.isArray(r[0])?r.map((n,r)=>new ob(a,n,this,uv(e),t,this.name,r)):new ob(a,r,this,uv(e),t,this.name),this.addInboundNode(e,i,null,null,n,r,t),this._refCount++,this.activityRegularizer!=null)throw new J(`Layer invocation in the presence of activity regularizer(s) is not supported yet.`);return i}})}warnOnIncompatibleInputShape(e){if(this.batchInputShape!=null)if(e.length!==this.batchInputShape.length)console.warn(`The rank of the input tensor provided (shape: ${JSON.stringify(e)}) does not match that of the batchInputShape (${JSON.stringify(this.batchInputShape)}) of the layer ${this.name}`);else{let t=!1;this.batchInputShape.forEach((n,r)=>{n!=null&&e[r]!=null&&e[r]!==n&&(t=!0)}),t&&console.warn(`The shape of the input tensor (${JSON.stringify(e)}) does not match the expectation of layer ${this.name}: ${JSON.stringify(this.batchInputShape)}`)}}get outputShape(){if(this.inboundNodes==null||this.inboundNodes.length===0)throw new nv(`The layer ${this.name} has never been called and thus has no defined output shape.`);let e=[];for(let t of this.inboundNodes){let n=JSON.stringify(t.outputShapes);e.indexOf(n)===-1&&e.push(n)}if(e.length===1){let e=this.inboundNodes[0].outputShapes;return Array.isArray(e)&&Array.isArray(e[0])&&e.length===1?e[0]:e}throw new nv(`The layer ${this.name} has multiple inbound nodes with different output shapes. Hence the notion of "output shape" is ill-defined for the layer.`)}countParams(){if(!this.built)throw new rv(`You tried to call countParams() on ${this.name}, but the layer is not built yet. Build it first by calling build(batchInputShape).`);return $y(this.weights)}build(e){this.built=!0}getWeights(e=!1){return rb(e?this.trainableWeights:this.weights)}setWeights(e){I(()=>{let t=this.weights;if(t.length!==e.length)throw new q(`You called setWeights(weights) on layer "${this.name}" with a weight list of length ${e.length}, but the layer was expecting ${t.length} weights. Provided weights: ${e}...`);if(t.length===0)return;let n=[],r=rb(t);for(let i=0;i<r.length;++i){let a=r[i],o=t[i],s=e[i];if(!b(a.shape,s.shape))throw new q(`Layer weight shape ${a.shape} not compatible with provided weight shape ${s.shape}`);n.push([o,s])}ib(n)})}addWeight(e,t,n,r,i,a,o,s){if(this._addedWeightNames.indexOf(e)!==-1)throw new q(`Duplicate weight name ${e} for layer ${this.name}`);this._addedWeightNames.push(e),n??=`float32`,this.fastWeightInitDuringBuild&&(r=s==null?Yy(`zeros`):s());let c=r.apply(t,n),l=new tb(c,n,e,a,o);return c.dispose(),i!=null&&this.addLoss(()=>i.apply(l.read())),a??=!0,a?this._trainableWeights.push(l):this._nonTrainableWeights.push(l),l}setFastWeightInitDuringBuild(e){this.fastWeightInitDuringBuild=e}addLoss(e){e==null||Array.isArray(e)&&e.length===0||(e=uv(e),this._losses!==void 0&&this._losses!==null&&this.losses.push(...e))}computeOutputShape(e){return e}computeMask(e,t){if(!this.supportsMasking){if(t!=null)if(Array.isArray(t))t.forEach(e=>{if(e!=null)throw TypeError(`Layer ${this.name} does not support masking, but was passed an inputMask.`)});else throw TypeError(`Layer ${this.name} does not support masking, but was passed an inputMask.`);return null}return t}setMaskMetadata(e,t,n){if(!this.supportsMasking)return;let r=this.computeMask(e,n),i=uv(t),a=uv(r);if(i.length!==a.length)throw Error(`${this.name} outputs ${i.length} tensors but ${i.length} masks for those tensors`);for(let e=0;e<i.length;e++)i[e].kerasMask=a[e]}addInboundNode(e,t,n,r,i,a,o=null){let s=uv(e);t=uv(t),n=uv(n),r=uv(r),i=Zy(i),a=Zy(a);let c=[],l=[],u=[];for(let e of s)c.push(e.sourceLayer),l.push(e.nodeIndex),u.push(e.tensorIndex);new cb({outboundLayer:this,inboundLayers:c,nodeIndices:l,tensorIndices:u,inputTensors:s,outputTensors:t,inputMasks:n,outputMasks:r,inputShapes:i,outputShapes:a},o);for(let e=0;e<t.length;e++)t[e].sourceLayer=this,t[e].nodeIndex=this.inboundNodes.length-1,t[e].tensorIndex=e}getConfig(){let e={name:this.name,trainable:this.trainable};return this.batchInputShape!=null&&(e.batchInputShape=this.batchInputShape),this.dtype!=null&&(e.dtype=this.dtype),e}disposeWeights(){return this.weights.forEach(e=>e.dispose()),this.weights.length}assertNotDisposed(){if(this._refCount===0)throw Error(`Layer '${this.name}' is already disposed.`)}dispose(){if(!this.built)throw Error(`Cannot dispose Layer ${this.name} because it has not been built yet.`);if(this._refCount===null)throw Error(`Cannot dispose Layer ${this.name} because it has not been used yet.`);this.assertNotDisposed();let e=0;return--this._refCount===0&&(e=this.disposeWeights()),{refCountAfterDispose:this._refCount,numDisposedVariables:e}}};function db(e){e=uv(e);let t=[];for(let n of e)t.push(n.shape);return lv(t)}function fb(e){return`float32`}function pb(e,t,n){if((t==null||n!=null&&n>0)&&(t=e.sourceLayer,n=e.nodeIndex),t.inboundNodes.length===0)return[e];{let e=t.inboundNodes[n];if(e.inboundLayers.length===0)return e.inputTensors;{let t=[];for(let n=0;n<e.inboundLayers.length;n++){let r=e.inputTensors[n],i=e.inboundLayers[n],a=e.nodeIndices[n],o=pb(r,i,a);for(let e of o)t.indexOf(e)===-1&&t.push(e)}return t}}}function mb(e){let t=!0;for(let n of uv(e))if(!(n instanceof ob)){t=!1;break}return t}function hb(e){let t=!0;for(let n of uv(e))if(n instanceof ob){t=!1;break}return t}var gb=class extends ub{constructor(e){if(super({dtype:e.dtype,name:e.name==null?Av(`input`).toString():e.name}),e.batchSize??=null,e.sparse??=!1,this.trainable=!1,this.built=!0,this.sparse=e.sparse,e.inputShape!=null&&e.batchInputShape!=null)throw new q(`Only provide the inputShape OR batchInputShape argument to inputLayer, not both at the same time.`);let t=e.batchInputShape;if(t==null){if(e.inputShape==null)throw new q("An InputLayer should be passed either a `batchInputShape` or an `inputShape`.");t=[e.batchSize].concat(e.inputShape)}else if(e.batchSize!=null)throw new q(`Cannot specify batchSize if batchInputShape is specified when creating an InputLayer.`);let n=e.dtype||`float32`;this.batchInputShape=t,this.dtype=n,this.inputSpec=[{shape:t}];let r=new ob(this.dtype,this.batchInputShape,this,[],{},this.name);r.nodeIndex=0,r.tensorIndex=0,new cb({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:[r],outputTensors:[r],inputMasks:[null],outputMasks:[null],inputShapes:[t],outputShapes:[t]})}apply(e,t){throw new q(`Cannot pass any input to an InputLayer's apply() method. InputLayer name: ${this.name}`)}dispose(){return{refCountAfterDispose:this._refCount,numDisposedVariables:0}}getConfig(){return{batchInputShape:this.batchInputShape,dtype:this.dtype,sparse:this.sparse,name:this.name}}};gb.className=`InputLayer`,K(gb);function _b(e){if(e.batchShape==null&&e.shape==null)throw Error("Please provide to Input either a `shape` or a `batchShape` argument. Note that `shape` does not include the batch dimension.");if(e.batchShape!=null&&e.shape!=null)throw new q("Please provide either a `shape` or `batchShape` argument to Input, but not both.");let t=e.batchShape;e.shape!=null&&t==null&&(t=[null].concat(e.shape));let n=e.dtype;return n??=`float32`,new gb({batchInputShape:t,name:e.name,dtype:n,sparse:e.sparse}).inboundNodes[0].outputTensors[0]}function vb(e,t){if(e.dtype==null||e.dtype===t.dtype)return t;try{return R(t,e.dtype)}catch{throw new q(`The dtype of the feed (${t.dtype}) can not be cast to the dtype of the key '${e.name}' (${e.dtype}).`)}}var yb=class e{constructor(t){if(this.id2Value={},this.id2Mask={},this.name2Id={},t instanceof e)for(let e in t.id2Value)this.id2Value[e]=t.id2Value[e],e in t.id2Mask&&(this.id2Mask[e]=t.id2Mask[e]);else{if(t==null)return;for(let e of t)this.add(e.key,e.value)}}add(e,t,n){if(this.id2Value[e.id]==null)this.id2Value[e.id]=vb(e,t),this.name2Id[e.name]=e.id,n!=null&&(this.id2Mask[e.id]=n);else throw new q(`Duplicate key: name=${e.name}, id=${e.id}`);return this}addFeed(e){this.add(e.key,e.value)}hasKey(e){return this.id2Value[e.id]!=null}names(){return Object.keys(this.name2Id)}getValue(e){if(e instanceof ob){if(this.id2Value[e.id]==null)throw new q(`Nonexistent key: ${e.name}`);return this.id2Value[e.id]}{let t=this.name2Id[e];if(t==null)throw new q(`Feed dict has no SymbolicTensor name: ${e}`);return this.id2Value[t]}}getMask(e){if(e instanceof ob){if(this.id2Value[e.id]==null)throw new q(`Nonexistent key: ${e.name}`);return this.id2Mask[e.id]}{let t=this.name2Id[e];if(t==null)throw new q(`Feed dict has no SymbolicTensor name: ${e}`);return this.id2Mask[t]}}disposeMasks(){this.id2Mask!=null&&L(this.id2Mask)}},bb=new av,xb=new av;function Sb(e){bb?.setMaxEntries(e),xb?.setMaxEntries(e)}function Cb(e,t,n,r){let i=n!=null&&n.training,a=Array.isArray(e),o=a?e:[e],s=o.map(e=>e.name),c=[],l=t.names();for(let e of s)l.indexOf(e)===-1?c.push(null):c.push(t.getValue(e));r!=null&&(r.maxNumTensors=-1/0,r.minNumTensors=1/0);let u=s.join(`,`)+`|`+t.names().sort().join(`,`),d=bb.get(u),f;if(d==null){let e=wb(o,t);d=e.sorted,f=e.recipientCounts,bb.put(u,d),xb.put(u,f)}f={},i||Object.assign(f,xb.get(u));let p=new yb(t);for(let e=0;e<d.length;++e){if(r!=null){let e=ma().numTensors;e>r.maxNumTensors&&(r.maxNumTensors=e),e<r.minNumTensors&&(r.minNumTensors=e)}let a=d[e],o=a.sourceLayer;if(o instanceof gb)continue;let l=[],u=[],m=[],h=!1;for(let e of a.inputs){let n=p.getValue(e),r=p.getMask(e);l.push(n),u.push(r),r!=null&&(h=!0),i||(f[e.name]--,f[e.name]===0&&!t.hasKey(e)&&s.indexOf(e.name)===-1&&!n.isDisposed&&e.sourceLayer.stateful!==!0&&m.push(n))}h&&(n||={},n.mask=u[0]);let g=uv(o.apply(l,n)),_=null;o.supportsMasking&&(_=o.computeMask(l,u));let v=Db(a),y=Array.isArray(v)?v:[v];for(let e=0;e<y.length;++e){p.hasKey(y[e])||p.add(y[e],g[e],Array.isArray(_)?_[0]:_);let t=s.indexOf(y[e].name);t!==-1&&(c[t]=g[e])}i||L(m)}return p.disposeMasks(),a?c:c[0]}function wb(e,t){g(e!=null&&e.length>0,()=>`Expected at least one fetch, got none`);let n=[],r={};if(e.length===1){let i=Eb(e[0],t);n=i.sorted,r=i.recipientMap}else{let i=new Set;for(let a of e){let{sorted:e,recipientMap:o}=Eb(a,t);for(let t of e)i.has(t.name)||(n.push(t),i.add(t.name));for(let e in o)r[e]??(r[e]=new Set),o[e].forEach(t=>r[e].add(t))}}return{sorted:n,recipientCounts:Tb(r)}}function Tb(e){let t={};for(let n in e)t[n]=e[n].size;return t}function Eb(e,t){let n=new Set,r=[],i={};for(let e of t.names())n.add(e);let a=[],o=[];for(a.push(e);a.length>0;){let e=a[a.length-1];if(n.has(e.name)){a.pop();continue}let t=o[o.length-1]===a.length-1;if(e.inputs.length===0||t)a.pop(),r.push(e),n.add(e.name),t&&o.pop();else{o.push(a.length-1);for(let t of e.inputs)i[t.name]??(i[t.name]=new Set),i[t.name].add(e.name),!n.has(t.name)&&a.push(t)}}return{sorted:r,recipientMap:i}}function Db(e){let t;if(e.sourceLayer.inboundNodes.length===1)t=e.sourceLayer.output;else{let n=null;for(let t=0;t<e.sourceLayer.inboundNodes.length;++t)for(let r of e.sourceLayer.inboundNodes[t].outputTensors)if(r.id===e.id){n=t;break}t=e.sourceLayer.getOutputAt(n)}return t}j().registerFlag(`TOPOLOGICAL_SORT_CACHE_MAX_ENTRIES`,()=>100,Sb);function Ob(e,t){return I(()=>ol(W(V(e,e),t,!0)))}var kb=class extends nm{getConfig(){return{}}},Ab=class extends kb{constructor(e){super(),this.defaultMaxValue=2,this.defaultAxis=0,this.maxValue=e.maxValue==null?this.defaultMaxValue:e.maxValue,this.axis=e.axis==null?this.defaultAxis:e.axis}apply(e){return I(()=>{let t=Ob(e,this.axis);return V(e,B(Vs(t,0,this.maxValue),z(ty(),t)))})}getConfig(){return{maxValue:this.maxValue,axis:this.axis}}};Ab.className=`MaxNorm`,K(Ab);var jb=class extends kb{constructor(e){super(),this.defaultAxis=0,this.axis=e.axis==null?this.defaultAxis:e.axis}apply(e){return I(()=>B(e,z(ty(),Ob(e,this.axis))))}getConfig(){return{axis:this.axis}}};jb.className=`UnitNorm`,K(jb);var Mb=class extends kb{apply(e){return Sd(e)}};Mb.className=`NonNeg`,K(Mb);var Nb=class extends kb{constructor(e){super(),this.defaultMinValue=0,this.defaultMaxValue=1,this.defaultRate=1,this.defaultAxis=0,this.minValue=e.minValue==null?this.defaultMinValue:e.minValue,this.maxValue=e.maxValue==null?this.defaultMaxValue:e.maxValue,this.rate=e.rate==null?this.defaultRate:e.rate,this.axis=e.axis==null?this.defaultAxis:e.axis}apply(e){return I(()=>{let t=Ob(e,this.axis);return V(e,B(z(V(this.rate,Vs(t,this.minValue,this.maxValue)),V(1-this.rate,t)),z(ty(),t)))})}getConfig(){return{minValue:this.minValue,maxValue:this.maxValue,rate:this.rate,axis:this.axis}}};Nb.className=`MinMaxNorm`,K(Nb);var Pb={maxNorm:`MaxNorm`,minMaxNorm:`MinMaxNorm`,nonNeg:`NonNeg`,unitNorm:`UnitNorm`};function Fb(e){return mv(e)}function Ib(e,t={}){return gv(e,rm.getMap().classNameMap,t,`constraint`)}function Lb(e){return e==null?null:typeof e==`string`?Ib({className:e in Pb?Pb[e]:e,config:{}}):e instanceof kb?e:Ib(e)}async function Rb(e){if(e==null)return;let t=[],n=[],r=[];for(let i in e){let a=e[i];if(typeof a!=`number`){let e=a;t.push(e.data()),n.push(i),r.push(e)}}if(t.length>0){let i=await Promise.all(t);for(let t=0;t<i.length;++t)e[n[t]]=i[t][0];L(r)}}function zb(e){if(e!=null)for(let t in e){let n=e[t];typeof n!=`number`&&n.dispose()}}var Bb;(function(e){e[e.SILENT=0]=`SILENT`,e[e.VERBOSE=1]=`VERBOSE`})(Bb||={});var Vb=class{constructor(){this.validationData=null}setParams(e){this.params=e}async onEpochBegin(e,t){}async onEpochEnd(e,t){}async onBatchBegin(e,t){}async onBatchEnd(e,t){}async onTrainBegin(e){}async onTrainEnd(e){}setModel(e){}},Hb=class{constructor(e,t=10){e??=[],this.callbacks=e,this.queueLength=t}append(e){this.callbacks.push(e)}setParams(e){for(let t of this.callbacks)t.setParams(e)}setModel(e){for(let t of this.callbacks)t.setModel(e)}async onEpochBegin(e,t){t??={};for(let n of this.callbacks)await n.onEpochBegin(e,t)}async onEpochEnd(e,t){t??={};for(let n of this.callbacks)await n.onEpochEnd(e,t)}async onBatchBegin(e,t){t??={};for(let n of this.callbacks)await n.onBatchBegin(e,t)}async onBatchEnd(e,t){t??={};for(let n of this.callbacks)await n.onBatchEnd(e,t)}async onTrainBegin(e){e??={};for(let t of this.callbacks)await t.onTrainBegin(e)}async onTrainEnd(e){e??={};for(let t of this.callbacks)await t.onTrainEnd(e)}},Ub=class extends Vb{constructor(){super()}async onEpochBegin(e){this.seen=0,this.totals={}}async onBatchEnd(e,t){t??={};let n=t.size==null?0:t.size;this.seen+=n;for(let e in t){let r=t[e];if(typeof r==`number`)this.totals.hasOwnProperty(e)||(this.totals[e]=0),this.totals[e]=this.totals[e]+r*n;else{let t;e in this.totals?t=this.totals[e]:this.totals[e]=0;let i=I(()=>z(this.totals[e],V(r,n)));this.totals[e]=i,t?.dispose()}}}async onEpochEnd(e,t){if(t!=null)for(let e of this.params.metrics)this.totals[e]!=null&&(typeof this.totals[e]==`number`?t[e]=this.totals[e]/this.seen:I(()=>{let n=V(B(1,this.seen),this.totals[e]);t[e]=n,this.totals[e].dispose(),ha(t[e])}))}},Wb=class extends Vb{async onTrainBegin(e){this.epoch=[],this.history={}}async onEpochEnd(e,t){t??={},this.epoch.push(e);for(let e in t)this.history[e]??(this.history[e]=[]),this.history[e].push(t[e])}async syncData(){let e=[],t=[],n=[];for(let r in this.history){let i=this.history[r];for(let a=0;a<i.length;++a)if(typeof i[a]!=`number`){let o=i[a];e.push(o.data()),t.push(r),n.push(a)}}let r=await Promise.all(e);for(let e=0;e<r.length;++e)this.history[t[e]][n[e]].dispose(),this.history[t[e]][n[e]]=r[e][0]}},Gb=class extends Vb{constructor(e,t){if(super(),this.currentEpoch=0,this.nowFunc=e.nowFunc,this.nextFrameFunc=e.nextFrameFunc||Rm,this.yieldEvery=t||`auto`,this.yieldEvery===`auto`&&(this.yieldEvery=125),this.yieldEvery===`never`&&e.onYield!=null)throw Error("yieldEvery is `never` but you provided an `onYield` callback. Either change `yieldEvery` or remove the callback");se(this.yieldEvery)&&(this.maybeWait=Tv(this.maybeWait.bind(this),this.yieldEvery,this.nowFunc)),this.trainBegin=e.onTrainBegin,this.trainEnd=e.onTrainEnd,this.epochBegin=e.onEpochBegin,this.epochEnd=e.onEpochEnd,this.batchBegin=e.onBatchBegin,this.batchEnd=e.onBatchEnd,this.yield=e.onYield}async maybeWait(e,t,n){let r=[];this.yield!=null&&(await Rb(n),r.push(this.yield(e,t,n))),r.push(this.nextFrameFunc()),await Promise.all(r)}async onEpochBegin(e,t){this.currentEpoch=e,this.epochBegin!=null&&(await Rb(t),await this.epochBegin(e,t))}async onEpochEnd(e,t){let n=[];this.epochEnd!=null&&(await Rb(t),n.push(this.epochEnd(e,t))),this.yieldEvery===`epoch`&&n.push(this.nextFrameFunc()),await Promise.all(n)}async onBatchBegin(e,t){this.batchBegin!=null&&(await Rb(t),await this.batchBegin(e,t))}async onBatchEnd(e,t){let n=[];this.batchEnd!=null&&(await Rb(t),n.push(this.batchEnd(e,t))),this.yieldEvery===`batch`?n.push(this.nextFrameFunc()):se(this.yieldEvery)&&n.push(this.maybeWait(this.currentEpoch,e,t)),await Promise.all(n)}async onTrainBegin(e){this.trainBegin!=null&&(await Rb(e),await this.trainBegin(e))}async onTrainEnd(e){this.trainEnd!=null&&(await Rb(e),await this.trainEnd(e))}};function Kb(e,t){return e??={},e instanceof Vb?[e]:Array.isArray(e)&&e[0]instanceof Vb?e:uv(e).map(e=>new Gb(e,t))}var qb=class e{constructor(){}static registerCallbackConstructor(t,n){g(t>=0&&Number.isInteger(t),()=>`Verbosity level is expected to be an integer >= 0, but got ${t}`),e.checkForDuplicate(n),e.constructors[t]??(e.constructors[t]=[]),e.constructors[t].push(n)}static checkForDuplicate(t){for(let n in e.constructors)e.constructors[+n].forEach(e=>{if(e===t)throw new q(`Duplicate callback constructor.`)})}static clear(){e.constructors={}}static createCallbacks(t){let n=[];for(let r in e.constructors){let i=+r;t>=i&&n.push(...e.constructors[i])}return n.map(e=>new e)}};qb.constructors={};function Jb(e,t,n,r,i,a,o,s,c){let l=new Wb,u=[new Ub,...qb.createCallbacks(t)];e!=null&&u.push(...e),u.push(l);let d=new Hb(u);return d.setParams({epochs:n,initialEpoch:r,samples:i,steps:a,batchSize:o,verbose:t,doValidation:s,metrics:c}),{callbackList:d,history:l}}function Yb(e,t={},n=!1){return gv(e,rm.getMap().classNameMap,t,`layer`,n)}function Xb(e,t){return I(()=>{e.dtype!==`float32`&&(e=R(e,`float32`));let n=W(_y(e),t,!0),r=ol(Tu(n,zs(n.shape,ty())));return B(e,r)})}function Zb(e,t){return I(()=>Du(_y(G(t,e)),-1))}function Qb(e,t){return I(()=>Du(yo(G(t,e)),-1))}function $b(e,t){return I(()=>V(100,Du(yo(B(G(e,t),Vs(yo(e),ty(),Number.MAX_VALUE))),-1)))}function ex(e,t){return I(()=>Du(_y(G(Xl(z(1,Vs(t,ty(),Number.MAX_VALUE))),Xl(z(1,Vs(e,ty(),Number.MAX_VALUE))))),-1))}function tx(e,t){return I(()=>Du(_y(Tu(0,G(1,V(e,t)))),-1))}function nx(e,t){return I(()=>Du(Tu(0,G(1,V(e,t))),-1))}function rx(e,t){return I(()=>{let n=W(V(e,t),-1);return Tu(0,z(1,G($c(V(G(1,e),t),-1),n)))})}function ix(e,t){return I(()=>{let n=Math.log(2),r=G(t,e);return Du(G(z(r,iu(V(-2,r))),n),-1)})}function ax(e,t,n=!1){return I(()=>{if(n)t=Xd(t);else{let e=W(t,t.shape.length-1,!0);t=B(t,e)}return t=Vs(t,ty(),1-ty()),nu(W(V(R(e,`float32`),Xl(t)),t.shape.length-1))})}function ox(e,t,n=!1){return I(()=>{let r=R(El(oy(e)),`int32`);t=Vs(t,ty(),1-ty());let i=t.shape;return ax(H(Vu(r,i[i.length-1]),i),t,n)})}function sx(e,t){if(!b(e.shape,t.shape))throw new q(`logits and labels must have the same shape, but got shapes ${JSON.stringify(e.shape)} and ${JSON.stringify(t.shape)}`);return I(()=>{let n=Sd(t),r=nu(yo(t));return z(G(n,V(t,e)),Ql(gl(r)))})}function cx(e,t){return I(()=>{let n;return n=Vs(t,ty(),1-ty()),n=Xl(B(n,G(1,n))),Du(sx(e,n),-1)})}function lx(e,t){return I(()=>W(V(e,Xl(B(Vs(e,ty(),1),Vs(t,ty(),1)))),-1))}function ux(e,t){return I(()=>Du(G(t,V(e,Xl(z(ty(),t)))),-1))}function dx(e,t){return I(()=>nu(W(V(Xb(e,-1),Xb(t,-1)),-1)))}var fx={meanSquaredError:Zb,meanAbsoluteError:Qb,meanAbsolutePercentageError:$b,meanSquaredLogarithmicError:ex,squaredHinge:tx,hinge:nx,categoricalHinge:rx,logcosh:ix,categoricalCrossentropy:ax,sparseCategoricalCrossentropy:ox,binaryCrossentropy:cx,kullbackLeiblerDivergence:lx,poisson:ux,cosineProximity:dx};function px(e){if(typeof e==`string`){if(e in fx)return fx[e];let t=`Unknown loss ${e}`;throw e.toLowerCase().includes(`softmaxcrossentropy`)&&(t=`Unknown loss ${e}. Use "categoricalCrossentropy" as the string name for tf.losses.softmaxCrossEntropy`),new q(t)}return e}function mx(e,t){return I(()=>Du(kc(e,ry(Al(t,V(.5,Uu(t))),e.dtype)),-1))}function hx(e,t){return I(()=>ry(kc(ko(e,-1),ko(t,-1)),`float32`))}function gx(e,t){return I(()=>R(W(pu(kc(e,1),kc(t,1))),`float32`))}function _x(e,t){return I(()=>R(W(pu(kc(e,0),kc(t,1))),`float32`))}function vx(e,t){return I(()=>{let n=gx(e,t),r=z(n,_x(e,t));return R(jc(Al(r,0),B(n,r),0),`float32`)})}function yx(e,t){return cx(e,t)}function bx(e,t){return e.rank===t.rank&&(e=df(e,[e.rank-1])),t=ko(t,-1),t.dtype!==e.dtype&&(t=R(t,e.dtype)),R(kc(e,t),`float32`)}var xx=Zb,Sx=Zb,Cx=Qb,wx=Qb,Tx=$b,Ex=$b,Dx=ax,Ox=dx,kx=ox,Ax={binaryAccuracy:mx,categoricalAccuracy:hx,precision:vx,categoricalCrossentropy:Dx,sparseCategoricalCrossentropy:kx,mse:xx,MSE:Sx,mae:Cx,MAE:wx,mape:Tx,MAPE:Ex,cosine:Ox};function jx(e){if(typeof e==`string`&&e in Ax)return Ax[e];if(typeof e!=`string`&&e!=null)return e;throw new q(`Unknown metric ${e}`)}function Mx(e){if(sv(e!==null,`Unknown LossOrMetricFn ${e}`),typeof e==`string`)return e;{let t;for(let n of Object.keys(fx))if(fx[n]===e){t=n;break}if(t!==void 0)return t;for(let n of Object.keys(Ax))if(Ax[n]===e){t=n;break}return t===void 0?e.name:t}}function Nx(e){let t={Adagrad:()=>Im.adagrad(.01),Adadelta:()=>Im.adadelta(1,.95,ty()),Adam:()=>Im.adam(.001,.9,.999,ty()),Adamax:()=>Im.adamax(.002,.9,.999,ty(),0),RMSProp:()=>Im.rmsprop(.001,.9,0,ty()),SGD:()=>Im.sgd(.01)};if(t.adagrad=t.Adagrad,t.adadelta=t.Adadelta,t.adam=t.Adam,t.adamax=t.Adamax,t.rmsprop=t.RMSProp,t.sgd=t.SGD,e in t)return t[e]();throw new q(`Unknown Optimizer ${e}`)}var Px=1048576;function Fx(e,t,n=!1){if(typeof e!=`object`||!e||Object.getPrototypeOf(e)!==Object.prototype||!Ix(e))throw Error(`User-defined metadata is expected to be a JSON object, but is not.`);if(n){let n=JSON.stringify(e);n.length>1048576&&console.warn(`User-defined metadata of model "${t}" is too large in size (length=${n.length} when serialized). It is not recommended to store such large objects in user-defined metadata. Please make sure its serialized length is <= ${Px}.`)}}function Ix(e){if(e===null)return!0;if(typeof e==`object`)if(Object.getPrototypeOf(e)===Object.prototype){let t=Object.keys(e);for(let n of t)if(typeof n!=`string`||!Ix(e[n]))return!1;return!0}else if(Array.isArray(e)){for(let t of e)if(!Ix(t))return!1;return!0}else return!1;{let t=typeof e;return t===`string`||t===`number`||t===`boolean`}}function Lx(e,t,n,r=console.log){let i=zx(e),a=[`Layer (type)`,`Input Shape`,`Output shape`,`Param #`];i?(t||=90,n||=[.32,.61,.89,1]):(t||=115,n||=[.24,.48,.7,.8,1]),n[n.length-1]<=1&&(n=n.map(e=>Math.floor(t*e)));let o;if(!i){a.push(`Receives inputs`),o=[];for(let t in e.nodesByDepth)o.push(...e.nodesByDepth[t])}r(`_`.repeat(t)),Bx(a,n,r),r(`=`.repeat(t));let s=e.layers;for(let e=0;e<s.length;++e)i?Vx(s[e],n,r):Hx(s[e],n,o,r),r((e===s.length-1?`=`:`_`).repeat(t));e.checkTrainableWeightsConsistency();let c=Rx(e),l=$y(e.nonTrainableWeights);r(`Total params: ${c+l}`),r(`Trainable params: ${c}`),r(`Non-trainable params: ${l}`),r(`_`.repeat(t))}function Rx(e){let t;return t=e.collectedTrainableWeights==null?$y(e.trainableWeights):$y(e.collectedTrainableWeights),t}function zx(e){let t=!0,n=[],r=[];for(let t in e.nodesByDepth)n.push(e.nodesByDepth[t]);for(let e of n){if(e.length>1||e.length===1&&e[0].inboundLayers.length>1){t=!1;break}r.push(...e)}if(t)for(let n of e.layers){let e=!1;for(let i of n.inboundNodes)if(r.indexOf(i)!==-1)if(e){t=!1;break}else e=!0;if(!t)break}return t}function Bx(e,t,n=console.log){let r=``;for(let n=0;n<e.length;++n)n>0&&(r=r.slice(0,r.length-1)+` `),r+=e[n],r=r.slice(0,t[n]),r+=` `.repeat(t[n]-r.length);n(r)}function Vx(e,t,n){let r,i;try{i=e.inboundNodes.map(e=>JSON.stringify(e.inputShapes)).join(`,`)}catch{i=`multiple`}try{r=JSON.stringify(e.outputShape)}catch{r=`multiple`}Bx([`${e.name} (${e.getClassName()})`,i,r,e.countParams().toString()],t,n)}function Hx(e,t,n,r){let i,a;try{a=e.inboundNodes.map(e=>JSON.stringify(e.inputShapes)).join(`,`)}catch{a=`multiple`}try{i=JSON.stringify(e.outputShape)}catch{i=`multiple`}let o=[];for(let t of e.inboundNodes)if(!(n!=null&&n.length>0&&n.indexOf(t)===-1))for(let e=0;e<t.inboundLayers.length;++e){let n=t.inboundLayers[e].name,r=t.nodeIndices[e],i=t.tensorIndices[e];o.push(`${n}[${r}][${i}]`)}let s=e.name,c=e.getClassName(),l=o.length===0?``:o[0];Bx([`${s} (${c})`,a,i,e.countParams().toString(),l],t,r);for(let e=1;e<o.length;++e)Bx([``,``,``,``,o[e]],t,r)}function Ux(e,t,n){return(e===`inboundNodes`||e===`outputLayers`||e===`inputLayers`)&&t===0&&typeof n==`string`}function Wx(e,t){if(e===null)return null;if(typeof e==`string`)return fv(e);if(typeof e==`number`||typeof e==`boolean`)return e;if(e instanceof Array){let n=[],r=e.length;for(let i=0;i<r;++i){let r=e[i];Ux(t,i,r)?n.push(r):n.push(Wx(r,t))}return n}{let t={};for(let n of Object.keys(e)){let r=e[n];if(n===`name`&&typeof r==`string`)t[n]=r;else{let e=fv(n);t[e]=Wx(r,e)}}return t}}function Gx(e,t){if(e==null)return null;if(typeof e==`string`)return dv(e);if(typeof e==`number`||typeof e==`boolean`)return e;if(e instanceof Array){let n=[],r=e.length;for(let i=0;i<r;++i){let r=e[i];Ux(t,i,r)?n.push(r):n.push(Gx(r,t))}return n}{let t={};for(let n of Object.keys(e)){let r=e[n],i=dv(n);t[i]=(n===`name`||n===`className`)&&typeof r==`string`?r:Gx(r,n)}return t}}var Kx=`4.22.0`,qx=e=>{let t=Object.keys(e);if(t.length===0)return!1;let n=t[0].split(`/`);return!isNaN(parseInt(n[n.length-1],10))},Jx=class e extends ub{constructor(t){if(super({}),this.containerNodes=new Set,this.name=t.name,this.name==null){let e=this.getClassName().toLowerCase();this.name=Av(e)}if(this.supportsMasking=!1,this.trainable_=!0,this.inputs=Array.isArray(t.inputs)?t.inputs.slice():[t.inputs],this.outputs=Array.isArray(t.outputs)?t.outputs.slice():[t.outputs],yv(this.inputs).length!==this.inputs.length)throw new q(`The list of inputs passed to the model is redundant. All inputs should only appear once. Found: ${this.inputs.map(e=>e.name)}`);yv(this.outputs).length!==this.outputs.length&&console.warn(`The list of outputs passed to the model is redundant. All outputs should only appear once. Found: ${this.outputs.map(e=>e.name)}`),this.inputLayers=[],this.inputLayersNodeIndices=[],this.inputLayersTensorIndices=[],this.outputLayers=[],this.outputLayersNodeIndices=[],this.outputLayersTensorIndices=[],this.layers=[],this.internalContainerRefs=[];for(let e of this.outputs){let t=e.sourceLayer,n=e.nodeIndex,r=e.tensorIndex;this.outputLayers.push(t),this.outputLayersNodeIndices.push(n),this.outputLayersTensorIndices.push(r)}for(let e of this.inputs){let t=e.sourceLayer,n=e.nodeIndex,r=e.tensorIndex;sv(n===0,`input layer has >1 nodes`),sv(r===0,`input layer has >1 tensors`),this.inputLayers.push(t),this.inputLayersNodeIndices.push(n),this.inputLayersTensorIndices.push(r)}this.inputNames=[],this.outputNames=[],this.feedInputShapes=[],this.feedInputNames=[],this.feedOutputNames=[];for(let e=0;e<this.inputLayers.length;e++){let n=this.inputLayers[e];if(!(n instanceof gb))throw TypeError(`Input layers to a LayersModel must be InputLayer objects. Received inputs: ${t.inputs}. Input ${e} (0-based) originates from layer type ${n.getClassName()}.`);this.inputNames.push(n.name),this.feedInputShapes.push(n.batchInputShape),this.feedInputNames.push(n.name)}for(let e of this.outputLayers)this.outputNames.push(e.name);this.internalInputShapes=this.inputs.map(e=>e.shape),this.internalOutputShapes=this.outputs.map(e=>e.shape);let n={},r={},i={},a={},o={},s=[],c=(t,n,r,i,a,l)=>{(i==null||a==null||l==null)&&(i=t.sourceLayer,a=t.nodeIndex,l=t.tensorIndex);let u=i.inboundNodes[a];if(r.indexOf(u)!==-1)throw new rv(`The tensor ${t.name} at layer "${i.name}" is part of a cycle.`);if(n.indexOf(u)!==-1)return;this.containerNodes.add(e.nodeKey(i,a)),i.id in o||(o[i.id]=Object.keys(o).length),r.indexOf(u)===-1&&r.push(u);let d=u.inboundLayers.length;for(let e=0;e<d;e++){let t=u.inputTensors[e],i=u.inboundLayers[e],a=u.nodeIndices[e],o=u.tensorIndices[e];c(t,n,r,i,a,o)}for(n.push(u);r.indexOf(u)>=0;)r.splice(r.indexOf(u),1);s.push(u)},l=[],u=[];for(let e of this.outputs)c(e,l,u);let d=s.slice().reverse();for(let e of d){r[e.id]=e,e.id in n||(n[e.id]=0);let t=n[e.id],o=i[e.outboundLayer.id]==null?0:i[e.outboundLayer.id];t=Math.max(t,o),i[e.outboundLayer.id]=t,a[e.outboundLayer.id]=e.outboundLayer,n[e.id]=t;for(let i=0;i<e.inboundLayers.length;i++){let a=e.inboundLayers[i],o=e.nodeIndices[i],s=a.inboundNodes[o],c=n[s.id]==null?0:n[s.id];n[s.id]=Math.max(t+1,c),r[s.id]=s}}let f={};for(let e in n){let t=n[e];t in f||(f[t]=[]),f[t].push(r[e])}let p={};for(let e in i){let t=i[e];t in p||(p[t]=[]),p[t].push(a[e])}let m=Object.keys(p).map(e=>parseInt(e,10)).sort(vv);this.layers=[];for(let t of m){let n=p[t];n.sort((e,t)=>{let n=o[e.id],r=o[t.id];return n<r?-1:+(n>r)});for(let t of n)t instanceof e&&this.internalContainerRefs.push(t),this.layers.push(t)}this.layersByDepth=p,m=Object.keys(f).map(e=>parseInt(e,10)).sort(vv);let h=this.inputs.slice(),g=[];for(let e of m)for(let t of f[e]){let e=t.outboundLayer;if(e!=null){for(let n of t.inputTensors)if(h.indexOf(n)===-1)throw new rv(`Graph disconnected: cannot obtain value for tensor ${n} at layer "${e.name}". The following previous layers were accessed without issue: ${g}`);for(let e of t.outputTensors)h.push(e);g.push(e.name)}}this.nodesByDepth=f;let _=this.layers.map(e=>e.name);for(let e of _){let t=_.filter(t=>t===e).length;if(t!==1)throw new rv(`The name "${e}" is used ${t} times in the model. All layer names should be unique. Layer names: `+JSON.stringify(_))}this.outboundNodes=[],this.inboundNodes=[],new cb({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:this.inputs,outputTensors:this.outputs,inputMasks:this.inputs.map(e=>null),outputMasks:this.outputs.map(e=>null),inputShapes:this.inputs.map(e=>e.shape),outputShapes:this.outputs.map(e=>e.shape)}),this.built=!0,this._refCount=1}assertNotDisposed(){if(this._refCount===0)throw Error(`Container '${this.name}' is already disposed.`)}dispose(){this.assertNotDisposed();let e={refCountAfterDispose:null,numDisposedVariables:0};if(--this._refCount===0){for(let t of this.layers)e.numDisposedVariables+=t.dispose().numDisposedVariables;for(let t of this.internalContainerRefs)e.numDisposedVariables+=t.dispose().numDisposedVariables}return e.refCountAfterDispose=this._refCount,e}get trainable(){return this.trainable_}set trainable(e){this.layers.forEach(t=>{t._trainableWeights.forEach(t=>t.trainable=e)}),this.trainable_=e}get trainableWeights(){if(this._trainableWeights.length>0)throw new q(`Container instance unexpectedly contains _trainableWeights.The trainable weights of a Container are a union of the trainable weights of its consituent Layers. Its own _trainableWeights must remain an empty Array.`);if(!this.trainable)return[];let e=[];for(let t of this.layers)e=e.concat(t.trainableWeights);return e}get nonTrainableWeights(){let e=[];for(let t of this.layers)e.push(...t.nonTrainableWeights);if(!this.trainable){let t=[];for(let e of this.layers)t.push(...e.trainableWeights);return t.concat(e)}return e}get weights(){return this.trainableWeights.concat(this.nonTrainableWeights)}loadWeights(e,t=!0){let n={},r=0,i=qx(e);i&&this.parseWeights(e);for(let e of this.layers)for(let[t,a]of e.weights.entries()){let e=i?`${a.name.split(`/`).slice(0,-1).join(`/`)+`/`}${t}`:a.originalName;if(n[e]!=null)throw new q(`Duplicate weight name: ${e}`);n[e]=a,r++}let a=[];for(let r in e){let i=r;if(n[r]==null){let e=r.split(`/`);i=e.slice(0,-2).concat([e[e.length-1]]).join(`/`)}if(n[i]!=null)a.push([n[i],e[r]]);else if(t)throw new q(`Provided weight data has no target variable: ${r}`);delete n[i]}if(t){let e=[];for(let t in n)e.push(t);if(e.length>0)throw new q(`${e.length} of ${r} weights are not set: ${e}`)}ib(a)}parseWeights(e){for(let t in Object.keys(e)){let n=t.split(`/`),r=[`vars`,`layer_checkpoint_dependencies`],i=n.map(e=>e.startsWith(`_`)?e.slice(1):e).filter(e=>!r.includes(e)).join(`/`);i!==t&&(e[i]=e[t],delete e[t])}}updatedConfig(){let e=this.getConfig(),t={};return t.className=this.getClassName(),t.config=e,t.kerasVersion=`tfjs-layers ${Kx}`,t.backend=`TensorFlow.js`,t}toJSON(e,t=!0){let n=Gx(this.updatedConfig());return t?JSON.stringify(n):n}call(e,t){return I(()=>{e=uv(e);let n=new yb;for(let t=0;t<this.inputs.length;++t)n.add(this.inputs[t],e[t]);return Cb(this.outputs,n,t)})}computeMask(e,t){return I(()=>{e=uv(e);let n;return n=t==null?ov(null,e.length):uv(t),this.runInternalGraph(e,n)[1]})}computeOutputShape(e){let t=Zy(e);if(t.length!==this.inputLayers.length)throw new q(`Invalid inputShape argument ${e}: model has ${this.inputLayers.length} tensor inputs.`);let n={};for(let e=0;e<t.length;e++){let r=this.inputLayers[e],i=t[e],a=r.name+`_0_0`;n[a]=i}let r=Object.keys(this.nodesByDepth).map(e=>parseInt(e,10)).sort(vv);if(r.length>1)for(let e of r){let t=this.nodesByDepth[e];for(let e of t){let t=e.outboundLayer;if(this.inputLayers.map(e=>e.id).indexOf(t.id)!==-1)continue;let r=[];for(let t=0;t<e.inboundLayers.length;t++){let i=e.inboundLayers[t],a=e.nodeIndices[t],o=e.tensorIndices[t],s=n[`${i.name}_${a}_${o}`];r.push(s)}let i=Zy(t.computeOutputShape(lv(r))),a=t.inboundNodes.indexOf(e);for(let e=0;e<i.length;e++){let r=`${t.name}_${a}_${e}`;n[r]=i[e]}}}let i=[],a=[];for(let e=0;e<this.outputLayers.length;e++){let t=this.outputLayers[e],n=this.outputLayersNodeIndices[e],r=this.outputLayersTensorIndices[e],i=`${t.name}_${n}_${r}`;a.push(i)}for(let e=0;e<a.length;e++){let t=a[e];sv(t in n),i.push(n[t])}return lv(i)}runInternalGraph(e,t){t??=ov(null,e.length);let n={};for(let r=0;r<this.inputs.length;++r){let i=this.inputs[r],a=e[r],o=t[r];n[i.id]=[a,o]}let r=Object.keys(this.nodesByDepth).map(e=>parseInt(e,10)).sort(vv);for(let e of r){let t=this.nodesByDepth[e];for(let e of t){let t=e.outboundLayer,r=e.inputTensors,i=e.outputTensors,a=[];for(let e of r)e.id in n&&a.push(n[e.id]);if(a.length===r.length){let r={},o,s,c,l;if(e.callArgs!=null&&(r=e.callArgs),a.length===1){let[e,n]=a[0];r.mask??(r.mask=n),c=uv(t.call(e,r)),l=uv(t.computeMask(e,n)),o=[e],s=[n]}else o=a.map(e=>e[0]),s=a.map(e=>e[1]),r.mask??(r.mask=s),c=uv(t.call(o,r)),l=uv(t.computeMask(o,s));if(t.activityRegularizer)throw new J(`LayersModel invocation with concrete Tensor value(s) in the presence of activity regularizer(s) is not supported yet.`);for(let e=0;e<i.length;++e){let t=i[e],r=c[e],a=l[e];n[t.id]=[r,a]}}}}let i=[],a=[],o=[];for(let e of this.outputs){sv(e.id in n,`Could not compute output ${e.name} : ${e.id}`);let[t,r]=n[e.id];o.push(t.shape),i.push(t),a.push(r)}return[i,a,o]}buildNodeConversionMap(t){let n={},r;for(let t of this.layers){r=+(t instanceof e);for(let i=0;i<t.inboundNodes.length;i++){let a=e.nodeKey(t,i);this.containerNodes.has(a)&&(n[a]=r,r+=1)}}return n}getLayer(e,t){if(t!=null)return this.findLayer(t);if(e==null)throw new q(`Provide either a layer name or layer index`);if(typeof e==`number`)return this.findLayer(e);for(let t of this.layers)if(t.name===e)return t;throw new q(`No such layer: ${e}`)}findLayer(e){if(this.layers.length<=e)throw new q(`Was asked to retrieve layer at index ${e}, but model only has ${this.layers.length} layer(s).`);return this.layers[e]}calculateLosses(){return I(()=>{let t=[];for(let n of this.layers)for(let r=0;r<n.inboundNodes.length;++r){let i=e.nodeKey(n,r);this.containerNodes.has(i)&&t.push(...n.calculateLosses())}return t})}getConfig(){let t={name:this.name},n=this.buildNodeConversionMap(this.layers),r=[];for(let t of this.layers){let i=t.getClassName(),a=t.getConfig(),o=[];for(let r=0;r<t.inboundNodes.length;r++){let i=t.inboundNodes[r],a=e.nodeKey(t,r),s={};if(this.containerNodes.has(a)){if(i.callArgs)try{JSON.stringify(i.callArgs),s=i.callArgs}catch{console.warn(`Layer ${t.name} was passed non-serializable keyword arguments: ${i.callArgs}. They will not be included in the serialized model (and thus will be missing at deserialization time).`),s={}}if(i.inboundLayers.length>0){let t=[];for(let r=0;r<i.inboundLayers.length;r++){let a=i.inboundLayers[r],o=i.nodeIndices[r],c=i.tensorIndices[r],l=n[e.nodeKey(a,o)];l??=0,t.push([a.name,l,c,s])}o.push(t)}}}let s={};s.name=t.name,s.className=i,s.config=a,s.inboundNodes=o,r.push(s)}t.layers=r;let i=[];for(let t=0;t<this.inputLayers.length;t++){let r=this.inputLayers[t],a=this.inputLayersNodeIndices[t],o=e.nodeKey(r,a);if(!this.containerNodes.has(o))continue;let s=n[o];s??=0;let c=this.inputLayersTensorIndices[t];i.push([r.name,s,c])}t.inputLayers=i;let a=[];for(let t=0;t<this.outputLayers.length;t++){let r=this.outputLayers[t],i=this.outputLayersNodeIndices[t],o=e.nodeKey(r,i);if(!this.containerNodes.has(o))continue;let s=n[o];s??=0;let c=this.outputLayersTensorIndices[t];a.push([r.name,s,c])}return t.outputLayers=a,t}static fromConfig(e,t,n={},r=!1){let i={},a={};function o(e,t){e.name in a?a[e.name].push(t):a[e.name]=[t]}function s(e,t){let n=[],r;for(let a of t){let s=a[0],c=a[1],l=a[2];if(r=a[3]==null?{}:a[3],!(s in i)){o(e,t);return}let u=i[s];if(u.inboundNodes.length<=c){o(e,t);return}let d=u.inboundNodes[c];n.push(d.outputTensors[l])}n.length>0&&e.apply(lv(n),r)}function c(e){let n=e.name,a=Yb(e,t.customObjects==null?{}:t.customObjects);a.setFastWeightInitDuringBuild(r),i[n]=a,e.inboundNodes.forEach(e=>{if(!(e instanceof Array))throw new q(`Corrupted configuration, expected array for nodeData: ${e}`);o(a,e)})}let l=t.name,u=t.layers;for(let e of u)c(e);for(;!bv(a);)for(let e of u){let t=i[e.name];if(t.name in a){let e=a[t.name];delete a[t.name];for(let n of e)s(t,n)}}let d=[],f=[],p=t.inputLayers;for(let e of p){let t=e[0],n=e[1],r=e[2];sv(t in i);let a=i[t].inboundNodes[n].outputTensors;d.push(a[r])}let m=t.outputLayers;for(let e of m){let t=e[0],n=e[1],r=e[2];sv(t in i);let a=i[t].inboundNodes[n].outputTensors;f.push(a[r])}return new e({inputs:d,outputs:f,name:l})}get stateful(){if(this._stateful)throw new q(`Container instance unexpectedly has _stateful = true. The statefulness of a Container is determined by the Layers it contains. Its _stateful property must remain the default false.`);for(let e of this.layers)if(e.stateful)return!0;return!1}resetStates(){I(()=>{this.layers.forEach(e=>{e.stateful&&e.resetStates()})})}};function Yx(e,t,n){let r=t.length;if(e==null||Array.isArray(e)&&e.length===0)return t.map(e=>null);if(r===1)return Array.isArray(e)&&e.length===1?e:typeof e==`object`&&t[0]in e?[e[t[0]]]:[e];if(Array.isArray(e)){if(e.length!==r)throw Error(`Provided ${n} is an array of ${e.length} element(s), but the model has ${r} outputs. Make sure a set of weights is provided for each model output.`);return e}if(typeof e==`object`&&Object.keys(e).length>0&&typeof e[Object.keys(e)[0]]==`object`){let n=[];return t.forEach(t=>{t in e?n.push(e[t]):n.push(null)}),n}throw Error(`The model has multiple (${r}) outputs, so ${n} must be either an array with ${r} elements or an object with ${t} keys. Provided ${n} not understood: ${JSON.stringify(e)}`)}function Xx(e,t){return Yx(e,t,`classWeight`)}async function Zx(e,t,n,r){if(t!=null||r!=null)throw Error(`Support sampleWeight is not implemented yet`);if(n!=null){let t=I(()=>{if(e.shape.length===1)return uo(e);if(e.shape.length===2){if(e.shape[1]>1)return ko(e,1);if(e.shape[1]===1)return H(e,[e.shape[0]]);throw Error(`Encountered unexpected last-dimension size (${e.shape[1]}) during handling of class weights. The size is expected to be >= 1.`)}throw Error(`Unexpected rank of target (y) tensor (${e.rank}) during handling of class weights. The rank is expected to be 1 or 2.`)}),r=Array.from(await t.data());L(t);let i=[];return r.forEach(e=>{if(n[e]==null)throw Error(`classWeight must contain all classes in the training data. The class ${e} exists in the data but not in classWeight`);i.push(n[e])}),bf(i,`float32`)}return null}function Qx(e,t){return V(e,t)}var $x=32;function eS(e,t){let n,r,i=t;n=i.xs,r=i.ys,g(n!=null&&r!=null,()=>`A Dataset iterator for fitDataset() is expected to generate objects of the form \`{xs: xVal, ys: yVal}\`, where the two values may be \`tf.Tensor\`, an array of Tensors, or a map of string to Tensor.  The provided Dataset instead generates ${t}`);let a=tS(`input`,e.inputNames,n),o=tS(`output`,e.outputNames,r),s=a[0].shape[0];g(a.length===e.inputs.length,()=>`LayersModel has ${e.inputs.length} inputs, but the dataset provides ${a.length} inputs.  (Expected input keys: ${JSON.stringify(e.inputNames)})`),g(o.length===e.outputs.length,()=>`LayersModel has ${e.outputs.length} outputs, but the dataset provides ${o.length} outputs.  (Expected output keys: ${JSON.stringify(e.outputNames)})`);for(let t=0;t<a.length;t++)g(a[t].shape[0]===s,()=>`Batch size mismatch: input ${e.inputNames[t]} has ${a[t].shape[0]}; expected  ${s} based on input ${e.inputNames[0]}.`);for(let t=0;t<o.length;t++)g(o[t].shape[0]===s,()=>`Batch size mismatch: output ${e.outputNames[t]} has ${o[t].shape[0]}; expected  ${s} based on input ${e.inputNames[0]}.`);return{xs:a,ys:o}}function tS(e,t,n){if(n instanceof Oi)return[n];if(Array.isArray(n))return g(n.length===t.length,()=>`Received an array of ${n.length} Tensors, but expected ${t.length} to match the ${e} keys ${t}.`),n;{let r=[];for(let i of t){if(n[i]==null)throw new q(`The feature data generated by the dataset lacks the required ${e} key '${i}'.`);r.push(n[i])}return r}}function nS(e){if(e.length===3)throw new J(`Validation with sample weights is not implemented yet.`);return{xs:e[0],ys:e[1]}}async function rS(e,t,n){let r=n.batchesPerEpoch!=null;if(g(e.optimizer!=null,()=>`You must compile a model before training/testing. Use LayersModel.compile(modelCompileConfig).`),g(n!=null,()=>`For fitDataset(), the 2nd argument (config) is required, but it is not provided in this call.`),g(n.epochs!=null&&n.epochs>0&&Number.isInteger(n.epochs),()=>`For fitDataset(), config.epochs is expected to be a positive integer, but got ${n.epochs}`),g(!r||n.batchesPerEpoch>0&&Number.isInteger(n.batchesPerEpoch),()=>`For fitDataset(), config.batchesPerEpoch is expected to be a positive integer if specified, but got ${n.batchesPerEpoch}`),g(n.validationSplit==null,()=>"`validationSplit` is not supported by `fitDataset()`. Use validationData instead."),e.isTraining)throw Error(`Cannot start training because another fit() call is ongoing.`);e.isTraining=!0;try{let i=n.validationData!=null,a,o;if(i)if(aS(n.validationData))g(n.validationBatches==null||n.validationBatches>0&&Number.isInteger(n.validationBatches),()=>`For fitDataset() with dataset-based validation, config.validationBatches is expected not to be provided, or to be a positive integer, but got ${n.validationBatches}`);else{let e=nS(n.validationData);a=e.xs,o=e.ys}let s=e.makeTrainFunction(),c=e.getDedupedMetricsNames(),l;l=i?c.slice().concat(c.map(e=>`val_`+e)):c.slice();let{callbackList:u,history:d}=Jb(Kb(n.callbacks,n.yieldEvery),n.verbose==null?1:n.verbose,n.epochs,null,null,iS(t,n),null,i,l);u.setModel(e),e.history=d,await u.onTrainBegin(),e.stopTraining_=!1;let f=n.initialEpoch==null?0:n.initialEpoch,p=await t.iterator();for(;f<n.epochs;){let l={};await u.onEpochBegin(f);let d=0,m=0;for(r||(p=await t.iterator());!r||d<n.batchesPerEpoch;){let t=await p.next();if(r&&t.done){console.warn(`You provided \`batchesPerEpoch\` as ${n.batchesPerEpoch}, but your dataset iterator ran out of data after ${d} batches; interrupting training. Make sure that your dataset can generate at least \`batchesPerEpoch * epochs\` batches (in this case, ${n.batchesPerEpoch*n.epochs} batches). You may need to use the repeat() function when building your dataset.`);break}if(t.value!=null){let{xs:r,ys:i}=eS(e,t.value),a={};a.batch=m,a.size=r[0].shape[0],await u.onBatchBegin(m,a);let o=[];if(n.classWeight!=null){let t=Xx(n.classWeight,e.outputNames);for(let e=0;e<t.length;++e)o.push(await Zx(i[e],null,t[e]))}let l=r.concat(i).concat(o),f=s(l);L(l);for(let e=0;e<c.length;++e){let t=c[e],n=f[e];a[t]=n,ha(n)}await u.onBatchEnd(m,a),zb(a),m++,d++}if(r?d>=n.batchesPerEpoch:t.done){if(i){let t;t=aS(n.validationData)?uv(await e.evaluateDataset(n.validationData,{batches:n.validationBatches})):uv(e.evaluate(a,o,{batchSize:n.validationBatchSize==null?$x:n.validationBatchSize,verbose:0}));for(let n=0;n<e.metricsNames.length;++n)l[`val_${e.metricsNames[n]}`]=t[n]}break}if(e.stopTraining_)break}if(await u.onEpochEnd(f,l),f++,e.stopTraining_)break}return await u.onTrainEnd(),await e.history.syncData(),e.history}finally{e.isTraining=!1}}function iS(e,t){let n=null;return t.batchesPerEpoch==null?Number.isFinite(e.size)&&(n=e.size):n=t.batchesPerEpoch,n}function aS(e){return typeof e.iterator==`function`}function oS(e){return typeof e.next==`function`}async function sS(e,t,n){n||={};let r=n.batches!=null,i=e.testFunction,a=[];if(n.verbose>0)throw new J(`Verbose mode is not implemented yet.`);g(!r||n.batches>0&&Number.isInteger(n.batches),()=>`Test loop expects \`batches\` to be a positive integer, but received ${JSON.stringify(n.batches)}`);let o=oS(t)?t:await t.iterator(),s=0,c=0;for(;!r||c<n.batches;){let t=await o.next();if(a=I(()=>{if(t.value){let{xs:n,ys:r}=eS(e,t.value),o=n.concat(r),l=I(()=>i(o));if(L(o),c===0)for(let e=0;e<l.length;++e)a.push(il(0));let u=o[0].shape[0];for(let e=0;e<l.length;++e){let t=l[e],n=a[e];a[e]=I(()=>z(a[e],V(u,t))),c>0&&L(n)}L(l),s+=u,++c}return a}),t.done){r&&console.warn(`Your dataset iterator ran out of data during evaluateDataset(). Interrupting evalution. Make sure that your dataset can generate at least \`batches\` batches (in this case, ${n.batches} batches). You may need to use the repeat() function when building your dataset.`);break}}for(let e=0;e<a.length;++e){let t=a[e];a[e]=B(a[e],s),L(t)}return lv(a)}function cS(e){g(e>0&&Number.isInteger(e),()=>`batchSize is required to be a positive integer, but got ${e}`)}function lS(e,t,n){return e==null?[null]:Array.isArray(e)?e.map(e=>cy(e,t,n-t)):cy(e,t,n-t)}function uS(e,t){return I(()=>e==null?null:Array.isArray(e)?e.map(e=>uS(e,t)):gy(e,t.dtype===`int32`?t:R(t,`int32`)))}function dS(e,t){let n=[],r=0,i=null;for(;r<e;)i=r+t,i>=e&&(i=e),n.push([r,i]),r=i;return n}function fS(e){let t=[];e instanceof Oi&&(e=[e]);for(let n=0;n<e.length;++n){let r=e[n];if(r.rank===1)t.push(iy(r,1));else if(r.rank===0)throw Error(`Expected tensor to be at least 1D, but received a 0D tensor (scalar).`);else t.push(r)}return t}function pS(e,t){if(e==null)return;let n=[];if(t instanceof Oi)n.push(t.id);else if(Array.isArray(t))t.forEach(e=>n.push(e.id));else if(t!=null)for(let e in t){let r=t[e];n.push(r.id)}let r=[];if(e instanceof Oi)n.indexOf(e.id)===-1&&r.push(e);else if(Array.isArray(e))e.forEach(e=>{n.indexOf(e.id)===-1&&r.push(e)});else if(e!=null)for(let t in e){let i=e[t];n.indexOf(i.id)===-1&&r.push(i)}r.forEach(e=>{e.isDisposed||e.dispose()})}function mS(e){return e instanceof Oi}function hS(e){return Array.isArray(e)}function gS(e){return!mS(e)&&!hS(e)}function _S(e,t,n,r=!0,i=``){if(t==null||t.length===0){if(e!=null){let t=!1;if(hS(e)&&e.length>0)t=!0;else if(gS(e)){for(let n in e)if(e.hasOwnProperty(n)){t=!0;break}}else t=!0;if(t)throw new q(`Error when checking model ${i} expected no data, but got ${e}`)}return[]}if(e==null)return t.map(e=>null);let a;if(gS(e)){e=e,a=[];for(let n of t){if(e[n]==null)throw new q(`No data provided for "${n}". Need data for each key in: ${t}`);a.push(e[n])}}else if(hS(e)){if(e=e,e.length!==t.length)throw new q(`Error when checking model ${i}: the Array of Tensors that you are passing to your model is not the size the model expected. Expected to see ${t.length} Tensor(s), but instead got the following list of Tensor(s): ${e}`);a=e}else{if(e=e,t.length>1)throw new q(`The model ${i} expects ${t.length} Tensor(s), but only received one Tensor. Found: Tensor with shape ${e.shape}`);a=[e]}if(a=fS(a),n!=null)for(let e=0;e<t.length;++e){if(n[e]==null)continue;let o=a[e];if(o.shape.length!==n[e].length)throw new q(`Error when checking ${i}: expected ${t[e]} to have ${n[e].length} dimension(s). but got array with shape ${o.shape}`);for(let t=0;t<n[e].length;++t){if(t===0&&!r)continue;let a=o.shape[t],s=n[e][t];if(s!=null&&s>=0&&a!==s)throw new q(`${i} expected a batch of elements where each example has shape [${n[e].slice(1,n[e].length)}] (i.e.,tensor shape [*,${n[e].slice(1,n[e].length)}]) but the ${i} received an input with ${o.shape[0]} examples, each with shape [${o.shape.slice(1,o.shape.length)}] (tensor shape [${o.shape}])`)}}return a}function vS(e,t,n){let r=yv(e.map(e=>e.shape[0]));r.sort();let i=yv(t.map(e=>e.shape[0]));if(i.sort(),r.length>1)throw new q(`All input Tensors (x) should have the same number of samples. Got array shapes: ${JSON.stringify(e.map(e=>e.shape))}`);if(i.length>1)throw new q(`All target Tensors (y) should have the same number of samples. Got array shapes: ${JSON.stringify(t.map(e=>e.shape))}`);if(r.length>0&&i.length>0&&!b(r,i))throw new q(`Input Tensors should have the same number of samples as target Tensors. Found ${r[0]} input sample(s) and ${i[0]} target sample(s).`)}function yS(e,t,n){let r=[Zb,cx,ax];for(let i=0;i<e.length;++i){let a=e[i],o=t[i],s=n[i];if(o!=null){if(o===ax&&a.shape[a.shape.length-1]===1)throw new q(`You are passing a target array of shape ${a.shape} while using a loss 'categorical_crossentropy'. 'categorical_crossentropy'expects targets to be binary matrices (1s and 0s) of shape [samples, classes].`);if(r.indexOf(o)!==-1){let e=a.shape.slice(1),t=s.slice(1);for(let n=0;n<e.length;++n){let r=e[n],i=t[n];if(i!=null&&r!==i)throw new q(`A target Tensor with shape ${a.shape} was passed for an output of shape ${s}, while using a loss function that expects targets to have the same shape as the output.`)}}}}}function bS(e,t,n,r=!0,i=``){let a;if(Array.isArray(e)){if(e.length!==t.length)throw new q(`Error when checking model ${i}: the Array of Tensors that you are passing to your model is not the size the the model expected. Expected to see ${t.length} Tensor(s), but instead got ${e.length} Tensors(s).`);a=e}else{if(t.length>1)throw new q(`The model expects ${t.length} ${i} Tensors, but only received one Tensor. Found: array with shape ${JSON.stringify(e.shape)}.`);a=[e]}if(n!=null)for(let e=0;e<t.length;++e){if(n[e]==null)continue;let o=a[e];if(o.shape.length!==n[e].length)throw new q(`Error when checking ${i}: expected ${t[e]} to have ${n[e].length} dimension(s), but got array with shape ${JSON.stringify(o.shape)}`);for(let a=0;a<n[e].length;++a){if(a===0&&!r)continue;let s=o.shape[a],c=n[e][a];if(c!=null&&c!==s)throw new q(`Error when checking ${i}: expected ${t[e]} to have shape ${JSON.stringify(n[e])} but got array with shape ${JSON.stringify(o.shape)}.`)}}}function xS(e,t){if(e==null||Array.isArray(e)&&e.length===0)return t.map(e=>[]);let n;if(typeof e==`string`||typeof e==`function`)n=[e];else if(Array.isArray(e)||typeof e==`object`)n=e;else throw TypeError(`Type of metrics argument not understood. Expected an string,function, Array, or Object, found: ${e}`);if(Array.isArray(n))return t.map(e=>n);{let e=[];for(let r of t){let t=n.hasOwnProperty(r)?n[r]:[];Array.isArray(t)||(t=[t]),e.push(t)}return e}}var SS=`layers-model`,CS=class extends Jx{constructor(e){super(e),this.isTraining=!1}summary(e,t,n=console.log){if(!this.built)throw new q(`This model has never been called, thus its weights have not been created yet. So no summary can be displayed. Build the model first (e.g., by calling it on some test data).`);Lx(this,e,t,n)}compile(e){if(e.loss??=[],this.loss=e.loss,typeof e.optimizer==`string`)this.optimizer_=Nx(e.optimizer),this.isOptimizerOwned=!0;else{if(!(e.optimizer instanceof im))throw new q(`User-defined optimizer must be an instance of tf.Optimizer.`);this.optimizer_=e.optimizer,this.isOptimizerOwned=!1}let t=[];if(!Array.isArray(e.loss)&&typeof e.loss!=`string`&&typeof e.loss!=`function`){e.loss=e.loss;for(let t in e.loss)if(this.outputNames.indexOf(t)===-1)throw new q(`Unknown entry in loss dictionary: "${t}". Only expected the following keys: ${this.outputNames}`);for(let n of this.outputNames)e.loss[n]??console.warn(`Output "${n}" is missing from loss dictionary. We assume this was done on purpose, and we will not be expecting data to be passed to ${n} during training`),t.push(px(e.loss[n]))}else if(Array.isArray(e.loss)){if(e.loss.length!==this.outputs.length)throw new q(`When passing an Array as loss, it should have one entry per model output. The model has ${this.outputs.length} output(s), but you passed loss=${e.loss}.`);t=e.loss.map(e=>px(e))}else{let n=px(e.loss);this.outputs.forEach(e=>{t.push(n)})}this.lossFunctions=t,this.feedOutputNames=[],this.feedOutputShapes=[],this.feedLossFns=[];for(let e=0;e<this.outputs.length;++e){let t=this.internalOutputShapes[e],n=this.outputNames[e];this.feedOutputNames.push(n),this.feedOutputShapes.push(t),this.feedLossFns.push(this.lossFunctions[e])}let n=[];this.metrics=e.metrics,this.metricsNames=[`loss`],this.metricsTensors=[],Uv(`loss`,()=>{for(let e=0;e<this.outputs.length;++e){if(n.indexOf(e)!==-1)continue;let t=this.lossFunctions[e];this.outputs.length>1&&(this.metricsTensors.push([t,e]),this.metricsNames.push(this.outputNames[e]+`_loss`))}});let r=xS(e.metrics,this.outputNames),i=(e,t,n)=>{this.outputNames.length>1&&(t=this.outputNames[e]+`_`+t),this.metricsNames.push(t),this.metricsTensors.push([n,e])};Uv(`metric`,()=>{for(let e=0;e<this.outputs.length;++e)n.indexOf(e)===-1&&(t=>{let n,r,a;for(let o of t){if(typeof o==`string`&&[`accuracy`,`acc`,`crossentropy`,`ce`].indexOf(o)!==-1){let t=this.internalOutputShapes[e];t[t.length-1]===1||this.lossFunctions[e]===cx?[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(r=yx):r=mx:this.lossFunctions[e]===ox?[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(r=kx):r=bx:[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(r=Dx):r=hx;let i;[`accuracy`,`acc`].indexOf(o)===-1?[`crossentropy`,`ce`].indexOf(o)!==-1&&(i=`ce`):i=`acc`,a=r,n=``+i}else a=jx(o),n=``+Mx(o);let t;Uv(n,()=>{t=a}),i(e,n,t)}})(r[e])}),this.collectedTrainableWeights=this.trainableWeights}checkTrainableWeightsConsistency(){this.collectedTrainableWeights!=null&&this.trainableWeights.length!==this.collectedTrainableWeights.length&&console.warn("Discrepancy between trainableweights and collected trainable weights. Did you set `model.trainable` without calling `model.compile()` afterwards?")}evaluate(e,t,n={}){let r=n.batchSize==null?32:n.batchSize;cS(r);let i=this.standardizeUserDataXY(e,t,!0,r);try{let e=i[0].concat(i[1]);this.makeTestFunction();let t=this.testFunction;return lv(this.testLoop(t,e,r,n.verbose,n.steps))}finally{pS(i[0],e),pS(i[1],t)}}async evaluateDataset(e,t){return this.makeTestFunction(),sS(this,e,t)}checkNumSamples(e,t,n,r=`steps`){let i;if(n!=null){if(i=null,t!=null)throw new q(`If ${r} is set, batchSize must be null or undefined.Got batchSize = ${t}`)}else if(e!=null)i=Array.isArray(e)?e[0].shape[0]:e.shape[0];else throw new q(`Either the input data should have a defined shape, or ${r} shoud be specified.`);return i}execute(e,t){if(Array.isArray(t)&&t.length===0)throw new q("`outputs` is an empty Array, which is not allowed.");let n=Array.isArray(t),r=n?t:[t],i=this.retrieveSymbolicTensors(r),a=new yb;if(e instanceof Oi&&(e=[e]),Array.isArray(e)){if(e.length!==this.inputs.length)throw new q(`The number of inputs provided (${e.length}) does not match the number of inputs of this model (${this.inputs.length}).`);for(let t=0;t<this.inputs.length;++t)a.add(this.inputs[t],e[t])}else for(let t of this.inputs){let n=e[t.name];if(n==null)throw new q(`No value is provided for the model's input ${t.name}`);a.add(t,n)}let o=Cb(i,a);return n?o:o[0]}retrieveSymbolicTensors(e){let t=ov(null,e.length),n=e.length;for(let r of this.layers){let i=Array.isArray(r.output)?r.output:[r.output],a=i.map(e=>e.name);for(let r=0;r<e.length;++r){let o=a.indexOf(e[r]);if(o!==-1&&(t[r]=i[o],n--),n===0)break}if(n===0)break}if(n>0){let n=[];throw t.forEach((t,r)=>{t??n.push(e[r])}),new q(`Cannot find SymbolicTensors for output name(s): ${JSON.stringify(n)}`)}return t}predictLoop(e,t=32,n=!1){return I(()=>{let r=this.checkNumSamples(e);if(n)throw new J(`Verbose predictLoop() is not implemented yet.`);let i=dS(r,t),a=this.outputs.map(e=>[]);for(let t=0;t<i.length;++t)I(()=>{let n=i[t][0],r=i[t][1],a=lS(e,n,r),o=[];if(Array.isArray(a))for(let e=0;e<a.length;++e)o.push({key:this.inputs[e],value:a[e]});else o.push({key:this.inputs[0],value:a});let s=new yb(o);return Cb(this.outputs,s)}).forEach((e,t)=>a[t].push(e));return lv(a.map(e=>ps(e,0)))})}predict(e,t={}){let n=fS(e);bS(n,this.inputNames,this.feedInputShapes,!1);try{let e=t.batchSize==null?32:t.batchSize;return cS(e),this.predictLoop(n,e)}finally{pS(n,e)}}predictOnBatch(e){bS(e,this.inputNames,this.feedInputShapes,!0);let t=(Array.isArray(e)?e[0]:e).shape[0];return this.predictLoop(e,t)}standardizeUserDataXY(e,t,n=!0,r){if(this.optimizer_==null)throw new rv(`You must compile a model before training/testing. Use LayersModel.compile(modelCompileArgs).`);let i=[];for(let e=0;e<this.feedOutputShapes.length;++e){let t=this.feedOutputShapes[e];this.feedLossFns[e]===ox?i.push(t.slice(0,t.length-1).concat([1])):i.push(t)}if(e=_S(e,this.feedInputNames,this.feedInputShapes,!1,`input`),t=_S(t,this.feedOutputNames,i,!1,`target`),vS(e,t,null),yS(t,this.feedLossFns,this.feedOutputShapes),this.stateful&&r!=null&&r>0&&e[0].shape[0]%r!==0)throw new q(`In a stateful network, you should only pass inputs with a number of samples that is divisible by the batch size ${r}. Found: ${e[0].shape[0]} sample(s).`);return[e,t]}async standardizeUserData(e,t,n,r,i=!0,a){let[o,s]=this.standardizeUserDataXY(e,t,i,a);if(n!=null)throw Error(`sample weight is not supported yet.`);let c=null;if(r!=null){let e=Xx(r,this.outputNames);c=[];for(let t=0;t<e.length;++t)c.push(await Zx(s[t],null,e[t]))}return[o,s,c]}testLoop(e,t,n,r=0,i){return I(()=>{let a=this.checkNumSamples(t,n,i,`steps`),o=[];if(r>0)throw new J(`Verbose mode is not implemented yet.`);if(i!=null)throw new J(`steps mode in testLoop() is not implemented yet`);{let r=dS(a,n),i=bf($v(0,a));for(let n=0;n<r.length;++n){let a=r[n][0],s=r[n][1],c=e(uS(t,cy(i,a,s-a)));if(n===0)for(let e=0;e<c.length;++e)o.push(il(0));for(let e=0;e<c.length;++e){let t=c[e];o[e]=z(o[e],V(s-a,t))}}for(let e=0;e<o.length;++e)o[e]=B(o[e],a)}return o})}getDedupedMetricsNames(){let e=this.metricsNames,t=[];for(let n=0;n<e.length;++n){let r=e[n],i=r;if(cv(e,r)>1){let t=cv(e.slice(0,n),r);i+=`_${t}`}t.push(i)}return t}makeTrainFunction(){return e=>{let t=[],n=e.slice(0,this.inputs.length),r=e.slice(this.inputs.length,this.inputs.length+this.outputs.length),i=e.slice(this.inputs.length+this.outputs.length,this.inputs.length+this.outputs.length*2),a=[],o=()=>{let e=[];for(let t=0;t<this.inputs.length;++t)e.push({key:this.inputs[t],value:n[t]});let o=new yb(e),s=Cb(this.outputs,o,{training:!0}),c;for(let e=0;e<this.lossFunctions.length;++e){let n=this.lossFunctions[e],a=n(r[e],s[e]);i[e]!=null&&(a=Qx(a,i[e]));let o=Du(a);t.push(o),c=e===0?a:z(c,a)}for(let e=0;e<this.metricsTensors.length;++e){let n;if(this.outputs.length>1&&e<this.outputs.length)n=t[e];else{let t=this.metricsTensors[e][0],i=this.metricsTensors[e][1];n=Du(t(r[i],s[i]))}ha(n),a.push(n)}return c=Du(c),this.calculateLosses().forEach(e=>{c=z(c,e)}),c},s=this.collectedTrainableWeights.map(e=>e.read());return[this.optimizer_.minimize(o,!0,s)].concat(a)}}makeTestFunction(){this.testFunction=e=>I(()=>{let t=[],n,r=e.slice(0,this.inputs.length),i=e.slice(this.inputs.length,this.inputs.length+this.outputs.length),a=[];for(let e=0;e<this.inputs.length;++e)a.push({key:this.inputs[e],value:r[e]});let o=new yb(a),s=Cb(this.outputs,o);for(let e=0;e<this.lossFunctions.length;++e){let r=this.lossFunctions[e],a=Du(r(i[e],s[e]));n=e===0?a:z(n,a),t.push(n)}for(let e=0;e<this.metricsTensors.length;++e){let n=this.metricsTensors[e][0],r=this.metricsTensors[e][1],a=Du(n(i[r],s[r]));t.push(a)}return t})}async fit(e,t,n={}){if(this.isTraining)throw Error(`Cannot start training because another fit() call is ongoing.`);this.isTraining=!0;let r,i,a,o,s,c,l,u,d;try{let f=n.batchSize==null?32:n.batchSize;cS(f);let p=await this.standardizeUserData(e,t,n.sampleWeight,n.classWeight,!1,f);r=p[0],i=p[1],d=p[2];let m=!1,h;if(n.validationData!=null&&n.validationData.length>0){if(m=!0,n.validationData.length===2)s=n.validationData[0],c=n.validationData[1];else if(n.validationData.length===3)throw new J(`validationData including sample weights is not supported yet.`);else throw new q(`When passing validation data, it must contain 2 (valX, valY) or 3 (valX, valY, valSampleWeight) items; ${n.validationData} is invalid.`);let e=await this.standardizeUserData(s,c,null,null,!0,f);l=e[0],u=e[1],h=l.concat(u)}else if(n.validationSplit!=null&&n.validationSplit>0&&n.validationSplit<1){m=!0;let e=Math.floor(r[0].shape[0]*(1-n.validationSplit)),t=r[0].shape[0];l=lS(r,e,t),a=r,r=lS(r,0,e),u=lS(i,e,t),o=i,i=lS(i,0,e),h=l.concat(u)}else n.validationSteps!=null&&(m=!0);let g=r.concat(i).concat(d);this.checkTrainableWeightsConsistency();let _=this.makeTrainFunction(),v=this.getDedupedMetricsNames(),y,b;m?(this.makeTestFunction(),y=this.testFunction,b=v.slice().concat(v.map(e=>`val_`+e))):(y=null,h=[],b=v.slice());let x=Kb(n.callbacks,n.yieldEvery);return await this.fitLoop(_,g,v,f,n.epochs,n.verbose,x,y,h,n.shuffle,b,n.initialEpoch,null,null)}finally{this.isTraining=!1,pS(r,e),pS(i,t),pS(a,e),pS(o,t),pS(l,s),pS(u,c),d!=null&&L(d)}}async fitLoop(e,t,n,r,i,a,o,s,c,l,u,f,p,m){r??=32,i??=1,l??=!0,f??=0;let h=!1;if(s!=null&&c!=null&&(h=!0),m!=null&&(h=!0,p==null))throw new q("Can only use `validationSteps` when doing step-wise training, i.e., `stepsPerEpoch` must be set.");let g=this.checkNumSamples(t,r,p,`steps_per_epoch`),_;g!=null&&(_=$v(0,g)),a??=1;let{callbackList:v,history:y}=Jb(o,a,i,f,g,p,r,h,u);v.setModel(this),this.history=y,await v.onTrainBegin(),this.stopTraining_=!1;for(let a=f;a<i;++a){await v.onEpochBegin(a);let i={};if(p!=null)throw new J(`stepsPerEpoch mode is not implemented yet.`);{if(l===`batch`)throw new J(`batch shuffling is not implemneted yet`);l&&d(_);let a=bf(_),o=dS(g,r);for(let l=0;l<o.length;++l){let u={};if(await v.onBatchBegin(l,u),I(()=>{let d=o[l][0],f=o[l][1],p=cy(a,d,f-d);u.batch=l,u.size=f-d;let m=e(uS(t,p));for(let e=0;e<n.length;++e){let t=n[e],r=m[e];u[t]=r,ha(r)}if(l===o.length-1&&h){let e=this.testLoop(s,c,r);for(let t=0;t<n.length;++t){let r=n[t],a=e[t];ha(a),i[`val_`+r]=a}}}),await v.onBatchEnd(l,u),zb(u),this.stopTraining_)break}a.dispose()}if(await v.onEpochEnd(a,i),this.stopTraining_)break}return await v.onTrainEnd(),await this.history.syncData(),this.history}async fitDataset(e,t){return rS(this,e,t)}async trainOnBatch(e,t){let n=await this.standardizeUserData(e,t),r=n[0],i=n[1],a=this.makeTrainFunction()(r.concat(i)),o=[];for(let e of a){let t=await e.data();o.push(t[0])}return L(a),pS(n[0],e),pS(n[1],t),lv(o)}getNamedWeights(e){let t=[],n=e!=null&&e.trainableOnly,r=n?this.trainableWeights:this.weights,i=this.getWeights(n);for(let e=0;e<r.length;++e)n&&!r[e].trainable||t.push({name:r[e].originalName,tensor:i[e]});return t}set stopTraining(e){this.stopTraining_=e}get stopTraining(){return this.stopTraining_}get optimizer(){return this.optimizer_}set optimizer(e){this.optimizer_!==e&&(this.optimizer_=e,this.isOptimizerOwned=!1)}dispose(){let e=super.dispose();if(e.refCountAfterDispose===0&&this.optimizer!=null&&this.isOptimizerOwned){let t=ma().numTensors;this.optimizer_.dispose(),e.numDisposedVariables+=t-ma().numTensors}return e}getLossIdentifiers(){let e;if(typeof this.loss==`string`)e=dv(this.loss);else if(Array.isArray(this.loss)){for(let e of this.loss)if(typeof e!=`string`)throw Error(`Serialization of non-string loss is not supported.`);e=this.loss.map(e=>dv(e))}else{let t=Object.keys(this.loss);e={};let n=this.loss;for(let r of t)if(typeof n[r]==`string`)e[r]=dv(n[r]);else throw Error(`Serialization of non-string loss is not supported.`)}return e}getMetricIdentifiers(){if(typeof this.metrics==`string`||typeof this.metrics==`function`)return[dv(Mx(this.metrics))];if(Array.isArray(this.metrics))return this.metrics.map(e=>dv(Mx(e)));{let e={};for(let t in this.metrics)e[t]=dv(Mx(this.metrics[t]));return e}}getTrainingConfig(){return{loss:this.getLossIdentifiers(),metrics:this.getMetricIdentifiers(),optimizer_config:{class_name:this.optimizer.getClassName(),config:this.optimizer.getConfig()}}}loadTrainingConfig(e){if(e.weighted_metrics!=null)throw Error(`Loading weight_metrics is not supported yet.`);if(e.loss_weights!=null)throw Error(`Loading loss_weights is not supported yet.`);if(e.sample_weight_mode!=null)throw Error(`Loading sample_weight_mode is not supported yet.`);let t=Yb(Wx(e.optimizer_config)),n;if(typeof e.loss==`string`)n=fv(e.loss);else if(Array.isArray(e.loss))n=e.loss.map(e=>fv(e));else if(e.loss!=null){n={};for(let t in e.loss)n[t]=fv(e.loss[t])}let r;if(Array.isArray(e.metrics))r=e.metrics.map(e=>fv(e));else if(e.metrics!=null){r={};for(let t in e.metrics)r[t]=fv(e.metrics[t])}this.compile({loss:n,metrics:r,optimizer:t})}async save(e,t){if(typeof e==`string`){let t=Oa(e);if(t.length===0)throw new q(`Cannot find any save handlers for URL '${e}'`);if(t.length>1)throw new q(`Found more than one (${t.length}) save handlers for URL '${e}'`);e=t[0]}if(e.save==null)throw new q("LayersModel.save() cannot proceed because the IOHandler provided does not have the `save` attribute defined.");let n=await ya(this.getNamedWeights(t)),r={modelTopology:this.toJSON(null,!1),format:SS,generatedBy:`TensorFlow.js tfjs-layers v${Kx}`,convertedBy:null};if(t!=null&&t.includeOptimizer&&this.optimizer!=null){r.trainingConfig=this.getTrainingConfig();let{data:e,specs:t}=await ya(await this.optimizer.getWeights(),`optimizer`);n.specs.push(...t),n.data=Ta([n.data,e])}return this.userDefinedMetadata!=null&&(Fx(this.userDefinedMetadata,this.name,!0),r.userDefinedMetadata=this.userDefinedMetadata),r.weightData=n.data,r.weightSpecs=n.specs,e.save(r)}setUserDefinedMetadata(e){Fx(e,this.name),this.userDefinedMetadata=e}getUserDefinedMetadata(){return this.userDefinedMetadata}};CS.className=`Model`,K(CS);var wS=class extends CS{};wS.className=`Functional`,K(wS);var TS=class e extends CS{constructor(e){if(super({inputs:[],outputs:[]}),e||={},this.trainable=!0,this.built=!1,this.name=e.name==null?Av(`sequential_`):e.name,e.layers!=null)for(let t of e.layers)this.add(t)}checkShape(e){if(e.inboundNodes[0].outputTensors[0].shape.some(e=>e<0))throw new q(`Negative dimension size caused by adding layer ${e.name} with input shape [${e.inboundNodes[0].inputTensors[0].shape}]`)}add(t){let n=t instanceof e||t instanceof CS,r;if(n){if(r=t,r.outputs.length!==1)throw new q(`All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.`);if(r.inputs.length!==1)throw new q(`All layers in a Sequential model should have a single input tensor. For multi-input layers, use the functional API.`)}if(this.outputs.length===0){if(t.inboundNodes.length===0){if(t.batchInputShape==null)throw new q("The first layer in a Sequential model must get an `inputShape` or `batchInputShape` argument.");let e=_b({batchShape:t.batchInputShape,dtype:t.dtype,name:t.name+`_input`});t.apply(e)}if(n)this.outputs=r.outputs,this.inputs=r.inputs;else{if(t.inboundNodes.length!==1)throw new q(`A layer added to a Sequential model must not already be connected somewhere else. LayersModel received layer ${t.name} which has ${t.inboundNodes.length} pre-existing inbound connections.`);if(t.inboundNodes[0].outputTensors.length!==1)throw new q(`All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.`);this.checkShape(t),this.outputs=[t.inboundNodes[0].outputTensors[0]],this.inputs=pb(this.outputs[0])}this.inboundNodes=[],new cb({outboundLayer:this,inboundLayers:[],nodeIndices:[],tensorIndices:[],inputTensors:this.inputs,outputTensors:this.outputs,inputMasks:ov(null,this.inputs.length),outputMasks:[null],inputShapes:this.inputs.map(e=>e.shape),outputShapes:this.outputs[0].shape})}else{let e=t.apply(this.outputs[0]);if(Array.isArray(e))throw TypeError(`All layers in a Sequential model should have a single output tensor. For multi-output layers, use the functional API.`);this.checkShape(t),this.outputs=[e],this.inboundNodes[0].outputTensors=this.outputs,this.inboundNodes[0].outputShapes=[this.outputs[0].shape]}this.layers.push(t),this.built=!1}pop(){if(this.layers.length===0)throw TypeError(`There are no layers in the model.`);if(this.layers.pop(),this.layers.length===0)this.outputs=[],this.inboundNodes=[],this.outboundNodes=[];else{let e=this.layers.length-1;this.layers[e].outboundNodes=[],this.outputs=[this.layers[e].output],this.inboundNodes[0].outputTensors=this.outputs,this.inboundNodes[0].outputShapes=[this.outputs[0].shape]}}call(e,t){return this.model??this.build(),this.model.call(e,t)}build(e){if(Qy(e),this.inputs.length===0||this.outputs.length===0)throw TypeError(`Sequential model cannot be built: model is empty. Add some layers first.`);this.model=new CS({inputs:this.inputs,outputs:this.outputs[0],name:this.name+`_model`}),this.model.trainable=this.trainable,this.supportsMasking=this.model.supportsMasking,this.inputLayers=this.model.inputLayers,this.inputLayersNodeIndices=this.model.inputLayersNodeIndices,this.inputLayersTensorIndices=this.model.inputLayersTensorIndices,this.outputLayers=this.model.outputLayers,this.outputLayersNodeIndices=this.model.outputLayersNodeIndices,this.outputLayersTensorIndices=this.model.outputLayersTensorIndices,this.nodesByDepth=this.model.nodesByDepth,this.containerNodes=this.model.containerNodes,this.outputNames=this.model.outputNames,this.inputNames=this.model.inputNames,this.built=!0}countParams(){return this.built||this.build(),super.countParams()}summary(e,t,n=console.log){this.built||this.build(),super.summary(e,t,n)}setWeights(e){this.model??this.build(),this.model.setWeights(e)}evaluate(e,t,n={}){if(!this.built)throw new rv(`The model needs to be compiled before being used.`);return this.model.evaluate(e,t,n)}async evaluateDataset(e,t){if(!this.built)throw new rv(`The model needs to be compiled before being used.`);return this.model.evaluateDataset(e,t)}predict(e,t={}){return this.model??this.build(),this.model.predict(e,t)}predictOnBatch(e){return this.model??this.build(),this.model.predictOnBatch(e)}compile(e){this.build(),this.model.compile(e),this.optimizer_=this.model.optimizer,this.isOptimizerOwned=this.model.isOptimizerOwned,this.loss=this.model.loss,this.metrics=this.model.metrics,this.metricsTensors=this.model.metricsTensors,this.metricsNames=this.model.metricsNames}get optimizer(){return this.model==null?void 0:this.model.optimizer}set optimizer(e){this.model.optimizer=e}async fit(e,t,n={}){if(!this.built)throw new rv(`The model needs to be compiled before being used.`);return this.model.fit(e,t,n)}async fitDataset(e,t){if(!this.built)throw new rv(`The model needs to be compiled before being used.`);return this.model.fitDataset(e,t)}async trainOnBatch(e,t){return this.model.trainOnBatch(e,t)}static fromConfig(t,n,r={},i=!1){let a,o={};if(n instanceof Array){if(n[0].className==null||n[0].className===`Merge`)throw new q(`Legacy serialization format not supported yet.`);a=n}else g(n.layers!=null,()=>`When the config data for a Sequential model is not an Array, it must be an Object that contains the 'layers' field.`),a=n.layers,delete n.layers,o=n;let s=new t(o);if(!(s instanceof e))throw new J(`Sequential.fromConfig called on non-Sequential input: ${s}`);for(let e of a){let t=Yb(e,void 0,i);i&&t.setFastWeightInitDuringBuild(!0),s.add(t)}return s}set stopTraining(e){if(this.model==null)throw new q(`Cannot set the stopTraining property of a sequential model before it is compiled.`);this.model.stopTraining=e}get stopTraining(){if(this.model==null)throw new q(`Cannot get the stopTraining property of a sequential model before it is compiled.`);return this.model.stopTraining}getConfig(){let e=[];for(let t of this.layers){let n={};n.className=t.getClassName(),n.config=t.getConfig(),e.push(n)}return{name:this.name,layers:e}}};TS.className=`Sequential`,K(TS);var ES=class extends nm{getConfig(){return{}}},DS=class extends ES{apply(e,t=1){return by(e,t)}};DS.className=`elu`,K(DS);var OS=class extends ES{apply(e){return Md(e)}};OS.className=`selu`,K(OS);var kS=class extends ES{apply(e){return Sd(e)}};kS.className=`relu`,K(kS);var AS=class extends ES{apply(e){return I(()=>ju(6,Sd(e)))}};AS.className=`relu6`,K(AS);var jS=class extends ES{apply(e){return e}};jS.className=`linear`,K(jS);var MS=class extends ES{apply(e){return _s(e)}};MS.className=`sigmoid`,K(MS);var NS=class extends ES{apply(e){return Cy(e)}};NS.className=`hardSigmoid`,K(NS);var PS=class extends ES{apply(e){return iu(e)}};PS.className=`softplus`,K(PS);var FS=class extends ES{apply(e){return xy(e)}};FS.className=`softsign`,K(FS);var IS=class extends ES{apply(e){return xs(e)}};IS.className=`tanh`,K(IS);var LS=class extends ES{apply(e,t=-1){return Xd(e,t)}};LS.className=`softmax`,K(LS);var RS=class extends ES{apply(e,t=-1){return lu(e,t)}};RS.className=`logSoftmax`,K(RS);var zS=class extends ES{apply(e){return I(()=>I(()=>V(e,V(.5,z(1,Uc(B(e,Math.sqrt(2))))))))}};zS.className=`gelu`,K(zS);var BS=class extends ES{apply(e){return I(()=>V(.5,V(e,z(1,xs(V(ol(B(2,Math.PI)),z(e,V(.044715,rl(e,3)))))))))}};BS.className=`gelu_new`,K(BS);var VS=class extends ES{apply(e){return I(()=>V(e,xs(iu(e))))}};VS.className=`mish`,K(VS);var HS=class extends ES{apply(e,t=1){return I(()=>V(_s(V(e,t)),e))}};HS.className=`swish`,K(HS);function US(e){return e.getClassName()}function WS(e,t={}){return gv(e,rm.getMap().classNameMap,t,`activation`)}function GS(e){if(e==null){let e={};return e.className=`linear`,e.config={},WS(e)}if(typeof e==`string`){let t={};return t.className=e,t.config={},WS(t)}return e instanceof ES?e:WS(e)}function KS(e){if(e!=null&&typeof e!=`object`)throw Error(`Argument to L1L2 regularizer's constructor is expected to be an object, but received: ${e}`)}var qS=class extends nm{},JS=class extends qS{constructor(e){super(),KS(e),this.l1=e==null||e.l1==null?.01:e.l1,this.l2=e==null||e.l2==null?.01:e.l2,this.hasL1=this.l1!==0,this.hasL2=this.l2!==0}apply(e){return I(()=>{let t=Ou([1]);return this.hasL1&&(t=z(t,W(V(this.l1,yo(e))))),this.hasL2&&(t=z(t,W(V(this.l2,_y(e))))),H(t,[])})}getConfig(){return{l1:this.l1,l2:this.l2}}static fromConfig(e,t){return new e({l1:t.l1,l2:t.l2})}};JS.className=`L1L2`,K(JS);var YS={l1l2:`L1L2`};function XS(e){return mv(e)}function ZS(e,t={}){return gv(e,rm.getMap().classNameMap,t,`regularizer`)}function QS(e){return e==null?null:typeof e==`string`?ZS({className:e in YS?YS[e]:e,config:{}}):e instanceof qS?e:ZS(e)}var $S=class extends ub{constructor(e){super(e??{}),this.supportsMasking=!0,e!=null&&(this.maxValue=e.maxValue)}call(e,t){e=Y(e);let n=Sd(e);return this.maxValue!=null&&(n=Vs(n,0,this.maxValue)),n}computeOutputShape(e){return e}getConfig(){let e={maxValue:this.maxValue},t=super.getConfig();return Object.assign(e,t),e}};$S.className=`ReLU`,K($S);var eC=class extends ub{constructor(e){super(e??{}),this.DEFAULT_ALPHA=.3,e??={},this.alpha=e.alpha==null?this.DEFAULT_ALPHA:e.alpha}call(e,t){return Hl(Y(e),this.alpha)}computeOutputShape(e){return e}getConfig(){let e={alpha:this.alpha},t=super.getConfig();return Object.assign(e,t),e}};eC.className=`LeakyReLU`,K(eC);var tC=class extends ub{constructor(e){if(super(e??{}),this.DEFAULT_ALPHA_INITIALIZER=`zeros`,e??={},this.supportsMasking=!0,this.alphaInitializer=Yy(e.alphaInitializer||this.DEFAULT_ALPHA_INITIALIZER),this.alphaRegularizer=QS(e.alphaRegularizer),this.alphaConstraint=Lb(e.alphaConstraint),e.sharedAxes==null)this.sharedAxes=null;else if(Array.isArray(e.sharedAxes))this.sharedAxes=e.sharedAxes;else if(typeof e.sharedAxes==`number`)this.sharedAxes=[e.sharedAxes];else throw new q(`Expected sharedAxes to be a number or an array of numbers, but got ${e.sharedAxes}`)}build(e){e=Qy(e);let t=e.slice(1);if(this.sharedAxes!=null)for(let e of this.sharedAxes)t[e-1]=1;this.alpha=this.addWeight(`alpha`,t,`float32`,this.alphaInitializer,this.alphaRegularizer,!0,this.alphaConstraint);let n={};if(this.sharedAxes!=null)for(let t=1;t<e.length;++t)n[t]=e[t];this.inputSpec=[new ab({ndim:e.length,axes:n})],this.built=!0}call(e,t){return e=Y(e),$u(e,this.alpha.read())}getConfig(){let e={alphaInitializer:Jy(this.alphaInitializer),alphaRegularizer:XS(this.alphaRegularizer),alphaConstraint:Fb(this.alphaConstraint),sharedAxes:this.sharedAxes},t=super.getConfig();return Object.assign(e,t),e}};tC.className=`PReLU`,K(tC);var nC=class extends ub{constructor(e){if(super(e??{}),this.DEFAULT_ALPHA=1,e??={},e.alpha!=null&&e.alpha!==this.DEFAULT_ALPHA)throw new J(`Non-default alpha value (${e.alpha}) is not supported by the ELU layer yet.`);this.alpha=e.alpha==null?this.DEFAULT_ALPHA:e.alpha}call(e,t){return Vc(Y(e))}computeOutputShape(e){return e}getConfig(){let e={alpha:this.alpha},t=super.getConfig();return Object.assign(e,t),e}};nC.className=`ELU`,K(nC);var rC=class extends ub{constructor(e){super(e??{}),this.DEFAULT_THETA=1,e??={},this.theta=e.theta==null?this.DEFAULT_THETA:e.theta}call(e,t){let n=Y(e);return V(n,R(Al(n,this.theta),`float32`))}computeOutputShape(e){return e}getConfig(){let e={theta:this.theta},t=super.getConfig();return Object.assign(e,t),e}};rC.className=`ThresholdedReLU`,K(rC);var iC=class extends ub{constructor(e){super(e??{}),this.DEFAULT_AXIS=1,e??={},this.softmax=new LS().apply,this.axis=e.axis==null?this.DEFAULT_AXIS:e.axis}call(e,t){return I(()=>{let n=Y(e),r=t.mask;if(r!=null){let e=V(G(ku(n.shape),R(r,n.dtype)),il(-1e9));n=z(n,e)}return this.axis instanceof Array?this.axis.length>1?gl(G(n,du(n,this.axis,!0))):this.softmax(n,this.axis[0]):this.softmax(n,this.axis)})}computeOutputShape(e){return e}getConfig(){let e={axis:this.axis},t=super.getConfig();return Object.assign(e,t),e}};iC.className=`Softmax`,K(iC);function aC(e,t,n){if(typeof e==`number`)return ov(e,t);if(e.length!==t)throw new q(`The ${n} argument must be an integer or tuple of ${t} integers. Received: ${e.length} elements.`);for(let r=0;r<t;++r){let i=e[r];if(!Yv(i))throw new q(`The ${n} argument must be an integer or tuple of ${t} integers. Received: ${JSON.stringify(e)} including a non-integer number ${i}`)}return e}function oC(e,t,n,r,i=1){if(e==null)return e;let a=t+(t-1)*(i-1),o;return o=n===`same`?e:e-a+1,Math.floor((o+r-1)/r)}function sC(e,t,n,r){if(e==null)return null;if(r===`valid`)e=e*t+Qv([n-t,0]);else if(r===`same`)e*=t;else throw new q(`Unsupport padding mode: ${r}.`);return e}function cC(e,t){return I(()=>(Lv(t),t===`channelsFirst`?Rf(e,[0,2,3,1]):e))}function lC(e,t){return I(()=>(Lv(t),t===`channelsFirst`?Rf(e,[0,2,3,4,1]):e))}function uC(e,t,n,r=1,i=`valid`,a,o=1){return I(()=>{if(a??=ny(),Lv(a),e.shape.length!==3)throw new q(`The input of a conv1dWithBias operation should be 3, but is ${e.shape.length} instead.`);if(t.shape.length!==3)throw new q(`The kernel for a conv1dWithBias operation should be 3, but is ${t.shape.length} instead`);if(n!=null&&n.shape.length!==1)throw new q(`The bias for a conv1dWithBias operation should be 1, but is ${n.shape.length} instead`);if(a===`channelsFirst`&&(e=Rf(e,[0,2,1])),i===`causal`)throw new J(`The support for CAUSAL padding mode in conv1dWithBias is not implemented yet.`);let s=$s(e,t,r,i===`same`?`same`:`valid`,`NWC`,o);return n!=null&&(s=yy(s,n)),s})}function dC(e,t,n,r=[1,1],i=`valid`,a,o,s=null){return I(()=>{if(a??=ny(),Lv(a),e.rank!==3&&e.rank!==4)throw new q(`conv2dWithBiasActivation expects input to be of rank 3 or 4, but received ${e.rank}.`);if(t.rank!==3&&t.rank!==4)throw new q(`conv2dWithBiasActivation expects kernel to be of rank 3 or 4, but received ${e.rank}.`);let c=cC(e,a);if(i===`causal`)throw new J(`The support for CAUSAL padding mode in conv1dWithBias is not implemented yet.`);return c=Yf({x:c,filter:t,strides:r,pad:i===`same`?`same`:`valid`,dilations:o,dataFormat:`NHWC`,bias:n,activation:s}),a===`channelsFirst`&&(c=Rf(c,[0,3,1,2])),c})}function fC(e,t,n,r=[1,1,1],i=`valid`,a,o){return I(()=>{if(a??=ny(),Lv(a),e.rank!==4&&e.rank!==5)throw new q(`conv3dWithBias expects input to be of rank 4 or 5, but received ${e.rank}.`);if(t.rank!==4&&t.rank!==5)throw new q(`conv3dWithBias expects kernel to be of rank 4 or 5, but received ${e.rank}.`);let s=lC(e,a);if(i===`causal`)throw new J(`The support for CAUSAL padding mode in conv3dWithBias is not implemented yet.`);return s=ac(s,t,r,i===`same`?`same`:`valid`,`NDHWC`,o),n!=null&&(s=yy(s,n)),a===`channelsFirst`&&(s=Rf(s,[0,4,1,2,3])),s})}var pC=class e extends ub{constructor(t,n){if(super(n),this.bias=null,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,e.verifyArgs(n),this.rank=t,Cv(this.rank,`rank`),this.rank!==1&&this.rank!==2&&this.rank!==3)throw new J(`Convolution layer for rank other than 1, 2, or 3 (${this.rank}) is not implemented yet.`);if(this.kernelSize=aC(n.kernelSize,t,`kernelSize`),this.strides=aC(n.strides==null?1:n.strides,t,`strides`),this.padding=n.padding==null?`valid`:n.padding,zv(this.padding),this.dataFormat=n.dataFormat==null?`channelsLast`:n.dataFormat,Lv(this.dataFormat),this.activation=GS(n.activation),this.useBias=n.useBias==null||n.useBias,this.biasInitializer=Yy(n.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.biasConstraint=Lb(n.biasConstraint),this.biasRegularizer=QS(n.biasRegularizer),this.activityRegularizer=QS(n.activityRegularizer),this.dilationRate=aC(n.dilationRate==null?1:n.dilationRate,t,`dilationRate`),this.rank===1&&Array.isArray(this.dilationRate)&&this.dilationRate.length!==1)throw new q(`dilationRate must be a number or an array of a single number for 1D convolution, but received ${JSON.stringify(this.dilationRate)}`);if(this.rank===2){if(typeof this.dilationRate==`number`)this.dilationRate=[this.dilationRate,this.dilationRate];else if(this.dilationRate.length!==2)throw new q(`dilationRate must be a number or array of two numbers for 2D convolution, but received ${JSON.stringify(this.dilationRate)}`)}else if(this.rank===3){if(typeof this.dilationRate==`number`)this.dilationRate=[this.dilationRate,this.dilationRate,this.dilationRate];else if(this.dilationRate.length!==3)throw new q(`dilationRate must be a number or array of three numbers for 3D convolution, but received ${JSON.stringify(this.dilationRate)}`)}}static verifyArgs(e){if(sv(`kernelSize`in e,`required key 'kernelSize' not in config`),typeof e.kernelSize!=`number`&&!Sv(e.kernelSize,`number`,1,3))throw new q(`BaseConv expects config.kernelSize to be number or number[] with length 1, 2, or 3, but received ${JSON.stringify(e.kernelSize)}.`)}getConfig(){let e={kernelSize:this.kernelSize,strides:this.strides,padding:this.padding,dataFormat:this.dataFormat,dilationRate:this.dilationRate,activation:US(this.activation),useBias:this.useBias,biasInitializer:Jy(this.biasInitializer),biasRegularizer:XS(this.biasRegularizer),activityRegularizer:XS(this.activityRegularizer),biasConstraint:Fb(this.biasConstraint)},t=super.getConfig();return Object.assign(e,t),e}},mC=class e extends pC{constructor(t,n){super(t,n),this.kernel=null,e.verifyArgs(n),this.filters=n.filters,Cv(this.filters,`filters`),this.kernelInitializer=Yy(n.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.kernelConstraint=Lb(n.kernelConstraint),this.kernelRegularizer=QS(n.kernelRegularizer)}build(e){e=Qy(e);let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null)throw new q(`The channel dimension of the input should be defined. Found ${e[t]}`);let n=e[t],r=this.kernelSize.concat([n,this.filters]);this.kernel=this.addWeight(`kernel`,r,null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.filters],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[{ndim:this.rank+2,axes:{[t]:n}}],this.built=!0}call(e,t){return I(()=>{e=Y(e);let t,n=this.bias==null?null:this.bias.read(),r=Ev(this.activation.getClassName());if(r!=null&&this.rank===2)t=dC(e,this.kernel.read(),n,this.strides,this.padding,this.dataFormat,this.dilationRate,r);else{if(this.rank===1)t=uC(e,this.kernel.read(),n,this.strides[0],this.padding,this.dataFormat,this.dilationRate[0]);else if(this.rank===2)t=dC(e,this.kernel.read(),n,this.strides,this.padding,this.dataFormat,this.dilationRate);else if(this.rank===3)t=fC(e,this.kernel.read(),n,this.strides,this.padding,this.dataFormat,this.dilationRate);else throw new J(`convolutions greater than 3D are not implemented yet.`);this.activation!=null&&(t=this.activation.apply(t))}return t})}computeOutputShape(e){e=Qy(e);let t=[],n=this.dataFormat===`channelsLast`?e.slice(1,e.length-1):e.slice(2);for(let e=0;e<n.length;++e){let r=oC(n[e],this.kernelSize[e],this.padding,this.strides[e],typeof this.dilationRate==`number`?this.dilationRate:this.dilationRate[e]);t.push(r)}let r=[e[0]];return this.dataFormat===`channelsLast`?(r=r.concat(t),r.push(this.filters)):(r.push(this.filters),r=r.concat(t)),r}getConfig(){let e={filters:this.filters,kernelInitializer:Jy(this.kernelInitializer),kernelRegularizer:XS(this.kernelRegularizer),kernelConstraint:Fb(this.kernelConstraint)},t=super.getConfig();return Object.assign(e,t),e}static verifyArgs(e){if(!(`filters`in e)||typeof e.filters!=`number`||e.filters<1)throw new q(`Convolution layer expected config.filters to be a 'number' > 0 but got ${JSON.stringify(e.filters)}`)}},hC=class e extends mC{constructor(t){super(2,t),e.verifyArgs(t)}getConfig(){let e=super.getConfig();return delete e.rank,e}static verifyArgs(e){if(typeof e.kernelSize!=`number`&&!Sv(e.kernelSize,`number`,1,2))throw new q(`Conv2D expects config.kernelSize to be number or number[] with length 1 or 2, but received ${JSON.stringify(e.kernelSize)}.`)}};hC.className=`Conv2D`,K(hC);var gC=class e extends mC{constructor(t){super(3,t),e.verifyArgs(t)}getConfig(){let e=super.getConfig();return delete e.rank,e}static verifyArgs(e){if(typeof e.kernelSize!=`number`&&!(Array.isArray(e.kernelSize)&&(e.kernelSize.length===1||e.kernelSize.length===3)))throw new q(`Conv3D expects config.kernelSize to be number or [number, number, number], but received ${JSON.stringify(e.kernelSize)}.`)}};gC.className=`Conv3D`,K(gC);var _C=class extends hC{constructor(e){if(super(e),this.inputSpec=[new ab({ndim:4})],this.padding!==`same`&&this.padding!==`valid`)throw new q(`Conv2DTranspose currently supports only padding modes 'same' and 'valid', but received padding mode ${this.padding}`)}build(e){if(e=Qy(e),e.length!==4)throw new q(`Input should have rank 4; Received input shape: `+JSON.stringify(e));let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null)throw new q("The channel dimension of the inputs should be defined. Found `None`.");let n=e[t],r=this.kernelSize.concat([this.filters,n]);this.kernel=this.addWeight(`kernel`,r,`float32`,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.filters],`float32`,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[new ab({ndim:4,axes:{[t]:n}})],this.built=!0}call(e,t){return I(()=>{let t=Y(e);if(t.shape.length!==4)throw new q(`Conv2DTranspose.call() expects input tensor to be rank-4, but received a tensor of rank-${t.shape.length}`);let n=t.shape,r=n[0],i,a;this.dataFormat===`channelsFirst`?(i=2,a=3):(i=1,a=2);let o=n[i],s=n[a],c=this.kernelSize[0],l=this.kernelSize[1],u=this.strides[0],d=this.strides[1],f=[r,sC(o,u,c,this.padding),sC(s,d,l,this.padding),this.filters];this.dataFormat!==`channelsLast`&&(t=Rf(t,[0,2,3,1]));let p=rc(t,this.kernel.read(),f,this.strides,this.padding);return this.dataFormat!==`channelsLast`&&(p=Rf(p,[0,3,1,2])),this.bias!=null&&(p=yy(p,this.bias.read(),this.dataFormat)),this.activation!=null&&(p=this.activation.apply(p)),p})}computeOutputShape(e){e=Qy(e);let t=e.slice(),n,r,i;this.dataFormat===`channelsFirst`?(n=1,r=2,i=3):(n=3,r=1,i=2);let a=this.kernelSize[0],o=this.kernelSize[1],s=this.strides[0],c=this.strides[1];return t[n]=this.filters,t[r]=sC(t[r],s,a,this.padding),t[i]=sC(t[i],c,o,this.padding),t}getConfig(){let e=super.getConfig();return delete e.dilationRate,e}};_C.className=`Conv2DTranspose`,K(_C);var vC=class extends gC{constructor(e){if(super(e),this.inputSpec=[new ab({ndim:5})],this.padding!==`same`&&this.padding!==`valid`)throw new q(`Conv3DTranspose currently supports only padding modes 'same' and 'valid', but received padding mode ${this.padding}`)}build(e){if(e=Qy(e),e.length!==5)throw new q(`Input should have rank 5; Received input shape: `+JSON.stringify(e));let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null)throw new q("The channel dimension of the inputs should be defined. Found `None`.");let n=e[t],r=this.kernelSize.concat([this.filters,n]);this.kernel=this.addWeight(`kernel`,r,`float32`,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.filters],`float32`,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint)),this.inputSpec=[new ab({ndim:5,axes:{[t]:n}})],this.built=!0}call(e,t){return I(()=>{let t=Y(e);if(t.shape.length!==5)throw new q(`Conv3DTranspose.call() expects input tensor to be rank-4, but received a tensor of rank-${t.shape.length}`);let n=t.shape,r=n[0],i,a,o;this.dataFormat===`channelsFirst`?(o=2,i=3,a=4):(o=1,i=2,a=3);let s=n[o],c=n[i],l=n[a],u=this.kernelSize[0],d=this.kernelSize[1],f=this.kernelSize[2],p=this.strides[0],m=this.strides[1],h=this.strides[2],g=[r,sC(s,p,u,this.padding),sC(c,m,d,this.padding),sC(l,h,f,this.padding),this.filters];this.dataFormat!==`channelsLast`&&(t=Rf(t,[0,2,3,4,1]));let _=lc(t,this.kernel.read(),g,this.strides,this.padding);return this.dataFormat!==`channelsLast`&&(_=Rf(_,[0,4,1,2,3])),this.bias!==null&&(_=yy(_,this.bias.read(),this.dataFormat)),this.activation!==null&&(_=this.activation.apply(_)),_})}computeOutputShape(e){e=Qy(e);let t=e.slice(),n,r,i,a;this.dataFormat===`channelsFirst`?(n=1,r=2,i=3,a=4):(n=4,r=1,i=2,a=3);let o=this.kernelSize[0],s=this.kernelSize[1],c=this.kernelSize[2],l=this.strides[0],u=this.strides[1],d=this.strides[2];return t[n]=this.filters,t[r]=sC(t[r],l,o,this.padding),t[i]=sC(t[i],u,s,this.padding),t[a]=sC(t[a],d,c,this.padding),t}getConfig(){let e=super.getConfig();return delete e.dilationRate,e}};vC.className=`Conv3DTranspose`,K(vC);var yC=class extends mC{constructor(e,t){if(super(e,t),this.DEFAULT_DEPTHWISE_INITIALIZER=`glorotUniform`,this.DEFAULT_POINTWISE_INITIALIZER=`glorotUniform`,this.depthwiseKernel=null,this.pointwiseKernel=null,t.filters==null)throw new q("The `filters` configuration field is required by SeparableConv, but is unspecified.");if(t.kernelInitializer!=null||t.kernelRegularizer!=null||t.kernelConstraint!=null)throw new q(`Fields kernelInitializer, kernelRegularizer and kernelConstraint are invalid for SeparableConv2D. Use depthwiseInitializer, depthwiseRegularizer, depthwiseConstraint, pointwiseInitializer, pointwiseRegularizer and pointwiseConstraint instead.`);if(t.padding!=null&&t.padding!==`same`&&t.padding!==`valid`)throw new q(`SeparableConv${this.rank}D supports only padding modes: 'same' and 'valid', but received ${JSON.stringify(t.padding)}`);this.depthMultiplier=t.depthMultiplier==null?1:t.depthMultiplier,this.depthwiseInitializer=Yy(t.depthwiseInitializer||this.DEFAULT_DEPTHWISE_INITIALIZER),this.depthwiseRegularizer=QS(t.depthwiseRegularizer),this.depthwiseConstraint=Lb(t.depthwiseConstraint),this.pointwiseInitializer=Yy(t.depthwiseInitializer||this.DEFAULT_POINTWISE_INITIALIZER),this.pointwiseRegularizer=QS(t.pointwiseRegularizer),this.pointwiseConstraint=Lb(t.pointwiseConstraint)}build(e){if(e=Qy(e),e.length<this.rank+2)throw new q(`Inputs to SeparableConv${this.rank}D should have rank ${this.rank+2}, but received input shape: ${JSON.stringify(e)}`);let t=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[t]==null||e[t]<0)throw new q(`The channel dimension of the inputs should be defined, but found ${JSON.stringify(e[t])}`);let n=e[t],r=this.kernelSize.concat([n,this.depthMultiplier]),i=[];for(let e=0;e<this.rank;++e)i.push(1);i.push(n*this.depthMultiplier,this.filters),this.depthwiseKernel=this.addWeight(`depthwise_kernel`,r,`float32`,this.depthwiseInitializer,this.depthwiseRegularizer,!0,this.depthwiseConstraint),this.pointwiseKernel=this.addWeight(`pointwise_kernel`,i,`float32`,this.pointwiseInitializer,this.pointwiseRegularizer,!0,this.pointwiseConstraint),this.bias=this.useBias?this.addWeight(`bias`,[this.filters],`float32`,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.inputSpec=[new ab({ndim:this.rank+2,axes:{[t]:n}})],this.built=!0}call(e,t){return I(()=>{e=Y(e);let t;if(this.rank===1)throw new J(`1D separable convolution is not implemented yet.`);return this.rank===2&&(this.dataFormat===`channelsFirst`&&(e=Rf(e,[0,2,3,1])),t=Pd(e,this.depthwiseKernel.read(),this.pointwiseKernel.read(),this.strides,this.padding,this.dilationRate,`NHWC`)),this.useBias&&(t=yy(t,this.bias.read(),this.dataFormat)),this.activation!=null&&(t=this.activation.apply(t)),this.dataFormat===`channelsFirst`&&(t=Rf(t,[0,3,1,2])),t})}getConfig(){let e=super.getConfig();return delete e.rank,delete e.kernelInitializer,delete e.kernelRegularizer,delete e.kernelConstraint,e.depthwiseInitializer=Jy(this.depthwiseInitializer),e.pointwiseInitializer=Jy(this.pointwiseInitializer),e.depthwiseRegularizer=XS(this.depthwiseRegularizer),e.pointwiseRegularizer=XS(this.pointwiseRegularizer),e.depthwiseConstraint=Fb(this.depthwiseConstraint),e.pointwiseConstraint=Fb(this.pointwiseConstraint),e}};yC.className=`SeparableConv`;var bC=class extends yC{constructor(e){super(2,e)}};bC.className=`SeparableConv2D`,K(bC);var xC=class e extends mC{constructor(t){super(1,t),e.verifyArgs(t),this.inputSpec=[{ndim:3}]}getConfig(){let e=super.getConfig();return delete e.rank,delete e.dataFormat,e}static verifyArgs(e){if(typeof e.kernelSize!=`number`&&!Sv(e.kernelSize,`number`,1,1))throw new q(`Conv1D expects config.kernelSize to be number or number[] with length 1, but received ${JSON.stringify(e.kernelSize)}.`)}};xC.className=`Conv1D`,K(xC);var SC=class extends ub{constructor(e){super(e),this.cropping=typeof e.cropping==`number`?[[e.cropping,e.cropping],[e.cropping,e.cropping]]:typeof e.cropping[0]==`number`?[[e.cropping[0],e.cropping[0]],[e.cropping[1],e.cropping[1]]]:e.cropping,this.dataFormat=e.dataFormat===void 0?`channelsLast`:e.dataFormat,this.inputSpec=[{ndim:4}]}computeOutputShape(e){return this.dataFormat===`channelsFirst`?[e[0],e[1],e[2]-this.cropping[0][0]-this.cropping[0][1],e[3]-this.cropping[1][0]-this.cropping[1][1]]:[e[0],e[1]-this.cropping[0][0]-this.cropping[0][1],e[2]-this.cropping[1][0]-this.cropping[1][1],e[3]]}call(e,t){return I(()=>(e=Y(e),this.dataFormat===`channelsLast`?uy(uy(e,this.cropping[0][0],e.shape[1]-this.cropping[0][0]-this.cropping[0][1],2),this.cropping[1][0],e.shape[2]-this.cropping[1][1]-this.cropping[1][0],3):uy(uy(e,this.cropping[0][0],e.shape[2]-this.cropping[0][0]-this.cropping[0][1],3),this.cropping[1][0],e.shape[3]-this.cropping[1][1]-this.cropping[1][0],4)))}getConfig(){let e={cropping:this.cropping,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}};SC.className=`Cropping2D`,K(SC);var CC=class extends ub{constructor(e){super(e),this.DEFAULT_SIZE=[2,2],this.inputSpec=[{ndim:4}],this.size=e.size==null?this.DEFAULT_SIZE:e.size,this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Lv(this.dataFormat),this.interpolation=e.interpolation==null?`nearest`:e.interpolation,Rv(this.interpolation)}computeOutputShape(e){if(this.dataFormat===`channelsFirst`){let t=e[2]==null?null:this.size[0]*e[2],n=e[3]==null?null:this.size[1]*e[3];return[e[0],e[1],t,n]}{let t=e[1]==null?null:this.size[0]*e[1],n=e[2]==null?null:this.size[1]*e[2];return[e[0],t,n,e[3]]}}call(e,t){return I(()=>{let t=Y(e),n=t.shape;if(this.dataFormat===`channelsFirst`){t=Rf(t,[0,2,3,1]);let e=this.size[0]*n[2],r=this.size[1]*n[3];return Rf(this.interpolation===`nearest`?Qp.resizeNearestNeighbor(t,[e,r]):Qp.resizeBilinear(t,[e,r]),[0,3,1,2])}{let e=this.size[0]*n[1],r=this.size[1]*n[2];return this.interpolation===`nearest`?Qp.resizeNearestNeighbor(t,[e,r]):Qp.resizeBilinear(t,[e,r])}})}getConfig(){let e={size:this.size,dataFormat:this.dataFormat,interpolation:this.interpolation},t=super.getConfig();return Object.assign(e,t),e}};CC.className=`UpSampling2D`,K(CC);function wC(e,t,n=[1,1],r=`valid`,i,a){return I(()=>{i??=ny(),Lv(i);let o=cC(e,i);if(e.rank!==4)throw new q(`Input for depthwiseConv2d is required to be 4-D, but is instead ${e.rank}-D`);if(t.rank!==4)throw new q(`depthwiseKernel is required to be 4-D, but is instead ${t.rank}-D`);return o=Cc(o,t,n,r===`same`?`same`:`valid`,`NHWC`,a),i===`channelsFirst`&&(o=Rf(o,[0,3,1,2])),o})}var TC=class extends pC{constructor(e){super(2,e),this.depthwiseKernel=null,this.depthMultiplier=e.depthMultiplier==null?1:e.depthMultiplier,this.depthwiseInitializer=Yy(e.depthwiseInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.depthwiseConstraint=Lb(e.depthwiseConstraint),this.depthwiseRegularizer=QS(e.depthwiseRegularizer)}build(e){if(e=Qy(e),e.length<4)throw new q(`Inputs to DepthwiseConv2D should have rank 4. Received input shape: ${JSON.stringify(e)}.`);let t=this.dataFormat===`channelsFirst`?1:3;if(e[t]==null||e[t]<0)throw new q(`The channel dimension of the inputs to DepthwiseConv2D should be defined, but is not (${e[t]}).`);let n=e[t],r=[this.kernelSize[0],this.kernelSize[1],n,this.depthMultiplier];this.depthwiseKernel=this.addWeight(`depthwise_kernel`,r,null,this.depthwiseInitializer,this.depthwiseRegularizer,!0,this.depthwiseConstraint),this.bias=this.useBias?this.addWeight(`bias`,[n*this.depthMultiplier],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.built=!0}call(e,t){return I(()=>{e=Y(e);let t=wC(e,this.depthwiseKernel.read(),this.strides,this.padding,this.dataFormat,null);return this.useBias&&(t=yy(t,this.bias.read(),this.dataFormat)),this.activation!=null&&(t=this.activation.apply(t)),t})}computeOutputShape(e){e=Qy(e);let t=this.dataFormat===`channelsFirst`?e[2]:e[1],n=this.dataFormat===`channelsFirst`?e[3]:e[2],r=this.dataFormat===`channelsFirst`?e[1]*this.depthMultiplier:e[3]*this.depthMultiplier,i=oC(t,this.kernelSize[0],this.padding,this.strides[0]),a=oC(n,this.kernelSize[1],this.padding,this.strides[1]);return this.dataFormat===`channelsFirst`?[e[0],r,i,a]:[e[0],i,a,r]}getConfig(){let e=super.getConfig();return e.depthMultiplier=this.depthMultiplier,e.depthwiseInitializer=Jy(this.depthwiseInitializer),e.depthwiseRegularizer=XS(this.depthwiseRegularizer),e.depthwiseConstraint=Fb(this.depthwiseRegularizer),e}};TC.className=`DepthwiseConv2D`,K(TC);function EC(e,t,n,r){if(Array.isArray(e)){if(t!=null||n!=null)throw new q(`When inputs is an array, neither initialState or constants should be provided`);r!=null&&(n=e.slice(e.length-r,e.length),e=e.slice(0,e.length-r)),e.length>1&&(t=e.slice(1,e.length)),e=e[0]}function i(e){return e==null||Array.isArray(e)?e:[e]}return t=i(t),n=i(n),{inputs:e,initialState:t,constants:n}}function DC(e,t,n,r=!1,i,a,o=!1,s=!1){return I(()=>{let c=t.shape.length;if(c<3)throw new q(`Input should be at least 3D, but is ${c}D.`);let l=[1,0].concat($v(2,c));if(t=Rf(t,l),a!=null)throw new J(`The rnn() functoin of the deeplearn.js backend does not support constants yet.`);o&&console.warn(`Backend rnn(): the unroll = true option is not applicable to the imperative deeplearn.js backend.`),i!=null&&(i=R(R(i,`bool`),`float32`),i.rank===c-1&&(i=vl(i,-1)),i=Rf(i,l)),r&&(t=Ed(t,0),i!=null&&(i=Ed(i,0)));let u=[],d,f=n,p=t.shape[0],m=Pf(t),h;i!=null&&(h=Pf(i));for(let t=0;t<p;++t){let n=m[t],r=I(()=>e(n,f));if(i==null)d=r[0],f=r[1];else{let e=I(()=>{let e=h[t],n=G(Uu(e),e);return{output:z(V(r[0],e),V(f[0],n)),newStates:f.map((t,i)=>z(V(r[1][i],e),V(t,n)))}});d=e.output,f=e.newStates}s&&u.push(d)}let g;return s&&(g=pf(u,1)),[d,g,f]})}var OC=class e extends ub{constructor(e){super(e);let t;if(e.cell==null)throw new q(`cell property is missing for the constructor of RNN.`);if(t=Array.isArray(e.cell)?new IC({cells:e.cell}):e.cell,t.stateSize==null)throw new q("The RNN cell should have an attribute `stateSize` (tuple of integers, one integer per RNN state).");this.cell=t,this.returnSequences=e.returnSequences!=null&&e.returnSequences,this.returnState=e.returnState!=null&&e.returnState,this.goBackwards=e.goBackwards!=null&&e.goBackwards,this._stateful=e.stateful!=null&&e.stateful,this.unroll=e.unroll!=null&&e.unroll,this.supportsMasking=!0,this.inputSpec=[new ab({ndim:3})],this.stateSpec=null,this.states_=null,this.numConstants=null,this.keptStates=[]}getStates(){return this.states_==null?$v(0,Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1).map(e=>null):this.states_}setStates(e){this.states_=e}computeOutputShape(e){Xy(e)&&(e=e[0]),e=e;let t=this.cell.stateSize;Array.isArray(t)||(t=[t]);let n=t[0],r;if(r=this.returnSequences?[e[0],e[1],n]:[e[0],n],this.returnState){let n=[];for(let r of t)n.push([e[0],r]);return[r].concat(n)}return r}computeMask(e,t){return I(()=>{Array.isArray(t)&&(t=t[0]);let e=this.returnSequences?t:null;if(this.returnState){let t=this.states.map(e=>null);return[e].concat(t)}return e})}get states(){if(this.states_==null){let e=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1,t=[];for(let n=0;n<e;++n)t.push(null);return t}return this.states_}set states(e){this.states_=e}build(e){if(this.numConstants!=null)throw new J(`Constants support is not implemented in RNN yet.`);Xy(e)&&(e=e[0]),e=e;let t=this.stateful?e[0]:null,n=e.slice(2);this.inputSpec[0]=new ab({shape:[t,null,...n]});let r=[e[0]].concat(e.slice(2));this.cell.build(r);let i;if(i=Array.isArray(this.cell.stateSize)?this.cell.stateSize:[this.cell.stateSize],this.stateSpec!=null){if(!b(this.stateSpec.map(e=>e.shape[e.shape.length-1]),i))throw new q(`An initialState was passed that is not compatible with cell.stateSize. Received stateSpec=${this.stateSpec}; However cell.stateSize is ${this.cell.stateSize}`)}else this.stateSpec=i.map(e=>new ab({shape:[null,e]}));this.stateful&&this.resetStates()}resetStates(e,t=!1){I(()=>{if(!this.stateful)throw new nv(`Cannot call resetStates() on an RNN Layer that is not stateful.`);let n=this.inputSpec[0].shape[0];if(n==null)throw new q("If an RNN is stateful, it needs to know its batch size. Specify the batch size of your input tensors: \n- If using a Sequential model, specify the batch size by passing a `batchInputShape` option to your first layer.\n- If using the functional API, specify the batch size by passing a `batchShape` option to your Input layer.");if(this.states_==null)this.states_=Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(e=>Ou([n,e])):[Ou([n,this.cell.stateSize])];else if(e==null)L(this.states_),this.keptStates!=null&&(L(this.keptStates),this.keptStates=[]),Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(e=>Ou([n,e])):this.states_[0]=Ou([n,this.cell.stateSize]);else{if(Array.isArray(e)||(e=[e]),e.length!==this.states_.length)throw new q(`Layer ${this.name} expects ${this.states_.length} state(s), but it received ${e.length} state value(s). Input received: ${e}`);t===!0?this.keptStates.push(this.states_.slice()):L(this.states_);for(let t=0;t<this.states_.length;++t){let r=e[t],i=[n,Array.isArray(this.cell.stateSize)?this.cell.stateSize[t]:this.cell.stateSize];if(!b(r.shape,i))throw new q(`State ${t} is incompatible with layer ${this.name}: expected shape=${i}, received shape=${r.shape}`);this.states_[t]=r}}this.states_=this.states_.map(e=>ha(e.clone()))})}apply(e,t){let n=t==null?null:t.initialState,r=t==null?null:t.constants;t??={};let i=EC(e,n,r,this.numConstants);e=i.inputs,n=i.initialState,r=i.constants;let a=[],o=[];if(n!=null){t.initialState=n,a=a.concat(n),this.stateSpec=[];for(let e of n)this.stateSpec.push(new ab({shape:e.shape}));o=o.concat(this.stateSpec)}if(r!=null&&(t.constants=r,a=a.concat(r),this.numConstants=r.length),a[0]instanceof ob){let n=[e].concat(a),r=this.inputSpec.concat(o),i=this.inputSpec;this.inputSpec=r;let s=super.apply(n,t);return this.inputSpec=i,s}return super.apply(e,t)}call(e,t){return I(()=>{let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;e=Y(e),i??=this.stateful?this.states_:this.getInitialState(e);let a=Array.isArray(this.cell.stateSize)?this.cell.stateSize.length:1;if(i.length!==a)throw new q(`RNN Layer has ${a} state(s) but was passed ${i.length} initial state(s).`);this.unroll&&console.warn(`Ignoring unroll = true for RNN layer, due to imperative backend.`);let o={training:r},s=DC((e,t)=>{let n=this.cell.call([e].concat(t),o);return[n[0],n.slice(1)]},e,i,this.goBackwards,n,null,this.unroll,this.returnSequences),c=s[0],l=s[1],u=s[2];this.stateful&&this.resetStates(u,r);let d=this.returnSequences?l:c;return this.returnState?[d].concat(u):d})}getInitialState(e){return I(()=>{let t=Ou(e.shape);return t=W(t,[1,2]),t=iy(t),Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(e=>e>1?py(t,[1,e]):t):this.cell.stateSize>1?[py(t,[1,this.cell.stateSize])]:[t]})}get trainableWeights(){return this.trainable?this.cell.trainableWeights:[]}get nonTrainableWeights(){return this.trainable?this.cell.nonTrainableWeights:this.cell.weights}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.cell!=null&&this.cell.setFastWeightInitDuringBuild(e)}getConfig(){let t=super.getConfig(),n={returnSequences:this.returnSequences,returnState:this.returnState,goBackwards:this.goBackwards,stateful:this.stateful,unroll:this.unroll};this.numConstants!=null&&(n.numConstants=this.numConstants);let r=this.cell.getConfig();return this.getClassName()===e.className&&(n.cell={className:this.cell.getClassName(),config:r}),Object.assign(Object.assign(Object.assign({},r),t),n)}static fromConfig(e,t,n={}){let r=t.cell,i=Yb(r,n);return new e(Object.assign(t,{cell:i}))}};OC.className=`RNN`,K(OC);var kC=class extends ub{},AC=class extends kC{constructor(e){super(e),this.DEFAULT_ACTIVATION=`tanh`,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_RECURRENT_INITIALIZER=`orthogonal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,this.units=e.units,Cv(this.units,`units`),this.activation=GS(e.activation==null?this.DEFAULT_ACTIVATION:e.activation),this.useBias=e.useBias==null||e.useBias,this.kernelInitializer=Yy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Yy(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Yy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelRegularizer=QS(e.kernelRegularizer),this.recurrentRegularizer=QS(e.recurrentRegularizer),this.biasRegularizer=QS(e.biasRegularizer),this.kernelConstraint=Lb(e.kernelConstraint),this.recurrentConstraint=Lb(e.recurrentConstraint),this.biasConstraint=Lb(e.biasConstraint),this.dropout=Zv([1,Qv([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Zv([1,Qv([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.stateSize=this.units,this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){e=Qy(e),this.kernel=this.addWeight(`kernel`,[e[e.length-1],this.units],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight(`recurrent_kernel`,[this.units,this.units],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.bias=this.useBias?this.addWeight(`bias`,[this.units],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.built=!0}call(e,t){return I(()=>{if(e=e,e.length!==2)throw new q(`SimpleRNNCell expects 2 input Tensors, got ${e.length}.`);let n=e[1];e=e[0];let r=t.training!=null&&t.training;0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=LC({ones:()=>Uu(e),rate:this.dropout,training:r,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=LC({ones:()=>Uu(n),rate:this.recurrentDropout,training:r,dropoutFunc:this.dropoutFunc}));let i,a=this.dropoutMask,o=this.recurrentDropoutMask;i=hy(a==null?e:V(e,a),this.kernel.read()),this.bias!=null&&(i=yy(i,this.bias.read())),o!=null&&(n=V(n,o));let s=z(i,hy(n,this.recurrentKernel.read()));return this.activation!=null&&(s=this.activation.apply(s)),[s,s]})}getConfig(){let e=super.getConfig(),t={units:this.units,activation:US(this.activation),useBias:this.useBias,kernelInitializer:Jy(this.kernelInitializer),recurrentInitializer:Jy(this.recurrentInitializer),biasInitializer:Jy(this.biasInitializer),kernelRegularizer:XS(this.kernelRegularizer),recurrentRegularizer:XS(this.recurrentRegularizer),biasRegularizer:XS(this.biasRegularizer),activityRegularizer:XS(this.activityRegularizer),kernelConstraint:Fb(this.kernelConstraint),recurrentConstraint:Fb(this.recurrentConstraint),biasConstraint:Fb(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout};return Object.assign(Object.assign({},e),t)}};AC.className=`SimpleRNNCell`,K(AC);var jC=class extends OC{constructor(e){e.cell=new AC(e),super(e)}call(e,t){return I(()=>{this.cell.dropoutMask!=null&&(L(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(L(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}static fromConfig(e,t){return new e(t)}};jC.className=`SimpleRNN`,K(jC);var MC=class extends kC{constructor(e){if(super(e),this.DEFAULT_ACTIVATION=`tanh`,this.DEFAULT_RECURRENT_ACTIVATION=`hardSigmoid`,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_RECURRENT_INITIALIZER=`orthogonal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,e.resetAfter)throw new q(`GRUCell does not support reset_after parameter set to true.`);this.units=e.units,Cv(this.units,`units`),this.activation=GS(e.activation===void 0?this.DEFAULT_ACTIVATION:e.activation),this.recurrentActivation=GS(e.recurrentActivation===void 0?this.DEFAULT_RECURRENT_ACTIVATION:e.recurrentActivation),this.useBias=e.useBias==null||e.useBias,this.kernelInitializer=Yy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Yy(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Yy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelRegularizer=QS(e.kernelRegularizer),this.recurrentRegularizer=QS(e.recurrentRegularizer),this.biasRegularizer=QS(e.biasRegularizer),this.kernelConstraint=Lb(e.kernelConstraint),this.recurrentConstraint=Lb(e.recurrentConstraint),this.biasConstraint=Lb(e.biasConstraint),this.dropout=Zv([1,Qv([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Zv([1,Qv([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.implementation=e.implementation,this.stateSize=this.units,this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){e=Qy(e);let t=e[e.length-1];this.kernel=this.addWeight(`kernel`,[t,this.units*3],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight(`recurrent_kernel`,[this.units,this.units*3],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.bias=this.useBias?this.addWeight(`bias`,[this.units*3],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint):null,this.built=!0}call(e,t){return I(()=>{if(e=e,e.length!==2)throw new q(`GRUCell expects 2 input Tensors (inputs, h, c), got ${e.length}.`);let n=t.training!=null&&t.training,r=e[1];e=e[0],0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=LC({ones:()=>Uu(e),rate:this.dropout,training:n,count:3,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=LC({ones:()=>Uu(r),rate:this.recurrentDropout,training:n,count:3,dropoutFunc:this.dropoutFunc}));let i=this.dropoutMask,a=this.recurrentDropoutMask,o,s,c;0<this.dropout&&this.dropout<1&&(e=V(e,i[0]));let l=hy(e,this.kernel.read());this.useBias&&(l=yy(l,this.bias.read())),0<this.recurrentDropout&&this.recurrentDropout<1&&(r=V(r,a[0]));let u=this.recurrentKernel.read(),[d,f]=af(u,[2*this.units,this.units],u.rank-1),p=hy(r,d),[m,h,g]=af(l,3,l.rank-1),[_,v]=af(p,2,p.rank-1);o=this.recurrentActivation.apply(z(m,_)),s=this.recurrentActivation.apply(z(h,v));let y=hy(V(s,r),f);c=this.activation.apply(z(g,y));let b=z(V(o,r),V(z(1,nu(o)),c));return[b,b]})}getConfig(){let e=super.getConfig(),t={units:this.units,activation:US(this.activation),recurrentActivation:US(this.recurrentActivation),useBias:this.useBias,kernelInitializer:Jy(this.kernelInitializer),recurrentInitializer:Jy(this.recurrentInitializer),biasInitializer:Jy(this.biasInitializer),kernelRegularizer:XS(this.kernelRegularizer),recurrentRegularizer:XS(this.recurrentRegularizer),biasRegularizer:XS(this.biasRegularizer),activityRegularizer:XS(this.activityRegularizer),kernelConstraint:Fb(this.kernelConstraint),recurrentConstraint:Fb(this.recurrentConstraint),biasConstraint:Fb(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout,implementation:this.implementation,resetAfter:!1};return Object.assign(Object.assign({},e),t)}};MC.className=`GRUCell`,K(MC);var NC=class extends OC{constructor(e){e.implementation===0&&console.warn("`implementation=0` has been deprecated, and now defaults to `implementation=1`. Please update your layer call."),e.cell=new MC(e),super(e)}call(e,t){return I(()=>{this.cell.dropoutMask!=null&&(L(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(L(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}static fromConfig(e,t){return t.implmentation===0&&(t.implementation=1),new e(t)}};NC.className=`GRU`,K(NC);var PC=class extends kC{constructor(e){super(e),this.DEFAULT_ACTIVATION=`tanh`,this.DEFAULT_RECURRENT_ACTIVATION=`hardSigmoid`,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_RECURRENT_INITIALIZER=`orthogonal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,this.units=e.units,Cv(this.units,`units`),this.activation=GS(e.activation===void 0?this.DEFAULT_ACTIVATION:e.activation),this.recurrentActivation=GS(e.recurrentActivation===void 0?this.DEFAULT_RECURRENT_ACTIVATION:e.recurrentActivation),this.useBias=e.useBias==null||e.useBias,this.kernelInitializer=Yy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.recurrentInitializer=Yy(e.recurrentInitializer||this.DEFAULT_RECURRENT_INITIALIZER),this.biasInitializer=Yy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.unitForgetBias=e.unitForgetBias,this.kernelRegularizer=QS(e.kernelRegularizer),this.recurrentRegularizer=QS(e.recurrentRegularizer),this.biasRegularizer=QS(e.biasRegularizer),this.kernelConstraint=Lb(e.kernelConstraint),this.recurrentConstraint=Lb(e.recurrentConstraint),this.biasConstraint=Lb(e.biasConstraint),this.dropout=Zv([1,Qv([0,e.dropout==null?0:e.dropout])]),this.recurrentDropout=Zv([1,Qv([0,e.recurrentDropout==null?0:e.recurrentDropout])]),this.dropoutFunc=e.dropoutFunc,this.implementation=e.implementation,this.stateSize=[this.units,this.units],this.dropoutMask=null,this.recurrentDropoutMask=null}build(e){var t;e=Qy(e);let n=e[e.length-1];this.kernel=this.addWeight(`kernel`,[n,this.units*4],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.recurrentKernel=this.addWeight(`recurrent_kernel`,[this.units,this.units*4],null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint);let r;if(this.useBias){if(this.unitForgetBias){let e=this.biasInitializer,n=this.units;r=new(t=class extends ky{apply(t,r){let i=e.apply([n]),a=new jy().apply([n]),o=e.apply([n*2]);return fy(fy(i,a),o)}},t.className=`CustomInit`,t)}else r=this.biasInitializer;this.bias=this.addWeight(`bias`,[this.units*4],null,r,this.biasRegularizer,!0,this.biasConstraint)}else this.bias=null;this.built=!0}call(e,t){return I(()=>{let n=t.training!=null&&t.training;if(e=e,e.length!==3)throw new q(`LSTMCell expects 3 input Tensors (inputs, h, c), got ${e.length}.`);let r=e[1],i=e[2];e=e[0],0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=LC({ones:()=>Uu(e),rate:this.dropout,training:n,count:4,dropoutFunc:this.dropoutFunc})),0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=LC({ones:()=>Uu(r),rate:this.recurrentDropout,training:n,count:4,dropoutFunc:this.dropoutFunc}));let a=this.dropoutMask,o=this.recurrentDropoutMask,s,c,l,u;0<this.dropout&&this.dropout<1&&(e=V(e,a[0]));let d=hy(e,this.kernel.read());0<this.recurrentDropout&&this.recurrentDropout<1&&(r=V(r,o[0])),d=z(d,hy(r,this.recurrentKernel.read())),this.useBias&&(d=yy(d,this.bias.read()));let[f,p,m,h]=af(d,4,d.rank-1);s=this.recurrentActivation.apply(f),c=this.recurrentActivation.apply(p),l=z(V(c,i),V(s,this.activation.apply(m))),u=this.recurrentActivation.apply(h);let g=V(u,this.activation.apply(l));return[g,g,l]})}getConfig(){let e=super.getConfig(),t={units:this.units,activation:US(this.activation),recurrentActivation:US(this.recurrentActivation),useBias:this.useBias,kernelInitializer:Jy(this.kernelInitializer),recurrentInitializer:Jy(this.recurrentInitializer),biasInitializer:Jy(this.biasInitializer),unitForgetBias:this.unitForgetBias,kernelRegularizer:XS(this.kernelRegularizer),recurrentRegularizer:XS(this.recurrentRegularizer),biasRegularizer:XS(this.biasRegularizer),activityRegularizer:XS(this.activityRegularizer),kernelConstraint:Fb(this.kernelConstraint),recurrentConstraint:Fb(this.recurrentConstraint),biasConstraint:Fb(this.biasConstraint),dropout:this.dropout,recurrentDropout:this.recurrentDropout,implementation:this.implementation};return Object.assign(Object.assign({},e),t)}};PC.className=`LSTMCell`,K(PC);var FC=class extends OC{constructor(e){e.implementation===0&&console.warn("`implementation=0` has been deprecated, and now defaults to `implementation=1`. Please update your layer call."),e.cell=new PC(e),super(e)}call(e,t){return I(()=>{this.cell.dropoutMask!=null&&(L(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(L(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}static fromConfig(e,t){return t.implmentation===0&&(t.implementation=1),new e(t)}};FC.className=`LSTM`,K(FC);var IC=class extends kC{constructor(e){super(e),this.cells=e.cells}get stateSize(){let e=[];for(let t of this.cells.slice().reverse())Array.isArray(t.stateSize)?e.push(...t.stateSize):e.push(t.stateSize);return e}call(e,t){return I(()=>{e=e;let n=e.slice(1),r=[];for(let e of this.cells.slice().reverse())Array.isArray(e.stateSize)?r.push(n.splice(0,e.stateSize.length)):r.push(n.splice(0,1));r.reverse();let i=[],a;for(let o=0;o<this.cells.length;++o){let s=this.cells[o];n=r[o],a=o===0?[e[0]].concat(n):[a[0]].concat(n),a=s.call(a,t),i.push(a.slice(1))}n=[];for(let e of i.slice().reverse())n.push(...e);return[a[0]].concat(n)})}build(e){Xy(e)&&(e=e[0]),e=e;let t;this.cells.forEach((n,r)=>{Uv(`RNNCell_${r}`,()=>{n.build(e),t=Array.isArray(n.stateSize)?n.stateSize[0]:n.stateSize,e=[e[0],t]})}),this.built=!0}getConfig(){let e=super.getConfig(),t={cells:this.cells.map(e=>({className:e.getClassName(),config:e.getConfig()}))};return Object.assign(Object.assign({},e),t)}static fromConfig(e,t,n={}){let r=[];for(let e of t.cells)r.push(Yb(e,n));return new e({cells:r})}get trainableWeights(){if(!this.trainable)return[];let e=[];for(let t of this.cells)e.push(...t.trainableWeights);return e}get nonTrainableWeights(){let e=[];for(let t of this.cells)e.push(...t.nonTrainableWeights);if(!this.trainable){let t=[];for(let e of this.cells)t.push(...e.trainableWeights);return t.concat(e)}return e}getWeights(){let e=[];for(let t of this.cells)e.push(...t.weights);return rb(e)}setWeights(e){let t=[];for(let n of this.cells){let r=n.weights.length,i=e.splice(r);for(let e=0;e<n.weights.length;++e)t.push([n.weights[e],i[e]])}ib(t)}};IC.className=`StackedRNNCells`,K(IC);function LC(e){let{ones:t,rate:n,training:r=!1,count:i=1,dropoutFunc:a}=e,o=()=>a==null?Sy(t(),n):a(t(),n),s=()=>wy(o,t,r);return!i||i<=1?ha(s().clone()):Array(i).fill(void 0).map(s).map(e=>ha(e.clone()))}var RC=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols==`function`)for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(n[r[i]]=e[r[i]]);return n},zC=class extends OC{constructor(e){if(e.unroll)throw new J(`Unrolling is not possible with convolutional RNNs.`);if(Array.isArray(e.cell))throw new J(`It is not possible at the moment to stack convolutional cells.`);super(e),this.inputSpec=[new ab({ndim:5})]}call(e,t){return I(()=>{if(this.cell.dropoutMask!=null&&(L(this.cell.dropoutMask),this.cell.dropoutMask=null),this.cell.recurrentDropoutMask!=null&&(L(this.cell.recurrentDropoutMask),this.cell.recurrentDropoutMask=null),t&&t.constants)throw new q(`ConvRNN2D cell does not support constants`);let n=t==null?null:t.mask,r=t==null?null:t.training,i=t==null?null:t.initialState;return super.call(e,{mask:n,training:r,initialState:i})})}computeOutputShape(e){let t=this.computeSingleOutputShape(e);return this.returnSequences||(t=[t[0],...t.slice(2)]),this.returnState&&(t=[t,...[,,].fill([e[0],...t.slice(-3)])]),t}getInitialState(e){return I(()=>{let{stateSize:t}=this.cell,n=e.shape,r=this.computeSingleOutputShape(n),i=Ou([r[0],...r.slice(2)]);return Array.isArray(t)?Array(t.length).fill(i):[i]})}resetStates(e,t=!1){I(()=>{if(!this.stateful)throw new nv(`Cannot call resetStates() on an RNN Layer that is not stateful.`);let n=this.inputSpec[0].shape,r=this.computeSingleOutputShape(n),i=[r[0],...r.slice(2)];if(n[0]==null)throw new q("If an RNN is stateful, it needs to know its batch size. Specify the batch size of your input tensors: \n- If using a Sequential model, specify the batch size by passing a `batchInputShape` option to your first layer.\n- If using the functional API, specify the batch size by passing a `batchShape` option to your Input layer.");if(this.getStates()==null)this.states_=Array.isArray(this.cell.stateSize)?this.cell.stateSize.map(()=>Ou(i)):[Ou(i)];else if(e==null)L(this.states_),this.keptStates!=null&&(L(this.keptStates),this.keptStates=[]),Array.isArray(this.cell.stateSize)?this.states_=this.cell.stateSize.map(()=>Ou(i)):this.states_[0]=Ou(i);else{if(Array.isArray(e)||(e=[e]),e.length!==this.states_.length)throw new q(`Layer ${this.name} expects ${this.states_.length} state(s), but it received ${e.length} state value(s). Input received: ${e}`);t?this.keptStates.push(this.states_.slice()):L(this.states_);for(let t=0;t<this.states_.length;++t){let n=e[t],r=i;if(!b(n.shape,r))throw new q(`State ${t} is incompatible with layer ${this.name}: expected shape=${r}, received shape=${n.shape}`);this.states_[t]=n}}this.states_=this.states_.map(e=>ha(e.clone()))})}computeSingleOutputShape(e){let{dataFormat:t,filters:n,kernelSize:r,padding:i,strides:a,dilationRate:o}=this.cell,s=t===`channelsFirst`,c=e[s?3:2],l=e[s?4:3],u=oC(c,r[0],i,a[0],o[0]),d=oC(l,r[1],i,a[1],o[1]);return[...e.slice(0,2),...s?[n,u,d]:[u,d,n]]}};zC.className=`ConvRNN2D`;var BC=class extends PC{constructor(e){let{filters:t,kernelSize:n,strides:r,padding:i,dataFormat:a,dilationRate:o}=e;super(Object.assign(Object.assign({},e),{units:t})),this.filters=t,Cv(this.filters,`filters`),this.kernelSize=aC(n,2,`kernelSize`),this.kernelSize.forEach(e=>Cv(e,`kernelSize`)),this.strides=aC(r||1,2,`strides`),this.strides.forEach(e=>Cv(e,`strides`)),this.padding=i||`valid`,zv(this.padding),this.dataFormat=a||`channelsLast`,Lv(this.dataFormat),this.dilationRate=aC(o||1,2,`dilationRate`),this.dilationRate.forEach(e=>Cv(e,`dilationRate`))}build(e){var t;e=Qy(e);let n=this.dataFormat===`channelsFirst`?1:e.length-1;if(e[n]==null)throw new q(`The channel dimension of the input should be defined. Found ${e[n]}`);let r=e[n],i=this.kernelSize.concat([r,this.filters*4]);this.kernel=this.addWeight(`kernel`,i,null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint);let a=this.kernelSize.concat([this.filters,this.filters*4]);if(this.recurrentKernel=this.addWeight(`recurrent_kernel`,a,null,this.recurrentInitializer,this.recurrentRegularizer,!0,this.recurrentConstraint),this.useBias){let e;if(this.unitForgetBias){let n=this.biasInitializer,r=this.filters;e=new(t=class extends ky{apply(e,t){return dy([n.apply([r]),ku([r]),n.apply([r*2])])}},t.className=`CustomInit`,t)}else e=this.biasInitializer;this.bias=this.addWeight(`bias`,[this.filters*4],null,e,this.biasRegularizer,!0,this.biasConstraint)}this.built=!0}call(e,t){return I(()=>{if(e.length!==3)throw new q(`ConvLSTM2DCell expects 3 input Tensors (inputs, h, c), got ${e.length}.`);let n=t.training||!1,r=e[0],i=e[1],a=e[2];0<this.dropout&&this.dropout<1&&this.dropoutMask==null&&(this.dropoutMask=LC({ones:()=>Uu(r),rate:this.dropout,training:n,count:4,dropoutFunc:this.dropoutFunc}));let o=this.dropoutMask,s=(e,t,n)=>!t||!t[n]?e:V(t[n],e),c=s(r,o,0),l=s(r,o,1),u=s(r,o,2),d=s(r,o,3);0<this.recurrentDropout&&this.recurrentDropout<1&&this.recurrentDropoutMask==null&&(this.recurrentDropoutMask=LC({ones:()=>Uu(i),rate:this.recurrentDropout,training:n,count:4,dropoutFunc:this.dropoutFunc}));let f=this.recurrentDropoutMask,p=s(i,f,0),m=s(i,f,1),h=s(i,f,2),g=s(i,f,3),[_,v,y,b]=af(this.kernel.read(),4,3),[x,S,C,w]=this.useBias?af(this.bias.read(),4):[null,null,null,null];c=this.inputConv(c,_,x,this.padding),l=this.inputConv(l,v,S,this.padding),u=this.inputConv(u,y,C,this.padding),d=this.inputConv(d,b,w,this.padding);let[T,E,D,O]=af(this.recurrentKernel.read(),4,3);p=this.recurrentConv(p,T),m=this.recurrentConv(m,E),h=this.recurrentConv(h,D),g=this.recurrentConv(g,O);let k=this.recurrentActivation.apply(z(c,p)),ee=z(V(this.recurrentActivation.apply(z(l,m)),a),V(k,this.activation.apply(z(u,h)))),te=V(this.recurrentActivation.apply(z(d,g)),this.activation.apply(ee));return[te,te,ee]})}getConfig(){let e=super.getConfig(),{units:t}=e,n=RC(e,[`units`]),r={filters:this.filters,kernelSize:this.kernelSize,padding:this.padding,dataFormat:this.dataFormat,dilationRate:this.dilationRate,strides:this.strides};return Object.assign(Object.assign({},n),r)}inputConv(e,t,n,r){let i=Zs(e,t,this.strides,r||`valid`,this.dataFormat===`channelsFirst`?`NCHW`:`NHWC`,this.dilationRate);return n?yy(i,n,this.dataFormat):i}recurrentConv(e,t){return Zs(e,t,1,`same`,this.dataFormat===`channelsFirst`?`NCHW`:`NHWC`)}};BC.className=`ConvLSTM2DCell`,K(BC);var VC=class extends zC{constructor(e){let t=new BC(e);super(Object.assign(Object.assign({},e),{cell:t}))}static fromConfig(e,t){return new e(t)}};VC.className=`ConvLSTM2D`,K(VC);var HC=class extends ub{constructor(e){super(e),this.rate=Math.max(Math.min(e.rate,1),0),this.noiseShape=e.noiseShape,this.seed=e.seed,this.supportsMasking=!0}getNoiseShape(e){if(this.noiseShape==null)return this.noiseShape;let t=e.shape,n=[];for(let e=0;e<this.noiseShape.length;++e)n.push(this.noiseShape[e]==null?t[e]:this.noiseShape[e]);return n}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);if(0<this.rate&&this.rate<1){let e=t.training!=null&&t.training,r=this.getNoiseShape(n);return wy(()=>Sy(n,this.rate,r,this.seed),()=>n,e)}return e})}getConfig(){let e={rate:this.rate,noiseShape:this.noiseShape,seed:this.seed},t=super.getConfig();return Object.assign(e,t),e}dispose(){return super.dispose()}};HC.className=`Dropout`,K(HC);var UC=class extends HC{constructor(e){super(e),this.inputSpec=[{ndim:3}]}getNoiseShape(e){let t=e.shape;return[t[0],1,t[2]]}};UC.className=`SpatialDropout1D`,K(UC);var WC=class extends ub{constructor(e){if(super(e),this.activation=null,this.useBias=!0,this.kernel=null,this.bias=null,this.DEFAULT_KERNEL_INITIALIZER=`glorotNormal`,this.DEFAULT_BIAS_INITIALIZER=`zeros`,e.batchInputShape==null&&e.inputShape==null&&e.inputDim!=null){let t=null;e.batchSize!=null&&(t=e.batchSize),this.batchInputShape=[t,e.inputDim]}this.units=e.units,Cv(this.units,`units`),this.activation=GS(e.activation),e.useBias!=null&&(this.useBias=e.useBias),this.kernelInitializer=Yy(e.kernelInitializer||this.DEFAULT_KERNEL_INITIALIZER),this.biasInitializer=Yy(e.biasInitializer||this.DEFAULT_BIAS_INITIALIZER),this.kernelConstraint=Lb(e.kernelConstraint),this.biasConstraint=Lb(e.biasConstraint),this.kernelRegularizer=QS(e.kernelRegularizer),this.biasRegularizer=QS(e.biasRegularizer),this.activityRegularizer=QS(e.activityRegularizer),this.supportsMasking=!0,this.inputSpec=[{minNDim:2}]}build(e){e=Qy(e);let t=e[e.length-1];this.kernel??(this.kernel=this.addWeight(`kernel`,[t,this.units],null,this.kernelInitializer,this.kernelRegularizer,!0,this.kernelConstraint),this.useBias&&(this.bias=this.addWeight(`bias`,[this.units],null,this.biasInitializer,this.biasRegularizer,!0,this.biasConstraint))),this.inputSpec=[{minNDim:2,axes:{[-1]:t}}],this.built=!0}computeOutputShape(e){e=Qy(e);let t=e.slice();return t[t.length-1]=this.units,t}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e),r=Ev(this.activation.getClassName()),i;return r==null?(i=hy(n,this.kernel.read()),this.bias!=null&&(i=yy(i,this.bias.read())),this.activation!=null&&(i=this.activation.apply(i))):i=hy(n,this.kernel.read(),r,this.bias?this.bias.read():null),i})}getConfig(){let e={units:this.units,activation:US(this.activation),useBias:this.useBias,kernelInitializer:Jy(this.kernelInitializer),biasInitializer:Jy(this.biasInitializer),kernelRegularizer:XS(this.kernelRegularizer),biasRegularizer:XS(this.biasRegularizer),activityRegularizer:XS(this.activityRegularizer),kernelConstraint:Fb(this.kernelConstraint),biasConstraint:Fb(this.biasConstraint)},t=super.getConfig();return Object.assign(e,t),e}};WC.className=`Dense`,K(WC);var GC=class extends ub{constructor(e){e||={},super(e),this.inputSpec=[{minNDim:3}],this.dataFormat=e.dataFormat}computeOutputShape(e){e=Qy(e);for(let t of e.slice(1))if(t==null)throw new q(`The shape of the input to "Flatten" is not fully defined (got ${e.slice(1)}). Make sure to pass a complete "input_shape" or "batch_input_shape" argument to the first layer in your model.`);return[e[0],Xv(e,1)]}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);if(this.dataFormat===`channelsFirst`&&n.rank>1){let e=[0];for(let t=2;t<n.rank;++t)e.push(t);e.push(1),n=Rf(n,e)}return sy(n)})}getConfig(){let e={};this.dataFormat!=null&&(e.dataFormat=this.dataFormat);let t=super.getConfig();return Object.assign(e,t),e}};GC.className=`Flatten`,K(GC);var KC=class extends ub{constructor(e){super(e),this.supportsMasking=!0,this.activation=GS(e.activation)}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);return this.activation.apply(n)})}getConfig(){let e={activation:US(this.activation)},t=super.getConfig();return Object.assign(e,t),e}};KC.className=`Activation`,K(KC);var qC=class extends ub{constructor(e){super(e),this.n=e.n,this.inputSpec=[{ndim:2}]}computeOutputShape(e){return[e[0],this.n,e[1]]}call(e,t){return I(()=>(e=Y(e),ay(e,this.n)))}getConfig(){let e={n:this.n},t=super.getConfig();return Object.assign(e,t),e}};qC.className=`RepeatVector`,K(qC);var JC=class extends ub{constructor(e){super(e),this.targetShape=e.targetShape;for(let e=0;e<this.targetShape.length;++e)this.isUnknown(this.targetShape[e])&&(this.targetShape[e]=null)}isUnknown(e){return e<0||e==null}fixUnknownDimension(e,t){let n=`Total size of new array must be unchanged.`,r=t.slice(),i=1,a=null;for(let e=0;e<r.length;++e){let t=r[e];if(this.isUnknown(t))if(a===null)a=e;else throw new q(`Can only specifiy one unknown dimension.`);else i*=t}let o=Xv(e);if(a!==null){if(i===0||o%i!==0)throw new q(n);r[a]=o/i}else if(o!==i)throw new q(n);return r}computeOutputShape(e){let t=!1;for(let n=0;n<e.length;++n)if(this.isUnknown(e[n])){t=!0;break}return t?e.slice(0,1).concat(this.targetShape):e.slice(0,1).concat(this.fixUnknownDimension(e.slice(1),this.targetShape))}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e),r=n.shape;return H(n,r.slice(0,1).concat(this.fixUnknownDimension(r.slice(1),this.targetShape)))})}getConfig(){let e={targetShape:this.targetShape},t=super.getConfig();return Object.assign(e,t),e}};JC.className=`Reshape`,K(JC);var YC=class extends ub{constructor(e){if(super(e),e.dims==null)throw Error("Required configuration field `dims` is missing during Permute constructor call.");if(!Array.isArray(e.dims))throw Error(`Permute constructor requires \`dims\` to be an Array, but received ${e.dims} instead.`);let t=$v(1,e.dims.length+1);if(!b(e.dims.slice().sort(),t))throw Error("Invalid permutation `dims`: "+JSON.stringify(e.dims)+" `dims` must contain consecutive integers starting from 1.");this.dims=e.dims,this.dimsIncludingBatch=[0].concat(this.dims),this.inputSpec=[new ab({ndim:this.dims.length+1})]}computeOutputShape(e){e=Qy(e);let t=e.slice();return this.dims.forEach((n,r)=>{t[r+1]=e[n]}),t}call(e,t){return Rf(Y(e),this.dimsIncludingBatch)}getConfig(){let e={dims:this.dims},t=super.getConfig();return Object.assign(e,t),e}};YC.className=`Permute`,K(YC);var XC=class extends ub{constructor(e){super(e??{}),this.supportsMasking=!0,this.maskValue=e==null||e.maskValue==null?0:e.maskValue}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={maskValue:this.maskValue};return Object.assign(t,e),t}computeMask(e,t){return Do(zu(Y(e),this.maskValue),-1)}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);return V(n,R(Do(zu(n,this.maskValue),-1,!0),n.dtype))})}};XC.className=`Masking`,K(XC);var ZC=class extends ub{constructor(e){if(super(e),this.embeddings=null,this.DEFAULT_EMBEDDINGS_INITIALIZER=`randomUniform`,e.batchInputShape==null&&e.inputShape==null){let t=null;e.batchSize!=null&&(t=e.batchSize),this.batchInputShape=e.inputLength==null?[t,null]:[t].concat(uv(e.inputLength))}this.inputDim=e.inputDim,Cv(this.inputDim,`inputDim`),this.outputDim=e.outputDim,Cv(this.outputDim,`outputDim`),this.embeddingsInitializer=Yy(e.embeddingsInitializer||this.DEFAULT_EMBEDDINGS_INITIALIZER),this.embeddingsRegularizer=QS(e.embeddingsRegularizer),this.activityRegularizer=QS(e.activityRegularizer),this.embeddingsConstraint=Lb(e.embeddingsConstraint),this.maskZero=e.maskZero,this.supportsMasking=e.maskZero,this.inputLength=e.inputLength}build(e){this.embeddings=this.addWeight(`embeddings`,[this.inputDim,this.outputDim],this.dtype,this.embeddingsInitializer,this.embeddingsRegularizer,!0,this.embeddingsConstraint),this.built=!0}warnOnIncompatibleInputShape(e){}computeMask(e,t){return I(()=>this.maskZero?(e=Y(e),zu(e,Nc(e))):null)}computeOutputShape(e){if(e=Qy(e),this.inputLength==null)return[...e,this.outputDim];let t=uv(this.inputLength);if(t.length!==e.length-1)throw new q(`"inputLength" is ${this.inputLength}, but received input shape has shape ${e}`);{let n=0;for(let r=0;r<t.length;++r){let i=t[r],a=e[r+1];if(i!=null&&a!=null&&i!==a)throw new q(`"inputLength" is ${this.inputLength}, but received input shape has shape ${e}`);i??(t[n]=a),n++}}return[e[0],...t,this.outputDim]}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);return n.dtype!==`int32`&&(n=ry(n,`int32`)),H(gy(this.embeddings.read(),H(n,[n.size])),Qy(this.computeOutputShape(n.shape)))})}getConfig(){let e={inputDim:this.inputDim,outputDim:this.outputDim,embeddingsInitializer:Jy(this.embeddingsInitializer),embeddingsRegularizer:XS(this.embeddingsRegularizer),activityRegularizer:XS(this.activityRegularizer),embeddingsConstraint:Fb(this.embeddingsConstraint),maskZero:this.maskZero,inputLength:this.inputLength},t=super.getConfig();return Object.assign(e,t),e}};ZC.className=`Embedding`,K(ZC);var QC=class extends ub{constructor(e){super(e||{}),this.supportsMasking=!0}mergeFunction(e){throw new J}computeElementwiseOpOutputShape(e,t){if(e==null||t==null)return null;if(e.length<t.length)return this.computeElementwiseOpOutputShape(t,e);if(t.length===0)return e;let n=e.slice(0,e.length-t.length);for(let r=0;r<t.length;++r){let i=e[e.length-t.length+r],a=t[r];if(i==null||a==null||i<0||a<0)n.push(null);else if(i===1)n.push(a);else if(a===1)n.push(i);else{if(i!==a)throw new q(`Operands could not be broadcast together with shapes `+JSON.stringify(e)+` `+JSON.stringify(t));n.push(i)}}return n}build(e){if(Array.isArray(e)&&!Array.isArray(e[0])&&(e=[Qy(e)]),e=e,e.length<2)throw new q(`A merge layer should be called on an Array of at least 2 inputs. Got ${e.length} input(s).`);let t=[];for(let n of e)n!=null&&n[0]!==null&&t.push(n[0]);if(t=yv(t),t.length>1)throw new q(`Can not merge tensors with different batch sizes. Got tensors with shapes: ${JSON.stringify(e)}.`);let n=e[0]==null?null:e[0].slice(1);for(let t=1;t<e.length;++t){let r=e[t]==null?null:e[t].slice(1);n=this.computeElementwiseOpOutputShape(n,r)}let r=e.map(e=>e.length);this.reshapeRequired=e.indexOf(null)!==-1||yv(r).length!==1}call(e,t){return I(()=>{if(e=e,this.reshapeRequired){let t=[],n=e.map(e=>e.rank);if(n.indexOf(null)===-1){let r=Qv(n);for(let n of e){let e=n.rank;for(let t=0;t<r-e;++t)n=iy(n,1);t.push(n)}return this.mergeFunction(t)}{let n=!1;for(let r of e){let e=r.rank;if(e==null){let e=r.shape,i=e[0],a=e.slice(1).concat([i]),o=H(r,[i].concat(Xv(e.slice(1))));o=Rf(o,[1,0]),o=H(o,a),t.push(o),n=!0}else if(e>1){let i=$v(1,e).concat([0]);t.push(Rf(r,i)),n=!0}else t.push(r)}let r=this.mergeFunction(t),i=r.rank;if(n){if(i==null){let e=r.shape,t=e[e.length-1],n=[t].concat(e.slice(0,e.length-1));r=H(Rf(H(r,[-1,t]),[1,0]),n)}else if(i>1){let e=[i-1].concat($v(0,i-1));r=Rf(r,e)}}return r}}return this.mergeFunction(e)})}computeOutputShape(e){e=e;let t;t=e[0]==null?null:e[0].slice(1);for(let n=1;n<e.length;++n){let r=e[n]==null?null:e[n].slice(1);t=this.computeElementwiseOpOutputShape(t,r)}let n=[];for(let t of e)t!=null&&t[0]!==null&&n.push(t[0]);return n=yv(n),t=n.length===1?n.concat(t):[null].concat(t),t}computeMask(e,t){return I(()=>{if(t==null)return null;if(!Array.isArray(t))throw new q("`mask` should be an Array");if(!Array.isArray(e))throw new q("`inputs` should be an Array");if(t.length!==e.length)throw new q(`The Array 'inputs' and 'mask' are expected to have the same length, but have different lengths (${e.length} vs ${t.length})`);if(t.every(e=>e==null))return null;t=t.map(e=>e==null?e:vl(e,0));let n=t[0];for(let e=1;e<t.length-1;++e)n=pu(n,t[e]);return n})}},$C=class extends QC{constructor(e){super(e)}mergeFunction(e){return I(()=>{let t=e[0].clone();for(let n=1;n<e.length;++n)t=z(t,e[n]);return t})}};$C.className=`Add`,K($C);var ew=class extends QC{constructor(e){super(e)}mergeFunction(e){return I(()=>{let t=e[0].clone();for(let n=1;n<e.length;++n)t=V(t,e[n]);return t})}};ew.className=`Multiply`,K(ew);var tw=class extends QC{constructor(e){super(e)}mergeFunction(e){return I(()=>{let t=e[0].clone();for(let n=1;n<e.length;++n)t=z(t,e[n]);return V(1/e.length,t)})}};tw.className=`Average`,K(tw);var nw=class extends QC{constructor(e){super(e)}mergeFunction(e){return I(()=>{let t=e[0];for(let n=1;n<e.length;++n)t=Tu(t,e[n]);return t})}};nw.className=`Maximum`,K(nw);var rw=class extends QC{constructor(e){super(e)}mergeFunction(e){return I(()=>{let t=e[0];for(let n=1;n<e.length;++n)t=ju(t,e[n]);return t})}};rw.className=`Minimum`,K(rw);var iw=class extends QC{constructor(e){super(e),this.DEFAULT_AXIS=-1,e??={},this.axis=e.axis==null?this.DEFAULT_AXIS:e.axis,this.supportsMasking=!0,this.reshapeRequired=!1}build(e){if(!(Array.isArray(e)&&Array.isArray(e[0]))||e.length===1)throw new q("A `Concatenate` layer should be called on a list of at least 2 inputs");e=e;let t=!0;for(let n of e)if(n!=null){t=!1;break}if(t)return;let n=[];for(let t=0;t<e.length;++t){let r=e[t].slice();r.splice(this.axis,1);let i=!1;for(let e of n)if(b(e,r)){i=!0;break}i||n.push(r)}if(n.length>1)throw new q("A `Concatenate` layer requires inputs with matching shapes except for the concat axis. Got input shapes: "+JSON.stringify(e))}mergeFunction(e){return I(()=>dy(e,this.axis))}computeOutputShape(e){if(!(Array.isArray(e)&&Array.isArray(e[0])))throw new q("A `Concatenate` layer should be called on a list of inputs.");let t=e,n=t[0].slice(),r=this.axis<0?n.length+this.axis:this.axis;for(let e of t.slice(1)){if(n[r]==null||e[r]==null){n[r]=null;break}n[r]+=e[r]}return n}computeMask(e,t){if(t==null)return null;if(!Array.isArray(t))throw new q("`mask` should be an array for Concatenate");if(!Array.isArray(e))throw new q("`inputs` should be an array for Concatenate");if(t.length!==e.length)throw new q(`Mismatch in the length of mask (${t.length}) and the legnth of inputs (${e.length})`);return I(()=>{let n=!0;if(t.forEach(e=>{if(e!=null){n=!1;return}}),n)return null;let r=[];for(let n=0;n<e.length;++n)t[n]==null?r.push(R(Uu(e[n]),`bool`)):t[n].rank<e[n].rank?r.push(vl(t[n],-1)):r.push(t[n]);return To(ps(r,this.axis),-1,!1)})}getConfig(){let e={axis:this.axis},t=super.getConfig();return Object.assign(e,t),e}};iw.className=`Concatenate`,K(iw);function aw(e,t){for(;e<0;)e+=t;return e}function ow(e,t,n){if(e.shape.length>3||t.shape.length>3)throw new J(`batchDot is not implemented for tensors of 4D or higher rank yet`);if(g(e.shape.length>=2,()=>`batchDot requires the rank of x to be >= 2, but got ${e.shape.length}`),g(e.shape.length>=2,()=>`batchDot requires the rank of y to be >= 2, but got ${t.shape.length}`),typeof n==`number`&&(n=[n,n]),e.dtype===`complex64`||t.dtype===`complex64`)throw new J(`batchDot is not implemented for complex64-type Tensors yet.`);let r=e.shape.length,i=t.shape.length;n??=[r-1,i-2];let a=n;return I(()=>{let n;if(r>i){n=r-i;let e=[];for(let t=0;t<n;++t)e.push(1);t=H(t,t.shape.concat(e))}else if(i>r){n=i-r;let t=[];for(let e=0;e<n;++e)t.push(1);e=H(e,e.shape.concat(t))}else n=0;let o;if(e.shape.length===2&&t.shape.length===2)o=a[0]===a[1]?W(V(e,t),a[0]):W(V(Rf(e,[1,0]),t),a[1]);else{let n=a[0]!==e.shape.length-1,r=a[1]===t.shape.length-1;o=hs(e,t,n,r)}if(n>0){let e;e=r>i?r+i-3:r-1;let t=[];for(let r=e;r<e+n;++r)t.push(r);o=df(o,t)}return o.shape.length===1&&(o=vl(o,1)),o})}var sw=class extends QC{constructor(e){super(e),this.axes=e.axes,this.normalize=e.normalize!=null&&e.normalize,this.supportsMasking=!0,this.reshapeRequired=!1}build(e){g(Array.isArray(e)&&e.length===2&&Array.isArray(e[0])&&Array.isArray(e[1]),()=>"A `Dot` layer should be called on a list of exactly 2 inputs.");let t=e[0],n=e[1];if(t.length>3||n.length>3)throw new J(`Dot layer does not support tensors of 4D or higher rank yet.`);let r=this.interpretAxes(t,n);if(t[r[0]]!==n[r[1]])throw new q(`Dimension incompatibility: ${t[r[0]]} !== ${n[r[1]]}`)}mergeFunction(e){if(e.length!==2)throw new q(`A \`Dot\` layer must be called on exactly 2 inputs, but received ${e.length} input(s).`);let t=e[0],n=e[1],r;return r=Array.isArray(this.axes)?this.axes.map((t,n)=>aw(t,e[n].shape.length)):[aw(this.axes,t.shape.length),aw(this.axes,n.shape.length)],this.normalize&&(t=Xb(t,r[0]),n=Xb(n,r[1])),ow(t,n,r)}interpretAxes(e,t){let n;return n=Array.isArray(this.axes)?this.axes:[aw(this.axes,e.length),aw(this.axes,t.length)],n}computeOutputShape(e){g(Array.isArray(e)&&e.length===2&&Array.isArray(e[0])&&Array.isArray(e[1]),()=>"A `Dot` layer should be called on a list of exactly 2 inputs.");let t=e[0].slice(),n=e[1].slice();if(t.length>3||n.length>3)throw new J(`Dot layer does not support tensors of 4D or higher rank yet.`);let r=this.interpretAxes(t,n);t.splice(r[0],1),n.splice(r[1],1),n.splice(0,1);let i=t.concat(n);return i.length===1&&i.push(1),i}computeMask(e,t){return null}getConfig(){let e={axes:this.axes,normalize:this.normalize},t=super.getConfig();return Object.assign(e,t),e}};sw.className=`Dot`,K(sw);var cw=class extends ub{constructor(e){super(e),this.supportsMasking=!0,this.stddev=e.stddev}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={stddev:this.stddev};return Object.assign(t,e),t}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);return wy(()=>z(my(n.shape,0,this.stddev),n),()=>n,t.training||!1)})}};cw.className=`GaussianNoise`,K(cw);var lw=class extends ub{constructor(e){super(e),this.supportsMasking=!0,this.rate=e.rate}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={rate:this.rate};return Object.assign(t,e),t}call(e,t){return I(()=>{this.invokeCallHook(e,t);let n=Y(e);return this.rate>0&&this.rate<1?wy(()=>{let e=Math.sqrt(this.rate/(1-this.rate));return V(n,my(n.shape,1,e))},()=>n,t.training||!1):n})}};lw.className=`GaussianDropout`,K(lw);var uw=class extends ub{constructor(e){super(e),this.supportsMasking=!0,this.rate=e.rate,this.noiseShape=e.noiseShape}_getNoiseShape(e){return this.noiseShape||Y(e).shape}computeOutputShape(e){return e}getConfig(){let e=super.getConfig(),t={rate:this.rate};return Object.assign(t,e),t}call(e,t){return I(()=>{if(this.rate<1&&this.rate>0){let n=this._getNoiseShape(e);return wy(()=>{let t=Y(e),r=-1.7580993408473766,i=Ml(hd(n),this.rate);i=ry(i,`float32`);let a=((1-this.rate)*(1+this.rate*r**2))**-.5,o=-a*r*this.rate;return z(V(z(V(t,i),V(z(i,-1),r)),a),o)},()=>Y(e),t.training||!1)}return e})}};uw.className=`AlphaDropout`,K(uw);function dw(e,t,n,r,i,a=.001){let o;if(e.rank===2)o=Os(e,t,n,r,i,a);else if(e.rank===3)o=As(e,t,n,r,i,a);else if(e.rank===4)o=Ms(e,t,n,r,i,a);else throw new J(`batchNormalization is not implemented for array of rank ${e.rank} yet`);return o}function fw(e,t,n,r,i=.001){return I(()=>{let a=Lu(e,r),o=a.mean,s=a.variance;return[dw(e,o,s,n,t,i),o,s]})}function pw(e,t,n,r,i=.001){return I(()=>{let a=Lu(e,r),o=a.mean,s=a.variance,c=[];for(let t of $v(0,e.rank))r.indexOf(t)===-1?c.push(e.shape[t]):c.push(1);let l=H(o,c),u=H(s,c),d=t==null?null:H(t,c);return[dw(e,l,u,n==null?null:H(n,c),d,i),o,s]})}function mw(e,t,n,r,i=.001){return b(r.slice().sort(),$v(0,e.rank-1))?fw(e,t,n,r,i):pw(e,t,n,r,i)}var hw=class extends ub{constructor(e){e??={},super(e),this.supportsMasking=!0,this.axis=e.axis==null?-1:e.axis,this.momentum=e.momentum==null?.99:e.momentum,this.epsilon=e.epsilon==null?.001:e.epsilon,this.center=e.center==null||e.center,this.scale=e.scale==null||e.scale,this.betaInitializer=Yy(e.betaInitializer||`zeros`),this.gammaInitializer=Yy(e.gammaInitializer||`ones`),this.movingMeanInitializer=Yy(e.movingMeanInitializer||`zeros`),this.movingVarianceInitializer=Yy(e.movingVarianceInitializer||`ones`),this.betaConstraint=Lb(e.betaConstraint),this.gammaConstraint=Lb(e.gammaConstraint),this.betaRegularizer=QS(e.betaRegularizer),this.gammaRegularizer=QS(e.gammaRegularizer)}build(e){e=Qy(e);let t=this.axis>=0?this.axis:this.axis+e.length,n=e[t];if(n==null)throw new q(`Axis ${t} of input tensor should have a defined dimension but the layer received an input with shape ${JSON.stringify(e)}.`);this.inputSpec=[new ab({ndim:e.length,axes:{[t]:n}})];let r=[n];this.scale&&(this.gamma=this.addWeight(`gamma`,r,null,this.gammaInitializer,this.gammaRegularizer,!0,this.gammaConstraint)),this.center&&(this.beta=this.addWeight(`beta`,r,null,this.betaInitializer,this.betaRegularizer,!0,this.betaConstraint)),this.movingMean=this.addWeight(`moving_mean`,r,null,this.movingMeanInitializer,null,!1),this.movingVariance=this.addWeight(`moving_variance`,r,null,this.movingVarianceInitializer,null,!1),this.built=!0}call(e,t){return I(()=>{let n=t.training!=null&&t.training,r=Y(e),i=r.shape,a=i.length,o=$v(0,a),s=this.axis>=0?this.axis:this.axis+a;o.splice(s,1);let c=ov(1,a);c[s]=i[s];let l=o.slice();l.sort();let u=!b(l,$v(0,a).slice(0,a-1)),d=()=>{if(u){let e=H(this.movingMean.read(),c),t=H(this.movingVariance.read(),c),n=this.center?H(this.beta.read(),c):null,i=this.scale?H(this.gamma.read(),c):null;return dw(r,e,t,n,i,this.epsilon)}return dw(r,this.movingMean.read(),this.movingVariance.read(),this.beta==null?null:this.beta.read(),this.gamma==null?null:this.gamma.read(),this.epsilon)};if(!n)return d();let[f,p,m]=mw(r,this.gamma.read(),this.beta.read(),o,this.epsilon),h=(e,t,n)=>{I(()=>{let r=1-n,i=e.read(),a=V(G(i,t),r);e.write(G(i,a))})};return h(this.movingMean,p,this.momentum),h(this.movingVariance,m,this.momentum),f})}getConfig(){let e={axis:this.axis,momentum:this.momentum,epsilon:this.epsilon,center:this.center,scale:this.scale,betaInitializer:Jy(this.betaInitializer),gammaInitializer:Jy(this.gammaInitializer),movingMeanInitializer:Jy(this.movingMeanInitializer),movingVarianceInitializer:Jy(this.movingVarianceInitializer),betaRegularizer:XS(this.betaRegularizer),gammaRegularizer:XS(this.gammaRegularizer),betaConstraint:Fb(this.betaConstraint),gammaConstraint:Fb(this.gammaConstraint)},t=super.getConfig();return Object.assign(e,t),e}};hw.className=`BatchNormalization`,K(hw);var gw=class extends ub{constructor(e){if(e??={},super(e),this.axis=e.axis==null?-1:e.axis,typeof this.axis==`number`){if(!Number.isInteger(this.axis))throw Error(`Expected axis to be an integer, but received ${this.axis}`)}else if(Array.isArray(this.axis)){for(let e of this.axis)if(!Number.isInteger(e))throw Error(`Expected axis to be an array of integers, but received ${JSON.stringify(this.axis)}`)}else throw Error(`Expected axis to be an integer or an array of integers, but received ${JSON.stringify(this.axis)}`);this.epsilon=e.epsilon==null?.001:e.epsilon,this.center=e.center==null||e.center,this.scale=e.scale==null||e.scale,this.betaInitializer=Yy(e.betaInitializer||`zeros`),this.gammaInitializer=Yy(e.gammaInitializer||`ones`),this.betaRegularizer=QS(e.betaRegularizer),this.gammaRegularizer=QS(e.gammaRegularizer),this.supportsMasking=!0}build(e){e=Qy(e);let t=e.length;typeof this.axis==`number`&&(this.axis=[this.axis]);for(let e=0;e<this.axis.length;++e)this.axis[e]<0&&(this.axis[e]+=t);for(let e of this.axis)if(e<0||e>=t)throw Error(`Invalid axis: ${e}`);if(this.axis.length!==yv(this.axis).length)throw Error(`Found duplicate axes in: ${this.axis}`);let n=this.axis.map(t=>e[t]);this.gamma=this.scale?this.addWeight(`gamma`,n,`float32`,this.gammaInitializer,this.gammaRegularizer,!0):null,this.beta=this.center?this.addWeight(`beta`,n,`float32`,this.betaInitializer,this.betaRegularizer,!0):null,this.built=!0}call(e,t){let n=Y(e),r=n.shape,i=r.length;return I(()=>{let{mean:e,variance:t}=Lu(n,this.axis,!0),a=ov(1,i);for(let e of this.axis)a[e]=r[e];let o=e=>e!=null&&e.shape.length!==i?H(e,a):e,s=this.scale?o(this.gamma.read()):null,c=this.center?o(this.beta.read()):null,l=[],u=[];for(let e=0;e<i;++e)this.axis.indexOf(e)===-1?(l.push(1),u.push(r[e])):(l.push(r[e]),u.push(1));return e=Sl(e,l),t=Sl(t,l),s!=null&&(s=Sl(s,u)),c!=null&&(c=Sl(c,u)),dw(n,e,t,c,s,this.epsilon)})}getConfig(){let e={axis:this.axis,epsilon:this.epsilon,center:this.center,scale:this.scale,betaInitializer:Jy(this.betaInitializer),gammaInitializer:Jy(this.gammaInitializer),betaRegularizer:XS(this.betaRegularizer),gammaRegularizer:XS(this.gammaRegularizer)},t=super.getConfig();return Object.assign(e,t),e}};gw.className=`LayerNormalization`,K(gw);function _w(e,t,n){return I(()=>{if(e.rank!==4)throw new q(`temporalPadding expects input tensor to be 4-D, but received a ${e.rank}-D tensor.`);if(t??=[[1,1],[1,1]],t.length!==2||t[0].length!==2||t[1].length!==2)throw new q("spatial2dPadding expects `padding` to be an Array of two Arrays, each of which is an Array of two integers.");if(n??=ny(),n!==`channelsLast`&&n!==`channelsFirst`)throw new q(`Unknown data format: ${n}. Supported data formats are 'channelsLast' and 'channelsFirst.`);let r;return r=n===`channelsFirst`?[[0,0],[0,0],t[0],t[1]]:[[0,0],t[0],t[1],[0,0]],Gu(e,r)})}var vw=class extends ub{constructor(e){if(e??={},super(e),this.dataFormat=e.dataFormat==null?ny():e.dataFormat,e.padding==null)this.padding=[[1,1],[1,1]];else if(typeof e.padding==`number`)this.padding=[[e.padding,e.padding],[e.padding,e.padding]];else{if(e.padding=e.padding,e.padding.length!==2)throw new q(`ZeroPadding2D expects padding to be a length-2 array, but received a length-${e.padding.length} array.`);let t,n;if(typeof e.padding[0]==`number`)t=[e.padding[0],e.padding[0]],n=[e.padding[1],e.padding[1]];else{if(e.padding=e.padding,e.padding[0].length!==2)throw new q(`ZeroPadding2D expects height padding to be a length-2 array, but received a length-${e.padding[0].length} array.`);if(t=e.padding[0],e.padding[1].length!==2)throw new q(`ZeroPadding2D expects width padding to be a length-2 array, but received a length-${e.padding[1].length} array.`);n=e.padding[1]}this.padding=[t,n]}this.inputSpec=[new ab({ndim:4})]}computeOutputShape(e){e=Qy(e);let t,n;return this.dataFormat===`channelsFirst`?(t=e[2]!=null&&e[2]>=0?e[2]+this.padding[0][0]+this.padding[0][1]:null,n=e[3]!=null&&e[3]>=0?e[3]+this.padding[1][0]+this.padding[1][1]:null,[e[0],e[1],t,n]):(t=e[1]!=null&&e[1]>=0?e[1]+this.padding[0][0]+this.padding[0][1]:null,n=e[2]!=null&&e[2]>=0?e[2]+this.padding[1][0]+this.padding[1][1]:null,[e[0],t,n,e[3]])}call(e,t){return I(()=>_w(Y(e),this.padding,this.dataFormat))}getConfig(){let e={padding:this.padding,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}};vw.className=`ZeroPadding2D`,K(vw);function yw(e,t,n,r,i,a){return I(()=>{Lv(i),Bv(a),zv(r),n??=[1,1],r??=`valid`,i??=ny(),a??=`max`,e=cC(e,i);let o,s=r===`same`?`same`:`valid`;return o=a===`max`?xu(e,t,n,s):ls(e,t,n,s),i===`channelsFirst`&&(o=Rf(o,[0,3,1,2])),o})}function bw(e,t,n,r,i,a){return I(()=>{Lv(i),Bv(a),zv(r),n??=[1,1,1],r??=`valid`,i??=ny(),a??=`max`,e=lC(e,i);let o,s=r===`same`?`same`:`valid`;return o=a===`max`?Cu(e,t,n,s):ds(e,t,n,s),i===`channelsFirst`&&(o=Rf(o,[0,4,1,2,3])),o})}var xw=class extends ub{constructor(e){if(e.poolSize??=2,super(e),typeof e.poolSize==`number`)this.poolSize=[e.poolSize];else if(Array.isArray(e.poolSize)&&e.poolSize.length===1&&typeof e.poolSize[0]==`number`)this.poolSize=e.poolSize;else throw new q(`poolSize for 1D convolutional layer must be a number or an Array of a single number, but received ${JSON.stringify(e.poolSize)}`);if(Cv(this.poolSize,`poolSize`),e.strides==null)this.strides=this.poolSize;else if(typeof e.strides==`number`)this.strides=[e.strides];else if(Array.isArray(e.strides)&&e.strides.length===1&&typeof e.strides[0]==`number`)this.strides=e.strides;else throw new q(`strides for 1D convolutional layer must be a number or an Array of a single number, but received ${JSON.stringify(e.strides)}`);Cv(this.strides,`strides`),this.padding=e.padding==null?`valid`:e.padding,zv(this.padding),this.inputSpec=[new ab({ndim:3})]}computeOutputShape(e){e=Qy(e);let t=oC(e[1],this.poolSize[0],this.padding,this.strides[0]);return[e[0],t,e[2]]}call(e,t){return I(()=>(this.invokeCallHook(e,t),e=iy(Y(e),2),df(this.poolingFunction(Y(e),[this.poolSize[0],1],[this.strides[0],1],this.padding,`channelsLast`),[2])))}getConfig(){let e={poolSize:this.poolSize,padding:this.padding,strides:this.strides},t=super.getConfig();return Object.assign(e,t),e}},Sw=class extends xw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Lv(i),zv(r),yw(e,t,n,r,i,`max`)}};Sw.className=`MaxPooling1D`,K(Sw);var Cw=class extends xw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Lv(i),zv(r),yw(e,t,n,r,i,`avg`)}};Cw.className=`AveragePooling1D`,K(Cw);var ww=class extends ub{constructor(e){if(e.poolSize??=[2,2],super(e),this.poolSize=Array.isArray(e.poolSize)?e.poolSize:[e.poolSize,e.poolSize],e.strides==null)this.strides=this.poolSize;else if(Array.isArray(e.strides)){if(e.strides.length!==2)throw new q(`If the strides property of a 2D pooling layer is an Array, it is expected to have a length of 2, but received length ${e.strides.length}.`);this.strides=e.strides}else this.strides=[e.strides,e.strides];Cv(this.poolSize,`poolSize`),Cv(this.strides,`strides`),this.padding=e.padding==null?`valid`:e.padding,this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Lv(this.dataFormat),zv(this.padding),this.inputSpec=[new ab({ndim:4})]}computeOutputShape(e){e=Qy(e);let t=this.dataFormat===`channelsFirst`?e[2]:e[1],n=this.dataFormat===`channelsFirst`?e[3]:e[2];return t=oC(t,this.poolSize[0],this.padding,this.strides[0]),n=oC(n,this.poolSize[1],this.padding,this.strides[1]),this.dataFormat===`channelsFirst`?[e[0],e[1],t,n]:[e[0],t,n,e[3]]}call(e,t){return I(()=>(this.invokeCallHook(e,t),this.poolingFunction(Y(e),this.poolSize,this.strides,this.padding,this.dataFormat)))}getConfig(){let e={poolSize:this.poolSize,padding:this.padding,strides:this.strides,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}},Tw=class extends ww{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Lv(i),zv(r),yw(e,t,n,r,i,`max`)}};Tw.className=`MaxPooling2D`,K(Tw);var Ew=class extends ww{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Lv(i),zv(r),yw(e,t,n,r,i,`avg`)}};Ew.className=`AveragePooling2D`,K(Ew);var Dw=class extends ub{constructor(e){if(e.poolSize??=[2,2,2],super(e),this.poolSize=Array.isArray(e.poolSize)?e.poolSize:[e.poolSize,e.poolSize,e.poolSize],e.strides==null)this.strides=this.poolSize;else if(Array.isArray(e.strides)){if(e.strides.length!==3)throw new q(`If the strides property of a 3D pooling layer is an Array, it is expected to have a length of 3, but received length ${e.strides.length}.`);this.strides=e.strides}else this.strides=[e.strides,e.strides,e.strides];Cv(this.poolSize,`poolSize`),Cv(this.strides,`strides`),this.padding=e.padding==null?`valid`:e.padding,this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Lv(this.dataFormat),zv(this.padding),this.inputSpec=[new ab({ndim:5})]}computeOutputShape(e){e=Qy(e);let t=this.dataFormat===`channelsFirst`?e[2]:e[1],n=this.dataFormat===`channelsFirst`?e[3]:e[2],r=this.dataFormat===`channelsFirst`?e[4]:e[3];return t=oC(t,this.poolSize[0],this.padding,this.strides[0]),n=oC(n,this.poolSize[1],this.padding,this.strides[1]),r=oC(r,this.poolSize[2],this.padding,this.strides[2]),this.dataFormat===`channelsFirst`?[e[0],e[1],t,n,r]:[e[0],t,n,r,e[4]]}call(e,t){return I(()=>(this.invokeCallHook(e,t),this.poolingFunction(Y(e),this.poolSize,this.strides,this.padding,this.dataFormat)))}getConfig(){let e={poolSize:this.poolSize,padding:this.padding,strides:this.strides,dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}},Ow=class extends Dw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Lv(i),zv(r),bw(e,t,n,r,i,`max`)}};Ow.className=`MaxPooling3D`,K(Ow);var kw=class extends Dw{constructor(e){super(e)}poolingFunction(e,t,n,r,i){return Lv(i),zv(r),bw(e,t,n,r,i,`avg`)}};kw.className=`AveragePooling3D`,K(kw);var Aw=class extends ub{constructor(e){super(e),this.inputSpec=[new ab({ndim:3})]}computeOutputShape(e){return[e[0],e[2]]}call(e,t){throw new J}},jw=class extends Aw{constructor(e){super(e||{})}call(e,t){return I(()=>Du(Y(e),1))}};jw.className=`GlobalAveragePooling1D`,K(jw);var Mw=class extends Aw{constructor(e){super(e||{})}call(e,t){return I(()=>$c(Y(e),1))}};Mw.className=`GlobalMaxPooling1D`,K(Mw);var Nw=class extends ub{constructor(e){super(e),this.dataFormat=e.dataFormat==null?`channelsLast`:e.dataFormat,Lv(this.dataFormat),this.inputSpec=[new ab({ndim:4})]}computeOutputShape(e){return e=e,this.dataFormat===`channelsLast`?[e[0],e[3]]:[e[0],e[1]]}call(e,t){throw new J}getConfig(){let e={dataFormat:this.dataFormat},t=super.getConfig();return Object.assign(e,t),e}},Pw=class extends Nw{call(e,t){return I(()=>{let t=Y(e);return this.dataFormat===`channelsLast`?Du(t,[1,2]):Du(t,[2,3])})}};Pw.className=`GlobalAveragePooling2D`,K(Pw);var Fw=class extends Nw{call(e,t){return I(()=>{let t=Y(e);return this.dataFormat===`channelsLast`?$c(t,[1,2]):$c(t,[2,3])})}};Fw.className=`GlobalMaxPooling2D`,K(Fw);var Iw=class extends ub{constructor(e){super(e),this.layer=e.layer}build(e){this.built=!0}get trainable(){return this.layer!=null&&this.layer.trainable}set trainable(e){this.layer!=null&&(this.layer.trainable=e)}get trainableWeights(){return this.layer.trainableWeights}get nonTrainableWeights(){return this.layer.nonTrainableWeights}get updates(){return this.layer._updates}get losses(){return this.layer.losses}getWeights(){return this.layer.getWeights()}setWeights(e){this.layer.setWeights(e)}getConfig(){let e={layer:{className:this.layer.getClassName(),config:this.layer.getConfig()}},t=super.getConfig();return Object.assign(e,t),e}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.layer!=null&&this.layer.setFastWeightInitDuringBuild(e)}static fromConfig(e,t,n={}){let r=t.layer,i=Yb(r,n);delete t.layer;let a={layer:i};return Object.assign(a,t),new e(a)}},Lw=class extends Iw{constructor(e){super(e),this.supportsMasking=!0}build(e){if(e=Qy(e),e.length<3)throw new q(`TimeDistributed layer expects an input shape >= 3D, but received input shape ${JSON.stringify(e)}`);this.inputSpec=[{shape:e}];let t=[e[0]].concat(e.slice(2));this.layer.built||(this.layer.build(t),this.layer.built=!0),super.build(e)}computeOutputShape(e){e=Qy(e);let t=[e[0]].concat(e.slice(2)),n=this.layer.computeOutputShape(t),r=e[1];return[n[0],r].concat(n.slice(1))}call(e,t){return I(()=>(e=Y(e),DC((e,n)=>[Y(this.layer.call(e,t)),[]],e,[],!1,null,null,!1,!0)[1]))}};Lw.className=`TimeDistributed`,K(Lw);function Rw(e){xv(Fv,`BidirectionalMergeMode`,e)}var zw=`concat`,Bw=class extends Iw{constructor(e){super(e);let t=e.layer.getConfig(),n={};n.className=e.layer.getClassName(),n.config=t,this.forwardLayer=Yb(n),t.goBackwards=t.goBackwards!==!0;let r={};if(r.className=e.layer.getClassName(),r.config=t,this.backwardLayer=Yb(r),this.forwardLayer.name=`forward_`+this.forwardLayer.name,this.backwardLayer.name=`backward_`+this.backwardLayer.name,this.mergeMode=e.mergeMode===void 0?zw:e.mergeMode,Rw(this.mergeMode),e.weights)throw new J(`weights support is not implemented for Bidirectional layer yet.`);this._stateful=e.layer.stateful,this.returnSequences=e.layer.returnSequences,this.returnState=e.layer.returnState,this.supportsMasking=!0,this._trainable=!0,this.inputSpec=e.layer.inputSpec,this.numConstants=null}get trainable(){return this._trainable}set trainable(e){this._trainable=e,this.forwardLayer!=null&&(this.forwardLayer.trainable=e),this.backwardLayer!=null&&(this.backwardLayer.trainable=e)}getWeights(){return this.forwardLayer.getWeights().concat(this.backwardLayer.getWeights())}setWeights(e){let t=e.length,n=Math.floor(t/2);this.forwardLayer.setWeights(e.slice(0,n)),this.backwardLayer.setWeights(e.slice(n))}computeOutputShape(e){let t=this.forwardLayer.computeOutputShape(e);Array.isArray(t)&&Array.isArray(t[0])||(t=[t]),t=t;let n,r,i;return this.returnState&&(i=t.slice(1)),n=t[0],n=n,this.mergeMode===`concat`?(n[n.length-1]*=2,r=[n]):r=this.mergeMode==null?[n,n.slice()]:[n],this.returnState?this.mergeMode==null?r.concat(i).concat(i.slice()):[n].concat(i,i.slice()):lv(r)}apply(e,t){let n=t==null?null:t.initialState,r=t==null?null:t.constants;t??={};let i=EC(e,n,r,this.numConstants);if(e=i.inputs,n=i.initialState,r=i.constants,Array.isArray(e)&&(n=e.slice(1),e=e[0]),(n==null||n.length===0)&&r==null)return super.apply(e,t);let a=[],o=[];if(n!=null){let e=n.length;if(e%2>0)throw new q("When passing `initialState` to a Bidrectional RNN, the state should be an Array containing the states of the underlying RNNs.");t.initialState=n,a.push(...n);let r=n.map(e=>new ab({shape:e.shape}));this.forwardLayer.stateSpec=r.slice(0,e/2),this.backwardLayer.stateSpec=r.slice(e/2),o.push(...r)}if(r!=null)throw new J(`Support for constants in Bidirectional layers is not implemented yet.`);let s=a[0]instanceof ob;for(let e of a)if(e instanceof ob!==s)throw new q(`The initial state of a Bidirectional layer cannot be specified as a mix of symbolic and non-symbolic tensors`);if(s){let n=[e].concat(a),r=this.inputSpec.concat(o),i=this.inputSpec;this.inputSpec=r;let s=super.apply(n,t);return this.inputSpec=i,s}return super.apply(e,t)}call(e,t){return I(()=>{let n=t.initialState,r,i;if(n==null)r=this.forwardLayer.call(e,t),i=this.backwardLayer.call(e,t);else{let a=n.slice(0,n.length/2),o=n.slice(n.length/2);r=this.forwardLayer.call(e,Object.assign(t,{initialState:a})),i=this.backwardLayer.call(e,Object.assign(t,{initialState:o}))}let a;this.returnState&&(Array.isArray(r)&&(a=r.slice(1).concat(i.slice(1))),r=r[0],i=i[0]),this.returnSequences&&(i=Ed(i,1));let o;return this.mergeMode===`concat`?o=dy([r,i]):this.mergeMode===`sum`?o=z(r,i):this.mergeMode===`ave`?o=V(.5,z(r,i)):this.mergeMode===`mul`?o=V(r,i):this.mergeMode??(o=[r,i]),this.returnState?this.mergeMode==null?o.concat(a):[o].concat(a):o})}resetStates(e){this.forwardLayer.resetStates(),this.backwardLayer.resetStates()}build(e){Uv(this.forwardLayer.name,()=>{this.forwardLayer.build(e)}),Uv(this.backwardLayer.name,()=>{this.backwardLayer.build(e)}),this.built=!0}computeMask(e,t){Array.isArray(t)&&(t=t[0]);let n;if(n=this.returnSequences?this.mergeMode==null?[t,t]:t:this.mergeMode==null?[null,null]:null,this.returnState){let e=this.forwardLayer.states.map(e=>null);return Array.isArray(n)?n.concat(e).concat(e):[n].concat(e,e)}return n}get trainableWeights(){return this.forwardLayer.trainableWeights.concat(this.backwardLayer.trainableWeights)}get nonTrainableWeights(){return this.forwardLayer.nonTrainableWeights.concat(this.backwardLayer.nonTrainableWeights)}setFastWeightInitDuringBuild(e){super.setFastWeightInitDuringBuild(e),this.forwardLayer!=null&&this.forwardLayer.setFastWeightInitDuringBuild(e),this.backwardLayer!=null&&this.backwardLayer.setFastWeightInitDuringBuild(e)}getConfig(){let e={mergeMode:this.mergeMode},t=super.getConfig();return Object.assign(e,t),e}static fromConfig(e,t){let n=Yb(t.layer);if(delete t.layer,t.numConstants!=null)throw new J(`Deserialization of a Bidirectional layer with numConstants present is not supported yet.`);let r=t;return r.layer=n,new e(r)}};Bw.className=`Bidirectional`,K(Bw);var Vw=class extends ub{constructor(e){super(e),this.scale=e.scale,this.offset=e.offset?e.offset:0}getConfig(){let e={scale:this.scale,offset:this.offset},t=super.getConfig();return Object.assign(e,t),e}call(e,t){return I(()=>(e=Y(e),e.dtype!==`float32`&&(e=ry(e,`float32`)),z(V(e,this.scale),this.offset)))}};Vw.className=`Rescaling`,K(Vw);var{resizeBilinear:Hw,cropAndResize:Uw}=Qp,Ww=class extends ub{constructor(e){super(e),this.height=e.height,this.width=e.width}centerCrop(e,t,n,r,i,a,o,s){return I(()=>{let c,l=!1,u=[t/a,n/o,(r+t)/a,(i+n)/o],d=[];e.rank===3?(l=!0,c=pf([e])):c=e;for(let e=0;e<c.shape[0];e++)d.push(u);let f=ua(d,[d.length,4]),p=gd(0,d.length,1,`int32`),m=Uw(c,f,p,[r,i],`nearest`);return ry(l?Y(Pf(m)):m,s)})}upsize(e,t,n,r){return I(()=>ry(Hw(e,[t,n]),r))}call(e,t){return I(()=>{let t=Y(e),n=t.dtype,r=t.shape,i=r[r.length-3],a=r[r.length-2],o=0;i!==this.height&&(o=Math.floor((i-this.height)/2));let s=0;return a!==this.width&&(s=Math.floor((a-this.width)/2),s===0&&(s=1)),o>=0&&s>=0?this.centerCrop(t,o,s,this.height,this.width,i,a,n):this.upsize(e,this.height,this.width,n)})}getConfig(){let e={height:this.height,width:this.width},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){e=Qy(e);let t=e.length-3,n=e.length-2;return e[t]=this.height,e[n]=this.width,e}};Ww.className=`CenterCrop`,K(Ww);function Gw(e,t,n,r){let i=Y(e);if(i.dtype!==`int32`&&(i=ry(i,`int32`)),t===`int`)return i;let a=i.shape;if(i.rank===0&&(i=vl(i,-1)),t===`oneHot`&&i.shape[i.shape.length-1]!==1&&(i=vl(i,-1)),i.rank>2)throw new q(`When outputMode is not int, maximum output rank is 2 Received outputMode ${t} and input shape ${a} which would result in output rank ${i.rank}.`);let o=[`multiHot`,`oneHot`].includes(t),s=i,c;if(c=r!==void 0&&t===`count`?yc(s,r,n,o):yc(s,[],n,o),t!==`tfIdf`)return c;if(r)return V(c,r);throw new q(`When outputMode is 'tfIdf', weights must be provided.`)}var Kw=class extends ub{constructor(e){super(e),this.numTokens=e.numTokens,this.outputMode=e.outputMode?e.outputMode:`multiHot`}getConfig(){let e={numTokens:this.numTokens,outputMode:this.outputMode},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){return e=Qy(e),e==null?[this.numTokens]:this.outputMode===`oneHot`&&e[e.length-1]!==1?(e.push(this.numTokens),e):(e[e.length-1]=this.numTokens,e)}call(e,t){return I(()=>{e=Y(e),e.dtype!==`int32`&&(e=ry(e,`int32`));let n;if(t.countWeights!==void 0){if(this.outputMode!==`count`)throw new q(`countWeights is not used when outputMode !== count.
              Received countWeights=${t.countWeights}`);n=Y(t.countWeights)}let r=$c(e),i=tl(e),a=Al(this.numTokens,r).bufferSync().get(0),o=Ml(i,0).bufferSync().get(0);if(!(a&&o))throw new q(`Input values must be between 0 < values <= numTokens with numTokens=${this.numTokens}`);return Gw(e,this.outputMode,this.numTokens,n)})}};Kw.className=`CategoryEncoding`,K(Kw);var qw=new Set([`bilinear`,`nearest`]),Jw=class extends ub{constructor(e){if(super(e),this.height=e.height,this.width=e.width,e.interpolation)if(qw.has(e.interpolation))this.interpolation=e.interpolation;else throw new q(`Invalid interpolation parameter: ${e.interpolation} is not implemented`);else this.interpolation=`bilinear`;this.cropToAspectRatio=!!e.cropToAspectRatio}computeOutputShape(e){e=Qy(e);let t=e[2];return[this.height,this.width,t]}getConfig(){let e={height:this.height,width:this.width,interpolation:this.interpolation,cropToAspectRatio:this.cropToAspectRatio},t=super.getConfig();return Object.assign(e,t),e}call(e,t){return I(()=>{let t=[this.height,this.width];if(this.interpolation===`bilinear`)return Qp.resizeBilinear(e,t,!this.cropToAspectRatio);if(this.interpolation===`nearest`)return Qp.resizeNearestNeighbor(e,t,!this.cropToAspectRatio);throw Error(`Interpolation is ${this.interpolation} but only ${[...qw]} are supported`)})}};Jw.className=`Resizing`,K(Jw);var Yw=class{constructor(e){this.seed=e}next(){if(this.seed!==void 0)return this.seed++}};Yw.className=`RandomSeed`;var Xw=class extends ub{constructor(e){super(e),this.randomGenerator=new Yw(e.seed)}getConfig(){let e={seed:this.randomGenerator.seed},t=super.getConfig();return Object.assign(e,t),e}};Xw.className=`BaseRandomLayer`;var Zw=new Set([`bilinear`,`nearest`]),Qw=class extends Xw{constructor(e){super(e);let{factor:t,interpolation:n=`bilinear`}=e;if(this.factor=t,Array.isArray(this.factor)&&this.factor.length===2)this.widthLower=this.factor[0],this.widthUpper=this.factor[1];else if(!Array.isArray(this.factor)&&this.factor>0)this.widthLower=-this.factor,this.widthUpper=this.factor;else throw new q(`Invalid factor: ${this.factor}. Must be positive number or tuple of 2 numbers`);if(this.widthLower<-1||this.widthUpper<-1)throw new q(`factor must have values larger than -1. Got: ${this.factor}`);if(this.widthUpper<this.widthLower)throw new q(`factor cannot have upper bound less than lower bound.
        Got upper bound: ${this.widthUpper}.
        Got lower bound: ${this.widthLower}
      `);if(n)if(Zw.has(n))this.interpolation=n;else throw new q(`Invalid interpolation parameter: ${n} is not implemented`)}getConfig(){let e={factor:this.factor,interpolation:this.interpolation},t=super.getConfig();return Object.assign(e,t),e}computeOutputShape(e){e=Qy(e);let t=e[2];return[this.imgHeight,-1,t]}call(e,t){return I(()=>{let t=Y(e);this.imgHeight=t.shape[t.shape.length-3];let n=t.shape[t.shape.length-2];this.widthFactor=hd([1],1+this.widthLower,1+this.widthUpper,`float32`,this.randomGenerator.next());let r=this.widthFactor.dataSync()[0]*n;r=Math.round(r);let i=[this.imgHeight,r];switch(this.interpolation){case`bilinear`:return Qp.resizeBilinear(e,i);case`nearest`:return Qp.resizeNearestNeighbor(e,i);default:throw Error(`Interpolation is ${this.interpolation}
          but only ${[...Zw]} are supported`)}})}};Qw.className=`RandomWidth`,K(Qw),j().registerFlag(`KEEP_INTERMEDIATE_TENSORS`,()=>!1,e=>{e&&console.warn(`Keep intermediate tensors is ON. This will print the values of all intermediate tensors during model inference. Not all models support this mode. For details, check e2e/benchmarks/ model_config.js. This significantly impacts performance.`)});var $w;(function(e){e[e.DT_INVALID=0]=`DT_INVALID`,e[e.DT_FLOAT=1]=`DT_FLOAT`,e[e.DT_DOUBLE=2]=`DT_DOUBLE`,e[e.DT_INT32=3]=`DT_INT32`,e[e.DT_UINT8=4]=`DT_UINT8`,e[e.DT_INT16=5]=`DT_INT16`,e[e.DT_INT8=6]=`DT_INT8`,e[e.DT_STRING=7]=`DT_STRING`,e[e.DT_COMPLEX64=8]=`DT_COMPLEX64`,e[e.DT_INT64=9]=`DT_INT64`,e[e.DT_BOOL=10]=`DT_BOOL`,e[e.DT_QINT8=11]=`DT_QINT8`,e[e.DT_QUINT8=12]=`DT_QUINT8`,e[e.DT_QINT32=13]=`DT_QINT32`,e[e.DT_BFLOAT16=14]=`DT_BFLOAT16`,e[e.DT_QINT16=15]=`DT_QINT16`,e[e.DT_QUINT16=16]=`DT_QUINT16`,e[e.DT_UINT16=17]=`DT_UINT16`,e[e.DT_COMPLEX128=18]=`DT_COMPLEX128`,e[e.DT_HALF=19]=`DT_HALF`,e[e.DT_RESOURCE=20]=`DT_RESOURCE`,e[e.DT_VARIANT=21]=`DT_VARIANT`,e[e.DT_UINT32=22]=`DT_UINT32`,e[e.DT_UINT64=23]=`DT_UINT64`,e[e.DT_FLOAT_REF=101]=`DT_FLOAT_REF`,e[e.DT_DOUBLE_REF=102]=`DT_DOUBLE_REF`,e[e.DT_INT32_REF=103]=`DT_INT32_REF`,e[e.DT_UINT8_REF=104]=`DT_UINT8_REF`,e[e.DT_INT16_REF=105]=`DT_INT16_REF`,e[e.DT_INT8_REF=106]=`DT_INT8_REF`,e[e.DT_STRING_REF=107]=`DT_STRING_REF`,e[e.DT_COMPLEX64_REF=108]=`DT_COMPLEX64_REF`,e[e.DT_INT64_REF=109]=`DT_INT64_REF`,e[e.DT_BOOL_REF=110]=`DT_BOOL_REF`,e[e.DT_QINT8_REF=111]=`DT_QINT8_REF`,e[e.DT_QUINT8_REF=112]=`DT_QUINT8_REF`,e[e.DT_QINT32_REF=113]=`DT_QINT32_REF`,e[e.DT_BFLOAT16_REF=114]=`DT_BFLOAT16_REF`,e[e.DT_QINT16_REF=115]=`DT_QINT16_REF`,e[e.DT_QUINT16_REF=116]=`DT_QUINT16_REF`,e[e.DT_UINT16_REF=117]=`DT_UINT16_REF`,e[e.DT_COMPLEX128_REF=118]=`DT_COMPLEX128_REF`,e[e.DT_HALF_REF=119]=`DT_HALF_REF`,e[e.DT_RESOURCE_REF=120]=`DT_RESOURCE_REF`,e[e.DT_VARIANT_REF=121]=`DT_VARIANT_REF`,e[e.DT_UINT32_REF=122]=`DT_UINT32_REF`,e[e.DT_UINT64_REF=123]=`DT_UINT64_REF`})($w||={});var eT;(function(e){(function(e){e[e.LEGACY=0]=`LEGACY`,e[e.V1=1]=`V1`,e[e.V2=2]=`V2`})(e.CheckpointFormatVersion||={})})(eT||={});function tT(e,t){return nT(e,t)}function nT(e,t,n=new Map,r=new Set){if(e==null)return null;if(typeof Blob==`function`&&e instanceof Blob)return e.slice();if(r.has(e))throw Error(`Circular references are not supported.`);if(n.has(e))return n.get(e);let i=t(e);if(i.recurse&&i.value!==null)throw Error(`A deep map function may not return both a value and recurse=true.`);if(!i.recurse)return n.set(e,i.value),i.value;if(oT(e)){let i=Array.isArray(e)?[]:{};r.add(e);for(let a in e){let o=e[a];i[a]=nT(o,t,n,r)}return r.delete(e),e.__proto__&&(i.__proto__=e.__proto__),i}throw Error(`Can't recurse into non-iterable type: ${e}`)}function rT(e,t=aT){return iT(e,t)}function iT(e,t,n=new Set){let r=e[0];if(n.has(r))throw Error(`Circular references are not supported.`);let i=t(e);if(i.recurse&&i.value!==null)throw Error(`A deep zip function may not return both a value and recurse=true.`);if(!i.recurse)return i.value;if(oT(r)){let i=Array.isArray(r)?[]:{};n.add(r);for(let a in r)i[a]=iT(e.map(e=>e[a]),t,n);return n.delete(r),i}throw Error(`Can't recurse into non-iterable type: ${r}`)}function aT(e){return e===null?null:oT(e[0])?{value:null,recurse:!0}:{value:e,recurse:!1}}function oT(e){let t=!1;if(j().get(`IS_BROWSER`))t=e instanceof TextDecoder;else{let{StringDecoder:n}=a();t=e instanceof n}return e!=null&&!ArrayBuffer.isView(e)&&(Array.isArray(e)||typeof e==`object`&&!(e instanceof Oi)&&!(e instanceof Promise)&&!t)}function sT(e){return e==null||cT(e)||Array.isArray(e)||typeof e==`object`&&e instanceof Oi||si(e)}function cT(e){return e===null||typeof e!=`object`&&typeof e!=`function`}function lT(e){return tT(e,uT)}function uT(e){return e instanceof Oi?{value:e.clone(),recurse:!1}:oT(e)?{value:null,recurse:!0}:{value:e,recurse:!1}}var dT=class{constructor(e){if(this.capacity=e,this.begin=0,this.end=0,e==null)throw RangeError(`Can't create a ring buffer of unknown capacity.`);if(e<1)throw RangeError(`Can't create ring buffer of capacity < 1.`);this.data=Array(e),this.doubledCapacity=2*e}wrap(e){for(;e<0;)e+=this.doubledCapacity;return e%this.doubledCapacity}get(e){if(e<0)throw RangeError(`Can't get item at a negative index.`);return this.data[e%this.capacity]}set(e,t){if(e<0)throw RangeError(`Can't set item at a negative index.`);this.data[e%this.capacity]=t}length(){let e=this.end-this.begin;return e<0&&(e=this.doubledCapacity+e),e}isFull(){return this.length()===this.capacity}isEmpty(){return this.length()===0}push(e){if(this.isFull())throw RangeError(`Ring buffer is full.`);this.set(this.end,e),this.end=this.wrap(this.end+1)}pushAll(e){for(let t of e)this.push(t)}pop(){if(this.isEmpty())throw RangeError(`Ring buffer is empty.`);this.end=this.wrap(this.end-1);let e=this.get(this.end);return this.set(this.end,void 0),e}unshift(e){if(this.isFull())throw RangeError(`Ring buffer is full.`);this.begin=this.wrap(this.begin-1),this.set(this.begin,e)}shift(){if(this.isEmpty())throw RangeError(`Ring buffer is empty.`);let e=this.get(this.begin);return this.set(this.begin,void 0),this.begin=this.wrap(this.begin+1),e}shuffleExcise(e){if(this.isEmpty())throw RangeError(`Ring buffer is empty.`);let t=this.wrap(this.begin+e),n=this.get(t);return this.set(t,this.pop()),n}},fT=class e extends dT{constructor(){super(e.INITIAL_CAPACITY)}isFull(){return!1}push(e){super.isFull()&&this.expand(),super.push(e)}unshift(e){super.isFull()&&this.expand(),super.unshift(e)}expand(){let e=this.capacity*2,t=Array(e),n=this.length();for(let e=0;e<n;e++)t[e]=this.get(this.wrap(this.begin+e));this.data=t,this.capacity=e,this.doubledCapacity=2*this.capacity,this.begin=0,this.end=n}};fT.INITIAL_CAPACITY=32;function pT(e){return new _T(e)}function mT(e){return new vT(e)}function hT(e,t){return new kT(e,t)}var gT=class{async toArray(){let e=[],t=await this.next();for(;!t.done;)e.push(t.value),t=await this.next();return e}async toArrayForTest(){let e=this.prefetch(100),t=[],n=await e.next();for(;!n.done;)t.push(n.value),n=await e.next();return t}async resolveFully(){let e=await this.next();for(;!e.done;)e=await this.next()}async resolveWhile(e){let t=await this.next(),n=e(t.value);for(;!t.done&&n;)t=await this.next(),n=e(t.value)}handleErrors(e){return new TT(this,e)}filter(e){return new CT(this,e)}map(e){return new wT(this,e)}mapAsync(e){return new ET(this,e)}serialMapAsync(e){return new ET(this,e).serial()}flatmap(e){return new OT(this,e)}async forEachAsync(e){return this.map(e).resolveFully()}async serialForEach(e){return this.serialMapAsync(e).resolveWhile(e=>e===!0)}rowMajorBatch(e,t=!0){return new ST(this,e,t)}columnMajorBatch(e,t=!0,n=aT){return this.rowMajorBatch(e,t).map(e=>rT(e,n))}concatenate(e,t){return new kT(pT([this,e]),t)}take(e){return e<0||e==null?this:new xT(this,e)}skip(e){return e<0||e==null?this:new bT(this,e)}prefetch(e){return new jT(this,e)}shuffle(e,t){return new MT(this,e,t)}serial(){return new yT(this)}},_T=class extends gT{constructor(e){super(),this.items=e,this.trav=0}summary(){return`Array of ${this.items.length} items`}async next(){if(this.trav>=this.items.length)return{value:null,done:!0};let e=this.items[this.trav];return this.trav++,{value:lT(e),done:!1}}},vT=class extends gT{constructor(e){super(),this.nextFn=e}summary(){return`Function call`}async next(){try{return this.nextFn()}catch(e){throw e.message=`Error thrown while iterating through a dataset: ${e.message}`,e}}},yT=class extends gT{constructor(e){super(),this.upstream=e,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> Serial`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){return this.upstream.next()}},bT=class extends gT{constructor(e,t){super(),this.upstream=e,this.maxCount=t,this.count=0,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> Skip`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;this.count++<this.maxCount;){let e=await this.upstream.next();if(e.done)return e;L(e.value)}return this.upstream.next()}},xT=class extends gT{constructor(e,t){super(),this.upstream=e,this.maxCount=t,this.count=0}summary(){return`${this.upstream.summary()} -> Take`}async next(){return this.count++>=this.maxCount?{value:null,done:!0}:this.upstream.next()}},ST=class extends gT{constructor(e,t,n=!0){super(),this.upstream=e,this.batchSize=t,this.enableSmallLastBatch=n,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> RowMajorBatch`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){let e=[];for(;e.length<this.batchSize;){let t=await this.upstream.next();if(t.done)return this.enableSmallLastBatch&&e.length>0?{value:e,done:!1}:{value:null,done:!0};e.push(t.value)}return{value:e,done:!1}}},CT=class extends gT{constructor(e,t){super(),this.upstream=e,this.predicate=t,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> Filter`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;;){let e=await this.upstream.next();if(e.done||this.predicate(e.value))return e;L(e.value)}}},wT=class extends gT{constructor(e,t){super(),this.upstream=e,this.transform=t}summary(){return`${this.upstream.summary()} -> Map`}async next(){let e=await this.upstream.next();if(e.done)return{value:null,done:!0};let t=Hi(e.value),n=this.transform(e.value),r=Hi(n);for(let e of t)Vi(e,r)||e.dispose();return{value:n,done:!1}}},TT=class extends gT{constructor(e,t){super(),this.upstream=e,this.handler=t,this.count=0,this.lastRead=Promise.resolve({value:null,done:!1})}summary(){return`${this.upstream.summary()} -> handleErrors`}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;;)try{return await this.upstream.next()}catch(e){if(!this.handler(e))return{value:null,done:!0}}}},ET=class extends gT{constructor(e,t){super(),this.upstream=e,this.transform=t}summary(){return`${this.upstream.summary()} -> AsyncMap`}async next(){let e=await this.upstream.next();if(e.done)return{value:null,done:!0};let t=Hi(e.value),n=await this.transform(e.value),r=Hi(n);for(let e of t)Vi(e,r)||e.dispose();return{value:n,done:!1}}},DT=class extends gT{constructor(){super(),this.outputQueue=new fT,this.lastRead=Promise.resolve({value:null,done:!1})}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}async serialNext(){for(;this.outputQueue.length()===0;)if(!await this.pump())return{value:null,done:!0};return{value:this.outputQueue.shift(),done:!1}}},OT=class extends DT{constructor(e,t){super(),this.upstream=e,this.transform=t}summary(){return`${this.upstream.summary()} -> Flatmap`}async pump(){let e=await this.upstream.next();if(e.done)return!1;let t=Hi(e.value),n=this.transform(e.value),r=Hi(n);this.outputQueue.pushAll(n);for(let e of t)Vi(e,r)||e.dispose();return!0}},kT=class extends gT{constructor(e,t){super(),this.baseErrorHandler=t,this.lastRead=null,this.iterator=null,this.moreIterators=e}summary(){return`TODO: fill in upstream of chained summaries -> Chained`}async next(){return this.lastRead=this.readFromChain(this.lastRead),this.lastRead}async readFromChain(e){if(await e,this.iterator==null){let e=await this.moreIterators.next();if(e.done)return{value:null,done:!0};this.iterator=e.value,this.baseErrorHandler!=null&&(this.iterator=this.iterator.handleErrors(this.baseErrorHandler))}let t=await this.iterator.next();return t.done?(this.iterator=null,this.readFromChain(e)):t}},AT;(function(e){e[e.FAIL=0]=`FAIL`,e[e.SHORTEST=1]=`SHORTEST`,e[e.LONGEST=2]=`LONGEST`})(AT||={});var jT=class extends gT{constructor(e,t){super(),this.upstream=e,this.bufferSize=t,this.buffer=new dT(t)}summary(){return`${this.upstream.summary()} -> Prefetch`}refill(){for(;!this.buffer.isFull();){let e=this.upstream.next();this.buffer.push(e)}}next(){return this.refill(),this.buffer.shift()}},MT=class extends jT{constructor(e,t,n){super(e,t),this.upstream=e,this.windowSize=t,this.upstreamExhausted=!1,this.random=ld.alea(n||ii().toString()),this.lastRead=Promise.resolve({value:null,done:!1})}async next(){return this.lastRead=this.lastRead.then(()=>this.serialNext()),this.lastRead}randomInt(e){return Math.floor(this.random()*e)}chooseIndex(){return this.randomInt(this.buffer.length())}async serialNext(){for(this.upstreamExhausted||this.refill();!this.buffer.isEmpty();){let e=this.chooseIndex(),t=await this.buffer.shuffleExcise(e);if(t.done)this.upstreamExhausted=!0;else return this.refill(),t}return{value:null,done:!0}}},NT=class{constructor(){this.size=null}batch(e,t=!0){let n=this;g(e>0,()=>`batchSize needs to be positive, but it is
      ${e}`);let r;return r=this.size===1/0||this.size==null?this.size:t?Math.ceil(this.size/e):Math.floor(this.size/e),PT(async()=>(await n.iterator()).columnMajorBatch(e,t,FT),r)}concatenate(e){let t=this,n;return n=this.size===1/0||e.size===1/0?1/0:this.size!=null&&e.size!=null?this.size+e.size:null,PT(async()=>(await t.iterator()).concatenate(await e.iterator()),n)}filter(e){let t=this,n;return n=this.size===1/0?1/0:null,PT(async()=>(await t.iterator()).filter(t=>I(()=>e(t))),n)}async forEachAsync(e){return(await this.iterator()).forEachAsync(e)}map(e){let t=this;return PT(async()=>(await t.iterator()).map(t=>I(()=>e(t))),this.size)}mapAsync(e){let t=this;return PT(async()=>(await t.iterator()).mapAsync(e),this.size)}prefetch(e){if(e==null)throw RangeError("`Dataset.prefetch()` requires bufferSize to be specified.");let t=this;return PT(async()=>(await t.iterator()).prefetch(e),this.size)}repeat(e){let t=this,n;return n=this.size!=null&&e>0?this.size*e:e===0?0:this.size!=null&&(e===void 0||e<0)?1/0:null,PT(async()=>hT(mT(async()=>({value:await t.iterator(),done:!1})).take(e)),n)}skip(e){let t=this,n;return n=this.size!=null&&e>=0&&this.size>=e?this.size-e:this.size!=null&&(this.size<e||e===void 0||e<0)?0:null,PT(async()=>(await t.iterator()).skip(e),n)}shuffle(e,t,n=!0){if(e==null||e<0)throw this.size==null?RangeError("`Dataset.shuffle()` requires bufferSize to be specified."):RangeError(`\`Dataset.shuffle()\` requires bufferSize to be specified.  If your data fits in main memory (for regular JS objects), and/or GPU memory (for \`tf.Tensor\`s), consider setting bufferSize to the dataset size (${this.size} elements)`);let r=this,i=ld.alea(t||ii().toString());return PT(async()=>{let t=i.int32();return n&&(t+=i.int32()),(await r.iterator()).shuffle(e,t.toString())},this.size)}take(e){let t=this,n;return n=this.size!=null&&this.size>e?e:this.size!=null&&this.size<=e?this.size:null,PT(async()=>(await t.iterator()).take(e),n)}async toArray(){if(this.size===1/0)throw Error(`Can not convert infinite data stream to array.`);return(await this.iterator()).toArray()}async toArrayForTest(){if(this.size===1/0)throw Error(`Can not convert infinite data stream to array.`);return(await this.iterator()).toArrayForTest()}};NT.MAX_BUFFER_SIZE=1e4;function PT(e,t=null){return new class extends NT{constructor(){super(...arguments),this.size=t}async iterator(){return e()}}}function FT(e){if(e===null)return null;let t=e[0];return sT(t)?{value:IT(e),recurse:!1}:{value:null,recurse:!0}}function IT(e){if(e.length===0)throw Error(`Can't make a batch of zero elements.`);return e[0]instanceof Oi?pf(e):ua(e)}function X(e,t){Array.isArray(e)||(e=[e]),e.forEach(e=>{e!=null&&g(e.dtype!==`complex64`,()=>`${t} does not support complex64 tensors in the CPU backend.`)})}var LT=If,RT=class e extends l{nextDataId(){return e.nextDataId++}constructor(){super(),this.blockSize=48,this.firstUse=!0,this.data=new c(this,pa())}write(e,t,n){this.firstUse&&(this.firstUse=!1,j().get(`IS_NODE`)&&Er(`
============================
Hi, looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, visit https://github.com/tensorflow/tfjs-node for more details. 
============================`));let r={id:this.nextDataId()};return this.data.set(r,{values:e,dtype:n,refCount:1}),r}makeTensorInfo(e,t,n){let r;if(t===`string`&&n!=null&&n.length>0&&ae(n[0])){let i=n.map(e=>ai(e));r=this.write(i,e,t)}else r=this.write(n,e,t);return{dataId:r,shape:e,dtype:t}}refCount(e){return this.data.has(e)?this.data.get(e).refCount:0}incRef(e){let t=this.data.get(e);t.refCount++}decRef(e){if(this.data.has(e)){let t=this.data.get(e);t.refCount--}}move(e,t,n,r,i){this.data.set(e,{values:t,dtype:r,refCount:i})}numDataIds(){return this.data.numDataIds()}async read(e){return this.readSync(e)}readSync(e){let{dtype:t,complexTensorInfos:n}=this.data.get(e);return t===`complex64`?sh(this.readSync(n.real.dataId),this.readSync(n.imag.dataId)):pe(this.data.get(e).values,t)}bufferSync(e){let t=this.readSync(e.dataId);if(e.dtype===`string`)try{let n=t.map(e=>oi(e));return so(e.shape,e.dtype,n)}catch{throw Error(`Failed to decode encoded string bytes into utf-8`)}return so(e.shape,e.dtype,t)}makeOutput(e,t,n){return pa().makeTensorFromTensorInfo(this.makeTensorInfo(t,n,e),this)}disposeData(e,t=!1){if(this.data.has(e)){if(this.data.get(e).refCount--,!t&&this.data.get(e).refCount>0)return!1;let{complexTensorInfos:n}=this.data.get(e);n!=null&&(this.disposeData(n.real.dataId,!0),this.disposeData(n.imag.dataId,!0)),this.data.delete(e)}return!0}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}async time(e){let t=ii();return e(),{kernelMs:ii()-t}}memory(){return{unreliable:!0,reasons:[`The reported memory is an upper bound. Due to automatic garbage collection, the true allocated memory may be less.`]}}where(e){X([e],`where`);let t=this.readSync(e.dataId);return LT(e.shape,t)}dispose(){}floatPrecision(){return 32}epsilon(){return super.epsilon()}};RT.nextDataId=0;function zT(e){let t=new Float32Array(e.length);for(let n=0;n<e.length;++n)t[n]=Math.abs(e[n]);return t}var BT={kernelName:`Abs`,backendName:`cpu`,kernelFunc:e=>{let{x:t}=e.inputs,n=e.backend;X(t,`abs`);let r=new Float32Array(y(t.shape)),i=n.data.get(t.dataId).values;return r=zT(i),n.makeOutput(r,t.shape,t.dtype)}};function VT(e){return(t,n,r,i,a)=>{let o=U(t,n),s=o.length,c=A(o),l=O(a,y(o)),u=t.length,d=n.length,f=A(t),p=A(n),m=Ec(t,o),h=Ec(n,o);if(m.length+h.length===0)for(let t=0;t<l.length;++t)l[t]=e(r[t%r.length],i[t%i.length]);else for(let t=0;t<l.length;++t){let n=ye(t,s,c),a=n.slice(-u);m.forEach(e=>a[e]=0);let o=ve(a,u,f),g=n.slice(-d);h.forEach(e=>g[e]=0);let _=ve(g,d,p);l[t]=e(r[o],i[_])}return[l,o]}}function HT(e){let{inputs:t,backend:n}=e,{real:r,imag:i}=t,a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,s=n.makeTensorInfo(r.shape,`complex64`),c=n.data.get(s.dataId);return c.complexTensorInfos={real:n.makeTensorInfo(r.shape,`float32`,a),imag:n.makeTensorInfo(i.shape,`float32`,o)},s}var UT={kernelName:tt,backendName:`cpu`,kernelFunc:HT};function WT(e,t,n=`float32`){if(n===`complex64`)return HT({inputs:{real:WT(e,t,`float32`),imag:WT(e,t,`float32`)},backend:e});let r=he(y(t),n);return e.makeTensorInfo(t,n,r)}function GT(e){let{inputs:t,backend:n}=e,{x:r}=t;return n.incRef(r.dataId),{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}var KT={kernelName:zt,backendName:`cpu`,kernelFunc:GT};function qT(e){let{inputs:t,backend:n}=e,{input:r}=t,i=n.data.get(r.dataId).complexTensorInfos.real,a=n.data.get(i.dataId).values;return n.makeTensorInfo(i.shape,i.dtype,a)}var JT={kernelName:Dn,backendName:`cpu`,kernelFunc:qT};function YT(e,t,n,r){if(r===`int32`)return[t,`int32`,Int32Array.from(e)];if(r===`bool`){let r=ri([0],n),[i,a]=VT((e,t)=>e===t?0:1)(t,[],e,r,`bool`);return[a,`bool`,i]}throw Error(`Error in Cast: failed to cast ${n} to ${r}`)}function XT(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dtype:a}=r;if(a===`complex64`){if(i.dtype===`complex64`)return GT({inputs:{x:i},backend:n});let e=WT(n,i.shape,i.dtype),t=XT({inputs:{x:i},backend:n,attrs:{dtype:`float32`}}),r=HT({inputs:{real:t,imag:e},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),r}if(i.dtype===`complex64`){let e=qT({inputs:{input:i},backend:n}),t=XT({inputs:{x:e},backend:n,attrs:{dtype:a}});return n.disposeIntermediateTensorInfo(e),t}if(!ne(i.dtype,a)){let e=GT({inputs:{x:i},backend:n});return{dataId:e.dataId,shape:e.shape,dtype:a}}let o=n.data.get(i.dataId).values,[s,c,l]=YT(o,i.shape,i.dtype,a);return n.makeTensorInfo(s,c,l)}var ZT={kernelName:Qe,backendName:`cpu`,kernelFunc:XT};function QT(e,t,n,r){return n==null?({inputs:n,backend:i})=>{let{a,b:o}=n,s=i;X([a,o],e);let c=s.data.get(a.dataId).values,l=s.data.get(o.dataId).values,u=a.dtype===`string`?Uh(c):c,d=a.dtype===`string`?Uh(l):l,f=r||a.dtype,[p,m]=t(a.shape,o.shape,u,d,f);return s.makeTensorInfo(m,f,p)}:({inputs:e,backend:i})=>{let{a,b:o}=e,s=i;if(a.dtype===`complex64`||o.dtype===`complex64`){let e=XT({inputs:{x:a},backend:s,attrs:{dtype:`complex64`}}),t=s.data.get(e.dataId),r=t.complexTensorInfos.real,i=t.complexTensorInfos.imag,c=s.data.get(r.dataId).values,l=s.data.get(i.dataId).values,u=XT({inputs:{x:o},backend:s,attrs:{dtype:`complex64`}}),d=s.data.get(u.dataId),f=d.complexTensorInfos.real,p=d.complexTensorInfos.imag,m=s.data.get(f.dataId).values,h=s.data.get(p.dataId).values,[g,_,v]=n(a.shape,o.shape,c,l,m,h),y=s.makeTensorInfo(v,`float32`,g),b=s.makeTensorInfo(v,`float32`,_),x=HT({inputs:{real:y,imag:b},backend:s});return s.disposeIntermediateTensorInfo(e),s.disposeIntermediateTensorInfo(u),s.disposeIntermediateTensorInfo(y),s.disposeIntermediateTensorInfo(b),x}{let e=s.data.get(a.dataId).values,n=s.data.get(o.dataId).values,i=r||a.dtype,[c,l]=t(a.shape,o.shape,e,n,i);return s.makeTensorInfo(l,i,c)}}}function $T(e){return(t,n,r,i,a,o)=>{let s=U(t,n),c=y(s),l=s.length,u=A(s),d=O(`float32`,c),f=O(`float32`,c),p=Ec(t,s),m=Ec(n,s),h=sh(r,i),g=sh(a,o),_=t.length,v=A(t),b=n.length,x=A(n);if(p.length+m.length===0)for(let t=0;t<d.length;t++){let n=t%h.length,r=t%g.length,i=e(h[n*2],h[n*2+1],g[r*2],g[r*2+1]);d[t]=i.real,f[t]=i.imag}else for(let t=0;t<d.length;t++){let n=ye(t,l,u),r=n.slice(-_);p.forEach(e=>r[e]=0);let i=ve(r,_,v),a=n.slice(-b);m.forEach(e=>a[e]=0);let o=ve(a,b,x),s=e(h[i*2],h[i*2+1],g[o*2],g[o*2+1]);d[t]=s.real,f[t]=s.imag}return[d,f,s]}}var eE=VT(((e,t)=>e+t)),tE=QT(`Add`,eE,$T(((e,t,n,r)=>({real:e+n,imag:t+r})))),nE={kernelName:`Add`,backendName:`cpu`,kernelFunc:tE};function rE(e,t,n,r,i){let a=y(r),o=he(i,n);for(let n=0;n<e.length;n++){let r=e[n];if(r<0)throw Error(`Input x must be non-negative!`);r>=i||(a>0?o[r]+=t[n]:o[r]+=1)}return o}function iE(e,t,n,r=!1){let i=e.shape[0],a=e.shape[1],o=so([i,n],t.dtype);for(let s=0;s<i;s++)for(let i=0;i<a;i++){let a=e.get(s,i);if(a<0)throw Error(`Input x must be non-negative!`);a>=n||(r?o.set(1,s,a):t.size>0?o.set(o.get(s,a)+t.get(s,i),s,a):o.set(o.get(s,a)+1,s,a))}return o}var aE=VT(((e,t)=>e&t)),oE={kernelName:Ye,backendName:`cpu`,kernelFunc:QT(Ye,aE)};function sE(e){return(t,n,r)=>{let i=k(n,t.length);for(let n=0;n<t.length;++n)i[n]=e(t[n],r);return i}}function cE(e,t,n){return lE(e,sE(t),n)}function lE(e,t,n){return({inputs:r,attrs:i,backend:a})=>{let{x:o}=r;X(o,e);let s=a,c=s.data.get(o.dataId).values,l;if(o.dtype===`string`){if(!Array.isArray(c))throw Error(`String tensor's value was not an instance of Array`);l=Uh(c)}else l=c;let u=n||o.dtype,d=t(l,u,i);return s.makeTensorInfo(o.shape,u,d)}}var uE=sE(e=>Math.ceil(e)),dE={kernelName:$e,backendName:`cpu`,kernelFunc:lE($e,uE)};function fE(e,t,n,r){let i=k(n,y(t));if(r&&n!==`string`){let t=0;e.forEach(e=>{let n=y(e.shape);i.set(e.vals,t),t+=n})}else{let r=0;e.forEach(e=>{let a=n===`string`?Uh(e.vals):e.vals,o=0;for(let n=0;n<e.shape[0];++n){let s=n*t[1]+r;for(let t=0;t<e.shape[1];++t)i[s+t]=a[o++]}r+=e.shape[1]})}return i}var pE=VT((e,t)=>+(e===t)),mE=QT(Dt,pE,null,`bool`),hE={kernelName:Dt,backendName:`cpu`,kernelFunc:mE},gE=sE(e=>Math.exp(e)),_E=lE(`Exp`,gE,`float32`),vE={kernelName:`Exp`,backendName:`cpu`,kernelFunc:_E},yE=sE(e=>Math.expm1(e)),bE={kernelName:kt,backendName:`cpu`,kernelFunc:lE(kt,yE)},xE=sE(e=>Math.floor(e)),SE={kernelName:Mt,backendName:`cpu`,kernelFunc:lE(Mt,xE)},CE=VT((e,t)=>Math.floor(e/t)),wE={kernelName:Nt,backendName:`cpu`,kernelFunc:QT(Nt,CE,null,`int32`)};function TE(e,t,n,r,i,a,o,s,c){let l=so([r,a],n);for(let n=0;n<r;n++){let r=[],u=0;for(let t=0;t<i;t++){let a=e[n*i+t];u+=a*o[t],r.push(a)}if(u<0||u>=c/a)throw Error(`Invalid indices: ${r} does not index into ${s}`);for(let e=0;e<a;e++)l.values[n*a+e]=t.get(...t.indexToLoc(u*a+e))}return l}function EE(e,t,n){let r=so(n,e.dtype);for(let n=0;n<r.size;++n){let i=r.indexToLoc(n).slice(),a=i[0],o=i[2],s=t.locToIndex([a,o]);i[2]=t.values[s];let c=e.locToIndex(i);0<=c&&c<e.values.length&&(r.values[n]=e.values[c])}return r}var DE=VT((e,t)=>+(e>t)),OE={kernelName:Lt,backendName:`cpu`,kernelFunc:QT(Lt,DE,null,`bool`)},kE=VT((e,t)=>+(e>=t)),AE={kernelName:Rt,backendName:`cpu`,kernelFunc:QT(Rt,kE,null,`bool`)},jE=VT((e,t)=>+(e<t)),ME={kernelName:Kt,backendName:`cpu`,kernelFunc:QT(Kt,jE,null,`bool`)},NE=VT((e,t)=>+(e<=t)),PE={kernelName:qt,backendName:`cpu`,kernelFunc:QT(qt,NE,null,`bool`)};function FE(e,t,n){let r=(t-e)/(n-1),i=he(n,`float32`);i[0]=e;for(let e=1;e<i.length;e++)i[e]=i[e-1]+r;return i}var IE=sE(e=>Math.log(e)),LE={kernelName:`Log`,backendName:`cpu`,kernelFunc:lE(`Log`,IE)};function RE(e,t,n,r){let i=O(r,y(n));for(let n=0;n<i.length;++n){let r=n*t,a=e[r];for(let n=0;n<t;++n){let t=e[r+n];(Number.isNaN(t)||t>a)&&(a=t)}i[n]=a}return i}var zE=VT(((e,t)=>Math.max(e,t))),BE={kernelName:tn,backendName:`cpu`,kernelFunc:QT(tn,zE)},VE=VT(((e,t)=>Math.min(e,t))),HE={kernelName:ln,backendName:`cpu`,kernelFunc:QT(ln,VE)},UE=VT(((e,t)=>e*t)),WE=QT(fn,UE,$T(((e,t,n,r)=>({real:e*n-t*r,imag:e*r+t*n})))),GE={kernelName:fn,backendName:`cpu`,kernelFunc:WE};function KE(e,t,n){return UE([],t,ti(-1,n),e,n)}function qE(e){let{inputs:t,backend:n}=e,{x:r}=t;X(r,`neg`);let i=n.data.get(r.dataId).values,[a,o]=KE(i,r.shape,r.dtype);return n.makeTensorInfo(o,r.dtype,a)}var JE={kernelName:`Neg`,backendName:`cpu`,kernelFunc:qE},YE=VT(((e,t)=>e===t?0:1)),XE={kernelName:pn,backendName:`cpu`,kernelFunc:QT(pn,YE,null,`bool`)};function ZE(e,t,n,r,i){let a=t.length,o=y(t),s=A(t),c=A(i),l=O(n,y(i));for(let t=0;t<o;++t){let n=ye(t,a,s),i=Array(n.length);for(let e=0;e<i.length;e++)i[e]=n[r[e]];let o=ve(i,a,c);l[o]=e[t]}return l}function QE(e){let{inputs:t,attrs:n,backend:r}=e,{x:i}=t,{perm:a}=n;X(i,`transpose`);let o=i.shape.length,s=Array(o);for(let e=0;e<s.length;e++)s[e]=i.shape[a[e]];let c=r.data.get(i.dataId).values,l=ZE(c,i.shape,i.dtype,a,s);return{dataId:r.write(l,s,i.dtype),shape:s,dtype:i.dtype}}var $E={kernelName:hr,backendName:`cpu`,kernelFunc:QE};function eD(e,t,n,r){let[i,a]=Kc(e,r),o=Ii(t,`int32`),s=he(y(i),o),c=y(a);for(let e=0;e<s.length;++e){let t=e*c,r=1;for(let e=0;e<c;++e)r*=n[t+e];s[e]=r}return{outVals:s,outShape:i,outDtype:o}}function tD(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`prod`);let s=i.shape.length,c=E(a,i.shape),l=Yc(c,s),u=c,d=i,f=[];l!=null&&(d=QE({inputs:{x:i},backend:n,attrs:{perm:l}}),f.push(d),u=Zc(u.length,s));let p=n.data.get(d.dataId).values,{outVals:m,outShape:h,outDtype:g}=eD(d.shape,d.dtype,p,u),_=h;return o&&(_=qc(h,c)),f.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(_,g,m)}var nD={kernelName:Sn,backendName:`cpu`,kernelFunc:tD};function rD(e,t,n){e.forEach((e,r)=>{if(e<0||e>=n){let i=ye(r,t.length,A(t)).join(`,`);throw Error(`indices[${i}] = ${e} is not in [0, ${n})`)}})}function iD(e,t){for(let n=0;n<e.length;++n){let r=e[n],i=n===e.length-1?t:e[n+1].length;if(r.length===0)throw Error(`Ragged splits may not be empty`);if(r[0]<0)throw Error(`Ragged splits must be non-negative`);if(r[r.length-1]>i)throw Error(`Ragged splits must not point past values`);for(let e=1;e<r.length;++e)if(r[e-1]>r[e])throw Error(`Ragged splits must be sorted in ascending order`)}}function aD(e,t,n,r){let i=[],a=0,o=t.length-1+n.length,s=Array(o).fill(null).map(()=>[0]);iD(n,r);let c=1;for(let e=0;e<t.length-1;++e){c*=t[e];let n=t[e+1];for(let t=1;t<c+1;++t)s[e].push(t*n)}for(let r=0;r<e.length;++r){let o=e[r],c=e[r]+1;for(let e=0;e<n.length;++e){let r=n[e],i=e+t.length-1;if(i>=0){let e=s[i],t=e[e.length-1]-r[o];for(let e=o;e<c;++e)s[i].push(r[e+1]+t)}o=r[o],c=r[c]}c!==o&&(i.push([o,c]),a+=c-o)}return{outSplits:s,valueSlices:i,numValues:a}}function oD(e){let t=[];for(let n=0;n<e.length;++n){let r=e[n].length,i=k(`int32`,r);t.push(i),e[n].forEach((e,t)=>i[t]=e)}return t}function sD(e,t){let n=e.slice(0,t);for(;n.length<t;)n.push(1);for(let r=t;r<e.length;r++)n[t-1]*=e[r];return n}function cD(e,t,n,r,i,a){let o=sD(t,2)[1],s=sD(a,2)[1],c=0;for(let t of n)for(let n=t[0];n<t[1];++n){for(let t=0;t<r;++t)i[c*s+t]=e[n*o+t];++c}}function lD(e,t,n,r,i){let a=t.slice();a[0]=i;let o=k(n,y(a)),s=e.length;return cD(e,t,r,s===0?0:s/t[0],o,a),[o,a]}function uD(e,t,n,r,i,a,o,s){if(e.length===0)throw Error(`paramsNestedSplits must be non empty`);if(t[0].length===0)throw Error(`Split tensors must not be scalars`);if(rD(a,o,t[0][0]-1),r.length===0)throw Error(`params.rank must be nonzero`);let c=r[0],{outSplits:l,valueSlices:u,numValues:d}=aD(a,o,e,c),f=oD(l),p=lD(n,r,i,u,d);return[f,p[0],p[1]]}var dD=2147483647;function fD(e,t,n,r,i,a,o){if(t.length>1)throw Error(`starts must be a scalar or vector`);if(i.length>1)throw Error(`limits must be a scalar or vector`);if(o.length>1)throw Error(`deltas must be a scalar or vector`);let s=t.length===0,c=i.length===0,l=o.length===0,u=[];s||u.push(t[0]),c||u.push(i[0]),l||u.push(o[0]);for(let e=1;e<u.length;++e)if(u[e]!==u[e-1])throw Error(`starts, limits, and deltas must have the same shape`);let d=u.length===0?1:u[0],f=k(`int32`,d+1);f[0]=0;for(let t=0;t<d;++t){let n=s?e[0]:e[t],i=c?r[0]:r[t],o=l?a[0]:a[t];if(o===0)throw Error(`Requires delta != 0`);let u;if(o>0&&i<n||o<0&&i>n)u=0;else if(u=Math.ceil(Math.abs((i-n)/o)),u>dD)throw Error(`Requires ((limit - start) / delta) <= ${dD}`);f[t+1]=f[t]+u}let p=f[d],m=k(n,p),h=0;for(let t=0;t<d;++t){let n=f[t+1]-f[t],r=s?e[0]:e[t],i=l?a[0]:a[t];for(let e=0;e<n;++e)m[h++]=r,r+=i}return[f,m]}var pD=Vm,mD=class e{constructor(e,t,n,r,i,a,o,s,c,l){this.shape=e,this.shapeShape=t,this.values=n,this.valuesShape=r,this.valuesDType=i,this.defaultValue=a,this.defaultValueShape=o,this.rowPartitionValues=s,this.rowPartitionValuesShapes=c,this.rowPartitionTypes=Um(l),this.raggedRank=Wm(this.rowPartitionTypes)}getRowPartitionTypeByDimension(e){return this.rowPartitionTypes[0]===pD.FIRST_DIM_SIZE?this.rowPartitionTypes[e+1]:this.rowPartitionTypes[e]}getRowPartitionTensor(e){return this.rowPartitionTypes[0]===pD.FIRST_DIM_SIZE?this.rowPartitionValues[e+1]:this.rowPartitionValues[e]}getMaxWidth(t){let n=this.getRowPartitionTensor(t-1);switch(this.getRowPartitionTypeByDimension(t-1)){case pD.VALUE_ROWIDS:return e.getMaxWidthValueRowID(n);case pD.ROW_SPLITS:return e.getMaxWidthRowSplit(n);default:throw Error(`Cannot handle partition type ${pD[this.getRowPartitionTypeByDimension(t-1)]}`)}}static getMaxWidthRowSplit(e){let t=e.length;if(t===0||t===1)return 0;let n=0;for(let r=0;r<t-1;++r){let t=e[r+1]-e[r];t>n&&(n=t)}return n}static getMaxWidthValueRowID(e){let t=e.length;if(t===0)return 0;let n=0,r=e[0],i=0;for(let a=1;a<t;++a){let t=e[a];t!==r&&(r=t,i=Math.max(a-n,i),n=a)}return Math.max(t-n,i)}tensorShapeFromTensor(e,t,n=!0){if(t.length===0){if(e[0]===-1)return[];throw Error(`The only valid scalar shape tensor is the fully unknown shape specified as -1.`)}return gD(e,n)}calculateOutputSize(e){let t=this.valuesShape,n=this.defaultValueShape;Gm(n,t);let r=this.tensorShapeFromTensor(this.shape,this.shapeShape),i=Hm(this.raggedRank,r,t);i[0]<0&&(i[0]=e);for(let e=1;e<=this.raggedRank;++e)i[e]<0&&(i[e]=this.getMaxWidth(e));return i}calculateFirstParentOutputIndex(e,t,n){let r=Math.min(e,n),i=[],a=0;for(let e=0;e<r;++e,a+=t)i.push(a);for(let t=r;t<e;++t)i.push(-1);return g(i.length===e,()=>`Final length of result must be equal to firstDimension.`),i}calculateOutputIndexRowSplit(e,t,n,r){let i=e.length,a=[];for(let o=0;o<i-1;++o){let i=e[o+1]-e[o],s=Math.min(r,i),c=t[o];c===-1&&(s=0);for(let e=0;e<s;++e)a.push(c),c+=n;for(let e=0;e<i-s;++e)a.push(-1)}if(i>0&&a.length!==e[i-1])throw Error(`Invalid row split size.`);return a}calculateOutputIndexValueRowID(e,t,n,r){let i=e.length,a=[];if(i===0)return[];let o=0,s=e[0];if(s>=t.length)throw Error(`Got currentValueRowId=${s}, which is not less than ${t.length}`);let c=t[s];a.push(c);for(let l=1;l<i;++l){let i=e[l];if(i===s)c>=0&&(++o,o<r?c+=n:c=-1);else{if(o=0,s=i,i>=t.length)throw Error(`Got nextValueRowId=${i} which is not less than ${t.length}`);c=t[i]}a.push(c)}if(a.length!==e.length)throw Error(`Invalid row ids.`);return a}calculateOutputIndex(e,t,n,r){let i=this.getRowPartitionTensor(e),a=this.getRowPartitionTypeByDimension(e);switch(a){case pD.VALUE_ROWIDS:return this.calculateOutputIndexValueRowID(i,t,n,r);case pD.ROW_SPLITS:if(i.length-1>t.length)throw Error(`Row partition size is greater than output size: ${i.length-1} > ${t.length}`);return this.calculateOutputIndexRowSplit(i,t,n,r);default:throw Error(`Unsupported partition type: ${pD[a]}`)}}getFirstDimensionSize(){let e=this.rowPartitionValues[0];if(this.rowPartitionTypes.length===0)throw Error(`No row_partition_types given.`);let t=this.rowPartitionTypes[0];switch(t){case pD.FIRST_DIM_SIZE:return e[0];case pD.VALUE_ROWIDS:throw Error(`Cannot handle VALUE_ROWIDS in first dimension.`);case pD.ROW_SPLITS:return this.rowPartitionValuesShapes[0][0]-1;default:throw Error(`Cannot handle type ${pD[t]}`)}}compute(){if(this.rowPartitionValues[0].length<=0)throw Error(`Invalid first partition input. Tensor requires at least one element.`);let e=this.getFirstDimensionSize(),t=this.calculateOutputSize(e),n=Array(this.raggedRank+1);n[n.length-1]=1;for(let e=n.length-2;e>=0;--e)n[e]=n[e+1]*t[e+1];let r=gD(t,!1),i=k(this.valuesDType,y(r));if(n[0]*t[0]>0){let a=this.calculateFirstParentOutputIndex(e,n[0],t[0]);for(let e=1;e<=this.raggedRank;++e)a=this.calculateOutputIndex(e-1,a,n[e],t[e]);this.setOutput(this.raggedRank,a,i,r)}return[r,i]}setOutput(e,t,n,r){if(n.length===0)return;let i=this.values,a=n,o=r.slice();o=o.slice(e+1);let s=y(o),c=t.length,l=this.defaultValue;if(l.length!==s&&l.length!==1){let e=this.defaultValueShape;I(()=>{l=Is(H(l,e),o).dataSync()})}let u=0,d=0,f=0;for(let e=0;e<=c;++e){let r=e<c?t[e]:-1;if(r===f){++f;continue}if(d<f){let e=i.subarray(u*s);hD(a.subarray(d*s),e,(f-d)*s)}if(e>=c){let e=n.length;r=Math.floor(e/s)}if(r>f)if(this.defaultValue.length===1)a.subarray(f*s,r*s).fill(this.defaultValue[0]),f=r;else for(;r>f;)hD(a.slice(f*s),l,s),++f;r<0?(u=e+1,d=f):(u=e,d=f,f=d+1)}}};function hD(e,t,n){for(let r=0;r<n;r++)e[r]=t[r]}function gD(e,t){let n=[];for(let r of e){if(r<0){if(!t)throw Error(`Dimension ${r} must be >= 0`);if(r<-1)throw Error(`Dimension ${r} must be >= -1`);r=-1}n.push(r)}return n}function _D(e,t,n,r,i,a,o,s,c,l){return new mD(e,t,n,r,i,a,o,s,c,l).compute()}function vD(e,t,n,r){if(e===t||e<t&&n<0||t<e&&n>1)return he(0,r);let i=he(Math.abs(Math.ceil((t-e)/n)),r);t<e&&n===1&&(n=-1),i[0]=e;for(let e=1;e<i.length;e++)i[e]=i[e-1]+n;return i}var yD=sE(e=>1/Math.sqrt(e)),bD={kernelName:Rn,backendName:`cpu`,kernelFunc:lE(Rn,yD)};function xD(e,t,n,r,i,a,o,s,c,l){let u=[r/i,i],d=e.values,f=t.values;if(r===0)return so(n,t.dtype);let p=c instanceof Ci?c:so(u,t.dtype);typeof c==`string`||typeof c==`number`?p.values.fill(c):typeof c==`boolean`&&p.values.fill(+c);for(let e=0;e<a;e++){let a=[],c=0;for(let t=0;t<o;t++){let n=d[e*o+t];a.push(n),c+=n*s[t]}if(c<0||c>=r/i)throw Error(`Invalid indices: ${a} does not index into ${n}`);for(let n=0;n<i;n++)l?p.values[c*i+n]+=f[e*i+n]:p.values[c*i+n]=t.rank===0?f[0]:f[e*i+n]}return p}var SD=sE(e=>1/(1+Math.exp(-e))),CD=cE(qn,e=>1/(1+Math.exp(-e))),wD={kernelName:qn,backendName:`cpu`,kernelFunc:CD};function TD(e,t,n,r,i){let a=Am(r,t,n),o=y(n),s=A(r);if(a){let n=jm(t,s);return i===`string`?e.slice(n,n+o):e.subarray(n,n+o)}let c=so(r,i,i===`string`?Uh(e):e),l=so(n,i);for(let e=0;e<l.size;++e){let n=l.indexToLoc(e),r=n.map((e,n)=>e+t[n]);l.set(c.get(...r),...n)}return i===`string`?Wh(l.values):l.values}function ED(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,size:o}=r;X(i,`slice`);let[s,c]=Mm(i,a,o);vm(i,s,c);let l=n.data.get(i.dataId).values,u=TD(l,s,c,i.shape,i.dtype);return n.makeTensorInfo(c,i.dtype,u)}var DD={kernelName:Wn,backendName:`cpu`,kernelFunc:ED};function OD(e,t,n,r,i,a,o){let s=t[0],c=a[0],l=Array(c),u=Array(s),d=t[1];if(c===0){if(s!==0)throw Error(Eh(s));let e=k(n,0),t=k(i,0);return[e,[0,d],t,l,u]}let f=!0,p=0,m=Array(c).fill(0);for(let t=0;t<s;++t){let n=e[t*d];if(n<0)throw Error(Dh(t,n));if(n>=c)throw Error(Oh(t,n,c));++m[n],f&&=n>=p,p=n}let h=!0;for(let e=0;e<c;++e){let t=m[e]===0;l[e]=t,h&&=!t,m[e]=Math.max(m[e],1),e>0&&(m[e]+=m[e-1])}if(h&&f){let t=e,n=r;for(let e=0;e<s;++e)u[e]=e;return[t,[s,d],n,l,u]}{let t=m[c-1],a=k(n,t*d),f=k(i,t),p=Array(c).fill(0);for(let t=0;t<s;++t){let n=e[t*d],i=p[n],o=(n===0?0:m[n-1])+i;p[n]++;for(let n=0;n<d;++n)a[o*d+n]=e[t*d+n];f[o]=r[t],u[t]=o}for(let e=0;e<c;++e)if(p[e]===0){let t=e===0?0:m[e-1];a[t*d+0]=e;for(let e=1;e<d;++e)a[t*d+e]=0;f[t]=o}return[a,[t,d],f,l,u]}}function kD(e,t,n,r,i){let a=y(r),o=t[0],s=i.length,c=[],l=1,u=-1;for(let e=0;e<s;++e){let t=i[e];if(t===-1){if(u!==-1)throw Error(kh(u,e));u=e,c.push(1)}else{if(t<0)throw Error(Ah(e,t));l*=t,c.push(t)}}if(u!==-1){if(l<=0)throw Error(jh());let e=Math.trunc(a/l);if(l*e!==a)throw Error(Mh(r,c));c[u]=e}if(y(c)!==a)throw Error(Nh(r,c));let d=r.length,f=[];if(d>0){f[d-1]=1;for(let e=d-2;e>=0;--e)f[e]=f[e+1]*r[e+1]}let p=[];if(s>0){p[s-1]=1;for(let e=s-2;e>=0;--e)p[e]=p[e+1]*c[e+1]}let m=k(n,o*s);for(let t=0;t<o;++t){let n=0;for(let r=0;r<d;++r)n+=e[t*d+r]*f[r];for(let e=0;e<s;++e)m[t*s+e]=Math.trunc(n/p[e]),n%=p[e]}return[m,[o,s],c]}function AD(e,t,n,r,i,a=!1,o=0){let s=r.length,c=[t[0],e.length/t[0]],l=c[1],u=s>0?i[s-1]+1:0;if(u<0)throw Error(Ph());let d=t.slice();d[0]=u;let f=k(n,d.reduce((e,t)=>e*t,1));if(s===0)return u>0&&f.fill(o),[f,d];if(u<=0)throw Error(Ph());let p=0,m=1,h=0,g=i[p];for(;;){let t=0;if(m<s){if(t=i[m],g===t){++m;continue}if(g>=t)throw Error(Fh())}if(g<0||g>=u)throw Error(Ih(g,u));g>h&&f.fill(o,h*l,g*l);for(let t=p;t<m;++t){let n=r[t];if(n<0||n>=c[0])throw Error(Lh(t,r[t],c[0]));for(let t=0;t<l;t++)f[g*l+t]+=e[n*l+t]}if(a)for(let e=0;e<l;e++)f[g*l+e]/=m-p;if(p=m,++m,h=g+1,g=t,m>s)break}return h<u&&f.fill(o,h*l,u*l),[f,d]}var jD=sE(e=>Math.sqrt(e)),MD={kernelName:Yn,backendName:`cpu`,kernelFunc:cE(Yn,e=>Math.sqrt(e))},ND=VT(((e,t)=>{let n=e-t;return n*n})),PD={kernelName:ir,backendName:`cpu`,kernelFunc:QT(ir,ND)},FD=sE((e,t)=>{let{pattern:n,replaceGlobal:r,rewrite:i}=t;return e.replace(new RegExp(n,r?`g`:``),i)}),ID={kernelName:or,backendName:`cpu`,kernelFunc:lE(or,FD)};function LD(e,t,n,r){let i=so(e,t.dtype);for(let e=0;e<i.size;e++){let a=i.indexToLoc(e),o=Array(a.length);for(let e=0;e<o.length;e++)o[e]=a[e]*n[e]+r[e];i.set(t.get(...o),...a)}return i}var RD=class{constructor(e,t,n,r,i,a){this.separator=ai(e),this.nGramWidths=t,this.leftPad=ai(n),this.rightPad=ai(r),this.padWidth=i,this.preserveShort=a}getPadWidth(e){return Math.min(this.padWidth<0?e-1:this.padWidth,e-1)}getNumNGrams(e,t){let n=this.getPadWidth(t);return Math.max(0,e+2*n-t+1)}createNGrams(e,t,n,r,i,a){for(let o=0;o<i;++o){let s=this.getPadWidth(a),c=Math.max(0,s-o),l=Math.max(0,s-(i-(o+1))),u=a-(c+l),d=t+(c>0?0:o-s),f=0;f+=c*this.leftPad.length;for(let t=0;t<u;++t)f+=e[d+t].length;f+=l*this.rightPad.length;let p=c+l+u-1;f+=p*this.separator.length,n[r+o]=new Uint8Array(f);let m=n[r+o],h=0,g=e=>e.forEach(e=>m[h++]=e);for(let e=0;e<c;++e)g(this.leftPad),g(this.separator);for(let t=0;t<u-1;++t)g(e[d+t]),g(this.separator);if(u>0){g(e[d+u-1]);for(let e=0;e<l;++e)g(this.separator),g(this.rightPad)}else{for(let e=0;e<l-1;++e)g(this.rightPad),g(this.separator);g(this.rightPad)}}}compute(e,t){let n=e.length,r=t.length;if(r>0){let e=t[0];if(e!==0)throw Error(`First split value must be 0, got ${e}`);for(let i=1;i<r;++i){let r=t[i]>=e;if(r&&=t[i]<=n,!r)throw Error(`Invalid split value ${t[i]}, must be in [${e}, ${n}]`);e=t[i]}if(e!==n)throw Error(`Last split value must be data size. Expected ${n}, got ${e}`)}let i=r-1,a=k(`int32`,r);if(n===0||r===0){let e=Array(n);for(let e=0;e<=i;++e)a[e]=0;return[e,a]}a[0]=0;for(let e=1;e<=i;++e){let n=t[e]-t[e-1],r=0;this.nGramWidths.forEach(e=>{r+=this.getNumNGrams(n,e)}),this.preserveShort&&n>0&&r===0&&(r=1),a[e]=a[e-1]+r}let o=Array(a[i]);for(let n=0;n<i;++n){let r=t[n],i=a[n];if(this.nGramWidths.forEach(a=>{let s=t[n+1]-t[n],c=this.getNumNGrams(s,a);this.createNGrams(e,r,o,i,c,a),i+=c}),this.preserveShort&&i===a[n]){let a=t[n+1]-t[n];if(a===0)continue;let s=a+2*this.padWidth;this.createNGrams(e,r,o,i,1,s)}}return[o,a]}};function zD(e,t,n,r,i,a,o,s){return new RD(n,r,i,a,o,s).compute(e,t)}function BD(e,t,n,r){if(!e.length)return;if(t.length===0){for(let t=0;t<e.length;++t)r.push(e.subarray(t,t+1));return}if(t.length===1){let i=t[0],a=e.indexOf(i);for(;a!==-1;){let t=e.subarray(0,a);(!n||t.length!==0)&&r.push(t),e=e.subarray(a+1),a=e.indexOf(i)}(!n||e.length!==0)&&r.push(e);return}let i=0;for(let a=0;a<e.length+1;a++)if(a===e.length||t.indexOf(e[a])!==-1){let t=e.subarray(i,a);(!n||t.length!==0)&&r.push(t),i=a+1}}function VD(e,t,n){let r=e.length,i=[],a=0,o=0,s=Array(r);for(let c=0;c<r;++c){let r=i.length;BD(e[c],t,n,i);let l=i.length-r;s[c]=l,a+=l,o=Math.max(o,l)}let c=k(`int32`,a*2),l=Array(a),u=[r,o],d=0;for(let e=0;e<r;++e)for(let t=0;t<s[e];++t)c[d*2]=e,c[d*2+1]=t,l[d]=i[d],++d;return[c,l,u]}function HD(e,t){let n=k(`int32`,e.length);for(let r=0;r<e.length;++r)n[r]=ei(e[r]).modulo(t).getLowBitsUnsigned();return n}var UD=VT(((e,t)=>e-t)),WD=QT(`Sub`,UD,$T(((e,t,n,r)=>({real:e-n,imag:t-r})))),GD={kernelName:`Sub`,backendName:`cpu`,kernelFunc:WD};function KD(e,t){let n=Array(e.rank);for(let r=0;r<n.length;r++)n[r]=e.shape[r]*t[r];let r=so(n,e.dtype);for(let t=0;t<r.values.length;++t){let n=r.indexToLoc(t),i=Array(e.rank);for(let t=0;t<i.length;t++)i[t]=n[t]%e.shape[t];let a=e.locToIndex(i);r.values[t]=e.values[a]}return r}var qD=(e,t)=>{let n=t.value-e.value;return n===0?e.index-t.index:n};function JD(e,t,n=0,r=e.length-1){for(;r>n;){if(r-n>600){let i=r-n+1,a=t-n+1,o=Math.log(i),s=.5*Math.exp(2*o/3),c=.5*Math.sqrt(o*s*(i-s)/i)*Math.sign(a-i/2);JD(e,t,Math.max(n,Math.floor(t-a*s/i+c)),Math.min(r,Math.floor(t+(i-a)*s/i+c)))}let i=e[t],a=n,o=r;for(m(e,n,t),qD(e[r],i)>0&&m(e,n,r);a<o;){for(m(e,a,o),a++,o--;qD(e[a],i)<0;)a+=1;for(;qD(e[o],i)>0;)--o}qD(e[n],i)===0?m(e,n,o):(o+=1,m(e,o,r)),o<=t&&(n=o+1),t<=o&&(r=o-1)}}function YD(e,t,n,r,i){let a=t[t.length-1],[o,s]=[e.length/a,a],c=O(n,o*r),l=O(`int32`,o*r);for(let t=0;t<o;t++){let n=t*s,a=e.subarray(n,n+s),o=Array(a.length);a.forEach((e,t)=>o[t]={value:e,index:t}),r<o.length&&(JD(o,r),o=o.slice(0,r)),i&&o.sort(qD);let u=t*r,d=c.subarray(u,u+r),f=l.subarray(u,u+r);for(let e=0;e<r;e++)d[e]=o[e].value,f[e]=o[e].index}let u=t.slice();return u[u.length-1]=r,[so(u,n,c),so(u,`int32`,l)]}function XD(e,t,n,r){let i=E(t,n)[0],a=[1,n[0],1];for(let e=0;e<i;e++)a[0]*=n[e];a[1]=n[i];for(let e=i+1;e<n.length;e++)a[2]*=n[e];let o=new Map,s=new Int32Array(n[i]),c=new Ci(a,r,e),l=[],u=a[0]===1&&a[2]===1;for(let t=0;t<n[i];t++){let n;if(u)n=e[t].toString();else{let e=[];for(let n=0;n<a[0];n++)for(let r=0;r<a[2];r++)e.push(c.get(n,t,r));n=e.join(`,`)}let r=o.get(n);if(r!=null)s[t]=r;else{let e=o.size;o.set(n,e),s[t]=e,l.push(t)}}let d=a.slice();d[1]=o.size;let f=new Ci(d,r);l.forEach((e,t)=>{for(let n=0;n<a[0];n++)for(let r=0;r<a[2];r++)f.set(c.get(n,e,r),n,t,r)});let p=n.slice();return p[i]=d[1],{outputValues:f.values,outputShape:p,indices:s}}var ZD=t({addImpl:()=>eE,bincountImpl:()=>rE,bincountReduceImpl:()=>iE,bitwiseAndImpl:()=>aE,castImpl:()=>YT,ceilImpl:()=>uE,concatImpl:()=>fE,equalImpl:()=>pE,expImpl:()=>gE,expm1Impl:()=>yE,floorDivImpl:()=>CE,floorImpl:()=>xE,gatherNdImpl:()=>TE,gatherV2Impl:()=>EE,greaterEqualImpl:()=>kE,greaterImpl:()=>DE,lessEqualImpl:()=>NE,lessImpl:()=>jE,linSpaceImpl:()=>FE,logImpl:()=>IE,maxImpl:()=>RE,maximumImpl:()=>zE,minimumImpl:()=>VE,multiplyImpl:()=>UE,negImpl:()=>KE,notEqualImpl:()=>YE,prodImpl:()=>eD,raggedGatherImpl:()=>uD,raggedRangeImpl:()=>fD,raggedTensorToTensorImpl:()=>_D,rangeImpl:()=>vD,rsqrtImpl:()=>yD,scatterImpl:()=>xD,sigmoidImpl:()=>SD,simpleAbsImpl:()=>zT,sliceImpl:()=>TD,sparseFillEmptyRowsImpl:()=>OD,sparseReshapeImpl:()=>kD,sparseSegmentReductionImpl:()=>AD,sqrtImpl:()=>jD,squaredDifferenceImpl:()=>ND,staticRegexReplaceImpl:()=>FD,stridedSliceImpl:()=>LD,stringNGramsImpl:()=>zD,stringSplitImpl:()=>VD,stringToHashBucketFastImpl:()=>HD,subImpl:()=>UD,tileImpl:()=>KD,topKImpl:()=>YD,transposeImpl:()=>ZE,uniqueImpl:()=>XD});ga(`cpu`,()=>new RT,1);var QD=cE(`Elu`,e=>e>=0?e:Math.exp(e)-1),$D={kernelName:`Elu`,backendName:`cpu`,kernelFunc:QD};function eO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{alpha:a}=r;X([i],`leakyRelu`);let o=y(i.shape),s=n.data.get(i.dataId).values,c=O(`float32`,o);for(let e=0;e<s.length;e++)c[e]=s[e]<0?a*s[e]:s[e];return n.makeTensorInfo(i.shape,`float32`,c)}var tO={kernelName:Gt,backendName:`cpu`,kernelFunc:eO},nO=VT((e,t)=>e<0?t*e:e);function rO(e){let{inputs:t,backend:n}=e,{x:r,alpha:i}=t;X([r,i],`prelu`);let a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,[s,c]=nO(r.shape,i.shape,a,o,`float32`);return n.makeTensorInfo(c,`float32`,s)}var iO={kernelName:xn,backendName:`cpu`,kernelFunc:rO},aO=cE(kn,e=>Math.max(0,e)),oO={kernelName:kn,backendName:`cpu`,kernelFunc:aO},sO=cE(Fn,e=>Math.min(Math.max(0,e),6)),cO={kernelName:Fn,backendName:`cpu`,kernelFunc:sO};function lO(e,t,n,r,i){if(n===`linear`)return GT({inputs:{x:t},backend:e});if(n===`relu`)return aO({inputs:{x:t},backend:e});if(n===`elu`)return QD({inputs:{x:t},backend:e});if(n===`relu6`)return sO({inputs:{x:t},backend:e});if(n===`prelu`)return rO({inputs:{x:t,alpha:r},backend:e});if(n===`leakyrelu`)return eO({inputs:{x:t},backend:e,attrs:{alpha:i}});if(n===`sigmoid`)return CD({inputs:{x:t},backend:e});throw Error(`Activation ${n} has not been implemented for the CPU backend.`)}function uO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{shape:a}=r,o=y(i.shape),s=T(a,o),c=y(s);g(o===c,()=>`The new shape (${s}) has ${c} elements and the old shape (${i.shape}) has ${o} elements. The new shape and old shape must have the same number of elements.`),n.incRef(i.dataId);let l=n.data.get(i.dataId);if(l.complexTensorInfos!=null){let e=l.complexTensorInfos.real,t=l.complexTensorInfos.imag;e.shape=s,t.shape=s}return{dataId:i.dataId,shape:s,dtype:i.dtype}}var dO={kernelName:An,backendName:`cpu`,kernelFunc:uO};function fO(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a}=t,{transposeA:o,transposeB:s}=r;X([i,a],`matMul`);let c=i.shape.length,l=a.shape.length,u=o?i.shape[c-2]:i.shape[c-1],d=s?a.shape[l-1]:a.shape[l-2],f=o?i.shape[c-1]:i.shape[c-2],p=s?a.shape[l-2]:a.shape[l-1],m=i.shape.slice(0,-2),h=a.shape.slice(0,-2),_=y(m),v=y(h),b=U(i.shape.slice(0,-2),a.shape.slice(0,-2)).concat([f,p]);g(u===d,()=>`Error in matMul: inner shapes (${u}) and (${d}) of Tensors with shapes ${i.shape} and ${a.shape} and transposeA=${o} and transposeB=${s} must match.`);let x=o?[_,u,f]:[_,f,u],S=s?[v,p,d]:[v,d,p],C=uO({inputs:{x:i},backend:n,attrs:{shape:x}}),w=uO({inputs:{x:a},backend:n,attrs:{shape:S}}),T=o?C.shape[1]:C.shape[2],E=o?C.shape[2]:C.shape[1],D=s?w.shape[1]:w.shape[2],O=Math.max(_,v),k=n.data.get(C.dataId).values,ee=n.data.get(w.dataId).values,te=A(C.shape),ne=A(w.shape),[re,ie,ae]=o?[te[0],1,te[1]]:[te[0],te[1],1],[oe,se,ce]=s?[1,ne[1],ne[0]]:[ne[1],1,ne[0]],le=E*D,ue=so([O,E,D],C.dtype),de=ue.values,fe=n.blockSize;for(let e=0;e<O;e++){let t=e%_,n=e%v;for(let r=0;r<E;r+=fe){let i=Math.min(r+fe,E);for(let a=0;a<D;a+=fe){let o=Math.min(a+fe,D);for(let s=0;s<T;s+=fe){let c=Math.min(s+fe,T);for(let l=r;l<i;l++)for(let r=a;r<o;r++){let i=0;for(let e=s;e<c;e++){let a=k[t*re+l*ie+e*ae],o=ee[e*oe+r*se+n*ce];i+=a*o}de[e*le+(l*D+r)]+=i}}}}}return n.disposeIntermediateTensorInfo(C),n.disposeIntermediateTensorInfo(w),n.makeTensorInfo(b,ue.dtype,ue.values)}var pO={kernelName:Ke,backendName:`cpu`,kernelFunc:fO};function mO(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a,bias:o,preluActivationWeights:s}=t,{transposeA:c,transposeB:l,activation:u,leakyreluAlpha:d}=r,f,p,m,h=[];f=fO({inputs:{a:i,b:a},attrs:{transposeA:c,transposeB:l},backend:n}),o&&(p=tE({inputs:{a:f,b:o},backend:n}),h.push(f),f=p),u&&(m=lO(n,f,u,s,d),h.push(f),f=m);for(let e of h)n.disposeIntermediateTensorInfo(e);return f}var hO={kernelName:Cr,backendName:`cpu`,kernelFunc:mO},gO={kernelName:Me,backendName:`cpu`,kernelFunc:cE(Me,e=>Math.acos(e))},_O={kernelName:Ne,backendName:`cpu`,kernelFunc:cE(Ne,e=>Math.acosh(e))};function vO(e){let{inputs:t,backend:n}=e,r=t;X(t,`addN`);let i=r.map(e=>n.data.get(e.dataId).values),a=so(r[0].shape,r[0].dtype),o=a.values;for(let e=0;e<r.length;e++){let t=i[e];for(let e=0;e<o.length;e++)o[e]+=t[e]}return n.makeTensorInfo(a.shape,a.dtype,a.values)}var yO={kernelName:Pe,backendName:`cpu`,kernelFunc:vO};function bO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`all`);let s=E(a,i.shape),c=s,l=Yc(c,i.shape.length),u=i;l!=null&&(u=QE({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Zc(c.length,i.shape.length)),Jc(`all`,c,u.shape.length);let[d,f]=Kc(u.shape,c),p=y(f),m=he(y(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];n&&=r}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=qc(d,s),t=uO({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var xO={kernelName:`All`,backendName:`cpu`,kernelFunc:bO};function SO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`any`);let s=E(a,i.shape),c=s,l=Yc(c,i.shape.length),u=i;l!=null&&(u=QE({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Zc(c.length,i.shape.length)),Jc(`any`,c,u.shape.length);let[d,f]=Kc(u.shape,c),p=y(f),m=he(y(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];n||=r}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=qc(d,s),t=uO({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var CO={kernelName:`Any`,backendName:`cpu`,kernelFunc:SO};function wO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r;X(i,`argMax`);let o=E(a,i.shape),s=Yc(o,i.shape.length),c=i,l=[];s!=null&&(c=QE({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Zc(o.length,c.shape.length)),o=[o[0]],Jc(`argMax`,o,c.shape.length);let[u,d]=Kc(c.shape,o),f=he(y(u),`int32`),p=y(d),m=n.data.get(c.dataId).values;for(let e=0;e<f.length;++e){let t=e*p,n=m[t],r=0;for(let e=0;e<p;++e){let i=m[t+e];i>n&&(n=i,r=e)}f[e]=r}return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(u,`int32`,f)}var TO={kernelName:Fe,backendName:`cpu`,kernelFunc:wO};function EO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r;X(i,`argMin`);let o=E(a,i.shape),s=Yc(o,i.shape.length),c=i,l=[];s!=null&&(c=QE({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Zc(o.length,c.shape.length)),o=[o[0]],Jc(`argMin`,o,c.shape.length);let[u,d]=Kc(c.shape,o),f=he(y(u),`int32`),p=y(d),m=n.data.get(c.dataId).values;for(let e=0;e<f.length;++e){let t=e*p,n=m[t],r=0;for(let e=0;e<p;++e){let i=m[t+e];i<n&&(n=i,r=e)}f[e]=r}return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(u,`int32`,f)}var DO={kernelName:Ie,backendName:`cpu`,kernelFunc:EO},OO={kernelName:Le,backendName:`cpu`,kernelFunc:cE(Le,e=>Math.asin(e))},kO={kernelName:Re,backendName:`cpu`,kernelFunc:cE(Re,e=>Math.asinh(e))},AO={kernelName:ze,backendName:`cpu`,kernelFunc:cE(ze,e=>Math.atan(e))},jO={kernelName:Ve,backendName:`cpu`,kernelFunc:QT(Ve,VT((e,t)=>Math.atan2(e,t)))},MO={kernelName:Be,backendName:`cpu`,kernelFunc:cE(Be,e=>Math.atanh(e))};function NO(e,t,n,r,i,a){let o=i.strideHeight,s=i.strideWidth,c=i.dilationHeight,l=i.dilationWidth,u=i.effectiveFilterHeight,d=i.effectiveFilterWidth,f=i.padInfo.top,p=i.padInfo.left,m=a===`max`?-1/0:1/0,h=so(i.outShape,n),g=h.values,_=i.outShape[1]*i.outShape[2]*i.outShape[3],v=i.outShape[2]*i.outShape[3],y=i.outShape[3];for(let t=0;t<i.batchSize;++t){let n=t*_,h=t*r[0];for(let t=0;t<i.inChannels;++t)for(let _=0;_<i.outHeight;++_){let b=_*o-f,x=Math.max(0,b),S=Math.min(i.inHeight,u+b),C=n+_*v;for(let n=0;n<i.outWidth;++n){let o=n*s-p,u=Math.max(0,o),f=Math.min(i.inWidth,d+o),_=m,v=0,b=0;for(let n=x;n<S;n+=c){let i=h+n*r[1];for(let n=u;n<f;n+=l){let o=e[i+n*r[2]+t];a===`max`&&o>_?_=o:a===`avg`&&(v+=o,b++)}if(isNaN(_))break}let w=C+n*y+t;g[w]=a===`avg`?v/b:_}}}return h}function PO(e,t,n,r,i=!1,a=!1){let o=so(r.outShape,`int32`),s=r.strideHeight,c=r.strideWidth,l=r.dilationHeight,u=r.dilationWidth,d=r.effectiveFilterHeight,f=r.effectiveFilterWidth,p=r.padInfo.top,m=r.padInfo.left,h=so(t,n,e);for(let e=0;e<r.batchSize;++e)for(let t=0;t<r.inChannels;++t)for(let n=0;n<r.outHeight;++n){let g=n*s-p,_=g;for(;_<0;)_+=l;let v=Math.min(r.inHeight,d+g);for(let s=0;s<r.outWidth;++s){let d=s*c-m,p=d;for(;p<0;)p+=u;let y=Math.min(r.inWidth,f+d),b=-1/0,x=-1;for(let n=_;n<v;n+=l){let o=n-g;for(let s=p;s<y;s+=u){let c=s-d,l=h.get(e,n,s,t);l>b&&(b=l,x=i?a?((e*r.inHeight+n)*r.inWidth+s)*r.inChannels+t:(n*r.inWidth+s)*r.inChannels+t:o*f+c)}}o.set(x,e,n,s,t)}}return o}function FO(e,t,n,r,i,a){let o=i.strideDepth,s=i.strideHeight,c=i.strideWidth,l=i.dilationDepth,u=i.dilationHeight,d=i.dilationWidth,f=i.effectiveFilterDepth,p=i.effectiveFilterHeight,m=i.effectiveFilterWidth,h=i.padInfo.front,g=i.padInfo.top,_=i.padInfo.left,v=a===`max`?-1/0:1/0,y=so(i.outShape,n),b=y.values,x=i.outShape[1]*i.outShape[2]*i.outShape[3]*i.outShape[4],S=i.outShape[2]*i.outShape[3]*i.outShape[4],C=i.outShape[3]*i.outShape[4],w=i.outShape[4];for(let t=0;t<i.batchSize;++t){let n=t*x,y=t*r[0];for(let t=0;t<i.inChannels;++t)for(let x=0;x<i.outDepth;++x){let T=x*o-h,E=T;for(;E<0;)E+=l;let D=Math.min(i.inDepth,f+T),O=n+x*S;for(let n=0;n<i.outHeight;++n){let o=n*s-g,f=o;for(;f<0;)f+=u;let h=Math.min(i.inHeight,p+o),x=O+n*C;for(let n=0;n<i.outWidth;++n){let o=n*c-_,s=o;for(;s<0;)s+=d;let p=Math.min(i.inWidth,m+o),g=x+n*w,S=v,C=0,T=0;for(let n=E;n<D;n+=l){let i=y+n*r[1];for(let n=f;n<h;n+=u){let o=i+n*r[2];for(let n=s;n<p;n+=d){let i=e[o+n*r[3]+t];if(a===`max`&&i>S?S=i:a===`avg`&&(C+=i,T++),isNaN(S))break}if(isNaN(S))break}if(isNaN(S))break}let O=g+t;b[O]=a===`avg`?C/Math.max(T,1):S}}}}return y}function IO(e,t){let n=so(t.outShape,`int32`),r=t.strideDepth,i=t.strideHeight,a=t.strideWidth,o=t.dilationDepth,s=t.dilationHeight,c=t.dilationWidth,l=t.effectiveFilterDepth,u=t.effectiveFilterHeight,d=t.effectiveFilterWidth,f=t.padInfo.front,p=t.padInfo.top,m=t.padInfo.left;for(let h=0;h<t.batchSize;++h)for(let g=0;g<t.inChannels;++g)for(let _=0;_<t.outDepth;++_){let v=_*r-f,y=v;for(;y<0;)y+=o;let b=Math.min(t.inDepth,l+v);for(let r=0;r<t.outHeight;++r){let l=r*i-p,f=l;for(;f<0;)f+=s;let x=Math.min(t.inHeight,u+l);for(let i=0;i<t.outWidth;++i){let p=i*a-m,S=p;for(;S<0;)S+=c;let C=Math.min(t.inWidth,d+p),w=-1/0,T=-1;for(let t=y;t<b;t+=o){let n=t-v;for(let r=f;r<x;r+=s){let i=r-l;for(let a=S;a<C;a+=c){let o=a-p,s=e.get(h,t,r,a,g);s>=w&&(w=s,T=n*u*d+i*u+o)}}}n.set(T,h,_,r,i,g)}}}return n}function LO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;X(i,`avgPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;g(rs(o,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Uo(i.shape,a,o,1,s,c),u;if(l.filterWidth===1&&l.filterHeight===1&&b(l.inShape,l.outShape))u=GT({inputs:{x:i},backend:n});else{let e=n.data.get(i.dataId).values,t=A(i.shape),r=NO(e,i.shape,i.dtype,t,l,`avg`);u=n.makeTensorInfo(l.outShape,i.dtype,r.values)}return u}var RO={kernelName:He,backendName:`cpu`,kernelFunc:LO};function zO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r;X(i,`avgPool3d`);let u=Wo(i.shape,a,o,1,s,c,l),d=n.data.get(i.dataId).values,f=FO(d,i.shape,i.dtype,A(i.shape),u,`avg`);return n.makeTensorInfo(f.shape,`float32`,f.values)}var BO={kernelName:We,backendName:`cpu`,kernelFunc:zO};function VO(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,{filterSize:o,strides:s,pad:c,dimRoundingMode:l}=r;X([i,a],`avgPool3DGrad`);let u=Wo(a.shape,o,s,1,c,l),d=u.strideDepth,f=u.strideHeight,p=u.strideWidth,m=u.filterDepth,h=u.filterHeight,g=u.filterWidth,_=u.dilationDepth,v=u.dilationHeight,y=u.dilationWidth,b=u.effectiveFilterDepth,x=u.effectiveFilterHeight,S=u.effectiveFilterWidth,C=b-1-u.padInfo.front,w=S-1-u.padInfo.left,T=x-1-u.padInfo.top,E=so(a.shape,`float32`),D=1/(m*h*g),O=n.bufferSync(i);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inDepth;++n)for(let r=0;r<u.inHeight;++r)for(let i=0;i<u.inWidth;++i){let a=n-C,o=r-T,s=i-w,c=0;for(let n=0;n<b;n+=_){let r=(a+n)/d;if(!(r<0||r>=u.outDepth||Math.floor(r)!==r))for(let n=0;n<x;n+=v){let i=(o+n)/f;if(!(i<0||i>=u.outHeight||Math.floor(i)!==i))for(let n=0;n<S;n+=y){let a=(s+n)/p;if(a<0||a>=u.outWidth||Math.floor(a)!==a)continue;let o=O.get(e,r,i,a,t);c+=o}}}E.set(c*D,e,n,r,i,t)}return n.makeTensorInfo(E.shape,E.dtype,E.values)}var HO={kernelName:Ge,backendName:`cpu`,kernelFunc:VO};function UO(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a;X([i,a],`avgPoolGrad`);let{filterSize:s,strides:c,pad:l}=r,u=Uo(o.shape,s,c,1,l),d=u.strideHeight,f=u.strideWidth,p=u.filterHeight,m=u.filterWidth,h=u.dilationHeight,g=u.dilationWidth,_=u.effectiveFilterHeight,v=u.effectiveFilterWidth,y=v-1-u.padInfo.left,b=_-1-u.padInfo.top,x=so(o.shape,`float32`),S=1/(p*m),C=n.data.get(i.dataId).values,w=so(i.shape,`float32`,C);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inHeight;++n)for(let r=0;r<u.inWidth;++r){let i=n-b,a=r-y,o=0;for(let n=0;n<_;n+=h){let r=(i+n)/d;if(!(r<0||r>=u.outHeight||Math.floor(r)!==r))for(let n=0;n<v;n+=g){let i=(a+n)/f;if(i<0||i>=u.outWidth||Math.floor(i)!==i)continue;let s=w.get(e,r,i,t);o+=s}}x.set(o*S,e,n,r,t)}return n.makeTensorInfo(x.shape,x.dtype,x.values)}var WO={kernelName:Ue,backendName:`cpu`,kernelFunc:UO};function GO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,scale:a,offset:o,mean:s,variance:c}=t;g(s.shape.length===c.shape.length,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),g(o==null||s.shape.length===o.shape.length,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),g(a==null||s.shape.length===a.shape.length,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`),X([i,s,c,a,o],`batchNorm`);let{varianceEpsilon:l}=r;l??=.001;let u=n.data.get(i.dataId).values,d=n.data.get(s.dataId).values,f=n.data.get(c.dataId).values,p=a?n.data.get(a.dataId).values:new Float32Array([1]),m=o?n.data.get(o.dataId).values:new Float32Array([0]),h=new Float32Array(u.length),_=m.length,v=p.length,y=f.length,b=d.length,x=0,S=0,C=0,w=0;for(let e=0;e<u.length;++e)h[e]=m[x++]+(u[e]-d[S++])*p[C++]/Math.sqrt(f[w++]+l),x>=_&&(x=0),S>=b&&(S=0),C>=v&&(C=0),w>=y&&(w=0);return n.makeTensorInfo(i.shape,i.dtype,h)}var KO={kernelName:Pt,backendName:`cpu`,kernelFunc:GO};function qO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,crops:o}=r;X([i],`batchToSpaceND`);let s=a.reduce((e,t)=>e*t),c=Jm(i.shape,a,s),l=Ym(c.length,a.length),u=Xm(i.shape,a,s),d=Zm(o,a.length),f=Qm(u,o,a.length),p=uO({inputs:{x:i},backend:n,attrs:{shape:c}}),m=QE({inputs:{x:p},backend:n,attrs:{perm:l}}),h=uO({inputs:{x:m},backend:n,attrs:{shape:u}}),g=ED({inputs:{x:h},backend:n,attrs:{begin:d,size:f}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),g}var JO={kernelName:qe,backendName:`cpu`,kernelFunc:qO};function YO(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o}=r,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,l=rE(s,c,a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,l)}var XO={kernelName:Je,backendName:`cpu`,kernelFunc:YO};function ZO(e){let{inputs:t,backend:n}=e,{s0:r,s1:i}=t,a=n.data.get(r.dataId).values,o=n.data.get(i.dataId).values,s=U(Array.from(a),Array.from(o));return n.makeTensorInfo([s.length],`int32`,Int32Array.from(s))}var QO={kernelName:Ze,backendName:`cpu`,kernelFunc:ZO},$O={kernelName:et,backendName:`cpu`,kernelFunc:cE(et,(e,t)=>{let n=t;return e>n.clipValueMax?n.clipValueMax:e<n.clipValueMin?n.clipValueMin:e})},ek={kernelName:nt,backendName:`cpu`,kernelFunc:e=>{let{x:t}=e.inputs,n=e.backend,r=new Float32Array(y(t.shape)),i=n.data.get(t.dataId),a=i.complexTensorInfos.real,o=i.complexTensorInfos.imag,s=n.data.get(a.dataId).values,c=n.data.get(o.dataId).values;for(let e=0;e<s.length;e++){let t=s[e],n=c[e];r[e]=Math.hypot(t,n)}return n.makeOutput(r,t.shape,`float32`)}};function tk(e){let{inputs:t,backend:n}=e,{input:r}=t,i=n.data.get(r.dataId).complexTensorInfos.imag,a=n.data.get(i.dataId).values;return n.makeTensorInfo(i.shape,i.dtype,a)}var nk={kernelName:Vt,backendName:`cpu`,kernelFunc:tk};function rk(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r,a=E(i,t[0].shape)[0];zm(t.map(e=>e.shape),a);let o=Bm(t.map(e=>e.shape),a);if(y(o)===0)return n.makeTensorInfo(o,t[0].dtype,[]);let s=t.filter(e=>y(e.shape)>0);if(s.length===1)return GT({inputs:{x:s[0]},backend:n});if(s[0].dtype===`complex64`){let e=s.map(e=>qT({inputs:{input:e},backend:n})),t=s.map(e=>tk({inputs:{input:e},backend:n})),r=rk({inputs:e,backend:n,attrs:{axis:a}}),i=rk({inputs:t,backend:n,attrs:{axis:a}}),o=HT({inputs:{real:r,imag:i},backend:n});return e.forEach(e=>n.disposeIntermediateTensorInfo(e)),t.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.disposeIntermediateTensorInfo(r),n.disposeIntermediateTensorInfo(i),o}let c=s.map(e=>{let t=[-1,y(e.shape.slice(a))];return uO({inputs:{x:e},backend:n,attrs:{shape:t}})}),l=c.map(e=>({vals:n.data.get(e.dataId).values,shape:e.shape}));o=Bm(c.map(e=>e.shape),1);let u=c[0].shape[0]===1,d=fE(l,o,t[0].dtype,u),f=Bm(s.map(e=>e.shape),a),p=n.makeTensorInfo(f,t[0].dtype,d);return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var ik={kernelName:rt,backendName:`cpu`,kernelFunc:rk};function ak(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dataFormat:c,dilations:l,dimRoundingMode:u}=r;X([i,a],`conv2d`);let d=as(c),f=Go(i.shape,a.shape,o,l,s,u,!1,d),p=f.filterHeight,m=f.filterWidth,h=f.dilationHeight,g=f.dilationWidth,_=f.padInfo.left,v=f.padInfo.top,y=f.dataFormat===`channelsLast`,b=new Ci(f.outShape,i.dtype),x=A(i.shape),S=A(a.shape),C=x[0],w=y?x[1]:x[2],T=y?x[2]:1,E=y?1:x[1],D=b.strides[0],O=y?b.strides[1]:b.strides[2],k=y?b.strides[2]:1,ee=y?1:b.strides[1],te=n.data.get(i.dataId).values,ne=n.data.get(a.dataId).values,re=b.values;for(let e=0;e<f.batchSize;++e){let t=e*C,n=e*D;for(let e=0;e<f.outHeight;++e){let r=n+e*O,i=e*f.strideHeight-v;for(let e=0;e<p;++e){let n=i+e*h;if(n<0||n>=f.inHeight)continue;let a=e*S[0],o=t+n*w;for(let e=0;e<f.outWidth;++e){let t=r+e*k,n=e*f.strideWidth-_;for(let e=0;e<m;++e){let r=n+e*g;if(r<0||r>=f.inWidth)continue;let i=a+e*S[1],s=o+r*T,c=i;for(let e=0;e<f.inChannels;++e){let n=te[s+e*E];for(let e=0;e<f.outChannels;++e)re[t+e*ee]+=n*ne[c+e];c+=f.outChannels}}}}}}return n.makeTensorInfo(b.shape,b.dtype,re)}var ok={kernelName:it,backendName:`cpu`,kernelFunc:ak};function sk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,dataFormat:c,dimRoundingMode:l,filterShape:u}=r;X([i,a],`conv2dBackpropFilter`);let d=as(c),f=Go(i.shape,u,o,1,s,l,!1,d),{strideHeight:p,strideWidth:m,filterHeight:h,filterWidth:g}=f,_=f.dataFormat===`channelsLast`,v=new Ci(f.filterShape,`float32`),y=f.padInfo.left,b=f.padInfo.top,x=n.data.get(i.dataId).values,S=n.data.get(a.dataId).values,C=new Ci(i.shape,i.dtype,x),w=new Ci(a.shape,a.dtype,S);for(let e=0;e<h;++e){let t=Math.max(0,Math.ceil((b-e)/p)),n=Math.min(f.outHeight,(f.inHeight+b-e)/p);for(let r=0;r<g;++r){let i=Math.max(0,Math.ceil((y-r)/m)),a=Math.min(f.outWidth,(f.inWidth+y-r)/m);for(let o=0;o<f.inChannels;++o)for(let s=0;s<f.outChannels;++s){let c=0;for(let l=0;l<f.batchSize;++l)for(let u=t;u<n;++u){let t=e+u*p-b;for(let e=i;e<a;++e){let n=r+e*m-y;c+=_?C.get(l,t,n,o)*w.get(l,u,e,s):C.get(l,o,t,n)*w.get(l,s,u,e)}}v.set(c,e,r,o,s)}}}return n.makeTensorInfo(v.shape,v.dtype,v.values)}var ck={kernelName:at,backendName:`cpu`,kernelFunc:sk};function lk(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{inputShape:o,strides:s,pad:c,dataFormat:l,dimRoundingMode:u}=r;X([i,a],`conv2dBackpropInput`);let d=A(a.shape),f=A(i.shape),p=as(l),m=Go(o,a.shape,s,1,c,u,!1,p),h=new Ci(m.inShape,`float32`),g=h.values,_=n.data.get(i.dataId).values,v=n.data.get(a.dataId).values,[y,b,x]=d,{batchSize:S,filterHeight:C,filterWidth:w,inChannels:T,inHeight:E,inWidth:D,outChannels:O,outHeight:k,outWidth:ee,strideHeight:te,strideWidth:ne}=m;p=m.dataFormat;let re=C-1-m.padInfo.top,ie=w-1-m.padInfo.left,ae=p===`channelsLast`,oe=h.strides[0],se=ae?h.strides[1]:h.strides[2],ce=ae?h.strides[2]:1,le=ae?1:h.strides[1],ue=f[0],de=ae?f[1]:f[2],fe=ae?f[2]:1,pe=ae?1:f[1];for(let e=0;e<S;++e)for(let t=0;t<T;++t)for(let n=0;n<E;++n){let r=n-re,i=Math.max(0,Math.ceil(r/te)),a=Math.min(k,(C+r)/te);for(let o=0;o<D;++o){let s=o-ie,c=Math.max(0,Math.ceil(s/ne)),l=Math.min(ee,(w+s)/ne),u=0;for(let n=i;n<a;++n){let i=n*te-r;for(let r=c;r<l;++r){let a=r*ne-s,o=ue*e+de*n+fe*r,c=y*(C-1-i)+b*(w-1-a)+x*t;for(let e=0;e<O;++e){let t=_[o+pe*e],n=v[c+e];u+=t*n}}}let d=oe*e+se*n+ce*o+le*t;g[d]=u}}return n.makeTensorInfo(h.shape,h.dtype,h.values)}var uk={kernelName:ot,backendName:`cpu`,kernelFunc:lk};function dk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r;X([i,a],`conv3d`);let l=Ko(i.shape,a.shape,o,c,s),{filterDepth:u,filterHeight:d,filterWidth:f,dilationDepth:p,dilationHeight:m,dilationWidth:h,padInfo:g}=l,_=g.front,v=g.left,y=g.top,b=new Ci(l.outShape,i.dtype),x=n.data.get(i.dataId).values,S=n.data.get(a.dataId).values,C=b.values,w=A(i.shape),T=A(a.shape);for(let e=0;e<l.batchSize;++e){let t=e*w[0],n=e*b.strides[0];for(let e=0;e<l.outDepth;++e){let r=n+e*b.strides[1],i=e*l.strideDepth-_;for(let e=0;e<u;++e){let n=i+e*p;if(n<0||n>=l.inDepth)continue;let a=e*T[0],o=t+n*w[1];for(let e=0;e<l.outHeight;++e){let t=r+e*b.strides[2],n=e*l.strideHeight-y;for(let e=0;e<d;++e){let r=n+e*m;if(r<0||r>=l.inHeight)continue;let i=a+e*T[1],s=o+r*w[2];for(let e=0;e<l.outWidth;++e){let n=t+e*l.outChannels,r=e*l.strideWidth-v;for(let e=0;e<f;++e){let t=r+e*h;if(t<0||t>=l.inWidth)continue;let a=i+e*T[2],o=s+t*l.inChannels,c=a;for(let e=0;e<l.inChannels;++e){let t=x[o+e];for(let e=0;e<l.outChannels;++e)C[n+e]+=t*S[c+e];c+=l.outChannels}}}}}}}}return n.makeTensorInfo(b.shape,b.dtype,b.values)}var fk={kernelName:st,backendName:`cpu`,kernelFunc:dk};function pk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,filterShape:c}=r;X([i,a],`conv3dBackpropFilterV2`);let l=A(i.shape),u=A(a.shape),d=Ko(i.shape,c,o,1,s),f=d.strideDepth,p=d.strideHeight,m=d.strideWidth,h=d.filterDepth,g=d.filterHeight,_=d.filterWidth,v=new Ci(d.filterShape,`float32`),y=v.values,[b,x,S,C]=v.strides,w=n.data.get(a.dataId).values,[T,E,D,O]=u,k=n.data.get(i.dataId).values,[ee,te,ne,re]=l,ie=d.padInfo.front,ae=d.padInfo.left,oe=d.padInfo.top;for(let e=0;e<h;++e){let t=Math.max(0,Math.ceil((ie-e)/f)),n=Math.min(d.outDepth,(d.inDepth+ie-e)/f),r=e*b;for(let i=0;i<g;++i){let a=Math.max(0,Math.ceil((oe-i)/p)),o=Math.min(d.outHeight,(d.inHeight+oe-i)/p),s=i*x+r;for(let r=0;r<_;++r){let c=Math.max(0,Math.ceil((ae-r)/m)),l=Math.min(d.outWidth,(d.inWidth+ae-r)/m),u=r*S+s;for(let s=0;s<d.inChannels;++s){let h=s*C+u;for(let u=0;u<d.outChannels;++u){let g=0;for(let h=0;h<d.batchSize;++h){let d=h*ee,_=h*T;for(let h=t;h<n;++h){let t=(e+h*f-ie)*te+d,n=h*E+_;for(let e=a;e<o;++e){let a=(i+e*p-oe)*ne+t,o=e*D+n;for(let e=c;e<l;++e){let t=(r+e*m-ae)*re+a,n=e*O+o;g+=k[t+s]*w[n+u]}}}}y[h+u]=g}}}}}return n.makeTensorInfo(v.shape,v.dtype,v.values)}var mk={kernelName:ct,backendName:`cpu`,kernelFunc:pk};function hk(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{pad:o,strides:s,inputShape:c}=r;X([i],`conv3dBackpropInputV2`);let l=A(i.shape),u=A(a.shape),d=Ko(c,a.shape,s,1,o),f=new Ci(d.inShape,`float32`),p=f.values,[m,h,g,_]=f.strides,v=n.data.get(i.dataId).values,[y,b,x,S]=l,C=n.data.get(a.dataId).values,[w,T,E,D]=u,{batchSize:O,filterDepth:k,filterHeight:ee,filterWidth:te,inChannels:ne,inDepth:re,inHeight:ie,inWidth:ae,outChannels:oe,outDepth:se,outHeight:ce,outWidth:le,strideDepth:ue,strideHeight:de,strideWidth:fe}=d,pe=k-1-d.padInfo.front,me=ee-1-d.padInfo.top,he=te-1-d.padInfo.left;for(let e=0;e<O;++e)for(let t=0;t<ne;++t)for(let n=0;n<re;++n){let r=n-pe,i=Math.max(0,Math.ceil(r/ue)),a=Math.min(se,(k+r)/ue);for(let o=0;o<ie;++o){let s=o-me,c=Math.max(0,Math.ceil(s/de)),l=Math.min(ce,(ee+s)/de);for(let u=0;u<ae;++u){let d=u-he,f=Math.max(0,Math.ceil(d/fe)),O=Math.min(le,(te+d)/fe),ne=0;for(let n=i;n<a;++n){let i=n*ue-r;for(let r=c;r<l;++r){let a=r*de-s;for(let o=f;o<O;++o){let s=o*fe-d,c=y*e+b*n+x*r+S*o,l=w*(k-1-i)+T*(ee-1-a)+E*(te-1-s)+D*t;for(let e=0;e<oe;++e){let t=v[c+e],n=C[l+e];ne+=t*n}}}}p[m*e+h*n+g*o+_*u+t]=ne}}}return n.makeTensorInfo(f.shape,f.dtype,f.values)}var gk={kernelName:lt,backendName:`cpu`,kernelFunc:hk},_k={kernelName:`Cos`,backendName:`cpu`,kernelFunc:cE(`Cos`,e=>Math.cos(e))},vk={kernelName:ut,backendName:`cpu`,kernelFunc:cE(ut,e=>Math.cosh(e))};function yk(e){let{inputs:t,backend:n,attrs:r}=e,{image:i,boxes:a,boxInd:o}=t,{cropSize:s,method:c,extrapolationValue:l}=r,[u,d,f,p]=i.shape,m=a.shape[0],[h,g]=s,_=so([m,h,g,p],`float32`),v=n.data.get(a.dataId).values,y=n.data.get(o.dataId).values,b=n.data.get(i.dataId).values,x=A(i.shape),S=A(_.shape);for(let e=0;e<m;e++){let t=e*4,n=v[t],r=v[t+1],i=v[t+2],a=v[t+3],o=y[e];if(o>=u)continue;let s=h>1?(i-n)*(d-1)/(h-1):0,m=g>1?(a-r)*(f-1)/(g-1):0;for(let t=0;t<h;t++){let u=h>1?n*(d-1)+t*s:.5*(n+i)*(d-1);if(u<0||u>d-1){for(let n=0;n<g;n++)for(let r=0;r<p;r++){let i=r+n*S[2]+t*S[1]+e*S[0];_.values[i]=l}continue}if(c===`bilinear`){let n=Math.floor(u),i=Math.ceil(u),s=u-n;for(let c=0;c<g;c++){let u=g>1?r*(f-1)+c*m:.5*(r+a)*(f-1);if(u<0||u>f-1){for(let n=0;n<p;n++){let r=n+c*S[2]+t*S[1]+e*S[0];_.values[r]=l}continue}let d=Math.floor(u),h=Math.ceil(u),v=u-d;for(let r=0;r<p;r++){let a=r+d*x[2]+n*x[1]+o*x[0],l=b[a];a=r+h*x[2]+n*x[1]+o*x[0];let u=b[a];a=r+d*x[2]+i*x[1]+o*x[0];let f=b[a];a=r+h*x[2]+i*x[1]+o*x[0];let p=b[a],m=l+(u-l)*v,g=f+(p-f)*v;a=r+c*S[2]+t*S[1]+e*S[0],_.values[a]=m+(g-m)*s}}}else for(let n=0;n<g;++n){let i=g>1?r*(f-1)+n*m:.5*(r+a)*(f-1);if(i<0||i>f-1){for(let r=0;r<p;r++){let i=r+n*S[2]+t*S[1]+e*S[0];_.values[i]=l}continue}let s=Math.round(i),c=Math.round(u);for(let r=0;r<p;r++){let i=r+s*x[2]+c*x[1]+o*x[0],a=r+n*S[2]+t*S[1]+e*S[0];_.values[a]=b[i]}}}}return n.makeTensorInfo(_.shape,_.dtype,_.values)}var bk={kernelName:pt,backendName:`cpu`,kernelFunc:yk};function xk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;X(i,`cumprod`);let c=Yc([a],i.shape.length),l=i;c!=null&&(l=QE({inputs:{x:i},backend:n,attrs:{perm:c}}));let u=Zc(1,i.shape.length)[0];if(u!==l.shape.length-1)throw Error(`backend.cumprod in CPU expects an inner-most axis=${l.shape.length-1} but got axis=${u}`);let d=Ii(l.dtype,`int32`),f=me(y(l.shape),d),p=n.data.get(l.dataId).values,m=l.shape[l.shape.length-1],h=s?(e,t)=>e+m-t-1:(e,t)=>e+t;for(let e=0;e<p.length;e+=m)for(let t=0;t<m;t++){let n=h(e,t);if(t===0)f[n]=o?1:p[n];else{let r=h(e,t-1);f[n]=o?p[r]*f[r]:p[n]*f[r]}}let g=n.makeTensorInfo(l.shape,d,f);if(c!=null){let e=Xc(c),t=QE({inputs:{x:g},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(g),n.disposeIntermediateTensorInfo(l),t}return g}var Sk={kernelName:dt,backendName:`cpu`,kernelFunc:xk};function Ck(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;X(i,`cumsum`);let c=Yc([a],i.shape.length),l=i;c!=null&&(l=QE({inputs:{x:i},backend:n,attrs:{perm:c}}));let u=Zc(1,i.shape.length)[0];if(u!==l.shape.length-1)throw Error(`backend.cumsum in CPU expects an inner-most axis=${l.shape.length-1} but got axis=${u}`);let d=Ii(l.dtype,`int32`),f=he(y(l.shape),d),p=n.data.get(l.dataId).values,m=l.shape[l.shape.length-1],h=s?(e,t)=>e+m-t-1:(e,t)=>e+t;for(let e=0;e<p.length;e+=m)for(let t=0;t<m;t++){let n=h(e,t);if(t===0)f[n]=o?0:p[n];else{let r=h(e,t-1);f[n]=o?p[r]+f[r]:p[n]+f[r]}}let g=n.makeTensorInfo(l.shape,d,f);if(c!=null){let e=Xc(c),t=QE({inputs:{x:g},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(g),n.disposeIntermediateTensorInfo(l),t}return g}var wk={kernelName:ft,backendName:`cpu`,kernelFunc:Ck};function Tk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o,binaryOutput:s}=r;if(i.shape.length===1){let e=n.data.get(i.dataId).values,t=n.data.get(a.dataId).values,r=rE(e,t,a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,r)}if(i.shape.length===2){let e=iE(n.bufferSync(i),n.bufferSync(a),o,s);return n.makeTensorInfo(e.shape,a.dtype,e.values)}throw Error(`Error in denseBincount: input must be at most rank 2, but got rank${i.shape.length}.`)}var Ek={kernelName:mt,backendName:`cpu`,kernelFunc:Tk};function Dk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockSize:a,dataFormat:o}=r;g(o===`NHWC`,()=>`Only NHWC dataFormat supported on CPU for depthToSpace. Got ${o}`);let s=i.shape[0],c=i.shape[1],l=i.shape[2],u=i.shape[3],d=c*a,f=l*a,p=u/(a*a),m=n.data.get(i.dataId).values,h=new Float32Array(s*d*f*p),_=0;for(let e=0;e<s;++e)for(let t=0;t<d;++t){let n=Math.floor(t/a),r=t%a;for(let t=0;t<f;++t){let i=Math.floor(t/a),o=t%a,s=(r*a+o)*p;for(let t=0;t<p;++t){let r=t+s+u*(i+l*(n+c*e));h[_++]=m[r]}}}return n.makeTensorInfo([s,d,f,p],i.dtype,h)}var Ok={kernelName:ht,backendName:`cpu`,kernelFunc:Dk};function kk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c,dimRoundingMode:l}=r;X([i,a],`depthwiseConv2DNative`);let u=A(i.shape),d=A(a.shape),f=c;f??=[1,1],g(rs(o,f),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${o} and dilations '${f}'`);let p=Go(i.shape,a.shape,o,f,s,l,!0),{filterHeight:m,filterWidth:h,dilationHeight:_,dilationWidth:v,padInfo:y}=p,b=y.left,x=y.top,S=p.outChannels/p.inChannels,C=new Ci(p.outShape,i.dtype),w=n.data.get(i.dataId).values,T=n.data.get(a.dataId).values,E=C.values;for(let e=0;e<p.batchSize;++e){let t=e*u[0],n=e*C.strides[0];for(let e=0;e<p.outHeight;++e){let r=n+e*C.strides[1],i=e*p.strideHeight-x;for(let e=0;e<m;++e){let n=i+e*_;if(n<0||n>=p.inHeight)continue;let a=e*d[0],o=t+n*u[1];for(let e=0;e<p.outWidth;++e){let t=r+e*C.strides[2],n=e*p.strideWidth-b;for(let e=0;e<h;++e){let r=n+e*v;if(r<0||r>=p.inWidth)continue;let i=a+e*d[1],s=o+r*p.inChannels,c=t,l=i;for(let e=0;e<p.inChannels;++e){let t=w[s+e];for(let e=0;e<S;++e)E[c+e]+=t*T[l+e];c+=S,l+=S}}}}}}return n.makeTensorInfo(C.shape,C.dtype,C.values)}var Ak={kernelName:gt,backendName:`cpu`,kernelFunc:kk};function jk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,filterShape:u}=r;X([i,a],`depthwiseConv2dNativeBackpropFilter`);let d=Go(i.shape,u,o,s,c,l,!0),{strideHeight:f,strideWidth:p,filterHeight:m,filterWidth:h}=d,g=new Ci(d.filterShape,`float32`),_=d.padInfo.left,v=d.padInfo.top,y=d.outChannels/d.inChannels,b=n.data.get(i.dataId).values,x=new Ci(i.shape,i.dtype,b),S=n.data.get(a.dataId).values,C=new Ci(a.shape,a.dtype,S);for(let e=0;e<m;++e){let t=Math.max(0,Math.ceil((v-e)/f)),n=Math.min(d.outHeight,(d.inHeight+v-e)/f);for(let r=0;r<h;++r){let i=Math.max(0,Math.ceil((_-r)/p)),a=Math.min(d.outWidth,(d.inWidth+_-r)/p);for(let o=0;o<d.outChannels;++o){let s=Math.trunc(o/y),c=o%y,l=0;for(let c=0;c<d.batchSize;++c)for(let u=t;u<n;++u){let t=e+u*f-v;for(let e=i;e<a;++e){let n=r+e*p-_;l+=x.get(c,t,n,s)*C.get(c,u,e,o)}}g.set(l,e,r,s,c)}}}return n.makeTensorInfo(g.shape,g.dtype,g.values)}var Mk={kernelName:_t,backendName:`cpu`,kernelFunc:jk};function Nk(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,inputShape:u}=r;X([i,a],`depthwiseConv2DNativeBackpropInput`);let d=A(i.shape),f=A(a.shape),p=Go(u,a.shape,o,s,c,l,!0),m=new Ci(p.inShape,`float32`),h=m.values,[g,_,v]=m.strides,y=n.data.get(i.dataId).values,[b,x,S]=d,C=n.data.get(a.dataId).values,[w,T,E]=f,{batchSize:D,filterHeight:O,filterWidth:k,inChannels:ee,inHeight:te,inWidth:ne,outChannels:re,outHeight:ie,outWidth:ae,strideHeight:oe,strideWidth:se}=p,ce=O-1-p.padInfo.top,le=k-1-p.padInfo.left,ue=re/ee;for(let e=0;e<D;++e)for(let t=0;t<ee;++t)for(let n=0;n<te;++n){let r=n-ce,i=Math.max(0,Math.ceil(r/oe)),a=Math.min(ie,(O+r)/oe);for(let o=0;o<ne;++o){let s=o-le,c=Math.max(0,Math.ceil(s/se)),l=Math.min(ae,(k+s)/se),u=0;for(let n=i;n<a;++n){let i=n*oe-r;for(let r=c;r<l;++r){let a=r*se-s,o=b*e+x*n+S*r,c=w*(O-1-i)+T*(k-1-a)+E*t;for(let e=0;e<ue;++e){let n=y[o+(t*ue+e)],r=C[c+e];u+=n*r}}}h[g*e+_*n+v*o+t]=u}}return n.makeTensorInfo(m.shape,m.dtype,m.values)}var Pk={kernelName:vt,backendName:`cpu`,kernelFunc:Nk};function Fk(e){let{inputs:t,backend:n}=e,{x:r}=t,i=y(r.shape),a=n.data.get(r.dataId).values,o=so([i,i],r.dtype),s=o.values;for(let e=0;e<a.length;e++)s[e*i+e]=a[e];let c=[...r.shape,...r.shape];return n.makeTensorInfo(c,o.dtype,o.values)}var Ik={kernelName:yt,backendName:`cpu`,kernelFunc:Fk},Lk={kernelName:bt,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i}=e,{strides:a,pad:o,dilations:s}=n,c=t,l=c.data.get(r.dataId).values,u=r.shape.length,d=c.data.get(i.dataId).values,f=i.shape.length,{batchSize:p,inHeight:m,inWidth:h,inChannels:g,outHeight:_,outWidth:v,padInfo:b,strideHeight:x,strideWidth:S,filterHeight:C,filterWidth:w,dilationHeight:T,dilationWidth:E,outShape:D}=Ho(r.shape,i.shape,a,o,`NHWC`,s),O=y(D),ee=D.length,te=k(r.dtype,O);for(let e=0;e<p;++e)for(let t=0;t<_;++t){let n=t*x-b.top;for(let a=0;a<v;++a){let o=a*S-b.left;for(let s=0;s<g;++s){let c=-(2**53-1);for(let t=0;t<C;++t){let a=n+t*T;if(a>=0&&a<m)for(let n=0;n<w;++n){let p=o+n*E;if(p>=0&&p<h){let o=ve([e,a,p,s],u,A(r.shape)),m=ve([t,n,s],f,A(i.shape)),h=l[o]+d[m];h>c&&(c=h)}}}let p=ve([e,t,a,s],ee,A(D));te[p]=c}}}return{dataId:c.write(ri(te,r.dtype),D,r.dtype),shape:D,dtype:r.dtype}}},Rk={kernelName:St,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i,dy:a}=e,{strides:o,pad:s,dilations:c}=n,l=t,u=fe(r.shape,l.data.get(r.dataId).values),d=fe(i.shape,l.data.get(i.dataId).values),{batchSize:f,inHeight:p,inWidth:m,inChannels:h,outHeight:_,outWidth:v,padInfo:y,strideHeight:b,strideWidth:x,filterHeight:S,filterWidth:C,dilationHeight:w,dilationWidth:T,outShape:E}=Ho(r.shape,i.shape,o,s,`NHWC`,c);g(a.rank===E.length,()=>`Error in ${St}, dy must have the same rank as output ${E.length}, but got ${a.rank}`);let D=fe(E,l.data.get(a.dataId).values),O=ge(i.shape,i.dtype);for(let e=0;e<f;++e)for(let t=0;t<_;++t){let n=t*b-y.top;for(let r=0;r<v;++r){let i=r*x-y.left;for(let a=0;a<h;++a){let o=-(2**53-1),s=0,c=0;for(let t=0;t<S;++t){let r=n+t*w;if(r>=0&&r<p)for(let n=0;n<C;++n){let l=i+n*T;if(l>=0&&l<m){let i=u[e][r][l][a]+d[t][n][a];i>o&&(o=i,s=t,c=n)}}}O[s][c][a]+=D[e][t][r][a]}}}return{dataId:l.write(ri(O,r.dtype),i.shape,i.dtype),shape:i.shape,dtype:i.dtype}}},zk={kernelName:xt,backendName:`cpu`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,filter:i,dy:a}=e,{strides:o,pad:s,dilations:c}=n,l=t,u=fe(r.shape,l.data.get(r.dataId).values),d=fe(i.shape,l.data.get(i.dataId).values),{batchSize:f,inHeight:p,inWidth:m,inChannels:h,outHeight:_,outWidth:v,padInfo:y,strideHeight:b,strideWidth:x,filterHeight:S,filterWidth:C,dilationHeight:w,dilationWidth:T,outShape:E}=Ho(r.shape,i.shape,o,s,`NHWC`,c);g(a.rank===E.length,()=>`Error in ${xt}, dy must have the same rank as output ${E.length}, but got ${a.rank}`);let D=fe(E,l.data.get(a.dataId).values),O=ge(r.shape,r.dtype);for(let e=0;e<f;++e)for(let t=0;t<_;++t){let n=t*b-y.top;for(let r=0;r<v;++r){let i=r*x-y.left;for(let a=0;a<h;++a){let o=-(2**53-1),s=n<0?0:n,c=i<0?0:i;for(let t=0;t<S;++t){let r=n+t*w;if(r>=0&&r<p)for(let n=0;n<C;++n){let l=i+n*T;if(l>=0&&l<m){let i=u[e][r][l][a]+d[t][n][a];i>o&&(o=i,s=r,c=l)}}}O[e][s][c][a]+=D[e][t][r][a]}}}return{dataId:l.write(ri(O,r.dtype),r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};function Bk(e){let{inputs:t,backend:n,attrs:r}=e,{image:i}=t,{canvas:a,options:o}=r,{contextOptions:s,imageOptions:c}=o||{},l=c?.alpha||1,u=s?.contextType||`2d`;if(u!==`2d`)throw Error(`Context type ${s.contextType} is not supported by the CPU backend.`);let d=a.getContext(u,s?.contextAttributes||{});if(d==null)throw Error(`Could not get the context with ${u} type.`);let[f,p]=i.shape.slice(0,2),m=i.shape.length===2?1:i.shape[2],h=n.data.get(i.dataId).values,g=i.dtype===`float32`?255:1,_=new Uint8ClampedArray(p*f*4);for(let e=0;e<f*p;++e){let t=[0,0,0,255*l];for(let n=0;n<m;n++){let r=h[e*m+n];if(i.dtype===`float32`){if(r<0||r>1)throw Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${r}.`)}else if(i.dtype===`int32`&&(r<0||r>255))throw Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${r}.`);m===1?(t[0]=r*g,t[1]=r*g,t[2]=r*g):t[n]=r*g}let n=e*4;_[n+0]=Math.round(t[0]),_[n+1]=Math.round(t[1]),_[n+2]=Math.round(t[2]),_[n+3]=Math.round(t[3])}a.width=p,a.height=f;let v=new ImageData(_,p,f);return d.putImageData(v,0,0),i}var Vk={kernelName:Ct,backendName:`cpu`,kernelFunc:Bk};function Hk(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`sum`);let s;s=i.dtype===`bool`?XT({inputs:{x:i},backend:n,attrs:{dtype:`int32`}}):GT({inputs:{x:i},backend:n});let c=s.shape.length,l=E(a,s.shape),u=Yc(l,c),d=l,f=s;u!=null&&(f=QE({inputs:{x:s},backend:n,attrs:{perm:u}}),d=Zc(d.length,c)),Jc(`sum`,d,f.shape.length);let[p,m]=Kc(f.shape,d),h=WT(n,p,Ii(f.dtype,`int32`)),g=y(m),_=n.data.get(h.dataId).values,v=n.data.get(f.dataId).values;for(let e=0;e<_.length;++e){let t=e*g,n=0;for(let e=0;e<g;++e)n+=v[t+e];_[e]=n}if(o){let e=qc(h.shape,l),t=h;h=uO({inputs:{x:h},backend:n,attrs:{shape:e}}),n.disposeIntermediateTensorInfo(t)}return n.disposeIntermediateTensorInfo(s),u!=null&&n.disposeIntermediateTensorInfo(f),h}var Uk={kernelName:`Sum`,backendName:`cpu`,kernelFunc:Hk};function Wk(e){let{inputs:t,backend:n,attrs:r}=e,{equation:i}=r,a=t,{allDims:o,summedDims:s,idDims:c}=yh(i,a.length);xh(o.length,c,a);let{path:l,steps:u}=Sh(s,c),d=u.length,f=null,p=o.length,m=[];for(let e=0;e<d;++e){for(let t of u[e]){let{permutationIndices:e,expandDims:r}=bh(p,c[t]),i;Ch(e)?i=a[t]:(i=QE({inputs:{x:a[t]},backend:n,attrs:{perm:e}}),m.push(i));let o=i.shape.slice();for(let e=0;e<r.length;++e)o.splice(r[e],0,1);b(i.shape,o)||(i=uO({inputs:{x:i},backend:n,attrs:{shape:o}}),m.push(i)),f===null?f=i:(f=WE({inputs:{a:i,b:f},backend:n}),m.push(f))}e<d-1&&(l[e]>=0&&(f=Hk({inputs:{x:f},backend:n,attrs:{axis:l[e]-(o.length-p),keepDims:!1}}),m.push(f)),p--)}for(let e of m)e!==f&&n.disposeIntermediateTensorInfo(e);return f}var Gk={kernelName:Tt,backendName:`cpu`,kernelFunc:Wk};function Kk(e){let{inputs:t,backend:n}=e,{dy:r,y:i}=t;X([r,i],`eluGrad`);let a=new Float32Array(y(i.shape)),o=n.data.get(i.dataId).values,s=n.data.get(r.dataId).values;for(let e=0;e<o.length;++e){let t=o[e];t>=0?a[e]=s[e]:a[e]=s[e]*(t+1)}return n.makeTensorInfo(i.shape,`float32`,a)}var qk={kernelName:Et,backendName:`cpu`,kernelFunc:Kk},Jk=th,Yk=nh,Xk=rh,Zk=ih,Qk=ah,$k=oh,eA={kernelName:`Erf`,backendName:`cpu`,kernelFunc:cE(`Erf`,e=>{let t=Math.sign(e),n=Math.abs(e),r=1/(1+Jk*n);return t*(1-(((($k*r+Qk)*r+Zk)*r+Xk)*r+Yk)*r*Math.exp(-n*n))})};function tA(e){let{inputs:t,backend:n,attrs:r}=e,{input:i}=t,{dim:a}=r,o=i.shape.length,s=i.shape.slice(),c=a;return a<0&&(g(-(o+1)<=a,()=>`Axis must be in the interval [${-(o+1)}, ${o}]`),c=o+a+1),s.splice(c,0,1),uO({inputs:{x:i},backend:n,attrs:{shape:s}})}var nA={kernelName:Ot,backendName:`cpu`,kernelFunc:tA},rA=QT(wt,VT((e,t)=>e/t)),iA={kernelName:wt,backendName:`cpu`,kernelFunc:rA};function aA(e,t,n){let r=e.shape,i=r[0],a=r[1],o=n.data.get(e.dataId),s=o.complexTensorInfos.real,c=o.complexTensorInfos.imag,l=[i,a],u=y(l),d=O(`float32`,u),f=O(`float32`,u);for(let e=0;e<i;e++){let r=ED({inputs:{x:s},backend:n,attrs:{begin:[e,0],size:[1,a]}}),i=ED({inputs:{x:c},backend:n,attrs:{begin:[e,0],size:[1,a]}}),o=HT({inputs:{real:r,imag:i},backend:n}),{real:l,imag:u}=oA(o,t,n),p=sh(l,u);for(let t=0;t<a;t++){let n=dh(p,t);d[e*a+t]=n.real,f[e*a+t]=n.imag}n.disposeIntermediateTensorInfo(r),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(o)}let p=n.makeTensorInfo(l,`float32`,d),m=n.makeTensorInfo(l,`float32`,f),h=HT({inputs:{real:p,imag:m},backend:n});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),h}function oA(e,t,n){let r=y(e.shape),i=n.data.get(e.dataId),a=n.data.get(i.complexTensorInfos.real.dataId).values,o=n.data.get(i.complexTensorInfos.imag.dataId).values;if(sA(r)){let i=cA(a,o,r,t,n),s=[e.shape[0],e.shape[1]];if(t){let e=n.makeTensorInfo(s,`float32`,i.real),t=n.makeTensorInfo(s,`float32`,i.imag),a=n.makeTensorInfo([],`float32`,ti(r,`float32`)),o=GT({inputs:{x:a},backend:n}),c=iA.kernelFunc({inputs:{a:e,b:a},backend:n}),l=iA.kernelFunc({inputs:{a:t,b:o},backend:n}),u=n.data.get(c.dataId).values,d=n.data.get(l.dataId).values;return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(a),n.disposeIntermediateTensorInfo(o),n.disposeIntermediateTensorInfo(c),n.disposeIntermediateTensorInfo(l),{real:u,imag:d}}return i}return ch(lA(sh(a,o),r,t))}function sA(e){return!(e&e-1)}function cA(e,t,n,r,i){if(n===1)return{real:e,imag:t};let a=sh(e,t),o=n/2,s=lh(a),c=s.real,l=s.imag,u=[c.length],d=i.makeTensorInfo(u,`float32`,c),f=i.makeTensorInfo(u,`float32`,l),p=HT({inputs:{real:d,imag:f},backend:i}),m=uh(a),h=m.real,g=m.imag,_=[h.length],v=i.makeTensorInfo(_,`float32`,h),y=i.makeTensorInfo(_,`float32`,g),b=HT({inputs:{real:v,imag:y},backend:i}),x=cA(c,l,o,r,i),S=x.real,C=x.imag,w=[S.length],T=i.makeTensorInfo(w,`float32`,S),E=i.makeTensorInfo(w,`float32`,C),D=HT({inputs:{real:T,imag:E},backend:i}),O=cA(h,g,o,r,i),k=O.real,ee=O.imag,te=[k.length],ne=i.makeTensorInfo(te,`float32`,k),re=i.makeTensorInfo(te,`float32`,ee),ie=HT({inputs:{real:ne,imag:re},backend:i}),ae=ph(n,r),oe=[ae.real.length],se=i.makeTensorInfo(oe,`float32`,ae.real),ce=i.makeTensorInfo(oe,`float32`,ae.imag),le=HT({inputs:{real:se,imag:ce},backend:i}),ue=WE({inputs:{a:le,b:ie},backend:i}),A=tE({inputs:{a:D,b:ue},backend:i}),de=WD({inputs:{a:D,b:ue},backend:i}),fe=qT({inputs:{input:A},backend:i}),pe=qT({inputs:{input:de},backend:i}),me=tk({inputs:{input:A},backend:i}),he=tk({inputs:{input:de},backend:i}),ge=rk({inputs:[fe,pe],backend:i,attrs:{axis:0}}),_e=rk({inputs:[me,he],backend:i,attrs:{axis:0}}),ve=i.data.get(ge.dataId).values,ye=i.data.get(_e.dataId).values;return i.disposeIntermediateTensorInfo(d),i.disposeIntermediateTensorInfo(f),i.disposeIntermediateTensorInfo(p),i.disposeIntermediateTensorInfo(v),i.disposeIntermediateTensorInfo(y),i.disposeIntermediateTensorInfo(b),i.disposeIntermediateTensorInfo(T),i.disposeIntermediateTensorInfo(E),i.disposeIntermediateTensorInfo(D),i.disposeIntermediateTensorInfo(ne),i.disposeIntermediateTensorInfo(re),i.disposeIntermediateTensorInfo(ie),i.disposeIntermediateTensorInfo(se),i.disposeIntermediateTensorInfo(ce),i.disposeIntermediateTensorInfo(le),i.disposeIntermediateTensorInfo(ue),i.disposeIntermediateTensorInfo(A),i.disposeIntermediateTensorInfo(de),i.disposeIntermediateTensorInfo(fe),i.disposeIntermediateTensorInfo(me),i.disposeIntermediateTensorInfo(pe),i.disposeIntermediateTensorInfo(he),i.disposeIntermediateTensorInfo(ge),i.disposeIntermediateTensorInfo(_e),{real:ve,imag:ye}}function lA(e,t,n){let r=new Float32Array(t*2);for(let i=0;i<t;i++){let a=0,o=0;for(let r=0;r<t;r++){let s=mh(i*r,t,n),c=dh(e,r);a+=c.real*s.real-c.imag*s.imag,o+=c.real*s.imag+c.imag*s.real}n&&(a/=t,o/=t),fh(r,a,o,i)}return r}function uA(e){let{inputs:t,backend:n}=e,{input:r}=t,i=y(r.shape),a=r.shape[r.shape.length-1],o=i/a,s=uO({inputs:{x:r},backend:n,attrs:{shape:[o,a]}}),c=aA(s,!1,n),l=uO({inputs:{x:c},backend:n,attrs:{shape:r.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(c),l}var dA={kernelName:`FFT`,backendName:`cpu`,kernelFunc:uA};function fA(e){let{backend:t,attrs:n}=e,{shape:r,value:i,dtype:a}=n,o=a||ce(i),s=k(o,y(r));return mA(s,i,o),t.makeTensorInfo(r,o,s)}var pA={kernelName:At,backendName:`cpu`,kernelFunc:fA};function mA(e,t,n){e.fill(t)}var hA={kernelName:jt,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,i=n,a=O(r.dtype,y(r.shape)),[o,s,c,l]=r.shape,u=i.data.get(r.dataId).values;for(let e=0;e<o;e++){let t=e*c*s*l;for(let e=0;e<s;e++){let n=c*l*e;for(let e=0;e<c;e++){let r=e*l;for(let i=0;i<l;i++){let o=Math.round(c-e-1),s=t+n+r+i,d=u[s];if(o>=0&&o<c){let e=o*l;d=u[t+n+e+i]}a[s]=d}}}}return{dataId:i.write(a,r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}};function gA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=ak({inputs:{x:i,filter:a},backend:n,attrs:{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f}});if(o){let e=h;if(u===`NCHW`&&o.shape.length===1&&o.shape[0]!==1){let e=uO({inputs:{x:o},backend:n,attrs:{shape:[o.shape[0],1,1]}});h=tE({inputs:{a:h,b:e},backend:n}),n.disposeIntermediateTensorInfo(e)}else h=tE({inputs:{a:h,b:o},backend:n});n.disposeIntermediateTensorInfo(e)}if(p){let e=h;if(u===`NCHW`&&p===`prelu`&&s.shape.length===1&&s.shape[0]!==1){let e=uO({inputs:{x:s},backend:n,attrs:{shape:[s.shape[0],1,1]}});h=lO(n,h,p,e,m),n.disposeIntermediateTensorInfo(e)}else h=lO(n,h,p,s,m);n.disposeIntermediateTensorInfo(e)}return h}var _A={kernelName:wr,backendName:`cpu`,kernelFunc:gA};function vA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=kk({inputs:{x:i,filter:a},backend:n,attrs:{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f}});if(o){let e=h;h=tE({inputs:{a:h,b:o},backend:n}),n.disposeIntermediateTensorInfo(e)}if(p){let e=h;h=lO(n,h,p,s,m),n.disposeIntermediateTensorInfo(e)}return h}var yA={kernelName:Tr,backendName:`cpu`,kernelFunc:vA};function bA(e){let{inputs:t,backend:n}=e,{params:r,indices:i}=t,a=y(r.shape),o=i.shape,s=o[o.length-1],[c,l,u,d]=mm(r,i);if(l===0)return n.makeTensorInfo(c,r.dtype,[]);let f=n.data.get(i.dataId).values,p=TE(f,n.bufferSync(r),r.dtype,l,s,u,d,r.shape,a);return n.makeTensorInfo(c,r.dtype,p.values)}var xA={kernelName:It,backendName:`cpu`,kernelFunc:bA};function SA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,indices:a}=t,{axis:o,batchDims:s}=r;X([i,a],`gatherV2`);let c=E(o,i.shape)[0],l=n.data.get(a.dataId).values,u=i.shape[c];for(let e=0;e<l.length;++e){let t=l[e];g(t<=u-1&&t>=0,()=>`GatherV2: the index value ${t} is not in [0, ${u-1}]`)}let d=s;s??(d=0);let f=y(a.shape),p=Vh(i,a,c,d),m=uO({inputs:{x:i},backend:n,attrs:{shape:[p.batchSize,p.outerSize,p.dimSize,p.sliceSize]}}),h=uO({inputs:{x:a},backend:n,attrs:{shape:[p.batchSize,f/p.batchSize]}}),_=[p.batchSize,p.outerSize,f/p.batchSize,p.sliceSize],v=n.bufferSync(h),b=EE(n.bufferSync(m),v,_);return n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),n.makeTensorInfo(p.outputShape,b.dtype,b.values)}var CA={kernelName:Ft,backendName:`cpu`,kernelFunc:SA};function wA(e){let{inputs:t,backend:n}=e,{input:r}=t,i=y(r.shape),a=r.shape[r.shape.length-1],o=i/a,s=uO({inputs:{x:r},backend:n,attrs:{shape:[o,a]}}),c=aA(s,!0,n),l=uO({inputs:{x:c},backend:n,attrs:{shape:r.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(c),l}var TA={kernelName:Bt,backendName:`cpu`,kernelFunc:wA},EA={kernelName:Ht,backendName:`cpu`,kernelFunc:cE(Ht,e=>+!!Number.isFinite(e),`bool`)},DA={kernelName:Ut,backendName:`cpu`,kernelFunc:cE(Ut,e=>+(Math.abs(e)===1/0),`bool`)},OA={kernelName:Wt,backendName:`cpu`,kernelFunc:cE(Wt,e=>+!!Number.isNaN(e),`bool`)};function kA(e){let{backend:t,attrs:n}=e,{start:r,stop:i,num:a}=n,o=FE(r,i,a);return t.makeTensorInfo([o.length],`float32`,o)}var AA={kernelName:Jt,backendName:`cpu`,kernelFunc:kA},jA={kernelName:Yt,backendName:`cpu`,kernelFunc:cE(Yt,e=>Math.log1p(e))},MA={kernelName:Xt,backendName:`cpu`,kernelFunc:QT(Xt,VT((e,t)=>e&&t),null,`bool`)},NA={kernelName:Zt,backendName:`cpu`,kernelFunc:cE(Zt,e=>+!e,`bool`)},PA={kernelName:Qt,backendName:`cpu`,kernelFunc:QT(Qt,VT((e,t)=>e||t),null,`bool`)};function FA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{depthRadius:a,bias:o,alpha:s,beta:c}=r;X(i,`LRN`);let l=i.shape[3],u=l-1,d=n.data.get(i.dataId).values,f=y(i.shape),p=new Float32Array(f);function m(e){let t=e%l,n=e-t+Math.max(0,t-a),r=e-t+Math.min(t+a,u),i=0;for(;n<=r;n++){let e=d[n];i+=e*e}return i}for(let e=0;e<f;e++){let t=m(e),n=d[e]*(o+s*t)**+-c;p[e]=n}return n.makeTensorInfo(i.shape,i.dtype,p)}var IA={kernelName:`LRN`,backendName:`cpu`,kernelFunc:FA};function LA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,y:a,dy:o}=t,{depthRadius:s,bias:c,alpha:l,beta:u}=r;X(o,`LRNGrad`);let d=y(o.shape),f=o.shape[3],p=n.data.get(o.dataId).values,m=n.data.get(i.dataId).values,h=n.data.get(a.dataId).values,g=new Float32Array(d),_=d;for(let e=0;e<_;e++){let t=e%f,n=e-t+Math.max(0,t-s),r=e-t+Math.min(f,t+s+1),i=0;for(let e=n;e<r;e++)i+=m[e]**2;i=l*i+c;for(let t=n;t<r;t++){let n=-2*l*u*m[t]*h[e]/i;e===t&&(n+=i**+-u),n*=p[e],g[t]+=n}}return n.makeTensorInfo(o.shape,i.dtype,g)}var RA={kernelName:en,backendName:`cpu`,kernelFunc:LA};function zA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reductionIndices:a,keepDims:o}=r,s=n,c=i.shape,l=c.length,u=E(a,c),d=u,f=Yc(d,l),p=s.data.get(i.dataId).values;if(f!=null){let e=Array(l);for(let t=0;t<e.length;t++)e[t]=c[f[t]];p=ZE(p,c,i.dtype,f,e),d=Zc(d.length,l),c=e}X(i,`max`),Jc(`max`,d,l);let[m,h]=Kc(c,d),g=y(h),_=RE(p,g,m,i.dtype),v=s.write(_,m,i.dtype),b=m;return o&&(b=qc(m,u)),{dataId:v,shape:b,dtype:i.dtype}}var BA={kernelName:`Max`,backendName:`cpu`,kernelFunc:zA};function VA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;X(i,`maxPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;g(rs(o,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Uo(i.shape,a,o,1,s,c),u;if(l.filterWidth===1&&l.filterHeight===1&&b(l.inShape,l.outShape))u=GT({inputs:{x:i},backend:n});else{let e=n.data.get(i.dataId).values,t=A(i.shape),r=NO(e,i.shape,i.dtype,t,l,`max`);u=n.makeTensorInfo(l.outShape,i.dtype,r.values)}return u}var HA={kernelName:nn,backendName:`cpu`,kernelFunc:VA};function UA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r;X(i,`maxPool3d`);let u=Wo(i.shape,a,o,1,s,c,l),d=n.data.get(i.dataId).values,f=FO(d,i.shape,i.dtype,A(i.shape),u,`max`);return n.makeTensorInfo(f.shape,`float32`,f.values)}var WA={kernelName:an,backendName:`cpu`,kernelFunc:UA};function GA(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,{filterSize:o,strides:s,pad:c,dimRoundingMode:l}=r;X([i,a],`maxPool3DGrad`);let u=Wo(a.shape,o,s,1,c,l),d=IO(n.bufferSync(a),u),f=u.strideDepth,p=u.strideHeight,m=u.strideWidth,h=u.dilationDepth,g=u.dilationHeight,_=u.dilationWidth,v=u.effectiveFilterDepth,y=u.effectiveFilterHeight,b=u.effectiveFilterWidth,x=v-1-u.padInfo.front,S=b-1-u.padInfo.left,C=y-1-u.padInfo.top,w=so(a.shape,`float32`),T=n.bufferSync(i);for(let e=0;e<u.batchSize;++e)for(let t=0;t<u.inChannels;++t)for(let n=0;n<u.inDepth;++n)for(let r=0;r<u.inHeight;++r)for(let i=0;i<u.inWidth;++i){let a=n-x,o=r-C,s=i-S,c=0;for(let n=0;n<v;n+=h){let r=(a+n)/f;if(!(r<0||r>=u.outDepth||Math.floor(r)!==r))for(let i=0;i<y;i+=g){let a=(o+i)/p;if(!(a<0||a>=u.outHeight||Math.floor(a)!==a))for(let o=0;o<b;o+=_){let l=(s+o)/m;if(l<0||l>=u.outWidth||Math.floor(l)!==l)continue;let f=+(v*y*b-1-d.get(e,r,a,l,t)===n*y*b+i*b+o);if(f===0)continue;let p=T.get(e,r,a,l,t);c+=p*f}}}w.set(c,e,n,r,i,t)}return n.makeTensorInfo(w.shape,w.dtype,w.values)}var KA={kernelName:on,backendName:`cpu`,kernelFunc:GA};function qA(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a,output:o}=t,s=a;X([a,o],`maxPoolGrad`);let{filterSize:c,strides:l,pad:u,dimRoundingMode:d}=r,f=Uo(s.shape,c,l,1,u,d),p=n.data.get(s.dataId).values,m=so(f.outShape,s.dtype,PO(p,s.shape,s.dtype,f).values),h=f.strideHeight,g=f.strideWidth,_=f.dilationHeight,v=f.dilationWidth,y=f.effectiveFilterHeight,b=f.effectiveFilterWidth,x=b-1-f.padInfo.left,S=y-1-f.padInfo.top,C=so(s.shape,`float32`),w=n.data.get(i.dataId).values,T=so(i.shape,`float32`,w);for(let e=0;e<f.batchSize;++e)for(let t=0;t<f.inChannels;++t)for(let n=0;n<f.inHeight;++n)for(let r=0;r<f.inWidth;++r){let i=n-S,a=r-x,o=0;for(let n=0;n<y;n+=_){let r=(i+n)/h;if(!(r<0||r>=f.outHeight||Math.floor(r)!==r))for(let i=0;i<b;i+=v){let s=(a+i)/g;if(s<0||s>=f.outWidth||Math.floor(s)!==s)continue;let c=+(y*b-1-m.get(e,r,s,t)===n*b+i);if(c===0)continue;let l=T.get(e,r,s,t);o+=l*c}}C.set(o,e,n,r,t)}return n.makeTensorInfo(C.shape,C.dtype,C.values)}var JA={kernelName:rn,backendName:`cpu`,kernelFunc:qA};function YA(e,t,n,r,i){let a=NO(e,t,n,A(t),i,`max`),o=PO(e,t,n,i,!0,r);return[a.values,o.values]}var XA={kernelName:sn,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{filterSize:i,strides:a,pad:o,includeBatchInIndex:s}=t,c=n;X(r,`MaxPoolWithArgmax`);let l=c.data.get(r.dataId).values,u=Uo(r.shape,i,a,[1,1],o),[d,f]=YA(l,r.shape,r.dtype,s,u),p=c.write(d,u.outShape,r.dtype),m=c.write(f,u.outShape,r.dtype);return[{dataId:p,shape:u.outShape,dtype:r.dtype},{dataId:m,shape:u.outShape,dtype:`int32`}]}};function ZA(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=E(a,i.shape),c=Kc(i.shape,s)[1],l=y(c),u=[],d=n.makeTensorInfo([],`float32`,new Float32Array([l]));u.push(d);let f=XT({inputs:{x:i},backend:n,attrs:{dtype:`float32`}});u.push(f);let p=rA({inputs:{a:f,b:d},backend:n});u.push(p);let m=Hk({inputs:{x:p},backend:n,attrs:{axis:a,keepDims:o}});return u.forEach(e=>n.disposeIntermediateTensorInfo(e)),m}var QA={kernelName:cn,backendName:`cpu`,kernelFunc:ZA};function $A(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;X(i,`min`);let s=E(a,i.shape),c=s,l=Yc(c,i.shape.length),u=i;l!=null&&(u=QE({inputs:{x:i},backend:n,attrs:{perm:l}}),c=Zc(c.length,i.shape.length)),Jc(`min`,c,u.shape.length);let[d,f]=Kc(u.shape,c),p=y(f),m=he(y(d),u.dtype),h=n.data.get(u.dataId).values;for(let e=0;e<m.length;++e){let t=e*p,n=h[t];for(let e=0;e<p;++e){let r=h[t+e];(Number.isNaN(r)||r<n)&&(n=r)}m[e]=n}l!=null&&n.disposeIntermediateTensorInfo(u);let g=n.makeTensorInfo(d,u.dtype,m);if(o){let e=qc(d,s),t=uO({inputs:{x:g},backend:n,attrs:{shape:e}});return n.disposeIntermediateTensorInfo(g),t}return g}var ej={kernelName:`Min`,backendName:`cpu`,kernelFunc:$A};function tj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,mode:o}=r;X(i,`mirrorPad`);let s=a.map((e,t)=>e[0]+i.shape[t]+e[1]),c=a.map(e=>e[0]),l=a.map((e,t)=>e[0]+i.shape[t]),u=o===`reflect`?0:1,d=n.data.get(i.dataId).values,f=i.shape.length,p=A(i.shape),m=y(s),h=s.length,g=A(s),_=O(i.dtype,m);for(let e=0;e<m;e++){let t=ye(e,h,g);for(let e=0;e<h;e++)t[e]<c[e]?t[e]=c[e]*2-t[e]-u:t[e]>=l[e]&&(t[e]=(l[e]-1)*2-t[e]+u);t=t.map((e,t)=>e-c[t]);let n=ve(t,f,p);_[e]=d[n]}return{dataId:n.write(_,s,i.dtype),shape:s,dtype:i.dtype}}var nj={kernelName:un,backendName:`cpu`,kernelFunc:tj},rj={kernelName:`Mod`,backendName:`cpu`,kernelFunc:QT(`Mod`,VT(((e,t)=>{let n=e%t;return e<0&&t<0||e>=0&&t>=0?n:(n+t)%t})))};function ij(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{dim:a}=r,o=i.shape.length,s=a;if(s===-1&&(s=o-1),s!==o-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${o} and dim was ${s}`);let c=E([s],i.shape),l=zA({inputs:{x:i},backend:n,attrs:{reductionIndices:c,keepDims:!1}}),u=qc(l.shape,c),d=uO({inputs:{x:l},backend:n,attrs:{shape:u}}),f=WD({inputs:{a:i,b:d},backend:n}),p=_E({inputs:{x:f},backend:n}),m=Hk({inputs:{x:p},backend:n,attrs:{axis:c,keepDims:!1}}),h=uO({inputs:{x:m},backend:n,attrs:{shape:u}}),g=rA({inputs:{a:p,b:h},backend:n});return n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),g}var aj={kernelName:Qn,backendName:`cpu`,kernelFunc:ij};function oj(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{numSamples:a,seed:o,normalized:s}=r;X(i,`multinomial`);let c=s?i:ij({inputs:{logits:i},backend:n,attrs:{dim:-1}}),l=c.shape[0],u=c.shape[1],d=n.data.get(c.dataId).values,f=[l,a],p=he(y(f),`int32`);for(let e=0;e<l;++e){let t=e*u,n=new Float32Array(u-1);n[0]=d[t];for(let e=1;e<n.length;++e)n[e]=n[e-1]+d[t+e];let r=ld.alea(o.toString()),i=e*a;for(let e=0;e<a;++e){let t=r();p[i+e]=n.length;for(let r=0;r<n.length;r++)if(t<n[r]){p[i+e]=r;break}}}return s||n.disposeIntermediateTensorInfo(c),n.makeTensorInfo(f,`int32`,p)}var sj={kernelName:dn,backendName:`cpu`,kernelFunc:oj},cj=yp;function lj(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=r;X(i,`NonMaxSuppression`);let l=n.data.get(i.dataId).values,u=n.data.get(a.dataId).values,{selectedIndices:d}=cj(l,u,o,s,c);return n.makeTensorInfo([d.length],`int32`,new Int32Array(d))}var uj={kernelName:mn,backendName:`cpu`,kernelFunc:lj},dj=bp;function fj(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,padToMaxOutputSize:l}=r;X(i,`NonMaxSuppressionPadded`);let u=n.data.get(i.dataId).values,d=n.data.get(a.dataId).values,{selectedIndices:f,validOutputs:p}=dj(u,d,o,s,c,l);return[n.makeTensorInfo([f.length],`int32`,new Int32Array(f)),n.makeTensorInfo([],`int32`,new Int32Array([p]))]}var pj={kernelName:hn,backendName:`cpu`,kernelFunc:fj},mj=xp;function hj(e){let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=r;X(i,`NonMaxSuppressionWithScore`);let u=n.data.get(i.dataId).values,d=n.data.get(a.dataId).values,{selectedIndices:f,selectedScores:p}=mj(u,d,o,s,c,l);return[n.makeTensorInfo([f.length],`int32`,new Int32Array(f)),n.makeTensorInfo([p.length],`float32`,new Float32Array(p))]}var gj={kernelName:gn,backendName:`cpu`,kernelFunc:hj};function _j(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i}=t,{dtype:a,depth:o,onValue:s,offValue:c}=r;X(i,`oneHot`);let l=y(i.shape),u=new Float32Array(l*o);u.fill(c);let d=n.data.get(i.dataId).values;for(let e=0;e<l;++e)d[e]>=0&&d[e]<o&&(u[e*o+d[e]]=s);return n.makeTensorInfo([...i.shape,o],a,u)}var vj={kernelName:vn,backendName:`cpu`,kernelFunc:_j};function yj(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`zerosLike is not supported for string tensors`);if(r.dtype===`complex64`){let e=qT({inputs:{input:r},backend:n}),t=yj({inputs:{x:e},backend:n}),i=tk({inputs:{input:r},backend:n}),a=yj({inputs:{x:i},backend:n}),o=HT({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return fA({backend:n,attrs:{shape:r.shape,value:0,dtype:r.dtype}})}var bj={kernelName:yr,backendName:`cpu`,kernelFunc:yj};function xj(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`onesLike is not supported for string tensors`);if(r.dtype===`complex64`){let e=qT({inputs:{input:r},backend:n}),t=xj({inputs:{x:e},backend:n}),i=tk({inputs:{input:r},backend:n}),a=yj({inputs:{x:i},backend:n}),o=HT({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return fA({backend:n,attrs:{shape:r.shape,value:1,dtype:r.dtype}})}var Sj={kernelName:_n,backendName:`cpu`,kernelFunc:xj};function Cj(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r;if(t.length===1)return tA({inputs:{input:t[0]},backend:n,attrs:{dim:i}});let a=t[0].shape,o=t[0].dtype;t.forEach(e=>{_(a,e.shape,`All tensors passed to stack must have matching shapes`),g(o===e.dtype,()=>`All tensors passed to stack must have matching dtypes`)});let s=[],c=rk({inputs:t.map(e=>{let t=tA({inputs:{input:e},backend:n,attrs:{dim:i}});return s.push(t),t}),backend:n,attrs:{axis:i}});return s.forEach(e=>n.disposeIntermediateTensorInfo(e)),c}var wj={kernelName:yn,backendName:`cpu`,kernelFunc:Cj};function Tj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,constantValue:o}=r;X(i,`pad`);let s=a.map((e,t)=>e[0]+i.shape[t]+e[1]),c=a.map(e=>e[0]),l=n.data.get(i.dataId).values,u=y(i.shape),d=i.shape.length,f=A(i.shape),p=y(s),m=s.length,h=A(s),g=O(i.dtype,p);o!==0&&g.fill(o);for(let e=0;e<u;e++){let t=ve(ye(e,d,f).map((e,t)=>e+c[t]),m,h);g[t]=l[e]}return{dataId:n.write(g,s,i.dtype),shape:s,dtype:i.dtype}}var Ej={kernelName:bn,backendName:`cpu`,kernelFunc:Tj},Dj={kernelName:`Pow`,backendName:`cpu`,kernelFunc:QT(`Pow`,VT((e,t)=>e**+t))};function Oj(e){let{inputs:t,backend:n,attrs:r}=e,{paramsNestedSplits:i,paramsDenseValues:a,indices:o}=t,{outputRaggedRank:s}=r,c=i.map(e=>n.data.get(e.dataId).values),l=i.map(e=>e.shape),u=n.data.get(a.dataId).values,d=n.data.get(o.dataId).values,[f,p,m]=uD(c,l,u,a.shape,a.dtype,d,o.shape,s),h=f.map(e=>n.makeTensorInfo([e.length],`int32`,e)),g=n.makeTensorInfo(m,a.dtype,p);return h.concat([g])}var kj={kernelName:Cn,backendName:`cpu`,kernelFunc:Oj};function Aj(e){let{inputs:t,backend:n}=e,{starts:r,limits:i,deltas:a}=t,o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=fD(o,r.shape,r.dtype,s,i.shape,c,a.shape);return[n.makeTensorInfo([l.length],`int32`,l),n.makeTensorInfo([u.length],r.dtype,u)]}var jj={kernelName:wn,backendName:`cpu`,kernelFunc:Aj};function Mj(e){let{inputs:t,backend:n,attrs:r}=e,{shape:i,values:a,defaultValue:o,rowPartitionTensors:s}=t,{rowPartitionTypes:c}=r,l=n.data.get(i.dataId).values,u=n.data.get(a.dataId).values,d=n.data.get(o.dataId).values,f=s.map(e=>n.data.get(e.dataId).values),p=s.map(e=>e.shape),[m,h]=_D(l,i.shape,u,a.shape,a.dtype,d,o.shape,f,p,c);return n.makeTensorInfo(m,a.dtype,h)}var Nj={kernelName:Tn,backendName:`cpu`,kernelFunc:Mj};function Pj(e){let{backend:t,attrs:n}=e,{start:r,stop:i,dtype:a,step:o}=n,s=vD(r,i,o,a);return t.makeTensorInfo([s.length],a,s)}var Fj={kernelName:En,backendName:`cpu`,kernelFunc:Pj},Ij={kernelName:On,backendName:`cpu`,kernelFunc:cE(On,e=>1/e)};function Lj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r;X(i,`resizeBilinear`);let c=A(i.shape),[l,u]=s,[d,f,p,m]=i.shape,h=n.data.get(i.dataId).values,g=new Float32Array(y([d,l,u,m])),_=[a&&l>1?f-1:f,a&&u>1?p-1:p],v=[a&&l>1?l-1:l,a&&u>1?u-1:u],b=0,x=_[0]/v[0],S=_[1]/v[1];for(let e=0;e<d;e++)for(let t=0;t<l;t++){let n;n=o?x*(t+.5)-.5:x*t;let r=Math.max(0,Math.floor(n)),i=n-r,a=Math.min(f-1,Math.ceil(n)),s=e*c[0]+r*c[1],l=e*c[0]+a*c[1];for(let e=0;e<u;e++){let t;t=o?S*(e+.5)-.5:S*e;let n=Math.max(0,Math.floor(t)),r=t-n,a=Math.min(p-1,Math.ceil(t)),u=s+n*c[2],d=l+n*c[2],f=s+a*c[2],_=l+a*c[2];for(let e=0;e<m;e++){let t=h[u+e],n=h[d+e],a=h[f+e],o=h[_+e],s=t+(a-t)*r,c=s+(n+(o-n)*r-s)*i;g[b++]=c}}}return n.makeTensorInfo([d,l,u,m],`float32`,g)}var Rj={kernelName:Nn,backendName:`cpu`,kernelFunc:Lj};function zj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r;X([a,i],`resizeBilinearGrad`);let s=A(i.shape),[c,l,u,d]=i.shape,[,f,p]=a.shape,m=new Float32Array(c*l*u*d),h=[o&&f>1?l-1:l,o&&p>1?u-1:u],g=[o&&f>1?f-1:f,o&&p>1?p-1:p],_=h[0]/g[0],v=h[1]/g[1],y=n.data.get(a.dataId).values,b=0;for(let e=0;e<c;e++){let t=e*s[0];for(let e=0;e<f;e++){let n=e*_,r=Math.floor(n),i=Math.min(Math.ceil(n),l-1),a=t+r*s[1],o=t+i*s[1],c=n-r,f=1-c;for(let e=0;e<p;e++){let t=e*v,n=Math.floor(t),r=Math.min(Math.ceil(t),u-1),i=t-n,l=1-i,p=a+n*s[2],h=a+r*s[2],g=o+n*s[2],_=o+r*s[2],x=f*l,S=f*i,C=c*l,w=c*i;for(let e=0;e<d;e++){let t=y[b++];m[p+e]+=t*x,m[h+e]+=t*S,m[g+e]+=t*C,m[_+e]+=t*w}}}}return n.makeTensorInfo([c,u,l,d],`float32`,m)}var Bj={kernelName:Pn,backendName:`cpu`,kernelFunc:zj};function Vj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r;X(i,`resizeNearestNeighbor`);let c=A(i.shape),[l,u]=s,[d,f,p,m]=i.shape,h=n.data.get(i.dataId).values,g=new Float32Array(d*l*u*m),_=[a&&l>1?f-1:f,a&&u>1?p-1:p],v=[a&&l>1?l-1:l,a&&u>1?u-1:u],y=_[0]/v[0],b=_[1]/v[1],x=0;for(let e=0;e<d;e++){let t=e*c[0];for(let e=0;e<l;e++){let n=o?y*(e+.5):y*e,r=Math.min(f-1,a?Math.round(n):Math.floor(n));o&&(r=Math.max(0,r));let i=t+r*c[1];for(let e=0;e<u;e++){let t=o?b*(e+.5):b*e,n=Math.min(p-1,a?Math.round(t):Math.floor(t));o&&(n=Math.max(0,n));let r=i+n*c[2];for(let e=0;e<m;e++){let t=h[r+e];g[x++]=t}}}}return n.makeTensorInfo([d,l,u,m],i.dtype,g)}var Hj={kernelName:jn,backendName:`cpu`,kernelFunc:Vj};function Uj(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r;X([a,i],`resizeNearestNeighborGrad`);let s=A(i.shape),c=A(a.shape),[l,u,d,f]=i.shape,[,p,m]=a.shape,h=new Float32Array(l*u*d*f),g=n.data.get(a.dataId).values,_=[o&&p>1?u-1:u,o&&m>1?d-1:d],v=[o&&p>1?p-1:p,o&&m>1?m-1:m],y=_[0]/v[0],b=_[1]/v[1],x=1/y,S=1/b,C=Math.ceil(x)*2+2,w=Math.ceil(S)*2+2;for(let e=0;e<l;e++){let t=e*s[0];for(let e=0;e<u;e++){let n=t+e*s[1],r=Math.floor(e*x),i=Math.floor(r-C/2);for(let r=0;r<d;r++){let a=n+r*s[2],l=Math.floor(r*S),_=Math.floor(l-w/2);for(let n=0;n<f;n++){let s=0;for(let a=0;a<C;a++){let l=a+i;if(l<0||l>=p)continue;let f=t+l*c[1],h=l*y,v=Math.min(u-1,o?Math.round(h):Math.floor(h));if(e===v)for(let e=0;e<w;e++){let t=e+_;if(t<0||t>=m)continue;let i=f+t*c[2],a=t*b,l=Math.min(d-1,o?Math.round(a):Math.floor(a));r===l&&(s+=g[i+n])}}h[a+n]=s}}}}return n.makeTensorInfo(i.shape,i.dtype,h)}var Wj={kernelName:Mn,backendName:`cpu`,kernelFunc:Uj};function Gj(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dims:a}=r;X(i,`reverse`);let o=i.shape.length,s=E(a,i.shape);if(o===0)return GT({inputs:{x:i},backend:n});let c=new Ci(i.shape,i.dtype),l=n.bufferSync(i);for(let e=0;e<c.size;e++){let t=c.indexToLoc(e),n=t.slice();s.forEach(e=>n[e]=i.shape[e]-1-n[e]),c.set(l.get(...n),...t)}return n.makeTensorInfo(c.shape,c.dtype,c.values)}var Kj={kernelName:In,backendName:`cpu`,kernelFunc:Gj},qj={kernelName:Sr,backendName:`cpu`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,{radians:i,fillValue:a,center:o}=t,s=n,c=O(r.dtype,y(r.shape)),[l,u,d,f]=r.shape,[p,m]=qm(o,u,d),h=Math.sin(i),g=Math.cos(i),_=s.data.get(r.dataId).values;for(let e=0;e<l;e++){let t=e*d*u*f;for(let e=0;e<u;e++){let n=d*f*e;for(let r=0;r<d;r++){let i=r*f;for(let o=0;o<f;o++){let s=[l,e,r,o],v=s[2],y=s[1],b=(v-p)*g-(y-m)*h,x=(v-p)*h+(y-m)*g;b=Math.round(b+p),x=Math.round(x+m);let S=a;if(typeof a!=`number`&&(S=o===3?255:a[o]),b>=0&&b<d&&x>=0&&x<u){let e=d*f*x,n=b*f;S=_[t+e+n+o]}let C=t+n+i+o;c[C]=S}}}}return{dataId:s.write(c,r.shape,r.dtype),shape:r.shape,dtype:r.dtype}}},Jj={kernelName:Ln,backendName:`cpu`,kernelFunc:cE(Ln,e=>{let t=Math.floor(e);return e-t<.5?Math.floor(e):e-t>.5?Math.ceil(e):t%2==0?t:t+1})};function Yj(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i,updates:a}=t,{shape:o}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=wf(a,i,o),f=xD(n.bufferSync(i),n.bufferSync(a),o,d,l,c,s,u,0,!0);return n.makeTensorInfo(o,f.dtype,f.values)}var Xj={kernelName:zn,backendName:`cpu`,kernelFunc:Yj};function Zj(e,t){let n=0,r=e.length,i=0;for(;n<r;)i=Math.floor((n+r)/2),e[i]<t?n=i+1:r=i;return r}function Qj(e,t){let n=0,r=e.length,i=0;for(;n<r;)i=Math.floor((n+r)/2),e[i]<=t?n=i+1:r=i;return r}function $j(e,t,n,r,i,a){let o=k(`int32`,n*i);for(let s=0;s<n;++s){let n=e.slice(s*r,(s+1)*r),c=s*i;for(let e=0;e<i;++e)o[c+e]=a===`left`?Zj(n,t[e+c]):Qj(n,t[e+c])}return o}function eM(e){let{inputs:t,backend:n,attrs:r}=e,{sortedSequence:i,values:a}=t,{side:o}=r,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,l=$j(s,c,i.shape[0],i.shape[1],a.shape[1],o);return n.makeTensorInfo(a.shape,`int32`,l)}var tM={kernelName:Vn,backendName:`cpu`,kernelFunc:eM};function nM(e){let{inputs:t,backend:n}=e,{condition:r,t:i,e:a}=t;X([r,i,a],`select`);let o=r.shape.length,s=n.data.get(r.dataId).values,c=n.data.get(i.dataId).values,l=n.data.get(a.dataId).values,u=Ii(i.dtype,a.dtype),d=he(y(i.shape),u),f=0,p=o===0||o>1||i.shape.length===1?1:y(i.shape.slice(1));for(let e=0;e<s.length;e++)for(let t=0;t<p;t++)s[e]===1?d[f++]=c[e]:d[f++]=l[e];return n.makeTensorInfo(i.shape,u,d)}var rM={kernelName:Hn,backendName:`cpu`,kernelFunc:nM},iM=$m,aM=eh,oM={kernelName:Un,backendName:`cpu`,kernelFunc:cE(Un,e=>e>=0?aM*e:iM*(Math.exp(e)-1))},sM={kernelName:Kn,backendName:`cpu`,kernelFunc:cE(Kn,e=>e<0?-1:+(e>0))},cM={kernelName:`Sin`,backendName:`cpu`,kernelFunc:cE(`Sin`,e=>Math.sin(e))},lM={kernelName:Gn,backendName:`cpu`,kernelFunc:cE(Gn,e=>Math.sinh(e))},uM=Math.log(1.1920928955078125e-7)+2,dM={kernelName:Jn,backendName:`cpu`,kernelFunc:cE(Jn,e=>{let t=e>-uM,n=e<uM,r=Math.exp(e),i;return i=n?r:t?e:Math.log(1+r),i})};function fM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,paddings:o}=r;X([i],`spaceToBatchND`);let s=y(a),c=[[0,0]];c.push(...o);for(let e=1+a.length;e<i.shape.length;++e)c.push([0,0]);let l=Ej.kernelFunc({inputs:{x:i},backend:n,attrs:{paddings:c,constantValue:0}}),u=Jm(l.shape,a,s,!1),d=Ym(u.length,a.length,!1),f=Xm(l.shape,a,s,!1),p=uO({inputs:{x:l},backend:n,attrs:{shape:u}}),m=QE({inputs:{x:p},backend:n,attrs:{perm:d}}),h=uO({inputs:{x:m},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),h}var pM={kernelName:Xn,backendName:`cpu`,kernelFunc:fM};function mM(e){let{inputs:t,backend:n}=e,{indices:r,values:i,denseShape:a,defaultValue:o}=t;if(a.shape.length!==1)throw Error(`Dense shape must be a vector, saw:
        ${a.shape}`);if(r.shape.length!==2)throw Error(`Indices must be a matrix, saw:
        ${r.shape}`);if(i.shape.length!==1)throw Error(`Values must be a vector, saw:
        ${i.shape}`);if(o.shape.length!==0)throw Error(`Default value must be a scalar, saw:
        ${o.shape}`);let s=n.data.get(r.dataId).values,c=n.data.get(i.dataId).values,l=n.data.get(a.dataId).values,u=n.data.get(o.dataId).values[0],[d,f,p,m,h]=OD(s,r.shape,r.dtype,c,i.dtype,l,u);return[n.makeTensorInfo(f,r.dtype,d),n.makeTensorInfo([f[0]],i.dtype,p),n.makeTensorInfo([m.length],`bool`,new Uint8Array(m.map(e=>Number(e)))),n.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}var hM={kernelName:$n,backendName:`cpu`,kernelFunc:mM};function gM(e){let{inputs:t,backend:n}=e,{inputIndices:r,inputShape:i,newShape:a}=t;if(r.shape.length!==2)throw Error(`Input indices should be a matrix but received shape
        ${r.shape}`);if(i.shape.length!==1)throw Error(`Input shape should be a vector but received shape
        ${i.shape}`);if(a.shape.length!==1)throw Error(`Target shape should be a vector but received shape ${a.shape}`);let o=Array.from(n.data.get(i.dataId).values),s=n.data.get(r.dataId).values,c=Array.from(n.data.get(a.dataId).values),[l,u,d]=kD(s,r.shape,r.dtype,o,c);return[n.makeTensorInfo(u,r.dtype,l),n.makeTensorInfo([d.length],a.dtype,new Int32Array(d))]}var _M={kernelName:er,backendName:`cpu`,kernelFunc:gM};function vM(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
          ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
          ${a.shape}`);if(i.shape[0]!==a.shape[0])throw Error(`segmentIds and indices should have same size.`);let o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=AD(o,r.shape,r.dtype,s,c,!0);return n.makeTensorInfo(u,r.dtype,l)}var yM={kernelName:tr,backendName:`cpu`,kernelFunc:vM};function bM(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
         ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
         ${a.shape}`);if(i.shape[0]!==a.shape[0])throw Error(`segmentIds and indices should have same size.`);let o=n.data.get(r.dataId).values,s=n.data.get(i.dataId).values,c=n.data.get(a.dataId).values,[l,u]=AD(o,r.shape,r.dtype,s,c);return n.makeTensorInfo(u,r.dtype,l)}var xM={kernelName:nr,backendName:`cpu`,kernelFunc:bM};function SM(e){let{inputs:t,backend:n,attrs:r}=e,{sparseIndices:i,sparseValues:a,defaultValue:o}=t,{outputShape:s}=r,{sliceRank:c,numUpdates:l,sliceSize:u,strides:d,outputSize:f}=wf(a,i,s),p=n.bufferSync(i),m;switch(a.dtype){case`bool`:m=xD(p,n.bufferSync(a),s,f,u,l,c,d,!!n.data.get(o.dataId).values[0],!1);break;case`float32`:{let e=n.bufferSync(a),t=n.data.get(o.dataId).values[0];m=xD(p,e,s,f,u,l,c,d,t,!1);break}case`int32`:{let e=n.bufferSync(a),t=n.data.get(o.dataId).values[0];m=xD(p,e,s,f,u,l,c,d,t,!1);break}case`string`:m=xD(p,n.bufferSync(a),s,f,u,l,c,d,oi(n.data.get(o.dataId).values[0]),!1);break;default:throw Error(`Unsupported type ${a.dtype}`)}return n.makeTensorInfo(s,m.dtype,m.values)}var CM={kernelName:rr,backendName:`cpu`,kernelFunc:SM};function wM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{numOrSizeSplits:a,axis:o}=r,s=E(o,i.shape)[0],c=Th(i,a,s),l=Array(i.shape.length).fill(0),u=i.shape.slice();return c.map(e=>{let t=[...u];t[s]=e;let r=ED({inputs:{x:i},backend:n,attrs:{begin:l,size:t}});return l[s]+=e,r})}var TM={kernelName:Zn,backendName:`cpu`,kernelFunc:wM},EM={kernelName:ar,backendName:`cpu`,kernelFunc:({inputs:e,backend:t})=>{let{x:n}=e,r=t;X(n,`square`);let i=r.data.get(n.dataId).values,a=new Float32Array(i.length);for(let e=0;e<i.length;++e){let t=i[e];a[e]=t*t}return{dataId:r.write(a,n.shape,n.dtype),shape:n.shape,dtype:n.dtype}}},DM={kernelName:br,backendName:`cpu`,kernelFunc:cE(br,(e,t)=>isNaN(e)?NaN:e>0?1:t.alpha)};function OM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,end:o,strides:s,beginMask:c,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:f}=r;X(i,`stridedSlice`);let{finalShapeSparse:p,finalShape:m,isIdentity:h,sliceDim0:_,isSimpleSlice:v,begin:y,end:b,strides:x}=Nm(i.shape,a,o,s,c,l,u,d,f),S;if(h)S=uO({inputs:{x:i},backend:n,attrs:{shape:m}});else if(_||v){g(i.shape.length>=1,()=>`Input must have rank at least 1, got: ${i.shape.length}`);let e=bm(y,b,x),t=ED({inputs:{x:i},backend:n,attrs:{begin:y,size:e}});S=uO({inputs:{x:t},backend:n,attrs:{shape:m}}),n.disposeIntermediateTensorInfo(t)}else{let e=LD(p,n.bufferSync(i),x,y);S=n.makeTensorInfo(m,e.dtype,e.values)}return S}var kM={kernelName:sr,backendName:`cpu`,kernelFunc:OM};function AM(e){let{inputs:t,backend:n,attrs:r}=e,{separator:i,nGramWidths:a,leftPad:o,rightPad:s,padWidth:c,preserveShortSequences:l}=r,{data:u,dataSplits:d}=t,f=n.data.get(u.dataId).values,p=n.data.get(d.dataId).values,[m,h]=zD(f,p,i,a,o,s,c,l);return[n.makeTensorInfo([m.length],`string`,m),n.makeTensorInfo(d.shape,`int32`,h)]}var jM={kernelName:cr,backendName:`cpu`,kernelFunc:AM};function MM(e){let{inputs:t,backend:n,attrs:r}=e,{skipEmpty:i}=r,{input:a,delimiter:o}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(a.shape.length!==1)throw Error(`Input must be a vector, got shape: ${a.shape}`);if(o.shape.length!==0)throw Error(`Delimiter must be a scalar, got shape: ${o.shape}`);let s=n.data.get(a.dataId).values,c=n.data.get(o.dataId).values[0],[l,u,d]=VD(s,c,i),f=u.length;return[n.makeTensorInfo([f,2],`int32`,l),n.makeTensorInfo([f],`string`,u),n.makeTensorInfo([2],`int32`,new Int32Array(d))]}var NM={kernelName:lr,backendName:`cpu`,kernelFunc:MM};function PM(e){let{inputs:t,backend:n,attrs:r}=e,{numBuckets:i}=r,{input:a}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(i<=0)throw Error(`Number of buckets must be at least 1`);let o=n.data.get(a.dataId).values,s=HD(o,i);return n.makeTensorInfo(a.shape,`int32`,s)}var FM={kernelName:ur,backendName:`cpu`,kernelFunc:PM},IM={kernelName:`Tan`,backendName:`cpu`,kernelFunc:cE(`Tan`,e=>Math.tan(e))},LM={kernelName:dr,backendName:`cpu`,kernelFunc:cE(dr,e=>Math.tanh(e))};function RM(e){let{inputs:t,backend:n}=e,{tensor:r,indices:i,updates:a}=t,{sliceRank:o,numUpdates:s,sliceSize:c,strides:l,outputSize:u}=wf(a,i,r.shape),d=n.bufferSync(i),f=n.bufferSync(a),p=n.bufferSync(r),m=xD(d,f,r.shape,u,c,s,o,l,p,!1);return n.makeTensorInfo(r.shape,m.dtype,m.values)}var zM={kernelName:Bn,backendName:`cpu`,kernelFunc:RM};function BM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reps:a}=r;X(i,`tile`);let o=KD(n.bufferSync(i),a);return n.makeTensorInfo(o.shape,o.dtype,o.values)}var VM={kernelName:fr,backendName:`cpu`,kernelFunc:BM};function HM(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{k:a,sorted:o}=r;X(i,`topk`);let s=n.data.get(i.dataId).values,[c,l]=YD(s,i.shape,i.dtype,a,o);return[n.makeTensorInfo(c.shape,c.dtype,c.values),n.makeTensorInfo(l.shape,l.dtype,l.values)]}var UM={kernelName:pr,backendName:`cpu`,kernelFunc:HM};function WM(e){let{inputs:t,attrs:n,backend:r}=e,{image:i,transforms:a}=t,{interpolation:o,fillMode:s,fillValue:c,outputShape:l}=n,[u,d,f,p]=i.shape,[m,h]=l??[d,f],g=[u,m,h,p],_=A(i.shape),v=_[0],b=_[1],x=_[2],S=A(g),C=S[0],w=S[1],T=S[2],E=O(i.dtype,y(g));E.fill(c);let D=r.data.get(i.dataId).values,k=r.data.get(a.dataId).values;for(let e=0;e<u;++e){let t=a.shape[0]===1?k:k.subarray(e*8,e*8+8);for(let n=0;n<m;++n)for(let r=0;r<h;++r)for(let i=0;i<p;++i){let a,l=t[6]*r+t[7]*n+1;if(l===0)continue;let u=(t[0]*r+t[1]*n+t[2])/l,p=(t[3]*r+t[4]*n+t[5])/l,m=KM(u,f,s),h=KM(p,d,s);switch(o){case`nearest`:a=QM(D,d,f,v,b,x,e,h,m,i,c);break;case`bilinear`:a=$M(D,d,f,v,b,x,e,h,m,i,c);break;default:throw Error(`Error in Transform: Expect 'nearest' or 'bilinear', but got ${o}`)}let g=e*C+n*w+r*T+i;E[g]=a}return r.makeTensorInfo(g,i.dtype,E)}return{dataId:r.write(E,g,i.dtype),shape:i.shape,dtype:i.dtype}}var GM={kernelName:mr,backendName:`cpu`,kernelFunc:WM};function KM(e,t,n){switch(n){case`reflect`:return qM(e,t);case`wrap`:return JM(e,t);case`nearest`:return XM(e,t);default:return YM(e,t)}}function qM(e,t){let n=e;if(n<0)if(t<=1)n=0;else{let e=2*t;n<e&&(n=e*Math.trunc(-n/e)+n),n=n<-t?n+e:-n-1}else if(n>t-1)if(t<=1)n=0;else{let e=2*t;n-=e*Math.trunc(n/e),n>=t&&(n=e-n-1)}return f(0,n,t-1)}function JM(e,t){let n=e;if(n<0)if(t<=1)n=0;else{let e=t-1;n+=t*(Math.trunc(-n/e)+1)}else if(n>t-1)if(t<=1)n=0;else{let e=t-1;n-=t*Math.trunc(n/e)}return f(0,n,t-1)}function YM(e,t){return e}function XM(e,t){return f(0,e,t-1)}function ZM(e,t,n,r,i,a,o,s,c,l,u){let d=o*r+s*i+c*a+l;return 0<=s&&s<t&&0<=c&&c<n?e[d]:u}function QM(e,t,n,r,i,a,o,s,c,l,u){return ZM(e,t,n,r,i,a,o,Math.round(s),Math.round(c),l,u)}function $M(e,t,n,r,i,a,o,s,c,l,u){let d=Math.floor(s),f=Math.floor(c),p=d+1,m=f+1,h=(m-c)*ZM(e,t,n,r,i,a,o,d,f,l,u)+(c-f)*ZM(e,t,n,r,i,a,o,d,m,l,u),g=(m-c)*ZM(e,t,n,r,i,a,o,p,f,l,u)+(c-f)*ZM(e,t,n,r,i,a,o,p,m,l,u);return(p-s)*h+(s-d)*g}function eN(e){let{inputs:t,attrs:n,backend:r}=e,{axis:i}=n,{x:a}=t;X(a,`unique`);let o=r.data.get(a.dataId).values,{outputValues:s,outputShape:c,indices:l}=XD(o,i,a.shape,a.dtype);return[r.makeTensorInfo(c,a.dtype,s),r.makeTensorInfo([l.length],`int32`,l)]}var tN={kernelName:gr,backendName:`cpu`,kernelFunc:eN};function nN(e){let{inputs:t,backend:n,attrs:r}=e,{value:i}=t,{axis:a}=r;a<0&&(a+=i.shape.length);let o=i.shape.length,s=i.shape[a],c=Array(o-1),l=0;for(let e=0;e<o;e++)e!==a&&(c[l++]=i.shape[e]);let u=Array(o).fill(0),d=i.shape.slice();d[a]=1;let f=Array(s);for(let e=0;e<f.length;e++){u[a]=e;let t=ED({inputs:{x:i},backend:n,attrs:{begin:u,size:d}});f[e]=uO({inputs:{x:t},backend:n,attrs:{shape:c}}),n.disposeIntermediateTensorInfo(t)}return f}var rN={kernelName:_r,backendName:`cpu`,kernelFunc:nN};function iN(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,segmentIds:a}=t,{numSegments:o}=r;X(i,`unsortedSegmentSum`);let s=i.shape.length,c=a.shape.length,l=[],u=[],d=s-c,f=a;for(let e=0;e<d;++e){let t=tA({inputs:{input:f},backend:n,attrs:{dim:e+1}});f=t,u.push(t)}for(let e=0;e<o;++e){let t=ti(e,`int32`),r=n.makeTensorInfo([],`int32`,t),a=mE({inputs:{a:r,b:f},backend:n}),o=XT({inputs:{x:a},backend:n,attrs:{dtype:`float32`}}),s=WE({inputs:{a:o,b:i},backend:n}),c=Hk({inputs:{x:s},backend:n,attrs:{axis:0,keepDims:!1}});l.push(c),u.push(r),u.push(a),u.push(o),u.push(s),u.push(c)}let p=Cj({inputs:l,backend:n,attrs:{axis:0}});return u.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var aN=[hO,BT,gO,_O,nE,yO,xO,CO,TO,DO,OO,kO,AO,jO,MO,RO,BO,HO,WO,pO,KO,JO,XO,oE,QO,ZT,dE,$O,UT,ek,ik,ok,ck,uk,fk,mk,gk,_k,vk,bk,Sk,wk,Ek,Ok,Ak,Mk,Pk,Ik,Lk,Rk,zk,Vk,Gk,$D,qk,hE,eA,vE,nA,bE,dA,pA,hA,SE,wE,_A,yA,xA,CA,OE,AE,KT,TA,nk,EA,DA,OA,tO,ME,PE,AA,LE,jA,MA,NA,PA,IA,RA,BA,BE,HA,WA,KA,JA,XA,QA,ej,HE,nj,rj,sj,GE,JE,uj,pj,gj,XE,vj,Sj,wj,Ej,Dj,iO,nD,kj,jj,Nj,Fj,JT,iA,Ij,oO,cO,dO,Rj,Bj,Hj,Wj,Kj,qj,Jj,bD,Xj,tM,rM,oM,wD,sM,cM,lM,DD,aj,dM,pM,hM,_M,yM,xM,CM,TM,MD,EM,PD,ID,DM,kM,jM,NM,FM,GD,Uk,IM,LM,zM,VM,UM,GM,$E,tN,rN,{kernelName:vr,backendName:`cpu`,kernelFunc:iN},bj];for(let e of aN)Nr(e);var oN={},sN={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function cN(e,t){oN[e]=t}function lN(e,t){if(!(e in oN)||t!=null){let n=dN(e,t);if(n!==null)oN[e]=n;else return console.log(`Could not get context for WebGL version`,e),null}let n=oN[e];return n==null||n.isContextLost()?(delete oN[e],lN(e)):(n.disable(n.DEPTH_TEST),n.disable(n.STENCIL_TEST),n.disable(n.BLEND),n.disable(n.DITHER),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SAMPLE_COVERAGE),n.enable(n.SCISSOR_TEST),n.enable(n.CULL_FACE),n.cullFace(n.BACK),oN[e])}function uN(e){if(!j().getBool(`IS_SAFARI`)&&typeof OffscreenCanvas<`u`&&e===2)return new OffscreenCanvas(300,150);if(typeof document<`u`)return document.createElement(`canvas`);throw Error(`Cannot create a canvas in this context`)}function dN(e,t){if(e!==1&&e!==2)throw Error(`Cannot get WebGL rendering context, WebGL is disabled.`);let n=t??uN(e);return n.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),delete oN[e]},!1),j().getBool(`SOFTWARE_WEBGL_ENABLED`)&&(sN.failIfMajorPerformanceCaveat=!1),e===1?n.getContext(`webgl`,sN)||n.getContext(`experimental-webgl`,sN):n.getContext(`webgl2`,sN)}var fN;(function(e){e[e.DENSE=0]=`DENSE`,e[e.SHARED_BATCH=1]=`SHARED_BATCH`})(fN||={});var pN;(function(e){e[e.RENDER=0]=`RENDER`,e[e.UPLOAD=1]=`UPLOAD`,e[e.PIXELS=2]=`PIXELS`,e[e.DOWNLOAD=3]=`DOWNLOAD`})(pN||={});var mN;(function(e){e[e.UNPACKED_FLOAT16=0]=`UNPACKED_FLOAT16`,e[e.UNPACKED_FLOAT32=1]=`UNPACKED_FLOAT32`,e[e.PACKED_4X1_UNSIGNED_BYTE=2]=`PACKED_4X1_UNSIGNED_BYTE`,e[e.PACKED_2X2_FLOAT32=3]=`PACKED_2X2_FLOAT32`,e[e.PACKED_2X2_FLOAT16=4]=`PACKED_2X2_FLOAT16`})(mN||={});function hN(e,t){return[t,e]}function gN(e,t){return e*t}function _N(e){let t=y(e);return S(Math.ceil(t/4))}function vN(e,t){return[Math.max(1,Math.ceil(t/2)),Math.max(1,Math.ceil(e/2))]}function yN(e,t){let[n,r]=vN(e,t);return n*r*4}function bN(e,t){let n=e,r,i,a,o,s,c,l,u,d,f;return j().getNumber(`WEBGL_VERSION`)===2?(r=n.R32F,i=n.R16F,a=n.RGBA16F,o=n.RGBA32F,s=n.RED,l=4,u=1,d=n.HALF_FLOAT,f=n.FLOAT,c=n.RGBA8):(r=e.RGBA,i=e.RGBA,a=e.RGBA,o=n.RGBA,s=e.RGBA,l=4,u=4,d=t==null?null:t.HALF_FLOAT_OES,f=e.FLOAT,c=e.RGBA),{internalFormatFloat:r,internalFormatHalfFloat:i,internalFormatPackedHalfFloat:a,internalFormatPackedFloat:o,textureFormatFloat:s,downloadTextureFormat:c,downloadUnpackNumChannels:l,defaultNumChannels:u,textureTypeHalfFloat:d,textureTypeFloat:f}}function Z(e,t){let n=t();return j().getBool(`DEBUG`)&&xN(e),n}function xN(e){let t=e.getError();if(t!==e.NO_ERROR)throw Error(`WebGL Error: `+TN(e,t))}var SN=5.96e-8,CN=65504;function wN(e){return!!(j().getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)||e===0||SN<Math.abs(e)&&Math.abs(e)<CN)}function TN(e,t){switch(t){case e.NO_ERROR:return`NO_ERROR`;case e.INVALID_ENUM:return`INVALID_ENUM`;case e.INVALID_VALUE:return`INVALID_VALUE`;case e.INVALID_OPERATION:return`INVALID_OPERATION`;case e.INVALID_FRAMEBUFFER_OPERATION:return`INVALID_FRAMEBUFFER_OPERATION`;case e.OUT_OF_MEMORY:return`OUT_OF_MEMORY`;case e.CONTEXT_LOST_WEBGL:return`CONTEXT_LOST_WEBGL`;default:return`Unknown error code ${t}`}}function EN(e,t){return JN(e,()=>e.getExtension(t),`Extension "`+t+`" not supported on this browser.`)}function DN(e,t){let n=JN(e,()=>e.createShader(e.VERTEX_SHADER),`Unable to create vertex WebGLShader.`);if(Z(e,()=>e.shaderSource(n,t)),Z(e,()=>e.compileShader(n)),e.getShaderParameter(n,e.COMPILE_STATUS)===!1)throw console.log(e.getShaderInfoLog(n)),Error(`Failed to compile vertex shader.`);return n}function ON(e,t){let n=JN(e,()=>e.createShader(e.FRAGMENT_SHADER),`Unable to create fragment WebGLShader.`);if(Z(e,()=>e.shaderSource(n,t)),Z(e,()=>e.compileShader(n)),j().get(`ENGINE_COMPILE_ONLY`))return n;if(e.getShaderParameter(n,e.COMPILE_STATUS)===!1)throw AN(t,e.getShaderInfoLog(n)),Error(`Failed to compile fragment shader.`);return n}var kN=/ERROR: [0-9]+:([0-9]+):/g;function AN(e,t){let n=kN.exec(t);if(n==null){console.log(`Couldn't parse line number in error: ${t}`),console.log(e);return}let r=+n[1],i=e.split(`
`),a=i.length.toString().length+2,o=i.map((e,t)=>C((t+1).toString(),a)+e),s=0;for(let e=0;e<o.length;e++)s=Math.max(o[e].length,s);let c=o.slice(0,r-1),l=o.slice(r-1,r),u=o.slice(r);console.log(c.join(`
`)),console.log(t.split(`
`)[0]),console.log(`%c ${C(l[0],s)}`,`border:1px solid red; background-color:#e3d2d2; color:#a61717`),console.log(u.join(`
`))}function jN(e){return JN(e,()=>e.createProgram(),`Unable to create WebGLProgram.`)}function MN(e,t){if(Z(e,()=>e.linkProgram(t)),!j().get(`ENGINE_COMPILE_ONLY`)&&e.getProgramParameter(t,e.LINK_STATUS)===!1)throw console.log(e.getProgramInfoLog(t)),Error(`Failed to link vertex and fragment shaders.`)}function NN(e,t){if(Z(e,()=>e.validateProgram(t)),e.getProgramParameter(t,e.VALIDATE_STATUS)===!1)throw console.log(e.getProgramInfoLog(t)),Error(`Shader program validation failed.`)}function PN(e,t){let n=JN(e,()=>e.createBuffer(),`Unable to create WebGLBuffer`);return Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,n)),Z(e,()=>e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW)),n}function FN(e,t){let n=JN(e,()=>e.createBuffer(),`Unable to create WebGLBuffer`);return Z(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n)),Z(e,()=>e.bufferData(e.ELEMENT_ARRAY_BUFFER,t,e.STATIC_DRAW)),n}function IN(e){return JN(e,()=>e.createTexture(),`Unable to create WebGLTexture.`)}function LN(e,t){let n=j().getNumber(`WEBGL_MAX_TEXTURE_SIZE`);if(e<=0||t<=0){let n=`[${e}x${t}]`;throw Error(`Requested texture size `+n+` is invalid.`)}if(e>n||t>n){let r=`[${e}x${t}]`,i=`[${n}x${n}]`;throw Error(`Requested texture size `+r+` greater than WebGL maximum on this browser / GPU `+i+`.`)}}function RN(e){return JN(e,()=>e.createFramebuffer(),`Unable to create WebGLFramebuffer.`)}function zN(e,t,n,r,i,a,o){let s=e.getAttribLocation(t,n);return s!==-1&&(Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,r)),Z(e,()=>e.vertexAttribPointer(s,i,e.FLOAT,!1,a,o)),Z(e,()=>e.enableVertexAttribArray(s)),!0)}function BN(e,t,n){YN(e,n),Z(e,()=>e.activeTexture(e.TEXTURE0+n)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,t))}function VN(e,t,n){return JN(e,()=>e.getUniformLocation(t,n),`uniform "`+n+`" not present in program.`)}function HN(e,t,n){return e.getUniformLocation(t,n)}function UN(e,t,n,r){Z(e,()=>BN(e,t,r)),Z(e,()=>e.uniform1i(n,r))}function WN(e,t,n){Z(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,n)),Z(e,()=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0))}function GN(e,t){Z(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,t)),Z(e,()=>e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,null,0))}function KN(e){let t=e.checkFramebufferStatus(e.FRAMEBUFFER);if(t!==e.FRAMEBUFFER_COMPLETE)throw Error(`Error binding framebuffer: `+qN(e,t))}function qN(e,t){switch(t){case e.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return`FRAMEBUFFER_INCOMPLETE_ATTACHMENT`;case e.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return`FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT`;case e.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return`FRAMEBUFFER_INCOMPLETE_DIMENSIONS`;case e.FRAMEBUFFER_UNSUPPORTED:return`FRAMEBUFFER_UNSUPPORTED`;default:return`unknown error ${t}`}}function JN(e,t,n){let r=Z(e,()=>t());if(r==null)throw Error(n);return r}function YN(e,t){let n=e.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,r=t+e.TEXTURE0;if(r<e.TEXTURE0||r>n){let e=`[gl.TEXTURE0, gl.TEXTURE${n}]`;throw Error(`textureUnit must be in ${e}.`)}}function XN(e,t=2){return y(e.slice(0,e.length-t))}function ZN(e){if(e.length===0)throw Error(`Cannot get rows and columns of an empty shape array.`);return[e.length>1?e[e.length-2]:1,e[e.length-1]]}function QN(e){let t=[1,1,1];return e.length===0||e.length===1&&e[0]===1||(t=[XN(e),...ZN(e)]),t}function $N(e,t=!1){let n=j().getNumber(`WEBGL_MAX_TEXTURE_SIZE`),r=j().getNumber(`WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE`);r===1/0&&j().getBool(`WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE`)&&(r=n/2),t&&(n*=2,r*=2,e=e.map((t,n)=>n>=e.length-2?p(e[n]):e[n]),e.length===1&&(e=[2,e[0]])),e.length!==2&&(e=D(e).newShape);let i=y(e),a=null;e.length<=1&&i<=n?a=[1,i]:e.length===2&&e[0]<=n&&e[1]<=n?a=e:e.length===3&&e[0]*e[1]<=n&&e[2]<=n?a=[e[0]*e[1],e[2]]:e.length===3&&e[0]<=n&&e[1]*e[2]<=n?a=[e[0],e[1]*e[2]]:e.length===4&&e[0]*e[1]*e[2]<=n&&e[3]<=n?a=[e[0]*e[1]*e[2],e[3]]:e.length===4&&e[0]<=n&&e[1]*e[2]*e[3]<=n&&(a=[e[0],e[1]*e[2]*e[3]]);let o=a!=null&&Math.max(...a)>r&&Math.min(...a)<=(t?2:1)&&Math.min(...a)>0;if(a==null||o)if(t){let t=XN(e),n=2,r=2;e.length&&([n,r]=ZN(e)),i=n/2*t*(r/2),a=S(i).map(e=>e*2)}else a=S(i);return a}function eP(e){return e%2==0}function tP(e,t){if(e=e.slice(-2),t=t.slice(-2),b(e,t)||!e.length||!t.length||e[0]===0||e[1]===0||t[0]===0||t[1]===0)return!0;if(e.length!==t.length){let n=e[e.length-1],r=t[t.length-1];if(n===r||eP(n)&&eP(r)&&(e[0]===1||t[0]===1))return!0}return e[1]===t[1]&&eP(e[0])&&eP(t[0])}var nP,rP;function iP(e){if(nP==null){let t=lN(e);nP=t.getParameter(t.MAX_TEXTURE_SIZE)}return nP}function aP(e){if(rP==null){let t=lN(e);rP=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,rP)}function oP(e){if(e===0)return 0;let t,n=lN(e);return t=sP(n,`EXT_disjoint_timer_query_webgl2`)&&e===2?2:+!!sP(n,`EXT_disjoint_timer_query`),t}function sP(e,t){return e.getExtension(t)!=null}function cP(e){try{if(lN(e)!=null)return!0}catch(e){return console.log(`Error when getting WebGL context: `,e),!1}return!1}function lP(e){if(e===0)return!1;let t=lN(e);if(e===1){if(!sP(t,`OES_texture_float`))return!1}else if(!sP(t,`EXT_color_buffer_float`))return!1;return dP(t)}function uP(e){if(e===0)return!1;let t=lN(e);if(e===1){if(!sP(t,`OES_texture_float`)||!sP(t,`WEBGL_color_buffer_float`))return!1}else{if(sP(t,`EXT_color_buffer_float`))return dP(t);let e=`EXT_color_buffer_half_float`;return sP(t,e)?fP(t,t.getExtension(e)):!1}return dP(t)}function dP(e){let t=bN(e),n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,t.internalFormatFloat,1,1,0,t.textureFormatFloat,t.textureTypeFloat,null);let r=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0);let i=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.deleteTexture(n),e.deleteFramebuffer(r),i}function fP(e,t){let n=bN(e,t),r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,n.internalFormatHalfFloat,1,1,0,n.textureFormatFloat,n.textureTypeHalfFloat,null);let i=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0);let a=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.deleteTexture(r),e.deleteFramebuffer(i),a}function pP(e){return e===2&&lN(e).fenceSync!=null}function mP(e,t){Array.isArray(e)||(e=[e]),e.forEach(e=>{e!=null&&g(e.dtype!==`complex64`,()=>`${t} does not support complex64 tensors in the WebGL backend.`)})}var Q=j();Q.registerFlag(`HAS_WEBGL`,()=>Q.getNumber(`WEBGL_VERSION`)>0),Q.registerFlag(`WEBGL_VERSION`,()=>cP(2)?2:+!!cP(1)),Q.registerFlag(`WEBGL_CHECK_NUMERICAL_PROBLEMS`,()=>!1),Q.registerFlag(`WEBGL_BUFFER_SUPPORTED`,()=>Q.get(`WEBGL_VERSION`)===2),Q.registerFlag(`WEBGL_CPU_FORWARD`,()=>!0),Q.registerFlag(`WEBGL_FORCE_F16_TEXTURES`,()=>!1),Q.registerFlag(`WEBGL_PACK`,()=>Q.getBool(`HAS_WEBGL`)),Q.registerFlag(`WEBGL_PACK_NORMALIZATION`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_CLIP`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_DEPTHWISECONV`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_BINARY_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_UNARY_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_ARRAY_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_IMAGE_OPERATIONS`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_REDUCE`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_LAZILY_UNPACK`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_CONV_IM2COL`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_PACK_CONV2DTRANSPOSE`,()=>Q.getBool(`WEBGL_PACK`)),Q.registerFlag(`WEBGL_MAX_TEXTURE_SIZE`,()=>iP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_MAX_TEXTURES_IN_SHADER`,()=>aP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`,()=>{let e=Q.getNumber(`WEBGL_VERSION`);return e===0?0:oP(e)}),Q.registerFlag(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`,()=>Q.getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)>0&&!$i()),Q.registerFlag(`WEBGL_RENDER_FLOAT32_CAPABLE`,()=>lP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_RENDER_FLOAT32_ENABLED`,()=>!Q.getBool(`WEBGL_FORCE_F16_TEXTURES`)&&Q.getBool(`WEBGL_RENDER_FLOAT32_CAPABLE`)),Q.registerFlag(`WEBGL_DOWNLOAD_FLOAT_ENABLED`,()=>uP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_FENCE_API_ENABLED`,()=>pP(Q.getNumber(`WEBGL_VERSION`))),Q.registerFlag(`WEBGL_SIZE_UPLOAD_UNIFORM`,()=>Q.getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)?4:0),Q.registerFlag(`WEBGL_DELETE_TEXTURE_THRESHOLD`,()=>-1,e=>{if(typeof e!=`number`)throw Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be a number but got ${e}.`);if(e<0&&e!==-1)throw Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be -1 (indicating never delete) or at least 0, but got ${e}.`)}),Q.registerFlag(`WEBGL_FLUSH_THRESHOLD`,()=>$i()?1:-1,e=>{if(typeof e!=`number`)throw Error(`WEBGL_FLUSH_THRESHOLD must be a number but got ${e}.`);if(e<0&&e!==-1)throw Error(`WEBGL_FLUSH_THRESHOLD must be -1 (indicating never manual flush) or at least 0, but got ${e}.`)}),Q.registerFlag(`CPU_HANDOFF_SIZE_THRESHOLD`,()=>128),Q.registerFlag(`WEBGL_USE_SHAPES_UNIFORMS`,()=>!1),Q.registerFlag(`TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD`,()=>1e5),Q.registerFlag(`TOPK_K_CPU_HANDOFF_THRESHOLD`,()=>128),Q.registerFlag(`WEBGL_EXP_CONV`,()=>!1),Q.registerFlag(`SOFTWARE_WEBGL_ENABLED`,()=>Q.getBool(`IS_TEST`)),Q.registerFlag(`WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE`,()=>1/0),Q.registerFlag(`WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE`,()=>!1),Q.registerFlag(`WEBGL2_ISNAN_CUSTOM`,()=>!1),Q.registerFlag(`ENGINE_COMPILE_ONLY`,()=>!1);function hP(){let e,t,n,r,i,a,o,s,c,l;return j().getNumber(`WEBGL_VERSION`)===2?(e=`#version 300 es`,t=`in`,n=`out`,r=`in`,i=`texture`,a=`outputColor`,o=`out vec4 outputColor;`,s=j().getBool(`WEBGL2_ISNAN_CUSTOM`)?`
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
    `),{version:e,attribute:t,varyingVs:n,varyingFs:r,texture2D:i,output:a,defineOutput:o,defineSpecialNaN:s,defineSpecialInf:c,defineRound:l}}function gP(e,t,n=`index`){let r=A(t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / ${t}`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * ${t}`:`index -= ${e[i]} * ${t}`};`).join(``)}function _P(e,t,n=`index`){let r=A(t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / outShapeStrides[${i}]`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * outShapeStrides[${i}]`:`index -= ${e[i]} * outShapeStrides[${i}]`};`).join(``)}function vP(e,t){let n=e.length,r=e.map(e=>`${t}[${e}]`),i=Array(n-1);i[n-2]=r[n-1];for(let e=n-3;e>=0;--e)i[e]=`(${i[e+1]} * ${r[e+1]})`;return i}function yP(e,t,n=`index`){let r=vP(e.map((e,t)=>t),t);return r.map((t,i)=>`${`int ${e[i]} = ${n} / ${r[i]}`}; ${i===r.length-1?`int ${e[i+1]} = ${n} - ${e[i]} * ${r[i]}`:`index -= ${e[i]} * ${r[i]}`};`).join(``)}function bP(e){let t=A(e).map(e=>e.toString());return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * ${t[0]} + coords.y * ${t[1]} + coords.z;
  }
`}function xP(){return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * outShapeStrides[0] + coords.y * outShapeStrides[1] + coords.z;
  }
`}var SP=`
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
`,{getBroadcastDims:CP}=Hh;function wP(e,t,n){let r=[];if(e.forEach(e=>{let t=y(e.shapeInfo.logicalShape);if(e.shapeInfo.isUniform?r.push(`uniform float ${e.name}${t>1?`[${t}]`:``};`):(r.push(`uniform sampler2D ${e.name};`),r.push(`uniform int offset${e.name};`)),n.enableShapeUniforms){let{uniformShape:t}=fF(n.packedInputs,e.shapeInfo.logicalShape,e.shapeInfo.texShape);switch(t.length){case 1:r.push(`uniform int ${e.name}Shape;`);break;case 2:r.push(`uniform ivec2 ${e.name}Shape;`);break;case 3:r.push(`uniform ivec3 ${e.name}Shape;`);break;case 4:r.push(`uniform ivec4 ${e.name}Shape;`)}r.push(`uniform ivec2 ${e.name}TexShape;`)}}),n.enableShapeUniforms){switch(t.logicalShape.length){case 1:r.push(`uniform int outShape;`);break;case 2:r.push(`uniform ivec2 outShape;`),r.push(`uniform int outShapeStrides;`);break;case 3:r.push(`uniform ivec3 outShape;`),r.push(`uniform ivec2 outShapeStrides;`);break;case 4:r.push(`uniform ivec4 outShape;`),r.push(`uniform ivec3 outShapeStrides;`)}r.push(`uniform ivec2 outTexShape;`)}n.customUniforms&&n.customUniforms.forEach(e=>{r.push(`uniform ${e.type} ${e.name}${e.arrayIndex?`[${e.arrayIndex}]`:``};`)});let i=r.join(`
`),a=e.map(e=>DP(e,t,n.packedInputs,n.enableShapeUniforms)).join(`
`),o=t.texShape,s=hP(),c=AP(s),l,u,d=NP(s);return t.isPacked?(l=OP(t.logicalShape,o,n.enableShapeUniforms),u=MP(s)):(l=kP(t.logicalShape,o,n.enableShapeUniforms),u=jP(s)),n.packedInputs&&(d+=LP),[d,c,u,i,l,a,n.userCode].join(`
`)}function TP(e,t=!1){let n=e.shapeInfo.logicalShape;switch(n.length){case 0:return ZP(e,t);case 1:return $P(e,t);case 2:return tF(e,t);case 3:return rF(e,t);case 4:return aF(e,t);case 5:return oF(e);case 6:return sF(e);default:throw Error(`${n.length}-D input sampling is not yet supported`)}}function EP(e,t){switch(e.shapeInfo.logicalShape.length){case 0:return XP(e);case 1:return QP(e,t);case 2:return eF(e,t);case 3:return nF(e,t);default:return iF(e,t)}}function DP(e,t,n=!1,r){let i=``;i+=n?EP(e,r):TP(e,r);let a=e.shapeInfo.logicalShape,o=t.logicalShape;return a.length<=o.length&&(i+=n?lF(e,t):uF(e,t)),i}function OP(e,t,n){switch(e.length){case 0:return RP();case 1:return zP(e,t,n);case 2:return qP(e,t,n);case 3:return VP(e,t,n);default:return UP(e,t,n)}}function kP(e,t,n){switch(e.length){case 0:return RP();case 1:return BP(e,t,n);case 2:return JP(e,t,n);case 3:return HP(e,t,n);case 4:return WP(e,t,n);case 5:return GP(e,t);case 6:return KP(e,t);default:throw Error(`${e.length}-D output sampling is not yet supported`)}}function AP(e){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return ${e.texture2D}(textureSampler, uv).r;
    }
  `}function jP(e){return`
    void setOutput(float val) {
      ${e.output} = vec4(val, 0, 0, 0);
    }
  `}function MP(e){return`
    void setOutput(vec4 val) {
      ${e.output} = val;
    }
  `}function NP(e){return`${e.version}
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

    ${PP}
    ${FP}
    ${IP}
  `}var PP=`
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
`,FP=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,IP=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,LP=`
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
`;function RP(){return`
    int getOutputCoords() {
      return 0;
    }
  `}function zP(e,t,n){let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];return r[0]===1?n?`
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
  `}function BP(e,t,n){return t[0]===1?n?`
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
  `}function VP(e,t,n){if(n)return`
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
  `}function HP(e,t,n){if(n)return`
  ivec3 getOutputCoords() {
    ivec2 resTexRC = ivec2(resultUV.yx *
                           vec2(outTexShape[0], outTexShape[1]));
    int index = resTexRC.x * outTexShape[1] + resTexRC.y;
    ${_P([`r`,`c`,`d`],e)}
    return ivec3(r, c, d);
  }
`;let r=gP([`r`,`c`,`d`],e);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${r}
      return ivec3(r, c, d);
    }
  `}function UP(e,t,n){if(n)return`
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
  `}function WP(e,t,n){if(n)return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      ${_P([`r`,`c`,`d`,`d2`],e)}
      return ivec4(r, c, d, d2);
    }
  `;let r=gP([`r`,`c`,`d`,`d2`],e);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${r}
      return ivec4(r, c, d, d2);
    }
  `}function GP(e,t){let n=gP([`r`,`c`,`d`,`d2`,`d3`],e);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(${t[0]},
                             ${t[1]}));

      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${n}

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `}function KP(e,t){let n=gP([`r`,`c`,`d`,`d2`,`d3`,`d4`],e);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${n}

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `}function qP(e,t,n){let r=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];if(b(e,t))return n?`
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
  `}function JP(e,t,n){return b(e,t)?n?`
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
  `}function YP(e){return`offset${e}`}function XP(e){let t=e.name;return`
    vec4 ${`get`+t.charAt(0).toUpperCase()+t.slice(1)}() {
      return ${hP().texture2D}(${t}, halfCR);
    }
  `}function ZP(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`float ${r}() {return ${n};}`;let[i,a]=e.shapeInfo.texShape;if(i===1&&a===1)return`
      float ${r}() {
        return sampleTexture(${n}, halfCR);
      }
    `;let o=YP(n);if(t)return`
    float ${r}() {
      vec2 uv = uvFromFlat(${n}TexShape[0], ${n}TexShape[1], ${o});
      return sampleTexture(${n}, uv);
    }
  `;let[s,c]=e.shapeInfo.texShape;return`
    float ${r}() {
      vec2 uv = uvFromFlat(${s}, ${c}, ${o});
      return sampleTexture(${n}, uv);
    }
  `}function QP(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=e.shapeInfo.texShape,a=hP();if(t)return`
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
  `}function $P(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`
      float ${r}(int index) {
        ${cF(e)}
      }
    `;let i=e.shapeInfo.texShape,a=i[0],o=i[1];if(o===1&&a===1)return`
      float ${r}(int index) {
        return sampleTexture(${n}, halfCR);
      }
    `;let s=YP(n);return o===1?t?`
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
  `}function eF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape,o=a[0],s=a[1],c=hP();if(a!=null&&b(n,a))return t?`
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
  `}function tF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape;if(a!=null&&b(n,a)){if(t)return`
      float ${i}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${r}TexShape[1], ${r}TexShape[0]);
        return sampleTexture(${r}, uv);
      }
    `;let e=a[0];return`
    float ${i}(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(${a[1]}.0, ${e}.0);
      return sampleTexture(${r}, uv);
    }
  `}let{newShape:o,keptDims:s}=D(n),c=o;if(c.length<n.length)return`
      ${TP(pF(e,c),t)}
      float ${i}(int row, int col) {
        return ${i}(${mF([`row`,`col`],s)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(${n[1]}, 1)));
        ${cF(e)}
      }
    `;let l=a[0],u=a[1],d=YP(r);return u===1?t?`
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
`}function nF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=e.shapeInfo.texShape,o=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];if(n[0]===1)return`
        ${EP(pF(e,n.slice(1)),t)}
        vec4 ${i}(int b, int row, int col) {
          return ${i}(${mF([`b`,`row`,`col`],[1,2])});
        }
      `;let s=hP();if(t)return`
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
  `}function rF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=n[1]*n[2],o=n[2],{newShape:s,keptDims:c}=D(n),l=s;if(l.length<n.length)return`
        ${TP(pF(e,l),t)}
        float ${i}(int row, int col, int depth) {
          return ${i}(${mF([`row`,`col`,`depth`],c)});
        }
      `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(${a}, ${o}, 1)));
        ${cF(e)}
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
  `;let m=YP(r);return t?`
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
  `}function iF(e,t){let n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=hP();if(t)return`
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
  `}function aF(e,t){let n=e.shapeInfo.logicalShape,r=e.name,i=`get`+r.charAt(0).toUpperCase()+r.slice(1),a=n[3],o=n[2]*a,s=n[1]*o,{newShape:c,keptDims:l}=D(n);if(c.length<n.length)return`
      ${TP(pF(e,c),t)}
      float ${i}(int row, int col, int depth, int depth2) {
        return ${i}(${mF([`row`,`col`,`depth`,`depth2`],l)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${i}(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(${s}, ${o}, ${a}, 1)));
        ${cF(e)}
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
    `;let _=YP(r);return t?`
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
  `}function oF(e){let t=e.shapeInfo.logicalShape,n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),i=t[4],a=t[3]*i,o=t[2]*a,s=t[1]*o,{newShape:c,keptDims:l}=D(t);if(c.length<t.length)return`
      ${TP(pF(e,c))}
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        return ${r}(${mF([`row`,`col`,`depth`,`depth2`,`depth3`],l)});
      }
    `;if(e.shapeInfo.isUniform)return`
      float ${r}(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(${s}, ${o}, ${a}, ${i})) +
          depth3;
        ${cF(e)}
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
          depth2 * ${i} + depth3 + ${YP(n)};
      vec2 uv = uvFromFlat(${f}, ${p}, index);
      return sampleTexture(${n}, uv);
    }
  `}function sF(e){let t=e.shapeInfo.logicalShape,n=e.name,r=`get`+n.charAt(0).toUpperCase()+n.slice(1),{newShape:i,keptDims:a}=D(t);if(i.length<t.length)return`
      ${TP(pF(e,i))}
      float ${r}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return ${r}(${mF([`row`,`col`,`depth`,`depth2`,`depth3`,`depth4`],a)});
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
        ${cF(e)}
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
          depth2 * ${s} + depth3 * ${o} + depth4 + ${YP(n)};
      vec2 uv = uvFromFlat(${p}, ${m}, index);
      return sampleTexture(${n}, uv);
    }
  `}function cF(e){let t=e.name,n=y(e.shapeInfo.logicalShape);return n<2?`return ${t};`:`
    for (int i = 0; i < ${n}; i++) {
      if (i == index) {
        return ${t}[i];
      }
    }
  `}function lF(e,t){let n=e.name,r=n.charAt(0).toUpperCase()+n.slice(1),i=`get`+r+`AtOutCoords`,a=e.shapeInfo.logicalShape.length,o=t.logicalShape.length,s=CP(e.shapeInfo.logicalShape,t.logicalShape),c=dF(o),l=o-a,u,d=[`x`,`y`,`z`,`w`,`u`,`v`];u=a===0?``:o<2&&s.length>=1?`coords = 0;`:s.map(e=>`coords.${d[e+l]} = 0;`).join(`
`);let f=``;f=o<2&&a>0?`coords`:e.shapeInfo.logicalShape.map((e,t)=>`coords.${d[t+l]}`).join(`, `);let p=`return outputValue;`,m=y(e.shapeInfo.logicalShape)===1,h=y(t.logicalShape)===1;if(a===1&&!m&&!h)p=`
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
  `}function uF(e,t){let n=e.name,r=n.charAt(0).toUpperCase()+n.slice(1),i=`get`+r+`AtOutCoords`,a=t.texShape,o=e.shapeInfo.texShape,s=e.shapeInfo.logicalShape.length,c=t.logicalShape.length;if(!e.shapeInfo.isUniform&&s===c&&e.shapeInfo.flatOffset==null&&b(o,a))return`
      float ${i}() {
        return sampleTexture(${n}, resultUV);
      }
    `;let l=dF(c),u=CP(e.shapeInfo.logicalShape,t.logicalShape),d=c-s,f,p=[`x`,`y`,`z`,`w`,`u`,`v`];f=s===0?``:c<2&&u.length>=1?`coords = 0;`:u.map(e=>`coords.${p[e+d]} = 0;`).join(`
`);let m=``;return m=c<2&&s>0?`coords`:e.shapeInfo.logicalShape.map((e,t)=>`coords.${p[t+d]}`).join(`, `),`
    float ${i}() {
      ${l} coords = getOutputCoords();
      ${f}
      return get${r}(${m});
    }
  `}function dF(e){if(e<=1)return`int`;if(e===2)return`ivec2`;if(e===3)return`ivec3`;if(e===4)return`ivec4`;if(e===5)return`ivec5`;if(e===6)return`ivec6`;throw Error(`GPU for rank ${e} is not yet supported`)}function fF(e,t,n){let{newShape:r,keptDims:i}=D(t),a=t.length,o=e&&a===3&&t[0]===1,s=o?t.slice(1):r,c=!e&&a>1&&!b(t,n)&&r.length<a||o;return{useSqueezeShape:c,uniformShape:c?s:t,keptDims:i}}function pF(e,t){let n=JSON.parse(JSON.stringify(e));return n.shapeInfo.logicalShape=t,n}function mF(e,t){return t.map(t=>e[t]).join(`, `)}function hF(e,t,n,r){let i=n.map((e,n)=>{let r={logicalShape:e.shape,texShape:e.isUniform?null:e.texData.texShape,isUniform:e.isUniform,isPacked:!e.isUniform&&e.texData.isPacked,flatOffset:null};return e.texData!=null&&e.texData.slice!=null&&e.texData.slice.flatOffset>0&&(r.flatOffset=e.texData.slice.flatOffset),{name:t.variableNames[n],shapeInfo:r}}),a=i.map(e=>e.shapeInfo),o={logicalShape:r.shape,texShape:r.texData.texShape,isUniform:!1,isPacked:r.texData.isPacked,flatOffset:null},s=wP(i,o,t),c=ON(e.gl,s),l=e.createProgram(c);return j().get(`ENGINE_COMPILE_ONLY`)?{program:t,fragmentShader:c,source:s,webGLProgram:l,inShapeInfos:a,outShapeInfo:o,variablesLocations:null,customUniformLocations:null,infLoc:null,nanLoc:null,outShapeLocation:null,outShapeStridesLocation:null,outTexShapeLocation:null}:(e.buildVao(l),Object.assign({program:t,fragmentShader:c,source:s,webGLProgram:l,inShapeInfos:a,outShapeInfo:o},gF(e,t,l)))}function gF(e,t,n){let r=[],i=[],a,o,s,c=null,l=null;l=e.getUniformLocation(n,`NAN`,!1),j().getNumber(`WEBGL_VERSION`)===1&&(c=e.getUniformLocation(n,`INFINITY`,!1));for(let i of t.variableNames){let a={name:i,uniform:e.getUniformLocation(n,i,!1),offset:e.getUniformLocation(n,`offset${i}`,!1)};t.enableShapeUniforms&&(a.shape=e.getUniformLocation(n,`${i}Shape`,!1),a.texShape=e.getUniformLocation(n,`${i}TexShape`,!1)),r.push(a)}if(t.enableShapeUniforms&&(a=e.getUniformLocation(n,`outShape`,!1),s=e.getUniformLocation(n,`outShapeStrides`,!1),o=e.getUniformLocation(n,`outTexShape`,!1)),t.customUniforms)for(let r of t.customUniforms)i.push(e.getUniformLocation(n,r.name,!1));return{variablesLocations:r,customUniformLocations:i,infLoc:c,nanLoc:l,outShapeLocation:a,outShapeStridesLocation:s,outTexShapeLocation:o}}function _F(e,t){if(e.length!==t.length)throw Error(`Binary was compiled with ${e.length} inputs, but was executed with ${t.length} inputs`);e.forEach((e,n)=>{let r=e.logicalShape,i=t[n],a=i.shape;if(!b(r,a))throw Error(`Binary was compiled with different shapes than the current args. Shapes ${r} and ${a} must match`);if(e.isUniform&&i.isUniform)return;let o=e.texShape,s=i.isUniform?null:i.texData.texShape;if(!b(o,s))throw Error(`Binary was compiled with different texture shapes than the current args. Shape ${o} and ${s} must match`)})}function vF(e,t,n,r,i){t.program.enableShapeUniforms||(_F(t.inShapeInfos,n),_F([t.outShapeInfo],[r]));let a=r.texData.texture,o=r.texData.texShape;r.texData.isPacked?e.setOutputPackedMatrixTexture(a.texture,o[0],o[1]):e.setOutputMatrixTexture(a.texture,o[0],o[1]),e.setProgram(t.webGLProgram),e.bindVertexArray(t.webGLProgram.vao),j().getNumber(`WEBGL_VERSION`)===1&&t.infLoc!==null&&e.gl.uniform1f(t.infLoc,1/0),t.nanLoc!==null&&e.gl.uniform1f(t.nanLoc,NaN);for(let r=0;r<n.length;++r){let i=n[r],{uniform:a,offset:o,shape:s,texShape:c}=t.variablesLocations[r];if(s){let{uniformShape:n}=fF(t.program.packedInputs,i.shape,i.texData.texShape);switch(n.length){case 1:e.gl.uniform1iv(s,new Int32Array(n));break;case 2:e.gl.uniform2iv(s,new Int32Array(n));break;case 3:e.gl.uniform3iv(s,new Int32Array(n));break;case 4:e.gl.uniform4iv(s,new Int32Array(n))}}if(c&&e.gl.uniform2i(c,i.texData.texShape[0],i.texData.texShape[1]),a!=null){if(i.isUniform){if(y(i.shape)<2)e.gl.uniform1f(a,i.uniformValues[0]);else{let t=i.uniformValues;t instanceof Float32Array||(t=new Float32Array(t)),e.gl.uniform1fv(a,t)}continue}i.texData.slice!=null&&o!=null&&e.gl.uniform1i(o,i.texData.slice.flatOffset),e.setInputMatrixTexture(i.texData.texture.texture,a,r)}}let s=t.outShapeLocation;if(s)switch(r.shape.length){case 1:e.gl.uniform1iv(s,new Int32Array(r.shape));break;case 2:e.gl.uniform2iv(s,new Int32Array(r.shape));break;case 3:e.gl.uniform3iv(s,new Int32Array(r.shape));break;case 4:e.gl.uniform4iv(s,new Int32Array(r.shape))}if(t.outShapeStridesLocation){let n=A(r.shape);switch(r.shape.length){case 2:e.gl.uniform1iv(t.outShapeStridesLocation,new Int32Array(n));break;case 3:e.gl.uniform2iv(t.outShapeStridesLocation,new Int32Array(n));break;case 4:e.gl.uniform3iv(t.outShapeStridesLocation,new Int32Array(n))}}if(t.outTexShapeLocation&&e.gl.uniform2i(t.outTexShapeLocation,r.texData.texShape[0],r.texData.texShape[1]),t.program.customUniforms&&i)for(let n=0;n<t.program.customUniforms.length;++n){let r=t.program.customUniforms[n],a=t.customUniformLocations[n],o=i[n];if(r.type===`float`)e.gl.uniform1fv(a,o);else if(r.type===`vec2`)e.gl.uniform2fv(a,o);else if(r.type===`vec3`)e.gl.uniform3fv(a,o);else if(r.type===`vec4`)e.gl.uniform4fv(a,o);else if(r.type===`int`)e.gl.uniform1iv(a,o);else if(r.type===`ivec2`)e.gl.uniform2iv(a,o);else if(r.type===`ivec3`)e.gl.uniform3iv(a,o);else if(r.type===`ivec4`)e.gl.uniform4iv(a,o);else throw Error(`uniform type ${r.type} is not supported yet.`)}e.executeProgram()}function yF(e,t,n){let r=``;t.concat(n).forEach(t=>{let i=t.texData!=null&&t.texData.slice!=null&&t.texData.slice.flatOffset>0;if(e.enableShapeUniforms&&!t.isUniform){let a=t.texData.texShape,{useSqueezeShape:o,uniformShape:s,keptDims:c}=fF(e.packedInputs,t.shape,a),l=``,u=``,d=``;if(s.length===1&&e.packedInputs){let e=[Math.ceil(a[0]/2),Math.ceil(a[1]/2)];l=`${e[0]>1}_${e[1]>1}`}else if(s.length===2&&!e.packedInputs)u=`${s[0]>1}_${s[1]>1}`;else if(s.length>2&&!e.packedInputs){let e=A(s);d=`${e[0]===a[1]}_${e[e.length-1]===a[1]}`}let f=t.shape.length,p=s.length===2&&b(t.shape,a),m=y(t.shape)===1,h=Ec(t.shape,n.shape),g=!e.packedInputs&&f===n.shape.length&&b(a,n.texData.texShape),_=e.packedInputs||s.length>2?``:`${a[0]>1}_${a[1]>1}`;r+=`${f}_${g}_${o?c:``}_${s.length}_${m}_${h}_${p}_${l}_${u}_${d}_${_}_${i}`}else{let e=t.isUniform?`uniform`:t.texData.texShape;r+=`${t.shape}_${e}_${i}`}});let i=e.userCode,a=e.constructor.name;return a+=`_`+r+`_`+i+`${j().getNumber(`WEBGL_VERSION`)}`,a}function bF(e){return j().getBool(`WEBGL_USE_SHAPES_UNIFORMS`)&&e<=4}var xF=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=fN.DENSE,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let t=hP();this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?_P([`r`,`c`,`d`],e):gP([`r`,`c`,`d`],e)}
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
    `}},SF=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=fN.DENSE,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let t=hP();this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?_P([`r`,`c`,`d`],e):gP([`r`,`c`,`d`],e)}
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
    `}},CF=class{constructor(e){this.variableNames=[`A`],this.outTexUsage=pN.DOWNLOAD;let t=hP();this.outputShape=e,this.userCode=`
      ${SP}

      void main() {
        float x = getAAtOutCoords();
        ${t.output} = encode_float(x);
      }
    `}},wF=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=pN.DOWNLOAD;let t=hP();this.outputShape=e,this.userCode=`
      ${SP}

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        ${t.output} = encode_float(x);
      }
    `}},TF={R:0,G:1,B:2,A:3},EF=class{constructor(e,t=!1,n=`RGBA`){this.variableNames=[`A`],this.customUniforms=[{name:`texShape`,type:`ivec2`}];let r=hP();this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length);let i=`result`;t&&(i=`floor(result * 255. + 0.5)`);let a=``;for(let e=0;e<n.length;e++){let t=n[e];a+=`
          if(offset == ${e}) {
            result = values[${TF[t]}];
          }`}this.userCode=`
      ${this.enableShapeUniforms?xP():bP(e)}

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
    `}},DF=class{constructor(e,t=!1){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.customUniforms=[{name:`texShape`,type:`ivec2`}];let n=hP();this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length);let r=``,i=`result`;t&&(i=`floor(result * 255. + 0.5)`);for(let t=0;t<=1;t++)for(let i=0;i<=1;i++){let a=t*2+i;r+=`
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
        ${this.enableShapeUniforms?xP():bP(e)}

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
    `}};function OF(e){let t=hP();return DN(e,`${t.version}
    precision highp float;
    ${t.attribute} vec3 clipSpacePos;
    ${t.attribute} vec2 uv;
    ${t.varyingVs} vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`)}function kF(e){return PN(e,new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]))}function AF(e){return FN(e,new Uint16Array([0,1,2,2,1,3]))}function jF(e,t,n,r,i,a){LN(t,n);let o=IN(e),s=e.TEXTURE_2D;return Z(e,()=>e.bindTexture(s,o)),Z(e,()=>e.texParameteri(s,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE)),Z(e,()=>e.texParameteri(s,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)),Z(e,()=>e.texParameteri(s,e.TEXTURE_MIN_FILTER,e.NEAREST)),Z(e,()=>e.texParameteri(s,e.TEXTURE_MAG_FILTER,e.NEAREST)),j().getNumber(`WEBGL_VERSION`)===1?Z(e,()=>e.texImage2D(s,0,r,t,n,0,i,a,null)):Z(e,()=>e.texStorage2D(s,1,r,t,n)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,null)),{texture:o,texShape:[n,t]}}function MF(e){return e.internalFormatFloat}function NF(e,t,n,r){let[i,a]=hN(t,n);return jF(e,i,a,MF(r),r.textureFormatFloat,e.FLOAT)}function PF(e){return e.internalFormatHalfFloat}function FF(e,t,n,r){let[i,a]=hN(t,n);return jF(e,i,a,PF(r),r.textureFormatFloat,r.textureTypeHalfFloat)}function IF(e){return e.downloadTextureFormat}function LF(e,t,n,r){let[i,a]=hN(t,n);return jF(e,i,a,IF(r),e.RGBA,e.UNSIGNED_BYTE)}function RF(e){return e.internalFormatPackedFloat}function zF(e,t,n,r){let[i,a]=vN(t,n);return jF(e,i,a,RF(r),e.RGBA,e.FLOAT)}function BF(e){return e.internalFormatPackedHalfFloat}function VF(e,t,n,r){let[i,a]=vN(t,n);return jF(e,i,a,BF(r),e.RGBA,r.textureTypeHalfFloat)}function HF(e,t,n){return Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,n)),zN(e,t,`clipSpacePos`,n,3,20,0)&&zN(e,t,`uv`,n,2,20,12)}function UF(e,t,n,r,i,a){Z(e,()=>e.bindTexture(e.TEXTURE_2D,t));let o,s,c;i instanceof Uint8Array?(o=new Uint8Array(n*r*4),s=e.UNSIGNED_BYTE,c=e.RGBA):(o=new Float32Array(n*r*4),s=e.FLOAT,c=a.internalFormatPackedFloat),o.set(i),j().getNumber(`WEBGL_VERSION`)===2?Z(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,n,r,e.RGBA,s,o)):Z(e,()=>e.texImage2D(e.TEXTURE_2D,0,c,n,r,0,e.RGBA,s,o)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,null))}function WF(e,t,n){Z(e,()=>e.bindTexture(e.TEXTURE_2D,t)),n.data instanceof Uint8Array?j().getNumber(`WEBGL_VERSION`)===2?Z(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,e.RGBA,e.UNSIGNED_BYTE,n.data)):Z(e,()=>e.texImage2D(e.TEXTURE_2D,0,e.RGBA,n.width,n.height,0,e.RGBA,e.UNSIGNED_BYTE,n.data)):j().getNumber(`WEBGL_VERSION`)===2?Z(e,()=>e.texSubImage2D(e.TEXTURE_2D,0,0,0,e.RGBA,e.UNSIGNED_BYTE,n)):Z(e,()=>e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n)),Z(e,()=>e.bindTexture(e.TEXTURE_2D,null))}function GF(e,t,n,r){let i=e.createBuffer();Z(e,()=>e.bindBuffer(e.PIXEL_PACK_BUFFER,i));let a=16*t*n;return Z(e,()=>e.bufferData(e.PIXEL_PACK_BUFFER,a,e.STREAM_READ)),Z(e,()=>e.readPixels(0,0,n,t,e.RGBA,e.FLOAT,0)),Z(e,()=>e.bindBuffer(e.PIXEL_PACK_BUFFER,null)),i}function KF(e,t,n){let r=e,i=new Float32Array(n);return r.bindBuffer(r.PIXEL_PACK_BUFFER,t),r.getBufferSubData(r.PIXEL_PACK_BUFFER,0,i),r.bindBuffer(r.PIXEL_PACK_BUFFER,null),i}function qF(e,t,n,r){let[i,a]=hN(t,n),o=new Uint8Array(gN(t*n,4));return Z(e,()=>e.readPixels(0,0,i,a,r.downloadTextureFormat,e.UNSIGNED_BYTE,o)),new Float32Array(o.buffer)}function JF(e,t,n,r,i,a,o,s){let c=e,l=new Float32Array(yN(a,o));return c.bindBuffer(c.PIXEL_PACK_BUFFER,t),c.getBufferSubData(c.PIXEL_PACK_BUFFER,0,l),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),l}function YF(e,t,n){let r=new Float32Array(t*n*4);return Z(e,()=>e.readPixels(0,0,n,t,e.RGBA,e.FLOAT,r)),r}var XF=class{constructor(e){this.outputTexture=null,this.program=null,this.disposed=!1,this.itemsToPoll=[];let t=j().getNumber(`WEBGL_VERSION`);if(e==null?this.gl=lN(t):(this.gl=e,cN(t,e)),e=this.gl,j().getNumber(`WEBGL_VERSION`)===2){let t=e;this.createVertexArray=()=>Z(t,()=>t.createVertexArray()),this.bindVertexArray=e=>Z(t,()=>t.bindVertexArray(e)),this.deleteVertexArray=e=>Z(t,()=>t.deleteVertexArray(e)),this.getVertexArray=()=>Z(t,()=>t.getParameter(t.VERTEX_ARRAY_BINDING))}else if(e!=null){let t=e.getExtension(`OES_vertex_array_object`);if(t==null)throw Error(`All WebGL1 implementations are expected to offer OES_vertex_array_object.`);this.createVertexArray=()=>Z(e,()=>t.createVertexArrayOES()),this.bindVertexArray=n=>Z(e,()=>t.bindVertexArrayOES(n)),this.deleteVertexArray=n=>Z(e,()=>t.deleteVertexArrayOES(n)),this.getVertexArray=()=>Z(e,()=>e.getParameter(t.VERTEX_ARRAY_BINDING_OES))}let n=`WEBGL_color_buffer_float`,r=`EXT_color_buffer_half_float`;if(this.parallelCompilationExtension=this.gl.getExtension(`KHR_parallel_shader_compile`),j().getNumber(`WEBGL_VERSION`)===1){let e=`OES_texture_half_float`;if(this.textureFloatExtension=EN(this.gl,`OES_texture_float`),sP(this.gl,e))this.textureHalfFloatExtension=EN(this.gl,e);else if(j().get(`WEBGL_FORCE_F16_TEXTURES`))throw Error(`GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.`);if(this.colorBufferFloatExtension=this.gl.getExtension(n),sP(this.gl,r))this.colorBufferHalfFloatExtension=EN(this.gl,r);else if(j().get(`WEBGL_FORCE_F16_TEXTURES`))throw Error(`GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.`)}else if(n=`EXT_color_buffer_float`,sP(this.gl,n))this.colorBufferFloatExtension=this.gl.getExtension(n);else if(sP(this.gl,r))this.colorBufferHalfFloatExtension=this.gl.getExtension(r);else throw Error(`GL context does not support color renderable floats`);this.vertexBuffer=kF(this.gl),this.indexBuffer=AF(this.gl),this.framebuffer=RN(this.gl),this.textureConfig=bN(this.gl,this.textureHalfFloatExtension)}get debug(){return j().getBool(`DEBUG`)}dispose(){if(this.disposed)return;this.program!=null&&console.warn(`Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing.`),this.outputTexture!=null&&console.warn(`Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.`);let e=this.gl;Z(e,()=>e.finish()),Z(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,null)),Z(e,()=>e.deleteFramebuffer(this.framebuffer)),Z(e,()=>e.bindBuffer(e.ARRAY_BUFFER,null)),Z(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)),Z(e,()=>e.deleteBuffer(this.indexBuffer)),this.disposed=!0}createFloat32MatrixTexture(e,t){return this.throwIfDisposed(),NF(this.gl,e,t,this.textureConfig)}createFloat16MatrixTexture(e,t){return this.throwIfDisposed(),FF(this.gl,e,t,this.textureConfig)}createUnsignedBytesMatrixTexture(e,t){return this.throwIfDisposed(),LF(this.gl,e,t,this.textureConfig)}uploadPixelDataToTexture(e,t){this.throwIfDisposed(),WF(this.gl,e,t)}uploadDenseMatrixToTexture(e,t,n,r){this.throwIfDisposed(),UF(this.gl,e,t,n,r,this.textureConfig)}createFloat16PackedMatrixTexture(e,t){return this.throwIfDisposed(),VF(this.gl,e,t,this.textureConfig)}createPackedMatrixTexture(e,t){return this.throwIfDisposed(),zF(this.gl,e,t,this.textureConfig)}deleteMatrixTexture(e){this.throwIfDisposed(),this.outputTexture===e&&(GN(this.gl,this.framebuffer),this.outputTexture=null),Z(this.gl,()=>this.gl.deleteTexture(e))}downloadByteEncodedFloatMatrixFromOutputTexture(e,t,n){return this.downloadMatrixDriver(e,()=>qF(this.gl,t,n,this.textureConfig))}downloadPackedMatrixFromBuffer(e,t,n,r,i,a){return JF(this.gl,e,t,n,r,i,a,this.textureConfig)}downloadFloat32MatrixFromBuffer(e,t){return KF(this.gl,e,t)}createBufferFromTexture(e,t,n){this.bindTextureToFrameBuffer(e);let r=GF(this.gl,t,n,this.textureConfig);return this.unbindTextureToFrameBuffer(),r}createAndWaitForFence(){let e=this.createFence(this.gl);return this.pollFence(e)}createFence(e){let t,n;if(j().getBool(`WEBGL_FENCE_API_ENABLED`)){let r=e,i=r.fenceSync(r.SYNC_GPU_COMMANDS_COMPLETE,0);e.flush(),n=()=>{let e=r.clientWaitSync(i,0,0);return e===r.ALREADY_SIGNALED||e===r.CONDITION_SATISFIED},t=i}else j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)>0?(t=this.beginQuery(),this.endQuery(),n=()=>this.isQueryAvailable(t,j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))):n=()=>!0;return{query:t,isFencePassed:n}}downloadMatrixFromPackedTexture(e,t,n){return this.downloadMatrixDriver(e,()=>YF(this.gl,t,n))}createProgram(e){this.throwIfDisposed();let t=this.gl;this.vertexShader??=OF(t);let n=jN(t);Z(t,()=>t.attachShader(n,this.vertexShader)),Z(t,()=>t.attachShader(n,e)),MN(t,n);let r=Object.assign(n,{vao:this.createVertexArray()});return this.debug&&NN(t,r),r}buildVao(e){this.setProgram(e),this.bindVertexArray(e.vao);let t=this.gl;Z(t,()=>t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.indexBuffer)),HF(t,e,this.vertexBuffer)}deleteProgram(e){this.throwIfDisposed(),e===this.program&&(this.program=null),e!=null&&(Z(this.gl,()=>this.gl.deleteProgram(e)),this.deleteVertexArray(e.vao))}setProgram(e){this.throwIfDisposed(),this.program=e,this.program!=null&&this.debug&&NN(this.gl,this.program),Z(this.gl,()=>this.gl.useProgram(e))}getUniformLocation(e,t,n=!0){return this.throwIfDisposed(),n?VN(this.gl,e,t):HN(this.gl,e,t)}getAttributeLocation(e,t){return this.throwIfDisposed(),Z(this.gl,()=>this.gl.getAttribLocation(e,t))}getUniformLocationNoThrow(e,t){return this.throwIfDisposed(),this.gl.getUniformLocation(e,t)}setInputMatrixTexture(e,t,n){this.throwIfDisposed(),this.throwIfNoProgram(),UN(this.gl,e,t,n)}setOutputMatrixTexture(e,t,n){this.setOutputMatrixTextureDriver(e,n,t)}setOutputPackedMatrixTexture(e,t,n){this.throwIfDisposed();let[r,i]=vN(t,n);this.setOutputMatrixTextureDriver(e,r,i)}setOutputMatrixWriteRegion(e,t,n,r){this.setOutputMatrixWriteRegionDriver(n,e,r,t)}setOutputPackedMatrixWriteRegion(e,t,n,r){throw Error(`setOutputPackedMatrixWriteRegion not implemented.`)}debugValidate(){this.program!=null&&NN(this.gl,this.program),KN(this.gl)}executeProgram(){this.throwIfDisposed(),this.throwIfNoProgram();let e=this.gl;if(this.debug){let e=this.getVertexArray();console.assert(e===this.program.vao,`VAO changed between setProgram and executeProgram!`),this.debugValidate()}Z(e,()=>e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0))}blockUntilAllProgramsCompleted(){this.throwIfDisposed(),Z(this.gl,()=>this.gl.finish())}getQueryTimerExtension(){return this.disjointQueryTimerExtension??=EN(this.gl,j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2?`EXT_disjoint_timer_query_webgl2`:`EXT_disjoint_timer_query`),this.disjointQueryTimerExtension}getQueryTimerExtensionWebGL2(){return this.getQueryTimerExtension()}getQueryTimerExtensionWebGL1(){return this.getQueryTimerExtension()}beginQuery(){if(j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2){let e=this.gl,t=this.getQueryTimerExtensionWebGL2(),n=e.createQuery();return e.beginQuery(t.TIME_ELAPSED_EXT,n),n}let e=this.getQueryTimerExtensionWebGL1(),t=e.createQueryEXT();return e.beginQueryEXT(e.TIME_ELAPSED_EXT,t),t}endQuery(){if(j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`)===2){let e=this.gl,t=this.getQueryTimerExtensionWebGL2();e.endQuery(t.TIME_ELAPSED_EXT);return}let e=this.getQueryTimerExtensionWebGL1();e.endQueryEXT(e.TIME_ELAPSED_EXT)}async waitForQueryAndGetTime(e){return await w(()=>this.disposed||this.isQueryAvailable(e,j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))),this.getQueryTime(e,j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION`))}getQueryTime(e,t){if(t===0)return null;if(t===2){let t=this.gl;return t.getQueryParameter(e,t.QUERY_RESULT)/1e6}{let t=this.getQueryTimerExtensionWebGL1();return t.getQueryObjectEXT(e,t.QUERY_RESULT_EXT)/1e6}}isQueryAvailable(e,t){if(t===0)return!0;if(t===2){let t=this.gl,n=this.getQueryTimerExtensionWebGL2(),r=t.getQueryParameter(e,t.QUERY_RESULT_AVAILABLE);return this.disjoint??=this.gl.getParameter(n.GPU_DISJOINT_EXT),r&&!this.disjoint}{let t=this.getQueryTimerExtensionWebGL1(),n=t.getQueryObjectEXT(e,t.QUERY_RESULT_AVAILABLE_EXT);return this.disjoint??=this.gl.getParameter(t.GPU_DISJOINT_EXT),n&&!this.disjoint}}pollFence(e){return new Promise(t=>{this.addItemToPoll(()=>e.isFencePassed(),()=>t())})}pollItems(){let e=ZF(this.itemsToPoll.map(e=>e.isDoneFn));for(let t=0;t<=e;++t){let{resolveFn:e}=this.itemsToPoll[t];e()}this.itemsToPoll=this.itemsToPoll.slice(e+1)}addItemToPoll(e,t){if(this.itemsToPoll.push({isDoneFn:e,resolveFn:t}),this.itemsToPoll.length>1)return;let n;`setTimeoutCustom`in j().platform&&(n=j().platform.setTimeoutCustom.bind(j().platform)),w(()=>(this.pollItems(),this.itemsToPoll.length===0),()=>0,null,n)}bindTextureToFrameBuffer(e){this.throwIfDisposed(),WN(this.gl,e,this.framebuffer),this.debug&&KN(this.gl)}unbindTextureToFrameBuffer(){this.outputTexture==null?GN(this.gl,this.framebuffer):(WN(this.gl,this.outputTexture,this.framebuffer),this.debug&&KN(this.gl))}downloadMatrixDriver(e,t){this.bindTextureToFrameBuffer(e);let n=t();return this.unbindTextureToFrameBuffer(),n}setOutputMatrixTextureDriver(e,t,n){this.throwIfDisposed();let r=this.gl;WN(r,e,this.framebuffer),this.debug&&KN(r),this.outputTexture=e,Z(r,()=>r.viewport(0,0,t,n)),Z(r,()=>r.scissor(0,0,t,n))}setOutputMatrixWriteRegionDriver(e,t,n,r){this.throwIfDisposed(),Z(this.gl,()=>this.gl.scissor(e,t,n,r))}throwIfDisposed(){if(this.disposed)throw Error(`Attempted to use disposed GPGPUContext.`)}throwIfNoProgram(){if(this.program==null)throw Error(`No GPU program is currently set.`)}};function ZF(e){let t=0;for(;t<e.length&&e[t]();++t);return t-1}var{addImpl:QF,bincountImpl:$F,bincountReduceImpl:eI,bitwiseAndImpl:tI,castImpl:nI,ceilImpl:rI,concatImpl:iI,equalImpl:aI,expImpl:oI,expm1Impl:sI,floorImpl:cI,gatherNdImpl:lI,gatherV2Impl:uI,greaterImpl:dI,greaterEqualImpl:fI,lessImpl:pI,lessEqualImpl:mI,linSpaceImpl:hI,logImpl:gI,maxImpl:_I,maximumImpl:vI,minimumImpl:yI,multiplyImpl:bI,negImpl:xI,notEqualImpl:SI,prodImpl:CI,raggedGatherImpl:wI,raggedRangeImpl:TI,raggedTensorToTensorImpl:EI,rangeImpl:DI,rsqrtImpl:OI,scatterImpl:kI,sigmoidImpl:AI,simpleAbsImpl:jI,sliceImpl:MI,sparseFillEmptyRowsImpl:NI,sparseReshapeImpl:PI,sparseSegmentReductionImpl:FI,sqrtImpl:II,staticRegexReplaceImpl:LI,stridedSliceImpl:RI,stringNGramsImpl:zI,stringSplitImpl:BI,stringToHashBucketFastImpl:VI,subImpl:HI,tileImpl:UI,topKImpl:WI,transposeImpl:GI,uniqueImpl:KI}=ZD;function qI(e,t){return[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,t).map(t=>`${e}.${t}`)}function JI(e,t){return t===1?[e]:qI(e,t)}function YI(e,t){if(e===1)return`rc`;let n=``;for(let r=0;r<e;r++)n+=t[r],r<e-1&&(n+=`,`);return n}var XI=class{constructor(e){if(this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.enableShapeUniforms=bF(this.outputShape.length),this.rank===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{let e=JI(`rc`,this.rank),t=dF(this.rank),n=this.getOutOfBoundsCondition(e),r=this.getSetup(e),i=this.getOutput(e);this.userCode=`
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
            rEdge || cEdge ? 0. : getA(${t[3]})`}},ZI=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`inputShape`,type:`ivec3`}],this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length);let n=``;for(let e=0;e<4;e++){let t=`thisRC = rc;`;e%2==1&&(t+=`thisRC.z += 1;`),e>1&&(t+=`thisRC.y += 1;`),n+=`
        ${t}
        ${e>0?`if(thisRC.y < rows && thisRC.z < cols){`:``}
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${e}] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        ${e>0?`}`:``}
      `}this.userCode=`
      ${QI(t,this.enableShapeUniforms)}
      ${this.enableShapeUniforms?xP():bP(e)}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = ${this.enableShapeUniforms?`outShape[1]`:e[1]};
        int cols = ${this.enableShapeUniforms?`outShape[2]`:e[2]};

        ${n}

        setOutput(result);
      }
    `}};function QI(e,t){return`
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${t?yP([`r`,`c`,`d`],`inputShape`):gP([`r`,`c`,`d`],e)}
      return ivec3(r, c, d);
    }
  `}var $I=class{constructor(e){this.gpgpu=e,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0,this.freeTextures={},this.usedTextures={},this.logEnabled=!1}acquireTexture(e,t,n){let r=iL(t,n),i=aL(e,r,n);i in this.freeTextures||(this.freeTextures[i]=[]),i in this.usedTextures||(this.usedTextures[i]=[]);let a=tL(e,r,this.gpgpu.gl,this.gpgpu.textureConfig,n);if(this.freeTextures[i].length>0){this.numFreeTextures--,this.numUsedTextures++,this._numBytesFree-=a,this.log();let e=this.freeTextures[i].pop();return this.usedTextures[i].push(e),e}let o;return r===mN.PACKED_2X2_FLOAT32?o=this.gpgpu.createPackedMatrixTexture(e[0],e[1]):r===mN.PACKED_2X2_FLOAT16?o=this.gpgpu.createFloat16PackedMatrixTexture(e[0],e[1]):r===mN.UNPACKED_FLOAT32?o=this.gpgpu.createFloat32MatrixTexture(e[0],e[1]):r===mN.UNPACKED_FLOAT16?o=this.gpgpu.createFloat16MatrixTexture(e[0],e[1]):r===mN.PACKED_4X1_UNSIGNED_BYTE&&(o=this.gpgpu.createUnsignedBytesMatrixTexture(e[0],e[1])),this.usedTextures[i].push(o),this.numUsedTextures++,this._numBytesAllocated+=a,this.log(),o}releaseTexture(e,t,n,r){if(this.freeTextures==null)return;let i=iL(n,r),a=aL(t,i,r);a in this.freeTextures||(this.freeTextures[a]=[]);let o=tL(t,i,this.gpgpu.gl,this.gpgpu.textureConfig,r),s=j().getNumber(`WEBGL_DELETE_TEXTURE_THRESHOLD`);s!==-1&&this._numBytesAllocated>s?(this.gpgpu.deleteMatrixTexture(e.texture),this._numBytesAllocated-=o):(this.freeTextures[a].push(e),this.numFreeTextures++,this._numBytesFree+=o),this.numUsedTextures--;let c=this.usedTextures[a],l=c&&c.indexOf(e);if(l==null||l<0)throw Error(`Cannot release a texture that was never provided by this texture manager`);c[l]=c[c.length-1],c.pop(),this.log()}log(){if(!this.logEnabled)return;let e=this.numFreeTextures+this.numUsedTextures;console.log(`Free/Used`,`${this.numFreeTextures} / ${this.numUsedTextures}`,`(${e})`);let t=this._numBytesFree/this._numBytesAllocated;console.log(`Bytes allocated: ${this._numBytesAllocated}`),console.log(`Bytes unused: ${this._numBytesFree} (${Math.round(100*t)}%)`)}get numBytesAllocated(){return this._numBytesAllocated}get numBytesFree(){return this._numBytesFree}getNumUsedTextures(){return this.numUsedTextures}getNumFreeTextures(){return this.numFreeTextures}dispose(){if(this.freeTextures!=null){for(let e in this.freeTextures)this.freeTextures[e].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});for(let e in this.usedTextures)this.usedTextures[e].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0}}};function eL(e,t){let n=e;if(t===n.R32F)return 4;if(t===n.R16F)return 2;if(t===n.RGBA32F||t===e.RGBA)return 16;if(t===n.RGBA16F)return 8;if(t===n.RGBA8)return 4;throw Error(`Unknown internal format ${t}`)}function tL(e,t,n,r,i){let a=nL(t,r),o;if(i){let[t,n]=vN(e[0],e[1]);o=t*n}else{let[t,n]=hN(e[0],e[1]);o=t*n}let s=eL(n,a);return o*s}function nL(e,t){switch(e){case mN.PACKED_2X2_FLOAT32:return RF(t);case mN.PACKED_2X2_FLOAT16:return BF(t);case mN.UNPACKED_FLOAT32:return MF(t);case mN.UNPACKED_FLOAT16:return PF(t);case mN.PACKED_4X1_UNSIGNED_BYTE:return IF(t);default:throw Error(`Unknown physical texture type ${e}`)}}function rL(e){return j().getBool(`WEBGL_RENDER_FLOAT32_ENABLED`)?e?mN.PACKED_2X2_FLOAT32:mN.UNPACKED_FLOAT32:e?mN.PACKED_2X2_FLOAT16:mN.UNPACKED_FLOAT16}function iL(e,t){if(e===pN.UPLOAD)return mN.PACKED_2X2_FLOAT32;if(e===pN.RENDER||e==null)return rL(t);if(e===pN.DOWNLOAD||e===pN.PIXELS)return mN.PACKED_4X1_UNSIGNED_BYTE;throw Error(`Unknown logical texture type ${e}`)}function aL(e,t,n){return`${e[0]}_${e[1]}_${t}_${n}`}var oL=class{constructor(e,t){this.variableNames=[`A`],this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length),this.userCode=`
      float unaryOperation(float x) {
        ${t}
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `}},sL=`if (isnan(x)) return x;`,cL=`return x;`,lL=`return abs(x);`,uL=`return (x >= 0.0) ? x : (exp(x) - 1.0);`,dL=sL+`
  return (x < 0.0) ? 0.0 : x;
`,fL=sL+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,pL=`return x;`,mL=`return 1.0 / (1.0 + exp(-1.0 * x));`,hL=`return x;`,gL=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,_L=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,vL=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,yL=`return 1.0 / (1.0 + exp(-1.0 * x));`,bL=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length),this.userCode=`
      vec4 unaryOperation(vec4 x) {
        ${t}
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `}},xL=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length);let t=e.length,n=JI(`rc`,t),r=dF(t),i=YI(t,n),a=n.slice(-2),o=t<=1?`rc`:`vec2(${a.join(`,`)})`;this.userCode=`
      void main() {
        ${r} rc = getOutputCoords();
        vec4 packedInput = getA(${i});

        setOutput(getChannel(packedInput, ${o}));
      }
    `}},SL=If,CL=1e-7,wL=1e-4,TL={};function EL(e){return e in TL||(TL[e]={}),TL[e]}var DL=j().getNumber(`CPU_HANDOFF_SIZE_THRESHOLD`),OL=600;function kL(){return j().global.screen==null?1024:j().global.screen.height*j().global.screen.width*window.devicePixelRatio*OL/1024/1024}var AL=class e extends l{nextDataId(){return e.nextDataId++}constructor(e){if(super(),this.pendingRead=new WeakMap,this.pendingDisposal=new WeakSet,this.dataRefCount=new WeakMap,this.numBytesInGPU=0,this.uploadWaitMs=0,this.downloadWaitMs=0,this.lastGlFlushTime=0,this.warnedAboutMemory=!1,this.pendingDeletes=0,this.disposed=!1,!j().getBool(`HAS_WEBGL`))throw Error(`WebGL is not supported on this device`);let t;e==null?(t=new XF(lN(j().getNumber(`WEBGL_VERSION`))),this.binaryCache=EL(j().getNumber(`WEBGL_VERSION`)),this.gpgpuCreatedLocally=!0):(t=e instanceof XF?e:new XF(lN(j().getNumber(`WEBGL_VERSION`),e)),this.binaryCache={},this.gpgpuCreatedLocally=!1),this.gpgpu=t,this.canvas=this.gpgpu.gl.canvas,this.textureManager=new $I(this.gpgpu),this.numMBBeforeWarning=kL(),this.texData=new c(this,pa())}numDataIds(){return this.texData.numDataIds()-this.pendingDeletes}writeTexture(e,t,n,r,i,a){let o=this.makeTensorInfo(t,n),s=this.texData.get(o.dataId);s.isPacked=!1,s.texture={texture:e,texShape:[r,i]},s.texShape=[r,i];let c=new EF(QN(t),!1,a),l=this.runWebGLProgram(c,[o],n,[[r,i]]);return l.shape=t,s.texture=null,this.disposeIntermediateTensorInfo(o),l.dataId}write(e,t,n){if((j().getBool(`WEBGL_CHECK_NUMERICAL_PROBLEMS`)||j().getBool(`DEBUG`))&&this.checkNumericalProblems(e),n===`complex64`&&e!=null)throw Error(`Cannot write to a complex64 dtype. Please use tf.complex(real, imag).`);let r={id:this.nextDataId()};return this.texData.set(r,{shape:t,dtype:n,values:e,usage:pN.UPLOAD,refCount:1}),r}refCount(e){return this.texData.has(e)?this.texData.get(e).refCount:0}incRef(e){let t=this.texData.get(e);t.refCount++}decRef(e){if(this.texData.has(e)){let t=this.texData.get(e);t.refCount--}}move(e,t,n,r,i){if(j().getBool(`DEBUG`)&&this.checkNumericalProblems(t),r===`complex64`)throw Error(`Cannot write to a complex64 dtype. Please use tf.complex(real, imag).`);this.texData.set(e,{shape:n,dtype:r,values:t,usage:pN.UPLOAD,refCount:i})}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}readSync(e){let{values:t,dtype:n,complexTensorInfos:r,slice:i,shape:a,isPacked:o}=this.texData.get(e);if(i!=null){let t;t=o?new bL(a,pL):new oL(a,pL);let r=this.runWebGLProgram(t,[{dataId:e,shape:a,dtype:n}],n),i=this.readSync(r.dataId);return this.disposeIntermediateTensorInfo(r),i}if(t!=null)return this.convertAndCacheOnCPU(e);if(n===`string`)return t;let s=this.activeTimers!=null,c;s&&(c=ii());let l;return l=n===`complex64`?sh(this.readSync(r.real.dataId),this.readSync(r.imag.dataId)):this.getValuesFromTexture(e),s&&(this.downloadWaitMs+=ii()-c),this.convertAndCacheOnCPU(e,l)}async read(e){if(this.pendingRead.has(e)){let t=this.pendingRead.get(e);return new Promise(e=>t.push(e))}let{values:t,shape:n,slice:r,dtype:i,complexTensorInfos:a,isPacked:o}=this.texData.get(e);if(r!=null){let t;t=o?new bL(n,pL):new oL(n,pL);let r=this.runWebGLProgram(t,[{dataId:e,shape:n,dtype:i}],i),a=this.read(r.dataId);return this.disposeIntermediateTensorInfo(r),a}if(t!=null)return this.convertAndCacheOnCPU(e);if(j().getBool(`DEBUG`)&&!j().getBool(`WEBGL_DOWNLOAD_FLOAT_ENABLED`)&&j().getNumber(`WEBGL_VERSION`)===2)throw Error(`tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.`);let s=null,c;if(i!==`complex64`&&j().get(`WEBGL_BUFFER_SUPPORTED`)){c=this.decode(e);let t=this.texData.get(c.dataId);s=this.gpgpu.createBufferFromTexture(t.texture.texture,..._N(n))}this.pendingRead.set(e,[]),i!==`complex64`&&await this.gpgpu.createAndWaitForFence();let l;if(i===`complex64`){let e=await Promise.all([this.read(a.real.dataId),this.read(a.imag.dataId)]),t=e[0],n=e[1];l=sh(t,n)}else if(s==null)l=this.getValuesFromTexture(e);else{let e=y(n);l=this.gpgpu.downloadFloat32MatrixFromBuffer(s,e)}if(c!=null&&this.disposeIntermediateTensorInfo(c),s!=null){let e=this.gpgpu.gl;Z(e,()=>e.deleteBuffer(s))}let u=this.convertAndCacheOnCPU(e,l),d=this.pendingRead.get(e);return this.pendingRead.delete(e),d.forEach(e=>e(u)),this.pendingDisposal.has(e)&&(this.pendingDisposal.delete(e),this.disposeData(e)&&pa().removeDataId(e,this),this.pendingDeletes--),u}readToGPU(e,t={}){let{values:n,shape:r,slice:i,dtype:a,isPacked:o,texture:s}=this.texData.get(e);if(a===`complex64`)throw Error(`Does not support reading texture for complex64 dtype.`);if(i!=null){let n;n=o?new bL(r,pL):new oL(r,pL);let i=this.runWebGLProgram(n,[{dataId:e,shape:r,dtype:a}],a),s=this.readToGPU(i,t);return this.disposeIntermediateTensorInfo(i),s}if(s==null)throw Error(n==null?`There is no data on GPU or CPU.`:`Data is not on GPU but on CPU.`);let c=this.decode(e,t.customTexShape),l=pa().makeTensorFromTensorInfo(c),u=this.texData.get(c.dataId);return Object.assign({tensorRef:l},u.texture)}bufferSync(e){let t=this.readSync(e.dataId);if(e.dtype===`string`)try{let n=t.map(e=>oi(e));return so(e.shape,e.dtype,n)}catch{throw Error(`Failed to decode encoded string bytes into utf-8`)}return so(e.shape,e.dtype,t)}checkNumericalProblems(e){if(e!=null)for(let t=0;t<e.length;t++){let n=e[t];if(!wN(n))throw j().getBool(`WEBGL_RENDER_FLOAT32_CAPABLE`)?Error(`The value ${n} cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'`):Error(`The value ${n} cannot be represented on this device.`)}}getValuesFromTexture(e){let{shape:t,dtype:n,isPacked:r}=this.texData.get(e),i=y(t);if(j().getBool(`WEBGL_DOWNLOAD_FLOAT_ENABLED`)){let n=this.decode(e),r=this.texData.get(n.dataId),a=this.gpgpu.downloadMatrixFromPackedTexture(r.texture.texture,..._N(t)).subarray(0,i);return this.disposeIntermediateTensorInfo(n),a}let a=j().getBool(`WEBGL_PACK`)&&r===!0,o=a?QN(t):t,s=a?new wF(o):new CF(o),c=this.runWebGLProgram(s,[{shape:o,dtype:n,dataId:e}],`float32`),l=this.texData.get(c.dataId),u=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(l.texture.texture,l.texShape[0],l.texShape[1]).subarray(0,i);return this.disposeIntermediateTensorInfo(c),u}timerAvailable(){return j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0}time(e){let t=this.activeTimers,n=[],r=!1;this.programTimersStack==null?(this.programTimersStack=n,r=!0):this.activeTimers.push(n),this.activeTimers=n,e();let i=ci(this.activeTimers.map(e=>e.query)).filter(e=>e!=null),a=ci(this.activeTimers.map(e=>e.name)).filter(e=>e!=null);this.activeTimers=t,r&&(this.programTimersStack=null);let o={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null};return(async()=>{if(j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0){let e=await Promise.all(i);o.kernelMs=h(e),o.getExtraProfileInfo=()=>e.map((e,t)=>({name:a[t],ms:e})).map(e=>`${e.name}: ${e.ms}`).join(`, `)}else o.kernelMs={error:`WebGL query timers are not supported in this environment.`};return this.uploadWaitMs=0,this.downloadWaitMs=0,o})()}memory(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU,numBytesInGPUAllocated:this.textureManager.numBytesAllocated,numBytesInGPUFree:this.textureManager.numBytesFree}}startTimer(){return j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0?this.gpgpu.beginQuery():{startMs:ii(),endMs:null}}endTimer(e){return j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0?(this.gpgpu.endQuery(),e):(e.endMs=ii(),e)}async getQueryTime(e){if(j().getNumber(`WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE`)>0)return this.gpgpu.waitForQueryAndGetTime(e);let t=e;return t.endMs-t.startMs}disposeData(e,t=!1){if(this.pendingDisposal.has(e))return!1;if(!this.texData.has(e))return!0;if(t?this.texData.get(e).refCount=0:this.texData.get(e).refCount--,!t&&this.texData.get(e).refCount>0)return!1;if(this.pendingRead.has(e))return this.pendingDisposal.add(e),this.pendingDeletes++,!1;this.releaseGPUData(e);let{complexTensorInfos:n}=this.texData.get(e);return n!=null&&(this.disposeData(n.real.dataId,t),this.disposeData(n.imag.dataId,t)),this.texData.delete(e),!0}releaseGPUData(e){let{texture:t,dtype:n,texShape:r,usage:i,isPacked:a,slice:o}=this.texData.get(e),s=o&&o.origDataId||e,c=this.dataRefCount.get(s);c>1?this.dataRefCount.set(s,c-1):(this.dataRefCount.delete(s),t!=null&&(this.numBytesInGPU-=this.computeBytes(r,n),this.textureManager.releaseTexture(t,r,i,a)));let l=this.texData.get(e);l.texture=null,l.texShape=null,l.isPacked=!1,l.slice=null}getTexture(e){return this.uploadToGPU(e),this.texData.get(e).texture.texture}getDataInfo(e){return this.texData.get(e)}shouldExecuteOnCPU(e,t=DL){return j().getBool(`WEBGL_CPU_FORWARD`)&&e.every(e=>this.texData.get(e.dataId).texture==null&&y(e.shape)<t)}getGPGPUContext(){return this.gpgpu}where(e){Er(`tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead`);let t=e.dataSync();return SL(e.shape,t)}packedUnaryOp(e,t,n){let r=new bL(e.shape,t),i=this.compileAndRun(r,[e],n);return pa().makeTensorFromTensorInfo(i)}abs(e){if(this.shouldExecuteOnCPU([e])&&e.dtype!==`complex64`){let t=jI(this.texData.get(e.dataId).values);return this.makeOutput(e.shape,e.dtype,t)}if(j().getBool(`WEBGL_PACK_UNARY_OPERATIONS`))return this.packedUnaryOp(e,lL,e.dtype);let t=new oL(e.shape,lL),n=this.compileAndRun(t,[e]);return pa().makeTensorFromTensorInfo(n)}makeTensorInfo(e,t,n){let r;if(t===`string`&&n!=null&&n.length>0&&ae(n[0])){let i=n.map(e=>ai(e));r=this.write(i,e,t)}else r=this.write(n,e,t);return this.texData.get(r).usage=null,{dataId:r,shape:e,dtype:t}}makeOutput(e,t,n){return pa().makeTensorFromTensorInfo(this.makeTensorInfo(e,t,n),this)}unpackTensor(e){let t=new xL(e.shape);return this.runWebGLProgram(t,[e],e.dtype)}packTensor(e){let t=new XI(e.shape);return this.runWebGLProgram(t,[e],e.dtype,null,!0)}packedReshape(e,t){let n=[XN(e.shape),...ZN(e.shape)],r={dtype:e.dtype,shape:n,dataId:e.dataId},i=new ZI([XN(t),...ZN(t)],n),a=[n],o=this.runWebGLProgram(i,[r],e.dtype,a,!0);return{dataId:o.dataId,shape:t,dtype:o.dtype}}decode(e,t){let{isPacked:n,shape:r,dtype:i}=this.texData.get(e);t!=null&&g(y(r)<=t[0]*t[1]*4,()=>`customTexShape is too small. Row * Column * 4 should be equal or larger than the size of the tensor data.`);let a=QN(r),o;o=n?new SF(a):new xF(a);let s=[t??_N(a)];return{dtype:i,shape:r,dataId:this.runWebGLProgram(o,[{shape:a,dtype:i,dataId:e}],i,s,!0,t).dataId}}runWebGLProgram(e,t,n,r,i=!1,a){let o=this.makeTensorInfo(e.outputShape,n),s=this.texData.get(o.dataId);if(e.packedOutput&&(s.isPacked=!0),e.outPackingScheme===fN.DENSE&&(s.texShape=(a??_N(e.outputShape)).map(e=>e*2)),e.outTexUsage!=null&&(s.usage=e.outTexUsage),y(o.shape)===0)return s.values=O(o.dtype,0),o;let c=[],l=t.map(t=>{if(t.dtype===`complex64`)throw Error(`GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.`);let n=this.texData.get(t.dataId);if(n.texture==null){if(!e.packedInputs&&y(t.shape)<=j().getNumber(`WEBGL_SIZE_UPLOAD_UNIFORM`))return{shape:t.shape,texData:null,isUniform:!0,uniformValues:n.values};e.packedInputs&&(n.isPacked=!0,n.shape=t.shape)}if(this.uploadToGPU(t.dataId),!!n.isPacked!=!!e.packedInputs)t=n.isPacked?this.unpackTensor(t):this.packTensor(t),c.push(t),n=this.texData.get(t.dataId);else if(n.isPacked&&!tP(n.shape,t.shape)){let e=t,r=t.shape;t.shape=n.shape,t=this.packedReshape(t,r),c.push(t),n=this.texData.get(t.dataId),e.shape=r}return{shape:t.shape,texData:n,isUniform:!1}});this.uploadToGPU(o.dataId);let u={shape:o.shape,texData:s,isUniform:!1},d=yF(e,l,u),f=this.getAndSaveBinary(d,()=>hF(this.gpgpu,e,l,u)),p=this.activeTimers!=null,m;p&&(m=this.startTimer()),j().get(`ENGINE_COMPILE_ONLY`)||vF(this.gpgpu,f,l,u,r),c.forEach(e=>this.disposeIntermediateTensorInfo(e)),p&&(m=this.endTimer(m),this.activeTimers.push({name:e.constructor.name,query:this.getQueryTime(m)}));let h=j().getNumber(`WEBGL_FLUSH_THRESHOLD`);if(h>0){let e=ii();e-this.lastGlFlushTime>h&&(this.gpgpu.gl.flush(),this.lastGlFlushTime=e)}if(!j().getBool(`WEBGL_LAZILY_UNPACK`)&&s.isPacked&&i===!1){let e=this.unpackTensor(o);return this.disposeIntermediateTensorInfo(o),e}return o}compileAndRun(e,t,n,r,i=!1){return n||=t[0].dtype,this.runWebGLProgram(e,t,n,r,i)}getAndSaveBinary(e,t){return e in this.binaryCache||(this.binaryCache[e]=t()),this.binaryCache[e]}getTextureManager(){return this.textureManager}dispose(){this.disposed||=(j().getBool(`IS_TEST`)||Object.keys(this.binaryCache).forEach(e=>{this.gpgpu.deleteProgram(this.binaryCache[e].webGLProgram),delete this.binaryCache[e]}),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement<`u`&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),!0)}floatPrecision(){return this.floatPrecisionValue??=I(()=>{if(!j().get(`WEBGL_RENDER_FLOAT32_ENABLED`)){let e=j().getBool(`DEBUG`);j().set(`DEBUG`,!1);let t=this.abs(il(1e-8)).dataSync()[0];if(j().set(`DEBUG`,e),t>0)return 32}return 16}),this.floatPrecisionValue}epsilon(){return this.floatPrecision()===32?CL:wL}uploadToGPU(e){let t=this.texData.get(e),{shape:n,dtype:r,values:i,texture:a,usage:o,isPacked:s}=t;if(a!=null)return;let c=this.activeTimers!=null,l;c&&(l=ii());let u=t.texShape;if(u??(u=$N(n,s),t.texShape=u),i!=null){let e=QN(n),a,o=u[1],d=u[0],f=i instanceof Uint8Array||i instanceof Uint8ClampedArray;(s||!f)&&([o,d]=vN(u[0],u[1])),a=s?new DF(e,f):new EF(e,f);let p=f?[d,o]:u,m=this.makeTensorInfo(p,r),h=this.texData.get(m.dataId);h.usage=f?pN.PIXELS:pN.UPLOAD,h.texShape=p,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(m.dataId),o,d,i);let g=[[d,o]],_=this.runWebGLProgram(a,[m],r,g,!0),v=this.texData.get(_.dataId);t.texShape=v.texShape,t.isPacked=v.isPacked,t.usage=v.usage,j().get(`ENGINE_COMPILE_ONLY`)?this.disposeData(_.dataId):(t.texture=v.texture,t.values=null,this.texData.delete(_.dataId)),this.disposeIntermediateTensorInfo(m),c&&(this.uploadWaitMs+=ii()-l)}else t.texture=this.acquireTexture(u,o,r,s)}convertAndCacheOnCPU(e,t){let n=this.texData.get(e),{dtype:r}=n;return t!=null&&(n.values=jL(t,r)),n.values}acquireTexture(e,t,n,r){if(this.numBytesInGPU+=this.computeBytes(e,n),!this.warnedAboutMemory&&this.numBytesInGPU>this.numMBBeforeWarning*1024*1024){let e=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn(`High memory usage in GPU: ${e} MB, most likely due to a memory leak`)}return this.textureManager.acquireTexture(e,t,r)}computeBytes(e,t){return e[0]*e[1]*re(t)}checkCompileCompletion(){for(let[,e]of Object.entries(this.binaryCache))this.checkCompletion_(e)}async checkCompileCompletionAsync(){let e=[];if(this.gpgpu.parallelCompilationExtension){for(let[,t]of Object.entries(this.binaryCache))e.push(this.checkCompletionAsync_(t));return Promise.all(e)}for(let[,t]of Object.entries(this.binaryCache)){let n=new Promise(e=>{try{this.checkCompletion_(t),e(!0)}catch(e){throw e}});e.push(n)}return Promise.all(e)}async checkCompletionAsync_(e){return this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.parallelCompilationExtension.COMPLETION_STATUS_KHR)?this.checkCompletion_(e):(await Rm(),this.checkCompletionAsync_(e))}checkCompletion_(e){if(this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.gl.LINK_STATUS)===!1)throw console.log(this.gpgpu.gl.getProgramInfoLog(e.webGLProgram)),this.gpgpu.gl.getShaderParameter(e.fragmentShader,this.gpgpu.gl.COMPILE_STATUS)===!1?(AN(e.source,this.gpgpu.gl.getShaderInfoLog(e.fragmentShader)),Error(`Failed to compile fragment shader.`)):Error(`Failed to link vertex and fragment shaders.`);return!0}getUniformLocations(){for(let e of Object.values(this.binaryCache)){this.gpgpu.buildVao(e.webGLProgram);let{variablesLocations:t,customUniformLocations:n,infLoc:r,nanLoc:i,outShapeLocation:a,outShapeStridesLocation:o,outTexShapeLocation:s}=gF(this.gpgpu,e.program,e.webGLProgram);e.variablesLocations=t,e.customUniformLocations=n,e.infLoc=r,e.nanLoc=i,e.outShapeLocation=a,e.outShapeStridesLocation=o,e.outTexShapeLocation=s}}createTensorFromGPUData(e,t,n){e.channels=e.channels||`RGBA`;let{texture:r,height:i,width:a,channels:o}=e,s=pa().backend;if(!s.gpgpu.gl.isTexture(r))throw Error(`The texture is invalid. Also, please make sure the texture and the TFJS WebGL backend are using the same canvas. If you want to use your own custom canvas, you have to create and use the custom TFJS WebGL backend created from the canvas through 'new tf.MathBackendWebGL(customCanvas)'.`);let c=s.writeTexture(r,t,n,i,a,o);return pa().makeTensorFromDataId(c,t,n,s)}};AL.nextDataId=0;function jL(e,t){if(t===`float32`||t===`complex64`)return e;if(t===`int32`||t===`bool`){let n=t===`int32`?new Int32Array(e.length):new Uint8Array(e.length);for(let t=0;t<n.length;++t)n[t]=Math.round(e[t]);return n}throw Error(`Unknown dtype ${t}`)}ea()&&ga(`webgl`,()=>new AL,2);var ML=`
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`,NL=class{constructor(e,t,n){this.variableNames=[`A`,`B`],this.outputShape=U(t,n),this.enableShapeUniforms=bF(this.outputShape.length),this.userCode=`
      float binaryOperation(float a, float b) {
        ${e}
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `}},PL=`
  result.r = isNaN.r ? NAN : result.r;
  result.g = isNaN.g ? NAN : result.g;
  result.b = isNaN.b ? NAN : result.b;
  result.a = isNaN.a ? NAN : result.a;
`,FL=class{constructor(e,t,n,r=!1){this.variableNames=[`A`,`B`],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=U(t,n);let i=this.outputShape.length;this.enableShapeUniforms=bF(i);let a=``;if(r)if(i===0||y(this.outputShape)===1)a=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(a=`
          ${dF(i)} coords = getOutputCoords();
        `,i===1)this.enableShapeUniforms?a+=`
            result.y = (coords + 1) >= outShape ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `:a+=`
            result.y = (coords + 1) >= ${this.outputShape[0]} ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{let e=JI(`coords`,i);this.enableShapeUniforms?a+=`
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
    `}};function IL(e){let{inputs:t,backend:n}=e,{x:r}=t;return n.incRef(r.dataId),{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}var LL={kernelName:zt,backendName:`webgl`,kernelFunc:IL};function RL(e){let{inputs:t,backend:n}=e,{real:r,imag:i}=t,a=n.makeTensorInfo(r.shape,`complex64`),o=n.texData.get(a.dataId);return o.complexTensorInfos={real:IL({inputs:{x:r},backend:n}),imag:IL({inputs:{x:i},backend:n})},a}var zL={kernelName:tt,backendName:`webgl`,kernelFunc:RL},BL=`return (a < 0.) ? b * a : a;`,VL=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function HL(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{alpha:a}=r,o=n.makeTensorInfo([],`float32`,ti(a,`float32`)),s=j().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new FL(VL,i.shape,o.shape):new NL(BL,i.shape,o.shape),c=n.runWebGLProgram(s,[i,o],`float32`);return n.disposeIntermediateTensorInfo(o),c}var UL={kernelName:Gt,backendName:`webgl`,kernelFunc:HL},WL=`return (a < 0.) ? b * a : a;`,GL=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function KL(e){let{inputs:t,backend:n}=e,{x:r,alpha:i}=t,a=j().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new FL(GL,r.shape,i.shape):new NL(WL,r.shape,i.shape);return n.runWebGLProgram(a,[r,i],`float32`)}var qL={kernelName:xn,backendName:`webgl`,kernelFunc:KL},JL=`if (isnan(x)) return x;`;function YL({opSnippet:e,packedOpSnippet:t,cpuKernelImpl:n,dtype:r}){return({inputs:i,backend:a})=>{let{x:o}=i,s=a,c=r||o.dtype;if(s.shouldExecuteOnCPU([o])&&n!=null){let e=n(s.texData.get(o.dataId).values,c);return s.makeTensorInfo(o.shape,c,e)}let l=j().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)&&t!=null,u;return u=l?new bL(o.shape,t):new oL(o.shape,e),s.runWebGLProgram(u,[o],c)}}function XL({opSnippet:e,packedOpSnippet:t,checkOutOfBounds:n=!1,supportsComplex:r=!1,cpuKernelImpl:i,dtype:a}){return({inputs:o,backend:s})=>{let{a:c,b:l}=o,u=s;if(r&&c.dtype===`complex64`){let t=u.texData.get(c.dataId),n=u.texData.get(l.dataId),[r,i]=[[t.complexTensorInfos.real,n.complexTensorInfos.real],[t.complexTensorInfos.imag,n.complexTensorInfos.imag]].map(t=>{let[n,r]=t,i={dataId:n.dataId,dtype:n.dtype,shape:c.shape},a={dataId:r.dataId,dtype:r.dtype,shape:l.shape},o=new NL(e,c.shape,l.shape);return u.runWebGLProgram(o,[i,a],Ii(n.dtype,r.dtype))}),a=RL({inputs:{real:r,imag:i},backend:u});return u.disposeIntermediateTensorInfo(r),u.disposeIntermediateTensorInfo(i),a}let d=a||Ii(c.dtype,l.dtype);if((c.dtype===`string`||l.dtype===`string`||u.shouldExecuteOnCPU([c,l]))&&i!=null){let e=u.texData.get(c.dataId).values,t=u.texData.get(l.dataId).values,n=c.dtype===`string`?Uh(e):e,r=c.dtype===`string`?Uh(t):t,[a,o]=i(c.shape,l.shape,n,r,d),s=u.makeTensorInfo(o,d),f=u.texData.get(s.dataId);return f.values=a,s}let f=j().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)&&t!=null,p;return p=f?new FL(t,c.shape,l.shape,n):new NL(e,c.shape,l.shape),u.runWebGLProgram(p,[c,l],d)}}function ZL(e,t=!1){if(e===`linear`)return t?hL:cL;if(e===`relu`)return t?_L:dL;if(e===`elu`)return t?gL:uL;if(e===`relu6`)return t?vL:fL;if(e===`prelu`)return t?GL:WL;if(e===`leakyrelu`)return t?VL:BL;if(e===`sigmoid`)return t?yL:mL;throw Error(`Activation ${e} has not been implemented for the WebGL backend.`)}var QL=class{constructor(e,t,n,r=!1,i=!1,a=!1,o=null,s=!1,c=!1){this.variableNames=[`matrixA`,`matrixB`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=n,this.enableShapeUniforms=bF(this.outputShape.length);let l=r?e[1]:e[2],u=Math.ceil(l/2),d=r?`i * 2, rc.y`:`rc.y, i * 2`,f=i?`rc.z, i * 2`:`i * 2, rc.z`,p=r?[`a.xxyy`,`a.zzww`]:[`a.xxzz`,`a.yyww`],m=i?[`b.xzxz`,`b.ywyw`]:[`b.xyxy`,`b.zwzw`],h=``,g=``;o&&(h=s?`vec4 activation(vec4 a) {
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
    `}},$L={REAL:`return areal * breal - aimag * bimag;`,IMAG:`return areal * bimag + aimag * breal;`},eR=class{constructor(e,t,n){this.variableNames=[`AReal`,`AImag`,`BReal`,`BImag`],this.outputShape=U(t,n),this.userCode=`
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
    `}},tR=`return a * b;`;function nR(e){let{inputs:t,backend:n}=e,{a:r,b:i}=t,a=Ii(r.dtype,i.dtype);if(r.dtype===`complex64`){let e=n.texData.get(r.dataId),t=n.texData.get(i.dataId),a=new eR($L.REAL,r.shape,i.shape),o=new eR($L.IMAG,r.shape,i.shape),s=[{dataId:e.complexTensorInfos.real.dataId,dtype:e.complexTensorInfos.real.dtype,shape:r.shape},{dataId:e.complexTensorInfos.imag.dataId,dtype:e.complexTensorInfos.imag.dtype,shape:r.shape},{dataId:t.complexTensorInfos.real.dataId,dtype:t.complexTensorInfos.real.dtype,shape:i.shape},{dataId:t.complexTensorInfos.imag.dataId,dtype:t.complexTensorInfos.imag.dtype,shape:i.shape}],c=n.runWebGLProgram(a,s,`float32`),l=n.runWebGLProgram(o,s,`float32`),u=RL({inputs:{real:c,imag:l},backend:n});return n.disposeIntermediateTensorInfo(c),n.disposeIntermediateTensorInfo(l),u}if(n.shouldExecuteOnCPU([r,i])){let e=n.texData.get(r.dataId),t=n.texData.get(i.dataId),[o,s]=bI(r.shape,i.shape,e.values,t.values,a),c=n.makeTensorInfo(s,a),l=n.texData.get(c.dataId);return l.values=o,c}let o;return o=j().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new FL(tR,r.shape,i.shape):new NL(tR,r.shape,i.shape),n.runWebGLProgram(o,[r,i],a)}var rR={kernelName:fn,backendName:`webgl`,kernelFunc:nR};function iR(e,t,n){let r=[XN(e.shape),...ZN(e.shape)],i={dtype:e.dtype,shape:r,dataId:e.dataId},a=new ZI([XN(t),...ZN(t)],r),o=[r],s=n.runWebGLProgram(a,[i],e.dtype,o,!0);return{dataId:s.dataId,shape:t,dtype:s.dtype}}function $(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{shape:a}=r,o=n,s=y(i.shape),c=T(a,s),l=y(c);g(s===l,()=>`The new shape (${c}) has ${l} elements and the old shape (${i.shape}) has ${s} elements. The new shape and old shape must have the same number of elements.`);let u=o.texData.get(i.dataId);return u.isPacked&&!tP(i.shape,c)&&!(u.texture!==null&&tP(u.shape,c))?iR(i,c,o):(o.incRef(i.dataId),{dataId:i.dataId,shape:c,dtype:i.dtype})}var aR={kernelName:An,backendName:`webgl`,kernelFunc:$},oR=class{constructor(e,t){this.variableNames=[`x`];let{windowSize:n,batchSize:r,inSize:i,outSize:a}=e;this.outputShape=[r,a];let o=Math.floor(n/4)*4,s=n%4,c=`sumValue += dot(values, ones);`;if(t!=null){let e=1/t;c=`sumValue += dot(values * ${x(e)?e.toPrecision(2):e}, ones);`}let l=``;i%n>0&&(l=`
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
    `}},sR=class{constructor(e,t){this.variableNames=[`x`];let{windowSize:n,batchSize:r,inSize:i,outSize:a}=e;this.outputShape=[r,a];let o=`0.0`,s=``;t===`prod`?o=`1.0`:t===`min`?(o=`1.0 / 1e-20`,s=`min`):t===`max`&&(o=`-1.0 / 1e-20`,s=`max`);let c=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t===`sum`?c=`sumValue`:t===`prod`?c=`prodValue`:t===`all`?c=`allValue`:t===`any`&&(c=`anyValue`);let l=Math.floor(n/4)*4,u=n%4,d=`
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
    `}};function cR(e){let t=[];for(;t.length===0||t[t.length-1].outSize!==1;){let n=t.length?t[t.length-1].outSize:e[1],r=Km(n);t.push({inSize:n,windowSize:r,outSize:Math.ceil(n/r)})}return t}function lR(e,t,n,r){let i=cR(e.shape),a=e;for(let o=0;o<i.length;o++){let{inSize:s,windowSize:c,outSize:l}=i[o],u,d;u=n===`mean`?o===0?new oR({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l},s):new oR({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l}):new sR({windowSize:c,inSize:s,batchSize:e.shape[0],outSize:l},n),d=a,a=r.runWebGLProgram(u,[a],t),d.dataId!==e.dataId&&r.disposeIntermediateTensorInfo(d)}return a}var uR=class{constructor(e,t){this.variableNames=[`A`];let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[t[r]];this.outputShape=n,this.rank=n.length;let r=dF(this.rank),i=dR(t);this.userCode=`
    void main() {
      ${r} resRC = getOutputCoords();
      setOutput(getA(${i}));
    }
    `}};function dR(e){let t=e.length;if(t>6)throw Error(`Transpose for rank ${t} is not yet supported`);let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`,`resRC.u`,`resRC.v`],r=Array(t);for(let t=0;t<e.length;t++)r[e[t]]=n[t];return r.join()}var fR=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0;let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[t[r]];if(this.outputShape=n,this.rank=n.length,this.rank>6)throw Error(`Packed transpose for rank ${this.rank} is not yet supported.`);let r=dF(this.rank),i=qI(`rc`,this.rank),a=Array(this.rank);for(let e=0;e<t.length;e++)a[t[e]]=i[e];let o=`vec2(${a.slice(-2).join()})`,s=`++${i[this.rank-1]} < ${n[this.rank-1]}`,c=`getChannel(getA(${a.join()}), ${o})`;this.userCode=`
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
    `}};function pR(e,t,n){let r=j().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new fR(e.shape,t):new uR(e.shape,t);return n.runWebGLProgram(r,[e],e.dtype)}function mR(e,t,n,r){let i=t,a=e.shape.length,o=E(i,e.shape),s=o,c=Yc(s,a),l=c!=null,u=e;l&&(u=pR(e,c,r),s=Zc(s.length,a)),Jc(`sum`,s,a);let[d,f]=Kc(u.shape,s),p=d;n&&(p=qc(d,o));let m=y(f),h=y(e.shape)/m,g=$({inputs:{x:u},attrs:{shape:[h,m]},backend:r}),_=lR(g,Li(e.dtype),`sum`,r),v=$({inputs:{x:_},attrs:{shape:p},backend:r});return r.disposeIntermediateTensorInfo(g),r.disposeIntermediateTensorInfo(_),l&&r.disposeIntermediateTensorInfo(u),v}function hR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r;return mR(i,a,o,n)}var gR={kernelName:`Sum`,backendName:`webgl`,kernelFunc:hR};function _R(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{perm:a}=r,o=n,s=i.shape.length,c=Array(s);for(let e=0;e<c.length;e++)c[e]=i.shape[a[e]];let l;if(o.shouldExecuteOnCPU([i])){let e=o.texData.get(i.dataId).values,t=GI(e,i.shape,i.dtype,a,c);l=o.makeTensorInfo(c,i.dtype);let n=o.texData.get(l.dataId);n.values=t}else l=pR(i,a,o);return l}var vR={kernelName:hr,backendName:`webgl`,kernelFunc:_R};function yR({a:e,b:t,transposeA:n,transposeB:r,backend:i,bias:a=null,preluActivationWeights:o=null,leakyreluAlpha:s=0,activation:c=null}){let l=e.shape.length,u=t.shape.length,d=n?e.shape[l-2]:e.shape[l-1],f=r?t.shape[u-1]:t.shape[u-2],p=n?e.shape[l-1]:e.shape[l-2],m=r?t.shape[u-2]:t.shape[u-1],h=e.shape.slice(0,-2),_=t.shape.slice(0,-2),v=y(h),b=y(_),x=U(e.shape.slice(0,-2),t.shape.slice(0,-2)).concat([p,m]);g(d===f,()=>`Error in matMul: inner shapes (${d}) and (${f}) of Tensors with shapes ${e.shape} and ${t.shape} and transposeA=${n} and transposeB=${r} must match.`);let S=n?[v,d,p]:[v,p,d],C=r?[b,m,f]:[b,f,m],w=$({inputs:{x:e},backend:i,attrs:{shape:S}}),T=$({inputs:{x:t},backend:i,attrs:{shape:C}}),E=[w,T],D=Math.max(v,b),O=n?w.shape[1]:w.shape[2],k=a!=null,ee=o!=null,te=c===`leakyrelu`,ne=c==null?null:ZL(c,!0),re=k||ee||te||ne!=null,ie;if((p===1||m===1)&&O>1e3&&re===!1){let e=w,t=T;n&&(e=_R({inputs:{x:w},backend:i,attrs:{perm:[0,2,1]}}),E.push(e)),r&&(t=_R({inputs:{x:T},backend:i,attrs:{perm:[0,2,1]}}),E.push(t));let a=m!==1,o=m===1,s=e;a&&(s=$({inputs:{x:e},backend:i,attrs:{shape:[D,O,1]}}),E.push(s));let c=m===1?2:1,l=t;o&&(l=$({inputs:{x:t},backend:i,attrs:{shape:[D,1,O]}}),E.push(l));let u=nR({inputs:{a:s,b:l},backend:i});ie=hR({inputs:{x:u},backend:i,attrs:{axis:c,keepDims:!0}}),E.push(u)}else{let c=Ii(e.dtype,t.dtype),l=new QL(S,C,[D,p,m],n,r,k,ne,ee,te),u=[w,T];if(a!=null&&u.push(a),ee&&u.push(o),te){let e=i.makeTensorInfo([],`float32`,ti(s,`float32`));u.push(e),E.push(e)}ie=i.runWebGLProgram(l,u,c)}let ae=$({inputs:{x:ie},backend:i,attrs:{shape:x}});E.push(ie);for(let e of E)i.disposeIntermediateTensorInfo(e);return ae}function bR(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a,bias:o,preluActivationWeights:s}=t,{transposeA:c,transposeB:l,activation:u,leakyreluAlpha:d}=r;return yR({a:i,b:a,transposeA:c,transposeB:l,backend:n,bias:o,preluActivationWeights:s,leakyreluAlpha:d,activation:u})}var xR={kernelName:Cr,backendName:`webgl`,kernelFunc:bR},SR=`return abs(x);`;function CR(e){let{inputs:t,backend:n}=e,{x:r}=t;if(n.shouldExecuteOnCPU([r])&&r.dtype!==`complex64`){let e=jI(n.texData.get(r.dataId).values);return n.makeTensorInfo(r.shape,r.dtype,e)}let i;return i=j().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)?new bL(r.shape,SR):new oL(r.shape,SR),n.runWebGLProgram(i,[r],r.dtype)}var wR={kernelName:`Abs`,backendName:`webgl`,kernelFunc:CR},TR={kernelName:Me,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`})},ER={kernelName:Ne,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  if (x < 1.0) return NAN;
return log(x + sqrt(x * x - 1.0));`})},DR=`return a + b;`,OR={kernelName:`Add`,backendName:`webgl`,kernelFunc:XL({opSnippet:DR,packedOpSnippet:DR,supportsComplex:!0,cpuKernelImpl:QF})},kR=class{constructor(e,t){this.outputShape=[],this.outputShape=e,this.variableNames=t.map((e,t)=>`T${t}`);let n=[];this.variableNames.forEach(e=>{n.push(`float v${e} = get${e}AtOutCoords();`)});let r=this.variableNames.map(e=>`v${e}`).join(` + `);this.userCode=`
      void main() {
        ${n.join(`
        `)}

        float result = ${r};
        setOutput(result);
      }
    `}},AR=class{constructor(e,t){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.variableNames=t.map((e,t)=>`T${t}`);let n=[];this.variableNames.forEach(e=>{n.push(`vec4 v${e} = get${e}AtOutCoords();`)});let r=this.variableNames.map(e=>`v${e}`).join(` + `);this.userCode=`
      void main() {
        ${n.join(`
        `)}

        vec4 result = ${r};
        setOutput(result);
      }
    `}};function jR(e){let{inputs:t,backend:n}=e,r=t;if(r.length===1)return IL({inputs:{x:r[0]},backend:n});if(r.length>j().getNumber(`WEBGL_MAX_TEXTURES_IN_SHADER`)){let e=Math.floor(r.length/2);return jR({inputs:[jR({inputs:r.slice(0,e),backend:n}),jR({inputs:r.slice(e),backend:n})],backend:n})}let i=r.map(e=>e.dtype).reduce((e,t)=>Ii(e,t)),a=r.map(e=>e.shape),o=j().getBool(`WEBGL_PACK`)?new AR(r[0].shape,a):new kR(r[0].shape,a);return n.runWebGLProgram(o,r,i)}var MR={kernelName:Pe,backendName:`webgl`,kernelFunc:jR};function NR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=E(a,i.shape),l=c,u=Yc(l,s),d=i;u!=null&&(d=_R({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Zc(l.length,s)),Jc(`all`,l,s);let[f,p]=Kc(d.shape,l),m=y(p),h=$({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=lR(h,h.dtype,`all`,n),_;if(o){let e=qc(f,c);_=$({inputs:{x:g},backend:n,attrs:{shape:e}})}else _=$({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),_}var PR={kernelName:`All`,backendName:`webgl`,kernelFunc:NR};function FR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=E(a,i.shape),l=c,u=Yc(l,s),d=i;u!=null&&(d=_R({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Zc(l.length,s)),Jc(`any`,l,s);let[f,p]=Kc(d.shape,l),m=y(p),h=$({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=lR(h,h.dtype,`any`,n),_;if(o){let e=qc(f,c);_=$({inputs:{x:g},backend:n,attrs:{shape:e}})}else _=$({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),_}var IR={kernelName:`Any`,backendName:`webgl`,kernelFunc:FR},LR=class{constructor(e,t,n){this.variableNames=[`A`];let{windowSize:r,batchSize:i,outSize:a}=e;n||this.variableNames.push(`bestIndicesA`),this.outputShape=[i,a];let o=t===`max`?`>`:`<`,s=n?`inOffset + i;`:`round(getBestIndicesA(batch, inOffset + i));`;this.userCode=`
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
    `}},RR=class{constructor(e,t,n,r){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,g(e.length>2,()=>`Packed arg${n.charAt(0).toUpperCase()+n.slice(1)} supports only inputs with rank above 2.`);let i=e[e.length-1],a=Math.ceil(i/t);this.outputShape=e.slice(0,-1),a>1&&this.outputShape.push(a),r||this.variableNames.push(`bestIndicesA`);let o=this.outputShape,s=o.length,c=dF(s),l=JI(`coords`,s),u,d;if(a===1){d=s+1;let e=dF(d);u=`
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
        --${l[s-2]};`;let f=[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,d),p=`.`+f[d-1],m=f.map(e=>`int `+e),h=JI(`sourceLocR`,d-1).concat(`inIdx.r`),_=JI(`sourceLocG`,d-1).concat(`inIdx.g`),v=JI(`sourceLocB`,d-1).concat(`inIdx.b`),y=JI(`sourceLocA`,d-1).concat(`inIdx.a`),b=n===`max`?`greaterThan`:`lessThan`,x=r?``:`
          inIdx = round(vec4(getBestIndicesAChannel(${h.join()}),
                             getBestIndicesAChannel(${_.join()}),
                             getBestIndicesAChannel(${v.join()}),
                             getBestIndicesAChannel(${y.join()})));`,S=`vec4(
            getAChannel(${h.join()}),
            hasNextCol ? getAChannel(${_.join()}) : 0.,
            hasNextRow ? getAChannel(${v.join()}) : 0.,
            hasNextRow && hasNextCol ? getAChannel(${y.join()}) : 0.)`,C=r?``:`
      float getBestIndicesAChannel(${m.join()}) {
        return getChannel(getBestIndicesA(${f.join()}),
                                          vec2(${f.slice(-2).join()}));
      }`;this.userCode=`
      float getAChannel(${m.join()}) {
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
    `}};function zR(e,t,n,r=null){let i=t.shape[0],a=t.shape[1];r!=null&&(i=r.shape[0],a=r.shape[1]);let o=Km(a),s=new LR({windowSize:o,inSize:a,batchSize:i,outSize:Math.ceil(a/o)},n,r==null),c=[t];r!=null&&c.push(r);let l=e.runWebGLProgram(s,c,`int32`);if(l.shape[1]===1)return l;let u=zR(e,t,n,l);return e.disposeIntermediateTensorInfo(l),u}function BR(e,t,n,r=null){let i=r==null?t.shape:r.shape,a=i[i.length-1],o=new RR(i,Km(a),n,r==null),s=r==null?[t]:[t,r],c=e.runWebGLProgram(o,s,`int32`);if(c.shape.length===t.shape.length){let r=BR(e,t,n,c);return e.disposeIntermediateTensorInfo(c),r}return c}function VR(e,t,n,r){let i=[n];if(Jc(`arg`+r.charAt(0).toUpperCase()+r.slice(1),i,t.shape.length),!j().getBool(`WEBGL_PACK_REDUCE`)||t.shape.length<=2){let n=[],a=e.texData.get(t.dataId),o=a!==null&&a.isPacked,s=t;o&&(s=e.unpackTensor(t),n.push(s));let[c,l]=Kc(s.shape,i),u=y(l),d=$({inputs:{x:s},backend:e,attrs:{shape:[-1,u]}});n.push(d);let f=zR(e,d,r);n.push(f);let p=$({inputs:{x:f},backend:e,attrs:{shape:c}});return n.forEach(t=>e.disposeIntermediateTensorInfo(t)),p}return BR(e,t,r)}function HR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r,o=E(a,i.shape),s=Yc(o,i.shape.length),c=i,l=[];s!=null&&(c=_R({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Zc(o.length,c.shape.length)),Jc(`argMax`,[o[0]],c.shape.length);let u=VR(n,c,o[0],`max`);return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),u}var UR={kernelName:Fe,backendName:`webgl`,kernelFunc:HR};function WR(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a}=r,o=E(a,i.shape),s=Yc(o,i.shape.length),c=i,l=[];s!=null&&(c=_R({inputs:{x:i},backend:n,attrs:{perm:s}}),l.push(c),o=Zc(o.length,c.shape.length)),Jc(`argMin`,[o[0]],c.shape.length);let u=VR(n,c,o[0],`min`);return l.forEach(e=>n.disposeIntermediateTensorInfo(e)),u}var GR={kernelName:Ie,backendName:`webgl`,kernelFunc:WR},KR={kernelName:Le,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`})},qR={kernelName:Re,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`return log(x + sqrt(x * x + 1.0));`})},JR={kernelName:ze,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  return atan(x);
`})},YR={kernelName:Ve,backendName:`webgl`,kernelFunc:XL({opSnippet:ML+`
  return atan(a, b);
`,packedOpSnippet:`
  vec4 result = atan(a, b);
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+PL+`
  return result;
`})},XR={kernelName:Be,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
return (log(1.0 + x) - log(1.0 - x)) / 2.0;`})},ZR=class{constructor(e,t,n,r=!1,i=!1){if(this.variableNames=[`x`],t===`avg`&&n)throw Error(`Cannot compute positions for average pool.`);let a=e.filterWidth,o=e.strideHeight,s=e.strideWidth,c=e.dilationHeight,l=e.dilationWidth,u=e.effectiveFilterHeight,d=e.effectiveFilterWidth,f=e.padInfo.top,p=e.padInfo.left;this.outputShape=e.outShape;let m=t===`avg`,h=`((batch  * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + d`,g=`(xR * ${e.inWidth} + xC) * ${e.inChannels} + d`,_=`0.0`;if(m||(_=`-1.0 / 1e-20`),n){this.userCode=`
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
    `}},QR=class{constructor(e,t,n,r=!1,i=!1){if(this.variableNames=[`x`],t===`avg`&&n)throw Error(`Cannot compute positions for average pool.`);let a=e.filterWidth,o=e.strideDepth,s=e.strideHeight,c=e.strideWidth,l=e.dilationDepth,u=e.dilationHeight,d=e.dilationWidth,f=e.effectiveFilterDepth,p=e.effectiveFilterHeight,m=e.effectiveFilterWidth,h=e.padInfo.front,g=e.padInfo.top,_=e.padInfo.left;this.outputShape=e.outShape;let v=t===`avg`,y=`0.0`;if(v||(y=`-1.0 / 1e-20`),n){this.userCode=`
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
    `}};function $R(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;mP(i,`avgPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;g(rs(o,1),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Uo(i.shape,a,o,1,s,c);if(l.filterWidth===1&&l.filterHeight===1&&b(l.inShape,l.outShape))return IL({inputs:{x:i},backend:n});let u=new ZR(l,`avg`,!1);return n.runWebGLProgram(u,[i],`float32`)}var ez={kernelName:He,backendName:`webgl`,kernelFunc:$R};function tz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dimRoundingMode:c,dataFormat:l}=r,u=new QR(Wo(i.shape,a,o,[1,1,1],s,c,l),`avg`,!1);return n.runWebGLProgram(u,[i],`float32`)}var nz={kernelName:We,backendName:`webgl`,kernelFunc:tz},rz=class{constructor(e){this.variableNames=[`dy`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=e.dilationHeight,o=e.dilationWidth,s=e.effectiveFilterHeight,c=e.effectiveFilterWidth,l=s-1-e.padInfo.top,u=c-1-e.padInfo.left,d=1/(t*n);this.userCode=`
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
    `}},iz=class{constructor(e){this.variableNames=[`dy`],this.outputShape=e.inShape;let t=e.filterDepth,n=e.filterHeight,r=e.filterWidth,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=e.dilationDepth,c=e.dilationHeight,l=e.dilationWidth,u=e.effectiveFilterDepth,d=e.effectiveFilterHeight,f=e.effectiveFilterWidth,p=u-1-e.padInfo.front,m=d-1-e.padInfo.top,h=f-1-e.padInfo.left,g=1/(t*n*r);this.userCode=`
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
    `}};function az(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a,{filterSize:s,strides:c,pad:l,dimRoundingMode:u}=r,d=new iz(Wo(o.shape,s,c,[1,1,1],l,u));return n.runWebGLProgram(d,[i],o.dtype)}var oz={kernelName:Ge,backendName:`webgl`,kernelFunc:az};function sz(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a;mP([i,a],`avgPoolGrad`);let{filterSize:s,strides:c,pad:l}=r,u=new rz(Uo(o.shape,s,c,1,l));return n.runWebGLProgram(u,[i],o.dtype)}var cz={kernelName:Ue,backendName:`webgl`,kernelFunc:sz};function lz(e){let{inputs:t,backend:n,attrs:r}=e,{a:i,b:a}=t,{transposeA:o,transposeB:s}=r;return yR({a:i,b:a,transposeA:o,transposeB:s,backend:n})}var uz={kernelName:Ke,backendName:`webgl`,kernelFunc:lz},dz=class{constructor(e,t,n,r,i,a){this.outputShape=[],this.variableNames=[`x`,`mean`,`variance`],U(e,t),U(e,n);let o=`0.0`;r!=null&&(U(e,r),this.variableNames.push(`offset`),o=`getOffsetAtOutCoords()`);let s=`1.0`;i!=null&&(U(e,i),this.variableNames.push(`scale`),s=`getScaleAtOutCoords()`),this.outputShape=e,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = ${o};
        float scale = ${s};
        float inv = scale * inversesqrt(variance + float(${a}));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `}},fz=class{constructor(e,t,n,r,i,a){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=[`x`,`mean`,`variance`],U(e,t),U(e,n);let o=`vec4(0.0)`;r!=null&&(U(e,r),this.variableNames.push(`offset`),o=`getOffsetAtOutCoords()`);let s=`vec4(1.0)`;i!=null&&(U(e,i),this.variableNames.push(`scale`),s=`getScaleAtOutCoords()`),this.outputShape=e,this.userCode=`
      void main() {
        vec4 offset = ${o};
        vec4 scale = ${s};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${a}));

        setOutput((x - mean) * inv + offset);
      }
    `}},pz={kernelName:Pt,backendName:`webgl`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r,mean:i,variance:a,offset:o,scale:s}=e;g(i.shape.length===a.shape.length,()=>`Batch normalization gradient requires mean and variance to have equal ranks.`),g(o==null||i.shape.length===o.shape.length,()=>`Batch normalization gradient requires mean and offset to have equal ranks.`),g(s==null||i.shape.length===s.shape.length,()=>`Batch normalization gradient requires mean and scale to have equal ranks.`);let{varianceEpsilon:c}=n;c??=.001;let l=[r,i,a],u=null;o!=null&&(u=o.shape,l.push(o));let d=null;s!=null&&(d=s.shape,l.push(s));let f=j().getBool(`WEBGL_PACK_NORMALIZATION`)?new fz(r.shape,i.shape,a.shape,u,d,c):new dz(r.shape,i.shape,a.shape,u,d,c);return t.runWebGLProgram(f,l,l[0].dtype)}},mz=class{constructor(e){this.variableNames=[`source`],this.outputShape=e,this.rank=e.length;let t=dF(this.rank);this.customUniforms=[{name:`start`,arrayIndex:this.rank,type:`int`}];let n=gz(this.rank),r;r=`
        ${t} sourceLoc;
        ${t} coords = getOutputCoords();
        ${e.map((e,t)=>`sourceLoc.${hz[t]} = start[${t}] + coords.${hz[t]};`).join(`
`)}
      `,this.userCode=`
      void main() {
        ${r}
        setOutput(getSource(${n}));
      }
    `}},hz=[`x`,`y`,`z`,`w`,`u`,`v`];function gz(e){if(e===1)return`sourceLoc`;if(e<=6)return hz.slice(0,e).map(e=>`sourceLoc.`+e).join(`,`);throw Error(`Slicing for rank ${e} is not yet supported`)}var _z=class{constructor(e){this.variableNames=[`source`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.customUniforms=[{name:`start`,arrayIndex:this.rank,type:`int`}];let t=dF(this.rank),n=JI(`coords`,this.rank),r=JI(`sourceLoc`,this.rank),i=this.rank===1?`sourceLoc`:`vec2(${r.slice(-2).join()})`,a=`getChannel(getSource(${r.join()}), ${i})`,o=`
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
    `}};function vz(e,t,n,r){let i=r.texData.get(e.dataId),a=r.makeTensorInfo(n,e.dtype),o=r.texData.get(a.dataId);Object.assign(o,i),o.refCount=1,o.shape=n,o.dtype=e.dtype;let s=jm(t,A(e.shape));i.slice&&(s+=i.slice.flatOffset),o.slice={flatOffset:s,origDataId:i.slice&&i.slice.origDataId||e.dataId};let c=r.dataRefCount.get(o.slice.origDataId)||1;return r.dataRefCount.set(o.slice.origDataId,c+1),a}function yz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,size:o}=r,[s,c]=Mm(i,a,o);if(vm(i,s,c),y(c)===0)return n.makeTensorInfo(c,i.dtype,[]);if(n.shouldExecuteOnCPU([i])||i.dtype===`string`){let e=MI(n.texData.get(i.dataId).values,s,c,i.shape,i.dtype);return n.makeTensorInfo(c,i.dtype,e)}let{isPacked:l}=n.texData.get(i.dataId),u=Am(i.shape,s,c);if(l||!u){let e=j().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new _z(c):new mz(c),t=[s];return n.runWebGLProgram(e,[i],i.dtype,t)}return n.uploadToGPU(i.dataId),vz(i,s,c,n)}var bz={kernelName:Wn,backendName:`webgl`,kernelFunc:yz},xz={kernelName:qe,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,crops:o}=r;g(i.shape.length<=4,()=>`batchToSpaceND for rank > 4 with a WebGL backend not implemented yet`);let s=a.reduce((e,t)=>e*t),c=Jm(i.shape,a,s),l=Ym(c.length,a.length),u=Xm(i.shape,a,s),d=Zm(o,a.length),f=Qm(u,o,a.length),p=[],m=$({inputs:{x:i},backend:n,attrs:{shape:c}}),h=_R({inputs:{x:m},backend:n,attrs:{perm:l}}),_=$({inputs:{x:h},backend:n,attrs:{shape:u}}),v=yz({inputs:{x:_},backend:n,attrs:{begin:d,size:f}});return p.push(m),p.push(h),p.push(_),p.forEach(e=>n.disposeIntermediateTensorInfo(e)),v}};function Sz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o}=r,s=$F(n.readSync(i.dataId),n.readSync(a.dataId),a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,s)}var Cz={kernelName:Je,backendName:`webgl`,kernelFunc:Sz},wz=`
  int r = int(a.r) & int(b.r);
  int g = int(a.g) & int(b.g);
  int rb = int(a.b) & int(b.b);
  int ra = int(a.a) & int(b.a);
  return vec4(r, g, rb, ra);
`,Tz=`
  return float(int(a.r) & int(b.r));
`;function Ez(e){let{inputs:t,backend:n}=e,{a:r,b:i}=t,a=j().getBool(`WEBGL_PACK_BINARY_OPERATIONS`),o=j().getNumber(`WEBGL_VERSION`);if(n.shouldExecuteOnCPU([r,i])||o===1){let e=n.texData.get(r.dataId).values,t=n.texData.get(i.dataId).values,[a,o]=tI(r.shape,i.shape,e,t,r.dtype),s=n.makeTensorInfo(o,r.dtype),c=n.texData.get(s.dataId);return c.values=a,s}let s;return s=a?new FL(wz,r.shape,i.shape,!1):new NL(Tz,r.shape,i.shape),n.runWebGLProgram(s,[r,i],r.dtype)}var Dz={kernelName:Ye,backendName:`webgl`,kernelFunc:Ez};function Oz(e){let{inputs:t,backend:n}=e,{s0:r,s1:i}=t,a=n.readSync(r.dataId),o=n.readSync(i.dataId),s=U(Array.from(a),Array.from(o));return n.makeTensorInfo([s.length],`int32`,Int32Array.from(s))}var kz={kernelName:Ze,backendName:`webgl`,kernelFunc:Oz},Az=XL({opSnippet:`return float(a != b);`,cpuKernelImpl:SI,dtype:`bool`}),jz={kernelName:pn,backendName:`webgl`,kernelFunc:Az};function Mz(e){let{inputs:t,backend:n}=e,{input:r}=t;return IL({inputs:{x:n.texData.get(r.dataId).complexTensorInfos.real},backend:n})}var Nz={kernelName:Dn,backendName:`webgl`,kernelFunc:Mz},Pz=`return float(int(x));`;function Fz(e,t){let n=new oL(e.shape,Pz),r=t.runWebGLProgram(n,[e],`int32`);return{dataId:r.dataId,shape:r.shape,dtype:r.dtype}}function Iz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dtype:a}=r;if(a===`complex64`){if(i.dtype===`complex64`)return IL({inputs:{x:i},backend:n});let e=Ou(i.shape),t=Iz({inputs:{x:i},backend:n,attrs:{dtype:`float32`}}),r=RL({inputs:{real:t,imag:e},backend:n});return e.dispose(),n.disposeIntermediateTensorInfo(t),r}if(i.dtype===`complex64`){let e=Mz({inputs:{input:i},backend:n}),t=Iz({inputs:{x:e},backend:n,attrs:{dtype:a}});return n.disposeIntermediateTensorInfo(e),t}if(!ne(i.dtype,a)){let e=IL({inputs:{x:i},backend:n});return{dataId:e.dataId,shape:e.shape,dtype:a}}if(n.shouldExecuteOnCPU([i])){let e=n.texData.get(i.dataId).values,[t,r,o]=nI(e,i.shape,i.dtype,a);return n.makeTensorInfo(t,r,o)}if(a===`int32`)return Fz(i,n);if(a===`bool`){let e=n.makeTensorInfo([],`bool`,O(`bool`,1)),t=Az({inputs:{a:i,b:e},backend:n});return n.disposeIntermediateTensorInfo(e),t}throw Error(`Error in Cast: failed to cast ${i.dtype} to ${a}`)}var Lz={kernelName:Qe,backendName:`webgl`,kernelFunc:Iz},Rz=`return ceil(x);`,zz={kernelName:$e,backendName:`webgl`,kernelFunc:YL({opSnippet:Rz,packedOpSnippet:Rz,cpuKernelImpl:rI})},Bz=class{constructor(e){this.variableNames=[`A`],this.customUniforms=[{name:`minVal`,type:`float`},{name:`maxVal`,type:`float`}],this.outputShape=e,this.userCode=`

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}},Vz=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`minVal`,type:`float`},{name:`maxVal`,type:`float`}],this.outputShape=e,this.userCode=`
      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}};function Hz(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{clipValueMin:a,clipValueMax:o}=r,s;s=j().getBool(`WEBGL_PACK_CLIP`)?new Vz(i.shape):new Bz(i.shape);let c=[[a],[o]];return n.runWebGLProgram(s,[i],i.dtype,c)}var Uz={kernelName:et,backendName:`webgl`,kernelFunc:Hz},Wz=class{constructor(e){this.variableNames=[`real`,`imag`],this.outputShape=e,this.userCode=`
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
    `}};function Gz(e,t){return{dataId:t.dataId,dtype:t.dtype,shape:e.shape}}function Kz(e){let{inputs:t,backend:n}=e,{x:r}=t,i=n.texData.get(r.dataId),a=new Wz(r.shape),o=[Gz(r,i.complexTensorInfos.real),Gz(r,i.complexTensorInfos.imag)];return n.runWebGLProgram(a,o,o[0].dtype)}var qz={kernelName:nt,backendName:`webgl`,kernelFunc:Kz},Jz=class{constructor(e){this.outputShape=[],this.outputShape=Bm(e,1),this.variableNames=e.map((e,t)=>`T${t}`);let t=Array(e.length-1);t[0]=e[0][1];for(let n=1;n<t.length;n++)t[n]=t[n-1]+e[n][1];let n=[`if (yC < ${t[0]}) setOutput(getT0(yR, yC));`];for(let e=1;e<t.length;e++){let r=t[e-1];n.push(`else if (yC < ${t[e]}) setOutput(getT${e}(yR, yC-${r}));`)}let r=t.length,i=t[t.length-1];n.push(`else setOutput(getT${r}(yR, yC-${i}));`),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        ${n.join(`
        `)}
      }
    `}},Yz=class{constructor(e,t){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=Bm(e,t);let n=this.outputShape,r=n.length,i=dF(r),a=JI(`coords`,r),o=[`x`,`y`,`z`,`w`,`u`,`v`].slice(0,r);this.variableNames=e.map((e,t)=>`T${t}`);let s=Array(e.length-1);s[0]=e[0][t];for(let n=1;n<s.length;n++)s[n]=s[n-1]+e[n][t];let c=o[t],l=o.slice(-2),u=o.join(),d=`if (${c} < ${s[0]}) {
        return getChannel(
            getT0(${u}), vec2(${l.join()}));
        }`;for(let e=1;e<s.length;e++){let t=s[e-1];d+=`
        if (${c} < ${s[e]}  && ${c} >= ${s[e-1]}) {
          return getChannel(
            getT${e}(${Xz(o,c,t)}),
            vec2(${Xz(l,c,t)}));
        }`}let f=s.length,p=s[s.length-1];d+=`
        return getChannel(
          getT${f}(${Xz(o,c,p)}),
          vec2(${Xz(l,c,p)}));`,this.userCode=`
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
    `}};function Xz(e,t,n){let r=e.indexOf(t);return e.map((e,t)=>t===r?`${e} - ${n}`:e).join()}function Zz(e){let{inputs:t,backend:n}=e,{input:r}=t;return IL({inputs:{x:n.texData.get(r.dataId).complexTensorInfos.imag},backend:n})}var Qz={kernelName:Vt,backendName:`webgl`,kernelFunc:Zz};function $z(e,t,n){let r=e[0].dtype;if(r===`complex64`){let r=e.map(e=>Mz({inputs:{input:e},backend:n})),i=e.map(e=>Zz({inputs:{input:e},backend:n})),a=$z(r,t,n),o=$z(i,t,n),s=RL({inputs:{real:a,imag:o},backend:n});return r.forEach(e=>n.disposeIntermediateTensorInfo(e)),i.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.disposeIntermediateTensorInfo(a),n.disposeIntermediateTensorInfo(o),s}let i=n.shouldExecuteOnCPU(e);if(r===`string`&&(i=!0),i){let i=e.map(e=>{let r=[-1,y(e.shape.slice(t))];return $({inputs:{x:e},backend:n,attrs:{shape:r}})}),a=iI(i.map(e=>({vals:n.readSync(e.dataId),shape:e.shape})),Bm(i.map(e=>e.shape),1),r,i[0].shape[0]===1),o=Bm(e.map(e=>e.shape),t),s=n.makeTensorInfo(o,r,a);return i.forEach(e=>n.disposeIntermediateTensorInfo(e)),s}let a=e.filter(e=>y(e.shape)>0),o=j().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)&&a[0].shape.length>1;if(a.length===1){let t=o?new oL(e[0].shape,pL):new bL(e[0].shape,pL);return n.runWebGLProgram(t,e,r)}let s=j().getNumber(`WEBGL_MAX_TEXTURES_IN_SHADER`);if(a.length>s){let e=[];for(let r=0;r<a.length;r+=s){let i=a.slice(r,r+s);e.push($z(i,t,n))}let r=$z(e,t,n);for(let t of e)n.disposeIntermediateTensorInfo(t);return r}if(o){let e=new Yz(a.map(e=>e.shape),t);return n.runWebGLProgram(e,a,r)}let{tensors2D:c,outShape:l}=eB(a,t,n),u=new Jz(c.map(e=>e.shape)),d=n.runWebGLProgram(u,c,r);c.forEach(e=>n.disposeIntermediateTensorInfo(e));let f=$({inputs:{x:d},attrs:{shape:l},backend:n});return n.disposeIntermediateTensorInfo(d),f}function eB(e,t,n){let r=Bm(e.map(e=>e.shape),t);return{tensors2D:e.map(e=>$({inputs:{x:e},attrs:{shape:[-1,y(e.shape.slice(t))]},backend:n})),outShape:r}}function tB(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r,a=E(i,t[0].shape)[0];zm(t.map(e=>e.shape),a);let o=Bm(t.map(e=>e.shape),a);if(y(o)===0)return n.makeTensorInfo(o,t[0].dtype,[]);let s=t.filter(e=>y(e.shape)>0);return s.length===1?IL({inputs:{x:s[0]},backend:n}):$z(s,a,n)}var nB={kernelName:rt,backendName:`webgl`,kernelFunc:tB},rB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let a=e.padInfo.top,o=e.padInfo.left,s=e.strideHeight,c=e.strideWidth,l=e.dilationHeight,u=e.dilationWidth,d=e.filterHeight,f=e.filterWidth,p=Math.floor(e.inChannels/4)*4,m=e.inChannels%4,h=e.dataFormat===`channelsLast`,g=h?1:2,_=h?2:3,v=h?3:1,y=``,b=``;n&&(y=r?`float activation(float a) {
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
    `}},iB=class{constructor(e){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let t=e.padInfo.front,n=e.padInfo.top,r=e.padInfo.left,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=e.dilationDepth,c=e.dilationHeight,l=e.dilationWidth,u=e.filterDepth,d=e.filterHeight,f=e.filterWidth,p=Math.floor(e.inChannels/4)*4,m=e.inChannels%4;this.userCode=`
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
    `}},aB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=bF(this.outputShape.length);let a=e.padInfo.left,o=e.strideWidth,s=e.dilationWidth,c=e.filterHeight,l=e.filterWidth,u=l,d=`
       int xR; int xC; int xCOffset;
       vec4 wTexel; vec4 previous; vec4 final;`;for(let e=0;e<l;e++)d+=`
           vec4 xTexelC${e*2};
           int xTexelC${e*2}Ready;
           vec4 xTexelC${e*2+1};
           int xTexelC${e*2+1}Ready;
           vec4 xC${e};`;d+=`
     for (int r = 0; r < ${c}; r++) {
      for (int d1 = 0; d1 < ${e.inChannels}; d1 += 2) {
       `;for(let e=0;e<l;e++)d+=`
           xTexelC${e*2} = vec4(0.0);
           xTexelC${e*2}Ready = 0;
           xTexelC${e*2+1} = vec4(0.0);
           xTexelC${e*2+1}Ready = 0;
           xC${e} = vec4(0.0);`;d+=`
         xR = xRCorner + r * dilations[0];
         if (xR >=0 && xR < inDims[0]) {
       `;for(let t=0;t<(u+1)/2;t++){let n=t*2;if(d+=`
           xC = xCCorner + ${n*s};
           `,o===1){if(n<l&&(a%2==1?(d+=`
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
               `,d+=s===1&&n>0?`
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
                   `):d+=`
                 if (xC >= 0 && xC < inDims[1] && xTexelC${n}Ready == 0) {
                   xTexelC${n} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${n}.zw = vec2(0.0);
                   }
                   xTexelC${n}Ready = 1;
                 }

                 xC${n} = xTexelC${n};
                 `,n+1<l)){let e=a%2==0?p(s):s;s%2==0&&a%2==1||s%2!=0&&a%2!=1?(d+=`
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
                   `,d+=s>1?`
                     xCOffset -= 2;
                     if (xCOffset >= 0 && xCOffset < inDims[1]) {
                      previous = getX(batch, xR, xCOffset, d1);
                      xC${n+1} = vec4(previous.zw, xTexelC${n+1}.xy);
                     } else {
                      xC${n+1} = vec4(0.0, 0.0, xTexelC${n+1}.xy);
                     }
                     `:`
                     xC${n+1} = vec4(xTexelC${n}.zw, xTexelC${n+1}.xy);
                     `):d+=e===1?`
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
                     `}}else n<l&&(a%2==1?(d+=`
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
               `,n+1<l&&(d+=`
                   final = vec4(0.0);
                   xCOffset = xC + 1 + strides[1];
                   if(xCOffset >= 0 && xCOffset < inDims[1]) {
                     final = getX(batch, xR, xCOffset, d1);
                   }
                   xC${n+1} = vec4(xTexelC${n+1}.xy, final.xy);
                 `)):(d+=`
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
               `,n+1<l&&(d+=`
                   xC${n+1} = vec4(xTexelC${n}.zw, xTexelC${n+1}.zw);
                 `)));n<l&&(d+=`
             wTexel = getW(r, ${n}, d1, d2);
             dotProd += xC${n}.xxzz * vec4(wTexel.xy, wTexel.xy);
             if(d1 + 1 < ${e.inChannels}) {
               dotProd += xC${n}.yyww * vec4(wTexel.zw, wTexel.zw);
             }
           `,n+1<l&&(d+=`
               wTexel = getW(r, ${n+1}, d1, d2);
               dotProd += xC${n+1}.xxzz * vec4(wTexel.xy, wTexel.xy);
               if(d1 + 1 < ${e.inChannels}) {
                 dotProd += xC${n+1}.yyww * vec4(wTexel.zw, wTexel.zw);
               }
             `))}d+=`
     }
   `,d+=`
     }
   `,d+=`
     }
   `;let f=``,m=``;n&&(f=r?`vec4 activation(vec4 a) {
           vec4 b = getPreluActivationWeightsAtOutCoords();
           ${n}
         }`:i?`vec4 activation(vec4 a) {
           vec4 b = getLeakyreluAlphaAtOutCoords();
           ${n}
         }`:`vec4 activation(vec4 x) {
           ${n}
         }`,m=`result = activation(result);`);let h=t?`result += getBiasAtOutCoords();`:``;t&&this.variableNames.push(`bias`),r&&this.variableNames.push(`preluActivationWeights`),i&&this.variableNames.push(`leakyreluAlpha`),this.userCode=`
       ${f}

       void main() {
         ivec4 coords = getOutputCoords();
         int batch = coords.x;
         ivec2 xRCCorner = coords.yz * strides - pads;
         int d2 = coords.w;
         int xRCorner = xRCCorner.x;
         int xCCorner = xRCCorner.y;

         //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
         vec4 dotProd = vec4(0.000000000000001);

         ${d}

         vec4 result = dotProd - vec4(0.000000000000001);
         ${h}
         ${m}
         setOutput(result);
       }
     `}},oB=class{constructor(e,t){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`inputShape`,type:`ivec4`},{name:`pad`,type:`ivec2`},{name:`stride`,type:`ivec2`},{name:`dilation`,type:`ivec2`},{name:`inChannels`,type:`int`},{name:`itemsPerBlockRow`,type:`int`},{name:`outWidth`,type:`int`}],this.outputShape=e,this.enableShapeUniforms=bF(this.outputShape.length);let{dataFormat:n}=t,r=hP(),i=n===`channelsLast`,a=i?1:2,o=i?2:3,s=this.enableShapeUniforms?`if(blockIndex < outShape[2] && pos < outShape[1]) {`:`if(blockIndex < ${e[2]} && pos < ${e[1]}) {`,c=``;for(let e=0;e<=1;e++)for(let t=0;t<=1;t++)c+=`
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
    `}};function sB(e,t){let n=e.length;return n>=3?t?[...e.slice(0,-3),e[n-3]*e[n-2],e[n-1]]:[...e.slice(0,-3),e[n-3],e[n-2]*e[n-1]]:!t&&n===1&&e[0]>1?[e[0],1]:null}function cB({x:e,filter:t,convInfo:n,backend:r,bias:i=null,preluActivationWeights:a=null,leakyreluAlpha:o=0,activation:s=null}){let c=e.shape,l=r.texData.get(e.dataId),u=n.inChannels,d=c[0]*c[1]*c[2],f=n.outChannels,p=n.dataFormat===`channelsLast`,m,h=[];if(a!=null){let e=sB(a.shape,p);e!=null&&(a=$({inputs:{x:a},backend:r,attrs:{shape:e}}),h.push(a))}if(i!=null){let e=sB(i.shape,p);e!=null&&(i=$({inputs:{x:i},backend:r,attrs:{shape:e}}),h.push(i))}if(!((d===1||f===1)&&u>1e3)&&l.isPacked&&p&&l.texture!=null&&c[2]%2!=0&&b(l.shape.slice(-3),c.slice(-3))){let u=c[0]*c[1]*(c[2]+1),d={dataId:e.dataId,shape:[1,u,n.inChannels],dtype:e.dtype},f=l.shape;l.shape=l.shape.slice(),l.shape[l.shape.length-2]++,g(tP(l.shape,d.shape),()=>`packed reshape ${l.shape} to ${d.shape} isn't free`);let p=$({inputs:{x:t},backend:r,attrs:{shape:[1,n.inChannels,n.outChannels]}});h.push(p);let _=yR({a:d,b:p,backend:r,transposeA:!1,transposeB:!1,bias:i,activation:s,preluActivationWeights:a,leakyreluAlpha:o}),v=r.texData.get(_.dataId);g(v.isPacked,()=>`batchMatMul result is expected to be packed`),l.shape=f,v.shape=n.outShape,m=IL({inputs:{x:_},backend:r}),m.shape=n.outShape,h.push(_)}else{let c=n.outHeight*n.outWidth,l=$({inputs:{x:e},backend:r,attrs:{shape:p?[n.batchSize,c,n.inChannels]:[n.batchSize,n.inChannels,c]}}),u=$({inputs:{x:t},backend:r,attrs:{shape:[1,n.inChannels,n.outChannels]}}),d=yR({a:p?l:u,b:p?u:l,transposeA:!p,transposeB:!1,backend:r,bias:i,activation:s,preluActivationWeights:a,leakyreluAlpha:o});m=$({inputs:{x:d},backend:r,attrs:{shape:n.outShape}}),h.push(l),h.push(u),h.push(d)}for(let e of h)r.disposeIntermediateTensorInfo(e);return m}function lB({x:e,filter:t,convInfo:n,backend:r,bias:i=null,preluActivationWeights:a=null,leakyreluAlpha:o=0,activation:s=null}){let{filterWidth:c,filterHeight:l,inChannels:u,outWidth:d,outHeight:f,dataFormat:p}=n,m=p===`channelsLast`,h=c*l*u,g=f*d,_=[n.batchSize,h,g],v=[];if(a!=null){let e=sB(a.shape,m);e!=null&&(a=$({inputs:{x:a},backend:r,attrs:{shape:e}}),v.push(a))}if(i!=null){let e=sB(i.shape,m);e!=null&&(i=$({inputs:{x:i},backend:r,attrs:{shape:e}}),v.push(i))}let b=$({inputs:{x:t},backend:r,attrs:{shape:[1,h,y(t.shape)/h]}});v.push(b);let x=new oB(_,n),S=[e.shape,[n.padInfo.top,n.padInfo.left],[n.strideHeight,n.strideWidth],[n.dilationHeight,n.dilationWidth],[n.inChannels],[n.filterWidth*n.inChannels],[n.outWidth]],C=r.runWebGLProgram(x,[e],`float32`,S),w=$({inputs:{x:C},backend:r,attrs:{shape:_}});v.push(C),v.push(w);let T=i!=null,E=a!=null,D=s===`leakyrelu`,O=s?ZL(s,!0):null,k=new QL(m?w.shape:b.shape,m?b.shape:w.shape,m?[n.batchSize,g,n.outChannels]:[n.batchSize,n.outChannels,g],!0,!1,T,O,E,D),ee=m?[w,b]:[b,w];if(i&&ee.push(i),E&&ee.push(a),D){let e=r.makeTensorInfo([],`float32`,ti(o,`float32`));ee.push(e),v.push(e)}let te=r.runWebGLProgram(k,ee,`float32`),ne=$({inputs:{x:te},backend:r,attrs:{shape:n.outShape}});v.push(te);for(let e of v)r.disposeIntermediateTensorInfo(e);return ne}function uB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dataFormat:c,dilations:l,dimRoundingMode:u}=r,d=as(c),f=Go(i.shape,a.shape,o,l,s,u,!1,d),p;if(f.filterHeight===1&&f.filterWidth===1&&f.dilationHeight===1&&f.dilationWidth===1&&f.strideHeight===1&&f.strideWidth===1&&(f.padInfo.type===`SAME`||f.padInfo.type===`VALID`))p=cB({x:i,filter:a,convInfo:f,backend:n});else if(f.strideWidth<=2&&d===`channelsLast`&&j().getBool(`WEBGL_EXP_CONV`)){let e=new aB(f),t=[[f.padInfo.top,f.padInfo.left],[f.strideHeight,f.strideWidth],[f.dilationHeight,f.dilationWidth],[f.inHeight,f.inWidth]];p=n.runWebGLProgram(e,[i,a],`float32`,t)}else if(j().getBool(`WEBGL_CONV_IM2COL`))p=lB({x:i,filter:a,convInfo:f,backend:n});else{let e=new rB(f);p=n.runWebGLProgram(e,[i,a],`float32`)}let m=$({inputs:{x:p},backend:n,attrs:{shape:f.outShape}});return n.disposeIntermediateTensorInfo(p),m}var dB={kernelName:it,backendName:`webgl`,kernelFunc:uB},fB=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideHeight,n=e.strideWidth,r=e.padInfo.top,i=e.padInfo.left,a=e.dataFormat===`channelsLast`;this.userCode=`
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
    `}},pB=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=e.dataFormat===`channelsLast`,o=t-1-e.padInfo.top,s=n-1-e.padInfo.left,c=a?1:2,l=a?2:3,u=a?3:1;this.userCode=`
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
    `}},mB=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideDepth,n=e.strideHeight,r=e.strideWidth,i=e.padInfo.front,a=e.padInfo.top,o=e.padInfo.left;this.userCode=`
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
    `}},hB=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterDepth,n=e.filterHeight,r=e.filterWidth,i=e.strideDepth,a=e.strideHeight,o=e.strideWidth,s=t-1-e.padInfo.front,c=n-1-e.padInfo.top,l=r-1-e.padInfo.left;this.userCode=`
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
    `}};function gB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,dataFormat:c,dimRoundingMode:l,filterShape:u}=r,d=as(c),f=new fB(Go(i.shape,u,o,1,s,l,!1,d));return n.runWebGLProgram(f,[i,a],`float32`)}var _B={kernelName:at,backendName:`webgl`,kernelFunc:gB},vB=class{constructor(e){this.variableNames=[`dy`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`strides`,type:`vec2`}],this.outputShape=e.inShape,this.enableShapeUniforms=bF(this.outputShape.length);let t=e.filterHeight,n=e.filterWidth,r=t-1-e.padInfo.top,i=n-1-e.padInfo.left;this.userCode=`
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
    `}};function yB(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{inputShape:o,strides:s,pad:c,dataFormat:l,dimRoundingMode:u}=r,d=as(l),f=Go(o,a.shape,s,1,c,u,!1,d);if(j().getBool(`WEBGL_PACK_CONV2DTRANSPOSE`)&&d===`channelsLast`){let e=[[f.strideHeight,f.strideWidth]],t=new vB(f);return n.runWebGLProgram(t,[i,a],`float32`,e)}{let e=new pB(f);return n.runWebGLProgram(e,[i,a],`float32`)}}var bB={kernelName:ot,backendName:`webgl`,kernelFunc:yB};function xB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r,l=new iB(Ko(i.shape,a.shape,o,c,s));return n.runWebGLProgram(l,[i,a],`float32`)}var SB={kernelName:st,backendName:`webgl`,kernelFunc:xB};function CB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,pad:s,filterShape:c}=r,l=new mB(Ko(i.shape,c,o,1,s));return n.runWebGLProgram(l,[i,a],`float32`)}var wB={kernelName:ct,backendName:`webgl`,kernelFunc:CB};function TB(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{pad:o,strides:s,inputShape:c}=r,l=new hB(Ko(c,a.shape,s,1,o));return n.runWebGLProgram(l,[i,a],`float32`)}var EB={kernelName:lt,backendName:`webgl`,kernelFunc:TB},DB={kernelName:`Cos`,backendName:`webgl`,kernelFunc:YL({opSnippet:JL+`
  return cos(x);
`,packedOpSnippet:`
  vec4 result = cos(x);
  bvec4 isNaN = isnan(x);
  ${PL}
  return result;
`})},OB={kernelName:ut,backendName:`webgl`,kernelFunc:YL({opSnippet:`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`})},kB=class{constructor(e,t,n,r,i){this.variableNames=[`Image`,`Boxes`,`BoxInd`],this.outputShape=[];let[a,o,s,c]=e,[l]=t,[u,d]=n;this.outputShape=[l,u,d,c];let f=+(r===`bilinear`),[p,m]=[`${o-1}.0`,`${s-1}.0`],[h,g,_]=u>1?[`${(o-1)/(u-1)}`,`(y2-y1) * height_ratio`,`y1*${p} + float(y)*(height_scale)`]:[`0.0`,`0.0`,`0.5 * (y1+y2) * ${p}`],[v,y,b]=d>1?[`${(s-1)/(d-1)}`,`(x2-x1) * width_ratio`,`x1*${m} + float(x)*(width_scale)`]:[`0.0`,`0.0`,`0.5 * (x1+x2) * ${m}`];this.userCode=`
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
    `}},AB={kernelName:pt,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{image:i,boxes:a,boxInd:o}=t,{cropSize:s,method:c,extrapolationValue:l}=r,u=new kB(i.shape,a.shape,s,c,l);return n.runWebGLProgram(u,[i,a,o],`float32`)}},jB;(function(e){e.Prod=`*`,e.Sum=`+`})(jB||={});var MB=class{constructor(e,t,n,r){this.op=e,this.outputShape=t,this.variableNames=[`x`],this.customUniforms=[{name:`index`,type:`float`}];let i=this.outputShape.length,a=this.op===jB.Prod?`1.0`:`0.0`,o=n?a:`getX(${NB(i,`coords`,this.op)})`,s=this.outputShape[this.outputShape.length-1],c=``,l=``;n?(c=r?`end != ${s-1}`:`end != 0`,l=r?`end + 1`:`end - 1`):(c=r?`end + pow2 < ${s}`:`end >= pow2`,l=r?`end + pow2`:`end - pow2`),this.userCode=`
      void main() {
        ${dF(i)} coords = getOutputCoords();
        int end = ${PB(i,`coords`,this.op)};
        float val = ${o};
        int pow2 = int(pow(2.0, index));
        if (${c}) {
          int idx = ${l};
          ${PB(i,`coords`,this.op)} = idx;
          val ${this.op}= getX(${NB(i,`coords`,this.op)});
        }
        setOutput(val);
      }
    `}};function NB(e,t,n){if(e===1)return`${t}`;if(e===2)return`${t}.x, ${t}.y`;if(e===3)return`${t}.x, ${t}.y, ${t}.z`;if(e===4)return`${t}.x, ${t}.y, ${t}.z, ${t}.w`;throw Error(`Cumulative ${n} for rank ${e} is not yet supported`)}function PB(e,t,n){if(e===1)return`${t}`;if(e===2)return`${t}.y`;if(e===3)return`${t}.z`;if(e===4)return`${t}.w`;throw Error(`Cumulative ${n} for rank ${e} is not yet supported`)}function FB(e,t,n,r,i,a){let o=t.shape.length,s=Yc([r],o),c=t;s!=null&&(c=_R({inputs:{x:t},backend:n,attrs:{perm:s}}));let l=Zc(1,o)[0];if(l!==o-1)throw Error(`WebGL cumprod shader expects an inner-most axis=${t.shape.length-1} but got axis=${r}`);let u=c.shape[l],d=IL({inputs:{x:c},backend:n});for(let t=0;t<=Math.ceil(Math.log2(u))-1;t++){let r=new MB(e,c.shape,!1,a),i=[[t]],o=d;d=n.runWebGLProgram(r,[d],d.dtype,i),n.disposeIntermediateTensorInfo(o)}if(i){let t=new MB(e,c.shape,i,a),r=d;d=n.runWebGLProgram(t,[d],d.dtype),n.disposeIntermediateTensorInfo(r)}if(s!=null){let e=Xc(s),t=_R({inputs:{x:d},backend:n,attrs:{perm:e}});return n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(c),t}return d}function IB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;return FB(jB.Prod,i,n,a,o,s)}var LB={kernelName:dt,backendName:`webgl`,kernelFunc:IB};function RB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,exclusive:o,reverse:s}=r;return FB(jB.Sum,i,n,a,o,s)}var zB={kernelName:ft,backendName:`webgl`,kernelFunc:RB};function BB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,weights:a}=t,{size:o,binaryOutput:s}=r;if(i.shape.length===1){let e=$F(n.readSync(i.dataId),n.readSync(a.dataId),a.dtype,a.shape,o);return n.makeTensorInfo([o],a.dtype,e)}if(i.shape.length===2){let e=eI(n.bufferSync(i),n.bufferSync(a),o,s);return n.makeTensorInfo(e.shape,a.dtype,e.values)}throw Error(`Error in denseBincount: input must be at most rank 2, but got rank${i.shape.length}.`)}var VB={kernelName:mt,backendName:`webgl`,kernelFunc:BB},HB=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=[],this.outputShape=e,this.blockSize=t,this.dataFormat=n,this.userCode=`
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
  `}getHeightCoordString(){return this.dataFormat===`NHWC`?`coords[1]`:`coords[2]`}getWidthCoordString(){return this.dataFormat===`NHWC`?`coords[2]`:`coords[3]`}getDepthCoordString(){return this.dataFormat===`NHWC`?`coords[3]`:`coords[1]`}getOutputDepthSize(){return this.dataFormat===`NHWC`?this.outputShape[3]:this.outputShape[1]}getInputSamplingString(){return this.dataFormat===`NHWC`?`getX(b, in_h, in_w, in_d)`:`getX(b, in_d, in_h, in_w)`}};function UB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockSize:a,dataFormat:o}=r,s=i.shape[0],c=o===`NHWC`?i.shape[1]:i.shape[2],l=o===`NHWC`?i.shape[2]:i.shape[3],u=o===`NHWC`?i.shape[3]:i.shape[1],d=c*a,f=l*a,p=u/(a*a),m=new HB(o===`NHWC`?[s,d,f,p]:[s,p,d,f],a,o);return n.runWebGLProgram(m,[i],i.dtype)}var WB={kernelName:ht,backendName:`webgl`,kernelFunc:UB},GB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=bF(this.outputShape.length);let a=e.filterHeight,o=e.filterWidth,s=e.outChannels/e.inChannels,c=``,l=``;n&&(c=r?`float activation(float a) {
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
    `}},KB=class{constructor(e,t=!1,n=null,r=!1,i=!1){this.variableNames=[`x`,`W`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`pads`,type:`ivec2`},{name:`strides`,type:`ivec2`},{name:`dilations`,type:`ivec2`},{name:`inDims`,type:`ivec2`}],this.outputShape=e.outShape,this.enableShapeUniforms=bF(this.outputShape.length);let a=e.outChannels/e.inChannels,o=e.padInfo.left,s=e.strideWidth,c=e.dilationWidth,l=e.filterHeight,u=e.filterWidth,d=u,f=`
      int xR; int xC; int xCOffset;
      vec4 wTexel; vec4 previous; vec4 final;`;for(let e=0;e<u;e++)f+=`
          vec4 xTexelC${e*2};
          int xTexelC${e*2}Ready;
          vec4 xTexelC${e*2+1};
          int xTexelC${e*2+1}Ready;
          vec4 xC${e};`;f+=`
    for (int r = 0; r < ${l}; r++) {
      `;for(let e=0;e<u;e++)f+=`
          xTexelC${e*2} = vec4(0.0);
          xTexelC${e*2}Ready = 0;
          xTexelC${e*2+1} = vec4(0.0);
          xTexelC${e*2+1}Ready = 0;
          xC${e} = vec4(0.0);`;f+=`
        xR = xRCorner + r * dilations[0];
        if (xR >=0 && xR < inDims[0]) {
      `;for(let e=0;e<(d+1)/2;e++){let t=e*2;if(f+=`
          xC = xCCorner + ${t*c};
          `,s===1){if(t<u&&(o%2==1?(f+=`
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
              `,f+=c===1&&t>0?`
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
                  `):f+=`
                if (xC >= 0 && xC < inDims[1] && xTexelC${t}Ready == 0) {
                  xTexelC${t} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${t}.zw = vec2(0.0);
                  }
                  xTexelC${t}Ready = 1;
                }

                xC${t} = xTexelC${t};
                `,t+1<u)){let e=o%2==0?p(c):c;c%2==0&&o%2==1||c%2!=0&&o%2!=1?(f+=`
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
                  `,f+=c>1?`
                    xCOffset -= 2;
                    if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);
                     xC${t+1} = vec4(previous.zw, xTexelC${t+1}.xy);
                    } else {
                     xC${t+1} = vec4(0.0, 0.0, xTexelC${t+1}.xy);
                    }
                    `:`
                    xC${t+1} = vec4(xTexelC${t}.zw, xTexelC${t+1}.xy);
                    `):f+=e===1?`
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
                    `}}else t<u&&(o%2==1?(f+=`
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
              `,t+1<u&&(f+=`
                  final = vec4(0.0);
                  xCOffset = xC + 1 + strides[1];
                  if(xCOffset >= 0 && xCOffset < inDims[1]) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xC${t+1} = vec4(xTexelC${t+1}.xy, final.xy);
                `)):(f+=`
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
              `,t+1<u&&(f+=`
                  xC${t+1} = vec4(xTexelC${t}.zw, xTexelC${t+1}.zw);
                `)));t<u&&(f+=`
            wTexel = getW(r, ${t}, d1, q);
            dotProd += xC${t} * vec4(wTexel.xz, wTexel.xz);
          `,t+1<u&&(f+=`
              wTexel = getW(r, ${t+1}, d1, q);
              dotProd += xC${t+1} * vec4(wTexel.xz, wTexel.xz);
            `))}f+=`
    }
  `,f+=`
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

        ${f}

        vec4 result = dotProd - vec4(0.000000000000001);
        ${g}
        ${h}
        setOutput(result);
      }
    `}};function qB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c,dimRoundingMode:l}=r,u=c;u??=[1,1],g(rs(o,u),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${o} and dilations '${u}'`);let d=Go(i.shape,a.shape,o,u,s,l,!0),f;f=j().getBool(`WEBGL_PACK_DEPTHWISECONV`)&&d.strideWidth<=2&&d.outChannels/d.inChannels===1?new KB(d):new GB(d);let p=[[d.padInfo.top,d.padInfo.left],[d.strideHeight,d.strideWidth],[d.dilationHeight,d.dilationWidth],[d.inHeight,d.inWidth]];return n.runWebGLProgram(f,[i,a],`float32`,p)}var JB={kernelName:gt,backendName:`webgl`,kernelFunc:qB},YB=class{constructor(e){this.variableNames=[`x`,`dy`],this.outputShape=e.filterShape;let t=e.strideHeight,n=e.strideWidth,r=e.padInfo.top,i=e.padInfo.left,a=e.outChannels/e.inChannels;this.userCode=`
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
    `}},XB=class{constructor(e){this.variableNames=[`dy`,`W`],this.outputShape=e.inShape;let t=e.filterHeight,n=e.filterWidth,r=e.strideHeight,i=e.strideWidth,a=t-1-e.padInfo.top,o=n-1-e.padInfo.left,s=e.outChannels/e.inChannels;this.userCode=`
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
    `}};function ZB(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,dy:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,filterShape:u}=r,d=new YB(Go(i.shape,u,o,s,c,l,!0));return n.runWebGLProgram(d,[i,a],`float32`)}var QB={kernelName:_t,backendName:`webgl`,kernelFunc:ZB};function $B(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,filter:a}=t,{strides:o,dilations:s,pad:c,dimRoundingMode:l,inputShape:u}=r,d=new XB(Go(u,a.shape,o,s,c,l,!0));return n.runWebGLProgram(d,[i,a],`float32`)}var eV={kernelName:vt,backendName:`webgl`,kernelFunc:$B},tV=class{constructor(e){this.variableNames=[`X`],this.outputShape=[e,e],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `}};function nV(e){let{inputs:t,backend:n}=e,{x:r}=t,i=[...r.shape,...r.shape],a=y(r.shape),o=$({inputs:{x:r},backend:n,attrs:{shape:[a]}}),s=new tV(a),c=n.runWebGLProgram(s,[o],o.dtype),l=$({inputs:{x:c},backend:n,attrs:{shape:i}});return n.disposeIntermediateTensorInfo(o),n.disposeIntermediateTensorInfo(c),l}var rV={kernelName:yt,backendName:`webgl`,kernelFunc:nV},iV=class{constructor(e){this.variableNames=[`x`,`W`],this.outputShape=e.outShape;let{inHeight:t,inWidth:n,padInfo:r,strideHeight:i,strideWidth:a,filterHeight:o,filterWidth:s,dilationHeight:c,dilationWidth:l}=e,{top:u,left:d}=r;this.userCode=`
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
    `}};function aV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a}=t,{strides:o,pad:s,dilations:c}=r,l=Ho(i.shape,a.shape,o,s,`NHWC`,c),u,d=new iV(l);u=n.runWebGLProgram(d,[i,a],`float32`);let f=$({inputs:{x:u},backend:n,attrs:{shape:l.outShape}});return n.disposeIntermediateTensorInfo(u),f}var oV={kernelName:bt,backendName:`webgl`,kernelFunc:aV};function sV(e){let{inputs:t,backend:n,attrs:r}=e,{equation:i}=r,a=t,{allDims:o,summedDims:s,idDims:c}=yh(i,a.length);xh(o.length,c,a);let{path:l,steps:u}=Sh(s,c),d=u.length,f=null,p=o.length,m=[];for(let e=0;e<d;++e){for(let t of u[e]){let{permutationIndices:e,expandDims:r}=bh(p,c[t]),i;Ch(e)?i=a[t]:(i=_R({inputs:{x:a[t]},backend:n,attrs:{perm:e}}),m.push(i));let o=i.shape.slice();for(let e=0;e<r.length;++e)o.splice(r[e],0,1);b(i.shape,o)||(i=$({inputs:{x:i},backend:n,attrs:{shape:o}}),m.push(i)),f===null?f=i:(f=nR({inputs:{a:i,b:f},backend:n}),m.push(f))}e<d-1&&(l[e]>=0&&(f=hR({inputs:{x:f},backend:n,attrs:{axis:l[e]-(o.length-p),keepDims:!1}}),m.push(f)),p--)}for(let e of m)e!==f&&n.disposeIntermediateTensorInfo(e);return f}var cV={kernelName:Tt,backendName:`webgl`,kernelFunc:sV},lV={kernelName:`Elu`,backendName:`webgl`,kernelFunc:YL({opSnippet:`return (x >= 0.0) ? x : (exp(x) - 1.0);`,packedOpSnippet:`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`})},uV=`return (b >= 0.0) ? a : a * (b + 1.0);`,dV=`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,fV={kernelName:Et,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n}=e,{dy:r,y:i}=t,a=j().getBool(`WEBGL_PACK_BINARY_OPERATIONS`)?new FL(dV,r.shape,i.shape):new NL(uV,r.shape,i.shape);return n.runWebGLProgram(a,[r,i],r.dtype)}},pV={kernelName:Dt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a == b);`,packedOpSnippet:`
  return vec4(equal(a, b));
`,dtype:`bool`,cpuKernelImpl:aI})},mV={kernelName:`Erf`,backendName:`webgl`,kernelFunc:YL({opSnippet:`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = ${th};
  float a1 = ${nh};
  float a2 = ${rh};
  float a3 = ${ih};
  float a4 = ${ah};
  float a5 = ${oh};

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`})},hV=YL({opSnippet:JL+`
  return exp(x);
`,packedOpSnippet:`
  vec4 result = exp(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:oI,dtype:`float32`}),gV={kernelName:`Exp`,backendName:`webgl`,kernelFunc:hV};function _V(e){let{inputs:t,attrs:n,backend:r}=e,{dim:i}=n,{input:a}=t,o=a.shape.length,s=a.shape.slice(),c=i;return i<0&&(g(-(o+1)<=i,()=>`Axis must be in the interval [${-(o+1)}, ${o}]`),c=o+i+1),s.splice(c,0,1),$({inputs:{x:a},backend:r,attrs:{shape:s}})}var vV={kernelName:Ot,backendName:`webgl`,kernelFunc:_V},yV=`return exp(x) - 1.0;`,bV={kernelName:kt,backendName:`webgl`,kernelFunc:YL({opSnippet:yV,packedOpSnippet:yV,cpuKernelImpl:sI})},xV=class{constructor(e,t,n){this.variableNames=[`real`,`imag`];let r=t[1];this.outputShape=t;let i=n?`2.0 * ${Math.PI}`:`-2.0 * ${Math.PI}`,a=n?`${r}.0`:`1.0`,o;if(e===`real`)o=`return real * expR - imag * expI;`;else if(e===`imag`)o=`return real * expI + imag * expR;`;else throw Error(`FFT component must be either "real" or "imag", got ${e}.`);this.userCode=`
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
    `}};function SV(e,t,n){let r=n.texData.get(e.dataId),i=y(e.shape),a=e.shape[e.shape.length-1],o=i/a,s=$({inputs:{x:e},backend:n,attrs:{shape:[o,a]}}),c=s.shape,l=new xV(`real`,c,t),u=new xV(`imag`,c,t),d=[{dataId:r.complexTensorInfos.real.dataId,dtype:r.complexTensorInfos.real.dtype,shape:c},{dataId:r.complexTensorInfos.imag.dataId,dtype:r.complexTensorInfos.imag.dtype,shape:c}],f=n.runWebGLProgram(l,d,`float32`),p=n.runWebGLProgram(u,d,`float32`),m=RL({inputs:{real:f,imag:p},backend:n});n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p);let h=$({inputs:{x:m},backend:n,attrs:{shape:e.shape}});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(m),h}function CV(e){let{inputs:t,backend:n}=e,{input:r}=t;return SV(r,!1,n)}var wV={kernelName:`FFT`,backendName:`webgl`,kernelFunc:CV},TV=class{constructor(e,t){this.outputShape=[],this.customUniforms=[{name:`value`,type:`float`}],this.variableNames=[`x`],this.outputShape=e,this.userCode=`
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}};function EV(e){let{backend:t,attrs:n}=e,{shape:r,value:i}=n,{dtype:a}=n;if(a||=ce(i),a===`string`){let e=k(a,y(r));return e.fill(i),t.makeTensorInfo(r,a,e)}{let e=new TV(r,i),n=[[i]];return t.runWebGLProgram(e,[],a,n)}}var DV={kernelName:At,backendName:`webgl`,kernelFunc:EV},OV=class{constructor(e){this.variableNames=[`Image`],this.outputShape=[];let t=e[2];this.outputShape=e,this.userCode=`
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
    `}},kV={kernelName:jt,backendName:`webgl`,kernelFunc:({inputs:e,backend:t})=>{let{image:n}=e,r=t,i=new OV(n.shape);return r.runWebGLProgram(i,[n],n.dtype)}},AV=`return floor(x);`,jV={kernelName:Mt,backendName:`webgl`,kernelFunc:YL({opSnippet:AV,packedOpSnippet:AV,cpuKernelImpl:cI})},MV={kernelName:Nt,backendName:`webgl`,kernelFunc:XL({opSnippet:`
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
`,dtype:`int32`})},NV=class{constructor(e){this.variableNames=[`A`];let t=hP(),[n,r]=e;this.outputShape=e,this.userCode=`
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
    `}},PV=class{constructor(e){this.variableNames=[`A`],this.packedInputs=!1,this.packedOutput=!0;let t=hP(),[n,r]=e;this.outputShape=e,this.userCode=`
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
    `}},FV={kernelName:xr,backendName:`webgl`,kernelFunc:RV},IV,LV=j().getBool(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`);function RV(e){let{inputs:t,backend:n,attrs:r}=e,{pixels:i}=t,{numChannels:a}=r,o=typeof HTMLVideoElement<`u`&&i instanceof HTMLVideoElement,s=typeof HTMLImageElement<`u`&&i instanceof HTMLImageElement,[c,l]=o?[i.videoWidth,i.videoHeight]:[i.width,i.height],u=[l,c],d=[l,c,a];if(s||o){let e=j().getBool(`CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU`);(IV==null||e!==LV)&&(LV=e,IV=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:LV})),IV.canvas.width=c,IV.canvas.height=l,IV.drawImage(i,0,0,c,l),i=IV.canvas}let f=n.makeTensorInfo(u,`int32`);n.texData.get(f.dataId).usage=pN.PIXELS,n.gpgpu.uploadPixelDataToTexture(n.getTexture(f.dataId),i);let p=j().getBool(`WEBGL_PACK`)?new PV(d):new NV(d),m=n.runWebGLProgram(p,[f],`int32`);return n.disposeData(f.dataId),m}function zV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dataFormat:u,dilations:d,dimRoundingMode:f,activation:p,leakyreluAlpha:m}=r,h=as(u),g=Go(i.shape,a.shape,c,d,l,f,!1,h),_,v=[],y=o!=null,b=s!=null,x=p===`leakyrelu`,S=()=>{let e=[i,a],t=(e,t)=>{if(t===`NCHW`&&e.shape.length===1&&e.shape[0]!==1){let t=$({inputs:{x:e},backend:n,attrs:{shape:[e.shape[0],1,1]}});return v.push(t),t}return e};if(y&&e.push(t(o,u)),b&&e.push(t(s,u)),x){let t=n.makeTensorInfo([],`float32`,ti(m,`float32`));e.push(t),v.push(t)}return e};if(g.filterHeight===1&&g.filterWidth===1&&g.dilationHeight===1&&g.dilationWidth===1&&g.strideHeight===1&&g.strideWidth===1&&(g.padInfo.type===`SAME`||g.padInfo.type===`VALID`))_=cB({x:i,filter:a,convInfo:g,backend:n,bias:o,activation:p,preluActivationWeights:s,leakyreluAlpha:m});else if(g.strideWidth<=2&&h===`channelsLast`&&j().getBool(`WEBGL_EXP_CONV`)){let e=new aB(g,y,p?ZL(p,!0):null,b,x),t=[[g.padInfo.top,g.padInfo.left],[g.strideHeight,g.strideWidth],[g.dilationHeight,g.dilationWidth],[g.inHeight,g.inWidth]],r=S();_=n.runWebGLProgram(e,r,`float32`,t)}else if(j().getBool(`WEBGL_CONV_IM2COL`))_=lB({x:i,filter:a,convInfo:g,backend:n,bias:o,activation:p,preluActivationWeights:s,leakyreluAlpha:m});else{let e=new rB(g,y,p?ZL(p,!1):null,b,x),t=S();_=n.runWebGLProgram(e,t,`float32`)}let C=$({inputs:{x:_},backend:n,attrs:{shape:g.outShape}});return v.push(_),v.forEach(e=>n.disposeIntermediateTensorInfo(e)),C}var BV={kernelName:wr,backendName:`webgl`,kernelFunc:zV};function VV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,filter:a,bias:o,preluActivationWeights:s}=t,{strides:c,pad:l,dilations:u,dimRoundingMode:d,activation:f,leakyreluAlpha:p}=r,m=[],h=u;h??=[1,1],g(rs(c,h),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${c} and dilations '${h}'`);let _=Go(i.shape,a.shape,c,h,l,d,!0),v=j().getBool(`WEBGL_PACK_DEPTHWISECONV`)&&_.strideWidth<=2&&_.outChannels/_.inChannels===1,y=f?ZL(f,v):null,b=[i,a],x=o!=null,S=s!=null,C=f===`leakyrelu`;if(x&&b.push(o),S&&b.push(s),C){let e=n.makeTensorInfo([],`float32`,ti(p,`float32`));b.push(e),m.push(e)}let w;w=v?new KB(_,x,y,S,C):new GB(_,x,y,S,C);let T=[[_.padInfo.top,_.padInfo.left],[_.strideHeight,_.strideWidth],[_.dilationHeight,_.dilationWidth],[_.inHeight,_.inWidth]],E=n.runWebGLProgram(w,b,`float32`,T);return m.forEach(e=>n.disposeIntermediateTensorInfo(e)),E}var HV={kernelName:Tr,backendName:`webgl`,kernelFunc:VV},UV=class{constructor(e,t,n,r){this.sliceDim=e,this.strides=t,this.paramsShape=r,this.variableNames=[`x`,`indices`],this.outputShape=n;let i=dF(n.length),a=`
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
      `}};function WV(e){let{inputs:t,backend:n}=e,{params:r,indices:i}=t,a=i.shape,o=a[a.length-1],s=y(r.shape),[c,l,u,d]=mm(r,i),f=$({inputs:{x:i},backend:n,attrs:{shape:[l,o]}}),p=$({inputs:{x:r},backend:n,attrs:{shape:[y(r.shape)/u,u]}});if(n.shouldExecuteOnCPU([r,i])||r.dtype===`string`){let e=lI(n.readSync(i.dataId),n.bufferSync(r),r.dtype,l,o,u,d,r.shape,s);return n.makeTensorInfo(c,r.dtype,e.values)}let m=new UV(o,d,[l,u],r.shape),h=n.runWebGLProgram(m,[p,f],p.dtype),g=$({inputs:{x:h},backend:n,attrs:{shape:c}});return n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(h),g}var GV={kernelName:It,backendName:`webgl`,kernelFunc:WV},KV=class{constructor(e,t){this.variableNames=[`A`,`indices`],this.outputShape=t,this.rank=t.length;let n=dF(this.rank),r=qV(e,2);this.userCode=`
      void main() {
        ${n} resRC = getOutputCoords();
        int index = int(getIndices(resRC.x, resRC.z));
        float inBounds = (index >= 0) && (index < ${e[2]}) ? 1.0 : 0.0;
        setOutput(inBounds * getA(${r}));
      }
    `}};function qV(e,t){let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`],r=[];for(let t=0;t<e.length;t++)t===2?r.push(`index`):r.push(`${n[t]}`);return r.join()}function JV(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,indices:a}=t,{axis:o,batchDims:s}=r,c=E(o,i.shape)[0];if(j().get(`DEBUG`)){let e=n.readSync(a.dataId),t=i.shape[c];for(let n=0;n<e.length;++n){let r=e[n];g(r<=t-1&&r>=0,()=>`GatherV2: the index value ${r} is not in [0, ${t-1}]`)}}let l=Vh(i,a,c,s),u=y(a.shape),d=[],f=$({inputs:{x:i},backend:n,attrs:{shape:[l.batchSize,l.outerSize,l.dimSize,l.sliceSize]}}),p=$({inputs:{x:a},backend:n,attrs:{shape:[l.batchSize,u/l.batchSize]}});d.push(f),d.push(p);let m=[l.batchSize,l.outerSize,u/l.batchSize,l.sliceSize];if(n.shouldExecuteOnCPU([i,a])||i.dtype===`string`){let e=n.bufferSync(p),t=uI(n.bufferSync(f),e,m);return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),n.makeTensorInfo(l.outputShape,t.dtype,t.values)}let h=new KV(f.shape,m),_=n.runWebGLProgram(h,[f,p],f.dtype);d.push(_);let v=$({inputs:{x:_},backend:n,attrs:{shape:l.outputShape}});return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),v}var YV={kernelName:Ft,backendName:`webgl`,kernelFunc:JV},XV={kernelName:Lt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a > b);`,packedOpSnippet:`
  return vec4(greaterThan(a, b));
`,cpuKernelImpl:dI,dtype:`bool`})},ZV={kernelName:Rt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a >= b);`,packedOpSnippet:`
  return vec4(greaterThanEqual(a, b));
`,dtype:`bool`,cpuKernelImpl:fI})};function QV(e){let{inputs:t,backend:n}=e,{input:r}=t;return SV(r,!0,n)}var $V={kernelName:Bt,backendName:`webgl`,kernelFunc:QV},eH={kernelName:Ht,backendName:`webgl`,kernelFunc:YL({opSnippet:`return float(!isnan(x) && !isinf(x));`,dtype:`bool`})},tH={kernelName:Ut,backendName:`webgl`,kernelFunc:YL({opSnippet:`return float(isinf(x));`,dtype:`bool`})},nH={kernelName:Wt,backendName:`webgl`,kernelFunc:YL({opSnippet:`return float(isnan(x));`,dtype:`bool`})},rH={kernelName:Kt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a < b);`,packedOpSnippet:`
  return vec4(lessThan(a, b));
`,cpuKernelImpl:pI,dtype:`bool`})},iH={kernelName:qt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a <= b);`,packedOpSnippet:`
  return vec4(lessThanEqual(a, b));
`,cpuKernelImpl:mI,dtype:`bool`})};function aH(e){let{backend:t,attrs:n}=e,{start:r,stop:i,num:a}=n,o=hI(r,i,a);return t.makeTensorInfo([o.length],`float32`,o)}var oH={kernelName:Jt,backendName:`webgl`,kernelFunc:aH},sH={kernelName:`Log`,backendName:`webgl`,kernelFunc:YL({opSnippet:JL+`
  return x < 0.0 ? 0./0. : log(x);
`,packedOpSnippet:`
  vec4 result = log(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : (x.r < 0.0 ? 0./0. : result.r);
  result.g = isNaN.g ? x.g : (x.g < 0.0 ? 0./0. : result.g);
  result.b = isNaN.b ? x.b : (x.b < 0.0 ? 0./0. : result.b);
  result.a = isNaN.a ? x.a : (x.a < 0.0 ? 0./0. : result.a);
  return result;
`,cpuKernelImpl:gI})},cH={kernelName:Yt,backendName:`webgl`,kernelFunc:YL({opSnippet:JL+`
  return log(1.0 + x);
`})},lH={kernelName:Xt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a >= 1.0 && b >= 1.0);`,packedOpSnippet:`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,dtype:`bool`})},uH={kernelName:Zt,backendName:`webgl`,kernelFunc:YL({opSnippet:`return float(!(x >= 1.0));`})},dH={kernelName:Qt,backendName:`webgl`,kernelFunc:XL({opSnippet:`return float(a >= 1.0 || b >= 1.0);`,packedOpSnippet:`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,dtype:`bool`})},fH=class{constructor(e,t,n,r,i){this.variableNames=[`x`],this.outputShape=[];let a=t,o=e[3]-1;this.outputShape=e;let s,c=`float(${n}) + float(${r}) * sum`;s=i===.5?`inversesqrt(${c})`:i===1?`1.0/(${c})`:`exp(log(${c}) * float(-${i}));`,this.userCode=`
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
    `}},pH=class{constructor(e,t,n,r,i){this.variableNames=[`x`],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;let a=t,o=e[3]-1;this.outputShape=e;let s,c=`float(${n}) + float(${r}) * sum`;s=i===.5?`inversesqrt(${c})`:i===1?`1.0/(${c})`:`exp(log(${c}) * float(-${i}));`,this.userCode=`
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
    `}},mH={kernelName:`LRN`,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{depthRadius:a,bias:o,alpha:s,beta:c}=r,l=j().getBool(`WEBGL_PACK_NORMALIZATION`)?new pH(i.shape,a,o,s,c):new fH(i.shape,a,o,s,c);return n.runWebGLProgram(l,[i],i.dtype)}},hH=class{constructor(e,t,n,r,i){this.variableNames=[`inputImage`,`outputImage`,`dy`],this.outputShape=[],this.outputShape=e,this.depth=e[3],this.depthRadius=t,this.bias=n,this.alpha=r,this.beta=i,this.userCode=`
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
    `}},gH={kernelName:en,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i,y:a,dy:o}=t,{depthRadius:s,bias:c,alpha:l,beta:u}=r,d=new hH(i.shape,s,c,l,u);return n.runWebGLProgram(d,[i,a,o],i.dtype)}};function _H(e,t,n,r){let i=y(t),a=y(e.shape)/i,o=$({inputs:{x:e},attrs:{shape:[a,i]},backend:r}),s=lR(o,e.dtype,`max`,r),c=$({inputs:{x:s},attrs:{shape:n},backend:r});return r.disposeIntermediateTensorInfo(o),r.disposeIntermediateTensorInfo(s),c}function vH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reductionIndices:a,keepDims:o}=r,s=i.shape.length,c=E(a,i.shape),l=c,u=Yc(l,s),d=u!=null,f=n.shouldExecuteOnCPU([i]),p=i;if(d){if(f){let e=n.texData.get(p.dataId).values,t=Array(s);for(let e=0;e<t.length;e++)t[e]=i.shape[u[e]];let r=GI(e,i.shape,i.dtype,u,t);p=n.makeTensorInfo(t,i.dtype);let a=n.texData.get(p.dataId);a.values=r}else p=pR(i,u,n);l=Zc(l.length,s)}Jc(`max`,l,s);let[m,h]=Kc(p.shape,l),g=m;o&&(g=qc(m,c));let _;if(f){let e=n.texData.get(p.dataId).values,t=_I(e,y(h),g,i.dtype);_=n.makeTensorInfo(g,i.dtype);let r=n.texData.get(_.dataId);r.values=t}else _=_H(p,h,g,n);return d&&n.disposeIntermediateTensorInfo(p),_}var yH={kernelName:`Max`,backendName:`webgl`,kernelFunc:vH},bH={kernelName:tn,backendName:`webgl`,kernelFunc:XL({opSnippet:ML+`
  return max(a, b);
`,packedOpSnippet:`
  vec4 result = vec4(max(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+PL+`
  return result;
`,cpuKernelImpl:vI})};function xH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;mP(i,`maxPool`);let{filterSize:a,strides:o,pad:s,dimRoundingMode:c}=r;g(rs(o,1),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${o} and dilations '1'`);let l=Uo(i.shape,a,o,1,s,c);if(l.filterWidth===1&&l.filterHeight===1&&b(l.inShape,l.outShape))return IL({inputs:{x:i},backend:n});let u=new ZR(l,`max`,!1);return n.runWebGLProgram(u,[i],i.dtype)}var SH={kernelName:nn,backendName:`webgl`,kernelFunc:xH};function CH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{filterSize:a,strides:o,pad:s,dataFormat:c,dimRoundingMode:l}=r,u=new QR(Wo(i.shape,a,o,[1,1,1],s,l,c),`max`,!1);return n.runWebGLProgram(u,[i],i.dtype)}var wH={kernelName:an,backendName:`webgl`,kernelFunc:CH},TH=class{constructor(e){this.variableNames=[`dy`,`maxPos`],this.outputShape=e.inShape;let t=e.strideHeight,n=e.strideWidth,r=e.dilationHeight,i=e.effectiveFilterHeight,a=e.effectiveFilterWidth,o=i-1-e.padInfo.top,s=a-1-e.padInfo.left,c=i*a-1;this.userCode=`
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
    `}},EH=class{constructor(e){this.variableNames=[`dy`,`maxPos`],this.outputShape=e.inShape;let t=e.strideDepth,n=e.strideHeight,r=e.strideWidth,i=e.dilationDepth,a=e.dilationHeight,o=e.dilationWidth,s=e.effectiveFilterDepth,c=e.effectiveFilterHeight,l=e.effectiveFilterWidth,u=s-1-e.padInfo.front,d=c-1-e.padInfo.top,f=l-1-e.padInfo.left,p=s*c*l-1;this.userCode=`
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
    `}};function DH(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a}=t,o=a,{filterSize:s,strides:c,pad:l,dimRoundingMode:u}=r,d=Wo(o.shape,s,c,[1,1,1],l,u),f=new QR(d,`max`,!0),p=n.runWebGLProgram(f,[o],o.dtype),m=new EH(d),h=n.runWebGLProgram(m,[i,p],o.dtype);return n.disposeIntermediateTensorInfo(p),h}var OH={kernelName:on,backendName:`webgl`,kernelFunc:DH};function kH(e){let{inputs:t,backend:n,attrs:r}=e,{dy:i,input:a,output:o}=t,s=a;mP([a,o],`maxPoolGrad`);let{filterSize:c,strides:l,pad:u,dimRoundingMode:d}=r,f=Uo(s.shape,c,l,1,u,d),p=new ZR(f,`max`,!0),m=n.runWebGLProgram(p,[s],s.dtype),h=new TH(f),g=n.runWebGLProgram(h,[i,m],s.dtype);return n.disposeIntermediateTensorInfo(m),g}var AH={kernelName:rn,backendName:`webgl`,kernelFunc:kH};function jH(e,t,n,r){let i=new ZR(n,`max`,!1),a=r.runWebGLProgram(i,[e],`float32`);return i=new ZR(n,`max`,!0,!0,t),[a,r.runWebGLProgram(i,[e],`float32`)]}var MH={kernelName:sn,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{filterSize:i,strides:a,pad:o,includeBatchInIndex:s}=t,c=n;g(r.shape.length===4,()=>`Error in maxPool: input must be rank 4 but got rank ${r.shape.length}.`);let l=[1,1];g(rs(a,l),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${l}'`);let[u,d]=jH(r,s,Uo(r.shape,i,a,l,o),c);return[u,d]}};function NH(e,t,n,r){let i=y(t),a=y(e.shape)/i,o=$({inputs:{x:e},attrs:{shape:[a,i]},backend:r}),s=lR(o,`float32`,`mean`,r),c=$({inputs:{x:s},attrs:{shape:n},backend:r});return r.disposeIntermediateTensorInfo(o),r.disposeIntermediateTensorInfo(s),c}var PH={kernelName:cn,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{x:r}=e,{keepDims:i,axis:a}=t,o=n,s=r.shape.length,c=E(a,r.shape),l=c,u=Yc(l,s),d=u!=null,f=o.shouldExecuteOnCPU([r]),p=[],m=r;if(d){if(f){let e=o.texData.get(m.dataId).values,t=Array(s);for(let e=0;e<t.length;e++)t[e]=r.shape[u[e]];let n=GI(e,r.shape,r.dtype,u,t);m=o.makeTensorInfo(t,r.dtype);let i=o.texData.get(m.dataId);i.values=n}else m=pR(r,u,o);p.push(m),l=Zc(l.length,s)}Jc(`sum`,l,s);let[h,g]=Kc(m.shape,l),_=h;i&&(_=qc(h,c));let v=NH(m,g,_,o);for(let e of p)o.disposeIntermediateTensorInfo(e);return v}};function FH(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=E(a,i.shape),l=c,u=Yc(l,s),d=i;u!=null&&(d=_R({inputs:{x:i},backend:n,attrs:{perm:u}}),l=Zc(l.length,i.shape.length)),Jc(`min`,l,s);let[f,p]=Kc(d.shape,l),m=y(p),h=$({inputs:{x:d},backend:n,attrs:{shape:[-1,m]}}),g=lR(h,h.dtype,`min`,n),_;if(o){let e=qc(f,c);_=$({inputs:{x:g},backend:n,attrs:{shape:e}})}else _=$({inputs:{x:g},backend:n,attrs:{shape:f}});return n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(g),u!=null&&n.disposeIntermediateTensorInfo(d),_}var IH={kernelName:`Min`,backendName:`webgl`,kernelFunc:FH},LH={kernelName:ln,backendName:`webgl`,kernelFunc:XL({opSnippet:ML+`
  return min(a, b);
`,packedOpSnippet:`
  vec4 result = vec4(min(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+PL+`
  return result;
`,cpuKernelImpl:yI})},RH=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=dF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=[`coords[0]`,`coords[1]`,`coords[2]`,`coords[3]`].slice(0,r),c=n===`reflect`?0:1;if(r===1){this.userCode=`
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
    `}},zH=class{constructor(e,t,n){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=dF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=JI(`rc`,r),c=JI(`source`,r),l=`${s[r-1]} < ${this.outputShape[r-1]}`,u=r===1?`source`:`vec2(${c.slice(-2).join()})`,d=n===`reflect`?0:1,f=``;if(r===1){let e=`
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
    `}},BH={kernelName:un,backendName:`webgl`,kernelFunc:({inputs:e,backend:t,attrs:n})=>{let{x:r}=e,{paddings:i,mode:a}=n,o=j().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new zH(r.shape,i,a):new RH(r.shape,i,a);return t.runWebGLProgram(o,[r],r.dtype)}},VH={kernelName:`Mod`,backendName:`webgl`,kernelFunc:XL({opSnippet:`if (b == 0.0) return NAN;
  return mod(a, b);`,packedOpSnippet:`
  vec4 result = mod(a, b);
  bvec4 isNaN = equal(b, vec4(0.0));
  `+PL+`
  return result;
`})},HH=class{constructor(e,t,n){this.variableNames=[`probs`],this.customUniforms=[{name:`seed`,type:`float`}],this.outputShape=[e,n],this.userCode=`
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
    `}},UH=XL({opSnippet:`
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
`,checkOutOfBounds:!0}),WH={kernelName:wt,backendName:`webgl`,kernelFunc:UH},GH=`return a - b;`,KH=XL({opSnippet:GH,packedOpSnippet:GH,supportsComplex:!0,cpuKernelImpl:HI}),qH={kernelName:`Sub`,backendName:`webgl`,kernelFunc:KH};function JH(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{dim:a}=r,o=E([a],i.shape),s=vH({inputs:{x:i},backend:n,attrs:{reductionIndices:o,keepDims:!1}}),c=qc(s.shape,o),l=$({inputs:{x:s},backend:n,attrs:{shape:c}}),u=KH({inputs:{a:i,b:l},backend:n}),d=hV({inputs:{x:u},backend:n}),f=hR({inputs:{x:d},backend:n,attrs:{axis:o,keepDims:!1}}),p=$({inputs:{x:f},backend:n,attrs:{shape:c}}),m=UH({inputs:{a:d,b:p},backend:n});return n.disposeIntermediateTensorInfo(s),n.disposeIntermediateTensorInfo(l),n.disposeIntermediateTensorInfo(u),n.disposeIntermediateTensorInfo(d),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(p),m}var YH={kernelName:Qn,backendName:`webgl`,kernelFunc:JH};function XH(e){let{inputs:t,backend:n,attrs:r}=e,{logits:i}=t,{numSamples:a,seed:o,normalized:s}=r,c=s?i:JH({inputs:{logits:i},backend:n,attrs:{dim:i.shape.length-1}}),l=c.shape[0],u=c.shape[1],d=new HH(l,u,a),f=[[o]],p=n.runWebGLProgram(d,[c],`int32`,f);return s||n.disposeIntermediateTensorInfo(c),p}var ZH={kernelName:dn,backendName:`webgl`,kernelFunc:XH},QH=sL+`
  return -x;
`,$H=`
  vec4 result = -x;
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`;function eU(e){let{inputs:t,backend:n}=e,{x:r}=t;if(n.shouldExecuteOnCPU([r])){let[e,t]=xI(n.texData.get(r.dataId).values,r.shape,r.dtype);return n.makeTensorInfo(t,r.dtype,e)}let i;return i=j().getBool(`WEBGL_PACK_UNARY_OPERATIONS`)?new bL(r.shape,$H):new oL(r.shape,QH),n.runWebGLProgram(i,[r],r.dtype)}var tU={kernelName:`Neg`,backendName:`webgl`,kernelFunc:eU},nU=yp;function rU(e){Er(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c}=r,{selectedIndices:l}=nU(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c);return n.makeTensorInfo([l.length],`int32`,new Int32Array(l))}var iU={kernelName:mn,backendName:`webgl`,kernelFunc:rU},aU=bp;function oU(e){Er(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,padToMaxOutputSize:l}=r,{selectedIndices:u,validOutputs:d}=aU(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c,l);return[n.makeTensorInfo([u.length],`int32`,new Int32Array(u)),n.makeTensorInfo([],`int32`,new Int32Array([d]))]}var sU={kernelName:hn,backendName:`webgl`,kernelFunc:oU},cU=xp;function lU(e){Er(`tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead`);let{inputs:t,backend:n,attrs:r}=e,{boxes:i,scores:a}=t,{maxOutputSize:o,iouThreshold:s,scoreThreshold:c,softNmsSigma:l}=r,{selectedIndices:u,selectedScores:d}=cU(n.readSync(i.dataId),n.readSync(a.dataId),o,s,c,l);return[n.makeTensorInfo([u.length],`int32`,new Int32Array(u)),n.makeTensorInfo([d.length],`float32`,new Float32Array(d))]}var uU={kernelName:gn,backendName:`webgl`,kernelFunc:lU},dU=class{constructor(e,t,n,r){this.variableNames=[`indices`],this.outputShape=[e,t],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(${r}), float(${n}),
                      float(index == coords.y)));
      }
    `}},fU={kernelName:vn,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{indices:i}=t,{dtype:a,depth:o,onValue:s,offValue:c}=r,l=y(i.shape),u=new dU(l,o,s,c),d=$({inputs:{x:i},backend:n,attrs:{shape:[l]}}),f=n.runWebGLProgram(u,[d],a);n.disposeIntermediateTensorInfo(d);let p=[...i.shape,o],m=$({inputs:{x:f},backend:n,attrs:{shape:p}});return n.disposeIntermediateTensorInfo(f),m}};function pU(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`complex64`){let e=Mz({inputs:{input:r},backend:n}),t=pU({inputs:{x:e},backend:n}),i=Zz({inputs:{input:r},backend:n}),a=pU({inputs:{x:i},backend:n}),o=RL({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return EV({attrs:{shape:r.shape,dtype:r.dtype,value:r.dtype===`string`?``:0},backend:n})}var mU={kernelName:yr,backendName:`webgl`,kernelFunc:pU};function hU(e){let{inputs:t,backend:n}=e,{x:r}=t;if(r.dtype===`string`)throw Error(`onesLike is not supported under string dtype`);if(r.dtype===`complex64`){let e=Mz({inputs:{input:r},backend:n}),t=hU({inputs:{x:e},backend:n}),i=Zz({inputs:{input:r},backend:n}),a=pU({inputs:{x:i},backend:n}),o=RL({inputs:{real:t,imag:a},backend:n});return n.disposeIntermediateTensorInfo(e),n.disposeIntermediateTensorInfo(t),n.disposeIntermediateTensorInfo(i),n.disposeIntermediateTensorInfo(a),o}return EV({attrs:{shape:r.shape,dtype:r.dtype,value:1},backend:n})}var gU={kernelName:_n,backendName:`webgl`,kernelFunc:hU};function _U(e){let{inputs:t,backend:n,attrs:r}=e,{axis:i}=r;if(t.length===1)return _V({inputs:{input:t[0]},backend:n,attrs:{dim:i}});let a=t[0].shape,o=t[0].dtype;t.forEach(e=>{_(a,e.shape,`All tensors passed to stack must have matching shapes`),g(o===e.dtype,()=>`All tensors passed to stack must have matching dtypes`)});let s=[],c=tB({inputs:t.map(e=>{let t=_V({inputs:{input:e},backend:n,attrs:{dim:i}});return s.push(t),t}),backend:n,attrs:{axis:i}});return s.forEach(e=>n.disposeIntermediateTensorInfo(e)),c}var vU={kernelName:yn,backendName:`webgl`,kernelFunc:_U},yU=class{constructor(e,t,n){this.variableNames=[`x`],this.customUniforms=[{name:`value`,type:`float`}],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=dF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=[`coords[0]`,`coords[1]`,`coords[2]`,`coords[3]`].slice(0,r);if(r===1){this.userCode=`
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
    `}},bU=class{constructor(e,t,n){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:`value`,type:`float`}],this.outputShape=t.map((t,n)=>t[0]+e[n]+t[1]);let r=e.length,i=dF(r),a=t.map(e=>e[0]).join(`,`),o=t.map((t,n)=>t[0]+e[n]).join(`,`),s=JI(`rc`,r),c=JI(`source`,r),l=`${s[r-1]} < ${this.outputShape[r-1]}`,u=r===1?`source`:`vec2(${c.slice(-2).join()})`,d=[`${i} rc = outputLoc;`,`${s[r-1]} += 1;
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
    `}},xU=e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{paddings:a,constantValue:o}=r;if(y(i.shape)===0)return EV({backend:n,attrs:{shape:a.map((e,t)=>e[0]+i.shape[t]+e[1]),value:o,dtype:i.dtype}});let s=j().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new bU(i.shape,a,o):new yU(i.shape,a,o),c=[[o]];return n.runWebGLProgram(s,[i],i.dtype,c)},SU={kernelName:bn,backendName:`webgl`,kernelFunc:xU},CU={kernelName:`Pow`,backendName:`webgl`,kernelFunc:XL({opSnippet:`
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
  `+PL+`
  return result;
`})};function wU(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{axis:a,keepDims:o}=r,s=i.shape.length,c=[],l=E(a,i.shape),u=l,d=Yc(u,s),f=i;d!=null&&(f=_R({inputs:{x:i},backend:n,attrs:{perm:d}}),u=Zc(u.length,s),c.push(f)),Jc(`prod`,u,s);let p;if(n.shouldExecuteOnCPU([f])){let e=n.texData.get(f.dataId).values,{outVals:t,outShape:r,outDtype:i}=CI(f.shape,f.dtype,e,u);p=n.makeTensorInfo(r,i,t)}else{let[e,t]=Kc(f.shape,u),r=y(t),a=$({inputs:{x:f},backend:n,attrs:{shape:[-1,r]}}),o=lR(a,Li(i.dtype),`prod`,n);p=$({inputs:{x:o},backend:n,attrs:{shape:e}}),c.push(a),c.push(o)}if(o){c.push(p);let e=qc(p.shape,l);p=$({inputs:{x:p},backend:n,attrs:{shape:e}})}return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),p}var TU={kernelName:Sn,backendName:`webgl`,kernelFunc:wU};function EU(e){let{inputs:t,backend:n,attrs:r}=e,{paramsNestedSplits:i,paramsDenseValues:a,indices:o}=t,{outputRaggedRank:s}=r,c=i.map(e=>n.readSync(e.dataId)),l=i.map(e=>e.shape),u=n.readSync(a.dataId),d=n.readSync(o.dataId),[f,p,m]=wI(c,l,u,a.shape,a.dtype,d,o.shape,s),h=f.map(e=>n.makeTensorInfo([e.length],`int32`,e)),g=n.makeTensorInfo(m,a.dtype,p);return h.concat([g])}var DU={kernelName:Cn,backendName:`webgl`,kernelFunc:EU};function OU(e){let{inputs:t,backend:n}=e,{starts:r,limits:i,deltas:a}=t,o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=TI(o,r.shape,r.dtype,s,i.shape,c,a.shape);return[n.makeTensorInfo([l.length],`int32`,l),n.makeTensorInfo([u.length],r.dtype,u)]}var kU={kernelName:wn,backendName:`webgl`,kernelFunc:OU};function AU(e){let{inputs:t,backend:n,attrs:r}=e,{shape:i,values:a,defaultValue:o,rowPartitionTensors:s}=t,{rowPartitionTypes:c}=r,l=n.readSync(i.dataId),u=n.readSync(a.dataId),d=n.readSync(o.dataId),f=s.map(e=>n.readSync(e.dataId)),p=s.map(e=>e.shape),[m,h]=EI(l,i.shape,u,a.shape,a.dtype,d,o.shape,f,p,c);return n.makeTensorInfo(m,a.dtype,h)}var jU={kernelName:Tn,backendName:`webgl`,kernelFunc:AU},MU=e=>{let{backend:t,attrs:n}=e,{start:r,stop:i,step:a,dtype:o}=n,s=DI(r,i,a,o);return t.makeTensorInfo([s.length],o,s)},NU={kernelName:En,backendName:`webgl`,kernelFunc:MU},PU={kernelName:On,backendName:`webgl`,kernelFunc:YL({opSnippet:`return 1.0 / x;`})},FU={kernelName:kn,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  return (x < 0.0) ? 0.0 : x;
`,packedOpSnippet:`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`})},IU={kernelName:Fn,backendName:`webgl`,kernelFunc:YL({opSnippet:sL+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,packedOpSnippet:`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`})},LU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d;d=i?`(vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC - vec2(0.5)`:`vec2(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
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
    `}},RU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d;d=i?`(vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC - vec3(0.5)`:`vec3(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
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
    `}};function zU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r,[c,l]=s,u=j().getBool(`WEBGL_PACK_IMAGE_OPERATIONS`)?new RU(i.shape,c,l,a,o):new LU(i.shape,c,l,a,o);return n.runWebGLProgram(u,[i],`float32`)}var BU={kernelName:Nn,backendName:`webgl`,kernelFunc:zU},VU=class{constructor(e,t,n){this.variableNames=[`dy`],this.outputShape=[],this.outputShape=t;let[,r,i]=t,[,a,o]=e,s=[n&&a>1?r-1:r,n&&o>1?i-1:i],c=[n&&a>1?a-1:a,n&&o>1?o-1:o],l=s[0]/c[0],u=s[1]/c[1],d=1/l,f=1/u,p=Math.ceil(d)*2+2,m=Math.ceil(f)*2+2;this.userCode=`
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
    `}};function HU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r,s=new VU(a.shape,i.shape,o);return n.runWebGLProgram(s,[a],a.dtype)}var UU={kernelName:Pn,backendName:`webgl`,kernelFunc:HU},WU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d=r?`0.5`:`0.0`,f;f=i?`max((vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC, vec2(0.0))`:`vec2(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
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
    `}},GU=class{constructor(e,t,n,r,i){this.variableNames=[`A`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,o,s,c]=e;this.outputShape=[a,t,n,c];let l=[r&&t>1?o-1:o,r&&n>1?s-1:s],u=[r&&t>1?t-1:t,r&&n>1?n-1:n],d=r?`0.5`:`0.0`,f;f=i?`max((vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC, vec3(0.0))`:`vec3(yRC) * effectiveInputOverOutputRatioRC`,this.userCode=`
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
    `}};function KU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i}=t,{alignCorners:a,halfPixelCenters:o,size:s}=r,[c,l]=s,u=j().getBool(`WEBGL_PACK_IMAGE_OPERATIONS`)?new GU(i.shape,c,l,a,o):new WU(i.shape,c,l,a,o);return n.runWebGLProgram(u,[i],i.dtype)}var qU={kernelName:jn,backendName:`webgl`,kernelFunc:KU},JU=class{constructor(e,t,n){this.variableNames=[`dy`],this.outputShape=[],this.outputShape=t;let[,r,i]=t,[,a,o]=e,s=[n&&a>1?r-1:r,n&&o>1?i-1:i],c=[n&&a>1?a-1:a,n&&o>1?o-1:o],l=s[0]/c[0],u=s[1]/c[1],d=1/l,f=1/u,p=Math.ceil(d)*2+2,m=Math.ceil(f)*2+2;this.userCode=`
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
    `}};function YU(e){let{inputs:t,backend:n,attrs:r}=e,{images:i,dy:a}=t,{alignCorners:o}=r,s=new JU(a.shape,i.shape,o);return n.runWebGLProgram(s,[a],a.dtype)}var XU={kernelName:Mn,backendName:`webgl`,kernelFunc:YU},ZU=class{constructor(e,t){this.variableNames=[`x`];let n=e.length;if(n>4)throw Error(`WebGL backend: Reverse of rank-${n} tensor is not yet supported`);if(this.outputShape=e,n===1){this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(${e[0]} - coord - 1));
        }
      `;return}let r=n=>t.indexOf(n)!==-1&&e[n]!==1?`${e[n]} - coords[${n}] - 1`:`coords[${n}]`,i=e.map((e,t)=>r(t)).join(`,`),a=dF(n);this.userCode=`
      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${i}));
      }
    `}},QU=class{constructor(e,t){this.variableNames=[`x`],this.packedInputs=!0,this.packedOutput=!0;let n=e.length;if(n>4)throw Error(`WebGL backend: Reverse of rank-${n} tensor is not yet supported`);this.outputShape=e;let r=JI(`rc`,n),i=`${r[n-1]} + 1 < ${this.outputShape[n-1]}`,a=`${r[n-2]} + 1 < ${this.outputShape[n-2]}`,o=dF(n);this.userCode=n===1?`
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
    `;function s(e){return d(e)}function c(e){return e[n-1]=`(`+e[n-1]+` + 1)`,d(e)}function l(e){return e[n-2]=`(`+e[n-2]+` + 1)`,d(e)}function u(e){return e[n-1]=`(`+e[n-1]+` + 1)`,e[n-2]=`(`+e[n-2]+` + 1)`,d(e)}function d(t){let n=e.map((e,n)=>f(n,t));return`getChannel(getX(${n.join(`,`)}), vec2(${n.slice(-2).join(`,`)}))`}function f(n,r){return t.indexOf(n)!==-1&&e[n]!==1?`${e[n]} - ${r[n]} - 1`:`${r[n]}`}}};function $U(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{dims:a}=r,o=i.shape.length,s=E(a,i.shape);if(o===0)return IL({inputs:{x:i},backend:n});let c=j().getBool(`WEBGL_PACK_ARRAY_OPERATIONS`)?new QU(i.shape,s):new ZU(i.shape,s);return n.runWebGLProgram(c,[i],i.dtype)}var eW={kernelName:In,backendName:`webgl`,kernelFunc:$U},tW=class{constructor(e,t){this.variableNames=[`Image`],this.outputShape=[],this.customUniforms=[{name:`params`,type:`vec4`}];let n=e[1],r=e[2];this.outputShape=e;let i=``;i=typeof t==`number`?`float outputValue = ${t.toFixed(2)};`:`
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
    `}},nW={kernelName:Sr,backendName:`webgl`,kernelFunc:({inputs:e,attrs:t,backend:n})=>{let{image:r}=e,{radians:i,fillValue:a,center:o}=t,s=n,c=new tW(r.shape,a),[l,u]=qm(o,r.shape[1],r.shape[2]),d=[[l,u,Math.sin(i),Math.cos(i)]];return s.runWebGLProgram(c,[r],r.dtype,d)}},rW={kernelName:Ln,backendName:`webgl`,kernelFunc:YL({opSnippet:`
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
`})},iW={kernelName:Rn,backendName:`webgl`,kernelFunc:YL({opSnippet:`return inversesqrt(x);`,cpuKernelImpl:OI})},aW=class{constructor(e,t,n,r,i,a,o=!0,s=!1){this.variableNames=[`updates`,`indices`,`defaultValue`],this.outputShape=a;let c=dF(i.length),l=dF(a.length),u=``;n===1?u=`i`:n===2&&(u=`i, j`);let d=`getIndices(${u})`,f=``;r===1?f=`i`:r===2&&(f=`i, coords[1]`);let p=`getUpdates(${f})`,m=``;s&&(m=`coords[0], coords[1]`);let h=`getDefaultValue(${m})`,g=t>1?`strides[j]`:`strides`;this.userCode=`
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
      `}},oW=class{constructor(e,t,n,r,i,a,o=!0,s=!1){this.variableNames=[`updates`,`indices`,`defaultValue`],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=a;let c=dF(i.length),l=dF(a.length),u=``;n===1?u=`i`:n===2&&(u=`i, j`);let d=`getIndices(${u})`,f=``;r===1?f=`i`:r===2&&(f=`i, coords[1]`);let p=`getUpdates(${f})`,m=``;s&&(m=`coords[0], coords[1]`);let h=`getDefaultValue(${m})`,g=t>1?`strides[j]`:`strides`,_=t>1?`strides[j + 1]`:`strides`;this.userCode=`
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
      `}};function sW(e){let{inputs:t,backend:n,attrs:r}=e,{indices:i,updates:a}=t,{shape:o}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=wf(a,i,o),f=[d/l,l];if(d===0)return n.makeTensorInfo(o,i.dtype);let p=$({inputs:{x:i},backend:n,attrs:{shape:[c,s]}}),m=$({inputs:{x:a},backend:n,attrs:{shape:[c,l]}}),h=n.makeTensorInfo([],`float32`,new Float32Array([0])),g;g=j().getBool(`WEBGL_PACK`)?new oW(c,s,p.shape.length,m.shape.length,u,f):new aW(c,s,p.shape.length,m.shape.length,u,f);let _=n.runWebGLProgram(g,[m,p,h],m.dtype),v=$({inputs:{x:_},backend:n,attrs:{shape:o}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(_),n.disposeIntermediateTensorInfo(h),v}var cW={kernelName:zn,backendName:`webgl`,kernelFunc:sW},lW=class{constructor(e,t,n,r){this.variableNames=[`sortedSequence`,`values`],this.customUniforms=[{name:`numInputs`,type:`int`}],this.outputShape=[e,n];let i=`for (int i = 0; i < ${Math.ceil(Math.log2(t+1))}; ++i) { if (left >= right) break;`,a=j().getNumber(`WEBGL_VERSION`)===2?`while (left < right) {`:i,o=r===`left`?`<`:`<=`;this.userCode=`
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
     `}};function uW(e){let{inputs:t,backend:n,attrs:r}=e,{sortedSequence:i,values:a}=t,{side:o}=r,s=new lW(i.shape[0],i.shape[1],a.shape[1],o),c=[[i.shape[1]]];return n.runWebGLProgram(s,[i,a],`int32`,c)}var dW={kernelName:Vn,backendName:`webgl`,kernelFunc:uW},fW=class{constructor(e,t,n){this.variableNames=[`c`,`a`,`b`],this.outputShape=t;let r,i;if(n>4)throw Error(`Where for rank ${n} is not yet supported`);if(n===1)i=`resRC`,r=`resRC`;else{let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`],a=[],o=[];for(let r=0;r<t.length;r++)o.push(`${n[r]}`),r<e&&a.push(`${n[r]}`);r=a.join(),i=o.join()}let a=dF(n);this.userCode=`
      void main() {
        ${a} resRC = getOutputCoords();
        float cVal = getC(${r});
        if (cVal >= 1.0) {
          setOutput(getA(${i}));
        } else {
          setOutput(getB(${i}));
        }
      }
    `}};function pW(e){let{inputs:t,backend:n}=e,{condition:r,t:i,e:a}=t,o=new fW(r.shape.length,i.shape,i.shape.length);return n.runWebGLProgram(o,[r,i,a],Ii(i.dtype,a.dtype))}var mW={kernelName:Hn,backendName:`webgl`,kernelFunc:pW},hW={kernelName:Un,backendName:`webgl`,kernelFunc:YL({opSnippet:`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = ${$m};
  float scale = ${eh};
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`})},gW={kernelName:qn,backendName:`webgl`,kernelFunc:YL({opSnippet:JL+`
  return 1.0 / (1.0 + exp(-1.0 * x));
`,packedOpSnippet:`
  vec4 result = 1.0 / (1.0 + exp(-1.0 * x));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,cpuKernelImpl:AI})},_W={kernelName:Kn,backendName:`webgl`,kernelFunc:YL({opSnippet:`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`})},vW={kernelName:`Sin`,backendName:`webgl`,kernelFunc:YL({opSnippet:JL+`
  return sin(x);
`,packedOpSnippet:`
  vec4 result = sin(x);
  bvec4 isNaN = isnan(x);
  ${PL}
  return result;
`})},yW={kernelName:Gn,backendName:`webgl`,kernelFunc:YL({opSnippet:`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`})},bW={kernelName:Jn,backendName:`webgl`,kernelFunc:YL({opSnippet:`
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
`})},xW={kernelName:Xn,backendName:`webgl`,kernelFunc:e=>{let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{blockShape:a,paddings:o}=r;g(i.shape.length<=4,()=>`spaceToBatchND for rank > 4 with a WebGL backend not implemented yet`);let s=a.reduce((e,t)=>e*t),c=[[0,0]];c.push(...o);for(let e=1+a.length;e<i.shape.length;++e)c.push([0,0]);let l=[],u=xU({inputs:{x:i},backend:n,attrs:{paddings:c,constantValue:0}}),d=Jm(u.shape,a,s,!1),f=Ym(d.length,a.length,!1),p=Xm(u.shape,a,s,!1),m=$({inputs:{x:u},backend:n,attrs:{shape:d}}),h=_R({inputs:{x:m},backend:n,attrs:{perm:f}}),_=$({inputs:{x:h},backend:n,attrs:{shape:p}});return l.push(u),l.push(m),l.push(h),l.forEach(e=>n.disposeIntermediateTensorInfo(e)),_}};function SW(e){let{inputs:t,backend:n}=e,{indices:r,values:i,denseShape:a,defaultValue:o}=t;if(a.shape.length!==1)throw Error(`Dense shape must be a vector, saw:
         ${a.shape}`);if(r.shape.length!==2)throw Error(`Indices must be a matrix, saw:
         ${r.shape}`);if(i.shape.length!==1)throw Error(`Values must be a vector, saw:
         ${i.shape}`);if(o.shape.length!==0)throw Error(`Default value must be a scalar, saw:
        ${o.shape}`);let s=n.readSync(r.dataId),c=n.readSync(i.dataId),l=n.readSync(a.dataId),u=n.readSync(o.dataId)[0],[d,f,p,m,h]=NI(s,r.shape,r.dtype,c,i.dtype,l,u);return[n.makeTensorInfo(f,r.dtype,d),n.makeTensorInfo([f[0]],i.dtype,p),n.makeTensorInfo([m.length],`bool`,new Uint8Array(m.map(e=>Number(e)))),n.makeTensorInfo([h.length],r.dtype,new Int32Array(h))]}var CW={kernelName:$n,backendName:`webgl`,kernelFunc:SW};function wW(e){let{inputs:t,backend:n}=e,{inputIndices:r,inputShape:i,newShape:a}=t;if(r.shape.length!==2)throw Error(`Input indices should be a matrix but received shape ${r.shape}`);if(i.shape.length!==1)throw Error(`Input shape should be a vector but received shape ${i.shape}`);if(a.shape.length!==1)throw Error(`Target shape should be a vector but received shape ${a.shape}`);let o=Array.from(n.readSync(i.dataId)),s=n.readSync(r.dataId),c=Array.from(n.readSync(a.dataId)),[l,u,d]=PI(s,r.shape,r.dtype,o,c);return[n.makeTensorInfo(u,r.dtype,l),n.makeTensorInfo([d.length],a.dtype,new Int32Array(d))]}var TW={kernelName:er,backendName:`webgl`,kernelFunc:wW};function EW(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
              ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
              ${a.shape}`);let o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=FI(o,r.shape,r.dtype,s,c,!0);return n.makeTensorInfo(u,r.dtype,l)}var DW={kernelName:tr,backendName:`webgl`,kernelFunc:EW};function OW(e){let{inputs:t,backend:n}=e,{data:r,indices:i,segmentIds:a}=t;if(r.shape.length<1)throw Error(`Data should be at least 1 dimensional but received scalar`);if(i.shape.length!==1)throw Error(`Indices should be a vector but received shape
             ${i.shape}`);if(a.shape.length!==1)throw Error(`Segment ids should be a vector but received shape
             ${a.shape}`);let o=n.readSync(r.dataId),s=n.readSync(i.dataId),c=n.readSync(a.dataId),[l,u]=FI(o,r.shape,r.dtype,s,c);return n.makeTensorInfo(u,r.dtype,l)}var kW={kernelName:nr,backendName:`webgl`,kernelFunc:OW};function AW(e){let{inputs:t,backend:n,attrs:r}=e,{sparseIndices:i,sparseValues:a,defaultValue:o}=t,{outputShape:s}=r,{sliceRank:c,numUpdates:l,sliceSize:u,strides:d,outputSize:f}=wf(a,i,s);if(a.dtype===`string`){let e=kI(n.bufferSync(i),n.bufferSync(a),s,f,u,l,c,d,oi(n.readSync(o.dataId)[0]),!1);return n.makeTensorInfo(s,e.dtype,e.values)}let p=new aW(l,c,i.shape.length,a.shape.length,d,[f,1],!1),m=n.runWebGLProgram(p,[a,i,o],a.dtype),h=$({inputs:{x:m},backend:n,attrs:{shape:s}});return n.disposeIntermediateTensorInfo(m),h}var jW={kernelName:rr,backendName:`webgl`,kernelFunc:AW};function MW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{numOrSizeSplits:a,axis:o}=r,s=E(o,i.shape)[0],c=Th(i,a,s),l=i.shape.length,u=Array(l).fill(0),d=i.shape.slice();return c.map(e=>{let t=[...d];t[s]=e;let r=yz({inputs:{x:i},backend:n,attrs:{begin:u,size:t}});return u[s]+=e,r})}var NW={kernelName:Zn,backendName:`webgl`,kernelFunc:MW},PW=`return sqrt(x);`,FW={kernelName:Yn,backendName:`webgl`,kernelFunc:YL({opSnippet:PW,packedOpSnippet:PW,cpuKernelImpl:II})},IW={kernelName:ar,backendName:`webgl`,kernelFunc:YL({opSnippet:`return x * x;`})},LW=`return (a - b) * (a - b);`,RW={kernelName:ir,backendName:`webgl`,kernelFunc:XL({opSnippet:LW,packedOpSnippet:LW})};function zW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t;if(i.dtype!==`string`)throw Error(`Input must be of datatype string`);let a=LI(Uh(n.readSync(i.dataId)),`string`,r);return n.makeTensorInfo(i.shape,`string`,a)}var BW={kernelName:or,backendName:`webgl`,kernelFunc:zW};function VW({inputs:e,attrs:t,backend:n}){let{x:r}=e,i=sL+`
    return x > 0.0 ? 1.0 : float(${t.alpha});
  `,a=new oL(r.shape,i);return n.runWebGLProgram(a,[r],r.dtype)}var HW={kernelName:br,backendName:`webgl`,kernelFunc:VW},UW=class{constructor(e,t,n){this.variableNames=[`x`],this.outputShape=n;let r=n.length,i=dF(n.length),a=dF(n.length),o=``;if(r===1)o=`coords * strides + begin`;else{let e=0;o=n.map((t,r)=>(e++,n.length===1?`coords * strides[${r}] + begin[${r}]`:`coords[${e-1}] * strides[${r}] + begin[${r}]`)).join(`,`)}this.userCode=`
      ${i} begin = ${i}(${e});
      ${i} strides = ${i}(${t});

      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${o}));
      }
    `}};function WW(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{begin:a,end:o,strides:s,beginMask:c,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:f}=r,{finalShapeSparse:p,finalShape:m,isIdentity:h,sliceDim0:_,isSimpleSlice:v,begin:y,end:b,strides:x}=Nm(i.shape,a,o,s,c,l,u,d,f),S;if(h)S=$({inputs:{x:i},backend:n,attrs:{shape:m}});else if(_||v){g(i.shape.length>=1,()=>`Input must have rank at least 1, got: ${i.shape.length}`);let e=bm(y,b,x),t=yz({inputs:{x:i},backend:n,attrs:{begin:y,size:e}});S=$({inputs:{x:t},backend:n,attrs:{shape:m}}),n.disposeIntermediateTensorInfo(t)}else if(n.shouldExecuteOnCPU([i])){let e=n.readSync(i.dataId),t=RI(p,so(i.shape,i.dtype,e),x,y);S=n.makeTensorInfo(m,i.dtype,t.values)}else{let e=new UW(y,x,p);S=n.runWebGLProgram(e,[i],i.dtype)}let C=$({inputs:{x:S},backend:n,attrs:{shape:m}});return n.disposeIntermediateTensorInfo(S),C}var GW={kernelName:sr,backendName:`webgl`,kernelFunc:WW};function KW(e){let{inputs:t,backend:n,attrs:r}=e,{separator:i,nGramWidths:a,leftPad:o,rightPad:s,padWidth:c,preserveShortSequences:l}=r,{data:u,dataSplits:d}=t,[f,p]=zI(n.readSync(u.dataId),n.readSync(d.dataId),i,a,o,s,c,l);return[n.makeTensorInfo([f.length],`string`,f),n.makeTensorInfo(d.shape,`int32`,p)]}var qW={kernelName:cr,backendName:`webgl`,kernelFunc:KW};function JW(e){let{inputs:t,backend:n,attrs:r}=e,{skipEmpty:i}=r,{input:a,delimiter:o}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(a.shape.length!==1)throw Error(`Input must be a vector, got shape: ${a.shape}`);if(o.shape.length!==0)throw Error(`Delimiter must be a scalar, got shape: ${o.shape}`);let s=n.readSync(a.dataId),c=n.readSync(o.dataId)[0],[l,u,d]=BI(s,c,i),f=u.length;return[n.makeTensorInfo([f,2],`int32`,l),n.makeTensorInfo([f],`string`,u),n.makeTensorInfo([2],`int32`,new Int32Array(d))]}var YW={kernelName:lr,backendName:`webgl`,kernelFunc:JW};function XW(e){let{inputs:t,backend:n,attrs:r}=e,{numBuckets:i}=r,{input:a}=t;if(a.dtype!==`string`)throw Error(`Input must be of datatype string`);if(i<=0)throw Error(`Number of buckets must be at least 1`);let o=VI(n.readSync(a.dataId),i);return n.makeTensorInfo(a.shape,`int32`,o)}var ZW={kernelName:ur,backendName:`webgl`,kernelFunc:XW},QW={kernelName:`Tan`,backendName:`webgl`,kernelFunc:YL({opSnippet:`return tan(x);`})},$W={kernelName:dr,backendName:`webgl`,kernelFunc:YL({opSnippet:`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`})};function eG(e){let{inputs:t,backend:n,attrs:r}=e,{tensor:i,indices:a,updates:o}=t,{}=r,{sliceRank:s,numUpdates:c,sliceSize:l,strides:u,outputSize:d}=wf(o,a,i.shape),f=[d/l,l];if(d===0)return n.makeTensorInfo(i.shape,a.dtype);let p=$({inputs:{x:a},backend:n,attrs:{shape:[c,s]}}),m=$({inputs:{x:o},backend:n,attrs:{shape:[c,l]}}),h=$({inputs:{x:i},backend:n,attrs:{shape:f}}),g=new aW(c,s,p.shape.length,m.shape.length,u,f,!1,!0),_=n.runWebGLProgram(g,[m,p,h],h.dtype),v=$({inputs:{x:_},backend:n,attrs:{shape:i.shape}});return n.disposeIntermediateTensorInfo(p),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(h),n.disposeIntermediateTensorInfo(_),v}var tG={kernelName:Bn,backendName:`webgl`,kernelFunc:eG},nG=class{constructor(e,t){this.variableNames=[`A`];let n=Array(e.length);for(let r=0;r<n.length;r++)n[r]=e[r]*t[r];this.outputShape=n,this.rank=n.length;let r=dF(this.rank),i=rG(e);this.userCode=`
      void main() {
        ${r} resRC = getOutputCoords();
        setOutput(getA(${i}));
      }
    `}};function rG(e){let t=e.length;if(t>5)throw Error(`Tile for rank ${t} is not yet supported`);if(t===1)return`imod(resRC, ${e[0]})`;let n=[`resRC.x`,`resRC.y`,`resRC.z`,`resRC.w`,`resRC.u`],r=[];for(let t=0;t<e.length;t++)r.push(`imod(${n[t]}, ${e[t]})`);return r.join()}function iG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{reps:a}=r;if(i.dtype===`string`||i.shape.length>5){let e=n.readSync(i.dataId),t=i.dtype===`string`?e.map(e=>oi(e)):e,r=UI(so(i.shape,i.dtype,t),a);return n.makeTensorInfo(r.shape,r.dtype,r.values)}let o=new nG(i.shape,a);return n.runWebGLProgram(o,[i],i.dtype)}var aG={kernelName:fr,backendName:`webgl`,kernelFunc:iG},oG=class{constructor(e){this.variableNames=[`x`,`indices`],this.customUniforms=[{name:`n`,type:`int`},{name:`firstPass`,type:`int`},{name:`negativeInf`,type:`float`},{name:`dir`,type:`int`},{name:`inc`,type:`int`}],this.outputShape=e,this.userCode=`
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
     `}},sG=class{constructor(e){this.variableNames=[`x`,`indices`],this.customUniforms=[{name:`n`,type:`int`},{name:`firstPass`,type:`int`},{name:`k`,type:`int`}],this.outputShape=e,this.userCode=`
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
     `}};function cG(e,t){t!==null&&e.disposeIntermediateTensorInfo(t)}function lG(e){let t=1;for(;t<e;)t*=2;return t}function uG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i}=t,{k:a,sorted:o}=r,s=j().getNumber(`TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD`),c=j().getNumber(`TOPK_K_CPU_HANDOFF_THRESHOLD`),l=i.shape,u=l[l.length-1];if(n.shouldExecuteOnCPU([i])||u<s||a>c){let[e,t]=WI(n.readSync(i.dataId),l,i.dtype,a,o);return[n.makeTensorInfo(e.shape,e.dtype,e.values),n.makeTensorInfo(t.shape,t.dtype,t.values)]}if(a===0)return l[l.length-1]=0,[n.makeTensorInfo(l,i.dtype,[]),n.makeTensorInfo(l,`int32`,[])];if(u===1)return[i,EV({attrs:{shape:l,dtype:`int32`,value:0},backend:n})];let d=n.texData.get(i.dataId),f=d!==null&&d.isPacked,p=f?n.unpackTensor(i):i,m=y(l)/u,h=$({inputs:{x:p},attrs:{shape:[m,u]},backend:n});f&&cG(n,p);let g=lG(a),_=lG(u),v=null,b=()=>v===null?[h,h]:[h,v],x=(e,t,r)=>{let i=b(),a=new oG(r),o=[[u],[+(v===null)],[-1/0],[e],[t]],s=v;v=n.runWebGLProgram(a,i,`int32`,o),cG(n,s)};for(let e=1;e<g;e*=2){let t=e*2;for(let n=e;n>=1;n/=2)x(t,n,[m,_])}for(let e=_;e>g;e/=2){let t=b(),r=new sG([m,e/2]),i=[[u],[+(v===null)],[g]],a=v;v=n.runWebGLProgram(r,t,`int32`,i),cG(n,a);let o=g/2,s=o*2;for(let e=o;e>=1;e/=2)x(s,e,v.shape)}let S=v;v=yz({inputs:{x:v},backend:n,attrs:{begin:0,size:[m,a]}}),cG(n,S);let C=JV({inputs:{x:h,indices:v},backend:n,attrs:{axis:1,batchDims:1}});cG(n,h);let w=l.slice(0,-1);w.push(a),S=v,v=$({inputs:{x:v},attrs:{shape:w},backend:n}),cG(n,S);let T=C;return C=$({inputs:{x:C},attrs:{shape:w},backend:n}),cG(n,T),[C,v]}var dG={kernelName:pr,backendName:`webgl`,kernelFunc:uG},fG=class{constructor(e,t,n,r,i,a){this.variableNames=[`Image`,`Transforms`],this.outputShape=a;let o=n===`nearest`?1:2,s;switch(r){case`constant`:s=1;break;case`reflect`:s=2;break;case`wrap`:s=3;break;case`nearest`:s=4;break;default:s=1}this.userCode=`
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
        `}};function pG(e){let{inputs:t,backend:n,attrs:r}=e,{image:i,transforms:a}=t,{interpolation:o,fillMode:s,fillValue:c,outputShape:l}=r,[u,d,f,p]=i.shape,[m,h]=l??[d,f],g=new fG(d,f,o,s,c,[u,m,h,p]);return n.runWebGLProgram(g,[i,a],`float32`)}var mG={kernelName:mr,backendName:`webgl`,kernelFunc:pG};function hG(e){let{inputs:t,attrs:n,backend:r}=e,{axis:i}=n,{x:a}=t;mP(a,`unique`),console.warn(`WARNING: `,`UI might be locked temporarily as data is being downloaded`);let{outputValues:o,outputShape:s,indices:c}=KI(r.readSync(a.dataId),i,a.shape,a.dtype);return[r.makeTensorInfo(s,a.dtype,o),r.makeTensorInfo([c.length],`int32`,c)]}var gG={kernelName:gr,backendName:`webgl`,kernelFunc:hG};function _G(e){let{inputs:t,backend:n,attrs:r}=e,{value:i}=t,{axis:a}=r;a<0&&(a+=i.shape.length);let o=i,s=o.shape.length,c=i.shape[a],l=Array(s-1),u=0;for(let e=0;e<s;e++)e!==a&&(l[u++]=o.shape[e]);let d=[],f=Array(s).fill(0),p=o.shape.slice();p[a]=1;let m=Array(c);for(let e=0;e<m.length;e++){f[a]=e;let t=yz({inputs:{x:o},backend:n,attrs:{begin:f,size:p}}),r=$({inputs:{x:t},backend:n,attrs:{shape:l}});m[e]=r,d.push(t)}return d.forEach(e=>n.disposeIntermediateTensorInfo(e)),m}var vG={kernelName:_r,backendName:`webgl`,kernelFunc:_G},yG=class{constructor(e,t){this.variableNames=[`x`,`segmentIds`];let n=e.windowSize,r=e.batchSize,i=e.inSize,a=e.numSegments,o=a*Math.ceil(i/n);this.outputShape=[r,o];let s=Math.floor(n/4)*4,c=n%4,l=`
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
    `}};function bG(e){let{inputs:t,backend:n,attrs:r}=e,{x:i,segmentIds:a}=t,{numSegments:o}=r,s=i.shape.length,c=[],l=0,u=Yc([l],s),d=i;u!=null&&(d=_R({inputs:{x:i},backend:n,attrs:{perm:u}}),c.push(d),l=Zc(1,s)[0]);let f=Bh(d.shape,l,o),p=y([d.shape[l]]),m=$({inputs:{x:d},backend:n,attrs:{shape:[-1,p]}});c.push(m);let h=Li(i.dtype),g=(e,t,r,i,a)=>{let o=e.shape[0],s=e.shape[1],l=zh(s,a),u=new yG({windowSize:l,inSize:s,batchSize:o,numSegments:a},t),d=n.compileAndRun(u,[e,r],i);if(c.push(d),d.shape[1]===a)return d;let f=MU({backend:n,attrs:{start:0,stop:a,step:1,dtype:`float32`}}),p=iG({inputs:{x:f},backend:n,attrs:{reps:[s/l]}});return c.push(f),c.push(p),g(d,t,p,i,a)},_=$({inputs:{x:g(m,`unsortedSegmentSum`,a,h,o)},backend:n,attrs:{shape:f}}),v=_;if(u!=null){c.push(_);let e=Xc(u);v=_R({inputs:{x:v},backend:n,attrs:{perm:e}})}return c.forEach(e=>n.disposeIntermediateTensorInfo(e)),v}var xG=[xR,wR,TR,ER,OR,MR,PR,IR,UR,GR,KR,qR,JR,YR,XR,ez,nz,oz,cz,uz,pz,xz,Cz,Dz,kz,Lz,zz,Uz,zL,qz,nB,dB,_B,bB,SB,wB,EB,DB,OB,AB,LB,zB,VB,WB,JB,QB,eV,rV,oV,cV,lV,fV,pV,mV,gV,vV,bV,wV,DV,kV,jV,MV,FV,BV,HV,GV,YV,XV,ZV,LL,$V,Qz,eH,tH,nH,UL,rH,iH,oH,sH,cH,lH,uH,dH,mH,gH,yH,bH,SH,wH,OH,AH,MH,PH,IH,LH,BH,VH,ZH,rR,tU,iU,sU,uU,jz,fU,gU,vU,SU,CU,qL,TU,DU,kU,jU,NU,Nz,WH,PU,FU,IU,aR,BU,UU,qU,XU,eW,nW,rW,iW,cW,dW,mW,hW,gW,_W,vW,yW,bz,YH,bW,xW,CW,TW,DW,kW,jW,NW,FW,IW,RW,BW,HW,GW,qW,YW,ZW,qH,gR,QW,$W,tG,aG,dG,mG,vR,gG,vG,{kernelName:vr,backendName:`webgl`,kernelFunc:bG},mU];for(let e of xG)Nr(e);var SG=[{sigma:.55,points:[[-1,0],[-.5,-.866025],[.5,-.866025],[1,-0],[.5,.866025],[-.5,.866025]]},{sigma:.475,points:[[0,.930969],[-.806243,.465485],[-.806243,-.465485],[-0,-.930969],[.806243,-.465485],[.806243,.465485]]},{sigma:.4,points:[[.847306,-0],[.423653,.733789],[-.423653,.733789],[-.847306,0],[-.423653,-.733789],[.423653,-.733789]]},{sigma:.325,points:[[-0,-.741094],[.641806,-.370547],[.641806,.370547],[0,.741094],[-.641806,.370547],[-.641806,-.370547]]},{sigma:.25,points:[[-.595502,0],[-.297751,-.51572],[.297751,-.51572],[.595502,-0],[.297751,.51572],[-.297751,.51572]]},{sigma:.175,points:[[0,.362783],[-.314179,.181391],[-.314179,-.181391],[-0,-.362783],[.314179,-.181391],[.314179,.181391]]},{sigma:.1,points:[[0,0]]}],CG=[];for(let e=0;e<SG.length;e++){let t=SG[e].sigma;for(let n=0;n<SG[e].points.length;n++){let r=SG[e].points[n];CG.push([t,r[0],r[1]])}}var wG={};function TG(e){let t=e.shape[1],n=e.shape[0],r=`w`+t+`h`+n;return wG.hasOwnProperty(r)||(wG[r]=[{variableNames:[`p`],outputShape:[n,t],userCode:`
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
      `}]),wG[r]}var EG={kernelName:`BinomialFilter`,backendName:`webgl`,kernelFunc:e=>{let t=e.inputs.image,n=e.backend,[r,i]=TG(t),a=n.runWebGLProgram(r,[t],t.dtype),o=n.runWebGLProgram(i,[a],t.dtype);return n.disposeIntermediateTensorInfo(a),o}},DG=7,OG=9,kG=25/4,AG={};function jG(e){let t=e.shape[1],n=e.shape[0],r=`w`+t+`h`+n;return AG.hasOwnProperty(r)||(AG[r]={variableNames:[`image0`,`image1`,`image2`],outputShape:[n,t],userCode:`
        void main() {
          ivec2 coords = getOutputCoords();
    
          int y = coords[0];
          int x = coords[1];
    
          float value = getImage1(y, x);
    
          // Step 1: find local maxima/minima
          if (value * value < ${OG}.) {
            setOutput(0.);
            return;
          }
          if (y < ${DG} || y > ${n-1-DG}) {
            setOutput(0.);
            return;
          }
          if (x < ${DG} || x > ${t-1-DG}) {
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
    
          if (abs(edgeScore) >= ${kG} ) {
            setOutput(0.);
            return;
          }
          setOutput(getImage1(y,x));
        }
      `}),AG[r]}var MG={kernelName:`BuildExtremas`,backendName:`webgl`,kernelFunc:e=>{let{image0:t,image1:n,image2:r}=e.inputs,i=e.backend,a=jG(n);return t=pa().runKernel(`DownsampleBilinear`,{image:t}),r=pa().runKernel(`UpsampleBilinear`,{image:r,targetImage:n}),i.runWebGLProgram(a,[t,n,r],n.dtype)}},NG=36,PG={};function FG(e){let t=e.shape[0];return PG.hasOwnProperty(t)||(PG[t]={variableNames:[`histogram`],outputShape:[e.shape[0]],userCode:`
            void main() {
                int featureIndex = getOutputCoords();

                int maxIndex = 0;
                for (int i = 1; i < ${NG}; i++) {
                    if (getHistogram(featureIndex, i) > getHistogram(featureIndex, maxIndex)) {
                        maxIndex = i;
                    }
                }

                int prev = imod(maxIndex - 1 + ${NG}, ${NG});
                int next = imod(maxIndex + 1, ${NG});

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

                float an = 2.0 *${Math.PI} * (fbin + 0.5) / ${NG}. - ${Math.PI};
                setOutput(an);
            }
            `}),PG[t]}var IG={kernelName:`ComputeExtremaAngles`,backendName:`webgl`,kernelFunc:e=>{let{histograms:t}=e.inputs,n=e.backend,r=FG(t);return n.runWebGLProgram(r,[t],t.dtype)}},LG=7,RG={};function zG(e,t){let n=`${e}|${t.shape[0]}`;if(!RG.hasOwnProperty(n)){let r=[];for(let t=1;t<e;t++)r.push(`image`+t);let i=`float getPixel(int octave, int y, int x) {`;for(let t=1;t<e;t++)i+=`
  if (octave == ${t}) {
	return getImage${t}(y, x);
  }
`;i+=`}`,RG[n]={variableNames:[...r,`extrema`,`angles`,`freakPoints`],outputShape:[t.shape[0],CG.length],userCode:`
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
	float cos = ${LG}. * cos(inputAngle);
	float sin = ${LG}. * sin(inputAngle);

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
`}}return RG[n]}var BG={kernelName:`ComputeExtremaFreak`,backendName:`webgl`,kernelFunc:e=>{let{gaussianImagesT:t,prunedExtremas:n,prunedExtremasAngles:r,freakPointsT:i,pyramidImagesLength:a}=e.inputs,o=e.backend,s=zG(a,n);return o.runWebGLProgram(s,[...t,n,r,i],`float32`)}},VG=(CG.length-1)*CG.length/2,HG=Math.ceil(VG/8),UG={};function WG(e){let t=`${e.shape[0]}`;return UG.hasOwnProperty(t)||(UG[t]={variableNames:[`freak`,`p`],outputShape:[e.shape[0],HG],userCode:`
  void main() {
    ivec2 coords = getOutputCoords();
    int featureIndex = coords[0];
    int descIndex = coords[1] * 8;

    int sum = 0;
    for (int i = 0; i < 8; i++) {
      if (descIndex + i >= ${VG}) {
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
`}),UG[t]}var GG={kernelName:`ComputeFreakDescriptors`,backendName:`webgl`,kernelFunc:e=>{let{extremaFreaks:t,positionT:n}=e.inputs,{backend:r}=e,i=WG(t);return r.runWebGLProgram(i,[t,n],`int32`)}},KG={};function qG(e,t){let n=`${e}|${t}`;if(!KG.hasOwnProperty(n)){let r=[],i=`float getPixel(int octave, int y, int x) {`;for(let t=1;t<e;t++)r.push(`image`+t),i+=`
				if (octave == ${t}) {
					return getImage${t}(y, x);
				}
			`;i+=`}`,KG[n]={variableNames:[...r,`extrema`],outputShape:[t,3,3],userCode:`
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
			`}}return KG[n]}var JG={kernelName:`ComputeLocalization`,backendName:`webgl`,kernelFunc:e=>{let{prunedExtremasList:t,dogPyramidImagesT:n}=e.inputs,r=e.backend,i=qG(n.length,t.length),a=ua(t,[t.length,t[0].length],`int32`);return r.runWebGLProgram(i,[...n.slice(1),a],n[0].dtype)}},YG=.159154943091895,XG=36,ZG={};function QG(e,t,n){let r=`${n}|${e.shape[0]}|${t.shape[0]}`;if(!ZG.hasOwnProperty(r)){let i=[];for(let e=1;e<n;e++)i.push(`image`+e);let a=`float getPixel(int octave, int y, int x) {`;for(let e=1;e<n;e++)a+=`
            if (octave == ${e}) {
                return getImage${e}(y, x);
            }
            `;a+=`}`,ZG[r]=[{variableNames:[...i,`extrema`,`radial`],outputShape:[e.shape[0],t.shape[0],2],userCode:`
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
                    float fbin = angle * ${XG}. * ${YG};
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

                `},{variableNames:[`fbinMag`],outputShape:[e.shape[0],XG],userCode:`
            void main() {
                ivec2 coords = getOutputCoords();
                int featureIndex = coords[0];
                int binIndex = coords[1];

                float sum = 0.;
                for (int i = 0; i < ${t.shape[0]}; i++) {
                    float fbin = getFbinMag(featureIndex, i, 0);
                    int bin = int(floor(fbin - 0.5));
                    int b1 = imod(bin + ${XG}, ${XG});
                    int b2 = imod(bin + 1 + ${XG}, ${XG});

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
            `}]}return ZG[r]}var $G={kernelName:`ComputeOrientationHistograms`,backendName:`webgl`,kernelFunc:e=>{let{gaussianImagesT:t,prunedExtremasT:n,radialPropertiesT:r,pyramidImagesLength:i}=e.inputs,a=e.backend,[o,s]=QG(n,r,i),c=a.runWebGLProgram(o,[...t,n,r],r.dtype),l=a.runWebGLProgram(s,[c],r.dtype);return a.disposeIntermediateTensorInfo(c),l}},eK={};function tK(e){let t=e.shape[1],n=e.shape[0],r=`w`+t+`h`+n;return eK.hasOwnProperty(r)||(eK[r]={variableNames:[`p`],outputShape:[Math.floor(n/2),Math.floor(t/2)],userCode:`
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
            `}),eK[r]}var nK={kernelName:`DownsampleBilinear`,backendName:`webgl`,kernelFunc:e=>{let t=e.inputs.image,n=e.backend,r=tK(t);return n.runWebGLProgram(r,[t],t.dtype)}},rK={kernelName:`ExtremaReduction`,backendName:`webgl`,kernelFunc:e=>{let{extremasResultT:t}=e.inputs,n=e.backend,r=t.shape[0],i=t.shape[1],a={variableNames:[`extrema`],outputShape:[Math.floor(r/2),Math.floor(i/2)],userCode:`
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
		`};return n.runWebGLProgram(a,[t],t.dtype)}},iK=36,aK=5,oK={};function sK(e){let t=`h${e.shape[0]}`;return oK.hasOwnProperty(t)||(oK[t]={variableNames:[`histogram`],outputShape:[e.shape[0],iK],userCode:`
            void main() {
                ivec2 coords = getOutputCoords();

                int featureIndex = coords[0];
                int binIndex = coords[1];

                int prevBin = imod(binIndex - 1 + ${iK}, ${iK});
                int nextBin = imod(binIndex + 1, ${iK});
                float result = 0.274068619061197 * getHistogram(featureIndex, prevBin) + 0.451862761877606 * getHistogram(featureIndex, binIndex) + 0.274068619061197 * getHistogram(featureIndex, nextBin);

                setOutput(result);
            }
            `}),oK[t]}var cK={kernelName:`SmoothHistograms`,backendName:`webgl`,kernelFunc:e=>{let{histograms:t}=e.inputs,n=e.backend,r=sK(t);for(let e=0;e<aK;e++){let i=t;t=n.runWebGLProgram(r,[t],t.dtype),e>0&&n.disposeIntermediateTensorInfo(i)}return t}},lK={};function uK(e,t){let n=t.shape[1],r=t.shape[0],i=`w`+n+`h`+r;return lK.hasOwnProperty(i)||(lK[i]={variableNames:[`p`],outputShape:[r,n],userCode:`
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
            `}),lK[i]}Nr(EG),Nr(MG),Nr(IG),Nr(BG),Nr(GG),Nr(JG),Nr($G),Nr(nK),Nr(rK),Nr(cK),Nr({kernelName:`UpsampleBilinear`,backendName:`webgl`,kernelFunc:e=>{let{image:t,targetImage:n}=e.inputs,r=e.backend,i=uK(t,n);return r.runWebGLProgram(i,[t],t.dtype)}});var dK=8,fK=5,pK=10,mK=5,hK=3,gK=1.5,_K=(CG.length-1)*CG.length/2,vK=class{constructor(e,t,n=!1){this.debugMode=n,this.width=e,this.height=t;let r=0;for(;e>=dK&&t>=dK&&(e/=2,t/=2,r++,r!==fK););this.numOctaves=r,this.tensorCaches={},this.kernelCaches={}}detectImageData(e){let t=new Uint8ClampedArray(4*e.length);for(let n=0;n<e.length;n++)t[4*n]=e[n],t[4*n+1]=e[n],t[4*n+2]=e[n],t[4*n+3]=255;let n=new ImageData(t,this.width,this.height);return this.detect(n)}detect(e){let t=null,n=[];for(let t=0;t<this.numOctaves;t++){let r,i;r=t===0?this._applyFilter(e):this._downsampleBilinear(n[t-1][n[t-1].length-1]),i=this._applyFilter(r),n.push([r,i])}let r=[];for(let e=0;e<this.numOctaves;e++){let t=this._differenceImageBinomial(n[e][0],n[e][1]);r.push(t)}let i=[];for(let e=1;e<this.numOctaves-1;e++){let t=this._buildExtremas(r[e-1],r[e],r[e+1]);i.push(t)}let a=this._applyPrune(i),o=this._computeLocalization(a,r),s=this._computeOrientationHistograms(o,n),c=this._smoothHistograms(s),l=this._computeExtremaAngles(c),u=this._computeExtremaFreak(n,o,l),d=this._computeFreakDescriptors(u),f=o.arraySync(),p=l.arraySync(),m=d.arraySync();this.debugMode&&(t={pyramidImages:n.map(e=>e.map(e=>e.arraySync())),dogPyramidImages:r.map(e=>e?e.arraySync():null),extremasResults:i.map(e=>e.arraySync()),extremaAngles:l.arraySync(),prunedExtremas:a,localizedExtremas:o.arraySync()}),n.forEach(e=>e.forEach(e=>e.dispose())),r.forEach(e=>e&&e.dispose()),i.forEach(e=>e.dispose()),o.dispose(),s.dispose(),c.dispose(),l.dispose(),u.dispose(),d.dispose();let h=[];for(let e=0;e<f.length;e++){if(f[e][0]==0)continue;let t=[];for(let n=0;n<m[e].length;n+=4){let r=m[e][n],i=m[e][n+1],a=m[e][n+2],o=m[e][n+3],s=r*16777216+i*65536+a*256+o;t.push(s)}let n=f[e][1],r=f[e][2],i=f[e][3]*2**n+2**(n-1)-.5,a=r*2**n+2**(n-1)-.5,o=2**n;h.push({maxima:f[e][0]>0,x:i,y:a,scale:o,angle:p[e],descriptors:t})}return{featurePoints:h,debugExtra:t}}_computeFreakDescriptors(e){if(!this.tensorCaches.computeFreakDescriptors){let t=[],n=[];for(let r=0;r<e.shape[1];r++)for(let i=r+1;i<e.shape[1];i++)t.push(r),n.push(i);let r=ua(t,[t.length]).cast(`int32`),i=ua(n,[n.length]).cast(`int32`);this.tensorCaches.computeFreakDescriptors={positionT:ha(pf([r,i],1))}}let{positionT:t}=this.tensorCaches.computeFreakDescriptors;return Math.ceil(_K/8),I(()=>pa().runKernel(`ComputeFreakDescriptors`,{extremaFreaks:e,positionT:t}))}_computeExtremaFreak(e,t,n){this.tensorCaches._computeExtremaFreak||I(()=>{let e=ua(CG);this.tensorCaches._computeExtremaFreak={freakPointsT:ha(e)}});let{freakPointsT:r}=this.tensorCaches._computeExtremaFreak,i=[];for(let t=1;t<e.length;t++)i.push(e[t][1]);return I(()=>pa().runKernel(`ComputeExtremaFreak`,{gaussianImagesT:i,prunedExtremas:t,prunedExtremasAngles:n,freakPointsT:r,pyramidImagesLength:e.length}))}_computeExtremaAngles(e){return I(()=>pa().runKernel(`ComputeExtremaAngles`,{histograms:e}))}_computeOrientationHistograms(e,t){let n=[];for(let e=1;e<t.length;e++)n.push(t[e][1]);this.tensorCaches.orientationHistograms||I(()=>{let e=hK*gK,t=Math.ceil(e),n=[];for(let r=-5;r<=t;r++)for(let i=-5;i<=t;i++){let t=i*i+r*r;if(t<=e*e){let e=t*-.05555555555555555,a=(720+e*(720+e*(360+e*(120+e*(30+e*(6+e))))))*.0013888888;n.push([r,i,a])}}this.tensorCaches.orientationHistograms={radialPropertiesT:ha(ua(n,[n.length,3]))}});let{radialPropertiesT:r}=this.tensorCaches.orientationHistograms;return I(()=>pa().runKernel(`ComputeOrientationHistograms`,{gaussianImagesT:n,prunedExtremasT:e,radialPropertiesT:r,pyramidImagesLength:t.length}))}_smoothHistograms(e){return I(()=>pa().runKernel(`SmoothHistograms`,{histograms:e}))}_computeLocalization(e,t){return I(()=>{let n=pa().runKernel(`ComputeLocalization`,{prunedExtremasList:e,dogPyramidImagesT:t}).arraySync(),r=[];for(let e=0;e<n.length;e++){r.push([]);for(let t=0;t<n[e].length;t++)r[e].push([])}let i=[];for(let t=0;t<e.length;t++)i[t]=[e[t][0],e[t][1],e[t][2],e[t][3]];for(let e=0;e<i.length;e++){if(i[e][0]===0)continue;let t=n[e],r=.5*(t[1][2]-t[1][0]),a=.5*(t[2][1]-t[0][1]),o=t[1][2]+t[1][0]-2*t[1][1],s=t[2][1]+t[0][1]-2*t[1][1],c=.25*(t[0][0]+t[2][2]-t[0][2]-t[2][0]),l=o*s-c*c,u=(s*-r+-c*-a)/l,d=(-c*-r+o*-a)/l,f=i[e][2]+d,p=i[e][3]+u;Math.abs(l)<1e-4||(i[e][2]=f,i[e][3]=p)}return ua(i,[i.length,i[0].length],`float32`)})}_applyPrune(e){let t=mK,n=[],r=[];for(let e=0;e<100;e++){r.push([]),n.push([]);for(let i=0;i<t;i++)r[e].push([0,0,0,0]),n[e].push(0)}I(()=>{for(let i=0;i<e.length;i++){let a=pa().runKernel(`ExtremaReduction`,{extremasResultT:e[i]}),o=i+1,s=a.arraySync(),c=a.shape[0],l=a.shape[1],u=l*2/pK,d=c*2/pK;for(let e=0;e<c;e++)for(let i=0;i<l;i++){let a=s[e][i];if(a==0)continue;let c=a%1e3,l=Math.floor(Math.abs(a)/1e3),f=i*2+ +(l===2||l===3),p=e*2+ +(l===1||l===3),m=Math.floor(f/u),h=Math.floor(p/d)*pK+m,g=Math.abs(c),_=t;for(;_>=1&&g>n[h][_-1];)--_;if(_<t){for(let e=4;e>=_+1;e--)n[h][e]=n[h][e-1],r[h][e][0]=r[h][e-1][0],r[h][e][1]=r[h][e-1][1],r[h][e][2]=r[h][e-1][2],r[h][e][3]=r[h][e-1][3];n[h][_]=g,r[h][_][0]=c,r[h][_][1]=o,r[h][_][2]=p,r[h][_][3]=f}}}});let i=[];for(let e=0;e<100;e++)for(let n=0;n<t;n++)i.push(r[e][n]);return i}_buildExtremas(e,t,n){return I(()=>pa().runKernel(`BuildExtremas`,{image0:e,image1:t,image2:n}))}_differenceImageBinomial(e,t){return I(()=>e.sub(t))}_applyFilter(e){return I(()=>pa().runKernel(`BinomialFilter`,{image:e}))}_downsampleBilinear(e){return I(()=>pa().runKernel(`DownsampleBilinear`,{image:e}))}_compileAndRun(e,t){let n=_a().compileAndRun(e,t);return pa().makeTensorFromDataId(n.dataId,n.shape,n.dtype)}_runWebGLProgram(e,t,n){let r=_a().runWebGLProgram(e,t,n);return pa().makeTensorFromDataId(r.dataId,r.shape,r.dtype)}},yK=({image:e,ratio:t})=>{let n=Math.round(e.width*t),r=Math.round(e.height*t),i=new Uint8Array(n*r);for(let a=0;a<n;a++){let o=Math.round(1*a/t),s=Math.round(1*(a+1)/t)-1;s>=e.width&&(s=e.width-1);for(let c=0;c<r;c++){let r=Math.round(1*c/t),l=Math.round(1*(c+1)/t)-1;l>=e.height&&(l=e.height-1);let u=0,d=0;for(let t=o;t<=s;t++)for(let n=r;n<=l;n++)u+=1*e.data[n*e.width+t],d+=1;i[c*n+a]=Math.floor(u/d)}}return{data:i,width:n,height:r}},bK=100,xK=e=>{let t=bK/Math.min(e.width,e.height),n=[],r=t;for(;;)if(n.push(r),r*=2**(1/3),r>=.95){r=1;break}n.push(r),n.reverse();let i=[];for(let t=0;t<n.length;t++)e.width*n[t],e.height*n[t],i.push(Object.assign(yK({image:e,ratio:n[t]}),{scale:n[t]}));return i},SK=e=>{let t=Math.min(e.width,e.height),n=[],r=[];n.push(256/t),n.push(128/t);for(let t=0;t<n.length;t++)r.push(Object.assign(yK({image:e,ratio:n[t]}),{scale:n[t]}));return r},CK=e=>{let{v1:t,v2:n}=e,r=0;for(let e=0;e<t.length;e++){let i=(t[e]^n[e])>>>0;r+=wK(i)}return r},wK=e=>{var t=e-(e>>1&1431655765);return t=(t>>2&858993459)+(t&858993459),t=(t>>4)+t&252645135,t=(t>>8)+t&16711935,t=(t>>16)+t&65535,t},TK=1234,EK=()=>({seed:TK,arrayShuffle(e){let{arr:t,sampleSize:n}=e;for(let e=0;e<n;e++){this.seed=(214013*this.seed+2531011)%(1<<31);let n=this.seed>>16&32767;n%=t.length;let r=t[e];t[e]=t[n],t[n]=r}},nextInt(e){this.seed=(214013*this.seed+2531011)%(1<<31);let t=this.seed>>16&32767;return t%=e,t}}),DK=16,OK=128,kK=8,AK=e=>{let{points:t,pointIndexes:n,randomizer:r}=e,i=[];for(let e=0;e<n.length;e++)i.push(e);let a=2**53-1,o=-1,s=[];for(let e=0;e<OK;e++){r.arrayShuffle({arr:i,sampleSize:kK});let c=0,l=[];for(let e=0;e<n.length;e++){let r=2**53-1;for(let a=0;a<kK;a++){let o=n[i[a]],s=CK({v1:t[n[e]].descriptors,v2:t[o].descriptors});s<r&&(l[e]=i[a],r=s)}c+=r}s.push(l),c<a&&(a=c,o=e)}return s[o]},jK=({points:e})=>{let t=[];for(let n=0;n<e.length;n++)t.push(n);return{rootNode:MK({points:e,pointIndexes:t,centerPointIndex:null,randomizer:EK()})}},MK=e=>{let{points:t,pointIndexes:n,centerPointIndex:r,randomizer:i}=e,a=!1;(n.length<=kK||n.length<=DK)&&(a=!0);let o={};if(!a){let e=AK({points:t,pointIndexes:n,randomizer:i});for(let t=0;t<e.length;t++)o[n[e[t]]]===void 0&&(o[n[e[t]]]=[]),o[n[e[t]]].push(n[t])}Object.keys(o).length===1&&(a=!0);let s={centerPointIndex:r};if(a){s.leaf=!0,s.pointIndexes=[];for(let e=0;e<n.length;e++)s.pointIndexes.push(n[e]);return s}return s.leaf=!1,s.children=[],Object.keys(o).forEach(e=>{s.children.push(MK({points:t,pointIndexes:o[e],centerPointIndex:e,randomizer:i}))}),s},NK=2,PK=class{constructor(){this.data=null}compileImageTargets(e,t){return new Promise(async(n,r)=>{let i=[];for(let t=0;t<e.length;t++){let n=e[t],r=this.createProcessCanvas(n).getContext(`2d`);r.drawImage(n,0,0,n.width,n.height);let a=r.getImageData(0,0,n.width,n.height),o=new Uint8Array(n.width*n.height);for(let e=0;e<o.length;e++){let t=e*4;o[e]=Math.floor((a.data[t]+a.data[t+1]+a.data[t+2])/3)}let s={data:o,height:n.height,width:n.width};i.push(s)}let a=50/i.length,o=0;this.data=[];for(let e=0;e<i.length;e++){let n=i[e],r=xK(n),s=a/r.length,c=await FK(r,()=>{o+=s,t(o)});this.data.push({targetImage:n,imageList:r,matchingData:c})}for(let e=0;e<i.length;e++){let t=SK(i[e]);this.data[e].trackingImageList=t}let s=await this.compileTrack({progressCallback:t,targetImages:i,basePercent:50});for(let e=0;e<i.length;e++)this.data[e].trackingData=s[e];n(this.data)})}exportData(){let e=[];for(let t=0;t<this.data.length;t++)e.push({targetImage:{width:this.data[t].targetImage.width,height:this.data[t].targetImage.height},trackingData:this.data[t].trackingData,matchingData:this.data[t].matchingData});return i({v:NK,dataList:e})}importData(e){let t=r(new Uint8Array(e));if(!t.v||t.v!==NK)return console.error(`Your compiled .mind might be outdated. Please recompile`),[];let{dataList:n}=t;this.data=[];for(let e=0;e<n.length;e++)this.data.push({targetImage:n[e].targetImage,trackingData:n[e].trackingData,matchingData:n[e].matchingData});return this.data}createProcessCanvas(e){console.warn(`missing createProcessCanvas implementation`)}compileTrack({progressCallback:e,targetImages:t,basePercent:n}){console.warn(`missing compileTrack implementation`)}},FK=async(e,t)=>{let n=[];for(let r=0;r<e.length;r++){let i=e[r],a=new vK(i.width,i.height);await Rm(),I(()=>{let e=ua(i.data,[i.data.length],`float32`).reshape([i.height,i.width]),{featurePoints:o}=a.detect(e),s=o.filter(e=>e.maxima),c=o.filter(e=>!e.maxima),l=jK({points:s}),u=jK({points:c});n.push({maximaPoints:s,minimaPoints:c,maximaPointsCluster:l,minimaPointsCluster:u,width:i.width,height:i.height,scale:i.scale}),t(r)})}return n},IK="(function(){var e=class{constructor(e,t,n){this.cumsum=[];for(let e=0;e<n;e++){this.cumsum.push([]);for(let n=0;n<t;n++)this.cumsum[e].push(0)}this.cumsum[0][0]=e[0];for(let n=1;n<t;n++)this.cumsum[0][n]=this.cumsum[0][n-1]+e[n];for(let r=1;r<n;r++)this.cumsum[r][0]=this.cumsum[r-1][0]+e[r*t];for(let r=1;r<n;r++)for(let n=1;n<t;n++)this.cumsum[r][n]=e[r*t+n]+this.cumsum[r-1][n]+this.cumsum[r][n-1]-this.cumsum[r-1][n-1]}query(e,t,n,r){let i=this.cumsum[r][n];return t>0&&(i-=this.cumsum[t-1][n]),e>0&&(i-=this.cumsum[r][e-1]),e>0&&t>0&&(i+=this.cumsum[t-1][e-1]),i}};let t=.95,n=n=>{let{data:o,width:s,height:c,scale:l}=n,u=[s*c];for(let e=0;e<u.length;e++)u[e]=!1;let d=new Float32Array(o.length);for(let e=0;e<s;e++)d[e]=-1,d[s*(c-1)+e]=-1;for(let e=0;e<c;e++)d[e*s]=-1,d[e*s+s-1]=-1;for(let e=1;e<s-1;e++)for(let t=1;t<c-1;t++){let n=e+s*t,r=0,i=0;for(let e=-1;e<=1;e++)r+=o[n+s*e+1]-o[n+s*e-1],i+=o[n+s+e]-o[n-s+e];r/=768,i/=768,d[n]=Math.sqrt((r*r+i*i)/2)}let f=new Uint32Array(1e3);for(let e=0;e<1e3;e++)f[e]=0;let p=[-1,1,-s,s],m=0;for(let e=1;e<s-1;e++)for(let t=1;t<c-1;t++){let n=e+s*t,r=!0;for(let e=0;e<p.length;e++)if(d[n]<=d[n+p[e]]){r=!1;break}if(r){let e=Math.floor(d[n]*1e3);e>999&&(e=999),e<0&&(e=0),f[e]+=1,m+=1,u[n]=!0}}let h=.02*s*c,g=999,_=0;for(;g>=0&&(_+=f[g],!(_>h));)g--;for(let e=0;e<u.length;e++)u[e]&&d[e]*1e3<g&&(u[e]=!1);let v=[];for(let e=0;e<o.length;e++)v[e]=o[e]*o[e];let y=new e(o,s,c),b=new e(v,s,c),x=new Float32Array(o.length);for(let e=0;e<s;e++)for(let r=0;r<c;r++){let o=r*s+e;if(!u[o]){x[o]=1;continue}let c=i({image:n,cx:e,cy:r,sdThresh:5,imageDataCumsum:y,imageDataSqrCumsum:b});if(c===null){x[o]=1;continue}let l=-1;for(let i=-10;i<=10;i++){for(let o=-10;o<=10;o++){if(o*o+i*i<=4)continue;let s=a({image:n,cx:e+o,cy:r+i,vlen:c,tx:e,ty:r,imageDataCumsum:y,imageDataSqrCumsum:b});if(s!==null&&s>l&&(l=s,l>t))break}if(l>t)break}x[o]=l}return r({image:n,featureMap:x,templateSize:6,searchSize:2,occSize:16,maxSimThresh:.9,minSimThresh:.2,sdThresh:8,imageDataCumsum:y,imageDataSqrCumsum:b})},r=e=>{let{image:t,featureMap:n,templateSize:r,searchSize:o,occSize:s,maxSimThresh:c,minSimThresh:l,sdThresh:u,imageDataCumsum:d,imageDataSqrCumsum:f}=e,{data:p,width:m,height:h,scale:g}=t;s=Math.floor(Math.min(t.width,t.height)/10);let _=(r*2+1)*3,v=Math.floor(m/_),y=Math.floor(h/_),b=Math.floor(m/s)*Math.floor(h/s)+v*y,x=[],S=new Float32Array(p.length);for(let e=0;e<S.length;e++)S[e]=n[e];let C=0;for(;C<b;){let e=c,n=-1,p=-1;for(let t=0;t<h;t++)for(let r=0;r<m;r++)S[t*m+r]<e&&(e=S[t*m+r],n=r,p=t);if(n===-1)break;let g=i({image:t,cx:n,cy:p,sdThresh:0,imageDataCumsum:d,imageDataSqrCumsum:f});if(g===null){S[p*m+n]=1;continue}if(g/(r*2+1)<u){S[p*m+n]=1;continue}let _=1,v=-1;for(let r=-o;r<=o;r++){for(let i=-o;i<=o;i++){if(i*i+r*r>o*o||i===0&&r===0)continue;let s=a({image:t,vlen:g,cx:n+i,cy:p+r,tx:n,ty:p,imageDataCumsum:d,imageDataSqrCumsum:f});if(s!==null&&(s<_&&(_=s,_<l&&_<e)||s>v&&(v=s,v>.99)))break}if(_<l&&_<e||v>.99)break}if(_<l&&_<e||v>.99){S[p*m+n]=1;continue}x.push({x:n,y:p}),C+=1;for(let e=-s;e<=s;e++)for(let t=-s;t<=s;t++)p+e<0||p+e>=h||n+t<0||n+t>=m||(S[(p+e)*m+(n+t)]=1)}return x},i=({image:e,cx:t,cy:n,sdThresh:r,imageDataCumsum:i,imageDataSqrCumsum:a})=>{if(t-6<0||t+6>=e.width||n-6<0||n+6>=e.height)return null;let o=i.query(t-6,n-6,t+6,n+6);o/=169;let s=a.query(t-6,n-6,t+6,n+6);return s-=2*o*i.query(t-6,n-6,t+6,n+6),s+=169*o*o,s/169<r*r?null:(s=Math.sqrt(s),s)},a=e=>{let{image:t,cx:n,cy:r,vlen:i,tx:a,ty:o,imageDataCumsum:s,imageDataSqrCumsum:c}=e,{data:l,width:u,height:d}=t;if(n-6<0||n+6>=u||r-6<0||r+6>=d)return null;let f=s.query(n-6,r-6,n+6,r+6),p=c.query(n-6,r-6,n+6,r+6),m=0,h=(r-6)*u+(n-6),g=(o-6)*u+(a-6),_=u-13;for(let e=0;e<13;e++){for(let e=0;e<13;e++)m+=l[h]*l[g],h+=1,g+=1;h+=_,g+=_}let v=s.query(a-6,o-6,a+6,o+6);v/=169,m-=v*f;let y=p-f*f/169;return y==0?null:(y=Math.sqrt(y),1*m/(i*y))},o=(e,t)=>{let r=[];for(let i=0;i<e.length;i++){let a=e[i],o=n(a),s={data:a.data,scale:a.scale,width:a.width,height:a.height,points:o};r.push(s),t(i)}return r},s=({image:e,ratio:t})=>{let n=Math.round(e.width*t),r=Math.round(e.height*t),i=new Uint8Array(n*r);for(let a=0;a<n;a++){let o=Math.round(1*a/t),s=Math.round(1*(a+1)/t)-1;s>=e.width&&(s=e.width-1);for(let c=0;c<r;c++){let r=Math.round(1*c/t),l=Math.round(1*(c+1)/t)-1;l>=e.height&&(l=e.height-1);let u=0,d=0;for(let t=o;t<=s;t++)for(let n=r;n<=l;n++)u+=1*e.data[n*e.width+t],d+=1;i[c*n+a]=Math.floor(u/d)}}return{data:i,width:n,height:r}},c=e=>{let t=Math.min(e.width,e.height),n=[],r=[];n.push(256/t),n.push(128/t);for(let t=0;t<n.length;t++)r.push(Object.assign(s({image:e,ratio:n[t]}),{scale:n[t]}));return r};onmessage=e=>{let{data:t}=e;if(t.type===`compile`){let{targetImages:e}=t,n=100/e.length,r=0,i=[];for(let t=0;t<e.length;t++){let a=e[t],s=c(a),l=n/s.length,u=o(s,e=>{r+=l,postMessage({type:`progress`,percent:r})});i.push(u)}postMessage({type:`compileDone`,list:i})}}})();",LK=typeof self<`u`&&self.Blob&&new Blob([`(self.URL || self.webkitURL).revokeObjectURL(self.location.href);`,IK],{type:`text/javascript;charset=utf-8`});function RK(e){let t;try{if(t=LK&&(self.URL||self.webkitURL).createObjectURL(LK),!t)throw``;let n=new Worker(t,{name:e?.name});return n.addEventListener(`error`,()=>{(self.URL||self.webkitURL).revokeObjectURL(t)}),n}catch{return new Worker(`data:text/javascript;charset=utf-8,`+encodeURIComponent(IK),{name:e?.name})}}var zK=class extends PK{createProcessCanvas(e){let t=document.createElement(`canvas`);return t.width=e.width,t.height=e.height,t}compileTrack({progressCallback:e,targetImages:t,basePercent:n}){return new Promise((r,i)=>{let a=new RK;a.onmessage=t=>{t.data.type===`progress`?e(n+t.data.percent*n/100):t.data.type===`compileDone`&&r(t.data.list)},a.postMessage({type:`compile`,targetImages:t})})}};export{zK as Compiler};