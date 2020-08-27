import WhatsApp from "./whatsapp"
import store from "./store"
import * as qrcode from 'qrcode-terminal'
import fetch from 'node-fetch'

const wa = new WhatsApp();

wa.connect()
    .then(() => console.log(`Whatsapp: ${store.name} ${store.device}`))
    .catch(err => console.error(err))

wa.on('qrcode', (qrContent) => {
    console.log('::qrcode please log in');
    qrcode.generate(qrContent, { small: true })
});

// wa.on('chats-loaded', () => {
//     console.log('(!) Unread chats: ', store.getUnreadChats().length)
//     store.getUnreadChats().forEach(
//         v => {
//             const lastMessage = v.getLastInMessage().message ? v.getLastInMessage().message.conversation : null
//             // Mark All read
//             if (lastMessage) {
//                 wa.markAllRead(v).then(
//                     () => handleMessage(v.jid, lastMessage)
//                 )
//             }
//         }
//     )
// })


wa.on('new-user-message', (msg) => {
    handleMessage(msg.key.remotejid, msg.message && msg.message.conversation)
})

wa.on('new-group-message', (msg) => {
    handleMessage(msg.key.remotejid, msg.message && msg.message.conversation)
})

function handleMessage(sender: string, message: string) {
    if (message && message.includes('@federico') && !message.includes('*federico* 🤖:')) {
        const text = message.replace('@federico', '');
        if (text.length > 0) {
            fetch(`http://localhost:3000/talk?text=${encodeURIComponent(text)}`)
                .then((response) => response.text())
                .then((answer) => {
                    wa.sendTextMessage(sender, `*federico* 🤖: ${answer}`)
                })
                .catch(err => console.log(err))
        } else {
            fetch('https://api.kanye.rest')
                .then((response) => response.json())
                .then((answer) => {
                    wa.sendTextMessage(sender, `*federico* 🤖: ${answer.quote}`)
                })
                .catch(err => console.log(err))
        }
    }
}
