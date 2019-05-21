export function deepMerge(target: any, source: any) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object') {
                Object.assign(target, deepMerge(target[key], source[key]));
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}
