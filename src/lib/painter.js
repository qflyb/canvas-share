import calc from './calc';
import Pen, {penCache, clearPenCache} from './pen';


function initParsePx(REG, origin, screenK, scale, baseSize) {
    const results = new RegExp(REG).exec(origin);
    if (!origin || !results) {
        console.error(`The size: ${origin} is illegal`);
        return 0;
    }
    const unit = results[2];
    const value = parseFloat(origin);

    let res = 0;
    if (unit === 'rpx') {
        res = Math.round(value * (screenK || 0.5) * (scale || 1));
    } else if (unit === 'px') {
        res = Math.round(value * (scale || 1));
    } else if (unit === '%') {
        res = Math.round((value * baseSize) / 100);
    }
    return res;
}

let parsePx

function setStringPrototype(screenK, scale) {
    /* eslint-disable no-extend-native */
    /**
     * string 到对应的 px
     * @param {Number} baseSize 当设置了 % 号时，设置的基准值
     */
    String.prototype.toPx = function toPx(_, baseSize) {
        if (this === '0') {
            return 0;
        }
        const REG = /-?[0-9]+(\.[0-9]+)?(rpx|px|%)/;

        parsePx = origin => {
            return initParsePx(REG, origin, screenK, scale, baseSize);
        };

        const formula = /^calc\((.+)\)$/.exec(this);
        if (formula && formula[1]) {
            // 进行 calc 计算
            const afterOne = formula[1].replace(/([^\s\(\+\-\*\/]+)\.(left|right|bottom|top|width|height)/g, word => {
                const [id, attr] = word.split('.');
                return penCache.viewRect[id][attr];
            });
            const afterTwo = afterOne.replace(new RegExp(REG, 'g'), parsePx);
            return calc(afterTwo);
        } else {
            return parsePx(this);
        }
    };
}


export {setStringPrototype, parsePx as toPx, initInjection, penCache, clearPenCache, Pen}
