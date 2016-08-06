define([], function () {
    return ['orderObjectBy', function () {

        function getObject(fields, parent) {
            var retrieved = parent;
            angular.forEach(fields, function (field) {
                retrieved = retrieved[field];
            });

            return retrieved;
        }

        return function (items, field, reverse) {
            var filtered = [];
            var fields = field.split('.');
            var first, second;
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                first = getObject(fields, a);
                second = getObject(fields, b);
                return (first > second ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    }];
})


