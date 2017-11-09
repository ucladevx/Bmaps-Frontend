function comparatorHelper(a, b, property, root) {
    a = a[root] || a || {}; b = b[root] || b || {};
    if (a[property] < b[property]) return -1;
    else if (a[property] > b[property]) return 1;
    else return 0;
}

function doSort(fields, p1, p2, root, res) {
    return res === 0 && fields.length > 0 ? doSort(fields.slice(1), p1, p2, root, comparatorHelper(p1, p2, fields[0], root)) : res;
}

function sortIterative(fields, root) {
    return function(p1, p2) {
        var res = 0, i = 0;
        while (res === 0 && i <= fields.length) {
            res = comparatorHelper(p1, p2, fields[i++], root);
        }
        return res;
    };
}

function sortRecursive(fields, root) {
    return function(p1, p2) {
        return doSort(fields, p1, p2, root, 0);
    };
}
