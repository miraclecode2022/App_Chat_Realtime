
const socket = io()

// Elements
const formChat = document.querySelector('form')
const textChat = document.querySelector('#text')
const buttonChat = document.querySelector('#send')
const buttonLocation = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username , room} = Qs.parse(location.search,{ ignoreQueryPrefix : true}) // ignoreQueryfix : true để bỏ dấu ? trước kí tự search
// hàm này dùng để parse nội dung search local thành object {name : 'long',room : 'vietnam'}

const autoScroll = () => {
    // set new messages element
    const newMessages = messages.lastElementChild

    // Height of the new element
    const newMessagesStyle = getComputedStyle(newMessages) // get style mặc định của máy
    const newMessagesMargin = parseInt(newMessagesStyle.marginBottom) // marginbottom mặc định là 16
    const newMessagesHeight = newMessages.offsetHeight + newMessagesMargin

    // visible heigght
    const visibleHeight = newMessages.offsetHeight // chiều cao hiện tại

    // Height off messages container
    const containerHeight = newMessages.scrollHeight

    // How far have i scrolled ?
    const scrollOffset = messages.scrollTop + visibleHeight

    // console.log('Chiều cao container : ' + containerHeight);
    // console.log('Chiều cao của tin nhắn mới : ' + newMessagesHeight);
    // console.log('chiều cao đã scroll : ' +scrollOffset);

    // console.log(newMessages.scrollTop);
    // console.log(newMessages.scrollHeight);

    if(containerHeight - newMessagesHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    }) // hàm này render html trong thẻ script
    messages.insertAdjacentHTML('beforeend', html) // insert html lấy đc vào thẻ div trc khi div end ( là ở giữa )
    autoScroll()
})

socket.on('shareLocation', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username : url.username,
        url : url.urlLocation,
        createdAt : moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

formChat.addEventListener('submit', (e) => {
    e.preventDefault()

    // disabled nút button khi gửi tin nhắn
    buttonChat.setAttribute('disabled', 'disabled')

    const message = textChat.value

    socket.emit('sendMessage', message, (error) => {
        // enable
        buttonChat.removeAttribute('disabled')
        textChat.value = ''
        textChat.focus()

        if(error){
            return console.log(error);
        }

        console.log('The message was delivert')
    })
})

buttonLocation.addEventListener('click', (e) => {
    e.preventDefault()

    buttonLocation.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){
        alert('geolocation is not supported on your browser')
    }

    // hàm này cho phép lấy latitude và longitude vị trí của bạn
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        socket.emit('sendLocation', latitude,longitude, (callback) => {

            buttonLocation.removeAttribute('disabled')

            console.log(callback);
        })
    })
})

socket.emit('join', {username,room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})


