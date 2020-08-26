import WhatsApp from "./whatsapp"
import store from "./store"
import * as qrcode from 'qrcode-terminal'
// import fetch from 'node-fetch'
import * as cp from 'child_process'

const wa = new WhatsApp();
const childProcess = cp.spawn('python3 interact.py');

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

const senderQueue = [];

childProcess.stdout.on('data', (data) => {
    if (senderQueue.length > 0) {
        wa.sendTextMessage(senderQueue.shift(), `*federico* 🤖: ${data.toString()}`)
    }
});

wa.on('new-user-message', (msg) => {
    handleMessage(msg.key.remotejid, msg.message && msg.message.conversation)
})

wa.on('new-group-message', (msg) => {
    handleMessage(msg.key.remotejid, msg.message && msg.message.conversation)
})

function handleMessage(sender: string, message: string) {
    if (message && message.includes('@federico') && !message.includes('*federico* 🤖:')) {
        senderQueue.push(sender);
        childProcess.stdin.write(message.replace('@federico', ''));
        // fetch('https://api.kanye.rest/')
        //     .then((response) => response.json())
        //     .then((answer) => {
        //         wa.sendTextMessage(sender, `*federico* 🤖: ${answer.quote}`)
        //     })
    }
}
