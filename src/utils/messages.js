const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

const generateLocationMessage = (username,urlLocation) => {
    return {
        username,
        urlLocation,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage, generateLocationMessage
}