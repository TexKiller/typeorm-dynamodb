"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAnnotations = void 0;
const removeSpaces = (text) => {
    let inside = 0;
    const s = text.replace(/\n/g, '');
    // eslint-disable-next-line no-return-assign
    return s.replace(/ +|"/g, (m) => m === '"' ? (inside ^= 1, '"') : inside ? m : '');
};
const parseAnnotations = (file, ...names) => {
    const pipeSeparatedNames = names.length > 1 ? `${names.join('|')}` : names[0];
    const regex = new RegExp(`@${pipeSeparatedNames}\\((.*?)\\)`, 'g');
    const fileWithoutSpaces = removeSpaces(file);
    const matches = fileWithoutSpaces.matchAll(regex);
    // TODO: determine which annotations are ids
    let annotations = Array.from(matches, (x, index) => {
        const annotation = x[0];
        if (annotation === '@Id') {
            return `name=@Id,index=${index}`;
        }
        else {
            return x[1];
        }
    });
    annotations = annotations.map(annotation => {
        // eslint-disable-next-line no-eval
        return eval('(' + annotation + ')');
    });
    return annotations.filter(annotation => {
        return annotation.name !== '@Id';
    });
};
exports.parseAnnotations = parseAnnotations;
