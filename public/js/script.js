Handlebars.registerHelper('fullName', function(name) {
    return name.first + ' ' + name.last;
});

var data = {
    headers : [ 'Name', 'Occupation', 'Twitter' ],
    records : [ {
        name: {
            first: "Wil",
            last: "Wheaton"
        },
        occupation: "Actor, writer, blogger, voice actor",
        twitter: "WilW"
    }, {
        name: {
            first: "Patrick",
            last: "Stewart"
        },
        occupation: "Actor, voice actor",
        twitter: "SirPatStew"
    }, {
        name: {
            first: "Ian",
            last: "McKellen"
        },
        occupation: "Actor",
        twitter: "IanMcKellen"
    } ]
};

function sortIterativeCustom(p1, p2) {
    var fields = [ 'last', 'first' ], res = 0, i = 0;
    while (res === 0 && i <= fields.length) {
        res = comparatorHelper(p1, p2, fields[i++], 'name');
    }
    return res;
}
function sortRecursiveCustom(p1, p2) {
    return doSort([ 'last', 'first' ], p1, p2, 'name', 0);
}

//data.records.sort(sortIterativeCustom);
//data.records.sort(sortRecursiveCustom);
//data.records.sort(sortIterative([ 'last', 'first' ], 'name'));
data.records.sort(sortRecursive([ 'last', 'first' ], 'name'));

$(function() {
    var source = $("#table-template").html();
    var template = Handlebars.compile(source);

    $('body').append(template(data));
});
