
const messageInput = document.querySelector('.message-input')
const sendBtn = document.querySelector('#send-btn')
const userMessage = document.querySelector('.user-message')
const chatBody = document.querySelector('.chat-body')

const emojiBtn = document.querySelector('.emoji')

const fileInput = document.querySelector('#file-input')
const attachFile = document.querySelector('#file-upload')
const fileUploadWrapper = document.querySelector('.file-upload-wrapper')
const fileCancelBtn = document.querySelector('#file-cancel')
const chatbotTogglerBtn = document.querySelector('#chatbot-toggler')
const downArrowBtn = document.querySelector('.down-arrow')
const chatForm = document.querySelector('.chat-form')

const API_KEY = "AIzaSyAF3I6SvpugB83GyblPlglPN2OigZeqZJM"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}
const chatHistory = []
const initialInputHeight = messageInput.scrollHeight
const appendFunction = (content, ...classes) => {
    const div = document.createElement('div')
    div.classList.add('message', ...classes)
    div.innerHTML = content
    return div
}

const generateBotResponse = async (incominguserOutput) => {
    const messageElement = incominguserOutput.querySelector('.message-text')
    chatHistory.push({
        role: 'user',
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
    })
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: chatHistory
        })
    }
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json()
        if (!response.ok) throw new Error(data.error.message)
        console.log(data)
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim()
        messageElement.innerText = apiResponseText

        chatHistory.push({
            role: 'model',
            parts: [{ text: userData.message }]
        })
    } catch (error) {
        console.log(error)
        messageElement.innerText = error.message
        messageElement.style.color = '#ff0000'
    } finally {
        userData.file = {}
        incominguserOutput.classList.remove('thinking')
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
    }
}



const createMeassage = (e) => {
    e.preventDefault()
    userData.message = messageInput.value.trim()
    messageInput.value = ""
    fileUploadWrapper.classList.remove('file-uploaded')
    messageInput.dispatchEvent(new Event('input'))

    const userMessgediv = `<div class="message-text"></div> ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}`

    const userOutput = appendFunction(userMessgediv, "user-message")
    userOutput.querySelector('.message-text').textContent = userData.message
    // console.log(userOutput)
    chatBody.append(userOutput)
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        const userMessgediv = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50"
                    viewBox="0 0 1024 1024">
                    <path
                        d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">
                    </path>
                </svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`
        const incominguserOutput = appendFunction(userMessgediv, "bot-message", "thinking")

        // console.log(userOutput)
        chatBody.append(incominguserOutput)
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
        generateBotResponse(incominguserOutput)
    }, 600)
}

messageInput.addEventListener('keydown', (e) => {
    let userInput = e.target.value.trim()
    if (e.key === 'Enter' && userInput && !e.shiftKey && window.innerWidth > 768) {
        createMeassage(e)
    }
})
messageInput.addEventListener('input', () => {
    messageInput.style.height = `${initialInputHeight}px`
    messageInput.style.height = `${messageInput.scrollHeight}px`
    chatForm.style.borderRadius = messageInput.scrollHeight > initialInputHeight ? '15px' : '32px'
})



fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    if (!file) return
    // console.log(file)
    const reader = new FileReader()
    reader.onload = (e) => {
        fileUploadWrapper.querySelector('img').src = e.target.result
        fileUploadWrapper.classList.add('file-uploaded')
        const base64String = e.target.result.split(',')[1]
        // console.log(e.target.result)
        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = ''
    }
    reader.readAsDataURL(file)
})

fileCancelBtn.addEventListener('click', () => {
    userData.file = {}
    fileUploadWrapper.classList.remove('file-uploaded')
})

const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        // console.log(emoji.native)
        messageInput.value += emoji.native
    },
})

emojiBtn.addEventListener('click', (e) => {
    console.log(e.target.id)
    document.body.classList.toggle('show-emoji-picker')
})



document.querySelector('.chat-form').append(picker)
sendBtn.addEventListener('click', (e) => createMeassage(e))

attachFile.addEventListener('click', () => {
    fileInput.click()
})
chatbotTogglerBtn.addEventListener('click', () => {
    document.body.classList.toggle('show-chatbot')
})
downArrowBtn.addEventListener('click', () => {
    document.body.classList.remove('show-chatbot')
})