let shuffle = function (array) {
    let index = -1
    let length = array.length
    let lastIndex = length - 1

    while (++index < length) {
        let rand = index + Math.floor( Math.random() * (lastIndex - index + 1))
        let value = array[rand];
        array[rand] = array[index];
        array[index] = value;
    }
}
